import { useEffect } from "react";

import { HalfMapLayout } from "@/components/layouts/HalfMapLayout/HalfMapLayout";
import { MasterDataLayout } from "@/components/layouts/MasterDataLayout";
import { useData } from "@/context/DataContext";
import { useLayout } from "@/context/LayoutContext";

function HomePage() {
  const { setPlaybarExpanded } = useLayout();
  const { setFilters } = useData();

  useEffect(() => {
    setPlaybarExpanded(false);
  }, [setPlaybarExpanded]);

  useEffect(() => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      hydrophone: "All hydrophones",
    }));
  }, [setFilters]);

  return <></>;
}

HomePage.getLayout = function getLayout(page: React.ReactElement) {
  return (
    <MasterDataLayout>
      <HalfMapLayout>{page}</HalfMapLayout>
    </MasterDataLayout>
  );
};

export default HomePage;
