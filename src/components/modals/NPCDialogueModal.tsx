import React from 'react';
import type { Quest } from '../../data/questsData';
import { GoldIcon } from '../../App';

interface NPCDialogueModalProps {
  quest: Quest;
  onAccept: () => void;
  onDecline: () => void;
}

const NPCDialogueModal: React.FC<NPCDialogueModalProps> = ({ quest, onAccept, onDecline }) => {
  return (
    <div className="fixed inset-0 bg-black/80 z-60 flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-amber-900 to-amber-950 border-4 border-amber-600 rounded-lg max-w-2xl w-full shadow-[0_0_40px_rgba(251,191,36,0.5)]">
        {/* Header */}
        <div className="p-6 border-b-2 border-amber-700">
          <div className="flex items-center gap-4">
            <div className="text-6xl">{quest.npcIcon}</div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-amber-100 mb-1">{quest.npcName}</h2>
              <p className="text-sm text-amber-300 italic">Nova Quest Disponível!</p>
            </div>
          </div>
        </div>

        {/* Dialogue */}
        <div className="p-6 border-b-2 border-amber-700">
          <h3 className="text-lg font-bold text-amber-200 mb-3">📜 {quest.title}</h3>
          <p className="text-sm text-amber-100 leading-relaxed mb-4">
            "{quest.dialogue}"
          </p>
          
          {/* Objective */}
          <div className="bg-black/30 rounded-lg p-4 mb-4">
            <h4 className="text-sm font-bold text-amber-300 mb-2">🎯 Objetivo:</h4>
            <p className="text-sm text-amber-100">
              {quest.objectiveType === 'kill_monsters' && `Derrotar ${quest.objectiveTarget} monstros`}
              {quest.objectiveType === 'reach_wave' && `Alcançar a wave ${quest.objectiveTarget}`}
              {quest.objectiveType === 'collect_gold' && `Acumular ${quest.objectiveTarget} de ouro`}
              {quest.objectiveType === 'defeat_boss' && `Derrotar ${quest.objectiveTarget} chefes`}
            </p>
          </div>

          {/* Rewards */}
          <div className="bg-black/30 rounded-lg p-4">
            <h4 className="text-sm font-bold text-amber-300 mb-2">💎 Recompensas:</h4>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 bg-yellow-900/50 px-3 py-1 rounded">
                <GoldIcon size="md" />
                <span className="text-sm text-yellow-200">{quest.reward.gold} Ouro</span>
              </div>
              <div className="flex items-center gap-2 bg-blue-900/50 px-3 py-1 rounded">
                <span className="text-blue-400">⭐</span>
                <span className="text-sm text-blue-200">{quest.reward.xp} XP</span>
              </div>
              {quest.reward.item && (
                <div className={`flex items-center gap-2 px-3 py-1 rounded ${
                  quest.reward.item.rarity === 'epic' ? 'bg-purple-900/50' : 'bg-blue-900/50'
                }`}>
                  <span className="text-lg">{quest.reward.item.icon}</span>
                  <span className={`text-sm ${
                    quest.reward.item.rarity === 'epic' ? 'text-purple-200' : 'text-blue-200'
                  }`}>
                    {quest.reward.item.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 flex gap-4">
          <button
            onClick={onAccept}
            className="flex-1 py-3 px-6 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-green-500/50"
          >
            ✅ Aceitar Missão
          </button>
          <button
            onClick={onDecline}
            className="flex-1 py-3 px-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-red-500/50"
          >
            ❌ Recusar
          </button>
        </div>
      </div>
    </div>
  );
};

export default NPCDialogueModal;
