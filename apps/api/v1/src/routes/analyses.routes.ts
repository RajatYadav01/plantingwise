import { Router } from "express";
import { listAnalyses } from "../controllers/analyses.controller.ts";
import { asyncHandler } from "../middleware/async-handler.middleware.ts";
import { requireAuth } from "../middleware/auth.middleware.ts";

const router: Router = Router();
router.get("/", requireAuth, asyncHandler(listAnalyses));

export default router;
