"use client";

import { motion } from "framer-motion";
import { Activity, Lock, Ruler } from "lucide-react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import AdminSurface from "@/components/admin/AdminSurface";
import { Button } from "@/components/ui/button";
import { type MemberMeasurementDto } from "@/lib/data/member-finance";

export default function MemberProgressTab({
  measurements,
}: {
  measurements: MemberMeasurementDto[];
  memberId: string;
}) {
  const chartData = [...measurements].reverse().map((measurement) => ({
    date: new Date(measurement.recordedAt).toLocaleDateString("es-PE", {
      day: "2-digit",
      month: "short",
    }),
    peso: measurement.weight,
    grasa: measurement.fatPercentage,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-black uppercase tracking-[0.2em] text-[#111111]">
          Evolucion Fisica
        </h3>
        <Button
          type="button"
          disabled
          title="Registro manual de medidas pendiente de backend."
          className="bg-[#111111] text-white font-bold uppercase text-[10px] tracking-widest"
        >
          <Lock className="w-3.5 h-3.5 mr-2" /> Registro No Disponible
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AdminSurface className="lg:col-span-2 p-6 border-black/5 min-h-[400px]">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-4 h-4 text-[#d71920]" />
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#111111]">
              Evolucion de Peso y Composicion
            </h4>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: "#7a7f87" }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700, fill: "#7a7f87" }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{
                    paddingTop: "20px",
                    fontSize: "10px",
                    fontWeight: 800,
                    textTransform: "uppercase",
                    letterSpacing: "1px",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="peso"
                  stroke="#111111"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#111111" }}
                  activeDot={{ r: 6 }}
                  name="Peso (kg)"
                />
                <Line
                  type="monotone"
                  dataKey="grasa"
                  stroke="#d71920"
                  strokeWidth={3}
                  dot={{ r: 4, fill: "#d71920" }}
                  activeDot={{ r: 6 }}
                  name="% Grasa"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </AdminSurface>

        <div className="space-y-6">
          <AdminSurface className="p-6 border-black/5">
            <div className="flex items-center gap-2 mb-4">
              <Ruler className="w-4 h-4 text-[#d71920]" />
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#111111]">
                Ultimos Perimetros
              </h4>
            </div>
            {measurements[0] ? (
              <div className="space-y-3">
                <div className="flex justify-between border-b border-black/5 pb-2">
                  <span className="text-[10px] font-bold text-[#7a7f87] uppercase">
                    Cintura
                  </span>
                  <span className="text-sm font-black text-[#111111]">
                    {measurements[0].perimeters.waist || "---"} cm
                  </span>
                </div>
                <div className="flex justify-between border-b border-black/5 pb-2">
                  <span className="text-[10px] font-bold text-[#7a7f87] uppercase">Pecho</span>
                  <span className="text-sm font-black text-[#111111]">
                    {measurements[0].perimeters.chest || "---"} cm
                  </span>
                </div>
                <div className="flex justify-between border-b border-black/5 pb-2">
                  <span className="text-[10px] font-bold text-[#7a7f87] uppercase">Brazo</span>
                  <span className="text-sm font-black text-[#111111]">
                    {measurements[0].perimeters.arm || "---"} cm
                  </span>
                </div>
                <p className="text-[9px] text-center text-[#7a7f87] pt-2 uppercase font-medium">
                  Registrado el {new Date(measurements[0].recordedAt).toLocaleDateString()}
                </p>
              </div>
            ) : (
              <p className="text-sm text-[#7a7f87] py-4 text-center">
                No hay medidas registradas.
              </p>
            )}
          </AdminSurface>
        </div>
      </div>
    </motion.div>
  );
}
