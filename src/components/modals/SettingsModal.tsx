import React, { useState } from 'react';

interface SettingsModalProps {
  heroName: string;
  onChangeName: (name: string) => void;
  onResetGame: () => void;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  heroName,
  onChangeName,
  onResetGame,
  onClose,
}) => {
  const [tempName, setTempName] = useState(heroName);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSaveName = () => {
    const finalName = tempName.trim() || 'Herói';
    onChangeName(finalName);
  };

  const handleReset = () => {
    if (showResetConfirm) {
      onResetGame();
    } else {
      setShowResetConfirm(true);
    }
  };

  const handleCancelReset = () => {
    setShowResetConfirm(false);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-[#0f0f1a] border-2 border-purple-500/70 rounded-lg max-w-md w-full shadow-[0_0_40px_rgba(139,92,246,0.5)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-purple-500/30">
          <h2 className="text-lg font-bold text-purple-300 flex items-center gap-2">
            <span>⚙️</span> Configurações
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl leading-none w-8 h-8 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Change Name Section */}
          <div className="mb-6">
            <label className="block text-sm text-gray-300 mb-2">
              Nome do Herói
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                maxLength={20}
                className="flex-1 px-4 py-3 bg-[#1a1a2e] border-2 border-[#2d2d5e] rounded-md text-white text-base focus:outline-none focus:border-purple-500 transition-colors"
                placeholder="Digite o nome do herói..."
              />
              <button
                onClick={handleSaveName}
                disabled={tempName === heroName || !tempName.trim()}
                className="px-4 py-3 bg-purple-600 hover:bg-purple-500 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-bold rounded-md transition-colors"
              >
                Salvar
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Máximo de 20 caracteres
            </p>
          </div>

          {/* Game Info */}
          <div className="mb-6 p-4 bg-[#1a1a2e] rounded-md border border-[#2d2d5e]">
            <h3 className="text-sm font-bold text-gray-300 mb-2">Informações do Jogo</h3>
            <div className="space-y-1 text-xs text-gray-400">
              <p>• Progresso salvo automaticamente a cada 5 segundos</p>
              <p>• Use a aba "Atributos" para melhorar seu herói</p>
              <p>• Derrote inimigos para ganhar ouro e experiência</p>
              <p>• A cada 10 inimigos, um chefe aparece!</p>
            </div>
          </div>

          {/* Reset Section */}
          <div className="border-t border-[#2d2d5e] pt-6">
            {!showResetConfirm ? (
              <button
                onClick={handleReset}
                className="w-full py-3 px-4 bg-red-900/30 hover:bg-red-900/50 border border-red-700/50 text-red-300 text-sm rounded-md transition-colors flex items-center justify-center gap-2"
              >
                <span>🔄</span>
                <span>Reiniciar Aventura do Zero</span>
              </button>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-red-900/20 border border-red-700/50 rounded-md">
                  <p className="text-sm text-red-300 font-bold mb-1">⚠️ Atenção!</p>
                  <p className="text-xs text-gray-400">
                    Esta ação irá apagar TODO o seu progresso e não pode ser desfeita.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleReset}
                    className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-500 text-white font-bold text-sm rounded-md transition-colors"
                  >
                    Sim, Apagar Tudo
                  </button>
                  <button
                    onClick={handleCancelReset}
                    className="flex-1 py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white font-bold text-sm rounded-md transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
