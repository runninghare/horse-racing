import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";
import {
  ArrowRight,
  Check,
  ChevronRight,
  CircleHelp,
  Clock3,
  History,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  Users,
  Volume2,
  VolumeX,
} from "lucide-react";
import { PARTICIPANTS } from "./constants/participants.constant";
import { WheelDisc, type WheelSpin } from "./components/WheelDisc";
import { TurnTimer } from "./components/TurnTimer";
import {
  createSession,
  eligibleEntries,
  finishDraw,
  MAX_ENTRIES,
  planSpin,
  resetRound,
  restoreSession,
  type WheelSession,
} from "./wheel/model";
import { useWheelSound } from "./wheel/useWheelSound";
import "./SpinningWheel.css";

const STORAGE_KEY = "racing-club:wheel:v1";
const COLORS = [
  "#547562",
  "#d8dcb6",
  "#dfba7b",
  "#ece3cc",
  "#94b6a4",
  "#c9dccb",
  "#c89072",
  "#a6b49b",
];

function initialSession(): WheelSession {
  const fallback = createSession(
    PARTICIPANTS.slice(0, MAX_ENTRIES).map((entry, index) => ({
      ...entry,
      color: COLORS[index % COLORS.length],
    })),
  );
  try {
    return restoreSession(sessionStorage.getItem(STORAGE_KEY), fallback);
  } catch {
    return fallback;
  }
}

function randomSample() {
  return crypto.getRandomValues(new Uint32Array(1))[0] / 0x100000000;
}

export default function SpinningWheel() {
  const [session, setSession] = useState(initialSession);
  const [spin, setSpin] = useState<WheelSpin | null>(null);
  const [phase, setPhase] = useState<"idle" | "spinning" | "revealed">("idle");
  const [name, setName] = useState("");
  const [formError, setFormError] = useState("");
  const [soundOn, setSoundOn] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [canSave, setCanSave] = useState(true);
  const [reducedMotion, setReducedMotion] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const pending = useRef<WheelSpin | null>(null);
  const { unlock, tick, celebrate } = useWheelSound(soundOn);
  const spinning = phase === "spinning";
  const available = eligibleEntries(session.participants, session.noRepeat);
  const presentCount = session.participants.filter(
    (entry) => entry.present,
  ).length;
  const lastDraw = session.history[session.history.length - 1];
  const roundComplete = presentCount > 0 && available.length === 0;
  const displayedEntries = spin?.entries ?? available;

  useEffect(() => {
    try {
      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ version: 1, session }),
      );
      setCanSave(true);
    } catch {
      setCanSave(false);
    }
  }, [session]);

  useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!celebrating) return;
    const timeout = setTimeout(() => setCelebrating(false), 3200);
    return () => clearTimeout(timeout);
  }, [celebrating]);

  const onComplete = useCallback(
    (id: string) => {
      const result = pending.current;
      if (!result || result.id !== id) return;
      pending.current = null;
      const winner = result.entries[result.winnerIndex];
      const now = Date.now();
      setSession((current) => finishDraw(current, winner.id, id, now));
      setPhase("revealed");
      setCelebrating(true);
      celebrate();
    },
    [celebrate],
  );

  const spinWheel = () => {
    if (pending.current || spinning) return;
    const plan = planSpin(available, randomSample);
    if (!plan) return;
    const nextSpin = {
      ...plan,
      id: crypto.randomUUID(),
      entries: available.map((entry) => ({ ...entry })),
    };
    pending.current = nextSpin;
    if (soundOn) unlock();
    setCelebrating(false);
    setSpin(nextSpin);
    setPhase("spinning");
  };

  const clearDisplay = () => {
    setSpin(null);
    setPhase("idle");
    setCelebrating(false);
    setFormError("");
  };

  const newRound = () => {
    if (pending.current) return;
    clearDisplay();
    setSession((current) => resetRound(current));
  };

  const addGuest = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (pending.current) return;
    const trimmed = name.trim();
    if (!trimmed) {
      setFormError("A name would be lovely.");
      return;
    }
    if (session.participants.length >= MAX_ENTRIES) {
      setFormError(`The wheel seats up to ${MAX_ENTRIES} guests.`);
      return;
    }
    if (
      session.participants.some(
        (entry) =>
          entry.name.toLocaleLowerCase() === trimmed.toLocaleLowerCase(),
      )
    ) {
      setFormError("That name is already on the list. Try a nickname.");
      return;
    }
    const entry = {
      id: crypto.randomUUID(),
      name: trimmed,
      color: COLORS[session.participants.length % COLORS.length],
      present: true,
      selected: false,
    };
    clearDisplay();
    setSession((current) => ({
      ...current,
      participants: [...current.participants, entry],
    }));
    setName("");
  };

  const setPresence = (id: string, present: boolean) => {
    if (pending.current) return;
    clearDisplay();
    setSession((current) => ({
      ...current,
      participants: current.participants.map((entry) =>
        entry.id === id ? { ...entry, present } : entry,
      ),
    }));
  };

  return (
    <main className="wheel-app">
      <section className="wheel-heading">
        <div>
          <p className="wheel-eyebrow">
            <span /> LEAVE A LITTLE ROOM FOR LUCK.
          </p>
          <h1>
            A little spin of <em>fate.</em>
          </h1>
          <p>
            Good company. Equal chances. A delightful way to decide who’s next.
          </p>
        </div>
        <div className="wheel-meeting">
          <Sparkles size={20} strokeWidth={1.4} />
          <span>
            THE LUCKY DRAW<strong>No favorites. Just a fair spin.</strong>
          </span>
        </div>
      </section>

      <section className="wheel-layout" aria-label="Lucky draw">
        <div className="wheel-main">
          <div
            className={`wheel-stage ${spinning ? "is-spinning" : ""} ${phase === "revealed" ? "is-revealed" : ""}`}
          >
            <div className="wheel-stage-top">
              <span>
                <i className={spinning ? "spinning-dot" : ""} />
                {spinning
                  ? "A little suspense…"
                  : phase === "revealed"
                    ? "The wheel has spoken"
                    : "Let chance take the lead"}
              </span>
              <button
                className="wheel-sound"
                type="button"
                onClick={() => {
                  if (!soundOn) unlock();
                  setSoundOn((value) => !value);
                }}
                aria-label={
                  soundOn ? "Mute wheel sounds" : "Enable wheel sounds"
                }
                aria-pressed={soundOn}
              >
                {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
                <span>Sound {soundOn ? "on" : "off"}</span>
              </button>
            </div>
            <div
              className="wheel-stage-decoration wheel-star-one"
              aria-hidden="true"
            >
              ✧
            </div>
            <div
              className="wheel-stage-decoration wheel-star-two"
              aria-hidden="true"
            >
              ✦
            </div>
            <div className="wheel-instrument">
              <WheelDisc
                entries={displayedEntries}
                spin={spin}
                reducedMotion={reducedMotion}
                onComplete={onComplete}
                onTick={tick}
              />
            </div>
            {celebrating && !reducedMotion && (
              <div className="wheel-confetti" aria-hidden="true">
                {Array.from({ length: 38 }, (_, index) => (
                  <i
                    key={index}
                    style={
                      {
                        "--x": `${(index * 29 + 7) % 100}%`,
                        "--delay": `${(index % 9) * 65}ms`,
                        "--drift": `${Math.sin(index * 2.4) * 100}px`,
                        "--turn": `${index * 53}deg`,
                        background: COLORS[index % COLORS.length],
                      } as CSSProperties
                    }
                  />
                ))}
              </div>
            )}
            <div className="wheel-stage-bottom">
              <span>
                EST. GOOD TIMES <i /> RC / 02
              </span>
              <span>
                {reducedMotion ? "REDUCED MOTION" : "A SPIN WORTH THE WAIT"}
              </span>
            </div>
          </div>

          <div className="wheel-command">
            <div className="wheel-chance">
              <span className="wheel-eyebrow">
                {roundComplete ? "ROUND COMPLETE" : "IN THE RUNNING"}
              </span>
              <strong>
                {roundComplete
                  ? "Everyone had a turn."
                  : `${available.length} ${available.length === 1 ? "guest" : "guests"} ${phase === "revealed" ? "in the next draw" : "on the wheel"}`}
                <span>
                  {available.length > 0
                    ? `1 in ${available.length} chance`
                    : presentCount === 0
                      ? "Add or include a guest to begin"
                      : "Shall we go again?"}
                </span>
              </strong>
            </div>
            <button
              className="wheel-spin-button"
              type="button"
              onClick={roundComplete ? newRound : spinWheel}
              disabled={spinning || (!roundComplete && available.length === 0)}
            >
              {spinning ? (
                <RotateCcw size={17} className="wheel-button-spinner" />
              ) : roundComplete ? (
                <RotateCcw size={17} />
              ) : (
                <Sparkles size={17} />
              )}
              {spinning
                ? "Spinning…"
                : roundComplete
                  ? "Start a new round"
                  : session.history.length
                    ? "Spin again"
                    : "Spin the wheel"}
              {!spinning && !roundComplete && <ArrowRight size={15} />}
            </button>
          </div>
          <div
            className={`wheel-announcement ${lastDraw && !spinning ? "has-winner" : ""}`}
            aria-live="polite"
            aria-atomic="true"
          >
            <span className="wheel-announcement-icon">
              {lastDraw && !spinning ? (
                <Sparkles size={20} />
              ) : (
                <CircleHelp size={20} />
              )}
            </span>
            <div>
              <span>
                {spinning
                  ? "ROUND AND ROUND WE GO"
                  : lastDraw
                    ? phase === "revealed"
                      ? "A MOMENT IN THE SPOTLIGHT"
                      : "OUR LAST LUCKY GUEST"
                    : "YOUR NEXT LUCKY GUEST"}
              </span>
              <strong>
                {spinning ? (
                  "Who will it be?"
                ) : lastDraw ? (
                  <>
                    {lastDraw.name}
                    <small>, it’s your turn.</small>
                  </>
                ) : (
                  "The next turn is anyone’s guess."
                )}
              </strong>
            </div>
            {lastDraw && !spinning && (
              <span className="winner-draw-number">
                {session.history.length === 50
                  ? "LATEST PICK"
                  : `DRAW ${String(session.history.length).padStart(2, "0")}`}
              </span>
            )}
          </div>
        </div>

        <aside className="wheel-guests" aria-label="Guest list">
          <header className="wheel-guests-heading">
            <div>
              <p className="wheel-eyebrow">GOOD COMPANY</p>
              <h2>The guest list.</h2>
            </div>
            <span className="guest-total">
              <Users size={13} />
              {session.participants.length}
            </span>
          </header>
          <div className="wheel-list-tools">
            <span>
              {presentCount} present · {available.length} eligible
            </span>
            <button
              type="button"
              disabled={spinning || session.participants.length === 0}
              onClick={() => {
                clearDisplay();
                setSession((current) => ({
                  ...current,
                  participants: current.participants.map((entry) => ({
                    ...entry,
                    present: true,
                  })),
                }));
              }}
            >
              Include all
            </button>
          </div>
          <ul className="wheel-guest-list">
            {session.participants.map((entry, index) => {
              const drawn = session.noRepeat && entry.selected;
              return (
                <li
                  key={entry.id}
                  className={`${!entry.present ? "is-absent" : ""} ${drawn ? "is-drawn" : ""}`}
                >
                  <label className="guest-presence">
                    <input
                      type="checkbox"
                      checked={entry.present}
                      disabled={spinning}
                      onChange={(event) =>
                        setPresence(entry.id, event.target.checked)
                      }
                      aria-label={`Include ${entry.name}`}
                    />
                    <span
                      className="guest-avatar"
                      style={{ "--guest-color": entry.color } as CSSProperties}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="guest-identity">
                      <strong title={entry.name}>{entry.name}</strong>
                      <small>
                        {!entry.present
                          ? "Sitting this one out"
                          : drawn
                            ? "Already had a turn"
                            : "Ready for a little luck"}
                      </small>
                    </span>
                  </label>
                  {drawn && (
                    <Check
                      size={13}
                      className="guest-picked"
                      aria-label="Picked"
                    />
                  )}
                  <button
                    className="remove-guest"
                    type="button"
                    disabled={spinning}
                    aria-label={`Remove ${entry.name}`}
                    onClick={() => {
                      if (pending.current) return;
                      clearDisplay();
                      setSession((current) => ({
                        ...current,
                        participants: current.participants.filter(
                          (candidate) => candidate.id !== entry.id,
                        ),
                      }));
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </li>
              );
            })}
          </ul>
          {session.participants.length === 0 && (
            <div className="wheel-empty-guests">
              <Users size={25} />
              <p>A little quiet in here.</p>
              <span>Add your first guest below.</span>
            </div>
          )}
          <form className="wheel-add-guest" onSubmit={addGuest} noValidate>
            <label className="wheel-sr-only" htmlFor="wheel-guest-name">
              New guest name
            </label>
            <input
              id="wheel-guest-name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                setFormError("");
              }}
              disabled={spinning || session.participants.length >= MAX_ENTRIES}
              maxLength={40}
              placeholder={
                session.participants.length >= MAX_ENTRIES
                  ? "The guest list is full"
                  : "Room for one more…"
              }
              autoComplete="off"
              aria-invalid={!!formError}
              aria-describedby={formError ? "wheel-name-error" : undefined}
            />
            <button
              type="submit"
              disabled={spinning || session.participants.length >= MAX_ENTRIES}
              aria-label="Add guest"
            >
              <Plus size={17} />
            </button>
          </form>
          {formError && (
            <p id="wheel-name-error" className="wheel-form-error" role="status">
              {formError}
            </p>
          )}
          <div className="wheel-rules">
            <label>
              <span>
                <strong>Everyone gets a turn</strong>
                <small>Keep picked guests out of the next draw.</small>
              </span>
              <input
                type="checkbox"
                role="switch"
                checked={session.noRepeat}
                disabled={spinning}
                aria-label="No repeat winners"
                onChange={(event) => {
                  clearDisplay();
                  setSession((current) => ({
                    ...current,
                    noRepeat: event.target.checked,
                  }));
                }}
              />
            </label>
            <div>
              <span>
                <Check size={12} />
                {session.noRepeat
                  ? "Drawing without repeats"
                  : "Repeat winners are welcome"}
              </span>
              <button
                type="button"
                onClick={newRound}
                disabled={spinning || session.history.length === 0}
                aria-label="Start a new round"
              >
                <RotateCcw size={13} />
                New round
              </button>
            </div>
          </div>
        </aside>
      </section>

      <div className="wheel-bottom-grid">
        <TurnTimer drawToken={lastDraw?.id ?? null} />
        <section className="wheel-history" aria-label="Draw history">
          <header>
            <div>
              <p className="wheel-eyebrow">THE LUCKY ONES</p>
              <h2>Good things come around.</h2>
            </div>
            <History size={19} strokeWidth={1.4} />
          </header>
          {session.history.length === 0 ? (
            <div className="wheel-history-empty">
              <span>
                <Sparkles size={22} strokeWidth={1.2} />
              </span>
              <strong>A story waiting for its first spin.</strong>
              <p>Your picks will appear here, one lucky guest at a time.</p>
            </div>
          ) : (
            <ol className="wheel-history-list">
              {[...session.history].reverse().map((record, index) => (
                <li key={record.id}>
                  <span className="history-number">
                    {String(session.history.length - index).padStart(2, "0")}
                  </span>
                  <span
                    className="history-swatch"
                    style={{ background: record.color }}
                  />
                  <strong title={record.name}>{record.name}</strong>
                  {index === 0 && (
                    <span className="history-latest">LATEST PICK</span>
                  )}
                  <time dateTime={new Date(record.drawnAt).toISOString()}>
                    {new Date(record.drawnAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                  <ChevronRight size={12} />
                </li>
              ))}
            </ol>
          )}
          <div className="wheel-history-footer">
            <Clock3 size={12} />
            <span>
              {session.history.length === 50
                ? "Latest 50 picks in this round"
                : session.history.length
                  ? `${session.history.length} ${session.history.length === 1 ? "pick" : "picks"} this round`
                  : "Every guest has an equal chance at each draw."}
            </span>
          </div>
        </section>
      </div>
      <footer className="wheel-footer">
        <span>A little chance. A lot of good company.</span>
        <span>
          {canSave
            ? "Guest list & picks saved for this tab."
            : "Session storage unavailable. Changes are temporary."}{" "}
          <i /> Timer resets when you leave.
        </span>
      </footer>
    </main>
  );
}
