import QRCode from "qrcode";
import { QrCode, ExternalLink } from "lucide-react";
import Link from "next/link";

interface MembershipQrPreviewProps {
  qrUrl: string;
  className?: string;
}

export default async function MembershipQrPreview({
  qrUrl,
}: Readonly<MembershipQrPreviewProps>) {
  let qrMarkup: string | null = null;

  try {
    qrMarkup = await QRCode.toString(qrUrl, {
      errorCorrectionLevel: "M",
      margin: 1,
      type: "svg",
      width: 140,
      color: {
        dark: "#111111",
        light: "#ffffff",
      },
    });
  } catch {
    qrMarkup = null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#7a7f87]">
          Vista previa QR
        </p>
        <Link 
          href={qrUrl} 
          target="_blank" 
          className="flex items-center gap-1.5 text-[10px] font-bold text-[#111111] uppercase hover:underline"
        >
          Ver pantalla <ExternalLink className="h-3 w-3" />
        </Link>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="relative aspect-square w-32 shrink-0 bg-white p-2 border border-black/5 shadow-sm rounded-lg overflow-hidden">
          {qrMarkup ? (
            <div className="w-full h-full" dangerouslySetInnerHTML={{ __html: qrMarkup }} />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-zinc-50">
              <QrCode className="h-8 w-8 text-zinc-300" />
            </div>
          )}
        </div>
        
        <div className="space-y-2 min-w-0">
          <p className="text-[12px] font-bold text-[#111111] leading-tight">
            Acceso Digital Activo
          </p>
          <p className="text-[11px] text-[#5f6368] leading-relaxed">
            El socio puede escanear este QR en recepcion para validar su ingreso. 
            Asegurate de que el email de bienvenida haya sido enviado.
          </p>
          <p className="break-all font-mono text-[9px] text-[#7a7f87] bg-black/5 p-1.5 rounded">
            {qrUrl}
          </p>
        </div>
      </div>
    </div>
  );
}
