import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Pause, Play, RotateCcw } from "lucide-react";
import { secondsRemaining } from "../wheel/model";
import "./TurnTimer.css";

export interface TurnTimerProps {
  drawToken: string | null;
}

interface Clock {
  deadline: number | null;
  remainingMs: number;
  completed: boolean;
}

const DEFAULT_DURATION = 3 * 60_000;
const PRESETS = [
  { label: "30s", name: "30 seconds", milliseconds: 30_000 },
  { label: "1m", name: "1 minute", milliseconds: 60_000 },
  { label: "3m", name: "3 minutes", milliseconds: 180_000 },
  { label: "5m", name: "5 minutes", milliseconds: 300_000 },
];
const RING_LENGTH = 2 * Math.PI * 62;

export function TurnTimer({ drawToken }: TurnTimerProps) {
  const id = useId();
  const [durationMs, setDurationMs] = useState(DEFAULT_DURATION);
  const [customMinutes, setCustomMinutes] = useState("3");
  const [customError, setCustomError] = useState("");
  const [autoStart, setAutoStart] = useState(true);
  const [clock, setClock] = useState<Clock>({
    deadline: null,
    remainingMs: DEFAULT_DURATION,
    completed: false,
  });
  // Restored history is not a new draw, including during Strict Mode's effect replay.
  const previousToken = useRef(drawToken);

  const resetTimer = useCallback(
    (start = false) => {
      setClock({
        // A wall-clock deadline also advances while the device is asleep.
        deadline: start ? Date.now() + durationMs : null,
        remainingMs: durationMs,
        completed: false,
      });
    },
    [durationMs],
  );

  useEffect(() => {
    if (previousToken.current === drawToken) return;
    previousToken.current = drawToken;
    if (drawToken === null) resetTimer();
    else if (autoStart) resetTimer(true);
  }, [drawToken, autoStart, resetTimer]);

  const deadline = clock.deadline;
  useEffect(() => {
    if (deadline === null) return;

    const reconcile = () => {
      const remainingMs = Math.max(0, deadline - Date.now());
      setClock((current) => {
        // Ignore an old callback after a reset, pause, or completed countdown.
        if (current.deadline !== deadline) return current;
        return {
          deadline: remainingMs === 0 ? null : deadline,
          remainingMs,
          completed: remainingMs === 0,
        };
      });
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") reconcile();
    };

    const interval = window.setInterval(reconcile, 200);
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", reconcile);
    window.addEventListener("pageshow", reconcile);
    reconcile();
    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", reconcile);
      window.removeEventListener("pageshow", reconcile);
    };
  }, [deadline]);

  function togglePlayback() {
    const now = Date.now();
    setClock((current) => {
      if (current.deadline !== null) {
        // Preserve the fractional second, rather than pausing the rounded display.
        const remainingMs = Math.max(0, current.deadline - now);
        return { deadline: null, remainingMs, completed: remainingMs === 0 };
      }
      const remainingMs =
        current.remainingMs > 0 ? current.remainingMs : durationMs;
      return { deadline: now + remainingMs, remainingMs, completed: false };
    });
  }

  function changeDuration(milliseconds: number) {
    setDurationMs(milliseconds);
    setCustomError("");
    setClock({ deadline: null, remainingMs: milliseconds, completed: false });
  }

  function applyCustomDuration(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const minutes = Number(customMinutes);
    if (
      customMinutes.trim() === "" ||
      !Number.isFinite(minutes) ||
      !Number.isInteger(minutes) ||
      minutes < 1 ||
      minutes > 60
    ) {
      setCustomError("Enter a whole number from 1 to 60.");
      return;
    }
    changeDuration(minutes * 60_000);
  }

  // The helper rounds only for display; the clock keeps exact milliseconds.
  const seconds = secondsRemaining(clock.remainingMs, 0);
  const time = `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0")}:${(seconds % 60).toString().padStart(2, "0")}`;
  const progress = Math.min(1, Math.max(0, clock.remainingMs / durationMs));
  const running = deadline !== null;
  const action = running
    ? "Pause"
    : clock.completed
      ? "Replay"
      : clock.remainingMs < durationMs
        ? "Resume"
        : "Start";
  const PlaybackIcon = running ? Pause : clock.completed ? RotateCcw : Play;

  return (
    <section
      className={`turn-timer${clock.completed ? " turn-timer--complete" : ""}`}
      aria-labelledby={`${id}-heading`}
    >
      <header className="turn-timer__header">
        <p className="turn-timer__eyebrow">TURN TIMER</p>
        <h2 id={`${id}-heading`} className="turn-timer__heading">
          Make a little time.
        </h2>
      </header>

      <div className="turn-timer__body">
        <div className="turn-timer__dial">
          <svg
            className="turn-timer__ring"
            viewBox="0 0 140 140"
            aria-hidden="true"
          >
            <circle className="turn-timer__track" cx="70" cy="70" r="62" />
            <circle
              className="turn-timer__progress"
              cx="70"
              cy="70"
              r="62"
              strokeDasharray={RING_LENGTH}
              strokeDashoffset={RING_LENGTH * (1 - progress)}
              transform="rotate(-90 70 70)"
            />
          </svg>
          <div className="turn-timer__dial-content">
            <span
              className="turn-timer__time"
              role="timer"
              aria-label="Time remaining"
              aria-live="off"
            >
              {time}
            </span>
            <span className="turn-timer__dial-label" aria-hidden="true">
              {clock.completed
                ? "ALL DONE"
                : running
                  ? "REMAINING"
                  : clock.remainingMs < durationMs
                    ? "PAUSED"
                    : "READY"}
            </span>
          </div>
        </div>

        <div className="turn-timer__controls">
          <div
            className="turn-timer__presets"
            role="group"
            aria-label="Timer duration"
          >
            {PRESETS.map((preset) => (
              <button
                key={preset.label}
                className="turn-timer__preset"
                type="button"
                aria-label={`Set timer to ${preset.name}`}
                aria-pressed={durationMs === preset.milliseconds}
                onClick={() => {
                  changeDuration(preset.milliseconds);
                  setCustomMinutes(
                    preset.milliseconds < 60_000
                      ? ""
                      : String(preset.milliseconds / 60_000),
                  );
                }}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <form
            className="turn-timer__custom"
            onSubmit={applyCustomDuration}
            noValidate
          >
            <label
              className="turn-timer__custom-label"
              htmlFor={`${id}-minutes`}
            >
              Custom minutes
            </label>
            <div className="turn-timer__custom-row">
              <input
                className="turn-timer__minutes"
                id={`${id}-minutes`}
                type="number"
                min="1"
                max="60"
                step="1"
                inputMode="numeric"
                placeholder="1–60"
                value={customMinutes}
                aria-invalid={Boolean(customError)}
                aria-describedby={customError ? `${id}-error` : undefined}
                onChange={(event) => {
                  setCustomMinutes(event.target.value);
                  setCustomError("");
                }}
              />
              <button
                className="turn-timer__apply"
                type="submit"
                aria-label="Apply custom timer duration"
              >
                Apply
              </button>
            </div>
            {customError && (
              <p className="turn-timer__error" id={`${id}-error`} role="status">
                {customError}
              </p>
            )}
          </form>

          <div className="turn-timer__actions">
            <button
              className="turn-timer__play"
              type="button"
              onClick={togglePlayback}
              aria-label={`${action} timer`}
            >
              <PlaybackIcon size={15} aria-hidden="true" />
              {action}
            </button>
            <button
              className="turn-timer__reset"
              type="button"
              onClick={() => resetTimer()}
              aria-label="Reset timer"
              title="Reset timer"
            >
              <RotateCcw size={17} aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>

      <p
        className="turn-timer__completion"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {clock.completed ? "Time’s up" : ""}
      </p>
      <div className="turn-timer__footer">
        <label className="turn-timer__auto-label" htmlFor={`${id}-auto`}>
          <input
            className="turn-timer__checkbox"
            id={`${id}-auto`}
            type="checkbox"
            checked={autoStart}
            onChange={(event) => setAutoStart(event.target.checked)}
            aria-describedby={`${id}-helper`}
          />
          Auto-start
        </label>
        <p className="turn-timer__helper" id={`${id}-helper`}>
          Start a fresh timer when someone is picked.
        </p>
      </div>
    </section>
  );
}
