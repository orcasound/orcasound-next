import { HydrophonesStack } from "@/components/CandidateList/HydrophonesStack";
import { HalfMapLayout } from "@/components/layouts/HalfMapLayout/HalfMapLayout";
import { MapWrapper } from "@/components/layouts/HalfMapLayout/MapWrapper";
import { MasterDataLayout } from "@/components/layouts/MasterDataLayout";

function HomePage() {
  return <MapWrapper />;
}

HomePage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <MasterDataLayout>
      <HalfMapLayout
        // leftSlot={<CandidatesStack />}
        rightSlot={<HydrophonesStack />}
      >
        {page}
      </HalfMapLayout>
    </MasterDataLayout>
  );
};

export default HomePage;
