import { Router } from "express";
import { listAnalyses } from "../controllers/analyses.controller";
import { asyncHandler } from "../middleware/async-handler.middleware";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();
router.get("/", requireAuth, asyncHandler(listAnalyses));

export default router;
