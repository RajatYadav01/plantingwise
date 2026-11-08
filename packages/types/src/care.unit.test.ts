import { describe, expect, it } from "vitest";
import { calculateNextDueDate, formatRelativeDueDate, getTaskStatus } from "./care.ts";

const day = 24 * 60 * 60 * 1000;

describe("care task utilities", () => {
	it("marks completed tasks before checking their due date", () => {
		expect(getTaskStatus({ completedAt: new Date().toISOString(), dueAt: new Date(0).toISOString() })).toBe("completed");
	});

	it("marks past-due tasks as due", () => {
		expect(getTaskStatus({ completedAt: null, dueAt: new Date(Date.now() - day).toISOString() })).toBe("due");
	});

	it("calculates the next scheduled date", () => {
		expect(calculateNextDueDate("2026-01-01T00:00:00.000Z", 7)).toBe("2026-01-08T00:00:00.000Z");
		expect(calculateNextDueDate("2026-01-01T00:00:00.000Z", null)).toBeNull();
	});

	it("formats a due date for a user", () => {
		const now = Date.parse("2026-01-01T00:00:00.000Z");
		expect(formatRelativeDueDate(new Date(now + day).toISOString(), now)).toBe("Due tomorrow");
	});
});
