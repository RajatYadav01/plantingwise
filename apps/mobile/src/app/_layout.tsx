import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";
import { GardenProvider } from "@/features/garden/contexts/GardenContext";
import { theme } from "@/theme/theme";

if (Platform.OS !== "web") {
	Notifications.setNotificationHandler({
		handleNotification: async () => ({
			shouldPlaySound: false,
			shouldSetBadge: false,
			shouldShowBanner: true,
			shouldShowList: true,
		}),
	});
}

export default function RootLayout() {
	return (
		<GardenProvider>
			<StatusBar style="dark" />
			<Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.colors.canvas } }}>
				<Stack.Screen name="(tabs)" />
				<Stack.Screen name="add-plant" options={{ presentation: "modal" }} />
				<Stack.Screen name="analysis" />
				<Stack.Screen name="auth" options={{ presentation: "modal" }} />
				<Stack.Screen name="plants/[id]" />
			</Stack>
		</GardenProvider>
	);
}
