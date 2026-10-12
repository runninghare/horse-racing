import { useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import {
  AnimationMixer,
  LoopRepeat,
  Mesh,
  type Material,
  type MeshStandardMaterial,
} from "three";

export interface HorseProps {
  silk: string;
  coat: string;
  running: boolean;
  /** Phase offset in radians, matching the simulation's runner phase. */
  phase: number;
  playbackRate?: number;
}

/** The GLB uses rigid animated nodes, so Object3D.clone preserves its entire rig. */
export function Horse({
  silk,
  coat,
  running,
  phase,
  playbackRate = 1,
}: HorseProps) {
  const { scene, animations } = useGLTF("/models/horse.glb");
  const instance = useMemo(() => {
    const root = scene.clone(true);
    const owned = new Map<Material, MeshStandardMaterial>();
    const materialFor = (material: Material) => {
      if (material.name !== "HorseCoat" && material.name !== "JockeySilk")
        return material;
      let clone = owned.get(material);
      if (!clone) {
        clone = material.clone() as MeshStandardMaterial;
        owned.set(material, clone);
      }
      return clone;
    };
    root.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      object.castShadow = true;
      object.receiveShadow = true;
      object.material = Array.isArray(object.material)
        ? object.material.map(materialFor)
        : materialFor(object.material);
    });
    return { root, owned, mixer: new AnimationMixer(root) };
  }, [scene]);

  useEffect(() => {
    instance.owned.forEach((material) => {
      material.color.set(material.name === "HorseCoat" ? coat : silk);
    });
  }, [instance, coat, silk]);

  useEffect(() => {
    const clip = animations.find((animation) => animation.name === "Gallop");
    if (!clip) return;
    const action = instance.mixer.clipAction(clip);
    action.reset().setLoop(LoopRepeat, Infinity).play();
    // Seek once when the phase changes; pausing must not reset the pose.
    action.time = ((((phase / (Math.PI * 2)) % 1) + 1) % 1) * clip.duration;
    instance.mixer.update(0);
    return () => {
      instance.mixer.stopAllAction();
      instance.mixer.uncacheRoot(instance.root);
    };
  }, [animations, instance, phase]);

  useEffect(
    () => () => {
      // All other materials and geometries belong to useGLTF's shared cache.
      instance.owned.forEach((material) => material.dispose());
    },
    [instance],
  );

  useFrame((_, delta) => {
    if (running) instance.mixer.update(Math.min(delta, 0.1) * playbackRate);
  });

  return <primitive object={instance.root} dispose={null} />;
}

useGLTF.preload("/models/horse.glb");
