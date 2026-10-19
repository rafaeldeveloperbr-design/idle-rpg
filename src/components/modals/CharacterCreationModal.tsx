import React, { useState } from 'react';

interface CharacterCreationModalProps {
  onStartAdventure: (name: string) => void;
}

const CharacterCreationModal: React.FC<CharacterCreationModalProps> = ({ onStartAdventure }) => {
  const [heroName, setHeroName] = useState('Herói');

  const handleStart = () => {
    const finalName = heroName.trim() || 'Herói';
    onStartAdventure(finalName);
  };

  return (
    <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4">
      <div className="bg-[#0f0f1a] border-2 border-purple-500/70 rounded-lg max-w-md w-full shadow-[0_0_40px_rgba(139,92,246,0.5)]">
        {/* Header */}
        <div className="p-6 border-b border-purple-500/30 text-center">
          <div className="text-4xl mb-3">⚔️</div>
          <h2 className="text-xl font-bold text-purple-300 mb-2">Inicie sua Jornada</h2>
          <p className="text-sm text-gray-400">Escolha o nome do seu herói</p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <label className="block text-sm text-gray-300 mb-2">
              Nome do Herói
            </label>
            <input
              type="text"
              value={heroName}
              onChange={(e) => setHeroName(e.target.value)}
              maxLength={20}
              className="w-full px-4 py-3 bg-[#1a1a2e] border-2 border-[#2d2d5e] rounded-md text-white text-base focus:outline-none focus:border-purple-500 transition-colors"
              placeholder="Digite o nome do herói..."
              autoFocus
            />
            <p className="text-xs text-gray-500 mt-2">
              Máximo de 20 caracteres
            </p>
          </div>

          {/* Preview */}
          <div className="mb-6 p-4 bg-[#1a1a2e] rounded-md border border-[#2d2d5e]">
            <p className="text-xs text-gray-400 mb-2">Pré-visualização:</p>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-md flex items-center justify-center border-2 border-blue-300">
                <span className="text-2xl">🗡️</span>
              </div>
              <div>
                <p className="text-lg font-bold text-white">{heroName || 'Herói'}</p>
                <p className="text-xs text-gray-400">Nível 1 • Aventureiro</p>
              </div>
            </div>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStart}
            className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-bold text-base rounded-md transition-all shadow-lg hover:shadow-purple-500/50"
          >
            ⚔️ Começar Aventura
          </button>
        </div>
      </div>
    </div>
  );
};

export default CharacterCreationModal;
