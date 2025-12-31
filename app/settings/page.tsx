"use client";
import clsx from "clsx";
import { isSheetsConfigured } from "@/lib/sheets";
import { useState } from "react";

export default function SettingsPage() {
  const [seeding, setSeeding] = useState(false);
  const [seedResult, setSeedResult] = useState<any>(null);

  const handleSeedProducts = async () => {
    setSeeding(true);
    setSeedResult(null);
    try {
      const res = await fetch("/api/products/seed", { method: "POST" });
      const data = await res.json();
      setSeedResult(data);
    } catch (error) {
      setSeedResult({ error: String(error) });
    } finally {
      setSeeding(false);
    }
  };
  const sheetsReady = isSheetsConfigured();
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID || "";

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 text-white">
      <h1 className="text-xl font-semibold">Settings</h1>
      <p className="text-sm text-slate-300">Configuration and integrations</p>

      <div className="mt-6 space-y-6">
        <section className="bg-white/5 border border-white/10 rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Google Sheets</h2>
              <p className="text-xs text-slate-300">Live data sync to your spreadsheet</p>
            </div>
            <span className={clsx("px-3 py-1 rounded-full border text-xs", sheetsReady ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-100" : "border-amber-400/50 bg-amber-400/10 text-amber-50")}>{sheetsReady ? "Ready" : "Not configured"}</span>
          </div>
          <div className="mt-4 text-sm space-y-2">
            <p className="text-slate-200">Spreadsheet ID:</p>
            <code className="block bg-black/40 border border-white/10 rounded-md px-3 py-2 text-slate-200 break-words">{spreadsheetId || "(not set)"}</code>
            <div className="mt-3 text-slate-300">
              <p className="mb-2">Required environment variables (in .env.local):</p>
              <ul className="list-disc ml-6">
                <li>GOOGLE_SERVICE_ACCOUNT_EMAIL</li>
                <li>GOOGLE_PRIVATE_KEY</li>
                <li>GOOGLE_SHEETS_SPREADSHEET_ID</li>
              </ul>
            </div>
            <div className="mt-3 text-slate-300">
              <p className="mb-2">Sheet tabs and columns:</p>
              <p>Products: A-G → id, name, category, price, stock, photoUrl, updatedAt</p>
              <p>Sales: A-G → id, productId, qty, amount, soldAt, note, user</p>
            </div>
          </div>
        </section>

        <section className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h2 className="text-base font-semibold">Authentication</h2>
          <p className="text-xs text-slate-300">Shared passcode access</p>
          <div className="mt-3 text-sm">
            <p>Set <span className="font-mono">PORTAL_PASSCODE</span> in <span className="font-mono">.env.local</span>.</p>
          </div>
        </section>

        <section className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h2 className="text-base font-semibold">Database Seeding</h2>
          <p className="text-xs text-slate-300">Populate MySQL with sample product data</p>
          <div className="mt-3 text-sm space-y-3">
            <p>This will insert all 270 products from sample data into your MySQL database.</p>
            <button
              onClick={handleSeedProducts}
              disabled={seeding}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:opacity-50 text-white rounded-md text-sm font-medium"
            >
              {seeding ? "Seeding..." : "Seed Products"}
            </button>
            {seedResult && (
              <div className="mt-3 p-3 bg-black/40 border border-white/10 rounded-md text-xs">
                <pre className="text-slate-200">{JSON.stringify(seedResult, null, 2)}</pre>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}