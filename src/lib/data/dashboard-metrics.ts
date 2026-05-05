import { createSupabaseAdminClient } from "@/lib/supabase/server";

export interface DashboardMetrics {
  activeMembers: number;
  expiredMembers: number;
  frozenMembers: number;
  expiringToday: number;
  expiringThisWeek: number;
  newMembersThisMonth: number;
  renewalsThisMonth: number;
  monthlyIncome: number;
  birthdaysThisMonth: number;
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  const client = createSupabaseAdminClient();
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  
  const nextWeek = new Date();
  nextWeek.setDate(today.getDate() + 7);
  const nextWeekStr = nextWeek.toISOString().split("T")[0];

  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split("T")[0];
  const currentMonth = today.getMonth() + 1; // 1-indexed

  const [
    { count: activeCount },
    { count: expiredCount },
    { count: frozenCount },
    { count: expiringTodayCount },
    { count: expiringThisWeekCount },
    { count: newMembersCount },
    { count: renewalsCount },
    { data: paymentsData },
    { data: birthdaysData },
  ] = await Promise.all([
    client.from("membership_requests").select("*", { count: "exact", head: true }).eq("status", "active"),
    client.from("membership_requests").select("*", { count: "exact", head: true }).eq("status", "expired"),
    client.from("member_profiles").select("*", { count: "exact", head: true }).eq("status", "frozen"),
    client.from("membership_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "active")
      .eq("cycle_ends_on", todayStr),
    client.from("membership_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "active")
      .gte("cycle_ends_on", todayStr)
      .lte("cycle_ends_on", nextWeekStr),
    client.from("member_profiles")
      .select("*", { count: "exact", head: true })
      .gte("created_at", firstDayOfMonth),
    client.from("membership_requests")
      .select("*", { count: "exact", head: true })
      .eq("status", "active")
      .gte("created_at", firstDayOfMonth),
    client.from("membership_payment_entries")
      .select("amount")
      .gte("recorded_at", firstDayOfMonth),
    client.from("member_profiles")
      .select("birth_date")
      .not("birth_date", "is", null)
  ]);

  const monthlyIncome = (paymentsData ?? []).reduce((acc: number, p: any) => acc + Number(p.amount), 0);
  
  const birthdaysThisMonth = (birthdaysData ?? []).filter((m: any) => {
    if (!m.birth_date) return false;
    const birthDate = new Date(m.birth_date);
    return (birthDate.getMonth() + 1) === currentMonth;
  }).length;

  return {
    activeMembers: activeCount ?? 0,
    expiredMembers: expiredCount ?? 0,
    frozenMembers: frozenCount ?? 0,
    expiringToday: expiringTodayCount ?? 0,
    expiringThisWeek: expiringThisWeekCount ?? 0,
    newMembersThisMonth: newMembersCount ?? 0,
    renewalsThisMonth: renewalsCount ?? 0,
    monthlyIncome,
    birthdaysThisMonth,
  };
}
