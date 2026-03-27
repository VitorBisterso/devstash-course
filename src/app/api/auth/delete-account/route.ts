import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { deleteUserAccount } from "@/lib/db/profile";

export async function POST(request: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { userId } = body;

    if (session.user.id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await deleteUserAccount(userId);

    return NextResponse.json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("Delete account error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
