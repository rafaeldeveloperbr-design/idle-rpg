import React from 'react';
import type { Quest } from '../../data/questsData';

interface QuestsTabProps {
  quests: Quest[];
  onCompleteQuest: (questId: string) => void;
}

const QuestsTab: React.FC<QuestsTabProps> = ({ quests, onCompleteQuest }) => {
  const activeQuests = quests.filter(q => q.active && !q.completed);
  const completedQuests = quests.filter(q => q.completed);

  const getObjectiveText = (quest: Quest): string => {
    switch (quest.objectiveType) {
      case 'kill_monsters':
        return `Derrotar monstros`;
      case 'reach_wave':
        return `Alcançar wave`;
      case 'collect_gold':
        return `Acumular ouro`;
      case 'defeat_boss':
        return `Derrotar chefes`;
      default:
        return '';
    }
  };

  return (
    <div className="p-4">
      <h3 className="text-sm text-purple-300 mb-4 flex items-center gap-2">
        <span>📜</span> Journal de Quests
      </h3>

      {/* Active Quests */}
      <div className="mb-6">
        <h4 className="text-xs text-amber-300 mb-2 flex items-center gap-2">
          <span>⚔️</span> Quests Ativas ({activeQuests.length})
        </h4>
        {activeQuests.length === 0 ? (
          <div className="text-xs text-gray-500 italic p-3 bg-[#0a0a12] rounded-md border border-[#2d2d5e]">
            Nenhuma quest ativa. Explore o mundo para encontrar NPCs!
          </div>
        ) : (
          <div className="space-y-2">
            {activeQuests.map((quest) => {
              const progressPercent = Math.min(100, (quest.progress / quest.objectiveTarget) * 100);
              const isComplete = quest.progress >= quest.objectiveTarget;

              return (
                <div
                  key={quest.id}
                  className={`border rounded-md p-3 ${
                    isComplete
                      ? 'border-green-500/50 bg-green-900/20'
                      : 'border-[#2d2d5e] bg-[#0f0f1a]'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-2">
                    <div className="text-2xl">{quest.npcIcon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-bold text-gray-200">{quest.title}</span>
                        {isComplete && (
                          <span className="text-[10px] bg-green-600 text-white px-2 py-0.5 rounded">
                            COMPLETA
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-400 mb-2">{quest.npcName}</p>
                      
                      {/* Progress Bar */}
                      <div className="mb-2">
                        <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                          <span>{getObjectiveText(quest)}</span>
                          <span>{quest.progress}/{quest.objectiveTarget}</span>
                        </div>
                        <div className="w-full h-2 bg-[#1a1a2e] rounded-sm overflow-hidden border border-[#2d2d5e]">
                          <div
                            className={`h-full transition-all duration-300 ${
                              isComplete ? 'bg-green-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Complete Button */}
                  {isComplete && (
                    <button
                      onClick={() => onCompleteQuest(quest.id)}
                      className="w-full py-2 px-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white text-xs font-bold rounded transition-all"
                    >
                      ✅ Entregar Missão e Coletar Recompensa
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed Quests */}
      {completedQuests.length > 0 && (
        <div>
          <h4 className="text-xs text-green-300 mb-2 flex items-center gap-2">
            <span>✅</span> Quests Concluídas ({completedQuests.length})
          </h4>
          <div className="space-y-2">
            {completedQuests.map((quest) => (
              <div
                key={quest.id}
                className="border border-green-500/30 bg-green-900/10 rounded-md p-3 opacity-60"
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{quest.npcIcon}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-gray-400 line-through">{quest.title}</span>
                      <span className="text-[10px] bg-green-600/50 text-green-300 px-2 py-0.5 rounded">
                        CONCLUÍDA
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-500">{quest.npcName}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestsTab;
