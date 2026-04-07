import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const pickupRequestRouteMocks = vi.hoisted(() => ({
  createPickupRequest: vi.fn(),
  listPickupRequests: vi.fn(),
  resolveCartIdFromRequest: vi.fn(),
  resolveOrCreateMemberCommerceCustomer: vi.fn(),
  createSupabasePublicClient: vi.fn(),
  createSupabaseServerClient: vi.fn(),
}));

vi.mock("@/lib/cart/member-bridge", () => ({
  createPickupRequest: pickupRequestRouteMocks.createPickupRequest,
  listPickupRequests: pickupRequestRouteMocks.listPickupRequests,
  resolveCartIdFromRequest: pickupRequestRouteMocks.resolveCartIdFromRequest,
  resolveOrCreateMemberCommerceCustomer: pickupRequestRouteMocks.resolveOrCreateMemberCommerceCustomer,
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabasePublicClient: pickupRequestRouteMocks.createSupabasePublicClient,
  createSupabaseServerClient: pickupRequestRouteMocks.createSupabaseServerClient,
}));

import { GYM_CART_COOKIE } from "@/lib/cart/cookie";
import { POST } from "@/app/api/cart/pickup-request/route";

function buildPublicClient(whatsappUrl = "https://wa.me/34654194788") {
  return {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        limit: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValue({
            data: {
              whatsapp_url: whatsappUrl,
            },
          }),
        })),
      })),
    })),
  };
}

describe("POST /api/cart/pickup-request", () => {
  beforeEach(() => {
    pickupRequestRouteMocks.resolveCartIdFromRequest.mockResolvedValue("cart_01");
    pickupRequestRouteMocks.listPickupRequests.mockResolvedValue({
      pickup_requests: [
        {
          id: "pick_01",
          request_number: "NF-20260407-ABC123",
          cart_id: "cart_01",
          customer_id: null,
          supabase_user_id: null,
          email: "guest@gym.com",
          notes: "Pasare por la tarde.",
          status: "requested",
          currency_code: "PEN",
          item_count: 1,
          subtotal: 49.99,
          total: 49.99,
          order_id: "order_01KMMRQPVJ0NXBNB21VXY21VMN",
          payment_status: "pending",
          email_status: "pending",
          created_at: "2026-04-07T08:00:00.000Z",
          updated_at: "2026-04-07T08:00:00.000Z",
        },
      ],
      count: 1,
      limit: 1,
      offset: 0,
    });
    pickupRequestRouteMocks.createSupabaseServerClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: {
            user: null,
          },
        }),
      },
    });
    pickupRequestRouteMocks.createSupabasePublicClient.mockReturnValue(buildPublicClient());
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("returns the existing pickup request and a WhatsApp URL with a short explanatory message", async () => {
    const response = await POST(
      new Request("http://localhost/api/cart/pickup-request", {
        method: "POST",
        body: JSON.stringify({
          cartId: "cart_01",
          email: "guest@gym.com",
          notes: "Pasare por la tarde.",
        }),
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(pickupRequestRouteMocks.listPickupRequests).toHaveBeenCalledWith({
      cartId: "cart_01",
      limit: 1,
      offset: 0,
    });
    expect(pickupRequestRouteMocks.createPickupRequest).not.toHaveBeenCalled();
    expect(payload.pickupRequest.requestNumber).toBe("NF-20260407-ABC123");
    const whatsappUrl = new URL(payload.whatsappUrl);
    expect(whatsappUrl.origin + whatsappUrl.pathname).toBe("https://wa.me/34654194788");
    expect(whatsappUrl.searchParams.get("text")).toBe(
      "Hola, acabo de hacer un pedido en la tienda. Mi referencia es order_01KMMRQPVJ0NXBNB21VXY21VMN.",
    );
    expect(response.headers.get("set-cookie")).toContain(`${GYM_CART_COOKIE}=`);
  });
});
