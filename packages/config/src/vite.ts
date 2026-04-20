import type { UserConfig } from "vite";

export const baseViteConfig: UserConfig = {
	clearScreen: false,
	build: { target: "esnext", sourcemap: true, minify: "esbuild" },
};

export default baseViteConfig;
