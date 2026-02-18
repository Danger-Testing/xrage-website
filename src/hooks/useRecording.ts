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
      const canvas = await html2canvas(containerRef.current, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
        scale: config.scale,
      });
      framesRef.current.push(canvas);
    } catch (err) {
      console.error("Failed to capture frame:", err);
    }
  }, [containerRef, config.scale]);

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
