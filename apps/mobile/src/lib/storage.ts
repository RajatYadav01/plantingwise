import { samplePlants, sampleTasks } from "@plantingwise/constants";
import type { CareTask, JournalEntry, Plant } from "@plantingwise/types";
import { nativeStorage } from "./native-storage";

const STORAGE_KEY = "plantingwise:demo-garden:v1";
export type StoredGarden = { plants: Plant[]; tasks: CareTask[]; journalEntries: JournalEntry[] };

/** Minimal storage port keeps persistence logic testable without loading native modules. */
export type LocalGardenStorage = Pick<typeof nativeStorage, "getItem" | "setItem">;

export async function readLocalGarden(storage: LocalGardenStorage = nativeStorage): Promise<StoredGarden> {
	try {
		const raw = await storage.getItem(STORAGE_KEY);
		if (raw) {
			const parsed = JSON.parse(raw) as Partial<StoredGarden>;
			if (Array.isArray(parsed.plants) && Array.isArray(parsed.tasks)) {
				return { plants: parsed.plants, tasks: parsed.tasks, journalEntries: parsed.journalEntries ?? [] };
			}
		}
	} catch {
		// If local demo data is corrupt or unavailable, recover with fresh sample content.
	}
	return { plants: samplePlants, tasks: sampleTasks, journalEntries: [] };
}

export async function writeLocalGarden(garden: StoredGarden, storage: LocalGardenStorage = nativeStorage): Promise<void> {
	await storage.setItem(STORAGE_KEY, JSON.stringify(garden));
}
