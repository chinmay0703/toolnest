import { ElementType, ReactNode } from "react";

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  as?: ElementType;
}

export function GradientText({
  children,
  className = "",
  as: Tag = "span",
}: GradientTextProps) {
  return (
    <Tag
      className={`bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent ${className}`}
      style={{
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
      }}
    >
      {children}
    </Tag>
  );
}
