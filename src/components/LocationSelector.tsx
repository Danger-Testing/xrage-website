"use client";

import { Location } from "@/config/locations";

type LocationSelectorProps = {
  locations: Location[];
  selectedIndex: number;
  onSelect: (index: number) => void;
};

export function LocationSelector({ locations, selectedIndex, onSelect }: LocationSelectorProps) {
  return (
    <div className="flex gap-2">
      {locations.map((location, index) => (
        <button
          key={location.id}
          onClick={(e) => {
            e.stopPropagation();
            onSelect(index);
          }}
          aria-label={`${location.name} location`}
          className={`
            w-10 h-10 flex items-center justify-center text-lg rounded-lg
            transition-all duration-200 cursor-pointer
            focus:outline-none focus:ring-2 focus:ring-white/60
            ${selectedIndex === index
              ? "bg-white/30 border-2 border-white scale-110"
              : "bg-black/40 border border-white/30 hover:bg-white/20"
            }
          `}
          title={location.name}
        >
          <span className="select-none">{location.icon}</span>
        </button>
      ))}
    </div>
  );
}
