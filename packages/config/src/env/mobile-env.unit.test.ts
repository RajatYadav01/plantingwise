import { describe, expect, it } from "vitest";
import { mobileEnvSchema, parseMobileEnv } from "./mobile-env.ts";

describe("mobile environment schema", () => {
	it("provides safe development defaults", () => {
		const environment = parseMobileEnv({});

		expect(environment.EXPO_PUBLIC_API_URL).toBe("http://localhost:4000");
		expect(environment.EXPO_PUBLIC_APP_ENV).toBe("development");
	});

	it("accepts an explicit API URL and preview environment", () => {
		const environment = parseMobileEnv({
			EXPO_PUBLIC_API_URL: "https://api.plantingwise.example",
			EXPO_PUBLIC_APP_ENV: "preview",
		});

		expect(environment.EXPO_PUBLIC_API_URL).toBe("https://api.plantingwise.example");
		expect(environment.EXPO_PUBLIC_APP_ENV).toBe("preview");
	});

	it("accepts an HTTPS API URL for production builds", () => {
		const environment = parseMobileEnv({
			EXPO_PUBLIC_API_URL: "https://api.plantingwise.example",
			EXPO_PUBLIC_APP_ENV: "production",
		});

		expect(environment.EXPO_PUBLIC_APP_ENV).toBe("production");
	});

	it("rejects an invalid API URL or unsupported app environment", () => {
		expect(mobileEnvSchema.safeParse({ EXPO_PUBLIC_API_URL: "localhost:4000" }).success).toBe(false);
		expect(mobileEnvSchema.safeParse({ EXPO_PUBLIC_APP_ENV: "staging" }).success).toBe(false);
		expect(
			mobileEnvSchema.safeParse({
				EXPO_PUBLIC_APP_ENV: "production",
				EXPO_PUBLIC_API_URL: "http://api.plantingwise.example",
			}).success,
		).toBe(false);
	});
});
