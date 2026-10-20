#!/usr/bin/env python3
"""Retakes the README screenshots from dist/negareh.html (phone size, 2x).

    python3 build.py && python3 tools/screenshots.py
"""
import asyncio, pathlib
from PIL import Image
from playwright.async_api import async_playwright
ROOT=pathlib.Path(__file__).resolve().parent.parent
OUT=str(ROOT/'docs'/'screenshots')+'/'
GAME=(ROOT/'dist'/'negareh.html').as_uri()
# route to the first two shards of a chapter (from the playthrough test)
ROUTES={0:"['1,1,1','2,1,1','1,1,2','-1,2,1','-1,2,0','-1,3,-2','0,3,-2','-1,3,-3',ros(0),'-2,5,-3','-2,5,-4']",
        1:"['1,2,-2','3,7,1']",
        5:"['2,1,1','1,1,1','0,2,-1','-3,2,-1','-3,2,-2','-2,3,-4','-3,3,-5']",
        6:"['0,1,4','3,2,2','2,2,2']"}
def js(li,route):
  return r"""(()=>{const N=window.__negareh,G=N.G;
const sim=(sec,until)=>{for(let i=0;i<sec*60;i++){N.tick(1/60);if(until&&until())return true}return false};
const ros=i=>()=>{N.triggerRosette(G.rosettes[i]);sim(2.6)};
const waitMover=(i,idx)=>()=>{const m=G.movers[i];sim(20,()=>!m.moving&&m.idx===idx)};
document.getElementById('cardIntro').hidden=true;N.openPage(%d,true);const keep=G.guards.slice();G.guards.length=0;
for(const s of %s){if(typeof s==='string'){N.walkTo(s);sim(20,()=>N.P.from===s&&N.P.to===null)}else s()}
G.guards.push(...keep);sim(1.2);return G.shardsGot})()"""%(li,route)
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    pg=await b.new_page(viewport={'width':390,'height':780},device_scale_factor=2)
    await pg.goto(GAME,wait_until='domcontentloaded');await pg.wait_for_timeout(3000)
    await pg.screenshot(path=OUT+'_title.png')
    for li,name in [(0,'courtyard'),(1,'builders'),(5,'seven-pavilions'),(6,'mountain-of-birds')]:
      await pg.goto(GAME,wait_until='domcontentloaded');await pg.wait_for_timeout(2000)
      print(name,await pg.evaluate(js(li,ROUTES[li])))
      await pg.wait_for_timeout(4500);await pg.screenshot(path=OUT+'_'+name+'.png')
    await pg.goto(GAME,wait_until='domcontentloaded');await pg.wait_for_timeout(2000)
    await pg.click('#bLearn');await pg.wait_for_timeout(2500)
    await pg.evaluate("window.__negareh.walkTo('1,1,2')");await pg.wait_for_timeout(2500)
    await pg.evaluate("window.__negareh.walkTo('2,1,1')");await pg.wait_for_timeout(5500)
    await pg.screenshot(path=OUT+'_tutorial.png')
    await b.close()
def compress():
  for p in pathlib.Path(OUT).glob('_*.png'):
    im=Image.open(p).convert('RGB');im=im.resize((600,round(600*im.height/im.width)),Image.LANCZOS)
    im.save(p.with_name(p.stem[1:]+'.jpg'),quality=86,optimize=True,progressive=True);p.unlink()
asyncio.run(main());compress()
