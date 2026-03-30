import type {
  PickupRequestDetail,
  PickupRequestEmailStatus,
  PickupRequestPaymentStatus,
  PickupRequestStatus,
} from "@/lib/cart/types";

export type PickupRequestSort = "updated_desc" | "created_desc" | "created_asc";
export type PickupRequestAttentionFilter =
  | "all"
  | "action_required"
  | "in_progress"
  | "ready_now"
  | "fulfilled";
export type PickupRequestTone = "default" | "muted" | "success" | "warning";
export type PickupRequestTimelineState = "completed" | "current" | "pending" | "warning";

export interface PickupRequestFilters {
  q: string;
  status: PickupRequestStatus | "all";
  paymentStatus: PickupRequestPaymentStatus | "all";
  emailStatus: PickupRequestEmailStatus | "all";
  attention: PickupRequestAttentionFilter;
  sort: PickupRequestSort;
}

export interface PickupRequestOperationalSummary {
  total: number;
  inProgress: number;
  readyNow: number;
  actionRequired: number;
  fulfilled: number;
}

export interface PickupRequestOperationalHint {
  label: string;
  description: string;
  tone: PickupRequestTone;
}

export interface PickupRequestTimelineStep {
  key: string;
  title: string;
  description: string;
  date: string | null;
  state: PickupRequestTimelineState;
}

export const DEFAULT_PICKUP_REQUEST_FILTERS: PickupRequestFilters = {
  q: "",
  status: "all",
  paymentStatus: "all",
  emailStatus: "all",
  attention: "all",
  sort: "updated_desc",
};

const paymentStatusValues: PickupRequestPaymentStatus[] = [
  "authorized",
  "captured",
  "pending",
  "requires_more",
  "error",
  "canceled",
];

const emailStatusValues: PickupRequestEmailStatus[] = ["pending", "sent", "failed"];

function includesValue(collection: readonly string[], value: string) {
  return collection.includes(value);
}

export function parsePickupRequestFilters(
  params: Record<string, string | string[] | undefined>,
): PickupRequestFilters {
  const q = typeof params.q === "string" ? params.q.trim() : DEFAULT_PICKUP_REQUEST_FILTERS.q;

  let status = DEFAULT_PICKUP_REQUEST_FILTERS.status;
  if (
    params.status === "requested" ||
    params.status === "confirmed" ||
    params.status === "ready_for_pickup" ||
    params.status === "fulfilled" ||
    params.status === "cancelled"
  ) {
    status = params.status;
  }

  let paymentStatus = DEFAULT_PICKUP_REQUEST_FILTERS.paymentStatus;
  if (typeof params.paymentStatus === "string" && includesValue(paymentStatusValues, params.paymentStatus)) {
    paymentStatus = params.paymentStatus as PickupRequestPaymentStatus;
  }

  let emailStatus = DEFAULT_PICKUP_REQUEST_FILTERS.emailStatus;
  if (typeof params.emailStatus === "string" && includesValue(emailStatusValues, params.emailStatus)) {
    emailStatus = params.emailStatus as PickupRequestEmailStatus;
  }

  let attention = DEFAULT_PICKUP_REQUEST_FILTERS.attention;
  if (
    params.attention === "action_required" ||
    params.attention === "in_progress" ||
    params.attention === "ready_now" ||
    params.attention === "fulfilled"
  ) {
    attention = params.attention;
  }

  let sort = DEFAULT_PICKUP_REQUEST_FILTERS.sort;
  if (
    params.sort === "updated_desc" ||
    params.sort === "created_desc" ||
    params.sort === "created_asc"
  ) {
    sort = params.sort;
  }

  return {
    q,
    status,
    paymentStatus,
    emailStatus,
    attention,
    sort,
  };
}

export function isPickupRequestActionRequired(pickupRequest: PickupRequestDetail) {
  return (
    pickupRequest.emailStatus === "failed" ||
    pickupRequest.paymentStatus === "requires_more" ||
    pickupRequest.paymentStatus === "error" ||
    pickupRequest.paymentStatus === "canceled" ||
    pickupRequest.status === "cancelled"
  );
}

function getPickupRequestAttentionBucket(
  pickupRequest: PickupRequestDetail,
): Exclude<PickupRequestAttentionFilter, "all"> {
  if (isPickupRequestActionRequired(pickupRequest)) {
    return "action_required";
  }

  if (pickupRequest.status === "ready_for_pickup") {
    return "ready_now";
  }

  if (pickupRequest.status === "fulfilled") {
    return "fulfilled";
  }

  return "in_progress";
}

export function filterAndSortPickupRequests(
  pickupRequests: PickupRequestDetail[],
  filters: PickupRequestFilters,
) {
  let filtered = [...pickupRequests];

  if (filters.q) {
    const query = filters.q.toLowerCase();

    filtered = filtered.filter((pickupRequest) =>
      [
        pickupRequest.requestNumber,
        pickupRequest.email,
        pickupRequest.cartId,
        pickupRequest.orderId,
        pickupRequest.paypalOrderId,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }

  if (filters.status !== "all") {
    filtered = filtered.filter((pickupRequest) => pickupRequest.status === filters.status);
  }

  if (filters.paymentStatus !== "all") {
    filtered = filtered.filter(
      (pickupRequest) => pickupRequest.paymentStatus === filters.paymentStatus,
    );
  }

  if (filters.emailStatus !== "all") {
    filtered = filtered.filter((pickupRequest) => pickupRequest.emailStatus === filters.emailStatus);
  }

  if (filters.attention !== "all") {
    filtered = filtered.filter(
      (pickupRequest) => getPickupRequestAttentionBucket(pickupRequest) === filters.attention,
    );
  }

  filtered.sort((left, right) => {
    switch (filters.sort) {
      case "created_asc":
        return left.createdAt.localeCompare(right.createdAt);
      case "created_desc":
        return right.createdAt.localeCompare(left.createdAt);
      case "updated_desc":
      default:
        return right.updatedAt.localeCompare(left.updatedAt);
    }
  });

  return filtered;
}

export function hasActivePickupRequestFilters(filters: PickupRequestFilters) {
  return (
    filters.q !== DEFAULT_PICKUP_REQUEST_FILTERS.q ||
    filters.status !== DEFAULT_PICKUP_REQUEST_FILTERS.status ||
    filters.paymentStatus !== DEFAULT_PICKUP_REQUEST_FILTERS.paymentStatus ||
    filters.emailStatus !== DEFAULT_PICKUP_REQUEST_FILTERS.emailStatus ||
    filters.attention !== DEFAULT_PICKUP_REQUEST_FILTERS.attention ||
    filters.sort !== DEFAULT_PICKUP_REQUEST_FILTERS.sort
  );
}

export function summarizePickupRequests(
  pickupRequests: PickupRequestDetail[],
): PickupRequestOperationalSummary {
  return pickupRequests.reduce<PickupRequestOperationalSummary>(
    (summary, pickupRequest) => {
      summary.total += 1;

      switch (getPickupRequestAttentionBucket(pickupRequest)) {
        case "action_required":
          summary.actionRequired += 1;
          break;
        case "ready_now":
          summary.readyNow += 1;
          break;
        case "fulfilled":
          summary.fulfilled += 1;
          break;
        case "in_progress":
        default:
          summary.inProgress += 1;
          break;
      }

      return summary;
    },
    {
      total: 0,
      inProgress: 0,
      readyNow: 0,
      actionRequired: 0,
      fulfilled: 0,
    },
  );
}

export function getPickupRequestOperationalHint(
  pickupRequest: PickupRequestDetail,
): PickupRequestOperationalHint {
  if (pickupRequest.emailStatus === "failed") {
    return {
      label: "Reintentar email",
      description:
        "El ultimo envio fallo. Revisa el error registrado y vuelve a lanzar la notificacion al cliente.",
      tone: "warning",
    };
  }

  if (
    pickupRequest.paymentStatus === "requires_more" ||
    pickupRequest.paymentStatus === "error" ||
    pickupRequest.paymentStatus === "canceled"
  ) {
    return {
      label: "Revisar cobro",
      description:
        "El pago no esta estable. Confirma el estado real antes de preparar o marcar el pedido como listo.",
      tone: "warning",
    };
  }

  switch (pickupRequest.status) {
    case "requested":
      return {
        label: "Confirmar pedido",
        description:
          "Valida internamente el cobro y la disponibilidad para mover el pedido al siguiente estado.",
        tone: "default",
      };
    case "confirmed":
      return {
        label: "Preparar recogida",
        description:
          "El pedido ya esta confirmado. El siguiente paso operativo es dejarlo listo para recoger.",
        tone: "default",
      };
    case "ready_for_pickup":
      return {
        label: "Esperando cliente",
        description:
          "El pedido ya puede entregarse. Marca la entrega cuando el socio o invitado pase por el club.",
        tone: "success",
      };
    case "fulfilled":
      return {
        label: "Pedido cerrado",
        description: "No hay tareas operativas pendientes salvo una incidencia posterior.",
        tone: "muted",
      };
    case "cancelled":
      return {
        label: "Revisar cancelacion",
        description:
          "Comprueba si hace falta cierre manual, devolucion o aclaracion con el cliente.",
        tone: "warning",
      };
    default:
      return {
        label: "Seguimiento activo",
        description: "Mantiene el pedido bajo control hasta cerrar entrega y comunicacion.",
        tone: "default",
      };
  }
}

export function buildPickupRequestTimeline(
  pickupRequest: PickupRequestDetail,
): PickupRequestTimelineStep[] {
  const paymentStep: PickupRequestTimelineStep = (() => {
    switch (pickupRequest.paymentStatus) {
      case "captured":
        return {
          key: "payment",
          title: "Pago",
          description: "Cobro confirmado y registrado en la pasarela.",
          date: pickupRequest.paymentCapturedAt ?? pickupRequest.paymentAuthorizedAt,
          state: "completed",
        };
      case "authorized":
        return {
          key: "payment",
          title: "Pago",
          description: "Cobro autorizado. Conviene vigilar que el cierre quede consolidado.",
          date: pickupRequest.paymentAuthorizedAt,
          state: "current",
        };
      case "requires_more":
        return {
          key: "payment",
          title: "Pago",
          description: "La pasarela pide accion adicional antes de darlo por bueno.",
          date: pickupRequest.paymentAuthorizedAt,
          state: "warning",
        };
      case "error":
      case "canceled":
        return {
          key: "payment",
          title: "Pago",
          description: "El pago quedo con incidencia y necesita revision manual.",
          date: pickupRequest.updatedAt,
          state: "warning",
        };
      case "pending":
      default:
        return {
          key: "payment",
          title: "Pago",
          description: "Pendiente de una confirmacion final de cobro.",
          date: null,
          state: "pending",
        };
    }
  })();

  const emailStep: PickupRequestTimelineStep = (() => {
    switch (pickupRequest.emailStatus) {
      case "sent":
        return {
          key: "email",
          title: "Email",
          description: "La notificacion al cliente quedo enviada.",
          date: pickupRequest.emailSentAt,
          state: "completed",
        };
      case "failed":
        return {
          key: "email",
          title: "Email",
          description:
            pickupRequest.emailError ??
            "El ultimo intento de envio fallo y deberia revisarse antes de cerrar el pedido.",
          date: pickupRequest.updatedAt,
          state: "warning",
        };
      case "pending":
      default:
        return {
          key: "email",
          title: "Email",
          description: "Aun no hay constancia de notificacion confirmada al cliente.",
          date: null,
          state: "pending",
        };
    }
  })();

  const pickupStep: PickupRequestTimelineStep = (() => {
    switch (pickupRequest.status) {
      case "confirmed":
        return {
          key: "pickup",
          title: "Recogida",
          description: "Pedido confirmado y en preparacion interna.",
          date: pickupRequest.updatedAt,
          state: "current",
        };
      case "ready_for_pickup":
        return {
          key: "pickup",
          title: "Recogida",
          description: "Ya esta listo para recoger en el club.",
          date: pickupRequest.updatedAt,
          state: "completed",
        };
      case "fulfilled":
        return {
          key: "pickup",
          title: "Recogida",
          description: "Entrega cerrada y pedido completado.",
          date: pickupRequest.updatedAt,
          state: "completed",
        };
      case "cancelled":
        return {
          key: "pickup",
          title: "Recogida",
          description: "El pedido se marco como cancelado.",
          date: pickupRequest.updatedAt,
          state: "warning",
        };
      case "requested":
      default:
        return {
          key: "pickup",
          title: "Recogida",
          description: "Pendiente de confirmacion interna y preparacion.",
          date: null,
          state: "pending",
        };
    }
  })();

  return [
    {
      key: "request",
      title: "Solicitud",
      description: "Pedido pickup recibido y congelado para seguimiento operativo.",
      date: pickupRequest.createdAt,
      state: "completed",
    },
    paymentStep,
    emailStep,
    pickupStep,
  ];
}
