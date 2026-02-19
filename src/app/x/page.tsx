"use client";

import { useSearchParams } from "next/navigation";
import { useState, useRef, useEffect, Suspense } from "react";

import { LOCATIONS } from "@/config/locations";
import { useWeapon } from "@/hooks/useWeapon";
import { useDamage } from "@/hooks/useDamage";
import { useAudio } from "@/hooks/useAudio";
import {
  TweetInput,
  TweetDisplay,
  DestroyedView,
  WeaponSelector,
  WeaponCursor,
  ExplosionEffect,
  TomatoSplat,
  FlyingLetter,
  FlyingBook,
} from "@/components";
import { saveDestroyedTweet } from "@/lib/supabase";

function TweetPageContent() {
  const searchParams = useSearchParams();
  const urlParam = searchParams.get("url") || "";

  // Tweet URL state
  const [submittedUrl, setSubmittedUrl] = useState(urlParam);
  const tweetId = submittedUrl.match(/status\/(\d+)/)?.[1] || (/^\d+$/.test(submittedUrl) ? submittedUrl : "");

  // Location state
  const [selectedLocation, setSelectedLocation] = useState(0);
  const currentLocation = LOCATIONS[selectedLocation];

  // Mouse state
  const [isHolding, setIsHolding] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHoveringTweet, setIsHoveringTweet] = useState(false);

  // Tomato splat effects
  const [tomatoSplats, setTomatoSplats] = useState<{ id: number; x: number; y: number }[]>([]);
  const splatIdRef = useRef(0);

  // Flying letter effects (EU weapon)
  const [flyingLetters, setFlyingLetters] = useState<{ id: number; x: number; y: number }[]>([]);
  const letterIdRef = useRef(0);

  // Flying book effects (Creative Act weapon) - supports multiple
  const [flyingBooks, setFlyingBooks] = useState<{ id: number; x: number; y: number }[]>([]);
  const bookIdRef = useRef(0);

  // Tweet tilt (knocked by books like a crooked painting)
  const [tweetTilt, setTweetTilt] = useState(0);
  const [isFalling, setIsFalling] = useState(false);
  const [fallOffset, setFallOffset] = useState(0);


  // Check if tweet should fall
  useEffect(() => {
    if (Math.abs(tweetTilt) > 25 && !isFalling) {
      setIsFalling(true);
      // Animate falling
      let velocity = 0;
      const gravity = 0.15;
      const animate = () => {
        velocity += gravity;
        setFallOffset(prev => {
          const next = prev + velocity;
          if (next > window.innerHeight) {
            return next; // Stop when off screen
          }
          requestAnimationFrame(animate);
          return next;
        });
      };
      requestAnimationFrame(animate);
    }
  }, [tweetTilt, isFalling]);

  // Tweet loading state
  const [isTweetLoaded, setIsTweetLoaded] = useState(false);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const tweetContainerRef = useRef<HTMLDivElement>(null);
  const hasSavedDestruction = useRef(false);

  // Custom hooks
  const { weapons, currentWeapon, selectedIndex, selectWeapon } = useWeapon();
  const { burnLevel, isDestroyed, isExploding, destroyedByWeapon, applyDamage, stopDamage, destroyByVolcano, completeExplosion, reset, undoDestroy } = useDamage();
  const { play, stop } = useAudio();

  // Track mouse position
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Save destroyed tweet to Supabase
  useEffect(() => {
    if (isDestroyed && tweetId && destroyedByWeapon && !hasSavedDestruction.current) {
      hasSavedDestruction.current = true;
      saveDestroyedTweet(tweetId, submittedUrl, destroyedByWeapon.id);
    }
  }, [isDestroyed, tweetId, submittedUrl, destroyedByWeapon]);

  const handleMouseDown = () => {
    setIsHolding(true);

    if (currentWeapon.sound?.active) {
      play(currentWeapon.sound.active);
    }

    // Add tomato splat effect when using tomato weapon (anywhere on screen)
    if (currentWeapon.id === "tomato") {
      const newSplat = { id: splatIdRef.current++, x: mousePos.x, y: mousePos.y };
      setTomatoSplats((prev) => [...prev, newSplat]);
    }

    // Add flying letter effect when using EU weapon
    if (currentWeapon.id === "eu") {
      const newLetter = { id: letterIdRef.current++, x: mousePos.x, y: mousePos.y };
      setFlyingLetters((prev) => [...prev, newLetter]);
    }

    // Add flying book effect when using Creative Act weapon (one per click)
    if (currentWeapon.id === "grenade") {
      play("/book.mp3");
      setFlyingBooks(prev => [...prev, { id: bookIdRef.current++, x: mousePos.x, y: mousePos.y }]);
    }

    applyDamage(currentWeapon);
  };

  const handleMouseUp = () => {
    setIsHolding(false);
    stopDamage();
    // Only stop audio for hold-type weapons (like flamethrower), let click sounds play through
    if (currentWeapon.damage.type === "hold") {
      stop();
    }
  };

  const handleTweetSubmit = (url: string) => {
    setSubmittedUrl(url);
    setIsTweetLoaded(false);
    reset();
    setTweetTilt(0);
    setIsFalling(false);
    setFallOffset(0);
    hasSavedDestruction.current = false;
    // Update browser URL without navigation
    window.history.replaceState({}, "", `/x?url=${encodeURIComponent(url)}`);
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
    setIsTweetLoaded(false);
    reset();
    setTomatoSplats([]);
    setTweetTilt(0);
    setIsFalling(false);
    setFallOffset(0);
    hasSavedDestruction.current = false;
  };

  const handleReset = () => {
    reset();
    setTomatoSplats([]);
    setFlyingLetters([]);
    setFlyingBooks([]);
    setTweetTilt(0);
    setIsFalling(false);
    setFallOffset(0);
    hasSavedDestruction.current = false;
  };

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 ${currentWeapon.cursor ? "cursor-none" : "cursor-default"} transition-all duration-500 bg-cover bg-center bg-no-repeat`}
      style={{ backgroundImage: "url('/bg.jpg')" }}
    >
      {/* Navigation */}
      <nav className="absolute top-0 left-0 w-full px-6 pt-10 pb-4 z-50 flex justify-between items-start">
        <div className="flex items-center gap-6">
          <button
            onClick={handleReset}
            className="flex items-center gap-3 text-white/70 hover:text-white transition-colors text-2xl"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            <span className="font-bold">Reset</span>
          </button>
        </div>
        <a href="/" className="hover:opacity-80">
          <img src="/x.png" alt="xrageroom" className="h-24" />
        </a>
{/* Leaderboard hidden for now */}
        <div className="w-[120px]" />
      </nav>

      {/* Custom weapon cursor */}
      <WeaponCursor
        weapon={currentWeapon}
        mousePos={mousePos}
        isActive={isHolding}
      />

      {/* Tomato splat effects */}
      {tomatoSplats.map((splat) => (
        <TomatoSplat
          key={splat.id}
          x={splat.x}
          y={splat.y}
          onComplete={() => play("/tomato.mp3")}
        />
      ))}

      {/* Flying letter effects (EU weapon) */}
      {flyingLetters.map((letter) => (
        <FlyingLetter
          key={letter.id}
          startX={letter.x}
          startY={letter.y}
          onComplete={() => setFlyingLetters((prev) => prev.filter((l) => l.id !== letter.id))}
        />
      ))}

      {/* Flying book effects (Creative Act weapon) */}
      {flyingBooks.map((book) => (
        <FlyingBook
          key={book.id}
          startX={book.x}
          startY={book.y}
          onComplete={() => {
            setFlyingBooks(prev => prev.filter(b => b.id !== book.id));
            // Knock the tweet - alternate direction based on which side was hit
            const hitFromLeft = book.x < window.innerWidth / 2;
            setTweetTilt(prev => prev + (hitFromLeft ? -3 : 3) + (Math.random() - 0.5) * 2);
          }}
        />
      ))}


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
            ref={tweetContainerRef}
            onMouseEnter={() => setIsHoveringTweet(true)}
            onMouseLeave={() => setIsHoveringTweet(false)}
            style={{
              transform: `rotate(${tweetTilt}deg) translateY(${fallOffset}px)`,
              transition: isFalling ? "none" : "transform 0.3s ease-out",
              transformOrigin: "center center",
            }}
          >
            <TweetDisplay
              tweetId={tweetId}
              weapon={currentWeapon}
              location={currentLocation}
              burnLevel={burnLevel}
              isHolding={isHolding}
              onDestroy={handleVolcanoDestroy}
              onLoad={() => setIsTweetLoaded(true)}
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
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[55%] pointer-events-none"
      />

      {/* Weapon hotbar */}
      <WeaponSelector
        selectedIndex={selectedIndex}
        onSelect={selectWeapon}
        disabled={!isTweetLoaded}
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
