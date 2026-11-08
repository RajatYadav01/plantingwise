import { parseMobileEnv } from "@plantingwise/config/mobile-env";

// Keep direct property access: Expo statically inlines EXPO_PUBLIC_ variables.
// These values are public and must never contain API keys or other secrets.
export const mobileEnv = parseMobileEnv({
	EXPO_PUBLIC_API_URL: process.env.EXPO_PUBLIC_API_URL,
	EXPO_PUBLIC_APP_ENV: process.env.EXPO_PUBLIC_APP_ENV,
});
