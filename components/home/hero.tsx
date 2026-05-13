"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Sparkles, Star } from "lucide-react";
import { motion, Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.21, 0.47, 0.32, 0.98] as any,
    },
  },
};

const imageVariants: Variants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 1.2,
      ease: [0.21, 0.47, 0.32, 0.98] as any,
    },
  },
};

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[var(--brand-soft)] via-[var(--surface-soft)] to-background">
      {/* Decorative blobs */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-32 h-96 w-96 rounded-full bg-[var(--brand)]/15 blur-3xl"
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5, delay: 0.2 }}
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-[var(--brand)]/10 blur-3xl"
      />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 pt-4 pb-16 sm:px-6 lg:grid-cols-12 lg:gap-16 lg:px-8 lg:pt-6 lg:pb-24"
        suppressHydrationWarning
      >
        {/* Copy */}
        <div className="lg:col-span-6">
          <motion.span
            variants={itemVariants}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--brand)]/30 bg-white/70 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-[var(--brand)] backdrop-blur"
          >
            <Sparkles className="h-3.5 w-3.5" />
            New Summer Collection
          </motion.span>

          <motion.h1
            variants={itemVariants}
            className="font-heading mt-6 text-4xl leading-[1.05] text-foreground sm:text-5xl lg:text-[64px]"
          >
            Handmade Crochet
            <br />
            <span className="text-[var(--brand)]">Crafted with Love</span>
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg"
          >
            Discover beautifully handcrafted crochet bags, gajray, and home
            decor — made from premium yarn with attention to every single
            stitch.
          </motion.p>

          <motion.div
            variants={itemVariants}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Link
              href="/shop"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-[var(--brand)] px-7 py-3.5 text-sm font-semibold tracking-wide text-white shadow-lg shadow-[var(--brand)]/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[var(--brand)]/30"
            >
              Shop Now
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-foreground/20 bg-white/70 px-7 py-3.5 text-sm font-semibold tracking-wide text-foreground backdrop-blur transition-all hover:border-[var(--brand)] hover:text-[var(--brand)]"
            >
              Explore Collection
            </Link>
          </motion.div>
        </div>

        {/* Imagery */}
        <div className="relative lg:col-span-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-3 sm:space-y-4">
              <motion.div
                variants={imageVariants}
                className="group relative aspect-[4/5] overflow-hidden rounded-3xl shadow-xl shadow-[var(--brand)]/15"
              >
                <Image
                  src="/gajry1.PNG"
                  alt="Handmade Gajray"
                  width={800}
                  height={1000}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </motion.div>
              <motion.div
                variants={imageVariants}
                className="group relative aspect-square overflow-hidden rounded-3xl shadow-lg"
              >
                <Image
                  src="/baby.jpeg"
                  alt="Baby Items"
                  width={600}
                  height={600}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </motion.div>
            </div>
            <div className="space-y-3 sm:space-y-4 pt-8 sm:pt-12">
              <motion.div
                variants={imageVariants}
                className="group relative aspect-square overflow-hidden rounded-3xl shadow-lg"
              >
                <Image
                  src="/bouqeet1.jpeg"
                  alt="Crochet Bouquets"
                  width={600}
                  height={600}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </motion.div>
              <motion.div
                variants={imageVariants}
                className="group relative aspect-[4/5] overflow-hidden rounded-3xl shadow-xl shadow-[var(--brand)]/15"
              >
                <Image
                  src="/bag.jpeg"
                  alt="Handmade Crochet Bags"
                  width={800}
                  height={1000}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </motion.div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
