"use client";

import Image from "next/image";
import { Loader2, Trash2, Upload, Info } from "lucide-react";
import { useState } from "react";

import { uploadAdminMedia, type AdminMediaUploadScope } from "@/lib/media/admin-upload";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface NFImageUploaderProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  scope: AdminMediaUploadScope;
  label: string;
  tooltip?: string;
  aspectRatio?: "square" | "video" | "wide";
  className?: string;
  disabled?: boolean;
}

const aspectRatios = {
  square: "aspect-square",
  video: "aspect-video",
  wide: "aspect-[3/1]",
};

export default function NFImageUploader({
  value,
  onChange,
  scope,
  label,
  tooltip,
  aspectRatio = "square",
  className,
  disabled,
}: NFImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setError(null);

    try {
      const uploaded = await uploadAdminMedia(file, scope);
      onChange(uploaded.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al subir la imagen");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center gap-2">
        <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
          {label}
        </label>
        {tooltip && (
          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Info className="size-3 text-muted-foreground/40 cursor-help transition-all hover:text-foreground" />
              </TooltipTrigger>
              <TooltipContent side="top" className="bg-secondary text-white border-none p-3 text-[10px] font-bold uppercase tracking-tight max-w-[200px]">
                {tooltip}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      <div className={cn(
        "relative overflow-hidden border-2 border-dashed border-black/5 bg-black/[0.02] transition-all group",
        aspectRatios[aspectRatio],
        !value && "hover:border-primary/20 hover:bg-primary/[0.02]",
        disabled && "opacity-50 pointer-events-none"
      )}>
        {value ? (
          <>
            <Image
              src={value}
              alt={label}
              fill
              className="object-contain p-4"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
               <button
                type="button"
                onClick={() => onChange(null)}
                className="h-10 w-10 flex items-center justify-center bg-white text-destructive hover:bg-red-50 transition-colors rounded-full shadow-xl"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          </>
        ) : (
          <label className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={onUpload}
              className="sr-only"
              disabled={isUploading || disabled}
            />
            {isUploading ? (
              <Loader2 className="size-6 animate-spin text-primary" />
            ) : (
              <Upload className="size-6 text-muted-foreground/30 group-hover:text-primary transition-colors" />
            )}
            <span className="mt-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 group-hover:text-primary transition-colors">
              {isUploading ? "Subiendo..." : "Seleccionar"}
            </span>
          </label>
        )}
      </div>
      
      {error && <p className="text-[10px] font-bold text-destructive uppercase tracking-tighter">{error}</p>}
    </div>
  );
}
