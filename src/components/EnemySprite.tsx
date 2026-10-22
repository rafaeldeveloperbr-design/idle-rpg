import { useEffect, useState } from 'react';
import CharacterFrame from './CharacterFrame';

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
  width = 116,
height = 144,
}: EnemySpriteProps) {
  const [frame, setFrame] = useState(1);

  useEffect(() => {
    setFrame(attacking ? 4 : 1);

    if (!moving && !attacking) return;

    const timer = setInterval(() => {
      setFrame(previous =>
        attacking
          ? previous >= 7 ? 4 : previous + 1
          : previous >= 3 ? 1 : previous + 1
      );
    }, attacking ? 120 : 220);

    return () => clearInterval(timer);
  }, [moving, attacking, src]);

  return (
    <CharacterFrame
      src={`${src}/${frame}.png`}
      width={width}
      height={height}
      flipped
      alt="Inimigo"
    />
  );
}