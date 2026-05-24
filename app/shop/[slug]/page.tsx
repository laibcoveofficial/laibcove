import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AnnouncementBar } from "@/components/site/announcement-bar";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { getSupabase } from "@/lib/supabase/server";
import { type Product } from "@/lib/supabase/types";
import { ProductPurchasePanel } from "@/components/shop/product-purchase-panel";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function loadProduct(slugOrId: string): Promise<Product | null> {
  try {
    const supabase = getSupabase();
    const filter = UUID_RE.test(slugOrId)
      ? { column: "id", value: slugOrId }
      : { column: "slug", value: slugOrId };

    const { data } = await supabase
      .from("products")
      .select("*")
      .eq(filter.column, filter.value)
      .eq("is_published", true)
      .maybeSingle();
    return (data as Product | null) ?? null;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product) return { title: "Product not found — Laibcove" };
  return {
    title: `${product.name} — Laibcove`,
    description:
      product.description.slice(0, 160) ||
      "Handmade crochet by Laibcove — every stitch made with love.",
  };
}

export const dynamic = "force-dynamic";

function getYouTubeId(url: string): string | null {
  const m = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{6,})/,
  );
  return m ? m[1] : null;
}

function VideoEmbed({ url }: { url: string }) {
  const yt = getYouTubeId(url);
  if (yt) {
    return (
      <div className="aspect-video overflow-hidden rounded-3xl bg-black">
        <iframe
          src={`https://www.youtube.com/embed/${yt}`}
          title="Product video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    );
  }
  if (/vimeo\.com\/(\d+)/.test(url)) {
    const id = url.match(/vimeo\.com\/(\d+)/)?.[1];
    if (id) {
      return (
        <div className="aspect-video overflow-hidden rounded-3xl bg-black">
          <iframe
            src={`https://player.vimeo.com/video/${id}`}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        </div>
      );
    }
  }
  // Treat as direct video file
  return (
    <video
      controls
      className="aspect-video w-full overflow-hidden rounded-3xl bg-black"
      src={url}
    />
  );
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await loadProduct(slug);
  if (!product) notFound();

  return (
    <>
      <AnnouncementBar />
      <Header />
      <main className="flex flex-1 flex-col bg-background py-10 sm:py-16">
        <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <nav className="mb-6 flex items-center gap-2 text-xs text-muted-foreground">
            <Link href="/shop" className="hover:text-[var(--brand)]">
              Shop
            </Link>
            <span>/</span>
            {product.category_slug ? (
              <>
                <Link
                  href={`/shop?category=${product.category_slug}`}
                  className="hover:text-[var(--brand)]"
                >
                  {product.category_slug}
                </Link>
                <span>/</span>
              </>
            ) : null}
            <span className="text-foreground/80">{product.name}</span>
          </nav>

          <ProductPurchasePanel product={product} />

          {product.video_url ? (
            <div className="mt-10 max-w-3xl">
              <VideoEmbed url={product.video_url} />
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
    </>
  );
}
