import { lazy, Suspense, useState } from "react";
import { ArrowUpRight, Flag } from "lucide-react";
import HorseRacing from "./HorseRacing";

const SpinningWheel = lazy(() => import("./SpinningWheel"));

export default function App() {
  const [currentGame, setCurrentGame] = useState<"horses" | "wheel">("horses");
  return (
    <>
      <header className="site-header">
        <a
          className="wordmark"
          href="#"
          onClick={(event) => {
            event.preventDefault();
            setCurrentGame("horses");
          }}
          aria-label="Racing Club home"
        >
          <span className="brand-icon">
            <Flag size={21} strokeWidth={1.6} />
          </span>
          Racing Club<span className="brand-period">.</span>
        </a>
        <nav aria-label="Games">
          <button
            onClick={() => setCurrentGame("horses")}
            className={currentGame === "horses" ? "current" : ""}
          >
            The racecourse
          </button>
          <button
            onClick={() => setCurrentGame("wheel")}
            className={currentGame === "wheel" ? "current" : ""}
          >
            Spinning wheel <ArrowUpRight size={13} />
          </button>
        </nav>
        <span className="header-note">GOOD COMPANY. GREAT RACING.</span>
      </header>
      {currentGame === "horses" ? (
        <HorseRacing />
      ) : (
        <Suspense
          fallback={<p className="wheel-loading">Polishing the wheel…</p>}
        >
          <SpinningWheel />
        </Suspense>
      )}
    </>
  );
}
