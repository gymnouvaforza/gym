import { describe, expect, it } from "vitest";

import { resolveTransactionalSender } from "@/lib/email/policy";

describe("resolveTransactionalSender", () => {
  it("uses the configured mailbox as from when it is explicitly allowed", () => {
    expect(
      resolveTransactionalSender(
        "Nuova Forza",
        "pedidos@novaforza.pe",
        "Nuova Forza <club@gmail.com>",
        ["pedidos@novaforza.pe"],
      ),
    ).toEqual({
      fromEmail: "Nuova Forza <pedidos@novaforza.pe>",
      replyTo: null,
    });
  });

  it("falls back to the technical sender and keeps the configured mailbox as reply-to", () => {
    expect(
      resolveTransactionalSender(
        "Nuova Forza",
        "pedidos@novaforza.pe",
        "Nuova Forza <club@gmail.com>",
      ),
    ).toEqual({
      fromEmail: "Nuova Forza <club@gmail.com>",
      replyTo: "pedidos@novaforza.pe",
    });
  });

  it("keeps the fallback sender when there is no configured mailbox", () => {
    expect(
      resolveTransactionalSender(
        "Nuova Forza",
        "",
        "Nuova Forza <club@gmail.com>",
      ),
    ).toEqual({
      fromEmail: "Nuova Forza <club@gmail.com>",
      replyTo: null,
    });
  });
});
