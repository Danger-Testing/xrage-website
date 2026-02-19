"use client";

import { useState, useRef, useCallback } from "react";
import html2canvas from "html2canvas";
import GIF from "gif.js";

type RecordingOptions = {
  fps?: number;
  scale?: number;
  quality?: number;
  workers?: number;
};

const DEFAULT_OPTIONS: Required<RecordingOptions> = {
  fps: 10,
  scale: 0.5,
  quality: 10,
  workers: 2,
};

export function useRecording(containerRef: React.RefObject<HTMLDivElement | null>, options: RecordingOptions = {}) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const framesRef = useRef<HTMLCanvasElement[]>([]);
  const recordingInterval = useRef<NodeJS.Timeout | null>(null);

  const config = { ...DEFAULT_OPTIONS, ...options };
  const frameDelay = 1000 / config.fps;

  const captureFrame = useCallback(async () => {
    if (!containerRef.current) return;
    try {
      // Pre-convert oklab colors on the actual DOM before html2canvas parses it
      const elements = containerRef.current.querySelectorAll("*");
      const originalStyles: Map<HTMLElement, { bg: string; color: string; borderColor: string }> = new Map();

      elements.forEach((el) => {
        const htmlEl = el as HTMLElement;
        const computed = window.getComputedStyle(htmlEl);
        const bg = computed.backgroundColor;
        const color = computed.color;
        const borderColor = computed.borderColor;

        const needsFix = [bg, color, borderColor].some(
          (c) => c.includes("oklab") || c.includes("oklch")
        );

        if (needsFix) {
          // Save original inline styles
          originalStyles.set(htmlEl, {
            bg: htmlEl.style.backgroundColor,
            color: htmlEl.style.color,
            borderColor: htmlEl.style.borderColor,
          });
          // Apply converted colors
          if (bg.includes("oklab") || bg.includes("oklch")) {
            htmlEl.style.backgroundColor = convertToRgb(bg);
          }
          if (color.includes("oklab") || color.includes("oklch")) {
            htmlEl.style.color = convertToRgb(color);
          }
          if (borderColor.includes("oklab") || borderColor.includes("oklch")) {
            htmlEl.style.borderColor = convertToRgb(borderColor);
          }
        }
      });

      const canvas = await html2canvas(containerRef.current, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        scale: config.scale,
        logging: false,
        foreignObjectRendering: true,
      });

      // Restore original inline styles
      originalStyles.forEach((styles, el) => {
        el.style.backgroundColor = styles.bg;
        el.style.color = styles.color;
        el.style.borderColor = styles.borderColor;
      });

      framesRef.current.push(canvas);
    } catch (err) {
      console.error("Failed to capture frame:", err);
    }
  }, [containerRef, config.scale]);

  // Helper to convert modern color functions to rgb using CSS color-mix trick
  function convertToRgb(colorValue: string): string {
    try {
      // Create a temporary element to resolve the color
      const tempEl = document.createElement("div");
      tempEl.style.color = colorValue;
      tempEl.style.display = "none";
      document.body.appendChild(tempEl);
      const computed = window.getComputedStyle(tempEl).color;
      document.body.removeChild(tempEl);

      // If computed style still has oklab, try canvas method
      if (computed.includes("oklab") || computed.includes("oklch")) {
        const canvas = document.createElement("canvas");
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext("2d");
        if (!ctx) return "rgb(0, 0, 0)";
        ctx.fillStyle = colorValue;
        ctx.fillRect(0, 0, 1, 1);
        const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
        return a === 0 ? "transparent" : `rgba(${r}, ${g}, ${b}, ${a / 255})`;
      }

      return computed;
    } catch {
      return "rgb(0, 0, 0)";
    }
  }

  const startRecording = useCallback(() => {
    framesRef.current = [];
    setIsRecording(true);
    recordingInterval.current = setInterval(captureFrame, frameDelay);
  }, [captureFrame, frameDelay]);

  const stopRecording = useCallback(async () => {
    setIsRecording(false);
    if (recordingInterval.current) {
      clearInterval(recordingInterval.current);
      recordingInterval.current = null;
    }

    if (framesRef.current.length === 0) {
      return;
    }

    setIsProcessing(true);

    const gif = new GIF({
      workers: config.workers,
      quality: config.quality,
      width: framesRef.current[0].width,
      height: framesRef.current[0].height,
      workerScript: "/gif.worker.js",
    });

    framesRef.current.forEach((canvas) => {
      gif.addFrame(canvas, { delay: frameDelay });
    });

    gif.on("finished", (blob: Blob) => {
      setIsProcessing(false);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `xrageroom-${Date.now()}.gif`;
      a.click();
      URL.revokeObjectURL(url);
      framesRef.current = [];
    });

    gif.render();
  }, [config.workers, config.quality, frameDelay]);

  const toggleRecording = useCallback(() => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }, [isRecording, startRecording, stopRecording]);

  return {
    isRecording,
    isProcessing,
    startRecording,
    stopRecording,
    toggleRecording,
  };
}
