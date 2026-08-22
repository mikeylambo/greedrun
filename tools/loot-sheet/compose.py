# Composes docs/loot-reference.png from the per-kind engine crops produced by
# tests/tmp/lootsheet.mjs. Every number here is read off web/index.html
# (LOOT_TYPES ~L1472, lootColor/drawLoot ~L4515) — nothing is invented.
import json, os
from PIL import Image, ImageDraw, ImageFont

D   = os.environ.get('LOOT_OUT', '/tmp/greedrun-loot')
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'docs', 'loot-reference.png')
G   = json.load(open(D + '/geo.json'))
RS  = G['RS']                       # 2.5 backing px per world unit (engine ceiling)

F   = '/usr/share/fonts/truetype/dejavu/'
def f(n, s): return ImageFont.truetype(F + n, s)
SER, SERB = f('DejaVuSerif.ttf', 30), f('DejaVuSerif-Bold.ttf', 44)
H2   = f('DejaVuSerif-Bold.ttf', 26)
B    = f('DejaVuSans-Bold.ttf', 25)
BS   = f('DejaVuSans-Bold.ttf', 19)
S    = f('DejaVuSans.ttf', 19)
XS   = f('DejaVuSans.ttf', 17)
M    = f('DejaVuSansMono.ttf', 18)
MS   = f('DejaVuSansMono.ttf', 16)

BG, PANEL, EDGE = (11,13,18), (18,21,29), (38,43,56)
GOLD, INK, MUT  = (201,179,122), (232,226,212), (125,132,148)

# slot, kind, LOOT_TYPES id, name, value, weight, noise, curse, hex, silhouette, body w/h (world units)
ROWS = [
 (1,'common','coin','Loose Coin','60','1','0','0','#e9c15a','circle r5','10 x 10'),
 (2,'valuable','gem','Cut Gem','170','2','1','0','#7fe3d0','diamond r5','10 x 10'),
 (3,'loud','idol','Golden Idol','460','5','4','0','#f5c542','arch s7','9.8 x 16.1'),
 (4,'cursed','mask','Marked Relic','900','6','2','3','#a98bff','arch s7','9.8 x 16.1'),
 (5,'living','living','Skitterjewel','380','3','2','0','#7fd88a','creature','16 x 13'),
 (6,'royal','royal','Crown Jewels','720','5','3','0','#ff5da8','arch s5','7 x 11.5'),
 (7,'fragile','fragile','Porcelain Relic','560','2','0','0','#dfeaf5','arch s5','7 x 11.5'),
 (8,'fake','fake','Gilded Fake','520','2','0','0','#ffd27a','arch s5','7 x 11.5'),
 (9,'shrine','shrine','Offering Shrine','0','0','0','0','#a98bff','altar + gem','18 x 24'),
 (10,'artifact','artifact','Bound Relic (x12)','700-1149','0','0','0','#a98bff','halo + gem','28 x 28'),
 (11,'mythic','heart','Vault Heart','2600','11','6','6','#ff6b8a','arch s9','12.6 x 20.7'),
]
# glow radius in world units, per drawLoot()
GLOW = {'living':18,'shrine':'18-22','artifact':30}

ART, PAD, GUT = 360, 26, 26          # art tile px, cell padding, gutter
CELL_W, CELL_H = ART + PAD*2, ART + PAD*2 + 218
COLS = 4
HEAD, FOOT = 250, 330
Wpx = GUT + COLS*(CELL_W+GUT)
Hpx = HEAD + 3*(CELL_H+GUT) + FOOT

im = Image.new('RGB',(Wpx,Hpx),BG); d = ImageDraw.Draw(im)

def hexrgb(h): return tuple(int(h[i:i+2],16) for i in (1,3,5))

# ---- header -----------------------------------------------------------------
d.text((GUT+4,44),'GREEDRUN — LOOT SLOTS', font=SERB, fill=GOLD)
d.text((GUT+6,104),'Every drawable loot kind, rendered through the game’s own drawLoot() at the engine’s maximum render scale (RS 2.5).', font=S, fill=INK)
d.text((GUT+6,134),'Each art tile is 72 x 72 world units at 2x nearest-neighbour. Glow radii are the resting value; the idle pulse swells them by up to 12%.', font=S, fill=MUT)
d.text((GUT+6,164),'Build 2026-08-17.27  ·  LOOT_TYPES ~L1472  ·  lootColor()/drawLoot() ~L4515', font=MS, fill=MUT)
d.line((GUT+4,206,Wpx-GUT-4,206), fill=EDGE, width=2)

# ---- cells ------------------------------------------------------------------
for i,(slot,kind,lid,name,val,wt,noi,cur,hx,shape,dims) in enumerate(ROWS):
    cx = GUT + (i%COLS)*(CELL_W+GUT)
    cy = HEAD + (i//COLS)*(CELL_H+GUT)
    d.rounded_rectangle((cx,cy,cx+CELL_W,cy+CELL_H), 12, fill=PANEL, outline=EDGE, width=2)

    # art: centre 72 world units of the crop, 5x nearest so every engine pixel is visible
    src = Image.open(D+'/'+kind+'.png').convert('RGB')
    n = int(round(72*RS))                                   # 180 px
    o = (src.width-n)//2
    d.rectangle((cx+PAD-1,cy+PAD-1,cx+PAD+ART,cy+PAD+ART), outline=EDGE, width=1)
    im.paste(src.crop((o,o,o+n,o+n)).resize((ART,ART),Image.NEAREST),(cx+PAD,cy+PAD))

    tx, ty = cx+PAD, cy+PAD+ART+16
    d.text((tx,ty), ('%02d'%slot)+'   '+kind.upper(), font=M, fill=GOLD)
    d.text((tx+CELL_W-PAD*2, ty-1), 'id '+lid, font=MS, fill=MUT, anchor='ra')
    d.text((tx,ty+30), name, font=B, fill=INK)
    d.text((tx,ty+68), 'value %-9s weight %s'%(val,wt), font=MS, fill=MUT)
    d.text((tx,ty+92), 'noise %-9s curse %s'%(noi,cur), font=MS, fill=MUT)
    d.text((tx,ty+116), '%-12s body %s u'%(shape,dims), font=MS, fill=MUT)
    d.text((tx,ty+140), 'glow r%s u'%GLOW.get(kind,20), font=MS, fill=MUT)
    # colour chip
    d.rounded_rectangle((tx,ty+168,tx+34,ty+196), 5, fill=hexrgb(hx), outline=EDGE, width=1)
    d.text((tx+46,ty+172), hx, font=M, fill=INK)

# ---- footer: true on-screen size ---------------------------------------------
fy = HEAD + 3*(CELL_H+GUT) + 6
d.line((GUT+4,fy,Wpx-GUT-4,fy), fill=EDGE, width=2)
d.text((GUT+6,fy+22),'AT TRUE PHONE SIZE', font=H2, fill=GOLD)
d.text((GUT+6,fy+58),'The same crops at the physical pixel density of an iPhone in portrait (390 pt stage, VIEW 600 u wide → 1 world unit = 0.65 pt = 1.95 px at 3x).', font=S, fill=INK)
d.text((GUT+6,fy+86),'This row is 1:1 with the phone’s own pixels. Read it before designing anything: at this size the halo is the object, and the body is a hint of shape inside it.', font=S, fill=MUT)

TRUE = 1.95/RS                     # crop px -> real device px on a 3x phone
strip_y = fy+128
for i,(slot,kind,lid,name,*rest) in enumerate(ROWS):
    src = Image.open(D+'/'+kind+'.png').convert('RGB')
    n = int(round(72*RS)); o=(src.width-n)//2
    t = src.crop((o,o,o+n,o+n))
    tn = max(1,int(round(n*TRUE)))
    t = t.resize((tn,tn), Image.LANCZOS)
    bx = GUT+6 + i*128
    im.paste(t,(bx+(120-tn)//2, strip_y+(120-tn)//2))
    d.text((bx+60, strip_y+126), kind, font=XS, fill=MUT, anchor='ma')

# 20 pt scale bar, in the same physical pixels as the strip above
bar = int(round(20*3))             # 20 pt at 3x
bx = GUT+6 + len(ROWS)*128 + 30
d.line((bx, strip_y+58, bx+bar, strip_y+58), fill=GOLD, width=3)
d.line((bx, strip_y+50, bx, strip_y+66), fill=GOLD, width=3)
d.line((bx+bar, strip_y+50, bx+bar, strip_y+66), fill=GOLD, width=3)
d.text((bx, strip_y+74), '20 pt', font=MS, fill=GOLD)
d.text((bx, strip_y+98), '(a tap target is 44)', font=MS, fill=MUT)

os.makedirs(os.path.dirname(OUT), exist_ok=True)
im.save(OUT)
print(OUT, im.size)
