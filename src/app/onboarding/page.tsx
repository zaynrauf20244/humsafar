import { redirect } from "next/navigation";

/** Legacy route — role choice is now on home. */
export default function OnboardingRedirect() {
  redirect("/");
}
