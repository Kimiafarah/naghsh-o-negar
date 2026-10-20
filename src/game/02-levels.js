/* =========================================================
   The seven chapters (narrow, vertical pages)
   ========================================================= */
const K=(x,y,z)=>x+','+y+','+z;
const WALKTOP=new Set(['block','deck','gate','iwan','window','beam','tower','arch','pillar','liftcarpet']);
const PASSABLE=new Set(['carpet','floor','gate']);
const STAIR_DIR=[[0,-1],[-1,0],[0,1],[1,0]];

/* the winding stair of The Builders: two turns around a 2x2 tower */
const SPIRAL=(()=>{const ring=[[-1,-1],[0,-1],[1,-1],[2,-1],[2,0],[2,1],[2,2],[1,2],[0,2],[-1,2],[-1,1],[-1,0]];
  const dirRot=(a,b)=>{const dx=b[0]-a[0],dz=b[1]-a[1];return dz<0?0:dx<0?1:dz>0?2:3};let h=0;const out=[];
  for(let i=0;i<24;i++){const c=ring[i%12],n=ring[(i+1)%12];if(i%3===1){h++;out.push({type:'stair',x:c[0],z:c[1],h,r:dirRot(c,n)})}
    else out.push({type:'deck',x:c[0],z:c[1],h,skip:i===5||i===14||i===20})}
  return out})();

const LEVELS=[
{
  num:'I',name:'The Courtyard',palette:'ch1',wall:'wall_teal',line:'Follow {guide}.',tip:'Tap to walk.',
  build(put,fill){
    fill(1,2,-1,0,1,2,'block');fill(1,2,0,0,1,2,'block',{f:'band'});put(2,-1,2,'arch');
    put(0,0,1,'block');put(0,1,1,'stair',{r:1});
    fill(-1,-1,-1,1,0,1,'block');fill(-1,-1,1,1,0,1,'block',{f:'band'});
    put(-1,1,-1,'block');put(-1,2,-1,'stair',{r:0});
    fill(-1,0,1,2,-2,-2,'block');fill(-1,0,2,2,-2,-2,'block',{f:'band'});
    fill(-2,-2,3,4,-4,-3,'block');fill(-2,-2,4,4,-4,-3,'block',{f:'band'});
    put(-3,4,-4,'block');put(-3,5,-4,'stair',{r:1});
    fill(-4,-4,4,5,-5,-4,'block');fill(-4,-4,5,5,-5,-4,'block',{f:'band'});
    put(-4,6,-5,'gate',{r:0,f:'band'});
    put(-3,1,-2,'tower');put(-3,2,-2,'tower');put(-3,3,-2,'dome');
    put(3,0,1,'block');put(3,1,1,'guard2',{c:2,sc:1.3,ang:-.6});put(3,1.93,1,'cattop',{sc:.85,ang:.3});put(-5,4,-5,'block');put(-5,5,-5,'orange');
  },
  start:[2,1,2],cat:[1,1,2],
  coins:[[1,1,1],[2,1,1],[-1,2,0],[-1,3,-2],[-2,5,-3]],
  shards:[[-1,2,1],[-2,5,-4],[-4,6,-4]],
  gate:[-4,6,-5],gifts:[[1,1,2,'cat']],
  movers:[{piece:'block',f:'',c:4,stops:[[-1,2,-3],[-1,4,-3]],mode:'rosette',speed:1.5,wait:0}],
  rosettes:[{pos:[0,3,-2],target:['mover',0]}],
  rotators:[],fallers:[],guards:[],
},
{
  num:'II',name:'The Builders',palette:'ch2',wall:'wall_rose',fit:true,autoTurn:[1,1],line:'The tower is still being painted.',tip:'Pale stone falls.',
  build(put,fill){
    fill(0,1,0,7,0,1,'block');fill(0,1,8,8,0,1,'block',{f:'band'});
    put(0,3,1,'window',{f:'girih'});put(1,2,0,'window',{r:1,f:'girih'});put(1,6,0,'window',{r:1,f:'girih'});put(0,6,1,'arch');
    for(const st of SPIRAL)if(st.type==='deck'&&!st.skip)put(st.x,st.h,st.z,'deck',{f:'arabesque',c:1});else if(st.type==='stair')put(st.x,st.h,st.z,'stair',{r:st.r,c:1});
    put(1,1,-2,'deck',{f:'arabesque',c:1});put(3,6,1,'deck',{f:'arabesque',c:1});
    put(2,8,0,'block',{f:'band'});put(2,9,0,'gate',{r:1,f:'band'});
  },
  start:[-1,1,-1],cat:[1,2,-1],
  coins:[[2,2,-1],[2,3,2],[0,4,2],[-1,5,0],[-1,5,-1],[2,6,-1],[2,7,2],[-1,8,2],[0,9,0]],
  shards:[[1,2,-2],[3,7,1],[0,9,1]],
  gate:[2,9,0],gifts:[[-1,4,2,'coins'],[1,2,-1,'lamp']],
  movers:[{piece:'deck',f:'arabesque',c:4,stops:[[0,7,3],[0,7,2]],mode:'auto',speed:1.0,wait:2.2}],
  fallers:[[2,2,1],[1,5,-1]],rotators:[],rosettes:[],
  guards:[{type:'watch',at:[1,9,1],dirs:[[-1,0],[0,-1],[1,0],[0,1]],interval:2.4}],
},
{
  num:'III',name:'The Seven Doors',palette:'ch3',wall:'wall_lapis',line:'Each door waits for a gold star.',tip:'Tap a gold star. Stay out of the grey band.',
  build(put,fill){
    fill(0,4,0,0,2,3,'block',{f:'band'});put(0,1,2,'stair',{r:0});
    fill(0,4,0,1,0,1,'block');fill(0,4,1,1,0,1,'block',{f:'band'});for(const x of [2,3,4])put(x,1,1,'iwan');put(1,2,0,'stair',{r:0});
    fill(0,4,0,2,-2,-1,'block');fill(0,4,2,2,-2,-1,'block',{f:'band'});for(const x of [2,3,4])put(x,2,-1,'iwan');put(0,3,-2,'stair',{r:0});
    fill(0,1,0,3,-4,-3,'block');fill(0,1,3,3,-4,-3,'block',{f:'band'});put(1,3,-3,'window',{f:'girih'});put(0,4,-4,'gate',{r:0,f:'band'});
    put(4,1,2,'vase');put(1,1,2,'blossom');put(2,1,2,'carpet');put(0,2,0,'cypress');
  },
  start:[4,1,3],cat:[3,1,3],
  coins:[[2,1,3],[1,1,3],[0,1,3],[3,2,1],[4,2,1],[2,3,-1],[4,3,-1],[1,4,-3]],
  shards:[[2,2,0],[4,3,-2],[1,4,-4]],
  gate:[0,4,-4],gifts:[[3,1,2,'coins'],[2,2,1,'lamp']],
  movers:[{piece:'window',f:'girih',c:0,stops:[[0,2,1],[0,3,1]],mode:'rosette',speed:1.5,wait:0},
          {piece:'window',f:'girih',c:0,stops:[[1,3,-1],[1,4,-1]],mode:'rosette',speed:1.5,wait:0},
          {piece:'window',f:'girih',c:0,stops:[[0,4,-3],[0,5,-3]],mode:'rosette',speed:1.5,wait:0}],
  fallers:[],rotators:[],
  rosettes:[{pos:[-1,1.6,3],target:['mover',0]},{pos:[-1,2.6,0],target:['mover',1]},{pos:[-1,3.6,-2],target:['mover',2]}],
  guards:[{type:'watch',at:[4,2,0],dirs:[[-1,0],[0,1],[1,0],[0,-1]],interval:2.4},
          {type:'patrol',path:[[1,3,-2],[2,3,-2],[3,3,-2]],speed:.9}],
},
{
  num:'IV',name:'The First King',palette:'ch4',wall:'wall_lapis',line:'The stone turns for the king.',tip:'Tap the gold star.',
  build(put,fill){
    fill(1,2,-1,0,1,2,'block');fill(1,2,0,0,1,2,'block',{f:'band'});
    put(2,0,3,'block');put(2,1,3,'lotus');for(const y of [1,0,-1])put(2,y,4,'fall',{r:2});
    put(-1,-1,1,'block');put(-2,0,1,'block');
    fill(-1,-1,-1,0,-2,-1,'block');fill(0,1,-1,0,-2,-2,'block');fill(-1,-1,0,0,-2,-1,'block',{f:'band'});fill(0,1,0,0,-2,-2,'block',{f:'band'});
    put(-2,0,-2,'block');put(-2,1,-2,'stair',{r:1});
    fill(-3,-3,-1,1,-3,-2,'block');fill(-2,-2,0,1,-3,-3,'block');fill(-3,-3,1,1,-3,-2,'block',{f:'band'});put(-2,1,-3,'block',{f:'band'});
    put(-4,0,-3,'block');put(-4,1,-3,'block',{f:'band'});put(-4,2,-3,'musician',{c:9});
    fill(-2,-1,3,4,-4,-4,'block');fill(-2,-2,3,4,-5,-5,'block');fill(-2,-1,4,4,-4,-4,'block',{f:'band'});put(-2,4,-5,'block',{f:'band'});
    put(-2,5,-5,'gate',{r:0,f:'band'});
    put(-1,3,-5,'block');put(-1,4,-5,'block',{f:'band'});put(-1,5,-5,'dome');put(3,0,2,'block');put(3,1,2,'cypress');
  },
  start:[2,1,2],cat:[1,1,2],
  coins:[[1,1,2],[2,1,1],[1,1,1],[-1,1,-1],[-3,2,-3],[-2,5,-4]],
  shards:[[-1,1,1],[0,1,-2],[-1,5,-4]],
  gate:[-2,5,-5],gifts:[[-3,2,-2,'coins']],
  movers:[{piece:'liftcarpet',f:'',c:2,stops:[[-1,1,-3],[-1,4,-3]],mode:'auto',speed:1.1,wait:2.6}],
  rotators:[{pivot:[-1,0,1],arm:[[0,1]],piece:'deck',f:'arabesque',states:[1,2]}],
  rosettes:[{pos:[-2,1,1],target:['rotator',0]}],
  fallers:[],
  guards:[{type:'watch',at:[1,1,-2],dirs:[[-1,0],[0,1]],interval:2.4}],
},
{
  num:'V',name:'The Hanging Garden',palette:'ch5',wall:'wall_teal',line:'A garden above the clouds.',tip:'',
  build(put,fill){
    fill(0,2,-1,0,0,2,'block');fill(0,2,0,0,0,2,'block',{f:'band'});put(1,1,1,'kiosk');
    put(1,0,3,'block',{f:'band'});put(1,1,3,'lotus');for(const y of [1,0,-1])put(1,y,4,'fall',{r:2});
    put(3,0,1,'block',{f:'band'});put(3,1,1,'cypress');
    put(0,0,-1,'block');put(0,1,-1,'stair',{r:0});
    fill(0,1,0,1,-2,-2,'block');fill(0,1,1,1,-2,-2,'block',{f:'band'});put(1,2,-2,'pavilion');
    put(-3,0,-3,'block');put(-3,1,-3,'block',{f:'band'});
    fill(-3,-2,2,4,-5,-5,'block');fill(-2,-2,2,4,-4,-4,'block');fill(-3,-2,4,4,-5,-5,'block',{f:'band'});put(-2,4,-4,'block',{f:'band'});
    put(-3,5,-5,'gate',{r:0,f:'band'});
    put(-4,3,-6,'block');put(-4,4,-6,'block',{f:'band'});put(-4,5,-6,'orange');
  },
  start:[2,1,2],cat:[2,1,1],
  coins:[[2,1,1],[1,1,2],[1,1,0],[-2,5,-4]],
  shards:[[0,1,2],[-3,2,-3],[-2,5,-5]],
  gate:[-3,5,-5],gifts:[[0,1,1,'lamp']],
  movers:[{piece:'deck',f:'arabesque',c:4,stops:[[-1,1,-2],[-2,1,-2]],mode:'auto',speed:1.0,wait:2.2},
          {piece:'liftcarpet',f:'',c:2,stops:[[-3,1,-4],[-3,4,-4]],mode:'auto',speed:1.1,wait:2.6}],
  fallers:[[-3,1,-2]],rotators:[],rosettes:[],
  guards:[{type:'patrol',path:[[0,1,0],[1,1,0],[2,1,0]],speed:.9}],
},
{
  num:'VI',name:'The Seven Pavilions',palette:'ch6',wall:'wall_lapis',line:'Seven colours, seven days.',tip:'',
  build(put,fill){
    fill(1,2,-1,0,1,2,'block');fill(1,2,0,0,1,2,'block',{f:'band'});put(1,1,2,'pavilion',{c:10});
    put(1,0,0,'block');put(1,1,0,'stair',{r:0});
    fill(0,1,-1,1,-1,-1,'block');fill(0,1,1,1,-1,-1,'block',{f:'band'});
    put(2,1,-1,'block',{f:'band'});put(2,0,-1,'block');put(2,2,-1,'pavilion',{c:9});
    fill(-3,-3,0,1,-2,-1,'block');fill(-3,-3,1,1,-2,-1,'block',{f:'band'});
    put(-4,1,-2,'block',{f:'band'});put(-4,2,-2,'pavilion',{c:6});
    put(-3,1,-3,'block');put(-3,2,-3,'stair',{r:0});
    fill(-3,-1,1,2,-4,-4,'block');fill(-3,-1,2,2,-4,-4,'block',{f:'band'});put(-4,2,-4,'block',{f:'band'});
    put(0,2,-4,'block',{f:'band'});put(0,3,-4,'pavilion',{c:2});
    fill(-4,-4,3,4,-6,-5,'block');put(-3,3,-6,'block');fill(-4,-4,4,4,-6,-5,'block',{f:'band'});put(-3,4,-6,'block',{f:'band'});
    fill(-4,-4,3,4,-7,-7,'block');put(-4,4,-7,'block',{f:'band'});put(-4,5,-7,'gate',{r:0,f:'band'});
    put(-5,4,-5,'block',{f:'band'});put(-5,5,-5,'pavilion',{c:5});
    put(-2,4,-7,'block',{f:'band'});put(-2,5,-7,'pavilion',{c:3});
    put(-5,4,-8,'block',{f:'band'});put(-5,5,-8,'pavilion',{c:7});
  },
  start:[2,1,2],cat:[2,1,1],
  coins:[[2,1,1],[1,1,1],[1,2,-1],[-3,2,-2],[-4,5,-6]],
  shards:[[0,2,-1],[-2,3,-4],[-3,5,-6]],
  gate:[-4,5,-7],gifts:[[-3,2,-1,'cat']],
  movers:[{piece:'block',f:'',c:4,stops:[[-3,2,-5],[-3,4,-5]],mode:'rosette',speed:1.4,wait:0}],
  rosettes:[{pos:[-4,3,-4],target:['mover',0]}],
  fallers:[[-1,1,-1],[-2,1,-1]],rotators:[],
  guards:[{type:'watch',at:[-1,3,-4],dirs:[[-1,0],[0,1]],interval:2.4}],
},
{
  num:'VII',name:'The Mountain of the Birds',palette:'ch7',wall:'wall_rose',line:'The birds fly to the Simurgh.',tip:'',
  build(put,fill){
    fill(0,1,0,4,0,1,'block');fill(0,1,5,5,0,1,'block',{f:'band'});put(0,3,1,'window',{f:'girih'});put(1,2,1,'window',{f:'girih'});
    fill(3,4,0,0,4,5,'block',{f:'band'});
    fill(0,0,0,0,3,5,'block',{f:'band'});put(1,0,3,'block',{f:'band'});put(1,1,3,'stair',{r:3});
    fill(2,3,0,1,2,3,'block');fill(2,3,1,1,2,3,'block',{f:'band'});
    fill(3,4,0,4,0,1,'block');fill(3,4,4,4,0,0,'block',{f:'band'});put(3,4,1,'iwan');put(4,4,1,'iwan');
    fill(2,2,0,4,0,0,'block');put(2,4,0,'block',{f:'band'});put(2,5,0,'stair',{r:1});
    put(1,6,1,'blossom');
    for(const y of [0,-1,-2])put(3,y,4,'fall',{r:2});
  },
  start:[4,1,5],cat:[4,1,4],
  coins:[[3,1,5],[0,1,5],[0,1,3],[2,2,2],[3,2,3],[3,5,1],[1,6,0]],
  shards:[[0,1,4],[3,2,2],[0,6,0]],
  gate:[0,6,1],gifts:[[2,2,3,'lamp']],
  movers:[{piece:'liftcarpet',f:'',c:2,stops:[[2,1,1],[2,4,1]],mode:'auto',speed:1.1,wait:2.6}],
  fallers:[[2,0,5],[1,0,5]],rotators:[],rosettes:[],
  guards:[{type:'watch',at:[4,5,0],dirs:[[-1,0],[0,1]],interval:2.4}],
},
];
for(const L of LEVELS)L.fit=true;

/* The Lesson: an optional practice page, one idea per step */
const TUT={num:'',name:'Lesson',palette:'ch1',wall:'wall_teal',fit:true,line:'',tip:'',
  build(put,fill){
    fill(1,3,-1,-1,1,2,'block');fill(1,3,0,0,1,2,'block',{f:'band'});
    put(0,0,1,'block');put(0,1,1,'stair',{r:1});
    fill(-1,-1,-1,0,0,1,'block');fill(-1,-1,1,1,0,1,'block',{f:'band'});
    fill(-1,-1,-1,0,-3,-2,'block');fill(-1,-1,1,1,-3,-2,'block',{f:'band'});
    fill(-1,-1,-1,1,-4,-4,'block');put(-1,2,-4,'stair',{r:0});
    fill(-2,0,0,1,-6,-5,'block');fill(-2,0,2,2,-6,-5,'block',{f:'band'});
    put(-2,3,-6,'gate',{r:0,f:'band'});
    fill(1,1,-1,0,0,0,'block');put(1,1,0,'cypress');
    put(1,1,-6,'block');put(1,2,-6,'block',{f:'band'});put(1,3,-6,'blossom');
    put(-3,1,-3,'tower');put(-3,2,-3,'tower');put(-3,3,-3,'dome');
    put(4,0,2,'block');put(4,1,2,'orange');
  },
  start:[3,1,2],cat:[3,1,1],
  coins:[[2,1,2],[1,1,2],[1,1,1],[-1,2,1],[-1,2,-2],[-1,3,-5]],
  shards:[[-1,2,0],[-1,2,-3],[-2,3,-5]],
  gate:[-2,3,-6],gifts:[[2,1,1,'coins']],
  movers:[{piece:'block',f:'',c:4,stops:[[-1,0,-1],[-1,1,-1]],mode:'rosette',speed:1.5,wait:0}],
  rosettes:[{pos:[0,2.6,0],target:['mover',0]}],
  rotators:[],fallers:[],
  guards:[{type:'watch',at:[0,3,-6],dirs:[[-1,0],[0,1]],interval:2.6}],
};
const lvlAt=i=>i<0?TUT:LEVELS[i];
const COACH=[
  {text:'Tap a tile to walk.',at:()=>[1.5,1,2.5],done:()=>P.pos[0]<1.7||P.pos[1]>1.3},
  {text:'Open the gift vase.',at:()=>[2.5,1,1.5],done:()=>G.gifts[0].open||P.pos[1]>1.9},
  {text:'Climb the stairs.',at:()=>[-.5,2,1.5],done:()=>P.pos[1]>1.9||G.shardsGot>=1},
  {text:'Take the shard. Each one brings a musician.',at:()=>[-.5,2,.5],done:()=>G.shardsGot>=1},
  {text:'Tap the gold star.',at:()=>[.5,2.64,.5],done:()=>G.movers[0].moving||G.movers[0].idx===1||G.shardsGot>=2,shotT:1.6},
  {text:'Cross to the next shard.',at:()=>[-.5,2,-2.5],done:()=>G.shardsGot>=2},
  {text:'Guards watch the grey band. Go when they turn.',at:()=>[-1.5,3,-4.5],done:()=>G.shardsGot>=3,shotT:2.2},
  {text:'Through the gate.',at:()=>[-1.5,3,-5.5],done:()=>false},
];

