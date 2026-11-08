import { Platform } from "react-native";
import { nativeReminderDependencies } from "./native-reminder-dependencies";

const STORAGE_KEY = "plantingwise:care-notification-ids:v1";

export type CareReminderInput = {
	taskId: string;
	plantId: string;
	plantName: string;
	taskTitle: string;
	dueAt: string;
};

type ReminderStorage = { getItem: (key: string) => Promise<string | null>; setItem: (key: string, value: string) => Promise<void> };
type ReminderNotifications = Pick<
	typeof import("expo-notifications"),
	| "cancelScheduledNotificationAsync"
	| "getPermissionsAsync"
	| "requestPermissionsAsync"
	| "scheduleNotificationAsync"
	| "setNotificationChannelAsync"
>;

/** Explicit ports let reminder behavior be tested without calling device APIs. */
export type CareReminderDependencies = {
	storage: ReminderStorage;
	notifications: ReminderNotifications;
	androidImportanceDefault: typeof import("expo-notifications").AndroidImportance.DEFAULT;
	dateTriggerType: typeof import("expo-notifications").SchedulableTriggerInputTypes.DATE;
};

async function readNotificationMap(storage: ReminderStorage): Promise<Record<string, string>> {
	try {
		const raw = await storage.getItem(STORAGE_KEY);
		if (!raw) return {};
		const value: unknown = JSON.parse(raw);
		if (value && typeof value === "object" && !Array.isArray(value)) {
			return Object.fromEntries(Object.entries(value).filter((entry): entry is [string, string] => typeof entry[1] === "string"));
		}
	} catch {
		// A corrupt notification index should not block plant care.
	}
	return {};
}

export async function cancelCareReminder(
	taskId: string,
	platform: typeof Platform.OS = Platform.OS,
	dependencies: CareReminderDependencies = nativeReminderDependencies,
): Promise<void> {
	if (platform === "web") return;
	try {
		const notificationMap = await readNotificationMap(dependencies.storage);
		const identifier = notificationMap[taskId];
		if (identifier) await dependencies.notifications.cancelScheduledNotificationAsync(identifier);
		delete notificationMap[taskId];
		await dependencies.storage.setItem(STORAGE_KEY, JSON.stringify(notificationMap));
	} catch {
		// Reminder cleanup is best-effort; the in-app care list remains authoritative.
	}
}

export async function scheduleCareReminder(
	input: CareReminderInput,
	platform: typeof Platform.OS = Platform.OS,
	dependencies: CareReminderDependencies = nativeReminderDependencies,
): Promise<void> {
	if (platform === "web") return;
	const triggerDate = new Date(input.dueAt);
	if (!Number.isFinite(triggerDate.getTime()) || triggerDate.getTime() <= Date.now() + 30_000) return;

	try {
		const notificationMap = await readNotificationMap(dependencies.storage);
		const previousId = notificationMap[input.taskId];
		if (previousId) await dependencies.notifications.cancelScheduledNotificationAsync(previousId);
		delete notificationMap[input.taskId];

		if (platform === "android") {
			await dependencies.notifications.setNotificationChannelAsync("plantingwise-care", {
				name: "Plant care reminders",
				importance: dependencies.androidImportanceDefault,
				vibrationPattern: [0, 180],
			});
		}

		const currentPermission = await dependencies.notifications.getPermissionsAsync();
		const permission = currentPermission.granted ? currentPermission : await dependencies.notifications.requestPermissionsAsync();
		if (!permission.granted) {
			await dependencies.storage.setItem(STORAGE_KEY, JSON.stringify(notificationMap));
			return;
		}

		const identifier = await dependencies.notifications.scheduleNotificationAsync({
			content: {
				title: `A little care for ${input.plantName}`,
				body: `${input.taskTitle}. Check the soil and your plant before acting.`,
				data: { plantId: input.plantId, taskId: input.taskId },
			},
			trigger: {
				type: dependencies.dateTriggerType,
				date: triggerDate,
				...(platform === "android" ? { channelId: "plantingwise-care" } : {}),
			},
		});

		notificationMap[input.taskId] = identifier;
		await dependencies.storage.setItem(STORAGE_KEY, JSON.stringify(notificationMap));
	} catch {
		// Keep core app workflows usable if notifications are unavailable on a device.
	}
}
