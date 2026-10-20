# DOSSIÊ TÉCNICO — Idle RPG (idle-rpg)

> Gerado por análise direta da codebase em `/workspace` (branch atual, commit `e96a728`).
> Data: 2026-10-20. Tudo abaixo é fato verificado no código, não especulação.

---

## TL;DR (leia isto primeiro)

O projeto é um **idle RPG web single-page em React 18 + Vite + Tailwind v4**, com TODO o estado do jogo em `useState` dentro de um único componente monolítico (`src/App.tsx`, ~2.5k linhas). **NÃO existe** zustand/redux/context, **NÃO existe** canvas (render 100% DOM/CSS), **NÃO existe** sistema de classes (só um herói genérico "Guerreiro" implícito), **NÃO existe** separação de build Android/Steam, e **NÃO existe** wave-100-reset/prestige. Vários deps instalados no `package.json` (supabase, dnd-kit, framer-motion, recharts, react-router, canvas-confetti) **não são usados em nenhum arquivo de `src/`**. Trate o plano de produto (3 classes, $4.99 Steam, etc.) como intenção futura — nada disso está implementado ainda.

---

## 1. Stack

| Item | Estado real |
|---|---|
| React | `^18.2.0` (+ `react-dom ^18.2.0`) |
| TypeScript | `^5.7.0`, `strict: true`, `noEmit: true` (script `typecheck` existe; `tsc` não instalado localmente no ambiente atual) |
| Bundler | **Vite `^6.3.5`** + `@vitejs/plugin-react ^4.3.4`. Config em `vite.config.js` (dev server porta 3000, host 0.0.0.0, HMR na 3000) |
| CSS | **Tailwind v4** via plugin `@tailwindcss/vite ^4.1.7` (`@import "tailwindcss"` em `src/index.css`; keyframes/animações customizadas em CSS puro) |
| Fonte | Google Fonts **"Press Start 2P"** (estética pixel) |
| Estado global | **INEXISTENTE.** Não há zustand, redux, MobX nem React Context. Todo o estado vive em ~60 `useState`/`useRef` dentro de `App()` e é repassado via props para `GameViewport`, `PlayerStatus`, `BottomPanel`, `Drawer`, modais |
| Motor de animação | **DOM + CSS, sem `<canvas>`.** Sprites do herói = troca de `src` de `<img>` via `setInterval` (walk 120ms/frame, attack 65ms/frame). Parallax = `<div>`/`<svg>` reposicionados com `transform: translateX()` a cada tick do game loop. Inimigos = blocos `<div>` coloridos com gradientes Tailwind (não são sprites!). Feedback = hit-flash overlays + keyframes CSS (`animate-walk`, `animate-attack`, `animate-hit`, `animate-damage-float`, etc.) |
| Game loop | `setInterval` de **30ms (~33 FPS)** dentro de `useEffect` em `App.tsx` (linha ~2099), lendo refs (`enemyXRef`, `gamePhaseRef`, etc.) e dando `setState` a cada tick |
| Persistência | `localStorage` chave `idle_rpg_save_v1` (auto-save a cada 5s + `beforeunload`), version `1.0.0` |
| Router | Nenhum em runtime (react-router-dom instalado mas não importado em `src/`) |
| Monetização | Simulada: loja de diamantes com "compra" fake (`diamond_pack` é grátis no código, preços PT-BR hardcoded R$4,90/R$19,90/R$39,90). Sem SDK de ads, sem IAP, sem backend |
| Deps órfãs (instaladas, zero uso em `src/`) | `@supabase/supabase-js`, `@dnd-kit/*`, `framer-motion`, `recharts`, `canvas-confetti`, `react-router-dom`, `date-fns`, `uuid` |

Comandos: `npm run dev` (vite), `npm run build` (vite build → `dist/`), `npm run typecheck`.

---

## 2. Estrutura de Pastas

```
/workspace
├── index.html                  # título "Idle Quest RPG", lang="zh-CN", Font Awesome CDN
├── vite.config.js              # react + tailwind plugins, porta 3000
├── tsconfig.json               # ES2020, strict, bundler resolution
├── public/
│   └── sprites/
│       ├── boy.png             # 1211×880 RGBA — NÃO referenciado em src/ (provável sheet bruto original)
│       └── player1/            # 49 PNGs recortados: conteudo_1.png … conteudo_49.png
│                               # tamanhos irregulares: w 72–141px, h 84–165px (RGBA)
└── src/
    ├── main.tsx                # bootstrap ReactDOM.createRoot
    ├── index.css               # Tailwind + variáveis + ~15 @keyframes pixel-art
    ├── App.tsx                 # ⚠️ MONÓLITO (2519 linhas): todo estado, game loop,
    │                           #    wave system, skills, itens, biomas, quests, shop, save
    ├── components/
    │   ├── GameViewport.tsx    # cena: parallax SVG, herói <img>, inimigo <div>, popups, skill bar
    │   ├── PlayerStatus.tsx    # HUD topo (nível, ouro, diamantes, boost)
    │   ├── BottomPanel.tsx     # barras HP/XP + skill buttons
    │   ├── Drawer.tsx          # drawer mobile (atributos/skills/inventory/quests)
    │   ├── ToastContainer.tsx  # toasts de levelup/drop/boss/info
    │   ├── tabs/               # AttributesTab, SkillsTab, InventoryTab, QuestsTab
    │   └── modals/             # CharacterCreation, Settings, MerchantShop,
    │                           # DiamondShop, PathChoice, NPCDialogue
    ├── data/
    │   └── questsData.ts       # catálogo estático de quests (kill_monsters/reach_wave/collect_gold/defeat_boss)
    └── utils/
        ├── gameSave.ts         # save/load/clear localStorage (interface GameSaveData)
        └── formatNumber.ts     # abreviação de números (K/M/B)
```

**Não existem** pastas `hooks/`, `store/`, `game/`, `engine/`, `types/` nem pasta de sprites de inimigos/classes. Lógica de jogo, UI e dados estão todos dentro de `App.tsx` — primeira coisa a refactorizar.

---

## 3. Game Loop (wave, dano, crítico, spawn, reset)

### Loop mestre — `App.tsx` ~linhas 2099–2279
```ts
useEffect(() => {
  if (!isGameStarted || isPaused) return;
  const interval = setInterval(() => { /* tick */ }, 30); // ~33 FPS
  return () => clearInterval(interval);
}, [/* 15 deps, incluindo effectiveAttributes, activeBuffs, skills... */]);
```
Máquina de estados por fase (`gamePhase`): `'approaching' | 'fighting' | 'respawning'`.

- **approaching:** inimigo anda da direita p/ esquerda: `enemyX -= enemySpeed * gameSpeedMultiplier` (speed=2 px/tick ≈ 66 px/s). Quando `distance <= attackRange (45px)` → fase `fighting`.
- **fighting:**
  - Limpa buffs expirados; auto-cast de skills elegíveis por cooldown.
  - **Ataque do herói:** a cada `heroAttackSpeed / gameSpeedMultiplier` ms, onde `heroAttackSpeed = max(300, 1500 - speed*50)`. Dano:
    ```ts
    const isCrit = Math.random() * 100 < combatAttrs.critChance;      // %
    const baseDamage = combatAttrs.attack * attackMultiplier(buffs);
    const damage = Math.round(isCrit ? baseDamage * 2 : baseDamage);  // CRIT = x2 FLAT
    ```
  - **Ataque do inimigo:** fixo a cada `enemyAttackSpeed = 2000ms`. Dano mitiga por defesa percentual: `dmg = atk * (1 - def/(def+100))`, mínimo 1.
  - **Regen:** +regen HP a cada 1s.
  - Cada tick também chama `updateQuestProgress()` e `checkAndSpawnNPC()` (chance de 20% por tick quando elegível — ⚠️ isso dispara NPCs com frequência muito acima do pretendido, pois roda ~33x/s).
- **respawning (morte do herói):** `handleHeroDeath()` → se morreu para boss, `wave -= 1`; após `setTimeout(2000)` revive com HP cheio e inimigo volta ao spawn. (Item premium `revive` existe no catálogo mas não está plugado na morte automaticamente — há função `useRevive` separada.)

### Wave & spawn
- `wave` começa em 1; `spawnNewEnemy()` incrementa wave + biomeKills + totalKills a cada kill.
- **Boss a cada 10 kills do bioma:** `nextIsBoss = newBiomeKills % 10 === 0` (boss = 5x HP, 3x recompensa).
- Stats do inimigo (recalculadas por render, não por tick):
  ```ts
  enemyMaxHp = floor((30 + (wave-1)*15) * biomeHp * bossMult(5|1) * (1+(lvl-1)*0.15) * pathHp)
  enemyAttack = floor(3 * (1 + ln(wave)*0.5) * biomeAtk * heroLevelScale * pathAtk)
  gold = floor(10 * (1 + sqrt(wave-1)*0.3) * biomeGold * (boss?3:1) * ...)
  xp   = floor(15 * (1 + sqrt(wave-1)*0.3) * ...)
  ```
- ⚠️ **Bug de consistência:** no handler de kill do loop principal, a recompensa usa fórmula linear antiga `(currentWave - 1) * 5 / * 8` (linhas ~2161–2162 e na skill de dano ~1591–1592), enquanto as variáveis derivadas `enemyGoldReward/enemyXpReward` (sqrt) são calculadas mas **desaproveitadas**. Dois caminhos de recompensa divergentes.
- Spawn position: `enemySpawnX = 900` (off-screen right). Hero fixo em `heroX = 150`.

### Crítico de 1420 do print
Explicado pela matemática atual: `damage = round(attack_total × buffMultiplier × 2)`. Ex.: attack efetivo ~710 com Fúria (×2) = 1420 base → crit ×2 = 2840, ou sem buff: attack ~710 → crit 1420. Ou seja, **crit é flat x2, sem dano bônus de items de crit além de `critChance`**. Com scaling linear de HP inimigo (+15/wave) vs DPS do herói, waves altas viram trivialmente rápidas uma vez que o attack upgradeado cresce mais rápido — balanceamento ainda não fechado.

### Reset
- **Reset manual:** `resetGame()` (Settings modal) → remove `idle_rpg_save_v1` + `window.location.reload()`. Flag `isResetting` evita auto-save durante reset.
- **Reset de wave 100 / prestige:** **NÃO EXISTE.** Nada referencia wave 100, loop, ascensão ou soft-reset (ver §8).

---

## 4. Sprites

- **Arquivo:** `public/sprites/player1/conteudo_1.png … conteudo_49.png` (49 frames recortados individualmente — **não é spritesheet**, é one-img-per-frame). Tamanhos **irregulares**: largura 72–141px, altura 84–165px, RGBA. Não há grade fixa de frame.
- **Uso real em `GameViewport.tsx` (linhas 220–224) — apenas 25 dos 49 frames são usados:**
  ```ts
  const heroSprite = isMoving
    ? `/sprites/player1/conteudo_${31 + walkFrame}.png`    // WALK: frames 31–40 (10 frames, ciclo %10, tick 120ms ≈ 8.3 FPS)
    : isAttacking && attackFrame >= 0
      ? `/sprites/player1/conteudo_${11 + attackFrame}.png` // ATTACK: frames 11–20 (10 frames, tick 65ms ≈ 15.4 FPS, termina em frame>=10 → volta p/ idle)
      : '/sprites/player1/conteudo_41.png';                 // IDLE: 1 ÚNICO frame estático (conveção: +bounce CSS `animate-float`)
  ```
- **NÃO existem animações de roll, die/death, hurt ou spin** — frames 1–10, 21–30, 42–49 estão no disco mas são código-morto; não há mapeamento documented de quais poses contêm. `boy.png` (1211×880) também não é usado.
- **Render:** `<img src={heroSprite}>` num container `w-[64px] h-[80px] object-contain object-bottom`, com `style={{ imageRendering: 'pixelated' }}` inline + `.hero-sprite/.enemy-sprite/body { image-rendering: pixelated }` em `index.css`. Troca de frame = troca de URL (browser cache ajuda, mas gera decode por frame; sem sprite atlas).
- **Inimigos:** renderizados como **bonecos de divs com gradientes Tailwind** (body/head/eyes/legs por cor do `sprite.bodyColor` etc.), com `scale()` do container (boss 1.4–1.5x) — não usam PNG.
- Animações complementares em CSS puro: `walk-bounce`, `attack-bounce`, `sword-swing`, `hit-shake`, `hero-hit-shake`, `flash-red`, `damage-float`, `leg-left/right` (~15 keyframes em `index.css`).

---

## 5. Classes (Guerreiro hoje / Arqueiro & Mago futuro)

**Realidade: não existe sistema de classes.** O "Guerreiro" é apenas o herói default implícito:

- `CharacterCreationModal` só pede **nome** (sem escolha de classe).
- Atributos base hardcoded em `App.tsx` linha ~233: `{ attack: 5, defense: 2, maxHp: 100, speed: 5, critChance: 2, regen: 1 }`.
- Skill tree única melee-flavored: `power_strike, quick_heal, fury` (iniciais) + `shield_bash, life_drain, berserker, healing_aura, thunder_strike` (unlock por nível). Deck equipado fixo de 3 slots (`equippedSkillIds`).
- Todos os efeitos de skill são genéricos (`damage|heal|buff`) aplicados no único alvo inimigo — **não há estrutura de alcance/projétil/elemento** que Arqueiro/Mago exigiriam.
- Sprite único `player1` (guerreiro). Não há `player2/player3` em `public/sprites/`.
- Save (`GameSaveData`) **não tem campo `heroClass`** — adicionar classe exige migração de save versionada (hoje a validação só checa `version`/`savedAt` presentes, sem migração real).

**Preparação para Steam (3 classes): praticamente zero.** Para viabilizar, sugere-se como primeiro refactor: extrair `classDefinitions: Record<ClassId, { baseAttrs, skills, spritePath, attackPattern ('melee'|'ranged'|'aoe'), projectile? }>`, adicionar `heroClass` ao save com fallback default `'warrior'` para saves antigos, e mover as skills hardcoded de `useState` inicial para fábrica por classe.

---

## 6. Builds (Android grátis vs Steam pago)

**Realidade: não existe nenhuma separação de build/platform.** É um único `vite build` SPA.

- Sem Capacitor/Cordova/Electron/Tauri/PWA (`manifest`, service worker) — nada no repo.
- Sem env flags, sem `define`/mode no `vite.config.js`, sem feature flags em runtime, sem pastas `platforms/`.
- Sinais de intenção monetária (mas tudo client-side simulado):
  - `DiamondShopModal` + `premiumItems` com `realPrice` em **R$** (R$4,90/19,90/39,90) e tipos `no_ads`, `xp_boost`, `speed_boost`, `revive` — pensado para modelo freemium/mobile, compras são **fake** (adiciona diamante direto, sem gateway).
  - `hasNoAds`/`isSpeedBoosted` persistidos no save, mas **nenhum componente de anúncio existe** para remover.
- Consequência: para o plano Play Store (grátis, só guerreiro) vs Steam ($4.99, 3 classes) você precisa criar do zero: (a) wrapper Android (Capacitor recomendado dado que já é Vite) + AdMob/IAP reais; (b) preset de build Steam (Electron/Tauri ou página web paga) + flag `VITE_TARGET_PLATFORM` ou multi-mode config; (c) gating de conteúdo por plataforma.

---

## 7. Performance

- **Quantos inimigos simultâneos na wave 100? Um.** O jogo é 1-v-1 estrito: sempre existe exatamente 1 `currentEnemy` (`enemyX/enemyHp` escalares). Não há array de inimigos, não há horda. A pergunta "quantos na wave 100" não se aplica — wave 100 = mesmo 1 inimigo com `hp = (30 + 99*15) ≈ 1515 × multiplicadores` (biome cave 1.8 / castle 3.0, boss 5x, heroLevelScale, pathDifficulty).
- **Gargalos reais identificados:**
  1. **Re-render do monólito:** o loop dá `setEnemyX`/`setScrollOffset`/popups a cada 30ms → re-renderiza `App` inteiro (2.5k linhas, ~60 states) e toda a árvore de props novas a ~33 FPS. Sem `React.memo` nos componentes filhos, sem `useTransition`. Este é o principal CPU cost.
  2. **Game loop restart thrash:** o `useEffect` do loop tem 15+ deps (`effectiveAttributes`, `activeBuffs`, `skills`, callbacks…) — cada mudança recria o `setInterval`, resetando o phase timing.
  3. **`checkAndSpawnNPC()` chamado por tick** (~33x/s) com sorteio de 20% — chance composta absurda; eventos disparam muito mais que o design pede (deveria ser por kill/wave, não por tick).
  4. **Troca de `src` de `<img>` por frame** (walk/attack) — sem atlas/spritesheet; funciona mas escala mal ao adicionar classes.
  5. **Auto-save serializando JSON grande a cada 5s** (inventory+skills+quests) dentro do mesmo React tree.
  6. Popups/toasts com `setTimeout` de cleanup por elemento (vazamento baixo, ok).
- **Boas notícias:** DOM pequeno (1 herói, 1 inimigo, 3 layers de parallax SVG por bioma), então em device mid-range deve rodar liso hoje; os gargalos virão com hordas/classes/efeitos. Recomendação: migrar render para `<canvas>` 2D (ou PixiJS) e mover sim p/ outside-React (loop próprio com refs), deixando React só na UI/HUD — isso resolve 1, 2 e 4 de uma vez.

---

## 8. TODO — o que falta pro "Wave 100 Reset System"

Hoje **não há absolutamente nada** de prestige/loop/soft-reset no código. Checklist mínimo:

1. **Trigger:** detectar `wave > 100` (ou `wave === 100` completada) em `spawnNewEnemy()` — hoje a função só faz `setWave(wave + 1)` infinitamente.
2. **UI de confirmação:** novo `PrestigeResetModal` (padrão dos modais existentes) mostrando ganho previsto.
3. **Persistência do reset:** adicionar ao `GameSaveData`: `prestigeCount`, `highestWave`, `prestigeCurrency` (ex.: 💎 almas), `permanentBonuses` — e bump `version` para `1.1.0` com **função de migração** em `loadGameData()` (atualmente invalid saves só são descartados, nunca migrados → jogadores perderiam progresso).
4. **Soft-reset correto:** o `resetGame()` atual faz `location.reload()` hard-reset total; precisará de variante que zera wave/ouro/inventory/attrs mas preserva prestige fields (cuidado com a flag `isResetting` + auto-save de 5s que pode ressuscitar estado antigo — salvar imediatamente após reset antes de liberar o flag).
5. **Loop de dificuldade:** decidir se segunda volta mantém cap em 100 (endless com curva mais íngreme) ou multiplica stats; fórmulas atuais são lineares/log e trivializam late-game (§3).
6. **Fixes que bloqueiam o design:** unificar fórmula de recompensa (bug linear vs sqrt), corrigir HP do inimigo no respawn entre waves (`useEffect([wave,...])` reseta `enemyHp = enemyMaxHp` usando valor do render — race conhecido), mover `checkAndSpawnNPC` de tick para evento de kill.
7. **Testes:** zero testes no repo (nem vit configured). Para um sistema de save/prestige, priorizar unit tests de `gameSave.ts` (save→migrate→load).

### TODO maior (contexto para a IA assistente)
- Extrair engine de `App.tsx` (hooks/pastas `game/`, store com zustand, dados fora do componente).
- Sistema de classes real (§5) + sprites `player2/player3` + normalizar frames em spritesheet com grade fixa.
- Animações faltantes: **roll/dodge, death, hit** (já há 24 frames unused prontos pra isso).
- Camada de plataforma/build (§6) — Capacitor p/ Android, flag de features p/ Steam.
- Backend real (Supabase já é dep órfã pronta p/ cloud save/leaderboard).
- Balanceamento: dano de inimigo vs HP curve, crit x2 flat, economia de ouro/diamantes.

---

## Anexo — fatos rápidos verificados

- Commit HEAD: `e96a728 style: melhora posicionamento de nomes e danos no combate`; branches locais: `coder`, `qwen-code-*`.
- `App.tsx` 2519 linhas · `GameViewport.tsx` 695 · `gameSave.ts` 122 · `questsData.ts` 141.
- Tick loop: 30ms · hero attack: `max(300, 1500−spd*50)`ms · enemy attack: 2000ms · attackRange: 45px · enemySpeed: 2px/tick · spawnX: 900 · heroX: 150 · boss a cada 10 kills/bioma (5x HP) · XP p/ nível: `level*100` · save: 5s + beforeunload.
- Biomas: forest (mult 1.0) → cave (1.8, unlock 50 kills) → castle (3.0, unlock lvl 10).
- Paths (modal bifurcação): safe 1.0x/5 inimigos · challenging 1.3x dmg, 1.5x reward, +20% drop · deadly 1.8x, 2.0x, +50% drop.
