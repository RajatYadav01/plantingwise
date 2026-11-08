import { samplePlants, sampleTasks } from "@plantingwise/constants";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LocalGardenStorage, StoredGarden } from "./storage";
import { readLocalGarden, writeLocalGarden } from "./storage";

const storage = vi.hoisted(() => ({
	getItem: vi.fn(),
	setItem: vi.fn(),
}));

// Mock the local native adapter rather than a third-party package externalized by the native test engine.
vi.mock("./native-storage", () => ({ nativeStorage: storage }));

describe("local garden storage", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		storage.getItem.mockResolvedValue(null);
		storage.setItem.mockResolvedValue(undefined);
	});

	it("returns the sample garden when no saved garden exists", async () => {
		await expect(readLocalGarden(storage as LocalGardenStorage)).resolves.toEqual({
			plants: samplePlants,
			tasks: sampleTasks,
			journalEntries: [],
		});
	});

	it("restores a saved garden and defaults a missing journal list", async () => {
		const saved = { plants: [samplePlants[0]], tasks: [sampleTasks[0]] };
		storage.getItem.mockResolvedValueOnce(JSON.stringify(saved));

		await expect(readLocalGarden(storage as LocalGardenStorage)).resolves.toEqual({
			...saved,
			journalEntries: [],
		});
	});

	it("recovers with sample data when the saved JSON is corrupt", async () => {
		storage.getItem.mockResolvedValueOnce("{not-json");

		await expect(readLocalGarden(storage as LocalGardenStorage)).resolves.toEqual({
			plants: samplePlants,
			tasks: sampleTasks,
			journalEntries: [],
		});
	});

	it("writes a complete garden as JSON", async () => {
		const garden: StoredGarden = { plants: [samplePlants[0]], tasks: [sampleTasks[0]], journalEntries: [] };

		await writeLocalGarden(garden, storage as LocalGardenStorage);

		expect(storage.setItem).toHaveBeenCalledWith("plantingwise:demo-garden:v1", JSON.stringify(garden));
	});
});
