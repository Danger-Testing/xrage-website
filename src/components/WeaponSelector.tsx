"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const WEAPON_ICONS = [
  "/cursor.svg",
  "/tomato.png",
  "/glove.png",
  "/green.png",
  "/sword.png",
  "/fire.png",
  "/spraypaint.png",
];

// Extra items that can be selected from the popup
const EXTRA_ITEMS = [
  "/cybertruck.webp",
  "/boxing.png",
  "/ashes.png",
  "/flame4.png",
  "/grenade_canvas.png",
  "/sword_canvas.png",
  "/vulkan.png",
  "/skid.png",
  "/x.png",
];

type WeaponSelectorProps = {
  selectedIndex: number;
  onSelect: (index: number) => void;
  disabled?: boolean;
};

export function WeaponSelector({ selectedIndex, onSelect, disabled = false }: WeaponSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedExtra, setSelectedExtra] = useState<string | null>(null);

  const handleExtraSelect = (icon: string) => {
    setSelectedExtra(icon);
    setIsOpen(false);
    onSelect(7);
  };

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
              ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              ${index === 0 ? "w-32 h-32 pb-4" : index === 1 ? "w-[152px] h-[152px]" : "w-40 h-40"}
            `}
          >
            <img src={icon} alt="" className="w-full h-full object-contain" />
          </button>
        ))}

        {/* Plus button / Extra slot */}
        <Dialog open={isOpen} onOpenChange={(open) => !disabled && setIsOpen(open)}>
          <DialogTrigger asChild>
            <button
              disabled={disabled}
              onClick={(e) => e.stopPropagation()}
              aria-label="More weapons"
              className={`relative flex items-center justify-center w-40 h-40 focus:outline-none transition-opacity ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
            >
              {selectedExtra ? (
                <img src={selectedExtra} alt="" className="w-full h-full object-contain" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-white/20 border-2 border-dashed border-white/50 flex items-center justify-center hover:bg-white/30 transition-colors">
                  <span className="text-white text-4xl font-light">+</span>
                </div>
              )}
            </button>
          </DialogTrigger>
          <DialogContent className="bg-black/95 border-white/20 max-w-2xl" onClick={(e) => e.stopPropagation()}>
            <DialogHeader>
              <DialogTitle className="text-white text-center text-2xl">Select Item</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-3 gap-4 p-4">
              {EXTRA_ITEMS.map((icon, index) => (
                <button
                  key={index}
                  onClick={() => handleExtraSelect(icon)}
                  className="w-full aspect-square flex items-center justify-center bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-xl cursor-pointer transition-all hover:scale-105"
                >
                  <img src={icon} alt="" className="w-20 h-20 object-contain" />
                </button>
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
