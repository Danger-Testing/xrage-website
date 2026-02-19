"use client";

import { useState, useRef, useCallback } from "react";
import { Weapon, createVolcanoWeapon } from "@/config/weapons";

export type DamageState = {
  burnLevel: number;
  isDestroyed: boolean;
  isExploding: boolean;
  destroyedByWeapon: Weapon | null;
};

export function useDamage() {
  const [burnLevel, setBurnLevel] = useState(0);
  const [isDestroyed, setIsDestroyed] = useState(false);
  const [isExploding, setIsExploding] = useState(false);
  const [destroyedByWeapon, setDestroyedByWeapon] = useState<Weapon | null>(null);
  const burnInterval = useRef<NodeJS.Timeout | null>(null);

  const applyDamage = useCallback((weapon: Weapon) => {
    if (weapon.damage.rate === 0) return;

    if (weapon.damage.type === "hold") {
      burnInterval.current = setInterval(() => {
        setBurnLevel((prev) => {
          const newLevel = Math.min(prev + weapon.damage.rate, 100);
          if (newLevel >= 100 && prev < 100) {
            setDestroyedByWeapon(weapon);
            setIsDestroyed(true);
          }
          return newLevel;
        });
      }, 50);
    } else if (weapon.damage.type === "click") {
      setBurnLevel((prev) => {
        const newLevel = Math.min(prev + weapon.damage.rate, 100);
        if (newLevel >= 100 && prev < 100) {
          setDestroyedByWeapon(weapon);
          // If grenade, trigger explosion first
          if (weapon.id === "grenade") {
            setIsExploding(true);
          } else {
            setIsDestroyed(true);
          }
        }
        return newLevel;
      });
    }
  }, []);

  const completeExplosion = useCallback(() => {
    setIsExploding(false);
    setIsDestroyed(true);
  }, []);

  const stopDamage = useCallback(() => {
    if (burnInterval.current) {
      clearInterval(burnInterval.current);
      burnInterval.current = null;
    }
  }, []);

  const destroyByVolcano = useCallback(() => {
    setDestroyedByWeapon(createVolcanoWeapon());
    setIsDestroyed(true);
  }, []);

  const reset = useCallback(() => {
    stopDamage();
    setBurnLevel(0);
    setIsDestroyed(false);
    setIsExploding(false);
    setDestroyedByWeapon(null);
  }, [stopDamage]);

  const undoDestroy = useCallback(() => {
    setIsDestroyed(false);
    setIsExploding(false);
    setDestroyedByWeapon(null);
  }, []);

  return {
    burnLevel,
    isDestroyed,
    isExploding,
    destroyedByWeapon,
    applyDamage,
    stopDamage,
    destroyByVolcano,
    completeExplosion,
    reset,
    undoDestroy,
  };
}
