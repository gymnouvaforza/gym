"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send } from "lucide-react";
import Link from "next/link";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { contactFormSchema, type ContactFormValues } from "@/lib/validators/contact";

export default function LeadForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const formId = useId();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  async function onSubmit(data: ContactFormValues) {
    setStatus("loading");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Algo salio mal al enviar el mensaje.");
      }

      setStatus("success");
      reset();
    } catch (err) {
      setStatus("error");
      setErrorMessage(err instanceof Error ? err.message : "Error inesperado.");
    }
  }

  if (status === "success") {
    return (
      <div className="bg-white p-12 text-center shadow-2xl" role="status" aria-live="polite">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-none bg-green-100 text-green-600">
          <Send className="h-8 w-8" />
        </div>
        <h3 className="mt-6 font-display text-2xl font-bold uppercase tracking-tight text-foreground">
          Mensaje enviado
        </h3>
        <p className="mt-4 text-muted">
          Gracias por tu interes. Te contactamos por WhatsApp o email en horario comercial.
        </p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Button variant="outline" onClick={() => setStatus("idle")}>
            Enviar otro mensaje
          </Button>
          <Button asChild className="btn-athletic btn-primary">
            <Link href="#horarios">Ver horarios</Link>
          </Button>
        </div>
      </div>
    );
  }

  const nameError = errors.name?.message;
  const emailError = errors.email?.message;
  const phoneError = errors.phone?.message;
  const messageError = errors.message?.message;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="space-y-6 bg-white p-10 shadow-2xl sm:p-12"
    >
      <p className="text-xs leading-6 text-[#5f6368]">
        Completa este formulario y te respondemos por WhatsApp o email lo antes posible.
      </p>

      <div className="space-y-2">
        <label
          htmlFor="name"
          className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/50"
        >
          Nombre completo
        </label>
        <Input
          id="name"
          placeholder="Ej: Juan Perez"
          className="h-14 bg-[#f8f8f6]"
          aria-invalid={Boolean(nameError)}
          aria-describedby={nameError ? `${formId}-name-error` : undefined}
          {...register("name")}
        />
        {nameError ? (
          <p id={`${formId}-name-error`} role="alert" className="text-xs font-medium text-accent">
            {nameError}
          </p>
        ) : null}
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="email"
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/50"
          >
            Email
          </label>
          <Input
            id="email"
            type="email"
            placeholder="juan@email.com"
            className="h-14 bg-[#f8f8f6]"
            aria-invalid={Boolean(emailError)}
            aria-describedby={emailError ? `${formId}-email-error` : undefined}
            {...register("email")}
          />
          {emailError ? (
            <p id={`${formId}-email-error`} role="alert" className="text-xs font-medium text-accent">
              {emailError}
            </p>
          ) : null}
        </div>
        <div className="space-y-2">
          <label
            htmlFor="phone"
            className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/50"
          >
            Telefono (opcional)
          </label>
          <Input
            id="phone"
            placeholder="+54 9..."
            className="h-14 bg-[#f8f8f6]"
            aria-invalid={Boolean(phoneError)}
            aria-describedby={phoneError ? `${formId}-phone-error` : undefined}
            {...register("phone")}
          />
          {phoneError ? (
            <p id={`${formId}-phone-error`} role="alert" className="text-xs font-medium text-accent">
              {phoneError}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <label
          htmlFor="message"
          className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/50"
        >
          Mensaje
        </label>
        <Textarea
          id="message"
          placeholder="Cuentanos tus objetivos..."
          className="min-h-[120px] resize-none bg-[#f8f8f6]"
          aria-invalid={Boolean(messageError)}
          aria-describedby={messageError ? `${formId}-message-error` : undefined}
          {...register("message")}
        />
        {messageError ? (
          <p id={`${formId}-message-error`} role="alert" className="text-xs font-medium text-accent">
            {messageError}
          </p>
        ) : null}
      </div>

      <div aria-live="polite">
        {status === "error" ? (
          <p role="alert" className="bg-accent/10 p-4 text-sm font-medium text-accent">
            {errorMessage}
          </p>
        ) : null}
      </div>

      <Button
        type="submit"
        disabled={status === "loading"}
        className="btn-athletic btn-primary h-16 w-full text-base"
      >
        {status === "loading" ? (
          <>
            <Loader2 className="mr-3 h-5 w-5 animate-spin" />
            Enviando...
          </>
        ) : (
          "Enviar solicitud de prueba"
        )}
      </Button>

      <p className="text-xs leading-6 text-[#7a7f87]">
        Al enviar tus datos, te contactamos solo para responder tu consulta o agendar una visita.
      </p>
    </form>
  );
}
