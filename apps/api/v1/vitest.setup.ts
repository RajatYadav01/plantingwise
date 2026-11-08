import { afterEach, vi } from "vitest";

// Keep mocks and environment stubs from leaking between test cases.
afterEach(() => {
	vi.restoreAllMocks();
	vi.unstubAllEnvs();
});
