import { compare, hash } from "bcryptjs";

/**
 * 10 раундов — осознанный компромисс: на serverless-функции 12 раундов дают
 * ~250 мс на каждый вход и заметно бьют по холодному старту, 10 держатся в ~60 мс
 * и всё ещё делают перебор непрактичным.
 */
const SALT_ROUNDS = 10;

export function hashPassword(plain: string): Promise<string> {
  return hash(plain, SALT_ROUNDS);
}

export function verifyPassword(plain: string, passwordHash: string): Promise<boolean> {
  return compare(plain, passwordHash);
}
