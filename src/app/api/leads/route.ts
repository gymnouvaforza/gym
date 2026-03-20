import { handleLeadIntakeRequest } from "@/lib/lead-intake";

export async function POST(request: Request) {
  return handleLeadIntakeRequest(request);
}
