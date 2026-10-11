// app/api/auth/post-login/route.js
// Smart redirect after Google OAuth:
//   - Existing user (profileCompleted: true)  → /  (homepage/landing)
//   - New user (profileCompleted: false)       → /complete-profile

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export async function GET(req) {
  const session = await auth();

  if (!session?.user?.id) {
    return redirect("/login");
  }

  const { searchParams } = new URL(req.url);
  const source = searchParams.get("source");

  await dbConnect();
  const user = await User.findById(session.user.id).lean();

  if (!user) {
    return redirect("/login");
  }

  if (source === "mobile") {
    // Generate JWT token for the mobile app
    const token = jwt.sign(
      { id: user._id.toString(), email: user.email },
      process.env.NEXTAUTH_SECRET,
      { expiresIn: "30d" }
    );

    const userData = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      image: user.profilePicture || user.image,
      industry: user.industry,
      subIndustry: user.subIndustry,
      experience: user.experience,
      skills: user.skills,
      profileCompleted: user.profileCompleted,
      isVerified: user.isVerified,
    };

    // Redirect to mobile app with token and user info
    return redirect(
      `nextstep-mobile://(auth)/login?token=${token}&user=${encodeURIComponent(
        JSON.stringify(userData)
      )}`
    );
  }

  // New user or incomplete profile → go fill it in
  if (!user.profileCompleted || !user.industry) {
    return redirect("/complete-profile");
  }

  // Existing, complete user → go to homepage
  return redirect("/");
}

