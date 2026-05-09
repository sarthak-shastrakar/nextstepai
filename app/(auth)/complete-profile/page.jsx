import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import dbConnect from "@/lib/mongoose";
import User from "@/models/User";
import { industries } from "@/data/industries";
import CompleteProfileForm from "./_components/CompleteProfileForm";

export const metadata = { title: "Complete Your Profile — NextStep AI" };

export default async function CompleteProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  await dbConnect();
  const user = await User.findById(session.user.id).lean();
  if (!user) redirect("/login");

  // If profile is fully complete (has industry), go to homepage
  if (user.profileCompleted && user.industry) redirect("/");

  const prefill = {
    name: user.name || "",
    username: user.username || "",
    phone: user.phone || "",
    bio: user.bio || "",
    profilePicture: user.profilePicture || user.image || "",
    industry: user.industry || "",
    subIndustry: user.subIndustry || "",
    experience: user.experience || "",
    skills: user.skills || [],
  };

  return <CompleteProfileForm prefill={prefill} industries={industries} />;
}
