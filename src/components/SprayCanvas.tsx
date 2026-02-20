"use client";

import { useEffect, useRef } from "react";
// @ts-expect-error - no types
import { Spray } from "dripping-spray";
// @ts-expect-error - no types
import { Drawer } from "dripping-spray-canvas";

type SprayCanvasProps = {
  isActive: boolean;
  mousePos: { x: number; y: number };
};

export function SprayCanvas({ isActive, mousePos }: SprayCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sprayRef = useRef<InstanceType<typeof Spray> | null>(null);
  const drawerRef = useRef<InstanceType<typeof Drawer> | null>(null);
  const mousePosRef = useRef(mousePos);
  const isActiveRef = useRef(isActive);
  const animationIdRef = useRef<number | null>(null);

  // Keep refs in sync
  useEffect(() => {
    mousePosRef.current = mousePos;
  }, [mousePos]);

  useEffect(() => {
    isActiveRef.current = isActive;
  }, [isActive]);

  // Initialize canvas, drawer, and spray
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Full screen canvas
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    drawerRef.current = new Drawer(canvas);
    sprayRef.current = new Spray({
      canvas,
      color: { r: 255, g: 0, b: 0 },
      size: 12,
      splatterAmount: 40,
      splatterRadius: 35,
      dripper: true,
      dripThreshold: 25,
      dripSpeed: 3,
    });

    // Animation loop
    const render = () => {
      const spray = sprayRef.current;
      const drawer = drawerRef.current;
      if (!spray || !drawer) return;

      const coords = isActiveRef.current ? mousePosRef.current : null;
      spray.draw(drawer, coords);

      animationIdRef.current = requestAnimationFrame(render);
    };

    animationIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-40"
    />
  );
}
