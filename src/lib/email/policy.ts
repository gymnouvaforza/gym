export function normalizeEmailAddress(value: string) {
  return value.trim().toLowerCase();
}

function extractMailbox(value: string) {
  const match = value.match(/<([^>]+)>/);
  return normalizeEmailAddress(match ? match[1] : value);
}

export function formatTransactionalFromEmail(siteName: string, mailbox: string) {
  return `${siteName.trim() || "Nuova Forza"} <${normalizeEmailAddress(mailbox)}>`;
}

export function resolveTransactionalSender(
  siteName: string,
  configuredMailbox: string | null | undefined,
  fallbackFromEmail: string,
  additionalAllowedMailboxes: Array<string | null | undefined> = [],
) {
  const normalizedConfigured = configuredMailbox?.trim()
    ? normalizeEmailAddress(configuredMailbox)
    : null;
  const fallbackMailbox = extractMailbox(fallbackFromEmail);
  const allowedMailboxes = new Set(
    [fallbackMailbox, ...additionalAllowedMailboxes]
      .filter((value): value is string => Boolean(value?.trim()))
      .map(extractMailbox),
  );

  if (!normalizedConfigured) {
    return {
      fromEmail: fallbackFromEmail,
      replyTo: null,
    };
  }

  if (allowedMailboxes.has(normalizedConfigured)) {
    return {
      fromEmail: formatTransactionalFromEmail(siteName, normalizedConfigured),
      replyTo: null,
    };
  }

  return {
    fromEmail: fallbackFromEmail,
    replyTo:
      normalizedConfigured === fallbackMailbox ? null : normalizedConfigured,
  };
}
