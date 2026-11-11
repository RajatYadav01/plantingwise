import { careTasks, getDb } from "@plantingwise/database";
import { completeTaskSchema } from "@plantingwise/schemas";
import { and, asc, eq } from "drizzle-orm";
import type { Request, Response } from "express";
import { getApiEnv } from "../environment.ts";
import { sendZodError } from "../middleware/validation.middleware.ts";
import type { IdRouteParams } from "../types/route-params.ts";

export async function listTasks(request: Request, response: Response): Promise<void> {
	const db = getDb(getApiEnv().DATABASE_URL);
	const rows = await db.select().from(careTasks).where(eq(careTasks.ownerId, request.userId!)).orderBy(asc(careTasks.dueAt));
	response.json({ tasks: rows });
}

export async function completeTask(request: Request<IdRouteParams>, response: Response): Promise<void> {
	const parsed = completeTaskSchema.safeParse(request.body);
	if (!parsed.success) {
		sendZodError(response, parsed.error.issues);
		return;
	}

	const db = getDb(getApiEnv().DATABASE_URL);
	const [task] = await db
		.select()
		.from(careTasks)
		.where(and(eq(careTasks.id, request.params.id), eq(careTasks.ownerId, request.userId!)))
		.limit(1);
	if (!task) {
		response.status(404).json({ error: "Care task not found.", code: "NOT_FOUND" });
		return;
	}
	if (task.completedAt) {
		response.json({ task, nextTask: null });
		return;
	}

	const completedAt = new Date();
	const [completed] = await db
		.update(careTasks)
		.set({ completedAt })
		.where(and(eq(careTasks.id, task.id), eq(careTasks.ownerId, request.userId!)))
		.returning();

	let nextTask: typeof careTasks.$inferSelect | null = null;
	if (task.intervalDays && task.intervalDays > 0) {
		const createdTasks = await db
			.insert(careTasks)
			.values({
				ownerId: request.userId!,
				plantId: task.plantId,
				type: task.type,
				title: task.title,
				dueAt: new Date(completedAt.getTime() + task.intervalDays * 24 * 60 * 60 * 1000),
				intervalDays: task.intervalDays,
			})
			.returning();
		nextTask = createdTasks[0] ?? null;
	}
	response.json({ task: completed, nextTask });
}
