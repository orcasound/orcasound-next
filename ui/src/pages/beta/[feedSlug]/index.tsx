import { Theme, useMediaQuery } from "@mui/material";
import { useRouter } from "next/router";
import { ReactNode, useEffect } from "react";

import { HalfMapLayout } from "@/components/layouts/HalfMapLayout/HalfMapLayout";
import { MasterDataLayout } from "@/components/layouts/MasterDataLayout";
import AudioVisualizer from "@/components/PlayBar/AudioVisualizer";
import { useData } from "@/context/DataContext";
import { useLayout } from "@/context/LayoutContext";
import { standardizeFeedName } from "@/utils/masterDataHelpers";

function HydrophonePage() {
  const mdDown = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));

  const { setPlaybarExpanded, setDrawerContent, setDrawerSide } = useLayout();
  const { feeds, setFilters } = useData();
  const router = useRouter();
  const feed = feeds.find((f) => f.slug === router.query.feedSlug);

  useEffect(() => {
    setDrawerSide("right");
    setDrawerContent(<AudioVisualizer />);
  }, [setDrawerContent, setDrawerSide]);

  // useEffect(() => {
  //   setPlaybarExpanded(false);
  // }, [setPlaybarExpanded]);

  useEffect(() => {
    if (!feed || mdDown) return;
    const name = standardizeFeedName(feed.name);
    console.log("feed.name", feed.name);
    setFilters((prevFilters) => ({
      ...prevFilters,
      hydrophone: name,
    }));
  }, [mdDown, feed, setFilters]);

  return <></>;
}

HydrophonePage.getLayout = function getLayout(page: ReactNode) {
  return (
    <MasterDataLayout>
      <HalfMapLayout>{page}</HalfMapLayout>
    </MasterDataLayout>
  );
};

export default HydrophonePage;
