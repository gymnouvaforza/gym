/**
 * @vitest-environment jsdom
 */
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import DiagnosticsPanel from "../DiagnosticsPanel";
import * as actions from "@/lib/diagnostics/actions";

// Mock de Framer Motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: { children: React.ReactNode } & Record<string, unknown>) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

// Mock de Lucide Icons
vi.mock("lucide-react", () => ({
  Database: () => <div data-testid="icon-database" />,
  Flame: () => <div data-testid="icon-flame" />,
  ShoppingBag: () => <div data-testid="icon-shopping-bag" />,
  ShieldCheck: () => <div data-testid="icon-shield-check" />,
  Mail: () => <div data-testid="icon-mail" />,
  CreditCard: () => <div data-testid="icon-credit-card" />,
  CheckCircle2: () => <div data-testid="icon-check" />,
  XCircle: () => <div data-testid="icon-x" />,
  AlertCircle: () => <div data-testid="icon-alert" />,
  RefreshCw: () => <div data-testid="icon-refresh" />,
  Clock: () => <div data-testid="icon-clock" />,
  Loader2: () => <div data-testid="icon-loader" />,
}));

// Mock de actions
vi.mock("@/lib/diagnostics/actions", () => ({
  checkSupabaseConnection: vi.fn(),
  checkFirebaseAdmin: vi.fn(),
  checkMedusaStorefront: vi.fn(),
  checkMedusaAdmin: vi.fn(),
}));

const mockInitialStatus = {
  supabase: { configured: true, serviceRole: true },
  firebase: { public: true, admin: true },
  medusa: { storefront: true, admin: true },
  smtp: { configured: true },
  paypal: { configured: true, environment: "sandbox" },
};

describe("DiagnosticsPanel Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("debe renderizar todos los servicios", () => {
    render(<DiagnosticsPanel initialStatus={mockInitialStatus} />);
    
    expect(screen.getByText("Supabase")).toBeInTheDocument();
    expect(screen.getByText("Firebase Admin")).toBeInTheDocument();
    expect(screen.getByText("Medusa Storefront")).toBeInTheDocument();
    expect(screen.getByText("Medusa Admin")).toBeInTheDocument();
    expect(screen.getByText("SMTP")).toBeInTheDocument();
    expect(screen.getByText("PayPal")).toBeInTheDocument();
  });

  it("debe ejecutar la prueba de Supabase al hacer click", async () => {
    vi.mocked(actions.checkSupabaseConnection).mockResolvedValue({
      success: true,
      message: "Conexión OK",
      timestamp: new Date().toISOString(),
    });

    render(<DiagnosticsPanel initialStatus={mockInitialStatus} />);
    
    const testButtons = screen.getAllByRole("button", { name: /probar conexión/i });
    // El primer botón es el de Supabase según el orden en el componente
    fireEvent.click(testButtons[0]);

    await waitFor(() => {
      expect(actions.checkSupabaseConnection).toHaveBeenCalled();
      expect(screen.getByText("Conexión OK")).toBeInTheDocument();
    });
  });

  it("debe mostrar error si la acción falla", async () => {
    vi.mocked(actions.checkSupabaseConnection).mockRejectedValue(new Error("Network Error"));

    render(<DiagnosticsPanel initialStatus={mockInitialStatus} />);
    
    const testButtons = screen.getAllByRole("button", { name: /probar conexión/i });
    fireEvent.click(testButtons[0]);

    await waitFor(() => {
      expect(screen.getByText("Network Error")).toBeInTheDocument();
    });
  });

  it("debe mostrar estado 'Falta Configuración' si el servicio no está configurado", () => {
    const statusMissing = {
      ...mockInitialStatus,
      supabase: { configured: false, serviceRole: false },
    };
    render(<DiagnosticsPanel initialStatus={statusMissing} />);
    
    expect(screen.getByText("Falta Configuración")).toBeInTheDocument();
    // No debería haber botón de probar para Supabase si serviceRole es false
    // Buscamos que haya al menos uno (Supabase, SMTP, PayPal lo tienen en este mock)
    expect(screen.getAllByText("Validación manual").length).toBeGreaterThan(0);
  });
});
