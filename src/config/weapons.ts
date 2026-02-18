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
  {
    id: "flamethrower",
    name: "Flamethrower",
    icon: "🔥",
    cursor: { idle: "/1.png", active: "/2.png", size: 400, offset: { x: 200, y: 200 } },
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
  {
    id: "hammer",
    name: "Ban Hammer",
    icon: "🔨",
    cursor: { idle: "/hammer1.png", active: "/hammer2.png", size: 300, offset: { x: 150, y: 50 } },
    damage: { rate: 8, type: "click" },
    sound: { active: "/hammer.mp3" },
    effect: {
      filter: (level) => `grayscale(${level}%)`,
      overlayColor: (level) => {
        const cracks = Math.floor(level / 20);
        return cracks > 0 ? `rgba(50, 50, 50, ${level / 200})` : "transparent";
      },
      activeTransform: "scale(0.95) rotate(-2deg)",
      activeClass: "animate-smash",
    },
    destroy: { emoji: "🔨", message: "BANNED!", bgClass: "bg-red-900" },
  },
  {
    id: "laser",
    name: "Laser Beam",
    icon: "⚡",
    cursor: { idle: "/laser1.png", active: "/laser2.png", size: 350, offset: { x: 175, y: 175 } },
    damage: { rate: 3, type: "hold" },
    sound: { active: "/laser.mp3" },
    effect: {
      filter: (level) => `brightness(${1 + level * 0.01}) saturate(${1 + level * 0.02}) hue-rotate(${level * 2}deg)`,
      overlayColor: (level) => `rgba(0, 255, 255, ${level / 300})`,
      activeTransform: "scale(1.02)",
      activeClass: "animate-glow",
    },
    destroy: { emoji: "⚡", message: "Vaporized!", bgClass: "bg-gradient-to-t from-cyan-900 to-transparent" },
  },
  {
    id: "nuke",
    name: "Nuke",
    icon: "☢️",
    cursor: { idle: "/nuke1.png", active: "/nuke2.png", size: 400, offset: { x: 200, y: 200 } },
    damage: { rate: 15, type: "hold" },
    sound: { active: "/nuke.mp3" },
    effect: {
      filter: (level) => `brightness(${1 + level * 0.03}) contrast(${1 + level * 0.01}) saturate(0)`,
      overlayColor: (level) => `rgba(255, 255, 255, ${level / 150})`,
      activeTransform: "scale(1.05)",
      activeClass: "animate-nuke",
    },
    destroy: { emoji: "☢️", message: "OBLITERATED!", bgClass: "bg-white" },
  },
  {
    id: "freeze",
    name: "Freeze Ray",
    icon: "❄️",
    cursor: { idle: "/freeze1.png", active: "/freeze2.png", size: 350, offset: { x: 175, y: 175 } },
    damage: { rate: 1, type: "hold" },
    sound: { active: "/freeze.mp3" },
    effect: {
      filter: (level) => `saturate(${1 - level * 0.008}) brightness(${1 + level * 0.003}) hue-rotate(${180 + level}deg)`,
      overlayColor: (level) => `rgba(150, 200, 255, ${level / 200})`,
      activeTransform: "scale(0.99)",
      activeClass: "animate-freeze",
    },
    destroy: { emoji: "❄️", message: "Frozen solid!", bgClass: "bg-gradient-to-t from-blue-900 to-transparent" },
  },
  {
    id: "boxing",
    name: "Boxing Glove",
    icon: "🥊",
    cursor: { idle: "/boxing.png", active: "/boxing.png", size: 200, offset: { x: 100, y: 100 } },
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
