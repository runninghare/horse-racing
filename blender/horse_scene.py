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


"""Appended to the CLI-generated render script by build.py. Runs inside Blender."""
import json
from pathlib import Path
from mathutils import Vector
BASE=Path(__file__).resolve().parent
ROOT=BASE.parent
project=json.loads((BASE/'horse.blend-cli.json').read_text())
materials={m['id']:bpy.data.materials[m['name']] for m in project['materials']}
# CLI handles scene/material creation. This custom_mesh extension supplies authored topology.
for spec in project['objects']:
    ob=bpy.data.objects[spec['name']]
    if 'custom_mesh' in spec:
        mesh=bpy.data.meshes.new(spec['name']+'Geometry')
        origin=Vector(spec['location'])
        mesh.from_pydata([Vector(v)-origin for v in spec['custom_mesh']['vertices']],[],spec['custom_mesh']['faces'])
        mesh.update()
        bpy.data.objects.remove(ob,do_unlink=True)
        ob=bpy.data.objects.new(spec['name'],mesh);bpy.context.collection.objects.link(ob);ob.location=origin
        if spec['custom_material'] is not None:mesh.materials.append(materials[spec['custom_material']])
        bpy.context.view_layer.objects.active=ob;ob.select_set(True)
        # Recalculate normals, including the intentionally two-sided cloth panels.
        bpy.ops.object.mode_set(mode='EDIT');bpy.ops.mesh.select_all(action='SELECT');bpy.ops.mesh.normals_make_consistent(inside=False);bpy.ops.object.mode_set(mode='OBJECT');ob.select_set(False)
        if 'solidify' in spec:
            mod=ob.modifiers.new('Woven cloth thickness','SOLIDIFY');mod.thickness=spec['solidify']
            bpy.ops.object.modifier_apply(modifier=mod.name)
    ob['deliverable']=True
# Union anatomical volumes into a single coherent faceted sculpture.
bpy.ops.object.select_all(action='DESELECT')
for s in project['objects']:
    if s.get('sculpt_union'):bpy.data.objects[s['name']].select_set(True)
bpy.context.view_layer.objects.active=bpy.data.objects['HorseBody'];bpy.ops.object.join()
body=bpy.context.object
mod=body.modifiers.new('Sculptural anatomical union','REMESH');mod.mode='VOXEL';mod.voxel_size=.037;mod.use_smooth_shade=False
bpy.ops.object.modifier_apply(modifier=mod.name)
mod=body.modifiers.new('Relax fused musculature','SMOOTH');mod.factor=1.1;mod.iterations=4;bpy.ops.object.modifier_apply(modifier=mod.name)
mod=body.modifiers.new('Broad hand-cut planes','DECIMATE');mod.ratio=.16;bpy.ops.object.modifier_apply(modifier=mod.name)
# Parent with world-space origins preserved. No mesh object has non-unit scale.
for s in project['objects']:
    ob=bpy.data.objects.get(s['name'])
    if ob and s.get('parent_name'):
        parent=bpy.data.objects[s['parent_name']]
        ob.parent=parent
        parent_origin=next(x['location'] for x in project['objects'] if x['name']==s['parent_name'])
        ob.location=Vector(s['location'])-Vector(parent_origin)
for ob in bpy.data.objects:
    if ob.type=='MESH':
        for poly in ob.data.polygons:poly.use_smooth=False
# Per-frame baked cycle, NLA tracks coalesce into one Gallop animation.
rest={ob.name:ob.location.copy() for ob in bpy.data.objects if ob.get('deliverable')}
animated=set()
def key(ob,prop):
    ob.keyframe_insert(data_path=prop,frame=frame,group='Gallop');animated.add(ob)
def rot(name,angle):
    ob=bpy.data.objects[name];ob.rotation_euler.y=angle;key(ob,'rotation_euler')
bodymotion=bpy.data.objects['BodyMotion']
end_frame=project['scene']['frame_end']
for frame in range(1,end_frame+1):
    t=(frame-1)/(end_frame-1);phase=2*math.pi*t
    # Measured ground clearance below corrects the hip height after leg articulation.
    bodymotion.location=rest['BodyMotion'].copy()
    bodymotion.rotation_euler.y=.032*math.sin(phase);key(bodymotion,'rotation_euler')
    for leg in project['gallop_legs']:
        p=phase+2*math.pi*leg['phase']
        if leg['front']:
            upper=.66*math.sin(p)-.12
            lower=.08+1.20*max(0,math.cos(p+.50))
            foot=-(upper+lower+.032*math.sin(phase))+.30*max(0,math.cos(p+.50))
        else:
            p+=1.8
            upper=.67*math.sin(p)+.06
            lower=.12+.70*max(0,math.cos(p-.45))
            foot=-(upper+lower+.032*math.sin(phase))-.25*max(0,math.cos(p-.45))
        rot(leg['upper'],upper);rot(leg['lower'],lower);rot(leg['foot'],foot)
    # Bob above contact: exactly grounded during stance; airborne during suspension.
    bpy.context.view_layer.update()
    minz=min((ob.matrix_world@v.co).z for ob in bpy.data.objects if ob.name.endswith('Hoof') for v in ob.data.vertices)
    suspension=.09*max(0,math.sin(phase-.45))**2
    bodymotion.location.z-=minz
    bodymotion.location.z+=suspension
    key(bodymotion,'location')
    rot('HeadPivot',.035*math.sin(phase+.4))
    jp=bpy.data.objects['JockeyPivot'];jp.location=rest[jp.name]+Vector((.014*math.sin(phase),0,.033*math.sin(phase+.8)));key(jp,'location');rot(jp.name,.045*math.sin(phase+.5))
    for i in range(1,4):
        ob=bpy.data.objects['TailJoint'+str(i)];ob.rotation_euler.y=.13*math.sin(phase-i*.55);ob.rotation_euler.z=.10*math.sin(phase-i*.7);key(ob,'rotation_euler')
for ob in animated:
    action=ob.animation_data.action;action.name='Gallop_'+ob.name
    # Blender 5 actions use channel bags; linear baked samples are intentional.
    for layer in action.layers:
        for strip in layer.strips:
            for bag in strip.channelbags:
                for fc in bag.fcurves:
                    for point in fc.keyframe_points:point.interpolation='LINEAR'
    slot=ob.animation_data.action_slot
    ob.animation_data.action=None
    track=ob.animation_data.nla_tracks.new();track.name='Gallop'
    strip=track.strips.new('Gallop',1,action)
    if slot:strip.action_slot=slot
# Preview-only stage. These objects are never selected for export.
spec=project['preview_spec']
bpy.ops.object.camera_add(location=spec['camera']);camera=bpy.context.object;camera.name='PreviewCamera';camera.rotation_euler=(Vector(spec['target'])-camera.location).to_track_quat('-Z','Y').to_euler();camera.data.type='ORTHO';camera.data.ortho_scale=spec['ortho_scale'];scene.camera=camera
for light in spec['lights']:
    bpy.ops.object.light_add(type='AREA',location=light['location']);ob=bpy.context.object;ob.name=light['name'];ob.data.energy=light['energy'];ob.data.shape='DISK';ob.data.size=light['size'];ob.data.color=light['color'];ob.rotation_euler=(Vector(spec['target'])-ob.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.mesh.primitive_plane_add(size=200,location=(0,0,-.012));floor=bpy.context.object;floor.name='PreviewGround'
mat=bpy.data.materials.new('PreviewGroundMaterial');mat.diffuse_color=(.045,.065,.085,1);mat.use_nodes=True;mat.node_tree.nodes['Principled BSDF'].inputs['Base Color'].default_value=(.045,.065,.085,1);mat.node_tree.nodes['Principled BSDF'].inputs['Roughness'].default_value=.9;floor.data.materials.append(mat)
scene.view_settings.view_transform='AgX'
scene.render.image_settings.file_format='PNG'
scene.frame_set(1)
# Ground the default exported pose too, and measure both rest and full-cycle bounds.
def bounds():
    points=[ob.matrix_world@v.co for ob in bpy.data.objects if ob.get('deliverable') and ob.type=='MESH' for v in ob.data.vertices]
    # Blender Z-up -> glTF Y-up: (x,z,-y).
    points=[Vector((p.x,p.z,-p.y)) for p in points]
    return {'min':[min(p[i] for p in points) for i in range(3)],'max':[max(p[i] for p in points) for i in range(3)]}
static_bounds=bounds();cycle=[]
for f in range(1,end_frame+1):scene.frame_set(f);cycle.append(bounds())
scene.frame_set(1)
# Selection allowlist excludes cameras, lights and the preview ground.
bpy.ops.object.select_all(action='DESELECT')
deliverables=[ob for ob in bpy.data.objects if ob.get('deliverable')]
for ob in deliverables:ob.select_set(True)
bpy.context.view_layer.objects.active=bpy.data.objects['HorseRoot']
(ROOT/'public/models').mkdir(parents=True,exist_ok=True)
bpy.ops.export_scene.gltf(filepath=str(ROOT/'public/models/horse.glb'),export_format='GLB',use_selection=True,export_yup=True,export_materials='EXPORT',export_normals=True,export_animations=True,export_animation_mode='NLA_TRACKS',export_nla_strips=True,export_frame_range=True,export_frame_step=1,export_force_sampling=True,export_anim_slide_to_zero=True,export_optimize_animation_size=False,export_cameras=False,export_lights=False,export_extras=False)
scene.render.filepath=str(BASE/'previews/hero.png')
bpy.ops.wm.save_as_mainfile(filepath=str(BASE/'horse.blend'))
info={'glb':'public/models/horse.glb','orientation':'+X forward; +Y up','default_pose_bounds':static_bounds,'default_pose_dimensions':[static_bounds['max'][i]-static_bounds['min'][i] for i in range(3)],'animation_bounds':{'min':[min(b['min'][i] for b in cycle) for i in range(3)],'max':[max(b['max'][i] for b in cycle) for i in range(3)]},'animations':['Gallop'],'duration_seconds':.8,'nodes':[o.name for o in deliverables],'materials':[m['name'] for m in project['materials']],'triangles':sum(len(p.vertices)-2 for o in deliverables if o.type=='MESH' for p in o.data.polygons)}
(BASE/'manifest.json').write_text(json.dumps(info,indent=2)+'\n')
print('HORSE_MANIFEST',json.dumps(info))
