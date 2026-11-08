import type { ErrorRequestHandler } from "express";

/** Centralises API errors and avoids logging request bodies, cookies, images, or credentials. */
export const errorHandler: ErrorRequestHandler = (error: unknown, _request, response, _next) => {
	const candidate = error as { status?: number; code?: string; message?: string };
	const status = typeof candidate.status === "number" ? candidate.status : 500;

	if (status >= 500) {
		console.error("Plantingwise API error:", candidate.code ?? "INTERNAL_ERROR", candidate.message ?? "Unknown error");
	}

	response.status(status).json({
		error:
			status >= 500 && !candidate.code ? "Something went wrong. Please try again." : (candidate.message ?? "Something went wrong."),
		code: candidate.code ?? "INTERNAL_ERROR",
	});
};
