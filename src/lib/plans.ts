export const FREE_TIER = {
  maxItems: 50,
  maxCollections: 3,
} as const;

export const PRO_PRICES = {
  monthly: process.env.STRIPE_PRICE_ID_MONTHLY ?? "",
  yearly: process.env.STRIPE_PRICE_ID_YEARLY ?? "",
} as const;

export const PRO_FEATURES = [
  "Unlimited items",
  "Unlimited collections",
  "Priority support",
  "Advanced search",
] as const;
