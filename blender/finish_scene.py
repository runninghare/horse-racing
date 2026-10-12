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
