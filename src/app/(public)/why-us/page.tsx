import {
  AccessExperienceSection,
  FamilySupportSection,
  ReasonsTimelineSection,
  SupportCommitmentSection,
  WhyHeroSection,
} from "@/components/sections/why";
import ColorTransition from "@/components/ui/ColorTransition";

export default function WhyUsPage() {
  return (
    <main>
      <WhyHeroSection />
      <ColorTransition fromColor="accent" toColor="background" />
      <ReasonsTimelineSection />
      <ColorTransition fromColor="background" toColor="muted" />
      <AccessExperienceSection />
      <ColorTransition fromColor="muted" toColor="accent" />
      <FamilySupportSection />
      <ColorTransition fromColor="accent" toColor="background" />
      <SupportCommitmentSection />
    </main>
  );
}
