import { Ionicons } from "@expo/vector-icons";
import type { ReactNode } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { theme } from "../theme/theme";

export function Screen({ children, scroll = true, contentStyle }: { children: ReactNode; scroll?: boolean; contentStyle?: object }) {
	if (!scroll) {
		return (
			<View style={styles.screen}>
				<View style={[styles.page, contentStyle]}>{children}</View>
			</View>
		);
	}
	return (
		<ScrollView style={styles.screen} contentContainerStyle={[styles.page, contentStyle]} keyboardShouldPersistTaps="handled">
			{children}
		</ScrollView>
	);
}

export function Wordmark({ small = false }: { small?: boolean }) {
	return (
		<View style={styles.wordmark}>
			<View style={[styles.logoMark, small && styles.logoMarkSmall]}>
				<Ionicons name="leaf" size={small ? 18 : 21} color={theme.colors.white} />
			</View>
			<Text style={[styles.wordmarkText, small && styles.wordmarkSmall]}>Plantingwise</Text>
		</View>
	);
}

export function Card({ children, style, onPress, testID }: { children: ReactNode; style?: object; onPress?: () => void; testID?: string }) {
	if (onPress) {
		return (
			<Pressable testID={testID} onPress={onPress} style={({ pressed }) => [styles.card, style, pressed && styles.pressed]}>
				{children}
			</Pressable>
		);
	}
	return (
		<View testID={testID} style={[styles.card, style]}>
			{children}
		</View>
	);
}

export function Button({
	title,
	onPress,
	variant = "primary",
	icon,
	disabled = false,
	loading = false,
	testID,
	compact = false,
}: {
	title: string;
	onPress: () => void;
	variant?: "primary" | "secondary" | "ghost" | "danger";
	icon?: keyof typeof Ionicons.glyphMap;
	disabled?: boolean;
	loading?: boolean;
	testID?: string;
	compact?: boolean;
}) {
	const isPrimary = variant === "primary";
	const isDanger = variant === "danger";
	const isSecondary = variant === "secondary";
	return (
		<Pressable
			testID={testID}
			accessibilityRole="button"
			accessibilityState={{ disabled: disabled || loading }}
			onPress={onPress}
			disabled={disabled || loading}
			style={({ pressed }) => [
				styles.button,
				compact && styles.buttonCompact,
				isPrimary && styles.buttonPrimary,
				isSecondary && styles.buttonSecondary,
				isDanger && styles.buttonDanger,
				variant === "ghost" && styles.buttonGhost,
				(disabled || loading) && styles.buttonDisabled,
				pressed && !(disabled || loading) && styles.pressed,
			]}
		>
			{loading ? <ActivityIndicator color={isPrimary || isDanger ? theme.colors.white : theme.colors.forest} size="small" /> : null}
			{!loading && icon ? (
				<Ionicons name={icon} size={17} color={isPrimary || isDanger ? theme.colors.white : theme.colors.forest} />
			) : null}
			<Text style={[styles.buttonText, (isPrimary || isDanger) && styles.buttonTextLight, compact && styles.buttonTextCompact]}>
				{title}
			</Text>
		</Pressable>
	);
}

export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
	return (
		<View style={styles.sectionHeader}>
			<Text style={styles.sectionTitle}>{title}</Text>
			{action && onAction ? (
				<Pressable onPress={onAction} accessibilityRole="button">
					<Text style={styles.sectionAction}>{action}</Text>
				</Pressable>
			) : null}
		</View>
	);
}

export function Eyebrow({ children }: { children: ReactNode }) {
	return <Text style={styles.eyebrow}>{children}</Text>;
}

export function Pill({
	label,
	tone = "green",
	icon,
}: {
	label: string;
	tone?: "green" | "amber" | "red" | "neutral" | "blue";
	icon?: keyof typeof Ionicons.glyphMap;
}) {
	const style =
		tone === "amber"
			? styles.pillAmber
			: tone === "red"
				? styles.pillRed
				: tone === "neutral"
					? styles.pillNeutral
					: tone === "blue"
						? styles.pillBlue
						: styles.pillGreen;
	return (
		<View style={[styles.pill, style]}>
			{icon ? (
				<Ionicons
					name={icon}
					size={12}
					color={
						tone === "amber"
							? "#8C5E18"
							: tone === "red"
								? theme.colors.red
								: tone === "neutral"
									? theme.colors.muted
									: tone === "blue"
										? "#416B80"
										: theme.colors.forest
					}
				/>
			) : null}
			<Text
				style={[
					styles.pillText,
					tone === "amber" && { color: "#8C5E18" },
					tone === "red" && { color: theme.colors.red },
					tone === "neutral" && { color: theme.colors.muted },
					tone === "blue" && { color: "#416B80" },
				]}
			>
				{label}
			</Text>
		</View>
	);
}

export function PlantImage({
	uri,
	size = "large",
	rounded = true,
}: {
	uri?: string | null;
	size?: "small" | "medium" | "large";
	rounded?: boolean;
}) {
	const dimension = size === "small" ? 54 : size === "medium" ? 84 : 148;
	if (uri) {
		return (
			<Image
				source={{ uri }}
				resizeMode="cover"
				style={{
					width: dimension,
					height: dimension,
					borderRadius: rounded ? theme.radius.md : 0,
					backgroundColor: theme.colors.sage,
				}}
			/>
		);
	}
	return (
		<View
			style={{
				width: dimension,
				height: dimension,
				borderRadius: rounded ? theme.radius.md : 0,
				backgroundColor: theme.colors.sage,
				alignItems: "center",
				justifyContent: "center",
			}}
		>
			<Ionicons name="leaf" size={dimension * 0.38} color={theme.colors.leaf} />
		</View>
	);
}

export function FieldLabel({ children }: { children: ReactNode }) {
	return <Text style={styles.fieldLabel}>{children}</Text>;
}

export function HelperText({ children, tone = "muted" }: { children: ReactNode; tone?: "muted" | "error" | "success" }) {
	return (
		<Text
			style={[
				styles.helperText,
				tone === "error" && { color: theme.colors.red },
				tone === "success" && { color: theme.colors.forest },
			]}
		>
			{children}
		</Text>
	);
}

export function IconBox({ name, tint = "green" }: { name: keyof typeof Ionicons.glyphMap; tint?: "green" | "amber" | "blue" }) {
	const background = tint === "amber" ? theme.colors.amberSoft : tint === "blue" ? theme.colors.blueSoft : theme.colors.sageLight;
	const color = tint === "amber" ? "#8C5E18" : tint === "blue" ? "#416B80" : theme.colors.forest;
	return (
		<View style={[styles.iconBox, { backgroundColor: background }]}>
			<Ionicons name={name} size={19} color={color} />
		</View>
	);
}

export function Divider() {
	return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
	screen: { flex: 1, backgroundColor: theme.colors.canvas },
	page: { width: "100%", maxWidth: 1120, alignSelf: "center", paddingHorizontal: 22, paddingTop: 24, paddingBottom: 42, gap: 24 },
	wordmark: { flexDirection: "row", alignItems: "center", gap: 9 },
	logoMark: {
		width: 38,
		height: 38,
		borderRadius: 13,
		backgroundColor: theme.colors.forest,
		alignItems: "center",
		justifyContent: "center",
	},
	logoMarkSmall: { width: 30, height: 30, borderRadius: 10 },
	wordmarkText: { color: theme.colors.forestDeep, fontSize: 20, fontWeight: "800", letterSpacing: -0.7 },
	wordmarkSmall: { fontSize: 16 },
	card: {
		backgroundColor: theme.colors.white,
		borderRadius: theme.radius.lg,
		padding: 18,
		borderWidth: 1,
		borderColor: theme.colors.line,
		gap: 12,
	},
	pressed: { opacity: 0.84, transform: [{ scale: 0.995 }] },
	button: {
		minHeight: 48,
		paddingHorizontal: 18,
		borderRadius: 15,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		gap: 9,
		borderWidth: 1,
		borderColor: "transparent",
	},
	buttonCompact: { minHeight: 38, paddingHorizontal: 13, borderRadius: 12 },
	buttonPrimary: { backgroundColor: theme.colors.forest },
	buttonSecondary: { backgroundColor: theme.colors.sageLight, borderColor: "#DCE6D8" },
	buttonDanger: { backgroundColor: theme.colors.red },
	buttonGhost: { backgroundColor: "transparent", borderColor: theme.colors.line },
	buttonDisabled: { opacity: 0.55 },
	buttonText: { color: theme.colors.forest, fontSize: 14, fontWeight: "700" },
	buttonTextLight: { color: theme.colors.white },
	buttonTextCompact: { fontSize: 13 },
	sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
	sectionTitle: { color: theme.colors.ink, fontSize: 19, fontWeight: "700", letterSpacing: -0.3 },
	sectionAction: { color: theme.colors.leaf, fontSize: 13, fontWeight: "700" },
	eyebrow: { color: theme.colors.leaf, fontSize: 11, letterSpacing: 1.5, fontWeight: "800", textTransform: "uppercase" },
	pill: {
		flexDirection: "row",
		alignItems: "center",
		alignSelf: "flex-start",
		gap: 5,
		borderRadius: 999,
		paddingHorizontal: 10,
		paddingVertical: 6,
	},
	pillGreen: { backgroundColor: theme.colors.sageLight },
	pillAmber: { backgroundColor: theme.colors.amberSoft },
	pillRed: { backgroundColor: theme.colors.redSoft },
	pillNeutral: { backgroundColor: "#F0F2EF" },
	pillBlue: { backgroundColor: theme.colors.blueSoft },
	pillText: { color: theme.colors.forest, fontSize: 11, fontWeight: "700" },
	fieldLabel: { color: theme.colors.ink, fontSize: 13, fontWeight: "700", marginBottom: 7 },
	helperText: { color: theme.colors.muted, fontSize: 12, lineHeight: 18 },
	iconBox: { width: 40, height: 40, borderRadius: 13, alignItems: "center", justifyContent: "center" },
	divider: { height: 1, backgroundColor: theme.colors.line, width: "100%" },
});
