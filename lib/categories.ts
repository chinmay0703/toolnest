export interface Category {
  id: string;
  name: string;
  emoji: string;
  description: string;
  color: string;
  toolCount: number;
}

export const categories: Category[] = [
  { id: "pdf", name: "PDF Tools", emoji: "📄", description: "Edit, convert, compress PDF files", color: "#EF4444", toolCount: 34 },
  { id: "image", name: "Image Tools", emoji: "🖼️", description: "Edit, convert, compress images", color: "#F59E0B", toolCount: 42 },
  { id: "text", name: "Text Tools", emoji: "📝", description: "Transform, analyze, and format text", color: "#10B981", toolCount: 46 },
  { id: "developer", name: "Developer Tools", emoji: "💻", description: "Code formatters, encoders, generators", color: "#7C3AED", toolCount: 79 },
  { id: "data", name: "Data Tools", emoji: "📊", description: "Convert and manage data files", color: "#06B6D4", toolCount: 20 },
  { id: "calculators", name: "Calculators", emoji: "🔢", description: "Math, finance, and utility calculators", color: "#8B5CF6", toolCount: 40 },
  { id: "security", name: "Security Tools", emoji: "🔐", description: "Encryption, hashing, password tools", color: "#EF4444", toolCount: 21 },
  { id: "media", name: "Media Tools", emoji: "🎵", description: "Audio and video processing", color: "#EC4899", toolCount: 21 },
  { id: "camera", name: "Camera Tools", emoji: "📸", description: "Webcam and scanner tools", color: "#14B8A6", toolCount: 10 },
  { id: "productivity", name: "Productivity", emoji: "📅", description: "Timers, notes, generators, trackers", color: "#F97316", toolCount: 35 },
  { id: "design", name: "Design Tools", emoji: "🎨", description: "Drawing, fonts, and design utilities", color: "#A855F7", toolCount: 23 },
  { id: "health", name: "Health Tools", emoji: "🏥", description: "Health and fitness trackers", color: "#22C55E", toolCount: 18 },
  { id: "fun", name: "Fun Tools", emoji: "🎮", description: "Games, randomizers, and fun stuff", color: "#FBBF24", toolCount: 25 },
  { id: "writing", name: "Writing Tools", emoji: "✍️", description: "Grammar, citations, and writing aids", color: "#3B82F6", toolCount: 10 },
  { id: "social", name: "Social Media Tools", emoji: "#️⃣", description: "Social media helpers and generators", color: "#E11D48", toolCount: 10 },
  { id: "education", name: "Education Tools", emoji: "🎓", description: "Learning, quizzes, and study aids", color: "#0EA5E9", toolCount: 10 },
  { id: "finance", name: "Finance Tools", emoji: "💱", description: "Currency, investments, and budgeting", color: "#16A34A", toolCount: 9 },
];

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}
