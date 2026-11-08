import { Router } from "express";
import { getCurrentSession, login, logout, register } from "../controllers/auth.controller";
import { asyncHandler } from "../middleware/async-handler.middleware";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();
router.post("/register", asyncHandler(register));
router.post("/login", asyncHandler(login));
router.get("/me", requireAuth, getCurrentSession);
router.post("/logout", logout);

export default router;
