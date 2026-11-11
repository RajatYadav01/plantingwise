import { Router } from "express";
import analysesRoutes from "./analyses.routes.ts";
import analysisRoutes from "./analysis.routes.ts";
import authRoutes from "./auth.routes.ts";
import healthRoutes from "./health.routes.ts";
import journalRoutes from "./journal.routes.ts";
import plantsRoutes from "./plants.routes.ts";
import tasksRoutes from "./tasks.routes.ts";

const router: Router = Router();
router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/analysis", analysisRoutes);
router.use("/plants", plantsRoutes);
router.use("/plants", journalRoutes);
router.use("/tasks", tasksRoutes);
router.use("/analyses", analysesRoutes);

export default router;
