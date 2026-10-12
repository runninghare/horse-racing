export type RaceStatus =
  | "ready"
  | "countdown"
  | "racing"
  | "paused"
  | "finished";

export interface RaceState {
  status: RaceStatus;
  /** Race time in seconds, excluding the countdown. */
  elapsed: number;
  countdown: number;
  runners: {
    id: number;
    progress: number;
    finishTime: number | null;
    /** Mean speed in normalized laps per second. */
    speed: number;
    phase: number;
  }[];
}

type Runner = RaceState["runners"][number];

const TAU = Math.PI * 2;
const SPEED_VARIATION = 0.12;

export function createRace(
  count: number,
  random: () => number = Math.random,
): RaceState {
  const size = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
  const sample = () => {
    const value = random();
    return Number.isFinite(value) ? Math.max(0, Math.min(1, value)) : 0.5;
  };

  return {
    status: "ready",
    elapsed: 0,
    countdown: 0,
    runners: Array.from({ length: size }, (_, id) => ({
      id,
      progress: 0,
      finishTime: null,
      speed: 1 / (35 + 8 * sample()),
      phase: TAU * sample(),
    })),
  };
}

/** Start (or restart) with the same runners and speed profiles. */
export function startRace(state: RaceState): RaceState {
  return {
    ...state,
    status: "countdown",
    elapsed: 0,
    countdown: 3,
    runners: state.runners.map((runner) => ({
      ...runner,
      progress: 0,
      finishTime: null,
    })),
  };
}

export function advanceRace(state: RaceState, dt: number): RaceState {
  if (
    !Number.isFinite(dt) ||
    dt <= 0 ||
    (state.status !== "countdown" && state.status !== "racing")
  ) {
    return state;
  }

  let raceDt = dt;
  if (state.status === "countdown") {
    if (dt < state.countdown) {
      return { ...state, countdown: state.countdown - dt };
    }
    raceDt -= state.countdown;
  }

  // Each profile completes one full sinusoidal speed cycle per lap. Its
  // integral is exactly one at 1 / speed, so no frame interpolation or
  // per-frame randomness is needed to recover the true crossing time.
  const lastFinish = state.runners.reduce(
    (latest, runner) => Math.max(latest, 1 / runner.speed),
    0,
  );
  const elapsed = Math.min(state.elapsed + raceDt, lastFinish);
  const runners = state.runners.map((runner) => {
    const finishTime = 1 / runner.speed;
    if (elapsed >= finishTime) {
      return { ...runner, progress: 1, finishTime };
    }
    const laps = elapsed * runner.speed;
    const progress =
      laps +
      (SPEED_VARIATION / TAU) *
        (Math.cos(runner.phase) - Math.cos(TAU * laps + runner.phase));
    return {
      ...runner,
      progress: Math.max(0, Math.min(1, progress)),
      finishTime: null,
    };
  });

  return {
    ...state,
    status: runners.every((runner) => runner.finishTime !== null)
      ? "finished"
      : "racing",
    elapsed,
    countdown: 0,
    runners,
  };
}

/** Finished runners lead; ties are stable by runner ID, not array order. */
export function rankRunners(state: RaceState): Runner[] {
  return [...state.runners].sort((a, b) => {
    if (a.finishTime !== null && b.finishTime !== null) {
      return (
        a.finishTime - b.finishTime || b.progress - a.progress || a.id - b.id
      );
    }
    if (a.finishTime !== null) return -1;
    if (b.finishTime !== null) return 1;
    return b.progress - a.progress || a.id - b.id;
  });
}

/** Arc-length parameterization of each lane, with progress wrapping at a lap. */
export function coursePoint(
  progress: number,
  lane: number,
  count: number,
): {
  x: number;
  z: number;
  heading: number;
} {
  // Lanes are indexed from the inside; the total count does not shift them.
  void count;
  const halfStraight = 17;
  const radius = 12 + (lane + 0.5) * 1.35;
  const arcLength = Math.PI * radius;
  let wrapped = Number.isFinite(progress) ? progress % 1 : 0;
  if (wrapped < 0) wrapped += 1;
  let distance = wrapped * (4 * halfStraight + 2 * arcLength);

  if (distance < halfStraight) {
    return { x: distance, z: radius, heading: 0 };
  }
  distance -= halfStraight;
  if (distance < arcLength) {
    const angle = distance / radius;
    return {
      x: halfStraight + radius * Math.sin(angle),
      z: radius * Math.cos(angle),
      heading: -Math.atan2(-Math.sin(angle), Math.cos(angle)),
    };
  }
  distance -= arcLength;
  if (distance < 2 * halfStraight) {
    return { x: halfStraight - distance, z: -radius, heading: -Math.PI };
  }
  distance -= 2 * halfStraight;
  if (distance < arcLength) {
    const angle = distance / radius;
    return {
      x: -halfStraight - radius * Math.sin(angle),
      z: -radius * Math.cos(angle),
      heading: -Math.atan2(Math.sin(angle), -Math.cos(angle)),
    };
  }
  distance -= arcLength;
  return { x: -halfStraight + distance, z: radius, heading: 0 };
}
