import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginPrettier from 'eslint-plugin-prettier';

export default [
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    plugins: {
      'prettier': pluginPrettier
    }
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off'
    }
  },
  {
    ignores: [".node_modules/*", "docs/*", "lib/*", "__tests__/*"]
  }
];
