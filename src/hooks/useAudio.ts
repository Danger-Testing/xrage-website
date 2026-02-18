"use client";

import { useRef, useCallback, useEffect } from "react";

type AudioPool = Map<string, HTMLAudioElement[]>;

const POOL_SIZE = 3;

export function useAudio() {
  const audioPool = useRef<AudioPool>(new Map());
  const currentlyPlaying = useRef<HTMLAudioElement | null>(null);

  const getOrCreatePool = useCallback((src: string): HTMLAudioElement[] => {
    if (!audioPool.current.has(src)) {
      const pool: HTMLAudioElement[] = [];
      for (let i = 0; i < POOL_SIZE; i++) {
        const audio = new Audio(src);
        audio.preload = "auto";
        pool.push(audio);
      }
      audioPool.current.set(src, pool);
    }
    return audioPool.current.get(src)!;
  }, []);

  const play = useCallback((src: string) => {
    const pool = getOrCreatePool(src);
    const available = pool.find((audio) => audio.paused || audio.ended);
    const audio = available || pool[0];

    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {});
      currentlyPlaying.current = audio;
    }
  }, [getOrCreatePool]);

  const stop = useCallback(() => {
    if (currentlyPlaying.current) {
      currentlyPlaying.current.pause();
      currentlyPlaying.current.currentTime = 0;
      currentlyPlaying.current = null;
    }
  }, []);

  const preload = useCallback((src: string) => {
    getOrCreatePool(src);
  }, [getOrCreatePool]);

  useEffect(() => {
    return () => {
      audioPool.current.forEach((pool) => {
        pool.forEach((audio) => {
          audio.pause();
          audio.src = "";
        });
      });
      audioPool.current.clear();
    };
  }, []);

  return { play, stop, preload };
}
