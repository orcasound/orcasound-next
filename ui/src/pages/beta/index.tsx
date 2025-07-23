import { CandidatesStack } from "@/components/CandidateList/CandidatesStack";
import { HydrophonesStack } from "@/components/CandidateList/HydrophonesStack";
import { HalfMapLayout } from "@/components/layouts/HalfMapLayout/HalfMapLayout";
import { MasterDataLayout } from "@/components/layouts/MasterDataLayout";

function HomePage() {
  return null;
}

HomePage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <MasterDataLayout>
      <HalfMapLayout
        leftSlot={<CandidatesStack />}
        rightSlot={<HydrophonesStack />}
      >
        {page}
      </HalfMapLayout>
    </MasterDataLayout>
  );
};

export default HomePage;
