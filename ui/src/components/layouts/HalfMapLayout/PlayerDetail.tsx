import AudioAnalyzer from "@/components/Bouts/beta/AudioAnalyzer";
import { useData } from "@/context/DataContext";
import { useNowPlaying } from "@/context/NowPlayingContext";
import { useBout, useBouts } from "@/hooks/beta/useBouts";

export default function PlayerDetail() {
  const { nowPlayingCandidate } = useNowPlaying();

  // seeding with known bout from production
  const { feeds } = useData();
  const portTownsend =
    feeds.find((f) => f.name === "Port Townsend") ?? feeds[0];

  const { data } = useBouts({ feedId: portTownsend?.id });
  const bouts = data?.bouts?.results ?? [];
  const boutQueryResult = useBout({
    id: bouts[0]?.id || "",
    enabled: !!bouts[0]?.id,
  });
  const bout = boutQueryResult.data?.bout;

  return (
    <>
      {nowPlayingCandidate && (
        <AudioAnalyzer isNew={false} bout={bout} feed={portTownsend} />
      )}
    </>
  );
}
