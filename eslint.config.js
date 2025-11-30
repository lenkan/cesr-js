import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default tseslint.config(
  { ignores: ["node_modules", "dist", "examples", "docs"] },
  {
    files: ["**/*.{js,mjs,cjs,ts}"],
    extends: [
      // Base recommended rulesets
      pluginJs.configs.recommended,
      tseslint.configs.strict,
      tseslint.configs.stylistic,
    ],
    languageOptions: { globals: globals["shared-node-browser"] },
  },
  { rules: prettier.rules },
  {
    rules: {
      // Rules for --experimental-strip-types to work
      "@typescript-eslint/consistent-type-imports": ["error", { fixStyle: "inline-type-imports" }],
      "@typescript-eslint/parameter-properties": "error",
      "no-console": ["error"],
      // no-undef is is disabled to tseslint.strict
      "no-undef": ["error"],
    },
  },
);
