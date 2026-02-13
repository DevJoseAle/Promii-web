import { useObjectUrls } from "@/config/hooks/useObjectUrl";
import * as React from "react";

const MAX_PHOTOS = 4;
const MIN_PHOTOS = 1;

export type ExistingPhoto = {
  id: string;
  public_url: string;
  sort_order: number;
};

export function PhotosField({
  files,
  onChange,
  existingPhotos = [],
  onRemoveExisting,
  error,
}: {
  files: File[];
  onChange: (next: File[]) => void;
  existingPhotos?: ExistingPhoto[];
  onRemoveExisting?: (photoId: string) => void;
  error?: string;
}) {
  const urls = useObjectUrls(files);
  const [localError, setLocalError] = React.useState<string | null>(null);

  const totalPhotos = existingPhotos.length + files.length;

  function addFiles(list: FileList | null) {
    if (!list) return;

    setLocalError(null);

    const incoming = Array.from(list).filter((f) =>
      f.type.startsWith("image/")
    );

    if (incoming.length === 0) return;

    if (totalPhotos + incoming.length > MAX_PHOTOS) {
      setLocalError(`Puedes subir un máximo de ${MAX_PHOTOS} fotos.`);
      return;
    }

    onChange([...files, ...incoming]);
  }

  function removeAt(idx: number) {
    const next = files.filter((_, i) => i !== idx);
    onChange(next);
    setLocalError(null);
  }

  const canAddMore = totalPhotos < MAX_PHOTOS;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-text-primary">
            Fotos del Promii
          </div>
          <div className="text-xs text-text-secondary">
            Mínimo {MIN_PHOTOS}, máximo {MAX_PHOTOS} fotos del producto o servicio.
          </div>
        </div>

        <label
          className={`inline-flex items-center rounded-md border px-3 py-2 text-sm font-medium
            ${
              canAddMore
                ? "cursor-pointer border-border bg-background hover:bg-muted"
                : "cursor-not-allowed border-border bg-muted text-text-secondary"
            }`}
        >
          Subir fotos
          <input
            type="file"
            accept="image/*"
            multiple
            disabled={!canAddMore}
            className="hidden"
            onChange={(e) => addFiles(e.target.files)}
          />
        </label>
      </div>

      {/* Errores */}
      {error ? (
        <div className="text-xs text-red-600">{error}</div>
      ) : null}

      {localError ? (
        <div className="text-xs text-red-600">{localError}</div>
      ) : null}

      {/* Preview */}
      {totalPhotos === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-background p-6 text-sm text-text-secondary">
          Debes subir al menos {MIN_PHOTOS} foto.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {/* Existing photos (from DB) */}
          {existingPhotos.map((photo, idx) => (
            <div
              key={photo.id}
              className="group relative overflow-hidden rounded-xl border border-border bg-background"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.public_url}
                alt={`foto-existente-${idx}`}
                className="h-32 w-full object-cover"
              />

              {onRemoveExisting && (
                <button
                  type="button"
                  onClick={() => onRemoveExisting(photo.id)}
                  className="absolute right-2 top-2 rounded-md bg-black/70 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100"
                >
                  Quitar
                </button>
              )}

              <div className="absolute bottom-2 left-2 rounded-md bg-black/70 px-2 py-1 text-xs text-white">
                {idx + 1}
              </div>
            </div>
          ))}

          {/* New photos (local files) */}
          {urls.map((src, idx) => (
            <div
              key={src}
              className="group relative overflow-hidden rounded-xl border border-border bg-background"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`foto-nueva-${idx}`}
                className="h-32 w-full object-cover"
              />

              <button
                type="button"
                onClick={() => removeAt(idx)}
                className="absolute right-2 top-2 rounded-md bg-black/70 px-2 py-1 text-xs text-white opacity-0 transition group-hover:opacity-100"
              >
                Quitar
              </button>

              <div className="absolute bottom-2 left-2 rounded-md bg-black/70 px-2 py-1 text-xs text-white">
                {existingPhotos.length + idx + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="text-xs text-text-secondary">
        {totalPhotos}/{MAX_PHOTOS} fotos seleccionadas
      </div>
    </div>
  );
}
