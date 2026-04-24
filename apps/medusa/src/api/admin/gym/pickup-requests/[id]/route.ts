import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http"
import { MedusaError } from "@medusajs/framework/utils"

import { PICKUP_REQUEST_MODULE } from "../../../../../modules/pickupRequest"
import { sendJson } from "../../helpers"
import { serializePickupRequest } from "../serializers"

export const AUTHENTICATE = false

export async function GET(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const pickupRequestService = req.scope.resolve(PICKUP_REQUEST_MODULE) as {
    retrievePickupRequest: (id: string) => Promise<Record<string, unknown> | null>
  }
  const pickupRequestId = req.params.id
  const pickupRequest = await pickupRequestService.retrievePickupRequest(pickupRequestId)

  if (!pickupRequest?.id) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Pickup request with id '${pickupRequestId}' not found.`
    )
  }

  sendJson(res, {
    pickup_request: serializePickupRequest(pickupRequest),
  })
}

export async function DELETE(req: AuthenticatedMedusaRequest, res: MedusaResponse) {
  const pickupRequestService = req.scope.resolve(PICKUP_REQUEST_MODULE) as {
    deletePickupRequests: (id: string | string[]) => Promise<void>
    retrievePickupRequest: (id: string) => Promise<Record<string, unknown> | null>
  }
  const pickupRequestId = req.params.id
  const pickupRequest = await pickupRequestService.retrievePickupRequest(pickupRequestId)

  if (!pickupRequest?.id) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Pickup request with id '${pickupRequestId}' not found.`
    )
  }

  await pickupRequestService.deletePickupRequests(pickupRequestId)

  sendJson(res, {
    id: pickupRequestId,
    object: "pickup_request",
    deleted: true,
  })
}
