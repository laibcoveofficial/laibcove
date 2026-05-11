import type { Metadata } from "next";
import { Playfair_Display, Poppins } from "next/font/google";
import "./globals.css";
import { FloatingContact } from "@/components/site/floating-contact";
import { CartProvider } from "@/lib/cart/context";
import { CartDrawer } from "@/components/cart/cart-drawer";

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Laibcove — Handmade Crochet Creations",
  description:
    "Beautifully handcrafted crochet bags, gajre, bouquets, and accessories — made with premium yarn and love.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${poppins.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-background text-foreground font-sans"
      >
        <CartProvider>
          {children}
          <CartDrawer />
          <FloatingContact />
        </CartProvider>
      </body>
    </html>
  );
}
