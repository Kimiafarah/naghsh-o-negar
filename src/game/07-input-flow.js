/* =========================================================
   Main loop and input
   ========================================================= */
let last=performance.now();
function tick(dt){
  G.time+=dt;
  if(G.mode==='play'||G.mode==='caught'){
    updateMovers(dt);updateFallers(dt);updateRotators(dt);
    if(G.mode==='play'){agentStep(P,dt,true);collect()}
    updateGuards(dt);updateCat(dt);
    turnToward(P,dt,ROLE().pOff);turnToward(CAT,dt,ROLE().gOff);
    for(const a of [P,CAT])a.idle=(a.to===null&&!a.path.length&&!a.riding&&!a.falling)?(a.idle||0)+dt:0;
    const RL=ROLE();for(const [a,model] of [[P,RL.player],[CAT,RL.guide]]){if(model!=='cat')continue;const pose=a.idle>9?'sleep':a.idle>2.5?'play':'';
      if(pose!==a.pose){a.pose=pose;if(ac&&MUS.out&&G.mode==='play'){const t=qTime();if(pose==='play')[11,9,11,14].forEach((d,i)=>santur(musFreq(d),t+i*.075,.03));if(pose==='sleep')[4,2,0].forEach((d,i)=>santur(musFreq(d),t+i*.3,.03))}}}
    coachTick();
  }
}
function frame(now){const dt=Math.min(.05,(now-last)/1000);last=now;tick(dt);render(now);requestAnimationFrame(frame)}

function tapAt(sx,sy){
  if(G.mode!=='play'||!VPinfo)return;ensureAudio();
  if(!CAT.hidden&&CAT.fade>.8){const gp=project([CAT.pos[0],CAT.pos[1]+.35,CAT.pos[2]]);if(Math.hypot(gp[0]-sx,gp[1]-sy)<26){petGuide();return}}
  for(const r of G.rosettes){const s=project([r.pos[0]+.5,r.pos[1]+.04,r.pos[2]+.5]);if(Math.hypot(s[0]-sx,s[1]-sy)<38){triggerRosette(r);return}}
  const {back}=camBasis(cam);let best=null,bd=1e9;
  for(const [k,n] of G.nodes){const c=[n.x+.5,n.h,n.z+.5];const s=project(c);const d=Math.hypot(s[0]-sx,s[1]-sy)-V.dot(c,back)*.6;if(d<bd){bd=d;best=k}}
  if(!best)return;const bs=project(nodeCenter(best));if(Math.hypot(bs[0]-sx,bs[1]-sy)>60)return;
  const from=P.to||P.from;const prev=bfs(from);const p=pathTo(prev,best);const n=G.nodes.get(best);
  G.flash={at:{x:n.x,y:n.h,z:n.z},t:.6,bad:!p};
  if(!p){toast('Not yet.',1200);pluck(SHUR[1]/2,0,.05,.3);return}
  P.path=p.slice(1);P.idle=0;CD.shot=null;
}
function petGuide(){CAT.hop=G.time;CAT.idle=Math.max(CAT.idle||0,2.6);if(ROLE().guide==='cat')meow(.8);else if(ac)birdChirp(ac.currentTime+.01,.05);
  runNotes([[0,2,4,7],[4,2,4,7,9],[7,4,2,0],[2,4,5,7]][(MUS.petN=(MUS.petN||0)+1)%4],.08,.055)}
function hint(){
  ensureAudio();meow();$('bHint').classList.remove('pulse');if(G.mode!=='play')return;const from=P.to||P.from;const prev=bfs(from);const goal=CAT.goal;
  const p=goal?pathTo(prev,goal):null;if(p){G.hintPath=p;G.hintT=3;shot(p.map(k=>{const c=nodeCenter(k);return [c[0],c[1]+.8,c[2]]}),2.6,.8)}
  toast({shard:'Follow the gold dots.',star:'Tap the gold star.',wait:'Wait for the stone.',gate:'The gate is open.'}[CAT.why]||'Follow the dots.',1800);
}
const ptrs=new Map();let pinch=null,down=null;
canvas.addEventListener('pointerdown',e=>{ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});if(ptrs.size===2){const [a,b]=[...ptrs.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y),z:cam.userZoom};down=null}else down={x:e.clientX,y:e.clientY}});
canvas.addEventListener('pointermove',e=>{if(!ptrs.has(e.pointerId))return;ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});if(pinch&&ptrs.size===2){const [a,b]=[...ptrs.values()];cam.userZoom=Math.max(.6,Math.min(2.6,pinch.z*pinch.d/Math.max(1,Math.hypot(a.x-b.x,a.y-b.y))));cam.zoomT=cam.base*cam.userZoom}});
const up=e=>{ptrs.delete(e.pointerId);if(ptrs.size<2)pinch=null;if(down&&e.type==='pointerup'&&Math.hypot(e.clientX-down.x,e.clientY-down.y)<12)tapAt(e.clientX,e.clientY);down=null};
canvas.addEventListener('pointerup',up);canvas.addEventListener('pointercancel',up);
canvas.addEventListener('wheel',e=>{e.preventDefault();cam.userZoom=Math.max(.6,Math.min(2.6,cam.userZoom*Math.exp(e.deltaY*.001)));cam.zoomT=cam.base*cam.userZoom},{passive:false});
function turnView(d){cam.azT+=d*Math.PI/2;cam.manualUntil=performance.now()+6000}
window.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(k==='q')turnView(-1);else if(k==='e')turnView(1);else if(k==='h')hint();else if(k==='r'&&G.mode==='play')restartLevel()});
$('bHint').onclick=hint;$('bTurnL').onclick=()=>turnView(-1);$('bTurnR').onclick=()=>turnView(1);
const bSound=$('bSound');bSound.onclick=()=>{muted=!muted;ensureAudio();if(MUS.out)MUS.out.gain.setValueAtTime(muted?0:.9,ac.currentTime);$('wave').style.display=muted?'none':'';bSound.setAttribute('aria-label',muted?'Turn sound on':'Mute sound');if(!muted)pluck(SHUR[4],0,.08,.8)};
function restartLevel(){G.totalGold-=G.levelGold;openPage(G.li,true)}
$('bRestart').onclick=()=>{if(G.mode==='play'||G.mode==='caught')restartLevel()};

function openPage(i,skipCard){
  loadLevel(i);G.mode='card';ensureAudio();musicStart(i);
  document.body.classList.toggle('tut',G.tut);$('coach').hidden=true;$('coachRing').hidden=true;$('bHint').classList.remove('pulse');
  if(G.tut){G.coachI=0;G.coachNudged=false;G.tutCoin=false;beginPage();coachShow();return}
  const L=LEVELS[i];$('cpEyebrow').textContent=`Chapter ${L.num}`;$('cpTitle').textContent=L.name;$('cpText').textContent=say(L.line);
  if(skipCard){beginPage();return}
  $('cardPage').hidden=false;
}
function beginPage(){$('cardPage').hidden=true;G.mode='play';CD.start=G.time;CD.shot=null;ensureAudio();musicStart(G.li);chord([0,2,4]);if(G.lvl.tip)setTimeout(()=>toast(say(G.lvl.tip),3200),500)}
$('cpGo').onclick=beginPage;
$('bStart').onclick=()=>{ensureAudio();$('cardIntro').hidden=true;G.totalGold=0;G.lamps=3;G.lampProg=0;openPage(0)};
$('bContinue').onclick=()=>{ensureAudio();$('cardIntro').hidden=true;const p=loadProgress();G.totalGold=p?p.gold||0:0;G.lamps=p&&p.lamps?p.lamps:3;G.lampProg=p&&p.prog||0;openPage(p?p.li:0)};
$('cdNext').onclick=()=>{$('cardDone').hidden=true;if(G.tut){G.totalGold=0;G.lamps=3;G.lampProg=0;openPage(0);return}const last=G.li===LEVELS.length-1;if(last){G.totalGold=0;openPage(0)}else openPage(G.li+1)};
$('bLearn').onclick=()=>{ensureAudio();$('cardIntro').hidden=true;G.totalGold=0;G.lamps=3;G.lampProg=0;openPage(-1)};
$('coachSkip').onclick=()=>{$('coach').hidden=true;G.totalGold=0;G.lamps=3;G.lampProg=0;openPage(0)};
$('cdReplay').onclick=()=>{$('cardDone').hidden=true;G.totalGold-=G.levelGold;openPage(G.li)};

/* role picker */
function syncRole(){$('rGirl').setAttribute('aria-pressed',G.role==='girl');$('rCat').setAttribute('aria-pressed',G.role==='cat')}
$('rGirl').onclick=()=>{G.role='girl';syncRole();ensureAudio();pluck(SHUR[4],0,.06,.6)};
$('rCat').onclick=()=>{G.role='cat';syncRole();ensureAudio();meow()};
function drawRoleThumbs(){
  let TRr;const c=document.createElement('canvas');c.width=c.height=160;try{TRr=new Renderer(c,{preserve:true})}catch(e){return}
  const key=(G.lvl&&G.lvl.palette)||'ch1',pal=PALETTES[key]||PALETTES.ch1,lock=(PALS[key]||PALS.ch1).lock; // the role pictures use the page's own palette
  for(const [id,list,tgt,zm] of [['cvGirl',[{x:0,y:0,z:0,t:'girl',ang:.785,sc:1.3}],[.5,.42,.5],.5],['cvCat',[{x:0,y:0,z:0,t:'cat',ang:.45,sc:1.35}],[.5,.17,.5],.42]]){
    TRr.setGroups('m',buildGroups(list,pal,'solid'));const cm={az:Math.PI/4,el:Math.atan(1/Math.SQRT2),zoom:zm,target:tgt};const vp=viewProj(cm,1);
    TRr.begin(160,160);TRr.drawGroups('m',vp.m,{L:lightFor(cm),fog:[1,1,1],fogStart:-9,fogRange:1,mist:0,top:1,time:0,lock});
    const g=$(id).getContext('2d');g.clearRect(0,0,160,160);g.drawImage(c,0,0)}
}

/* debugging and tests */
window.__negareh={get coachI(){return G.coachI},COACH,TUT,MUS,G,get P(){return P},get CAT(){return CAT},LEVELS,bfs,pathTo,K,loadLevel,tick,triggerRosette,openPage,beginPage,
  walkTo(k){const p=pathTo(bfs(P.to||P.from),k);if(p)P.path=p.slice(1);return !!p}};

function start(data){
  window.addEventListener('resize',resize);
  if(data&&data.role)G.role=data.role;else{const pr=loadProgress();if(pr&&pr.role)G.role=pr.role}syncRole();
  const p=loadProgress();if(p&&p.li>0){$('bContinue').hidden=false;$('bContinue').textContent=`Continue · Chapter ${LEVELS[p.li].num}`}
  loadLevel(data&&typeof data.li==='number'?data.li:0);drawRoleThumbs();resize();
  loadCrops().then(()=>{buildTextures();for(const id in TEXDATA)R.addTexture(id,TEXDATA[id])});
  if(data&&typeof data.li==='number'&&data.playing){$('cardIntro').hidden=true;G.totalGold=data.gold||0;openPage(data.li,true)}
  const wake=()=>{ensureAudio();if(ac){musicStart(G.li);if(ac.state==='running'){removeEventListener('pointerdown',wake,true);removeEventListener('keydown',wake,true)}}};
  addEventListener('pointerdown',wake,true);addEventListener('keydown',wake,true);
  try{ensureAudio();if(ac&&ac.state==='running')musicStart(G.li)}catch(e){}
  requestAnimationFrame(frame);
}
window.claude?.hot?.snapshot?.(()=>({li:G.li,gold:G.totalGold-G.levelGold,playing:G.mode!=='menu',role:G.role}));
window.claude?.hot?.ready?window.claude.hot.ready(start):start(window.claude?.hot?.data??{});
