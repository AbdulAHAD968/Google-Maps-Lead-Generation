"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
      } else {
        setSent(true);
      }
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-medium text-ink">Forgot password</h1>
          <p className="mt-1 font-body text-sm text-muted">We&apos;ll email you a reset link</p>
        </div>

        <div className="rounded-lg border border-hairline bg-canvas p-8">
          {sent ? (
            <p className="font-body text-sm text-body">
              If an admin account exists for that email, a reset link has been sent.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
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

              {error && <p className="font-body text-sm text-error">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex h-10 w-full items-center justify-center rounded-md bg-primary font-body text-sm font-medium text-on-primary hover:bg-primary-active disabled:opacity-60"
              >
                {loading ? "Sending..." : "Send reset link"}
              </button>
            </form>
          )}

          <Link
            href="/login"
            className="mt-4 block text-center font-body text-sm text-primary hover:underline"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
