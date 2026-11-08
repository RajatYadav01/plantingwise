import type { Response } from "express";

type ValidationIssue = { message: string; path: PropertyKey[] };

/** Converts Zod issues into the API's consistent validation-error response. */
export function sendZodError(response: Response, issues: ValidationIssue[]): void {
	response.status(400).json({
		error: issues[0]?.message ?? "The request is invalid.",
		code: "VALIDATION_ERROR",
		fields: issues.map((issue) => ({ path: issue.path.map(String).join("."), message: issue.message })),
	});
}
