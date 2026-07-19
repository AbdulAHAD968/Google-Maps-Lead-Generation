"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PasswordInput from "@/app/components/PasswordInput";

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }
      router.push("/leads");
      router.refresh();
    } catch {
      setError("Something went wrong");
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="font-display text-3xl font-medium text-ink">Set a new password</h1>
          <p className="mt-1 font-body text-sm text-muted">
            You&apos;re using a temporary password. Choose a new one to continue.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 rounded-lg border border-hairline bg-canvas p-8"
        >
          <div>
            <label className="mb-1.5 block font-body text-sm font-medium text-body-strong">Temporary password</label>
            <PasswordInput required value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          </div>

          <div>
            <label className="mb-1.5 block font-body text-sm font-medium text-body-strong">New password</label>
            <PasswordInput required value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>

          <div>
            <label className="mb-1.5 block font-body text-sm font-medium text-body-strong">Confirm new password</label>
            <PasswordInput required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>

          {error && <p className="font-body text-sm text-error">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 flex h-10 w-full items-center justify-center rounded-md bg-primary font-body text-sm font-medium text-on-primary hover:bg-primary-active disabled:opacity-60"
          >
            {loading ? "Updating..." : "Update password & continue"}
          </button>
        </form>
      </div>
    </main>
  );
}
