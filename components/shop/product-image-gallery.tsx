"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { ImageOff } from "lucide-react";

interface ProductImageGalleryProps {
  images: string[];
  name: string;
  // When provided, this overrides the user-clicked thumbnail. Used by the
  // colour picker to swap to a variant's image without unmounting the gallery.
  forcedImage?: string | null;
}

export function ProductImageGallery({
  images,
  name,
  forcedImage,
}: ProductImageGalleryProps) {
  const [activeImage, setActiveImage] = useState(images[0] || null);

  useEffect(() => {
    if (forcedImage) setActiveImage(forcedImage);
  }, [forcedImage]);

  if (!images || images.length === 0) {
    if (forcedImage) {
      return (
        <div className="relative aspect-square overflow-hidden rounded-3xl bg-[var(--surface-soft)]">
          <Image
            src={forcedImage}
            alt={name}
            fill
            sizes="(min-width: 1024px) 50vw, 100vw"
            className="object-cover"
            priority
            unoptimized
          />
        </div>
      );
    }
    return (
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-[var(--surface-soft)] flex items-center justify-center text-muted-foreground">
        <ImageOff className="h-10 w-10" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-[var(--surface-soft)]">
        <Image
          src={activeImage!}
          alt={name}
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover transition-opacity duration-300"
          priority
          unoptimized
        />
      </div>

      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3">
          {images.map((url, i) => (
            <button
              key={url + i}
              type="button"
              onClick={() => setActiveImage(url)}
              className={`relative aspect-square overflow-hidden rounded-xl bg-[var(--surface-soft)] transition-all ${
                activeImage === url
                  ? "ring-2 ring-[var(--brand)] ring-offset-2"
                  : "hover:opacity-80"
              }`}
            >
              <Image
                src={url}
                alt={`${name} thumbnail ${i + 1}`}
                fill
                sizes="120px"
                className="object-cover"
                unoptimized
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
