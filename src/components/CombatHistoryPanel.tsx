import type { Toast } from '../types/game';

// Histórico de atividades recentes (visível só em mobile) — extraído do JSX de App.tsx (markup idêntico)
export default function CombatHistoryPanel({ combatHistory }: { combatHistory: Toast[] }) {
  return (
    <div className="flex-1 min-h-0 w-full overflow-y-auto bg-slate-950 border-t border-purple-900/50 px-3 py-3 sm:hidden">
      <div className="rounded-lg border border-purple-800/60 bg-slate-900/80 px-3 py-3 shadow-md">
        <h3 className="text-sm font-bold text-purple-300 mb-2 leading-relaxed">
          📜 Atividades Recentes
        </h3>

        {combatHistory.length === 0 ? (
          <p className="text-xs text-gray-500">
            Nenhum evento registrado ainda.
          </p>
        ) : (
          <div className="flex flex-col gap-2.5">
            {combatHistory.map((event) => (
              <div
                key={event.id}
                className="rounded-md border border-slate-700/80 bg-slate-950 px-3 py-2.5 text-xs leading-relaxed text-gray-200 break-words"
              >
                {event.message}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
