import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { uploadToR2 } from "@/lib/r2";
import { v4 as uuidv4 } from "uuid";
import { checkRateLimit, uploadRatelimit } from "@/lib/rate-limit";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const ALLOWED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "text/plain",
  "text/markdown",
  "application/json",
  "application/x-yaml",
  "text/yaml",
  "application/xml",
  "text/xml",
  "text/csv",
  "application/toml",
];

function getFileExtension(mimeType: string): string {
  const mimeMap: Record<string, string> = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/svg+xml": ".svg",
    "application/pdf": ".pdf",
    "text/plain": ".txt",
    "text/markdown": ".md",
    "application/json": ".json",
    "application/x-yaml": ".yaml",
    "text/yaml": ".yaml",
    "application/xml": ".xml",
    "text/xml": ".xml",
    "text/csv": ".csv",
    "application/toml": ".toml",
  };
  return mimeMap[mimeType] || ".txt";
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const rateLimitResult = await checkRateLimit(
    uploadRatelimit.ratelimit,
    session.user.id
  );

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Too many uploads. Please try again later." },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil((rateLimitResult.reset - Date.now()) / 1000)) },
      }
    );
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  const type = formData.get("type") as string | null;

  if (!file) {
    return new NextResponse("File is required", { status: 400 });
  }

  if (!type) {
    return new NextResponse("Type is required", { status: 400 });
  }

  const isImageType = type.toLowerCase() === "image";
  const maxSize = isImageType ? MAX_IMAGE_SIZE : MAX_FILE_SIZE;
  const allowedTypes = isImageType ? ALLOWED_IMAGE_TYPES : ALLOWED_FILE_TYPES;

  if (file.size > maxSize) {
    return new NextResponse(
      `File too large. Maximum size is ${maxSize / 1024 / 1024}MB`,
      { status: 400 }
    );
  }

  const fileType = file.type.toLowerCase();
  if (!allowedTypes.includes(fileType)) {
    return new NextResponse("File type not allowed", { status: 400 });
  }

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const ext = getFileExtension(fileType);
  const key = `${session.user.id}/${uuidv4()}${ext}`;

  try {
    const url = await uploadToR2(key, buffer, fileType);

    return NextResponse.json({
      url,
      fileName: file.name,
      fileSize: file.size,
      contentType: fileType,
    });
  } catch (error) {
    console.error("Failed to upload file:", error);
    return new NextResponse("Failed to upload file", { status: 500 });
  }
}