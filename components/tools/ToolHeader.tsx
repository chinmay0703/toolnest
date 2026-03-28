import { GradientText } from "@/components/ui/GradientText";
import { CategoryIcon } from "@/components/ui/CategoryIcon";
import { Badge } from "@/components/ui/Badge";

interface ToolHeaderProps {
  emoji: string;
  title: string;
  description: string;
}

export function ToolHeader({ emoji, title, description }: ToolHeaderProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-4 mb-4">
        <span className="text-[64px] leading-[64px] select-none">{emoji}</span>
        <div>
          <h1 className="text-3xl md:text-4xl font-bold font-heading">
            <GradientText>{title}</GradientText>
          </h1>
        </div>
      </div>

      <p className="text-lg text-text-secondary mb-6 max-w-2xl">
        {description}
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-bg-card border border-border px-3 py-1 text-sm text-text-secondary">
          🔒 Private
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-bg-card border border-border px-3 py-1 text-sm text-text-secondary">
          ⚡ Instant
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-bg-card border border-border px-3 py-1 text-sm text-text-secondary">
          ✅ Free
        </span>
        <Badge variant="aiCantDo">AI Can&apos;t Do This</Badge>
      </div>
    </div>
  );
}
