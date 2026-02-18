"use client";

import { Weapon } from "@/config/weapons";

type WeaponCursorProps = {
  weapon: Weapon;
  mousePos: { x: number; y: number };
  isActive: boolean;
};

export function WeaponCursor({ weapon, mousePos, isActive }: WeaponCursorProps) {
  if (!weapon.cursor) return null;

  return (
    <img
      src={isActive ? weapon.cursor.active : weapon.cursor.idle}
      alt=""
      className="pointer-events-none fixed h-auto z-50"
      style={{
        width: weapon.cursor.size,
        left: mousePos.x - weapon.cursor.offset.x,
        top: mousePos.y - weapon.cursor.offset.y,
      }}
    />
  );
}
