import { POST } from "../route"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

// Mock the workflow
const mockWorkflowRun = jest.fn().mockResolvedValue({ result: {} })
jest.mock("../../../../workflows/sync-pickup-request-from-order", () => ({
  __esModule: true,
  default: () => ({
    run: mockWorkflowRun,
  }),
}))

describe("PayPal Webhook", () => {
  let req: any
  let res: any
  let logger: any
  let pgConnection: any

  beforeEach(() => {
    jest.clearAllMocks()
    
    logger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    }
    
    pgConnection = {
      raw: jest.fn(),
    }

    req = {
      scope: {
        resolve: jest.fn((key) => {
          if (key === ContainerRegistrationKeys.LOGGER) return logger
          if (key === ContainerRegistrationKeys.PG_CONNECTION) return pgConnection
          return null
        }),
      },
      body: {},
      headers: {},
    }

    res = {
      sendStatus: jest.fn().mockReturnThis(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    }

    // Default env for tests
    process.env.PAYPAL_WEBHOOK_ID = "test-webhook-id"
    process.env.NODE_ENV = "test"
  })

  it("should return 200 early if event is not PAYMENT.CAPTURE.COMPLETED", async () => {
    req.body = { event_type: "OTHER.EVENT" }
    await POST(req, res)
    expect(res.sendStatus).toHaveBeenCalledWith(200)
    expect(pgConnection.raw).not.toHaveBeenCalled()
  })

  it("should return 200 and skip if payment already processed (idempotency)", async () => {
    req.body = {
      event_type: "PAYMENT.CAPTURE.COMPLETED",
      resource: { custom_id: "session_123", id: "capture_123" }
    }
    req.headers = {
      "paypal-transmission-id": "tx_123",
      "paypal-transmission-time": "2026-04-26T00:00:00Z",
      "paypal-cert-url": "url",
      "paypal-auth-algo": "algo",
      "paypal-transmission-sig": "sig"
    }

    // Mock fetch for PayPal API
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: "token_123" })
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ verification_status: "SUCCESS" })
      } as any)
    
    // Mock idempotency check finding an existing record
    pgConnection.raw.mockResolvedValueOnce({
      rows: [{ id: "pr_123", paypal_capture_id: "capture_123" }]
    })

    await POST(req, res)

    expect(res.sendStatus).toHaveBeenCalledWith(200)
    expect(logger.info).toHaveBeenCalledWith(expect.stringContaining("already processed"))
    expect(mockWorkflowRun).not.toHaveBeenCalled()
  })

  it("should fail if signature headers are missing", async () => {
    req.body = {
      event_type: "PAYMENT.CAPTURE.COMPLETED",
      resource: { custom_id: "session_123" }
    }
    // No headers set
    await POST(req, res)
    expect(res.status).toHaveBeenCalledWith(400)
    expect(res.json).toHaveBeenCalledWith({ error: "Faltan cabeceras de seguridad." })
  })

  it("should fail if signature verification fails", async () => {
    req.body = {
      event_type: "PAYMENT.CAPTURE.COMPLETED",
      resource: { custom_id: "session_123" }
    }
    req.headers = {
      "paypal-transmission-id": "tx_123",
      "paypal-transmission-time": "2026-04-26T00:00:00Z",
      "paypal-cert-url": "url",
      "paypal-auth-algo": "algo",
      "paypal-transmission-sig": "sig"
    }

    // Mock PayPal Token
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: "token_123" })
      } as any)
      // Mock Signature failure
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ verification_status: "FAILURE" })
      } as any)

    await POST(req, res)

    expect(res.status).toHaveBeenCalledWith(401)
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining("Firma de webhook invalida"))
  })

  it("should return 503 if PayPal API is unreachable during verification", async () => {
    req.body = {
      event_type: "PAYMENT.CAPTURE.COMPLETED",
      resource: { custom_id: "session_123" }
    }
    req.headers = {
      "paypal-transmission-id": "tx_123",
      "paypal-transmission-time": "2026-04-26T00:00:00Z",
      "paypal-cert-url": "url",
      "paypal-auth-algo": "algo",
      "paypal-transmission-sig": "sig"
    }

    // Mock PayPal Token failure
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false,
      status: 500
    } as any)

    await POST(req, res)

    expect(res.status).toHaveBeenCalledWith(503)
    expect(res.json).toHaveBeenCalledWith({ error: "No se pudo verificar la identidad del emisor." })
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining("Error al obtener token"))
  })

  it("should run sync workflow if everything is valid", async () => {
    req.body = {
      event_type: "PAYMENT.CAPTURE.COMPLETED",
      resource: { custom_id: "session_123", id: "capture_123" }
    }
    req.headers = {
      "paypal-transmission-id": "tx_123",
      "paypal-transmission-time": "2026-04-26T00:00:00Z",
      "paypal-cert-url": "url",
      "paypal-auth-algo": "algo",
      "paypal-transmission-sig": "sig"
    }

    // Mock fetch for PayPal API
    global.fetch = jest.fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ access_token: "token_123" })
      } as any)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ verification_status: "SUCCESS" })
      } as any)

    // Mock DB resolution of session -> cart -> order
    pgConnection.raw
      // Idempotency check
      .mockResolvedValueOnce({ rows: [] })
      // Session resolution
      .mockResolvedValueOnce({
        rows: [{ cart_id: "cart_123", order_id: "order_123" }]
      })

    await POST(req, res)

    expect(mockWorkflowRun).toHaveBeenCalledWith({
      input: {
        order_id: "order_123",
        cart_id: "cart_123",
        paypal_order_id: "capture_123"
      }
    })
    expect(res.sendStatus).toHaveBeenCalledWith(200)
  })
})
