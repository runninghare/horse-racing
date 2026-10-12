#!/usr/bin/env python3
"""Auto-generated Blender Python script from blender-cli."""

import bpy
import math
import os

# ── Clear Default Scene ──────────────────────────────────────
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

# ── Scene Settings ──────────────────────────────────────────
scene = bpy.context.scene
scene.unit_settings.system = 'METRIC'
scene.unit_settings.scale_length = 1
scene.frame_start = 1
scene.frame_end = 97
scene.frame_current = 1
scene.render.fps = 120

# ── Render Settings ─────────────────────────────────────────
scene.render.engine = 'CYCLES'
scene.render.resolution_x = 1400
scene.render.resolution_y = 1100
scene.render.resolution_percentage = 100
scene.render.film_transparent = False
scene.cycles.samples = 48
scene.cycles.use_denoising = True

# ── World Settings ──────────────────────────────────────────
world = bpy.data.worlds.get('World')
if world is None:
    world = bpy.data.worlds.new('World')
    scene.world = world
world.use_nodes = True
bg_node = world.node_tree.nodes.get('Background')
if bg_node:
    bg_node.inputs[0].default_value = (0.12, 0.16, 0.2, 1.0)

# ── Materials ───────────────────────────────────────────────
mat_HorseCoat = bpy.data.materials.new(name='HorseCoat')
mat_HorseCoat.use_nodes = True
bsdf_HorseCoat = mat_HorseCoat.node_tree.nodes.get('Principled BSDF')
if bsdf_HorseCoat:
    bsdf_HorseCoat.inputs['Base Color'].default_value = (0.3049873140698863, 0.08650046203654976, 0.033104766570885055, 1)
    bsdf_HorseCoat.inputs['Metallic'].default_value = 0
    bsdf_HorseCoat.inputs['Roughness'].default_value = 0.72
    bsdf_HorseCoat.inputs['Specular IOR Level'].default_value = 0.5
    bsdf_HorseCoat.inputs['Alpha'].default_value = 1.0

mat_ManeTail = bpy.data.materials.new(name='ManeTail')
mat_ManeTail.use_nodes = True
bsdf_ManeTail = mat_ManeTail.node_tree.nodes.get('Principled BSDF')
if bsdf_ManeTail:
    bsdf_ManeTail.inputs['Base Color'].default_value = (0.019382360956935723, 0.010960094006488246, 0.010329823029626936, 1)
    bsdf_ManeTail.inputs['Metallic'].default_value = 0
    bsdf_ManeTail.inputs['Roughness'].default_value = 0.9
    bsdf_ManeTail.inputs['Specular IOR Level'].default_value = 0.5
    bsdf_ManeTail.inputs['Alpha'].default_value = 1.0

mat_Hooves = bpy.data.materials.new(name='Hooves')
mat_Hooves.use_nodes = True
bsdf_Hooves = mat_Hooves.node_tree.nodes.get('Principled BSDF')
if bsdf_Hooves:
    bsdf_Hooves.inputs['Base Color'].default_value = (0.02217388479338738, 0.02315336617811041, 0.02315336617811041, 1)
    bsdf_Hooves.inputs['Metallic'].default_value = 0
    bsdf_Hooves.inputs['Roughness'].default_value = 0.65
    bsdf_Hooves.inputs['Specular IOR Level'].default_value = 0.5
    bsdf_Hooves.inputs['Alpha'].default_value = 1.0

mat_Ivory = bpy.data.materials.new(name='Ivory')
mat_Ivory.use_nodes = True
bsdf_Ivory = mat_Ivory.node_tree.nodes.get('Principled BSDF')
if bsdf_Ivory:
    bsdf_Ivory.inputs['Base Color'].default_value = (0.8549926081242338, 0.8069522576692516, 0.6583748172794485, 1)
    bsdf_Ivory.inputs['Metallic'].default_value = 0
    bsdf_Ivory.inputs['Roughness'].default_value = 0.8
    bsdf_Ivory.inputs['Specular IOR Level'].default_value = 0.5
    bsdf_Ivory.inputs['Alpha'].default_value = 1.0

mat_Leather = bpy.data.materials.new(name='Leather')
mat_Leather.use_nodes = True
bsdf_Leather = mat_Leather.node_tree.nodes.get('Principled BSDF')
if bsdf_Leather:
    bsdf_Leather.inputs['Base Color'].default_value = (0.0295568344378088, 0.018500220128379697, 0.013702083047289686, 1)
    bsdf_Leather.inputs['Metallic'].default_value = 0
    bsdf_Leather.inputs['Roughness'].default_value = 0.7
    bsdf_Leather.inputs['Specular IOR Level'].default_value = 0.5
    bsdf_Leather.inputs['Alpha'].default_value = 1.0

mat_JockeySilk = bpy.data.materials.new(name='JockeySilk')
mat_JockeySilk.use_nodes = True
bsdf_JockeySilk = mat_JockeySilk.node_tree.nodes.get('Principled BSDF')
if bsdf_JockeySilk:
    bsdf_JockeySilk.inputs['Base Color'].default_value = (0.005181516702338386, 0.38132601143253014, 0.35153259950043936, 1)
    bsdf_JockeySilk.inputs['Metallic'].default_value = 0
    bsdf_JockeySilk.inputs['Roughness'].default_value = 0.46
    bsdf_JockeySilk.inputs['Specular IOR Level'].default_value = 0.5
    bsdf_JockeySilk.inputs['Alpha'].default_value = 1.0

mat_SilkTrim = bpy.data.materials.new(name='SilkTrim')
mat_SilkTrim.use_nodes = True
bsdf_SilkTrim = mat_SilkTrim.node_tree.nodes.get('Principled BSDF')
if bsdf_SilkTrim:
    bsdf_SilkTrim.inputs['Base Color'].default_value = (0.9130986517934192, 0.5840784178911641, 0.14126329114027164, 1)
    bsdf_SilkTrim.inputs['Metallic'].default_value = 0
    bsdf_SilkTrim.inputs['Roughness'].default_value = 0.48
    bsdf_SilkTrim.inputs['Specular IOR Level'].default_value = 0.5
    bsdf_SilkTrim.inputs['Alpha'].default_value = 1.0

mat_Breeches = bpy.data.materials.new(name='Breeches')
mat_Breeches.use_nodes = True
bsdf_Breeches = mat_Breeches.node_tree.nodes.get('Principled BSDF')
if bsdf_Breeches:
    bsdf_Breeches.inputs['Base Color'].default_value = (0.8879231178819663, 0.8549926081242338, 0.7605245046752924, 1)
    bsdf_Breeches.inputs['Metallic'].default_value = 0
    bsdf_Breeches.inputs['Roughness'].default_value = 0.8
    bsdf_Breeches.inputs['Specular IOR Level'].default_value = 0.5
    bsdf_Breeches.inputs['Alpha'].default_value = 1.0

mat_BootsGloves = bpy.data.materials.new(name='BootsGloves')
mat_BootsGloves.use_nodes = True
bsdf_BootsGloves = mat_BootsGloves.node_tree.nodes.get('Principled BSDF')
if bsdf_BootsGloves:
    bsdf_BootsGloves.inputs['Base Color'].default_value = (0.014443843596092545, 0.024157632448504756, 0.033104766570885055, 1)
    bsdf_BootsGloves.inputs['Metallic'].default_value = 0
    bsdf_BootsGloves.inputs['Roughness'].default_value = 0.58
    bsdf_BootsGloves.inputs['Specular IOR Level'].default_value = 0.5
    bsdf_BootsGloves.inputs['Alpha'].default_value = 1.0

mat_Skin = bpy.data.materials.new(name='Skin')
mat_Skin.use_nodes = True
bsdf_Skin = mat_Skin.node_tree.nodes.get('Principled BSDF')
if bsdf_Skin:
    bsdf_Skin.inputs['Base Color'].default_value = (0.4851499400560704, 0.18782077230067787, 0.08437621154414882, 1)
    bsdf_Skin.inputs['Metallic'].default_value = 0
    bsdf_Skin.inputs['Roughness'].default_value = 0.8
    bsdf_Skin.inputs['Specular IOR Level'].default_value = 0.5
    bsdf_Skin.inputs['Alpha'].default_value = 1.0

mat_Eyes = bpy.data.materials.new(name='Eyes')
mat_Eyes.use_nodes = True
bsdf_Eyes = mat_Eyes.node_tree.nodes.get('Principled BSDF')
if bsdf_Eyes:
    bsdf_Eyes.inputs['Base Color'].default_value = (0.005605391624202723, 0.006995410187265387, 0.010329823029626936, 1)
    bsdf_Eyes.inputs['Metallic'].default_value = 0
    bsdf_Eyes.inputs['Roughness'].default_value = 0.2
    bsdf_Eyes.inputs['Specular IOR Level'].default_value = 0.5
    bsdf_Eyes.inputs['Alpha'].default_value = 1.0

mat_Brass = bpy.data.materials.new(name='Brass')
mat_Brass.use_nodes = True
bsdf_Brass = mat_Brass.node_tree.nodes.get('Principled BSDF')
if bsdf_Brass:
    bsdf_Brass.inputs['Base Color'].default_value = (0.6866853124353135, 0.4620769996544071, 0.14126329114027164, 1)
    bsdf_Brass.inputs['Metallic'].default_value = 0.65
    bsdf_Brass.inputs['Roughness'].default_value = 0.3
    bsdf_Brass.inputs['Specular IOR Level'].default_value = 0.5
    bsdf_Brass.inputs['Alpha'].default_value = 1.0

mat_Goggles = bpy.data.materials.new(name='Goggles')
mat_Goggles.use_nodes = True
bsdf_Goggles = mat_Goggles.node_tree.nodes.get('Principled BSDF')
if bsdf_Goggles:
    bsdf_Goggles.inputs['Base Color'].default_value = (0.06124605423161761, 0.1589608350608804, 0.22696587351009836, 1)
    bsdf_Goggles.inputs['Metallic'].default_value = 0.25
    bsdf_Goggles.inputs['Roughness'].default_value = 0.2
    bsdf_Goggles.inputs['Specular IOR Level'].default_value = 0.5
    bsdf_Goggles.inputs['Alpha'].default_value = 1.0

mat_EarInner = bpy.data.materials.new(name='EarInner')
mat_EarInner.use_nodes = True
bsdf_EarInner = mat_EarInner.node_tree.nodes.get('Principled BSDF')
if bsdf_EarInner:
    bsdf_EarInner.inputs['Base Color'].default_value = (0.12213877222960187, 0.0382043715953465, 0.019382360956935723, 1)
    bsdf_EarInner.inputs['Metallic'].default_value = 0
    bsdf_EarInner.inputs['Roughness'].default_value = 0.8
    bsdf_EarInner.inputs['Specular IOR Level'].default_value = 0.5
    bsdf_EarInner.inputs['Alpha'].default_value = 1.0


# ── Objects ─────────────────────────────────────────────────
# Object: HorseRoot
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'HorseRoot'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: BodyMotion
bpy.ops.object.empty_add(location=(0, 0, 1.3))
obj = bpy.context.active_object
obj.name = 'BodyMotion'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: HorseBody
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'HorseBody'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: NeckSculpt
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'NeckSculpt'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: ShoulderSculpt-1
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'ShoulderSculpt-1'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: HaunchSculpt-1
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'HaunchSculpt-1'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: ShoulderSculpt1
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'ShoulderSculpt1'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: HaunchSculpt1
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'HaunchSculpt1'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: HeadPivot
bpy.ops.object.empty_add(location=(0.85, 0, 2.02))
obj = bpy.context.active_object
obj.name = 'HeadPivot'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: HorseHead
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'HorseHead'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: Muzzle
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'Muzzle'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: EarNear
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'EarNear'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: EarInsetNear
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'EarInsetNear'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: EyeNear
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'EyeNear'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: EyeGlintNear
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'EyeGlintNear'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: NostrilNear
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'NostrilNear'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: EarFar
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'EarFar'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: EarInsetFar
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'EarInsetFar'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: EyeFar
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'EyeFar'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: EyeGlintFar
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'EyeGlintFar'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: NostrilFar
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'NostrilFar'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: ForeheadBlaze
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'ForeheadBlaze'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: Mane
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'Mane'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: FrontNearUpper
bpy.ops.object.empty_add(location=(0.43, -0.235, 1.24))
obj = bpy.context.active_object
obj.name = 'FrontNearUpper'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: FrontNearLower
bpy.ops.object.empty_add(location=(0.47, -0.235, 0.66))
obj = bpy.context.active_object
obj.name = 'FrontNearLower'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: FrontNearFoot
bpy.ops.object.empty_add(location=(0.48, -0.235, 0.22))
obj = bpy.context.active_object
obj.name = 'FrontNearFoot'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: FrontNearUpperMesh
bpy.ops.object.empty_add(location=(0.43, -0.235, 1.24))
obj = bpy.context.active_object
obj.name = 'FrontNearUpperMesh'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: FrontNearCannon
bpy.ops.object.empty_add(location=(0.47, -0.235, 0.66))
obj = bpy.context.active_object
obj.name = 'FrontNearCannon'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: FrontNearPastern
bpy.ops.object.empty_add(location=(0.48, -0.235, 0.22))
obj = bpy.context.active_object
obj.name = 'FrontNearPastern'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: FrontNearSock
bpy.ops.object.empty_add(location=(0.47, -0.235, 0.66))
obj = bpy.context.active_object
obj.name = 'FrontNearSock'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: FrontNearHoof
bpy.ops.object.empty_add(location=(0.48, -0.235, 0.22))
obj = bpy.context.active_object
obj.name = 'FrontNearHoof'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: HindNearUpper
bpy.ops.object.empty_add(location=(-0.7, -0.235, 1.24))
obj = bpy.context.active_object
obj.name = 'HindNearUpper'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: HindNearLower
bpy.ops.object.empty_add(location=(-0.44, -0.235, 0.77))
obj = bpy.context.active_object
obj.name = 'HindNearLower'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: HindNearFoot
bpy.ops.object.empty_add(location=(-0.79, -0.235, 0.28))
obj = bpy.context.active_object
obj.name = 'HindNearFoot'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: HindNearUpperMesh
bpy.ops.object.empty_add(location=(-0.7, -0.235, 1.24))
obj = bpy.context.active_object
obj.name = 'HindNearUpperMesh'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: HindNearCannon
bpy.ops.object.empty_add(location=(-0.44, -0.235, 0.77))
obj = bpy.context.active_object
obj.name = 'HindNearCannon'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: HindNearPastern
bpy.ops.object.empty_add(location=(-0.79, -0.235, 0.28))
obj = bpy.context.active_object
obj.name = 'HindNearPastern'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: HindNearHoof
bpy.ops.object.empty_add(location=(-0.79, -0.235, 0.28))
obj = bpy.context.active_object
obj.name = 'HindNearHoof'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: FrontFarUpper
bpy.ops.object.empty_add(location=(0.43, 0.235, 1.24))
obj = bpy.context.active_object
obj.name = 'FrontFarUpper'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: FrontFarLower
bpy.ops.object.empty_add(location=(0.47, 0.235, 0.66))
obj = bpy.context.active_object
obj.name = 'FrontFarLower'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: FrontFarFoot
bpy.ops.object.empty_add(location=(0.48, 0.235, 0.22))
obj = bpy.context.active_object
obj.name = 'FrontFarFoot'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: FrontFarUpperMesh
bpy.ops.object.empty_add(location=(0.43, 0.235, 1.24))
obj = bpy.context.active_object
obj.name = 'FrontFarUpperMesh'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: FrontFarCannon
bpy.ops.object.empty_add(location=(0.47, 0.235, 0.66))
obj = bpy.context.active_object
obj.name = 'FrontFarCannon'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: FrontFarPastern
bpy.ops.object.empty_add(location=(0.48, 0.235, 0.22))
obj = bpy.context.active_object
obj.name = 'FrontFarPastern'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: FrontFarHoof
bpy.ops.object.empty_add(location=(0.48, 0.235, 0.22))
obj = bpy.context.active_object
obj.name = 'FrontFarHoof'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: HindFarUpper
bpy.ops.object.empty_add(location=(-0.7, 0.235, 1.24))
obj = bpy.context.active_object
obj.name = 'HindFarUpper'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: HindFarLower
bpy.ops.object.empty_add(location=(-0.44, 0.235, 0.77))
obj = bpy.context.active_object
obj.name = 'HindFarLower'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: HindFarFoot
bpy.ops.object.empty_add(location=(-0.79, 0.235, 0.28))
obj = bpy.context.active_object
obj.name = 'HindFarFoot'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: HindFarUpperMesh
bpy.ops.object.empty_add(location=(-0.7, 0.235, 1.24))
obj = bpy.context.active_object
obj.name = 'HindFarUpperMesh'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: HindFarCannon
bpy.ops.object.empty_add(location=(-0.44, 0.235, 0.77))
obj = bpy.context.active_object
obj.name = 'HindFarCannon'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: HindFarPastern
bpy.ops.object.empty_add(location=(-0.79, 0.235, 0.28))
obj = bpy.context.active_object
obj.name = 'HindFarPastern'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: HindFarSock
bpy.ops.object.empty_add(location=(-0.44, 0.235, 0.77))
obj = bpy.context.active_object
obj.name = 'HindFarSock'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: HindFarHoof
bpy.ops.object.empty_add(location=(-0.79, 0.235, 0.28))
obj = bpy.context.active_object
obj.name = 'HindFarHoof'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: TailJoint1
bpy.ops.object.empty_add(location=(-0.94, 0, 1.47))
obj = bpy.context.active_object
obj.name = 'TailJoint1'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: TailLock1
bpy.ops.object.empty_add(location=(-0.94, 0, 1.47))
obj = bpy.context.active_object
obj.name = 'TailLock1'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: TailJoint2
bpy.ops.object.empty_add(location=(-1.2, 0, 1.38))
obj = bpy.context.active_object
obj.name = 'TailJoint2'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: TailLock2
bpy.ops.object.empty_add(location=(-1.2, 0, 1.38))
obj = bpy.context.active_object
obj.name = 'TailLock2'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: TailJoint3
bpy.ops.object.empty_add(location=(-1.42, 0.01, 1.04))
obj = bpy.context.active_object
obj.name = 'TailJoint3'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: TailLock3
bpy.ops.object.empty_add(location=(-1.42, 0.01, 1.04))
obj = bpy.context.active_object
obj.name = 'TailLock3'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: SaddleClothNear
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'SaddleClothNear'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: ClothPipingNear
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'ClothPipingNear'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: RacingDiamondNear
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'RacingDiamondNear'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: SaddleClothFar
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'SaddleClothFar'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: ClothPipingFar
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'ClothPipingFar'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: RacingDiamondFar
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'RacingDiamondFar'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: Saddle
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'Saddle'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: GirthNear
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'GirthNear'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: CheekStrapNear
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'CheekStrapNear'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: BrowbandNear
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'BrowbandNear'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: NosebandNear
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'NosebandNear'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: BitRingNear
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'BitRingNear'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: GirthFar
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'GirthFar'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: CheekStrapFar
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'CheekStrapFar'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: BrowbandFar
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'BrowbandFar'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: NosebandFar
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'NosebandFar'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: BitRingFar
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'BitRingFar'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: JockeyPivot
bpy.ops.object.empty_add(location=(-0.12, 0, 1.72))
obj = bpy.context.active_object
obj.name = 'JockeyPivot'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: JockeyTorso
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'JockeyTorso'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: JockeyHips
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'JockeyHips'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: JockeyCollar
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'JockeyCollar'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: JockeyFace
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'JockeyFace'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: Helmet
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'Helmet'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: HelmetStripe
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'HelmetStripe'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: HelmetVisor
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'HelmetVisor'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: GoggleLens
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'GoggleLens'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: GoggleStrapNear
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'GoggleStrapNear'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: JockeySleeveNear
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'JockeySleeveNear'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: CuffNear
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'CuffNear'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: GloveNear
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'GloveNear'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: JockeyThighNear
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'JockeyThighNear'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: RidingBootNear
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'RidingBootNear'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: BootToeNear
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'BootToeNear'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: StirrupLeatherNear
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'StirrupLeatherNear'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: StirrupIronNear
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'StirrupIronNear'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: ReinNear
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'ReinNear'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: GoggleStrapFar
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'GoggleStrapFar'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: JockeySleeveFar
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'JockeySleeveFar'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: CuffFar
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'CuffFar'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: GloveFar
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'GloveFar'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: JockeyThighFar
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'JockeyThighFar'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: RidingBootFar
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'RidingBootFar'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: BootToeFar
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'BootToeFar'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: StirrupLeatherFar
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'StirrupLeatherFar'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: StirrupIronFar
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'StirrupIronFar'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)

# Object: ReinFar
bpy.ops.object.empty_add(location=(0, 0, 0))
obj = bpy.context.active_object
obj.name = 'ReinFar'
obj.rotation_euler = (math.radians(0), math.radians(0), math.radians(0))
obj.scale = (1, 1, 1)


# ── Cameras ─────────────────────────────────────────────────
# (none)

# ── Lights ──────────────────────────────────────────────────
# (none)

# ── Keyframes ───────────────────────────────────────────────
# (none)

# ── Render Output ───────────────────────────────────────────
scene.render.image_settings.file_format = 'PNG'
scene.render.filepath = r'/Users/rossz/workspace/cloudflare/smart-accountant/labs/horse-racing/blender/previews/hero.png'
scene.frame_set(1)

# Render single frame
bpy.ops.render.render(write_still=True)

print('Render complete: /Users/rossz/workspace/cloudflare/smart-accountant/labs/horse-racing/blender/previews/hero.png')
