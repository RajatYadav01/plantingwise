import type { CareTask, Plant } from "@plantingwise/types";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";
import { Pressable, Text } from "react-native";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { api } from "@/lib/api";
import { cancelCareReminder, scheduleCareReminder } from "@/lib/reminders";
import { readLocalGarden, writeLocalGarden } from "@/lib/storage";
import { GardenProvider, useGarden } from "./GardenProvider";

vi.mock("@/lib/api", () => ({
	api: {
		me: vi.fn(),
		login: vi.fn(),
		register: vi.fn(),
		logout: vi.fn(),
		getPlants: vi.fn(),
		getTasks: vi.fn(),
		getJournal: vi.fn(),
		createPlant: vi.fn(),
		completeTask: vi.fn(),
		deletePlant: vi.fn(),
		createJournal: vi.fn(),
	},
}));

vi.mock("@/lib/storage", () => ({
	readLocalGarden: vi.fn(),
	writeLocalGarden: vi.fn(),
}));

vi.mock("@/lib/reminders", () => ({
	cancelCareReminder: vi.fn(),
	scheduleCareReminder: vi.fn(),
}));

const plant: Plant = {
	id: "plant-1",
	displayName: "Milo",
	commonName: "Monstera deliciosa",
	scientificName: "Monstera deliciosa",
	imageData: null,
	imageUrl: null,
	confidence: "high",
	summary: "A healthy sample Monstera.",
	care: {
		light: "Bright, indirect light.",
		watering: "Check the top layer of soil before watering.",
		humidity: "Average indoor humidity.",
		soil: "A well-draining mix.",
	},
	createdAt: "2026-10-01T00:00:00.000Z",
};

const task: CareTask = {
	id: "task-1",
	plantId: plant.id,
	type: "water",
	title: "Check soil moisture",
	dueAt: "2026-10-01T00:00:00.000Z",
	intervalDays: 7,
	completedAt: null,
	createdAt: "2026-09-25T00:00:00.000Z",
	plantName: plant.displayName,
};

function GardenProbe() {
	const garden = useGarden();

	return (
		<>
			<TextValue testID="hydration" value={garden.isHydrated ? "ready" : "loading"} />
			<TextValue testID="plant-count" value={String(garden.plants.length)} />
			<TextValue testID="task-count" value={String(garden.tasks.length)} />
			<TextValue testID="journal-count" value={String(garden.journalEntries.length)} />
			<PressAction testID="complete-task" label="Complete task" onPress={() => garden.completeTask(task.id)} />
			<PressAction testID="add-journal" label="Add journal" onPress={() => garden.addJournal(plant.id, "A new leaf appeared.")} />
		</>
	);
}

function TextValue({ testID, value }: { testID: string; value: string }) {
	return <Text testID={testID}>{value}</Text>;
}

function PressAction({ testID, label, onPress }: { testID: string; label: string; onPress: () => void }) {
	return (
		<Pressable testID={testID} accessibilityRole="button" onPress={onPress}>
			<Text>{label}</Text>
		</Pressable>
	);
}

describe("GardenProvider demo-mode integration", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(readLocalGarden).mockResolvedValue({ plants: [plant], tasks: [task], journalEntries: [] });
		vi.mocked(writeLocalGarden).mockResolvedValue(undefined);
		vi.mocked(api.me).mockRejectedValue(new Error("No active session"));
		vi.mocked(api.logout).mockResolvedValue(undefined);
		vi.mocked(cancelCareReminder).mockResolvedValue(undefined);
		vi.mocked(scheduleCareReminder).mockResolvedValue(undefined);
	});

	it("hydrates local records and creates the next care task when a recurring task is completed", async () => {
		await render(
			<GardenProvider>
				<GardenProbe />
			</GardenProvider>,
		);

		await waitFor(() => expect(screen.getByTestId("hydration").props.children).toBe("ready"));
		expect(screen.getByTestId("plant-count").props.children).toBe("1");
		expect(screen.getByTestId("task-count").props.children).toBe("1");

		await fireEvent.press(screen.getByTestId("complete-task"));

		await waitFor(() => expect(screen.getByTestId("task-count").props.children).toBe("2"));
		expect(cancelCareReminder).toHaveBeenCalledWith(task.id);
		expect(scheduleCareReminder).toHaveBeenCalledWith(
			expect.objectContaining({ plantId: plant.id, plantName: plant.displayName, taskTitle: task.title }),
		);
		expect(writeLocalGarden).toHaveBeenCalled();
	});

	it("adds a journal entry to the local demo garden", async () => {
		await render(
			<GardenProvider>
				<GardenProbe />
			</GardenProvider>,
		);

		await waitFor(() => expect(screen.getByTestId("hydration").props.children).toBe("ready"));
		await fireEvent.press(screen.getByTestId("add-journal"));

		await waitFor(() => expect(screen.getByTestId("journal-count").props.children).toBe("1"));
		expect(writeLocalGarden).toHaveBeenCalled();
	});
});
