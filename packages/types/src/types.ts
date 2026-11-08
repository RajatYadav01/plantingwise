import type { AnalysisMode, AnalysisResult, CareGuide } from "@plantingwise/schemas";

export type SafeUser = {
	id: string;
	name: string;
	email: string;
	createdAt?: string;
};

export type Plant = {
	id: string;
	displayName: string;
	commonName: string;
	scientificName: string | null;
	imageData?: string | null;
	imageUrl?: string | null;
	confidence: "low" | "medium" | "high";
	summary: string;
	care: CareGuide;
	createdAt: string;
	isDemo?: boolean;
};

export type CareTask = {
	id: string;
	plantId: string;
	type: "water" | "fertilise" | "repot" | "inspect" | "other";
	title: string;
	dueAt: string;
	intervalDays: number | null;
	completedAt: string | null;
	createdAt: string;
	plantName?: string;
	isDemo?: boolean;
};

export type JournalEntry = {
	id: string;
	plantId: string;
	note: string;
	imageData?: string | null;
	entryDate: string;
	createdAt: string;
};

export type AnalysisDraft = {
	mode: AnalysisMode;
	result: AnalysisResult;
	imageData?: string | null;
	imageUrl?: string | null;
	source: "live" | "sample";
	model?: string;
	plantId?: string;
};
