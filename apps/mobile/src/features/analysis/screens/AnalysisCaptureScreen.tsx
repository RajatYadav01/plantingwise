import { Ionicons } from "@expo/vector-icons";
import { sampleHealthResult, sampleIdentification } from "@plantingwise/constants";
import type { AnalysisMode } from "@plantingwise/schemas";
import * as Haptics from "expo-haptics";
import * as ImageManipulator from "expo-image-manipulator";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Image, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Button, Card, Eyebrow, FieldLabel, HelperText, Pill, Screen, Wordmark } from "@/components/ui";
import { analysisService } from "@/features/analysis/services/analysis.service";
import { useGarden } from "@/features/garden/contexts/GardenContext";
import { ApiError } from "@/lib/api";
import { theme, typography } from "@/theme/theme";

const fallbackImage = "https://images.unsplash.com/photo-1497250681960-ef046c08a56e?auto=format&fit=crop&w=900&q=85";

export default function AddPlantScreen() {
	const params = useLocalSearchParams<{ mode?: string; plantId?: string }>();
	const mode: AnalysisMode = params.mode === "health" ? "health" : "identify";
	const { plants, setCurrentAnalysis } = useGarden();
	const existingPlant = plants.find((plant) => plant.id === params.plantId);
	const [imageData, setImageData] = useState<string | null>(null);
	const [imageUri, setImageUri] = useState<string | null>(null);
	const [context, setContext] = useState("");
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState("");
	const [notice, setNotice] = useState("");

	const processImage = async (uri: string) => {
		const compressed = await ImageManipulator.manipulateAsync(uri, [{ resize: { width: 900 } }], {
			compress: 0.62,
			format: ImageManipulator.SaveFormat.JPEG,
			base64: true,
		});
		if (!compressed.base64) throw new Error("Couldn't prepare that photo. Please choose another image.");
		const dataUri = `data:image/jpeg;base64,${compressed.base64}`;
		if (dataUri.length > 4_400_000) throw new Error("That photo is still too large. Try a smaller image.");
		setImageData(dataUri);
		setImageUri(dataUri);
	};

	const choosePhoto = async () => {
		setError("");
		setNotice("");
		try {
			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ["images"],
				allowsEditing: true,
				aspect: [4, 4],
				quality: 0.6,
			});
			if (result.canceled || !result.assets[0]) return;
			await processImage(result.assets[0].uri);
			await Haptics.selectionAsync();
		} catch (cause) {
			setError(cause instanceof Error ? cause.message : "Unable to open the photo library.");
		}
	};

	const takePhoto = async () => {
		setError("");
		setNotice("");
		try {
			const permission = await ImagePicker.requestCameraPermissionsAsync();
			if (!permission.granted) {
				setError("Camera access is off. Enable it in your device settings, or choose a photo from your library.");
				return;
			}
			const result = await ImagePicker.launchCameraAsync({ allowsEditing: true, aspect: [4, 4], quality: 0.62 });
			if (result.canceled || !result.assets[0]) return;
			await processImage(result.assets[0].uri);
		} catch (cause) {
			setError(cause instanceof Error ? cause.message : "Unable to open the camera.");
		}
	};

	const runLiveAnalysis = async () => {
		if (!imageData) {
			setError("Choose a plant photo first. You can also explore the app with a sample result.");
			return;
		}
		setBusy(true);
		setError("");
		setNotice("");
		try {
			const response = await analysisService.analyze({
				mode,
				imageData,
				context: context.trim(),
				...(existingPlant ? { plantCommonName: existingPlant.commonName } : {}),
			});
			setCurrentAnalysis({
				mode,
				result: response.result,
				imageData,
				source: "live",
				model: response.model,
				plantId: existingPlant?.id,
			});
			await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
			router.push("/analysis");
		} catch (cause) {
			setError(cause instanceof ApiError ? cause.message : "The analysis couldn't be completed. Please try again.");
		} finally {
			setBusy(false);
		}
	};

	const useSample = async () => {
		setBusy(true);
		setError("");
		let result = mode === "health" ? sampleHealthResult : sampleIdentification;
		try {
			const response = await analysisService.getSample(mode);
			result = response.result;
		} catch {
			// Sample analysis is intentionally available without a backend or model key.
		}
		setCurrentAnalysis({
			mode,
			result,
			imageData: imageData ?? null,
			imageUrl: imageData ? undefined : (existingPlant?.imageUrl ?? fallbackImage),
			source: "sample",
			plantId: existingPlant?.id,
		});
		setBusy(false);
		router.push("/analysis");
	};

	return (
		<Screen contentStyle={styles.page}>
			<View style={styles.topline}>
				<Wordmark />
				<Pressable onPress={() => router.back()} style={styles.close}>
					<Ionicons name="close" size={21} color={theme.colors.ink} />
				</Pressable>
			</View>
			<View style={{ gap: 9 }}>
				<Eyebrow>{mode === "health" ? "A CLOSER LOOK" : "MEET A NEW GREEN FRIEND"}</Eyebrow>
				<Text style={styles.title}>{mode === "health" ? "How is your plant feeling?" : "Let's get to know your plant."}</Text>
				<Text style={styles.subtitle}>
					{mode === "health"
						? `Add a clear photo of ${existingPlant?.displayName ?? "your plant"} and describe what you've noticed.`
						: "A photo helps us suggest a likely identity and a care guide. You stay in control before saving anything."}
				</Text>
			</View>

			<Card style={styles.uploadCard}>
				{imageUri ? (
					<View style={styles.previewWrap}>
						<Image source={{ uri: imageUri }} style={styles.preview} resizeMode="cover" />
						<Pressable
							onPress={() => {
								setImageUri(null);
								setImageData(null);
							}}
							style={styles.removeImage}
							accessibilityLabel="Remove selected photo"
						>
							<Ionicons name="close" size={18} color={theme.colors.ink} />
						</Pressable>
					</View>
				) : (
					<View style={styles.uploadEmpty}>
						<View style={styles.uploadIcon}>
							<Ionicons name="images-outline" size={30} color={theme.colors.forest} />
						</View>
						<Text style={styles.uploadTitle}>A clear photo works best</Text>
						<Text style={styles.uploadSubtitle}>
							Include the leaves and, if possible, the whole plant. Natural light helps.
						</Text>
						<View style={styles.photoActions}>
							<Button title="Choose photo" icon="image-outline" onPress={() => void choosePhoto()} />
							<Button
								title="Use camera"
								icon="camera-outline"
								variant="secondary"
								onPress={() => void takePhoto()}
								disabled={Platform.OS === "web"}
							/>
						</View>
						{Platform.OS === "web" ? (
							<HelperText>
								On the web demo, use your browser's photo picker. Camera capture is available in the native app.
							</HelperText>
						) : null}
					</View>
				)}
				{imageUri ? (
					<View style={styles.selectedInfo}>
						<Pill label="Photo ready" icon="checkmark-circle-outline" />
						<Button title="Change photo" compact variant="secondary" onPress={() => void choosePhoto()} />
					</View>
				) : null}
			</Card>

			<View style={{ gap: 8 }}>
				<FieldLabel>{mode === "health" ? "What have you noticed? (optional)" : "Anything we should know? (optional)"}</FieldLabel>
				<TextInput
					testID="analysis-context"
					accessibilityLabel="Additional plant observations"
					value={context}
					onChangeText={setContext}
					multiline
					placeholder={
						mode === "health"
							? "For example: two lower leaves are turning yellow..."
							: "For example: it's near a north-facing window..."
					}
					placeholderTextColor="#96A096"
					style={styles.textArea}
					maxLength={1000}
				/>
				<Text style={styles.charCount}>{context.length}/1000</Text>
			</View>

			{error ? (
				<View style={styles.errorBox}>
					<Ionicons name="alert-circle-outline" size={19} color={theme.colors.red} />
					<Text style={styles.errorText}>{error}</Text>
				</View>
			) : null}
			{notice ? <HelperText>{notice}</HelperText> : null}

			<Button
				title={mode === "health" ? "Review possible causes" : "Identify this plant"}
				icon="sparkles"
				onPress={() => void runLiveAnalysis()}
				loading={busy}
				testID="run-live-analysis"
			/>
			<View style={styles.sampleDivider}>
				<View style={styles.line} />
				<Text style={styles.sampleDividerText}>OR EXPLORE THE DEMO</Text>
				<View style={styles.line} />
			</View>
			<Button
				title="Use a sample result"
				icon="flask-outline"
				variant="secondary"
				onPress={() => void useSample()}
				disabled={busy}
				testID="use-sample-analysis"
			/>
			<Text style={styles.disclaimer}>
				AI-generated suggestions can be wrong. Symptom reviews show possible causes, not a definitive diagnosis. Your photo is sent
				to the configured AI service only when you request a live analysis.
			</Text>
		</Screen>
	);
}

const styles = StyleSheet.create({
	page: { gap: 20, paddingTop: 20, maxWidth: 760 },
	topline: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
	close: {
		width: 39,
		height: 39,
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 13,
		backgroundColor: theme.colors.white,
		borderWidth: 1,
		borderColor: theme.colors.line,
	},
	title: { ...typography.title, color: theme.colors.ink },
	subtitle: { color: theme.colors.muted, fontSize: 14, lineHeight: 21 },
	uploadCard: { padding: 12 },
	uploadEmpty: {
		minHeight: 230,
		borderRadius: 17,
		backgroundColor: "#F4F7F1",
		borderWidth: 1,
		borderColor: "#D9E4D5",
		borderStyle: "dashed",
		alignItems: "center",
		justifyContent: "center",
		gap: 10,
		padding: 22,
	},
	uploadIcon: {
		width: 57,
		height: 57,
		borderRadius: 19,
		backgroundColor: theme.colors.sage,
		alignItems: "center",
		justifyContent: "center",
	},
	uploadTitle: { color: theme.colors.ink, fontSize: 16, fontWeight: "800" },
	uploadSubtitle: { color: theme.colors.muted, fontSize: 12, lineHeight: 18, textAlign: "center", maxWidth: 360 },
	photoActions: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 8, marginTop: 3 },
	previewWrap: {
		position: "relative",
		alignItems: "center",
		backgroundColor: theme.colors.sageLight,
		borderRadius: 15,
		overflow: "hidden",
	},
	preview: { width: "100%", height: 300, borderRadius: 15, maxWidth: 500 },
	removeImage: {
		position: "absolute",
		top: 12,
		right: 12,
		backgroundColor: "rgba(255,255,255,0.94)",
		width: 36,
		height: 36,
		borderRadius: 18,
		alignItems: "center",
		justifyContent: "center",
	},
	selectedInfo: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 5, paddingTop: 8 },
	textArea: {
		minHeight: 100,
		borderWidth: 1,
		borderColor: theme.colors.line,
		backgroundColor: theme.colors.white,
		borderRadius: 14,
		padding: 14,
		color: theme.colors.ink,
		fontSize: 14,
		lineHeight: 21,
		textAlignVertical: "top",
	},
	charCount: { color: theme.colors.muted, fontSize: 11, textAlign: "right" },
	errorBox: {
		backgroundColor: theme.colors.redSoft,
		borderRadius: 13,
		padding: 13,
		flexDirection: "row",
		gap: 9,
		alignItems: "flex-start",
	},
	errorText: { flex: 1, color: theme.colors.red, fontSize: 12, lineHeight: 18 },
	sampleDivider: { flexDirection: "row", alignItems: "center", gap: 10 },
	line: { height: 1, backgroundColor: theme.colors.line, flex: 1 },
	sampleDividerText: { color: "#9AA49A", fontSize: 9, fontWeight: "800", letterSpacing: 1.1 },
	disclaimer: { color: theme.colors.muted, fontSize: 11, lineHeight: 17, textAlign: "center", paddingHorizontal: 8 },
});
