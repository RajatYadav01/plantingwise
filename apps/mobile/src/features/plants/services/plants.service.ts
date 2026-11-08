import type { SavePlantInput } from "@plantingwise/types";
import { api } from "@/lib/api";

/** Plant collection operations. The API client owns transport and cookie handling. */
export const plantsService = {
	list: () => api.getPlants(),
	create: (input: SavePlantInput) => api.createPlant(input),
	remove: (plantId: string) => api.deletePlant(plantId),
};
