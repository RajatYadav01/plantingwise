import { careTasks, getDb, plants } from "@plantingwise/database";
import { savePlantSchema } from "@plantingwise/schemas";
import { and, desc, eq } from "drizzle-orm";
import type { Request, Response } from "express";
import { getApiEnv } from "../environment";
import { sendZodError } from "../middleware/validation.middleware";

export async function listPlants(request: Request, response: Response): Promise<void> {
	const db = getDb(getApiEnv().DATABASE_URL);
	const rows = await db.select().from(plants).where(eq(plants.ownerId, request.userId!)).orderBy(desc(plants.createdAt));
	response.json({ plants: rows });
}

export async function createPlant(request: Request, response: Response): Promise<void> {
	const parsed = savePlantSchema.safeParse(request.body);
	if (!parsed.success) {
		sendZodError(response, parsed.error.issues);
		return;
	}

	const db = getDb(getApiEnv().DATABASE_URL);
	const input = parsed.data;
	const [plant] = await db
		.insert(plants)
		.values({
			ownerId: request.userId!,
			displayName: input.displayName,
			commonName: input.commonName,
			scientificName: input.scientificName ?? null,
			imageData: input.imageData ?? null,
			imageUrl: input.imageUrl ?? null,
			confidence: input.confidence,
			summary: input.summary,
			care: input.care,
		})
		.returning();

	let task: typeof careTasks.$inferSelect | null = null;
	if (input.wateringIntervalDays) {
		const createdTasks = await db
			.insert(careTasks)
			.values({
				ownerId: request.userId!,
				plantId: plant.id,
				type: "water",
				title: "Check soil moisture",
				dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
				intervalDays: input.wateringIntervalDays,
			})
			.returning();
		task = createdTasks[0] ?? null;
	}

	response.status(201).json({ plant, task });
}

export async function deletePlant(request: Request, response: Response): Promise<void> {
	const db = getDb(getApiEnv().DATABASE_URL);
	const deleted = await db
		.delete(plants)
		.where(and(eq(plants.id, request.params.id), eq(plants.ownerId, request.userId!)))
		.returning({ id: plants.id });
	if (!deleted.length) {
		response.status(404).json({ error: "Plant not found.", code: "NOT_FOUND" });
		return;
	}
	response.status(204).end();
}
