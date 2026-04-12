import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk"
import { MedusaError } from "@medusajs/framework/utils"
import {
  transferCartCustomerWorkflow,
  updateCartWorkflow,
} from "@medusajs/medusa/core-flows"
import { ulid } from "ulid"

import { refetchCart } from "../../api/admin/gym/helpers"
import { PICKUP_REQUEST_MODULE } from "../../modules/pickupRequest"
import type {
  PickupRequestEmailStatus,
  PickupRequestStatus,
} from "../../modules/pickupRequest/constants"

type PickupRequestLineItemSnapshot = {
  id: string
  title: string
  quantity: number
  thumbnail: string | null
  product_id: string | null
  product_title: string | null
  product_handle: string | null
  variant_id: string | null
  variant_title: string | null
  variant_sku: string | null
  unit_price: number
  total: number
  selected_options: Array<{
    option_title: string
    value: string
  }>
}

type PickupRequestRecord = {
  id: string
  request_number: string
  cart_id: string
  customer_id: string | null
  supabase_user_id: string | null
  email: string
  notes: string | null
  status: PickupRequestStatus
  currency_code: string
  item_count: number
  subtotal: number
  total: number
  line_items_snapshot: PickupRequestLineItemSnapshot[]
  source: string
  email_status: PickupRequestEmailStatus
  email_sent_at: string | null
  email_error: string | null
  created_at: string
  updated_at: string
}

type CreatePickupRequestStepInput = {
  cart_id: string
  email: string
  customer_id?: string | null
  supabase_user_id?: string | null
  notes?: string | null
}

function asRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null
}

function asString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null
}

function asNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value)

    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  return 0
}

function normalizeMoneyAmount(value: unknown) {
  return asNumber(value) / 100
}

function sumLineItemsTotal(lineItems: PickupRequestLineItemSnapshot[]) {
  return lineItems.reduce((sum, item) => sum + Math.max(item.total, 0), 0)
}

function resolvePickupRequestTotals(
  cart: Record<string, unknown>,
  lineItemsSnapshot: PickupRequestLineItemSnapshot[],
) {
  const snapshotSubtotal = sumLineItemsTotal(lineItemsSnapshot)
  const cartSubtotal = normalizeMoneyAmount(cart.subtotal)
  const cartTotal = normalizeMoneyAmount(cart.total)

  const subtotal = cartSubtotal > 0 ? cartSubtotal : snapshotSubtotal
  const total = cartTotal > 0 ? cartTotal : subtotal

  return {
    subtotal,
    total,
  }
}

function buildRequestNumber(date = new Date()) {
  const year = `${date.getUTCFullYear()}`
  const month = `${date.getUTCMonth() + 1}`.padStart(2, "0")
  const day = `${date.getUTCDate()}`.padStart(2, "0")
  return `NF-${year}${month}${day}-${ulid().slice(-6).toUpperCase()}`
}

function mapLineItemSnapshot(item: Record<string, unknown>): PickupRequestLineItemSnapshot {
  const optionValues = asRecord(item.variant_option_values)
  const selectedOptions = Object.entries(optionValues ?? {}).reduce<
    PickupRequestLineItemSnapshot["selected_options"]
  >((allOptions, [optionTitle, value]) => {
    const normalizedValue = asString(value)

    if (!normalizedValue) {
      return allOptions
    }

    allOptions.push({
      option_title: optionTitle,
      value: normalizedValue,
    })

    return allOptions
  }, [])

  const quantity = Math.max(asNumber(item.quantity), 0)
  const directUnitPrice = normalizeMoneyAmount(item.unit_price)
  const directSubtotal = normalizeMoneyAmount(item.subtotal)
  const directTotal = normalizeMoneyAmount(item.total)
  const unitPrice =
    directUnitPrice > 0
      ? directUnitPrice
      : quantity > 0 && directSubtotal > 0
        ? directSubtotal / quantity
        : quantity > 0 && directTotal > 0
          ? directTotal / quantity
          : 0
  const total =
    directTotal > 0
      ? directTotal
      : directSubtotal > 0
        ? directSubtotal
        : unitPrice * quantity

  return {
    id: asString(item.id) ?? ulid(),
    title: asString(item.title) ?? asString(item.product_title) ?? "Producto",
    quantity,
    thumbnail: asString(item.thumbnail),
    product_id: asString(item.product_id),
    product_title: asString(item.product_title),
    product_handle: asString(item.product_handle),
    variant_id: asString(item.variant_id),
    variant_title: asString(item.variant_title),
    variant_sku: asString(item.variant_sku),
    unit_price: unitPrice,
    total,
    selected_options: selectedOptions,
  }
}

function asPickupRequestRecord(value: unknown): PickupRequestRecord {
  const record = asRecord(value)

  if (!record?.id || !record.request_number) {
    throw new MedusaError(
      MedusaError.Types.UNEXPECTED_STATE,
      "Pickup request not created correctly."
    )
  }

  return {
    id: asString(record.id) ?? "",
    request_number: asString(record.request_number) ?? "",
    cart_id: asString(record.cart_id) ?? "",
    customer_id: asString(record.customer_id),
    supabase_user_id: asString(record.supabase_user_id),
    email: asString(record.email) ?? "",
    notes: asString(record.notes),
    status: (asString(record.status) as PickupRequestStatus | null) ?? "requested",
    currency_code: asString(record.currency_code) ?? "PEN",
    item_count: asNumber(record.item_count),
    subtotal: asNumber(record.subtotal),
    total: asNumber(record.total),
    line_items_snapshot: Array.isArray(record.line_items_snapshot)
      ? (record.line_items_snapshot as PickupRequestLineItemSnapshot[])
      : [],
    source: asString(record.source) ?? "gym-storefront",
    email_status: (asString(record.email_status) as PickupRequestEmailStatus | null) ?? "pending",
    email_sent_at: asString(record.email_sent_at),
    email_error: asString(record.email_error),
    created_at: asString(record.created_at) ?? new Date(0).toISOString(),
    updated_at: asString(record.updated_at) ?? new Date(0).toISOString(),
  }
}

export const createPickupRequestStep = createStep(
  "create-pickup-request",
  async (input: CreatePickupRequestStepInput, { container }) => {
    let currentCart = await refetchCart(container as Parameters<typeof refetchCart>[0], input.cart_id)

    const pickupRequestService = container.resolve(PICKUP_REQUEST_MODULE) as {
      createPickupRequests: (data: Record<string, unknown>) => Promise<unknown>
      deletePickupRequests: (id: string | string[]) => Promise<void>
      listPickupRequests: (
        filters: Record<string, unknown>,
        config?: Record<string, unknown>
      ) => Promise<Array<Record<string, unknown>>>
    }

    let currentItems = Array.isArray(currentCart.items) ? currentCart.items : []

    if (currentItems.length === 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "El carrito esta vacio y no puede enviarse como pedido pickup."
      )
    }

    const cartMetadata = asRecord(currentCart.metadata)

    if (
      asString(cartMetadata?.pickup_request_status) === "submitted" ||
      asString(cartMetadata?.pickup_request_id)
    ) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Este carrito ya fue enviado como pedido pickup."
      )
    }

    const [existingPickupRequest] = await pickupRequestService.listPickupRequests(
      { cart_id: input.cart_id },
      { take: 1 }
    )

    if (existingPickupRequest?.id) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Este carrito ya tiene una solicitud pickup asociada."
      )
    }

    if (input.customer_id && asString(currentCart.customer_id) !== input.customer_id) {
      await transferCartCustomerWorkflow(container).run({
        input: {
          id: input.cart_id,
          customer_id: input.customer_id,
        },
      })

      currentCart = await refetchCart(container as Parameters<typeof refetchCart>[0], input.cart_id)
      currentItems = Array.isArray(currentCart.items) ? currentCart.items : []
    }

    const lineItemsSnapshot = currentItems.map((item) =>
      mapLineItemSnapshot(asRecord(item) ?? {})
    )
    const snapshotTotals = resolvePickupRequestTotals(
      asRecord(currentCart) ?? {},
      lineItemsSnapshot,
    )

    if (currentItems.length > 0 && snapshotTotals.total <= 0) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Cannot create pickup request for cart ${input.cart_id} because the resolved total is 0 despite having items. Data integrity check failed.`,
      )
    }

    const now = new Date()

    let createdPickupRequestId: string | null = null

    try {
      const created = await pickupRequestService.createPickupRequests({
        request_number: buildRequestNumber(now),
        cart_id: input.cart_id,
        customer_id: input.customer_id ?? asString(currentCart.customer_id),
        supabase_user_id: input.supabase_user_id ?? null,
        email: input.email,
        notes: input.notes ?? null,
        status: "requested",
        currency_code: asString(currentCart.currency_code)?.toUpperCase() ?? "PEN",
        item_count: lineItemsSnapshot.reduce(
          (total, item) => total + Math.max(item.quantity, 0),
          0
        ),
        subtotal: snapshotTotals.subtotal,
        total: snapshotTotals.total,
        line_items_snapshot: lineItemsSnapshot,
        source: "gym-storefront",
        email_status: "pending",
        email_sent_at: null,
        email_error: null,
      })

      const pickupRequest = asPickupRequestRecord(
        Array.isArray(created) ? created[0] : created
      )

      createdPickupRequestId = pickupRequest.id

      await updateCartWorkflow(container).run({
        input: {
          id: input.cart_id,
          email: input.email,
          customer_id:
            input.customer_id ?? asString(currentCart.customer_id) ?? undefined,
          metadata: {
            ...(cartMetadata ?? {}),
            pickup_channel: "gym-storefront",
            pickup_request_id: pickupRequest.id,
            pickup_request_number: pickupRequest.request_number,
            pickup_request_status: "submitted",
            pickup_requested_at: now.toISOString(),
            pickup_request_notes: input.notes ?? null,
            pickup_payment_status: "pending",
            gym_cart_state: "submitted",
          },
        },
      })

      return new StepResponse(pickupRequest, pickupRequest.id)
    } catch (error) {
      if (createdPickupRequestId) {
        await pickupRequestService.deletePickupRequests(createdPickupRequestId)
      }

      throw error
    }
  },
  async (pickupRequestId, { container }) => {
    if (!pickupRequestId) {
      return
    }

    const pickupRequestService = container.resolve(PICKUP_REQUEST_MODULE) as {
      deletePickupRequests: (id: string | string[]) => Promise<void>
    }

    await pickupRequestService.deletePickupRequests(pickupRequestId)
  }
)

export const __createPickupRequestStepTestables = {
  asNumber,
  normalizeMoneyAmount,
  mapLineItemSnapshot,
  resolvePickupRequestTotals,
}
