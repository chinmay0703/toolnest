import { tools } from "@/lib/tools";
import { ToolGrid } from "@/components/tools/ToolGrid";

interface RelatedToolsProps {
  category: string;
  currentToolId: string;
}

export function RelatedTools({ category, currentToolId }: RelatedToolsProps) {
  const related = tools
    .filter((t) => t.category === category && t.id !== currentToolId)
    .slice(0, 6);

  if (related.length === 0) return null;

  return (
    <section className="my-12">
      <h2 className="text-2xl font-bold font-heading text-text-primary mb-6">
        Related Tools
      </h2>
      <ToolGrid tools={related} />
    </section>
  );
}
