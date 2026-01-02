"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authenticate } from "./actions";
import { Shield, UtensilsCrossed } from "lucide-react";

const initialState = { error: "" };

export default function LoginPage() {
  const router = useRouter();
  const [state, formAction] = useActionState(authenticate, initialState);

  useEffect(() => {
    if ((state as any).success) {
      router.push("/");
    }
  }, [state, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white border border-slate-300 rounded-2xl p-8 shadow-lg">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center">
            <UtensilsCrossed className="h-6 w-6 text-amber-700" />
          </div>
          <div>
            <p className="text-sm text-slate-600">SG Retail store (Target: 1 Cr+)</p>
              <h1 className="text-xl font-semibold text-slate-900">Sign in</h1>
          </div>
        </div>
        <form action={formAction} className="space-y-4">
          <label className="block">
            <span className="text-sm text-slate-700 font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" /> Shared passcode
            </span>
            <input
              name="passcode"
              type="password"
              className="mt-2 w-full rounded-lg border border-slate-300 bg-slate-50 text-slate-900 px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Enter passcode"
              required
            />
          </label>
          {state?.error ? (
            <p className="text-sm text-rose-700 bg-rose-100 border border-rose-300 rounded-lg px-3 py-2">
              {state.error}
            </p>
          ) : null}
          <button
            type="submit"
            className="w-full rounded-lg bg-amber-500 text-white font-semibold py-3 hover:bg-amber-600 transition"
          >
            Enter dashboard
          </button>
          <p className="text-xs text-slate-500 text-center">
            Set a strong passcode in PORTAL_PASSCODE before sharing access.
          </p>
        </form>
      </div>
    </div>
  );
}
