import { getMedusaEnv, hasMedusaAdminEnv } from "@/lib/env";
import { getMedusaAdminSdk } from "@/lib/medusa/admin-sdk";
import type {
  DBMemberProfile,
  DBMembershipPlan,
  DBMembershipRequest,
} from "@/lib/supabase/database.types";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

type MembershipCommerceSyncStatus = "pending" | "ok" | "error";

interface MedusaDraftOrder {
  id?: string | null;
}

interface MedusaOrder {
  id?: string | null;
  cart_id?: string | null;
}

interface MedusaProductVariantRef {
  id?: string | null;
}

interface MedusaProductRef {
  id?: string | null;
  handle?: string | null;
  variants?: MedusaProductVariantRef[] | null;
}

const TECHNICAL_PLAN_OPTION_TITLE = "Modalidad";
const TECHNICAL_PLAN_OPTION_VALUE = "Unica";
const TECHNICAL_PRODUCT_FIELDS = "id,handle,*variants";

function toMinorUnits(amount: number) {
  return Math.round(amount * 100);
}

function buildTechnicalMembershipHandle(planSlug: string) {
  return `membership-${planSlug}`;
}

function buildTechnicalMembershipSku(planSlug: string) {
  return `MEM-${planSlug.replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toUpperCase()}`;
}

function normalizeMedusaError(error: unknown, fallback: string) {
  if (!error || typeof error !== "object") {
    return fallback;
  }

  const record = error as {
    body?: { error?: unknown; message?: unknown } | null;
    message?: unknown;
    status?: unknown;
    statusText?: unknown;
  };

  const messageCandidates = [
    record.message,
    record.body?.message,
    record.body?.error,
    record.statusText,
  ];

  const message = messageCandidates.find(
    (candidate): candidate is string => typeof candidate === "string" && candidate.trim().length > 0,
  );

  return message?.trim() ?? fallback;
}

async function getDefaultShippingProfileId() {
  const sdk = getMedusaAdminSdk();
  const response = (await sdk.admin.shippingProfile.list({
    limit: 20,
  } as never)) as {
    shipping_profiles?: Array<{ id: string; type?: string | null }>;
  };

  const profile =
    response.shipping_profiles?.find((entry) => entry.type === "default") ??
    response.shipping_profiles?.[0] ??
    null;

  if (!profile?.id) {
    throw new Error("Medusa no tiene ningun shipping profile disponible para membresias.");
  }

  return profile.id;
}

async function getDefaultSalesChannelId() {
  const sdk = getMedusaAdminSdk();
  const response = (await sdk.admin.store.list({
    limit: 1,
    fields: "id,default_sales_channel_id",
  } as never)) as {
    stores?: Array<{
      default_sales_channel_id?: string | null;
      id: string;
    }>;
  };

  const salesChannelId = response.stores?.[0]?.default_sales_channel_id ?? null;

  if (!salesChannelId) {
    throw new Error("Medusa no tiene un default sales channel configurado para membresias.");
  }

  return salesChannelId;
}

function getRequiredRegionId() {
  const regionId = getMedusaEnv().regionId;

  if (!regionId) {
    throw new Error("Falta MEDUSA_REGION_ID para crear el mirror tecnico de membresias.");
  }

  return regionId;
}

async function persistMembershipPlanMirror(
  planId: string,
  patch: Partial<
    Pick<
      DBMembershipPlan,
      | "medusa_product_id"
      | "medusa_variant_id"
      | "medusa_sync_error"
      | "medusa_sync_status"
      | "medusa_synced_at"
    >
  >,
) {
  const client = createSupabaseAdminClient();
  const { error } = await client.from("membership_plans").update(patch).eq("id", planId);

  if (error) {
    throw new Error(error.message);
  }
}

async function persistMembershipRequestMirror(
  requestId: string,
  patch: Partial<
    Pick<
      DBMembershipRequest,
      | "medusa_cart_id"
      | "medusa_order_id"
      | "medusa_product_id"
      | "medusa_sync_error"
      | "medusa_sync_status"
      | "medusa_synced_at"
      | "medusa_variant_id"
    >
  >,
) {
  const client = createSupabaseAdminClient();
  const { error } = await client.from("membership_requests").update(patch).eq("id", requestId);

  if (error) {
    throw new Error(error.message);
  }
}

async function listTechnicalProducts(handle: string) {
  const sdk = getMedusaAdminSdk();
  const response = (await sdk.admin.product.list({
    handle,
    fields: TECHNICAL_PRODUCT_FIELDS,
    limit: 5,
  } as never)) as {
    products?: MedusaProductRef[];
  };

  return response.products ?? [];
}

async function retrieveTechnicalProduct(productId: string) {
  const sdk = getMedusaAdminSdk();
  const response = (await sdk.admin.product.retrieve(productId, {
    fields: TECHNICAL_PRODUCT_FIELDS,
  } as never)) as {
    product?: MedusaProductRef;
  };

  return response.product ?? null;
}

async function createTechnicalProduct(plan: DBMembershipPlan) {
  const sdk = getMedusaAdminSdk();
  const shippingProfileId = await getDefaultShippingProfileId();
  const salesChannelId = await getDefaultSalesChannelId();
  const handle = buildTechnicalMembershipHandle(plan.slug);
  const response = (await sdk.admin.product.create(
    {
      description: plan.description ?? undefined,
      discountable: false,
      handle,
      metadata: {
        billing_label: plan.billing_label,
        currency_code: plan.currency_code,
        duration_days: plan.duration_days,
        gym_entity: "membership_plan",
        membership_plan_id: plan.id,
      },
      options: [
        {
          title: TECHNICAL_PLAN_OPTION_TITLE,
          values: [TECHNICAL_PLAN_OPTION_VALUE],
        },
      ],
      sales_channels: [{ id: salesChannelId }],
      shipping_profile_id: shippingProfileId,
      status: "published",
      subtitle: "Mirror tecnico de membresia",
      title: `[Membership] ${plan.title}`,
      variants: [
        {
          manage_inventory: false,
          options: {
            [TECHNICAL_PLAN_OPTION_TITLE]: TECHNICAL_PLAN_OPTION_VALUE,
          },
          prices: [
            {
              amount: toMinorUnits(plan.price_amount),
              currency_code: plan.currency_code.toLowerCase(),
            },
          ],
          sku: buildTechnicalMembershipSku(plan.slug),
          title: TECHNICAL_PLAN_OPTION_VALUE,
        },
      ],
    } as never,
    { fields: TECHNICAL_PRODUCT_FIELDS } as never,
  )) as { product?: MedusaProductRef };

  return response.product ?? null;
}

async function ensureMembershipPlanMirror(plan: DBMembershipPlan) {
  try {
    const sdk = getMedusaAdminSdk();
    const technicalHandle = buildTechnicalMembershipHandle(plan.slug);

    let product: MedusaProductRef | null =
      (plan.medusa_product_id ? await retrieveTechnicalProduct(plan.medusa_product_id) : null) ??
      (await listTechnicalProducts(technicalHandle))[0] ??
      null;

    if (!product) {
      product = await createTechnicalProduct(plan);
    } else {
      product =
        (
          (await sdk.admin.product.update(
            product.id ?? "",
            {
              description: plan.description ?? undefined,
              handle: technicalHandle,
              metadata: {
                billing_label: plan.billing_label,
                currency_code: plan.currency_code,
                duration_days: plan.duration_days,
                gym_entity: "membership_plan",
                membership_plan_id: plan.id,
              },
              status: "published",
              subtitle: "Mirror tecnico de membresia",
              title: `[Membership] ${plan.title}`,
            } as never,
            { fields: TECHNICAL_PRODUCT_FIELDS } as never,
          )) as { product?: MedusaProductRef }
        ).product ?? product;
    }

    const productId = product?.id ?? null;
    const variantId = product?.variants?.[0]?.id ?? null;

    if (!productId || !variantId) {
      throw new Error("El mirror tecnico del plan no devolvio producto y variante validos.");
    }

    await sdk.admin.product.updateVariant(
      productId,
      variantId,
      {
        manage_inventory: false,
        prices: [
          {
            amount: toMinorUnits(plan.price_amount),
            currency_code: plan.currency_code.toLowerCase(),
          },
        ],
        sku: buildTechnicalMembershipSku(plan.slug),
        title: TECHNICAL_PLAN_OPTION_VALUE,
      } as never,
    );

    const syncedAt = new Date().toISOString();
    await persistMembershipPlanMirror(plan.id, {
      medusa_product_id: productId,
      medusa_variant_id: variantId,
      medusa_sync_error: null,
      medusa_sync_status: "ok",
      medusa_synced_at: syncedAt,
    });

    return {
      productId,
      variantId,
    };
  } catch (error) {
    await persistMembershipPlanMirror(plan.id, {
      medusa_sync_error: normalizeMedusaError(
        error,
        "No se pudo asegurar el producto tecnico de la membresia.",
      ),
      medusa_sync_status: "error",
      medusa_synced_at: new Date().toISOString(),
    });
    throw error;
  }
}

async function readMembershipCommerceContext(requestId: string) {
  const client = createSupabaseAdminClient();
  const [requestResult, planResult] = await Promise.all([
    client.from("membership_requests").select("*").eq("id", requestId).maybeSingle(),
    client
      .from("membership_requests")
      .select("membership_plan_id, member_id")
      .eq("id", requestId)
      .maybeSingle(),
  ]);

  if (requestResult.error) {
    throw new Error(requestResult.error.message);
  }

  if (!requestResult.data) {
    throw new Error("La solicitud de membresia no existe para sincronizarla con Medusa.");
  }

  const context = planResult.data;

  if (planResult.error || !context) {
    throw new Error(planResult.error?.message ?? "No se pudo resolver el contexto de la solicitud.");
  }

  const [planQuery, memberQuery] = await Promise.all([
    client
      .from("membership_plans")
      .select("*")
      .eq("id", context.membership_plan_id)
      .maybeSingle(),
    client
      .from("member_profiles")
      .select("*")
      .eq("id", context.member_id)
      .maybeSingle(),
  ]);

  if (planQuery.error) {
    throw new Error(planQuery.error.message);
  }

  if (memberQuery.error) {
    throw new Error(memberQuery.error.message);
  }

  if (!planQuery.data || !memberQuery.data) {
    throw new Error("La solicitud no tiene socio o plan valido para crear el mirror tecnico.");
  }

  return {
    member: memberQuery.data as DBMemberProfile,
    plan: planQuery.data as DBMembershipPlan,
    request: requestResult.data as DBMembershipRequest,
  };
}

export async function syncMembershipRequestToMedusa(
  membershipRequestId: string,
): Promise<{ status: MembershipCommerceSyncStatus }> {
  if (!hasMedusaAdminEnv()) {
    const errorMessage =
      "Configura MEDUSA_ADMIN_API_KEY y MEDUSA_BACKEND_URL para reflejar membresias en Medusa.";
    await persistMembershipRequestMirror(membershipRequestId, {
      medusa_sync_error: errorMessage,
      medusa_sync_status: "error",
      medusa_synced_at: new Date().toISOString(),
    });

    return { status: "error" };
  }

  try {
    const { member, plan, request } = await readMembershipCommerceContext(membershipRequestId);
    const { productId, variantId } = await ensureMembershipPlanMirror(plan);

    await persistMembershipRequestMirror(request.id, {
      medusa_product_id: productId,
      medusa_variant_id: variantId,
      medusa_sync_error: null,
      medusa_sync_status: "pending",
      medusa_synced_at: new Date().toISOString(),
    });

    const sdk = getMedusaAdminSdk();
    const regionId = getRequiredRegionId();
    const salesChannelId = await getDefaultSalesChannelId();

    const draftOrderResponse = (await sdk.admin.draftOrder.create(
      {
        email: request.email,
        items: [
          {
            quantity: 1,
            variant_id: variantId,
          },
        ],
        metadata: {
          gym_entity: "membership_request",
          member_id: member.id,
          membership_plan_id: plan.id,
          membership_request_id: request.id,
          request_number: request.request_number,
          source: request.source,
          supabase_user_id: request.supabase_user_id,
        },
        region_id: regionId,
        sales_channel_id: salesChannelId,
      } as never,
      {
        fields: "id",
      } as never,
    )) as { draft_order?: MedusaDraftOrder };

    const draftOrderId = draftOrderResponse.draft_order?.id ?? null;

    if (!draftOrderId) {
      throw new Error("Medusa no devolvio el draft order tecnico de la membresia.");
    }

    const orderResponse = (await sdk.admin.draftOrder.convertToOrder(draftOrderId, {
      fields: "id,cart_id",
    } as never)) as { order?: MedusaOrder };

    const orderId = orderResponse.order?.id ?? null;

    if (!orderId) {
      throw new Error(
        `Medusa creo el draft order ${draftOrderId}, pero no devolvio una order al convertirlo.`,
      );
    }

    await persistMembershipRequestMirror(request.id, {
      medusa_cart_id: orderResponse.order?.cart_id ?? null,
      medusa_order_id: orderId,
      medusa_product_id: productId,
      medusa_sync_error: null,
      medusa_sync_status: "ok",
      medusa_synced_at: new Date().toISOString(),
      medusa_variant_id: variantId,
    });

    return { status: "ok" };
  } catch (error) {
    await persistMembershipRequestMirror(membershipRequestId, {
      medusa_sync_error: normalizeMedusaError(
        error,
        "No se pudo reflejar la membresia en Medusa.",
      ),
      medusa_sync_status: "error",
      medusa_synced_at: new Date().toISOString(),
    });

    return { status: "error" };
  }
}
