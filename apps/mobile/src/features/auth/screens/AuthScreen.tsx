import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Button, Card, FieldLabel, HelperText, Screen, Wordmark } from "@/components/ui";
import { useGarden } from "@/features/garden/contexts/GardenContext";
import { ApiError } from "@/lib/api";
import { theme, typography } from "@/theme/theme";

export default function AuthScreen() {
	const { login, register } = useGarden();
	const [mode, setMode] = useState<"login" | "register">("register");
	const [name, setName] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [busy, setBusy] = useState(false);
	const [error, setError] = useState("");

	const submit = async () => {
		setError("");
		if (mode === "register" && name.trim().length < 2) {
			setError("Enter your name (at least 2 characters).");
			return;
		}
		if (!email.includes("@")) {
			setError("Enter a valid email address.");
			return;
		}
		if (mode === "register" && password.length < 10) {
			setError("Use a password with at least 10 characters.");
			return;
		}
		setBusy(true);
		try {
			if (mode === "register") await register(name.trim(), email.trim(), password);
			else await login(email.trim(), password);
			router.replace("/(tabs)/settings");
		} catch (cause) {
			const message =
				cause instanceof ApiError ? cause.message : "We couldn't complete that request. Check the API configuration and try again.";
			setError(message);
		} finally {
			setBusy(false);
		}
	};

	return (
		<KeyboardAvoidingView
			style={{ flex: 1, backgroundColor: theme.colors.canvas }}
			behavior={Platform.OS === "ios" ? "padding" : undefined}
		>
			<Screen contentStyle={styles.page}>
				<View style={styles.topLine}>
					<Wordmark />
					<Pressable onPress={() => router.back()} style={styles.close} accessibilityLabel="Close sign in">
						<Ionicons name="close" size={21} color={theme.colors.ink} />
					</Pressable>
				</View>
				<View style={styles.hero}>
					<View style={styles.heroIcon}>
						<Ionicons name="leaf" size={28} color={theme.colors.white} />
					</View>
					<Text style={styles.title}>{mode === "register" ? "Make room to grow." : "Welcome back."}</Text>
					<Text style={styles.subtitle}>
						{mode === "register"
							? "Create an account to keep your garden and care tasks in sync."
							: "Sign in to pick up where your plants left off."}
					</Text>
				</View>
				<Card style={styles.formCard}>
					<View style={styles.modeSwitch}>
						<Pressable
							onPress={() => {
								setMode("register");
								setError("");
							}}
							style={[styles.modeButton, mode === "register" && styles.modeActive]}
						>
							<Text style={[styles.modeText, mode === "register" && styles.modeTextActive]}>Create account</Text>
						</Pressable>
						<Pressable
							onPress={() => {
								setMode("login");
								setError("");
							}}
							style={[styles.modeButton, mode === "login" && styles.modeActive]}
						>
							<Text style={[styles.modeText, mode === "login" && styles.modeTextActive]}>Sign in</Text>
						</Pressable>
					</View>
					{mode === "register" ? (
						<View>
							<FieldLabel>Your name</FieldLabel>
							<TextInput
								testID="auth-name"
								accessibilityLabel="Your name"
								value={name}
								onChangeText={setName}
								placeholder="e.g. John Doe"
								placeholderTextColor="#98A198"
								autoCapitalize="words"
								style={styles.input}
							/>
						</View>
					) : null}
					<View>
						<FieldLabel>Email address</FieldLabel>
						<TextInput
							testID="auth-email"
							accessibilityLabel="Email address"
							value={email}
							onChangeText={setEmail}
							placeholder="you@example.com"
							placeholderTextColor="#98A198"
							keyboardType="email-address"
							autoCapitalize="none"
							autoCorrect={false}
							style={styles.input}
						/>
					</View>
					<View>
						<FieldLabel>Password</FieldLabel>
						<View style={styles.passwordWrap}>
							<TextInput
								testID="auth-password"
								accessibilityLabel="Password"
								value={password}
								onChangeText={setPassword}
								placeholder={mode === "register" ? "At least 10 characters" : "Your password"}
								placeholderTextColor="#98A198"
								secureTextEntry={!showPassword}
								autoCapitalize="none"
								style={[styles.input, styles.passwordInput]}
							/>
							<Pressable
								onPress={() => setShowPassword((value) => !value)}
								style={styles.eyeButton}
								accessibilityLabel={showPassword ? "Hide password" : "Show password"}
							>
								<Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={19} color={theme.colors.muted} />
							</Pressable>
						</View>
					</View>
					{error ? <HelperText tone="error">{error}</HelperText> : null}
					<Button
						title={mode === "register" ? "Create my garden" : "Sign in"}
						icon="arrow-forward"
						onPress={() => void submit()}
						loading={busy}
						testID="auth-submit"
					/>
					<Text style={styles.smallNote}>
						Passwords are hashed on the server. Your signed session is stored in an HttpOnly cookie, not browser JavaScript
						storage.
					</Text>
				</Card>
				<Text style={styles.backupNote}>
					Just exploring? Close this screen to return to the sample garden. No account is required for the demo version.
				</Text>
			</Screen>
		</KeyboardAvoidingView>
	);
}

const styles = StyleSheet.create({
	page: { gap: 28, paddingTop: 20, maxWidth: 650 },
	topLine: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
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
	hero: { alignItems: "flex-start", gap: 12 },
	heroIcon: {
		width: 55,
		height: 55,
		borderRadius: 18,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: theme.colors.forest,
	},
	title: { ...typography.title, color: theme.colors.ink },
	subtitle: { color: theme.colors.muted, fontSize: 14, lineHeight: 22, maxWidth: 430 },
	formCard: { padding: 22, gap: 17 },
	modeSwitch: { backgroundColor: "#EFF2EC", borderRadius: 13, padding: 4, flexDirection: "row", gap: 4 },
	modeButton: { flex: 1, paddingVertical: 10, alignItems: "center", borderRadius: 10 },
	modeActive: { backgroundColor: theme.colors.white },
	modeText: { color: theme.colors.muted, fontWeight: "700", fontSize: 12 },
	modeTextActive: { color: theme.colors.forest },
	input: {
		minHeight: 49,
		borderWidth: 1,
		borderColor: theme.colors.line,
		backgroundColor: "#FBFCFA",
		borderRadius: 13,
		paddingHorizontal: 14,
		color: theme.colors.ink,
		fontSize: 14,
	},
	passwordWrap: { flexDirection: "row", alignItems: "center" },
	passwordInput: { flex: 1, paddingRight: 48 },
	eyeButton: { position: "absolute", right: 12, width: 33, height: 36, alignItems: "center", justifyContent: "center" },
	smallNote: { color: theme.colors.muted, fontSize: 11, lineHeight: 17, textAlign: "center" },
	backupNote: { color: theme.colors.muted, fontSize: 12, lineHeight: 18, textAlign: "center", paddingHorizontal: 16 },
});
