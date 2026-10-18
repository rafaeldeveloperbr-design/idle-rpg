import { useState, useEffect, useRef, useCallback } from 'react';
import PlayerStatus from './components/PlayerStatus';
import GameViewport from './components/GameViewport';
import BottomPanel from './components/BottomPanel';

type GamePhase = 'approaching' | 'fighting' | 'waiting';

export default function App() {
  // === Hero State (fixed position) ===
  const heroX = 150; // Hero stays fixed on screen
  const [heroHp, setHeroHp] = useState(85);
  const [heroMaxHp] = useState(100);
  const [heroLevel] = useState(7);
  const [heroXp, setHeroXp] = useState(340);
  const [heroMaxXp] = useState(500);
  const [heroGold, setHeroGold] = useState(1250);

  // Combat attributes
  const [heroAttackPower] = useState(10);
  const [heroAttackSpeed] = useState(1000); // ms between attacks

  // === Enemy State (moves toward hero) ===
  const [enemyX, setEnemyX] = useState(700);
  const [enemyHp, setEnemyHp] = useState(50);
  const [enemyMaxHp] = useState(50);
  const [enemyGoldReward] = useState(15);
  const [enemyXpReward] = useState(20);
  const [enemyAttackPower] = useState(5);
  const [enemyAttackSpeed] = useState(2000); // ms between enemy attacks

  // === Game Phase ===
  const [gamePhase, setGamePhase] = useState<GamePhase>('approaching');

  // === World scroll offset (background movement) ===
  const [scrollOffset, setScrollOffset] = useState(0);

  // Constants
  const attackRange = 80;
  const enemySpeed = 2; // pixels per tick (enemy moves left)
  const enemySpawnX = 750; // Where new enemy appears (right side)
  const waitDuration = 1500; // ms to wait before spawning next enemy

  // === Refs for game loop ===
  const enemyXRef = useRef(enemyX);
  const enemyHpRef = useRef(enemyHp);
  const heroHpRef = useRef(heroHp);
  const gamePhaseRef = useRef(gamePhase);
  const lastHeroAttackRef = useRef(Date.now());
  const lastEnemyAttackRef = useRef(Date.now());

  // Sync refs
  useEffect(() => { enemyXRef.current = enemyX; }, [enemyX]);
  useEffect(() => { enemyHpRef.current = enemyHp; }, [enemyHp]);
  useEffect(() => { heroHpRef.current = heroHp; }, [heroHp]);
  useEffect(() => { gamePhaseRef.current = gamePhase; }, [gamePhase]);

  // === Spawn new enemy after delay ===
  const spawnNewEnemy = useCallback(() => {
    setEnemyHp(enemyMaxHp);
    setEnemyX(enemySpawnX);
    setGamePhase('approaching');
    lastHeroAttackRef.current = Date.now();
    lastEnemyAttackRef.current = Date.now();
  }, [enemyMaxHp, enemySpawnX]);

  // === Main Game Loop ===
  useEffect(() => {
    const interval = setInterval(() => {
      const currentPhase = gamePhaseRef.current;
      const currentEnemyX = enemyXRef.current;
      const distance = currentEnemyX - heroX;
      const now = Date.now();

      if (currentPhase === 'approaching') {
        // Enemy moves toward hero (from right to left)
        if (distance > attackRange) {
          setEnemyX((prev) => prev - enemySpeed);
          setScrollOffset((prev) => prev + enemySpeed * 0.5); // Parallax scroll
        } else {
          // Enemy reached attack range - start fighting
          setGamePhase('fighting');
          lastHeroAttackRef.current = now;
          lastEnemyAttackRef.current = now;
        }
      } else if (currentPhase === 'fighting') {
        // Hero attacks enemy
        if (now - lastHeroAttackRef.current >= heroAttackSpeed) {
          lastHeroAttackRef.current = now;
          setEnemyHp((prev) => {
            const newHp = prev - heroAttackPower;

            if (newHp <= 0) {
              // Enemy dies - award rewards and enter waiting phase
              setHeroGold((g) => g + enemyGoldReward);
              setHeroXp((x) => x + enemyXpReward);
              setGamePhase('waiting');

              // Spawn new enemy after delay
              setTimeout(() => {
                spawnNewEnemy();
              }, waitDuration);

              return 0;
            }
            return newHp;
          });
        }

        // Enemy attacks hero (if alive)
        if (enemyHpRef.current > 0 && now - lastEnemyAttackRef.current >= enemyAttackSpeed) {
          lastEnemyAttackRef.current = now;
          setHeroHp((prev) => Math.max(0, prev - enemyAttackPower));
        }
      }
      // 'waiting' phase: nothing happens, hero is idle
    }, 30);

    return () => clearInterval(interval);
  }, [heroX, attackRange, enemySpeed, heroAttackSpeed, heroAttackPower, enemyAttackSpeed, enemyAttackPower, enemyGoldReward, enemyXpReward, waitDuration, spawnNewEnemy]);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0f0f1a] overflow-hidden">
      {/* Top Header - Player Status */}
      <PlayerStatus
        hp={heroHp}
        maxHp={heroMaxHp}
        level={heroLevel}
        xp={heroXp}
        maxXp={heroMaxXp}
        gold={heroGold}
      />

      {/* Main Game Viewport */}
      <GameViewport
        heroX={heroX}
        enemyX={enemyX}
        enemyHp={enemyHp}
        enemyMaxHp={enemyMaxHp}
        scrollOffset={scrollOffset}
        gamePhase={gamePhase}
      />

      {/* Bottom Panel - Tabs */}
      <BottomPanel />
    </div>
  );
}
