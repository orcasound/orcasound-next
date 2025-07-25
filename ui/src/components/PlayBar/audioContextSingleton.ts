/**
 * Returns a shared AudioContext instance for use across the app.
 *
 * Browsers limit the number of AudioContexts that can exist simultaneously,
 * and creating multiple instances is resource-intensive. This singleton
 * ensures we reuse a single AudioContext.
 *
 * Note: This does NOT prevent the error thrown when trying to run useAudioAnalyser
 * multiple times on the same media source, which will connect multiple MediaElementSourceNodes.
 * That must be handled separately — run useAudioAnalyzer only once per media element (e.g. <audio>, <video>, <video-js>),
 * and pass the analyser node or processed data to other components as needed.
 */

interface WindowWithWebkitAudioContext extends Window {
  webkitAudioContext?: typeof AudioContext;
}

let audioCtxInstance: AudioContext | null = null;

export function getAudioContext(): AudioContext {
  if (audioCtxInstance) {
    return audioCtxInstance;
  }

  if (typeof window === "undefined") {
    throw new Error("AudioContext is not available on server side");
  }

  const AudioContextClass =
    window.AudioContext ||
    (window as WindowWithWebkitAudioContext).webkitAudioContext;

  if (!AudioContextClass) {
    throw new Error("Web Audio API is not supported in this browser");
  }

  audioCtxInstance = new AudioContextClass();
  return audioCtxInstance;
}
