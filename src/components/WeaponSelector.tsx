"use client";

import { Weapon } from "@/config/weapons";

const WEAPON_ICONS = [
  "/cursor.svg",
  "/tomato.png",
  "/glove.png",
  "/green.png",
  "/sword.png",
  "/fire.png",
  "/spraypaint.png",
];

type WeaponSelectorProps = {
  weapons: Weapon[];
  selectedIndex: number;
  onSelect: (index: number) => void;
};

export function WeaponSelector({ weapons, selectedIndex, onSelect }: WeaponSelectorProps) {
  return (
    <div className="fixed -bottom-2 left-1/2 -translate-x-1/2 z-50">
      <div className="flex gap-1 items-end">
        {WEAPON_ICONS.map((icon, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(index);
            }}
            aria-label={`Weapon ${index + 1}`}
            className={`
              relative flex items-center justify-center
              cursor-pointer focus:outline-none
              ${index === 0 ? "w-32 h-32 pb-4" : index === 1 ? "w-[152px] h-[152px]" : "w-40 h-40"}
            `}
          >
            <img src={icon} alt="" className="w-full h-full object-contain" />
          </button>
        ))}
      </div>
    </div>
  );
}
