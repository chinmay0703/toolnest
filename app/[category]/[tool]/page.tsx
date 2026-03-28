import { Metadata } from "next";
import { notFound } from "next/navigation";
import { tools, getToolBySlug } from "@/lib/tools";
import { categories, getCategoryById } from "@/lib/categories";
import { generateToolMetadata, generateJsonLd } from "@/lib/seo";
import { GenericToolPage } from "@/components/tools/GenericToolPage";

interface Props {
  params: Promise<{ category: string; tool: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, tool: toolSlug } = await params;
  const toolData = getToolBySlug(category, toolSlug);
  if (!toolData) return { title: "Tool Not Found" };
  return generateToolMetadata(toolData.name, toolData.description, category, toolSlug);
}

export async function generateStaticParams() {
  return tools.map((t) => ({
    category: t.category,
    tool: t.url.split("/").pop()!,
  }));
}

export default async function ToolPage({ params }: Props) {
  const { category, tool: toolSlug } = await params;
  const toolData = getToolBySlug(category, toolSlug);
  const categoryData = getCategoryById(category);

  if (!toolData || !categoryData) {
    notFound();
  }

  const jsonLd = generateJsonLd(toolData.name, toolData.description, toolData.url);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <GenericToolPage tool={toolData} category={categoryData} />
    </>
  );
}
