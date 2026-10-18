import { useState, useEffect, useRef, useCallback } from 'react';
import PlayerStatus from './components/PlayerStatus';
import GameViewport from './components/GameViewport';
import BottomPanel from './components/BottomPanel';

type GamePhase = 'approaching' | 'fighting' | 'waiting';

export interface HeroAttributes {
  attack: number;
  defense: number;
  maxHp: number;
  speed: number;
  critChance: number;
  regen: number;
}

export interface AttributeCosts {
  attack: number;
  defense: number;
  maxHp: number;
  speed: number;
  critChance: number;
  regen: number;
}

export default function App() {
  // === Hero State (fixed position) ===
  const heroX = 150;
  const [heroHp, setHeroHp] = useState(85);
  const [heroLevel, setHeroLevel] = useState(7);
  const [heroXp, setHeroXp] = useState(340);
  const [heroGold, setHeroGold] = useState(1250);

  // Hero attributes (upgradable)
  const [heroAttributes, setHeroAttributes] = useState<HeroAttributes>({
    attack: 10,
    defense: 5,
    maxHp: 100,
    speed: 8,
    critChance: 5,
    regen: 2,
  });

  // Attribute upgrade costs
  const [attributeCosts, setAttributeCosts] = useState<AttributeCosts>({
    attack: 50,
    defense: 40,
    maxHp: 60,
    speed: 70,
    critChance: 80,
    regen: 90,
  });

  // Combat timing (based on speed attribute)
  const heroAttackSpeed = Math.max(300, 1500 - heroAttributes.speed * 50); // ms between attacks

  // === Enemy State (moves toward hero) ===
  const [enemyX, setEnemyX] = useState(700);
  const [enemyHp, setEnemyHp] = useState(50);
  const [enemyMaxHp] = useState(50);
  const [enemyGoldReward] = useState(15);
  const [enemyXpReward] = useState(20);
  const [enemyAttackPower] = useState(5);
  const enemyAttackSpeed = 2000;

  // === Game Phase ===
  const [gamePhase, setGamePhase] = useState<GamePhase>('approaching');
  const [scrollOffset, setScrollOffset] = useState(0);

  // Constants
  const attackRange = 80;
  const enemySpeed = 2;
  const enemySpawnX = 750;
  const waitDuration = 1500;

  // XP formula: level * 100
  const xpToNextLevel = heroLevel * 100;

  // === Refs for game loop ===
  const enemyXRef = useRef(enemyX);
  const enemyHpRef = useRef(enemyHp);
  const heroHpRef = useRef(heroHp);
  const gamePhaseRef = useRef(gamePhase);
  const heroAttributesRef = useRef(heroAttributes);
  const lastHeroAttackRef = useRef(Date.now());
  const lastEnemyAttackRef = useRef(Date.now());
  const lastRegenRef = useRef(Date.now());

  // Sync refs
  useEffect(() => { enemyXRef.current = enemyX; }, [enemyX]);
  useEffect(() => { enemyHpRef.current = enemyHp; }, [enemyHp]);
  useEffect(() => { heroHpRef.current = heroHp; }, [heroHp]);
  useEffect(() => { gamePhaseRef.current = gamePhase; }, [gamePhase]);
  useEffect(() => { heroAttributesRef.current = heroAttributes; }, [heroAttributes]);

  // === Level Up Logic ===
  useEffect(() => {
    if (heroXp >= xpToNextLevel) {
      setHeroLevel((prev) => prev + 1);
      setHeroXp((prev) => prev - xpToNextLevel);
      setHeroHp(heroAttributes.maxHp); // Full heal on level up
    }
  }, [heroXp, xpToNextLevel, heroAttributes.maxHp]);

  // === Spawn new enemy after delay ===
  const spawnNewEnemy = useCallback(() => {
    setEnemyHp(enemyMaxHp);
    setEnemyX(enemySpawnX);
    setGamePhase('approaching');
    lastHeroAttackRef.current = Date.now();
    lastEnemyAttackRef.current = Date.now();
  }, [enemyMaxHp, enemySpawnX]);

  // === Attribute Upgrade Functions ===
  const upgradeAttribute = useCallback((attribute: keyof HeroAttributes) => {
    const cost = attributeCosts[attribute];
    
    if (heroGold < cost) return; // Not enough gold

    setHeroGold((prev) => prev - cost);
    
    setHeroAttributes((prev) => {
      const newAttrs = { ...prev };
      
      switch (attribute) {
        case 'attack':
          newAttrs.attack += 5;
          break;
        case 'defense':
          newAttrs.defense += 3;
          break;
        case 'maxHp':
          newAttrs.maxHp += 20;
          setHeroHp((hp) => hp + 20); // Also increase current HP
          break;
        case 'speed':
          newAttrs.speed += 2;
          break;
        case 'critChance':
          newAttrs.critChance += 1;
          break;
        case 'regen':
          newAttrs.regen += 1;
          break;
      }
      
      return newAttrs;
    });

    // Increase cost for next upgrade (1.5x)
    setAttributeCosts((prev) => ({
      ...prev,
      [attribute]: Math.floor(prev[attribute] * 1.5),
    }));
  }, [heroGold, attributeCosts]);

  // === Main Game Loop ===
  useEffect(() => {
    const interval = setInterval(() => {
      const currentPhase = gamePhaseRef.current;
      const currentEnemyX = enemyXRef.current;
      const distance = currentEnemyX - heroX;
      const now = Date.now();
      const currentAttrs = heroAttributesRef.current;

      if (currentPhase === 'approaching') {
        if (distance > attackRange) {
          setEnemyX((prev) => prev - enemySpeed);
          setScrollOffset((prev) => prev + enemySpeed * 0.5);
        } else {
          setGamePhase('fighting');
          lastHeroAttackRef.current = now;
          lastEnemyAttackRef.current = now;
          lastRegenRef.current = now;
        }
      } else if (currentPhase === 'fighting') {
        // Hero attacks enemy
        if (now - lastHeroAttackRef.current >= heroAttackSpeed) {
          lastHeroAttackRef.current = now;
          
          // Calculate damage with crit chance
          const isCrit = Math.random() * 100 < currentAttrs.critChance;
          const damage = isCrit ? currentAttrs.attack * 2 : currentAttrs.attack;
          
          setEnemyHp((prev) => {
            const newHp = prev - damage;

            if (newHp <= 0) {
              setHeroGold((g) => g + enemyGoldReward);
              setHeroXp((x) => x + enemyXpReward);
              setGamePhase('waiting');

              setTimeout(() => {
                spawnNewEnemy();
              }, waitDuration);

              return 0;
            }
            return newHp;
          });
        }

        // Enemy attacks hero
        if (enemyHpRef.current > 0 && now - lastEnemyAttackRef.current >= enemyAttackSpeed) {
          lastEnemyAttackRef.current = now;
          const damage = Math.max(1, enemyAttackPower - currentAttrs.defense);
          setHeroHp((prev) => Math.max(0, prev - damage));
        }

        // HP Regeneration (every 2 seconds)
        if (now - lastRegenRef.current >= 2000) {
          lastRegenRef.current = now;
          setHeroHp((prev) => Math.min(currentAttrs.maxHp, prev + currentAttrs.regen));
        }
      }
    }, 30);

    return () => clearInterval(interval);
  }, [heroX, attackRange, enemySpeed, heroAttackSpeed, enemyAttackSpeed, enemyAttackPower, enemyGoldReward, enemyXpReward, waitDuration, spawnNewEnemy]);

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0f0f1a] overflow-hidden">
      <PlayerStatus
        hp={heroHp}
        maxHp={heroAttributes.maxHp}
        level={heroLevel}
        xp={heroXp}
        maxXp={xpToNextLevel}
        gold={heroGold}
      />

      <GameViewport
        heroX={heroX}
        enemyX={enemyX}
        enemyHp={enemyHp}
        enemyMaxHp={enemyMaxHp}
        scrollOffset={scrollOffset}
        gamePhase={gamePhase}
      />

      <BottomPanel
        heroAttributes={heroAttributes}
        attributeCosts={attributeCosts}
        heroGold={heroGold}
        onUpgradeAttribute={upgradeAttribute}
      />
    </div>
  );
}
