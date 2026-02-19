"use client";

import { useEffect, useState } from "react";

type FlyingLetterProps = {
  startX: number;
  startY: number;
  onComplete?: () => void;
};

export function FlyingLetter({ startX, startY, onComplete }: FlyingLetterProps) {
  const [position, setPosition] = useState({ x: startX, y: startY });
  const [opacity, setOpacity] = useState(1);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    // Target is center of screen (where tweet is)
    const targetX = window.innerWidth / 2;
    const targetY = window.innerHeight / 2;

    // Animate to target
    const startTime = Date.now();
    const duration = 400; // ms

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (ease-out cubic)
      const eased = 1 - Math.pow(1 - progress, 3);

      // Interpolate position
      const x = startX + (targetX - startX) * eased;
      const y = startY + (targetY - startY) * eased;

      // Scale up slightly then down at impact
      const scaleValue = progress < 0.7
        ? 1 + progress * 0.3
        : 1.3 - (progress - 0.7) * 1;

      // Rotation for flight effect
      const rot = progress * 360;

      setPosition({ x, y });
      setScale(Math.max(0.5, scaleValue));
      setRotation(rot);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Fade out after reaching target
        setOpacity(0);
        setTimeout(() => {
          onComplete?.();
        }, 200);
      }
    };

    requestAnimationFrame(animate);
  }, [startX, startY, onComplete]);

  return (
    <div
      className="fixed pointer-events-none z-[100] transition-opacity duration-200"
      style={{
        left: position.x,
        top: position.y,
        transform: `translate(-50%, -50%) scale(${scale}) rotate(${rotation}deg)`,
        opacity,
      }}
    >
      <img
        src="/letter.webp"
        alt="Letter"
        className="w-24 h-24 object-contain drop-shadow-lg"
      />
    </div>
  );
}
