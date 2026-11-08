import { Ionicons } from "@expo/vector-icons";
import type { ComponentProps } from "react";

/** Small icon boundary so app components do not depend directly on icon fonts. */
type IoniconName = ComponentProps<typeof Ionicons>["name"];

export function AppIcon({ name, size = 18, color }: { name: IoniconName; size?: number; color: string }) {
	return <Ionicons name={name} size={size} color={color} />;
}
