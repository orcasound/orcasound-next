import { HalfMapLayout } from "@/components/layouts/HalfMapLayout/HalfMapLayout";
import { MasterDataLayout } from "@/components/layouts/MasterDataLayout";

import HomePage from "./beta";

export default function HomePageRedirect() {
  return <HomePage />;
}

HomePageRedirect.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <MasterDataLayout>
      <HalfMapLayout>{page}</HalfMapLayout>
    </MasterDataLayout>
  );
};
