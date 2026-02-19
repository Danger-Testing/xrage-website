"use client";

import { useEffect, useRef } from "react";

type TomatoSplatProps = {
  x: number;
  y: number;
};

export function TomatoSplat({ x, y }: TomatoSplatProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    let animationId: number;
    let isActive = true;

    const processFrame = () => {
      if (!isActive || video.paused || video.ended) {
        return;
      }

      // Draw video frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Get image data for chroma key processing
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Remove green screen (chroma key) - optimized loop
      for (let i = 0, len = data.length; i < len; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Check if pixel is green
        if (g > 80 && g > r * 1.1 && g > b * 1.1) {
          data[i + 3] = 0;
        }
      }

      ctx.putImageData(imageData, 0, 0);
      animationId = requestAnimationFrame(processFrame);
    };

    const handleEnded = () => {
      isActive = false;
      // Keep last frame visible - don't call onComplete
    };

    const startPlayback = async () => {
      if (isPlayingRef.current) return;
      isPlayingRef.current = true;

      try {
        await video.play();
        processFrame();
      } catch (err) {
        // Ignore AbortError from rapid play/pause
        if ((err as Error).name !== "AbortError") {
          console.error(err);
        }
      }
    };

    video.addEventListener("ended", handleEnded);
    startPlayback();

    return () => {
      isActive = false;
      isPlayingRef.current = false;
      cancelAnimationFrame(animationId);
      video.removeEventListener("ended", handleEnded);
      video.pause();
    };
  }, []);

  return (
    <div
      className="fixed pointer-events-none z-[100]"
      style={{
        left: x,
        top: y,
        transform: "translate(-50%, -50%)",
      }}
    >
      <video
        ref={videoRef}
        src="/tomato.mp4"
        muted
        playsInline
        preload="auto"
        className="hidden"
        width={500}
        height={500}
      />
      <canvas
        ref={canvasRef}
        width={500}
        height={500}
        className="w-[500px] h-[500px]"
      />
    </div>
  );
}
