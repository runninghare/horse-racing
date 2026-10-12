import assert from "node:assert/strict";
import test from "node:test";
import {
  MAX_ENTRIES,
  createSession,
  eligibleEntries,
  finishDraw,
  planSpin,
  resetRound,
  restoreSession,
  secondsRemaining,
  winnerAtRotation,
} from "./model.ts";

function roster(count = 3) {
  return createSession(
    Array.from({ length: count }, (_, index) => ({
      name: `Person ${index}`,
      color: "#Ab12ef",
      present: true,
      selected: false,
    })),
  );
}

function freeze(value) {
  if (value && typeof value === "object") {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

function samples(...values) {
  let calls = 0;
  return {
    random: () => {
      assert.ok(calls < values.length, "unexpected random sample");
      return values[calls++];
    },
    calls: () => calls,
  };
}

test("createSession copies the roster and each entry with deterministic stable IDs", () => {
  assert.equal(MAX_ENTRIES, 24);
  const initial = [
    { name: "Same", color: "#123456", present: false, selected: true },
    { name: "Same", color: "#abcdef", present: true, selected: false },
  ];
  const session = createSession(initial);
  assert.deepEqual(session, {
    participants: initial.map((entry, index) => ({
      ...entry,
      id: `seed-${index}`,
    })),
    history: [],
    noRepeat: true,
  });
  assert.notStrictEqual(session.participants, initial);
  initial[0].name = "Changed input";
  session.participants[1].color = "#000000";
  assert.equal(session.participants[0].name, "Same");
  assert.equal(initial[1].color, "#abcdef");
  assert.deepEqual(createSession([]), {
    participants: [],
    history: [],
    noRepeat: true,
  });
});

test("eligibility requires presence, and excludes selected entries only in no-repeat mode", () => {
  const entries = freeze([
    { ...roster(1).participants[0], id: "a", present: true, selected: false },
    { ...roster(1).participants[0], id: "b", present: true, selected: true },
    { ...roster(1).participants[0], id: "c", present: false, selected: false },
    { ...roster(1).participants[0], id: "d", present: false, selected: true },
  ]);
  assert.deepEqual(
    eligibleEntries(entries, true).map((entry) => entry.id),
    ["a"],
  );
  assert.deepEqual(
    eligibleEntries(entries, false).map((entry) => entry.id),
    ["a", "b"],
  );
  assert.notStrictEqual(eligibleEntries(entries, false), entries);
  assert.deepEqual(eligibleEntries([], true), []);
});

test("empty spins consume no randomness; nonempty spins use exactly two samples", () => {
  const empty = samples();
  assert.equal(planSpin([], empty.random), null);
  assert.equal(empty.calls(), 0);
  const rng = samples(0.5, 0.5);
  assert.deepEqual(planSpin(roster(4).participants, rng.random), {
    winnerIndex: 2,
    rotation: 2295,
  });
  assert.equal(rng.calls(), 2);
  const defaultPlan = planSpin(roster(1).participants);
  assert.equal(defaultPlan.winnerIndex, 0);
  assert.equal(winnerAtRotation(defaultPlan.rotation, 1), 0);
});

test("winner selection has equal counts across a uniform grid for every roster size", () => {
  for (let count = 1; count <= MAX_ENTRIES; count++) {
    const entries = freeze(roster(count).participants);
    const wins = Array(count).fill(0);
    for (let sample = 0; sample < count * 100; sample++) {
      const rng = samples((sample + 0.5) / (count * 100), 0.5);
      wins[planSpin(entries, rng.random).winnerIndex]++;
      assert.equal(rng.calls(), 2);
    }
    assert.deepEqual(wins, Array(count).fill(100), `count=${count}`);
  }
});

test("all sectors for counts 1..24 align with the top pointer in their middle 40%", () => {
  for (let count = 1; count <= MAX_ENTRIES; count++) {
    for (let winner = 0; winner < count; winner++) {
      for (const jitter of [0, 0.1, 0.5, 0.9, 1 - Number.EPSILON]) {
        const rng = samples((winner + 0.5) / count, jitter);
        const plan = planSpin(roster(count).participants, rng.random);
        assert.equal(plan.winnerIndex, winner);
        assert.ok(plan.rotation >= 6 * 360);
        assert.ok(plan.rotation < 7 * 360);
        assert.equal(winnerAtRotation(plan.rotation, count), winner);
        assert.equal(
          winnerAtRotation(plan.rotation + 360 * 100, count),
          winner,
        );
        assert.equal(
          winnerAtRotation(plan.rotation - 360 * 100, count),
          winner,
        );
        const pointerAngle = ((-plan.rotation % 360) + 360) % 360;
        const fraction = pointerAngle / (360 / count) - winner;
        assert.ok(fraction >= 0.3 - 1e-10 && fraction <= 0.7 + 1e-10);
        assert.ok(Math.abs(fraction - (0.3 + jitter * 0.4)) < 1e-10);
      }
    }
  }
  assert.equal(
    planSpin(roster(24).participants, samples(0, 0).random).winnerIndex,
    0,
  );
  assert.equal(
    planSpin(roster(24).participants, samples(1 - Number.EPSILON, 0).random)
      .winnerIndex,
    23,
  );
});

test("pointer convention, wraparound, sector boundaries, and invalid arguments", () => {
  for (const rotation of [0, -0, 360, -360, 2160]) {
    assert.equal(winnerAtRotation(rotation, 4), 0);
  }
  assert.equal(winnerAtRotation(90, 4), 3);
  assert.equal(winnerAtRotation(-90, 4), 1);
  assert.equal(winnerAtRotation(180, 4), 2);
  assert.equal(winnerAtRotation(270, 4), 1);
  assert.equal(winnerAtRotation(90 - 1e-8, 4), 3);
  assert.equal(winnerAtRotation(90 + 1e-8, 4), 2);
  for (const rotation of [NaN, Infinity, -Infinity]) {
    assert.equal(winnerAtRotation(rotation, 4), null);
  }
  for (const count of [0, -1, 1.5, NaN, Infinity, -Infinity]) {
    assert.equal(winnerAtRotation(180, count), null);
  }
});

test("finishDraw uses stable IDs despite duplicate names and reordered participants", () => {
  const input = roster();
  input.participants.forEach((entry) => {
    entry.name = "Same";
  });
  input.participants.reverse();
  freeze(input);
  const next = finishDraw(input, "seed-0", "draw-1", 1234);
  assert.notStrictEqual(next, input);
  assert.notStrictEqual(next.participants, input.participants);
  assert.notStrictEqual(next.history, input.history);
  assert.deepEqual(
    next.participants.map((entry) => entry.selected),
    [false, false, true],
  );
  assert.deepEqual(
    input.participants.map((entry) => entry.selected),
    [false, false, false],
  );
  assert.deepEqual(input.history, []);
  assert.deepEqual(next.history, [
    {
      id: "draw-1",
      participantId: "seed-0",
      name: "Same",
      color: "#Ab12ef",
      drawnAt: 1234,
    },
  ]);
  next.participants[2].name = "Renamed";
  next.participants[2].color = "#000000";
  assert.equal(next.history[0].name, "Same");
  assert.equal(next.history[0].color, "#Ab12ef");
  assert.strictEqual(finishDraw(next, "seed-0", "draw-2", 2345), next);
});

test("missing and absent winners are guarded, while repeats are allowed when configured", () => {
  const input = roster();
  input.participants[1].present = false;
  freeze(input);
  assert.strictEqual(finishDraw(input, "missing", "draw-1", 0), input);
  assert.strictEqual(finishDraw(input, "seed-1", "draw-1", 0), input);
  let next = finishDraw({ ...input, noRepeat: false }, "seed-0", "draw-1", 10);
  next = finishDraw(freeze(next), "seed-0", "draw-2", 20);
  assert.equal(next.history.length, 2);
  assert.deepEqual(
    next.history.map((record) => record.participantId),
    ["seed-0", "seed-0"],
  );
  assert.equal(next.participants[0].selected, true);
  assert.equal(next.noRepeat, false);
  assert.strictEqual(finishDraw(next, "seed-1", "draw-3", 30), next);
});

test("history retains exactly the most recent 50 records in append order", () => {
  let session = { ...roster(1), noRepeat: false };
  for (let index = 0; index < 55; index++) {
    session = finishDraw(freeze(session), "seed-0", `draw-${index}`, index);
  }
  assert.equal(session.history.length, 50);
  assert.deepEqual(
    session.history.map((record) => record.drawnAt),
    Array.from({ length: 50 }, (_, i) => i + 5),
  );
});

test("resetRound clears selection and history without changing roster, presence, or mode", () => {
  const input = roster();
  input.noRepeat = false;
  input.participants[1].present = false;
  const drawn = freeze(finishDraw(input, "seed-0", "draw-1", 100));
  const reset = resetRound(drawn);
  assert.deepEqual(reset, { ...input, history: [] });
  assert.notStrictEqual(reset.participants, drawn.participants);
  assert.equal(drawn.participants[0].selected, true);
  assert.equal(drawn.history.length, 1);
  assert.deepEqual(resetRound(roster(0)), roster(0));
});

function stored() {
  const session = roster(2);
  session.noRepeat = false;
  session.participants[0].selected = true;
  session.participants[1].present = false;
  session.history = [
    {
      id: "draw-1",
      participantId: "removed",
      name: "Old name",
      color: "#ABCDEF",
      drawnAt: 0,
    },
    {
      id: "draw-2",
      participantId: "removed",
      name: "Old name",
      color: "#abcdef",
      drawnAt: 1.5,
    },
  ];
  return { version: 1, session };
}

test("storage accepts v1, removed participants in history, repeated draws, and size boundaries", () => {
  const fallback = freeze(roster(1));
  const wrapper = stored();
  assert.deepEqual(
    restoreSession(JSON.stringify(wrapper), fallback),
    wrapper.session,
  );
  assert.deepEqual(
    restoreSession(
      JSON.stringify({ version: 1, session: roster(0) }),
      fallback,
    ),
    roster(0),
  );
  wrapper.session.participants = roster(24).participants;
  wrapper.session.participants[0].name = "x".repeat(40);
  wrapper.session.history = Array.from({ length: 50 }, (_, i) => ({
    ...wrapper.session.history[0],
    id: `draw-${i}`,
  }));
  assert.deepEqual(
    restoreSession(JSON.stringify(wrapper), fallback),
    wrapper.session,
  );
});

test("corrupt storage always returns the exact fallback", async (t) => {
  const fallback = freeze(roster(1));
  const corrupt = [
    null,
    "",
    "{",
    "null",
    "[]",
    "true",
    "1",
    "{}",
    JSON.stringify(roster()),
  ];
  for (const value of corrupt)
    assert.strictEqual(restoreSession(value, fallback), fallback);

  const mutations = {
    "wrong version": (v) => {
      v.version = 2;
    },
    "string version": (v) => {
      v.version = "1";
    },
    "missing version": (v) => {
      delete v.version;
    },
    "null session": (v) => {
      v.session = null;
    },
    "array session": (v) => {
      v.session = [];
    },
    "missing roster": (v) => {
      delete v.session.participants;
    },
    "non-array roster": (v) => {
      v.session.participants = {};
    },
    "too many entries": (v) => {
      v.session.participants = roster(25).participants;
    },
    "null participant": (v) => {
      v.session.participants[0] = null;
    },
    "duplicate participant IDs": (v) => {
      v.session.participants[1].id = v.session.participants[0].id;
    },
    "empty participant ID": (v) => {
      v.session.participants[0].id = "";
    },
    "whitespace ID": (v) => {
      v.session.participants[0].id = "  ";
    },
    "numeric ID": (v) => {
      v.session.participants[0].id = 5;
    },
    "empty name": (v) => {
      v.session.participants[0].name = "";
    },
    "whitespace name": (v) => {
      v.session.participants[0].name = "  ";
    },
    "long name": (v) => {
      v.session.participants[0].name = "x".repeat(41);
    },
    "numeric name": (v) => {
      v.session.participants[0].name = 3;
    },
    "short hex": (v) => {
      v.session.participants[0].color = "#abc";
    },
    "missing hash": (v) => {
      v.session.participants[0].color = "abcdef";
    },
    "nonhex color": (v) => {
      v.session.participants[0].color = "#gggggg";
    },
    "alpha hex": (v) => {
      v.session.participants[0].color = "#123456ff";
    },
    "numeric color": (v) => {
      v.session.participants[0].color = 123456;
    },
    "string presence": (v) => {
      v.session.participants[0].present = "true";
    },
    "numeric selected": (v) => {
      v.session.participants[0].selected = 0;
    },
    "missing selected": (v) => {
      delete v.session.participants[0].selected;
    },
    "string noRepeat": (v) => {
      v.session.noRepeat = "false";
    },
    "missing noRepeat": (v) => {
      delete v.session.noRepeat;
    },
    "missing history": (v) => {
      delete v.session.history;
    },
    "non-array history": (v) => {
      v.session.history = {};
    },
    "too much history": (v) => {
      v.session.history = Array.from({ length: 51 }, (_, i) => ({
        ...v.session.history[0],
        id: `d-${i}`,
      }));
    },
    "null record": (v) => {
      v.session.history[0] = null;
    },
    "duplicate record IDs": (v) => {
      v.session.history[1].id = v.session.history[0].id;
    },
    "empty record ID": (v) => {
      v.session.history[0].id = "";
    },
    "empty history participant ID": (v) => {
      v.session.history[0].participantId = "";
    },
    "numeric history participant ID": (v) => {
      v.session.history[0].participantId = 7;
    },
    "empty snapshot name": (v) => {
      v.session.history[0].name = "";
    },
    "long snapshot name": (v) => {
      v.session.history[0].name = "x".repeat(41);
    },
    "invalid snapshot color": (v) => {
      v.session.history[0].color = "red";
    },
    "string timestamp": (v) => {
      v.session.history[0].drawnAt = "123";
    },
    "null timestamp": (v) => {
      v.session.history[0].drawnAt = null;
    },
    "missing timestamp": (v) => {
      delete v.session.history[0].drawnAt;
    },
    "timestamp outside Date range": (v) => {
      v.session.history[0].drawnAt = 1e100;
    },
  };
  for (const [name, mutate] of Object.entries(mutations)) {
    await t.test(name, () => {
      const wrapper = stored();
      mutate(wrapper);
      assert.strictEqual(
        restoreSession(JSON.stringify(wrapper), fallback),
        fallback,
      );
    });
  }
  // Unlike JSON.stringify(Infinity), valid JSON numeric overflow parses to Infinity.
  const overflow = JSON.stringify(stored()).replace(
    '"drawnAt":0',
    '"drawnAt":1e400',
  );
  assert.strictEqual(restoreSession(overflow, fallback), fallback);
});

test("countdown uses the deadline rather than tick counts, with exact rounding boundaries", () => {
  const deadline = 10000;
  const cases = [
    [0, 10],
    [1, 10],
    [999, 10],
    [1000, 9],
    [1001, 9],
    [4321, 6],
    [9000, 1],
    [9999, 1],
    [9999.5, 1],
    [10000, 0],
    [12000, 0],
  ];
  for (const [now, expected] of cases)
    assert.equal(secondsRemaining(deadline, now), expected);
  assert.equal(secondsRemaining(0, -1001), 2);
  assert.equal(secondsRemaining(-1000, -2000), 1);
  for (const invalid of [NaN, Infinity, -Infinity]) {
    assert.equal(secondsRemaining(invalid, 0), 0);
    assert.equal(secondsRemaining(0, invalid), 0);
    assert.equal(secondsRemaining(invalid, invalid), 0);
  }
  assert.ok(
    Number.isFinite(secondsRemaining(Number.MAX_VALUE, -Number.MAX_VALUE)),
  );
  assert.equal(secondsRemaining(-Number.MAX_VALUE, Number.MAX_VALUE), 0);
});
