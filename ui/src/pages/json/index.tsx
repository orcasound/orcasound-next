import { MasterDataLayout } from "@/components/layouts/MasterDataLayout";
import { useData } from "@/context/DataContext";
import { useDetectionsQuery } from "@/graphql/generated";
import { useAIDetections } from "@/hooks/beta/useAIDetections";
import { useMasterData } from "@/hooks/beta/useMasterData";

function JsonPage() {
  const seedDetections = useDetectionsQuery().data?.detections?.results ?? [];
  //   const liveDetections = useLiveDetections().data ?? []; // this errors
  const dataset = useMasterData(false); // true pulls from API, false uses seed data
  const { filteredData } = useData();

  const {
    returnData: AIData,
    unreviewed,
    confirmed,
    unknown,
    falsepositives,
    fetchMeta,
    isPending,
    isFetching,
    error,
  } = useAIDetections();

  return (
    <>
      <pre>All AI detections: {AIData?.length}</pre>
      <pre>Pending: {String(isPending)}</pre>
      <pre>Fetching: {String(isFetching)}</pre>
      <pre>Error: {error instanceof Error ? error.message : "none"}</pre>
      <pre>Partial: {String(fetchMeta?.partial ?? false)}</pre>
      <pre>Failed page: {fetchMeta?.failedPage ?? "none"}</pre>
      <pre>Load error: {fetchMeta?.loadError ?? "none"}</pre>
      <pre>
        Requested range: {fetchMeta?.requestedStart ?? "unknown"} -{" "}
        {fetchMeta?.requestedEnd ?? "unknown"}
      </pre>
      <pre>
        Fetched range: {fetchMeta?.fetchedOldest ?? "none"} -{" "}
        {fetchMeta?.fetchedNewest ?? "none"}
      </pre>
      <pre>Unreviewed: {unreviewed?.length}</pre>
      <pre>Confirmed: {confirmed?.length}</pre>
      <pre>False positives: {falsepositives?.length}</pre>
      <pre>Unknown: {unknown?.length}</pre>
      <pre>{JSON.stringify(AIData, null, 2)}</pre>
      {/* <pre>{JSON.stringify(seedDetections, null, 2)}</pre> */}
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
