import type { Request, RequestHandler, Response } from "express";

type AsyncController<P> = (request: Request<P>, response: Response) => Promise<void>;

/**
 * Forwards rejected async controller promises to the central Express error
 * handler while preserving route-specific parameter types (for example,
 * `{ id: string }` for a `/:id` route).
 */
export function asyncHandler<P>(controller: AsyncController<P>): RequestHandler<P> {
	return (request, response, next) => {
		void controller(request, response).catch(next);
	};
}
