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
  WeaponSelector,
  WeaponCursor,
  ExplosionEffect,
  TomatoSplat,
  FlyingLetter,
  FlyingBook,
  CrackEffect,
  SprayCanvas,
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

  // Crack effects (sledgehammer)
  const [cracks, setCracks] = useState<{ id: number; x: number; y: number; crackType: 1 | 2 | 3; rotation: number }[]>([]);
  const crackIdRef = useRef(0);
  const HAMMER_HITS_TO_DESTROY = 6;

  // Tweet dragging state
  const [isDraggingTweet, setIsDraggingTweet] = useState(false);
  const [tweetDragPos, setTweetDragPos] = useState({ x: 0, y: 0 });
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [inDangerZone, setInDangerZone] = useState(false);
  const [redFlash, setRedFlash] = useState(false);
  const [blackout, setBlackout] = useState(false);


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
  const { burnLevel, isDestroyed, isExploding, destroyedByWeapon, applyDamage, stopDamage, destroyByVolcano, destroyWithWeapon, completeExplosion, reset, undoDestroy } = useDamage();
  const { play, stop } = useAudio();

  // Track mouse position and handle tweet dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });

      // Update tweet drag position
      if (isDraggingTweet) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        setTweetDragPos({ x: newX, y: newY });

        // Check if in danger zone (right 20% of screen)
        const dangerThreshold = window.innerWidth * 0.8;
        const tweetRight = e.clientX;
        setInDangerZone(tweetRight > dangerThreshold);
      }
    };

    const handleMouseUp = () => {
      if (isDraggingTweet && inDangerZone) {
        // Trigger volcano eruption sequence
        play("/loud.mp3");
        play("/vulcano.mp3");
        setRedFlash(true);
        setTimeout(() => {
          setRedFlash(false);
          setIsExplodingDrag(true);
        }, 300);
        setTimeout(() => {
          setIsExplodingDrag(false);
          setBlackout(true);
        }, 2500);
      }
      setIsDraggingTweet(false);
      if (!inDangerZone) {
        // Reset position if not in danger zone
        setTweetDragPos({ x: 0, y: 0 });
      }
      setInDangerZone(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDraggingTweet, dragOffset, inDangerZone]);

  // Drag explosion state
  const [isExplodingDrag, setIsExplodingDrag] = useState(false);

  // Handle drag explosion completion
  const handleDragExplosionComplete = () => {
    setIsExplodingDrag(false);
    setBlackout(true);
    setTweetDragPos({ x: 0, y: 0 });
  };

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

    // Add crack effect when using sledgehammer (near where the user clicks)
    if (currentWeapon.id === "hammer" && tweetId && tweetContainerRef.current) {
      const rect = tweetContainerRef.current.getBoundingClientRect();
      // Calculate position as percentage of the tweet container
      let x = ((mousePos.x - rect.left) / rect.width) * 100;
      let y = ((mousePos.y - rect.top) / rect.height) * 100;
      // Clamp to stay within bounds (5-95%)
      x = Math.max(5, Math.min(95, x));
      y = Math.max(5, Math.min(95, y));
      // Add small random offset for natural variation
      x += (Math.random() - 0.5) * 10;
      y += (Math.random() - 0.5) * 10;
      const crackType = (Math.floor(Math.random() * 3) + 1) as 1 | 2 | 3;
      const rotation = Math.random() * 360;
      setCracks(prev => {
        const newCracks = [...prev, { id: crackIdRef.current++, x, y, crackType, rotation }];
        // Destroy tweet after 6 hammer hits
        if (newCracks.length >= HAMMER_HITS_TO_DESTROY) {
          destroyWithWeapon(currentWeapon);
        }
        return newCracks;
      });
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
    setCracks([]);
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
    setCracks([]);
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
    setCracks([]);
    setTweetTilt(0);
    setIsFalling(false);
    setFallOffset(0);
    setTweetDragPos({ x: 0, y: 0 });
    setBlackout(false);
    setIsExplodingDrag(false);
    hasSavedDestruction.current = false;
  };

  return (
    <div
      ref={containerRef}
      className={`fixed inset-0 ${currentWeapon.cursor ? "cursor-none" : "cursor-default"} transition-all duration-500 bg-cover bg-center bg-no-repeat`}
      style={{ backgroundImage: "url('/bg.jpg')" }}
    >
      {/* Navigation - Mobile: centered column, Desktop: spread row */}
      <nav className="absolute top-0 left-0 w-full px-3 sm:px-6 pt-8 sm:pt-10 pb-2 sm:pb-4 z-50">
        {/* Mobile layout */}
        <div className="flex flex-col items-center gap-2 sm:hidden">
          <a href="/" className="hover:opacity-80">
            <img src="/x.png" alt="xrageroom" className="h-12" />
          </a>
          {tweetId && (
            <button
              onClick={handleReset}
              onMouseDown={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 text-white/70 hover:text-white transition-colors text-base"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              <span className="font-bold">Reset</span>
            </button>
          )}
        </div>
        {/* Desktop layout */}
        <div className="hidden sm:block">
          {/* Absolutely centered logo */}
          <a href="/" className="absolute left-1/2 -translate-x-1/2 hover:opacity-80">
            <img src="/x.png" alt="xrageroom" className="h-24" />
          </a>
          {/* Reset button on left */}
          {tweetId && (
            <button
              onClick={handleReset}
              onMouseDown={(e) => e.stopPropagation()}
              className="flex items-center gap-3 text-white/70 hover:text-white transition-colors text-2xl"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
            </svg>
            <span className="font-bold">Reset</span>
          </button>
          )}
        </div>
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

      {/* Full screen spray canvas - always mounted to persist paint */}
      <SprayCanvas isActive={isHolding && currentWeapon.id === "spray"} mousePos={mousePos} />

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
        {tweetId && !isDestroyed && !isExploding && !isExplodingDrag && !blackout && (
          <div
            ref={tweetContainerRef}
            className={`relative ${currentWeapon.id === "cursor" ? "cursor-grab active:cursor-grabbing" : ""} ${isDraggingTweet ? "scale-95" : ""}`}
            onMouseEnter={() => setIsHoveringTweet(true)}
            onMouseLeave={() => setIsHoveringTweet(false)}
            onMouseDown={(e) => {
              if (currentWeapon.id === "cursor") {
                e.stopPropagation();
                setIsDraggingTweet(true);
                setDragOffset({
                  x: e.clientX - tweetDragPos.x,
                  y: e.clientY - tweetDragPos.y,
                });
              }
            }}
            style={{
              transform: `translate(${tweetDragPos.x}px, ${tweetDragPos.y}px) rotate(${tweetTilt}deg) translateY(${fallOffset}px)`,
              transition: isDraggingTweet || isFalling ? "none" : "transform 0.3s ease-out",
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
            {/* Crack effects from sledgehammer */}
            {cracks.map((crack) => (
              <CrackEffect
                key={crack.id}
                x={crack.x}
                y={crack.y}
                crackType={crack.crackType}
                rotation={crack.rotation}
              />
            ))}
          </div>
        )}

        {/* Explosion effect */}
        {isExploding && (
          <ExplosionEffect onComplete={completeExplosion} />
        )}

        {/* Destroyed/Ashes end screen */}
        {isDestroyed && (
          <img
            src="/ashes.png"
            alt="Destroyed"
            className="max-w-[400px] w-[80vw] animate-fade-in-scale"
          />
        )}

      </div>

      {/* Inventory background - hidden on mobile */}
      <img
        src="/inventory.png"
        alt=""
        className="hidden sm:block absolute bottom-0 left-1/2 -translate-x-1/2 min-w-[924px] w-[55%] min-h-[140px] pointer-events-none"
      />

      {/* Weapon hotbar */}
      <WeaponSelector
        selectedIndex={selectedIndex}
        onSelect={selectWeapon}
        disabled={!tweetId}
      />

      {/* Danger zone - volcano glow (right 20%) */}
      {isDraggingTweet && (
        <div
          className={`fixed top-0 right-0 w-[20%] h-full pointer-events-none transition-all duration-300 ${
            inDangerZone ? "opacity-100" : "opacity-30"
          }`}
          style={{
            background: inDangerZone
              ? "linear-gradient(to right, transparent, rgba(255, 60, 0, 0.7), rgba(255, 0, 0, 0.9))"
              : "linear-gradient(to right, transparent, rgba(255, 100, 0, 0.4))",
            boxShadow: inDangerZone ? "inset 0 0 100px rgba(255, 50, 0, 0.8)" : "none",
          }}
        />
      )}

      {/* Volcano eruption - initial flash */}
      {redFlash && (
        <div
          className="fixed inset-0 pointer-events-none z-[100] animate-eruption-shake"
          style={{
            background: "radial-gradient(circle at 90% 50%, #fff 0%, #ff6600 10%, #ff2200 30%, #aa0000 60%, #000 100%)",
          }}
        />
      )}

      {/* Lava explosion sequence */}
      {isExplodingDrag && (
        <div className="fixed inset-0 z-[100] overflow-hidden animate-eruption-shake">
          {/* Base lava glow - pulsing */}
          <div
            className="absolute inset-0 animate-lava-pulse"
            style={{
              background: "radial-gradient(ellipse at 85% 50%, #ff4400 0%, #ff0000 15%, #cc0000 35%, #660000 60%, #220000 80%, #000 100%)",
            }}
          />
          {/* Secondary lava layer */}
          <div
            className="absolute inset-0"
            style={{
              background: "radial-gradient(circle at 80% 40%, rgba(255,200,0,0.4) 0%, transparent 30%)",
              animation: "lava-pulse 0.15s infinite alternate",
            }}
          />
          {/* Fire/ember particles */}
          <div className="absolute inset-0">
            {[...Array(40)].map((_, i) => (
              <div
                key={i}
                className="absolute rounded-full"
                style={{
                  width: Math.random() * 30 + 5,
                  height: Math.random() * 30 + 5,
                  right: `${Math.random() * 40}%`,
                  top: `${Math.random() * 100}%`,
                  background: `radial-gradient(circle, ${['#fff', '#ffcc00', '#ff6600', '#ff3300', '#ff0000'][Math.floor(Math.random() * 5)]} 0%, transparent 70%)`,
                  animation: `float-up ${Math.random() * 1.5 + 0.5}s ease-out forwards`,
                  animationDelay: `${Math.random() * 1}s`,
                  filter: "blur(1px)",
                }}
              />
            ))}
          </div>
          {/* Smoke/ash overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(to top, rgba(0,0,0,0.8) 0%, transparent 50%)",
            }}
          />
          {/* Final fade to black */}
          <div className="absolute inset-0 bg-black animate-blackout-fade" style={{ opacity: 0 }} />
        </div>
      )}

      {/* Blackout */}
      {blackout && (
        <div
          className="fixed inset-0 bg-black z-[100] cursor-pointer"
          onClick={() => {
            setBlackout(false);
            setTweetDragPos({ x: 0, y: 0 });
          }}
        />
      )}

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
