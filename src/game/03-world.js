/* =========================================================
   Game state
   ========================================================= */
const G={role:'girl',lamps:3,lampProg:0,li:0,lvl:null,static:new Map(),occ:new Map(),nodes:new Map(),adj:new Map(),movers:[],fallers:[],rotators:[],rosettes:[],guards:[],
  coins:[],shards:[],gate:null,gateOpen:false,doorY:0,shardsGot:0,levelGold:0,totalGold:0,checkpoint:null,mode:'menu',time:0,bounds:null,hintT:0,hintPath:[],flash:null};
const mkAgent=(cell,speed)=>({from:K(...cell),to:null,t:0,pos:[cell[0]+.5,cell[1],cell[2]+.5],fromPos:null,toPos:null,path:[],speed,ang:0,phase:0,riding:null,fade:1});
let P=null,CAT=null;
const ROLE=()=>G.role==='cat'?{player:'cat',guide:'hoopoe',pname:'Pashmak',gname:'the hoopoe',Gname:'The hoopoe',pOff:-Math.PI/2,gOff:0,pSc:1.35,gSc:1.25}
  :{player:'girl',guide:'cat',pname:'Mahtab',gname:'Pashmak',Gname:'Pashmak',pOff:0,gOff:-Math.PI/2,pSc:1.3,gSc:1.15};
const say=t=>t.replace(/\{guide\}/g,ROLE().gname).replace(/\{Guide\}/g,ROLE().Gname).replace(/\{player\}/g,ROLE().pname);

function nodeCenter(k){const n=G.nodes.get(k);if(!n){const [x,y,z]=k.split(',').map(Number);return [x+.5,y,z+.5]}return [n.x+.5,n.h,n.z+.5]}
function rotOff(dx,dz,a){const c=Math.cos(a),s=Math.sin(a);return [dx*c+dz*s,-dx*s+dz*c]}
function rotCells(r,state){const [px,py,pz]=r.pivot;return r.arm.map(([dx,dz])=>{const [ox,oz]=rotOff(dx,dz,state*Math.PI/2);return [px+Math.round(ox),py,pz+Math.round(oz)]})}
function moverTop(m){return [m.pos[0]+.5,m.pos[1]+1,m.pos[2]+.5]}

function rebuildGraph(){
  const occ=new Map(G.static);
  for(const m of G.movers)if(!m.moving){const s=m.stops[m.idx];occ.set(K(...s),{x:s[0],y:s[1],z:s[2],t:m.piece})}
  for(const f of G.fallers)if(f.state==='idle'||f.state==='shake')occ.set(K(f.x,f.y,f.z),{x:f.x,y:f.y,z:f.z,t:'block'});
  for(const r of G.rotators)if(!r.anim)for(const c of rotCells(r,r.state))occ.set(K(...c),{x:c[0],y:c[1],z:c[2],t:r.piece});
  const nodes=new Map();
  for(const [k,q] of occ){
    if(WALKTOP.has(q.t)){const ab=K(q.x,q.y+1,q.z),o=occ.get(ab);if(!o||PASSABLE.has(o.t))nodes.set(ab,{x:q.x,y:q.y+1,z:q.z,h:q.y+1})}
    if(q.t==='stair')nodes.set(k,{x:q.x,y:q.y,z:q.z,h:q.y+.5,stair:STAIR_DIR[q.r||0]});
  }
  if(!G.gateOpen&&G.gate)nodes.delete(K(...G.gate));
  const adj=new Map();const link=(a,b)=>{if(!nodes.has(a)||!nodes.has(b))return;if(!adj.has(a))adj.set(a,new Set());if(!adj.has(b))adj.set(b,new Set());adj.get(a).add(b);adj.get(b).add(a)};
  for(const [k,n] of nodes){
    if(n.stair){const [dx,dz]=n.stair;link(k,K(n.x-dx,n.y,n.z-dz));link(k,K(n.x+dx,n.y+1,n.z+dz))}
    else for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){const k2=K(n.x+dx,n.y,n.z+dz),m=nodes.get(k2);if(m&&!m.stair)link(k,k2)}
  }
  G.occ=occ;G.nodes=nodes;G.adj=adj;G.catDirty=true;
}
function bfs(from){const prev=new Map([[from,null]]),q=[from];while(q.length){const n=q.shift();for(const m of G.adj.get(n)||[])if(!prev.has(m)){prev.set(m,n);q.push(m)}}return prev}
function pathTo(prev,to){if(!prev.has(to))return null;const p=[];let c=to;while(c!==null){p.unshift(c);c=prev.get(c)}return p}

/* =========================================================
   Load a level
   ========================================================= */
function loadLevel(i){
  G.li=i;const L=lvlAt(i);G.lvl=L;G.tut=i<0;
  const S=new Map();
  const put=(x,y,z,t,o={})=>S.set(K(x,y,z),{x,y,z,t,r:o.r||0,c:o.c??PIECE_BY_ID[t].slot,f:finishOf(t,o.f),sc:o.sc,ang:o.ang});
  const fill=(x0,x1,y0,y1,z0,z1,t,o)=>{for(let x=x0;x<=x1;x++)for(let y=y0;y<=y1;y++)for(let z=z0;z<=z1;z++)put(x,y,z,t,o)};
  L.build(put,fill);
  for(const r of L.rotators)put(...r.pivot,'block',{c:4});
  G.static=S;
  G.movers=L.movers.map(m=>({...m,speed:m.speed*.65,wait:(m.wait||0)*2,idx:0,pos:[...m.stops[0]],moving:false,t:0,timer:m.wait||0}));
  G.fallers=L.fallers.map(([x,y,z])=>({x,y,z,state:'idle',t:0}));
  G.rotators=L.rotators.map(r=>({...r,state:r.states[0],anim:null,ang:r.states[0]*Math.PI/2}));
  G.rosettes=L.rosettes.map(r=>({...r,pulse:0}));
  G.coins=L.coins.map(c=>({c,got:false,pop:0}));
  G.shards=L.shards.map(c=>({c,got:false,pop:0}));
  G.gifts=(L.gifts||[]).map(([x,y,z,kind])=>({c:[x,y,z],kind,open:false,t:0}));G.crowdT=[];
  G.gate=L.gate;G.gateOpen=false;G.doorY=0;G.shardsGot=0;G.levelGold=0;G.hintPath=[];G.hintT=0;
  rebuildGraph();
  P=mkAgent(L.start,WALK_SPEED);CAT=mkAgent(L.cat,WALK_SPEED*1.08);CAT.goal=null;
  G.checkpoint=K(...L.start);
  G.guards=L.guards.map(g=>{
    if(g.type==='patrol'){const path=g.path.map(c=>K(...c));const p0=nodeCenter(path[0]);
      return {...g,speed:g.speed*.6,pathK:path,i:0,dir:1,pos:[...p0],to:1,t:0,wait:0,facing:dirBetween(path[0],path[1]),ang:0,vision:[]}}
    const p0=[g.at[0]+.5,g.at[1],g.at[2]+.5],dirs=g.dirs.length===2?[g.dirs[0],g.dirs[1],g.dirs[1]]:g.dirs;return {...g,dirs,interval:g.interval*1.2,pos:p0,di:0,timer:g.interval*1.2,facing:dirs[0],ang:0,vision:[]};
  });
  // static meshes
  const pal=PALETTES[L.palette],list=[...S.values()];
  const VIS={stair:'stair2',cypress:'cypress2',orange:'orange2',blossom:'blossom2',tree:'pomegranate',vase:'pot'},VSC={cypress2:1.15,orange2:1,blossom2:1.05,pomegranate:1,pot:1.3};
  const vis=q=>{const sq=styledPiece(q,S);if(sq!==q)return sq;const t=VIS[q.t];return t?{...q,t,sc:q.sc||VSC[t]}:q};
  G.cards=list.filter(q=>TREE_TYPES.has(q.t)).map(q=>({x:q.x,y:q.y,z:q.z,t:q.t,sc:(q.sc||1)*(.92+((q.x*3+q.z*5)%5+5)%5*.04)}));
  let mn=[1e9,1e9,1e9],mx=[-1e9,-1e9,-1e9];for(const q of list){if(q.t==='cloud')continue;for(let k=0;k<3;k++){mn[k]=Math.min(mn[k],[q.x,q.y,q.z][k]);mx[k]=Math.max(mx[k],[q.x,q.y,q.z][k]+1)}}
  const ext=c=>{for(let k=0;k<3;k++){mn[k]=Math.min(mn[k],c[k]);mx[k]=Math.max(mx[k],c[k]+1)}};
  for(const m of L.movers)for(const st of m.stops)ext(st);for(const f of L.fallers)ext(f);
  for(const r of L.rotators)for(const stt of r.states){const sv=r.state;for(const c of rotCells({...r},stt))ext(c)}
  G.bounds={min:mn,max:mx};
  G.P=applyStyle(L.palette,G.bounds);
  {const vl=list.filter(q=>!TREE_TYPES.has(q.t)).map(vis);R.setGroups('static',buildGroups(vl,pal,'solid',null,S));R.setGroups('staticW',buildGroups(list.filter(q=>q.t!=='water'),pal,'water',S));
   R.setMesh('rim',{pos:rimLines(vl,camBasis({az:Math.PI/4,el:Math.atan(1/Math.SQRT2)}).back)})}
  const cells=[...list.filter(q=>q.t!=='fall'),...L.movers.flatMap(m=>m.stops.map(([x,y,z])=>({x,y,z}))),...L.fallers.map(([x,y,z])=>({x,y,z})),
    ...L.rotators.flatMap(r=>r.states.flatMap(st=>rotCells(r,st).map(([x,y,z])=>({x,y,z}))))];
  {let u0=1e9,u1=-1e9;for(const q of cells){const u=(q.x-q.z)/Math.SQRT2;u0=Math.min(u0,u);u1=Math.max(u1,u+1.4)}
   const cx=(mn[0]+mx[0])/2,cz=(mn[2]+mx[2])/2,uc=(u0+u1)/2,half=(u1-u0)/2-.1;
   G.stages=[0,1,2].map(k=>{const side=k%2?1:-1,d=(uc-(cx-cz)/Math.SQRT2)+side*half;const y=mn[1]+(mx[1]-mn[1])*[.28,.55,.8][k];
     return [cx+d/Math.SQRT2-.5,y,cz-d/Math.SQRT2-.5]});
   const solid=new Set(cells.map(q=>Math.floor(q.x)+','+Math.floor(q.y)+','+Math.floor(q.z)));
   const B=camBasis({az:Math.PI/4,el:Math.atan(1/Math.SQRT2)}),scr=c=>[V.dot(c,B.right),V.dot(c,B.up)];const cs=cells.map(q=>scr([q.x+.5,q.y+.5,q.z+.5]));
   const hits=([x,y,z])=>{const [r,u]=scr([x+.5,y+.6,z+.5]);for(const [a,b] of cs)if(Math.abs(a-r)<1.0&&Math.abs(b-u)<1.05)return true;for(const st of placed){const [a,b]=scr([st[0]+.5,st[1]+.6,st[2]+.5]);if(Math.abs(a-r)<1.1&&Math.abs(b-u)<1.2)return true}return false};const placed=[];
   G.stages=G.stages.map((p,k)=>{const side=k%2?1:-1;for(let i=0;i<16;i++){const o=i*.3;for(const dy of [0,1.2,-1.2,2.4]){const q=[p[0]+side*o,p[1]+dy,p[2]-side*o];if(!hits(q)&&q[1]>=mn[1]-.5&&q[1]<=mx[1]+.5){placed.push(q);return q}}}placed.push(p);return p});
   for(const [x,y,z] of G.stages)cells.push({x:Math.floor(x),y:Math.floor(y),z:Math.floor(z)},{x:Math.floor(x)+1,y:Math.floor(y)+1,z:Math.floor(z)+1})}
  G.fitPts=[];for(const q of cells)for(const dx of [0,1])for(const dy of [0,1])for(const dz of [0,1])G.fitPts.push([q.x+dx,q.y+dy,q.z+dz]);G.fitCache=null;
  if(L.autoTurn){const th=Math.atan2(L.start[0]+.5-L.autoTurn[0],L.start[2]+.5-L.autoTurn[1]);cam.azT=cam.az=Math.PI/4+Math.round((th-Math.PI/4)/(Math.PI/2))*Math.PI/2}else{cam.azT=cam.az=Math.PI/4}
  frameLevel(true);drawBG();updateHUD();
}
function dirBetween(a,b){const [ax,,az]=a.split(',').map(Number),[bx,,bz]=b.split(',').map(Number);return [Math.sign(bx-ax),Math.sign(bz-az)]}

/* =========================================================
   Agents (Mahtab and the cat)
   ========================================================= */
const WALK_SPEED=1.35;   // tiles a second at cruise; starts and stops are eased (see the design doc's calm checklist)
function agentStep(a,dt,isPlayer,avoid){
  if(a.riding)return;
  if(a.to===null&&a.path.length&&avoid&&avoid.has(a.path[0])){a.wait=(a.wait||0)+dt;if(a.wait>.7){a.wait=0;a.path=[];a.goal=null;G.catDirty=true}return}
  if(a.to===null&&a.path.length){a.wait=0;const nk=a.path[0];if(G.adj.get(a.from)&&G.adj.get(a.from).has(nk)){a.to=nk;a.path.shift();a.t=0;a.fromPos=[...a.pos];a.toPos=nodeCenter(nk)}else a.path=[]}
  if(a.to===null)return;
  if(!G.nodes.has(a.to)){ // the stone left: step back
    if(G.nodes.has(a.from)){a.to=a.from;a.fromPos=[...a.pos];a.toPos=nodeCenter(a.from);a.t=0;a.path=[]}else{a.to=null;return}
  }
  const d=Math.hypot(a.toPos[0]-a.fromPos[0],a.toPos[1]-a.fromPos[1],a.toPos[2]-a.fromPos[2])||.01;
  if(!a.walking){a.walking=true;a.walked=0}const remain=(1-a.t)*d+a.path.length;
  const v=a.speed*Math.max(.28,Math.min(1,.28+a.walked/.8,.28+remain/.9));a.walked+=v*dt;a.v=v;
  a.t=Math.min(1,a.t+v*dt/d);
  for(let k=0;k<3;k++)a.pos[k]=a.fromPos[k]+(a.toPos[k]-a.fromPos[k])*a.t;
  const dx=a.toPos[0]-a.fromPos[0],dz=a.toPos[2]-a.fromPos[2];if(Math.abs(dx)+Math.abs(dz)>.01)a.face=[dx,dz];
  const ph=a.phase;a.phase+=dt*7*(v/Math.max(.01,a.speed));if(isPlayer&&Math.floor(a.phase/Math.PI)!==Math.floor(ph/Math.PI))stepSound();
  if(a.t>=1){a.from=a.to;a.to=null;a.pos=[...a.toPos];if(!a.path.length)a.walking=false;if(isPlayer)onPlayerArrive(a.from)}
}
function turnToward(a,dt,off=0){if(!a.face)return;const want=Math.atan2(a.face[0],a.face[1])+off;let d=want-a.ang;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;a.ang+=d*Math.min(1,dt*6)}
function playerCell(){const x=Math.floor(P.pos[0]),z=Math.floor(P.pos[2]);const y=G.nodes.get(P.to&&P.t>.5?P.to:P.from)?.y??Math.round(P.pos[1]);return [x,y,z]}

function onPlayerArrive(k){
  for(const f of G.fallers)if(f.state==='idle'&&K(f.x,f.y+1,f.z)===k){f.state='shake';f.t=0;meow(.6)}
  if(G.gateOpen&&k===K(...G.gate))levelDone();
}
function collect(){
  for(const c of G.coins){if(c.got)continue;const [x,y,z]=c.c;if(Math.abs(P.pos[0]-(x+.5))<.42&&Math.abs(P.pos[2]-(z+.5))<.42&&Math.abs(P.pos[1]-y)<.6){c.got=true;c.pop=1;G.levelGold++;gainGold(1);coinNote();if(G.tut&&!G.tutCoin){G.tutCoin=true;toast('Each gold leaf plays a note.',2200)}}}
  for(const gf of G.gifts){if(gf.open)continue;const [x,y,z]=gf.c;if(Math.abs(P.pos[0]-(x+.5))<.42&&Math.abs(P.pos[2]-(z+.5))<.42&&Math.abs(P.pos[1]-y)<.6)openGift(gf)}
  for(const s of G.shards){if(s.got)continue;const [x,y,z]=s.c;if(Math.abs(P.pos[0]-(x+.5))<.42&&Math.abs(P.pos[2]-(z+.5))<.42&&Math.abs(P.pos[1]-y)<.6){
    s.got=true;s.pop=1;G.shardsGot++;G.crowdT[G.shardsGot-1]=G.time;G.checkpoint=K(x,y,z);chord([0,2,4,7],.1,.1);updateHUD();G.catDirty=true;
    if(G.shardsGot<3){const st=G.stages[G.shardsGot-1];shot([[st[0]+.5,st[1]+1.5,st[2]+.5],[st[0]+.5,st[1],st[2]+.5]],1.4)}
    if(G.shardsGot===3){G.gateOpen=true;rebuildGraph();{const [gx,gy,gz]=G.gate;shot([[gx+.5,gy+1.6,gz+.5],[gx+.5,gy-.2,gz+.5]],2.3,.9)}setTimeout(()=>chord([0,2,4,5,7,9,11],.12,.09),350);toast('The gate is open.',2200)}
}}
}

