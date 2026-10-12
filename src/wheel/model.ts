export const MAX_ENTRIES = 24;

export interface WheelEntry {
  id: string;
  name: string;
  color: string;
  present: boolean;
  selected: boolean;
}

export interface DrawRecord {
  id: string;
  participantId: string;
  name: string;
  color: string;
  drawnAt: number;
}

export interface WheelSession {
  participants: WheelEntry[];
  history: DrawRecord[];
  noRepeat: boolean;
}

export function eligibleEntries(
  entries: WheelEntry[],
  noRepeat: boolean,
): WheelEntry[] {
  return entries.filter(
    (entry) => entry.present && (!noRepeat || !entry.selected),
  );
}

/** Random sources follow Math.random's contract: independent samples in [0, 1). */
export function planSpin(
  entries: WheelEntry[],
  random: () => number = Math.random,
): { winnerIndex: number; rotation: number } | null {
  if (entries.length === 0) return null;

  const winnerIndex = Math.floor(random() * entries.length);
  const sectorSize = 360 / entries.length;
  const landingAngle = (winnerIndex + 0.3 + random() * 0.4) * sectorSize;
  // Clockwise wheel rotation moves this sector's landing point to the top pointer.
  return { winnerIndex, rotation: 6 * 360 + 360 - landingAngle };
}

/** Degrees clockwise; sectors start at twelve o'clock and include their leading edge. */
export function winnerAtRotation(
  rotation: number,
  count: number,
): number | null {
  if (!Number.isFinite(rotation) || !Number.isInteger(count) || count <= 0)
    return null;
  const pointerAngle = ((-rotation % 360) + 360) % 360;
  return Math.min(count - 1, Math.floor((pointerAngle / 360) * count));
}

export function finishDraw(
  session: WheelSession,
  winnerId: string,
  recordId: string,
  now: number,
): WheelSession {
  const winner = session.participants.find((entry) => entry.id === winnerId);
  if (!winner || !winner.present || (session.noRepeat && winner.selected))
    return session;

  return {
    ...session,
    participants: session.participants.map((entry) =>
      entry.id === winnerId ? { ...entry, selected: true } : entry,
    ),
    history: [
      ...session.history.slice(-49),
      {
        id: recordId,
        participantId: winner.id,
        name: winner.name,
        color: winner.color,
        drawnAt: now,
      },
    ],
  };
}

export function resetRound(session: WheelSession): WheelSession {
  return {
    ...session,
    participants: session.participants.map((entry) => ({
      ...entry,
      selected: false,
    })),
    history: [],
  };
}

export function createSession(
  initial: {
    name: string;
    color: string;
    present: boolean;
    selected: boolean;
  }[],
): WheelSession {
  return {
    participants: initial.map((entry, index) => ({
      id: `seed-${index}`,
      name: entry.name,
      color: entry.color,
      present: entry.present,
      selected: entry.selected,
    })),
    history: [],
    noRepeat: true,
  };
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isId(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isName(value: unknown): value is string {
  return isId(value) && value.length <= 40;
}

function isColor(value: unknown): value is string {
  return typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);
}

function isEntry(value: unknown): value is WheelEntry {
  return (
    isObject(value) &&
    isId(value.id) &&
    isName(value.name) &&
    isColor(value.color) &&
    typeof value.present === "boolean" &&
    typeof value.selected === "boolean"
  );
}

function isRecord(value: unknown): value is DrawRecord {
  return (
    isObject(value) &&
    isId(value.id) &&
    isId(value.participantId) &&
    isName(value.name) &&
    isColor(value.color) &&
    typeof value.drawnAt === "number" &&
    Number.isFinite(value.drawnAt) &&
    Math.abs(value.drawnAt) <= 8.64e15
  );
}

export function restoreSession(
  serialized: string | null,
  fallback: WheelSession,
): WheelSession {
  if (serialized === null) return fallback;
  try {
    const wrapper: unknown = JSON.parse(serialized);
    if (
      !isObject(wrapper) ||
      wrapper.version !== 1 ||
      !isObject(wrapper.session)
    )
      return fallback;
    const session = wrapper.session;
    if (
      typeof session.noRepeat !== "boolean" ||
      !Array.isArray(session.participants) ||
      session.participants.length > MAX_ENTRIES ||
      !session.participants.every(isEntry) ||
      !Array.isArray(session.history) ||
      session.history.length > 50 ||
      !session.history.every(isRecord)
    )
      return fallback;

    const participants = session.participants as WheelEntry[];
    const history = session.history as DrawRecord[];
    if (
      new Set(participants.map((entry) => entry.id)).size !==
        participants.length ||
      new Set(history.map((record) => record.id)).size !== history.length
    )
      return fallback;

    // History is a snapshot: participant IDs need not still exist in the roster.
    return { participants, history, noRepeat: session.noRepeat };
  } catch {
    return fallback;
  }
}

export function secondsRemaining(deadline: number, now: number): number {
  if (!Number.isFinite(deadline) || !Number.isFinite(now)) return 0;
  const difference = deadline - now;
  const seconds = Number.isFinite(difference)
    ? difference / 1000
    : deadline / 1000 - now / 1000;
  return Math.max(0, Math.ceil(seconds));
}
