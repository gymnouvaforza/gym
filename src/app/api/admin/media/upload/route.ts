import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import { PRODUCT_IMAGES_BUCKET } from "@/lib/commerce/image-urls";
import { hasSupabaseServiceRole } from "@/lib/env";
import { getCurrentAdminUser } from "@/lib/auth";
import { optimizeImage } from "@/lib/media/optimize-image";
import { createSupabaseAdminClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

const BUCKETS = {
  product: PRODUCT_IMAGES_BUCKET,
  team: PRODUCT_IMAGES_BUCKET,
  branding: "branding",
  favicon: "branding",
  "training-zone": "media",
} as const;

const SCOPE_PREFIX: Record<keyof typeof BUCKETS, string> = {
  product: "products",
  team: "marketing/team",
  branding: "logos",
  favicon: "favicons",
  "training-zone": "training-zones/posters",
};

function isValidScope(value: FormDataEntryValue | null): value is keyof typeof BUCKETS {
  return (
    value === "product" ||
    value === "team" ||
    value === "branding" ||
    value === "favicon" ||
    value === "training-zone"
  );
}

function buildStorageObjectPath(scope: keyof typeof BUCKETS, extension: string) {
  return `${SCOPE_PREFIX[scope]}/${randomUUID()}.${extension}`;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "No se pudo subir la imagen.";
}

export async function POST(request: Request) {
  const user = await getCurrentAdminUser();

  if (!user) {
    return NextResponse.json(
      { error: "Necesitas iniciar sesion para subir imagenes." },
      { status: 401 },
    );
  }

  if (!hasSupabaseServiceRole()) {
    return NextResponse.json(
      { error: "Configura SUPABASE_SERVICE_ROLE_KEY para subir imagenes al storage." },
      { status: 503 },
    );
  }

  try {
    const formData = await request.formData();
    const scope = formData.get("scope");
    const file = formData.get("file");

    if (!isValidScope(scope)) {
      return NextResponse.json(
        { error: "El scope de imagen no es valido." },
        { status: 400 },
      );
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Adjunta una imagen valida." }, { status: 400 });
    }

    const bucketName = BUCKETS[scope];

    // Favicon doesn't need to be converted to WebP necessarily, but optimizeImage handles it.
    // For favicon we might want to keep ICO/PNG but let's stick to the current pipeline for now.
    const optimized = await optimizeImage({
      buffer: Buffer.from(await file.arrayBuffer()),
      contentType: file.type,
    });
    
    const objectPath = buildStorageObjectPath(scope, optimized.extension);
    const supabase = createSupabaseAdminClient();
    
    const { error } = await supabase.storage
      .from(bucketName)
      .upload(objectPath, optimized.buffer, {
        cacheControl: "31536000",
        contentType: optimized.contentType,
        upsert: false,
      });

    if (error) {
      throw error;
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from(bucketName).getPublicUrl(objectPath);

    return NextResponse.json({
      url: publicUrl,
      contentType: optimized.contentType,
      width: optimized.width,
      height: optimized.height,
      bytes: optimized.bytes,
    });
  } catch (error) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
