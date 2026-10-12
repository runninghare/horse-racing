import { useCallback, useEffect, useRef } from "react";

/** Small synthesized cues; no sound files, autoplay, or background audio. */
export function useWheelSound(enabled: boolean) {
  const context = useRef<AudioContext | null>(null);
  const enabledRef = useRef(enabled);
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);
  useEffect(
    () => () => {
      if (context.current) void context.current.close().catch(() => undefined);
      context.current = null;
    },
    [],
  );

  const unlock = useCallback(() => {
    try {
      context.current ??= new AudioContext();
      if (context.current.state === "suspended")
        void context.current.resume().catch(() => undefined);
    } catch {
      // Audio is optional: blocked/unsupported audio must never block a draw.
    }
  }, []);

  const tone = useCallback(
    (frequency: number, duration: number, offset = 0, volume = 0.035) => {
      const ctx = context.current;
      if (!enabledRef.current || !ctx || ctx.state !== "running") return;
      const oscillator = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = ctx.currentTime + offset;
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(frequency, start);
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(volume, start + 0.005);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
      oscillator.connect(gain);
      gain.connect(ctx.destination);
      oscillator.start(start);
      oscillator.stop(start + duration + 0.01);
      oscillator.onended = () => {
        oscillator.disconnect();
        gain.disconnect();
      };
    },
    [],
  );

  const tick = useCallback(() => tone(880, 0.045, 0, 0.018), [tone]);
  const celebrate = useCallback(() => {
    [523.25, 659.25, 783.99, 1046.5].forEach((note, index) =>
      tone(note, 0.3, index * 0.11),
    );
  }, [tone]);
  return { unlock, tick, celebrate };
}
