import { Router } from "express";
import { createPlant, deletePlant, listPlants } from "../controllers/plants.controller.ts";
import { asyncHandler } from "../middleware/async-handler.middleware.ts";
import { requireAuth } from "../middleware/auth.middleware.ts";

const router: Router = Router();
router.get("/", requireAuth, asyncHandler(listPlants));
router.post("/", requireAuth, asyncHandler(createPlant));
router.delete("/:id", requireAuth, asyncHandler(deletePlant));

export default router;
