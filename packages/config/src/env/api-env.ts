import { z } from "zod";

const emptyStringToUndefined = z.preprocess(
	(value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
	z.string().optional(),
);

const optionalHttpUrl = z.preprocess(
	(value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
	z
		.string()
		.url()
		.refine((value) => value.startsWith("http://") || value.startsWith("https://"), {
			message: "Expected an HTTP or HTTPS URL.",
		})
		.optional(),
);

const optionalDatabaseUrl = z.preprocess(
	(value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
	z
		.string()
		.url()
		.refine((value) => /^postgres(?:ql)?:\/\//i.test(value), {
			message: "DATABASE_URL must use the postgres:// or postgresql:// protocol.",
		})
		.optional(),
);

/**
 * Server-only environment contract for apps/api/v1.
 * DATABASE_URL and JWT_SECRET are optional in local development so sample mode
 * can start without external services; both are required in production.
 * OpenRouter credentials remain optional so the sample analysis flow is available.
 */
export const apiEnvSchema = z
	.object({
		NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
		PORT: z.coerce.number().int().positive().default(4000),
		DATABASE_URL: optionalDatabaseUrl,
		JWT_SECRET: z.preprocess(
			(value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
			z.string().min(32).optional(),
		),
		CLIENT_ORIGIN: z.string().default("http://localhost:8081"),
		COOKIE_SAME_SITE: z.enum(["lax", "strict", "none"]).default("lax"),
		OPENROUTER_API_KEY: emptyStringToUndefined,
		OPENROUTER_MODEL: emptyStringToUndefined,
		OPENROUTER_SITE_URL: optionalHttpUrl,
		OPENROUTER_APP_NAME: z.string().default("Plantingwise"),
	})
	.superRefine((environment, context) => {
		if (environment.NODE_ENV === "production" && !environment.JWT_SECRET) {
			context.addIssue({
				code: "custom",
				path: ["JWT_SECRET"],
				message: "JWT_SECRET is required in production.",
			});
		}
		if (environment.NODE_ENV === "production" && !environment.DATABASE_URL) {
			context.addIssue({
				code: "custom",
				path: ["DATABASE_URL"],
				message: "DATABASE_URL is required in production.",
			});
		}
	});

export type ApiEnv = z.infer<typeof apiEnvSchema>;

/** Parse the API process environment. Call at startup or when a fresh snapshot is needed. */
export function parseApiEnv(source: Record<string, string | undefined> = process.env): ApiEnv {
	return apiEnvSchema.parse(source);
}
