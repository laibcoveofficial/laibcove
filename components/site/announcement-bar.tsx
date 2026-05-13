"use client";

import { motion } from "framer-motion";
import { Sparkles, Heart } from "lucide-react";

const messages = [
  { icon: Sparkles, text: "Handmade with love — every stitch tells a story" },
  { icon: Heart, text: "Custom orders are open — design something just for you" },
];

export function AnnouncementBar() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="w-full bg-[var(--brand)] text-[var(--brand-foreground)]"
      suppressHydrationWarning
    >
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-6 overflow-hidden px-4 py-2 text-xs font-medium tracking-wide sm:text-[13px]" suppressHydrationWarning>
        <div className="hidden items-center gap-8 md:flex">
          {messages.map(({ icon: Icon, text }, i) => (
            <span key={i} className="inline-flex items-center gap-2">
              <Icon className="h-3.5 w-3.5" strokeWidth={2} />
              <span>{text}</span>
            </span>
          ))}
        </div>
        <span className="inline-flex items-center gap-2 md:hidden">
          <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
          Free shipping on orders over PKR 5,000
        </span>
      </div>
    </motion.div>
  );
}
