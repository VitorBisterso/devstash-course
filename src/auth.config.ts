import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import type { NextAuthConfig } from "next-auth";

/**
 * Edge-compatible auth configuration.
 * Contains only providers - no adapter or database dependencies.
 * Used by proxy.ts for route protection in edge environments.
 */
export default {
  providers: [
    GitHub,
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: () => null,
    }),
  ],
} satisfies NextAuthConfig;
