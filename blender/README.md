# Silks — animated low-poly thoroughbred

## Deliverables

- `../public/models/horse.glb` — self-contained, texture-free GLB, **422,360 bytes**, **5,402 triangles**, 81 rigid meshes.
- `horse.blend` — complete source with preview-only camera, area lights and ground.
- `horse.blend-cli.json` — authoritative scene source: materials, mesh topology, hierarchy, preview settings and animation specification.
- `horse_scene.py` — complete reproducible bpy script assembled from the CLI-generated `cli_render.py` and `finish_scene.py`.
- `Horse.generated.jsx` — gltfjsx 6.5.3 reference component, named `Horse`, corrected runtime URL `/models/horse.glb`, with Gallop playback. The typed app component is `../src/components/Horse.tsx`; it clones the exported hierarchy to preserve rigid animation tracks.
- `previews/hero.png` — inspected 1400×1100 Cycles hero render.
- `previews/workbench.png` — real Blender Workbench preview.
- `previews/gallop-contact-sheet.png` — six inspected side-view phases.
- `validation.json` — independent Three.js GLTFLoader + AnimationMixer validation.
- `manifest.json` — full node/material inventory and Blender measurements.

## Coordinates / bounds

Exported Three.js space: **+X forward, +Y up**, centered laterally on Z=0. The feet contact **Y=0**; root has no locomotion translation, so the app controls race position.

Default-pose exact mesh bounds:

- minimum: `[-1.46002, 0, -0.41286]`
- maximum: `[1.51273, 2.41743, 0.41286]`
- dimensions X/Y/Z: **2.97275 × 2.41743 × 0.82572**

Gallop envelope: approximately X `[-1.70830, 1.52623]`, Y `[0, 2.58570]`, Z `[-0.41286, 0.41286]`.
The 241-sample Three.js check sees less than 0.00037 units of numerical/interpolated ground penetration between baked keys. Suspension raises the lowest hoof about 0.09 units.

## Animation

Exactly one clip: **`Gallop`**, **0.8 seconds**, seamless repeat, 120 Hz baking, 97 poses including matching endpoints, 20 tracks. Four upper/lower/foot chains, body bob/pitch, head nod, three tail joints and independent jockey bob/pitch. No skeleton or skin is required.

Use `actions.Gallop.play()` with drei `useAnimations`. Three's default action loop is `LoopRepeat`. For many racers, clone the scene and use a mixer per clone; clone recolorable materials per racer as well. Moving the outer instance +X produces forward locomotion. Lowering the clip time scale gives a slower run.

## Integration names

### Recolorable materials

| Material | Visible use |
|---|---|
| **`HorseCoat`** | Body, neck, head, ears and brown leg sections |
| **`JockeySilk`** | Jockey torso/sleeves, helmet, saddlecloth panels |
| **`SilkTrim`** | Cuffs, helmet stripe and cloth piping |
| `Leather` | Saddle, bridle, reins, muzzle and stirrup straps |
| `ManeTail` | Mane and articulated tail |
| `Hooves` | Four hooves |
| `Ivory` | Blaze, socks and cloth diamonds |
| `Breeches` | Rider trousers |
| `BootsGloves` | Rider boots/gloves, visor and goggle straps |
| `Skin` | Rider face |
| `Eyes` | Horse eyes and nostrils |
| `Brass` | Bit rings and stirrups |
| `Goggles` | Goggle lens |
| `EarInner` | Ear inset triangles |

`JockeySilk` intentionally coordinates jockey and saddlecloth colors. To recolor them independently, assign a cloned material to `SaddleClothNear` / `SaddleClothFar`.

### Primary nodes

- `HorseRoot` → `BodyMotion`
- `HorseBody` (unified faceted torso, chest, haunches and slanted neck)
- `HeadPivot` → `HorseHead`, `Muzzle`, `EarNear/Far`, `EyeNear/Far`, `ForeheadBlaze` and bridle details
- `FrontNearUpper`, `FrontFarUpper`, `HindNearUpper`, `HindFarUpper`, each with matching `Lower` and `Foot` child groups
- `TailJoint1` → `TailJoint2` → `TailJoint3`, each with a `TailLock` mesh
- `JockeyPivot` → `JockeyTorso`, `Helmet`, `JockeyFace`, `JockeySleeveNear/Far`, `JockeyThighNear/Far`, `RidingBootNear/Far`
- `Saddle`, `SaddleClothNear`, `SaddleClothFar`, `Mane`, `ReinNear/Far`

The complete 100-node inventory is in `manifest.json`. The GLB contains **no cameras, lights, floor, preview materials or textures**.

## Reproduction

Requirements: Python with `cli-anything-blender`, Click and Pillow; Blender 5.2 was used. Set `BLENDER_BIN` if Blender is not at `/Applications/Blender.app/Contents/MacOS/Blender`.

From the repository root:

```sh
# Optional: regenerate the JSON from the parametric design source.
python blender/author_source.py

# Official CLI `render script`, append custom geometry/animation/export block,
# then Blender background execution. Uses absolute paths internally.
python blender/build.py

# Real preview capture through the local compatibility command.
python blender/cli_preview.py --json \
  --project "$(pwd)/blender/horse.blend-cli.json" preview capture --recipe quick

# Generate the JSX reference (then restore the Horse name, /models URL and playback).
npx gltfjsx@6.5.3 public/models/horse.glb

# Independent runtime validation, once project Three.js is installed.
node blender/verify_glb.mjs
```

The installed `cli-anything-blender` 1.0 lacks the skill's documented `preview` command. `cli_preview.py` registers a local `preview capture` extension on the original CLI and produces actual Blender renders and bundle metadata; it does not alter the global installation. `custom_mesh`, `custom_material`, `parent_name` and `sculpt_union` are local JSON extensions resolved by `finish_scene.py`; ordinary CLI scene and material generation is retained. The sculptural union uses voxel fusion, relaxation and flat-shaded decimation to avoid a stack-of-primitives appearance.

When project dependencies were not yet present, runtime validation used the already-installed gltfjsx npm cache via `THREE_PACKAGE_ROOT=/path/to/cached/node_modules/three node blender/verify_glb.mjs`; no package files were changed.

No `src` or package files were edited, and no commit was created.
