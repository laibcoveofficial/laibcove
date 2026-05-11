import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Sparkles, Star } from "lucide-react";
import { AnnouncementBar } from "@/components/site/announcement-bar";
import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { getSupabase } from "@/lib/supabase/server";
import { formatPKR, type Product } from "@/lib/supabase/types";
import { ProductImageGallery } from "@/components/shop/product-image-gallery";

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

  const onSale =
    product.compare_at_price_pkr &&
    product.compare_at_price_pkr > product.price_pkr;
  const soldOut = product.status === "sold_out" || product.stock <= 0;

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

          <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
            <div className="space-y-3">
              <div className="relative">
                <ProductImageGallery 
                  images={product.images || []} 
                  name={product.name} 
                />
                
                <div className="absolute left-4 top-4 flex flex-col gap-1.5 z-10 pointer-events-none">
                  {product.is_new_arrival ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-[var(--brand)] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
                      <Sparkles className="h-3 w-3" />
                      New
                    </span>
                  ) : null}
                  {product.is_best_seller ? (
                    <span className="rounded-full bg-amber-400 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
                      Best Seller
                    </span>
                  ) : null}
                </div>
              </div>

              {product.video_url ? (
                <div className="pt-2">
                  <VideoEmbed url={product.video_url} />
                </div>
              ) : null}
            </div>

            <div className="lg:sticky lg:top-24 lg:self-start">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                {product.category_slug ? (
                  <span className="rounded-full bg-[var(--brand-soft)] px-3 py-1 font-semibold uppercase tracking-wider text-[var(--brand)]">
                    {product.category_slug}
                  </span>
                ) : null}
                {soldOut ? (
                  <span className="rounded-full bg-gray-100 px-3 py-1 font-semibold uppercase tracking-wider text-gray-700">
                    Sold Out
                  </span>
                ) : null}
              </div>

              <h1 className="font-heading mt-4 text-3xl text-foreground sm:text-4xl lg:text-5xl">
                {product.name}
              </h1>

              <div className="mt-5 flex items-baseline gap-3">
                <span className="font-heading text-3xl text-foreground">
                  {formatPKR(product.price_pkr)}
                </span>
                {onSale ? (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPKR(product.compare_at_price_pkr)}
                  </span>
                ) : null}
                {onSale ? (
                  <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                    Sale
                  </span>
                ) : null}
              </div>

              <div className="mt-6 flex items-center gap-1 text-[var(--brand)]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-current" strokeWidth={0} />
                ))}
                <span className="ml-1 text-sm text-muted-foreground">
                  Handmade with love
                </span>
              </div>

              {product.description ? (
                <div className="mt-7 whitespace-pre-wrap text-base leading-relaxed text-foreground/85">
                  {product.description}
                </div>
              ) : null}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {soldOut ? (
                  <Link
                    href={`/contact?product=${encodeURIComponent(product.name)}`}
                    className="group inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[var(--brand)] px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[var(--brand)]/25 transition-all hover:-translate-y-0.5"
                  >
                    Request Similar
                  </Link>
                ) : (
                  <AddToCartButton
                    product={product}
                    label="Add to Cart"
                    className="flex-1"
                  />
                )}
                <Link
                  href="/shop"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-foreground/20 bg-white px-7 py-3.5 text-sm font-semibold text-foreground transition-colors hover:border-[var(--brand)] hover:text-[var(--brand)]"
                >
                  Keep Browsing
                </Link>
              </div>

              <p className="mt-6 text-xs text-muted-foreground">
                Free delivery on orders over PKR 5,000. Each piece is made with
                love — turnaround is typically 2–4 weeks once your payment is
                confirmed.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
