import type { AnalysisMode } from "@plantingwise/schemas";
import { api } from "@/lib/api";

/** Plant identification and symptom-review operations. AI calls remain server-side. */
export const analysisService = {
	analyze: (input: { mode: AnalysisMode; imageData: string; context?: string; plantCommonName?: string }) => api.analyze(input),
	getSample: (mode: AnalysisMode) => api.demoAnalysis(mode),
};
