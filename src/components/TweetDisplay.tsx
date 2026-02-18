"use client";

import { useState, useCallback } from "react";
import { Weapon } from "@/config/weapons";
import { Location } from "@/config/locations";
import { DamageOverlay } from "./DamageOverlay";

type TweetDisplayProps = {
  tweetId: string;
  weapon: Weapon;
  location: Location;
  burnLevel: number;
  isHolding: boolean;
  onDestroy: () => void;
};

export function TweetDisplay({
  tweetId,
  weapon,
  location,
  burnLevel,
  isHolding,
  onDestroy,
}: TweetDisplayProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [tweetPos, setTweetPos] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);

  const isHellMode = location.id === "hell";

  const handleTweetMouseDown = useCallback((e: React.MouseEvent) => {
    if (isHellMode) {
      e.stopPropagation();
      setIsDragging(true);
      setDragStart({ x: e.clientX - tweetPos.x, y: e.clientY - tweetPos.y });
    }
  }, [isHellMode, tweetPos]);

  const handleTweetMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && isHellMode) {
      setTweetPos({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  }, [isDragging, isHellMode, dragStart]);

  const handleTweetMouseUp = useCallback(() => {
    if (isDragging && isHellMode) {
      setIsDragging(false);
      const distance = Math.sqrt(tweetPos.x ** 2 + tweetPos.y ** 2);
      if (distance > 100) {
        onDestroy();
      }
    }
  }, [isDragging, isHellMode, tweetPos, onDestroy]);

  return (
    <div
      className={`relative overflow-hidden transition-all duration-100 ${
        isHellMode ? "cursor-grab active:cursor-grabbing" : ""
      } ${isDragging ? "scale-95 rotate-3" : ""} ${
        isHolding && weapon.effect.activeClass ? weapon.effect.activeClass : ""
      }`}
      style={{
        height: 240,
        transform: `translate(${tweetPos.x}px, ${tweetPos.y}px) ${
          isDragging ? "scale(0.95) rotate(3deg)" : ""
        } ${isHolding && weapon.effect.activeTransform ? weapon.effect.activeTransform : ""}`,
        filter: weapon.effect.filter(burnLevel),
      }}
      onMouseDown={handleTweetMouseDown}
      onMouseMove={handleTweetMouseMove}
      onMouseUp={handleTweetMouseUp}
    >
      {/* Loading skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-gray-800 rounded-lg animate-pulse flex items-center justify-center">
          <div className="text-gray-500">Loading tweet...</div>
        </div>
      )}

      <iframe
        src={`https://platform.twitter.com/embed/Tweet.html?id=${tweetId}`}
        width="400"
        height="300"
        className="border-0"
        onLoad={() => setIsLoading(false)}
      />

      {/* Transparent overlay to block hover */}
      <div className="absolute inset-0" />

      <DamageOverlay weapon={weapon} burnLevel={burnLevel} />

      {/* Hell mode indicator */}
      {isHellMode && (
        <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-orange-400 text-sm whitespace-nowrap animate-pulse">
          Drag to throw into the volcano!
        </div>
      )}
    </div>
  );
}
