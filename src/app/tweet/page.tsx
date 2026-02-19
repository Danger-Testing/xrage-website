"use client";

import { useSearchParams } from "next/navigation";
import { useState, useRef, useEffect, Suspense } from "react";

import { LOCATIONS } from "@/config/locations";
import { useWeapon } from "@/hooks/useWeapon";
import { useDamage } from "@/hooks/useDamage";
import { useRecording } from "@/hooks/useRecording";
import { useAudio } from "@/hooks/useAudio";
import {
  TweetInput,
  TweetDisplay,
  DestroyedView,
  WeaponSelector,
  LocationSelector,
  WeaponCursor,
  RecordButton,
  ExplosionEffect,
} from "@/components";

function TweetPageContent() {
  const searchParams = useSearchParams();
  const urlParam = searchParams.get("url") || "";

  // Tweet URL state
  const [submittedUrl, setSubmittedUrl] = useState(urlParam);
  const tweetId = submittedUrl.match(/status\/(\d+)/)?.[1] || "";

  // Location state
  const [selectedLocation, setSelectedLocation] = useState(0);
  const currentLocation = LOCATIONS[selectedLocation];

  // Mouse state
  const [isHolding, setIsHolding] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHoveringTweet, setIsHoveringTweet] = useState(false);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);

  // Custom hooks
  const { weapons, currentWeapon, selectedIndex, selectWeapon } = useWeapon();
  const { burnLevel, isDestroyed, isExploding, destroyedByWeapon, applyDamage, stopDamage, destroyByVolcano, completeExplosion, reset, undoDestroy } = useDamage();
  const { isRecording, isProcessing, toggleRecording } = useRecording(containerRef);
  const { play, stop } = useAudio();

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleMouseDown = () => {
    setIsHolding(true);

    if (currentWeapon.damage.rate > 0 && currentWeapon.sound?.active) {
      play(currentWeapon.sound.active);
    }

    applyDamage(currentWeapon);
  };

  const handleMouseUp = () => {
    setIsHolding(false);
    stopDamage();
    stop();
  };

  const handleTweetSubmit = (url: string) => {
    setSubmittedUrl(url);
    reset();
  };

  const handleVolcanoDestroy = () => {
    play("/flame.mp3");
    destroyByVolcano();
  };

  const handleUndo = () => {
    undoDestroy();
  };

  const handleNewTweet = () => {
    setSubmittedUrl("");
    reset();
  };

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 ${currentWeapon.cursor ? "cursor-none" : "cursor-default"} transition-all duration-500 bg-cover bg-center`}
      style={{ backgroundImage: `url(/bg.jpg)` }}
    >
      {/* Navigation */}
      <nav className="absolute top-0 left-0 w-full px-6 pt-8 pb-4 z-50 flex justify-center items-center">
        <a href="/" className="hover:opacity-80">
          <img src="/x.png" alt="xrageroom" className="h-24" />
        </a>
      </nav>

      {/* Custom weapon cursor */}
      <WeaponCursor
        weapon={currentWeapon}
        mousePos={mousePos}
        isActive={isHolding}
      />

      {/* Main content area */}
      <div
        className="flex items-center justify-center h-full"
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
      >
        {/* Input form when no tweet */}
        {!tweetId && !isDestroyed && (
          <TweetInput initialUrl={urlParam} onSubmit={handleTweetSubmit} />
        )}

        {/* Tweet display */}
        {tweetId && !isDestroyed && !isExploding && (
          <div
            onMouseEnter={() => setIsHoveringTweet(true)}
            onMouseLeave={() => setIsHoveringTweet(false)}
          >
            <TweetDisplay
              tweetId={tweetId}
              weapon={currentWeapon}
              location={currentLocation}
              burnLevel={burnLevel}
              isHolding={isHolding}
              isHovering={isHoveringTweet}
              onDestroy={handleVolcanoDestroy}
            />
          </div>
        )}

        {/* Explosion effect */}
        {isExploding && (
          <ExplosionEffect onComplete={completeExplosion} />
        )}

        {/* Destroyed view */}
        {isDestroyed && (
          <DestroyedView
            weapon={destroyedByWeapon}
            onUndo={handleUndo}
            onNewTweet={handleNewTweet}
          />
        )}
      </div>

      {/* Inventory background */}
      <img
        src="/inventory.png"
        alt=""
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[60%] pointer-events-none"
      />

      {/* Weapon hotbar */}
      <WeaponSelector
        weapons={weapons}
        selectedIndex={selectedIndex}
        onSelect={selectWeapon}
      />

      {/* Record button */}
      <RecordButton
        isRecording={isRecording}
        isProcessing={isProcessing}
        onToggle={toggleRecording}
      />
    </div>
  );
}

export default function TweetPage() {
  return (
    <Suspense fallback={<div className="fixed inset-0 bg-black flex items-center justify-center text-white">Loading...</div>}>
      <TweetPageContent />
    </Suspense>
  );
}
