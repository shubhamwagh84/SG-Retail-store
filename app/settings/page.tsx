"use client";
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

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 text-white">
      <h1 className="text-xl font-semibold">Settings</h1>
      <p className="text-sm text-slate-300">Configuration and integrations</p>

      <div className="mt-6 space-y-6">
        <section className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h2 className="text-base font-semibold">Authentication</h2>
          <p className="text-xs text-slate-300">Shared passcode access</p>
          <div className="mt-3 text-sm">
            <p>Set <span className="font-mono">PORTAL_PASSCODE</span> in <span className="font-mono">.env.local</span>.</p>
          </div>
        </section>

        <section className="bg-white/5 border border-white/10 rounded-xl p-5">
          <h2 className="text-base font-semibold">Database</h2>
          <p className="text-xs text-slate-300">Runs on MySQL (PlanetScale recommended)</p>
          <div className="mt-3 text-sm space-y-2 text-slate-200">
            <p>Required environment variables:</p>
            <ul className="list-disc ml-6 text-slate-200">
              <li>DB_HOST</li>
              <li>DB_PORT (default 3306)</li>
              <li>DB_USER</li>
              <li>DB_PASSWORD</li>
              <li>DB_NAME</li>
            </ul>
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