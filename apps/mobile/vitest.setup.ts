import { cleanup } from "@testing-library/react-native";
import { afterEach, vi } from "vitest";

// Unmount rendered native component trees and reset mocks/stubs after each test.
afterEach(async () => {
	await cleanup();
	vi.restoreAllMocks();
	vi.unstubAllGlobals();
	vi.unstubAllEnvs();
});
