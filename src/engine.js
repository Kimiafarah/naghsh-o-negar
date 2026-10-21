/* =========================================================
   Palettes: 12 named slots. Pieces store a slot index, so
   switching palette recolours the whole scene.
   ========================================================= */
const SLOTS=['Stone','Sand','Clay','Rose','Teal','Lapis','Leaf','Umber','Water','Gold','Ivory','Fruit'];
const PALETTES={
  gilded:   {name:'Gilded',   bg:'gilded', sky:['#efd690','#d8b35c'], fog:'#efdba3',
             c:['#f1e0bf','#dcbf8e','#c0512f','#d98a92','#2f9a8f','#23409a','#3d6a3a','#4a3020','#4fa9cf','#c9a04a','#fbf4e4','#ee7f2a']},
  miniature:{name:'Miniature',bg:'clouds', sky:['#a8b1e3','#efe3c6'], fog:'#efe3c6',
             c:['#ecd9b6','#d6b07a','#c4472d','#d98c8c','#3fa49b','#1f3c92','#3f6b34','#3b2a1b','#5fb3c9','#d6a845','#f6eedb','#ec8a2c']},
  dawn:     {name:'Dawn',     bg:'plain',  sky:['#fdf3df','#f3cdc6'],
             c:['#f3e1cf','#e9c6ab','#dc8a70','#c8607c','#74b8b0','#6474b4','#8eb46e','#6d4c5e','#86d3d0','#e6b85c','#fbf3e6','#f0994a']},
  lagoon:   {name:'Lagoon',   bg:'plain',  sky:['#8fdbd2','#d6f3ea'],
             c:['#f2e7d4','#e4cba8','#e3906f','#eaa3ab','#3fb3ab','#4b6faf','#6aa66c','#5d4838','#71d8d3','#efc66a','#fbf6ea','#f39a4b']},
  saffron:  {name:'Saffron',  bg:'plain',  sky:['#ffcf5c','#ffeab0'],
             c:['#f8dc96','#f2b85e','#e37c41','#d65c52','#52a59b','#48538f','#e7a53d','#7c4b2b','#93d6e2','#fff0b8','#fff6dc','#e8622f']},
  dusk:     {name:'Dusk',     bg:'plain',  sky:['#3f428c','#a596d6'],
             c:['#d3cdee','#ada6da','#e38aa0','#f2b8c4','#6bbac6','#4d519c','#7f9ed4','#3c3668','#8cd4e8','#f4d58a','#f1edf9','#f2a35a']},
};
const hex2rgb=h=>[parseInt(h.slice(1,3),16)/255,parseInt(h.slice(3,5),16)/255,parseInt(h.slice(5,7),16)/255];
function mulberry(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}

/* =========================================================
   Surfaces / textures. Each texture has a "detail" layer that
   is tinted by the piece colour and an optional full-colour
   layer (tiles cut from the painting) selected by a mask.
   ========================================================= */
const TS=512;
const SURFACES=[ // finishes the user can apply ('' = plain)
  {id:'',label:'Plain'},{id:'ashlar',label:'Ashlar'},{id:'brick',label:'Brick'},{id:'band',label:'Arabesque frieze'},
  {id:'inscr',label:'Calligraphy frieze'},{id:'stars',label:'Interlace tiles'},{id:'girih',label:'Girih stars'},
  {id:'diaper',label:'Star diaper'},{id:'hexclay',label:'Clay hexagons'},{id:'hexblue',label:'Blue hexagons'},{id:'arabesque',label:'Lapis arabesque'},
];
const SURF_BY_ID=Object.fromEntries(SURFACES.map(s=>[s.id,s]));
const TEXDEFS={
  ashlar:{detail:drawAshlar},
  brick:{detail:drawBrick},
  band:{detail:drawAshlar,color:g=>drawBand(g,'band',.30),mask:y=>y<TS*.30},
  inscr:{detail:drawAshlar,color:g=>drawBand(g,'inscr',.17),mask:y=>y<TS*.17},
  stars:{crop:'stars'},girih:{crop:'girih'},diaper:{crop:'diaper'},hexclay:{crop:'hexclay'},arabesque:{crop:'arabesque'},
  hexblue:{color:drawHexBlue},
  roof:{detail:drawRoof},
  carpet:{color:drawCarpet},
  lattice:{color:drawLattice},
  porcelain:{color:drawPorcelain},
  pool:{color:drawPool},
};
function cv2(){const c=document.createElement('canvas');c.width=c.height=TS;return [c,c.getContext('2d')]}
function noise(g,n,alpha,seed){const r=mulberry(seed);for(let i=0;i<n;i++){g.fillStyle=r()<.5?`rgba(0,0,0,${alpha})`:`rgba(255,255,255,${alpha})`;g.fillRect(r()*TS,r()*TS,1+r()*3,1+r()*3)}}
function drawAshlar(g){
  g.fillStyle='#e6e6e6';g.fillRect(0,0,TS,TS);noise(g,2600,.035,3);
  const rows=3,h=TS/rows;
  for(let r=0;r<rows;r++){
    const y=r*h,off=r%2?TS/4:0;
    g.fillStyle='#cdcdcd';g.fillRect(0,y,TS,3);g.fillStyle='#f3f3f3';g.fillRect(0,y+3,TS,2);
    for(let x=off;x<TS+1;x+=TS/2){g.fillStyle='#cdcdcd';g.fillRect(x-1,y,3,h);g.fillStyle='#f3f3f3';g.fillRect(x+2,y,2,h)}
  }
}
function drawBrick(g){
  g.fillStyle='#f2f2f2';g.fillRect(0,0,TS,TS);const r=mulberry(9);const rows=10,h=TS/rows,w=TS/4;
  for(let i=0;i<rows;i++){const off=i%2?w/2:0;for(let x=-w;x<TS+w;x+=w){const v=205+r()*28|0;g.fillStyle=`rgb(${v},${v},${v})`;g.fillRect(x+off+3,i*h+3,w-6,h-6)}}
  noise(g,1500,.03,4);
}
function drawRoof(g){
  g.fillStyle='#bdbdbd';g.fillRect(0,0,TS,TS);const R=32,dy=26;
  for(let row=-1;row*dy<TS+R;row++){const off=row%2?R:0;for(let x=-R;x<TS+R;x+=R*2){const cx=x+off,cy=row*dy;
    const gr=g.createLinearGradient(0,cy-R,0,cy+R);gr.addColorStop(0,'#f5f5f5');gr.addColorStop(1,'#c4c4c4');
    g.fillStyle=gr;g.beginPath();g.arc(cx,cy,R-2,0,Math.PI);g.closePath();g.fill();g.strokeStyle='#a5a5a5';g.lineWidth=2;g.stroke()}}
}
function drawBand(g,crop,frac){
  const img=CROPIMG[crop];const h=TS*frac;g.fillStyle='#e6e6e6';g.fillRect(0,0,TS,TS);
  if(img){g.drawImage(img,0,0,TS,h)}
  g.fillStyle='#b8902f';g.fillRect(0,h-4,TS,4);
}
function drawHexBlue(g){
  g.fillStyle='#9fc0e6';g.fillRect(0,0,TS,TS);const s=TS/4,hh=s*Math.sqrt(3)/2;
  for(let j=-1;j<6;j++)for(let i=-1;i<5;i++){
    const cx=i*s*1.5,cy=j*hh*2+(i%2?hh:0);
    g.beginPath();for(let k=0;k<6;k++){const a=k*Math.PI/3;g.lineTo(cx+s*.92*Math.cos(a),cy+s*.92*Math.sin(a))}g.closePath();
    g.fillStyle='#a9c9ec';g.fill();g.strokeStyle='#e9f2fb';g.lineWidth=5;g.stroke();
    g.beginPath();for(let k=0;k<6;k++){const a=k*Math.PI/3;g.lineTo(cx+s*.55*Math.cos(a),cy+s*.55*Math.sin(a))}g.closePath();g.strokeStyle='#c7dcf2';g.lineWidth=3;g.stroke();
    g.fillStyle='#d6a845';g.beginPath();g.arc(cx,cy,4,0,7);g.fill();
  }
}
function drawCarpet(g){
  g.fillStyle='#1f2a5c';g.fillRect(0,0,TS,TS);
  g.fillStyle='#f2e6c8';g.fillRect(22,22,TS-44,TS-44);g.fillStyle='#1f2a5c';g.fillRect(28,28,TS-56,TS-56);
  // border flowers
  const r=mulberry(5);for(let i=0;i<40;i++){const t=i/40*4,side=t|0,f=t-side;const p=[[60+f*(TS-120),44],[TS-44,60+f*(TS-120)],[TS-60-f*(TS-120),TS-44],[44,TS-60-f*(TS-120)]][side];
    g.fillStyle=i%2?'#d6a845':'#c2452b';g.beginPath();g.arc(p[0],p[1],5,0,7);g.fill()}
  g.fillStyle='#f2e6c8';g.fillRect(62,62,TS-124,TS-124);g.fillStyle='#a32e28';g.fillRect(68,68,TS-136,TS-136);
  for(let i=0;i<70;i++){g.fillStyle=['#e8c66a','#f2e6c8','#2f5f3a','#1f2a5c'][i%4];g.beginPath();g.arc(80+r()*(TS-160),80+r()*(TS-160),3+r()*3,0,7);g.fill()}
  const c=TS/2;
  const lozenge=(rx,ry,fill,stroke)=>{g.beginPath();g.moveTo(c,c-ry);g.quadraticCurveTo(c+rx*.35,c-ry*.35,c+rx,c);g.quadraticCurveTo(c+rx*.35,c+ry*.35,c,c+ry);g.quadraticCurveTo(c-rx*.35,c+ry*.35,c-rx,c);g.quadraticCurveTo(c-rx*.35,c-ry*.35,c,c-ry);g.fillStyle=fill;g.fill();if(stroke){g.strokeStyle=stroke;g.lineWidth=4;g.stroke()}};
  lozenge(150,170,'#1f2a5c','#e8c66a');lozenge(100,115,'#f2e6c8');lozenge(80,92,'#c2452b','#1f2a5c');
  g.fillStyle='#e8c66a';g.beginPath();for(let k=0;k<16;k++){const a=k*Math.PI/8,rr=k%2?18:36;g.lineTo(c+rr*Math.cos(a),c+rr*Math.sin(a))}g.closePath();g.fill();
  for(const [x,y] of [[68,68],[TS-68,68],[68,TS-68],[TS-68,TS-68]]){g.fillStyle='#1f2a5c';g.beginPath();g.arc(x,y,54,0,7);g.fill();g.fillStyle='#e8c66a';g.beginPath();g.arc(x,y,12,0,7);g.fill()}
}
function drawLattice(g){
  const gr=g.createLinearGradient(0,0,0,TS);gr.addColorStop(0,'#fbe6a8');gr.addColorStop(1,'#e7b45a');g.fillStyle=gr;g.fillRect(0,0,TS,TS);
  g.strokeStyle='#3c2717';g.lineWidth=13;g.lineJoin='miter';const s=TS/4;
  for(let j=0;j<=4;j++)for(let i=0;i<=4;i++){const cx=i*s,cy=j*s;
    for(const rot of [0,Math.PI/4]){g.beginPath();for(let k=0;k<4;k++){const a=rot+k*Math.PI/2+Math.PI/4;g.lineTo(cx+s*.42*Math.cos(a),cy+s*.42*Math.sin(a))}g.closePath();g.stroke()}}
  g.lineWidth=8;for(let k=0;k<=4;k++){g.beginPath();g.moveTo(k*s+s/2,0);g.lineTo(k*s+s/2,TS);g.stroke();g.beginPath();g.moveTo(0,k*s+s/2);g.lineTo(TS,k*s+s/2);g.stroke()}
}
function drawPorcelain(g){
  g.fillStyle='#f5f3ec';g.fillRect(0,0,TS,TS);const B='#24408f';
  g.fillStyle=B;g.fillRect(0,0,TS,54);g.fillRect(0,TS-46,TS,46);
  g.fillStyle='#f5f3ec';for(let x=0;x<TS;x+=42){g.beginPath();g.arc(x+21,54,15,Math.PI,0);g.fill()}
  g.strokeStyle=B;g.lineWidth=6;g.beginPath();for(let x=0;x<=TS;x+=8)g.lineTo(x,TS/2+Math.sin(x/TS*Math.PI*4)*70);g.stroke();
  for(let k=0;k<6;k++){const x=k*TS/6+40,y=TS/2+Math.sin((x)/TS*Math.PI*4)*70+(k%2?-60:60);
    g.fillStyle=B;for(let p=0;p<6;p++){const a=p*Math.PI/3;g.beginPath();g.ellipse(x+Math.cos(a)*18,y+Math.sin(a)*18,13,8,a,0,7);g.fill()}
    g.fillStyle='#f5f3ec';g.beginPath();g.arc(x,y,7,0,7);g.fill()}
}
function drawPool(g){
  const r=mulberry(11);const s=TS/6;
  for(let j=0;j<6;j++)for(let i=0;i<6;i++){g.fillStyle=['#2a7fb4','#3390c2','#2475a8','#3a9acb'][r()*4|0];g.fillRect(i*s,j*s,s,s)}
  g.strokeStyle='#bfe2f0';g.lineWidth=4;for(let k=0;k<=6;k++){g.beginPath();g.moveTo(k*s,0);g.lineTo(k*s,TS);g.stroke();g.beginPath();g.moveTo(0,k*s);g.lineTo(TS,k*s);g.stroke()}
  g.fillStyle='rgba(255,255,255,.08)';for(let i=0;i<24;i++){g.beginPath();g.ellipse(r()*TS,r()*TS,30+r()*40,8+r()*12,r()*3,0,7);g.fill()}
}
const CROPIMG={};
function loadCrops(){return Promise.all(Object.entries(CROPS).map(([k,src])=>new Promise(res=>{const i=new Image();i.onload=()=>{CROPIMG[k]=i;res()};i.onerror=()=>res();i.src=src})))}
const TEXDATA={};
function buildTextures(){
  for(const [id,d] of Object.entries(TEXDEFS)){
    const [cd,gd]=cv2(),[cc,gc]=cv2();
    if(d.detail)d.detail(gd);else{gd.fillStyle='#fff';gd.fillRect(0,0,TS,TS)}
    if(d.crop){if(CROPIMG[d.crop])gc.drawImage(CROPIMG[d.crop],0,0,TS,TS);else{gc.fillStyle='#888';gc.fillRect(0,0,TS,TS)}}
    else if(d.color)d.color(gc);
    const D=gd.getImageData(0,0,TS,TS).data,Cc=(d.crop||d.color)?gc.getImageData(0,0,TS,TS).data:null;
    const out=new Uint8Array(TS*TS*4);
    for(let y=0;y<TS;y++){const m=Cc?(d.mask?(d.mask(y)?255:0):255):0;const src=y*TS*4,dst=(TS-1-y)*TS*4;
      for(let x=0;x<TS*4;x+=4){const S=m?Cc:D;out[dst+x]=S[src+x];out[dst+x+1]=S[src+x+1];out[dst+x+2]=S[src+x+2];out[dst+x+3]=m}}
    TEXDATA[id]=out;
  }
}
function texPreview(id,tint,size=72){
  const data=TEXDATA[id];const c=document.createElement('canvas');c.width=c.height=TS;const g=c.getContext('2d');const im=g.createImageData(TS,TS);
  const t=hex2rgb(tint);
  for(let y=0;y<TS;y++){const s=(TS-1-y)*TS*4,d=y*TS*4;for(let x=0;x<TS*4;x+=4){const a=data[s+x+3]/255;
    for(let k=0;k<3;k++){const v=data[s+x+k];im.data[d+x+k]=Math.min(255,v*(1-a)*t[k]*1.12+v*a)}im.data[d+x+3]=255}}
  g.putImageData(im,0,0);const o=document.createElement('canvas');o.width=o.height=size;o.getContext('2d').drawImage(c,0,0,size,size);return o.toDataURL();
}

/* =========================================================
   Geometry builder (local cell space: x,y,z in [0,1])
   slot -1 = the piece's own colour, otherwise a palette slot.
   T: null = untextured, '$' = the piece's surface, otherwise a texture id.
   ========================================================= */
const V={sub:(a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]],add:(a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]],mul:(a,k)=>[a[0]*k,a[1]*k,a[2]*k],
  cross:(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],dot:(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],
  norm:a=>{const l=Math.hypot(a[0],a[1],a[2])||1;return [a[0]/l,a[1]/l,a[2]/l]}};
class Geo{
  constructor(){this.p=[];this.n=[];this.s=[];this.uv=[];this.t=[];this.w=[];this.T=null;this.us=1;this.W=0}
  with(o,fn){const prev={};for(const k in o){if(o[k]===undefined)continue;prev[k]=this[k];this[k]=o[k]}fn();Object.assign(this,prev);return this}
  v(p,n,s,uv){
    this.p.push(p[0],p[1],p[2]);this.n.push(n[0],n[1],n[2]);this.s.push(s);this.t.push(this.T);this.w.push(this.W);
    if(uv){this.uv.push(uv[0],uv[1]);return}
    const k=this.us,ax=Math.abs(n[0]),ay=Math.abs(n[1]),az=Math.abs(n[2]);
    if(ay>=ax&&ay>=az)this.uv.push(p[0]*k,p[2]*k);else if(ax>=az)this.uv.push(p[2]*k,p[1]*k);else this.uv.push(p[0]*k,p[1]*k);
  }
  tri(a,b,c,n,s,uv){this.v(a,n,s,uv&&uv[0]);this.v(b,n,s,uv&&uv[1]);this.v(c,n,s,uv&&uv[2])}
  triN(a,b,c,na,nb,nc,s,uv){this.v(a,na,s,uv&&uv[0]);this.v(b,nb,s,uv&&uv[1]);this.v(c,nc,s,uv&&uv[2])}
  quad(a,b,c,d,n,s){this.tri(a,b,c,n,s);this.tri(a,c,d,n,s)}
  triOut(a,b,c,hint,s,uv){
    const u=V.sub(b,a),w=V.sub(c,a);let n=V.norm(V.cross(u,w));
    const m=[(a[0]+b[0]+c[0])/3-hint[0],(a[1]+b[1]+c[1])/3-hint[1],(a[2]+b[2]+c[2])/3-hint[2]];
    if(V.dot(n,m)<0)n=V.mul(n,-1);this.tri(a,b,c,n,s,uv);
  }
  box(x0,y0,z0,x1,y1,z1,s=-1,o={}){
    const pk=(...v)=>{for(const x of v)if(x!==undefined)return x;return this.T};
    const f=(face,top,fn)=>this.with({T:top?pk(o.py,o.top):pk(o[face],o.side)},fn);
    f('py',1,()=>this.quad([x0,y1,z0],[x1,y1,z0],[x1,y1,z1],[x0,y1,z1],[0,1,0],s));
    if(o.bottom)this.quad([x0,y0,z0],[x0,y0,z1],[x1,y0,z1],[x1,y0,z0],[0,-1,0],s);
    f('px',0,()=>this.quad([x1,y0,z0],[x1,y0,z1],[x1,y1,z1],[x1,y1,z0],[1,0,0],s));
    f('nx',0,()=>this.quad([x0,y0,z0],[x0,y1,z0],[x0,y1,z1],[x0,y0,z1],[-1,0,0],s));
    f('pz',0,()=>this.quad([x0,y0,z1],[x0,y1,z1],[x1,y1,z1],[x1,y0,z1],[0,0,1],s));
    f('nz',0,()=>this.quad([x0,y0,z0],[x1,y0,z0],[x1,y1,z0],[x0,y1,z0],[0,0,-1],s));
  }
  cyl(cx,cz,r,y0,y1,seg,s=-1,top=true,ph=0,reps=1,topT){
    for(let i=0;i<seg;i++){
      const a0=ph+i/seg*Math.PI*2,a1=ph+(i+1)/seg*Math.PI*2;
      const c0=Math.cos(a0),s0=Math.sin(a0),c1=Math.cos(a1),s1=Math.sin(a1);
      const p00=[cx+r*c0,y0,cz+r*s0],p10=[cx+r*c1,y0,cz+r*s1],p11=[cx+r*c1,y1,cz+r*s1],p01=[cx+r*c0,y1,cz+r*s0];
      const n0=[c0,0,s0],n1=[c1,0,s1],u0=i/seg*reps,u1=(i+1)/seg*reps,k=this.us;
      this.triN(p00,p10,p11,n0,n1,n1,s,[[u0,y0*k],[u1,y0*k],[u1,y1*k]]);this.triN(p00,p11,p01,n0,n1,n0,s,[[u0,y0*k],[u1,y1*k],[u0,y1*k]]);
      if(top)this.with({T:topT!==undefined?topT:this.T},()=>this.tri([cx,y1,cz],p01,p11,[0,1,0],s));
    }
  }
  cone(cx,cz,r,y0,y1,seg,s=-1,ph=0,reps=1){
    const apex=[cx,y1,cz],hint=[cx,y0+(y1-y0)*.3,cz],k=this.us;
    for(let i=0;i<seg;i++){
      const a0=ph+i/seg*Math.PI*2,a1=ph+(i+1)/seg*Math.PI*2;
      this.triOut([cx+r*Math.cos(a0),y0,cz+r*Math.sin(a0)],[cx+r*Math.cos(a1),y0,cz+r*Math.sin(a1)],apex,hint,s,
        [[i/seg*reps,y0*k],[(i+1)/seg*reps,y0*k],[(i+.5)/seg*reps,y1*k]]);
    }
  }
  ellip(cx,cy,cz,rx,ry,rz,sw,sh,s=-1,flat=false,hemi=false,reps=1){
    const P=(i,j)=>{const th=i/sw*Math.PI*2,ph=(hemi?j/sh*Math.PI/2:j/sh*Math.PI);const sp=Math.sin(ph);
      return [cx+rx*sp*Math.cos(th),cy+ry*Math.cos(ph),cz+rz*sp*Math.sin(th)]};
    const N=p=>V.norm([(p[0]-cx)/(rx*rx),(p[1]-cy)/(ry*ry),(p[2]-cz)/(rz*rz)]);
    const U=(i,p)=>[i/sw*reps,p[1]*this.us],c=[cx,cy,cz];
    for(let j=0;j<sh;j++)for(let i=0;i<sw;i++){
      const a=P(i,j),b=P(i+1,j),d=P(i,j+1),e=P(i+1,j+1);
      if(flat){if(j>0)this.triOut(a,b,e,c,s,[U(i,a),U(i+1,b),U(i+1,e)]);this.triOut(a,e,d,c,s,[U(i,a),U(i+1,e),U(i,d)])}
      else{if(j>0)this.triN(a,b,e,N(a),N(b),N(e),s,[U(i,a),U(i+1,b),U(i+1,e)]);this.triN(a,e,d,N(a),N(e),N(d),s,[U(i,a),U(i+1,e),U(i,d)])}
    }
  }
  lathe(prof,seg,s=-1,reps=1){
    for(let i=0;i<seg;i++){const a0=i/seg*Math.PI*2,a1=(i+1)/seg*Math.PI*2;
      for(let j=0;j<prof.length-1;j++){const [r0,y0]=prof[j],[r1,y1]=prof[j+1];const dr=r1-r0,dy=y1-y0,l=Math.hypot(dr,dy)||1;
        const nn=a=>[dy/l*Math.cos(a),-dr/l,dy/l*Math.sin(a)];
        const P=(r,y,a)=>[.5+r*Math.cos(a),y,.5+r*Math.sin(a)],k=this.us,u0=i/seg*reps,u1=(i+1)/seg*reps;
        this.triN(P(r0,y0,a0),P(r0,y0,a1),P(r1,y1,a1),nn(a0),nn(a1),nn(a1),s,[[u0,y0*k],[u1,y0*k],[u1,y1*k]]);
        this.triN(P(r0,y0,a0),P(r1,y1,a1),P(r1,y1,a0),nn(a0),nn(a1),nn(a0),s,[[u0,y0*k],[u1,y1*k],[u0,y1*k]]);
      }}
  }
  limb(a,b,r0,r1,seg,s=-1){
    const ax=V.norm(V.sub(b,a)),ref=Math.abs(ax[1])<.9?[0,1,0]:[1,0,0],u=V.norm(V.cross(ax,ref)),w=V.cross(ax,u);
    for(let i=0;i<seg;i++){const t0=i/seg*Math.PI*2,t1=(i+1)/seg*Math.PI*2;
      const d0=V.add(V.mul(u,Math.cos(t0)),V.mul(w,Math.sin(t0))),d1=V.add(V.mul(u,Math.cos(t1)),V.mul(w,Math.sin(t1)));
      const p00=V.add(a,V.mul(d0,r0)),p10=V.add(a,V.mul(d1,r0)),p01=V.add(b,V.mul(d0,r1)),p11=V.add(b,V.mul(d1,r1));
      this.triN(p00,p10,p11,d0,d1,d1,s);this.triN(p00,p11,p01,d0,d1,d0,s);this.tri(b,p01,p11,ax,s)}
  }
  /* wall with an arched opening running along z; shape 'round' or 'pointed' */
  arch(o){
    const {x0,x1,y0=0,sy,shape='round',z0=0,z1=1,s=-1}=o;
    const cx=(x0+x1)/2,a=(x1-x0)/2,N=12,A=[];
    if(shape==='pointed'){const k=a*.42,R=a+k,th=Math.acos(-k/R),H=N/2;
      for(let i=0;i<=H;i++){const t=Math.PI-(Math.PI-th)*i/H;A.push([cx+k+R*Math.cos(t),sy+R*Math.sin(t)])}
      for(let i=1;i<=H;i++){const t=(Math.PI-th)*(1-i/H);A.push([cx-k+R*Math.cos(t),sy+R*Math.sin(t)])}}
    else for(let i=0;i<=N;i++){const t=Math.PI-i/N*Math.PI;A.push([cx+a*Math.cos(t),sy+a*Math.sin(t)])}
    const proj=P=>{const dx=P[0]-cx,dy=P[1]-sy;let best=1e9,e='';
      if(dx<-1e-9){const t=-cx/dx;if(t<best){best=t;e='L'}}if(dx>1e-9){const t=(1-cx)/dx;if(t<best){best=t;e='R'}}if(dy>1e-9){const t=(1-sy)/dy;if(t<best){best=t;e='T'}}
      return {p:[cx+dx*best,sy+dy*best],e}};
    const B=A.map(proj);
    const face=(z,nz,T)=>this.with({T},()=>{const n=[0,0,nz];
      if(y0>0)this.quad([0,0,z],[1,0,z],[1,y0,z],[0,y0,z],n,s);
      this.quad([0,y0,z],[x0,y0,z],[x0,sy,z],[0,sy,z],n,s);this.quad([x1,y0,z],[1,y0,z],[1,sy,z],[x1,sy,z],n,s);
      for(let i=0;i<A.length-1;i++){const P=[...A[i],z],Q=[...A[i+1],z],b0=[...B[i].p,z],b1=[...B[i+1].p,z];
        if(B[i].e===B[i+1].e)this.quad(P,Q,b1,b0,n,s);
        else{const c=(B[i].e==='L'||B[i+1].e==='L')?[0,1,z]:[1,1,z];this.tri(P,Q,c,n,s);this.tri(Q,b1,c,n,s);this.tri(P,c,b0,n,s)}}
    });
    face(z1,1,o.front);if(o.back!==false)face(z0,-1,o.back!==undefined?o.back:o.front);
    this.with({T:o.soffit},()=>{
      this.quad([x0,y0,z0],[x0,y0,z1],[x0,sy,z1],[x0,sy,z0],[1,0,0],s);this.quad([x1,y0,z0],[x1,sy,z0],[x1,sy,z1],[x1,y0,z1],[-1,0,0],s);
      if(y0>0)this.quad([x0,y0,z0],[x1,y0,z0],[x1,y0,z1],[x0,y0,z1],[0,1,0],s);
      for(let i=0;i<A.length-1;i++){const p=A[i],q=A[i+1],n=V.norm([cx-(p[0]+q[0])/2,sy-(p[1]+q[1])/2,0]);this.quad([p[0],p[1],z0],[q[0],q[1],z0],[q[0],q[1],z1],[p[0],p[1],z1],n,s)}
    });
    this.with({T:o.side},()=>{this.quad([0,0,z0],[0,1,z0],[0,1,z1],[0,0,z1],[-1,0,0],s);this.quad([1,0,z0],[1,0,z1],[1,1,z1],[1,1,z0],[1,0,0],s)});
    this.with({T:o.top},()=>this.quad([0,1,z0],[1,1,z0],[1,1,z1],[0,1,z1],[0,1,0],s));
  }
  /* build into a sub-geometry, then scale/translate about the cell centre and turn by quarter turns */
  sub(fn,{rot=0,s=[1,1,1],t=[0,0,0]}={}){
    const g=new Geo();g.T=this.T;g.us=this.us;g.W=this.W;fn(g);
    const r=((rot%4)+4)%4,cs=[1,0,-1,0][r],sn=[0,1,0,-1][r];
    for(let i=0;i<g.p.length;i+=3){
      const x=(g.p[i]-.5)*s[0]+t[0],y=g.p[i+1]*s[1]+t[1],z=(g.p[i+2]-.5)*s[2]+t[2];
      this.p.push(x*cs+z*sn+.5,y,-x*sn+z*cs+.5);
      const n=V.norm([g.n[i]/s[0],g.n[i+1]/s[1],g.n[i+2]/s[2]]);this.n.push(n[0]*cs+n[2]*sn,n[1],-n[0]*sn+n[2]*cs);
    }
    this.s.push(...g.s);this.t.push(...g.t);this.w.push(...g.w);this.uv.push(...g.uv);
  }
}

/* =========================================================
   Piece library
   ========================================================= */
function musician(g){
  g.ellip(.5,0,.5,.2,.15,.17,12,5,-1,false,true);
  g.cone(.5,.5,.1,.08,.36,10,-1);
  g.ellip(.5,.42,.5,.066,.07,.066,10,7,1);
  g.ellip(.5,.465,.5,.08,.06,.08,10,5,10,false,true);
  g.limb([.5,.5,.5],[.51,.62,.5],.012,.007,5,2);
  g.ellip(.64,.2,.58,.085,.065,.035,10,6,7);g.limb([.6,.24,.57],[.42,.36,.62],.012,.01,5,7);
}
function wanderer(g){
  g.cone(.5,.5,.15,0,.52,14,-1);
  g.cyl(.5,.5,.072,.29,.32,12,9,true);
  g.ellip(.5,.57,.5,.068,.074,.068,10,7,1);
  g.ellip(.5,.62,.5,.085,.065,.085,10,5,10,false,true);
  g.limb([.5,.66,.5],[.51,.8,.5],.014,.007,5,2);
}
const PIECES=[
  /* --- structure --- */
  {id:'block',  name:'Block',      cat:'Build', slot:0, key:'1', build:g=>g.box(0,0,0,1,1,1,-1,{side:'$',top:null})},
  {id:'slab',   name:'Slab',       cat:'Build', slot:1, key:'2', build:g=>g.box(0,0,0,1,.5,1,-1,{side:'$',top:null})},
  {id:'deck',   name:'Walkway',    cat:'Build', slot:1, key:'3', build:g=>{g.box(0,.8,0,1,1,1,-1,{side:'$',top:null});g.box(.06,.62,.06,.94,.8,.94,7,{side:null,top:null})}},
  {id:'stair',  name:'Stairs',     cat:'Build', slot:0, key:'4', build:g=>{const n=4;for(let i=0;i<n;i++)g.box(0,0,(n-1-i)/n,1,(i+1)/n,(n-i)/n,-1,{side:'$',top:null})}},
  {id:'arch',   name:'Round arch', cat:'Build', slot:1, key:'5', build:g=>g.arch({x0:.2,x1:.8,sy:.48,front:'$',side:'$',soffit:null,top:null})},
  {id:'beam',   name:'Tiled beam', cat:'Build', slot:0, key:'6', build:g=>g.with({us:2.2},()=>g.box(0,.55,0,1,1,1,-1,{side:'arabesque',top:null}))},
  {id:'pillar', name:'Pillar',     cat:'Build', slot:0, key:'7', build:g=>{g.box(.2,0,.2,.8,.1,.8,-1,{side:null,top:null});g.cyl(.5,.5,.15,.1,.9,14,-1,false);g.box(.24,.9,.24,.76,1,.76,-1,{side:null,top:null})}},
  {id:'tower',  name:'Round tower',cat:'Build', slot:0, key:'8', build:g=>{g.with({T:'$'},()=>g.cyl(.5,.5,.44,0,1,24,-1,true,0,3,null));g.with({T:'arabesque',us:6},()=>g.cyl(.5,.5,.465,.82,.92,24,-1,true,0,4,null))}},
  {id:'roof',   name:'Tiled roof', cat:'Build', slot:2, key:'9', build:g=>{g.box(-.04,0,-.04,1.04,.08,1.04,1,{side:null,top:null});g.with({T:'roof',us:3},()=>g.cone(.5,.5,.74,.08,.86,4,-1,Math.PI/4,4));g.ellip(.5,.9,.5,.045,.045,.045,8,6,9)}},
  {id:'dome',   name:'Tiled dome', cat:'Build', slot:4, key:'0', build:g=>{
    g.with({us:3},()=>g.box(0,0,0,1,.18,1,1,{side:'arabesque',top:null}));
    g.with({T:'arabesque',us:5},()=>g.cyl(.5,.5,.4,.18,.36,20,1,false,0,3));
    g.with({T:'roof',us:4},()=>g.ellip(.5,.36,.5,.4,.42,.4,20,8,-1,false,true,6));
    g.cone(.5,.5,.035,.76,.98,6,9);g.ellip(.5,.8,.5,.05,.05,.05,8,6,9)}},
  /* --- persian architecture --- */
  {id:'gate',   name:'Pointed gate',  cat:'Persian', slot:0, build:g=>g.arch({x0:.18,x1:.82,sy:.46,shape:'pointed',front:'$',side:'$',soffit:null,top:null})},
  {id:'iwan',   name:'Iwan',          cat:'Persian', slot:0, build:g=>{
    g.box(0,0,0,1,1,.58,-1,{side:'$',top:null,pz:'girih',bottom:false});
    g.with({us:2},()=>g.arch({x0:.17,x1:.83,sy:.44,shape:'pointed',z0:.58,z1:1,front:'arabesque',back:false,side:'$',soffit:'stars',top:null}))}},
  {id:'window', name:'Lattice window',cat:'Persian', slot:0, build:g=>{
    g.box(0,0,0,1,1,.86,-1,{side:'$',top:null,pz:'lattice'});
    g.arch({x0:.3,x1:.7,y0:.18,sy:.5,shape:'pointed',z0:.86,z1:1,front:'$',back:false,side:'$',soffit:null,top:null})}},
  {id:'pavilion',name:'Pavilion',     cat:'Persian', slot:4, build:g=>{
    g.with({T:'carpet'},()=>g.cyl(.5,.5,.47,0,.06,8,1,true,Math.PI/8,2,'carpet'));
    for(let i=0;i<8;i++){const a=Math.PI/8+i*Math.PI/4;g.cyl(.5+.43*Math.cos(a),.5+.43*Math.sin(a),.022,.06,.66,6,9,false)}
    g.sub(m=>musician(m),{s:[.62,.62,.62],t:[0,.06,0],rot:1});
    g.with({T:'arabesque',us:6},()=>g.cyl(.5,.5,.5,.64,.72,8,1,true,Math.PI/8,4,null));
    g.with({T:'roof',us:3},()=>g.cone(.5,.5,.58,.72,1.08,8,-1,Math.PI/8,6));
    g.cone(.5,.5,.03,1.08,1.24,6,9);g.ellip(.5,1.14,.5,.045,.045,.045,8,5,9)}},
  {id:'kiosk',  name:'Fountain kiosk',cat:'Persian', slot:4, build:g=>{
    g.with({us:4},()=>g.box(.06,0,.06,.94,.14,.94,1,{side:'arabesque',top:null}));
    g.with({W:1},()=>g.box(.18,.14,.18,.82,.2,.82,8,{}));
    for(let r=0;r<4;r++)g.sub(m=>m.with({us:2},()=>m.arch({x0:.2,x1:.8,sy:.42,shape:'pointed',front:'arabesque',side:null,soffit:null,top:null})),{rot:r,s:[.88,.5,.1],t:[0,.14,.39]});
    g.with({us:4},()=>g.box(.04,.64,.04,.96,.72,.96,1,{side:'arabesque',top:null}));
    g.with({T:'roof',us:3},()=>g.cone(.5,.5,.66,.72,1.3,4,-1,Math.PI/4,4));
    g.cone(.5,.5,.03,1.3,1.44,6,9);g.ellip(.5,1.36,.5,.04,.04,.04,8,5,9)}},
  {id:'carpet', name:'Carpet',        cat:'Persian', slot:2, build:g=>g.sub(m=>m.box(0,0,0,1,.025,1,2,{top:'carpet',side:null}),{s:[.9,1,.9]})},
  {id:'floor',  name:'Tiled floor',   cat:'Persian', slot:1, build:g=>g.box(0,0,0,1,.04,1,1,{top:'hexblue',side:null})},
  {id:'vase',   name:'Vase',          cat:'Persian', slot:10,build:g=>g.with({T:'porcelain',us:1.9},()=>g.lathe([[0,0],[.1,0],[.15,.05],[.19,.17],[.17,.3],[.09,.4],[.065,.46],[.09,.52],[0,.52]],18,-1,2))},
  /* --- garden & water --- */
  {id:'water',  name:'Pool',          cat:'Garden', slot:8, build:g=>{g.with({us:2},()=>g.box(0,0,0,1,.03,1,1,{top:'pool',side:null}));g.with({W:1},()=>g.box(0,0,0,1,.8,1))}},
  {id:'lotus',  name:'Lotus pool',    cat:'Garden', slot:8, build:g=>{
    g.with({us:2},()=>g.box(0,0,0,1,.03,1,1,{top:'pool',side:null}));g.with({W:1},()=>g.box(0,0,0,1,.8,1));
    for(const [x,z,r] of [[.24,.3,.11],[.7,.22,.09],[.62,.7,.12],[.26,.74,.08],[.48,.5,.07]])g.cyl(x,z,r,.8,.815,12,6,true);
    for(const [x,z] of [[.24,.3],[.62,.7]]){g.cone(x,z,.06,.81,.9,7,3);g.ellip(x,.86,z,.025,.02,.025,6,4,9)}}},
  {id:'fall',   name:'Waterfall',     cat:'Garden', slot:8, build:g=>g.with({W:1},()=>g.box(.18,0,.82,.82,1,.98))},
  {id:'planter',name:'Flower bed',    cat:'Garden', slot:1, build:g=>{
    g.with({us:3},()=>g.box(.06,0,.06,.94,.3,.94,-1,{side:'arabesque',top:null}));g.box(.1,.3,.1,.9,.32,.9,7,{side:null,top:null});
    const B=[[.3,.3],[.7,.32],[.5,.68],[.28,.72],[.72,.7],[.5,.42]];for(const [x,z] of B)g.ellip(x,.36,z,.14,.1,.14,7,4,6,true);
    const r=mulberry(21);for(let i=0;i<22;i++){const [x,z]=B[i%B.length];const a=r()*6.28,d=r()*.11;g.ellip(x+Math.cos(a)*d,.44+r()*.04,z+Math.sin(a)*d,.025,.025,.025,6,4,[3,10,11,2][i%4])}}},
  {id:'tree',   name:'Tree',          cat:'Garden', slot:6, build:g=>{g.cyl(.5,.5,.055,0,.42,6,7,false);g.ellip(.5,.62,.5,.3,.27,.3,7,5,-1,true)}},
  {id:'orange', name:'Orange tree',   cat:'Garden', slot:6, build:g=>{
    g.limb([.5,0,.5],[.5,.4,.5],.05,.035,6,7);g.ellip(.5,.64,.5,.32,.28,.32,9,6,-1,true);
    const n=16;for(let k=0;k<n;k++){const y=1-2*(k+.5)/n,rr=Math.sqrt(1-y*y),th=k*2.39996;if(y<-.55)continue;
      g.ellip(.5+.31*rr*Math.cos(th),.64+.27*y,.5+.31*rr*Math.sin(th),.042,.042,.042,7,5,11)}}},
  {id:'blossom',name:'Blossom tree',  cat:'Garden', slot:10,build:g=>{
    const base=[.5,0,.5],fork=[.46,.36,.52];g.limb(base,fork,.045,.03,6,7);
    const ends=[[.2,.6,.4],[.74,.66,.36],[.38,.8,.72],[.7,.52,.74],[.52,.9,.46]];
    for(const e of ends){g.limb(fork,e,.025,.01,5,7);const r=mulberry(Math.round(e[0]*100));
      for(let i=0;i<4;i++)g.ellip(e[0]+(r()-.5)*.14,e[1]+(r()-.4)*.1,e[2]+(r()-.5)*.14,.07+r()*.03,.055,.07,6,4,-1,true);
      g.ellip(e[0],e[1]+.05,e[2],.03,.03,.03,6,4,3)}}},
  {id:'cypress',name:'Cypress',       cat:'Garden', slot:6, build:g=>{g.cyl(.5,.5,.045,0,.14,6,7,false);g.ellip(.5,.6,.5,.15,.47,.15,8,8,-1,true)}},
  /* --- life & sky --- */
  {id:'figure', name:'Wanderer',      cat:'Life', slot:5, build:wanderer},
  {id:'musician',name:'Musician',     cat:'Life', slot:2, build:g=>{g.sub(m=>m.box(0,0,0,1,.02,1,2,{top:'carpet',side:null}),{s:[.76,1,.76]});g.sub(m=>musician(m),{t:[0,.02,0]})}},
  {id:'cat',    name:'White cat',     cat:'Life', slot:10,build:g=>{
    g.ellip(.45,.1,.5,.2,.085,.1,12,7,-1);g.ellip(.68,.17,.5,.075,.07,.07,10,7,-1);
    g.cone(.67,.455,.025,.2,.27,5,-1);g.cone(.67,.545,.025,.2,.27,5,-1);
    g.limb([.27,.1,.5],[.2,.2,.56],.022,.016,6,-1);g.limb([.2,.2,.56],[.22,.27,.62],.016,.012,6,-1);
    g.ellip(.74,.19,.47,.01,.012,.01,4,3,7);g.ellip(.74,.19,.53,.01,.012,.01,4,3,7)}},
  {id:'cloud',  name:'Cloud',         cat:'Life', slot:10,build:g=>{for(const [x,y,z,a,b,c] of [[.28,.45,.5,.2,.12,.2],[.55,.52,.48,.25,.16,.22],[.78,.44,.52,.17,.1,.16],[.45,.4,.66,.16,.09,.14]])g.ellip(x,y,z,a,b,c,14,8,-1)}},
];
const CATS=[['Build','Build',''],['Persian','Persian','miniature'],['Garden','Garden & water',''],['Life','Life & sky','']];
const PIECE_BY_ID=Object.fromEntries(PIECES.map(p=>[p.id,p]));
for(const p of PIECES){const g=new Geo();p.build(g);p.geo={p:new Float32Array(g.p),n:new Float32Array(g.n),s:g.s,uv:new Float32Array(g.uv),t:g.t,w:g.w}}

/* =========================================================
   Camera math
   ========================================================= */
function camBasis(c){
  const ce=Math.cos(c.el),se=Math.sin(c.el);const back=[ce*Math.sin(c.az),se,ce*Math.cos(c.az)];
  const fwd=V.mul(back,-1),right=V.norm(V.cross(fwd,[0,1,0])),up=V.cross(right,fwd);return {back,fwd,right,up};
}
function viewProj(c,aspect){
  const {back,fwd,right,up}=camBasis(c);const D=80;const eye=V.add(c.target,V.mul(back,D));
  const h=c.zoom,w=h*aspect,n=1,f=D*2+40;
  const vm=[right[0],up[0],-fwd[0],0, right[1],up[1],-fwd[1],0, right[2],up[2],-fwd[2],0, -V.dot(right,eye),-V.dot(up,eye),V.dot(fwd,eye),1];
  const pm=[1/w,0,0,0, 0,1/h,0,0, 0,0,-2/(f-n),0, 0,0,-(f+n)/(f-n),1];
  return {m:mat4mul(pm,vm),eye,fwd,right,up,back,w,h};
}
function mat4mul(a,b){const o=new Array(16);for(let i=0;i<4;i++)for(let j=0;j<4;j++){let s=0;for(let k=0;k<4;k++)s+=a[k*4+j]*b[i*4+k];o[i*4+j]=s}return o}
function lightFor(c){const {right,back}=camBasis(c);return V.norm(V.add(V.add(V.mul(right,-.55),[0,1,0]),V.mul([back[0],0,back[2]],.4)))}

/* =========================================================
   WebGL renderer
   ========================================================= */
const VS=`attribute vec3 aPos;attribute vec3 aNrm;attribute vec3 aCol;attribute vec2 aUV;attribute float aFade;
uniform mat4 uVP;uniform vec3 uPivot;uniform float uScale;
varying vec3 vPos;varying vec3 vN;varying vec3 vCol;varying vec2 vUV;varying float vFade;
void main(){vec3 p=(aPos-uPivot)*uScale+uPivot;vPos=p;vN=aNrm;vCol=aCol;vUV=aUV;vFade=aFade;gl_Position=uVP*vec4(p,1.0);}`;
const FS=`precision mediump float;
varying vec3 vPos;varying vec3 vN;varying vec3 vCol;varying vec2 vUV;varying float vFade;
uniform vec3 uL;uniform vec3 uFog;uniform float uFogStart;uniform float uFogRange;uniform float uMist;
uniform float uAlpha;uniform vec3 uTint;uniform float uTintAmt;uniform float uWater;uniform float uTime;uniform float uTop;
uniform sampler2D uTex;uniform float uUseTex;uniform float uFlat;uniform float uCut;uniform vec2 uScroll;uniform float uMode;uniform vec3 uG0;uniform vec3 uG1;uniform vec2 uGy;uniform vec3 uGdir;uniform vec3 uGc;uniform vec3 uM1;uniform vec3 uM2;uniform vec3 uLn;
void main(){
  vec3 n=normalize(vN);
  vec3 base=vCol;
  if(uUseTex>0.5){vec4 t=texture2D(uTex,vUV+uScroll);
    if(uMode>0.5){float k;if(uMode<1.5)k=(dot(vPos,uGdir)-uGy.x)/(uGy.y-uGy.x);else k=distance(vPos.xz,uGc.xz)/uGy.y;k=clamp(k,0.0,1.0);k=k*k*(3.0-2.0*k);
      vec3 bg=mix(uG0,uG1,k);base=mix(bg,uM1,t.r);base=mix(base,uM2,t.g);base=mix(base,uLn,t.b);}
    else if(uCut>0.5){if(t.a<0.5)discard;base=t.rgb;}
    else base=mix(vCol*t.rgb*1.12,t.rgb,t.a);}
  float d=max(dot(n,uL),0.0);
  float s=uFlat>0.5?1.0:0.6+0.4*d;
  vec3 c=base*s;
  c=mix(c,c*0.78+uFog*0.22,(1.0-s)*1.15);
  if(uFlat<0.5)c*=mix(0.96,1.03,clamp((vPos.y-uFogStart)/max(uTop,1.0),0.0,1.0));
  float a=uAlpha;
  if(uWater>0.5){
    float vert=1.0-abs(n.y);
    float st=smoothstep(0.9,1.0,fract(vPos.y*1.5-uTime*1.1+sin(vPos.x*3.1+vPos.z*2.7)*0.5));
    float rip=smoothstep(0.93,1.0,sin(vPos.x*3.3+uTime*0.9+sin(vPos.z*2.1))*sin(vPos.z*2.9-uTime*0.7)*0.5+0.5);
    c+=vec3(1.0)*(st*vert*0.22+rip*(1.0-vert)*0.12);
    a*=mix(0.62,0.8,vert);
  }
  float f=clamp((uFogStart-vPos.y)/uFogRange,0.0,1.0);f=f*f*(3.0-2.0*f)*uMist;
  c=mix(c,uFog,f);
  c=mix(c,uFog,vFade);
  c=mix(c,uTint,uTintAmt);
  gl_FragColor=vec4(c,a);
}`;
const LVS=`attribute vec3 aPos;uniform mat4 uVP;void main(){gl_Position=uVP*vec4(aPos,1.0);}`;
const LFS=`precision mediump float;uniform vec4 uC;void main(){gl_FragColor=uC;}`;

class Renderer{
  constructor(canvas,opts={}){
    const gl=canvas.getContext('webgl',{antialias:true,alpha:true,premultipliedAlpha:false,preserveDrawingBuffer:!!opts.preserve});
    if(!gl)throw new Error('WebGL unavailable');
    this.gl=gl;this.canvas=canvas;this.aniso=gl.getExtension('EXT_texture_filter_anisotropic')||gl.getExtension('WEBKIT_EXT_texture_filter_anisotropic');
    const mk=(vs,fs)=>{const p=gl.createProgram();for(const [t,src] of [[gl.VERTEX_SHADER,vs],[gl.FRAGMENT_SHADER,fs]]){const s=gl.createShader(t);gl.shaderSource(s,src);gl.compileShader(s);
      if(!gl.getShaderParameter(s,gl.COMPILE_STATUS))throw new Error(gl.getShaderInfoLog(s));gl.attachShader(p,s)}gl.linkProgram(p);
      if(!gl.getProgramParameter(p,gl.LINK_STATUS))throw new Error(gl.getProgramInfoLog(p));
      const u={},a={};const nu=gl.getProgramParameter(p,gl.ACTIVE_UNIFORMS);for(let i=0;i<nu;i++){const n=gl.getActiveUniform(p,i).name;u[n]=gl.getUniformLocation(p,n)}
      const na=gl.getProgramParameter(p,gl.ACTIVE_ATTRIBUTES);for(let i=0;i<na;i++){const n=gl.getActiveAttrib(p,i).name;a[n]=gl.getAttribLocation(p,n)}
      return {p,u,a}};
    this.lit=mk(VS,FS);this.line=mk(LVS,LFS);this.meshes={};this.groups={};this.tex={};
    gl.enable(gl.DEPTH_TEST);gl.enable(gl.BLEND);gl.blendFunc(gl.SRC_ALPHA,gl.ONE_MINUS_SRC_ALPHA);
  }
  addTexture(id,data){
    const gl=this.gl,t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,TS,TS,0,gl.RGBA,gl.UNSIGNED_BYTE,data);gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.MIRRORED_REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.MIRRORED_REPEAT);
    gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
    if(this.aniso)gl.texParameterf(gl.TEXTURE_2D,this.aniso.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(8,gl.getParameter(this.aniso.MAX_TEXTURE_MAX_ANISOTROPY_EXT)));
    this.tex[id]=t;
  }
  setMesh(name,data){
    const gl=this.gl;let m=this.meshes[name];if(!m)m=this.meshes[name]={b:{}};
    for(const k of ['pos','nrm','col','uv','fd']){if(!data[k])continue;if(!m.b[k])m.b[k]=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,m.b[k]);gl.bufferData(gl.ARRAY_BUFFER,data[k],gl.DYNAMIC_DRAW)}
    m.count=data.pos.length/3;
  }
  setGroups(name,groups){
    const old=this.groups[name]||[];for(const k of old)if(!groups[k])this.meshes[name+'|'+k].count=0;
    for(const k in groups)this.setMesh(name+'|'+k,groups[k]);this.groups[name]=Object.keys(groups);
  }
  begin(w,h){const gl=this.gl;gl.viewport(0,0,w,h);gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT)}
  drawGroups(name,vp,U,o={}){for(const k of this.groups[name]||[])this.drawLit(name+'|'+k,k,vp,U,o)}
  drawLit(mesh,texKey,vp,U,o){
    const gl=this.gl,m=this.meshes[mesh];if(!m||!m.count)return;const P=this.lit;gl.useProgram(P.p);
    for(const [k,att,n] of [['pos','aPos',3],['nrm','aNrm',3],['col','aCol',3],['uv','aUV',2],['fd','aFade',1]]){gl.bindBuffer(gl.ARRAY_BUFFER,m.b[k]);gl.enableVertexAttribArray(P.a[att]);gl.vertexAttribPointer(P.a[att],n,gl.FLOAT,false,0,0)}
    const tex=texKey&&texKey!=='-'?this.tex[texKey]:null;
    gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,tex||null);gl.uniform1i(P.u.uTex,0);gl.uniform1f(P.u.uUseTex,tex?1:0);
    gl.uniformMatrix4fv(P.u.uVP,false,vp);gl.uniform3fv(P.u.uL,U.L);gl.uniform3fv(P.u.uFog,U.fog);
    gl.uniform1f(P.u.uFogStart,U.fogStart);gl.uniform1f(P.u.uFogRange,U.fogRange);gl.uniform1f(P.u.uMist,U.mist);gl.uniform1f(P.u.uTop,U.top);
    gl.uniform1f(P.u.uTime,U.time);gl.uniform1f(P.u.uAlpha,o.alpha??1);gl.uniform3fv(P.u.uTint,o.tint||[0,0,0]);gl.uniform1f(P.u.uTintAmt,o.tintAmt||0);
    gl.uniform1f(P.u.uWater,o.water?1:0);{const u=P.u,S=o.style;gl.uniform1f(u.uFlat??null,o.flat?1:0);gl.uniform1f(u.uCut??null,o.cut?1:0);gl.uniform2fv(u.uScroll??null,o.scroll||[0,0]);
      gl.uniform1f(u.uMode??null,S?S.mode:0);if(S){gl.uniform3fv(u.uG0??null,S.g0);gl.uniform3fv(u.uG1??null,S.g1);gl.uniform2fv(u.uGy??null,S.gy);gl.uniform3fv(u.uGdir??null,S.gdir);gl.uniform3fv(u.uGc??null,S.gc);gl.uniform3fv(u.uM1??null,S.m1);gl.uniform3fv(u.uM2??null,S.m2);gl.uniform3fv(u.uLn??null,S.ln)}}gl.uniform3fv(P.u.uPivot,o.pivot||[0,0,0]);gl.uniform1f(P.u.uScale,o.scale||1);
    gl.depthMask(o.depthWrite!==false);
    if(o.offset){gl.enable(gl.POLYGON_OFFSET_FILL);gl.polygonOffset(-1,-2)}
    gl.drawArrays(gl.TRIANGLES,0,m.count);
    gl.disable(gl.POLYGON_OFFSET_FILL);gl.depthMask(true);
  }
  drawLines(name,vp,rgba){
    const gl=this.gl,m=this.meshes[name];if(!m||!m.count)return;const P=this.line;gl.useProgram(P.p);
    for(const k of ['aNrm','aCol','aUV','aFade'])if(this.lit.a[k]>=0)gl.disableVertexAttribArray(this.lit.a[k]);
    gl.bindBuffer(gl.ARRAY_BUFFER,m.b.pos);gl.enableVertexAttribArray(P.a.aPos);gl.vertexAttribPointer(P.a.aPos,3,gl.FLOAT,false,0,0);
    gl.uniformMatrix4fv(P.u.uVP,false,vp);gl.uniform4fv(P.u.uC,rgba);gl.depthMask(false);gl.drawArrays(gl.LINES,0,m.count);gl.depthMask(true);
  }
}

/* build triangle groups (one per texture) for a list of pieces.
   pass 'solid' or 'water'; faces between touching pool cells are dropped */
const WATERY=new Set(['water','lotus']);
const FADEABLE=new Set(['block','arch','gate','window','iwan','tower','slab']);
function buildGroups(list,pal,pass,occ,fadeOcc){
  const G={};const cols=pal.c.map(hex2rgb);
  const grp=k=>G[k]||(G[k]={pos:[],nrm:[],col:[],uv:[],fd:[]});
  for(const q of list){
    const d=PIECE_BY_ID[q.t];if(!d)continue;const M=d.geo;
    let cs,sn;if(q.ang!==undefined){cs=Math.cos(q.ang);sn=Math.sin(q.ang)}else{const r=((q.r||0)%4+4)%4;cs=[1,0,-1,0][r];sn=[0,1,0,-1][r]}const sc=q.sc||1;
    const main=cols[q.c??d.slot]||cols[0];const surf=q.f||'';const fadeIt=!!(fadeOcc&&FADEABLE.has(d.id)&&!fadeOcc.has(q.x+','+(q.y-1)+','+q.z));
    for(let i=0;i<M.p.length;i+=9){
      const tri=i/3,isW=M.w[tri]===1;
      if((pass==='water')!==isW)continue;
      if(isW&&occ&&WATERY.has(d.id)){
        const nx=M.n[i]*cs+M.n[i+2]*sn,ny=M.n[i+1],nz=-M.n[i]*sn+M.n[i+2]*cs;
        const nb=occ.get((q.x+Math.round(nx))+','+(q.y+Math.round(ny))+','+(q.z+Math.round(nz)));if(nb&&WATERY.has(nb.t))continue;
      }
      let T=M.t[tri];if(T==='$')T=surf||null;const g=grp(T||'-');
      for(let v=i,vi=tri;v<i+9;v+=3,vi++){
        const lx=(M.p[v]-.5)*sc,lz=(M.p[v+2]-.5)*sc,nx=M.n[v],nz=M.n[v+2];
        g.pos.push(q.x+.5+lx*cs+lz*sn,q.y+M.p[v+1]*sc,q.z+.5-lx*sn+lz*cs);
        g.nrm.push(nx*cs+nz*sn,M.n[v+1],-nx*sn+nz*cs);
        const sl=M.s[vi],c=sl<0?main:cols[sl];g.col.push(c[0],c[1],c[2]);
        g.uv.push(M.uv[vi*2],M.uv[vi*2+1]);g.fd.push(fadeIt?Math.pow(Math.max(0,1-M.p[v+1]/.95),1.6):0);
      }
    }
  }
  for(const k in G){const g=G[k];G[k]={pos:new Float32Array(g.pos),nrm:new Float32Array(g.nrm),col:new Float32Array(g.col),uv:new Float32Array(g.uv),fd:new Float32Array(g.fd)}}
  return G;
}

