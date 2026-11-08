import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CareReminderDependencies, CareReminderInput } from "./reminders";
import { cancelCareReminder, scheduleCareReminder } from "./reminders";

const mocks = vi.hoisted(() => {
	const storage = {
		getItem: vi.fn(),
		setItem: vi.fn(),
	};
	const notifications = {
		cancelScheduledNotificationAsync: vi.fn(),
		getPermissionsAsync: vi.fn(),
		requestPermissionsAsync: vi.fn(),
		scheduleNotificationAsync: vi.fn(),
		setNotificationChannelAsync: vi.fn(),
	};
	return {
		...storage,
		...notifications,
		dependencies: {
			storage,
			notifications,
			androidImportanceDefault: 5,
			dateTriggerType: "date",
		},
	};
});

// Mock the app-owned adapter, not the externalized Expo/React Native packages.
vi.mock("./native-reminder-dependencies", () => ({
	nativeReminderDependencies: mocks.dependencies,
}));

const dependencies = mocks.dependencies as unknown as CareReminderDependencies;

const reminder: CareReminderInput = {
	taskId: "task-1",
	plantId: "plant-1",
	plantName: "Milo",
	taskTitle: "Check soil moisture",
	dueAt: new Date(Date.now() + 24 * 60 * 60_000).toISOString(),
};

describe("native care reminders", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mocks.getItem.mockResolvedValue(null);
		mocks.setItem.mockResolvedValue(undefined);
		mocks.cancelScheduledNotificationAsync.mockResolvedValue(undefined);
		mocks.getPermissionsAsync.mockResolvedValue({ granted: true });
		mocks.requestPermissionsAsync.mockResolvedValue({ granted: true });
		mocks.scheduleNotificationAsync.mockResolvedValue("notification-1");
		mocks.setNotificationChannelAsync.mockResolvedValue(null);
	});

	it("schedules a future reminder and stores its notification identifier", async () => {
		await scheduleCareReminder(reminder, "ios", dependencies);

		expect(mocks.scheduleNotificationAsync).toHaveBeenCalledWith(
			expect.objectContaining({
				content: expect.objectContaining({
					title: "A little care for Milo",
					data: { plantId: "plant-1", taskId: "task-1" },
				}),
			}),
		);
		expect(mocks.setItem).toHaveBeenCalledWith("plantingwise:care-notification-ids:v1", JSON.stringify({ "task-1": "notification-1" }));
	});

	it("requests permission when the app has not been granted notification access", async () => {
		mocks.getPermissionsAsync.mockResolvedValueOnce({ granted: false });

		await scheduleCareReminder(reminder, "ios", dependencies);

		expect(mocks.requestPermissionsAsync).toHaveBeenCalledOnce();
		expect(mocks.scheduleNotificationAsync).toHaveBeenCalledOnce();
	});

	it("does not schedule a notification after permission is denied", async () => {
		mocks.getPermissionsAsync.mockResolvedValueOnce({ granted: false });
		mocks.requestPermissionsAsync.mockResolvedValueOnce({ granted: false });

		await scheduleCareReminder(reminder, "ios", dependencies);

		expect(mocks.scheduleNotificationAsync).not.toHaveBeenCalled();
		expect(mocks.setItem).toHaveBeenCalledWith("plantingwise:care-notification-ids:v1", "{}");
	});

	it("creates an Android notification channel before scheduling", async () => {
		await scheduleCareReminder(reminder, "android", dependencies);

		expect(mocks.setNotificationChannelAsync).toHaveBeenCalledWith(
			"plantingwise-care",
			expect.objectContaining({ name: "Plant care reminders" }),
		);
	});

	it("ignores invalid or already-due timestamps", async () => {
		await scheduleCareReminder({ ...reminder, dueAt: "not-a-date" }, "ios", dependencies);
		await scheduleCareReminder({ ...reminder, dueAt: new Date(Date.now() - 60_000).toISOString() }, "ios", dependencies);

		expect(mocks.scheduleNotificationAsync).not.toHaveBeenCalled();
	});

	it("cancels and removes an existing task reminder", async () => {
		mocks.getItem.mockResolvedValueOnce(JSON.stringify({ "task-1": "notification-1", "task-2": "notification-2" }));

		await cancelCareReminder("task-1", "ios", dependencies);

		expect(mocks.cancelScheduledNotificationAsync).toHaveBeenCalledWith("notification-1");
		expect(mocks.setItem).toHaveBeenCalledWith("plantingwise:care-notification-ids:v1", JSON.stringify({ "task-2": "notification-2" }));
	});

	it("does not access native notification APIs on web", async () => {
		await scheduleCareReminder(reminder, "web", dependencies);
		await cancelCareReminder(reminder.taskId, "web", dependencies);

		expect(mocks.getPermissionsAsync).not.toHaveBeenCalled();
		expect(mocks.scheduleNotificationAsync).not.toHaveBeenCalled();
		expect(mocks.getItem).not.toHaveBeenCalled();
	});
});
