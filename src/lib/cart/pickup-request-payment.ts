import type { PickupRequestDetail, PickupRequestPaymentStatus } from "@/lib/cart/types";

export type PickupRequestManualPaymentStatus =
  | "pending"
  | "partial"
  | "paid"
  | "overpaid";

export interface PickupRequestManualPaymentSummaryLike {
  status: PickupRequestManualPaymentStatus;
  updatedAt: string | null;
}

export function getEffectivePickupRequestPaymentStatus(input: {
  paymentStatus: PickupRequestPaymentStatus;
  manualPaymentStatus: PickupRequestManualPaymentStatus;
}): PickupRequestPaymentStatus {
  if (input.manualPaymentStatus === "paid" || input.manualPaymentStatus === "overpaid") {
    return "captured";
  }

  if (input.manualPaymentStatus === "partial") {
    return "authorized";
  }

  return input.paymentStatus;
}

export function getEffectivePickupRequestPaymentLabel(input: {
  paymentStatus: PickupRequestPaymentStatus;
  manualPaymentStatus: PickupRequestManualPaymentStatus;
  defaultLabel: string;
}) {
  if (input.manualPaymentStatus === "paid") {
    return "Pago completado";
  }

  if (input.manualPaymentStatus === "overpaid") {
    return "Pago completado con excedente";
  }

  if (input.manualPaymentStatus === "partial") {
    return "Pago parcial";
  }

  return input.defaultLabel;
}

export function applyManualPaymentSummaryToPickupRequest(
  pickupRequest: PickupRequestDetail,
  manualPaymentSummary: PickupRequestManualPaymentSummaryLike,
): PickupRequestDetail {
  const effectivePaymentStatus = getEffectivePickupRequestPaymentStatus({
    paymentStatus: pickupRequest.paymentStatus,
    manualPaymentStatus: manualPaymentSummary.status,
  });

  return {
    ...pickupRequest,
    paymentStatus: effectivePaymentStatus,
    paymentAuthorizedAt:
      manualPaymentSummary.status === "partial"
        ? manualPaymentSummary.updatedAt ?? pickupRequest.paymentAuthorizedAt
        : pickupRequest.paymentAuthorizedAt,
    paymentCapturedAt:
      manualPaymentSummary.status === "paid" || manualPaymentSummary.status === "overpaid"
        ? manualPaymentSummary.updatedAt ?? pickupRequest.paymentCapturedAt
        : pickupRequest.paymentCapturedAt,
  };
}
