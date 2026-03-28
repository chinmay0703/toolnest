interface CategoryIconProps {
  emoji: string;
  size?: "sm" | "md" | "lg";
}

const sizeMap: Record<string, string> = {
  sm: "text-[24px] leading-[24px]",
  md: "text-[36px] leading-[36px]",
  lg: "text-[48px] leading-[48px]",
};

export function CategoryIcon({ emoji, size = "md" }: CategoryIconProps) {
  return (
    <span className={`${sizeMap[size]} select-none`} role="img">
      {emoji}
    </span>
  );
}
