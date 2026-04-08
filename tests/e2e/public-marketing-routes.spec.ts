import { expect, test } from "@playwright/test";

test.describe("public marketing routes smoke", () => {
  test("renders /planes from the public marketing surface", async ({ page }) => {
    await page.goto("/planes");

    await expect(page.locator("#planes")).toBeVisible();
    await expect(page.getByText(/Duracion/i).first()).toBeVisible();
  });

  test("renders /horarios from the public marketing surface", async ({ page }) => {
    await page.goto("/horarios");

    await expect(page.getByRole("heading", { name: /Horarios de|Apertura/i }).first()).toBeVisible();
    await expect(page.getByText(/dias festivos pueden tener horarios especiales/i)).toBeVisible();
  });
});
