import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";

import {
  MEMBER_REGISTRATION_CONFIRM_ERROR,
  buildMemberRegistrationCompleteUrl,
  sanitizeMemberRedirectPath,
} from "@/lib/member-auth-flow";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function buildRedirect(request: Request, path: string) {
  return NextResponse.redirect(new URL(path, request.url));
}

function isSupportedOtpType(value: string | null): value is EmailOtpType {
  return (
    value === "signup" ||
    value === "invite" ||
    value === "magiclink" ||
    value === "recovery" ||
    value === "email_change" ||
    value === "email"
  );
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const next = sanitizeMemberRedirectPath(requestUrl.searchParams.get("next"));
  const supabase = await createSupabaseServerClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return buildRedirect(request, next);
    }
  }

  if (tokenHash && isSupportedOtpType(type)) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

    if (!error) {
      return buildRedirect(request, next);
    }
  }

  return buildRedirect(
    request,
    buildMemberRegistrationCompleteUrl({
      error: MEMBER_REGISTRATION_CONFIRM_ERROR,
    }),
  );
}
