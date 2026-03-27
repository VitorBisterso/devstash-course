import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getIPFromHeaders, authRatelimits, checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  try {
    const ip = getIPFromHeaders(request.headers);
    
    const { ratelimit } = authRatelimits.resetPassword;
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
    const { token, password } = body;

    if (!token || !password) {
      return NextResponse.json(
        { error: "Token and new password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Invalid token" },
        { status: 400 }
      );
    }

    if (verificationToken.expires < new Date()) {
      return NextResponse.json(
        { error: "Token has expired" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { email: verificationToken.identifier },
      data: { password: hashedPassword },
    });

    await prisma.verificationToken.delete({
      where: { token },
    });

    return NextResponse.json({
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
