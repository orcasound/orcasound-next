import { MasterDataLayout } from "@/components/layouts/MasterDataLayout";
import { useData } from "@/context/DataContext";
import { useDetectionsQuery } from "@/graphql/generated";
import { useMasterData } from "@/hooks/beta/useMasterData";

function JsonPage() {
  const seedDetections = useDetectionsQuery().data?.detections?.results ?? [];
  //   const liveDetections = useLiveDetections().data ?? []; // this errors
  const dataset = useMasterData(false); // true pulls from API, false uses seed data
  const { filteredData } = useData();

  return (
    <>
      <pre>{JSON.stringify(seedDetections, null, 2)}</pre>
      {/* <pre>{JSON.stringify(liveDetections, null, 2)}</pre> */}
      {/* <pre>{JSON.stringify(dataset.combined, null, 2)}</pre> */}
      {/* <pre>{JSON.stringify(filteredData, null, 2)}</pre> */}
    </>
  );
}

JsonPage.getLayout = function getLayout(page: React.ReactElement) {
  return <MasterDataLayout>{page}</MasterDataLayout>;
};

export default JsonPage;
