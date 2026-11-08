import type { CareTask } from "./types.ts";

export function getTaskStatus(task: Pick<CareTask, "completedAt" | "dueAt">, now = Date.now()) {
	if (task.completedAt) return "completed" as const;
	if (new Date(task.dueAt).getTime() < now) return "due" as const;
	return "upcoming" as const;
}

export function calculateNextDueDate(completedAt: string | Date, intervalDays: number | null): string | null {
	if (!intervalDays || intervalDays < 1) return null;
	const date = completedAt instanceof Date ? completedAt : new Date(completedAt);
	if (Number.isNaN(date.getTime())) return null;
	return new Date(date.getTime() + intervalDays * 24 * 60 * 60 * 1000).toISOString();
}

export function formatRelativeDueDate(dueAt: string, now = Date.now()): string {
	const diff = new Date(dueAt).getTime() - now;
	if (!Number.isFinite(diff)) return "Date unavailable";
	const days = Math.ceil(Math.abs(diff) / (24 * 60 * 60 * 1000));
	if (Math.abs(diff) < 60 * 60 * 1000) return diff < 0 ? "Due now" : "Due soon";
	if (diff < 0) return days <= 1 ? "Overdue" : `${days} days overdue`;
	if (days <= 1) return "Due today";
	if (days === 2) return "Due tomorrow";
	return `In ${days} days`;
}
