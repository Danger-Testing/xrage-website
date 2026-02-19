"use client";

import { useEffect, useState } from "react";

type Fragment = {
  id: number;
  x: number;
  y: number;
  rotation: number;
  scale: number;
  delay: number;
};

type ExplosionEffectProps = {
  onComplete: () => void;
};

export function ExplosionEffect({ onComplete }: ExplosionEffectProps) {
  const [fragments] = useState<Fragment[]>(() => {
    // Create 12 fragments in a grid pattern
    const frags: Fragment[] = [];
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const distance = 300 + Math.random() * 200;
      frags.push({
        id: i,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance - 100,
        rotation: (Math.random() - 0.5) * 720,
        scale: 0.3 + Math.random() * 0.4,
        delay: Math.random() * 50,
      });
    }
    return frags;
  });

  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    // Start animation
    requestAnimationFrame(() => setIsAnimating(true));

    // Complete after animation
    const timer = setTimeout(onComplete, 800);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="relative w-[400px] h-[300px]">
      {fragments.map((frag) => (
        <div
          key={frag.id}
          className="absolute bg-white rounded shadow-lg overflow-hidden transition-all duration-700 ease-out"
          style={{
            width: "120px",
            height: "80px",
            left: `${(frag.id % 4) * 100}px`,
            top: `${Math.floor(frag.id / 4) * 100}px`,
            transform: isAnimating
              ? `translate(${frag.x}px, ${frag.y}px) rotate(${frag.rotation}deg) scale(${frag.scale})`
              : "translate(0, 0) rotate(0deg) scale(1)",
            opacity: isAnimating ? 0 : 1,
            transitionDelay: `${frag.delay}ms`,
          }}
        >
          {/* Fragment content - colored pieces */}
          <div
            className="w-full h-full"
            style={{
              background: `linear-gradient(${frag.rotation}deg, #1da1f2, #ffffff, #e1e8ed)`,
            }}
          />
        </div>
      ))}

      {/* Explosion flash */}
      <div
        className={`absolute inset-0 bg-orange-500 rounded-lg transition-opacity duration-200 ${
          isAnimating ? "opacity-0" : "opacity-80"
        }`}
      />

      {/* Explosion particles */}
      {isAnimating && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-6xl animate-ping">💥</div>
        </div>
      )}
    </div>
  );
}
