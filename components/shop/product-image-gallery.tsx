"use client";

import Image from "next/image";
import { useState } from "react";
import { ImageOff } from "lucide-react";

interface ProductImageGalleryProps {
  images: string[];
  name: string;
}

export function ProductImageGallery({ images, name }: ProductImageGalleryProps) {
  const [activeImage, setActiveImage] = useState(images[0] || null);

  if (!images || images.length === 0) {
    return (
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-[var(--surface-soft)] flex items-center justify-center text-muted-foreground">
        <ImageOff className="h-10 w-10" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Main Image */}
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

      {/* Thumbnails */}
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
