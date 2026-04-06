import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getItemById, deleteItem } from "@/lib/db/items";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(request: Request, { params }: RouteParams) {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id: itemId } = await params;
  const item = await getItemById(session.user.id, itemId);

  if (!item) {
    return new NextResponse("Not Found", { status: 404 });
  }

  return NextResponse.json(item);
}

export async function DELETE(request: Request, { params }: RouteParams) {
  const session = await auth();

  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { id: itemId } = await params;
  const deleted = await deleteItem(session.user.id, itemId);

  if (!deleted) {
    return new NextResponse("Not Found", { status: 404 });
  }

  return new NextResponse(null, { status: 204 });
}
