
import { BarLoader } from "react-spinners";
import { Suspense } from "react";

export default function Layout({ children }) {
  return (
    <div className="px-5 py-6">
      <div className="flex items-center justify-between mb-6">
        {/* <h1 className="text-4xl md:text-5xl font-extrabold gradient-title tracking-tight">Industry Insights</h1> */}
      </div>
      <Suspense
        fallback={<BarLoader className="mt-4" width={"100%"} color="#4F46E5" />}
      >
        {children}
      </Suspense>
    </div>
  );
}