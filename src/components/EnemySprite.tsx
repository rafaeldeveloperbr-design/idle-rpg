import { useEffect, useState } from 'react';

type EnemySpriteProps = {
  src: string;
  moving: boolean;
  attacking: boolean;
  width?: number;
  height?: number;
};

export default function EnemySprite({
  src,
  moving,
  attacking,
  width = 64,
  height = 80,
}: EnemySpriteProps) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    if (!moving && !attacking) {
      setFrame(0);
      return;
    }

    const timer = setInterval(() => {
      setFrame(previous => (previous + 1) % (attacking ? 4 : 2));
    }, attacking ? 120 : 220);

    return () => clearInterval(timer);
  }, [moving, attacking]);

  return (
    <div
      role="img"
      aria-label="Inimigo"
      style={{
        width,
        height,
        backgroundImage: `url('${src}')`,
        backgroundRepeat: 'no-repeat',
        backgroundSize: '400% 200%',
        backgroundPosition: `${frame * 100 / 3}% ${attacking ? 100 : 0}%`,
        imageRendering: 'pixelated',
        transform: 'scaleX(-1)',
      }}
    />
  );
}