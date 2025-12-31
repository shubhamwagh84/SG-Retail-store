import { loadPortalData } from "@/lib/data";
import { Dashboard } from "@/components/dashboard";

export default async function Home() {
  const { products, sales, config } = await loadPortalData();

  return <Dashboard initialProducts={products} initialSales={sales} config={config} />;
}
