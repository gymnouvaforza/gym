import { expect, test } from "@playwright/test";

import { loginAsLocalAdmin, overrideDashboardRole } from "./helpers/auth";

test.describe("dashboard developer access", () => {
  test("hides developer nav and blocks local admin direct access", async ({ page }) => {
    await loginAsLocalAdmin(page);
    await overrideDashboardRole(page, "admin");

    await page.goto("/dashboard");
    await expect(page.getByRole("link", { name: "Developer" })).toHaveCount(0);

    await page.goto("/dashboard/developer");
    await page.waitForURL(/\/login\?error=admin-only/);
    await expect(page.getByRole("heading", { name: "Acceso al backoffice" })).toBeVisible();
  });
});
