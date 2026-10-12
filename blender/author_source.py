"""Author the complete CLI scene source, including custom low-poly mesh extensions.
Run with normal Python, then python blender/build.py.
Blender coordinates: +X forward, +Z up. glTF: +X forward, +Y up.
"""
import json, math
from pathlib import Path
ROOT=Path(__file__).resolve().parent
P={'version':'1.0','name':'Silks — low-poly thoroughbred','scene':{'unit_system':'metric','unit_scale':1,'frame_start':1,'frame_end':97,'frame_current':1,'fps':120},'render':{'engine':'CYCLES','resolution_x':1400,'resolution_y':1100,'resolution_percentage':100,'samples':48,'use_denoising':True,'film_transparent':False},'world':{'background_color':[0.12,0.16,0.20]},'objects':[],'materials':[],'cameras':[],'lights':[],'collections':[],'metadata':{'software':'cli-anything-blender + horse custom mesh extension','description':'All deliverable mesh topology, hierarchy and motion parameters are stored in this JSON.'}}
M={}
def material(name,hexcolor,rough=.65,metal=0):
    h=hexcolor.lstrip('#'); srgb=[int(h[i:i+2],16)/255 for i in (0,2,4)]
    rgb=[v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4 for v in srgb]
    M[name]=len(P['materials']);P['materials'].append({'id':M[name],'name':name,'color':rgb+[1],'roughness':rough,'metallic':metal})
for args in [('HorseCoat','#965333',.72),('ManeTail','#261b1a',.9),('Hooves','#292a2a',.65),('Ivory','#eee8d4',.8),('Leather','#30251f',.7),('JockeySilk','#10a6a0',.46),('SilkTrim','#f5c969',.48),('Breeches','#f2eee2',.8),('BootsGloves','#202b33',.58),('Skin','#b97852',.8),('Eyes','#11141a',.2),('Brass','#d8b569',.3,.65),('Goggles','#466f83',.2,.25),('EarInner','#623726',.8)]:material(*args)

def obj(name,verts=None,faces=None,mat=None,parent=None,origin=(0,0,0),**extra):
    o={'id':len(P['objects']),'name':name,'mesh_type':'empty','location':list(origin),'rotation':[0,0,0],'scale':[1,1,1],'visible':True,'material':None,'custom_material':M.get(mat),'parent_name':parent}
    if verts is not None:o.update(custom_mesh={'vertices':verts,'faces':faces})
    o.update(extra);P['objects'].append(o);return name

def loft(name,rings,mat,parent='BodyMotion',origin=(0,0,0),n=10,**extra):
    # Rings perpendicular to X. Anatomy defined explicitly rather than primitive stacks.
    v=[];f=[]
    for x,y,z,ry,rz in rings:
        for j in range(n):
            a=2*math.pi*j/n;v.append([x,y+ry*math.cos(a),z+rz*math.sin(a)])
    f.append(list(range(n-1,-1,-1)))
    for i in range(len(rings)-1):
        for j in range(n):
            a=i*n+j;b=i*n+(j+1)%n;c=(i+1)*n+(j+1)%n;d=(i+1)*n+j
            # Broad but irregular sculptural triangular facets.
            if (i+j)%2:f.extend([[a,b,d],[b,c,d]])
            else:f.extend([[a,b,c],[a,c,d]])
    f.append(list(range((len(rings)-1)*n,len(rings)*n)))
    return obj(name,v,f,mat,parent,origin,**extra)

def tube(name,points,radii,mat,parent='BodyMotion',origin=(0,0,0),n=8,**extra):
    v=[];f=[]
    for i,p in enumerate(points):
        a=points[max(i-1,0)];b=points[min(i+1,len(points)-1)];d=[b[k]-a[k] for k in range(3)];l=math.sqrt(sum(t*t for t in d));d=[t/l for t in d]
        # Cross product tangent with Y; side basis remains Y for sagittal limbs.
        u=[d[2],0,-d[0]];l=math.sqrt(sum(t*t for t in u));u=[t/l for t in u]
        w=[d[1]*u[2]-d[2]*u[1],d[2]*u[0]-d[0]*u[2],d[0]*u[1]-d[1]*u[0]]
        rr=radii[i];r,s=rr if isinstance(rr,(tuple,list)) else (rr,rr)
        for j in range(n):
            ang=2*math.pi*j/n;v.append([p[k]+r*math.cos(ang)*u[k]+s*math.sin(ang)*w[k] for k in range(3)])
    f.append(list(range(n-1,-1,-1)))
    for i in range(len(points)-1):
        for j in range(n):f.append([i*n+j,i*n+(j+1)%n,(i+1)*n+(j+1)%n,(i+1)*n+j])
    f.append(list(range((len(points)-1)*n,len(points)*n)))
    return obj(name,v,f,mat,parent,origin,**extra)

def ell(name,center,scale,mat,parent='BodyMotion',origin=(0,0,0),n=10):
    rings=[]
    for i in range(7):
        a=-math.pi/2+math.pi*i/6;r=max(.02,math.cos(a));rings.append((center[0]+scale[0]*math.sin(a),center[1],center[2],scale[1]*r,scale[2]*r))
    return loft(name,rings,mat,parent,origin,n)

obj('HorseRoot');obj('BodyMotion',parent='HorseRoot',origin=(0,0,1.3))
loft('HorseBody',[(-1.01,0,1.35,.12,.17),(-.85,0,1.36,.29,.31),(-.60,0,1.34,.32,.34),(-.27,0,1.33,.28,.28),(.08,0,1.33,.29,.30),(.38,0,1.35,.34,.37),(.61,0,1.39,.26,.33),(.73,0,1.46,.12,.22)],'HorseCoat',sculpt_union=True)
tube('NeckSculpt',[(.40,0,1.40),(.54,0,1.67),(.67,0,1.91),(.82,0,2.09),(.98,0,2.10)],[(.34,.25),(.28,.21),(.23,.16),(.18,.125),(.11,.10)],'HorseCoat',n=12,sculpt_union=True)
# Shoulders and hindquarter muscle planes blend into the trunk.
for side in [-1,1]:
    ell('ShoulderSculpt'+str(side),(.43,side*.20,1.26),(.25,.20,.33),'HorseCoat');P['objects'][-1]['sculpt_union']=True
    ell('HaunchSculpt'+str(side),(-.69,side*.17,1.27),(.32,.23,.36),'HorseCoat');P['objects'][-1]['sculpt_union']=True
obj('HeadPivot',parent='BodyMotion',origin=(.85,0,2.02))
loft('HorseHead',[(.78,0,2.04,.09,.13),(.92,0,2.075,.16,.19),(1.07,0,2.02,.155,.19),(1.23,0,1.92,.115,.135),(1.42,0,1.82,.125,.10),(1.50,0,1.81,.10,.075)],'HorseCoat','HeadPivot',n=10)
loft('Muzzle',[(1.35,0,1.82,.119,.095),(1.48,0,1.81,.12,.086),(1.515,0,1.80,.085,.061)],'Leather','HeadPivot',n=10)
for side,label in [(-1,'Near'),(1,'Far')]:
    y=side*.105
    tube('Ear'+label,[(.86,y,2.19),(.855,side*.14,2.30),(.89,side*.145,2.425)],[(.085,.056),(.055,.038),(.004,.004)],'HorseCoat','HeadPivot',n=6)
    obj('EarInset'+label,[[.90,y,2.23],[.92,side*.13,2.38],[.92,side*.17,2.28]],[[0,1,2]],'EarInner','HeadPivot')
    ell('Eye'+label,(1.042,side*.147,2.09),(.037,.015,.030),'Eyes','HeadPivot',n=8)
    ell('EyeGlint'+label,(1.05,side*.159,2.101),(.009,.005,.008),'Ivory','HeadPivot',n=6)
    ell('Nostril'+label,(1.432,side*.117,1.851),(.046,.009,.023),'Eyes','HeadPivot',n=8)
# White forehead blaze; on the forward-upper face, a narrow geometric ribbon.
obj('ForeheadBlaze',[[1.055,-.037,2.198],[1.055,.037,2.198],[1.24,.020,2.051],[1.40,.018,1.907],[1.40,-.018,1.907],[1.24,-.020,2.051]],[[0,1,2,5],[5,2,3,4]],'Ivory','HeadPivot')
# Swept jagged mane follows the posterior crest of neck.
verts=[]
for x,z in [(.31,1.61),(.36,1.82),(.47,2.01),(.62,2.18),(.80,2.22)]:
    verts.extend([[x,-.045,z],[x,.045,z],[x-.075,0,z+.075]])
faces=[]
for i in range(4):
    a=i*3;b=a+3;faces.extend([[a,b,b+2,a+2],[a+1,a+2,b+2,b+1]])
obj('Mane',verts,faces,'ManeTail','BodyMotion')
# Four clearly jointed legs, tapered cannon bones, angled pasterns and flat hooves.
for side,label in [(-1,'Near'),(1,'Far')]:
    y=.235*side
    for front,prefix in [(True,'Front'),(False,'Hind')]:
        name=prefix+label
        hip=(.43,y,1.24) if front else (-.70,y,1.24)
        knee=(.47,y,.66) if front else (-.44,y,.77)
        ankle=(.48,y,.22) if front else (-.79,y,.28)
        foot=(.55,y,.09) if front else (-.72,y,.09)
        upper=obj(name+'Upper',parent='BodyMotion',origin=hip)
        lower=obj(name+'Lower',parent=upper,origin=knee)
        hoof=obj(name+'Foot',parent=lower,origin=ankle)
        mid=tuple((hip[i]+knee[i])/2 for i in range(3))
        tube(name+'UpperMesh',[hip,mid,knee],[(.145,.12),(.095,.085),(.059,.058)],'HorseCoat',upper,hip,n=9)
        mid=tuple((knee[i]+ankle[i])/2 for i in range(3))
        tube(name+'Cannon',[knee,mid,ankle],[.059,.041,.055],'HorseCoat',lower,knee)
        sock=(front and side==-1) or (not front and side==1)
        tube(name+'Pastern',[ankle,foot],[.052,.061],'Ivory' if sock else 'HorseCoat',hoof,ankle)
        if sock:
            pt=tuple(ankle[i]+.23*(knee[i]-ankle[i]) for i in range(3))
            tube(name+'Sock',[pt,ankle],[.049,.057],'Ivory',lower,knee)
        # Hoof trapezoid has a truly planar sole at Z=0.
        x,y,z=foot
        v=[[x-.08,y-.063,0],[x+.12,y-.063,0],[x+.12,y+.063,0],[x-.08,y+.063,0],[x-.061,y-.051,.11],[x+.069,y-.051,.11],[x+.069,y+.051,.11],[x-.061,y+.051,.11]]
        obj(name+'Hoof',v,[[0,3,2,1],[4,5,6,7],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7]],'Hooves',hoof,ankle)
        P.setdefault('gallop_legs',[]).append({'upper':upper,'lower':lower,'foot':hoof,'front':front,'phase':0 if side==-1 else .18})
# Flowing tail made from three articulated tapered locks.
tailpts=[(-.94,0,1.47),(-1.20,0,1.38),(-1.42,.01,1.04),(-1.53,.015,.76)]
parent='BodyMotion'
for i in range(3):
    pivot=obj('TailJoint'+str(i+1),parent=parent,origin=tailpts[i]);parent=pivot
    tube('TailLock'+str(i+1),tailpts[i:i+2],[(.07,.075),(.095,.08)] if i==0 else ([(.095,.08),(.072,.06)] if i==1 else [(.072,.06),(.005,.006)]),'ManeTail',pivot,tailpts[i],n=7)
# Saddle cloth: draped curved panels, separate recolorable racing silks material.
for side,label in [(-1,'Near'),(1,'Far')]:
    v=[]
    for x in [-.43,.08]:
        for y,z in [(0,1.661),(side*.22,1.58),(side*.32,1.43),(side*.325,1.30)]:v.append([x,y,z])
    obj('SaddleCloth'+label,v,[[0,4,5,1],[1,5,6,2],[2,6,7,3]],'JockeySilk','BodyMotion',solidify=.016)
    tube('ClothPiping'+label,[(-.43,side*.328,1.31),(.08,side*.328,1.31)],[.014,.014],'SilkTrim',n=6)
    # White diamond emblem on the cloth, readable without textures.
    obj('RacingDiamond'+label,[[-.18,side*.337,1.50],[-.085,side*.342,1.405],[-.18,side*.342,1.32],[-.275,side*.342,1.405]],[[0,1,2,3]],'Ivory','BodyMotion')
loft('Saddle',[(-.46,0,1.64,.19,.047),(-.36,0,1.69,.18,.055),(-.15,0,1.68,.145,.035),(.08,0,1.69,.15,.051),(.14,0,1.66,.13,.035)],'Leather',n=8)
for side,label in [(-1,'Near'),(1,'Far')]:
    tube('Girth'+label,[(.02,0,1.65),(.02,side*.31,1.42),(.02,side*.25,1.07),(.02,0,1.035)],[.022]*4,'Leather',n=6)
    tube('CheekStrap'+label,[(.88,side*.137,2.19),(1.05,side*.164,2.02),(1.38,side*.125,1.81)],[.016]*3,'Leather','HeadPivot',n=6)
    tube('Browband'+label,[(1.02,0,2.245),(1.04,side*.12,2.21),(1.02,side*.165,2.11)],[.015]*3,'Leather','HeadPivot',n=6)
    tube('Noseband'+label,[(1.37,0,1.958),(1.39,side*.121,1.89),(1.38,side*.132,1.79),(1.35,0,1.731)],[.018]*4,'Leather','HeadPivot',n=6)
    # Bit ring lies in XZ plane.
    pts=[(1.34+.034*math.cos(i*math.pi/8),side*.14,1.80+.034*math.sin(i*math.pi/8)) for i in range(17)]
    tube('BitRing'+label,pts,[.009]*17,'Brass','HeadPivot',n=5)
# Jockey small relative to horse, aerodynamic crouch, not upright toy figure.
obj('JockeyPivot',parent='BodyMotion',origin=(-.12,0,1.72))
loft('JockeyTorso',[(-.32,0,1.88,.125,.10),(-.18,0,2.01,.13,.135),(.04,0,2.15,.15,.14),(.20,0,2.20,.14,.12),(.24,0,2.20,.10,.08)],'JockeySilk','JockeyPivot',n=8)
ell('JockeyHips',(-.30,0,1.84),(.16,.135,.12),'Breeches','JockeyPivot')
tube('JockeyCollar',[(.18,0,2.22),(.29,0,2.27)],[.065,.063],'Ivory','JockeyPivot')
ell('JockeyFace',(.34,0,2.31),(.102,.089,.115),'Skin','JockeyPivot')
loft('Helmet',[(.22,0,2.38,.07,.055),(.27,0,2.404,.104,.087),(.36,0,2.407,.104,.09),(.43,0,2.38,.06,.058)],'JockeySilk','JockeyPivot',n=10)
# Bright central helmet stripe.
obj('HelmetStripe',[[.22,-.024,2.438],[.27,-.024,2.493],[.36,-.024,2.497],[.43,-.024,2.438],[.22,.024,2.438],[.27,.024,2.493],[.36,.024,2.497],[.43,.024,2.438]],[[0,1,5,4],[1,2,6,5],[2,3,7,6]],'SilkTrim','JockeyPivot')
loft('HelmetVisor',[(.39,0,2.37,.092,.012),(.50,0,2.36,.065,.009)],'BootsGloves','JockeyPivot',n=6)
loft('GoggleLens',[(.42,0,2.32,.09,.028),(.444,0,2.317,.062,.025)],'Goggles','JockeyPivot',n=8)
for side,label in [(-1,'Near'),(1,'Far')]:
    tube('GoggleStrap'+label,[(.255,side*.079,2.33),(.33,side*.096,2.33),(.43,side*.077,2.325)],[.012]*3,'BootsGloves','JockeyPivot',n=6)
    # Elbows bent down, hands carried forward above withers.
    shoulder=(.12,side*.115,2.17);elbow=(.13,side*.20,1.97);hand=(.56,side*.115,1.92)
    tube('JockeySleeve'+label,[shoulder,elbow,(.49,side*.14,1.93)],[.077,.059,.039],'JockeySilk','JockeyPivot',n=8)
    tube('Cuff'+label,[(.46,side*.15,1.935),(.51,side*.135,1.926)],[.043,.043],'SilkTrim','JockeyPivot',n=8)
    ell('Glove'+label,hand,(.072,.042,.04),'BootsGloves','JockeyPivot',n=8)
    knee=(-.01,side*.33,1.50);ankle=(-.38,side*.35,1.22)
    tube('JockeyThigh'+label,[(-.31,side*.10,1.86),(-.18,side*.26,1.71),knee],[.095,.085,.065],'Breeches','JockeyPivot',n=8)
    tube('RidingBoot'+label,[knee,(-.17,side*.35,1.33),ankle],[.064,.052,.043],'BootsGloves','JockeyPivot',n=8)
    loft('BootToe'+label,[(-.43,side*.35,1.19,.05,.044),(-.30,side*.35,1.18,.055,.039),(-.22,side*.35,1.18,.035,.025)],'BootsGloves','JockeyPivot',n=6)
    tube('StirrupLeather'+label,[(-.19,side*.18,1.70),(-.27,side*.37,1.38),(-.31,side*.40,1.18)],[.013]*3,'Leather')
    tube('StirrupIron'+label,[(-.39,side*.40,1.20),(-.42,side*.40,1.14),(-.24,side*.40,1.14),(-.25,side*.40,1.23)],[.012]*4,'Brass')
    tube('Rein'+label,[(1.34,side*.15,1.80),(1.10,side*.24,1.68),(.85,side*.23,1.78),hand],[.009]*4,'Leather','BodyMotion',n=5)
P['animation_spec']={'name':'Gallop','frames':97,'fps':120,'period_seconds':.8,'notes':'Per-frame baked rigid articulated gallop; identical end pose, no root translation; stance sole at Y=0 and airborne suspension. Head nod, secondary tail and independent jockey bob.'}
P['preview_spec']={'camera':[4.1,-7.5,3.0],'target':[0,0,1.25],'ortho_scale':4.05,'lights':[{'name':'Key_Softbox','location':[1,-4,6],'energy':750,'size':5,'color':[1,.84,.68]},{'name':'Fill_Softbox','location':[1,4,4],'energy':900,'size':4,'color':[.67,.84,1]},{'name':'Rim_Softbox','location':[-4,1,5],'energy':1100,'size':3,'color':[1,.77,.47]}]}
ROOT.mkdir(exist_ok=True)
(ROOT/'horse.blend-cli.json').write_text(json.dumps(P,indent=2)+'\n')
print(f"Authored {len(P['objects'])} nodes into {ROOT/'horse.blend-cli.json'}")
