import { BarLoader } from "react-spinners";
import { Suspense } from "react";

export default function Layout({ children }) {
  return (
    <div className="px-5 py-6">
      <Suspense
        fallback={<BarLoader className="mt-4" width={"100%"} color="#4F46E5" />}
      >
        {children}
      </Suspense>
    </div>
  );
}
