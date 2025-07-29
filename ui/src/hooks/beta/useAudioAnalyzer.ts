import { useEffect, useRef } from "react";

import { getAudioContext } from "@/components/PlayBar/audioContextSingleton";

export function useAudioAnalyser(audioElement: HTMLMediaElement | null) {
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaElementRef = useRef<HTMLMediaElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const FFT_SIZE = 2048 * 2;

  useEffect(() => {
    if (!audioElement) {
      mediaElementRef.current = null;
      return;
    }

    const audioCtx = getAudioContext();
    audioContextRef.current = audioCtx;

    if (!sourceRef.current || mediaElementRef.current !== audioElement) {
      if (sourceRef.current) {
        try {
          sourceRef.current.disconnect();
        } catch {}
      }

      sourceRef.current = audioCtx.createMediaElementSource(audioElement);
      mediaElementRef.current = audioElement;
    }

    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = FFT_SIZE;
    analyser.smoothingTimeConstant = 0.8;

    sourceRef.current.connect(analyser);
    analyser.connect(audioCtx.destination);

    analyserRef.current = analyser;

    return () => {
      if (analyserRef.current) {
        try {
          analyserRef.current.disconnect();
        } catch {}
        analyserRef.current = null;
      }
    };
  }, [audioElement, FFT_SIZE]);

  const getCurrentTime = (): number => {
    return audioContextRef.current?.currentTime ?? 0;
  };

  const getWaveformData = (): Uint8Array | null => {
    const analyser = analyserRef.current;
    if (!analyser) return null;

    const data = new Uint8Array(analyser.fftSize);
    analyser.getByteTimeDomainData(data);
    return data;
  };

  const getFrequencyData = (): Uint8Array | null => {
    const analyser = analyserRef.current;
    if (!analyser) return null;

    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    return data;
  };

  return {
    analyser: analyserRef.current,
    getWaveformData,
    getFrequencyData,
    getCurrentTime,
    fftSize: FFT_SIZE,
  };
}
