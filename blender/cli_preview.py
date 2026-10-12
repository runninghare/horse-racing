"""Compatibility extension for installed cli-anything-blender 1.0 without preview.
Registers a real `preview capture` command on the original Click CLI; renders the
saved Blender scene, never a synthetic or JSON-inferred thumbnail. All files local.
Usage: python blender/cli_preview.py --json --project /abs/horse.blend-cli.json preview capture --recipe quick
"""
import json, os, subprocess
from pathlib import Path
import click
from cli_anything.blender import blender_cli

@blender_cli.cli.group()
def preview():
    """Capture preview bundles from the built .blend."""

@preview.command()
@click.option('--recipe',default='quick',type=click.Choice(['quick']))
@click.option('--frame',default=1,type=int)
def capture(recipe,frame):
    base=Path(__file__).resolve().parent
    out=base/'previews';out.mkdir(exist_ok=True)
    script=out/'capture.py'
    script.write_text(f'''import bpy,json
from pathlib import Path
bpy.ops.wm.open_mainfile(filepath={str(base/'horse.blend')!r})
s=bpy.context.scene
s.frame_set({frame})
s.render.engine='CYCLES'
s.cycles.samples=32
s.cycles.use_denoising=True
s.render.filepath={str(out/'hero.png')!r}
bpy.ops.render.render(write_still=True)
s.render.engine='BLENDER_WORKBENCH'
s.display.shading.light='STUDIO'
s.display.shading.color_type='MATERIAL'
s.display.shading.show_shadows=True
s.display.shading.show_cavity=True
s.render.filepath={str(out/'workbench.png')!r}
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
    s.render.filepath={str(out)!r}+f'/phase_{{i}}.png'
    bpy.ops.render.render(write_still=True)
''')
    result=subprocess.run([os.environ.get('BLENDER_BIN','/Applications/Blender.app/Contents/MacOS/Blender'),'--background','--python-exit-code','1','--python',str(script)],capture_output=True,text=True)
    (out/'capture.log').write_text(result.stdout+result.stderr)
    if result.returncode or not (out/'hero.png').exists():raise click.ClickException('Preview failed; see '+str(out/'capture.log'))
    from PIL import Image, ImageDraw
    sheet=Image.new('RGB',(1860,1050),'#19252c')
    draw=ImageDraw.Draw(sheet)
    for i in range(6):
        image=Image.open(out/f'phase_{i}.png').convert('RGB')
        x=(i%3)*620;y=(i//3)*525
        sheet.paste(image,(x,y));draw.text((x+18,y+504),f'GALLOP / {i/6:.2f} cycle',fill='#e1c887')
    sheet.save(out/'gallop-contact-sheet.png')
    payload={'recipe':recipe,'frame':frame,'_bundle_dir':str(out),'hero':str(out/'hero.png'),'workbench':str(out/'workbench.png'),'contact_sheet':str(out/'gallop-contact-sheet.png'),'compatibility_note':'Local preview extension for installed CLI 1.0; real Blender renders.'}
    (out/'bundle.json').write_text(json.dumps(payload,indent=2)+'\n')
    blender_cli.output(payload)

if __name__=='__main__':blender_cli.cli()
