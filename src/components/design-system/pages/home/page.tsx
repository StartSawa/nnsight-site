import { DotField } from "@/components/design-system/ui/dot-field";
import { HomeHero } from "@/components/sections/home/hero";
import { HomeWhatIs } from "@/components/sections/home/what-is";
import { HomeFeaturesIndex } from "@/components/sections/home/features-index";
import { HomeHowTo } from "@/components/sections/home/how-to";
import { HomeTutorials } from "@/components/sections/home/tutorials";
import { HomeLatestPosts } from "@/components/sections/home/latest-posts";
import { HomeInstallCta } from "@/components/sections/home/install-cta";

export function HomePage() {
  return (
    <main id="main-content" tabIndex={-1} className="home-page text-ploy-text-primary outline-none">
      <DotField />
      <HomeHero />
      <HomeWhatIs />
      <HomeFeaturesIndex />
      <HomeHowTo />
      <HomeTutorials />
      <HomeLatestPosts />
      <HomeInstallCta />
    </main>
  );
}
