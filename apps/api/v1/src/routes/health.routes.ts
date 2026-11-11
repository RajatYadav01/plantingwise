import { Router } from "express";
import { getHealth } from "../controllers/health.controller.ts";

const router: Router = Router();
router.get("/", getHealth);

export default router;
