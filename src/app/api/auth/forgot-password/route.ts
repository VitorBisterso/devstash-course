import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";
import { getIPFromHeaders, authRatelimits, checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = getIPFromHeaders(request.headers);
    
    const { ratelimit } = authRatelimits.forgotPassword;
    const rateLimitResult = await checkRateLimit(ratelimit, ip);
    
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

    const body = await request.json();
    const { email } = body;

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
        { message: "If the email exists, a reset link has been sent" },
        { status: 200 }
      );
    }

    await prisma.verificationToken.deleteMany({
      where: { identifier: email },
    });

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await prisma.verificationToken.create({
      data: {
        identifier: email,
        token: resetToken,
        expires,
      },
    });

    await sendPasswordResetEmail(email, resetToken);

    return NextResponse.json(
      { message: "If the email exists, a reset link has been sent" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
