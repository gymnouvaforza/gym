"use client";

import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  membershipRequestDatesSchema,
  type MembershipRequestDatesInput,
} from "@/lib/validators/memberships";
import { updateMembershipRequestDatesAction } from "@/app/(admin)/dashboard/membresias/actions";

interface MembershipRequestDatesFormProps {
  membershipRequestId: string;
  memberId: string;
  defaultValues: {
    cycleStartsOn: string;
    cycleEndsOn: string;
  };
}

export default function MembershipRequestDatesForm({
  membershipRequestId,
  memberId,
  defaultValues,
}: Readonly<MembershipRequestDatesFormProps>) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const form = useForm<MembershipRequestDatesInput>({
    resolver: zodResolver(membershipRequestDatesSchema),
    defaultValues: {
      cycleStartsOn: defaultValues.cycleStartsOn,
      cycleEndsOn: defaultValues.cycleEndsOn,
    },
  });

  const onSubmit = (values: MembershipRequestDatesInput) => {
    startTransition(async () => {
      try {
        await updateMembershipRequestDatesAction(
          membershipRequestId,
          values,
          memberId
        );
        toast.success("Vigencia de la membresía actualizada.");
        router.refresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "No se pudo actualizar la vigencia."
        );
      }
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-5 bg-black/[0.02] border border-black/10">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="cycleStartsOn"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]">
                  Inicio Ciclo
                </FormLabel>
                <FormControl>
                  <Input type="date" {...field} className="h-11 rounded-none border-black/10" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cycleEndsOn"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]">
                  Fin Ciclo
                </FormLabel>
                <FormControl>
                  <Input type="date" {...field} className="h-11 rounded-none border-black/10" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button
          type="submit"
          disabled={isPending || !form.formState.isDirty}
          className="h-11 w-full rounded-none text-[10px] font-black uppercase tracking-[0.14em]"
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Actualizar Vigencia
        </Button>
      </form>
    </Form>
  );
}
