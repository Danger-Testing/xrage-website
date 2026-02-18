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
          className="max-w-[400px] mx-auto"
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
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg cursor-pointer border border-white/30"
            >
              Undo destruction
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNewTweet();
              }}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg cursor-pointer border border-white/30"
            >
              New tweet
            </button>
          </div>
        </>
      )}
    </div>
  );
}
