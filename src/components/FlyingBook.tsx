"use client";

import { useEffect, useState, useRef, useCallback } from "react";

type FlyingBookProps = {
  startX: number;
  startY: number;
  onComplete?: () => void;
};

export function FlyingBook({ startX, startY, onComplete }: FlyingBookProps) {
  const [transform, setTransform] = useState({
    x: startX,
    y: startY,
    scale: 1.5,
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
  });
  const [phase, setPhase] = useState<"flying" | "done">("flying");

  // Use refs to avoid stale closures and dependency issues
  const animationRef = useRef<number | null>(null);
  const holeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const onCompleteRef = useRef(onComplete);
  const isMountedRef = useRef(true);

  // Keep onComplete ref updated without triggering effect re-run
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Cleanup on unmount
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (holeTimeoutRef.current) {
        clearTimeout(holeTimeoutRef.current);
      }
    };
  }, []);

  // Animation effect - only runs once on mount
  useEffect(() => {
    // Target: where user clicked
    const targetX = startX;
    const targetY = startY;

    // Start from further below screen (like throwing from hands)
    const throwStartX = window.innerWidth / 2;
    const throwStartY = window.innerHeight + 400;

    const startTime = performance.now();
    const duration = 1000; // Slightly longer for more distance

    const animate = (currentTime: number) => {
      if (!isMountedRef.current) return;

      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out for natural deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);

      // Move from throw position to target
      const x = throwStartX + (targetX - throwStartX) * easeOut;

      // Arc trajectory - go up first then down to target
      const arcHeight = -350; // Higher arc for longer throw
      const arcProgress = Math.sin(progress * Math.PI); // 0 -> 1 -> 0
      const linearY = throwStartY + (targetY - throwStartY) * easeOut;
      const y = linearY + arcHeight * arcProgress;

      // Start big (close), end smaller (far away)
      const scale = 1.5 - easeOut * 1.2; // 1.5 -> 0.3

      // Tumbling rotation - multiple spins
      const rotateX = progress * 720; // 2 full rotations
      const rotateZ = progress * 360; // 1 full spin

      // Slight wobble
      const rotateY = Math.sin(progress * Math.PI * 4) * 15 * (1 - progress);

      setTransform({ x, y, scale, rotateX, rotateY, rotateZ });

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Animation complete - notify parent to tilt the tweet
        setPhase("done");
        onCompleteRef.current?.();
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  }, [startX, startY]); // Only depend on start position

  return (
    <>
      {phase === "flying" && (
        <div
          className="fixed pointer-events-none z-[100]"
          style={{
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
            perspective: "1200px",
            perspectiveOrigin: "50% 50%",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: transform.x,
              top: transform.y,
              transform: `translate(-50%, -50%) rotateX(${transform.rotateX}deg) rotateY(${transform.rotateY}deg) rotateZ(${transform.rotateZ}deg) scale(${transform.scale})`,
              transformStyle: "preserve-3d",
              willChange: "transform",
            }}
          >
            <img
              src="/act.png"
              alt="Creative Act"
              className="w-[640px] h-[640px] object-contain"
              style={{
                filter: `drop-shadow(0 ${20 * transform.scale}px ${30 * transform.scale}px rgba(0,0,0,0.4))`,
              }}
            />
          </div>
        </div>
      )}

    </>
  );
}
