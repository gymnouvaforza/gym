import type {
  AuthenticatedMedusaRequest,
  MedusaResponse,
} from "@medusajs/framework/http";

import { ensureGymCustomer, sendJson } from "../../helpers";
import type { ResolveGymCustomerSchema } from "./middlewares";

export const AUTHENTICATE = false;

export async function POST(
  req: AuthenticatedMedusaRequest<ResolveGymCustomerSchema>,
  res: MedusaResponse,
) {
  const { email, first_name, last_name } = req.validatedBody;
  const result = await ensureGymCustomer(req.scope, {
    email,
    firstName: first_name ?? null,
    lastName: last_name ?? null,
  });

  sendJson(res, {
    customer: result.customer,
    created: result.created,
  });
}
