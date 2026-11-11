import { Router } from "express";
import { createJournalEntry, listJournalEntries } from "../controllers/journal.controller.ts";
import { asyncHandler } from "../middleware/async-handler.middleware.ts";
import { requireAuth } from "../middleware/auth.middleware.ts";

const router: Router = Router();
router.get("/:id/journal", requireAuth, asyncHandler(listJournalEntries));
router.post("/:id/journal", requireAuth, asyncHandler(createJournalEntry));

export default router;
