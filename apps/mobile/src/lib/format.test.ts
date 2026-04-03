import { formatShortDate, formatShortDateTime } from "@/lib/format";

describe("mobile formatters", () => {
  it("formats short dates in Spanish locale style", () => {
    const result = formatShortDate("2026-02-10T08:30:00.000Z");

    expect(result).toContain("2026");
    expect(result).toMatch(/\d{2}/);
  });

  it("formats short date times including hour and minute", () => {
    const result = formatShortDateTime("2026-02-10T08:30:00.000Z");

    expect(result).toMatch(/\d{2}:\d{2}/);
  });
});
