import AnimatedHeadline from "./AnimatedHeadline";
import ShoppingCartIcon from "../ShoppingListForm/ShoppingCartIcon";
import LandingContent from "./LandingContent";
import GetStartedButton from "./GetStartedButton";

const headlines = [
  "Save More. Shop Smarter.",
  "Plan Your Grocery Route.",
  "Maximize Your Savings.",
  "Fast, Cheap, & Easy Shopping.",
];

const description =
  "ShopLyft helps you plan the cheapest and fastest grocery run across Woolworths, Coles, and ALDI. Get an optimal route, basket, and savings—all in one click.";

interface DesktopLandingViewProps {
  onGetStarted: () => void;
}

function DesktopLandingView({ onGetStarted }: DesktopLandingViewProps) {
  return (
    <>
      {/* Desktop: wording first, icon second */}
      <div className="hidden md:flex w-full md:w-1/2 flex-col justify-center items-start text-left pl-10">
        <AnimatedHeadline
          headlines={headlines}
          className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl whitespace-nowrap overflow-hidden text-ellipsis"
          textAlign="left"
        />
        <LandingContent description={description} textAlign="left" />
        <GetStartedButton onClick={onGetStarted} variant="desktop" />
      </div>
      <ShoppingCartIcon size="lg" className="hidden md:flex" />
    </>
  );
}

export default DesktopLandingView;
