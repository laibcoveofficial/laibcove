import { AnnouncementBar } from "@/components/site/announcement-bar";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { Hero } from "@/components/home/hero";
import { FeaturedCategories } from "@/components/home/featured-categories";
import { BestSellers } from "@/components/home/best-sellers";
import { AboutBrand } from "@/components/home/about-brand";
import { CustomOrders } from "@/components/home/custom-orders";
import { NewArrivals } from "@/components/home/new-arrivals";
import { WhyChooseUs } from "@/components/home/why-choose-us";
import { Testimonials } from "@/components/home/testimonials";
import { InstagramGallery } from "@/components/home/instagram-gallery";
import { VideoSection } from "@/components/home/video-section";
import { Newsletter } from "@/components/home/newsletter";

export default function Home() {
  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="flex flex-1 flex-col">
        <Hero />
        <FeaturedCategories />
        <BestSellers />
        <AboutBrand />
        <CustomOrders />
        <NewArrivals />
        <WhyChooseUs />
        <Testimonials />
        <InstagramGallery />
        <VideoSection />
        <Newsletter />
      </main>
      <Footer />
    </>
  );
}
