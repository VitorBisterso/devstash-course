"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/actions/shared";

export interface SubscriptionStatus {
  isPro: boolean;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
}

export async function getSubscriptionStatus(): Promise<SubscriptionStatus> {
  const userId = await requireAuth();
  if (!userId) {
    return { isPro: false, stripeCustomerId: null, stripeSubscriptionId: null };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
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
