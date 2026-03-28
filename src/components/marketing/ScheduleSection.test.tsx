// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";

import ScheduleSection from "@/components/marketing/ScheduleSection";
import { defaultMarketingScheduleRows } from "@/lib/data/marketing-content";

describe("ScheduleSection", () => {
  it("renders schedule rows passed from data layer", () => {
    const rows = [
      {
        ...defaultMarketingScheduleRows[0],
        label: "Horario Test",
        opens_at: "06:30 AM",
        closes_at: "09:30 PM",
        description: "Turno continuo",
      },
    ];

    render(<ScheduleSection rows={rows} />);

    expect(screen.getAllByText("Horario Test")).toHaveLength(2);
    expect(screen.getAllByText("06:30 AM")).toHaveLength(2);
    expect(screen.getAllByText("09:30 PM")).toHaveLength(2);
    expect(screen.getAllByText("Turno continuo")).toHaveLength(2);
  });
});
