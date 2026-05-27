import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return new NextResponse("Missing stripe-signature header", { status: 400 });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return new NextResponse("STRIPE_WEBHOOK_SECRET is not configured", { status: 500 });
    }

    let event: ReturnType<typeof stripe.webhooks.constructEvent>;
    try {
      event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    } catch {
      return new NextResponse("Invalid signature", { status: 400 });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        if (userId && session.customer) {
          await prisma.user.update({
            where: { id: userId },
            data: {
              isPro: true,
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string | null,
            },
          });
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;

        const isActive =
          subscription.status === "active" ||
          subscription.status === "trialing" ||
          subscription.status === "past_due";

        await prisma.user.update({
          where: { stripeCustomerId: customerId },
          data: {
            isPro: isActive,
            stripeSubscriptionId: isActive ? subscription.id : null,
          },
        });
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook handler error:", error);
    return new NextResponse("Internal server error", { status: 500 });
  }
}
