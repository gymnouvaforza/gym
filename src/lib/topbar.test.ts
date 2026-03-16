import { formatDateTimeLocalInput, resolveActiveTopbar, resolveTopbarStatus, toIsoDateTimeOrNull } from "@/lib/topbar";

describe("topbar helpers", () => {
  it("returns null when the topbar is expired", () => {
    const topbar = resolveActiveTopbar(
      {
        topbar_enabled: true,
        topbar_variant: "promotion",
        topbar_text: "Promo valida",
        topbar_cta_label: "Reserva",
        topbar_cta_url: "#contacto",
        topbar_expires_at: "2026-03-10T10:00:00.000Z",
      },
      new Date("2026-03-16T10:00:00.000Z"),
    );

    expect(topbar).toBeNull();
  });

  it("keeps cta hidden when the pair is incomplete", () => {
    const topbar = resolveActiveTopbar(
      {
        topbar_enabled: true,
        topbar_variant: "announcement",
        topbar_text: "Nueva promo activa",
        topbar_cta_label: "Reserva",
        topbar_cta_url: "",
        topbar_expires_at: "2026-04-10T10:00:00.000Z",
      },
      new Date("2026-03-16T10:00:00.000Z"),
    );

    expect(topbar?.ctaLabel).toBeNull();
    expect(topbar?.ctaUrl).toBeNull();
  });

  it("parses datetime-local strings into ISO values", () => {
    expect(toIsoDateTimeOrNull("2026-04-15T18:30")).toBe(new Date("2026-04-15T18:30").toISOString());
  });

  it("formats iso values for datetime-local inputs", () => {
    const localValue = "2026-04-15T18:30";
    expect(formatDateTimeLocalInput(new Date(localValue).toISOString())).toBe(localValue);
  });

  it("reports the topbar status", () => {
    expect(
      resolveTopbarStatus(
        {
          topbar_enabled: true,
          topbar_text: "Promo valida",
          topbar_expires_at: "2026-04-10T10:00:00.000Z",
        },
        new Date("2026-03-16T10:00:00.000Z"),
      ),
    ).toBe("active");
  });
});
