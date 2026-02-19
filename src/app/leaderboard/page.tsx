"use client";

import { useEffect, useState } from "react";
import { supabase, type LeaderboardEntry } from "@/lib/supabase";
import { Tweet } from "react-tweet";

function LeaderboardCard({
  entry,
  rank,
}: {
  entry: LeaderboardEntry;
  rank: number;
}) {
  return (
    <div className="relative">
      {/* Rank badge */}
      <div className="absolute -left-3 -top-3 w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white font-bold text-sm z-10">
        {rank}
      </div>

      {/* Tweet embed */}
      <div className="rounded-xl overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10">
        <div className="[&_*]:!text-left [&>div]:!m-0 [&_article]:!m-0 [&_article]:!rounded-none [&>div>div]:!m-0" data-theme="light">
          <Tweet id={entry.tweet_id} />
        </div>

        {/* Footer with stats and rage button */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-white/10">
          <div className="text-white/60 text-sm">
            <span className="text-red-400 font-bold">{entry.destruction_count}</span>
            {" "}
            {entry.destruction_count === 1 ? "rage" : "rages"}
          </div>

          <a
            href={`/tweet?url=${encodeURIComponent(entry.tweet_url || `https://x.com/i/status/${entry.tweet_id}`)}`}
            className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-white font-medium transition-colors text-sm"
          >
            Rage
          </a>
        </div>
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const { data, error } = await supabase
          .from("destroyed_tweets")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Group by tweet_id and count destructions
        const grouped: Record<string, LeaderboardEntry> = {};

        for (const tweet of data || []) {
          if (!grouped[tweet.tweet_id]) {
            grouped[tweet.tweet_id] = {
              tweet_id: tweet.tweet_id,
              tweet_url: tweet.tweet_url,
              tweet_content: tweet.tweet_content,
              tweet_author_username: tweet.tweet_author_username,
              tweet_author_display_name: tweet.tweet_author_display_name,
              tweet_author_avatar_url: tweet.tweet_author_avatar_url,
              destruction_count: 0,
              last_destroyed_at: tweet.created_at,
              weapons_used: [],
            };
          }
          grouped[tweet.tweet_id].destruction_count++;
          if (
            tweet.weapon_id &&
            !grouped[tweet.tweet_id].weapons_used.includes(tweet.weapon_id)
          ) {
            grouped[tweet.tweet_id].weapons_used.push(tweet.weapon_id);
          }
          if (
            new Date(tweet.created_at) >
            new Date(grouped[tweet.tweet_id].last_destroyed_at)
          ) {
            grouped[tweet.tweet_id].last_destroyed_at = tweet.created_at;
          }
        }

        const sorted = Object.values(grouped).sort(
          (a, b) => b.destruction_count - a.destruction_count
        );

        setEntries(sorted);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
        setError("Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    }

    fetchLeaderboard();
  }, []);

  return (
    <div
      className="min-h-screen bg-cover bg-center bg-no-repeat bg-fixed"
      style={{ backgroundImage: "url('/bg.jpg')" }}
    >
      {/* Navigation */}
      <nav className="w-full px-6 pt-8 pb-4 flex justify-center items-center">
        <a href="/" className="hover:opacity-80">
          <img src="/x.png" alt="xrageroom" className="h-24" />
        </a>
      </nav>

      {/* Main content */}
      <div className="max-w-lg mx-auto px-4 pt-8 pb-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Leaderboard
          </h1>
          <p className="text-white/60">
            The tweets that have faced the most destruction
          </p>
        </div>

        {/* Leaderboard list */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-white/60 text-lg">Loading...</div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-red-400 text-lg">{error}</div>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-white/60 text-lg mb-4">
              No tweets have been destroyed yet
            </div>
            <a
              href="/tweet"
              className="inline-block px-6 py-3 bg-red-600 hover:bg-red-500 rounded-lg text-white font-medium transition-colors"
            >
              Be the first to rage
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {entries.map((entry, index) => (
              <LeaderboardCard
                key={entry.tweet_id}
                entry={entry}
                rank={index + 1}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
