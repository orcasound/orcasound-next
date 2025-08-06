import { CandidatesStack } from "@/components/CandidateList/CandidatesStack";
import { getHalfMapLayout } from "@/components/layouts/HalfMapLayout/HalfMapLayout";
import type { NextPageWithLayout } from "@/pages/_app";

const BetaPage: NextPageWithLayout = () => {
  return <CandidatesStack />;
};

BetaPage.getLayout = getHalfMapLayout;

export default BetaPage;
