import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { getFromR2 } from "@/lib/r2";

function extractKey(fileUrlOrKey: string): string | null {
  const publicUrl = process.env.R2_PUBLIC_URL;
  if (!publicUrl) return null;
  
  if (fileUrlOrKey.includes(publicUrl)) {
    return fileUrlOrKey.replace(`${publicUrl}/`, "");
  }
  
  return fileUrlOrKey;
}

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const keyOrUrl = searchParams.get("key");

  if (!keyOrUrl) {
    return new NextResponse("Key is required", { status: 400 });
  }

  const key = extractKey(keyOrUrl);
  if (!key) {
    return new NextResponse("Invalid key", { status: 400 });
  }

  if (!key.startsWith(`${session.user.id}/`)) {
    return new NextResponse("Invalid key", { status: 400 });
  }

  try {
    const stream = await getFromR2(key);

    if (!stream) {
      return new NextResponse("File not found", { status: 404 });
    }

    const ext = key.split(".").pop()?.toLowerCase();
    const contentType = getContentType(ext || "");

    return new NextResponse(stream as unknown as BodyInit, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `attachment; filename="${key.split("/").pop()}"`,
      },
    });
  } catch (error) {
    console.error("Failed to download file:", error);
    return new NextResponse("Failed to download file", { status: 500 });
  }
}

function getContentType(ext: string): string {
  const map: Record<string, string> = {
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    webp: "image/webp",
    svg: "image/svg+xml",
    pdf: "application/pdf",
    txt: "text/plain",
    md: "text/markdown",
    json: "application/json",
    yaml: "application/x-yaml",
    yml: "application/x-yaml",
    xml: "application/xml",
    csv: "text/csv",
    toml: "application/toml",
    ini: "text/plain",
  };
  return map[ext] || "application/octet-stream";
}