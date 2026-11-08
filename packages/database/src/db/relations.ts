import { defineRelations } from "drizzle-orm";
import * as schema from "./schema.ts";

/**
 * All Drizzle Relational Queries v2 relationships live in one place.
 * Foreign-key constraints remain declared in schema.ts; these definitions
 * provide the application-level relational query metadata.
 */
export const relations = defineRelations(schema, (r) => ({
	users: {
		plants: r.many.plants({ from: r.users.id, to: r.plants.ownerId }),
		analyses: r.many.analyses({ from: r.users.id, to: r.analyses.ownerId }),
		careTasks: r.many.careTasks({ from: r.users.id, to: r.careTasks.ownerId }),
		journalEntries: r.many.journalEntries({ from: r.users.id, to: r.journalEntries.ownerId }),
	},
	plants: {
		owner: r.one.users({ from: r.plants.ownerId, to: r.users.id, optional: false }),
		analyses: r.many.analyses({ from: r.plants.id, to: r.analyses.plantId }),
		careTasks: r.many.careTasks({ from: r.plants.id, to: r.careTasks.plantId }),
		journalEntries: r.many.journalEntries({ from: r.plants.id, to: r.journalEntries.plantId }),
	},
	analyses: {
		owner: r.one.users({ from: r.analyses.ownerId, to: r.users.id, optional: false }),
		plant: r.one.plants({ from: r.analyses.plantId, to: r.plants.id }),
	},
	careTasks: {
		owner: r.one.users({ from: r.careTasks.ownerId, to: r.users.id, optional: false }),
		plant: r.one.plants({ from: r.careTasks.plantId, to: r.plants.id, optional: false }),
	},
	journalEntries: {
		owner: r.one.users({ from: r.journalEntries.ownerId, to: r.users.id, optional: false }),
		plant: r.one.plants({ from: r.journalEntries.plantId, to: r.plants.id, optional: false }),
	},
}));
