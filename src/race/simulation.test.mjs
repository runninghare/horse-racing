import assert from "node:assert/strict";
import test from "node:test";
import {
  advanceRace,
  coursePoint,
  createRace,
  rankRunners,
  RACE_SPEEDS,
  startRace,
} from "./simulation.ts";

function seededRandom(seed = 1234) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
}

function close(actual, expected, tolerance = 1e-10) {
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${actual} != ${expected}`,
  );
}

function freeze(state) {
  state.runners.forEach(Object.freeze);
  Object.freeze(state.runners);
  return Object.freeze(state);
}

function atTime(initial, seconds, fps, playbackRate = 1) {
  let state = initial;
  const frames = Math.floor(seconds * fps);
  for (let i = 0; i < frames; i++)
    state = advanceRace(state, 1 / fps, playbackRate);
  return advanceRace(state, seconds - frames / fps, playbackRate);
}

test("playback speed preserves the countdown and scales only racing carryover", () => {
  const initial = freeze(startRace(createRace(8, seededRandom())));
  for (const rate of RACE_SPEEDS) {
    const waiting = freeze(advanceRace(initial, 2.75, rate));
    assert.equal(waiting.countdown, 0.25);
    assert.equal(waiting.elapsed, 0);
    assert.ok(waiting.runners.every((runner) => runner.progress === 0));
    assert.equal(advanceRace(waiting, 0.25, rate).elapsed, 0);
    assert.deepEqual(
      advanceRace(waiting, 0.75, rate),
      advanceRace(initial, 3 + 0.5 * rate),
    );
  }
  assert.deepEqual(advanceRace(initial, 12), advanceRace(initial, 12, 1));
});

test("live speed changes preserve progress, pause state and runner profiles", () => {
  const initial = freeze(startRace(createRace(8, seededRandom())));
  const running = freeze(advanceRace(initial, 5));
  const slow = freeze(advanceRace(running, 0.4, 0.5));
  close(slow.elapsed, 2.2);
  const paused = freeze({ ...slow, status: "paused" });
  for (const rate of RACE_SPEEDS)
    assert.equal(advanceRace(paused, 100, rate), paused);
  const resumed = advanceRace({ ...paused, status: "racing" }, 0.7, 2);
  const fast = advanceRace(resumed, 0.1, 4);
  close(fast.elapsed, 4);
  const expected = advanceRace(initial, 7);
  fast.runners.forEach((runner, index) => {
    close(runner.progress, expected.runners[index].progress);
    assert.equal(runner.speed, running.runners[index].speed);
    assert.equal(runner.phase, running.runners[index].phase);
  });
  assert.equal(running.elapsed, 2);
});

test("all playback speeds retain frame-independent progress and exact finish order", () => {
  const initial = freeze(startRace(createRace(8, seededRandom())));
  for (const rate of RACE_SPEEDS) {
    for (const raceSeconds of [10, 36.25, 43]) {
      const expected = advanceRace(initial, 3 + raceSeconds);
      for (const fps of [24, 60, 144]) {
        const actual = atTime(initial, 3 + raceSeconds / rate, fps, rate);
        assert.equal(actual.status, expected.status);
        close(actual.elapsed, expected.elapsed, 1e-8);
        actual.runners.forEach((runner, index) => {
          close(runner.progress, expected.runners[index].progress, 1e-9);
          assert.equal(runner.finishTime, expected.runners[index].finishTime);
        });
        assert.deepEqual(
          rankRunners(actual).map((r) => r.id),
          rankRunners(expected).map((r) => r.id),
        );
        if (actual.status === "finished")
          assert.equal(advanceRace(actual, 10, rate), actual);
      }
    }
  }
});

test("invalid playback rates are safe no-ops", () => {
  const initial = freeze(startRace(createRace(8, seededRandom())));
  const running = freeze(advanceRace(initial, 5));
  for (const rate of [0, -1, -Infinity, Infinity, NaN]) {
    assert.equal(advanceRace(initial, 5, rate), initial);
    assert.equal(advanceRace(running, 5, rate), running);
  }
});

test("creation is ready, reproducible, and samples randomness only at creation", () => {
  let calls = 0;
  const state = createRace(4, () => {
    calls++;
    return 0.5;
  });
  assert.equal(state.status, "ready");
  assert.equal(state.elapsed, 0);
  assert.equal(state.countdown, 0);
  assert.deepEqual(
    state.runners.map((runner) => runner.id),
    [0, 1, 2, 3],
  );
  for (const runner of state.runners) {
    assert.equal(runner.progress, 0);
    assert.equal(runner.finishTime, null);
    close(runner.speed, 1 / 39);
    close(runner.phase, Math.PI);
  }
  const initialCalls = calls;
  advanceRace(startRace(state), 100);
  assert.equal(calls, initialCalls);
  assert.deepEqual(
    createRace(5, seededRandom()),
    createRace(5, seededRandom()),
  );
});

test("countdown carries excess time into racing and honors its exact boundary", () => {
  const ready = freeze(createRace(3, seededRandom()));
  const started = freeze(startRace(ready));
  assert.equal(started.status, "countdown");
  assert.equal(started.countdown, 3);
  const waiting = freeze(advanceRace(started, 2.5));
  assert.equal(waiting.countdown, 0.5);
  assert.equal(waiting.elapsed, 0);
  assert.ok(waiting.runners.every((runner) => runner.progress === 0));
  const boundary = advanceRace(waiting, 0.5);
  assert.equal(boundary.status, "racing");
  assert.equal(boundary.countdown, 0);
  assert.equal(boundary.elapsed, 0);
  const racing = advanceRace(waiting, 1.25);
  assert.equal(racing.elapsed, 0.75);
  assert.ok(racing.runners.every((runner) => runner.progress > 0));
  assert.deepEqual(racing, advanceRace(started, 3.75));
  assert.equal(ready.status, "ready");
  assert.equal(started.countdown, 3);
});

test("subframe crossings yield exact finish times and unique ranks, not array order", () => {
  const initial = startRace(createRace(3, seededRandom()));
  initial.runners = initial.runners.map((runner, id) => ({
    ...runner,
    speed: 1 / [35.9, 35.5, 35.1][id],
  }));
  const before = freeze(advanceRace(initial, 38));
  assert.ok(before.runners.every((runner) => runner.finishTime === null));
  const partial = advanceRace(before, 0.2);
  assert.equal(partial.status, "racing");
  assert.equal(partial.runners[2].progress, 1);
  close(partial.runners[2].finishTime, 35.1);
  assert.equal(partial.runners[1].finishTime, null);
  const finished = freeze(advanceRace(before, 1));
  assert.equal(finished.status, "finished");
  assert.ok(finished.runners.every((runner) => runner.progress === 1));
  const ranked = rankRunners(finished);
  assert.deepEqual(
    ranked.map((runner) => runner.id),
    [2, 1, 0],
  );
  assert.equal(new Set(ranked.map((runner) => runner.id)).size, 3);
  [35.1, 35.5, 35.9].forEach((time, i) => close(ranked[i].finishTime, time));
  assert.deepEqual(
    finished.runners.map((runner) => runner.id),
    [0, 1, 2],
  );
  assert.equal(advanceRace(finished, 100), finished);
});

test("rank sorting prioritizes finish time, then progress, then ID without mutation", () => {
  const state = createRace(5, seededRandom());
  state.runners = [
    { ...state.runners[4], progress: 0.8 },
    { ...state.runners[3], progress: 1, finishTime: 40 },
    { ...state.runners[2], progress: 0.8 },
    { ...state.runners[1], progress: 1, finishTime: 40 },
    { ...state.runners[0], progress: 0.2 },
  ];
  freeze(state);
  assert.deepEqual(
    rankRunners(state).map((runner) => runner.id),
    [1, 3, 2, 4, 0],
  );
});

test("analytic progress is frame-rate independent, including through countdown and finishes", () => {
  const initial = freeze(startRace(createRace(12, seededRandom())));
  for (const seconds of [1.25, 3.5, 15.125, 38.25, 42.5, 47]) {
    const expected = advanceRace(initial, seconds);
    for (const fps of [24, 60, 144]) {
      const actual = atTime(initial, seconds, fps);
      assert.equal(actual.status, expected.status);
      close(actual.countdown, expected.countdown, 1e-8);
      close(actual.elapsed, expected.elapsed, 1e-8);
      actual.runners.forEach((runner, i) => {
        close(runner.progress, expected.runners[i].progress, 1e-9);
        assert.equal(runner.finishTime, expected.runners[i].finishTime);
      });
      assert.deepEqual(
        rankRunners(actual).map((r) => r.id),
        rankRunners(expected).map((r) => r.id),
      );
    }
  }
});

test("speed varies smoothly, progress is monotonic, and all durations are 35–43 seconds", () => {
  const initial = startRace(createRace(10, seededRandom()));
  let previous = advanceRace(initial, 3);
  for (let t = 0.25; t <= 44; t += 0.25) {
    const next = advanceRace(initial, 3 + t);
    next.runners.forEach((runner, i) => {
      assert.ok(runner.progress >= previous.runners[i].progress);
      assert.ok(runner.progress >= 0 && runner.progress <= 1);
    });
    previous = next;
  }
  assert.equal(previous.status, "finished");
  previous.runners.forEach((runner) =>
    assert.ok(runner.finishTime >= 35 && runner.finishTime <= 43),
  );
  const progress = (t) => advanceRace(initial, 3 + t).runners[0].progress;
  const velocity = (t) => (progress(t + 0.001) - progress(t)) / 0.001;
  assert.ok(Math.abs(velocity(5) - velocity(20)) > 0.0001);
  close(velocity(10), velocity(10.001), 1e-6);
});

test("ready, paused, and invalid time steps never advance; reset clears results", () => {
  const ready = freeze(createRace(4, seededRandom()));
  assert.equal(advanceRace(ready, 5), ready);
  const running = freeze(advanceRace(startRace(ready), 15));
  for (const dt of [-1, -Infinity, Infinity, NaN, 0]) {
    assert.equal(advanceRace(running, dt), running);
    const countdown = freeze(startRace(ready));
    assert.equal(advanceRace(countdown, dt), countdown);
  }
  const paused = freeze({ ...running, status: "paused" });
  assert.equal(advanceRace(paused, 100), paused);
  assert.deepEqual(
    advanceRace({ ...paused, status: "racing" }, 1),
    advanceRace(running, 1),
  );
  const completed = freeze(advanceRace(running, 100));
  const reset = startRace(completed);
  assert.deepEqual(reset, startRace(ready));
  assert.equal(completed.status, "finished");
  assert.deepEqual(createRace(4, seededRandom()), ready);
});

test("zero runners is safe; empty countdown completes without advancing race time", () => {
  for (const count of [0, -2, NaN, Infinity]) {
    const state = createRace(count);
    assert.deepEqual(state.runners, []);
    assert.deepEqual(rankRunners(state), []);
    const started = startRace(state);
    assert.equal(started.status, "countdown");
    const finished = advanceRace(started, 100);
    assert.equal(finished.status, "finished");
    assert.equal(finished.elapsed, 0);
  }
});

test("course follows capsule landmarks at normalized lane-specific arc lengths", () => {
  for (const lane of [0, 1, 7]) {
    const radius = 12 + (lane + 0.5) * 1.35;
    const arc = Math.PI * radius;
    const length = 68 + 2 * arc;
    const landmarks = [
      [0, 0, radius],
      [17, 17, radius],
      [17 + arc / 2, 17 + radius, 0],
      [17 + arc, 17, -radius],
      [34 + arc, 0, -radius],
      [51 + arc, -17, -radius],
      [51 + 1.5 * arc, -17 - radius, 0],
      [51 + 2 * arc, -17, radius],
      [length, 0, radius],
    ];
    for (const [distance, x, z] of landmarks) {
      const point = coursePoint(distance / length, lane, 8);
      close(point.x, x);
      close(point.z, z);
    }
    assert.equal(coursePoint(0, lane, 8).heading, 0);
    assert.deepEqual(coursePoint(1, lane, 8), coursePoint(0, lane, 8));
    assert.deepEqual(coursePoint(0.25, lane, 8), coursePoint(0.25, lane, 20));
    assert.deepEqual(coursePoint(-0.25, lane, 8), coursePoint(0.75, lane, 8));
  }
});

test("course position and +X horse heading are continuous at joins and lap wrap", () => {
  const lane = 2;
  const arc = Math.PI * (12 + (lane + 0.5) * 1.35);
  const length = 68 + 2 * arc;
  const joins = [0, 17, 17 + arc, 51 + arc, 51 + 2 * arc, length];
  for (const progress of [
    ...joins.map((d) => d / length),
    0.15,
    0.35,
    0.65,
    0.85,
  ]) {
    const before = coursePoint(progress - 1e-7, lane, 5);
    const point = coursePoint(progress, lane, 5);
    const after = coursePoint(progress + 1e-7, lane, 5);
    close(before.x, after.x, 1e-4);
    close(before.z, after.z, 1e-4);
    const dx = after.x - before.x;
    const dz = after.z - before.z;
    const distance = Math.hypot(dx, dz);
    close(Math.cos(point.heading), dx / distance, 1e-6);
    close(-Math.sin(point.heading), dz / distance, 1e-6);
    close(Math.cos(before.heading), Math.cos(after.heading), 1e-5);
    close(Math.sin(before.heading), Math.sin(after.heading), 1e-5);
  }
});
