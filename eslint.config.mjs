import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // `eslint .` was walking the build output, so `npm run lint` reported
  // thousands of errors in generated code and buried the handful in ours.
  {
    ignores: [".next/**", "node_modules/**", "next-env.d.ts", "public/**"],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
];

export default eslintConfig;
