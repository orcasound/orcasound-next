import { useEffect, useRef, useState } from "react";

import { AudioFlowField } from "@/components/exp/AudioFlowField";
import { AudioFluidField } from "@/components/exp/AudioFluidField";
import { AudioStarsSwirl } from "@/components/exp/AudioStarsSwirl";
import { BeatPulseCircle } from "@/components/exp/BeatPulseCircle";
import { BeatRippleGrid } from "@/components/exp/BeatRippleGrid";
import { BeatWaveLines } from "@/components/exp/BeatWaveLines";
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
  { name: "Beat Pulse Circle", Component: BeatPulseCircle },
  { name: "Beat Wave Lines", Component: BeatWaveLines },
  { name: "Beat Ripple Grid", Component: BeatRippleGrid },
];

export default function MicPage() {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(
    "default",
  );
  const [visualizerSource, setVisualizerSource] = useState<
    "mic" | "midi" | "both"
  >("mic");
  const [selectedViz, setSelectedViz] = useState<string>("Oscilloscope");

  const [micAnalyser, setMicAnalyser] = useState<AnalyserNode | null>(null);
  const [midiAnalyser, setMidiAnalyser] = useState<AnalyserNode | null>(null);
  const [combinedAnalyser, setCombinedAnalyser] = useState<AnalyserNode | null>(
    null,
  );

  const audioContextRef = useRef<AudioContext | null>(null);
  const combinedGainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    const context = new AudioContext();
    const micAnalyser = context.createAnalyser();
    const midiAnalyser = context.createAnalyser();
    const combinedAnalyser = context.createAnalyser();
    const combinedGain = context.createGain();

    micAnalyser.fftSize = 2048;
    midiAnalyser.fftSize = 2048;
    combinedAnalyser.fftSize = 2048;
    combinedGain.gain.value = 1;

    combinedGain.connect(combinedAnalyser);
    audioContextRef.current = context;
    combinedGainRef.current = combinedGain;
    setMicAnalyser(micAnalyser);
    setMidiAnalyser(midiAnalyser);
    setCombinedAnalyser(combinedAnalyser);
  }, []);

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

  useEffect(() => {
    const setupMicStream = async () => {
      if (
        !selectedDeviceId ||
        !audioContextRef.current ||
        !micAnalyser ||
        !combinedGainRef.current
      )
        return;
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: selectedDeviceId },
      });
      const micSource = audioContextRef.current.createMediaStreamSource(stream);
      micSource.connect(micAnalyser);
      micSource.connect(combinedGainRef.current);
    };
    setupMicStream().catch(console.error);
  }, [selectedDeviceId, micAnalyser]);

  useEffect(() => {
    const setupMIDI = async () => {
      try {
        const midiAccess = await navigator.requestMIDIAccess();
        for (const input of midiAccess.inputs.values()) {
          input.onmidimessage = handleMIDIMessage;
        }
      } catch (err) {
        console.error("Failed to access MIDI devices:", err);
      }
    };

    const handleMIDIMessage = (message: WebMidi.MIDIMessageEvent) => {
      const [status, note, velocity] = message.data;
      const isNoteOn = status === 144 && velocity > 0;
      if (isNoteOn) playMIDINote(note, velocity);
    };

    const playMIDINote = (note: number, velocity: number) => {
      if (!audioContextRef.current || !midiAnalyser || !combinedGainRef.current)
        return;
      const frequency = 440 * Math.pow(2, (note - 69) / 12);
      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();
      gainNode.gain.value = velocity / 127;
      oscillator.frequency.value = frequency;
      oscillator.type = "sawtooth";
      oscillator.connect(gainNode);
      gainNode.connect(midiAnalyser);
      gainNode.connect(combinedGainRef.current);
      gainNode.connect(audioContextRef.current.destination);
      oscillator.start();
      oscillator.stop(audioContextRef.current.currentTime + 1);
    };

    setupMIDI();
  }, [midiAnalyser]);

  const SelectedComponent = visualizations.find(
    (v) => v.name === selectedViz,
  )?.Component;
  const activeAnalyser =
    visualizerSource === "mic"
      ? micAnalyser
      : visualizerSource === "midi"
        ? midiAnalyser
        : combinedAnalyser;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <div
        className="header"
        style={{ position: "absolute", top: 10, left: 10, zIndex: 10 }}
      >
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

        <select
          onChange={(e) =>
            setVisualizerSource(e.target.value as "mic" | "midi" | "both")
          }
          value={visualizerSource}
        >
          <option value="mic">Mic</option>
          <option value="midi">MIDI</option>
          <option value="both">Both</option>
        </select>
      </div>

      <div
        className="body"
        style={{ flex: 1, display: "flex", flexDirection: "column" }}
      >
        {activeAnalyser && SelectedComponent && (
          <SelectedComponent analyser={activeAnalyser} />
        )}
      </div>
    </div>
  );
}
