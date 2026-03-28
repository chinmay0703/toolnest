import { Upload, Settings, MousePointerClick, Download } from "lucide-react";

interface HowToUseProps {
  steps?: string[];
}

const defaultSteps = [
  "Upload your file using the drag & drop zone above",
  "Choose your desired settings and options",
  "Click the process button to start",
  "Download your result instantly",
];

const stepIcons = [Upload, Settings, MousePointerClick, Download];

export function HowToUse({ steps = defaultSteps }: HowToUseProps) {
  return (
    <section className="my-12">
      <h2 className="text-2xl font-bold font-heading text-text-primary mb-6">
        How to Use
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {steps.map((step, index) => {
          const Icon = stepIcons[index % stepIcons.length];
          return (
            <div
              key={index}
              className="flex flex-col items-start gap-3 p-5 rounded-xl bg-bg-card border border-border"
            >
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary text-white text-sm font-bold">
                  {index + 1}
                </span>
                <Icon className="w-5 h-5 text-text-muted" />
              </div>
              <p className="text-sm text-text-secondary">{step}</p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
