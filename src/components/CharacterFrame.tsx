type CharacterFrameProps = {
  src: string;
  width: number;
  height: number;
  flipped?: boolean;
  scale?: number;
  alt: string;
};

export default function CharacterFrame({
  src,
  width,
  height,
  flipped = false,
  scale = 1,
  alt,
}: CharacterFrameProps) {
  return (
    <div
      style={{
        width,
        height,
        position: 'relative',
      }}
    >
      <img
        src={src}
        alt={alt}
        draggable={false}
        style={{
          position: 'absolute',
          bottom: 0,
          left: '50%',
          width: '100%',
          height: '100%',
          objectFit: 'fill',
          imageRendering: 'pixelated',
          transform: `translateX(-50%) scale(${flipped ? -scale : scale}, ${scale})`,
          transformOrigin: 'bottom center',
        }}
      />
    </div>
  );
}