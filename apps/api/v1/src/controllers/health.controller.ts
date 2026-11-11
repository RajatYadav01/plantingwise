import type { Request, Response } from "express";
import { getApiEnv } from "../environment.ts";

export function getHealth(_request: Request, response: Response): void {
	const environment = getApiEnv();
	response.json({
		status: "ok",
		service: "plantingwise-api",
		databaseConfigured: Boolean(environment.DATABASE_URL),
		aiConfigured: Boolean(environment.OPENROUTER_API_KEY && environment.OPENROUTER_MODEL),
	});
}
