import type { Config } from "prettier";

export const prettierConfig: Config = {
	semi: true,
	singleQuote: false,
	trailingComma: "all",
	printWidth: 100,
	tabWidth: 2,
	useTabs: true,
	arrowParens: "always",
	bracketSpacing: true,
	endOfLine: "lf",
	overrides: [
		{ files: ["*.md", "*.yml", "*.yaml", "*.json"], options: { useTabs: false } }
	]
};

export default prettierConfig;
