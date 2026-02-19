"use client";

const WEAPON_ICONS = [
  "/cursor.svg",
  "/tomato.png",
  "/hammer.png",
  "/act.png",
  "/fire.png",
  "/spraypaint.png",
];

type WeaponSelectorProps = {
  selectedIndex: number;
  onSelect: (index: number) => void;
  disabled?: boolean;
};

export function WeaponSelector({ selectedIndex, onSelect, disabled = false }: WeaponSelectorProps) {
  return (
    <div className="fixed -bottom-2 left-1/2 -translate-x-1/2 z-50">
      <div className="flex gap-1 items-end">
        {WEAPON_ICONS.map((icon, index) => (
          <button
            key={index}
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              if (!disabled) onSelect(index);
            }}
            aria-label={`Weapon ${index + 1}`}
            className={`
              relative flex items-center justify-center
              focus:outline-none transition-opacity
              ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
              ${index === 0 ? "w-32 h-32 pb-4" : index === 1 ? "w-[152px] h-[152px]" : index === 3 ? "w-36 h-36 mb-2" : "w-40 h-40"}
            `}
          >
            <img
              src={icon}
              alt=""
              className="w-full h-full object-contain"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
