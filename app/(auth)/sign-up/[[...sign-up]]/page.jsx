// ============================================================
// OLD CLERK SIGN-UP PAGE — Commented out. Use /register instead.
// ============================================================
// import { SignUp } from "@clerk/nextjs";
// const Page = () => { return <SignUp />; };
// export default Page;

// Redirect to new register page
import { redirect } from "next/navigation";
export default function OldSignUpPage() {
  redirect("/register");
}