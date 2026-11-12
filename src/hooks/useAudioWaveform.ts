import { useEffect, useState } from "react";

/** Decode only expanded recordings; peaks and duration come from the saved audio. */
export function useAudioWaveform(blob: Blob, enabled: boolean) {
  const [waveform, setWaveform] = useState<{
    peaks: number[];
    duration: number;
  }>({ peaks: [], duration: 0 });
  useEffect(() => {
    if (!enabled || !blob.size || !window.AudioContext) return;
    let cancelled = false;
    const context = new AudioContext();
    void blob
      .arrayBuffer()
      .then((buffer) => context.decodeAudioData(buffer))
      .then((audio) => {
        if (cancelled) return;
        const samples = audio.getChannelData(0);
        const peaks = Array.from({ length: 48 }, (_, index) => {
          const start = Math.floor((index * samples.length) / 48);
          const end = Math.floor(((index + 1) * samples.length) / 48);
          let peak = 0;
          const stride = Math.max(1, Math.floor((end - start) / 512));
          for (let sample = start; sample < end; sample += stride)
            peak = Math.max(peak, Math.abs(samples[sample]));
          return peak;
        });
        const maximum = Math.max(...peaks, 0.001);
        setWaveform({
          peaks: peaks.map((peak) => peak / maximum),
          duration: audio.duration,
        });
      })
      .catch(() => {
        // A browser may play a codec it cannot decode for visualization.
        if (!cancelled) setWaveform({ peaks: [], duration: 0 });
      })
      .finally(() => {
        if (context.state !== "closed") void context.close().catch(() => {});
      });
    return () => {
      cancelled = true;
      if (context.state !== "closed") void context.close().catch(() => {});
    };
  }, [blob, enabled]);
  return waveform;
}
