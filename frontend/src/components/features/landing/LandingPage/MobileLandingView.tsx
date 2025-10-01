import CardContainer from "../../../shared/layout/CardContainer";
import AnimatedHeadline from "./AnimatedHeadline";
import ShoppingCartIcon from "../../shopping/ShoppingCartIcon";
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

interface MobileLandingViewProps {
  onGetStarted: () => void;
}

function MobileLandingView({ onGetStarted }: MobileLandingViewProps) {
  return (
    <div className="block md:hidden w-full flex flex-col items-center gap-8">
      <ShoppingCartIcon size="md" />
      <div className="w-full flex flex-col justify-center items-center text-center">
        <CardContainer variant="mobile" maxWidth="md">
          <AnimatedHeadline
            headlines={headlines}
            className="text-2xl sm:text-3xl whitespace-wrap"
            textAlign="center"
          />
          <LandingContent
            description={description}
            textAlign="center"
            className="max-x-xl"
          />
          <GetStartedButton onClick={onGetStarted} variant="mobile" />
        </CardContainer>
      </div>
    </div>
  );
}

export default MobileLandingView;
