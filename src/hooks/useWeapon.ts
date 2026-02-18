"use client";

import { useState, useEffect, useCallback } from "react";
import { WEAPONS, Weapon } from "@/config/weapons";

export function useWeapon() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const currentWeapon = WEAPONS[selectedIndex];

  const selectWeapon = useCallback((index: number) => {
    if (index >= 0 && index < WEAPONS.length) {
      setSelectedIndex(index);
    }
  }, []);

  const nextWeapon = useCallback(() => {
    setSelectedIndex((prev) => (prev + 1) % WEAPONS.length);
  }, []);

  const prevWeapon = useCallback(() => {
    setSelectedIndex((prev) => (prev - 1 + WEAPONS.length) % WEAPONS.length);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const num = parseInt(e.key);
      if (num >= 1 && num <= WEAPONS.length) {
        selectWeapon(num - 1);
      }
    };

    const handleScroll = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY > 0) {
        nextWeapon();
      } else {
        prevWeapon();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("wheel", handleScroll, { passive: false });

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("wheel", handleScroll);
    };
  }, [selectWeapon, nextWeapon, prevWeapon]);

  return {
    weapons: WEAPONS,
    currentWeapon,
    selectedIndex,
    selectWeapon,
    nextWeapon,
    prevWeapon,
  };
}
