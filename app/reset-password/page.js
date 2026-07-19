"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import PasswordInput from "@/app/components/PasswordInput";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }
      setDone(true);
      setTimeout(() => router.push("/login"), 1500);
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  }

  if (!token) {
    return <p className="font-body text-sm text-error">Missing or invalid reset token.</p>;
  }

  if (done) {
    return <p className="font-body text-sm text-body">Password updated. Redirecting to sign in...</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="mb-1.5 block font-body text-sm font-medium text-body-strong">New password</label>
        <PasswordInput required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="••••••••" />
      </div>

      <div>
        <label className="mb-1.5 block font-body text-sm font-medium text-body-strong">Confirm password</label>
        <PasswordInput required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" />
      </div>

      {error && <p className="font-body text-sm text-error">{error}</p>}

      <button
        type="submit"
        disabled={loading}
        className="mt-2 flex h-10 w-full items-center justify-center rounded-md bg-primary font-body text-sm font-medium text-on-primary hover:bg-primary-active disabled:opacity-60"
      >
        {loading ? "Updating..." : "Update password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-medium text-ink">Reset password</h1>
          <p className="mt-1 font-body text-sm text-muted">Choose a new password for your account</p>
        </div>

        <div className="rounded-lg border border-hairline bg-canvas p-8">
          <Suspense fallback={<p className="font-body text-sm text-muted">Loading...</p>}>
            <ResetPasswordForm />
          </Suspense>
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
