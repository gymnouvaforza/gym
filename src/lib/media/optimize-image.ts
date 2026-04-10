import sharp from "sharp";

const SUPPORTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const DEFAULT_MAX_DIMENSION = 2400;
const DEFAULT_JPEG_QUALITY = 82;
const DEFAULT_WEBP_QUALITY = 80;

export type OptimizedImageContentType = "image/jpeg" | "image/webp";

export interface OptimizeImageInput {
  buffer: Buffer;
  contentType: string;
  maxDimension?: number;
}

export interface OptimizeImageResult {
  buffer: Buffer;
  bytes: number;
  contentType: OptimizedImageContentType;
  extension: "jpg" | "webp";
  height: number;
  width: number;
}

export function isSupportedImageContentType(contentType: string | null | undefined) {
  return typeof contentType === "string" && SUPPORTED_IMAGE_TYPES.has(contentType);
}

export async function optimizeImage({
  buffer,
  contentType,
  maxDimension = DEFAULT_MAX_DIMENSION,
}: OptimizeImageInput): Promise<OptimizeImageResult> {
  if (!isSupportedImageContentType(contentType)) {
    throw new Error("Solo se admiten imagenes JPEG, PNG o WEBP.");
  }

  const image = sharp(buffer, { failOn: "none" }).rotate();
  const metadata = await image.metadata();

  if (!metadata.width || !metadata.height) {
    throw new Error("No se pudo leer el tamano de la imagen.");
  }

  const targetWidth =
    metadata.width > maxDimension || metadata.height > maxDimension
      ? maxDimension
      : undefined;
  const hasAlpha = metadata.hasAlpha === true;

  const resizedImage = image.resize({
    width: targetWidth,
    height: targetWidth,
    fit: "inside",
    withoutEnlargement: true,
  });

  const optimizedBuffer = hasAlpha
    ? await resizedImage
        .webp({
          quality: DEFAULT_WEBP_QUALITY,
          alphaQuality: DEFAULT_WEBP_QUALITY,
          effort: 4,
        })
        .toBuffer()
    : await resizedImage
        .jpeg({
          quality: DEFAULT_JPEG_QUALITY,
          progressive: true,
          mozjpeg: true,
        })
        .toBuffer();

  const optimizedMetadata = await sharp(optimizedBuffer).metadata();

  if (!optimizedMetadata.width || !optimizedMetadata.height) {
    throw new Error("No se pudo validar la imagen optimizada.");
  }

  return {
    buffer: optimizedBuffer,
    bytes: optimizedBuffer.byteLength,
    contentType: hasAlpha ? "image/webp" : "image/jpeg",
    extension: hasAlpha ? "webp" : "jpg",
    height: optimizedMetadata.height,
    width: optimizedMetadata.width,
  };
}
