import type { Request, RequestHandler, Response } from "express";

type AsyncController = (request: Request, response: Response) => Promise<void>;

/** Forwards rejected async controller promises to the central Express error handler. */
export function asyncHandler(controller: AsyncController): RequestHandler {
	return (request, response, next) => {
		void controller(request, response).catch(next);
	};
}
