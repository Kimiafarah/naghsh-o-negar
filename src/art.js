/* =========================================================
   Concept scenes: richer tiles, trees, characters, playful cat
   ========================================================= */
const SL={stone:0,sand:1,clay:2,rose:3,teal:4,lapis:5,leaf:6,umber:7,water:8,gold:9,ivory:10,fruit:11,pink:12,white:13,leaf2:14,skin:15,hair:16,purple:17,saffron:18,green:19};
const BASE20=['#efe0c0','#e2c99a','#c8492f','#e78d93','#2f9a8f','#24479e','#3d7a46','#5b3a2b','#7dcbe0','#e6b54e','#fff6e6','#f28a1e','#f6b3c6','#fff0f4','#73ad55','#f1d2b4','#2a1d16','#7b4fa0','#f2b233','#4f9a6a'];
const mk=(over,sky,fog,bg)=>{const c=[...BASE20];for(const k in over)c[k]=over[k];return {sky,fog,bg,c}};
const SCENE_PAL={
  night:mk({},['#222c52','#4a5a86'],'#3a4775','night'),
  day:mk({0:'#f3e3c4'},['#f0a52c','#fbdb8e'],'#f6c35e','day'),
  dusk:mk({0:'#f7e6cf'},['#d9728c','#f7c79a'],'#eba59b','dusk'),
};

/* ---------- crisp textures ---------- */
const C={lapis:'#21409a',lapis2:'#2c52b5',navy:'#1b2752',cream:'#f1e3c4',gold:'#e3b448',teal:'#1f8f88',teal2:'#2aa79d',rose:'#c4566a',rose2:'#d9788a',ivory:'#fff3dc',verm:'#c8492f',green:'#3d7a46'};
function arch(g,x,y,w,h){const r=w/2;g.beginPath();g.moveTo(x,y+h);g.lineTo(x,y+r*1.1);g.quadraticCurveTo(x,y,x+r,y-r*.15);g.quadraticCurveTo(x+w,y,x+w,y+r*1.1);g.lineTo(x+w,y+h);g.closePath()}
function sprig(g,x,y,s,col){g.fillStyle=col;for(let k=0;k<4;k++){const a=k*Math.PI/2;g.beginPath();g.ellipse(x+Math.cos(a)*s,y+Math.sin(a)*s,s*.7,s*.35,a,0,7);g.fill()}g.beginPath();g.arc(x,y,s*.45,0,7);g.fill()}
function wallTex(base,dot,frame){return g=>{
  g.fillStyle=base;g.fillRect(0,0,TS,TS);
  for(let j=0;j<5;j++)for(let i=0;i<5;i++){const x=(i+.5)*TS/5,y=(j+.5)*TS/5;sprig(g,x,y,9,dot)}
  g.fillStyle=frame;const w=TS*.46,h=TS*.66,x=(TS-w)/2,y=TS*.2;arch(g,x-16,y-16,w+32,h+16);g.fill();
  g.fillStyle=C.navy;arch(g,x,y,w,h);g.fill();
  g.save();arch(g,x,y,w,h);g.clip();g.strokeStyle=C.gold;g.lineWidth=4;
  for(let k=-6;k<12;k++){g.beginPath();g.moveTo(x+k*30,y);g.lineTo(x+k*30+h,y+h);g.stroke();g.beginPath();g.moveTo(x+k*30+h,y);g.lineTo(x+k*30,y+h);g.stroke()}g.restore();
  g.strokeStyle=frame;g.lineWidth=10;g.strokeRect(0,0,TS,TS);
}}
function floorStar(g){
  g.fillStyle=C.cream;g.fillRect(0,0,TS,TS);g.strokeStyle='#d9c59c';g.lineWidth=8;g.strokeRect(0,0,TS,TS);
  const c=TS/2;star(g,c,c,TS*.3,TS*.17);g.fillStyle=C.lapis;g.fill();star(g,c,c,TS*.16,TS*.09,Math.PI/8-Math.PI/2);g.fillStyle=C.gold;g.fill();
  g.fillStyle=C.lapis;for(const [x,y] of [[0,0],[TS,0],[0,TS],[TS,TS]]){g.beginPath();g.moveTo(x,y-50);g.lineTo(x+50,y);g.lineTo(x,y+50);g.lineTo(x-50,y);g.fill()}
}
function star(g,cx,cy,R,r,rot=-Math.PI/2){g.beginPath();for(let i=0;i<16;i++){const a=i*Math.PI/8+rot,rr=i%2?r:R;g.lineTo(cx+rr*Math.cos(a),cy+rr*Math.sin(a))}g.closePath()}
function rimTex(base){return g=>{g.fillStyle=base;g.fillRect(0,0,TS,TS);g.fillStyle=C.cream;g.fillRect(0,0,TS,40);
  for(let i=0;i<6;i++)for(let j=0;j<3;j++)sprig(g,(i+.5)*TS/6,90+j*150,11,j%2?C.gold:C.cream)}}
function domeTex(base,alt){return g=>{const n=6;for(let j=0;j<n;j++)for(let i=0;i<n;i++){g.fillStyle=(i+j)%3===0?alt:base;g.fillRect(i*TS/n,j*TS/n,TS/n,TS/n)}
  g.strokeStyle=C.cream;g.lineWidth=6;for(let k=0;k<=n;k++){g.beginPath();g.moveTo(k*TS/n,0);g.lineTo(k*TS/n,TS);g.stroke();g.beginPath();g.moveTo(0,k*TS/n);g.lineTo(TS,k*TS/n);g.stroke()}}}
function plainCream(g){g.fillStyle=C.cream;g.fillRect(0,0,TS,TS);g.strokeStyle='#dcc89f';g.lineWidth=6;g.strokeRect(0,0,TS,TS)}
Object.assign(TEXDEFS,{
  wall_lapis:{color:wallTex(C.lapis,C.gold,C.cream)},wall_teal:{color:wallTex(C.teal,C.cream,C.cream)},wall_rose:{color:wallTex(C.rose,C.cream,C.ivory)},
  floorstar:{color:floorStar},rim_lapis:{color:rimTex(C.lapis)},rim_teal:{color:rimTex(C.teal)},rim_rose:{color:rimTex(C.rose)},
  dome_lapis:{color:domeTex(C.lapis,C.lapis2)},dome_teal:{color:domeTex(C.teal,C.teal2)},stonecream:{color:plainCream},
});

/* ---------- pieces ---------- */
function prism8(g,cx,cy,cz,R,r,h,s){const pts=[];for(let i=0;i<16;i++){const a=i*Math.PI/8,rr=i%2?r:R;pts.push([cx+rr*Math.cos(a),cz+rr*Math.sin(a)])}
  for(let i=0;i<16;i++){const p=pts[i],q=pts[(i+1)%16];g.tri([cx,cy+h,cz],[q[0],cy+h,q[1]],[p[0],cy+h,p[1]],[0,1,0],s);g.tri([cx,cy,cz],[p[0],cy,p[1]],[q[0],cy,q[1]],[0,-1,0],s)}}
function head(g,x,y,z,turban=SL.ivory,feather=SL.clay){g.ellip(x,y,z,.065,.072,.065,10,7,SL.skin);g.ellip(x,y+.045,z,.085,.065,.085,10,5,turban,false,true);g.limb([x,y+.09,z],[x+.01,y+.2,z],.012,.006,5,feather)}
function seated(g,robe=-1,turban){g.ellip(.5,0,.5,.21,.15,.18,12,5,robe,false,true);g.cone(.5,.5,.1,.08,.36,10,robe);g.cyl(.5,.5,.075,.22,.25,10,SL.gold,false);head(g,.5,.42,.5,turban)}
function standing(g,robe=-1,turban){g.cone(.5,.5,.16,0,.55,14,robe);g.cyl(.5,.5,.075,.3,.33,12,SL.gold,true);head(g,.5,.6,.5,turban)}
function tree(g,o){
  const r=mulberry(o.seed||3);const top=o.h||.75;
  g.limb([.5,0,.5],[.5,top*.55,.5],.05,.035,7,SL.umber);
  const tips=[];for(let i=0;i<(o.branches||4);i++){const a=i/(o.branches||4)*Math.PI*2+r(),d=.18+r()*.12;const t=[.5+Math.cos(a)*d,top*.8+r()*.12,.5+Math.sin(a)*d];g.limb([.5,top*.5,.5],t,.025,.012,5,SL.umber);tips.push(t)}
  const N=(o.n||22)*2;for(let i=0;i<N;i++){const a=r()*Math.PI*2,d=Math.sqrt(r())*(o.w||.42)*.92,y=top*.84+(1-d/(o.w||.42))*.12+r()*.06;
    const rx=.065+r()*.05;g.ellip(.5+Math.cos(a)*d,y,.5+Math.sin(a)*d,rx,rx*.62,rx,7,4,o.leaf[i%o.leaf.length],true);
    if(o.fruit&&r()<.75)g.ellip(.5+Math.cos(a)*d+(r()-.5)*.08,y-.05,.5+Math.sin(a)*d+(r()-.5)*.08,.028,.028,.028,6,4,o.fruit)}
}
function cypress2(g){g.limb([.5,0,.5],[.5,.12,.5],.035,.03,6,SL.umber);g.lathe([[0,.08],[.1,.12],[.15,.3],[.16,.5],[.14,.72],[.1,.92],[.05,1.08],[0,1.16]],12,SL.leaf,1);
  g.lathe([[0,.2],[.12,.26],[.13,.5],[.1,.8],[.0,.98]],10,SL.leaf2,1)}
function catBody(g,o={}){ // sitting cat, faces +z
  const w=SL.ivory;g.ellip(.5,.13,.48,.1,.12,.12,10,7,w);g.ellip(.5,.3,.56,.075,.068,.07,10,7,w);
  g.cone(.46,.56,.025,.34,.41,5,w);g.cone(.54,.56,.025,.34,.41,5,w);
  g.ellip(.475,.31,.625,.011,.014,.006,4,3,SL.teal);g.ellip(.525,.31,.625,.011,.014,.006,4,3,SL.teal);g.ellip(.5,.28,.632,.009,.007,.006,4,3,SL.rose);
  g.cyl(.5,.56,.08,.22,.24,10,SL.gold,false);
}
const NEW=[
  {id:'stagecarpet',slot:2,build:g=>{g.box(.08,0,.08,.92,.04,.92,-1,{top:'carpet',side:null});for(const [x,z] of [[.08,.2],[.08,.5],[.08,.8],[.92,.2],[.92,.5],[.92,.8]])g.limb([x,.02,z],[x+(x<.5?-.06:.06),.0,z],.008,.006,4,SL.gold)}},
  {id:'wblock',slot:0,build:g=>g.box(0,0,0,1,1,1,-1,{side:'$',top:'floorstar'})},
  {id:'wblockp',slot:0,build:g=>g.box(0,0,0,1,1,1,-1,{side:'$',top:'stonecream'})},
  {id:'rimb',slot:0,build:g=>g.box(0,0,0,1,.92,1,-1,{side:'$',top:'stonecream'})},
  {id:'stair2',slot:0,build:g=>{const n=6;for(let i=0;i<n;i++)g.box(0,0,(n-1-i)/n,1,(i+1)/n,(n-i)/n,-1,{side:'stonecream',top:'stonecream'})}},
  {id:'bigdome',slot:0,build:g=>{
    g.box(.04,0,.04,.96,.06,.96,-1,{side:'$',top:'carpet'});
    for(const [x,z] of [[.09,.09],[.91,.09],[.09,.91],[.91,.91]])g.box(x-.06,.06,z-.06,x+.06,.62,z+.06,-1,{side:'$',top:null});
    for(let r=0;r<4;r++)g.sub(m=>m.arch({x0:.16,x1:.84,sy:.36,shape:'pointed',front:'$',back:'$',side:'$',soffit:'stonecream',top:null}),{rot:r,s:[.82,.56,.08],t:[0,.06,.45]});
    g.box(0,.62,0,1,.7,1,-1,{side:'stonecream',top:'stonecream'});g.cyl(.5,.5,.36,.7,.78,24,SL.stone,false);
    g.with({T:'@dome',us:2},()=>g.lathe([[.36,.78],[.38,.84],[.37,.93],[.32,1.03],[.24,1.1],[.13,1.16],[.04,1.19],[0,1.195]],28,-1,4));
    g.cone(.5,.5,.025,1.18,1.36,6,SL.gold);g.ellip(.5,1.27,.5,.035,.035,.035,8,5,SL.gold)}},
  {id:'orange2',slot:6,build:g=>tree(g,{seed:5,leaf:[SL.leaf,SL.leaf2],fruit:SL.fruit,n:26})},
  {id:'blossom2',slot:12,build:g=>tree(g,{seed:9,leaf:[SL.pink,SL.white,SL.pink],n:30,w:.46,h:.82,branches:5})},
  {id:'pomegranate',slot:6,build:g=>tree(g,{seed:13,leaf:[SL.leaf2,SL.leaf],fruit:SL.clay,n:20,w:.36,h:.65})},
  {id:'cypress2',slot:6,build:cypress2},
  {id:'pot',slot:10,build:g=>{g.with({T:'porcelain',us:2.4},()=>g.lathe([[0,0],[.08,0],[.12,.05],[.12,.13],[.09,.19],[.11,.22],[0,.22]],14,-1,2));
    const r=mulberry(4);for(let i=0;i<7;i++){const a=i*.9,t=[.5+Math.cos(a)*.1,.36+r()*.12,.5+Math.sin(a)*.1];g.limb([.5,.2,.5],t,.008,.006,4,SL.leaf);g.ellip(t[0],t[1],t[2],.035,.03,.035,6,4,[SL.pink,SL.clay,SL.white,SL.saffron][i%4],true)}}},
  {id:'giftvase',slot:10,build:g=>{g.with({T:'porcelain',us:1.9},()=>g.lathe([[0,0],[.12,0],[.17,.06],[.21,.2],[.19,.34],[.1,.44],[.075,.5],[.1,.56],[0,.56]],20,-1,2));
    g.box(.43,.5,.43,.57,.64,.57,SL.clay,{});g.box(.49,.5,.425,.51,.645,.575,SL.gold,{});g.box(.425,.5,.49,.575,.645,.51,SL.gold,{});
    g.ellip(.46,.67,.5,.03,.02,.02,6,4,SL.gold);g.ellip(.54,.67,.5,.03,.02,.02,6,4,SL.gold);prism8(g,.5,.86,.5,.09,.045,.02,SL.gold)}},
  {id:'brokenvase',slot:10,build:g=>{g.with({T:'porcelain',us:1.9},()=>g.lathe([[0,0],[.12,0],[.17,.06],[.21,.2],[.19,.27],[0,.27]],20,-1,2));
    for(const [x,z,a] of [[.25,.7,.4],[.78,.32,1.3],[.72,.74,2.2]])g.sub(m=>m.with({T:'porcelain'},()=>m.box(.4,0,.45,.6,.03,.55,-1,{})),{t:[x-.5,0,z-.5],rot:0});
    g.ellip(.5,.36,.5,.05,.05,.05,8,5,SL.gold);g.ellip(.5,.38,.5,.07,.025,.04,8,4,SL.gold);g.ellip(.5,.47,.5,.022,.04,.022,6,4,SL.saffron);g.ellip(.5,.5,.5,.012,.022,.012,6,4,SL.ivory);
    for(const [x,z] of [[.3,.4],[.66,.58],[.4,.68]])g.ellip(x,.03,z,.05,.012,.05,8,3,SL.gold)}},
  {id:'vasecat',slot:10,build:g=>{g.with({T:'porcelain',us:1.5},()=>g.lathe([[0,0],[.14,0],[.2,.08],[.25,.26],[.23,.44],[.13,.56],[.1,.62],[.13,.68],[0,.68]],22,-1,2));
    g.ellip(.5,.76,.52,.085,.075,.08,10,7,SL.ivory);g.cone(.45,.5,.03,.8,.89,5,SL.ivory);g.cone(.55,.5,.03,.8,.89,5,SL.ivory);
    g.ellip(.47,.77,.595,.016,.02,.008,4,3,SL.teal);g.ellip(.53,.77,.595,.016,.02,.008,4,3,SL.teal);g.ellip(.5,.745,.6,.01,.008,.006,4,3,SL.rose);
    g.ellip(.42,.69,.62,.035,.025,.04,6,4,SL.ivory);g.ellip(.58,.69,.62,.035,.025,.04,6,4,SL.ivory);
    g.limb([.66,.62,.45],[.82,.82,.42],.022,.015,6,SL.ivory);g.limb([.82,.82,.42],[.8,.9,.5],.015,.012,6,SL.ivory)}},
  {id:'catplay',slot:10,build:g=>{const w=SL.ivory;g.ellip(.5,.16,.5,.08,.16,.08,10,7,w);g.ellip(.5,.37,.52,.075,.068,.07,10,7,w);
    g.cone(.46,.52,.025,.41,.48,5,w);g.cone(.54,.52,.025,.41,.48,5,w);g.limb([.46,.24,.55],[.42,.5,.6],.02,.016,6,w);g.limb([.54,.24,.55],[.6,.48,.62],.02,.016,6,w);
    g.ellip(.475,.38,.585,.011,.014,.006,4,3,SL.teal);g.ellip(.525,.38,.585,.011,.014,.006,4,3,SL.teal);
    g.limb([.5,.05,.42],[.34,.12,.3],.022,.016,6,w);g.limb([.34,.12,.3],[.3,.32,.32],.016,.012,6,w);g.cyl(.5,.52,.075,.29,.31,10,SL.gold,false)}},
  {id:'butterfly',slot:3,build:g=>{const s=-1;g.tri([.5,0,.5],[.36,.06,.38],[.38,.1,.56],[0,1,0],s);g.tri([.5,0,.5],[.64,.06,.38],[.62,.1,.56],[0,1,0],s);
    g.tri([.5,0,.5],[.4,-.04,.6],[.46,.03,.66],[0,1,0],SL.saffron);g.tri([.5,0,.5],[.6,-.04,.6],[.54,.03,.66],[0,1,0],SL.saffron);g.limb([.5,-.01,.42],[.5,.01,.6],.008,.006,4,SL.hair)}},
  {id:'catsleep',slot:10,build:g=>{g.box(.25,0,.25,.75,.06,.75,SL.clay,{});g.box(.27,.06,.27,.73,.07,.73,SL.gold,{});
    g.ellip(.5,.12,.5,.17,.07,.13,12,6,SL.ivory);g.ellip(.37,.13,.6,.06,.05,.055,8,6,SL.ivory);g.cone(.33,.62,.02,.16,.22,5,SL.ivory);g.cone(.38,.66,.02,.16,.22,5,SL.ivory);
    g.limb([.64,.1,.42],[.6,.09,.66],.02,.016,6,SL.ivory);g.limb([.6,.09,.66],[.44,.08,.7],.016,.012,6,SL.ivory)}},
  {id:'cattop',slot:10,build:g=>{g.ellip(.5,.06,.5,.12,.05,.1,10,6,SL.ivory);g.ellip(.42,.08,.58,.055,.045,.05,8,6,SL.ivory);g.cone(.39,.6,.018,.1,.15,5,SL.ivory);g.cone(.44,.63,.018,.1,.15,5,SL.ivory);
    g.limb([.6,.05,.45],[.72,-.12,.5],.016,.012,6,SL.ivory)}},
  {id:'tar',slot:SL.clay,build:g=>{seated(g,-1,SL.ivory);g.ellip(.62,.22,.6,.08,.06,.035,10,6,SL.umber);g.ellip(.56,.24,.6,.05,.05,.03,8,5,SL.umber);g.limb([.58,.26,.6],[.36,.4,.62],.012,.01,5,SL.umber);g.limb([.5,.3,.6],[.62,.22,.64],.018,.016,5,-1)}},
  {id:'daf',slot:SL.lapis,build:g=>{seated(g,-1,SL.white);g.limb([.5,.36,.66],[.5,.36,.69],.13,.13,20,SL.gold);g.limb([.5,.36,.69],[.5,.36,.695],.115,.115,20,SL.ivory);g.limb([.42,.3,.56],[.42,.36,.66],.018,.016,5,-1);g.limb([.58,.3,.56],[.58,.36,.66],.018,.016,5,-1)}},
  {id:'ney',slot:SL.green,build:g=>{standing(g,-1,SL.ivory);g.limb([.5,.58,.58],[.66,.36,.66],.009,.009,5,SL.sand);g.limb([.45,.45,.55],[.55,.52,.63],.02,.016,5,-1);g.limb([.56,.4,.56],[.62,.42,.64],.02,.016,5,-1)}},
  {id:'gardener',slot:SL.green,build:g=>{standing(g,-1,SL.saffron);g.limb([.55,.42,.55],[.66,.32,.6],.022,.018,5,-1);
    g.box(.62,.18,.56,.74,.3,.68,SL.teal,{});g.limb([.74,.26,.62],[.86,.28,.66],.012,.008,5,SL.teal);for(const [x,y] of [[.89,.24],[.9,.17],[.91,.1]])g.ellip(x,y,.67,.012,.018,.012,5,3,SL.water)}},
  {id:'poet',slot:SL.purple,build:g=>{seated(g,-1,SL.ivory);g.sub(m=>{m.box(.34,.2,.6,.5,.21,.72,SL.ivory,{});m.box(.5,.2,.6,.66,.21,.72,SL.ivory,{})},{});g.limb([.42,.3,.56],[.4,.22,.64],.018,.016,5,-1);g.limb([.58,.3,.56],[.6,.22,.64],.018,.016,5,-1)}},
  {id:'guard2',slot:SL.clay,build:g=>{standing(g,-1,SL.ivory);g.limb([.69,0,.56],[.69,.92,.56],.014,.014,5,SL.umber);g.ellip(.69,.94,.56,.03,.03,.03,6,4,SL.gold)}},
  {id:'girl2',slot:SL.lapis,build:g=>{g.cone(.5,.5,.15,0,.5,14,-1);g.cone(.5,.5,.156,0,.05,14,SL.saffron);g.cyl(.5,.5,.066,.3,.33,12,SL.gold,true);
    g.ellip(.5,.56,.5,.064,.07,.064,10,7,SL.skin);g.ellip(.5,.59,.488,.082,.08,.08,10,6,SL.white,false,true);g.ellip(.5,.5,.44,.07,.11,.045,8,6,SL.white,true)}},
  {id:'lily',slot:SL.leaf2,build:g=>{for(const [x,z,r] of [[.3,.35,.12],[.66,.6,.1],[.42,.72,.08]])g.cyl(x,z,r,.8,.815,12,-1,true);g.cone(.3,.35,.06,.81,.9,7,SL.pink);g.ellip(.3,.86,.35,.025,.02,.025,6,4,SL.gold)}},
  {id:'tulips',slot:SL.stone,build:g=>{g.box(.04,0,.04,.96,.34,.96,-1,{side:'$',top:null});g.box(.08,.34,.08,.92,.36,.92,SL.umber,{});
    const r=mulberry(8);for(let i=0;i<16;i++){const x=.16+(i%4)*.22,z=.16+Math.floor(i/4)*.22,h=.55+r()*.12;g.limb([x,.35,z],[x,h,z],.008,.008,4,SL.leaf);g.ellip(x,h+.05,z,.055,.075,.055,6,4,[SL.clay,SL.pink,SL.saffron,SL.white][(i+Math.floor(i/4))%4])}}},
  {id:'birds',slot:SL.umber,build:g=>{for(const [x,y,z,s] of [[.3,0,.4,1],[.55,.12,.5,.8],[.75,.02,.35,.9],[.45,.25,.7,.7]]){g.tri([x,y,z],[x-.08*s,y+.04*s,z-.03],[x-.02,y,z+.03],[0,1,0],-1);g.tri([x,y,z],[x+.08*s,y+.04*s,z-.03],[x+.02,y,z+.03],[0,1,0],-1)}}},
  {id:'peacock',slot:SL.teal,build:g=>{for(let i=0;i<9;i++){const a=(i-4)*.32;g.tri([.5,.08,.5],[.5+Math.sin(a)*.34,.3+Math.cos(a)*.3,.42],[.5+Math.sin(a+.32)*.34,.3+Math.cos(a+.32)*.3,.42],[0,0,1],i%2?SL.teal:SL.green);g.ellip(.5+Math.sin(a+.16)*.3,.3+Math.cos(a+.16)*.26,.43,.025,.025,.01,6,3,SL.gold)}
    g.ellip(.5,.12,.5,.07,.08,.09,8,6,SL.lapis);g.limb([.5,.16,.55],[.5,.3,.6],.02,.016,5,SL.lapis);g.ellip(.5,.31,.61,.025,.025,.025,6,4,SL.lapis);g.limb([.48,0,.5],[.48,.06,.5],.006,.006,4,SL.umber);g.limb([.52,0,.5],[.52,.06,.5],.006,.006,4,SL.umber)}},
];
for(const p of NEW){const g=new Geo();p.build(g);p.geo={p:new Float32Array(g.p),n:new Float32Array(g.n),s:g.s,uv:new Float32Array(g.uv),t:g.t,w:g.w};PIECE_BY_ID[p.id]=p}


TEXDEFS['@dome']=TEXDEFS.dome_teal;
for(const k of ['wblock','wblockp','rimb'])FADEABLE.add(k);
