import React from 'react';

type PathChoice = 'safe' | 'challenging' | 'deadly';

interface PathChoiceModalProps {
  onChoose: (choice: PathChoice) => void;
  onOpenShop: () => void;
}

const PathChoiceModal: React.FC<PathChoiceModalProps> = ({ onChoose, onOpenShop }) => {
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-b from-amber-900 to-amber-950 border-4 border-amber-600 rounded-lg max-w-2xl w-full shadow-[0_0_40px_rgba(251,191,36,0.5)]">
        {/* Header */}
        <div className="p-6 border-b-2 border-amber-700 text-center">
          <h2 className="text-2xl font-bold text-amber-100 mb-2">⚠️ BIFURCAÇÃO ⚠️</h2>
          <p className="text-sm text-amber-200">Escolha seu caminho, aventureiro!</p>
          <p className="text-xs text-green-300 mt-2">💚 Sua vida foi restaurada para 100%!</p>
        </div>

        {/* Choices */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Safe Path */}
          <button
            onClick={() => onChoose('safe')}
            className="group relative p-4 bg-green-900/50 border-2 border-green-600 rounded-lg hover:bg-green-800/60 hover:border-green-500 transition-all hover:scale-105"
          >
            <div className="text-center">
              <div className="text-4xl mb-2">🟢</div>
              <h3 className="text-lg font-bold text-green-200 mb-2">Caminho Seguro</h3>
              <p className="text-xs text-green-300 mb-3">
                Inimigos normais (100% status base)
              </p>
              <div className="text-xs text-yellow-300 font-bold">
                Recompensa: Ouro e XP normais
              </div>
            </div>
            <div className="absolute inset-0 border-2 border-green-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </button>

          {/* Challenging Path */}
          <button
            onClick={() => onChoose('challenging')}
            className="group relative p-4 bg-yellow-900/50 border-2 border-yellow-600 rounded-lg hover:bg-yellow-800/60 hover:border-yellow-500 transition-all hover:scale-105"
          >
            <div className="text-center">
              <div className="text-4xl mb-2">🟡</div>
              <h3 className="text-lg font-bold text-yellow-200 mb-2">Caminho Desafiador</h3>
              <p className="text-xs text-yellow-300 mb-3">
                Inimigos +30% HP / Dano
              </p>
              <div className="text-xs text-yellow-300 font-bold">
                Recompensa: +50% Ouro/XP + Maior chance de Drop Raro
              </div>
            </div>
            <div className="absolute inset-0 border-2 border-yellow-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </button>

          {/* Deadly Path */}
          <button
            onClick={() => onChoose('deadly')}
            className="group relative p-4 bg-red-900/50 border-2 border-red-600 rounded-lg hover:bg-red-800/60 hover:border-red-500 transition-all hover:scale-105"
          >
            <div className="text-center">
              <div className="text-4xl mb-2">🔴</div>
              <h3 className="text-lg font-bold text-red-200 mb-2">Caminho Mortal</h3>
              <p className="text-xs text-red-300 mb-3">
                Horda Elite / Mini-chefe (+80% HP / Dano)
              </p>
              <div className="text-xs text-yellow-300 font-bold">
                Recompensa: x2 Ouro/XP + Drop Épico/Lendário garantido
              </div>
            </div>
            <div className="absolute inset-0 border-2 border-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </button>
        </div>

        {/* Preparation Button */}
        <div className="px-6 pb-4">
          <button
            onClick={onOpenShop}
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white font-bold rounded-lg transition-all shadow-lg hover:shadow-purple-500/50 flex items-center justify-center gap-2"
          >
            <span className="text-xl">🧪</span>
            <span>Preparar / Comprar Consumíveis</span>
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
