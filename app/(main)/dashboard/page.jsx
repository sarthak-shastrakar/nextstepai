import { getIndustryInsights } from "@/actions/industryInsight";
import DashboardView from "./_components/dashboard-view";

export const metadata = { title: "Industry Insights — CareerForge AI" };

export default async function DashboardPage() {
  let insights = null;
  let error = null;
  try {
    insights = await getIndustryInsights();
  } catch (err) {
    error = err.message;
    console.warn("[dashboard] Could not load insights:", err.message);
  }

  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      <DashboardView insights={insights} error={error} />
    </div>
  );
}
