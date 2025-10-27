import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { HeroSection } from "@/components/sections/HeroSection";
import { CategoriesSection } from "@/components/sections/CategoriesSection";
import { ServicesSection } from "@/components/sections/ServicesSection";
import { FeaturesSection } from "@/components/sections/FeaturesSection";
import { Toaster } from "@/components/ui/sonner";

export function Home() {
  return (
    <div className="min-h-screen">
      <Toaster />
      <Header />
      <HeroSection />
      <CategoriesSection />
      <ServicesSection />
      <FeaturesSection />
      <Footer />
    </div>
  );
}
