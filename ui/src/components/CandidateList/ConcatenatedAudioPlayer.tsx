"use client";

import { useEffect, useState } from "react";

import useConcatenatedAudio from "@/hooks/beta/useConcatenatedAudio"; // Adjust path

type Props = {
  feedId: string;
  startTime: string; // ISO string
  endTime: string; // ISO string
};

export default function ConcatenatedAudioPlayer({
  feedId,
  startTime,
  endTime,
}: Props) {
  const [showPlayer, setShowPlayer] = useState(false);

  const { audioBlob, isProcessing, error, totalDurationMs } =
    useConcatenatedAudio({
      feedId,
      startTime,
      endTime,
    });

  useEffect(() => {
    let url: string | null = null;
    if (audioBlob) {
      url = URL.createObjectURL(audioBlob);
    }
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [audioBlob]);

  // if (!showPlayer) {
  //   return (
  //     <button onClick={() => setShowPlayer(true)}>Fetch & Play Audio</button>
  //   );
  // }

  return (
    <div>
      {isProcessing && <p>Processing audio...</p>}
      {error && <p>Error: {error}</p>}
      {audioBlob && (
        <div>
          <audio controls src={URL.createObjectURL(audioBlob)}>
            Your browser does not support the audio element.
          </audio>
          <div>{totalDurationMs}</div>
          <a
            href={URL.createObjectURL(audioBlob)}
            download={`clip-${startTime}.mp3`}
            style={{ marginLeft: "1rem" }}
          >
            Download MP3
          </a>
        </div>
      )}
      {!audioBlob && !isProcessing && <p>No audio available.</p>}
    </div>
  );
}
