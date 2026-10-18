import { useState, useEffect, useRef } from 'react';
import PlayerStatus from './components/PlayerStatus';
import GameViewport from './components/GameViewport';
import BottomPanel from './components/BottomPanel';

export default function App() {
  // === Game State ===
  const [heroX, setHeroX] = useState(100);
  const [enemyX, setEnemyX] = useState(600);
  const [isMoving, setIsMoving] = useState(false);

  const attackRange = 80;
  const heroSpeed = 2; // pixels per tick

  // Mock player data
  const playerState = {
    hp: 85,
    maxHp: 100,
    level: 7,
    xp: 340,
    maxXp: 500,
    gold: 1250,
  };

  // === Game Loop ===
  const heroXRef = useRef(heroX);
  const enemyXRef = useRef(enemyX);

  useEffect(() => {
    heroXRef.current = heroX;
  }, [heroX]);

  useEffect(() => {
    enemyXRef.current = enemyX;
  }, [enemyX]);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentHeroX = heroXRef.current;
      const currentEnemyX = enemyXRef.current;
      const distance = currentEnemyX - currentHeroX;

      if (distance > attackRange) {
        // Hero walks toward enemy
        setHeroX((prev) => prev + heroSpeed);
        setIsMoving(true);
      } else {
        // Hero stops - within attack range
        setIsMoving(false);
      }
    }, 30); // ~33 ticks per second

    return () => clearInterval(interval);
  }, [attackRange, heroSpeed]);

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
      <GameViewport heroX={heroX} enemyX={enemyX} isMoving={isMoving} />

      {/* Bottom Panel - Tabs */}
      <BottomPanel />
    </div>
  );
}
