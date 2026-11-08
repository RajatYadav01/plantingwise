import { Router } from "express";
import { createPlant, deletePlant, listPlants } from "../controllers/plants.controller";
import { asyncHandler } from "../middleware/async-handler.middleware";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();
router.get("/", requireAuth, asyncHandler(listPlants));
router.post("/", requireAuth, asyncHandler(createPlant));
router.delete("/:id", requireAuth, asyncHandler(deletePlant));

export default router;
