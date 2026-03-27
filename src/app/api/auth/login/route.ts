import { NextResponse } from "next/server";
import { signIn } from "@/auth";
import { getIPFromHeaders, authRatelimits, checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  const ip = getIPFromHeaders(request.headers);
  const body = await request.json();
  const { email } = body;

  if (!email) {
    return NextResponse.json(
      { error: "Email is required" },
      { status: 400 }
    );
  }

  const { ratelimit, keyType } = authRatelimits.login;
  const key = keyType === "ip-email" && email ? `${ip}:${email}` : ip;

  const rateLimitResult = await checkRateLimit(ratelimit, key);

  if (!rateLimitResult.success) {
    const retryAfterSeconds = Math.max(0, Math.ceil((rateLimitResult.reset - Date.now()) / 1000));
    const retryAfterMinutes = Math.max(1, Math.ceil(retryAfterSeconds / 60));
    return NextResponse.json(
      { error: `Too many attempts. Please try again in ${retryAfterMinutes} minute${retryAfterMinutes > 1 ? "s" : ""}.` },
      { 
        status: 429,
        headers: { "Retry-After": String(retryAfterSeconds) }
      }
    );
  }

  try {
    const result = await signIn("credentials", {
      email,
      password: body.password,
      redirect: false,
    });

    if (result?.error) {
      if (result.error === "CredentialsSignin") {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { error: "Please verify your email before signing in. Check your inbox for the verification link." },
        { status: 401 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error("Login error:", error);
    const err = error as { kind?: string; code?: string };
    if (err.kind === "signIn" || err.code === "credentials") {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
