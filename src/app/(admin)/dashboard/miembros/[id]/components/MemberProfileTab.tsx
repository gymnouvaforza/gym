"use client";

import { motion } from "framer-motion";
import { User } from "lucide-react";
import AdminSurface from "@/components/admin/AdminSurface";
import MemberProfileForm from "@/components/admin/MemberProfileForm";
import type { AuthLinkOption, DashboardMemberDetail, TrainerOption } from "@/lib/data/gym-management";

export default function MemberProfileTab({ 
  detail, 
  authOptions, 
  trainerOptions 
}: { 
  detail: DashboardMemberDetail;
  authOptions: AuthLinkOption[]; 
  trainerOptions: TrainerOption[];
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="space-y-12"
    >
      <div className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-[#d71920]/20 to-transparent rounded-[2rem] blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
        <AdminSurface className="p-10 border-black/5 bg-white relative rounded-[2rem] shadow-2xl shadow-black/[0.02]">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#d71920] mb-2">
                Expediente Maestro
              </h3>
              <p className="text-2xl font-black text-[#111111] tracking-tighter uppercase">
                Información de Identidad
              </p>
            </div>
            <div className="size-12 rounded-2xl bg-black/[0.02] flex items-center justify-center">
              <User className="size-6 text-[#111111]/20" />
            </div>
          </div>
          
          <MemberProfileForm
            detail={detail}
            authOptions={authOptions}
            trainerOptions={trainerOptions}
          />
        </AdminSurface>
      </div>
    </motion.div>
  );
}
