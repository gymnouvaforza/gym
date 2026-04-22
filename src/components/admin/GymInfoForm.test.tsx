// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import GymInfoForm from "@/components/admin/GymInfoForm";
import { defaultSiteSettings } from "@/lib/data/default-content";

const saveSiteSettingsMock = vi.fn();

vi.mock("@/app/(admin)/dashboard/actions", () => ({
  saveSiteSettings: (...args: unknown[]) => saveSiteSettingsMock(...args),
}));

describe("GymInfoForm", () => {
  beforeEach(() => {
    saveSiteSettingsMock.mockReset();
  });

  it("initializes the whatsapp field with the current settings value", () => {
    render(<GymInfoForm settings={defaultSiteSettings} />);

    expect(screen.getByLabelText("Enlace de WhatsApp")).toHaveValue(
      defaultSiteSettings.whatsapp_url,
    );
  });

  it("explains that the whatsapp link controls the floating home button", () => {
    render(<GymInfoForm settings={defaultSiteSettings} />);

    expect(
      screen.getByText(/Alimenta el botón flotante de la portada/i),
    ).toBeInTheDocument();
  });
});
