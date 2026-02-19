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
  // 1: Boxing Glove
  {
    id: "boxing",
    name: "Boxing Glove",
    icon: "🥊",
    cursor: { idle: "/glove.png", active: "/glove.png", size: 200, offset: { x: 100, y: 100 } },
    damage: { rate: 12, type: "click" },
    sound: { active: "/pow.mp3" },
    effect: {
      filter: () => "",
      overlayColor: () => "transparent",
      activeTransform: "scale(0.9) translateX(-10px)",
      activeClass: "animate-punch",
    },
    destroy: { emoji: "🥊", message: "Knocked out!", bgClass: "bg-gradient-to-t from-purple-900 via-blue-900 to-transparent" },
  },
  // 2: Grenade - instant explode on click
  {
    id: "grenade",
    name: "Grenade",
    icon: "💣",
    cursor: { idle: "/green.png", active: "/green.png", size: 150, offset: { x: 75, y: 75 } },
    damage: { rate: 100, type: "click" },
    sound: { active: "/explosion.mp3" },
    effect: {
      filter: (level) => `brightness(${1 + level * 0.05}) contrast(${1 + level * 0.02})`,
      overlayColor: (level) => `rgba(255, 100, 0, ${level / 100})`,
      activeTransform: "scale(1.1)",
      activeClass: "animate-nuke",
    },
    destroy: { emoji: "💥", message: "KABOOM!", bgClass: "bg-gradient-to-t from-orange-900 via-red-700 to-transparent" },
  },
  // 3: Sword
  {
    id: "sword",
    name: "Sword",
    icon: "⚔️",
    cursor: { idle: "/sword.png", active: "/sword.png", size: 200, offset: { x: 100, y: 100 } },
    damage: { rate: 15, type: "click" },
    sound: { active: "/slash.mp3" },
    effect: {
      filter: (level) => `contrast(${1 + level * 0.005})`,
      overlayColor: (level) => `rgba(200, 0, 0, ${level / 400})`,
      activeTransform: "scale(0.95) rotate(-15deg)",
      activeClass: "animate-smash",
    },
    destroy: { emoji: "⚔️", message: "Sliced!", bgClass: "bg-gradient-to-t from-red-900 to-transparent" },
  },
  // 4: Flamethrower
  {
    id: "flamethrower",
    name: "Flamethrower",
    icon: "🔥",
    cursor: { idle: "/1.png", active: "/2.png", size: 600, offset: { x: 300, y: 300 } },
    damage: { rate: 4, type: "hold" },
    sound: { active: "/flame.mp3" },
    effect: {
      filter: (level) => `brightness(${1 - level * 0.006}) contrast(${1 + level * 0.004})`,
      overlayColor: (level) => `rgba(0, 0, 0, ${Math.min(level / 100, 0.8)})`,
      activeTransform: "scale(1.01)",
      activeClass: "animate-shake",
    },
    destroy: { emoji: "", message: "", image: "/ashes.png", bgClass: "bg-transparent" },
  },
  // 5: Spraypaint
  {
    id: "spraypaint",
    name: "Spray Paint",
    icon: "🎨",
    cursor: { idle: "/spraypaint.png", active: "/spraypaint.png", size: 150, offset: { x: 75, y: 20 } },
    damage: { rate: 2, type: "hold" },
    sound: { active: "/spray.mp3" },
    effect: {
      filter: (level) => `hue-rotate(${level * 5}deg) saturate(${1 + level * 0.02})`,
      overlayColor: (level) => `rgba(255, 0, 255, ${level / 200})`,
      activeTransform: "scale(1.01)",
      activeClass: "animate-shake",
    },
    destroy: { emoji: "🎨", message: "Vandalized!", bgClass: "bg-gradient-to-t from-pink-900 via-purple-800 to-transparent" },
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
