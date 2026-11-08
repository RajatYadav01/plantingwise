import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { theme } from "@/theme/theme";

export default function TabLayout() {
	return (
		<Tabs
			screenOptions={{
				headerShown: false,
				tabBarActiveTintColor: theme.colors.forest,
				tabBarInactiveTintColor: "#8D988E",
				tabBarLabelStyle: { fontSize: 11, fontWeight: "700", paddingBottom: 2 },
				tabBarStyle: {
					backgroundColor: "#FFFFFF",
					borderTopColor: theme.colors.line,
					height: 68,
					paddingTop: 8,
					paddingBottom: 8,
				},
			}}
		>
			<Tabs.Screen
				name="index"
				options={{ title: "Home", tabBarIcon: ({ color, size }) => <Ionicons name="leaf-outline" color={color} size={size} /> }}
			/>
			<Tabs.Screen
				name="garden"
				options={{
					title: "My plants",
					tabBarIcon: ({ color, size }) => <Ionicons name="flower-outline" color={color} size={size} />,
				}}
			/>
			<Tabs.Screen
				name="care"
				options={{
					title: "Care tasks",
					tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" color={color} size={size} />,
				}}
			/>
			<Tabs.Screen
				name="settings"
				options={{
					title: "Profile",
					tabBarIcon: ({ color, size }) => <Ionicons name="person-circle-outline" color={color} size={size} />,
				}}
			/>
		</Tabs>
	);
}
