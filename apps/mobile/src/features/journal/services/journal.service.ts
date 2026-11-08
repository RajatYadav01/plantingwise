import { api } from "@/lib/api";

/** Plant growth journal operations. */
export const journalService = {
	listForPlant: (plantId: string) => api.getJournal(plantId),
	create: (plantId: string, note: string, imageData?: string | null) => api.createJournal(plantId, note, imageData),
};
