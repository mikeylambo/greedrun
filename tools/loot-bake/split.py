#!/usr/bin/env python3
"""Split an OBJ into its connected components.

  split.py model.obj --list                 # what's in here?
  split.py model.obj --pick 0,1 --out a.obj # write those components as one mesh

Some slots need two sprites from one generated model — the shrine's crystal
floats above its altar and rises with the idle pulse, and the artifact's halo
spins while the relic inside it holds still. Fused into one image, either would
animate wrongly (see docs/LOOT_SLOTS.md).

Floating parts are disconnected geometry, so components fall out for free. UVs,
normals and the material reference are carried through, so each piece still
bakes with its own texture.
"""
import argparse, sys, signal
from collections import defaultdict
signal.signal(signal.SIGPIPE, signal.SIG_DFL)   # play nicely with `| head`

ap = argparse.ArgumentParser()
ap.add_argument('obj')
ap.add_argument('--list', action='store_true')
ap.add_argument('--pick', help='comma-separated component ids to write')
ap.add_argument('--out')
a = ap.parse_args()

V, VT, VN, faces, head = [], [], [], [], []
for line in open(a.obj):
    t = line.split()
    if not t: continue
    if   t[0] == 'v':  V.append(line)
    elif t[0] == 'vt': VT.append(line)
    elif t[0] == 'vn': VN.append(line)
    elif t[0] == 'f':  faces.append([p.split('/') for p in t[1:]])
    elif t[0] in ('mtllib','usemtl','o','g'): head.append(line)

# Generated meshes usually arrive UNWELDED — adjacent faces carry their own
# copies of a shared corner, so a naive union-find over vertex INDICES reports
# a thousand "components" for one solid object. Weld by POSITION first: snap
# each vertex to a fine grid and let coincident corners share a key.
GRID = 1e-4
weld = {}
def key(i):
    p = V[i-1].split()
    return (round(float(p[1])/GRID), round(float(p[2])/GRID), round(float(p[3])/GRID))
for i in range(1, len(V)+1):
    weld.setdefault(key(i), i)
def rep(i):
    return weld[key(i)]

# union-find over welded vertices; faces glue their corners together
par = list(range(len(V)+1))
def find(x):
    while par[x] != x: par[x] = par[par[x]]; x = par[x]
    return x
def uni(x,y):
    x,y = find(x), find(y)
    if x != y: par[y] = x
def vidx(c):
    i = int(c[0]);  return i if i > 0 else len(V)+1+i

for f in faces:
    ids = [rep(vidx(c)) for c in f]
    for i in ids[1:]: uni(ids[0], i)

groups = defaultdict(list)
for n, f in enumerate(faces): groups[find(rep(vidx(f[0])))].append(n)
# biggest first, so ids are stable and 0 is always the main body
comps = sorted(groups.values(), key=len, reverse=True)

def bbox(fs):
    xs=[];ys=[];zs=[]
    for n in fs:
        for c in faces[n]:
            p = V[vidx(c)-1].split()
            xs.append(float(p[1])); ys.append(float(p[2])); zs.append(float(p[3]))
    return (min(xs),max(xs)), (min(ys),max(ys)), (min(zs),max(zs))

if a.list or not a.pick:
    print(f'{a.obj}: {len(faces)} faces in {len(comps)} component(s)')
    for i, fs in enumerate(comps):
        (x0,x1),(y0,y1),(z0,z1) = bbox(fs)
        print(f'  [{i}] {len(fs):5d} faces   size {x1-x0:.3f} x {y1-y0:.3f} x {z1-z0:.3f}'
              f'   y-centre {(y0+y1)/2:+.3f}')
    if not a.pick: sys.exit(0)

if not a.out: sys.exit('--pick needs --out')
want = [comps[int(i)] for i in a.pick.split(',')]
keep = sorted({n for fs in want for n in fs})

# remap only the elements these faces actually reference
mv, mt, mn = {}, {}, {}
def rm(m, i, src): 
    if i not in m: m[i] = len(m)+1
    return m[i]
out = list(head)
body = []
for n in keep:
    parts = []
    for c in faces[n]:
        vi = rm(mv, vidx(c), V)
        ti = rm(mt, int(c[1]), VT) if len(c) > 1 and c[1] else None
        ni = rm(mn, int(c[2]), VN) if len(c) > 2 and c[2] else None
        parts.append(f'{vi}' + (f'/{ti}' if ti else ('/' if ni else '')) + (f'/{ni}' if ni else ''))
    body.append('f ' + ' '.join(parts) + '\n')

with open(a.out, 'w') as fh:
    fh.writelines(head)
    for i,_ in sorted(mv.items(), key=lambda kv: kv[1]): fh.write(V[i-1])
    for i,_ in sorted(mt.items(), key=lambda kv: kv[1]): fh.write(VT[i-1])
    for i,_ in sorted(mn.items(), key=lambda kv: kv[1]): fh.write(VN[i-1])
    fh.writelines(body)
print(f'{a.out}: {len(keep)} faces, {len(mv)} verts  (components {a.pick})')
