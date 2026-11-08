import { Router } from "express";
import { completeTask, listTasks } from "../controllers/tasks.controller";
import { asyncHandler } from "../middleware/async-handler.middleware";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();
router.get("/", requireAuth, asyncHandler(listTasks));
router.patch("/:id/complete", requireAuth, asyncHandler(completeTask));

export default router;
