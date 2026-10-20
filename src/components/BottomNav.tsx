export type DrawerName = 'attributes' | 'skills' | 'inventory' | 'quests';

interface BottomNavProps {
  activeDrawer: DrawerName | null;
  onToggle: (drawer: DrawerName) => void;
}

const NAV_ITEMS: { drawer: DrawerName; icon: string; label: string }[] = [
  { drawer: 'attributes', icon: '⚔️', label: 'Atributos' },
  { drawer: 'skills', icon: '✨', label: 'Skills' },
  { drawer: 'inventory', icon: '🎒', label: 'Bag' },
  { drawer: 'quests', icon: '📜', label: 'Quests' },
];

// Barra de navegação inferior — extraída do JSX de App.tsx (classes ativas/inativas idênticas)
export default function BottomNav({ activeDrawer, onToggle }: BottomNavProps) {
  return (
    <div className="relative h-16 w-full shrink-0 z-[60] bg-slate-900 border-t border-slate-700 flex items-center justify-around">
      {NAV_ITEMS.map(({ drawer, icon, label }) => (
        <button
          key={drawer}
          onClick={() => onToggle(drawer)}
          className={`flex-1 h-full flex flex-col items-center justify-center transition-all ${activeDrawer === drawer
            ? 'text-purple-400 bg-purple-900/20 border-t-2 border-purple-500'
            : 'text-gray-400 hover:text-gray-200 hover:bg-slate-800/50'
            }`}
        >
          <span className="text-2xl">{icon}</span>
          <span className="text-[10px] font-medium">{label}</span>
        </button>
      ))}
    </div>
  );
}
