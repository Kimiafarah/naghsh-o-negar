/* =========================================================
   Movers, fallers, rotators
   ========================================================= */
function departMover(m){
  const topK=K(m.stops[m.idx][0],m.stops[m.idx][1]+1,m.stops[m.idx][2]);
  m.moving=true;m.t=0;m.toIdx=1-m.idx;const a=m.stops[m.idx],b=m.stops[m.toIdx];m.dur=Math.hypot(b[0]-a[0],b[1]-a[1],b[2]-a[2])/m.speed;
  for(const ag of [P,CAT]){
    if(ag.from===topK&&(ag.to===null||ag.t<.5)){const tp=moverTop(m);ag.riding={m,off:[0,0,0]};ag.to=null;ag.path=[];ag.pos=[tp[0],tp[1],tp[2]]}
  }
  rebuildGraph();
}
function updateMovers(dt){
  for(const m of G.movers){
    if(!m.moving){if(m.mode==='auto'){m.timer-=dt;if(m.timer<=0)departMover(m)}continue}
    m.t=Math.min(1,m.t+dt/m.dur);const e=m.t<.5?2*m.t*m.t:1-Math.pow(-2*m.t+2,2)/2;const a=m.stops[m.idx],b=m.stops[m.toIdx];
    for(let k=0;k<3;k++)m.pos[k]=a[k]+(b[k]-a[k])*e;
    const both=P.riding&&CAT.riding&&P.riding.m===m&&CAT.riding.m===m;for(const ag of [P,CAT])if(ag.riding&&ag.riding.m===m){const tp=moverTop(m),o=both?(ag===CAT?.24:-.2):0;ag.pos=[tp[0]+o,tp[1],tp[2]-o]}
    if(m.t>=1){m.idx=m.toIdx;m.moving=false;m.timer=m.wait||0;m.pos=[...m.stops[m.idx]];rebuildGraph();
      const topK=K(m.stops[m.idx][0],m.stops[m.idx][1]+1,m.stops[m.idx][2]);
      for(const ag of [P,CAT])if(ag.riding&&ag.riding.m===m){ag.riding=null;ag.from=topK;ag.pos=nodeCenter(topK);if(ag===P)onPlayerArrive(topK)}
      lockIn()}
  }
}
function lockIn(){pluck(SHUR[0]/2,0,.07,.7);if(ac&&MUS.out)dum(ac.currentTime+.01,.18);try{navigator.vibrate&&navigator.vibrate(12)}catch(e){}}
function updateFallers(dt){
  for(const f of G.fallers){
    f.t+=dt;const topK=K(f.x,f.y+1,f.z);
    if(f.state==='shake'&&f.t>1.2){f.state='fall';f.t=0;rebuildGraph();pluck(SHUR[1]/2,0,.08,.6);
      const onIt=(P.from===topK&&(P.to===null||P.t<.5));if(onIt&&G.mode==='play'){P.path=[];P.to=null;P.falling={f,y0:P.pos[1]};caught('fall')}
      if(CAT.from===topK)teleportCat()}
    else if(f.state==='fall'&&f.t>1.4){f.state='gone';f.t=0}
    else if(f.state==='gone'&&f.t>3){f.state='rise';f.t=0}
    else if(f.state==='rise'&&f.t>.6){f.state='idle';f.t=0;rebuildGraph()}
  }
}
function fallerY(f){if(f.state==='fall')return -f.t*f.t*4;if(f.state==='gone')return -99;if(f.state==='rise')return -(1-f.t/.6)*.6;return 0}
function triggerRosette(r){
  const [type,i]=r.target;r.pulse=1;
  if(type==='mover'){const m=G.movers[i];if(m.moving)return;departMover(m);runNotes([0,1,2,3,4,5,6,7],.055,.06);shot(m.stops.flatMap(st=>[[st[0]+.5,st[1]+1.5,st[2]+.5],[st[0]+.5,st[1],st[2]+.5]]),m.dur+.9)}
  if(type==='rotator'){const ro=G.rotators[i];if(ro.anim)return;
    const cells=rotCells(ro,ro.state).map(c=>K(c[0],c[1]+1,c[2]));
    if(cells.includes(P.from)||cells.includes(P.to)){toast('Step off first.',1400);pluck(SHUR[0]/2,0,.05,.3);return}
    if(cells.includes(CAT.from))teleportCat();
    const to=ro.states[0]===ro.state?ro.states[1]:ro.states[0];ro.anim={from:ro.state,to,t:0};rebuildGraph();runNotes([7,6,5,4,3,2,1,0],.05,.06);
    shot(ro.states.flatMap(st=>rotCells(ro,st)).concat([ro.pivot]).flatMap(c=>[[c[0]+.5,c[1]+1.3,c[2]+.5],[c[0]+.5,c[1],c[2]+.5]]),1.7)}
}
function updateRotators(dt){
  for(const r of G.rotators){if(!r.anim)continue;r.anim.t=Math.min(1,r.anim.t+dt/1.5);const e=r.anim.t<.5?4*r.anim.t**3:1-Math.pow(-2*r.anim.t+2,3)/2;
    r.ang=(r.anim.from+(r.anim.to-r.anim.from)*e)*Math.PI/2;if(r.anim.t>=1){r.state=r.anim.to;r.ang=r.state*Math.PI/2;r.anim=null;rebuildGraph();lockIn()}}
}

/* =========================================================
   Guards
   ========================================================= */
function blockedSight(x,y,z){const o=G.occ.get(K(x,y,z));return !!(o&&!PASSABLE.has(o.t)&&o.t!=='stair')}
function updateGuards(dt){
  for(const g of G.guards){
    if(g.type==='patrol'){
      if(g.wait>0){g.wait-=dt;if(g.wait<=0){g.dir*=-1;g.to=g.i+g.dir;g.facing=dirBetween(g.pathK[g.i],g.pathK[g.to])}}
      else{const a=nodeCenter(g.pathK[g.i]),b=nodeCenter(g.pathK[g.to]);g.t+=dt*g.speed;
        for(let k=0;k<3;k++)g.pos[k]=a[k]+(b[k]-a[k])*Math.min(1,g.t);
        g.phase=(g.phase||0)+dt*10;
        if(g.t>=1){g.t=0;g.i=g.to;const nx=g.i+g.dir;if(nx<0||nx>=g.pathK.length){g.wait=.8}else{g.to=nx;g.facing=dirBetween(g.pathK[g.i],g.pathK[g.to])}}}
    }else{g.timer-=dt;if(g.timer<=0){g.timer=g.interval;g.di=(g.di+1)%g.dirs.length;g.facing=g.dirs[g.di];pluck(SHUR[3]/2,0,.035,.3)}}
    const want=Math.atan2(g.facing[0],g.facing[1]);let d=want-g.ang;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;g.ang+=d*Math.min(1,dt*8);
    // sight: straight ahead along the floor, up to 4 cells
    const gx=Math.floor(g.pos[0]),gz=Math.floor(g.pos[2]),gy=Math.round(g.pos[1]);g.vision=[];g.cell=[gx,gy,gz];
    for(let k=1;k<=4;k++){const x=gx+g.facing[0]*k,z=gz+g.facing[1]*k;if(blockedSight(x,gy,z)||!G.nodes.has(K(x,gy,z)))break;g.vision.push([x,gy,z])}
  }
  {let dn=false;for(const g of G.guards)for(const c of [g.cell,...g.vision])if(c&&Math.abs(c[1]-P.pos[1])<.7&&Math.hypot(c[0]+.5-P.pos[0],c[2]+.5-P.pos[2])<1.7)dn=true;G.danger=dn}
  if(G.mode!=='play'||P.riding&&false)return;
  const [px,py,pz]=playerCell();
  for(const g of G.guards){
    if(g.cell[0]===px&&g.cell[2]===pz&&g.cell[1]===py){caught('seen');return}
    for(const c of g.vision)if(c[0]===px&&c[2]===pz&&Math.abs(c[1]-P.pos[1])<.6){caught('seen');return}
  }
}

/* =========================================================
   The cat
   ========================================================= */
function objective(){const s=G.shards.find(s=>!s.got);return s?K(...s.c):K(...G.gate)}
function nearestReachable(prev,pt){let best=null,bd=1e9;for(const k of prev.keys()){const c=nodeCenter(k);const d=Math.hypot(c[0]-pt[0],(c[1]-pt[1])*1.5,c[2]-pt[2]);if(d<bd){bd=d;best=k}}return best}
function catGoal(){
  const from=P.to||P.from;const prev=bfs(from);const obj=objective();
  if(!G.gateOpen&&G.shardsGot===3)return {goal:from,why:'gate'};
  if(prev.has(obj)){const p=pathTo(prev,obj);return {goal:p.length>=2?p.at(-2):obj,why:'shard',path:p}}
  // unreachable: point at a gold star if one can help, else wait at the edge nearest the goal
  let best=null,bd=1e9;for(const r of G.rosettes){const d=Math.hypot(r.pos[0]-P.pos[0],r.pos[2]-P.pos[2]);if(d<bd){bd=d;best=r}}
  if(best&&bd<7){G.hintRosette=best;return {goal:nearestReachable(prev,[best.pos[0]+.5,best.pos[1],best.pos[2]+.5]),why:'star'}}
  const [ox,oy,oz]=obj.split(',').map(Number);return {goal:nearestReachable(prev,[ox+.5,oy,oz+.5]),why:'wait'};
}
let catTimer=0;
function busyNodes(){const s=new Set([P.from]);if(P.to)s.add(P.to);for(const k of P.path.slice(0,3))s.add(k);if(P.path.length)s.add(P.path.at(-1));
  for(const g of G.guards){if(g.cell)s.add(K(...g.cell));if(g.pathK){s.add(g.pathK[g.i]);if(g.pathK[g.to])s.add(g.pathK[g.to])}}return s}
function freeNear(k,busy){const seen=new Set([k]),q=[k];while(q.length){const n=q.shift();if(!busy.has(n)&&n!==k)return n;for(const m of G.adj.get(n)||[])if(!seen.has(m)&&seen.size<40){seen.add(m);q.push(m)}}return null}
function updateCat(dt){
  catTimer-=dt;const busy=busyNodes();
  if(!CAT.riding&&CAT.to===null&&busy.has(CAT.from)){ // step aside, or slip ahead if the path is one tile wide
    const nb=[...(G.adj.get(CAT.from)||[])].find(n=>!busy.has(n));
    if(nb)CAT.path=[nb];else{const f=freeNear(CAT.goal||CAT.from,busy);if(f)teleportCat(f)}}
  if(!CAT.riding&&CAT.to&&busy.has(CAT.to)&&CAT.t<.5&&!busy.has(CAT.from)){CAT.path=[];const back=CAT.from;CAT.from=CAT.to;CAT.to=back;CAT.fromPos=[...CAT.pos];CAT.toPos=nodeCenter(back);CAT.t=0}
  {const dx=CAT.pos[0]-P.pos[0],dz=CAT.pos[2]-P.pos[2];if(!CAT.hidden&&!CAT.riding&&!P.riding&&CAT.fade>.9&&Math.hypot(dx,dz)<.62&&Math.abs(CAT.pos[1]-P.pos[1])<.6){
    const far=[...busy];const f=freeNear(CAT.goal&&!busy.has(CAT.goal)?CAT.goal:(P.path.at(-1)||P.from),busy);
    let ok=false;if(f){const c=nodeCenter(f);if(Math.hypot(c[0]-P.pos[0],c[2]-P.pos[2])>.9){teleportCat(f);meowSoft();ok=true}}if(!ok){CAT.hidden=true;CAT.path=[];CAT.to=null}}}
  if(CAT.hidden){const f=freeNear(CAT.goal&&!busy.has(CAT.goal)?CAT.goal:P.from,busy);if(f){const c=nodeCenter(f);if(Math.hypot(c[0]-P.pos[0],c[2]-P.pos[2])>1.2){CAT.hidden=false;teleportCat(f)}}}
  if((G.catDirty||catTimer<=0)&&!CAT.riding){catTimer=.6;G.catDirty=false;G.hintRosette=null;
    const cg=catGoal();CAT.why=cg.why;
    if(cg.goal&&cg.goal!==CAT.goal){CAT.goal=cg.goal;
      if(busy.has(CAT.goal)){const f=freeNear(CAT.goal,busy);if(f)CAT.goal=f}
      const pc=bfs(CAT.to||CAT.from);const p=pathTo(pc,CAT.goal);
      if(p&&p.length<14){CAT.path=p.slice(1)}else{const c=nodeCenter(CAT.goal);if(!busy.has(CAT.goal)&&Math.hypot(c[0]-P.pos[0],c[2]-P.pos[2])>1.2)teleportCat(CAT.goal);else{CAT.hidden=true;CAT.path=[];CAT.to=null}}
    }
  }
  if(!CAT.hidden)agentStep(CAT,dt,false,busy);
  if(CAT.fade<1)CAT.fade=Math.min(1,CAT.fade+dt*2);
}
function meowSoft(){if(Math.random()<.3)meow(.4)}
function teleportCat(goal){
  const g=goal||CAT.goal||P.from;if(!G.nodes.has(g))return;CAT.from=g;CAT.to=null;CAT.path=[];CAT.riding=null;CAT.pos=nodeCenter(g);CAT.fade=0;
}

/* =========================================================
   Caught, done, HUD
   ========================================================= */
function gainGold(n){G.totalGold+=n;G.lampProg+=n;while(G.lampProg>=25){G.lampProg-=25;if(G.lamps<5){G.lamps++;toast('+1 lamp',1600);chord([4,7,9],.08,.08)}}updateHUD()}
function openGift(gf){gf.open=true;gf.t=G.time;if(ac)MUS.shimmer=ac.currentTime+12;
  if(gf.kind==='coins'){gainGold(5);toast('+5 gold',1400);runNotes([4,5,6,7,9],.09,.06)}
  else if(gf.kind==='lamp'){if(G.lamps<5){G.lamps++;toast('+1 lamp',1400)}else{gainGold(5);toast('+5 gold',1400)}updateHUD();chord([4,7,9],.08,.08)}
  else if(gf.kind==='cat'){meow();setTimeout(meow,350);gainGold(2);toast('Meow!',1400)}
  pluck(SHUR[7]*2,0,.06,.4)}
function caught(kind){
  if(G.mode!=='play')return;G.mode='caught';P.path=[];
  $('ink').classList.add('on');dissonance();if(!G.tut)G.lamps--;updateHUD();
  if(G.lamps<=0){toast('The lamps went out.',1800);setTimeout(()=>{G.lamps=3;$('ink').classList.remove('on');restartLevel()},1500);return}
  toast(kind==='fall'?'The stone fell.':'Seen.',1400);
  setTimeout(()=>{
    let cp=G.checkpoint;if(!G.nodes.has(cp))cp=K(...G.lvl.start);
    P.from=cp;P.to=null;P.riding=null;P.falling=null;P.pos=nodeCenter(cp);P.path=[];
    teleportCat();G.catDirty=true;CAT.goal=null;
    $('ink').classList.remove('on');G.mode='play';
  },reduce?300:1000);
}
function levelDone(){
  G.mode='done';chord([0,2,4,5,7,9,11,14],.11,.1);$('coach').hidden=true;
  if(G.tut){$('cdEyebrow').textContent='Lesson';$('cdTitle').textContent='Ready.';$('cdGold').textContent=`${G.levelGold} / ${G.coins.length}`;
    $('cdNext').textContent='Play Negareh';setTimeout(()=>{$('cardDone').hidden=false},700);return}
  saveProgress(G.li+1);
  const last=G.li===LEVELS.length-1;
  $('cdEyebrow').textContent=`Chapter ${G.lvl.num}`;
  $('cdTitle').textContent=last?'The cup is whole.':G.lvl.name;
  $('cdGold').textContent=`${G.levelGold} / ${G.coins.length}`;
  $('cdNext').textContent=last?'Play again':'Next chapter';
  setTimeout(()=>{$('cardDone').hidden=false},700);
}
function updateHUD(){
  $('pnum').textContent=G.lvl?G.lvl.num:'I';$('pname').textContent=G.lvl?G.lvl.name:'';
  [...$('shards').children].forEach((s,i)=>s.classList.toggle('got',i<G.shardsGot));$('goldN').textContent=`${G.lampProg} / 25`;
  $('ring').style.setProperty('--p',(G.lampProg/25*100)+'%');[...$('lamps').children].forEach((l,i)=>{l.classList.toggle('on',i<G.lamps);l.hidden=i>=Math.max(3,G.lamps)})
}
let toastT=null;function toast(m,ms=3800){const t=$('toast');t.textContent=m;t.classList.add('show');clearTimeout(toastT);toastT=setTimeout(()=>t.classList.remove('show'),ms)}
function saveProgress(li){try{localStorage.setItem('negareh-progress',JSON.stringify({li:Math.min(li,LEVELS.length-1),gold:G.totalGold,role:G.role,lamps:G.lamps,prog:G.lampProg}))}catch(e){}}
function loadProgress(){try{return JSON.parse(localStorage.getItem('negareh-progress')||'null')}catch(e){return null}}

