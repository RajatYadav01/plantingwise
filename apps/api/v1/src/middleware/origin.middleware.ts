import cors from "cors";
import type { RequestHandler } from "express";
import { getApiEnv } from "../environment.ts";

const environment = getApiEnv();
const defaultOrigins =
	environment.NODE_ENV === "production" ? [] : ["http://localhost:8081", "http://localhost:19006", "http://localhost:19000"];
const configuredOrigins = environment.CLIENT_ORIGIN.split(",")
	.map((value) => value.trim())
	.filter(Boolean);
export const allowedOrigins = new Set([...defaultOrigins, ...configuredOrigins]);

/** Rejects disallowed browser origins before CORS headers are applied. */
export const originGuard: RequestHandler = (request, response, next) => {
	const origin = request.get("origin");
	if (origin && !allowedOrigins.has(origin)) {
		response.status(403).json({ error: "This origin is not allowed.", code: "ORIGIN_NOT_ALLOWED" });
		return;
	}
	next();
};

/** Enables credentialed requests only for explicitly configured client origins. */
export const corsMiddleware = cors({
	origin(origin, callback) {
		if (!origin || allowedOrigins.has(origin)) return callback(null, true);
		return callback(new Error("This origin is not allowed by the API CORS policy."));
	},
	credentials: true,
});
