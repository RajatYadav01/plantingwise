import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { relations } from "./db/relations.ts";

export function getDb(connectionString: string | undefined) {
	if (!connectionString && process.env.NODE_ENV !== "test") {
		throw new Error("DATABASE_URL is required. Copy .env.example to .env and configure PostgreSQL.");
	}

	const globalForDb = globalThis as unknown as {
		repoNameSql?: ReturnType<typeof postgres>;
	};

	const client =
		globalForDb.repoNameSql ??
		(connectionString
			? postgres(connectionString, {
					max: 10,
					idle_timeout: 20,
					connect_timeout: 10,
				})
			: null);

	if (process.env.NODE_ENV !== "production" && client) {
		globalForDb.repoNameSql = client;
	}

	const db = client ? drizzle({ client, relations }) : (null as never);
	return db;
}
