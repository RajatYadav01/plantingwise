import type { Plant } from "@plantingwise/types";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { theme } from "@/theme/theme";
import { AppIcon } from "../../../components/AppIcon";
import { Pill, PlantImage } from "../../../components/ui";

export function PlantCard({ plant, taskLabel, onPress }: { plant: Plant; taskLabel?: string; onPress: () => void }) {
	const uri = plant.imageData || plant.imageUrl;
	return (
		<Pressable
			onPress={onPress}
			accessibilityRole="button"
			accessibilityLabel={`Open ${plant.displayName}`}
			style={({ pressed }) => [styles.card, pressed && { opacity: 0.85 }]}
		>
			<View style={styles.imageWrap}>
				<PlantImage uri={uri} size="large" />
				{plant.isDemo ? (
					<View style={styles.sampleBadge}>
						<Text style={styles.sampleBadgeText}>SAMPLE</Text>
					</View>
				) : null}
			</View>
			<View style={styles.content}>
				<Text style={styles.name} numberOfLines={1}>
					{plant.displayName}
				</Text>
				<Text style={styles.species} numberOfLines={1}>
					{plant.commonName}
				</Text>
				<View style={styles.footer}>
					<Pill label={taskLabel ?? "Care guide"} tone={taskLabel ? "amber" : "green"} />
					<AppIcon name="arrow-forward" size={16} color={theme.colors.leaf} />
				</View>
			</View>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	card: {
		backgroundColor: theme.colors.white,
		borderRadius: 20,
		borderWidth: 1,
		borderColor: theme.colors.line,
		overflow: "hidden",
		flexBasis: 210,
		flexGrow: 1,
		minWidth: 155,
		maxWidth: 340,
	},
	imageWrap: { padding: 10, position: "relative", alignItems: "stretch" },
	content: { paddingHorizontal: 14, paddingBottom: 15, paddingTop: 2, gap: 5 },
	name: { fontSize: 16, fontWeight: "800", color: theme.colors.ink },
	species: { fontSize: 12, color: theme.colors.muted },
	footer: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 7 },
	sampleBadge: {
		position: "absolute",
		top: 18,
		left: 18,
		backgroundColor: "rgba(255,255,255,0.93)",
		borderRadius: 20,
		paddingHorizontal: 8,
		paddingVertical: 4,
	},
	sampleBadgeText: { color: theme.colors.forest, fontSize: 9, fontWeight: "900", letterSpacing: 0.8 },
});
