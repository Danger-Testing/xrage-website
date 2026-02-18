"use client";

import { useState, useRef, useCallback } from "react";
import { Weapon, createVolcanoWeapon } from "@/config/weapons";

export type DamageState = {
  burnLevel: number;
  isDestroyed: boolean;
  destroyedByWeapon: Weapon | null;
};

export function useDamage() {
  const [burnLevel, setBurnLevel] = useState(0);
  const [isDestroyed, setIsDestroyed] = useState(false);
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
          setIsDestroyed(true);
        }
        return newLevel;
      });
    }
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
    setDestroyedByWeapon(null);
  }, [stopDamage]);

  const undoDestroy = useCallback(() => {
    setIsDestroyed(false);
    setDestroyedByWeapon(null);
  }, []);

  return {
    burnLevel,
    isDestroyed,
    destroyedByWeapon,
    applyDamage,
    stopDamage,
    destroyByVolcano,
    reset,
    undoDestroy,
  };
}
