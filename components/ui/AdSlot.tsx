interface AdSlotProps {
  position: "top" | "middle" | "bottom" | "sidebar";
  className?: string;
}

const heightMap: Record<AdSlotProps["position"], string> = {
  top: "h-[90px]",
  bottom: "h-[90px]",
  middle: "h-[280px]",
  sidebar: "h-[250px]",
};

export function AdSlot({ position, className = "" }: AdSlotProps) {
  return (
    <div
      className={`w-full ${heightMap[position]} flex items-center justify-center border border-dashed border-border rounded-lg text-text-muted text-xs my-6 ${className}`}
    >
      Ad Space — {position}
    </div>
  );
}
