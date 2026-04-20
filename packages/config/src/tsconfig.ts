export const base = {
	$schema: "https://json.schemastore.org/tsconfig",
	display: "Base",
	compilerOptions: {
		target: "ES2022",
		lib: ["ES2022", "DOM", "DOM.Iterable"],
		module: "ESNext",
		moduleResolution: "Bundler",
		strict: true,
		noUncheckedIndexedAccess: true,
		noImplicitOverride: true,
		exactOptionalPropertyTypes: true,
		isolatedModules: true,
		skipLibCheck: true,
		esModuleInterop: true,
		resolveJsonModule: true,
		forceConsistentCasingInFileNames: true,
		verbatimModuleSyntax: true,
		declaration: true,
		declarationMap: true,
		sourceMap: true,
		incremental: true
	}
} as const;

export const react = {
	...base,
	display: "React",
	compilerOptions: {
		...base.compilerOptions,
		jsx: "react-jsx",
		lib: ["ES2022", "DOM", "DOM.Iterable", "DOM.AsyncIterable"]
	}
} as const;

export const node = {
	...base,
	display: "Node",
	compilerOptions: { ...base.compilerOptions, types: ["node"] }
} as const;

export const worker = {
	...base,
	display: "Cloudflare Worker",
	compilerOptions: { ...base.compilerOptions, types: ["@cloudflare/workers-types"] }
} as const;
