"use client";

import { Weapon } from "@/config/weapons";

type DamageOverlayProps = {
  weapon: Weapon;
  burnLevel: number;
};

export function DamageOverlay({ weapon, burnLevel }: DamageOverlayProps) {
  return (
    <>
      {/* Weapon effect overlay */}
      <div
        className="absolute inset-0 pointer-events-none transition-colors"
        style={{ backgroundColor: weapon.effect.overlayColor(burnLevel) }}
      />

      {/* Boxing bruise marks */}
      {weapon.id === "boxing" && burnLevel > 0 && (
        <>
          {burnLevel >= 15 && (
            <div
              className="absolute w-12 h-8 rounded-full pointer-events-none"
              style={{
                top: "20%",
                left: "15%",
                background: `radial-gradient(ellipse, rgba(60,20,80,${Math.min(burnLevel / 100, 0.7)}) 0%, rgba(100,50,120,${Math.min(burnLevel / 150, 0.5)}) 50%, transparent 70%)`,
              }}
            />
          )}
          {burnLevel >= 35 && (
            <div
              className="absolute w-10 h-6 rounded-full pointer-events-none"
              style={{
                top: "45%",
                right: "20%",
                background: `radial-gradient(ellipse, rgba(50,30,90,${Math.min(burnLevel / 100, 0.6)}) 0%, rgba(80,40,100,${Math.min(burnLevel / 150, 0.4)}) 50%, transparent 70%)`,
              }}
            />
          )}
          {burnLevel >= 55 && (
            <div
              className="absolute w-14 h-10 rounded-full pointer-events-none"
              style={{
                bottom: "25%",
                left: "25%",
                background: `radial-gradient(ellipse, rgba(40,10,70,${Math.min(burnLevel / 100, 0.8)}) 0%, rgba(70,30,90,${Math.min(burnLevel / 150, 0.5)}) 50%, transparent 70%)`,
              }}
            />
          )}
          {burnLevel >= 75 && (
            <div
              className="absolute w-16 h-12 rounded-full pointer-events-none"
              style={{
                top: "30%",
                right: "10%",
                background: `radial-gradient(ellipse, rgba(30,0,60,${Math.min(burnLevel / 100, 0.9)}) 0%, rgba(60,20,80,${Math.min(burnLevel / 150, 0.6)}) 50%, transparent 70%)`,
              }}
            />
          )}
        </>
      )}
    </>
  );
}
