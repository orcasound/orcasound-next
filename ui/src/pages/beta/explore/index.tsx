import { useEffect } from "react";

import { getHalfMapLayout } from "@/components/layouts/HalfMapLayout/HalfMapLayout";
import { useData } from "@/context/DataContext";
import type { NextPageWithLayout } from "@/pages/_app";
import { allTime } from "@/utils/masterDataHelpers";

const ExplorePage: NextPageWithLayout = () => {
  const { setFilters } = useData();
  useEffect(() => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      timeRange: allTime,
    }));
  }, [setFilters]);
  console.log("loading /explore");

  return <></>;
};

ExplorePage.getLayout = getHalfMapLayout;

export default ExplorePage;
