import { api } from "@/lib/api";

/** Care-task operations shared by the care screens and garden provider. */
export const careService = {
	list: () => api.getTasks(),
	complete: (taskId: string) => api.completeTask(taskId),
};
