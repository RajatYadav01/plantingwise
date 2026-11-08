import { samplePlants, sampleTasks } from "@plantingwise/constants";
import {
	type AnalysisDraft,
	type CareTask,
	calculateNextDueDate,
	type JournalEntry,
	type Plant,
	type SafeUser,
	type SavePlantInput,
} from "@plantingwise/types";
import type React from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { authService } from "@/features/auth/services/auth.service";
import { careService } from "@/features/care/services/care.service";
import { journalService } from "@/features/journal/services/journal.service";
import { plantsService } from "@/features/plants/services/plants.service";
import { cancelCareReminder, scheduleCareReminder } from "@/lib/reminders";
import { readLocalGarden, writeLocalGarden } from "@/lib/storage";

type GardenContextValue = {
	user: SafeUser | null;
	plants: Plant[];
	tasks: CareTask[];
	journalEntries: JournalEntry[];
	currentAnalysis: AnalysisDraft | null;
	isHydrated: boolean;
	setCurrentAnalysis: (analysis: AnalysisDraft | null) => void;
	login: (email: string, password: string) => Promise<void>;
	register: (name: string, email: string, password: string) => Promise<void>;
	logout: () => Promise<void>;
	refreshCloud: () => Promise<void>;
	savePlant: (draft: AnalysisDraft, displayName: string, wateringIntervalDays: number | null) => Promise<Plant>;
	completeTask: (taskId: string) => Promise<void>;
	deletePlant: (plantId: string) => Promise<void>;
	addJournal: (plantId: string, note: string, imageData?: string | null) => Promise<void>;
};

const GardenContext = createContext<GardenContextValue | null>(null);

function createId(prefix: string) {
	return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function GardenProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<SafeUser | null>(null);
	const [plants, setPlants] = useState<Plant[]>(samplePlants);
	const [tasks, setTasks] = useState<CareTask[]>(sampleTasks);
	const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
	const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisDraft | null>(null);
	const [isHydrated, setIsHydrated] = useState(false);

	useEffect(() => {
		let alive = true;
		(async () => {
			const local = await readLocalGarden();
			if (!alive) return;
			setPlants(local.plants);
			setTasks(local.tasks);
			setJournalEntries(local.journalEntries);
			setIsHydrated(true);
			try {
				const response = await authService.getCurrentUser();
				if (!alive) return;
				const cloud = await Promise.all([plantsService.list(), careService.list()]);
				const plantJournals = await Promise.all(
					cloud[0].plants.map(async (plant) => {
						try {
							return (await journalService.listForPlant(plant.id)).entries;
						} catch {
							return [];
						}
					}),
				);
				if (!alive) return;
				setUser(response.user);
				setPlants(cloud[0].plants);
				setTasks(cloud[1].tasks);
				setJournalEntries(plantJournals.flat());
			} catch {
				// A first-time demo visitor is not required to have an account or a running API.
			}
		})();
		return () => {
			alive = false;
		};
	}, []);

	useEffect(() => {
		if (!isHydrated || user) return;
		void writeLocalGarden({ plants, tasks, journalEntries });
	}, [plants, tasks, journalEntries, isHydrated, user]);

	const refreshCloud = useCallback(async () => {
		const [plantResponse, taskResponse] = await Promise.all([plantsService.list(), careService.list()]);
		setPlants(plantResponse.plants);
		setTasks(taskResponse.tasks);
		const entries = await Promise.all(
			plantResponse.plants.map(async (plant) => {
				try {
					return (await journalService.listForPlant(plant.id)).entries;
				} catch {
					return [];
				}
			}),
		);
		setJournalEntries(entries.flat());
	}, []);

	const login = useCallback(async (email: string, password: string) => {
		const response = await authService.login(email, password);
		const [plantResponse, taskResponse] = await Promise.all([plantsService.list(), careService.list()]);
		setPlants(plantResponse.plants);
		setTasks(taskResponse.tasks);
		setUser(response.user);
		const journals = await Promise.all(
			plantResponse.plants.map(async (plant) => {
				try {
					return (await journalService.listForPlant(plant.id)).entries;
				} catch {
					return [];
				}
			}),
		);
		setJournalEntries(journals.flat());
	}, []);

	const register = useCallback(async (name: string, email: string, password: string) => {
		const response = await authService.register(name, email, password);
		setUser(response.user);
		setPlants([]);
		setTasks([]);
		setJournalEntries([]);
	}, []);

	const logout = useCallback(async () => {
		try {
			await authService.logout();
		} finally {
			const local = await readLocalGarden();
			setUser(null);
			setPlants(local.plants);
			setTasks(local.tasks);
			setJournalEntries(local.journalEntries);
		}
	}, []);

	const savePlant = useCallback(
		async (draft: AnalysisDraft, displayName: string, wateringIntervalDays: number | null) => {
			if (draft.result.mode !== "identify") throw new Error("Only an identification result can be saved as a new plant.");
			const result = draft.result;
			const input: SavePlantInput = {
				displayName: displayName.trim() || result.commonName,
				commonName: result.commonName,
				scientificName: result.scientificName,
				imageData: draft.imageData?.length && draft.imageData.length <= 500_000 ? draft.imageData : null,
				imageUrl: draft.imageUrl ?? null,
				confidence: result.confidence,
				summary: result.summary,
				care: result.care,
				wateringIntervalDays,
			};
			if (user) {
				const response = await plantsService.create(input);
				if (response.task) {
					await scheduleCareReminder({
						taskId: response.task.id,
						plantId: response.task.plantId,
						plantName: input.displayName,
						taskTitle: response.task.title,
						dueAt: response.task.dueAt,
					});
				}
				await refreshCloud();
				return response.plant;
			}

			const plant: Plant = {
				id: createId("plant"),
				displayName: input.displayName,
				commonName: input.commonName,
				scientificName: input.scientificName ?? null,
				imageData: input.imageData ?? draft.imageData ?? null,
				imageUrl: input.imageUrl ?? null,
				confidence: input.confidence,
				summary: input.summary,
				care: input.care,
				createdAt: new Date().toISOString(),
			};
			setPlants((current) => [plant, ...current]);
			if (wateringIntervalDays) {
				const dueAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
				const task: CareTask = {
					id: createId("task"),
					plantId: plant.id,
					type: "water",
					title: "Check soil moisture",
					dueAt,
					intervalDays: wateringIntervalDays,
					completedAt: null,
					createdAt: new Date().toISOString(),
					plantName: plant.displayName,
				};
				setTasks((current) => [task, ...current]);
				await scheduleCareReminder({
					taskId: task.id,
					plantId: plant.id,
					plantName: plant.displayName,
					taskTitle: task.title,
					dueAt: task.dueAt,
				});
			}
			return plant;
		},
		[refreshCloud, user],
	);

	const completeTask = useCallback(
		async (taskId: string) => {
			if (user && !taskId.startsWith("demo-task-") && !taskId.startsWith("task-")) {
				const response = await careService.complete(taskId);
				await cancelCareReminder(taskId);
				if (response.nextTask) {
					const plantName = plants.find((plant) => plant.id === response.nextTask?.plantId)?.displayName ?? "your plant";
					await scheduleCareReminder({
						taskId: response.nextTask.id,
						plantId: response.nextTask.plantId,
						plantName,
						taskTitle: response.nextTask.title,
						dueAt: response.nextTask.dueAt,
					});
				}
				await refreshCloud();
				return;
			}
			const existing = tasks.find((task) => task.id === taskId);
			if (!existing || existing.completedAt) return;
			const completedAt = new Date().toISOString();
			await cancelCareReminder(taskId);
			const nextDueAt = existing.isDemo ? null : calculateNextDueDate(completedAt, existing.intervalDays);
			const nextTask: CareTask | null = nextDueAt
				? {
						...existing,
						id: createId("task"),
						dueAt: nextDueAt,
						completedAt: null,
						createdAt: completedAt,
					}
				: null;
			setTasks((current) => {
				const updated = current.map((task) => (task.id === taskId ? { ...task, completedAt } : task));
				return nextTask ? [nextTask, ...updated] : updated;
			});
			if (nextTask) {
				await scheduleCareReminder({
					taskId: nextTask.id,
					plantId: nextTask.plantId,
					plantName: nextTask.plantName ?? plants.find((plant) => plant.id === nextTask.plantId)?.displayName ?? "your plant",
					taskTitle: nextTask.title,
					dueAt: nextTask.dueAt,
				});
			}
		},
		[plants, refreshCloud, tasks, user],
	);

	const deletePlant = useCallback(
		async (plantId: string) => {
			const plantTaskIds = tasks.filter((task) => task.plantId === plantId).map((task) => task.id);
			if (user) await plantsService.remove(plantId);
			await Promise.all(plantTaskIds.map((taskId) => cancelCareReminder(taskId)));
			setPlants((current) => current.filter((plant) => plant.id !== plantId));
			setTasks((current) => current.filter((task) => task.plantId !== plantId));
			setJournalEntries((current) => current.filter((entry) => entry.plantId !== plantId));
		},
		[tasks, user],
	);

	const addJournal = useCallback(
		async (plantId: string, note: string, imageData?: string | null) => {
			if (user) {
				const safeImageData = imageData && imageData.length <= 500_000 ? imageData : null;
				const response = await journalService.create(plantId, note, safeImageData);
				setJournalEntries((current) => [response.entry, ...current]);
				return;
			}
			const date = new Date().toISOString();
			setJournalEntries((current) => [
				{ id: createId("journal"), plantId, note, imageData: imageData ?? null, entryDate: date, createdAt: date },
				...current,
			]);
		},
		[user],
	);

	const value = useMemo<GardenContextValue>(
		() => ({
			user,
			plants,
			tasks,
			journalEntries,
			currentAnalysis,
			isHydrated,
			setCurrentAnalysis,
			login,
			register,
			logout,
			refreshCloud,
			savePlant,
			completeTask,
			deletePlant,
			addJournal,
		}),
		[
			user,
			plants,
			tasks,
			journalEntries,
			currentAnalysis,
			isHydrated,
			login,
			register,
			logout,
			refreshCloud,
			savePlant,
			completeTask,
			deletePlant,
			addJournal,
		],
	);

	return <GardenContext.Provider value={value}>{children}</GardenContext.Provider>;
}

export function useGarden() {
	const context = useContext(GardenContext);
	if (!context) throw new Error("useGarden must be used inside GardenProvider.");
	return context;
}
