"use client";

import { Weapon } from "@/config/weapons";

type DestroyedViewProps = {
  weapon: Weapon | null;
  onUndo: () => void;
  onNewTweet: () => void;
};

export function DestroyedView({ weapon, onUndo, onNewTweet }: DestroyedViewProps) {
  return (
    <div
      className={`text-center p-8 rounded-xl ${weapon?.destroy.bgClass || "bg-black/50"}`}
      onClick={(e) => e.stopPropagation()}
    >
      {weapon?.destroy.image ? (
        <img
          src={weapon.destroy.image}
          alt="Destroyed"
          className="max-w-[400px] mx-auto select-none pointer-events-none"
          draggable={false}
          onContextMenu={(e) => e.preventDefault()}
        />
      ) : (
        <>
          <div className="text-6xl mb-4 animate-bounce">
            {weapon?.destroy.emoji || "💀"}
          </div>
          <p className="text-white text-2xl font-bold mb-6 drop-shadow-lg">
            {weapon?.destroy.message || "Destroyed!"}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUndo();
              }}
              aria-label="Undo destruction"
              className="px-6 py-4 bg-white/20 hover:bg-white/30 text-white cursor-pointer border border-white/30 select-none focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              Undo destruction
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNewTweet();
              }}
              aria-label="Load a new tweet"
              className="px-6 py-4 bg-white/20 hover:bg-white/30 text-white cursor-pointer border border-white/30 select-none focus:outline-none focus:ring-2 focus:ring-white/40"
            >
              New tweet
            </button>
          </div>
        </>
      )}
    </div>
  );
}
