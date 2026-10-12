import bpy,json
from pathlib import Path
bpy.ops.wm.open_mainfile(filepath='/Users/rossz/workspace/cloudflare/smart-accountant/labs/horse-racing/blender/horse.blend')
s=bpy.context.scene
s.frame_set(1)
s.render.engine='CYCLES'
s.cycles.samples=32
s.cycles.use_denoising=True
s.render.filepath='/Users/rossz/workspace/cloudflare/smart-accountant/labs/horse-racing/blender/previews/hero.png'
bpy.ops.render.render(write_still=True)
s.render.engine='BLENDER_WORKBENCH'
s.display.shading.light='STUDIO'
s.display.shading.color_type='MATERIAL'
s.display.shading.show_shadows=True
s.display.shading.show_cavity=True
s.render.filepath='/Users/rossz/workspace/cloudflare/smart-accountant/labs/horse-racing/blender/previews/workbench.png'
bpy.ops.render.render(write_still=True)
# Six real rendered phases for checking limb articulation and silhouette.
s.render.engine='CYCLES'
s.cycles.samples=16
s.render.resolution_x=620
s.render.resolution_y=500
s.camera.location=(0,-8,2.65)
from mathutils import Vector
s.camera.rotation_euler=(Vector((0,0,1.25))-s.camera.location).to_track_quat('-Z','Y').to_euler()
s.camera.data.ortho_scale=3.8
for i in range(6):
    s.frame_set(1+i*16)
    s.render.filepath='/Users/rossz/workspace/cloudflare/smart-accountant/labs/horse-racing/blender/previews'+f'/phase_{i}.png'
    bpy.ops.render.render(write_still=True)
