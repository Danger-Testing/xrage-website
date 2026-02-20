"use client";

import Image from "next/image";

type CrackEffectProps = {
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  crackType: 1 | 2 | 3;
  rotation: number;
};

export function CrackEffect({ x, y, crackType, rotation }: CrackEffectProps) {
  return (
    <div
      className="absolute pointer-events-none z-10"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
      }}
    >
      <Image
        src={`/crack${crackType}.png`}
        alt="Crack"
        width={200}
        height={200}
        className="w-[200px] h-[200px] object-contain"
      />
    </div>
  );
}
