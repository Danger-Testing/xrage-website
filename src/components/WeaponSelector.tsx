"use client";

const WEAPON_ICONS = [
  "/cursor.svg",
  "/tomato.png",
  "/rick.png",
  "/hammer.png",
  "/spraypaint.png",
  "/fire.png",
];

type WeaponSelectorProps = {
  selectedIndex: number;
  onSelect: (index: number) => void;
  disabled?: boolean;
};

export function WeaponSelector({ selectedIndex, onSelect, disabled = false }: WeaponSelectorProps) {
  const topRow = WEAPON_ICONS.slice(0, 3);
  const bottomRow = WEAPON_ICONS.slice(3);

  const renderButton = (icon: string, index: number) => (
    <button
      key={index}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        if (!disabled) onSelect(index);
      }}
      onMouseDown={(e) => e.stopPropagation()}
      aria-label={`Weapon ${index + 1}`}
      className={`
        relative flex items-center justify-center
        focus:outline-none transition-opacity
        ${disabled ? "cursor-not-allowed" : "cursor-pointer"}
        w-24 h-24 sm:w-32 sm:h-32
        ${index === 0 ? "sm:pb-4" : ""}
        ${index === 1 ? "sm:w-[152px] sm:h-[152px]" : ""}
        ${index === 3 ? "sm:w-36 sm:h-36 sm:mb-2" : ""}
        ${index === 2 || index === 4 || index === 5 ? "sm:w-40 sm:h-40" : ""}
      `}
    >
      <img
        src={icon}
        alt=""
        className="w-full h-full object-contain"
      />
    </button>
  );

  return (
    <div className="fixed bottom-4 sm:-bottom-2 left-0 sm:left-1/2 sm:-translate-x-1/2 w-full sm:w-auto z-50">
      {/* Mobile: Two rows, full width */}
      <div className="flex flex-col items-center gap-3 sm:hidden w-full px-2">
        <div className="flex justify-center gap-4 items-end w-full">
          {topRow.map((icon, i) => renderButton(icon, i))}
        </div>
        <div className="flex justify-center gap-4 items-end w-full">
          {bottomRow.map((icon, i) => renderButton(icon, i + 3))}
        </div>
      </div>
      {/* Desktop: Single row */}
      <div className="hidden sm:flex gap-1 items-end">
        {WEAPON_ICONS.map((icon, index) => renderButton(icon, index))}
      </div>
    </div>
  );
}
