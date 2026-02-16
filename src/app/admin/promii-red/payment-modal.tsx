"use client";

import { useState } from "react";
import { COLORS } from "@/config/colors";
import { Button } from "@/components/ui/button";
import { X, Upload, Loader2, Image as ImageIcon } from "lucide-react";

type PaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (file: File | null, notes: string) => Promise<void>;
  paymentType: "base" | "bonus";
  amount: number;
  referrerName: string;
};

export function PaymentModal({
  isOpen,
  onClose,
  onConfirm,
  paymentType,
  amount,
  referrerName,
}: PaymentModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);

      // Crear preview si es imagen
      if (selectedFile.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setPreview(null);
      }
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onConfirm(file, notes);
      handleClose();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    setNotes("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={handleClose}>
      <div
        className="bg-white rounded-xl shadow-xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{ borderColor: COLORS.border.light }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: COLORS.border.light }}>
          <div>
            <h2 className="text-xl font-bold" style={{ color: COLORS.text.primary }}>
              Marcar Pago {paymentType === "base" ? "Base" : "Bonus"}
            </h2>
            <p className="text-sm mt-1" style={{ color: COLORS.text.secondary }}>
              {referrerName} - ${amount.toFixed(2)}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            disabled={loading}
          >
            <X className="size-5" style={{ color: COLORS.text.secondary }} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: COLORS.text.primary }}>
              Comprobante de Pago (Opcional)
            </label>
            <div
              className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
              style={{ borderColor: COLORS.border.main }}
              onClick={() => document.getElementById("file-input")?.click()}
            >
              {preview ? (
                <div className="space-y-3">
                  <img
                    src={preview}
                    alt="Preview"
                    className="max-h-48 mx-auto rounded-lg object-contain"
                  />
                  <p className="text-sm" style={{ color: COLORS.text.secondary }}>
                    {file?.name}
                  </p>
                </div>
              ) : file ? (
                <div className="space-y-3">
                  <ImageIcon className="size-12 mx-auto" style={{ color: COLORS.text.tertiary }} />
                  <p className="text-sm" style={{ color: COLORS.text.secondary }}>
                    {file.name}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="size-12 mx-auto" style={{ color: COLORS.text.tertiary }} />
                  <div>
                    <p className="text-sm font-medium" style={{ color: COLORS.text.primary }}>
                      Click para subir comprobante
                    </p>
                    <p className="text-xs mt-1" style={{ color: COLORS.text.tertiary }}>
                      PNG, JPG hasta 5MB
                    </p>
                  </div>
                </div>
              )}
              <input
                id="file-input"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={loading}
              />
            </div>
            {file && (
              <button
                onClick={() => {
                  setFile(null);
                  setPreview(null);
                }}
                className="text-sm mt-2 hover:underline"
                style={{ color: COLORS.error.main }}
                disabled={loading}
              >
                Eliminar archivo
              </button>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold mb-2" style={{ color: COLORS.text.primary }}>
              Notas / Comentarios (Opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Método de pago, número de referencia, etc..."
              rows={3}
              className="w-full px-4 py-2 rounded-lg border resize-none focus:outline-none focus:ring-2"
              style={{
                borderColor: COLORS.border.main,
                color: COLORS.text.primary,
              }}
              disabled={loading}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t" style={{ borderColor: COLORS.border.light }}>
          <Button
            onClick={handleClose}
            variant="outline"
            disabled={loading}
            style={{
              color: COLORS.text.secondary,
              borderColor: COLORS.border.main,
            }}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="min-w-[120px]"
            style={{
              backgroundColor: COLORS.success.main,
              color: "white",
            }}
          >
            {loading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              "Confirmar Pago"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
