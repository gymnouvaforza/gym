import type {
  MedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { ContainerRegistrationKeys } from "@medusajs/framework/utils"

import syncPickupRequestFromOrderWorkflow from "../../../workflows/sync-pickup-request-from-order"

type PgConnection = {
  raw: (
    sql: string,
    bindings?: unknown[]
  ) => Promise<{ rows?: Array<Record<string, unknown>> }>
}

function asString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null
}

export async function POST(
  req: MedusaRequest,
  res: MedusaResponse
) {
  const logger = req.scope.resolve(ContainerRegistrationKeys.LOGGER)
  const pgConnection = req.scope.resolve(
    ContainerRegistrationKeys.PG_CONNECTION
  ) as PgConnection
  
  try {
    const event = req.body as any
    const resource = event.resource || {}
    const sessionId = asString(resource.custom_id) || asString(resource.invoice_id)
    
    if (!sessionId || event.event_type !== "PAYMENT.CAPTURE.COMPLETED") {
       return res.sendStatus(200)
    }

    // --- SEGURIDAD: Verificacion de firma de PayPal ---
    const webhookId = process.env.PAYPAL_WEBHOOK_ID
    const headers = req.headers
    const transmissionId = headers["paypal-transmission-id"] as string
    
    if (!webhookId) {
      logger.warn(`[PAYPAL WEBHOOK] PAYPAL_WEBHOOK_ID no configurado. Saltando verificacion (INSEGURO). transmission_id=${transmissionId}`)
      if (process.env.NODE_ENV === "production") {
        return res.status(401).json({ error: "Configuracion de seguridad incompleta." })
      }
    } else {
      const transmissionTime = headers["paypal-transmission-time"] as string
      const certUrl = headers["paypal-cert-url"] as string
      const authAlgo = headers["paypal-auth-algo"] as string
      const transmissionSig = headers["paypal-transmission-sig"] as string

      if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig) {
        logger.error(`[PAYPAL WEBHOOK] Faltan cabeceras de validacion de PayPal. transmission_id=${transmissionId}`)
        return res.status(400).json({ error: "Faltan cabeceras de seguridad." })
      }

      const clientId = process.env.PAYPAL_CLIENT_ID
      const clientSecret = process.env.PAYPAL_CLIENT_SECRET
      const environment = process.env.PAYPAL_ENVIRONMENT || "sandbox"
      const baseUrl = environment === "production" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com"

      const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")
      const tokenRes = await fetch(`${baseUrl}/v1/oauth2/token`, {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: "grant_type=client_credentials",
      })

      if (!tokenRes.ok) {
        logger.error(`[PAYPAL WEBHOOK] Error al obtener token de acceso de PayPal. Status: ${tokenRes.status}`)
        return res.status(503).json({ error: "No se pudo verificar la identidad del emisor." })
      }
      
      const { access_token } = await tokenRes.json()

      const verifyRes = await fetch(`${baseUrl}/v1/notifications/verify-webhook-signature`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          auth_algo: authAlgo,
          cert_url: certUrl,
          transmission_id: transmissionId,
          transmission_sig: transmissionSig,
          transmission_time: transmissionTime,
          webhook_id: webhookId,
          webhook_event: event,
        }),
      })

      const verification = verifyRes.ok ? await verifyRes.json() : {}
      if (verification.verification_status !== "SUCCESS") {
        logger.error(`[PAYPAL WEBHOOK] Firma de webhook invalida o rechazada por PayPal. transmission_id=${transmissionId}`)
        return res.status(401).json({ error: "Firma invalida." })
      }
    }
    // --- FIN SEGURIDAD ---

    logger.info(`[PAYPAL WEBHOOK] Received capture completion for payment_session: ${sessionId}. transmission_id=${transmissionId}`)

    // --- IDEMPOTENCIA: Verificar si ya se proceso este pago ---
    const existingSyncResult = await pgConnection.raw(
      `
        select id, paypal_capture_id, payment_captured_at
        from pickup_request
        where cart_id = (
          select cart_id 
          from cart_payment_collection cpc
          inner join payment_session ps on ps.payment_collection_id = cpc.payment_collection_id
          where ps.id = ?
          limit 1
        )
        limit 1
      `,
      [sessionId]
    )
    const existingSync = Array.isArray(existingSyncResult.rows) ? existingSyncResult.rows[0] : null
    if (existingSync?.paypal_capture_id || existingSync?.payment_captured_at) {
      logger.info(`[PAYPAL WEBHOOK] Payment for session ${sessionId} already processed. skipping.`)
      return res.sendStatus(200)
    }
    // --------------------------------------------------------

    const sessionResult = await pgConnection.raw(
      `
        select
          cpc.cart_id,
          oc.order_id
        from payment_session ps
        inner join cart_payment_collection cpc
          on cpc.payment_collection_id = ps.payment_collection_id
         and cpc.deleted_at is null
        left join order_cart oc
          on oc.cart_id = cpc.cart_id
        where ps.id = ?
          and ps.deleted_at is null
        limit 1
      `,
      [sessionId]
    )
    const sessionRow = Array.isArray(sessionResult.rows) ? sessionResult.rows[0] : null
    const cartId = asString(sessionRow?.cart_id)
    const orderId = asString(sessionRow?.order_id)

    if (!cartId) {
      logger.warn(`[PAYPAL WEBHOOK] No cart found for payment_session ${sessionId}.`)
      return res.sendStatus(200)
    }

    if (!orderId) {
      logger.warn(
        `[PAYPAL WEBHOOK] Cart ${cartId} resolved from session ${sessionId}, but no Medusa order is linked yet.`
      )
      return res.sendStatus(200)
    }

    logger.info(
      `[PAYPAL WEBHOOK] Resolved payment_session ${sessionId} -> cart ${cartId} -> order ${orderId}. Starting sync...`
    )

    await syncPickupRequestFromOrderWorkflow(req.scope).run({
      input: {
        order_id: orderId,
        cart_id: cartId,
        paypal_order_id: asString(resource.id),
      },
    })

    logger.info(`[PAYPAL WEBHOOK] Successfully synchronized order ${orderId}`)
    
    res.sendStatus(200)
  } catch (error) {
    logger.error(`[PAYPAL WEBHOOK] Error processing webhook: ${error instanceof Error ? error.message : String(error)}`)
    res.sendStatus(500)
  }
}
