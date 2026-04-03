"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  name: string;
  images: string[];
}

export default function ProductGallery({ name, images }: Readonly<ProductGalleryProps>) {
  const gallery = images.length > 0 ? images : [];
  const [activeImage, setActiveImage] = useState(gallery[0] ?? null);

  return (
    <div className="space-y-6">
      <div className="relative aspect-square overflow-hidden border border-black/10 bg-[#fbfbf8] shadow-inner group">
        {activeImage ? (
          <Image
            src={activeImage}
            alt={name}
            fill
            className="object-contain p-12 transition-transform duration-700 ease-out group-hover:scale-105"
            sizes="(min-width: 1280px) 42vw, (min-width: 768px) 52vw, 100vw"
            priority
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center p-8 text-center bg-black/5">
            <span className="font-display text-[10px] uppercase tracking-[0.3em] text-black/20">
              IMAGEN NO DISP.
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(215,25,32,0.02),transparent_70%)] pointer-events-none" />
      </div>

      {gallery.length > 1 ? (
        <div className="grid grid-cols-4 gap-4">
          {gallery.slice(0, 4).map((image, index) => {
            const isActive = image === activeImage;

            return (
              <button
                key={`${image}-${index}`}
                type="button"
                aria-label={`Ver imagen ${index + 1} de ${name}`}
                aria-pressed={isActive}
                onClick={() => setActiveImage(image)}
                className={cn(
                  "relative aspect-square overflow-hidden border transition-all duration-300",
                  isActive
                    ? "border-[#d71920] shadow-md scale-[1.02] z-10"
                    : "border-black/5 opacity-60 hover:opacity-100 hover:border-black/20 bg-white"
                )}
              >
                <Image
                  src={image}
                  alt={`${name} miniatura ${index + 1}`}
                  fill
                  className="object-contain p-2"
                  sizes="(min-width: 1280px) 10vw, 22vw"
                />
                {isActive && (
                  <div className="absolute bottom-0 left-0 h-0.5 w-full bg-[#d71920]" />
                )}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

