import type { UserConfig } from "vitest/config";

export const baseVitestConfig: UserConfig = {
	test: {
		environment: "node",
		globals: false,
		restoreMocks: true,
		clearMocks: true,
		coverage: {
			reporter: ["text", "lcov"],
			thresholds: { lines: 80, functions: 80, branches: 70, statements: 80 }
		}
	}
};

export default baseVitestConfig;
