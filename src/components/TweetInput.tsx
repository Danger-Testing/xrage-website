"use client";

import { useState } from "react";

type TweetInputProps = {
  initialUrl: string;
  onSubmit: (url: string) => void;
};

export function TweetInput({ initialUrl, onSubmit }: TweetInputProps) {
  const [url, setUrl] = useState(initialUrl);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim() && !isSubmitting) {
      setIsSubmitting(true);
      onSubmit(url);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 items-center" onClick={(e) => e.stopPropagation()}>
      <input
        id="tweet"
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://x.com/..."
        spellCheck={false}
        autoComplete="off"
        autoCapitalize="off"
        className="px-4 py-6 text-base border-2 border-dotted border-white/30 bg-black/50 text-white w-80 placeholder-white/50 cursor-text focus:outline-none focus:ring-2 focus:ring-white/40 focus:border-white/60"
      />
      <button
        type="submit"
        disabled={isSubmitting || !url.trim()}
        aria-label="Load tweet"
        className="w-80 py-6 bg-white/20 text-white border border-white/30 cursor-pointer transition-colors select-none focus:outline-none focus:ring-2 focus:ring-white/40 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/30"
      >
        Load Tweet
      </button>
    </form>
  );
}
