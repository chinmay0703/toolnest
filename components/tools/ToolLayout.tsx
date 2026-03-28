import { ReactNode } from "react";
import { Breadcrumb } from "@/components/ui/Breadcrumb";
import { AdSlot } from "@/components/ui/AdSlot";
import { ToolHeader } from "@/components/tools/ToolHeader";
import { PrivacyBadge } from "@/components/tools/PrivacyBadge";
import { HowToUse } from "@/components/tools/HowToUse";
import { FAQSection } from "@/components/tools/FAQSection";
import { RelatedTools } from "@/components/tools/RelatedTools";

interface ToolLayoutProps {
  children: ReactNode;
  title: string;
  description: string;
  emoji: string;
  category: string;
  categoryName: string;
  toolName: string;
}

export function ToolLayout({
  children,
  title,
  description,
  emoji,
  category,
  categoryName,
  toolName,
}: ToolLayoutProps) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <Breadcrumb
        items={[
          { label: categoryName, href: `/categories/${category}` },
          { label: toolName },
        ]}
      />

      <ToolHeader emoji={emoji} title={title} description={description} />

      <PrivacyBadge />

      <AdSlot position="top" />

      <div className="my-8">{children}</div>

      <AdSlot position="middle" />

      <HowToUse />

      <FAQSection />

      <RelatedTools category={category} currentToolId={toolName} />

      <AdSlot position="bottom" />
    </div>
  );
}
