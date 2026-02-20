export type WeaponCursor = {
  idle: string;
  active: string;
  size: number;
  offset: { x: number; y: number };
} | null;

export type WeaponEffect = {
  filter: (level: number) => string;
  overlayColor: (level: number) => string;
  activeTransform?: string;
  activeClass?: string;
};

export type WeaponDestroy = {
  emoji: string;
  message: string;
  bgClass?: string;
  image?: string;
};

export type Weapon = {
  id: string;
  name: string;
  icon: string;
  cursor: WeaponCursor;
  damage: {
    rate: number;
    type: "hold" | "click";
  };
  sound?: {
    active?: string;
    destroy?: string;
  };
  effect: WeaponEffect;
  destroy: WeaponDestroy;
};

export const WEAPONS: Weapon[] = [
  // 0: Cursor (default)
  {
    id: "cursor",
    name: "Cursor",
    icon: "🖱️",
    cursor: null,
    damage: { rate: 0, type: "hold" },
    effect: {
      filter: () => "",
      overlayColor: () => "transparent",
    },
    destroy: { emoji: "🖱️", message: "Nothing happened" },
  },
  // 1: Tomato
  {
    id: "tomato",
    name: "Tomato",
    icon: "🍅",
    cursor: { idle: "/tomato.png", active: "/tomato.png", size: 150, offset: { x: 75, y: 75 } },
    damage: { rate: 0, type: "click" },
    sound: { active: "/splat.mp3" },
    effect: {
      filter: () => "",
      overlayColor: () => "transparent",
    },
    destroy: { emoji: "🍅", message: "Splattered!", bgClass: "bg-gradient-to-t from-red-900 to-transparent" },
  },
  // 2: Creative Act - flying book effect
  {
    id: "grenade",
    name: "Creative Act",
    icon: "📕",
    cursor: { idle: "/act.png", active: "/act.png", size: 200, offset: { x: 100, y: 100 } },
    damage: { rate: 0, type: "click" },
    effect: {
      filter: () => "",
      overlayColor: () => "transparent",
    },
    destroy: { emoji: "📕", message: "Creative Act!", bgClass: "bg-gradient-to-t from-red-900 to-transparent" },
  },
  // 3: Sledgehammer
  {
    id: "hammer",
    name: "Sledgehammer",
    icon: "🔨",
    cursor: { idle: "/hammer.png", active: "/hammer.png", size: 350, offset: { x: 175, y: 175 } },
    damage: { rate: 0, type: "click" },
    sound: { active: "/pow.mp3" },
    effect: {
      filter: () => "",
      overlayColor: () => "transparent",
      activeTransform: "scale(0.9) translateX(-10px)",
      activeClass: "animate-smash",
    },
    destroy: { emoji: "🔨", message: "Smashed!", bgClass: "bg-gradient-to-t from-gray-900 via-slate-800 to-transparent" },
  },
  // 4: Spray Can
  {
    id: "spray",
    name: "Spray Can",
    icon: "🎨",
    cursor: { idle: "/spraypaint.png", active: "/spraypaint.png", size: 200, offset: { x: 100, y: 100 } },
    damage: { rate: 1.5, type: "hold" },
    sound: { active: "/spray.mp3" },
    effect: {
      filter: () => "",
      overlayColor: () => "transparent",
    },
    destroy: { emoji: "🎨", message: "Tagged!", bgClass: "bg-gradient-to-t from-red-900 to-transparent" },
  },
  // 5: Flamethrower
  {
    id: "flamethrower",
    name: "Flamethrower",
    icon: "🔥",
    cursor: { idle: "/1.png", active: "/2.png", size: 600, offset: { x: 300, y: 300 } },
    damage: { rate: 2, type: "hold" },
    sound: { active: "/flame.mp3" },
    effect: {
      filter: (level) => `brightness(${1 - level * 0.006}) contrast(${1 + level * 0.004})`,
      overlayColor: (level) => `rgba(0, 0, 0, ${Math.min(level / 100, 0.8)})`,
      activeTransform: "scale(1.01)",
      activeClass: "animate-shake",
    },
    destroy: { emoji: "", message: "", image: "/ashes.png", bgClass: "bg-transparent" },
  },
];

export function createVolcanoWeapon(): Weapon {
  return {
    id: "volcano",
    name: "Volcano",
    icon: "🌋",
    cursor: null,
    damage: { rate: 0, type: "hold" },
    effect: { filter: () => "", overlayColor: () => "transparent" },
    destroy: {
      emoji: "🌋",
      message: "Thrown into the volcano!",
      bgClass: "bg-gradient-to-t from-orange-900 via-red-800 to-transparent",
    },
  };
}
