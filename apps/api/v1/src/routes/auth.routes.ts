import { Router } from "express";
import { getCurrentSession, login, logout, register } from "../controllers/auth.controller.ts";
import { asyncHandler } from "../middleware/async-handler.middleware.ts";
import { requireAuth } from "../middleware/auth.middleware.ts";

const router: Router = Router();
router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.get("/me", requireAuth, getCurrentSession);
router.post("/logout", logout);

export default router;
