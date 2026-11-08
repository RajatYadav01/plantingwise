import { describe, expect, it } from "vitest";
import { apiEnvSchema, parseApiEnv } from "./api-env.ts";

describe("API environment schema", () => {
	it("provides development defaults for optional demo services", () => {
		const environment = parseApiEnv({});

		expect(environment.NODE_ENV).toBe("development");
		expect(environment.PORT).toBe(4000);
		expect(environment.CLIENT_ORIGIN).toBe("http://localhost:8081");
		expect(environment.COOKIE_SAME_SITE).toBe("lax");
		expect(environment.DATABASE_URL).toBeUndefined();
		expect(environment.OPENROUTER_API_KEY).toBeUndefined();
	});

	it("coerces a valid port and accepts valid service URLs", () => {
		const environment = parseApiEnv({
			PORT: "4500",
			DATABASE_URL: "postgresql://user:password@host.example/db?sslmode=require",
			OPENROUTER_SITE_URL: "https://plantingwise.example",
		});

		expect(environment.PORT).toBe(4500);
		expect(environment.DATABASE_URL).toContain("postgresql://");
	});

	it("requires a sufficiently long JWT secret in production", () => {
		expect(apiEnvSchema.safeParse({ NODE_ENV: "production" }).success).toBe(false);
		expect(
			apiEnvSchema.safeParse({
				NODE_ENV: "production",
				JWT_SECRET: "a-secure-secret-with-more-than-32-characters",
				DATABASE_URL: "postgresql://user:password@host.example/db?sslmode=require",
			}).success,
		).toBe(true);
		expect(
			apiEnvSchema.safeParse({
				NODE_ENV: "production",
				JWT_SECRET: "a-secure-secret-with-more-than-32-characters",
			}).success,
		).toBe(false);
	});

	it("rejects malformed URLs, invalid ports and short JWT secrets", () => {
		expect(apiEnvSchema.safeParse({ DATABASE_URL: "not-a-url" }).success).toBe(false);
		expect(apiEnvSchema.safeParse({ DATABASE_URL: "https://example.com/database" }).success).toBe(false);
		expect(apiEnvSchema.safeParse({ PORT: "0" }).success).toBe(false);
		expect(apiEnvSchema.safeParse({ JWT_SECRET: "too-short" }).success).toBe(false);
	});

	it("treats blank optional credentials as unset", () => {
		const environment = parseApiEnv({ OPENROUTER_API_KEY: "", OPENROUTER_MODEL: "" });

		expect(environment.OPENROUTER_API_KEY).toBeUndefined();
		expect(environment.OPENROUTER_MODEL).toBeUndefined();
	});
});
