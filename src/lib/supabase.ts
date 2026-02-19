import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://arjcysvpezzqksztczgk.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFyamN5c3ZwZXp6cWtzenRjemdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0MjM5MDMsImV4cCI6MjA4Njk5OTkwM30.nXAWn85t6uwf0NGDTkI6erBb7LO8Zrl1DABSbDivnEk";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type DestroyedTweet = {
  id: string;
  tweet_id: string;
  tweet_url: string | null;
  weapon_id: string;
  destroyed_by_user_id: string | null;
  gif_url: string | null;
  created_at: string;
};

export type LeaderboardEntry = {
  tweet_id: string;
  tweet_url: string | null;
  tweet_content?: string | null;
  tweet_author_username?: string | null;
  tweet_author_display_name?: string | null;
  tweet_author_avatar_url?: string | null;
  destruction_count: number;
  last_destroyed_at: string;
  weapons_used: string[];
};

export async function saveDestroyedTweet(
  tweetId: string,
  tweetUrl: string,
  weaponId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from("destroyed_tweets").insert({
      tweet_id: tweetId,
      tweet_url: tweetUrl,
      weapon_id: weaponId,
    });

    if (error) {
      console.error("Error saving destroyed tweet:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error("Error saving destroyed tweet:", err);
    return { success: false, error: "Unknown error" };
  }
}
