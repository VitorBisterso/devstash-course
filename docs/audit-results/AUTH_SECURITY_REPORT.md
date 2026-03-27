# Authentication Security Audit Report

**Last Audit Date:** 2026-03-27  
**Scope:** NextAuth v5 - Custom auth endpoints (password, tokens, session)

---

## Critical Issues

### 1. No Rate Limiting on Auth Endpoints

**Files:**
- `src/app/api/auth/register/route.ts:7`
- `src/app/api/auth/forgot-password/route.ts:6`
- `src/app/api/auth/reset-password/route.ts:5`
- `src/app/api/auth/verify-email/route.ts:4`
- `src/app/api/auth/change-password/route.ts:5`
- `src/app/api/auth/delete-account/route.ts:5`

**Issue:** No rate limiting middleware protects any auth endpoint. This enables:
- Brute force attacks on registration
- Email enumeration via forgot-password
- Password reset token brute force
- Email verification token brute force

**Fix Recommendation:** Implement rate limiting using Upstash Redis or in-memory solution. Example:
```typescript
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "1h"),
});

export async function POST(request: Request) {
  const { success } = await ratelimit.limit(request.ip);
  if (!success) return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  // ...
}
```

---

### 2. Password Reset Token Expires in 24 Hours (Too Long)

**File:** `src/app/api/auth/forgot-password/route.ts:34`

**Issue:**
```typescript
const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
```
Password reset tokens should expire within 1 hour max. A 24-hour window gives attackers a large window to compromise tokens.

**Fix Recommendation:**
```typescript
const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
```

---

### 3. No Current Password Required for Change Password

**File:** `src/app/api/auth/change-password/route.ts:14`

**Issue:** Users can change their password without providing their current password. Any authenticated session can change the password without additional verification.

**Fix Recommendation:** Require current password verification:
```typescript
const { userId, currentPassword, newPassword } = body;

// Fetch user to verify current password
const user = await prisma.user.findUnique({ where: { id: userId } });
if (user?.password) {
  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) {
    return NextResponse.json({ error: "Current password is incorrect" }, { status: 401 });
  }
}
```

---

## Warning Issues

### 4. Weak Password Policy

**Files:**
- `src/app/api/auth/register/route.ts:26`
- `src/app/api/auth/change-password/route.ts:20`

**Issue:** Minimum 6 characters is insufficient. OWASP recommends:
- Minimum length of 8 characters
- Maximum length of 64 characters
- Complexity requirements (uppercase, lowercase, numbers, special characters)

**Fix Recommendation:**
```typescript
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
if (!passwordRegex.test(password)) {
  return NextResponse.json(
    { error: "Password must be at least 8 characters with uppercase, lowercase, number, and special character" },
    { status: 400 }
  );
}
```

---

### 5. No Account Deletion Confirmation

**File:** `src/app/api/auth/delete-account/route.ts`

**Issue:** Account deletion requires no confirmation and no re-authentication. Accidental clicks or session hijacking can permanently delete accounts.

**Fix Recommendation:** Implement a two-step deletion flow:
1. First request: Send deletion confirmation email with token
2. Second request: Validate token and delete account

Or require password re-authentication before deletion.

---

## Passed Checks

### Password Hashing
- **register/route.ts:44** - bcrypt.hash with 10 rounds
- **reset-password/route.ts:42** - bcrypt.hash with 10 rounds
- **lib/db/profile.ts:100** - bcrypt.hash with 10 rounds

### Email Verification Token
- **register/route.ts:55** - Uses crypto.randomBytes(32).toString("hex")
- **register/route.ts:56** - Expires in 24 hours (acceptable for email verification)
- **verify-email/route.ts:39** - Token deleted after use (single-use)

### Password Reset Token
- **forgot-password/route.ts:33** - Uses crypto.randomBytes(32).toString("hex")
- **forgot-password/route.ts:29-31** - Old tokens deleted before creating new one
- **reset-password/route.ts:49** - Token deleted after use (single-use)

### Session Validation
- **(dashboard)/profile/page.tsx:12-16** - Server-side auth() check with redirect

### Authorization Checks
- **change-password/route.ts:16** - Validates userId matches session
- **delete-account/route.ts:16** - Validates userId matches session

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 3 |
| Warning  | 2 |
| Passed   | 6 |

**Priority Actions:**
1. Add rate limiting immediately (critical for production)
2. Reduce password reset token expiration to 1 hour
3. Require current password for change-password endpoint
4. Strengthen password policy to 8+ characters with complexity
