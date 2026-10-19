import React from 'react';

type PathChoice = 'risk' | 'rest' | 'mine';

interface PathChoiceModalProps {
  onChoose: (choice: PathChoice) => void;
}

const PathChoiceModal: React.FC<PathChoiceModalProps> = ({ onChoose }) => {
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-amber-900 to-amber-950 border-4 border-amber-600 rounded-lg max-w-2xl w-full shadow-[0_0_40px_rgba(251,191,36,0.5)]">
        {/* Header */}
        <div className="p-6 border-b-2 border-amber-700 text-center">
          <h2 className="text-2xl font-bold text-amber-100 mb-2">⚠️ BIFURCAÇÃO ⚠️</h2>
          <p className="text-sm text-amber-200">Escolha seu caminho, aventureiro!</p>
        </div>

        {/* Choices */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Risk Path */}
          <button
            onClick={() => onChoose('risk')}
            className="group relative p-4 bg-red-900/50 border-2 border-red-600 rounded-lg hover:bg-red-800/60 hover:border-red-500 transition-all hover:scale-105"
          >
            <div className="text-center">
              <div className="text-4xl mb-2">⚔️</div>
              <h3 className="text-lg font-bold text-red-200 mb-2">Caminho do Risco</h3>
              <p className="text-xs text-red-300 mb-3">
                Enfrente uma horda de elite ou mini-chefe
              </p>
              <div className="text-xs text-yellow-300 font-bold">
                Recompensa: Item Raro/Épico + Muito Ouro
              </div>
            </div>
            <div className="absolute inset-0 border-2 border-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </button>

          {/* Rest Path */}
          <button
            onClick={() => onChoose('rest')}
            className="group relative p-4 bg-green-900/50 border-2 border-green-600 rounded-lg hover:bg-green-800/60 hover:border-green-500 transition-all hover:scale-105"
          >
            <div className="text-center">
              <div className="text-4xl mb-2">🔥</div>
              <h3 className="text-lg font-bold text-green-200 mb-2">Caminho do Descanso</h3>
              <p className="text-xs text-green-300 mb-3">
                Encontre uma fogueira sagrada
              </p>
              <div className="text-xs text-yellow-300 font-bold">
                Recompensa: Cura 100% HP + Bônus Temporário
              </div>
            </div>
            <div className="absolute inset-0 border-2 border-green-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </button>

          {/* Mine Path */}
          <button
            onClick={() => onChoose('mine')}
            className="group relative p-4 bg-blue-900/50 border-2 border-blue-600 rounded-lg hover:bg-blue-800/60 hover:border-blue-500 transition-all hover:scale-105"
          >
            <div className="text-center">
              <div className="text-4xl mb-2">⛏️</div>
              <h3 className="text-lg font-bold text-blue-200 mb-2">Caminho da Mineração</h3>
              <p className="text-xs text-blue-300 mb-3">
                Colete recursos e materiais extras
              </p>
              <div className="text-xs text-yellow-300 font-bold">
                Recompensa: Muito Ouro + Materiais de Forja
              </div>
            </div>
            <div className="absolute inset-0 border-2 border-blue-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </button>
        </div>

        {/* Footer */}
        <div className="p-4 border-t-2 border-amber-700 text-center">
          <p className="text-xs text-amber-300 italic">
            "Cada escolha molda seu destino..."
          </p>
        </div>
      </div>
    </div>
  );
};

export default PathChoiceModal;
