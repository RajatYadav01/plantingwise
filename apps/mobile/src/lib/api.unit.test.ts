import { beforeEach, describe, expect, it, vi } from "vitest";
import { api, getApiBaseUrl } from "./api";

vi.mock("./env", () => ({
	mobileEnv: {
		EXPO_PUBLIC_API_URL: "https://plantingwise-api.example.test/",
		EXPO_PUBLIC_APP_ENV: "test",
	},
}));

describe("mobile API client", () => {
	const fetchMock = vi.fn<typeof fetch>();

	beforeEach(() => {
		vi.clearAllMocks();
		vi.stubGlobal("fetch", fetchMock);
	});

	it("normalises the API base URL", () => {
		expect(getApiBaseUrl()).toBe("https://plantingwise-api.example.test");
	});

	it("includes credentials for the HttpOnly-cookie session and parses a response", async () => {
		const user = { id: "user-1", name: "Ari", email: "ari@example.test" };
		fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ user }), { status: 200 }));

		await expect(api.me()).resolves.toEqual({ user });
		expect(fetchMock).toHaveBeenCalledWith(
			"https://plantingwise-api.example.test/api/v1/auth/me",
			expect.objectContaining({ credentials: "include" }),
		);
	});

	it("serialises login credentials as JSON", async () => {
		fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ user: { id: "u1" } }), { status: 200 }));

		await api.login("ari@example.test", "correct-horse-battery-staple");

		expect(fetchMock).toHaveBeenCalledWith(
			"https://plantingwise-api.example.test/api/v1/auth/login",
			expect.objectContaining({
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: "ari@example.test", password: "correct-horse-battery-staple" }),
			}),
		);
	});

	it("returns undefined for a successful 204 response", async () => {
		fetchMock.mockResolvedValueOnce(new Response(null, { status: 204 }));

		await expect(api.logout()).resolves.toBeUndefined();
	});

	it("converts API error responses into ApiError instances", async () => {
		fetchMock.mockResolvedValueOnce(
			new Response(JSON.stringify({ error: "Session expired", code: "UNAUTHENTICATED" }), { status: 401 }),
		);

		await expect(api.me()).rejects.toMatchObject({
			name: "ApiError",
			message: "Session expired",
			status: 401,
			code: "UNAUTHENTICATED",
		});
	});

	it("converts network failures into a stable network error", async () => {
		fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));

		await expect(api.me()).rejects.toMatchObject({
			name: "ApiError",
			status: 0,
			code: "NETWORK_ERROR",
		});
	});
});
