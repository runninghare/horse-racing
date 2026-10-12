import { useEffect, useId, useLayoutEffect, useRef } from "react";
import type { WheelEntry } from "../wheel/model";

export interface WheelSpin {
  id: string;
  entries: WheelEntry[];
  winnerIndex: number;
  rotation: number;
}

interface WheelDiscProps {
  entries: WheelEntry[];
  spin: WheelSpin | null;
  reducedMotion: boolean;
  onComplete: (id: string) => void;
  onTick: () => void;
}

function point(angle: number, radius: number) {
  const radians = (angle * Math.PI) / 180;
  return [260 + radius * Math.sin(radians), 260 - radius * Math.cos(radians)];
}

function wedge(index: number, count: number) {
  const [x1, y1] = point((index * 360) / count, 214);
  const [x2, y2] = point(((index + 1) * 360) / count, 214);
  return `M260 260 L${x1} ${y1} A214 214 0 ${count < 2 ? 1 : 0} 1 ${x2} ${y2} Z`;
}

function textColor(hex: string) {
  const rgb = [1, 3, 5].map((offset) =>
    parseInt(hex.slice(offset, offset + 2), 16),
  );
  return rgb[0] * 0.299 + rgb[1] * 0.587 + rgb[2] * 0.114 < 145
    ? "#fffaf0"
    : "#2d493c";
}

/** Fixed pointer + immutable spin snapshot keep the visible result truthful. */
export function WheelDisc({
  entries,
  spin,
  reducedMotion,
  onComplete,
  onTick,
}: WheelDiscProps) {
  const id = useId().replace(/:/g, "");
  const rotor = useRef<SVGGElement>(null);
  const pointer = useRef<SVGGElement>(null);
  const completedSpin = useRef<string | null>(null);
  const callbacks = useRef({ onComplete, onTick });
  useLayoutEffect(() => {
    callbacks.current = { onComplete, onTick };
  });

  useEffect(() => {
    const node = rotor.current;
    if (!node) return;
    if (!spin) {
      node.setAttribute("transform", "rotate(0 260 260)");
      return;
    }
    if (completedSpin.current === spin.id) {
      node.setAttribute("transform", `rotate(${spin.rotation} 260 260)`);
      return;
    }
    let frame = 0;
    let start: number | null = null;
    let lastSector = -1;
    let pointerAnimation: Animation | undefined;
    const duration = reducedMotion ? 0 : 5400;
    const step = (now: number) => {
      start ??= now;
      const progress =
        duration === 0 ? 1 : Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      const angle = spin.rotation * eased;
      node.setAttribute("transform", `rotate(${angle} 260 260)`);
      const sector = Math.floor(angle / (360 / spin.entries.length));
      if (!reducedMotion && sector !== lastSector && progress < 1) {
        lastSector = sector;
        callbacks.current.onTick();
        pointerAnimation?.cancel();
        pointerAnimation = pointer.current?.animate(
          [{ transform: "rotate(-9deg)" }, { transform: "rotate(0deg)" }],
          { duration: 110, easing: "ease-out" },
        );
      }
      if (progress < 1) frame = requestAnimationFrame(step);
      else {
        completedSpin.current = spin.id;
        callbacks.current.onComplete(spin.id);
      }
    };
    node.setAttribute("transform", "rotate(0 260 260)");
    frame = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(frame);
      pointerAnimation?.cancel();
    };
  }, [spin, reducedMotion]);

  return (
    <svg
      className="lucky-wheel"
      viewBox="0 0 520 540"
      role="img"
      aria-label={`Lucky draw wheel with ${entries.length} guests. The pointer is fixed at the top.`}
    >
      <defs>
        <linearGradient id={`${id}-brass`} x1="0" y1="0" x2=".8" y2="1">
          <stop offset="0" stopColor="#f4dfaa" />
          <stop offset=".38" stopColor="#c6a46b" />
          <stop offset=".65" stopColor="#b08c57" />
          <stop offset="1" stopColor="#e1c28a" />
        </linearGradient>
        <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2=".7" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity=".19" />
          <stop offset=".5" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="1" stopColor="#263e35" stopOpacity=".08" />
        </linearGradient>
        <radialGradient id={`${id}-hub`} cx=".35" cy=".2" r=".9">
          <stop stopColor="#52705b" />
          <stop offset="1" stopColor="#264735" />
        </radialGradient>
      </defs>
      <ellipse
        cx="260"
        cy="512"
        rx="154"
        ry="14"
        fill="#3e5840"
        opacity=".10"
      />
      <path d="M226 445L213 511H307L294 445Z" fill="#a2875b" />
      <path d="M230 445L219 509H300L288 445Z" fill={`url(#${id}-brass)`} />
      <rect x="189" y="508" width="142" height="10" rx="5" fill="#41614a" />
      <circle cx="260" cy="269" r="240" fill="#a38658" />
      <circle cx="260" cy="260" r="240" fill={`url(#${id}-brass)`} />
      <circle cx="260" cy="260" r="231" fill="#f8efd9" />
      <circle cx="260" cy="260" r="218" fill="#b09260" />
      <g
        ref={rotor}
        className="wheel-rotor"
        data-spin-id={spin?.id}
        data-target-rotation={spin?.rotation}
      >
        {entries.length === 0 ? (
          <circle cx="260" cy="260" r="214" fill="#e3e6d5" />
        ) : (
          entries.map((entry, index) => {
            const middle = ((index + 0.5) * 360) / entries.length;
            const maxLength = entries.length > 14 ? 12 : 16;
            const name =
              entry.name.length > maxLength
                ? `${entry.name.slice(0, maxLength - 1)}…`
                : entry.name;
            return (
              <g key={entry.id} data-entry-id={entry.id}>
                {entries.length === 1 ? (
                  <circle cx="260" cy="260" r="214" fill={entry.color} />
                ) : (
                  <path
                    d={wedge(index, entries.length)}
                    fill={entry.color}
                    stroke="#f7efdb"
                    strokeWidth="1.1"
                  />
                )}
                <g
                  transform={`rotate(${middle} 260 260)`}
                  fill={textColor(entry.color)}
                >
                  <circle cx="260" cy="69" r="2.5" opacity=".65" />
                  <text
                    x="260"
                    y="125"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    transform={`rotate(${middle > 180 ? 90 : -90} 260 125)`}
                    fontSize={entries.length > 14 ? 12 : 16}
                    fontWeight="550"
                  >
                    {name}
                  </text>
                </g>
              </g>
            );
          })
        )}
        {Array.from({ length: 48 }, (_, index) => {
          const [x, y] = point(index * 7.5, 224);
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r={index % 2 ? 1.7 : 2.3}
              fill="#a58b60"
              opacity={index % 2 ? 0.45 : 0.85}
            />
          );
        })}
      </g>
      <circle
        cx="260"
        cy="260"
        r="213"
        fill={`url(#${id}-sheen)`}
        pointerEvents="none"
      />
      <circle cx="260" cy="264" r="53" fill="#38503c" opacity=".15" />
      <circle cx="260" cy="260" r="51" fill={`url(#${id}-brass)`} />
      <circle cx="260" cy="260" r="44" fill={`url(#${id}-hub)`} />
      <circle
        cx="260"
        cy="260"
        r="39"
        fill="none"
        stroke="#e1cc98"
        opacity=".35"
        strokeWidth=".7"
      />
      <path
        d="M260 231L262 239L270 241L262 243L260 251L258 243L250 241L258 239Z"
        fill="#e8d39f"
      />
      <text
        x="260"
        y="276"
        textAnchor="middle"
        fill="#faf4e4"
        fontSize="25"
        fontFamily="DM Serif Display, Georgia, serif"
      >
        RC
      </text>
      <g ref={pointer} className="wheel-pointer">
        <path
          d="M244 18Q260 8 276 18L260 63Z"
          fill="#805f38"
          opacity=".15"
          transform="translate(0 3)"
        />
        <path
          d="M246 15Q260 6 274 15L260 57Z"
          fill={`url(#${id}-brass)`}
          stroke="#fff3cd"
          strokeWidth="1.5"
        />
        <circle cx="260" cy="21" r="3.5" fill="#fff6db" />
      </g>
    </svg>
  );
}
