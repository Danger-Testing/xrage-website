"use client";

import { Weapon } from "@/config/weapons";

type WeaponSelectorProps = {
  weapons: Weapon[];
  selectedIndex: number;
  onSelect: (index: number) => void;
};

export function WeaponSelector({ weapons, selectedIndex, onSelect }: WeaponSelectorProps) {
  const currentWeapon = weapons[selectedIndex];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex gap-1 p-1 bg-black/80 rounded-lg border-2 border-gray-700">
        {weapons.map((weapon, index) => (
          <button
            key={weapon.id}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(index);
            }}
            aria-label={`${weapon.name} weapon (press ${index + 1})`}
            className={`
              relative w-14 h-14 flex items-center justify-center text-2xl
              rounded transition-all duration-100 cursor-pointer
              ${selectedIndex === index
                ? "bg-gray-600 border-2 border-white scale-110"
                : "bg-gray-800 border border-gray-600 hover:bg-gray-700"
              }
            `}
          >
            <span className="select-none">{weapon.icon}</span>
            <span className="absolute bottom-0.5 right-1 text-[10px] text-gray-400 font-mono">
              {index + 1}
            </span>
          </button>
        ))}
      </div>
      <p className="text-center text-gray-500 text-xs mt-2 select-none">
        {currentWeapon.name} | Scroll or press 1-{weapons.length} to switch
      </p>
    </div>
  );
}
