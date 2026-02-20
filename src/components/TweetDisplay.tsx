"use client";

import { useState, useCallback, useEffect, useRef } from "react";
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
  onLoad?: () => void;
};

export function TweetDisplay({
  tweetId,
  weapon,
  location,
  burnLevel,
  isHolding,
  onDestroy,
  onLoad,
}: TweetDisplayProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [tweetPos, setTweetPos] = useState({ x: 0, y: 0 });
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [iframeHeight, setIframeHeight] = useState(250);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isHellMode = location.id === "hell";

  // Listen for Twitter embed resize messages
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Twitter embed sends height via postMessage
      if (event.origin === "https://platform.twitter.com") {
        try {
          const data = typeof event.data === "string" ? JSON.parse(event.data) : event.data;
          if (data["twttr.embed"] && data["twttr.embed"].method === "twttr.private.resize") {
            const params = data["twttr.embed"].params;
            if (params && params[0] && params[0].height) {
              setIframeHeight(params[0].height);
            }
          }
        } catch {
          // Ignore non-JSON messages
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

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

  // Always apply burn effect if there's damage, regardless of current weapon
  const burnFilter = burnLevel > 0
    ? `brightness(${1 - burnLevel * 0.006}) contrast(${1 + burnLevel * 0.004})`
    : "";

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden transition-all duration-100 ${
        isHellMode ? "cursor-grab active:cursor-grabbing" : ""
      } ${isDragging ? "scale-95 rotate-3" : ""} ${
        isHolding && weapon.effect.activeClass ? weapon.effect.activeClass : ""
      }`}
      style={{
        height: iframeHeight,
        transform: `translate(${tweetPos.x}px, ${tweetPos.y}px) ${
          isDragging ? "scale(0.95) rotate(3deg)" : ""
        } ${isHolding && weapon.effect.activeTransform ? weapon.effect.activeTransform : ""}`,
        filter: burnFilter,
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
        ref={iframeRef}
        src={`https://platform.twitter.com/embed/Tweet.html?id=${tweetId}&theme=light`}
        width="550"
        height={iframeHeight}
        className="border-0 rounded-xl max-w-[90vw] sm:max-w-[550px] scale-[0.85] sm:scale-100 origin-top bg-white"
        onLoad={() => {
          setIsLoading(false);
          onLoad?.();
        }}
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
