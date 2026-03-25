import type { MedusaResponse } from "@medusajs/framework/http";
import {
  ContainerRegistrationKeys,
  MedusaError,
} from "@medusajs/framework/utils";
import { createCustomersWorkflow } from "@medusajs/medusa/core-flows";

const CUSTOMER_LOOKUP_RETRY_DELAYS_MS = [0, 100, 250, 500];

type GymQueryService = {
  graph: (input: {
    entity: string;
    fields: string[];
    filters: Record<string, unknown>;
  }) => Promise<{ data: Array<Record<string, unknown>> }>;
};

type ScopeResolver = Parameters<typeof createCustomersWorkflow>[0] & {
  resolve: (key: string) => unknown;
};

function getQuery(scope: ScopeResolver) {
  return scope.resolve(ContainerRegistrationKeys.QUERY) as GymQueryService;
}

function sleep(delayMs: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, delayMs);
  });
}

export async function refetchCart(scope: ScopeResolver, id: string) {
  const query = getQuery(scope);

  const { data } = await query.graph({
    entity: "cart",
    fields: [
      "id",
      "email",
      "customer_id",
      "region_id",
      "currency_code",
      "subtotal",
      "total",
      "tax_total",
      "shipping_total",
      "discount_total",
      "completed_at",
      "metadata",
      "items.*",
      "items.unit_price",
      "items.subtotal",
      "items.total",
    ],
    filters: { id },
  });

  const cart = data[0];

  if (!cart) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Cart with id '${id}' not found.`,
    );
  }

  return cart;
}

export async function findCustomerById(scope: ScopeResolver, id: string) {
  const query = getQuery(scope);

  const { data } = await query.graph({
    entity: "customer",
    fields: ["id", "email", "first_name", "last_name"],
    filters: { id },
  });

  return data[0] ?? null;
}

export async function findCustomerByEmail(scope: ScopeResolver, email: string) {
  const query = getQuery(scope);

  const { data } = await query.graph({
    entity: "customer",
    fields: ["id", "email", "first_name", "last_name"],
    filters: { email },
  });

  return data[0] ?? null;
}

export async function refetchCustomer(scope: ScopeResolver, id: string) {
  const customer = await findCustomerById(scope, id);

  if (!customer) {
    throw new MedusaError(
      MedusaError.Types.NOT_FOUND,
      `Customer with id '${id}' not found.`,
    );
  }

  return customer;
}

async function findCustomerWithRetry(
  scope: ScopeResolver,
  lookup: () => Promise<Record<string, unknown> | null>,
) {
  let customer: Record<string, unknown> | null = null;

  for (const delayMs of CUSTOMER_LOOKUP_RETRY_DELAYS_MS) {
    if (delayMs > 0) {
      await sleep(delayMs);
    }

    customer = await lookup();

    if (customer?.id) {
      return customer;
    }
  }

  return null;
}

export async function ensureGymCustomer(
  scope: ScopeResolver,
  input: {
    customerId?: string | null;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
  },
) {
  if (input.customerId) {
    const existingById = await findCustomerById(scope, input.customerId);

    if (existingById?.id) {
      return {
        customer: existingById,
        created: false,
      };
    }
  }

  const existingByEmail = await findCustomerByEmail(scope, input.email);

  if (existingByEmail?.id) {
    return {
      customer: existingByEmail,
      created: false,
    };
  }

  const { result } = await createCustomersWorkflow(scope).run({
    input: {
      customersData: [
        {
          email: input.email,
          first_name: input.firstName ?? undefined,
          last_name: input.lastName ?? undefined,
          has_account: false,
        },
      ],
    },
  });

  const createdCustomerId =
    result[0] && typeof result[0] === "object" && "id" in result[0] ? String(result[0].id) : null;

  const createdCustomer = await findCustomerWithRetry(scope, async () => {
    if (createdCustomerId) {
      const customerById = await findCustomerById(scope, createdCustomerId);

      if (customerById?.id) {
        return customerById;
      }
    }

    return findCustomerByEmail(scope, input.email);
  });

  if (createdCustomer?.id) {
    return {
      customer: createdCustomer,
      created: true,
    };
  }

  throw new MedusaError(
    MedusaError.Types.NOT_FOUND,
    `Customer with email '${input.email}' could not be resolved.`,
  );
}

export function sendJson(res: MedusaResponse, payload: Record<string, unknown>) {
  res.status(200).json(payload);
}
