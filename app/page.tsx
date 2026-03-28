import { HeroSection } from "@/components/home/HeroSection";
import { AIComparison } from "@/components/home/AIComparison";
import { StatsBar } from "@/components/home/StatsBar";
import { FeaturedTools } from "@/components/home/FeaturedTools";
import { WhyToolNest } from "@/components/home/WhyToolNest";

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <AIComparison />
      <StatsBar />
      <FeaturedTools />
      <WhyToolNest />
    </>
  );
}
