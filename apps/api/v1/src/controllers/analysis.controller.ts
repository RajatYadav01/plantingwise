import { sampleHealthResult, sampleIdentification } from "@plantingwise/constants";
import { analyses, getDb } from "@plantingwise/database";
import { analysisRequestSchema } from "@plantingwise/schemas";
import type { Request, Response } from "express";
import { getApiEnv } from "../environment";
import { sendZodError } from "../middleware/validation.middleware";
import { runAiAnalysis } from "../services/analysis.service";

export async function identify(request: Request, response: Response): Promise<void> {
	const parsed = analysisRequestSchema.safeParse(request.body);
	if (!parsed.success) {
		sendZodError(response, parsed.error.issues);
		return;
	}

	const result = await runAiAnalysis(parsed.data);
	if (request.userId) {
		try {
			const db = getDb(getApiEnv().DATABASE_URL);
			await db.insert(analyses).values({
				ownerId: request.userId,
				mode: parsed.data.mode,
				result: result.result as unknown as Record<string, unknown>,
				model: result.model,
			});
		} catch {
			// An optional history write must not turn a successful analysis into a failed one.
			console.warn("Plantingwise could not save the analysis history record.");
		}
	}

	response.json({ ...result, source: "live" });
}

export function demo(request: Request, response: Response): void {
	const mode = request.body?.mode;
	if (mode !== "identify" && mode !== "health") {
		response.status(400).json({ error: "Choose identify or health mode.", code: "INVALID_MODE" });
		return;
	}
	const result = mode === "health" ? sampleHealthResult : sampleIdentification;
	response.json({ result, source: "sample", model: null });
}
