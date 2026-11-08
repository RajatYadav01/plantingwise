import { getDb, journalEntries, plants } from "@plantingwise/database";
import { journalEntrySchema } from "@plantingwise/schemas";
import { and, desc, eq } from "drizzle-orm";
import type { Request, Response } from "express";
import { getApiEnv } from "../environment";
import { sendZodError } from "../middleware/validation.middleware";

export async function listJournalEntries(request: Request, response: Response): Promise<void> {
	const db = getDb(getApiEnv().DATABASE_URL);
	const [plant] = await db
		.select({ id: plants.id })
		.from(plants)
		.where(and(eq(plants.id, request.params.id), eq(plants.ownerId, request.userId!)))
		.limit(1);
	if (!plant) {
		response.status(404).json({ error: "Plant not found.", code: "NOT_FOUND" });
		return;
	}

	const entries = await db
		.select()
		.from(journalEntries)
		.where(and(eq(journalEntries.plantId, plant.id), eq(journalEntries.ownerId, request.userId!)))
		.orderBy(desc(journalEntries.entryDate));
	response.json({ entries });
}

export async function createJournalEntry(request: Request, response: Response): Promise<void> {
	const parsed = journalEntrySchema.safeParse(request.body);
	if (!parsed.success) {
		sendZodError(response, parsed.error.issues);
		return;
	}

	const db = getDb(getApiEnv().DATABASE_URL);
	const [plant] = await db
		.select({ id: plants.id })
		.from(plants)
		.where(and(eq(plants.id, request.params.id), eq(plants.ownerId, request.userId!)))
		.limit(1);
	if (!plant) {
		response.status(404).json({ error: "Plant not found.", code: "NOT_FOUND" });
		return;
	}

	const [entry] = await db
		.insert(journalEntries)
		.values({
			ownerId: request.userId!,
			plantId: plant.id,
			note: parsed.data.note,
			imageData: parsed.data.imageData ?? null,
			entryDate: parsed.data.entryDate ? new Date(parsed.data.entryDate) : new Date(),
		})
		.returning();
	response.status(201).json({ entry });
}
