import { Router } from "express";
import { createJournalEntry, listJournalEntries } from "../controllers/journal.controller";
import { asyncHandler } from "../middleware/async-handler.middleware";
import { requireAuth } from "../middleware/auth.middleware";

const router = Router();
router.get("/:id/journal", requireAuth, asyncHandler(listJournalEntries));
router.post("/:id/journal", requireAuth, asyncHandler(createJournalEntry));

export default router;
