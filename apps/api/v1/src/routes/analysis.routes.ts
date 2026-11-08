import { Router } from "express";
import { demo, identify } from "../controllers/analysis.controller";
import { analysisRateLimiter } from "../middleware/analysis-rate-limit.middleware";
import { asyncHandler } from "../middleware/async-handler.middleware";
import { optionalAuth } from "../middleware/auth.middleware";

const router = Router();
router.post("/identify", analysisRateLimiter, optionalAuth, asyncHandler(identify));
router.post("/demo", demo);

export default router;
