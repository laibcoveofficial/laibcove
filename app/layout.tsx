import type { Metadata } from "next";
import { Playfair_Display, Poppins } from "next/font/google";
import "./globals.css";
import { FloatingContact } from "@/components/site/floating-contact";
import { CartProvider } from "@/lib/cart/context";
import { CartDrawer } from "@/components/cart/cart-drawer";
import Script from "next/script";

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
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${playfair.variable} ${poppins.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-background text-foreground font-sans"
      >
        <Script
          id="remove-bis-skin-checked"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const removeAttr = () => {
                  document.querySelectorAll('[bis_skin_checked]').forEach(el => el.removeAttribute('bis_skin_checked'));
                };
                removeAttr();
                const observer = new MutationObserver(removeAttr);
                observer.observe(document.documentElement, { attributes: true, subtree: true, attributeFilter: ['bis_skin_checked'] });
              })();
            `,
          }}
        />
        <CartProvider>
          {children}
          <CartDrawer />
          <FloatingContact />
        </CartProvider>
      </body>
    </html>
  );
}
