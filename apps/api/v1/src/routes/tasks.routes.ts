import { Router } from "express";
import { completeTask, listTasks } from "../controllers/tasks.controller.ts";
import { asyncHandler } from "../middleware/async-handler.middleware.ts";
import { requireAuth } from "../middleware/auth.middleware.ts";

const router: Router = Router();
router.get("/", requireAuth, asyncHandler(listTasks));
router.patch("/:id/complete", requireAuth, asyncHandler(completeTask));

export default router;
