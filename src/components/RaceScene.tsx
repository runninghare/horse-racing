import {
  memo,
  Suspense,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Html, OrbitControls } from "@react-three/drei";
import {
  BoxGeometry,
  BufferAttribute,
  BufferGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  ExtrudeGeometry,
  IcosahedronGeometry,
  InstancedMesh,
  MathUtils,
  Object3D,
  Path,
  PerspectiveCamera,
  Shape,
  ShapeGeometry,
  Vector3,
} from "three";
import { coursePoint, type RaceState } from "../race/simulation.ts";
import { Horse } from "./Horse";

export interface RaceSceneProps {
  race: RaceState;
  course: "meadow" | "sunset" | "alpine";
  cameraMode: "broadcast" | "follow" | "orbit";
  selected: number;
  participants: { name: string; color: string }[];
  reducedMotion: boolean;
}

type Theme = typeof THEMES.meadow;
type XYZ = [number, number, number];
type Instance = { position: XYZ; scale: XYZ; color: string; rotation?: XYZ };
const HALF_STRAIGHT = 17;
const INNER_RADIUS = 12;
const LANE_WIDTH = 1.35;
const SURFACE = 0.08;
const COATS = [
  "#804b30",
  "#3a2927",
  "#b77b49",
  "#e0d1b8",
  "#563222",
  "#a56538",
  "#353330",
  "#8d5140",
];
const THEMES = {
  meadow: {
    sky: "#dcecef",
    grass: "#84ad69",
    grassLight: "#a6c584",
    earth: "#bea27b",
    base: "#e2d5b7",
    track: "#c58c63",
    lane: "#e6bf95",
    leaf: "#427b59",
    leafLight: "#689b64",
    water: "#68b6c3",
    roof: "#376b68",
    flower: "#f0c56e",
    light: "#fff4d9",
  },
  sunset: {
    sky: "#eed7d1",
    grass: "#aaa579",
    grassLight: "#c4b58c",
    earth: "#bb846f",
    base: "#e5bca2",
    track: "#b7745e",
    lane: "#e2ac8e",
    leaf: "#7b8257",
    leafLight: "#aaa064",
    water: "#929eb4",
    roof: "#935a59",
    flower: "#f6c699",
    light: "#ffd3aa",
  },
  alpine: {
    sky: "#d9e6ed",
    grass: "#7b9c87",
    grassLight: "#a6b8a0",
    earth: "#8e9689",
    base: "#c8cec4",
    track: "#b8997b",
    lane: "#dbc7ad",
    leaf: "#315f55",
    leafLight: "#4f7b69",
    water: "#78b1c2",
    roof: "#395a67",
    flower: "#e8d5a4",
    light: "#eef7ff",
  },
};

/** Shape-space Y becomes -Z. Both semicircles have their centers at X = ±17. */
function capsule(radius: number, target: Shape | Path = new Shape()) {
  target.moveTo(-HALF_STRAIGHT, -radius);
  target.lineTo(HALF_STRAIGHT, -radius);
  target.absarc(HALF_STRAIGHT, 0, radius, -Math.PI / 2, Math.PI / 2, false);
  target.lineTo(-HALF_STRAIGHT, radius);
  target.absarc(-HALF_STRAIGHT, 0, radius, Math.PI / 2, Math.PI * 1.5, false);
  target.closePath();
  return target;
}

function ringGeometry(inner: number, outer: number) {
  const shape = capsule(outer) as Shape;
  shape.holes.push(capsule(inner, new Path()));
  return new ShapeGeometry(shape, 64);
}

function boundaryPoint(t: number, radius: number): XYZ {
  // Reuse the simulation's parameterization even for the fence boundaries.
  const point = coursePoint(t, (radius - INNER_RADIUS) / LANE_WIDTH - 0.5, 8);
  return [point.x, 0, point.z];
}

/** Static scenery uses a handful of instanced draw calls instead of hundreds of meshes. */
function Batch({
  items,
  kind = "box",
}: {
  items: Instance[];
  kind?: "box" | "cone" | "trunk" | "foliage";
}) {
  const ref = useRef<InstancedMesh>(null);
  const geometry = useMemo(() => {
    if (kind === "cone") return new ConeGeometry(1, 1, 7);
    if (kind === "trunk") return new CylinderGeometry(0.75, 1, 1, 6);
    if (kind === "foliage") return new IcosahedronGeometry(1, 0);
    return new BoxGeometry(1, 1, 1);
  }, [kind]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useLayoutEffect(() => {
    if (!ref.current) return;
    const object = new Object3D();
    const color = new Color();
    items.forEach((item, index) => {
      object.position.set(...item.position);
      object.scale.set(...item.scale);
      object.rotation.set(...(item.rotation ?? [0, 0, 0]));
      object.updateMatrix();
      ref.current!.setMatrixAt(index, object.matrix);
      ref.current!.setColorAt(index, color.set(item.color));
    });
    ref.current.instanceMatrix.needsUpdate = true;
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
    ref.current.computeBoundingSphere();
  }, [items]);
  return (
    <instancedMesh
      ref={ref}
      args={[geometry, undefined, items.length]}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial roughness={0.88} flatShading />
    </instancedMesh>
  );
}

function Railings({ outer }: { outer: number }) {
  const items = useMemo(() => {
    const result: Instance[] = [];
    for (const radius of [INNER_RADIUS - 0.12, outer + 0.12]) {
      const perimeter = 4 * HALF_STRAIGHT + 2 * Math.PI * radius;
      const segments = Math.ceil(perimeter / 2.3);
      for (let i = 0; i < segments; i++) {
        const a = boundaryPoint(i / segments, radius);
        const b = boundaryPoint((i + 1) / segments, radius);
        result.push({
          position: [a[0], 0.57, a[2]],
          scale: [0.12, 1.12, 0.12],
          color: "#fff5df",
        });
        const dx = b[0] - a[0];
        const dz = b[2] - a[2];
        for (const height of [0.48, 0.96]) {
          result.push({
            position: [(a[0] + b[0]) / 2, height, (a[2] + b[2]) / 2],
            scale: [Math.hypot(dx, dz) + 0.06, 0.095, 0.085],
            rotation: [0, -Math.atan2(dz, dx), 0],
            color: "#fff5df",
          });
        }
      }
    }
    return result;
  }, [outer]);
  return <Batch items={items} />;
}

function Pond({ theme }: { theme: Theme }) {
  const geometry = useMemo(() => {
    const shape = new Shape();
    shape.moveTo(-5, 0);
    shape.bezierCurveTo(-6, 3, -2, 4.4, 1, 3);
    shape.bezierCurveTo(3, 2.4, 6, 2.4, 5.5, 0);
    shape.bezierCurveTo(5, -2.5, 2, -3.1, -0.5, -2.2);
    shape.bezierCurveTo(-3, -3.2, -5.6, -2, -5, 0);
    return new ShapeGeometry(shape, 28);
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <group position={[-7, 0, 0.2]} rotation={[0, -0.2, 0]}>
      <mesh
        geometry={geometry}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.021, 0]}
        scale={1.13}
        receiveShadow
      >
        <meshStandardMaterial color={theme.base} roughness={0.95} />
      </mesh>
      <mesh
        geometry={geometry}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.035, 0]}
        receiveShadow
      >
        <meshStandardMaterial
          color={theme.water}
          roughness={0.3}
          metalness={0.18}
        />
      </mesh>
      {[
        [-2.2, 1.1, 0.65],
        [1.8, -0.7, 0.95],
        [3, 0.7, 0.4],
      ].map(([x, z, scale], i) => (
        <mesh
          key={i}
          position={[x, 0.048, z]}
          rotation={[-Math.PI / 2, 0, 0]}
          scale={[scale * 1.7, scale, 1]}
        >
          <ringGeometry args={[0.96, 1, 40]} />
          <meshBasicMaterial
            color="#d6eeeb"
            transparent
            opacity={0.45}
            depthWrite={false}
          />
        </mesh>
      ))}
      <mesh position={[-2.8, 0.07, -1.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.38, 7]} />
        <meshStandardMaterial color={theme.leaf} />
      </mesh>
    </group>
  );
}

function Scenery({
  theme,
  outer,
  alpine,
}: {
  theme: Theme;
  outer: number;
  alpine: boolean;
}) {
  const scenery = useMemo(() => {
    const boxes: Instance[] = [];
    const trunks: Instance[] = [];
    const leaves: Instance[] = [];
    const cones: Instance[] = [];
    const rocks: Instance[] = [];
    const cream = "#fff3da";
    const box = (position: XYZ, scale: XYZ, color: string, rotation?: XYZ) =>
      boxes.push({ position, scale, color, rotation });
    // Tiered pavilion: track-facing seating, slim columns and a floating canopy.
    for (let tier = 0; tier < 4; tier++) {
      const z = -outer - 1.7 - tier * 0.95;
      const height = 0.45 + tier * 0.65;
      box([0, height / 2, z], [28, height, 1.05], theme.base);
      box(
        [0, height + 0.11, z - 0.15],
        [27.4, 0.18, 0.5],
        tier % 2 ? theme.roof : theme.earth,
      );
      for (let seat = 0; seat < 23; seat++) {
        if ((seat * 3 + tier) % 7 === 0) continue;
        const x = -12.5 + seat * 1.12;
        const color = [theme.roof, cream, theme.flower, "#c38373", theme.leaf][
          (seat + tier * 3) % 5
        ];
        rocks.push({
          position: [x, height + 0.55, z - 0.18],
          scale: [0.23, 0.38, 0.24],
          color,
        });
        rocks.push({
          position: [x, height + 0.94, z - 0.18],
          scale: [0.17, 0.19, 0.17],
          color: "#d2ad8d",
        });
      }
    }
    for (const x of [-14.1, -7, 7, 14.1]) {
      box([x, 3, -outer - 5], [0.18, 6, 0.18], cream);
      box([x, 2.9, -outer - 0.9], [0.15, 5.8, 0.15], cream);
    }
    box([0, 5.95, -outer - 3], [30.5, 0.32, 5.7], theme.roof, [-0.055, 0, 0]);
    box([0, 5.83, -outer - 0.15], [30.5, 0.32, 0.16], cream);
    for (let stripe = 0; stripe < 15; stripe++) {
      box(
        [-14 + stripe * 2, 6.16, -outer - 3],
        [0.1, 0.04, 5.65],
        theme.grassLight,
        [-0.055, 0, 0],
      );
    }
    // Small hospitality pavilions at either end of the grandstand.
    for (const x of [-19, 19]) {
      box([x, 1.25, -outer - 3.2], [3, 2.5, 3], cream);
      box([x, 1.4, -outer - 1.67], [1.8, 1, 0.04], theme.roof);
      cones.push({
        position: [x, 3.1, -outer - 3.2],
        scale: [2.6, 1.4, 2.6],
        color: theme.roof,
      });
    }
    // Infield promenade and clipped garden beds.
    box([8, 0.026, 0], [2.4, 0.045, 17.8], theme.base);
    box([12, 0.028, -4], [10, 0.045, 1.55], theme.base);
    for (const z of [-7.6, 7.6]) {
      box([15.5, 0.2, z], [9, 0.4, 1.2], theme.leaf);
      for (let i = 0; i < 22; i++) {
        rocks.push({
          position: [11.5 + i * 0.38, 0.56, z + Math.sin(i * 2.7) * 0.25],
          scale: [0.22, 0.2, 0.22],
          color: i % 3 ? theme.flower : "#f4eee0",
        });
      }
    }
    for (const x of [4.5, 11.5]) {
      for (const z of [-1.5, 3.5]) {
        box([x, 0.5, z], [1.8, 0.15, 0.65], theme.earth);
        box([x, 0.9, z - 0.3], [1.8, 0.6, 0.1], theme.earth);
        box([x - 0.6, 0.24, z], [0.12, 0.48, 0.5], theme.roof);
        box([x + 0.6, 0.24, z], [0.12, 0.48, 0.5], theme.roof);
      }
    }
    // All positions are deterministic; no render-time randomness or remote assets.
    const trees: [number, number, number][] = [
      [-21, -4, 1.1],
      [-24, 0, 0.85],
      [-19, 4.5, 0.95],
      [-15, -7, 0.8],
      [23, 0, 0.85],
      [21, 4, 1],
      [19, -7, 0.8],
      [-24, -outer - 2, 1],
      [25, -outer - 1, 0.85],
      [-27, outer, 0.8],
      [-20, outer + 4, 1],
      [22, outer + 3.8, 0.8],
      [29, outer - 0.6, 0.9],
      [-outer - 19, -4, 1.05],
      [outer + 19, 1, 1],
      [outer + 17, -8, 0.75],
    ];
    trees.forEach(([x, z, size], i) => {
      trunks.push({
        position: [x, 1.1 * size, z],
        scale: [0.22 * size, 2.2 * size, 0.22 * size],
        color: "#81684c",
      });
      if (alpine) {
        for (let tier = 0; tier < 3; tier++) {
          cones.push({
            position: [x, (2 + tier * 0.85) * size, z],
            scale: [
              (1.5 - tier * 0.3) * size,
              2.5 * size,
              (1.5 - tier * 0.3) * size,
            ],
            color: tier % 2 ? theme.leafLight : theme.leaf,
          });
        }
      } else {
        leaves.push({
          position: [x, 3.1 * size, z],
          scale: [1.75 * size, 2.2 * size, 1.5 * size],
          color: i % 2 ? theme.leafLight : theme.leaf,
          rotation: [0, i * 0.7, 0.1],
        });
        leaves.push({
          position: [x + 0.8 * size, 2.75 * size, z + 0.2],
          scale: [1.25 * size, 1.5 * size, 1.3 * size],
          color: theme.leafLight,
        });
      }
    });
    for (let i = 0; i < 35; i++) {
      const angle = i * 2.39996;
      const x = -7 + Math.cos(angle) * (6.3 + (i % 3) * 0.23);
      const z = 0.2 + Math.sin(angle) * 3.8;
      rocks.push({
        position: [x, 0.15, z],
        scale: [0.4 + (i % 3) * 0.12, 0.28, 0.38],
        color: i % 3 ? theme.base : theme.earth,
      });
    }
    // Small garden flags: no moving fabric when reduced motion is requested.
    for (let i = 0; i < 5; i++) {
      const x = -8 + i * 5;
      box([x, 2, -8.8], [0.08, 4, 0.08], cream);
      box(
        [x + 0.65, 3.5, -8.8],
        [1.3, 0.75, 0.035],
        i % 2 ? theme.flower : theme.roof,
      );
    }
    if (alpine) {
      for (let i = 0; i < 3; i++) {
        const height = 5.5 + i * 1.1;
        const x = -22 + i * 3;
        cones.push({
          position: [x, height / 2, -5],
          scale: [3.1, height, 2.6],
          color: i % 2 ? "#7d938c" : "#8ca39b",
        });
        cones.push({
          position: [x, height * 0.84, -5],
          scale: [0.99, height * 0.32, 0.83],
          color: "#eef1e7",
        });
      }
    }
    return { boxes, trunks, leaves, cones, rocks };
  }, [theme, outer, alpine]);
  return (
    <>
      <Batch items={scenery.boxes} />
      <Batch items={scenery.trunks} kind="trunk" />
      {scenery.leaves.length > 0 && (
        <Batch items={scenery.leaves} kind="foliage" />
      )}
      <Batch items={scenery.cones} kind="cone" />
      <Batch items={scenery.rocks} kind="foliage" />
      <Pond theme={theme} />
    </>
  );
}

function Finish({ outer, theme }: { outer: number; theme: Theme }) {
  const items = useMemo(() => {
    const result: Instance[] = [];
    const width = outer - INNER_RADIUS;
    const cells = Math.ceil(width / 0.6);
    for (let row = 0; row < cells; row++) {
      for (let col = 0; col < 3; col++) {
        result.push({
          position: [
            -0.6 + col * 0.6,
            SURFACE + 0.006,
            INNER_RADIUS + ((row + 0.5) * width) / cells,
          ],
          scale: [0.6, 0.012, width / cells],
          color: (row + col) % 2 ? "#55534b" : "#fff3da",
        });
      }
    }
    // The uprights are OUTSIDE the racing lanes; clear height is over four horses.
    for (const z of [INNER_RADIUS - 0.6, outer + 0.6]) {
      result.push({
        position: [0, 2.8, z],
        scale: [0.27, 5.6, 0.27],
        color: "#fff3da",
      });
      result.push({
        position: [0, 0.25, z],
        scale: [0.75, 0.5, 0.75],
        color: theme.roof,
      });
    }
    result.push({
      position: [0, 5.6, (INNER_RADIUS + outer) / 2],
      scale: [0.4, 0.7, width + 1.7],
      color: theme.roof,
    });
    for (let i = 0; i < 7; i++) {
      result.push({
        position: [0.211, 5.61, (INNER_RADIUS + outer) / 2 + (i - 3) * 0.38],
        scale: [0.025, 0.25, 0.2],
        color: "#fff3da",
      });
    }
    return result;
  }, [outer, theme]);
  return <Batch items={items} />;
}

const Racecourse = memo(function Racecourse({
  course,
  count,
}: {
  course: RaceSceneProps["course"];
  count: number;
}) {
  const theme = THEMES[course];
  const outer = INNER_RADIUS + Math.max(1, count) * LANE_WIDTH;
  const geometry = useMemo(() => {
    const island = capsule(outer + 7.5) as Shape;
    return {
      island: new ExtrudeGeometry(island, {
        depth: 1.65,
        bevelEnabled: true,
        bevelSize: 0.6,
        bevelThickness: 0.45,
        bevelSegments: 1,
        steps: 1,
        curveSegments: 48,
      }),
      bottom: new ExtrudeGeometry(capsule(outer + 6.7) as Shape, {
        depth: 0.7,
        bevelEnabled: true,
        bevelSize: 0.6,
        bevelThickness: 0.35,
        bevelSegments: 1,
        steps: 1,
        curveSegments: 48,
      }),
      lawn: new ShapeGeometry(island, 64),
      track: ringGeometry(INNER_RADIUS, outer),
      path: ringGeometry(outer + 1.25, outer + 2.05),
      lanes: Array.from({ length: Math.max(0, count - 1) }, (_, i) =>
        ringGeometry(
          INNER_RADIUS + (i + 1) * LANE_WIDTH - 0.025,
          INNER_RADIUS + (i + 1) * LANE_WIDTH + 0.025,
        ),
      ),
    };
  }, [outer, count]);
  useEffect(
    () => () => {
      geometry.island.dispose();
      geometry.bottom.dispose();
      geometry.lawn.dispose();
      geometry.track.dispose();
      geometry.path.dispose();
      geometry.lanes.forEach((lane) => lane.dispose());
    },
    [geometry],
  );
  return (
    <group>
      <mesh
        geometry={geometry.bottom}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -3.2, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={theme.base} roughness={1} flatShading />
      </mesh>
      <mesh
        geometry={geometry.island}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -2.15, 0]}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial color={theme.earth} roughness={1} flatShading />
      </mesh>
      <mesh
        geometry={geometry.lawn}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <meshStandardMaterial color={theme.grass} roughness={1} />
      </mesh>
      <mesh
        geometry={geometry.path}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.012, 0]}
        receiveShadow
      >
        <meshStandardMaterial color={theme.base} roughness={1} />
      </mesh>
      <mesh
        geometry={geometry.track}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, SURFACE, 0]}
        receiveShadow
      >
        <meshStandardMaterial color={theme.track} roughness={1} />
      </mesh>
      {geometry.lanes.map((lane, i) => (
        <mesh
          key={i}
          geometry={lane}
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, SURFACE + 0.004, 0]}
        >
          <meshStandardMaterial
            color={theme.lane}
            transparent
            opacity={0.42}
            depthWrite={false}
          />
        </mesh>
      ))}
      <Railings outer={outer} />
      <Scenery theme={theme} outer={outer} alpine={course === "alpine"} />
      <Finish outer={outer} theme={theme} />
    </group>
  );
});

function Dust({ active, phase }: { active: boolean; phase: number }) {
  const geometry = useMemo(() => {
    const result = new BufferGeometry();
    result.setAttribute(
      "position",
      new BufferAttribute(new Float32Array(18 * 3), 3),
    );
    return result;
  }, []);
  const time = useRef(phase);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useFrame((_, delta) => {
    if (!active) return;
    time.current += Math.min(delta, 0.1);
    const position = geometry.getAttribute("position");
    for (let i = 0; i < position.count; i++) {
      const age = (time.current * 0.85 + i / position.count) % 1;
      position.setXYZ(
        i,
        -0.7 - age * 3.5,
        0.12 + age * 0.6,
        Math.sin(i * 4.7) * (0.15 + age * 0.6),
      );
    }
    position.needsUpdate = true;
  });
  return (
    <points geometry={geometry} visible={active} frustumCulled={false}>
      <pointsMaterial
        color="#f3d6ad"
        size={0.19}
        transparent
        opacity={0.32}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}

function Runner({
  runner,
  count,
  raceStatus,
  participant,
  selected,
  reducedMotion,
}: {
  runner: RaceState["runners"][number];
  count: number;
  raceStatus: RaceState["status"];
  participant: RaceSceneProps["participants"][number];
  selected: boolean;
  reducedMotion: boolean;
}) {
  const point = coursePoint(Math.min(runner.progress, 1), runner.id, count);
  const moving =
    raceStatus === "racing" &&
    runner.finishTime === null &&
    runner.progress < 1;
  return (
    <group
      position={[point.x, SURFACE + 0.015, point.z]}
      rotation={[0, point.heading, 0]}
    >
      <group scale={0.94}>
        <Horse
          coat={COATS[runner.id % COATS.length]}
          silk={participant.color}
          running={moving && !reducedMotion}
          phase={runner.phase}
        />
      </group>
      <Dust active={moving && !reducedMotion} phase={runner.phase} />
      {selected && (
        <>
          <mesh
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.025, 0]}
            scale={[1.55, 0.69, 1]}
          >
            <ringGeometry args={[0.88, 1, 48]} />
            <meshBasicMaterial
              color={participant.color}
              transparent
              opacity={0.85}
              depthWrite={false}
            />
          </mesh>
          <Html
            position={[0, 3.1, 0]}
            center
            zIndexRange={[20, 0]}
            style={{ pointerEvents: "none" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "5px 9px",
                borderRadius: 20,
                background: "rgba(255, 251, 240, .95)",
                color: "#283c35",
                whiteSpace: "nowrap",
                font: "600 10px/1.1 system-ui, sans-serif",
                boxShadow: "0 2px 10px #233a2820",
                border: "1px solid rgba(255,255,255,.8)",
                pointerEvents: "none",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: participant.color,
                }}
              />
              {participant.name}
            </div>
          </Html>
        </>
      )}
    </group>
  );
}

function CameraRig({
  race,
  cameraMode,
  selected,
  reducedMotion,
}: Pick<RaceSceneProps, "race" | "cameraMode" | "selected" | "reducedMotion">) {
  const { camera, size } = useThree();
  const target = useRef(new Vector3());
  const initialized = useRef(false);
  const vectors = useMemo(
    () => ({ position: new Vector3(), look: new Vector3() }),
    [],
  );
  const broadcast = useMemo(() => {
    const direction = new Vector3(62, 64, 76).normalize();
    const right = new Vector3()
      .crossVectors(new Vector3(0, 1, 0), direction)
      .normalize();
    const up = new Vector3().crossVectors(direction, right);
    const tanVertical = Math.tan(MathUtils.degToRad(42 / 2));
    const tanHorizontal = (tanVertical * size.width) / Math.max(1, size.height);
    let distance = 105;
    const radius =
      INNER_RADIUS + Math.max(1, race.runners.length) * LANE_WIDTH + 8.5;
    for (let i = 0; i < 100; i++) {
      const [x, , z] = boundaryPoint(i / 100, radius);
      for (const y of [-3.5, 6.5]) {
        const p = new Vector3(x, y, z);
        const depth = p.dot(direction);
        distance = Math.max(
          distance,
          Math.abs(p.dot(right)) / tanHorizontal + depth,
          Math.abs(p.dot(up)) / tanVertical + depth,
        );
      }
    }
    return direction.multiplyScalar(distance * 1.07);
  }, [size.width, size.height, race.runners.length]);

  useFrame((_, delta) => {
    if (cameraMode === "orbit") return;
    const runner =
      race.runners.find((entry) => entry.id === selected) ?? race.runners[0];
    if (cameraMode === "follow" && runner) {
      const point = coursePoint(
        Math.min(runner.progress, 1),
        runner.id,
        race.runners.length,
      );
      const dx = Math.cos(point.heading);
      const dz = -Math.sin(point.heading);
      const mobile = size.width < 600 ? 1.25 : 1;
      vectors.position.set(
        point.x + (-dx * 9 + dz * 7) * mobile,
        8.5 * mobile,
        point.z + (-dz * 9 - dx * 7) * mobile,
      );
      vectors.look.set(point.x + dx * 3, 1.15, point.z + dz * 3);
    } else {
      vectors.position.copy(broadcast);
      vectors.look.set(0, 0, 0);
    }
    const alpha =
      reducedMotion || !initialized.current ? 1 : 1 - Math.exp(-delta * 4);
    camera.position.lerp(vectors.position, alpha);
    target.current.lerp(vectors.look, alpha);
    camera.lookAt(target.current);
    initialized.current = true;
  });

  // Entering orbit from follow should still give a useful whole-course view.
  useLayoutEffect(() => {
    if (cameraMode === "orbit" || !initialized.current) {
      camera.position.copy(broadcast);
      camera.lookAt(0, 0, 0);
      target.current.set(0, 0, 0);
    }
    if (camera instanceof PerspectiveCamera) camera.updateProjectionMatrix();
  }, [camera, cameraMode, broadcast]);

  return cameraMode === "orbit" ? (
    <OrbitControls
      makeDefault
      target={[0, 0, 0]}
      enablePan={false}
      enableDamping={!reducedMotion}
      dampingFactor={0.075}
      minDistance={35}
      maxDistance={240}
      minPolarAngle={0.2}
      maxPolarAngle={Math.PI / 2.25}
    />
  ) : null;
}

function World(props: RaceSceneProps) {
  const theme = THEMES[props.course];
  const shadowSpan = Math.max(58, 25 + props.race.runners.length * LANE_WIDTH);
  return (
    <>
      <color attach="background" args={[theme.sky]} />
      <fog attach="fog" args={[theme.sky, 170, 330]} />
      <ambientLight intensity={0.65} />
      <hemisphereLight args={["#fff9ed", theme.leaf, 1.6]} />
      <directionalLight
        position={[-35, 65, 35]}
        color={theme.light}
        intensity={2.6}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-shadowSpan}
        shadow-camera-right={shadowSpan}
        shadow-camera-top={shadowSpan}
        shadow-camera-bottom={-shadowSpan}
        shadow-camera-near={1}
        shadow-camera-far={180}
        shadow-normalBias={0.04}
        shadow-bias={-0.00015}
      />
      <directionalLight
        position={[30, 15, -35]}
        color={theme.sky}
        intensity={0.7}
      />
      <Racecourse course={props.course} count={props.race.runners.length} />
      <Suspense
        fallback={
          <Html center style={{ pointerEvents: "none" }}>
            <div
              style={{
                background: "#fff9ed",
                padding: "10px 16px",
                borderRadius: 30,
                color: "#375247",
                font: "12px system-ui",
                whiteSpace: "nowrap",
              }}
            >
              Saddling up…
            </div>
          </Html>
        }
      >
        {props.race.runners.map((runner) => (
          <Runner
            key={runner.id}
            runner={runner}
            count={props.race.runners.length}
            raceStatus={props.race.status}
            participant={
              props.participants[runner.id] ?? {
                name: `Horse ${runner.id + 1}`,
                color: "#416d83",
              }
            }
            selected={runner.id === props.selected}
            reducedMotion={props.reducedMotion}
          />
        ))}
      </Suspense>
      <CameraRig
        race={props.race}
        cameraMode={props.cameraMode}
        selected={props.selected}
        reducedMotion={props.reducedMotion}
      />
    </>
  );
}

export default function RaceScene(props: RaceSceneProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ position: [62, 64, 76], fov: 42, near: 0.1, far: 450 }}
      gl={{
        antialias: true,
        alpha: false,
        powerPreference: "high-performance",
      }}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        touchAction: props.cameraMode === "orbit" ? "none" : "auto",
      }}
    >
      <World {...props} />
    </Canvas>
  );
}
