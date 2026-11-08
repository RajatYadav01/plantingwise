import { Ionicons } from "@expo/vector-icons";
import type { CareTask } from "@plantingwise/types";
import { formatRelativeDueDate, getTaskStatus } from "@plantingwise/types";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "@/theme/theme";
import { Button, IconBox, Pill } from "../../../components/ui";

export function TaskRow({ task, onComplete, compact = false }: { task: CareTask; onComplete: () => void; compact?: boolean }) {
	const status = getTaskStatus(task);
	const icon =
		task.type === "water"
			? "water-outline"
			: task.type === "fertilise"
				? "leaf-outline"
				: task.type === "repot"
					? "cube-outline"
					: "eye-outline";
	const title = task.title;
	return (
		<View style={[styles.row, compact && styles.rowCompact]}>
			<IconBox name={icon} tint={status === "due" ? "amber" : status === "completed" ? "blue" : "green"} />
			<View style={styles.copy}>
				<Text style={[styles.title, status === "completed" && styles.completed]} numberOfLines={1}>
					{title}
				</Text>
				<Text style={styles.meta} numberOfLines={1}>
					{task.plantName ?? "Plant"} · {status === "completed" ? "Completed" : formatRelativeDueDate(task.dueAt)}
				</Text>
				{!compact && status !== "completed" ? (
					<View style={styles.badgeLine}>
						<Pill label={status === "due" ? "Needs attention" : "On your list"} tone={status === "due" ? "amber" : "neutral"} />
					</View>
				) : null}
			</View>
			{status === "completed" ? (
				<Ionicons name="checkmark-circle" size={23} color={theme.colors.leaf} />
			) : (
				<Button
					title={compact ? "Done" : "Mark done"}
					compact
					onPress={onComplete}
					variant="secondary"
					testID={`complete-task-${task.id}`}
				/>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
		paddingVertical: 13,
		borderBottomWidth: 1,
		borderBottomColor: theme.colors.line,
	},
	rowCompact: { paddingVertical: 10 },
	copy: { flex: 1, gap: 4, minWidth: 0 },
	title: { color: theme.colors.ink, fontSize: 14, fontWeight: "700" },
	completed: { color: theme.colors.muted, textDecorationLine: "line-through" },
	meta: { color: theme.colors.muted, fontSize: 12 },
	badgeLine: { marginTop: 4 },
});
