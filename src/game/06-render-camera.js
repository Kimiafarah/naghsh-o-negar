/* =========================================================
   Rendering
   ========================================================= */
const $=id=>document.getElementById(id);
const canvas=$('gl'),bgc=$('bgc');
let R;
try{R=new Renderer(canvas,{preserve:false})}catch(e){document.body.insertAdjacentHTML('beforeend','<div class="card" style="position:fixed;left:50%;top:40%;transform:translate(-50%,-50%)"><p>This browser could not start WebGL, which the game needs. Try a current version of Chrome, Safari or Firefox.</p></div>');return}
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const cam={az:Math.PI/4,azT:Math.PI/4,el:Math.atan(1/Math.SQRT2),zoom:7,zoomT:7,target:[3,2,3],userZoom:1};
let W=0,H=0;
function resize(){const dpr=Math.min(2,window.devicePixelRatio||1);W=Math.round(canvas.clientWidth*dpr);H=Math.round(canvas.clientHeight*dpr);canvas.width=W;canvas.height=H;drawBG();frameLevel(false)}
function frameLevel(snap){if(!G.bounds)return;const b=G.bounds;const ext=Math.max(b.max[0]-b.min[0],b.max[2]-b.min[2],(b.max[1]-b.min[1])*1.25);
  const aspect=canvas.clientWidth/Math.max(1,canvas.clientHeight);cam.base=Math.max(3.6,3.0/aspect);cam.zoomT=cam.base*cam.userZoom;
  cam.center=[(b.min[0]+b.max[0])/2,(b.min[1]+b.max[1])/2,(b.min[2]+b.max[2])/2];if(snap){cam.zoom=cam.zoomT;cam.snap=true}}
function cloudMotif(g,x,y,s,fill,stroke){
  g.save();g.translate(x,y);g.scale(s,s);g.fillStyle=fill;g.strokeStyle=stroke;g.lineWidth=2/s;
  const lobes=[[-46,6,18],[-22,-6,24],[8,-12,28],[38,-2,22],[60,8,14],[20,10,20],[-12,10,18]];
  g.beginPath();for(const [lx,ly,r] of lobes){g.moveTo(lx+r,ly);g.arc(lx,ly,r,0,Math.PI*2)}g.fill();
  g.beginPath();for(const [lx,ly,r] of lobes){g.moveTo(lx+r*.6,ly);g.arc(lx,ly,r*.6,0,Math.PI*1.4)}g.stroke();
  g.beginPath();g.moveTo(60,14);g.bezierCurveTo(90,24,104,6,92,-4);g.bezierCurveTo(84,-10,76,0,84,4);g.stroke();g.restore();
}
function drawBG(){
  const dpr=Math.min(2,window.devicePixelRatio||1),w=bgc.clientWidth,h=bgc.clientHeight;bgc.width=Math.round(w*dpr);bgc.height=Math.round(h*dpr);
  const g=bgc.getContext('2d');g.setTransform(dpr,0,0,dpr,0,0);const P_=G.P||PALS.ch1;
  const gr=g.createLinearGradient(0,0,0,h);gr.addColorStop(0,P_.sky[0]);gr.addColorStop(1,P_.sky[1]);g.fillStyle=gr;g.fillRect(0,0,w,h);
  if(P_.night){const r=mulberry(7);for(let i=0;i<110;i++){g.fillStyle=`rgba(255,240,220,${.2+r()*.55})`;const x=r()*w,y=r()*h*.7,s=.8+r()*1.4;g.beginPath();g.moveTo(x,y-s*2);g.lineTo(x+s*.6,y);g.lineTo(x,y+s*2);g.lineTo(x-s*.6,y);g.fill()}
    g.save();g.shadowColor='rgba(255,236,190,.9)';g.shadowBlur=40;g.fillStyle='#f8eecb';g.beginPath();g.arc(w*.8,h*.1,Math.min(24,w*.05),0,7);g.fill();g.restore()}
  const s=Math.max(.6,Math.min(1.2,w/520));skyline(g,w,h,P_.ghost,3+G.li*5,h*.44,1.1*s);skyline(g,w,h,P_.ghost.replace(/[\d.]+\)$/,m=>(parseFloat(m)*.6)+')'),9+G.li*5,h*.32,.8*s);
  for(let k=0;k<3;k++){g.beginPath();const y0=h*(.2+k*.15),amp=16,ph=k*1.7+G.li;g.moveTo(0,y0);for(let x=0;x<=w;x+=8)g.lineTo(x,y0+Math.sin(x/w*Math.PI*2+ph)*amp);for(let x=w;x>=0;x-=8)g.lineTo(x,y0+12+Math.sin(x/w*Math.PI*2+ph+.6)*amp*1.2);g.closePath();
    g.fillStyle=P_.night?'rgba(160,150,255,.06)':'rgba(255,255,255,.15)';g.fill()}
  const de=document.documentElement.style;de.setProperty('--sky-top',P_.sky[0]);de.setProperty('--sky-bot',P_.sky[1]);de.setProperty('--haze',P_.haze);
  if(P_.cols){const [p,,m,d]=P_.cols;de.setProperty('--lapis-deep',d);de.setProperty('--lapis',mixH(m,d,.5));de.setProperty('--gold',P_.acc);de.setProperty('--gold-hi',mixH(P_.acc,p,.45));de.setProperty('--ivory',p)}
}
function fitView(){
  const {right,up}=camBasis({az:cam.azT,el:cam.el});const ck=cam.azT.toFixed(3)+'|'+W+'x'+H;
  if(G.fitCache&&G.fitCache.k===ck)return G.fitCache.v;let r0=1e9,r1=-1e9,u0=1e9,u1=-1e9;
  for(const c of G.fitPts){const r=V.dot(c,right),u=V.dot(c,up);r0=Math.min(r0,r);r1=Math.max(r1,r);u0=Math.min(u0,u);u1=Math.max(u1,u)}
  const aspect=W/Math.max(1,H),hw=(r1-r0)/2,hh=(u1-u0)/2,z=Math.max(hh*1.2+.25,(hw+.3)/aspect*1.08);
  const rm=(r0+r1)/2,um=(u0+u1)/2-hh*.04;const v={z,center:V.add(V.mul(right,rm),V.mul(up,um)),box:{r0,r1,u0,u1,rm,um,right,up}};G.fitCache={k:ck,v};return v;
}
/* ---------- camera director ----------
   Opens on the whole page, then eases in to follow the player with room above and ahead;
   cuts to whatever moves (lifts, bridges, gates, new musicians) and pulls back when you pause. */
const CD={shot:null,vel:[0,0,0],zv:0,last:0,climb:0,lastY:0,start:-99};
function shot(points,dur,pad=.7){CD.shot={points,until:G.time+dur,pad}}
function frameBox(pts,pad){const {right,up}=camBasis({az:cam.azT,el:cam.el});let r0=1e9,r1=-1e9,u0=1e9,u1=-1e9;
  for(const c of pts){const r=V.dot(c,right),u=V.dot(c,up);r0=Math.min(r0,r);r1=Math.max(r1,r);u0=Math.min(u0,u);u1=Math.max(u1,u)}
  const aspect=W/Math.max(1,H);return {r:(r0+r1)/2,u:(u0+u1)/2,z:Math.max((u1-u0)/2+pad,((r1-r0)/2+pad)/aspect)}}
function directCamera(dt){
  const f=fitView(),B=f.box,aspect=W/Math.max(1,H);
  const fitZ=f.z,closeZ=Math.min(fitZ,Math.max(2.7,fitZ*.6));
  const dy=P.pos[1]-CD.lastY;CD.lastY=P.pos[1];CD.climb+=(((dy>.0005)?1:(dy<-.0005)?-.6:0)-CD.climb)*Math.min(1,dt*1.5);
  const head=[P.pos[0],P.pos[1]+1,P.pos[2]],feet=[P.pos[0],P.pos[1]-.35,P.pos[2]],pts=[head,feet];
  for(const k of [P.to,...P.path.slice(0,4)].filter(Boolean)){const c=nodeCenter(k);pts.push([c[0],c[1]+.7,c[2]])}
  if(P.riding)for(const st of P.riding.m.stops)pts.push([st[0]+.5,st[1]+1.9,st[2]+.5],[st[0]+.5,st[1]+.6,st[2]+.5]);
  let want;
  if(G.time-CD.start<1.9||G.mode==='done'||G.mode==='card'||G.mode==='menu')want={r:B.rm,u:B.um,z:fitZ};
  else if(CD.shot&&G.time<CD.shot.until){want=frameBox([...CD.shot.points,head,feet],CD.shot.pad);want.z=Math.min(Math.max(want.z,closeZ),fitZ)}
  else if(P.idle>7&&!P.riding)want={r:B.rm,u:B.um,z:fitZ};
  else{want=frameBox(pts,.95);want.z=Math.min(Math.max(want.z,closeZ),fitZ);want.u+=want.z*(.1+.16*CD.climb)}
  want.z*=cam.userZoom;
  const hw=want.z*aspect,hh=want.z,cl=(v,a,b)=>a>b?(a+b)/2:Math.min(b,Math.max(a,v));
  want.r=cl(want.r,B.r0-.5+hw,B.r1+.5-hw);want.u=cl(want.u,B.u0-.5+hh,B.u1+.7-hh);
  const target=V.add(V.mul(B.right,want.r),V.mul(B.up,want.u));
  if(reduce||cam.snap){cam.target=target;cam.zoom=want.z;CD.vel=[0,0,0];CD.zv=0;cam.snap=false;return}
  const w=2.3,wz=1.7;
  for(let i=0;i<3;i++){const a=w*w*(target[i]-cam.target[i])-2*w*CD.vel[i];CD.vel[i]+=a*dt;cam.target[i]+=CD.vel[i]*dt}
  const az=wz*wz*(want.z-cam.zoom)-2*wz*CD.zv;CD.zv+=az*dt;cam.zoom+=CD.zv*dt;
}
/* ---------- the lesson coach: a gold ring on the next thing to do, one line at the bottom ---------- */
function coachShow(){const c=COACH[G.coachI],el=$('coach');if(!c||!G.tut){el.hidden=true;return}$('coachText').textContent=say(c.text);el.hidden=false;
  if(c.shotT)shot([c.at(),[c.at()[0],c.at()[1]+1,c.at()[2]]],c.shotT,1.1)}
function coachTick(){
  if(!G.tut)return;let moved=false;while(COACH[G.coachI]&&COACH[G.coachI].done()){G.coachI++;moved=true}
  if(moved){coachShow();if(ac&&MUS.out){const t=qTime();santur(musFreq(11),t,.05);santur(musFreq(14),t+.15,.05)}}
  if(G.mode==='play'&&P.idle>8&&!G.coachNudged){G.coachNudged=true;toast(say('Stuck? Tap the bulb to ask {guide}.'),3200);$('bHint').classList.add('pulse')}
}
let VPinfo=null;
/* styled faces draw flat with their gradient; painted trees are cut-outs; everything else is lit as before */
function drawKeyed(name,U){for(const k of R.groups[name]||[]){const S=STYLE[k];R.drawLit(name+'|'+k,k,VPinfo.m,U,S?{flat:true,style:S,scroll:k==='t_water'?[U.time*.02,U.time*.008]:[0,0]}:CARD_TEX.has(k)?{flat:true,cut:true}:k==='x_orosi'?{flat:true}:{})}}
function uploadCard(id,c){const gl=R.gl;let tx=R.tex[id];if(!tx)tx=R.tex[id]=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,tx);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,c);gl.generateMipmap(gl.TEXTURE_2D);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false)}
for(const [k,[fn,w,h]] of Object.entries(TREE_CARDS)){const c=document.createElement('canvas');c.width=512;c.height=1024;const g=c.getContext('2d');const H=h/Math.cos(Math.atan(1/Math.SQRT2))*.82;g.scale(512/(w*300),1024/(H*300));fn(g,w*300,H*300);uploadCard('c_'+k,c)}
function project(p){const m=VPinfo.m;const x=m[0]*p[0]+m[4]*p[1]+m[8]*p[2]+m[12],y=m[1]*p[0]+m[5]*p[1]+m[9]*p[2]+m[13];const r=canvas.getBoundingClientRect();return [r.left+(x+1)/2*r.width,r.top+(1-y)/2*r.height]}
function render(now){
  const L=G.lvl;if(!L)return;const pal=PALETTES[L.palette];
  const camDt=Math.min(.05,Math.max(0,(now-(CD.last||now))/1000));CD.last=now;cam.az+=(cam.azT-cam.az)*(reduce?1:Math.min(1,camDt*7));
  if(L.autoTurn&&performance.now()>(cam.manualUntil||0)){const th=Math.atan2(P.pos[0]-L.autoTurn[0],P.pos[2]-L.autoTurn[1]);let want=Math.PI/4+Math.round((th-Math.PI/4)/(Math.PI/2))*Math.PI/2;
    while(want-cam.azT>Math.PI)want-=2*Math.PI;while(want-cam.azT<-Math.PI)want+=2*Math.PI;let d=th-cam.azT;while(d>Math.PI)d-=2*Math.PI;while(d<-Math.PI)d+=2*Math.PI;if(Math.abs(d)>Math.PI*.36)cam.azT=want}
  directCamera(camDt);
  VPinfo=viewProj(cam,W/Math.max(1,H));
  {const ring=$('coachRing'),c=G.tut&&G.mode==='play'?COACH[G.coachI]:null;if(c){const [sx,sy]=project(c.at());ring.style.transform=`translate(${sx.toFixed(1)}px,${sy.toFixed(1)}px)`}
   if(ring.hidden===!!c)ring.hidden=!c}
  const U={L:lightFor(cam),fog:hex2rgb(pal.fog||pal.sky[1]),fogStart:G.bounds.min[1]+1.4,fogRange:2.6,mist:.85,top:Math.max(1,G.bounds.max[1]-G.bounds.min[1]),time:reduce?0:G.time,lock:G.P&&G.P.lock};
  R.begin(W,H);
  drawKeyed('static',U);if(G.P)R.drawLines('rim',VPinfo.m,G.P.lines);
  // living parts
  const T=G.time,dyn=[];
  for(const m of G.movers)dyn.push(styledPiece({x:m.pos[0],y:m.pos[1],z:m.pos[2],t:m.piece,c:m.c,f:m.f},null));
  for(const c of G.cards||[])dyn.push({x:c.x,y:c.y,z:c.z,t:'card_'+c.t,ang:-(cam.az-Math.PI/4),sc:c.sc});
  for(const f of G.fallers){if(f.state==='gone')continue;const sh=f.state==='shake'?Math.sin(T*70)*.04:0;dyn.push({x:f.x+sh,y:f.y+fallerY(f),z:f.z,t:'block',c:10,f:''})}
  for(const r of G.rotators){const [px,py,pz]=r.pivot;for(const [dx,dz] of r.arm){const [ox,oz]=rotOff(dx,dz,r.ang);dyn.push({x:px+ox,y:py,z:pz+oz,t:r.piece,f:r.f,ang:r.ang})}}
  for(const r of G.rosettes){const hint=G.hintRosette===r;r.pulse=Math.max(0,r.pulse-.02);dyn.push({x:r.pos[0],y:r.pos[1]+Math.sin(T*2)*.04,z:r.pos[2],t:'rosette',ang:T*.8,sc:1+(hint?.18*Math.abs(Math.sin(T*4)):0)+r.pulse*.3})}
  for(const c of G.coins){if(c.got&&c.pop<=0)continue;if(c.got)c.pop-=.04;const [x,y,z]=c.c;dyn.push({x,y:y+.08+Math.sin(T*2+x+z)*.05+(c.got?(1-c.pop)*.6:0),z,t:'coin',ang:T*2.2+x,sc:c.got?Math.max(.01,c.pop):1})}
  for(const s of G.shards){if(s.got&&s.pop<=0)continue;if(s.got)s.pop-=.03;const [x,y,z]=s.c;dyn.push({x,y:y+.1+Math.sin(T*1.6+x)*.07+(s.got?(1-s.pop)*1.2:0),z,t:'shardp',ang:T*1.3,sc:s.got?Math.max(.01,s.pop):1})}
  if(G.gate){if(G.gateOpen)G.doorY=Math.min(1,G.doorY+.015);const [x,y,z]=G.gate;const gr=G.static.get(K(x,y,z));if(G.doorY<1)dyn.push({x,y:y-G.doorY*.9,z,t:'door',r:gr?gr.r:0})}
  for(const g of G.guards){const bob=g.type==='patrol'&&g.wait<=0?Math.abs(Math.sin(g.phase||0))*.03:0;dyn.push({x:g.pos[0]-.5,y:g.pos[1]+bob,z:g.pos[2]-.5,t:'guard',ang:g.ang,sc:1.28})}
  const pb=P.to!==null?Math.abs(Math.sin(P.phase))*.035:0;let py=P.pos[1]+pb;if(P.falling)py=P.falling.f.y+1+fallerY(P.falling.f);
  const RL=ROLE();
  const catPose=(a,model,sc,x,y,z)=>{if(model!=='cat'){dyn.push({x,y,z,t:model,ang:a.ang,sc});return}
    const pose=a.idle>9?'catsleep':a.idle>2.5?'catplay':'cat';
    if(pose==='cat')dyn.push({x,y,z,t:'cat',ang:a.ang,sc});else dyn.push({x,y,z,t:pose,ang:a.ang+Math.PI/2,sc:sc*1.05});
    if(pose==='catplay')dyn.push({x:x+Math.cos(T*1.7)*.16,y:y+.62*sc+Math.sin(T*6)*.05,z:z+Math.sin(T*1.7)*.16,t:'butterfly',ang:T*1.7,sc:1.2})};
  catPose(P,RL.player,RL.pSc,P.pos[0]-.5,py,P.pos[2]-.5);
  for(const gf of G.gifts){const [x,y,z]=gf.c;if(!gf.open){dyn.push({x,y,z,t:'giftvase',ang:.6,sc:1.15+Math.sin(T*3)*.02});continue}
    const e=G.time-gf.t;if(gf.kind==='cat'&&e<1.8){dyn.push({x,y,z,t:'vasecat',ang:.6,sc:1.15});continue}
    dyn.push({x,y,z,t:'vasebits',ang:.6,sc:1.15});
    if(e<1.4){const k=e/1.4;if(gf.kind==='lamp')dyn.push({x,y:y+.4+k*1.1,z,t:'lampitem',ang:T*2,sc:1.4*(1-k*.5)});
      else for(let i=0;i<(gf.kind==='cat'?2:5);i++)dyn.push({x:x+Math.cos(i*1.3)*k*.5,y:y+.3+k*1.3-k*k*.6,z:z+Math.sin(i*1.3)*k*.5,t:'coin',ang:T*5,sc:1-k*.6})}}
  const CROWD=L.crowd||['tar','daf','ney'];
  for(let k=0;k<3;k++){const t0=G.crowdT[k];if(t0===undefined)continue;const e=Math.min(1,(G.time-t0)/.8),sc=e<1?1-Math.pow(1-e,3):1;const [x,y,z]=G.stages[k];const bob=Math.sin(T*1.4+k)*.06;
    dyn.push({x,y:y+bob,z,t:'stagecarpet',sc:1.3*sc});dyn.push({x,y:y+bob+.05,z,t:CROWD[k],ang:.78,sc:1.5*sc});
    if(e<1)dyn.push({x,y:y+.9+bob,z,t:'rosette',ang:T*4,sc:(1-e)*1.4})}
  if(G.crowdT[2]!==undefined){const e=(G.time-G.crowdT[2])%14,b=G.bounds;dyn.push({x:b.min[0]-3+e*.9,y:b.max[1]+.5+Math.sin(e)*.3,z:b.max[2]+1-e*.9,t:'birds',sc:2,ang:-.78})}
  const cb=CAT.to!==null?Math.abs(Math.sin(CAT.phase))*.02:0;
  const hop=CAT.hop&&G.time-CAT.hop<.45?Math.sin((G.time-CAT.hop)/.45*Math.PI)*.35:0;let cxo=0,czo=0;{const dx=CAT.pos[0]-P.pos[0],dz=CAT.pos[2]-P.pos[2],d=Math.hypot(dx,dz);if(d<.55&&Math.abs(CAT.pos[1]-P.pos[1])<.5){const push=.55-d,nx=d>.01?dx/d:.7,nz=d>.01?dz/d:-.7;cxo=nx*push;czo=nz*push}}
  if(CAT.fade>.05&&!CAT.hidden)catPose(CAT,RL.guide,(.8+.2*CAT.fade)*RL.gSc,CAT.pos[0]-.5+cxo,CAT.pos[1]+cb+hop+(RL.guide==='hoopoe'?.04+Math.abs(Math.sin(T*3))*.05:0),CAT.pos[2]-.5+czo);
  R.setGroups('dyn',buildGroups(dyn.map(q=>q.t==='block'||q.t==='deck'||q.t==='window'?styledPiece(q,null):q),pal,'solid'));drawKeyed('dyn',U);
  // sight bands, hint path
  const tiles=[];for(const g of G.guards)for(const c of g.vision)tiles.push({x:c[0],y:c[1],z:c[2],t:'tile',c:0});
  if(tiles.length){R.setGroups('vis',buildGroups(tiles,pal,'solid'));R.drawGroups('vis',VPinfo.m,{...U,mist:0},{alpha:.38,tint:[.42,.4,.5],tintAmt:.85,depthWrite:false,offset:true})}
  if(G.hintT>0){G.hintT-=1/60;const d=G.hintPath.map(k=>{const n=G.nodes.get(k);return n?{x:n.x,y:n.h,z:n.z,t:'dot'}:null}).filter(Boolean);
    R.setGroups('hint',buildGroups(d,pal,'solid'));R.drawGroups('hint',VPinfo.m,{...U,mist:0},{alpha:Math.min(1,G.hintT),tint:[.95,.8,.35],tintAmt:.9,depthWrite:false,offset:true})}
  if(G.flash){G.flash.t-=1/60;if(G.flash.t<=0)G.flash=null;else{R.setGroups('flash',buildGroups([{...G.flash.at,t:'tile'}],pal,'solid'));R.drawGroups('flash',VPinfo.m,{...U,mist:0},{alpha:G.flash.t*1.4,tint:G.flash.bad?[.85,.3,.3]:[.95,.82,.4],tintAmt:.9,depthWrite:false,offset:true})}}
  R.drawGroups('staticW',VPinfo.m,U,{water:true,depthWrite:false});
  if(G.gateOpen&&G.gate){const [x,y,z]=G.gate;R.setGroups('beam',buildGroups([{x,y,z,t:'beamlight'}],pal,'solid'));R.drawGroups('beam',VPinfo.m,{...U,mist:0},{alpha:.16+.06*Math.sin(T*3),depthWrite:false})}
}

