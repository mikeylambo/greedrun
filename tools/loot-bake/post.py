#!/usr/bin/env python3
"""Turn a raw bake into a game-ready loot sprite.

  post.py <raw.png> <out.png> [--units 10] [--outline 4] [--cell 128]

The cell is 32 world units wide (4 px/unit) per docs/LOOT_SLOTS.md. `--units` is
how many world units the object should occupy; the vector coin it replaces is a
10-unit circle. The outline is the one thing baked IN — `#050404`, the same ink
the vector art strokes with, and what keeps a 6.5 pt object legible on a
near-black floor.
"""
import sys, argparse
from PIL import Image, ImageFilter

INK = (5, 4, 4)

ap = argparse.ArgumentParser()
ap.add_argument('raw'); ap.add_argument('out')
ap.add_argument('--units', type=float, default=10.0)
ap.add_argument('--outline', type=int, default=4)
ap.add_argument('--cell', type=int, default=128)
ap.add_argument('--ppu', type=float, default=4.0)     # px per world unit inside the cell
a = ap.parse_args()

im = Image.open(a.raw).convert('RGBA')
bb = im.split()[-1].getbbox()
if not bb: sys.exit('raw render is empty')
im = im.crop(bb)

# Scale so the WIDEST axis spans `units` world units.
target = max(1, int(round(a.units * a.ppu)))
w, h = im.size
sc = target / max(w, h)
im = im.resize((max(1,int(round(w*sc))), max(1,int(round(h*sc)))), Image.LANCZOS)

# Ink outline: dilate the alpha, keep the ring, fill it with INK, put it under.
pad = a.outline + 2
lay = Image.new('RGBA', (im.width + pad*2, im.height + pad*2), (0,0,0,0))
lay.paste(im, (pad, pad))
alpha = lay.split()[-1]
if a.outline > 0:
    grown = alpha.filter(ImageFilter.MaxFilter(a.outline*2 + 1))
    ring  = Image.new('RGBA', lay.size, INK + (0,))
    ring.putalpha(grown)
    lay = Image.alpha_composite(ring, lay)

cell = Image.new('RGBA', (a.cell, a.cell), (0,0,0,0))
cell.paste(lay, ((a.cell - lay.width)//2, (a.cell - lay.height)//2), lay)
cell.save(a.out)
print(f'{a.out}  cell={a.cell}  object={im.width}x{im.height}px '
      f'({im.width/a.ppu:.1f}x{im.height/a.ppu:.1f} u)  '
      f'with ink={lay.width-4}x{lay.height-4}px ({(lay.width-4)/a.ppu:.1f}u)  outline={a.outline}px')
