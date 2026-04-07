// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ComponentProps } from "react";
import { vi } from "vitest";

import CartPageClient from "@/components/cart/CartPageClient";
import type { Cart } from "@/lib/cart/types";

const cartProviderMocks = vi.hoisted(() => ({
  useCart: vi.fn(),
}));

vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: ComponentProps<"a">) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/components/cart/CartProvider", () => ({
  useCart: cartProviderMocks.useCart,
}));

function buildCart(overrides: Partial<Cart> = {}): Cart {
  return {
    id: "cart_01",
    email: null,
    customerId: null,
    regionId: "reg_test",
    completedAt: null,
    metadata: null,
    paymentSession: null,
    items: [
      {
        id: "line_01",
        title: "Nova Whey",
        thumbnail: null,
        quantity: 2,
        productId: "prod_01",
        productTitle: "Nova Whey",
        productHandle: "nova-whey",
        variantId: "variant_chocolate",
        variantTitle: "Chocolate",
        variantSku: null,
        unitPrice: 49.99,
        subtotal: 99.98,
        total: 99.98,
        currencyCode: "PEN",
        requiresShipping: false,
        selectedOptions: [{ optionTitle: "Sabor", value: "Chocolate" }],
      },
    ],
    summary: {
      currencyCode: "PEN",
      itemCount: 2,
      subtotal: 99.98,
      total: 99.98,
      taxTotal: 0,
      shippingTotal: 0,
      discountTotal: 0,
      requiresShipping: false,
      pickupRequestStatus: "draft",
      pickupRequestedAt: null,
      pickupRequestId: null,
      pickupRequestNumber: null,
    },
    ...overrides,
  };
}

describe("CartPageClient", () => {
  it("renders the assisted reservation CTA and summary", () => {
    cartProviderMocks.useCart.mockReturnValue({
      cart: buildCart(),
      lastSubmittedPickupRequest: null,
      lastSubmittedWhatsAppUrl: null,
      pickupEmailWarning: null,
      notice: null,
      error: null,
      isReady: true,
      isBusy: false,
      memberEmail: null,
      clearSubmittedPickupRequest: vi.fn(),
      updateItemQuantity: vi.fn(),
      removeItem: vi.fn(),
      saveEmail: vi.fn(),
      submitPickupRequest: vi.fn(),
    });

    render(<CartPageClient />);

    expect(
      screen.getByRole("heading", { name: /Tu seleccion para cerrar con el club/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Nova Whey")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Enviar reserva por WhatsApp" })).toBeInTheDocument();
    expect(screen.getByText(/el cobro y la confirmacion final se cierran manualmente/i)).toBeInTheDocument();
  });

  it("saves the guest email before sending the assisted reservation", async () => {
    const saveEmailMock = vi.fn().mockResolvedValue(undefined);
    const submitPickupRequestMock = vi.fn().mockResolvedValue({ id: "pick_01" });
    const user = userEvent.setup();

    cartProviderMocks.useCart.mockReturnValue({
      cart: buildCart(),
      lastSubmittedPickupRequest: null,
      lastSubmittedWhatsAppUrl: null,
      pickupEmailWarning: null,
      notice: null,
      error: null,
      isReady: true,
      isBusy: false,
      memberEmail: null,
      clearSubmittedPickupRequest: vi.fn(),
      updateItemQuantity: vi.fn(),
      removeItem: vi.fn(),
      saveEmail: saveEmailMock,
      submitPickupRequest: submitPickupRequestMock,
    });

    render(<CartPageClient />);

    await user.type(screen.getByPlaceholderText("tu@email.com"), "Socio@Gym.com");
    await user.type(
      screen.getByPlaceholderText(/pasare por recepcion/i),
      "Pasare por la tarde.",
    );
    await user.click(screen.getByRole("button", { name: "Enviar reserva por WhatsApp" }));

    await waitFor(() => {
      expect(saveEmailMock).toHaveBeenCalledWith("socio@gym.com");
      expect(submitPickupRequestMock).toHaveBeenCalledWith({
        email: "socio@gym.com",
        notes: "Pasare por la tarde.",
      });
    });
  });

  it("shows the post-submission panel with the WhatsApp shortcut", () => {
    cartProviderMocks.useCart.mockReturnValue({
      cart: null,
      lastSubmittedPickupRequest: {
        id: "pick_01",
        requestNumber: "NF-20260322-ABC123",
        cartId: "cart_01",
        customerId: null,
        supabaseUserId: null,
        email: "guest@gym.com",
        notes: "Pasare por la tarde.",
        status: "requested",
        currencyCode: "PEN",
        itemCount: 1,
        subtotal: 49.99,
        total: 49.99,
        chargedCurrencyCode: null,
        chargedTotal: null,
        exchangeRate: null,
        exchangeRateSource: null,
        exchangeRateReference: null,
        lineItems: [],
        source: "gym-storefront",
        orderId: "order_01KMMRQPVJ0NXBNB21VXY21VMN",
        paymentCollectionId: null,
        paymentProvider: null,
        paymentStatus: "pending",
        paypalOrderId: null,
        paypalCaptureId: null,
        paymentAuthorizedAt: null,
        paymentCapturedAt: null,
        emailStatus: "pending",
        emailSentAt: null,
        emailError: null,
        createdAt: "2026-04-07T09:00:00.000Z",
        updatedAt: "2026-04-07T09:00:00.000Z",
      },
      lastSubmittedWhatsAppUrl:
        "https://wa.me/34654194788?text=Hola%2C+acabo+de+hacer+un+pedido+en+la+tienda.+Mi+referencia+es+order_01KMMRQPVJ0NXBNB21VXY21VMN.",
      pickupEmailWarning: null,
      notice: null,
      error: null,
      isReady: true,
      isBusy: false,
      memberEmail: null,
      clearSubmittedPickupRequest: vi.fn(),
      updateItemQuantity: vi.fn(),
      removeItem: vi.fn(),
      saveEmail: vi.fn(),
      submitPickupRequest: vi.fn(),
    });

    render(<CartPageClient />);

    expect(screen.getByText(/Tu pedido asistido ya esta en gestion/i)).toBeInTheDocument();
    expect(screen.getByText(/Order ID: order_01KMMRQPVJ0NXBNB21VXY21VMN/i)).toBeInTheDocument();
    expect(
      screen.getByText(/mensaje corto que ya incluye tu referencia/i),
    ).toBeInTheDocument();
    const whatsappLink = screen.getByRole("link", { name: "Abrir WhatsApp con mi reserva" });
    const whatsappUrl = new URL(whatsappLink.getAttribute("href") ?? "");
    expect(whatsappUrl.origin + whatsappUrl.pathname).toBe("https://wa.me/34654194788");
    expect(whatsappUrl.searchParams.get("text")).toBe(
      "Hola, acabo de hacer un pedido en la tienda. Mi referencia es order_01KMMRQPVJ0NXBNB21VXY21VMN.",
    );
  });
});
