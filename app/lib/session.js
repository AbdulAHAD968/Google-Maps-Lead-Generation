import { cookies } from "next/headers";
import { verifyToken, AUTH_COOKIE } from "@/app/lib/auth";

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE)?.value;
  if (!token) return null;
  return verifyToken(token);
}
