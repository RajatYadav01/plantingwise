import { Ionicons } from "@expo/vector-icons";
import { getTaskStatus } from "@plantingwise/types";
import { router } from "expo-router";
import { useMemo } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Button, Card, Divider, Eyebrow, IconBox, Screen, SectionTitle, Wordmark } from "@/components/ui";
import { TaskRow } from "@/features/care/components/TaskRow";
import { useGarden } from "@/features/garden/contexts/GardenContext";
import { PlantCard } from "@/features/plants/components/PlantCard";
import { theme, typography } from "@/theme/theme";

export default function HomeScreen() {
	const { user, plants, tasks, journalEntries, completeTask } = useGarden();
	const dueTasks = useMemo(
		() => tasks.filter((task) => !task.completedAt).sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime()),
		[tasks],
	);
	const overdueCount = dueTasks.filter((task) => getTaskStatus(task) === "due").length;
	const visiblePlants = plants.slice(0, 3);
	const plantName = (id: string) => plants.find((plant) => plant.id === id)?.displayName ?? "Your plant";

	return (
		<Screen contentStyle={styles.page}>
			<View style={styles.header}>
				<Wordmark />
				<Pressable onPress={() => router.push("/(tabs)/settings")} style={styles.avatarButton} accessibilityLabel="Open profile">
					<Text style={styles.avatarLetter}>{user?.name?.slice(0, 1).toUpperCase() ?? "S"}</Text>
				</Pressable>
			</View>

			<View style={styles.introBlock}>
				<Eyebrow>YOUR LITTLE GREEN CORNER</Eyebrow>
				<Text style={styles.title}>{user ? `Welcome back, ${user.name.split(" ")[0]}.` : "A little more green, every day."}</Text>
				<Text style={styles.subtitle}>Thoughtful care starts with noticing. Let's see how your plants are doing.</Text>
			</View>

			<View style={styles.hero}>
				<View style={styles.heroDecorOne} />
				<View style={styles.heroDecorTwo} />
				<View style={styles.heroTextBlock}>
					<View style={styles.heroBadge}>
						<Ionicons name="sparkles" size={13} color="#E9D9A9" />
						<Text style={styles.heroBadgeText}>YOUR AI PLANT COMPANION</Text>
					</View>
					<Text style={styles.heroTitle}>Know your plants.{"\n"}Help them thrive.</Text>
					<Text style={styles.heroSubtitle}>
						Identify a plant or get a second opinion on a leaf that doesn't look quite right.
					</Text>
					<Button title="Analyse a plant" icon="scan-outline" onPress={() => router.push("/add-plant")} testID="add-plant-cta" />
				</View>
				<View style={styles.heroLeaf}>
					<Ionicons name="leaf" size={82} color="#B6D0AF" />
				</View>
			</View>

			<View style={styles.statsRow}>
				<Card style={styles.statCard}>
					<View style={styles.statIcon}>
						<Ionicons name="leaf-outline" size={18} color={theme.colors.forest} />
					</View>
					<Text style={styles.statValue}>{plants.length}</Text>
					<Text style={styles.statLabel}>Plants in your garden</Text>
				</Card>
				<Card style={styles.statCard}>
					<View style={[styles.statIcon, { backgroundColor: theme.colors.amberSoft }]}>
						<Ionicons name="calendar-outline" size={18} color="#986A22" />
					</View>
					<Text style={styles.statValue}>{overdueCount}</Text>
					<Text style={styles.statLabel}>Need a little attention</Text>
				</Card>
				<Card style={styles.statCard}>
					<View style={[styles.statIcon, { backgroundColor: theme.colors.blueSoft }]}>
						<Ionicons name="book-outline" size={18} color="#416B80" />
					</View>
					<Text style={styles.statValue}>{journalEntries.length}</Text>
					<Text style={styles.statLabel}>Journal notes</Text>
				</Card>
			</View>

			<View style={styles.sectionBlock}>
				<SectionTitle title="A few of your plants" action="View garden" onAction={() => router.push("/(tabs)/garden")} />
				<View style={styles.plantGrid}>
					{visiblePlants.map((plant) => {
						const nextTask = dueTasks.find((task) => task.plantId === plant.id);
						return (
							<PlantCard
								key={plant.id}
								plant={plant}
								taskLabel={nextTask ? (getTaskStatus(nextTask) === "due" ? "Check today" : "Care coming up") : undefined}
								onPress={() => router.push(`/plants/${plant.id}`)}
							/>
						);
					})}
				</View>
				{plants.length === 0 ? (
					<Card>
						<Text style={styles.emptyTitle}>Your garden is ready for its first resident.</Text>
						<Text style={styles.subtitle}>Add a plant to start building a care routine.</Text>
						<Button title="Add your first plant" icon="add" onPress={() => router.push("/add-plant")} />
					</Card>
				) : null}
			</View>

			<View style={styles.sectionBlock}>
				<SectionTitle title="A little care goes a long way" action="All tasks" onAction={() => router.push("/(tabs)/care")} />
				<Card>
					{dueTasks.slice(0, 3).map((task, index) => (
						<View key={task.id}>
							<TaskRow
								task={{ ...task, plantName: task.plantName ?? plantName(task.plantId) }}
								compact
								onComplete={() => void completeTask(task.id)}
							/>
							{index < Math.min(dueTasks.length, 3) - 1 ? <Divider /> : null}
						</View>
					))}
					{dueTasks.length === 0 ? (
						<View style={styles.emptyTasks}>
							<IconBox name="checkmark-circle-outline" />
							<View style={{ flex: 1, gap: 4 }}>
								<Text style={styles.emptyTitle}>You're all caught up.</Text>
								<Text style={styles.subtitle}>Enjoy a moment with your plants.</Text>
							</View>
						</View>
					) : null}
				</Card>
			</View>

			<Pressable style={styles.privacyNote} onPress={() => router.push("/(tabs)/settings")}>
				<Ionicons name="shield-checkmark-outline" size={18} color={theme.colors.leaf} />
				<Text style={styles.privacyText}>
					Your photos are used to help with plant guidance. Learn how demo and account data are handled.
				</Text>
				<Ionicons name="chevron-forward" size={17} color={theme.colors.muted} />
			</Pressable>
			<Text style={styles.footer}>{"PLANTINGWISE  ·  GROW A LITTLE WISER"}</Text>
		</Screen>
	);
}

const styles = StyleSheet.create({
	page: { gap: 27, paddingTop: 18 },
	header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
	avatarButton: {
		width: 40,
		height: 40,
		borderRadius: 14,
		backgroundColor: theme.colors.sage,
		alignItems: "center",
		justifyContent: "center",
	},
	avatarLetter: { color: theme.colors.forest, fontWeight: "800", fontSize: 15 },
	introBlock: { gap: 8, maxWidth: 680 },
	title: { ...typography.title, color: theme.colors.ink },
	subtitle: { color: theme.colors.muted, fontSize: 14, lineHeight: 21 },
	hero: {
		backgroundColor: theme.colors.forest,
		minHeight: 258,
		borderRadius: 26,
		padding: 24,
		position: "relative",
		overflow: "hidden",
		flexDirection: "row",
		alignItems: "center",
	},
	heroTextBlock: { flex: 1, gap: 13, maxWidth: 580, zIndex: 2 },
	heroBadge: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		alignSelf: "flex-start",
		backgroundColor: "rgba(255,255,255,0.11)",
		borderRadius: 40,
		paddingHorizontal: 10,
		paddingVertical: 6,
	},
	heroBadgeText: { color: "#E5E9CF", fontSize: 10, fontWeight: "800", letterSpacing: 0.8 },
	heroTitle: { color: theme.colors.white, fontSize: 31, lineHeight: 36, fontWeight: "800", letterSpacing: -0.8 },
	heroSubtitle: { color: "#D3E1D5", fontSize: 13, lineHeight: 20, maxWidth: 420 },
	heroDecorOne: {
		position: "absolute",
		width: 250,
		height: 250,
		borderRadius: 125,
		backgroundColor: "rgba(220,239,212,0.05)",
		right: -35,
		top: -90,
	},
	heroDecorTwo: {
		position: "absolute",
		width: 200,
		height: 200,
		borderRadius: 100,
		borderWidth: 1,
		borderColor: "rgba(220,239,212,0.12)",
		right: 35,
		bottom: -120,
	},
	heroLeaf: { width: 120, height: 180, alignItems: "center", justifyContent: "center", opacity: 0.8, transform: [{ rotate: "-17deg" }] },
	statsRow: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
	statCard: { flex: 1, minWidth: 140, padding: 16, gap: 7 },
	statIcon: {
		width: 33,
		height: 33,
		borderRadius: 11,
		backgroundColor: theme.colors.sageLight,
		alignItems: "center",
		justifyContent: "center",
	},
	statValue: { color: theme.colors.ink, fontSize: 25, fontWeight: "800" },
	statLabel: { color: theme.colors.muted, fontSize: 12, lineHeight: 17 },
	sectionBlock: { gap: 14 },
	plantGrid: { flexDirection: "row", flexWrap: "wrap", gap: 14, alignItems: "stretch" },
	emptyTitle: { color: theme.colors.ink, fontSize: 15, fontWeight: "800" },
	emptyTasks: { flexDirection: "row", alignItems: "center", gap: 12, paddingVertical: 6 },
	privacyNote: {
		backgroundColor: theme.colors.sageLight,
		borderRadius: 16,
		padding: 14,
		flexDirection: "row",
		alignItems: "center",
		gap: 11,
	},
	privacyText: { flex: 1, color: theme.colors.forest, fontSize: 12, lineHeight: 18 },
	footer: { alignSelf: "center", color: "#9AA49A", fontSize: 10, letterSpacing: 1.2, fontWeight: "700" },
});
