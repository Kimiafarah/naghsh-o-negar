/* =========================================================
   GAME: pieces used only in play
   ========================================================= */
function starPrism(g,cx,cy,cz,R,r,h,s){
  const pts=[];for(let i=0;i<16;i++){const a=i*Math.PI/8,rr=i%2?r:R;pts.push([cx+rr*Math.cos(a),cz+rr*Math.sin(a)])}
  for(let i=0;i<16;i++){const p=pts[i],q=pts[(i+1)%16];
    g.tri([cx,cy+h,cz],[q[0],cy+h,q[1]],[p[0],cy+h,p[1]],[0,1,0],s);
    g.triOut([p[0],cy,p[1]],[q[0],cy,q[1]],[q[0],cy+h,q[1]],[cx,cy+h/2,cz],s);g.triOut([p[0],cy,p[1]],[q[0],cy+h,q[1]],[p[0],cy+h,p[1]],[cx,cy+h/2,cz],s)}
}
const EXTRA=[
  {id:'girl',slot:5,build:g=>{g.cone(.5,.5,.15,0,.5,14,-1);g.cone(.5,.5,.156,0,.05,14,11);g.cyl(.5,.5,.066,.3,.33,12,9,true);
    g.ellip(.5,.56,.5,.064,.07,.064,10,7,1);g.ellip(.5,.59,.488,.082,.08,.08,10,6,10,false,true);g.ellip(.5,.5,.44,.07,.11,.045,8,6,10,true);
    g.ellip(.474,.565,.561,.009,.012,.006,4,3,7);g.ellip(.526,.565,.561,.009,.012,.006,4,3,7)}},
  {id:'guard',slot:2,build:g=>{g.cone(.5,.5,.17,0,.62,14,-1);g.cyl(.5,.5,.08,.36,.4,12,9,true);g.ellip(.5,.68,.5,.068,.075,.068,10,7,1);
    g.ellip(.5,.735,.5,.1,.08,.1,10,5,10,false,true);g.limb([.5,.8,.5],[.51,1.0,.5],.016,.008,5,2);
    g.limb([.69,0,.56],[.69,.92,.56],.014,.014,5,7);g.ellip(.69,.94,.56,.03,.03,.03,6,4,9);
    g.ellip(.476,.69,.565,.01,.009,.006,4,3,0);g.ellip(.524,.69,.565,.01,.009,.006,4,3,0)}},
  {id:'hoopoe',slot:11,build:g=>{g.ellip(.5,.26,.47,.085,.075,.13,10,6,-1);g.ellip(.5,.34,.6,.058,.058,.058,10,6,-1);
    g.limb([.5,.33,.65],[.5,.3,.77],.012,.004,5,7);
    for(const [a,b] of [[[.5,.38,.61],[.5,.48,.58]],[[.5,.38,.6],[.5,.46,.5]],[[.5,.38,.62],[.5,.45,.67]]]){g.limb(a,b,.02,.012,5,-1);g.ellip(b[0],b[1],b[2],.014,.014,.014,5,3,7)}
    g.ellip(.415,.28,.45,.025,.055,.11,6,4,7,true);g.ellip(.585,.28,.45,.025,.055,.11,6,4,7,true);
    g.box(.385,.27,.41,.44,.285,.43,10,{});g.box(.56,.27,.41,.615,.285,.43,10,{});g.box(.385,.27,.47,.44,.285,.49,10,{});g.box(.56,.27,.47,.615,.285,.49,10,{});
    g.limb([.5,.27,.35],[.5,.24,.24],.035,.03,5,7);
    g.limb([.47,.2,.48],[.47,0,.49],.008,.008,4,7);g.limb([.53,.2,.48],[.53,0,.49],.008,.008,4,7);
    g.ellip(.475,.355,.645,.008,.008,.006,4,3,7);g.ellip(.525,.355,.645,.008,.008,.006,4,3,7)}},
  {id:'lampitem',slot:9,build:g=>{g.ellip(.5,.12,.5,.13,.06,.09,10,5,-1);g.limb([.62,.13,.5],[.74,.17,.5],.022,.012,5,-1);g.limb([.38,.13,.5],[.32,.2,.5],.01,.01,4,-1);
    g.ellip(.66,.24,.5,.03,.06,.03,6,4,11);g.ellip(.66,.27,.5,.014,.03,.014,6,4,10)}},
  {id:'vasebits',slot:10,build:g=>{g.with({T:'porcelain',us:1.9},()=>g.lathe([[0,0],[.12,0],[.17,.06],[.2,.16],[.16,.2],[0,.2]],16,-1,2));
    for(const [x,z] of [[.22,.7],[.78,.3],[.74,.76],[.3,.24]])g.with({T:'porcelain'},()=>g.box(x-.06,0,z-.04,x+.06,.025,z+.04,-1,{}))}},
  {id:'coin',slot:9,build:g=>g.ellip(.5,.42,.5,.11,.12,.03,4,2,-1,true)},
  {id:'shardp',slot:4,build:g=>{g.ellip(.5,.5,.5,.09,.2,.09,6,2,-1,true);g.cyl(.5,.5,.094,.47,.53,6,9,false)}},
  {id:'rosette',slot:9,build:g=>{starPrism(g,.5,0,.5,.3,.17,.07,-1);g.cyl(.5,.5,.075,.07,.09,12,5,true)}},
  {id:'door',slot:9,build:g=>g.box(.21,0,.46,.79,.86,.54,-1,{top:null,side:null,pz:'lattice',nz:'lattice'})},
  {id:'beamlight',slot:9,build:g=>g.cyl(.5,.5,.3,0,7,18,-1,false)},
  {id:'liftcarpet',slot:2,build:g=>g.box(0,.8,0,1,1,1,-1,{top:'carpet',side:'arabesque'})},
  {id:'tile',slot:2,build:g=>g.quad([.06,.03,.06],[.94,.03,.06],[.94,.03,.94],[.06,.03,.94],[0,1,0],-1)},
  {id:'dot',slot:9,build:g=>g.quad([.4,.04,.4],[.6,.04,.4],[.6,.04,.6],[.4,.04,.6],[0,1,0],-1)},
];
for(const p of EXTRA){const g=new Geo();p.build(g);p.geo={p:new Float32Array(g.p),n:new Float32Array(g.n),s:g.s,uv:new Float32Array(g.uv),t:g.t,w:g.w};PIECE_BY_ID[p.id]=p}

/* =========================================================
   Look: saffron sky, palettes from the painting, crisp tiles
   ========================================================= */
const SKY=['#f0a52c','#fbdb8e'],FOG='#f6c35e';
const BASEC=['#f2e4cc','#e9cfa8','#cc5a37','#e58c86','#2f9a8f','#24479e','#3f7d4a','#5b3a2b','#5bc0d8','#ffd46e','#fff6e6','#ef7d20'];
function mkPal(name,over){const c=[...BASEC];for(const k in over)c[k]=over[k];PALETTES[name]={name,bg:'saffron',sky:SKY,fog:FOG,c}}
const TIMES={day:{sky:['#f0a52c','#fbdb8e'],fog:'#f6c35e'},dusk:{sky:['#d9728c','#f7c79a'],fog:'#eba59b'},night:{sky:['#222c52','#4a5a86'],fog:'#3a4775'}};
function chPal(name,time,over={}){const c=[...BASE20];for(const k in over)c[k]=over[k];PALETTES[name]={name,bg:time,sky:TIMES[time].sky,fog:TIMES[time].fog,c}}
chPal('ch1','day');chPal('ch2','dusk',{0:'#f7e6cf'});chPal('ch3','night');chPal('ch4','day');chPal('ch5','night');chPal('ch6','dusk',{0:'#f7e6cf'});chPal('ch7','night');

const INK={lapis:'#24479e',turq:'#2f9a8f',gold:'#e6b54e',ivory:'#fff3dc',verm:'#c8492f'};
function plainDetail(g){g.fillStyle='#e4e4e4';g.fillRect(0,0,TS,TS)}
function star8(g,cx,cy,R,r,rot=-Math.PI/2){g.beginPath();for(let i=0;i<16;i++){const a=i*Math.PI/8+rot,rr=i%2?r:R;g.lineTo(cx+rr*Math.cos(a),cy+rr*Math.sin(a))}g.closePath()}
function diamond(g,cx,cy,w,h){g.beginPath();g.moveTo(cx,cy-h);g.lineTo(cx+w,cy);g.lineTo(cx,cy+h);g.lineTo(cx-w,cy);g.closePath()}
function drawTrim(g){
  plainDetail(g);const h=TS*.16;g.fillStyle=INK.lapis;g.fillRect(0,0,TS,h);g.fillStyle=INK.gold;g.fillRect(0,h-8,TS,8);
  for(let i=0;i<4;i++){const cx=(i+.5)*TS/4,cy=h*.44;g.fillStyle=INK.gold;diamond(g,cx,cy,22,16);g.fill();g.fillStyle=INK.ivory;g.beginPath();g.arc(cx,cy,5,0,7);g.fill();
    g.fillStyle=INK.turq;g.beginPath();g.arc(i*TS/4,cy,7,0,7);g.fill()}
}
function drawTile(g){
  g.fillStyle=INK.ivory;g.fillRect(0,0,TS,TS);const c=TS/2;
  for(const [x,y] of [[0,0],[TS,0],[0,TS],[TS,TS]]){star8(g,x,y,TS*.22,TS*.13);g.fillStyle=INK.lapis;g.fill()}
  star8(g,c,c,TS*.34,TS*.2);g.fillStyle=INK.turq;g.fill();g.lineWidth=10;g.strokeStyle=INK.lapis;g.stroke();
  star8(g,c,c,TS*.13,TS*.08,-Math.PI/2+Math.PI/8);g.fillStyle=INK.gold;g.fill();
  for(const [x,y] of [[c,0],[0,c],[TS,c],[c,TS]]){diamond(g,x,y,26,26);g.fillStyle=INK.verm;g.fill()}
}
function drawGirih(g){
  g.fillStyle=INK.lapis;g.fillRect(0,0,TS,TS);const c=TS/2;g.strokeStyle=INK.ivory;g.lineWidth=9;
  star8(g,c,c,TS*.3,TS*.2);g.stroke();
  for(let i=0;i<8;i++){const a=i*Math.PI/4-Math.PI/2;g.beginPath();g.moveTo(c+TS*.3*Math.cos(a),c+TS*.3*Math.sin(a));g.lineTo(c+TS*.72*Math.cos(a),c+TS*.72*Math.sin(a));g.stroke()}
  star8(g,c,c,TS*.12,TS*.08);g.fillStyle=INK.gold;g.fill();
  for(const [x,y] of [[0,0],[TS,0],[0,TS],[TS,TS]]){g.fillStyle=INK.turq;g.beginPath();g.arc(x,y,TS*.1,0,7);g.fill()}
}
function drawFrieze(g){
  g.fillStyle=INK.lapis;g.fillRect(0,0,TS,TS);g.fillStyle=INK.gold;g.fillRect(0,22,TS,12);g.fillRect(0,TS-34,TS,12);
  const c=TS/2;for(const [dx,dy] of [[-1,0],[1,0],[0,-1],[0,1]]){g.beginPath();g.arc(c+dx*46,c+dy*46,50,0,7);g.fill()}
  g.fillStyle=INK.ivory;g.beginPath();g.arc(c,c,26,0,7);g.fill();g.fillStyle=INK.verm;g.beginPath();g.arc(c,c,12,0,7);g.fill();
  for(const x of [0,TS]){diamond(g,x,c,46,70);g.fillStyle=INK.turq;g.fill()}
  g.fillStyle=INK.ivory;for(const x of [c-150,c+150]){g.beginPath();g.arc(x,c,9,0,7);g.fill()}
}
Object.assign(TEXDEFS,{
  band:{detail:plainDetail,color:drawTrim,mask:y=>y<TS*.16},
  stars:{color:drawTile},girih:{color:drawGirih},arabesque:{color:drawFrieze},
});
for(const k of ['inscr','diaper','hexclay','ashlar','brick'])delete TEXDEFS[k];
const FMAP={band:'band',inscr:'band',stars:'stars',girih:'girih',arabesque:'arabesque',hexblue:'hexblue'};
const finishOf=(t,f)=>t==='stair'?'':(FMAP[f||'']||'');

