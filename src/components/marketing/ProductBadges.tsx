import { Badge } from "@/components/ui/badge";
import type { Product } from "@/data/types";
import { getProductStockMeta } from "@/lib/data/products";
import { cn } from "@/lib/utils";

interface ProductBadgesProps {
  product: Product;
  compact?: boolean;
  className?: string;
}

export default function ProductBadges({
  product,
  compact = false,
  className,
}: Readonly<ProductBadgesProps>) {
  const stockMeta = getProductStockMeta(product.stock_status);

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {product.featured ? (
        <Badge className="rounded-none font-black uppercase text-[8px] tracking-widest h-5 px-2">Premium</Badge>
      ) : null}
      {product.pickup_only && !compact ? (
        <Badge variant="muted" className="rounded-none font-black uppercase text-[8px] tracking-widest h-5 px-2">Recogida local</Badge>
      ) : null}
      <Badge variant={stockMeta.badgeVariant} className="rounded-none font-black uppercase text-[8px] tracking-widest h-5 px-2">
        {stockMeta.label}
      </Badge>
    </div>
  );
}
