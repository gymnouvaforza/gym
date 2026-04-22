"use client";

import Link from "next/link";
import { useState } from "react";

import { CartLineItems } from "./CartLineItems";
import { useCart } from "../hooks/use-cart";
import PublicInlineAlert from "@/components/public/PublicInlineAlert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatCartAmount } from "@/lib/cart/format";
import {
  getPickupRequestPaymentTone,
  pickupRequestPaymentStatusLabels,
} from "@/lib/cart/pickup-request";

export function CartPage() {
  const {
    cart,
    lastSubmittedPickupRequest,
    lastSubmittedWhatsAppUrl,
    pickupEmailWarning,
    notice,
    error,
    isReady,
    isBusy,
    memberEmail,
    clearSubmittedPickupRequest,
    updateItemQuantity,
    removeItem,
    saveEmail,
    submitPickupRequest,
  } = useCart();
  const [guestEmail, setGuestEmail] = useState(cart?.email ?? "");
  const [notes, setNotes] = useState("");
  const [reservationMessage, setReservationMessage] = useState<string | null>(null);

  async function handleSubmitReservation() {
    const normalizedEmail = guestEmail.trim().toLowerCase();

    setReservationMessage(null);

    if (!memberEmail && !normalizedEmail) {
      return;
    }

    if (!memberEmail && normalizedEmail !== cart?.email) {
      await saveEmail(normalizedEmail);
    }

    const pickupRequest = await submitPickupRequest({
      email: memberEmail ? undefined : normalizedEmail || undefined,
      notes: notes.trim() || undefined,
    });

    if (pickupRequest?.id) {
      setReservationMessage(
        "Reserva registrada. Comparte el identificador por WhatsApp para que el equipo cierre la venta contigo.",
      );
    }
  }

  if (!isReady) {
    return (
      <section className="section-shell py-16">
        <div className="border border-black/8 bg-white px-6 py-12 text-center">
          <p className="text-sm text-[#5f6368]">Cargando carrito...</p>
        </div>
      </section>
    );
  }

  if (lastSubmittedPickupRequest) {
    return (
      <section className="section-shell py-16">
        <div className="border border-emerald-200 bg-white px-6 py-12 shadow-[0_24px_70px_-54px_rgba(17,17,17,0.35)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-emerald-700">
            Reserva enviada
          </p>
          <h1 className="mt-4 font-display text-4xl uppercase text-[#111111]">
            Tu pedido asistido ya esta en gestion
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[#4b5563]">
            Referencia <strong>{lastSubmittedPickupRequest.requestNumber}</strong>. Usaremos{" "}
            <strong>{lastSubmittedPickupRequest.email}</strong> para seguir la conversacion desde el
            dashboard y coordinar contigo el cierre manual de la venta.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Badge variant={getPickupRequestPaymentTone(lastSubmittedPickupRequest.paymentStatus)}>
              {pickupRequestPaymentStatusLabels[lastSubmittedPickupRequest.paymentStatus]}
            </Badge>
            <p className="text-xs uppercase tracking-[0.16em] text-[#7a7f87]">
              Cart ID: {lastSubmittedPickupRequest.cartId}
            </p>
            {lastSubmittedPickupRequest.orderId ? (
              <p className="text-xs uppercase tracking-[0.16em] text-[#7a7f87]">
                Order ID: {lastSubmittedPickupRequest.orderId}
              </p>
            ) : null}
          </div>

          {pickupEmailWarning ? (
            <PublicInlineAlert
              tone="warning"
              title="Reserva guardada con seguimiento pendiente"
              message={`La confirmacion por email no se pudo enviar. El equipo puede retomarlo desde el dashboard. Detalle: ${pickupEmailWarning}`}
              compact
            />
          ) : null}

          <PublicInlineAlert
            tone="success"
            title="Siguiente paso"
            message="Abre WhatsApp con el mensaje corto que ya incluye tu referencia para que una persona termine la venta contigo."
            compact
          />

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {lastSubmittedWhatsAppUrl ? (
              <Button asChild>
                <Link href={lastSubmittedWhatsAppUrl} target="_blank" rel="noreferrer">
                  Abrir WhatsApp con mi reserva
                </Link>
              </Button>
            ) : null}
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                clearSubmittedPickupRequest();
              }}
            >
              Cerrar aviso
            </Button>
            <Button asChild variant="outline">
              <Link href="/tienda">Crear otra reserva</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <section className="section-shell py-16">
        <div className="border border-dashed border-black/12 bg-white px-6 py-12 text-center shadow-[0_24px_70px_-54px_rgba(17,17,17,0.35)]">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6b7280]">
            Carrito vacio
          </p>
          <h1 className="mt-4 font-display text-4xl uppercase text-[#111111]">
            Todavia no has reservado nada
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[#4b5563]">
            Explora suplementos, accesorios y merchandising del club para preparar una reserva
            asistida y cerrarla con el equipo por WhatsApp.
          </p>
          <div className="mt-8">
            <Button asChild>
              <Link href="/tienda">Ir a la tienda</Link>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-shell py-12 md:py-16">
      <div className="mb-8 max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#6b7280]">
          Reserva asistida
        </p>
        <h1 className="mt-3 font-display text-5xl uppercase leading-none text-[#111111]">
          Tu seleccion para cerrar con el club
        </h1>
        <p className="mt-4 text-sm leading-7 text-[#4b5563]">
          Revisa cantidades, deja un email de contacto y envia la reserva. La venta no se cobra
          online: una persona del gym la terminara contigo por WhatsApp usando solo el identificador
          operativo del carrito o pedido.
        </p>
      </div>

      {error ? (
        <PublicInlineAlert
          tone="error"
          title="No pudimos actualizar tu reserva"
          message={error}
        />
      ) : null}

      {notice ? (
        <PublicInlineAlert
          tone="success"
          title="Carrito actualizado"
          message={notice}
        />
      ) : null}

      {reservationMessage ? (
        <PublicInlineAlert
          tone="success"
          title="Reserva registrada"
          message={reservationMessage}
        />
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(340px,0.75fr)] lg:items-start">
        <div className="space-y-6">
          <CartLineItems
            items={cart.items}
            disabled={isBusy}
            onQuantityChange={(lineItemId, quantity) => {
              void updateItemQuantity(lineItemId, quantity);
            }}
            onRemove={(lineItemId) => {
              void removeItem(lineItemId);
            }}
          />
        </div>

        <aside className="border border-black/8 bg-white p-6 shadow-[0_24px_70px_-54px_rgba(17,17,17,0.35)]">
          <h2 className="font-display text-3xl uppercase text-[#111111]">Resumen</h2>

          <div className="mt-6 space-y-3 text-sm">
            <div className="flex items-center justify-between text-[#5f6368]">
              <span>Productos</span>
              <span>{cart.summary.itemCount}</span>
            </div>
            <div className="flex items-center justify-between text-[#5f6368]">
              <span>Subtotal</span>
              <span>{formatCartAmount(cart.summary.subtotal, cart.summary.currencyCode)}</span>
            </div>
            <div className="flex items-center justify-between border-t border-black/8 pt-3 font-semibold text-[#111111]">
              <span>Total estimado</span>
              <span>{formatCartAmount(cart.summary.total, cart.summary.currencyCode)}</span>
            </div>
          </div>

          <div className="mt-6">
            <PublicInlineAlert
              tone="info"
              title="Recogida local en Nuova Forza Gym"
              message="Esta reserva solo bloquea la gestion operativa: el cobro y la confirmacion final se cierran manualmente con el equipo."
              compact
            />
          </div>

          {!memberEmail ? (
            <div className="mt-6 space-y-3">
              <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#111111]">
                Email de contacto
              </label>
              <Input
                type="email"
                value={guestEmail}
                onChange={(event) => setGuestEmail(event.target.value)}
                placeholder="tu@email.com"
                disabled={isBusy}
              />
            </div>
          ) : (
            <div className="mt-6 border border-black/8 bg-[#fbfbf8] p-4 text-sm leading-7 text-[#5f6368]">
              La reserva se vinculara a tu cuenta de socio: <strong>{memberEmail}</strong>
            </div>
          )}

          <div className="mt-6 space-y-3">
            <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#111111]">
              Nota para el equipo
            </label>
            <Textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Ejemplo: pasare por recepcion a ultima hora de la tarde."
              disabled={isBusy}
            />
          </div>

          <div className="mt-6">
            <PublicInlineAlert
              tone="info"
              title="WhatsApp con referencia corta"
              message="Al enviar la reserva te devolveremos una referencia y un acceso directo a WhatsApp con solo el identificador del pedido."
              compact
            />
          </div>

          <div className="mt-6 flex flex-col gap-3">
            <Button
              type="button"
              disabled={isBusy || (!memberEmail && !guestEmail.trim())}
              onClick={() => {
                void handleSubmitReservation();
              }}
            >
              {isBusy ? "Enviando reserva..." : "Enviar reserva por WhatsApp"}
            </Button>
            <Button asChild variant="outline">
              <Link href="/tienda">Seguir comprando</Link>
            </Button>
          </div>
        </aside>
      </div>
    </section>
  );
}
