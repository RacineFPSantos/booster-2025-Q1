import { HeroSection } from "@/components/sections/HeroSection";
import { CategoriesSection } from "@/components/sections/CategoriesSection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { AiAssistantSection } from "@/components/sections/AiAssistantSection";

export function Home() {
  return (
    <>
      <HeroSection />
      <AiAssistantSection />
      <FeaturesSection />
      <CategoriesSection />
      <ServicesSection />
    </>
  );
}
