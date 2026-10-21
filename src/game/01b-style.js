/* =========================================================
   STYLE: gradient faces, inlaid Persian lines, painted trees
   Each side of a block carries a world-space gradient (no light, no shadow).
   Ornament is a mask (R = motif, G = second motif, B = inlaid line) whose colours
   come from the chapter's palette, so one set of patterns serves every wing.
   ========================================================= */
const hx=h=>hex2rgb(h);
function mkMask(fn){return g=>{g.fillStyle='#000';g.fillRect(0,0,TS,TS);g.globalCompositeOperation='lighter';fn(g);g.globalCompositeOperation='source-over'}}
function star8m(g,cx,cy,R,r,rot=-Math.PI/2){g.beginPath();for(let i=0;i<16;i++){const a=i*Math.PI/8+rot,rr=i%2?r:R;g.lineTo(cx+rr*Math.cos(a),cy+rr*Math.sin(a))}g.closePath()}
function petals5(g,x,y,r,col,cen){g.fillStyle=col;for(let i=0;i<5;i++){const a=i/5*Math.PI*2-Math.PI/2;g.beginPath();g.arc(x+Math.cos(a)*r*.6,y+Math.sin(a)*r*.6,r*.48,0,7);g.fill()}if(cen){g.fillStyle=cen;g.beginPath();g.arc(x,y,r*.3,0,7);g.fill()}}
const R_='#ff0000',G_='#00ff00',B_='#0000ff';
const MASKS={
  none:mkMask(()=>{}),
  hexline:mkMask(g=>{const cols=2,rows=3,w=TS/cols,h=TS/rows;g.strokeStyle=B_;g.lineWidth=4;
    for(let j=-1;j<=rows;j++)for(let i=-1;i<=cols;i++){const cx=i*w+(j%2?w/2:0),cy=j*h,rx=w/2,ry=h*.66;g.beginPath();g.moveTo(cx-rx,cy);g.lineTo(cx-rx/2,cy-ry);g.lineTo(cx+rx/2,cy-ry);g.lineTo(cx+rx,cy);g.lineTo(cx+rx/2,cy+ry);g.lineTo(cx-rx/2,cy+ry);g.closePath();g.stroke()}}),
  star:mkMask(g=>{star8m(g,TS/2,TS/2,TS*.17,TS*.1);g.strokeStyle=B_;g.lineWidth=6;g.stroke();star8m(g,TS/2,TS/2,TS*.06,TS*.035,Math.PI/8-Math.PI/2);g.fillStyle=G_;g.fill()}),
  stars:mkMask(g=>{for(const [x,y] of [[0,0],[TS,0],[0,TS],[TS,TS],[TS/2,TS/2]]){star8m(g,x,y,TS*.2,TS*.12);g.fillStyle=R_;g.fill();star8m(g,x,y,TS*.08,TS*.05,Math.PI/8-Math.PI/2);g.fillStyle=G_;g.fill()}}),
  arch:mkMask(g=>{const x0=TS*.3,x1=TS*.7,y1=TS*.92,sp=TS*.42;g.beginPath();g.moveTo(x0,y1);g.lineTo(x0,sp);g.quadraticCurveTo(x0,TS*.18,TS/2,TS*.12);g.quadraticCurveTo(x1,TS*.18,x1,sp);g.lineTo(x1,y1);g.closePath();g.fillStyle=R_;g.fill();g.strokeStyle=B_;g.lineWidth=7;g.stroke()}),
  band:mkMask(g=>{g.strokeStyle=B_;g.lineWidth=5;g.beginPath();g.moveTo(0,TS*.06);g.lineTo(TS,TS*.06);g.moveTo(0,TS*.22);g.lineTo(TS,TS*.22);g.stroke();
    g.lineWidth=4;for(let i=0;i<4;i++){const x=i*TS/4;g.beginPath();g.moveTo(x,TS*.14);g.lineTo(x+TS/16,TS*.09);g.lineTo(x+TS/8,TS*.14);g.lineTo(x+TS*3/16,TS*.19);g.lineTo(x+TS/4,TS*.14);g.stroke();g.fillStyle=G_;g.beginPath();g.arc(x+TS/8,TS*.14,6,0,7);g.fill()}}),
  diaper:mkMask(g=>{const n=6,s=TS/n;g.strokeStyle=R_;g.lineWidth=3;for(let k=-n;k<=2*n;k++){g.beginPath();g.moveTo(k*s,0);g.lineTo(k*s+TS,TS);g.stroke();g.beginPath();g.moveTo(k*s,TS);g.lineTo(k*s+TS,0);g.stroke()}
    g.fillStyle=G_;for(let j=0;j<=n;j++)for(let i=0;i<=n;i++){g.beginPath();g.arc(i*s,j*s+s/2,5,0,7);g.fill()}}),
  medal:mkMask(g=>{const c=TS/2;g.beginPath();for(let k=0;k<=64;k++){const a=k/64*Math.PI*2,rr=TS*.3+TS*.035*Math.cos(a*8);g.lineTo(c+Math.cos(a)*rr*.82,c+Math.sin(a)*rr)}g.fillStyle=R_;g.fill();g.strokeStyle=B_;g.lineWidth=6;g.stroke();
    star8m(g,c,c,TS*.13,TS*.08);g.fillStyle=G_;g.fill();for(const [x,y] of [[0,0],[TS,0],[0,TS],[TS,TS]]){g.beginPath();g.arc(x,y,TS*.14,0,7);g.fillStyle=G_;g.fill()}}),
  water:mkMask(g=>{g.strokeStyle=R_;g.lineWidth=4;g.lineCap='round';for(let j=0;j<5;j++)for(let i=0;i<4;i++){const x=i*TS/4+(j%2?TS/8:0)+20,y=j*TS/5+30;g.beginPath();g.arc(x,y,16,Math.PI*.9,Math.PI*2.1);g.stroke();g.beginPath();g.arc(x+26,y+6,7,Math.PI,Math.PI*2.2);g.stroke()}}),
  road:mkMask(g=>{g.fillStyle=B_;g.fillRect(TS/2-4,0,8,TS);for(let k=0;k<2;k++){const y=k*TS/2+TS/4;g.fillStyle=R_;g.beginPath();g.moveTo(TS/2,y-34);g.lineTo(TS/2+26,y);g.lineTo(TS/2,y+34);g.lineTo(TS/2-26,y);g.fill()}}),
};
function texOrosiG(g){const cols=['#c8283a','#f2c45a','#3b5ad0','#2f9a5a','#eef6f4','#ef8aa6','#f07a2a','#3fb0a8'];
  const bg=g.createLinearGradient(0,0,0,TS);bg.addColorStop(0,'#5a321c');bg.addColorStop(1,'#2e180c');g.fillStyle=bg;g.fillRect(0,0,TS,TS);
  const x0=34,x1=TS-34,sp=TS*.44,cx=TS/2,R=(x1-x0)/2;
  for(let k=0;k<9;k++)for(let ring=0;ring<3;ring++){const a0=Math.PI+k/9*Math.PI,a1=Math.PI+(k+1)/9*Math.PI,r0=R*(.2+ring*.27),r1=R*(.2+(ring+1)*.27);g.fillStyle=cols[(k+ring*3)%8];
    g.beginPath();g.moveTo(cx+Math.cos(a0)*r0,sp+Math.sin(a0)*r0);g.lineTo(cx+Math.cos(a0)*r1,sp+Math.sin(a0)*r1);g.lineTo(cx+Math.cos(a1)*r1,sp+Math.sin(a1)*r1);g.lineTo(cx+Math.cos(a1)*r0,sp+Math.sin(a1)*r0);g.fill()}
  g.fillStyle='#f6d27a';g.beginPath();g.arc(cx,sp,R*.2,Math.PI,0);g.fill();g.strokeStyle='#2a160b';g.lineWidth=5;for(let k=0;k<=9;k++){const a=Math.PI+k/9*Math.PI;g.beginPath();g.moveTo(cx,sp);g.lineTo(cx+Math.cos(a)*R,sp+Math.sin(a)*R);g.stroke()}
  for(let ring=0;ring<4;ring++){g.beginPath();g.arc(cx,sp,R*(.2+ring*.27),Math.PI,0);g.stroke()}
  const y0=sp+6,y1=TS-34,pw=(x1-x0)/4,ph=(y1-y0)/3;
  for(let j=0;j<3;j++)for(let i=0;i<4;i++){const x=x0+i*pw,y=y0+j*ph;const gg=g.createLinearGradient(x,y,x+pw,y+ph);gg.addColorStop(0,'#f6fbfa');gg.addColorStop(1,'#cfe4ec');g.fillStyle=gg;g.fillRect(x,y,pw,ph);
    g.fillStyle=cols[(i*3+j*5)%8];g.beginPath();g.moveTo(x+pw/2,y+6);g.lineTo(x+pw-6,y+ph/2);g.lineTo(x+pw/2,y+ph-6);g.lineTo(x+6,y+ph/2);g.fill()}
  g.lineWidth=6;for(let i=0;i<=4;i++){g.beginPath();g.moveTo(x0+i*pw,y0);g.lineTo(x0+i*pw,y1);g.stroke()}for(let j=0;j<=3;j++){g.beginPath();g.moveTo(x0,y0+j*ph);g.lineTo(x1,y0+j*ph);g.stroke()}
  g.strokeStyle='#d6a73a';g.lineWidth=5;g.strokeRect(12,12,TS-24,TS-24)}
TEXDEFS.x_orosi={color:texOrosiG};

/* ---------- painted trees, in the manner of the Water Court: thin dark branches, open crowns ---------- */
function grad(g,x0,y0,x1,y1,stops){const gr=g.createLinearGradient(x0,y0,x1,y1);stops.forEach((c,i)=>gr.addColorStop(i/(stops.length-1),c));return gr}
function branches(g,r,x,y,a,len,wd,depth,col,tips,spread=1.1){const x2=x+Math.cos(a)*len,y2=y+Math.sin(a)*len;g.strokeStyle=col;g.lineWidth=wd;g.lineCap='round';g.beginPath();g.moveTo(x,y);
  g.quadraticCurveTo((x+x2)/2+(r()-.5)*len*.35,(y+y2)/2,x2,y2);g.stroke();tips.push([x2,y2,depth]);if(depth===0)return;
  const n=depth>2?3:2;for(let k=0;k<n;k++)branches(g,r,x2,y2,a+(r()-.5)*spread+(k-(n-1)/2)*.55,len*(.68+r()*.1),wd*.68,depth-1,col,tips,spread)}
function cypressCard(g,w,h){ // slim, tall, its tip bowing like a boteh
  g.beginPath();g.moveTo(w*.5,h*.995);g.bezierCurveTo(w*.14,h*.78,w*.16,h*.32,w*.44,h*.07);g.quadraticCurveTo(w*.6,h*-.01,w*.7,h*.05);g.quadraticCurveTo(w*.6,h*.06,w*.57,h*.11);
  g.bezierCurveTo(w*.86,h*.36,w*.86,h*.78,w*.5,h*.995);g.closePath();g.fillStyle=grad(g,0,0,w,h,['#6fb87a','#2e6f43','#173f29']);g.fill();
  g.save();g.clip();g.strokeStyle='rgba(205,245,200,.32)';g.lineWidth=w*.022;for(let i=0;i<30;i++){const y=h*(.12+i*.029),s=w*(.08+.15*Math.sin(Math.PI*(i/30)));g.beginPath();g.moveTo(w*.5-s,y+h*.012);g.quadraticCurveTo(w*.5,y-h*.006,w*.5+s,y+h*.012);g.stroke()}g.restore()}
function almondCard(g,w,h){ // white and pink blossom scattered along dark branches
  const r=mulberry(4),tips=[];branches(g,r,w*.5,h,-Math.PI/2,h*.3,w*.04,4,'#3c2b2b',tips,1.25);
  for(const [x,y,d] of tips){const n=d===0?7:d===1?4:2;for(let k=0;k<n;k++){const fx=x+(r()-.5)*w*.13,fy=y+(r()-.5)*h*.08,rr=w*(.016+r()*.012);const gr=g.createRadialGradient(fx,fy,0,fx,fy,rr);gr.addColorStop(0,r()<.5?'#ffc9d6':'#ffe6ec');gr.addColorStop(1,'#ffffff');petals5(g,fx,fy,rr,gr,'#e9a93a')}}}
function orangeCard(g,w,h,fruit='orange'){ // an open crown: leaf clusters at the branch tips, fruit hanging below them
  const r=mulberry(fruit==='orange'?6:13),tips=[];branches(g,r,w*.5,h,-Math.PI/2,h*.34,w*.05,3,'#4a3324',tips,1.3);
  const leaf=(x,y,s,a,c)=>{g.save();g.translate(x,y);g.rotate(a);g.fillStyle=c;g.beginPath();g.moveTo(0,0);g.quadraticCurveTo(s*.5,-s*.32,s,0);g.quadraticCurveTo(s*.5,s*.32,0,0);g.fill();g.restore()};
  // a soft mass behind the clusters so the crown reads as foliage, then layered leaf clusters dark to light
  for(const [x,y,d] of tips){if(d>1)continue;const rr=w*(d===0?.13:.1),gr=g.createRadialGradient(x-rr*.3,y-rr*.4,0,x,y,rr);gr.addColorStop(0,'rgba(120,190,110,.95)');gr.addColorStop(1,'rgba(40,100,60,.9)');g.fillStyle=gr;g.beginPath();g.ellipse(x,y,rr,rr*.82,0,0,7);g.fill()}
  for(const pass of [0,1,2])for(const [x,y,d] of tips){if(d>2)continue;const n=d===0?14:d===1?9:4;for(let k=0;k<n;k++){const a=r()*Math.PI*2,rr=r()*w*.12;leaf(x+Math.cos(a)*rr,y+Math.sin(a)*rr*.8-pass*w*.01,w*(.07+r()*.05),r()*7,[['#1f5a33','#2f6f3e'],['#3f8a4a','#4f9a52'],['#6fb760','#9fd27a']][pass][k%2])}}
  for(const [x,y,d] of tips){if(d!==0||r()<.25)continue;const fx=x+(r()-.5)*w*.08,fy=y+w*.06+r()*w*.04;g.strokeStyle='#4a3324';g.lineWidth=w*.006;g.beginPath();g.moveTo(fx,fy-w*.04);g.lineTo(fx,fy);g.stroke();
    const fr=w*.034,gr=g.createRadialGradient(fx-fr*.35,fy-fr*.35,0,fx,fy,fr);if(fruit==='orange'){gr.addColorStop(0,'#ffd27a');gr.addColorStop(1,'#e8601f')}else{gr.addColorStop(0,'#ff8a7a');gr.addColorStop(1,'#a3202c')}
    g.fillStyle=gr;g.beginPath();g.arc(fx,fy,fr,0,7);g.fill()}}
const TREE_CARDS={cypress:[cypressCard,.55,1.95],orange:[orangeCard,1.25,1.5],blossom:[almondCard,1.55,1.95],tree:[(g,w,h)=>orangeCard(g,w,h,'pom'),1.1,1.3]};
const TREE_TYPES=new Set(Object.keys(TREE_CARDS));
function cardGeoFor(w,h,T,el){const g=new Geo();const k=1/Math.cos(el)*.82,r=[Math.SQRT1_2,0,-Math.SQRT1_2],c=[.5,0,.5];const a=V.add(c,V.mul(r,-w/2)),b=V.add(c,V.mul(r,w/2)),H=h*k;
  g.with({T},()=>{const n=[Math.SQRT1_2,0,Math.SQRT1_2];g.tri(a,b,[b[0],H,b[2]],n,-1,[[0,0],[1,0],[1,1]]);g.tri(a,[b[0],H,b[2]],[a[0],H,a[2]],n,-1,[[0,0],[1,1],[0,1]])});
  return {p:new Float32Array(g.p),n:new Float32Array(g.n),s:g.s,uv:new Float32Array(g.uv),t:g.t,w:g.w}}
for(const [k,[fn,w,h]] of Object.entries(TREE_CARDS))PIECE_BY_ID['card_'+k]={id:'card_'+k,slot:6,geo:cardGeoFor(w,h,'c_'+k,Math.atan(1/Math.SQRT2))};
const CARD_TEX=new Set(Object.keys(TREE_CARDS).map(k=>'c_'+k));

/* ---------- chapter palettes, built from colour harmony ----------
   Each chapter names a base hue, how its partner hue relates (analogous, complementary, split, triadic)
   and a time of day. Every colour on the page is then derived from those hues at set lightness and
   saturation steps, so faces, floor, water, sky and accents always belong together. */
const hsl=(h,s,l)=>{h=((h%360)+360)%360/360;const f=n=>{const k=(n+h*12)%12,a=s*Math.min(l,1-l);return l-a*Math.max(-1,Math.min(k-3,9-k,1))};return '#'+[f(0),f(8),f(4)].map(v=>Math.round(v*255).toString(16).padStart(2,'0')).join('')};
const SCHEME={analogous:40,complementary:180,split:150,triadic:120};
const mixH=(a,b,t)=>'#'+hx(a).map((v,i)=>Math.round((v+(hx(b)[i]-v)*t)*255).toString(16).padStart(2,'0')).join('');
/* One palette per page: four tones of one family (pale, light, mid, deep) and a single accent.
   Blocks, sky, water, props, carpets, windows and trees are all mapped onto these five colours. */
const PAL_OPTIONS={
  rose:     {label:'Rose Garden',     cols:['#fdf0ec','#f4c3bd','#d7848b','#6e2f4f'],acc:'#e9b04c'},
  turquoise:{label:'Turquoise Dome',  cols:['#effaf6','#b4e3d8','#4fa7a0','#1d4a5a'],acc:'#f2a63c'},
  lapis:    {label:'Lapis Night',     cols:['#e8ebf8','#a3aee0','#4b5aa8','#1b2257'],acc:'#f2c45a'},
  saffron:  {label:'Saffron Court',   cols:['#fff5e2','#f6d49c','#dd9a4a','#7c4224'],acc:'#3d5fae'},
  pomegranate:{label:'Pomegranate Dusk',cols:['#fdebe2','#f2b49b','#c75a45','#561e2c'],acc:'#4cb3a6'},
  pistachio:{label:'Pistachio',       cols:['#f4f7e6','#d3e2ab','#8eaa5e','#3d5631'],acc:'#e27c8c'},
  lilac:    {label:'Lilac Evening',   cols:['#f6effa','#d9c6ec','#9677c6','#3f2b68'],acc:'#f0b850'},
  copper:   {label:'Copper Night',    cols:['#f7e6d6','#dca37c','#9b5b3e','#2c2234'],acc:'#5fc1b4'},
};
function fromPal(o,{time,shade,motif}){const [p,l,m,d]=o.cols,acc=o.acc,night=time==='night',dusk=time==='dusk';
  const sky=night?[mixH(d,'#000000',.4),mixH(d,m,.4)]:dusk?[mixH(l,m,.6),mixH(p,l,.4)]:[l,mixH(p,l,.25)];
  const face=(g0,g1)=>({g0,g1,m1:mixH(g1,d,.22),m2:acc,ln:p});
  return {shade,night,deep:d,cols:o.cols,acc,sky,haze:sky[1],ghost:night?`rgba(${hx(l).map(v=>Math.round(v*255)).join(',')},.12)`:'rgba(255,255,255,.32)',
    lines:night?[...hx(acc),.5]:[...hx(p),.6],
    top:night?{g0:mixH(l,m,.4),g1:mixH(m,d,.55),r:5.5,mask:'none',ln:acc}:{g0:p,g1:mixH(p,l,.45),r:6,mask:'none',ln:'#ffffff'},
    pz:night?face(mixH(m,d,.75),mixH(l,m,.6)):face(mixH(l,m,.25),mixH(m,d,.15)),
    px:night?face(mixH(d,'#000000',.2),mixH(m,d,.35)):face(mixH(l,m,.7),mixH(m,d,.6)),
    motif,water:night?{g0:mixH(m,d,.4),g1:mixH(d,'#000000',.25),m1:acc}:{g0:mixH(l,m,.5),g1:mixH(m,d,.6),m1:p},
    lock:{r:[p,l,m,d].map(hx),acc:hx(acc)}}}
const CH_PAL={ // which palette each page uses, and its light
  ch1:['rose',     {time:'day',  shade:'px',  motif:{pz:'arch',px:'star'}}],
  ch2:['pomegranate',{time:'dusk',shade:'pz', motif:{pz:'diaper',px:'diaper'}}],
  ch3:['lapis',    {time:'night',shade:'both',motif:{pz:'star',px:'stars'}}],
  ch4:['saffron',  {time:'day',  shade:'px',  motif:{pz:'star',px:'arch'}}],
  ch5:['lilac',    {time:'dusk', shade:'pz',  motif:{pz:'medal',px:'medal'}}],
  ch6:['turquoise',{time:'day',  shade:'pz',  motif:{pz:'medal',px:'arch'}}],
  ch7:['copper',   {time:'night',shade:'both',motif:{pz:'stars',px:'star'}}],
};
const PALS=new Proxy({},{get:(_,k)=>{const c=CH_PAL[k];if(!c)return undefined;const o=PAL_OPTIONS[(window.__palOverride)||c[0]];return fromPal(o,c[1])}});
const STYLE={};let STYLE_KEY='';
function buildOneTexture(id){const d=TEXDEFS[id];const c=document.createElement('canvas');c.width=c.height=TS;const g=c.getContext('2d');d.color(g);const D=g.getImageData(0,0,TS,TS).data,out=new Uint8Array(TS*TS*4);
  for(let y=0;y<TS;y++){const s=y*TS*4,t=(TS-1-y)*TS*4;for(let x=0;x<TS*4;x+=4){out[t+x]=D[s+x];out[t+x+1]=D[s+x+1];out[t+x+2]=D[s+x+2];out[t+x+3]=255}}return out}
function styl(id,mask,s){if(!TEXDEFS[id]||TEXDEFS[id].mask_!==mask){TEXDEFS[id]={color:MASKS[mask],mask_:mask,dirty:true}}
  STYLE[id]={mode:s.mode||1,g0:hx(s.g0),g1:hx(s.g1),gy:s.gy,gdir:s.gdir||[0,1,0],gc:s.gc||[0,0,0],m1:hx(s.m1||s.g1),m2:hx(s.m2||s.m1||s.g1),ln:hx(s.ln||'#ffffff')}}
/* (re)style the block pieces for a chapter: gradients run between the page's lowest and highest blocks; floors glow from its centre */
function applyStyle(key,bounds){const P=PALS[key]||PALS.ch1;const y0=bounds.min[1]-.5,y1=bounds.max[1]+.5,cx=(bounds.min[0]+bounds.max[0])/2,cz=(bounds.min[2]+bounds.max[2])/2;
  const gy=[y0,y1],side=s=>({...s,gy});
  styl('t_top',P.top.mask,{...P.top,mode:2,gc:[cx,0,cz],gy:[0,P.top.r],m1:P.top.ln,m2:P.top.ln});
  const dk=(h,k)=>{const c=hx(h),sh=hx(P.deep).map(v=>v*(P.night?.5:1.2));return '#'+c.map((v,i)=>Math.round(Math.max(0,Math.min(1,v*(1-k)+sh[i]*k*.55))*255).toString(16).padStart(2,'0')).join('')};
  const shadeOf=sd=>P.shade==='both'?(sd==='px'?.34:.22):P.shade===sd?.3:0;
  for(const sd of ['pz','px']){const k=shadeOf(sd),S0=side(P[sd]),S=k?{...S0,g0:dk(S0.g0,k),g1:dk(S0.g1,k),m1:S0.m1&&dk(S0.m1,k),m2:S0.m2&&dk(S0.m2,k*.6),ln:S0.ln&&dk(S0.ln,k*.5)}:S0;
    styl('t_'+sd,S.mask||'none',S);styl('t_'+sd+'B','band',S);styl('t_'+sd+'M',P.motif[sd],S)}
  styl('t_water','water',{...P.water,gdir:[.7,0,.7],gy:[cx+cz-8,cx+cz+8]});
  styl('t_road','road',{mode:2,g0:P.top.g0,g1:P.top.g1,gc:[cx,0,cz],gy:[0,P.top.r],m1:P.pz.g1,m2:P.pz.g1,ln:P.px.g1});
  for(const id in TEXDEFS)if(TEXDEFS[id].dirty){R.addTexture(id,buildOneTexture(id));TEXDEFS[id].dirty=false}
  const pal=PALETTES[key];if(pal){pal.fog=P.haze;pal.sky=P.sky}STYLE_KEY=key;return P}
/* the pieces themselves are built once; their faces point at the styled textures above */
(function(){const def=(id,fn,slot=0)=>{const g=new Geo();fn(g);PIECE_BY_ID[id]={id,slot,geo:{p:new Float32Array(g.p),n:new Float32Array(g.n),s:g.s,uv:new Float32Array(g.uv),t:g.t,w:g.w}}};
  const box=(g,top,pz,px)=>g.box(0,0,0,1,1,1,-1,{top,pz,px,nx:px,nz:pz});
  def('k_b',g=>box(g,'t_top','t_pz','t_px'));def('k_bb',g=>box(g,'t_top','t_pzB','t_pxB'));def('k_ba',g=>box(g,'t_top','t_pzM','t_px'));def('k_bs',g=>box(g,'t_top','t_pz','t_pxM'));
  def('k_water',g=>g.box(0,0,0,1,.8,1,-1,{top:'t_water',pz:'t_pz',px:'t_px',nx:'t_px',nz:'t_pz'}));
  def('k_slab',g=>g.box(0,.78,0,1,1,1,-1,{top:'t_road',pz:'t_pzB',px:'t_pxB',nx:'t_pxB',nz:'t_pzB'}));
  def('k_stair',g=>{const n=6;for(let i=0;i<n;i++)g.box(0,0,(n-1-i)/n,1,(i+1)/n,(n-i)/n,-1,{top:'t_top',pz:'t_pz',px:'t_px',nx:'t_px',nz:'t_pz'})});
  def('k_orosi',g=>g.box(0,0,0,1,1,1,-1,{px:'x_orosi',pz:'x_orosi',nx:'t_px',nz:'t_pz',top:'t_top'}));
  def('k_portal',g=>{g.with({T:'t_pzM'},()=>g.arch({x0:.24,x1:.76,sy:.5,shape:'pointed',z0:.38,z1:.62}));g.box(-.03,1,.34,1.03,1.14,.66,-1,{pz:'t_pzB',nz:'t_pzB',px:'t_pxB',nx:'t_pxB',top:'t_top'})});
  def('rill',g=>{g.box(0,0,0,1,.84,1,-1,{top:null,pz:'t_pzB',px:'t_pxB',nx:'t_pxB',nz:'t_pzB'});g.box(0,.84,0,.3,1,1,-1,{top:'t_top',pz:'t_pzB',px:'t_px',nx:'t_px',nz:'t_pzB'});g.box(.7,.84,0,1,1,1,-1,{top:'t_top',pz:'t_pzB',px:'t_pxB',nx:'t_px',nz:'t_pzB'});
    g.box(.3,.84,0,.7,.95,1,-1,{top:'t_water',side:null})});
  for(const k of ['k_b','k_bb','k_ba','k_bs','k_orosi','rill'])FADEABLE.add(k);
})();
const KBLOCKS=new Set(['k_b','k_bb','k_ba','k_bs','k_orosi']);
/* which styled piece a level piece is drawn as */
function styledPiece(q,S){
  if(q.t==='block'){const above=S&&S.get(K(q.x,q.y+1,q.z));const topCourse=!above||!(above.t==='block'||above.t==='window');const h=((q.x*7+q.y*13+q.z*5)%9+9)%9;
    return {...q,t:topCourse?(h===4?'k_ba':'k_bb'):h<2?'k_ba':h<4?'k_bs':'k_b'}}
  if(q.t==='stair')return {...q,t:'k_stair'};if(q.t==='deck')return {...q,t:'k_slab'};if(q.t==='window')return {...q,t:'k_orosi'};if(q.t==='gate')return {...q,t:'k_portal'};
  if(q.t==='water')return {...q,t:'k_water'};return q}
/* light rim lines around each flat region of the block world (no grid between blocks) */
function rimLines(list,back){const S=new Set();for(const q of list)if(KBLOCKS.has(q.t))S.add(K(q.x,q.y,q.z));const solid=(x,y,z)=>S.has(K(x,y,z));const seg=[],eps=V.mul(back,.01),push=(a,b)=>seg.push(...V.add(a,eps),...V.add(b,eps));
  for(const k of S){const [x,y,z]=k.split(',').map(Number);for(const n of [[1,0,0],[0,1,0],[0,0,1],[-1,0,0],[0,0,-1]]){if(solid(x+n[0],y+n[1],z+n[2]))continue;
    const ax=n.findIndex(v=>v!==0),o=[0,1,2].filter(i=>i!==ax),base=[x,y,z];base[ax]+=n[ax]>0?1:0;
    for(const i of o)for(const sd of [0,1]){const d=[0,0,0];d[i]=sd?1:-1;const m=[x+d[0],y+d[1],z+d[2]];if(solid(...m)&&!solid(m[0]+n[0],m[1]+n[1],m[2]+n[2]))continue;
      const j=o.find(v=>v!==i),p0=[...base],p1=[...base];p0[i]+=sd;p1[i]+=sd;p1[j]+=1;push(p0,p1)}}}
  return new Float32Array(seg)}
/* far skyline of domes, minarets and cypresses */
function skyline(g,W,H,col,seed,y0,s){const r=mulberry(seed);g.fillStyle=col;let x=-20*s;
  while(x<W+40*s){const k=r(),w=(40+r()*60)*s,base=y0+r()*30*s;
    if(k<.3){g.fillRect(x,base-120*s,w,140*s+H);g.beginPath();g.ellipse(x+w/2,base-120*s,w*.42,w*.5,0,Math.PI,0);g.fill();g.fillRect(x+w/2-2*s,base-120*s-w*.5-16*s,4*s,18*s)}
    else if(k<.5){const mw=12*s;g.fillRect(x,base-210*s,mw,230*s+H);g.fillRect(x-4*s,base-190*s,mw+8*s,8*s);g.beginPath();g.moveTo(x-2*s,base-210*s);g.lineTo(x+mw/2,base-240*s);g.lineTo(x+mw+2*s,base-210*s);g.fill()}
    else if(k<.75){g.beginPath();g.moveTo(x,base+H);g.quadraticCurveTo(x-w*.2,base-70*s,x+w*.2,base-150*s);g.quadraticCurveTo(x+w*.6,base-70*s,x+w*.4,base+H);g.fill()}
    else{g.fillRect(x,base-90*s,w,110*s+H);g.beginPath();g.moveTo(x+w*.25,base-90*s);g.lineTo(x+w*.25,base-140*s);g.quadraticCurveTo(x+w/2,base-170*s,x+w*.75,base-140*s);g.lineTo(x+w*.75,base-90*s);g.fill()}
    x+=w+(10+r()*40)*s}}
