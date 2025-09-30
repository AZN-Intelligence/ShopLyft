import MobileLandingView from "./MobileLandingView";
import DesktopLandingView from "./DesktopLandingView";

function LandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <section className="min-h-screen flex-1 flex flex-col md:flex-row items-center justify-center px-2 md:px-16 py-8 md:py-12 gap-8 md:gap-24">
      <MobileLandingView onGetStarted={onGetStarted} />
      <DesktopLandingView onGetStarted={onGetStarted} />
    </section>
  );
}

export default LandingPage;
