import { TwitterApi, ApiResponseError } from "twitter-api-v2";
import * as dotenv from "dotenv";
import * as fs from "fs";
import * as path from "path";

dotenv.config({ path: ".env.local" });

// State file for persistence
const STATE_FILE = path.join(__dirname, "state.json");

type BotState = {
  lastSeenId?: string;
};

// Load state from file
function loadState(): BotState {
  try {
    if (fs.existsSync(STATE_FILE)) {
      const data = fs.readFileSync(STATE_FILE, "utf-8");
      return JSON.parse(data);
    }
  } catch (err) {
    console.error("Failed to load state, starting fresh:", err);
  }
  return {};
}

// Save state to file
function saveState(state: BotState): void {
  try {
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
  } catch (err) {
    console.error("Failed to save state:", err);
  }
}

// Retry with exponential backoff
async function withRetry<T>(
  fn: () => Promise<T>,
  options: { maxRetries?: number; baseDelay?: number; operation?: string } = {}
): Promise<T> {
  const { maxRetries = 3, baseDelay = 1000, operation = "operation" } = options;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const isLastAttempt = attempt === maxRetries;

      // Handle Twitter API rate limits
      if (err instanceof ApiResponseError && err.rateLimitError) {
        const resetTime = err.rateLimit?.reset;
        if (resetTime && !isLastAttempt) {
          const waitMs = (resetTime * 1000 - Date.now()) + 1000; // Add 1s buffer
          console.log(`Rate limited. Waiting ${Math.ceil(waitMs / 1000)}s until reset...`);
          await sleep(Math.max(waitMs, 1000));
          continue;
        }
      }

      // Handle retryable errors (network issues, 5xx errors)
      const isRetryable =
        err instanceof ApiResponseError
          ? err.code >= 500 || err.code === 429
          : (err as NodeJS.ErrnoException).code === "ECONNRESET" ||
            (err as NodeJS.ErrnoException).code === "ETIMEDOUT";

      if (isRetryable && !isLastAttempt) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`${operation} failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms...`);
        await sleep(delay);
        continue;
      }

      throw err;
    }
  }

  throw new Error(`${operation} failed after ${maxRetries + 1} attempts`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const client = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY!,
  appSecret: process.env.TWITTER_API_SECRET!,
  accessToken: process.env.TWITTER_ACCESS_TOKEN!,
  accessSecret: process.env.TWITTER_ACCESS_SECRET!,
});

const RAGEROOM_URL = process.env.RAGEROOM_URL || "https://yourdomain.com";
const BOT_USERNAME = process.env.BOT_USERNAME || "rageroombot";
const POLL_INTERVAL = 15000; // 15 seconds

// Load persisted state
let state = loadState();

async function checkMentions() {
  try {
    const me = await withRetry(() => client.v2.me(), { operation: "get user info" });
    const userId = me.data.id;

    const mentions = await withRetry(
      () =>
        client.v2.userMentionTimeline(userId, {
          since_id: state.lastSeenId,
          expansions: ["referenced_tweets.id", "author_id"],
          "tweet.fields": ["conversation_id", "in_reply_to_user_id"],
        }),
      { operation: "fetch mentions" }
    );

    if (!mentions.data?.data) {
      return;
    }

    for (const mention of mentions.data.data.reverse()) {
      console.log(`Processing mention: ${mention.id}`);

      // Update last seen ID and persist immediately
      if (!state.lastSeenId || mention.id > state.lastSeenId) {
        state.lastSeenId = mention.id;
        saveState(state);
      }

      // Find the tweet they're replying to (the one to rage at)
      const referencedTweet = mention.referenced_tweets?.find(
        (ref) => ref.type === "replied_to"
      );

      let targetTweetId: string;

      if (referencedTweet) {
        // Bot was tagged in a reply - use the parent tweet
        targetTweetId = referencedTweet.id;
      } else {
        // Bot was tagged directly on a tweet - use that tweet's conversation
        targetTweetId = mention.conversation_id || mention.id;
      }

      // Get the target tweet details to build the URL
      try {
        const targetTweet = await withRetry(
          () =>
            client.v2.singleTweet(targetTweetId, {
              expansions: ["author_id"],
              "user.fields": ["username"],
            }),
          { operation: `fetch tweet ${targetTweetId}` }
        );

        const authorUsername =
          targetTweet.includes?.users?.[0]?.username || "user";
        const tweetUrl = `https://x.com/${authorUsername}/status/${targetTweetId}`;
        const rageroomLink = `${RAGEROOM_URL}/x?url=${encodeURIComponent(tweetUrl)}`;

        // Reply to the mention with the rageroom link
        await withRetry(
          () => client.v2.reply(`Let it all out here: ${rageroomLink}`, mention.id),
          { operation: `reply to ${mention.id}` }
        );

        console.log(`Replied to ${mention.id} with link: ${rageroomLink}`);
      } catch (err) {
        // Log but continue processing other mentions
        if (err instanceof ApiResponseError) {
          console.error(`Twitter API error for tweet ${targetTweetId}: ${err.code} - ${err.message}`);
          // If it's a "tweet not found" or similar, skip it
          if (err.code === 404 || err.code === 403) {
            console.log(`Skipping unavailable tweet ${targetTweetId}`);
            continue;
          }
        }
        console.error(`Failed to process tweet ${targetTweetId}:`, err);
      }
    }
  } catch (error) {
    if (error instanceof ApiResponseError) {
      console.error(`Twitter API error: ${error.code} - ${error.message}`);
      if (error.rateLimitError && error.rateLimit?.reset) {
        const resetDate = new Date(error.rateLimit.reset * 1000);
        console.error(`Rate limit resets at: ${resetDate.toISOString()}`);
      }
    } else {
      console.error("Error checking mentions:", error);
    }
  }
}

async function main() {
  console.log(`Starting @${BOT_USERNAME} bot...`);
  console.log(`Rageroom URL: ${RAGEROOM_URL}`);
  console.log(`Polling every ${POLL_INTERVAL / 1000} seconds`);

  if (state.lastSeenId) {
    console.log(`Resuming from last seen ID: ${state.lastSeenId}`);
  } else {
    console.log("Starting fresh (no previous state)");
  }

  // Initial check
  await checkMentions();

  // Poll for new mentions
  setInterval(checkMentions, POLL_INTERVAL);
}

main().catch(console.error);
