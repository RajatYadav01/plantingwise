import { z } from "zod";

/**
 * Public Expo configuration contract for apps/mobile.
 * Every EXPO_PUBLIC_ value is embedded in the client bundle and must be non-secret.
 */
export const mobileEnvSchema = z
	.object({
		EXPO_PUBLIC_API_URL: z
			.string()
			.url()
			.refine((value) => value.startsWith("http://") || value.startsWith("https://"), {
				message: "EXPO_PUBLIC_API_URL must use HTTP or HTTPS.",
			})
			.default("http://localhost:4000"),
		EXPO_PUBLIC_APP_ENV: z.enum(["development", "preview", "production"]).default("development"),
	})
	.superRefine((environment, context) => {
		if (environment.EXPO_PUBLIC_APP_ENV === "production" && !environment.EXPO_PUBLIC_API_URL.startsWith("https://")) {
			context.addIssue({
				code: "custom",
				path: ["EXPO_PUBLIC_API_URL"],
				message: "Production mobile builds must use an HTTPS API URL.",
			});
		}
	});

export type MobileEnv = z.infer<typeof mobileEnvSchema>;

export function parseMobileEnv(source: Record<string, string | undefined>): MobileEnv {
	return mobileEnvSchema.parse(source);
}
