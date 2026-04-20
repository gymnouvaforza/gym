import { getFirebaseAdminAuth } from "@/lib/firebase/server";
import { sendSmtpEmail } from "@/lib/email/smtp";
import { sanitizeMemberRedirectPath } from "@/lib/member-auth-flow";

type FirebaseEmailActionMode = "resetPassword" | "verifyEmail" | "verifyAndChangeEmail";

function buildActionSettings(url: string) {
  return {
    url,
    handleCodeInApp: false,
  };
}

function buildLocalActionUrl(input: {
  absoluteOrigin: string;
  generatedLink: string;
  fallbackMode: FirebaseEmailActionMode;
  localPath: "/auth/confirm" | "/actualizar-contrasena";
}) {
  const generatedUrl = new URL(input.generatedLink);
  const mode = (generatedUrl.searchParams.get("mode") ??
    input.fallbackMode) as FirebaseEmailActionMode;
  const oobCode = generatedUrl.searchParams.get("oobCode");
  const continueUrl = generatedUrl.searchParams.get("continueUrl");
  const next = sanitizeMemberRedirectPath(continueUrl);

  if (!oobCode) {
    throw new Error("Firebase no devolvio un codigo valido para la accion por email.");
  }

  const localUrl = new URL(input.localPath, input.absoluteOrigin);
  localUrl.searchParams.set("mode", mode);
  localUrl.searchParams.set("oobCode", oobCode);
  localUrl.searchParams.set("next", next);

  return localUrl.toString();
}

function buildEmailShell(input: {
  actionLabel: string;
  actionUrl: string;
  body: string;
  subject: string;
  to: string;
}) {
  return sendSmtpEmail({
    to: input.to,
    subject: input.subject,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#111111">
        <p style="font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#d71920;font-weight:700;margin:0 0 12px">
          Nuova Forza
        </p>
        <p style="font-size:16px;line-height:1.7;margin:0 0 24px">${input.body}</p>
        <p style="margin:0 0 24px">
          <a href="${input.actionUrl}" style="display:inline-block;background:#111111;color:#ffffff;text-decoration:none;padding:14px 20px;font-weight:700">
            ${input.actionLabel}
          </a>
        </p>
        <p style="font-size:13px;line-height:1.7;color:#5f6368;margin:0">
          Si el boton no funciona, copia este enlace en tu navegador:<br />
          <span style="word-break:break-all">${input.actionUrl}</span>
        </p>
      </div>
    `,
    text: `${input.body}\n\n${input.actionLabel}: ${input.actionUrl}`,
  });
}

async function ensureAuthenticatedRoleClaim(uid: string) {
  const auth = getFirebaseAdminAuth();
  const user = await auth.getUser(uid);
  const claims = user.customClaims ?? {};

  if (claims.role === "authenticated") {
    return user;
  }

  await auth.setCustomUserClaims(uid, {
    ...claims,
    role: "authenticated",
  });

  return auth.getUser(uid);
}

export async function ensureFirebaseUserRoleClaimByEmail(email: string) {
  const auth = getFirebaseAdminAuth();
  const user = await auth.getUserByEmail(email);
  return ensureAuthenticatedRoleClaim(user.uid);
}

export async function sendFirebaseVerificationEmail(input: {
  email: string;
  absoluteOrigin: string;
  nextPath: string;
}) {
  const auth = getFirebaseAdminAuth();
  await ensureFirebaseUserRoleClaimByEmail(input.email);
  const link = await auth.generateEmailVerificationLink(
    input.email,
    buildActionSettings(new URL(input.nextPath, input.absoluteOrigin).toString()),
  );

  const actionUrl = buildLocalActionUrl({
    absoluteOrigin: input.absoluteOrigin,
    fallbackMode: "verifyEmail",
    generatedLink: link,
    localPath: "/auth/confirm",
  });

  await buildEmailShell({
    actionLabel: "Confirmar correo",
    actionUrl,
    body: "Tu cuenta ya fue creada. Confirma tu correo para activar el acceso privado del gimnasio.",
    subject: "Confirma tu acceso a Nuova Forza",
    to: input.email,
  });
}

export async function sendFirebasePasswordResetEmail(input: {
  email: string;
  absoluteOrigin: string;
  nextPath: string;
}) {
  const auth = getFirebaseAdminAuth();
  const link = await auth.generatePasswordResetLink(
    input.email,
    buildActionSettings(new URL(input.nextPath, input.absoluteOrigin).toString()),
  );

  const actionUrl = buildLocalActionUrl({
    absoluteOrigin: input.absoluteOrigin,
    fallbackMode: "resetPassword",
    generatedLink: link,
    localPath: "/actualizar-contrasena",
  });

  await buildEmailShell({
    actionLabel: "Elegir nueva contrasena",
    actionUrl,
    body: "Recibimos una solicitud para recuperar tu contrasena. Usa este enlace para crear una nueva de forma segura.",
    subject: "Recupera tu contrasena de Nuova Forza",
    to: input.email,
  });
}

export async function sendFirebaseVerifyAndChangeEmail(input: {
  absoluteOrigin: string;
  currentEmail: string;
  newEmail: string;
  nextPath: string;
}) {
  const auth = getFirebaseAdminAuth();
  const link = await auth.generateVerifyAndChangeEmailLink(
    input.currentEmail,
    input.newEmail,
    buildActionSettings(new URL(input.nextPath, input.absoluteOrigin).toString()),
  );

  const actionUrl = buildLocalActionUrl({
    absoluteOrigin: input.absoluteOrigin,
    fallbackMode: "verifyAndChangeEmail",
    generatedLink: link,
    localPath: "/auth/confirm",
  });

  await buildEmailShell({
    actionLabel: "Confirmar nuevo correo",
    actionUrl,
    body: "Antes de cambiar tu email de acceso, necesitamos confirmar que controlas la nueva direccion.",
    subject: "Confirma tu nuevo correo en Nuova Forza",
    to: input.newEmail,
  });
}
