import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Button, Card, Divider, Eyebrow, HelperText, IconBox, Pill, Screen, SectionTitle, Wordmark } from "@/components/ui";
import { TaskRow } from "@/features/care/components/TaskRow";
import { useGarden } from "@/features/garden/contexts/GardenContext";
import { theme, typography } from "@/theme/theme";

export default function PlantDetailScreen() {
	const params = useLocalSearchParams<{ id: string }>();
	const id = String(params.id ?? "");
	const { plants, tasks, journalEntries, completeTask, deletePlant, addJournal } = useGarden();
	const plant = plants.find((candidate) => candidate.id === id);
	const [journalNote, setJournalNote] = useState("");
	const [savingJournal, setSavingJournal] = useState(false);
	const [journalError, setJournalError] = useState("");
	const plantTasks = tasks.filter((task) => task.plantId === id);
	const entries = journalEntries
		.filter((entry) => entry.plantId === id)
		.sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime());

	if (!plant) {
		return (
			<Screen contentStyle={styles.page}>
				<Wordmark />
				<Card style={styles.notFound}>
					<IconBox name="leaf-outline" />
					<Text style={styles.sectionTitle}>We couldn't find that plant.</Text>
					<Text style={styles.body}>It may have been removed or belong to a different garden.</Text>
					<Button title="Back to my garden" onPress={() => router.replace("/(tabs)/garden")} />
				</Card>
			</Screen>
		);
	}

	const imageUri = plant.imageData || plant.imageUrl;
	const askDelete = () => {
		const remove = async () => {
			try {
				await deletePlant(plant.id);
				router.replace("/(tabs)/garden");
			} catch {
				Alert.alert("Couldn't delete plant", "Please check your connection and try again.");
			}
		};
		Alert.alert("Remove this plant?", `This will remove ${plant.displayName} and its care tasks from this garden.`, [
			{ text: "Keep plant", style: "cancel" },
			{ text: "Remove", style: "destructive", onPress: () => void remove() },
		]);
	};

	const saveJournal = async () => {
		if (!journalNote.trim()) {
			setJournalError("Write a short observation first.");
			return;
		}
		setSavingJournal(true);
		setJournalError("");
		try {
			await addJournal(plant.id, journalNote.trim());
			setJournalNote("");
			await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
		} catch (cause) {
			setJournalError(cause instanceof Error ? cause.message : "Couldn't save the journal note.");
		} finally {
			setSavingJournal(false);
		}
	};

	return (
		<Screen contentStyle={styles.page}>
			<View style={styles.header}>
				<Wordmark />
				<Pressable onPress={() => router.back()} style={styles.backButton}>
					<Ionicons name="arrow-back" size={18} color={theme.colors.forest} />
					<Text style={styles.backText}>Back</Text>
				</Pressable>
			</View>
			<Card style={styles.heroCard}>
				{imageUri ? (
					<Image source={{ uri: imageUri }} resizeMode="cover" style={styles.heroImage} />
				) : (
					<View style={[styles.heroImage, styles.imageFallback]}>
						<Ionicons name="leaf" size={63} color={theme.colors.leaf} />
					</View>
				)}
				<View style={styles.heroCopy}>
					<Eyebrow>YOUR PLANT PROFILE</Eyebrow>
					<Text style={styles.title}>{plant.displayName}</Text>
					<Text style={styles.species}>
						{plant.commonName}
						{plant.scientificName && plant.scientificName !== plant.commonName ? ` · ${plant.scientificName}` : ""}
					</Text>
					<View style={styles.pills}>
						<Pill
							label={`${plant.confidence} confidence`}
							tone={plant.confidence === "high" ? "green" : plant.confidence === "medium" ? "blue" : "amber"}
						/>
						{plant.isDemo ? <Pill label="Sample plant" tone="neutral" /> : null}
					</View>
					<Text style={styles.summary}>{plant.summary}</Text>
					<View style={styles.primaryActions}>
						<Button
							title="Check plant health"
							icon="scan-outline"
							onPress={() => router.push({ pathname: "/add-plant", params: { mode: "health", plantId: plant.id } })}
						/>
						<Button title="Remove" icon="trash-outline" variant="ghost" compact onPress={askDelete} />
					</View>
				</View>
			</Card>

			<View style={{ gap: 13 }}>
				<SectionTitle title="Care guide" />
				<View style={styles.careGrid}>
					<CareDetail icon="sunny-outline" title="Light" content={plant.care.light} />
					<CareDetail icon="water-outline" title="Water" content={plant.care.watering} />
					<CareDetail icon="cloud-outline" title="Humidity" content={plant.care.humidity ?? "No specific guidance saved."} />
					<CareDetail icon="layers-outline" title="Soil" content={plant.care.soil ?? "Use a suitable, well-draining mix."} />
				</View>
				<HelperText>
					Care is a starting point. Check the soil and observe how your plant responds to your home environment.
				</HelperText>
			</View>

			<View style={{ gap: 13 }}>
				<SectionTitle title="Care tasks" action="View all" onAction={() => router.push("/(tabs)/care")} />
				<Card>
					{plantTasks.length ? (
						plantTasks.map((task, index) => (
							<View key={task.id}>
								<TaskRow task={{ ...task, plantName: plant.displayName }} onComplete={() => void completeTask(task.id)} />
								{index < plantTasks.length - 1 ? <Divider /> : null}
							</View>
						))
					) : (
						<View style={styles.emptyState}>
							<IconBox name="calendar-outline" />
							<View style={{ flex: 1, gap: 4 }}>
								<Text style={styles.emptyTitle}>No care tasks yet</Text>
								<Text style={styles.body}>
									Add reminders in the care calendar when you decide on a routine for this plant.
								</Text>
							</View>
						</View>
					)}
				</Card>
			</View>

			<View style={{ gap: 13 }}>
				<SectionTitle title="Growth journal" />
				<Card style={{ gap: 12 }}>
					<Text style={styles.body}>
						Small observations help you notice changes over time. Record a new leaf, a repot, or anything you want to remember.
					</Text>
					<TextInput
						testID="journal-note"
						accessibilityLabel="Journal observation"
						value={journalNote}
						onChangeText={setJournalNote}
						multiline
						placeholder="What have you noticed today?"
						placeholderTextColor="#96A096"
						style={styles.journalInput}
						maxLength={2000}
					/>
					{journalError ? <HelperText tone="error">{journalError}</HelperText> : null}
					<Button
						title="Add journal note"
						icon="book-outline"
						onPress={() => void saveJournal()}
						loading={savingJournal}
						testID="save-journal-note"
					/>
					{entries.length ? (
						<View style={styles.entriesList}>
							<Divider />
							{entries.map((entry) => (
								<View key={entry.id} style={styles.entryRow}>
									<View style={styles.entryDot}>
										<Ionicons name="leaf-outline" size={14} color={theme.colors.forest} />
									</View>
									<View style={{ flex: 1, gap: 4 }}>
										<Text style={styles.entryDate}>
											{new Date(entry.entryDate).toLocaleDateString(undefined, {
												day: "numeric",
												month: "short",
												year: "numeric",
											})}
										</Text>
										<Text style={styles.entryNote}>{entry.note}</Text>
									</View>
								</View>
							))}
						</View>
					) : null}
				</Card>
			</View>
			<Text style={styles.footer}>PLANTINGWISE · GROW A LITTLE WISER</Text>
		</Screen>
	);
}

function CareDetail({ icon, title, content }: { icon: React.ComponentProps<typeof Ionicons>["name"]; title: string; content: string }) {
	return (
		<Card style={styles.careCard}>
			<IconBox name={icon} />
			<Text style={styles.careTitle}>{title}</Text>
			<Text style={styles.body}>{content}</Text>
		</Card>
	);
}

const styles = StyleSheet.create({
	page: { gap: 24, paddingTop: 20, maxWidth: 880 },
	header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
	backButton: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
		paddingHorizontal: 12,
		paddingVertical: 9,
		borderRadius: 12,
		backgroundColor: theme.colors.sageLight,
	},
	backText: { color: theme.colors.forest, fontWeight: "700", fontSize: 12 },
	heroCard: { padding: 13, gap: 18 },
	heroImage: { width: "100%", height: 320, borderRadius: 16, backgroundColor: theme.colors.sageLight },
	imageFallback: { alignItems: "center", justifyContent: "center" },
	heroCopy: { paddingHorizontal: 5, paddingBottom: 4, gap: 11 },
	title: { ...typography.title, color: theme.colors.ink },
	species: { color: theme.colors.muted, fontSize: 13, fontStyle: "italic", marginTop: -7 },
	pills: { flexDirection: "row", flexWrap: "wrap", gap: 7 },
	summary: { color: theme.colors.ink, fontSize: 14, lineHeight: 22 },
	primaryActions: { flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 10, marginTop: 4 },
	careGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
	careCard: { flexGrow: 1, flexBasis: 230, gap: 9 },
	careTitle: { color: theme.colors.ink, fontWeight: "800", fontSize: 14 },
	body: { color: theme.colors.muted, fontSize: 13, lineHeight: 20 },
	emptyState: { flexDirection: "row", gap: 12, alignItems: "center", paddingVertical: 8 },
	emptyTitle: { color: theme.colors.ink, fontSize: 14, fontWeight: "800" },
	journalInput: {
		minHeight: 96,
		borderWidth: 1,
		borderColor: theme.colors.line,
		borderRadius: 13,
		padding: 13,
		color: theme.colors.ink,
		backgroundColor: "#FBFCFA",
		textAlignVertical: "top",
	},
	entriesList: { gap: 15 },
	entryRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
	entryDot: {
		width: 30,
		height: 30,
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 10,
		backgroundColor: theme.colors.sageLight,
	},
	entryDate: { color: theme.colors.leaf, fontSize: 11, fontWeight: "800" },
	entryNote: { color: theme.colors.ink, fontSize: 12, lineHeight: 19 },
	footer: { color: "#9AA49A", fontSize: 10, letterSpacing: 1.1, fontWeight: "700", textAlign: "center" },
	notFound: { gap: 13, alignItems: "flex-start" },
	sectionTitle: { color: theme.colors.ink, fontSize: 18, fontWeight: "800" },
});
