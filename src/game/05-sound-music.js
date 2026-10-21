/* =========================================================
   Sound: a plucked tar in Shur
   ========================================================= */
let ac=null,muted=false;let SHUR=[293.66,320.0,349.23,392.0,440.0,466.16,523.25,587.33];
function ensureAudio(){try{if(!ac)ac=new (window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended')ac.resume()}catch(e){ac=null}}
function pluck(f,delay=0,vol=.12,dur=1.1){if(!ac||muted)return;const t=ac.currentTime+delay;const g=ac.createGain(),lp=ac.createBiquadFilter();lp.type='lowpass';lp.frequency.setValueAtTime(f*6,t);lp.frequency.exponentialRampToValueAtTime(f*1.5,t+dur);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.004);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  [0,4].forEach((det,i)=>{const o=ac.createOscillator();o.type=i?'sawtooth':'triangle';o.frequency.value=f;o.detune.value=det;const og=ac.createGain();og.gain.value=i?.25:1;o.connect(og).connect(lp);o.start(t);o.stop(t+dur+.05)});lp.connect(g).connect(ac.destination)}
let stepN=0;function stepSound(){ // footsteps climb the scale as the player climbs
  if(!MUS.deg.length)return pluck(SHUR[[0,2,1,0,3,2,1,0][stepN++%8]],0,.022,.4);
  const base=Math.round((P.pos[1]-(G.bounds?G.bounds.min[1]:0))*1.5),d=Math.min(15,base+[0,2,1,2][stepN++%4]);pluck(musFreq(d),0,.026,.42)}
function chord(ns,gap=.09,vol=.1){ns.forEach((n,i)=>pluck(SHUR[n%8]*(n>7?2:1),i*gap,vol,1.6))}
function coinSound(){pluck(SHUR[7]*2,0,.05,.5);pluck(SHUR[4]*2,.06,.04,.5)}
function dissonance(){pluck(SHUR[1]/2,0,.12,1.2);pluck(SHUR[2]/2*1.06,.02,.1,1.2)}
function meow(vol=1){if(!ac||muted)return;const t=ac.currentTime,o=ac.createOscillator(),g=ac.createGain(),f=ac.createBiquadFilter();f.type='bandpass';f.frequency.value=1400;f.Q.value=2;
  o.type='sawtooth';o.frequency.setValueAtTime(620,t);o.frequency.linearRampToValueAtTime(980,t+.18);o.frequency.linearRampToValueAtTime(560,t+.5);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.05*vol,t+.05);g.gain.exponentialRampToValueAtTime(.0001,t+.55);o.connect(f).connect(g).connect(ac.destination);o.start(t);o.stop(t+.6)}

/* =========================================================
   Music: three calm voices (santur drops, glass bells, the ney)
   over a breathing drone. Each page leads with one voice from the
   first moment; every shard brings in another. No steady beat.
   ========================================================= */
/*MUSIC-BEGIN*/
const MODE={shur:[0,150,300,500,700,800,1000,1200],segah:[0,150,350,500,650,850,1000,1200],mahur:[0,200,400,500,700,900,1100,1200],
  afshari:[0,150,300,500,650,800,1000,1200],chahargah:[0,150,400,500,700,800,1100,1200]};
const SCORES=[
  {name:'Santur Garden',   mode:'shur',     lead:'drops',add:['bells','melody','ney']},   // I   day
  {name:'Ney at Dusk',     mode:'segah',    lead:'ney',  add:['drops','bells','tremolo']},// II  dusk
  {name:'Glass Bells',     mode:'mahur',    lead:'bells',add:['low','bowl','ney']},       // III night
  {name:'Santur in Mahur', mode:'mahur',    lead:'drops',add:['bells','melody','ney']},   // IV  day
  {name:'Ney and Bells',   mode:'afshari',  lead:'ney',  add:['bells','drops','melody']}, // V   dusk
  {name:'Santur and Bells',mode:'chahargah',lead:'drops',add:['bells','ney','tremolo']},  // VI  day
  {name:'Moon Bells',      mode:'segah',    lead:'bells',add:['bowl','low','ney']},       // VII night
  {name:'Santur Garden',   mode:'shur',     lead:'drops',add:['bells','melody','ney']},   // lesson
];
const MEL=[[0,2],[1,1],[2,1],[1,2],[0,2],[2,1],[3,1],[4,2],[3,1],[2,1],[1,2],[0,4],[4,2],[5,1],[4,1],[3,2],[2,1],[1,1],[2,2],[1,1],[0,1],[0,4]];
const NEYPH=[[4,3],[5,1.5],[4,1.5],[3,3],[2,2],[1,1],[2,4],[4,2.5],[6,1.5],[5,1.5],[4,4]],BELLAR=[0,2,4,7,4,2,9,7],DROPS=[0,2,4,7,9,11];
const BEAT=.3;
const mfq=(deg,d)=>{const o=Math.floor(d/7);return 146.83*Math.pow(2,deg[((d%7)+7)%7]/1200+o)};
const NBUF=new WeakMap();function nbuf(c){let b=NBUF.get(c);if(!b){b=c.createBuffer(1,c.sampleRate*2,c.sampleRate);const d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;NBUF.set(c,b)}return b}
const VOX={
  santur(c,o,f,t,v){for(const dt of [0,.035]){const g=c.createGain(),lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.setValueAtTime(f*8,t+dt);lp.frequency.exponentialRampToValueAtTime(f*1.5,t+dt+1.4);
    g.gain.setValueAtTime(0,t+dt);g.gain.linearRampToValueAtTime(v*(dt?.45:1),t+dt+.003);g.gain.exponentialRampToValueAtTime(.0001,t+dt+1.8);
    for(const [type,det,amp] of [['triangle',0,1],['sawtooth',6,.25],['triangle',-5,.6]]){const x=c.createOscillator(),og=c.createGain();x.type=type;x.frequency.value=f;x.detune.value=det;og.gain.value=amp;x.connect(og).connect(lp);x.start(t+dt);x.stop(t+dt+1.9)}lp.connect(g).connect(o)}},
  bell(c,o,f,t,v,dec=3.2){for(const [m,a,d] of [[1,1,1],[2.76,.4,.5],[5.4,.18,.3],[8.93,.08,.2]]){const x=c.createOscillator(),g=c.createGain();x.type='sine';x.frequency.value=f*m;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v*a,t+.004);g.gain.exponentialRampToValueAtTime(.0001,t+dec*d);x.connect(g).connect(o);x.start(t);x.stop(t+dec*d+.05)}},
  ney(c,o,f,t,dur,v){const g=c.createGain();g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+.35);g.gain.setValueAtTime(v,t+Math.max(.35,dur-.5));g.gain.linearRampToValueAtTime(0,t+dur);
    const x=c.createOscillator(),x2=c.createOscillator(),lfo=c.createOscillator(),lg=c.createGain();x.type='sine';x2.type='triangle';x.frequency.value=f;x2.frequency.value=f*2;
    lfo.frequency.value=4.8;lg.gain.setValueAtTime(0,t);lg.gain.linearRampToValueAtTime(f*.008,t+dur*.6);lfo.connect(lg);lg.connect(x.frequency);lg.connect(x2.frequency);const g2=c.createGain();g2.gain.value=.15;x2.connect(g2).connect(g);x.connect(g);
    const n=c.createBufferSource();n.buffer=nbuf(c);const nf=c.createBiquadFilter();nf.type='bandpass';nf.frequency.value=f*2;nf.Q.value=3;const ng=c.createGain();ng.gain.value=.35;n.connect(nf).connect(ng).connect(g);
    g.connect(o);for(const y of [x,x2,lfo])y.start(t),y.stop(t+dur+.1);n.start(t,Math.random());n.stop(t+dur)},
  bowl(c,o,f,t,v){for(const [m,a,det] of [[1,1,0],[1,.6,2.5],[2.71,.35,0],[4.9,.12,0]]){const x=c.createOscillator(),g=c.createGain();x.type='sine';x.frequency.value=f*m+det;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v*a,t+.02);g.gain.exponentialRampToValueAtTime(.0001,t+5);x.connect(g).connect(o);x.start(t);x.stop(t+5.1)}},
};
/* the drone breathes: tonic, fifth and octave, low-passed, each swelling on its own slow cycle */
function droneOn(c,o,deg){const nodes=[],lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=520;lp.Q.value=.3;lp.connect(o);
  [[mfq(deg,0)/2,.016,.071],[mfq(deg,4)/2,.010,.093],[mfq(deg,0),.008,.057],[mfq(deg,2),.004,.113]].forEach(([f,v,rate],i)=>{
    const g=c.createGain();g.gain.value=v;g.connect(lp);const lfo=c.createOscillator(),lg=c.createGain();lfo.frequency.value=rate;lg.gain.value=v*.7;lfo.connect(lg).connect(g.gain);lfo.start();nodes.push(lfo);
    for(const det of [-4,4]){const x=c.createOscillator();x.type=i?'sine':'triangle';x.frequency.value=f;x.detune.value=det;x.connect(g);x.start();nodes.push(x)}});return nodes}
/* one beat of a page's score: s = beat number, n = voices playing (the lead, plus one per shard) */
function scoreBeat(c,o,sc,st,s,t,n,quiet){
  const deg=MODE[sc.mode],f=d=>mfq(deg,d),R=Math.random,lead=v=>v===sc.lead,on=v=>lead(v)||(sc.add.indexOf(v)>=0&&sc.add.indexOf(v)<n-1),q=quiet?.6:1;
  if(on('drops')&&s>=(st.drop??0)){const L=lead('drops'),d=DROPS[R()*6|0]+(R()<.3?7:0),v=(L?.055:.03)*q;
    VOX.santur(c,o,f(d+7),t,v);VOX.santur(c,o,f(d+7),t+.46,v*.3);if(R()<.35)VOX.santur(c,o,f(d+9),t+.9,v*.55);st.drop=s+(L?5:10)+(R()*(L?7:10)|0)}
  if(on('bells')){if(lead('bells')){if(s>=(st.bell??0)){const i=st.bi=(st.bi??-1)+1,d=BELLAR[i%8]+((i>>3)%2?2:0);
        VOX.bell(c,o,f(d+14),t,.045*q,3.2);if(i%4===0)VOX.bell(c,o,f(d+7),t,.03*q,4);st.bell=s+2+(i%8===7?4:0)}}
    else if(s%7===3&&R()<.6)VOX.bell(c,o,f(BELLAR[R()*8|0]+14),t,.022*q,3)}
  if(on('ney')&&s>=(st.ney??0)){const i=st.ni=(st.ni??-1)+1;
    if(lead('ney')){const [d,l]=NEYPH[i%NEYPH.length];VOX.ney(c,o,f(d+7),t,l*1.05+.2,.06*q);st.ney=s+Math.round(l*1.1/BEAT)+(i%NEYPH.length===NEYPH.length-1?10:0)}
    else{VOX.ney(c,o,f([4,5,4,2,1,0][i%6]+7),t,3.2,.038*q);st.ney=s+24+(R()*8|0)}}
  if(on('melody')&&s>=(st.mel??0)){const i=st.mi=(st.mi??-1)+1,[d,l]=MEL[i%MEL.length];VOX.santur(c,o,f(d+7),t,.038*q);st.mel=s+l*2}
  if(on('tremolo')&&s%28===14){const d=[7,9,11,9][(s/28|0)%4];for(let k=0;k<7;k++)VOX.santur(c,o,f(d),t+k*.075,.02*q*(1-k/9))}
  if(on('low')&&s>=(st.low??0)){const i=st.lo=(st.lo??-1)+1;VOX.santur(c,o,f([0,4,2,5][i%4]),t,.045*q);st.low=s+14+(R()*8|0)}
  if(on('bowl')&&s%40===20)VOX.bowl(c,o,f([0,4][(s/40|0)%2]+7),t,.04*q);
}
/*MUSIC-END*/
const SHIM=[7,9,11,9,8,10,12,10],CMEL=MEL.map(m=>m[0]);
const MUS={on:false,li:-1,step:0,next:0,deg:MODE.shur,sc:SCORES[0],st:{},drone:null,timer:null,shimmer:0,coinN:0};
function musFreq(d){return mfq(MUS.deg,d)}
function noise(){const s=ac.createBufferSource();s.buffer=nbuf(ac);return s}
function dum(t,vol=.32){const o=ac.createOscillator(),g=ac.createGain();o.frequency.setValueAtTime(110,t);o.frequency.exponentialRampToValueAtTime(58,t+.18);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+.35);o.connect(g).connect(MUS.out);o.start(t);o.stop(t+.4)}
function santur(f,t,vol){if(!MUS.out)return;VOX.santur(ac,MUS.out,f,t,vol)}
function qTime(div=2){const now=ac.currentTime+.02;if(!MUS.on)return now;const b=BEAT/div;let t=MUS.next;while(t-b>=now)t-=b;while(t<now)t+=b;return t}
function coinNote(){if(!ac||!MUS.out)return coinSound();const t=qTime(),d=CMEL[MUS.coinN++%CMEL.length]+7;santur(musFreq(d),t,.06);VOX.bell(ac,MUS.out,musFreq(d+14),t+.15,.015,2)}
function runNotes(ds,gap=.06,vol=.06){if(!ac||!MUS.out)return chord(ds,gap,vol);const t=qTime(4);ds.forEach((d,i)=>santur(musFreq(d+7),t+i*gap,vol*(1-i/ds.length*.4)))}
function birdChirp(t,vol=.028){if(!MUS.out)return;for(const k of [0,.11]){const o=ac.createOscillator(),g=ac.createGain();o.type='sine';o.frequency.setValueAtTime(2300+Math.random()*500,t+k);o.frequency.exponentialRampToValueAtTime(3600,t+k+.07);
  g.gain.setValueAtTime(0,t+k);g.gain.linearRampToValueAtTime(vol,t+k+.01);g.gain.exponentialRampToValueAtTime(.0001,t+k+.09);o.connect(g).connect(MUS.out);o.start(t+k);o.stop(t+k+.1)}}
function musicStart(li){
  li=Math.max(0,li);if(!ac)return;if(MUS.on&&MUS.li===li)return;MUS.li=li;MUS.sc=SCORES[li%SCORES.length];MUS.deg=MODE[MUS.sc.mode];MUS.st={};SHUR=[0,1,2,3,4,5,6,7].map(d=>musFreq(d+7));
  if(!MUS.out){MUS.out=ac.createGain();MUS.out.connect(ac.destination);
    // a soft courtyard reverb so every note hangs in the air
    const len=Math.round(ac.sampleRate*3.4),ir=ac.createBuffer(2,len,ac.sampleRate);
    for(let c=0;c<2;c++){const d=ir.getChannelData(c);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,3.2)}
    const cv=ac.createConvolver();cv.buffer=ir;const wet=ac.createGain();wet.gain.value=.45;MUS.out.connect(cv).connect(wet).connect(ac.destination)}
  MUS.out.gain.setValueAtTime(muted?0:.9,ac.currentTime);
  if(MUS.drone)for(const o of MUS.drone)try{o.stop()}catch(e){}
  MUS.drone=droneOn(ac,MUS.out,MUS.deg);
  MUS.step=0;MUS.next=ac.currentTime+.2;MUS.on=true;
  if(!MUS.timer)MUS.timer=setInterval(musicTick,90);
}
function musicTick(){
  if(!MUS.on||!ac)return;const menu=G.mode==='menu'||G.mode==='card';
  if(MUS.next<ac.currentTime-.05)MUS.next=ac.currentTime+.05; // the tab slept, or audio was just allowed
  const danger=!menu&&G.danger&&G.mode==='play',birds=!menu&&G.crowdT&&G.crowdT[2]!==undefined;
  while(MUS.next<ac.currentTime+.35){const t=MUS.next,s=MUS.step;
    scoreBeat(ac,MUS.out,MUS.sc,MUS.st,s,t,menu?1:1+Math.min(3,G.shardsGot),menu);
    if(danger&&s%4===0)dum(t,.07);                                                       // near a guard: a slow, low heartbeat
    if(t<MUS.shimmer&&s%2===0){const k=Math.min(1,(MUS.shimmer-t)/8);VOX.bell(ac,MUS.out,musFreq(SHIM[(s/2|0)%8]+14),t,.008+.022*k,2.2)} // a gift vase rings bells
    if(birds&&(s%24===12||s%24===15))birdChirp(t);
    MUS.next+=BEAT;MUS.step++}
}
