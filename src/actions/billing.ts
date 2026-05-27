"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export interface SubscriptionStatus {
  isPro: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
}

export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  const session = await auth();

  if (!session?.user?.id) {
    return { isPro: false, stripeCustomerId: null, stripeSubscriptionId: null };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { isPro: true, stripeCustomerId: true, stripeSubscriptionId: true },
  });

  if (!user) {
    return { isPro: false, stripeCustomerId: null, stripeSubscriptionId: null };
  }

  return {
    isPro: user.isPro,
    stripeCustomerId: user.stripeCustomerId,
    stripeSubscriptionId: user.stripeSubscriptionId,
  };
}
