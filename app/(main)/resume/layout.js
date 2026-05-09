import { BarLoader } from "react-spinners";
import { Suspense } from "react";
import ReduxProvider from "@/components/ReduxProvider";

export default function Layout({ children }) {
  return (
    <ReduxProvider>
      <div className="px-5 py-6">
        <Suspense
          fallback={<BarLoader className="mt-4" width={"100%"} color="#4F46E5" />}
        >
          {children}
        </Suspense>
      </div>
    </ReduxProvider>
  );
}