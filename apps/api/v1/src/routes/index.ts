import { Router } from "express";
import analysesRoutes from "./analyses.routes";
import analysisRoutes from "./analysis.routes";
import authRoutes from "./auth.routes";
import healthRoutes from "./health.routes";
import journalRoutes from "./journal.routes";
import plantsRoutes from "./plants.routes";
import tasksRoutes from "./tasks.routes";

const router = Router();
router.use("/health", healthRoutes);
router.use("/auth", authRoutes);
router.use("/analysis", analysisRoutes);
router.use("/plants", plantsRoutes);
router.use("/plants", journalRoutes);
router.use("/tasks", tasksRoutes);
router.use("/analyses", analysesRoutes);

export default router;
