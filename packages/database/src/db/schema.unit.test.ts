import { describe, expect, it } from "vitest";
import { analyses, careTasks, journalEntries, plants, users } from "./schema";

describe("database schema", () => {
	it("declares the five main domain tables", () => {
		expect([users, plants, analyses, careTasks, journalEntries]).toHaveLength(5);
	});
});
