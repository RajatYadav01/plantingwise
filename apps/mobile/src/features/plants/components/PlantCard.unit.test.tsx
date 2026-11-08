import { samplePlants } from "@plantingwise/constants";
import { fireEvent, render, screen } from "@testing-library/react-native";
import { describe, expect, it, vi } from "vitest";
import { PlantCard } from "./PlantCard";

// Mock local presentation boundaries; the test focuses on PlantCard's props and interactions.
vi.mock("../../../components/AppIcon", () => ({ AppIcon: () => null }));
vi.mock("../../../components/ui", async () => {
	const ReactNative = await import("react-native");
	return {
		PlantImage: () => null,
		Pill: ({ label }: { label: string }) => ReactNative.createElement(ReactNative.Text, null, label),
	};
});

describe("PlantCard", () => {
	it("shows a plant name, species, and a sample indicator", async () => {
		await render(<PlantCard plant={samplePlants[0]} taskLabel="Water today" onPress={vi.fn()} />);

		expect(screen.getByText("Milo")).toBeTruthy();
		expect(screen.getByText("Monstera deliciosa")).toBeTruthy();
		expect(screen.getByText("SAMPLE")).toBeTruthy();
		expect(screen.getByText("Water today")).toBeTruthy();
	});

	it("invokes its action when the card is pressed", async () => {
		const onPress = vi.fn();
		await render(<PlantCard plant={samplePlants[1]} onPress={onPress} />);

		await fireEvent.press(screen.getByRole("button", { name: "Open Sage" }));

		expect(onPress).toHaveBeenCalledOnce();
		expect(screen.getByText("Care guide")).toBeTruthy();
	});
});
