// Builds "The Hanging Garden" as a Negareh scene file.
// Camera looks from +x,+z, so tall pieces sit toward the back (low x / low z).
const P=new Map();
const SLOT={block:0,slab:1,deck:1,stair:0,arch:1,beam:0,pillar:0,tower:0,roof:2,dome:4,gate:0,iwan:0,window:0,pavilion:4,kiosk:4,carpet:2,floor:1,vase:10,
  water:8,lotus:8,fall:8,planter:1,tree:6,orange:6,blossom:10,cypress:6,figure:5,musician:2,cat:10,cloud:10};
const put=(x,y,z,t,o={})=>P.set(`${x},${y},${z}`,[x,y,z,t,o.r||0,o.c??SLOT[t],...(o.f?[o.f]:[])]);
const fill=(x0,x1,y0,y1,z0,z1,t,o)=>{for(let x=x0;x<=x1;x++)for(let y=y0;y<=y1;y++)for(let z=z0;z<=z1;z++)put(x,y,z,t,o)};
const del=(x,y,z)=>P.delete(`${x},${y},${z}`);

/* ---- floating island: stepped underside fading into the mist ---- */
fill(2,5,-1,-1,2,5,'block',{f:'ashlar'});
fill(1,6,0,1,1,6,'block',{f:'ashlar'});
fill(1,6,2,2,1,6,'block',{f:'band'});                 // top course carries the arabesque frieze
put(2,1,6,'gate',{f:'ashlar'});put(5,1,6,'gate',{f:'ashlar'});   // arcade under the terrace
put(6,1,2,'gate',{r:1,f:'ashlar'});put(6,1,4,'gate',{r:1,f:'ashlar'});

/* ---- sunken lotus pool with the fountain kiosk at its heart ---- */
for(let x=2;x<=4;x++)for(let z=3;z<=5;z++)put(x,2,z,(x+z)%2?'lotus':'water');
put(2,2,5,'block',{f:'band'});
put(3,2,4,'block',{f:'stars'});put(3,3,4,'kiosk');
put(3,2,6,'water');                                    // overflow channel to the edge
for(const y of [2,1,0,-1,-2])put(3,y,7,'fall',{r:2});

/* ---- tower of the musicians (back left) ---- */
fill(1,1,3,7,1,2,'block',{f:'ashlar'});
put(1,4,2,'window',{f:'diaper'});put(1,6,2,'window',{f:'diaper'});
put(1,5,1,'window',{r:1,f:'diaper'});
put(1,7,1,'block',{f:'inscr'});put(1,7,2,'block',{f:'inscr'});
put(1,8,1,'pavilion');put(1,8,2,'orange');

/* ---- iwan hall (back right) ---- */
fill(4,6,3,4,1,1,'block',{f:'hexclay'});
for(const x of [4,5,6]){put(x,3,2,'iwan',{f:'hexclay'});put(x,4,2,'block',{f:'band'})}
put(5,5,1,'dome');put(4,5,1,'cypress');put(6,5,1,'vase');
put(4,5,2,'blossom');put(5,5,2,'beam');

/* ---- bridge from tower to hall roof, with the wanderer crossing ---- */
for(const x of [2,3])put(x,4,1,'deck',{f:'arabesque'});
put(3,5,1,'figure');

/* ---- stair from the terrace up to the hall roof ---- */
put(2,3,6,'stair',{r:1,f:'stars'});put(2,3,5,'stair',{r:1,f:'stars'});

/* ---- raised orchard on the left ---- */
fill(1,1,3,3,4,6,'block',{f:'band'});
put(1,4,4,'planter');put(1,4,5,'orange');put(1,4,6,'blossom');

/* ---- terrace life ---- */
put(5,3,5,'musician');put(4,3,6,'carpet');put(5,3,6,'cat');put(6,3,6,'pavilion',{c:4});
put(6,3,5,'blossom');put(5,3,4,'floor');put(6,3,4,'floor');
put(2,3,2,'cypress');put(6,3,3,'cypress');put(1,3,3,'vase');put(5,3,3,'figure',{c:3});

/* ---- sky ---- */
put(-1,3,6,'cloud');put(8,5,2,'cloud');put(3,10,0,'cloud');put(8,1,7,'cloud');put(-1,8,2,'cloud');

const scene={name:'The Hanging Garden',palette:'gilded',mist:.85,pieces:[...P.values()],count:P.size,updatedAt:Date.now()};
require('fs').writeFileSync(__dirname+'/hanging-garden.json',JSON.stringify(scene));
console.log(scene.count,'pieces');
