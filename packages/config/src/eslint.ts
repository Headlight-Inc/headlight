import type { Linter } from "eslint";

export const base: Linter.Config[] = [
	{ ignores: ["**/dist/**", "**/.turbo/**", "**/node_modules/**", "**/build/**", "**/coverage/**"] },
	{
		files: ["**/*.{ts,tsx,js,jsx,mjs,cjs}"],
		languageOptions: { ecmaVersion: "latest", sourceType: "module" },
		linterOptions: { reportUnusedDisableDirectives: "error" },
		rules: {
			"no-console": ["warn", { allow: ["warn", "error"] }],
			"no-debugger": "error",
			eqeqeq: ["error", "smart"],
			"prefer-const": "error",
			"no-var": "error"
		}
	}
];

export default base;
