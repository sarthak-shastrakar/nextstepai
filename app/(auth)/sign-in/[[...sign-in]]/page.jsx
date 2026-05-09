// ============================================================
// OLD CLERK SIGN-IN PAGE — Commented out. Use /login instead.
// ============================================================
// import React from "react";
// import { SignIn } from "@clerk/nextjs";
// const Page = () => { return <SignIn />; };
// export default Page;

// Redirect to new login page
import { redirect } from "next/navigation";
export default function OldSignInPage() {
  redirect("/login");
}