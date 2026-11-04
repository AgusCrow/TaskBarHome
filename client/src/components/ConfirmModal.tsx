import React, { useEffect } from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isDestructive = true,
  onConfirm,
  onCancel
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
      if (e.key === 'Enter') onConfirm();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onCancel, onConfirm]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[70] bg-black/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-md rounded-2xl bg-[#14262b] border border-white/10 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.7)] space-y-5">
        {/* Encabezado */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl ${
                isDestructive
                  ? 'bg-rose-950/50 border border-rose-500/30 text-rose-400'
                  : 'bg-[var(--accent)]/15 border border-[var(--accent)]/30 text-[var(--accent)]'
              }`}
            >
              {isDestructive ? <Trash2 className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-medium text-[var(--ink)] tracking-tight">
                {title}
              </h3>
            </div>
          </div>
          <button
            onClick={onCancel}
            aria-label="Cerrar"
            className="p-1 rounded-lg text-[var(--muted)] hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mensaje */}
        <p className="text-sm text-[var(--muted)] leading-relaxed">
          {message}
        </p>

        {/* Botones de confirmación equilibrados */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/5">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl text-xs font-medium text-[var(--muted)] hover:text-[var(--ink)] bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition-all"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all shadow-md flex items-center gap-1.5 ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-950/40'
                : 'bg-[var(--accent)] text-[#1a2d33] hover:brightness-105 shadow-[rgba(241,188,144,0.3)]'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
