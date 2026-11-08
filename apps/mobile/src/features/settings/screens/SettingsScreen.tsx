import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button, Card, Divider, Eyebrow, HelperText, IconBox, Screen, Wordmark } from "@/components/ui";
import { useGarden } from "@/features/garden/contexts/GardenContext";
import { getApiBaseUrl } from "@/lib/api";
import { theme, typography } from "@/theme/theme";

export default function SettingsScreen() {
	const { user, plants, tasks, journalEntries, logout } = useGarden();
	const [busy, setBusy] = useState(false);
	const [message, setMessage] = useState("");
	const handleLogout = async () => {
		setBusy(true);
		setMessage("");
		try {
			await logout();
			setMessage("Signed out. This device is back in sample mode.");
		} catch {
			setMessage("You were signed out locally, but the server could not be reached.");
		} finally {
			setBusy(false);
		}
	};

	return (
		<Screen contentStyle={styles.page}>
			<Wordmark />
			<View style={{ gap: 8 }}>
				<Eyebrow>YOUR SPACE</Eyebrow>
				<Text style={styles.title}>A garden that grows with you.</Text>
				<Text style={styles.subtitle}>Manage your account and understand how Plantingwise handles your data.</Text>
			</View>
			<Card style={styles.profileCard}>
				<View style={styles.profileTop}>
					<View style={styles.avatar}>
						<Ionicons name={user ? "person" : "leaf"} size={25} color={theme.colors.forest} />
					</View>
					<View style={{ flex: 1, gap: 4 }}>
						<Text style={styles.profileTitle}>{user?.name ?? "Exploring Plantingwise"}</Text>
						<Text style={styles.profileSubtitle}>{user?.email ?? "Sample garden · local device storage"}</Text>
					</View>
					<View style={[styles.dot, { backgroundColor: user ? theme.colors.leaf : theme.colors.amber }]} />
				</View>
				<Divider />
				{user ? (
					<View style={styles.metrics}>
						<View>
							<Text style={styles.metricValue}>{plants.length}</Text>
							<Text style={styles.metricLabel}>Cloud plants</Text>
						</View>
						<View>
							<Text style={styles.metricValue}>{tasks.length}</Text>
							<Text style={styles.metricLabel}>Care tasks</Text>
						</View>
						<View>
							<Text style={styles.metricValue}>{journalEntries.length}</Text>
							<Text style={styles.metricLabel}>Journal notes</Text>
						</View>
					</View>
				) : (
					<>
						<Text style={styles.body}>
							Your sample garden works without an account. Create an account to sync your own plants and care tasks to a database.
						</Text>
						<Button title="Sign in or create account" icon="person-circle-outline" onPress={() => router.push("/auth")} />
					</>
				)}
				{user ? (
					<Button
						title="Sign out"
						icon="log-out-outline"
						variant="secondary"
						loading={busy}
						onPress={() => void handleLogout()}
					/>
				) : null}
				{message ? <HelperText>{message}</HelperText> : null}
			</Card>
			<View style={{ gap: 12 }}>
				<Text style={styles.sectionHeading}>The details that matter</Text>
				<InfoRow
					icon="sparkles-outline"
					title="AI with honest caveats"
					body="Plant identification and symptom reviews are suggestions. Always check your plant, soil and growing conditions."
				/>
				<InfoRow
					icon="shield-checkmark-outline"
					title="Private by design"
					body="Saved account records are owner-scoped. Sessions use a signed JWT in an HttpOnly cookie; passwords are hashed server-side."
				/>
				<InfoRow
					icon="image-outline"
					title="Photo handling"
					body="Selected photos are sent to the configured AI provider for analysis. Small compressed image previews may be saved with plants or journal entries."
				/>
				<InfoRow
					icon="cloud-outline"
					title="Demo and cloud data"
					body="The sample garden is stored locally on this device. Signing in switches to your account's records."
				/>
			</View>
			<Card style={styles.technicalCard}>
				<Text style={styles.technicalTitle}>Demo diagnostics</Text>
				<View style={styles.diagnosticRow}>
					<Text style={styles.diagnosticLabel}>API endpoint</Text>
					<Text style={styles.diagnosticValue} numberOfLines={1}>
						{getApiBaseUrl()}
					</Text>
				</View>
				<View style={styles.diagnosticRow}>
					<Text style={styles.diagnosticLabel}>Session</Text>
					<Text style={styles.diagnosticValue}>{user ? "Signed in" : "Sample mode"}</Text>
				</View>
				<View style={styles.diagnosticRow}>
					<Text style={styles.diagnosticLabel}>Data</Text>
					<Text style={styles.diagnosticValue}>{user ? "PostgreSQL database" : "Local device storage"}</Text>
				</View>
				<HelperText>
					For production, serve the API through the same site or configure HTTPS, exact CORS origins and Secure SameSite=None
					cookies for a cross-site frontend/API.
				</HelperText>
			</Card>
			<Text style={styles.footer}>PLANTINGWISE · VERSION 1.0.0 · DEMO</Text>
		</Screen>
	);
}

function InfoRow({ icon, title, body }: { icon: React.ComponentProps<typeof Ionicons>["name"]; title: string; body: string }) {
	return (
		<View style={styles.infoRow}>
			<IconBox name={icon} />
			<View style={{ flex: 1, gap: 5 }}>
				<Text style={styles.infoTitle}>{title}</Text>
				<Text style={styles.body}>{body}</Text>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	page: { gap: 25, paddingTop: 22 },
	title: { ...typography.title, color: theme.colors.ink },
	subtitle: { color: theme.colors.muted, fontSize: 14, lineHeight: 21 },
	profileCard: { padding: 20, gap: 17 },
	profileTop: { flexDirection: "row", alignItems: "center", gap: 13 },
	avatar: { width: 53, height: 53, borderRadius: 18, backgroundColor: theme.colors.sage, alignItems: "center", justifyContent: "center" },
	profileTitle: { fontWeight: "800", color: theme.colors.ink, fontSize: 17 },
	profileSubtitle: { color: theme.colors.muted, fontSize: 12 },
	dot: { width: 9, height: 9, borderRadius: 6 },
	metrics: { flexDirection: "row", justifyContent: "space-around" },
	metricValue: { fontSize: 21, color: theme.colors.ink, fontWeight: "800", textAlign: "center" },
	metricLabel: { fontSize: 11, color: theme.colors.muted, marginTop: 4 },
	body: { color: theme.colors.muted, fontSize: 13, lineHeight: 20 },
	sectionHeading: { color: theme.colors.ink, fontSize: 18, fontWeight: "800" },
	infoRow: { flexDirection: "row", alignItems: "flex-start", gap: 13, paddingVertical: 7 },
	infoTitle: { color: theme.colors.ink, fontWeight: "800", fontSize: 14 },
	technicalCard: { gap: 13, backgroundColor: "#F0F3ED" },
	technicalTitle: { fontSize: 14, fontWeight: "800", color: theme.colors.forest },
	diagnosticRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
	diagnosticLabel: { color: theme.colors.muted, fontSize: 12 },
	diagnosticValue: { color: theme.colors.ink, fontSize: 12, fontWeight: "700", maxWidth: "66%" },
	footer: { color: "#9AA49A", fontSize: 10, letterSpacing: 1.1, fontWeight: "700", textAlign: "center" },
});
