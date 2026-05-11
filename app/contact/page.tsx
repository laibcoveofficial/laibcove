import type { Metadata } from "next";
import { AnnouncementBar } from "@/components/site/announcement-bar";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { ContactHero } from "@/components/contact/hero";
import { ContactForm } from "@/components/contact/form";
import { ContactProcess } from "@/components/contact/process";
import { ContactWhySpecial } from "@/components/contact/why-special";
import { ContactInfo } from "@/components/contact/info";
import { ContactFAQ } from "@/components/contact/faq";

export const metadata: Metadata = {
  title: "Contact Us — Laibcove Custom Crochet Requests",
  description:
    "Tell us your dream crochet design. Custom bags, gajre, bouquets, and decor — handmade just for you. Pricing in PKR.",
};

export default function ContactPage() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="flex flex-1 flex-col">
        <ContactHero />
        <ContactForm />
        <ContactProcess />
        <ContactWhySpecial />
        <ContactInfo />
        <ContactFAQ />
      </main>
      <Footer />
    </>
  );
}
