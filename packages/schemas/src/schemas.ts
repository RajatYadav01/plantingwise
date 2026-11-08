import { z } from "zod";

export const careGuideSchema = z.object({
	light: z.string().min(1).max(500),
	watering: z.string().min(1).max(500),
	humidity: z.string().max(500).nullable(),
	soil: z.string().max(500).nullable(),
});

const commonAnalysisFields = {
	confidence: z.enum(["low", "medium", "high"]),
	summary: z.string().min(1).max(1200),
	observations: z.array(z.string().min(1).max(300)).max(8),
	caveats: z.array(z.string().min(1).max(400)).max(8),
};

export const identifyResultSchema = z.object({
	mode: z.literal("identify"),
	commonName: z.string().min(1).max(120),
	scientificName: z.string().max(160).nullable(),
	...commonAnalysisFields,
	care: careGuideSchema,
});

export const possibleCauseSchema = z.object({
	label: z.string().min(1).max(120),
	reasoning: z.string().min(1).max(500),
	safeNextStep: z.string().min(1).max(500),
});

export const healthResultSchema = z.object({
	mode: z.literal("health"),
	commonName: z.string().max(120).nullable(),
	...commonAnalysisFields,
	possibleCauses: z.array(possibleCauseSchema).min(1).max(5),
});

export const analysisResultSchema = z.discriminatedUnion("mode", [identifyResultSchema, healthResultSchema]);

export const analysisRequestSchema = z.object({
	mode: z.enum(["identify", "health"]),
	imageData: z
		.string()
		.max(4_500_000, "Image is too large. Please choose a smaller image.")
		.regex(/^data:image\/(jpeg|jpg|png|webp);base64,/, "Please upload a JPG, PNG or WebP image."),
	context: z.string().max(1000).optional().default(""),
	plantCommonName: z.string().max(120).optional(),
});

export const registerSchema = z.object({
	name: z.string().trim().min(2).max(80),
	email: z
		.string()
		.trim()
		.email()
		.max(254)
		.transform((value) => value.toLowerCase()),
	password: z.string().min(10).max(128),
});

export const loginSchema = z.object({
	email: z
		.string()
		.trim()
		.email()
		.max(254)
		.transform((value) => value.toLowerCase()),
	password: z.string().min(1).max(128),
});

export const savePlantSchema = z.object({
	displayName: z.string().trim().min(1).max(80),
	commonName: z.string().min(1).max(120),
	scientificName: z.string().max(160).nullable().optional(),
	imageData: z.string().max(500_000).nullable().optional(),
	imageUrl: z.string().url().max(1000).nullable().optional(),
	confidence: z.enum(["low", "medium", "high"]),
	summary: z.string().min(1).max(1200),
	care: careGuideSchema,
	wateringIntervalDays: z.number().int().min(1).max(90).nullable().optional(),
});

export const completeTaskSchema = z.object({ completed: z.literal(true) });
export const journalEntrySchema = z.object({
	note: z.string().trim().min(1).max(2000),
	imageData: z.string().max(500_000).nullable().optional(),
	entryDate: z.string().datetime().optional(),
});

export type CareGuide = z.infer<typeof careGuideSchema>;
export type IdentifyResult = z.infer<typeof identifyResultSchema>;
export type HealthResult = z.infer<typeof healthResultSchema>;
export type AnalysisResult = z.infer<typeof analysisResultSchema>;
export type AnalysisMode = AnalysisResult["mode"];
export type AnalysisRequest = z.infer<typeof analysisRequestSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type SavePlantInput = z.infer<typeof savePlantSchema>;
