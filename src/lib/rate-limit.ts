import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  reset: number;
}

export function getIPFromHeaders(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }
  return "unknown";
}

export function createRateLimiter(
  limit: number,
  windowSeconds: number,
  prefix: string
): Ratelimit {
  return new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, `${windowSeconds}s`),
    prefix,
  });
}

export async function checkRateLimit(
  ratelimit: Ratelimit,
  key: string
): Promise<RateLimitResult> {
  try {
    const result = await ratelimit.limit(key);
    return {
      success: result.success,
      remaining: result.remaining,
      reset: result.reset,
    };
  } catch (error) {
    console.error("Rate limit error:", error);
    return {
      success: true,
      remaining: -1,
      reset: -1,
    };
  }
}

export const authRatelimits = {
  login: {
    ratelimit: createRateLimiter(5, 15 * 60, "ratelimit:login"),
    keyType: "ip-email" as const,
  },
  register: {
    ratelimit: createRateLimiter(3, 60 * 60, "ratelimit:register"),
    keyType: "ip" as const,
  },
  forgotPassword: {
    ratelimit: createRateLimiter(3, 60 * 60, "ratelimit:forgot-password"),
    keyType: "ip" as const,
  },
  resetPassword: {
    ratelimit: createRateLimiter(5, 15 * 60, "ratelimit:reset-password"),
    keyType: "ip" as const,
  },
  resendVerification: {
    ratelimit: createRateLimiter(3, 15 * 60, "ratelimit:resend-verification"),
    keyType: "ip-email" as const,
  },
};

export const uploadRatelimit = {
  ratelimit: createRateLimiter(20, 60, "ratelimit:upload"),
  keyType: "user-id" as const,
};
