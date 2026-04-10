import { lazy, Suspense } from "react";
import PageLayout from "@/components/PageLayout";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";

const LogoOrbit = lazy(() => import("@/components/LogoOrbit"));

const Index = () => (
  <PageLayout>
    <HeroSection />
    <AboutSection />
    <section className="relative py-20 flex items-center justify-center overflow-hidden">
      <Suspense fallback={<div className="w-[400px] h-[400px]" />}>
        <LogoOrbit />
      </Suspense>
    </section>
  </PageLayout>
);

export default Index;
