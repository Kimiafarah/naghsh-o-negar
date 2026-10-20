#!/usr/bin/env python3
"""Plays the tutorial and all seven chapters headlessly and checks each one can be finished.

    pip install playwright && python3 -m playwright install chromium
    python3 build.py && python3 tests/playthrough.py

Exits with status 1 if any page cannot be finished or the page throws an error.
When you add or change a chapter, update its route in CHAPTERS_JS below.
"""
import asyncio, pathlib, sys
from playwright.async_api import async_playwright

GAME = (pathlib.Path(__file__).resolve().parent.parent / 'dist' / 'negareh.html').as_uri()

# Routes through each chapter (guards removed so the route is deterministic)
CHAPTERS_JS = r"""
(()=>{const N=window.__negareh;const log=[];
let close=0,frames=0,minD=9;const sim=(sec,until)=>{for(let i=0;i<sec*60;i++){N.tick(1/60);frames++;const P=N.P,C=N.CAT;if(C.fade>.5&&!C.hidden&&Math.abs(P.pos[1]-C.pos[1])<.5){const d=Math.hypot(P.pos[0]-C.pos[0],P.pos[2]-C.pos[2]);minD=Math.min(minD,d);if(d<.35){close++;if(close%5==1)log.push('   near P '+P.from+'>'+P.to+' r'+!!P.riding+' C '+C.from+'>'+C.to+' r'+!!C.riding+' d'+d.toFixed(2))}}if(until&&until())return true}return !!(until&&until())};
const go=(k,sec=20)=>{const ok=N.walkTo(k);if(!ok){log.push('  NO PATH to '+k+' from '+N.P.from);return false}const r=sim(sec,()=>N.P.from===k&&N.P.to===null);if(!r)log.push('  TIMEOUT '+k);return r};
const run=(li,steps)=>{N.openPage(li,true);document.getElementById('cardPage').hidden=true;N.G.guards.length=0;
  for(const s of steps){if(typeof s==='string')go(s);else s()}
  log.push('L'+li+' overlapFrames '+close+' minDist '+minD.toFixed(2)+' |');close=0;minD=9;log.push('L'+li+' shards '+N.G.shardsGot+' gate '+N.G.gateOpen+' mode '+N.G.mode+' gold '+N.G.levelGold+'/'+N.G.coins.length)};
const ros=i=>()=>{N.triggerRosette(N.G.rosettes[i]);sim(2.6)};
const waitMover=(i,idx)=>()=>{const m=N.G.movers[i];const r=sim(20,()=>!m.moving&&m.idx===idx);if(!r)log.push('  mover '+i+' never at '+idx)};
run(0,['1,1,1','2,1,1','1,1,2','-1,2,1','-1,2,0','-1,3,-2','0,3,-2','-1,3,-3',ros(0),'-2,5,-3','-2,5,-4','-4,6,-4','-4,6,-5']);
run(1,['1,2,-2','3,7,1','2,7,2',waitMover(0,1),'-1,9,0','0,9,1','1,9,0','2,9,0']);
run(2,[ros(0),'0,2,1','2,2,0',ros(1),'1,3,-1','4,3,-2',ros(2),'0,4,-3','1,4,-4','0,4,-4']);
run(3,['1,1,1','2,1,1','1,1,2','-1,1,1',ros(0),'-1,1,-1','0,1,-2','-3,2,-3','-2,2,-3',waitMover(0,0),'-1,2,-3',waitMover(0,1),'-1,5,-4','-2,5,-4','-2,5,-5']);
run(4,['1,1,2','0,1,2','1,1,0','2,1,1','0,2,-2',waitMover(0,0),'-1,2,-2',waitMover(0,1),'-3,2,-3',waitMover(1,0),'-3,2,-4',waitMover(1,1),'-2,5,-4','-2,5,-5','-3,5,-5']);
run(5,['2,1,1','1,1,1','0,2,-1','-3,2,-1','-3,2,-2','-2,3,-4','-3,3,-5',ros(0),'-3,5,-6','-4,5,-6','-4,5,-7']);
run(6,['0,1,4','3,2,2','2,2,2',waitMover(0,0),'2,2,1',waitMover(0,1),'3,5,1','0,6,0','0,6,1']);
return log.join('\n')})()
"""

# The lesson, with its guard left in
TUTORIAL_JS = r"""
(()=>{const N=window.__negareh,G=N.G,log=[];
const sim=(sec,until)=>{for(let i=0;i<sec*60;i++){N.tick(1/60);if(until&&until())return true}return !!(until&&until())};
const go=(k,sec=20)=>{const ok=N.walkTo(k);if(!ok){log.push('NO PATH '+k+' from '+N.P.from);return}sim(sec,()=>N.P.from===k&&N.P.to===null);log.push(k+' coach '+N.coachI+' shards '+G.shardsGot+' gold '+G.levelGold+' danger '+!!G.danger+' mode '+G.mode)};
document.getElementById('bLearn').click();sim(1);log.push('start coach '+N.coachI+' text '+document.getElementById('coachText').textContent+' tut '+G.tut);
go('1,1,2');go('2,1,1');go('-1,2,1');go('-1,2,0');
N.triggerRosette(G.rosettes[0]);sim(2.5);log.push('after star coach '+N.coachI+' mover idx '+G.movers[0].idx);
go('-1,2,-3');go('-1,3,-5');go('-2,3,-5');
log.push('gateOpen '+G.gateOpen+' coach '+N.coachI);
const g=G.guards[0];sim(6,()=>g.facing[1]===1);sim(.4);go('-2,3,-6');sim(1.5);
log.push('mode '+G.mode+' lamps '+G.lamps+' card '+!document.getElementById('cardDone').hidden+' title '+document.getElementById('cdTitle').textContent+' next '+document.getElementById('cdNext').textContent);
document.getElementById('cdNext').click();log.push('after next li '+G.li+' tut '+G.tut+' mode '+G.mode+' coachHidden '+document.getElementById('coach').hidden+' pageCard '+!document.getElementById('cardPage').hidden);
log.push('MUS on '+N.MUS.on+' li '+N.MUS.li+' coinN '+N.MUS.coinN+' shimmer '+N.MUS.shimmer.toFixed(1));
return log.join('\n')})()
"""

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        errs = []
        ok = True
        for name, js in (('tutorial', TUTORIAL_JS), ('chapters', CHAPTERS_JS)):
            pg = await b.new_page(viewport={'width': 390, 'height': 844})
            pg.on('pageerror', lambda e: errs.append(str(e)))
            await pg.goto(GAME, wait_until='domcontentloaded')
            await pg.wait_for_timeout(1500)
            log = await pg.evaluate(js)
            print(f'--- {name}\n{log}')
            if name == 'tutorial':
                ok &= 'title Ready.' in log
            else:
                ok &= log.count('mode done') == 7 and 'NO PATH' not in log and 'TIMEOUT' not in log
            await pg.close()
        await b.close()
    if errs:
        print('page errors:', errs)
    print('PASS' if ok and not errs else 'FAIL')
    sys.exit(0 if ok and not errs else 1)

asyncio.run(main())
