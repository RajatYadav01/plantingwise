import "dotenv/config";
import { fileURLToPath } from "node:url";
import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

config({ path: fileURLToPath(new URL("../../apps/api/v1/.env", import.meta.url)) });

export default defineConfig({
	out: "./drizzle",
	schema: "./src/db/schema.ts",
	dialect: "postgresql",
	dbCredentials: { url: process.env.DATABASE_URL ?? "postgres://plantingwise:172115205@localhost:5432/plantingwise" },
});
