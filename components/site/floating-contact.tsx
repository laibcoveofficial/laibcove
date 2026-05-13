"use client";

import { usePathname } from "next/navigation";

const WHATSAPP_NUMBER = "923120394078"; // +92 302 5787425 — wa.me format
const DEFAULT_MESSAGE =
  "Hi Laibcove! I'd like to know more about your handmade crochet pieces.";

const WhatsAppIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path d="M19.077 4.928A9.94 9.94 0 0 0 12.005 2C6.487 2 2 6.487 2 12.005c0 1.762.46 3.483 1.336 5.003L2 22l5.107-1.305a9.965 9.965 0 0 0 4.898 1.247h.005c5.518 0 10.005-4.486 10.005-10.005a9.94 9.94 0 0 0-2.938-7.009zM12.01 20.262h-.004a8.31 8.31 0 0 1-4.234-1.16l-.304-.18-3.025.773.808-2.95-.198-.314a8.298 8.298 0 0 1-1.275-4.426c0-4.587 3.731-8.318 8.323-8.318 2.222 0 4.31.866 5.882 2.44a8.273 8.273 0 0 1 2.436 5.886c-.001 4.585-3.732 8.249-8.41 8.249zm4.557-6.221c-.25-.125-1.479-.73-1.708-.812-.229-.083-.395-.125-.561.125-.166.25-.645.812-.79.978-.146.166-.291.187-.541.062-.25-.125-1.055-.389-2.01-1.24-.743-.662-1.244-1.48-1.39-1.73-.146-.25-.016-.385.11-.51.113-.112.25-.291.375-.437.125-.146.166-.25.25-.416.083-.166.041-.312-.021-.437-.062-.125-.561-1.354-.769-1.854-.203-.486-.41-.42-.561-.428l-.479-.009c-.166 0-.437.062-.665.312-.229.25-.873.853-.873 2.082s.894 2.416 1.019 2.582c.125.166 1.762 2.69 4.27 3.77.597.258 1.062.412 1.426.527.598.19 1.143.163 1.574.099.48-.072 1.479-.604 1.687-1.187.208-.583.208-1.083.146-1.187-.062-.104-.229-.166-.479-.291z" />
  </svg>
);

export function FloatingContact() {
  const pathname = usePathname();

  // Hide on admin pages — keeps the panel clean during admin work.
  if (pathname?.startsWith("/admin")) return null;

  const whatsappHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    DEFAULT_MESSAGE,
  )}`;

  return (
    <a
      href={whatsappHref}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with us on WhatsApp"
      title="Chat on WhatsApp"
      className="group fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/40 transition-transform hover:scale-105 active:scale-95 sm:bottom-6 sm:right-6"
    >
      <span
        aria-hidden
        className="absolute inset-0 rounded-full bg-[#25D366] opacity-60"
        style={{ animation: "fc-pulse 2s ease-out infinite" }}
      />
      <WhatsAppIcon className="relative h-7 w-7" />

      <style>{`
        @keyframes fc-pulse {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.5); opacity: 0; }
        }
      `}</style>
    </a>
  );
}
