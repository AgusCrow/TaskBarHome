import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export interface ToastState {
  id: number;
  msg: string;
  kind: 'ok' | 'error';
}

export const Toast: React.FC<{ toast: ToastState | null }> = ({ toast }) => {
  if (!toast) return null;
  const ok = toast.kind === 'ok';
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] px-4 safe-bottom w-full max-w-sm pointer-events-none"
    >
      <div
        className={`flex items-center gap-2.5 px-4 py-3 rounded-xl border shadow-xl backdrop-blur text-sm font-medium ${
          ok
            ? 'bg-emerald-950/90 border-emerald-600/60 text-emerald-100'
            : 'bg-rose-950/90 border-rose-600/60 text-rose-100'
        }`}
      >
        {ok ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
        <span>{toast.msg}</span>
      </div>
    </div>
  );
};
