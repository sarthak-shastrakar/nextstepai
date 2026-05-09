// app/api/auth/post-login/route.js
// Smart redirect after Google OAuth:
//   - Existing user (profileCompleted: true)  → /  (homepage/landing)
//   - New user (profileCompleted: false)       → /complete-profile

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return redirect("/login");
  }

  await dbConnect();
  const user = await User.findById(session.user.id, { profileCompleted: 1, industry: 1 }).lean();

  // New user or incomplete profile → go fill it in
  if (!user || !user.profileCompleted || !user.industry) {
    return redirect("/complete-profile");
  }

  // Existing, complete user → go to homepage
  return redirect("/");
}
