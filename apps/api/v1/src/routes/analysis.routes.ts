import { Router } from "express";
import { demo, identify } from "../controllers/analysis.controller.ts";
import { analysisRateLimiter } from "../middleware/analysis-rate-limit.middleware.ts";
import { asyncHandler } from "../middleware/async-handler.middleware.ts";
import { optionalAuth } from "../middleware/auth.middleware.ts";

const router: Router = Router();
router.post("/identify", analysisRateLimiter, optionalAuth, asyncHandler(identify));
router.post("/demo", demo);

export default router;
