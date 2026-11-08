import { describe, expect, it } from "vitest";
import { analysisRequestSchema, analysisResultSchema } from "./schemas.ts";

const validIdentification = {
	mode: "identify",
	commonName: "Monstera deliciosa",
	scientificName: "Monstera deliciosa",
	confidence: "medium",
	summary: "The leaf shape is consistent with a Monstera deliciosa.",
	observations: ["Broad green leaf with natural splits."],
	care: {
		light: "Bright, indirect light.",
		watering: "Water after the top layer of soil dries.",
		humidity: "Average indoor humidity is acceptable.",
		soil: "Use a chunky, well-draining mix.",
	},
	caveats: ["A clearer whole-plant photo may improve identification."],
} as const;

const validHealthReview = {
	mode: "health",
	commonName: "Monstera deliciosa",
	confidence: "low",
	summary: "Yellowing has several possible causes.",
	observations: ["One lower leaf appears yellow."],
	possibleCauses: [
		{
			label: "Soil remaining wet",
			reasoning: "Persistently wet soil can stress roots.",
			safeNextStep: "Check soil moisture and drainage before watering again.",
		},
	],
	caveats: ["This is not a definitive diagnosis."],
} as const;

describe("analysis contracts", () => {
	it("accepts a structurally valid identification response", () => {
		expect(analysisResultSchema.safeParse(validIdentification).success).toBe(true);
	});

	it("accepts a cautious health response with possible causes", () => {
		expect(analysisResultSchema.safeParse(validHealthReview).success).toBe(true);
	});

	it("rejects invalid image types before a provider call", () => {
		const result = analysisRequestSchema.safeParse({ mode: "identify", imageData: "data:application/pdf;base64,AAAA" });
		expect(result.success).toBe(false);
	});

	it("rejects an oversized image payload", () => {
		const result = analysisRequestSchema.safeParse({ mode: "identify", imageData: `data:image/jpeg;base64,${"a".repeat(4_500_000)}` });
		expect(result.success).toBe(false);
	});
});
