#!/usr/bin/env python3
"""Turn a flat preview render into a transparent sprite source.

  from_image.py shot.png --list                    # what separable parts are in here?
  from_image.py shot.png --out cut.png             # key the background
  from_image.py shot.png --out crystal.png --pick 1

Then feed the result to post.py exactly like a bake:
  python3 tools/loot-bake/post.py cut.png web/assets/loot/mask.png --units 16 --outline 4

The background is removed by FLOOD FILL from the corners, never by a global
colour key. A global key punches every pixel that happens to match — which is
how web/assets/jo/atlas.png ended up 13% filled when build_atlas.py keyed out
the near-black outfit along with the backdrop. Flood fill only ever eats pixels
connected to the edge, so interior highlights and white specular survive.
"""
import argparse, sys
from PIL import Image, ImageDraw

SENTINEL = (1, 254, 3)   # verified absent before use

ap = argparse.ArgumentParser()
ap.add_argument('src'); ap.add_argument('--out')
ap.add_argument('--tol', type=int, default=32, help='background colour tolerance')
ap.add_argument('--list', action='store_true')
ap.add_argument('--pick', help='comma-separated part ids to keep (see --list)')
ap.add_argument('--min-part', type=int, default=200, help='ignore blobs under this many px')
a = ap.parse_args()

im = Image.open(a.src).convert('RGBA')
W, H = im.size

# If the source already carries alpha, trust it and skip keying entirely.
alpha = im.split()[-1]
if alpha.getextrema()[0] < 250:
    mask = alpha.point(lambda v: 255 if v > 8 else 0)
else:
    rgb = im.convert('RGB')
    if SENTINEL in {c for _, c in (rgb.getcolors(W*H) or [])}:
        sys.exit('sentinel colour occurs in the image; pick another')
    for seed in [(0,0), (W-1,0), (0,H-1), (W-1,H-1)]:
        ImageDraw.floodfill(rgb, seed, SENTINEL, thresh=a.tol)
    mask = Image.new('L', (W,H), 0)
    mp, rp = mask.load(), rgb.load()
    for y in range(H):
        for x in range(W):
            if rp[x,y] != SENTINEL: mp[x,y] = 255

# Separable parts = connected regions of the mask. The shrine's crystal floats
# clear of its altar, so it falls out here the same way it does from the mesh.
work = mask.copy(); wp = work.load()
parts, label = [], 0
for y in range(H):
    for x in range(W):
        if wp[x,y] != 255: continue
        label += 1
        ImageDraw.floodfill(work, (x,y), label, thresh=0)
        parts.append(label)
def region(lbl):
    r = work.point(lambda v, l=lbl: 255 if v == l else 0)
    return r, r.getbbox(), sum(r.histogram()[255:])
info = []
for l in parts:
    r, bb, n = region(l)
    if n >= a.min_part: info.append((n, l, bb, r))
info.sort(key=lambda t: -t[0])

if a.list or not a.out:
    print(f'{a.src}: {len(info)} part(s) over {a.min_part}px')
    for i,(n,l,bb,_) in enumerate(info):
        print(f'  [{i}] {n:7d} px   bbox {bb}   {bb[2]-bb[0]}x{bb[3]-bb[1]}')
    if not a.out: sys.exit(0)

keep = [int(i) for i in a.pick.split(',')] if a.pick else range(len(info))
sel = Image.new('L', (W,H), 0)
for i in keep: sel.paste(info[i][3], (0,0), info[i][3])
out = im.copy(); out.putalpha(sel)
out.save(a.out)
bb = sel.getbbox()
print(f'{a.out}: parts {list(keep)}  content {bb[2]-bb[0]}x{bb[3]-bb[1]} in {W}x{H}')
