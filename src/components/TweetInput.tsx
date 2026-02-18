"use client";

import { useState } from "react";

type TweetInputProps = {
  initialUrl: string;
  onSubmit: (url: string) => void;
};

export function TweetInput({ initialUrl, onSubmit }: TweetInputProps) {
  const [url, setUrl] = useState(initialUrl);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      onSubmit(url);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 items-center" onClick={(e) => e.stopPropagation()}>
      <label htmlFor="tweet" className="text-white text-lg font-medium drop-shadow-lg">
        Insert Tweet URL
      </label>
      <input
        id="tweet"
        type="text"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="https://x.com/..."
        className="px-4 py-3 rounded-lg border border-white/30 bg-black/50 text-white w-80 placeholder-white/50 cursor-text focus:outline-none focus:border-white/60"
      />
      <button
        type="submit"
        className="px-6 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg border border-white/30 cursor-pointer transition-colors"
      >
        Load Tweet
      </button>
    </form>
  );
}
