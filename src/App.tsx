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

export interface DamagePopup {
  id: number;
  value: number;
  x: number;
  y: number;
  isCrit: boolean;
  isHeal?: boolean;
  timestamp: number;
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
  const heroAttackSpeed = Math.max(300, 1500 - heroAttributes.speed * 50);

  // === Wave System ===
  const [wave, setWave] = useState(1);
  const baseEnemyHp = 50;
  const baseEnemyGold = 15;
  const baseEnemyXp = 20;
  const baseEnemyAttack = 5;
  
  // Scaled enemy stats per wave
  const enemyMaxHp = baseEnemyHp + (wave - 1) * 15;
  const enemyGoldReward = baseEnemyGold + (wave - 1) * 5;
  const enemyXpReward = baseEnemyXp + (wave - 1) * 8;
  const enemyAttackPower = baseEnemyAttack + Math.floor((wave - 1) * 2);

  // === Enemy State (moves toward hero) ===
  const [enemyX, setEnemyX] = useState(700);
  const [enemyHp, setEnemyHp] = useState(enemyMaxHp);
  const enemyAttackSpeed = 2000;

  // Reset enemy HP when wave changes
  useEffect(() => {
    setEnemyHp(enemyMaxHp);
  }, [wave]); // eslint-disable-line react-hooks/exhaustive-deps

  // === Game Phase ===
  const [gamePhase, setGamePhase] = useState<GamePhase>('approaching');
  const [scrollOffset, setScrollOffset] = useState(0);

  // === Damage Popups ===
  const [damagePopups, setDamagePopups] = useState<DamagePopup[]>([]);
  const popupIdRef = useRef(0);

  // === Hit Flash State ===
  const [heroHitFlash, setHeroHitFlash] = useState(false);
  const [enemyHitFlash, setEnemyHitFlash] = useState(false);

  // Constants
  const attackRange = 80;
  const enemySpeed = 2;
  const enemySpawnX = 750;
  const waitDuration = 2000;

  // XP formula: level * 100
  const xpToNextLevel = heroLevel * 100;

  // === Refs for game loop ===
  const enemyXRef = useRef(enemyX);
  const enemyHpRef = useRef(enemyHp);
  const heroHpRef = useRef(heroHp);
  const gamePhaseRef = useRef(gamePhase);
  const heroAttributesRef = useRef(heroAttributes);
  const waveRef = useRef(wave);
  const lastHeroAttackRef = useRef(Date.now());
  const lastEnemyAttackRef = useRef(Date.now());
  const lastRegenRef = useRef(Date.now());

  // Sync refs
  useEffect(() => { enemyXRef.current = enemyX; }, [enemyX]);
  useEffect(() => { enemyHpRef.current = enemyHp; }, [enemyHp]);
  useEffect(() => { heroHpRef.current = heroHp; }, [heroHp]);
  useEffect(() => { gamePhaseRef.current = gamePhase; }, [gamePhase]);
  useEffect(() => { heroAttributesRef.current = heroAttributes; }, [heroAttributes]);
  useEffect(() => { waveRef.current = wave; }, [wave]);

  // === Spawn Damage Popup ===
  const spawnDamagePopup = useCallback((value: number, targetX: number, isCrit: boolean, isHeal = false) => {
    const id = popupIdRef.current++;
    const popup: DamagePopup = {
      id,
      value,
      x: targetX + (Math.random() * 20 - 10), // slight random offset
      y: 0,
      isCrit,
      isHeal,
      timestamp: Date.now(),
    };
    setDamagePopups((prev) => [...prev, popup]);

    // Remove popup after animation completes
    setTimeout(() => {
      setDamagePopups((prev) => prev.filter((p) => p.id !== id));
    }, 900);
  }, []);

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
    setWave((prev) => prev + 1);
    setEnemyHp(enemyMaxHp);
    setEnemyX(enemySpawnX);
    setGamePhase('approaching');
    lastHeroAttackRef.current = Date.now();
    lastEnemyAttackRef.current = Date.now();
  }, [enemyMaxHp, enemySpawnX]);

  // === Attribute Upgrade Functions ===
  const upgradeAttribute = useCallback((attribute: keyof HeroAttributes) => {
    const cost = attributeCosts[attribute];
    if (heroGold < cost) return;

    setHeroGold((prev) => prev - cost);

    setHeroAttributes((prev) => {
      const newAttrs = { ...prev };
      switch (attribute) {
        case 'attack': newAttrs.attack += 5; break;
        case 'defense': newAttrs.defense += 3; break;
        case 'maxHp':
          newAttrs.maxHp += 20;
          setHeroHp((hp) => hp + 20);
          break;
        case 'speed': newAttrs.speed += 2; break;
        case 'critChance': newAttrs.critChance += 1; break;
        case 'regen': newAttrs.regen += 1; break;
      }
      return newAttrs;
    });

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

          const isCrit = Math.random() * 100 < currentAttrs.critChance;
          const damage = isCrit ? currentAttrs.attack * 2 : currentAttrs.attack;

          // Spawn damage popup on enemy
          spawnDamagePopup(damage, currentEnemyX, isCrit);
          
          // Trigger enemy hit flash
          setEnemyHitFlash(true);
          setTimeout(() => setEnemyHitFlash(false), 200);

          setEnemyHp((prev) => {
            const newHp = prev - damage;

            if (newHp <= 0) {
              const currentWave = waveRef.current;
              const goldReward = baseEnemyGold + (currentWave - 1) * 5;
              const xpReward = baseEnemyXp + (currentWave - 1) * 8;
              
              setHeroGold((g) => g + goldReward);
              setHeroXp((x) => x + xpReward);
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
          const currentWave = waveRef.current;
          const currentEnemyAttack = baseEnemyAttack + Math.floor((currentWave - 1) * 2);
          const damage = Math.max(1, currentEnemyAttack - currentAttrs.defense);
          
          // Spawn damage popup on hero
          spawnDamagePopup(damage, heroX, false);
          
          // Trigger hero hit flash
          setHeroHitFlash(true);
          setTimeout(() => setHeroHitFlash(false), 200);
          
          setHeroHp((prev) => Math.max(0, prev - damage));
        }

        // HP Regeneration (every 2 seconds)
        if (now - lastRegenRef.current >= 2000) {
          lastRegenRef.current = now;
          if (currentAttrs.regen > 0 && heroHpRef.current < currentAttrs.maxHp) {
            const healAmount = currentAttrs.regen;
            setHeroHp((prev) => Math.min(currentAttrs.maxHp, prev + healAmount));
            spawnDamagePopup(healAmount, heroX, false, true);
          }
        }
      }
    }, 30);

    return () => clearInterval(interval);
  }, [heroX, attackRange, enemySpeed, heroAttackSpeed, enemyAttackSpeed, waitDuration, spawnNewEnemy, spawnDamagePopup]);

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
        wave={wave}
        damagePopups={damagePopups}
        heroHitFlash={heroHitFlash}
        enemyHitFlash={enemyHitFlash}
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
