import { defineConfig } from "vitest/config";
import { reactNative } from "vitest-native";

export default defineConfig({
	// Run React Native component logic with the native JS implementation while
	// keeping OS-only modules behind Vitest's native boundary mocks.
	plugins: [reactNative({ engine: "native" })],
	test: {
		include: ["src/**/*.test.ts", "src/**/*.test.tsx"],
		setupFiles: ["./vitest.setup.ts"],
		clearMocks: true,
		restoreMocks: true,
		unstubEnvs: true,
		unstubGlobals: true,
		testTimeout: 10_000,
	},
});
