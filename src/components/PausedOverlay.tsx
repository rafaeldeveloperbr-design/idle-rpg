import type { ReactNode } from 'react';

// Overlay "Jogo Pausado" — extraído do JSX de App.tsx (markup idêntico)
export default function PausedOverlay() {
  return (
    <div className="fixed inset-0 bg-black/80 z-[90] flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4 animate-pulse">⚔️</div>
        <h2 className="text-2xl font-bold text-purple-300 mb-2">Jogo Pausado</h2>
        <p className="text-sm text-gray-400">Aguardando início da aventura...</p>
      </div>
    </div>
  );
}

// Wrapper do GameViewport + Toasts — extraído do JSX de App.tsx (classes e z-index idênticos)
export function ViewportSection({ children }: { children: ReactNode }) {
  return (
    <div className="w-full h-full relative">
      {children}
    </div>
  );
}

export const viewportWrapperClass =
  'min-h-0 shrink-0 sm:flex-1 sm:h-auto sm:max-h-none w-full overflow-hidden relative z-[10] bg-slate-950';
