import { analyses, getDb } from "@plantingwise/database";
import { desc, eq } from "drizzle-orm";
import type { Request, Response } from "express";
import { getApiEnv } from "../environment.ts";

export async function listAnalyses(request: Request, response: Response): Promise<void> {
	const db = getDb(getApiEnv().DATABASE_URL);
	const rows = await db.select().from(analyses).where(eq(analyses.ownerId, request.userId!)).orderBy(desc(analyses.createdAt)).limit(50);
	response.json({ analyses: rows });
}
