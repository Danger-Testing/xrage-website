export type Location = {
  id: string;
  name: string;
  icon: string;
  bgClass: string;
  bgImage?: string;
};

export const LOCATIONS: Location[] = [
  { id: "void", name: "The Void", icon: "🌑", bgClass: "bg-black" },
  { id: "hell", name: "Hell", icon: "🔥", bgClass: "bg-cover bg-center", bgImage: "/vulkan.png" },
  { id: "space", name: "Space", icon: "🌌", bgClass: "bg-gradient-to-b from-indigo-950 via-purple-900 to-black" },
  { id: "chaos", name: "Chaos", icon: "💀", bgClass: "bg-gradient-to-br from-zinc-900 via-red-950 to-zinc-900" },
];
