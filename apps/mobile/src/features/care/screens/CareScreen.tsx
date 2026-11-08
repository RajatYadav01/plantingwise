import { getTaskStatus } from "@plantingwise/types";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Card, Eyebrow, IconBox, Pill, Screen, SectionTitle } from "@/components/ui";
import { TaskRow } from "@/features/care/components/TaskRow";
import { useGarden } from "@/features/garden/contexts/GardenContext";
import { theme, typography } from "@/theme/theme";

const filters = ["All", "Due", "Upcoming", "Done"] as const;
type Filter = (typeof filters)[number];

export default function CareScreen() {
	const { tasks, plants, completeTask } = useGarden();
	const [filter, setFilter] = useState<Filter>("All");
	const mapped = useMemo(
		() =>
			tasks
				.map((task) => ({
					...task,
					plantName: task.plantName ?? plants.find((plant) => plant.id === task.plantId)?.displayName ?? "Plant",
				}))
				.sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime()),
		[tasks, plants],
	);
	const filtered = mapped.filter(
		(task) =>
			filter === "All" ||
			(filter === "Due" && getTaskStatus(task) === "due") ||
			(filter === "Upcoming" && getTaskStatus(task) === "upcoming") ||
			(filter === "Done" && getTaskStatus(task) === "completed"),
	);
	const dueCount = mapped.filter((task) => getTaskStatus(task) === "due").length;
	const upcomingCount = mapped.filter((task) => getTaskStatus(task) === "upcoming").length;

	return (
		<Screen contentStyle={styles.page}>
			<View style={{ gap: 8 }}>
				<Eyebrow>SMALL HABITS, HEALTHIER PLANTS</Eyebrow>
				<Text style={styles.title}>Care calendar</Text>
				<Text style={styles.subtitle}>A flexible guide—not a rulebook. Check your soil and your plant before acting.</Text>
			</View>
			<View style={styles.summaryRow}>
				<Card style={styles.summaryCard}>
					<Pill label="Due now" tone={dueCount ? "amber" : "green"} />
					<Text style={styles.summaryValue}>{dueCount}</Text>
					<Text style={styles.summaryLabel}>Need a quick check</Text>
				</Card>
				<Card style={styles.summaryCard}>
					<Pill label="Coming up" tone="blue" />
					<Text style={styles.summaryValue}>{upcomingCount}</Text>
					<Text style={styles.summaryLabel}>On your schedule</Text>
				</Card>
			</View>
			<View style={styles.filterRow}>
				{filters.map((item) => (
					<Pressable
						key={item}
						onPress={() => setFilter(item)}
						style={[styles.filterChip, filter === item && styles.filterChipActive]}
					>
						<Text style={[styles.filterLabel, filter === item && styles.filterLabelActive]}>{item}</Text>
					</Pressable>
				))}
			</View>
			<Card>
				<SectionTitle title={filter === "All" ? "Your tasks" : `${filter} tasks`} />
				{filtered.length ? (
					filtered.map((task, index) => (
						<View key={task.id}>
							<TaskRow task={task} onComplete={() => void completeTask(task.id)} />
							{index < filtered.length - 1 ? <View style={styles.separator} /> : null}
						</View>
					))
				) : (
					<View style={styles.empty}>
						<IconBox name={filter === "Done" ? "checkmark-done-outline" : "leaf-outline"} />
						<Text style={styles.emptyTitle}>
							{filter === "Done" ? "Nothing completed yet" : "Nothing needs your attention"}
						</Text>
						<Text style={styles.subtitle}>
							{filter === "Done"
								? "Mark a task complete when you finish caring for a plant."
								: "Your plants can enjoy a quiet moment. Check back soon."}
						</Text>
					</View>
				)}
			</Card>
			<View style={styles.note}>
				<IconBox name="information-circle-outline" tint="amber" />
				<View style={{ flex: 1, gap: 4 }}>
					<Text style={styles.noteTitle}>Let the plant be the guide</Text>
					<Text style={styles.noteBody}>
						Watering intervals are reminders to check, not automatic instructions to water. Soil, pot size, temperature and
						light all matter.
					</Text>
				</View>
			</View>
		</Screen>
	);
}

const styles = StyleSheet.create({
	page: { gap: 24, paddingTop: 22 },
	title: { ...typography.title, color: theme.colors.ink },
	subtitle: { color: theme.colors.muted, fontSize: 13, lineHeight: 20 },
	summaryRow: { flexDirection: "row", gap: 12 },
	summaryCard: { flex: 1, padding: 17, gap: 9 },
	summaryValue: { fontSize: 29, fontWeight: "800", color: theme.colors.ink },
	summaryLabel: { color: theme.colors.muted, fontSize: 12 },
	filterRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
	filterChip: { paddingHorizontal: 16, paddingVertical: 9, backgroundColor: "#EBEEE8", borderRadius: 999 },
	filterChipActive: { backgroundColor: theme.colors.forest },
	filterLabel: { fontSize: 12, fontWeight: "700", color: theme.colors.muted },
	filterLabelActive: { color: theme.colors.white },
	separator: { height: 1, backgroundColor: theme.colors.line },
	empty: { alignItems: "flex-start", gap: 12, paddingVertical: 20 },
	emptyTitle: { color: theme.colors.ink, fontWeight: "800", fontSize: 16 },
	note: {
		padding: 15,
		borderRadius: 17,
		backgroundColor: theme.colors.amberSoft,
		flexDirection: "row",
		gap: 12,
		alignItems: "flex-start",
	},
	noteTitle: { color: "#7C5A2A", fontWeight: "800", fontSize: 13 },
	noteBody: { color: "#7C5A2A", fontSize: 12, lineHeight: 18 },
});
