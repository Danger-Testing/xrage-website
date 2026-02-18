"use client";

import { useSearchParams } from "next/navigation";
import { useState, useRef, useEffect } from "react";

export default function TweetPage() {
  const searchParams = useSearchParams();
  const tweetUrl = searchParams.get("url") || "";
  const [isHolding, setIsHolding] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [burnLevel, setBurnLevel] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const burnInterval = useRef<NodeJS.Timeout | null>(null);

  const tweetId = tweetUrl.match(/status\/(\d+)/)?.[1] || "";

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const handleMouseDown = () => {
    setIsHolding(true);
    audioRef.current?.play();

    burnInterval.current = setInterval(() => {
      setBurnLevel((prev) => Math.min(prev + 2, 100));
    }, 50);
  };

  const handleMouseUp = () => {
    setIsHolding(false);
    if (burnInterval.current) {
      clearInterval(burnInterval.current);
    }
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-white cursor-none"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <audio ref={audioRef} src="/flame.mp3" />

      <img
        src={isHolding ? "/2.png" : "/1.png"}
        alt=""
        className="pointer-events-none fixed w-[400px] h-auto z-50"
        style={{
          left: mousePos.x - 200,
          top: mousePos.y - 200,
        }}
      />

      <div className="relative overflow-hidden" style={{ height: 240 }}>
        <iframe
          src={`https://platform.twitter.com/embed/Tweet.html?id=${tweetId}`}
          width="400"
          height="300"
          className="border-0"
        />
        {/* Transparent overlay to block hover */}
        <div className="absolute inset-0" />
        {/* Burn overlay */}
        <div
          className="absolute inset-0 bg-black pointer-events-none transition-opacity"
          style={{ opacity: burnLevel / 100 }}
        />
      </div>
    </div>
  );
}
