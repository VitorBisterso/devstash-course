import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendVerificationEmail } from "@/lib/email";
import { getIPFromHeaders, authRatelimits, checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  if (process.env.SKIP_EMAIL_VERIFICATION === "true") {
    return NextResponse.json(
      { error: "Email verification is disabled" },
      { status: 403 }
    );
  }

  try {
    const ip = getIPFromHeaders(request.headers);
    const body = await request.json();
    const { email } = body;
    
    const { ratelimit, keyType } = authRatelimits.resendVerification;
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

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    if (user.emailVerified) {
      return NextResponse.json(
        { message: "Email already verified" },
        { status: 200 }
      );
    }

    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    const verificationToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: verificationToken,
        expires,
      },
    });

    await sendVerificationEmail(email, verificationToken);

    return NextResponse.json(
      { message: "Verification email sent" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Resend verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
