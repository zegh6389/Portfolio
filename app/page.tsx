import EnhancedHeaderFixed from "@/components/EnhancedHeaderFixed";
import EnhancedHero from "@/components/EnhancedHero";
import StatsSection from "@/components/StatsSection";
import EnhancedSkills from "@/components/EnhancedSkills";
import LazyResume3D from "@/components/LazyResume3D";
import EnhancedProjectsSection from "@/components/EnhancedProjectsSection";
import EnhancedContact from "@/components/EnhancedContact";

export default function Home() {
  return (
  <div id="home" suppressHydrationWarning className="min-h-screen bg-gradient-to-br from-background via-background to-background/95">
      <EnhancedHeaderFixed />
      <EnhancedHero />
      <main>
        <StatsSection />
        <EnhancedSkills />
        <LazyResume3D />
        <EnhancedProjectsSection />
        <EnhancedContact />
      </main>
      <footer className="py-8 border-t border-white/10">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground">
            © 2024 Portfolio. Built with Next.js, TypeScript, and Tailwind CSS.
          </p>
        </div>
      </footer>
    </div>
  );
}
