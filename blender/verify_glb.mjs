// Actual Three.js GLTFLoader/AnimationMixer verification, independent of Blender.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// Optional npm-cache fallback while the app's dependencies are installed concurrently.
const threeRoot=process.env.THREE_PACKAGE_ROOT;
const THREE=await import(threeRoot ? `${threeRoot}/build/three.module.js` : 'three');
const { GLTFLoader }=await import(threeRoot ? `${threeRoot}/examples/jsm/loaders/GLTFLoader.js` : 'three/examples/jsm/loaders/GLTFLoader.js');
const base=path.dirname(fileURLToPath(import.meta.url));
const bytes=fs.readFileSync(path.join(base,'../public/models/horse.glb'));
const data=bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength);
const gltf=await new Promise((resolve,reject)=>new GLTFLoader().parse(data,'',resolve,reject));
const json=gltf.parser.json;
const assert=(ok,msg)=>{if(!ok)throw new Error(msg)};
assert(!json.cameras?.length,'Cameras leaked into export');
assert(!json.extensions?.KHR_lights_punctual,'Lights leaked into export');
assert(gltf.animations.length===1 && gltf.animations[0].name==='Gallop','Expected exactly one Gallop clip');
assert(!json.nodes.some(n=>/Preview|Softbox/.test(n.name)),'Preview objects leaked');
const clip=gltf.animations[0];
let seamError=0;
for(const track of clip.tracks){const size=track.getValueSize();for(let i=0;i<size;i++)seamError=Math.max(seamError,Math.abs(track.values[i]-track.values[track.values.length-size+i]));}
assert(seamError<1e-5,'Loop seam differs');
assert(Math.abs(clip.duration-.8)<1e-6,'Unexpected clip duration');
const vertex=new THREE.Vector3();
function exactBounds(){
  gltf.scene.updateMatrixWorld(true);const box=new THREE.Box3();
  gltf.scene.traverse(ob=>{if(ob.isMesh){const p=ob.geometry.attributes.position;for(let i=0;i<p.count;i++){vertex.fromBufferAttribute(p,i).applyMatrix4(ob.matrixWorld);box.expandByPoint(vertex);}}});return box;
}
const initial=exactBounds();
const mixer=new THREE.AnimationMixer(gltf.scene);const action=mixer.clipAction(clip).play();
const cycleBox=new THREE.Box3();let minFloor=Infinity,maxFloor=-Infinity;
for(let frame=0;frame<=240;frame++){
  mixer.setTime(frame/240*clip.duration);const b=exactBounds();cycleBox.union(b);minFloor=Math.min(minFloor,b.min.y);maxFloor=Math.max(maxFloor,b.min.y);
}
const output={file:'public/models/horse.glb',bytes:bytes.length,meshCount:json.meshes.length,nodeCount:json.nodes.length,triangleCount:json.meshes.reduce((s,m)=>s+m.primitives.reduce((n,p)=>n+json.accessors[p.indices].count/3,0),0),animations:[{name:clip.name,duration:clip.duration,tracks:clip.tracks.length,seamError}],orientation:'+X forward, +Y up',defaultBounds:{min:initial.min.toArray(),max:initial.max.toArray(),size:initial.getSize(new THREE.Vector3()).toArray()},sampledAnimationBounds:{min:cycleBox.min.toArray(),max:cycleBox.max.toArray()},minimumGroundClearance:minFloor,maximumGroundClearance:maxFloor,materials:json.materials.map(m=>m.name),checks:{selectedDeliverablesOnly:true,noCameras:true,noLights:true,loopSeam:true,loadsInThree:true}};
assert(minFloor>-.001,'Excess ground penetration');
fs.writeFileSync(path.join(base,'validation.json'),JSON.stringify(output,null,2)+'\n');
console.log(JSON.stringify(output,null,2));
