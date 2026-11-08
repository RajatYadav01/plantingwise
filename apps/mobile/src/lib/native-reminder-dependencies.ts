import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import type { CareReminderDependencies } from "./reminders";

/** Device-specific adapters are isolated from the reminder scheduling rules. */
export const nativeReminderDependencies: CareReminderDependencies = {
	storage: AsyncStorage,
	notifications: Notifications,
	androidImportanceDefault: Notifications.AndroidImportance.DEFAULT,
	dateTriggerType: Notifications.SchedulableTriggerInputTypes.DATE,
};
