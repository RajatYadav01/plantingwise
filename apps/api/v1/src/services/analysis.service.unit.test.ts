import { sampleHealthResult, sampleIdentification } from "@plantingwise/constants";
import { describe, expect, it } from "vitest";
import { getSampleAnalysis, parseModelJson } from "./analysis.service.ts";

describe("AI analysis helpers", () => {
	it("returns the correct sample result for each mode", () => {
		expect(getSampleAnalysis("identify")).toEqual(sampleIdentification);
		expect(getSampleAnalysis("health")).toEqual(sampleHealthResult);
	});

	it("parses JSON inside a markdown fence", () => {
		expect(parseModelJson('```json\n{"ok":true}\n```')).toEqual({ ok: true });
	});

	it("extracts a JSON object surrounded by model commentary", () => {
		expect(parseModelJson('Result: {"ok":true} Thanks')).toEqual({ ok: true });
	});

	it("rejects an empty provider response", () => {
		expect(() => parseModelJson(" ")).toThrow("empty response");
	});
});
