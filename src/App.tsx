import { useState, useEffect, useRef } from 'react';
import PlayerStatus from './components/PlayerStatus';
import GameViewport from './components/GameViewport';
import BottomPanel from './components/BottomPanel';

export default function App() {
  // === Hero State ===
  const [heroX, setHeroX] = useState(100);
  const [heroHp, setHeroHp] = useState(85);
  const [heroMaxHp] = useState(100);
  const [heroLevel] = useState(7);
  const [heroXp, setHeroXp] = useState(340);
  const [heroMaxXp] = useState(500);
  const [heroGold, setHeroGold] = useState(1250);
  
  // Combat attributes
  const [heroAttackPower] = useState(10);
  const [heroAttackSpeed] = useState(1000); // ms between attacks
  
  // === Enemy State ===
  const [enemyX, setEnemyX] = useState(600);
  const [enemyHp, setEnemyHp] = useState(50);
  const [enemyMaxHp] = useState(50);
  const [enemyGoldReward] = useState(15);
  const [enemyXpReward] = useState(20);
  const [enemyAttackPower] = useState(5);
  const [enemyAttackSpeed] = useState(2000); // ms between enemy attacks
  
  const [isMoving, setIsMoving] = useState(false);
  const [isAttacking, setIsAttacking] = useState(false);

  const attackRange = 80;
  const heroSpeed = 2;
  const enemySpawnX = 600; // Where enemy respawns

  // === Refs for game loop ===
  const heroXRef = useRef(heroX);
  const enemyXRef = useRef(enemyX);
  const enemyHpRef = useRef(enemyHp);
  const heroHpRef = useRef(heroHp);
  const lastHeroAttackRef = useRef(Date.now());
  const lastEnemyAttackRef = useRef(Date.now());

  // Sync refs
  useEffect(() => { heroXRef.current = heroX; }, [heroX]);
  useEffect(() => { enemyXRef.current = enemyX; }, [enemyX]);
  useEffect(() => { enemyHpRef.current = enemyHp; }, [enemyHp]);
  useEffect(() => { heroHpRef.current = heroHp; }, [heroHp]);

  // === Main Game Loop ===
  useEffect(() => {
    const interval = setInterval(() => {
      const currentHeroX = heroXRef.current;
      const currentEnemyX = enemyXRef.current;
      const distance = currentEnemyX - currentHeroX;
      const now = Date.now();

      // Movement logic
      if (distance > attackRange) {
        setHeroX((prev) => prev + heroSpeed);
        setIsMoving(true);
        setIsAttacking(false);
      } else {
        // Within attack range - stop moving
        setIsMoving(false);
        setIsAttacking(true);

        // Hero attacks enemy
        if (now - lastHeroAttackRef.current >= heroAttackSpeed) {
          lastHeroAttackRef.current = now;
          setEnemyHp((prev) => {
            const newHp = prev - heroAttackPower;
            
            // Check if enemy dies
            if (newHp <= 0) {
              // Award rewards
              setHeroGold((g) => g + enemyGoldReward);
              setHeroXp((x) => x + enemyXpReward);
              
              // Respawn enemy
              setTimeout(() => {
                setEnemyHp(enemyMaxHp);
                setEnemyX(enemySpawnX);
                setHeroX(100); // Reset hero position
              }, 500);
              
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
    }, 30);

    return () => clearInterval(interval);
  }, [attackRange, heroSpeed, heroAttackSpeed, heroAttackPower, enemyAttackSpeed, enemyAttackPower, enemyGoldReward, enemyXpReward, enemyMaxHp, enemySpawnX]);

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
        isMoving={isMoving}
        isAttacking={isAttacking}
      />

      {/* Bottom Panel - Tabs */}
      <BottomPanel />
    </div>
  );
}
