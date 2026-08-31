import { SignJWT, jwtVerify } from "jose";

/**
 * jose, а не jsonwebtoken: middleware Next выполняется в Edge-рантайме,
 * где нет Node-криптографии, а jose работает на WebCrypto и там, и в Node.
 */

export type SessionPayload = {
  userId: string;
  username: string;
};

const ALGORITHM = "HS256";
const TOKEN_TTL = "30d";
export const SESSION_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET не задан или короче 32 символов — см. .env.example");
  }
  return new TextEncoder().encode(secret);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ username: payload.username })
    .setProtectedHeader({ alg: ALGORITHM })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime(TOKEN_TTL)
    .sign(getSecret());
}

/** Возвращает null на любом невалидном/просроченном токене — вызывающий решает, что делать. */
export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret(), { algorithms: [ALGORITHM] });
    if (typeof payload.sub !== "string" || typeof payload.username !== "string") return null;
    return { userId: payload.sub, username: payload.username };
  } catch {
    return null;
  }
}
