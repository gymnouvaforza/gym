import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse bg-secondary/5 dark:bg-white/5", className)}
      {...props}
    />
  );
}

export { Skeleton };
