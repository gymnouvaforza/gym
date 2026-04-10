"use client";

import { AlertCircle } from "lucide-react";

import MarketingPlansForm from "@/components/admin/MarketingPlansForm";
import MarketingScheduleForm from "@/components/admin/MarketingScheduleForm";
import MarketingTeamMembersForm from "@/components/admin/MarketingTeamMembersForm";
import type {
  MarketingPlan,
  MarketingScheduleRow,
  MarketingTeamMember,
} from "@/lib/data/marketing-content";

interface MarketingContentFormProps {
  plans: MarketingPlan[];
  scheduleRows: MarketingScheduleRow[];
  teamMembers: MarketingTeamMember[];
  disabledReason?: string;
}

export default function MarketingContentForm({
  plans,
  scheduleRows,
  teamMembers,
  disabledReason,
}: Readonly<MarketingContentFormProps>) {
  return (
    <div className="space-y-12">
      <MarketingPlansForm 
        plans={plans} 
        disabledReason={disabledReason} 
      />

      <MarketingScheduleForm 
        scheduleRows={scheduleRows} 
        disabledReason={disabledReason} 
      />

      <MarketingTeamMembersForm 
        teamMembers={teamMembers} 
        disabledReason={disabledReason} 
      />

      {disabledReason && (
        <div className="mx-auto max-w-4xl p-4">
          <div className="rounded-none border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 flex items-center gap-2 shadow-sm">
            <AlertCircle className="h-4 w-4" />
            {disabledReason}
          </div>
        </div>
      )}
    </div>
  );
}
