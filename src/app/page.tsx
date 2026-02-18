"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Home() {
  const [tweetUrl, setTweetUrl] = useState("");
  const router = useRouter();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tweetUrl.trim()) {
      router.push(`/tweet?url=${encodeURIComponent(tweetUrl)}`);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <label htmlFor="tweet" className="text-white text-lg">
          Insert Tweet
        </label>
        <input
          id="tweet"
          type="text"
          value={tweetUrl}
          onChange={(e) => setTweetUrl(e.target.value)}
          placeholder="https://x.com/..."
          className="px-4 py-2 rounded border border-gray-600 bg-gray-900 text-white w-80"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Submit
        </button>
      </form>
    </div>
  );
}
