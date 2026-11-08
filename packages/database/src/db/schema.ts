import type { CareGuide } from "@plantingwise/schemas";
import { index, integer, jsonb, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from "drizzle-orm/pg-core";

export const users = pgTable(
	"users",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		name: varchar("name", { length: 80 }).notNull(),
		email: varchar("email", { length: 254 }).notNull(),
		passwordHash: text("password_hash").notNull(),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [uniqueIndex("users_email_unique").on(table.email)],
);

export const plants = pgTable(
	"plants",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		ownerId: uuid("owner_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		displayName: varchar("display_name", { length: 80 }).notNull(),
		commonName: varchar("common_name", { length: 120 }).notNull(),
		scientificName: varchar("scientific_name", { length: 160 }),
		imageData: text("image_data"),
		imageUrl: text("image_url"),
		confidence: varchar("confidence", { length: 12 }).notNull(),
		summary: text("summary").notNull(),
		care: jsonb("care").$type<CareGuide>().notNull(),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [index("plants_owner_created_idx").on(table.ownerId, table.createdAt)],
);

export const analyses = pgTable(
	"analyses",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		ownerId: uuid("owner_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		plantId: uuid("plant_id").references(() => plants.id, { onDelete: "set null" }),
		mode: varchar("mode", { length: 20 }).notNull(),
		result: jsonb("result").$type<Record<string, unknown>>().notNull(),
		model: varchar("model", { length: 180 }),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [index("analyses_owner_created_idx").on(table.ownerId, table.createdAt)],
);

export const careTasks = pgTable(
	"care_tasks",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		ownerId: uuid("owner_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		plantId: uuid("plant_id")
			.notNull()
			.references(() => plants.id, { onDelete: "cascade" }),
		type: varchar("type", { length: 24 }).notNull(),
		title: varchar("title", { length: 160 }).notNull(),
		dueAt: timestamp("due_at", { withTimezone: true }).notNull(),
		intervalDays: integer("interval_days"),
		completedAt: timestamp("completed_at", { withTimezone: true }),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [index("care_tasks_owner_due_idx").on(table.ownerId, table.dueAt)],
);

export const journalEntries = pgTable(
	"journal_entries",
	{
		id: uuid("id").defaultRandom().primaryKey(),
		ownerId: uuid("owner_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		plantId: uuid("plant_id")
			.notNull()
			.references(() => plants.id, { onDelete: "cascade" }),
		note: text("note").notNull(),
		imageData: text("image_data"),
		entryDate: timestamp("entry_date", { withTimezone: true }).defaultNow().notNull(),
		createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [index("journal_entries_plant_date_idx").on(table.plantId, table.entryDate)],
);
