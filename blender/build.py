"""Rebuild from the .blend-cli.json source via the official CLI render script command."""
import os, subprocess
from pathlib import Path
BASE=Path(__file__).resolve().parent
blender=os.environ.get('BLENDER_BIN','/Applications/Blender.app/Contents/MacOS/Blender')
result=subprocess.run(['cli-anything-blender','--json','--project',str(BASE/'horse.blend-cli.json'),'render','script',str(BASE/'previews/hero.png')],check=True,capture_output=True,text=True)
(BASE/'cli_render.py').write_text(result.stdout)
generated=result.stdout.split('# ── Render Output')[0]
(BASE/'horse_scene.py').write_text(generated+'\n'+(BASE/'finish_scene.py').read_text())
subprocess.run([blender,'--background','--python-exit-code','1','--python',str(BASE/'horse_scene.py')],check=True)
if not (BASE/'horse.blend').exists():raise RuntimeError('Blender did not save scene; inspect the Blender log.')
