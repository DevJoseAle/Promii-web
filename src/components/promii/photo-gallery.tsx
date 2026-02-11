"use client";

import { useState } from "react";
import Image from "next/image";
import { COLORS } from "@/config/colors";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Props = {
  photos: Array<{
    id: string;
    public_url: string;
    sort_order: number;
  }>;
  title: string;
};

export function PhotoGallery({ photos, title }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!photos || photos.length === 0) {
    return (
      <div
        className="relative h-[400px] lg:h-[500px] rounded-2xl overflow-hidden flex items-center justify-center"
        style={{ backgroundColor: COLORS.background.tertiary }}
      >
        <div className="text-center" style={{ color: COLORS.text.tertiary }}>
          Sin imágenes
        </div>
      </div>
    );
  }

  const currentPhoto = photos[currentIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="space-y-4">
      {/* Main photo */}
      <div className="relative h-[400px] lg:h-[500px] rounded-2xl overflow-hidden border"
        style={{ borderColor: COLORS.border.light }}
      >
        <Image
          src={currentPhoto.public_url}
          alt={`${title} - Foto ${currentIndex + 1}`}
          fill
          className="object-cover"
          priority={currentIndex === 0}
        />

        {/* Navigation buttons */}
        {photos.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center size-10 rounded-full transition-all duration-200 hover:scale-110"
              style={{
                backgroundColor: COLORS.background.primary,
                color: COLORS.text.primary,
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              }}
              aria-label="Foto anterior"
            >
              <ChevronLeft className="size-6" />
            </button>

            <button
              onClick={handleNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center justify-center size-10 rounded-full transition-all duration-200 hover:scale-110"
              style={{
                backgroundColor: COLORS.background.primary,
                color: COLORS.text.primary,
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              }}
              aria-label="Foto siguiente"
            >
              <ChevronRight className="size-6" />
            </button>
          </>
        )}

        {/* Photo counter */}
        {photos.length > 1 && (
          <div
            className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full text-xs font-semibold"
            style={{
              backgroundColor: COLORS.background.primary,
              color: COLORS.text.primary,
            }}
          >
            {currentIndex + 1} / {photos.length}
          </div>
        )}
      </div>

      {/* Thumbnail strip */}
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              onClick={() => setCurrentIndex(index)}
              className="relative h-20 w-28 shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200"
              style={{
                borderColor: index === currentIndex ? COLORS.primary.main : COLORS.border.light,
                opacity: index === currentIndex ? 1 : 0.6,
              }}
            >
              <Image
                src={photo.public_url}
                alt={`Miniatura ${index + 1}`}
                fill
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
