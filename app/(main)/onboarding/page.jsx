import { redirect } from "next/navigation";

// /onboarding is now superseded by /complete-profile
// This redirect keeps any old links working
export default function OnboardingPage() {
  redirect("/complete-profile");
}
