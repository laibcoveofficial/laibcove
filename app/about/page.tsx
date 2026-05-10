import type { Metadata } from "next";
import { AnnouncementBar } from "@/components/site/announcement-bar";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { AboutHero } from "@/components/about/hero";
import { AboutStory } from "@/components/about/story";
import { AboutMission } from "@/components/about/mission";
import { AboutHandmadeMatters } from "@/components/about/handmade-matters";
import { AboutCustomization } from "@/components/about/customization";
import { AboutBehindCraft } from "@/components/about/behind-craft";
import { AboutValues } from "@/components/about/values";
import { Testimonials } from "@/components/home/testimonials";
import { AboutCTA } from "@/components/about/cta";

export const metadata: Metadata = {
  title: "About Us — Laibcove Handmade Crochet",
  description:
    "The story behind Laibcove: handmade crochet pieces stitched slowly, with intention, in our small studio. Custom orders open.",
};

export default function AboutPage() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="flex flex-1 flex-col">
        <AboutHero />
        <AboutStory />
        <AboutMission />
        <AboutHandmadeMatters />
        <AboutCustomization />
        <AboutBehindCraft />
        <AboutValues />
        <Testimonials />
        <AboutCTA />
      </main>
      <Footer />
    </>
  );
}
