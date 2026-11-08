import { expect, test } from "@playwright/test";

test("reviewers can explore a sample garden, complete care, and inspect sample AI guidance", async ({ page }) => {
	await page.goto("/");
	await expect(page.getByText("A little more green, every day.")).toBeVisible();
	await expect(page.getByText("Milo", { exact: true }).first()).toBeVisible();

	await page.getByRole("button", { name: "Open Milo" }).click();
	await expect(page.getByText("YOUR PLANT PROFILE")).toBeVisible();
	await page
		.getByRole("button", { name: /Mark done/i })
		.first()
		.click();
	await expect(page.getByText("Completed").first()).toBeVisible();

	await page.getByRole("button", { name: "Check plant health" }).click();
	await expect(page.getByText("How is your plant feeling?")).toBeVisible();
	await page.getByTestId("use-sample-analysis").click();
	await expect(page.getByText("SAMPLE RESULT")).toBeVisible();
	await expect(page.getByText("Possible causes")).toBeVisible();
});

test("dashboard and plant care tasks are accessible without account creation", async ({ page }) => {
	await page.goto("/");
	await expect(page.getByRole("button", { name: "Analyse a plant" })).toBeVisible();
	await page.getByRole("tab", { name: /Care tasks/i }).click();
	await expect(page.getByText("Care calendar")).toBeVisible();
	await expect(page.getByText("A flexible guide—not a rulebook.")).toBeVisible();
});
