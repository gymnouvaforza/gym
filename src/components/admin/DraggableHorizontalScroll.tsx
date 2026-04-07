"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";

interface DraggableHorizontalScrollProps {
  children: ReactNode;
  className?: string;
}

export default function DraggableHorizontalScroll({
  children,
  className,
}: Readonly<DraggableHorizontalScrollProps>) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragStateRef = useRef({
    isDragging: false,
    startX: 0,
    scrollLeft: 0,
  });
  const [isDragging, setIsDragging] = useState(false);

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "touch" || event.button !== 0) {
      return;
    }

    const target = event.target as HTMLElement | null;
    if (
      target?.closest(
        "a, button, input, select, textarea, label, [role='button'], [data-no-drag-scroll]",
      )
    ) {
      return;
    }

    const container = containerRef.current;
    if (!container) {
      return;
    }

    dragStateRef.current = {
      isDragging: true,
      startX: event.clientX,
      scrollLeft: container.scrollLeft,
    };
    setIsDragging(true);
    container.setPointerCapture(event.pointerId);
  }, []);

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStateRef.current.isDragging) {
      return;
    }

    const container = containerRef.current;
    if (!container) {
      return;
    }

    const deltaX = event.clientX - dragStateRef.current.startX;
    container.scrollLeft = dragStateRef.current.scrollLeft - deltaX;
  }, []);

  const stopDragging = useCallback((pointerId?: number) => {
    const container = containerRef.current;
    if (!container || !dragStateRef.current.isDragging) {
      return;
    }

    dragStateRef.current.isDragging = false;
    setIsDragging(false);

    if (pointerId !== undefined && container.hasPointerCapture(pointerId)) {
      container.releasePointerCapture(pointerId);
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "overflow-x-auto overscroll-x-contain cursor-grab select-none active:cursor-grabbing [&_*]:select-none",
        isDragging && "cursor-grabbing",
        className,
      )}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={(event) => stopDragging(event.pointerId)}
      onPointerLeave={() => stopDragging()}
      onPointerCancel={(event) => stopDragging(event.pointerId)}
    >
      {children}
    </div>
  );
}
