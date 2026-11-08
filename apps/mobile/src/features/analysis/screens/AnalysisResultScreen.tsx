import { Ionicons } from "@expo/vector-icons";
import type { HealthResult, IdentifyResult } from "@plantingwise/schemas";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import { useState } from "react";
import { Image, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { Button, Card, Divider, Eyebrow, HelperText, IconBox, Pill, Screen, Wordmark } from "@/components/ui";
import { useGarden } from "@/features/garden/contexts/GardenContext";
import { theme, typography } from "@/theme/theme";

export default function AnalysisScreen() {
	const { currentAnalysis, savePlant, addJournal } = useGarden();
	const [displayName, setDisplayName] = useState("");
	const [addReminder, setAddReminder] = useState(true);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState("");

	if (!currentAnalysis) {
		return (
			<Screen contentStyle={styles.page}>
				<Wordmark />
				<Card>
					<Text style={styles.title}>No analysis to show yet.</Text>
					<Text style={styles.subtitle}>Choose a photo or explore a sample result first.</Text>
					<Button title="Start an analysis" icon="scan-outline" onPress={() => router.replace("/add-plant")} />
				</Card>
			</Screen>
		);
	}

	const result = currentAnalysis.result;
	const isSample = currentAnalysis.source === "sample";
	const imageUri = currentAnalysis.imageData || currentAnalysis.imageUrl;
	const confidenceTone = result.confidence === "high" ? "green" : result.confidence === "medium" ? "blue" : "amber";

	const handleSavePlant = async () => {
		if (result.mode !== "identify") return;
		setBusy(true);
		setError("");
		try {
			const plant = await savePlant(currentAnalysis, displayName || result.commonName, addReminder ? 7 : null);
			await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
			router.replace(`/plants/${plant.id}`);
		} catch (cause) {
			setError(cause instanceof Error ? cause.message : "We couldn't save this plant.");
		} finally {
			setBusy(false);
		}
	};

	const handleJournal = async () => {
		if (!currentAnalysis.plantId || result.mode !== "health") return;
		setBusy(true);
		setError("");
		try {
			const details = `${result.summary}\n\nPossible causes:\n${result.possibleCauses.map((cause) => `• ${cause.label}: ${cause.safeNextStep}`).join("\n")}\n\n${result.caveats.join(" ")}`;
			await addJournal(currentAnalysis.plantId, details, currentAnalysis.imageData);
			router.replace(`/plants/${currentAnalysis.plantId}`);
		} catch (cause) {
			setError(cause instanceof Error ? cause.message : "Couldn't save this health note.");
		} finally {
			setBusy(false);
		}
	};

	return (
		<Screen contentStyle={styles.page}>
			<View style={styles.header}>
				<Wordmark />
				<Pill
					label={isSample ? "SAMPLE RESULT" : "AI ANALYSIS"}
					tone={isSample ? "amber" : "green"}
					icon={isSample ? "flask-outline" : "sparkles-outline"}
				/>
			</View>
			<View style={{ gap: 8 }}>
				<Eyebrow>{result.mode === "identify" ? "PLANT IDENTIFICATION" : "PLANT HEALTH REVIEW"}</Eyebrow>
				<Text style={styles.title}>
					{result.mode === "identify" ? "A new leaf of knowledge." : "Let's look at the possibilities."}
				</Text>
				<Text style={styles.subtitle}>
					{isSample
						? "This is an illustrative sample response. It was not generated from your photo."
						: "Review these suggestions alongside what you can see on the plant. AI can be mistaken."}
				</Text>
			</View>

			<Card style={styles.resultHero}>
				{imageUri ? (
					<Image source={{ uri: imageUri }} resizeMode="cover" style={styles.resultImage} />
				) : (
					<View style={[styles.resultImage, styles.imageFallback]}>
						<Ionicons name="leaf" size={62} color={theme.colors.leaf} />
					</View>
				)}
				<View style={styles.resultTopline}>
					<Pill label={`${result.confidence} confidence`} tone={confidenceTone} />
					<Text style={styles.resultSmall}>{isSample ? "DEMO DATA" : (currentAnalysis.model ?? "VISION MODEL")}</Text>
				</View>
				<Text style={styles.plantName}>
					{result.mode === "identify"
						? (result as IdentifyResult).commonName
						: ((result as HealthResult).commonName ?? "Plant health review")}
				</Text>
				{result.mode === "identify" && result.scientificName ? (
					<Text style={styles.scientificName}>{result.scientificName}</Text>
				) : null}
				<Text style={styles.summary}>{result.summary}</Text>
				{isSample ? (
					<View style={styles.sampleNotice}>
						<Ionicons name="information-circle-outline" size={18} color="#8C5E18" />
						<Text style={styles.sampleNoticeText}>
							Sample mode is clearly labelled so a reviewer can explore without an AI key.
						</Text>
					</View>
				) : null}
			</Card>

			<View style={{ gap: 13 }}>
				<Text style={styles.sectionTitle}>{result.mode === "identify" ? "What we noticed" : "Observations"}</Text>
				<Card style={{ gap: 12 }}>
					{result.observations.map((observation, index) => (
						<View key={`${index}-${observation}`} style={styles.bulletRow}>
							<View style={styles.bullet} />
							<Text style={styles.body}>{observation}</Text>
						</View>
					))}
				</Card>
			</View>

			{result.mode === "identify" ? (
				<View style={{ gap: 13 }}>
					<Text style={styles.sectionTitle}>A care guide to start with</Text>
					<View style={styles.careGrid}>
						<CareCard icon="sunny-outline" title="Light" text={(result as IdentifyResult).care.light} />
						<CareCard icon="water-outline" title="Water" text={(result as IdentifyResult).care.watering} />
						<CareCard
							icon="cloud-outline"
							title="Humidity"
							text={(result as IdentifyResult).care.humidity ?? "No specific guidance available."}
						/>
						<CareCard
							icon="layers-outline"
							title="Soil"
							text={(result as IdentifyResult).care.soil ?? "Choose a suitable, well-draining mix."}
						/>
					</View>
				</View>
			) : (
				<View style={{ gap: 13 }}>
					<Text style={styles.sectionTitle}>Possible causes</Text>
					{(result as HealthResult).possibleCauses.map((cause, index) => (
						<Card key={`${cause.label}-${index}`} style={styles.causeCard}>
							<View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
								<View style={styles.causeNumber}>
									<Text style={styles.causeNumberText}>{index + 1}</Text>
								</View>
								<Text style={styles.causeTitle}>{cause.label}</Text>
							</View>
							<Text style={styles.body}>{cause.reasoning}</Text>
							<View style={styles.nextStep}>
								<IconBox name="checkmark-circle-outline" />
								<View style={{ flex: 1, gap: 4 }}>
									<Text style={styles.nextStepTitle}>A low-risk next step</Text>
									<Text style={styles.body}>{cause.safeNextStep}</Text>
								</View>
							</View>
						</Card>
					))}
				</View>
			)}

			<Card style={styles.caveatCard}>
				<View style={{ flexDirection: "row", alignItems: "center", gap: 9 }}>
					<Ionicons name="shield-checkmark-outline" size={20} color={theme.colors.forest} />
					<Text style={styles.caveatTitle}>Keep a curious, cautious eye</Text>
				</View>
				{result.caveats.map((caveat, index) => (
					<Text key={`${index}-${caveat}`} style={styles.caveatText}>
						• {caveat}
					</Text>
				))}
			</Card>

			{error ? <HelperText tone="error">{error}</HelperText> : null}
			{result.mode === "identify" ? (
				<Card style={styles.saveCard}>
					<Text style={styles.sectionTitle}>Make it part of your garden</Text>
					<View style={{ gap: 8 }}>
						<Text style={styles.fieldLabel}>What would you like to call it?</Text>
						<NameInput value={displayName} onChangeText={setDisplayName} placeholder={result.commonName} />
					</View>
					<Divider />
					<View style={styles.reminderRow}>
						<IconBox name="calendar-outline" />
						<View style={{ flex: 1, gap: 3 }}>
							<Text style={styles.reminderTitle}>Add a suggested watering check</Text>
							<Text style={styles.reminderBody}>
								A reminder to check the soil in 1 day, then adjust the routine to your conditions.
							</Text>
						</View>
						<Switch
							value={addReminder}
							onValueChange={setAddReminder}
							trackColor={{ false: "#CFD6CE", true: "#A4C2A4" }}
							thumbColor={addReminder ? theme.colors.forest : "#FFFFFF"}
						/>
					</View>
					<Button
						title="Save plant to my garden"
						icon="leaf-outline"
						onPress={() => void handleSavePlant()}
						loading={busy}
						testID="save-plant"
					/>
				</Card>
			) : (
				<Button
					title="Save review to plant journal"
					icon="book-outline"
					onPress={() => void handleJournal()}
					loading={busy}
					disabled={!currentAnalysis.plantId}
				/>
			)}
			<Button title="Start another analysis" variant="ghost" icon="refresh-outline" onPress={() => router.replace("/add-plant")} />
		</Screen>
	);
}

function NameInput({ value, onChangeText, placeholder }: { value: string; onChangeText: (value: string) => void; placeholder: string }) {
	return (
		<TextInput
			accessibilityLabel="Plant nickname"
			value={value}
			onChangeText={onChangeText}
			placeholder={placeholder}
			placeholderTextColor="#96A096"
			style={styles.nameInput}
			maxLength={80}
		/>
	);
}

function CareCard({ icon, title, text }: { icon: React.ComponentProps<typeof Ionicons>["name"]; title: string; text: string }) {
	return (
		<Card style={styles.careCard}>
			<IconBox name={icon} />
			<Text style={styles.careTitle}>{title}</Text>
			<Text style={styles.body}>{text}</Text>
		</Card>
	);
}

const styles = StyleSheet.create({
	page: { gap: 24, paddingTop: 20, maxWidth: 780 },
	header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
	title: { ...typography.title, color: theme.colors.ink },
	subtitle: { color: theme.colors.muted, fontSize: 13, lineHeight: 20 },
	resultHero: { padding: 12, gap: 14 },
	resultImage: { width: "100%", height: 250, borderRadius: 16, backgroundColor: theme.colors.sageLight },
	imageFallback: { alignItems: "center", justifyContent: "center" },
	resultTopline: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 4 },
	resultSmall: { color: "#9AA49A", fontSize: 9, letterSpacing: 0.8, fontWeight: "800", maxWidth: "55%" },
	plantName: { color: theme.colors.ink, fontSize: 25, lineHeight: 30, fontWeight: "800", letterSpacing: -0.5, paddingHorizontal: 4 },
	scientificName: { color: theme.colors.muted, fontSize: 13, fontStyle: "italic", paddingHorizontal: 4, marginTop: -8 },
	summary: { color: theme.colors.ink, fontSize: 14, lineHeight: 22, paddingHorizontal: 4, paddingBottom: 4 },
	sampleNotice: {
		flexDirection: "row",
		gap: 8,
		alignItems: "flex-start",
		backgroundColor: theme.colors.amberSoft,
		padding: 12,
		borderRadius: 12,
	},
	sampleNoticeText: { color: "#7C5A2A", fontSize: 12, lineHeight: 18, flex: 1 },
	sectionTitle: { color: theme.colors.ink, fontSize: 18, fontWeight: "800" },
	bulletRow: { flexDirection: "row", gap: 10, alignItems: "flex-start" },
	bullet: { width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.leaf, marginTop: 8 },
	body: { color: theme.colors.muted, fontSize: 13, lineHeight: 20, flex: 1 },
	careGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
	careCard: { flexGrow: 1, flexBasis: 230, gap: 9 },
	careTitle: { color: theme.colors.ink, fontWeight: "800", fontSize: 14 },
	causeCard: { gap: 12 },
	causeNumber: {
		width: 28,
		height: 28,
		borderRadius: 10,
		backgroundColor: theme.colors.sage,
		alignItems: "center",
		justifyContent: "center",
	},
	causeNumberText: { fontSize: 12, color: theme.colors.forest, fontWeight: "800" },
	causeTitle: { fontSize: 15, color: theme.colors.ink, fontWeight: "800", flex: 1 },
	nextStep: {
		padding: 12,
		backgroundColor: theme.colors.sageLight,
		borderRadius: 13,
		flexDirection: "row",
		alignItems: "flex-start",
		gap: 10,
	},
	nextStepTitle: { color: theme.colors.forest, fontSize: 12, fontWeight: "800" },
	caveatCard: { backgroundColor: "#F0F4EC", gap: 11 },
	caveatTitle: { color: theme.colors.forest, fontSize: 14, fontWeight: "800" },
	caveatText: { color: "#526B58", fontSize: 12, lineHeight: 18 },
	saveCard: { gap: 16, borderColor: "#D8E3D3", borderWidth: 1.5 },
	fieldLabel: { color: theme.colors.ink, fontSize: 13, fontWeight: "700" },
	nameInput: {
		height: 48,
		borderWidth: 1,
		borderColor: theme.colors.line,
		borderRadius: 13,
		paddingHorizontal: 13,
		backgroundColor: "#FBFCFA",
		color: theme.colors.ink,
		outlineStyle: "none" as never,
	},
	reminderRow: { flexDirection: "row", alignItems: "center", gap: 11 },
	reminderTitle: { color: theme.colors.ink, fontSize: 13, fontWeight: "800" },
	reminderBody: { color: theme.colors.muted, fontSize: 11, lineHeight: 17 },
});
