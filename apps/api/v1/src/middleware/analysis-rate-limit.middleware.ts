import rateLimit from "express-rate-limit";

/** Limits costly image-analysis requests per client IP. */
export const analysisRateLimiter = rateLimit({
	windowMs: 10 * 60 * 1000,
	limit: 12,
	standardHeaders: "draft-8",
	legacyHeaders: false,
	message: { error: "Too many analyses in a short period. Please try again later.", code: "RATE_LIMITED" },
});
