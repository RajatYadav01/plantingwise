import request from "supertest";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import app from "./app";

const originalDatabaseUrl = process.env.DATABASE_URL;
const originalOpenRouterKey = process.env.OPENROUTER_API_KEY;
const originalOpenRouterModel = process.env.OPENROUTER_MODEL;

beforeAll(() => {
	delete process.env.DATABASE_URL;
	delete process.env.OPENROUTER_API_KEY;
	delete process.env.OPENROUTER_MODEL;
});

afterAll(() => {
	if (originalDatabaseUrl) process.env.DATABASE_URL = originalDatabaseUrl;
	if (originalOpenRouterKey) process.env.OPENROUTER_API_KEY = originalOpenRouterKey;
	if (originalOpenRouterModel) process.env.OPENROUTER_MODEL = originalOpenRouterModel;
});

describe("Plantingwise API", () => {
	it("reports health without requiring external services", async () => {
		const response = await request(app).get("/api/v1/health").expect(200);
		expect(response.body.status).toBe("ok");
		expect(response.body.databaseConfigured).toBe(false);
	});

	it("serves sample analysis explicitly marked as sample", async () => {
		const response = await request(app).post("/api/v1/analysis/demo").send({ mode: "identify" }).expect(200);
		expect(response.body.source).toBe("sample");
		expect(response.body.result.mode).toBe("identify");
	});

	it("rejects unsupported image MIME types before calling a provider", async () => {
		const response = await request(app)
			.post("/api/v1/analysis/identify")
			.send({ mode: "identify", imageData: "data:application/pdf;base64,AAAA" })
			.expect(400);
		expect(response.body.code).toBe("VALIDATION_ERROR");
	});

	it("requires a JWT session for private garden records", async () => {
		const response = await request(app).get("/api/v1/plants").expect(401);
		expect(response.body.code).toBe("UNAUTHENTICATED");
	});

	it("rejects unknown demo analysis modes", async () => {
		const response = await request(app).post("/api/v1/analysis/demo").send({ mode: "chat" }).expect(400);
		expect(response.body.code).toBe("INVALID_MODE");
	});
});
