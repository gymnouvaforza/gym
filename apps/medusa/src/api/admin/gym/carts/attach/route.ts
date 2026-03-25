import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";
import { transferCartCustomerWorkflow, updateCartWorkflow } from "@medusajs/medusa/core-flows";

import { ensureGymCustomer, refetchCart, sendJson } from "../../helpers";
import type { AttachGymCartSchema } from "./middlewares";

export const AUTHENTICATE = false;

export async function POST(
  req: AuthenticatedMedusaRequest<AttachGymCartSchema>,
  res: MedusaResponse,
) {
  const { cart_id, customer_id, email } = req.validatedBody;
  const ensuredCustomer = email
    ? await ensureGymCustomer(req.scope, {
        customerId: customer_id,
        email,
      })
    : null;
  const resolvedCustomerId =
    ensuredCustomer?.customer?.id && typeof ensuredCustomer.customer.id === "string"
      ? ensuredCustomer.customer.id
      : customer_id;

  await transferCartCustomerWorkflow(req.scope).run({
    input: {
      id: cart_id,
      customer_id: resolvedCustomerId,
    },
  });

  if (email) {
    await updateCartWorkflow(req.scope).run({
      input: {
        id: cart_id,
        email,
      },
    });
  }

  const cart = await refetchCart(req.scope, cart_id);
  sendJson(res, { cart });
}
