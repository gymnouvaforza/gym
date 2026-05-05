// @vitest-environment jsdom

// Tests the legacy Excel member fields section in isolation with react-hook-form context.
import { render, screen } from "@testing-library/react";
import { FormProvider, useForm } from "react-hook-form";
import { describe, expect, it } from "vitest";

import { MemberLegacySection } from "./MemberLegacySection";

type LegacyFormValues = {
  address: string;
  birthDate: string;
  districtOrUrbanization: string;
  externalCode: string;
  gender: "M" | "F" | "";
  legacyNotes: string;
  occupation: string;
  preferredSchedule: string;
};

function renderSection(memberId?: string) {
  function Wrapper() {
    const form = useForm<LegacyFormValues>({
      defaultValues: {
        address: "",
        birthDate: "",
        districtOrUrbanization: "",
        externalCode: "LEG-001",
        gender: "",
        legacyNotes: "",
        occupation: "",
        preferredSchedule: "",
      },
    });

    return (
      <FormProvider {...form}>
        <MemberLegacySection memberId={memberId} />
      </FormProvider>
    );
  }

  return render(<Wrapper />);
}

describe("MemberLegacySection", () => {
  it("renders the legacy Excel card with all 8 fields", () => {
    renderSection();

    expect(screen.getByText("Datos del Excel Maestro")).toBeInTheDocument();
    expect(screen.getByText("Campos del control legacy del gimnasio.")).toBeInTheDocument();
    expect(screen.getByLabelText("Código Legacy")).toBeInTheDocument();
    expect(screen.getByLabelText("Fecha de Nacimiento")).toHaveAttribute("type", "date");
    expect(screen.getByRole("combobox", { name: "Género" })).toBeInTheDocument();
    expect(screen.getByLabelText("Dirección")).toBeInTheDocument();
    expect(screen.getByLabelText("Distrito / Urbanización")).toBeInTheDocument();
    expect(screen.getByLabelText("Ocupación")).toBeInTheDocument();
    expect(screen.getByLabelText("Horario Preferido")).toBeInTheDocument();
    expect(screen.getByLabelText("Notas Legacy")).toHaveAttribute("rows", "3");
  });

  it("locks external code when editing an existing member", () => {
    renderSection("member-1");

    expect(screen.getByLabelText("Código Legacy")).toHaveAttribute("readonly");
    expect(screen.getByLabelText("Código Legacy")).toHaveAttribute("aria-readonly", "true");
  });
});
