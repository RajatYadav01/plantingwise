import type { AnalysisDraft, AnalysisMode, CareTask, JournalEntry, Plant, SafeUser, SavePlantInput } from "@plantingwise/types";
import { mobileEnv } from "./env";

const API_BASE_URL = mobileEnv.EXPO_PUBLIC_API_URL.replace(/\/$/, "");

export class ApiError extends Error {
	code: string;
	status: number;

	constructor(message: string, status = 500, code = "API_ERROR") {
		super(message);
		this.name = "ApiError";
		this.status = status;
		this.code = code;
	}
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
	let response: Response;
	try {
		response = await fetch(`${API_BASE_URL}${path}`, {
			...init,
			credentials: "include",
			headers: {
				...(init.body ? { "Content-Type": "application/json" } : {}),
				...(init.headers ?? {}),
			},
		});
	} catch {
		throw new ApiError("Couldn't reach the Plantingwise API. Check that the server is running.", 0, "NETWORK_ERROR");
	}

	if (response.status === 204) return undefined as T;
	const payload = (await response.json().catch(() => ({}))) as {
		error?: string;
		code?: string;
	} & T;
	if (!response.ok) {
		throw new ApiError(payload.error ?? "The request could not be completed.", response.status, payload.code);
	}
	return payload;
}

export const api = {
	me: () => request<{ user: SafeUser }>("/api/v1/auth/me"),
	login: (email: string, password: string) =>
		request<{ user: SafeUser }>("/api/v1/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
	register: (name: string, email: string, password: string) =>
		request<{ user: SafeUser }>("/api/v1/auth/register", { method: "POST", body: JSON.stringify({ name, email, password }) }),
	logout: () => request<void>("/api/v1/auth/logout", { method: "POST" }),
	getPlants: () => request<{ plants: Plant[] }>("/api/v1/plants"),
	createPlant: (input: SavePlantInput) =>
		request<{ plant: Plant; task: CareTask | null }>("/api/v1/plants", { method: "POST", body: JSON.stringify(input) }),
	deletePlant: (id: string) => request<void>(`/api/v1/plants/${encodeURIComponent(id)}`, { method: "DELETE" }),
	getTasks: () => request<{ tasks: CareTask[] }>("/api/v1/tasks"),
	completeTask: (id: string) =>
		request<{ task: CareTask; nextTask: CareTask | null }>(`/api/v1/tasks/${encodeURIComponent(id)}/complete`, {
			method: "PATCH",
			body: JSON.stringify({ completed: true }),
		}),
	getJournal: (plantId: string) => request<{ entries: JournalEntry[] }>(`/api/v1/plants/${encodeURIComponent(plantId)}/journal`),
	createJournal: (plantId: string, note: string, imageData?: string | null) =>
		request<{ entry: JournalEntry }>(`/api/v1/plants/${encodeURIComponent(plantId)}/journal`, {
			method: "POST",
			body: JSON.stringify({ note, imageData: imageData ?? null }),
		}),
	analyze: (input: { mode: AnalysisMode; imageData: string; context?: string; plantCommonName?: string }) =>
		request<{ result: AnalysisDraft["result"]; source: "live"; model: string }>("/api/v1/analysis/identify", {
			method: "POST",
			body: JSON.stringify(input),
		}),
	demoAnalysis: (mode: AnalysisMode) =>
		request<{ result: AnalysisDraft["result"]; source: "sample"; model: null }>("/api/v1/analysis/demo", {
			method: "POST",
			body: JSON.stringify({ mode }),
		}),
};

export function getApiBaseUrl() {
	return API_BASE_URL;
}
