import React from 'react';
import type { PremiumItem } from '../../App';
import { GoldIcon } from '../../App';

interface DiamondShopModalProps {
  premiumItems: PremiumItem[];
  heroDiamonds: number;
  onBuyItem: (itemId: string) => void;
  onClose: () => void;
}

const DiamondShopModal: React.FC<DiamondShopModalProps> = ({
  premiumItems,
  heroDiamonds,
  onBuyItem,
  onClose,
}) => {
  const regularItems = premiumItems.filter(item => item.type !== 'diamond_pack');
  const diamondPacks = premiumItems.filter(item => item.type === 'diamond_pack');

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-gradient-to-b from-blue-900 to-indigo-950 border-2 border-cyan-400/70 rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col shadow-[0_0_40px_rgba(34,211,238,0.4)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-cyan-400/30">
          <h2 className="text-lg font-bold text-cyan-300 flex items-center gap-2">
            <span>💎</span> Loja de Diamantes
          </h2>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 bg-[#1a1a2e] px-3 py-1.5 border border-cyan-400/50 rounded-sm">
              <span className="text-sm">💎</span>
              <span className="text-xs text-cyan-300 font-bold">{heroDiamonds.toLocaleString()}</span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-2xl leading-none w-8 h-8 flex items-center justify-center"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Regular Premium Items */}
          <div className="mb-6">
            <h3 className="text-sm text-cyan-300 mb-3 flex items-center gap-2">
              <span>✨</span> Itens Premium
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {regularItems.map((item) => {
                const canAfford = heroDiamonds >= item.price;
                
                return (
                  <div
                    key={item.id}
                    className={`border rounded-md p-3 flex items-start gap-3 transition-colors ${
                      canAfford
                        ? 'border-cyan-400/50 bg-cyan-900/10 hover:bg-cyan-900/20'
                        : 'border-[#2d2d5e] bg-[#0a0a12] opacity-60'
                    }`}
                  >
                    <span className="text-3xl">{item.icon}</span>
                    <div className="flex-1">
                      <div className="text-sm text-gray-200 font-bold mb-1">{item.name}</div>
                      <p className="text-xs text-gray-400 mb-2">{item.description}</p>
                      {item.duration && (
                        <p className="text-[10px] text-cyan-400 mb-2">
                          ⏱️ Duração: {item.duration >= 3600 ? `${item.duration / 3600} hora(s)` : `${item.duration / 60} minuto(s)`}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <span className={`text-xs flex items-center gap-1 ${canAfford ? 'text-cyan-300' : 'text-red-400'}`}>
                          💎 {item.price}
                        </span>
                        <button
                          onClick={() => onBuyItem(item.id)}
                          disabled={!canAfford}
                          className={`text-xs px-3 py-1 rounded-sm transition-colors ${
                            canAfford
                              ? 'bg-cyan-600 hover:bg-cyan-500 text-white'
                              : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          Comprar
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Diamond Packs */}
          <div>
            <h3 className="text-sm text-cyan-300 mb-3 flex items-center gap-2">
              <span>💎</span> Pacotes de Diamantes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {diamondPacks.map((pack) => {
                return (
                  <div
                    key={pack.id}
                    className="border border-cyan-400/50 bg-gradient-to-br from-cyan-900/20 to-blue-900/20 rounded-md p-4 flex flex-col items-center gap-2 hover:bg-cyan-900/30 transition-colors cursor-pointer"
                    onClick={() => onBuyItem(pack.id)}
                  >
                    <span className="text-4xl">{pack.icon}</span>
                    <div className="text-center">
                      <div className="text-lg font-bold text-cyan-300">{pack.value} 💎</div>
                      <div className="text-xs text-gray-400 mb-2">{pack.description}</div>
                      <div className="text-sm font-bold text-green-400">{pack.realPrice}</div>
                    </div>
                    <button
                      className="w-full py-2 px-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white text-xs font-bold rounded transition-all"
                    >
                      Comprar
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-cyan-400/30 bg-blue-950/50">
          <p className="text-xs text-gray-400 text-center">
            💡 Dica: Diamantes podem ser obtidos através de compras reais ou eventos especiais do jogo
          </p>
        </div>
      </div>
    </div>
  );
};

export default DiamondShopModal;
