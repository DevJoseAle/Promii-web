"use client";

import { useState, useEffect } from "react";
import { COLORS } from "@/config/colors";
import { Button } from "@/components/ui/button";
import {
  X,
  Upload,
  Loader2,
  FileText,
  Image as ImageIcon,
  Download,
  Trash2,
  Plus,
} from "lucide-react";
import {
  getMerchantDocuments,
  uploadMerchantDocument,
  deleteMerchantDocument,
  type MerchantDocument,
  type DocumentType,
} from "@/lib/services/admin/merchant-documents.admin.service";
import { ToastService } from "@/lib/toast/toast.service";
import { useAuth } from "@/lib/context/AuthContext";

type DocumentsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  merchantId: string;
  merchantName: string;
};

const DOCUMENT_TYPES = [
  { value: "rif" as const, label: "RIF" },
  { value: "registro_mercantil" as const, label: "Registro Mercantil" },
  { value: "cedula" as const, label: "Cédula de Identidad" },
  { value: "otro" as const, label: "Otro" },
];

export function DocumentsModal({
  isOpen,
  onClose,
  merchantId,
  merchantName,
}: DocumentsModalProps) {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<MerchantDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Upload form
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<DocumentType>("rif");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (isOpen) {
      loadDocuments();
    }
  }, [isOpen, merchantId]);

  async function loadDocuments() {
    setLoading(true);
    const response = await getMerchantDocuments(merchantId);

    if (response.status === "success") {
      setDocuments(response.data);
    } else {
      ToastService.showErrorToast(response.error || "Error al cargar documentos");
    }
    setLoading(false);
  }

  async function handleUpload() {
    if (!file || !user) {
      ToastService.showErrorToast("Selecciona un archivo");
      return;
    }

    setUploading(true);
    const response = await uploadMerchantDocument(
      merchantId,
      file,
      documentType,
      notes,
      user.id
    );

    if (response.status === "success") {
      ToastService.showSuccessToast("Documento subido exitosamente");
      setFile(null);
      setNotes("");
      setShowUploadForm(false);
      loadDocuments();
    } else {
      ToastService.showErrorToast(response.error || "Error al subir documento");
    }
    setUploading(false);
  }

  async function handleDelete(doc: MerchantDocument) {
    if (!confirm(`¿Eliminar "${doc.file_name}"?`)) return;

    setDeleting(doc.id);
    const response = await deleteMerchantDocument(doc.id, doc.file_url);

    if (response.status === "success") {
      ToastService.showSuccessToast("Documento eliminado");
      loadDocuments();
    } else {
      ToastService.showErrorToast(response.error || "Error al eliminar");
    }
    setDeleting(null);
  }

  function formatFileSize(bytes: number | null): string {
    if (!bytes) return "-";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        style={{ borderColor: COLORS.border.light }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b" style={{ borderColor: COLORS.border.light }}>
          <div>
            <h2 className="text-xl font-bold" style={{ color: COLORS.text.primary }}>
              Documentos del Merchant
            </h2>
            <p className="text-sm mt-1" style={{ color: COLORS.text.secondary }}>
              {merchantName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="size-5" style={{ color: COLORS.text.secondary }} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Upload Button */}
          {!showUploadForm && (
            <button
              onClick={() => setShowUploadForm(true)}
              className="mb-6 w-full px-4 py-3 rounded-lg font-semibold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              style={{
                backgroundColor: COLORS.primary.main,
              }}
            >
              <Plus className="size-5" />
              <span>SUBIR DOCUMENTO</span>
            </button>
          )}

          {/* Upload Form */}
          {showUploadForm && (
            <div
              className="mb-6 p-4 rounded-lg border"
              style={{
                backgroundColor: COLORS.background.secondary,
                borderColor: COLORS.border.light,
              }}
            >
              <h3 className="text-sm font-semibold mb-4" style={{ color: COLORS.text.primary }}>
                Subir Documento
              </h3>

              <div className="space-y-4">
                {/* Document Type */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: COLORS.text.primary }}>
                    Tipo de Documento
                  </label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value as DocumentType)}
                    className="w-full px-3 py-2 rounded-lg border focus:outline-none focus:ring-2"
                    style={{
                      borderColor: COLORS.border.main,
                      color: COLORS.text.primary,
                    }}
                    disabled={uploading}
                  >
                    {DOCUMENT_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* File Input */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: COLORS.text.primary }}>
                    Archivo
                  </label>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => document.getElementById('merchant-file-input')?.click()}
                      disabled={uploading}
                      className="w-full px-4 py-3 rounded-lg border-2 border-dashed font-medium transition-all duration-200 hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      style={{
                        borderColor: COLORS.primary.main,
                        color: COLORS.primary.main,
                        backgroundColor: COLORS.primary.lighter,
                      }}
                    >
                      <Upload className="size-5" />
                      <span>CLICK AQUÍ PARA SELECCIONAR ARCHIVO</span>
                    </button>
                    <input
                      id="merchant-file-input"
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => setFile(e.target.files?.[0] || null)}
                      className="hidden"
                      disabled={uploading}
                    />
                    {file && (
                      <div
                        className="p-3 rounded-lg flex items-center gap-2"
                        style={{ backgroundColor: COLORS.success.lighter }}
                      >
                        <FileText className="size-4" style={{ color: COLORS.success.main }} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: COLORS.text.primary }}>
                            {file.name}
                          </p>
                          <p className="text-xs" style={{ color: COLORS.text.tertiary }}>
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFile(null)}
                          disabled={uploading}
                          className="p-1 rounded hover:bg-red-100 transition-colors"
                        >
                          <X className="size-4" style={{ color: COLORS.error.main }} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: COLORS.text.primary }}>
                    Notas (Opcional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Número de documento, observaciones..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border resize-none focus:outline-none focus:ring-2"
                    style={{
                      borderColor: COLORS.border.main,
                      color: COLORS.text.primary,
                    }}
                    disabled={uploading}
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    onClick={handleUpload}
                    disabled={!file || uploading}
                    style={{
                      backgroundColor: COLORS.success.main,
                      color: "white",
                    }}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="size-4 mr-2 animate-spin" />
                        Subiendo...
                      </>
                    ) : (
                      <>
                        <Upload className="size-4 mr-2" />
                        Subir
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowUploadForm(false);
                      setFile(null);
                      setNotes("");
                    }}
                    variant="outline"
                    disabled={uploading}
                    style={{
                      color: COLORS.text.secondary,
                      borderColor: COLORS.border.main,
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Documents List */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="size-8 animate-spin" style={{ color: COLORS.primary.main }} />
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="size-12 mx-auto mb-3" style={{ color: COLORS.text.tertiary }} />
              <p className="text-sm" style={{ color: COLORS.text.secondary }}>
                No hay documentos subidos
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => {
                const Icon = doc.file_type === "pdf" ? FileText : ImageIcon;
                const typeLabel = DOCUMENT_TYPES.find((t) => t.value === doc.document_type)?.label || "Otro";

                return (
                  <div
                    key={doc.id}
                    className="flex items-center gap-4 p-4 rounded-lg border hover:bg-gray-50 transition-colors"
                    style={{ borderColor: COLORS.border.light }}
                  >
                    <div
                      className="flex size-10 items-center justify-center rounded-lg flex-shrink-0"
                      style={{ backgroundColor: COLORS.primary.lighter }}
                    >
                      <Icon className="size-5" style={{ color: COLORS.primary.main }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm truncate" style={{ color: COLORS.text.primary }}>
                        {doc.file_name}
                      </div>
                      <div className="flex items-center gap-3 text-xs mt-1" style={{ color: COLORS.text.tertiary }}>
                        <span>{typeLabel}</span>
                        <span>•</span>
                        <span>{formatFileSize(doc.file_size)}</span>
                        <span>•</span>
                        <span>{new Date(doc.uploaded_at).toLocaleDateString("es-VE")}</span>
                      </div>
                      {doc.notes && (
                        <div className="text-xs mt-1" style={{ color: COLORS.text.secondary }}>
                          {doc.notes}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <a
                        href={doc.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg hover:bg-gray-200 transition-colors"
                      >
                        <Download className="size-4" style={{ color: COLORS.primary.main }} />
                      </a>
                      <button
                        onClick={() => handleDelete(doc)}
                        disabled={deleting === doc.id}
                        className="p-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                      >
                        {deleting === doc.id ? (
                          <Loader2 className="size-4 animate-spin" style={{ color: COLORS.error.main }} />
                        ) : (
                          <Trash2 className="size-4" style={{ color: COLORS.error.main }} />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end p-6 border-t" style={{ borderColor: COLORS.border.light }}>
          <Button
            onClick={onClose}
            variant="outline"
            style={{
              color: COLORS.text.secondary,
              borderColor: COLORS.border.main,
            }}
          >
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
}
