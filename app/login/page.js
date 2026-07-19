"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import SpikeMark from "@/app/components/SpikeMark";
import PasswordInput from "@/app/components/PasswordInput";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      if (data.mustChangePassword) {
        router.push("/change-password");
      } else {
        router.push("/leads");
      }
      router.refresh();
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-hairline">
            <SpikeMark />
          </div>
          <h1 className="font-display text-3xl font-medium text-ink">Lead Generation</h1>
          <p className="mt-1 font-body text-sm text-muted">Admin sign-in only</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-lg border border-hairline bg-canvas p-8"
        >
          <div>
            <label className="mb-1.5 block font-body text-sm font-medium text-body-strong">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-10 w-full rounded-md border border-hairline bg-canvas px-3 font-body text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
              placeholder="you@sevenlabs.site"
            />
          </div>

          <div>
            <label className="mb-1.5 block font-body text-sm font-medium text-body-strong">Password</label>
            <PasswordInput
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && <p className="font-body text-sm text-error">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex h-10 w-full items-center justify-center rounded-md bg-primary font-body text-sm font-medium text-on-primary hover:bg-primary-active disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>

          <Link
            href="/forgot-password"
            className="text-center font-body text-sm text-primary hover:underline"
          >
            Forgot your password?
          </Link>
        </form>
      </div>
    </main>
  );
}
