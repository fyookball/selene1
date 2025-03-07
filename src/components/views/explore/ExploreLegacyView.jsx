import ExploreStatBlock from "@/apps/stats/ExploreStatBlock";
import GlobalAdoptionSummary from "@/apps/stats/GlobalAdoptionSummary";

export default function ExploreLegacyView() {
  return (
    <div className="p-2">
      <ExploreStatBlock />
      <GlobalAdoptionSummary />
    </div>
  );
}
