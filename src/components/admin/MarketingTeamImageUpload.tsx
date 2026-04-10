"use client";

import Image from "next/image";
import { Loader2, Trash2, Upload } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

const TEAM_IMAGES_BUCKET = "medusa-media";
const TEAM_IMAGES_PREFIX = "marketing/team";

interface MarketingTeamImageUploadProps {
  memberId: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export default function MarketingTeamImageUpload({
  memberId,
  value,
  onChange,
  disabled,
}: Readonly<MarketingTeamImageUploadProps>) {
  const [isUploading, setIsUploading] = useState(false);
  const supabase = createSupabaseBrowserClient();

  async function handleUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    setIsUploading(true);

    try {
      const extension = file.name.split(".").pop()?.toLowerCase() ?? "png";
      const filePath = `${TEAM_IMAGES_PREFIX}/${memberId}.${extension}`;
      const { error } = await supabase.storage
        .from(TEAM_IMAGES_BUCKET)
        .upload(filePath, file, { upsert: true });

      if (error) {
        throw error;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(TEAM_IMAGES_BUCKET).getPublicUrl(filePath);

      onChange(publicUrl);
    } catch (error) {
      console.error("[MarketingTeamImageUpload] Upload error:", error);
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <div
        className={cn(
          "relative aspect-[3/4] w-28 overflow-hidden border border-black/10 bg-black/[0.03]",
          !value && "grid place-items-center",
        )}
      >
        {value ? (
          <Image src={value} alt="Entrenador" fill className="object-cover" unoptimized />
        ) : (
          <div className="px-6 text-center text-xs font-semibold uppercase tracking-[0.18em] text-[#8c9198]">
            Sin foto subida
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <label
          className={cn(
            "inline-flex cursor-pointer items-center gap-2 border border-black/10 bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.14em] transition hover:border-[#111111]",
            (disabled || isUploading) && "pointer-events-none opacity-50",
          )}
        >
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleUpload}
            disabled={disabled || isUploading}
          />
          {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          {value ? "Reemplazar foto" : "Subir foto"}
        </label>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled || isUploading || !value}
          onClick={() => onChange("")}
        >
          <Trash2 className="h-4 w-4" />
          Quitar
        </Button>
      </div>

      <p className="text-[11px] text-[#7a7f87]">
        La imagen se guarda en Supabase Storage dentro de <code>medusa-media/marketing/team</code>.
      </p>
    </div>
  );
}
