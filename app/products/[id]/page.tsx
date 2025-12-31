import { Product } from "@/lib/types";
import Link from "next/link";

async function fetchProduct(id: string): Promise<Product | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/products/${id}`, { cache: "no-store" });
    if (!res.ok) return null;
    const data: Product = await res.json();
    return data;
  } catch {
    return null;
  }
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await fetchProduct(id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900">
      <header className="border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto max-w-5xl px-6 py-5 flex items-center justify-between">
          <div>
            <h1 className="text-base font-semibold text-slate-900">Product Details</h1>
            <p className="text-xs text-slate-500">All info for this item</p>
          </div>
          <Link href="/" className="text-sm text-amber-700 hover:underline">← Back to dashboard</Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-8">
        {!product ? (
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <p className="text-slate-700">Product not found.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-lg bg-slate-100 border border-slate-300 overflow-hidden">
                  {product.photoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={product.photoUrl} alt={product.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full grid place-items-center text-slate-400">IMG</div>
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">{product.name}</h2>
                  <p className="text-xs text-slate-500">Updated {new Date(product.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Product Name" value={product.name} />
                <Field label="Size/Pattern" value={product.variant || "-"} />
                <Field label="Product Type" value={product.productType || "-"} />
                <Field label="Type" value={product.category} />
                <Field label="Actual stock in shop" value={String(product.stock)} />
                <Field label="Cost Price" value={`₹${(product.costPrice / 100).toFixed(2)}`} />
                <Field label="Selling Price" value={`₹${(product.price / 100).toFixed(2)}`} />
                <Field label="Reorder Status" value={product.reorderStatus || deriveReorder(product)} />
                <Field label="Stock Always Needed" value={product.stockAlwaysNeeded ? "Yes" : product.stockAlwaysNeeded === false ? "No" : "-"} />
                <Field label="Notes" value={product.notes || "-"} />
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <h3 className="text-base font-semibold text-slate-900">Actions</h3>
              <div className="space-y-2">
                <Link href={`/api/products/${product.id}`} className="inline-block w-full text-center rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-800 hover:bg-slate-100">View raw JSON</Link>
                <Link href={`/`} className="inline-block w-full text-center rounded-md bg-amber-500 text-white px-3 py-2 text-sm font-semibold hover:bg-amber-600">Back</Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-slate-200 rounded-lg p-4">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}

function deriveReorder(product: Product): string {
  const limit = 5;
  if (product.stock <= limit) return "low";
  return "ok";
}
