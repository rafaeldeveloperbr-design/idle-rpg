import PlayerStatus from './components/PlayerStatus';
import GameViewport from './components/GameViewport';
import BottomPanel from './components/BottomPanel';

export default function App() {
  // Mock data - will be replaced with real game state later
  const playerState = {
    hp: 85,
    maxHp: 100,
    level: 7,
    xp: 340,
    maxXp: 500,
    gold: 1250,
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0f0f1a] overflow-hidden">
      {/* Top Header - Player Status */}
      <PlayerStatus
        hp={playerState.hp}
        maxHp={playerState.maxHp}
        level={playerState.level}
        xp={playerState.xp}
        maxXp={playerState.maxXp}
        gold={playerState.gold}
      />

      {/* Main Game Viewport */}
      <GameViewport />

      {/* Bottom Panel - Tabs */}
      <BottomPanel />
    </div>
  );
}
