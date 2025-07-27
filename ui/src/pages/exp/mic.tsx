import { useEffect, useRef, useState } from "react";

import { AudioFlowField } from "@/components/exp/AudioFlowField";
import { AudioFluidField } from "@/components/exp/AudioFluidField";
import { AudioStarsSwirl } from "@/components/exp/AudioStarsSwirl";
import { BurstParticles } from "@/components/exp/BurstParticles";
import { GlowingEqualizer } from "@/components/exp/GlowingEqualizer";
import { OrbitingParticles } from "@/components/exp/OrbitingParticles";
import { Oscilloscope } from "@/components/exp/Oscilloscope";
import { RadialBars } from "@/components/exp/RadialBars";
import { RotatingRings } from "@/components/exp/RotatingRings";
import { ScrollingSpectrogram } from "@/components/exp/ScrollingSpectrogram";
import { Spectroscope } from "@/components/exp/Spectroscope";
import { WavefieldParticles } from "@/components/exp/WavefieldParticles";

const visualizations = [
  { name: "Glowing Equalizer", Component: GlowingEqualizer },
  { name: "Rotating Rings", Component: RotatingRings },
  { name: "Radial Bars", Component: RadialBars },
  { name: "Scrolling Spectrogram", Component: ScrollingSpectrogram },
  { name: "Oscilloscope", Component: Oscilloscope },
  { name: "Spectroscope", Component: Spectroscope },
  { name: "Burst Particles", Component: BurstParticles },
  { name: "Orbiting Particles", Component: OrbitingParticles },
  { name: "Wavefield Particles", Component: WavefieldParticles },
  { name: "Audio Flow Field", Component: AudioFlowField },
  { name: "Audio Fluid Field", Component: AudioFluidField },
  { name: "Audio Stars Swirl", Component: AudioStarsSwirl },
];

export default function MicPage() {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(
    "default",
  );
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null);
  const [selectedViz, setSelectedViz] = useState<string>("Oscilloscope");
  const audioContextRef = useRef<AudioContext | null>(null);

  // Get devices
  useEffect(() => {
    const getDevices = async () => {
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs = allDevices.filter((d) => d.kind === "audioinput");
      setDevices(audioInputs);
    };

    getDevices();
    navigator.mediaDevices.addEventListener("devicechange", getDevices);
    return () =>
      navigator.mediaDevices.removeEventListener("devicechange", getDevices);
  }, []);

  // Create AudioContext on mount
  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
  }, []);

  // When selectedDeviceId changes, create analyser
  useEffect(() => {
    const setupStream = async () => {
      if (!selectedDeviceId || !audioContextRef.current) return;

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: selectedDeviceId },
      });

      const source = audioContextRef.current.createMediaStreamSource(stream);
      const analyserNode = audioContextRef.current.createAnalyser();
      analyserNode.fftSize = 2048;
      source.connect(analyserNode);
      setAnalyser(analyserNode);
    };

    setupStream().catch(console.error);
  }, [selectedDeviceId]);

  const SelectedComponent = visualizations.find(
    (v) => v.name === selectedViz,
  )?.Component;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div className="header">
        <h1 style={{ marginTop: 0 }}>Mic Input Visualizer</h1>

        <select
          onChange={(e) => setSelectedDeviceId(e.target.value)}
          value={selectedDeviceId || ""}
        >
          <option value="" disabled>
            Select a microphone
          </option>
          {devices.map((device, index) => (
            <option key={device.deviceId + `-${index}`} value={device.deviceId}>
              {device.label || `Mic ${device.deviceId.slice(0, 5)}`}
            </option>
          ))}
        </select>

        <select
          onChange={(e) => setSelectedViz(e.target.value)}
          value={selectedViz}
        >
          {visualizations.map((viz) => (
            <option key={viz.name} value={viz.name}>
              {viz.name}
            </option>
          ))}
        </select>
      </div>

      <div
        className="body"
        style={{ flex: 1, display: "flex", flexDirection: "column" }}
      >
        {analyser && SelectedComponent && (
          <SelectedComponent analyser={analyser} />
        )}
      </div>
    </div>
  );
}
