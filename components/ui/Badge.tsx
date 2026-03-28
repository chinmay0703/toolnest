import { ReactNode } from "react";
import { Shield } from "lucide-react";

interface BadgeProps {
  children: ReactNode;
  variant?: "popular" | "new" | "aiCantDo" | "default";
  className?: string;
}

const variantStyles: Record<string, string> = {
  popular:
    "bg-gradient-to-r from-amber-500 to-orange-500 text-white",
  new: "bg-emerald-500 text-white",
  aiCantDo: "",
  default: "bg-gray-700 text-gray-200",
};

export function Badge({
  children,
  variant = "default",
  className = "",
}: BadgeProps) {
  if (variant === "aiCantDo") {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium text-purple-300 bg-purple-500/10 border border-purple-500/30 ${className}`}
      >
        <Shield className="w-3 h-3" />
        {children}
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
