import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Button, Card, Eyebrow, Screen, SectionTitle } from "@/components/ui";
import { useGarden } from "@/features/garden/contexts/GardenContext";
import { PlantCard } from "@/features/plants/components/PlantCard";
import { theme, typography } from "@/theme/theme";

export default function GardenScreen() {
	const { plants, tasks } = useGarden();
	const [query, setQuery] = useState("");
	const filtered = useMemo(
		() =>
			plants.filter((plant) =>
				`${plant.displayName} ${plant.commonName} ${plant.scientificName ?? ""}`.toLowerCase().includes(query.toLowerCase()),
			),
		[plants, query],
	);
	return (
		<Screen contentStyle={styles.page}>
			<View style={styles.header}>
				<View style={{ gap: 8 }}>
					<Eyebrow>YOUR COLLECTION</Eyebrow>
					<Text style={styles.title}>My garden</Text>
					<Text style={styles.subtitle}>Every plant has its own little story.</Text>
				</View>
				<Button title="Add plant" icon="add" compact onPress={() => router.push("/add-plant")} />
			</View>
			<View style={styles.searchWrap}>
				<Ionicons name="search-outline" size={19} color={theme.colors.muted} />
				<TextInput
					testID="garden-search"
					accessibilityLabel="Search plants"
					placeholder="Search your plants..."
					placeholderTextColor="#89948B"
					value={query}
					onChangeText={setQuery}
					style={styles.searchInput}
				/>
			</View>
			<SectionTitle title={`${filtered.length} ${filtered.length === 1 ? "plant" : "plants"}`} />
			{filtered.length > 0 ? (
				<View style={styles.grid}>
					{filtered.map((plant) => {
						const activeTask = tasks.find((task) => task.plantId === plant.id && !task.completedAt);
						return (
							<PlantCard
								key={plant.id}
								plant={plant}
								taskLabel={activeTask?.title ?? "Care guide"}
								onPress={() => router.push(`/plants/${plant.id}`)}
							/>
						);
					})}
				</View>
			) : (
				<Card style={styles.empty}>
					<View style={styles.emptyIcon}>
						<Ionicons name="leaf-outline" size={27} color={theme.colors.forest} />
					</View>
					<Text style={styles.emptyTitle}>{query ? "No matching plants" : "A fresh page for your garden"}</Text>
					<Text style={styles.subtitle}>
						{query ? "Try another plant name." : "Add a photo to identify a plant and start a care profile."}
					</Text>
					<Button
						title={query ? "Clear search" : "Identify a plant"}
						icon={query ? "close" : "scan-outline"}
						onPress={() => (query ? setQuery("") : router.push("/add-plant"))}
					/>
				</Card>
			)}
			<Pressable style={styles.tip} onPress={() => router.push("/(tabs)/care")}>
				<Ionicons name="bulb-outline" size={19} color="#8C5E18" />
				<Text style={styles.tipText}>
					A helpful habit: check the soil before following a watering reminder. Plant needs change with light and season.
				</Text>
			</Pressable>
		</Screen>
	);
}

const styles = StyleSheet.create({
	page: { gap: 24, paddingTop: 22 },
	header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", gap: 12 },
	title: { ...typography.title, color: theme.colors.ink },
	subtitle: { color: theme.colors.muted, fontSize: 14, lineHeight: 21 },
	searchWrap: {
		minHeight: 49,
		backgroundColor: theme.colors.white,
		borderColor: theme.colors.line,
		borderWidth: 1,
		borderRadius: 14,
		flexDirection: "row",
		alignItems: "center",
		gap: 10,
		paddingHorizontal: 15,
	},
	searchInput: { flex: 1, color: theme.colors.ink, minHeight: 47 },
	grid: { flexDirection: "row", flexWrap: "wrap", gap: 14, alignItems: "stretch" },
	empty: { alignItems: "flex-start", padding: 26 },
	emptyIcon: {
		width: 54,
		height: 54,
		backgroundColor: theme.colors.sage,
		borderRadius: 18,
		alignItems: "center",
		justifyContent: "center",
	},
	emptyTitle: { color: theme.colors.ink, fontSize: 18, fontWeight: "800" },
	tip: {
		flexDirection: "row",
		gap: 10,
		padding: 15,
		borderRadius: 15,
		backgroundColor: theme.colors.amberSoft,
		alignItems: "flex-start",
	},
	tipText: { flex: 1, color: "#7C5A2A", fontSize: 12, lineHeight: 19 },
});
