import {
  Component,
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type CSSProperties,
} from "react";
import {
  ArrowDownToLine,
  ArrowRight,
  Check,
  Flag,
  Focus,
  Maximize2,
  Mountain,
  Pause,
  Play,
  RotateCcw,
  Sun,
  Trees,
  Trophy,
  Video,
} from "lucide-react";
import { PARTICIPANTS } from "./constants/participants.constant";
import {
  advanceRace,
  createRace,
  rankRunners,
  startRace,
  type RaceStatus,
} from "./race/simulation";
import "./HorseRacing.css";

const RaceScene = lazy(() => import("./components/RaceScene"));
const COURSES = [
  {
    id: "meadow",
    name: "Meadow Park",
    detail: "English countryside",
    tag: "CLASSIC",
    icon: Trees,
  },
  {
    id: "sunset",
    name: "Golden Hour",
    detail: "A race into the sunset",
    tag: "SUNSET",
    icon: Sun,
  },
  {
    id: "alpine",
    name: "Alpine Run",
    detail: "Fresh air. Fast hooves.",
    tag: "HIGHLANDS",
    icon: Mountain,
  },
] as const;
type Course = (typeof COURSES)[number]["id"];
type CameraMode = "broadcast" | "follow" | "orbit";

class SceneBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? (
      <div className="scene-message">
        <Mountain size={36} />
        <h3>The 3D view couldn’t load.</h3>
        <p>
          Check that WebGL is enabled, then reload. The race controls and
          standings still work.
        </p>
        <button onClick={() => window.location.reload()}>Reload view</button>
      </div>
    ) : (
      this.props.children
    );
  }
}

function formatTime(seconds: number) {
  return `${Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0")}:${(seconds % 60).toFixed(1).padStart(4, "0")}`;
}

export default function HorseRacing() {
  const [race, setRace] = useState(() => createRace(PARTICIPANTS.length));
  const [course, setCourse] = useState<Course>("meadow");
  const [cameraMode, setCameraMode] = useState<CameraMode>("broadcast");
  const [selected, setSelected] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const resumeStatus = useRef<RaceStatus>("racing");
  const running = race.status === "racing" || race.status === "countdown";
  const locked = running || race.status === "paused";
  const ranking = rankRunners(race);
  const winner =
    ranking[0] && ranking[0].finishTime !== null
      ? PARTICIPANTS[ranking[0].id]
      : null;
  const activeCourse = COURSES.find((entry) => entry.id === course)!;
  const leaderProgress = ranking[0]?.progress ?? 0;

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(query.matches);
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!running) return;
    let frame: number;
    let last = performance.now();
    const tick = (now: number) => {
      const delta = Math.min((now - last) / 1000, 0.1);
      last = now;
      setRace((state) => advanceRace(state, delta));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    const onVisibility = () => {
      if (document.hidden) {
        resumeStatus.current = race.status;
        setRace((state) => ({ ...state, status: "paused" }));
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [running, race.status]);

  const toggleRace = () => {
    if (running) {
      resumeStatus.current = race.status;
      setRace((state) => ({ ...state, status: "paused" }));
    } else if (race.status === "paused") {
      setRace((state) => ({ ...state, status: resumeStatus.current }));
    } else {
      setRace(startRace(createRace(PARTICIPANTS.length)));
    }
  };

  return (
    <main className="race-app">
      <section className="race-heading">
        <div>
          <div className="eyebrow">
            <span /> A LITTLE COMPETITION. A LOT OF HEART.
          </div>
          <h1>
            Off to the <em>races.</em>
          </h1>
          <p>Pick your course. Follow your favorite. Let the best horse win.</p>
        </div>
        <div className="meeting-badge">
          <Flag size={19} strokeWidth={1.5} />
          <span>
            THE FRIENDLY STAKES
            <strong>
              {PARTICIPANTS.length} runners <b>·</b> One champion
            </strong>
          </span>
        </div>
      </section>
      <section className="race-layout" aria-label="Horse racing simulator">
        <div className="race-stage">
          <div className={`scene-wrap scene-${course}`}>
            <SceneBoundary>
              <Suspense
                fallback={
                  <div className="scene-message">
                    <span className="loading-ring" />
                    <p>Preparing the paddock…</p>
                  </div>
                }
              >
                <RaceScene
                  race={race}
                  course={course}
                  cameraMode={cameraMode}
                  selected={selected}
                  participants={PARTICIPANTS}
                  reducedMotion={reducedMotion}
                />
              </Suspense>
            </SceneBoundary>
            <div className="scene-topline">
              <span className="venue-label">
                <span className={running ? "live-dot active" : "live-dot"} />
                {activeCourse.name}
                <small>3D LIVE VIEW</small>
              </span>
              <span className="weather-label">
                <activeCourse.icon size={15} />
                {course === "sunset"
                  ? "Dusk · 22°C"
                  : course === "alpine"
                    ? "Clear · 12°C"
                    : "Sunny · 18°C"}
              </span>
            </div>
            <div className="camera-tools" aria-label="Camera view">
              {(
                [
                  { id: "broadcast", label: "Broadcast", icon: Video },
                  { id: "follow", label: "Follow", icon: Focus },
                  { id: "orbit", label: "Free orbit", icon: Maximize2 },
                ] as const
              ).map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setCameraMode(mode.id)}
                  className={cameraMode === mode.id ? "active" : ""}
                  aria-pressed={cameraMode === mode.id}
                >
                  <mode.icon size={15} />
                  <span>{mode.label}</span>
                </button>
              ))}
            </div>
            {race.status === "countdown" && (
              <div className="countdown" aria-live="assertive">
                <span key={Math.ceil(race.countdown)}>
                  {Math.ceil(race.countdown)}
                </span>
                <small>AT THE STARTING LINE</small>
              </div>
            )}
            {race.status === "paused" && (
              <div className="paused-label">
                <Pause size={16} /> Race paused
              </div>
            )}
            <div className="scene-caption">
              <span>
                01 <i />{" "}
                {cameraMode === "follow"
                  ? `Following ${PARTICIPANTS[selected]?.name ?? "the field"}`
                  : cameraMode === "orbit"
                    ? "Drag to explore · Scroll to zoom"
                    : "The best seat in the house"}
              </span>
              <span className="scene-caption-right">
                {reducedMotion ? "REDUCED MOTION" : "REAL-TIME 3D"}
              </span>
            </div>
          </div>
          <div className="race-controls">
            <div className="race-clock">
              <span className="eyebrow">RACE TIME</span>
              <strong>{formatTime(race.elapsed)}</strong>
            </div>
            <div className="lap-status">
              <div>
                <span>
                  {race.status === "ready"
                    ? "Ready when you are"
                    : race.status === "finished"
                      ? "All across the line"
                      : winner
                        ? "The field is coming home"
                        : "One lap. All to play for."}
                </span>
                <strong>{Math.floor(leaderProgress * 100)}%</strong>
              </div>
              <div className="lap-track">
                <span style={{ width: `${leaderProgress * 100}%` }} />
              </div>
            </div>
            <button
              className="reset-race"
              onClick={() => setRace(createRace(PARTICIPANTS.length))}
              aria-label="Reset race"
              title="Reset race"
            >
              <RotateCcw size={18} />
            </button>
            <button
              className="start-race"
              onClick={toggleRace}
              disabled={PARTICIPANTS.length === 0}
            >
              {running ? (
                <Pause size={16} fill="currentColor" />
              ) : (
                <Play size={16} fill="currentColor" />
              )}
              {running
                ? "Pause race"
                : race.status === "paused"
                  ? "Resume race"
                  : race.status === "finished"
                    ? "Race again"
                    : "Start race"}
            </button>
          </div>
        </div>
        <aside className="standings">
          <div className="standings-title">
            <div>
              <span className="eyebrow">THE FIELD</span>
              <h2>
                {race.status === "finished"
                  ? "Final results"
                  : "Live standings"}
              </h2>
            </div>
            <span className="runner-count">{PARTICIPANTS.length}</span>
          </div>
          <div className="standings-columns">
            <span>POS / RUNNER</span>
            <span>{race.status === "finished" ? "TIME" : "PROGRESS"}</span>
          </div>
          <ol className="runner-list">
            {ranking.map((runner, index) => {
              const participant = PARTICIPANTS[runner.id];
              return (
                <li key={runner.id}>
                  <button
                    className={`runner-row ${selected === runner.id ? "selected" : ""}`}
                    onClick={() => setSelected(runner.id)}
                    aria-pressed={selected === runner.id}
                    aria-label={`Follow ${participant.name}`}
                  >
                    <span
                      className={`rank ${index === 0 && race.status !== "ready" ? "first" : ""}`}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span
                      className="silk"
                      style={{ "--silk": participant.color } as CSSProperties}
                    >
                      <span>{runner.id + 1}</span>
                    </span>
                    <span className="runner-info">
                      <strong>{participant.name}</strong>
                      <span className="runner-progress">
                        <i
                          style={{
                            width: `${runner.progress * 100}%`,
                            background: participant.color,
                          }}
                        />
                      </span>
                    </span>
                    <span className="runner-value">
                      {runner.finishTime !== null
                        ? `${runner.finishTime.toFixed(2)}s`
                        : `${Math.floor(runner.progress * 100)}%`}
                      {selected === runner.id && <Focus size={10} />}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
          <div className="standings-note" aria-live="polite">
            {winner ? (
              <>
                <Trophy size={19} />
                <span>
                  <strong>{winner.name} takes the crown!</strong>
                  {race.status === "finished"
                    ? "What a run. Fancy another?"
                    : "Waiting for the rest of the field…"}
                </span>
              </>
            ) : (
              <>
                <Focus size={18} />
                <span>
                  <strong>Have a favorite?</strong>Select a runner, then try
                  Follow cam.
                </span>
              </>
            )}
          </div>
        </aside>
      </section>
      <section className="course-section" aria-label="Choose your course">
        <div className="section-heading">
          <h2>A change of scenery.</h2>
          <span>
            {locked
              ? "Finish or reset to change courses"
              : "THREE COURSES. SAME THRILL."}
          </span>
        </div>
        <div className="course-options">
          {COURSES.map((entry, index) => (
            <button
              key={entry.id}
              className={`course-card course-${entry.id} ${course === entry.id ? "chosen" : ""}`}
              disabled={locked}
              aria-pressed={course === entry.id}
              onClick={() => {
                setCourse(entry.id);
                setRace(createRace(PARTICIPANTS.length));
              }}
            >
              <span className="course-art">
                <entry.icon size={34} strokeWidth={1.25} />
                <span className="mini-track" />
              </span>
              <span className="course-description">
                <span className="course-tag">
                  0{index + 1} / {entry.tag}
                </span>
                <strong>{entry.name}</strong>
                <small>{entry.detail}</small>
              </span>
              <span className="course-select">
                {course === entry.id ? (
                  <Check size={17} />
                ) : (
                  <ArrowRight size={17} />
                )}
              </span>
            </button>
          ))}
        </div>
      </section>
      <footer className="race-footer">
        <span>
          Made for the photo finish. <span className="footer-separator">/</span>{" "}
          Just for fun. No stakes attached.
        </span>
        <a href="/models/horse.glb" download="racing-club-horse.glb">
          <ArrowDownToLine size={13} /> Get the 3D horse <span>GLB</span>
        </a>
      </footer>
    </main>
  );
}
