import { SignJWT, jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "super-secret-key-for-dev-only-change-me";
const secret = new TextEncoder().encode(JWT_SECRET);

export const AUTH_COOKIE = "leadgen_token";

export async function signToken({ userId, role, email, name }) {
  return new SignJWT({ userId, role, email, name })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(process.env.JWT_EXPIRE || "7d")
    .sign(secret);
}

export async function verifyToken(token) {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export function authCookieOptions() {
  const days = Number(process.env.JWT_COOKIE_EXPIRE || 7);
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * days,
  };
}
