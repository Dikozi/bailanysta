import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Отбрасывание поля через деструктуризацию (`const { passwordHash: _x, ...safe }`)
      // — обычный приём, чтобы не вынести наружу лишнее. Префикс _ помечает намерение.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrorsIgnorePattern: "^_" },
      ],
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Сгенерированный Prisma клиент линтовать бессмысленно.
    "src/generated/**",
  ]),
]);

export default eslintConfig;
