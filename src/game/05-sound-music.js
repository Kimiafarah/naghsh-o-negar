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
   Music: a drone, then a musician joins with each shard
   (tar, then daf, then ney), in a different dastgah per chapter
   ========================================================= */
const MODES=[[0,150,300,500,700,800,1000,1200],[0,150,400,500,700,800,1000,1200],[0,200,400,500,700,900,1100,1200],[0,150,350,500,650,850,1000,1200],
  [0,150,400,500,650,900,1100,1200],[0,200,300,500,700,850,1000,1200],[0,200,400,500,700,900,1050,1200]];
const MEL=[[0,2],[1,1],[2,1],[1,2],[0,2],[2,1],[3,1],[4,2],[3,1],[2,1],[1,2],[0,4],[4,2],[5,1],[4,1],[3,2],[2,1],[1,1],[2,2],[1,1],[0,1],[0,4]];
const NEY=[4,5,4,3,2,1,2,0];
const OST=[0,4,7,4,2,4,6,4],SHIM=[7,9,11,9,8,10,12,10],CMEL=MEL.map(m=>m[0]);
const MUS={on:false,li:-1,step:0,next:0,mel:0,melLeft:0,ney:0,deg:[],drone:null,timer:null,shimmer:0,coinN:0};
let noiseBuf=null;
function musFreq(d){const m=MUS.deg;const o=Math.floor(d/7);return 146.83*Math.pow(2,(m[((d%7)+7)%7]/1200)+o)}
function musPluck(f,t,vol,dur){if(!ac)return;const g=ac.createGain(),lp=ac.createBiquadFilter();lp.type='lowpass';lp.frequency.setValueAtTime(f*7,t);lp.frequency.exponentialRampToValueAtTime(f*1.4,t+dur);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.004);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
  for(const [type,det,amp] of [['triangle',0,1],['sawtooth',5,.3]]){const o=ac.createOscillator(),og=ac.createGain();o.type=type;o.frequency.value=f;o.detune.value=det;og.gain.value=amp;o.connect(og).connect(lp);o.start(t);o.stop(t+dur+.05)}
  lp.connect(g).connect(MUS.out)}
function noise(){if(!noiseBuf){noiseBuf=ac.createBuffer(1,ac.sampleRate,ac.sampleRate);const d=noiseBuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1}const s=ac.createBufferSource();s.buffer=noiseBuf;return s}
function dum(t,vol=.32){const o=ac.createOscillator(),g=ac.createGain();o.frequency.setValueAtTime(110,t);o.frequency.exponentialRampToValueAtTime(58,t+.18);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+.35);o.connect(g).connect(MUS.out);o.start(t);o.stop(t+.4)}
function tek(t,j,vol){const n=noise(),f=ac.createBiquadFilter(),g=ac.createGain();f.type='bandpass';f.frequency.value=j?6500:2400;f.Q.value=j?3:1;g.gain.setValueAtTime(vol??(j?.06:.12),t);g.gain.exponentialRampToValueAtTime(.001,t+(j?.3:.09));n.connect(f).connect(g).connect(MUS.out);n.start(t,Math.random()*.5);n.stop(t+.35)}
function neyTone(f,t,dur){const o=ac.createOscillator(),o2=ac.createOscillator(),lfo=ac.createOscillator(),lg=ac.createGain(),g=ac.createGain();o.type='sine';o2.type='triangle';o.frequency.value=f;o2.frequency.value=f*2;
  lfo.frequency.value=5.2;lg.gain.value=f*.006;lfo.connect(lg);lg.connect(o.frequency);lg.connect(o2.frequency);const g2=ac.createGain();g2.gain.value=.18;o2.connect(g2).connect(g);o.connect(g);
  const n=noise(),nf=ac.createBiquadFilter();nf.type='bandpass';nf.frequency.value=f*2;nf.Q.value=4;const ng=ac.createGain();ng.gain.value=.25;n.connect(nf).connect(ng).connect(g);
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(.075,t+.25);g.gain.setValueAtTime(.075,t+dur-.4);g.gain.linearRampToValueAtTime(0,t+dur);g.connect(MUS.out);
  for(const x of [o,o2,lfo])x.start(t),x.stop(t+dur+.05);n.start(t,Math.random()*.3);n.stop(t+dur)}
function santur(f,t,vol){if(!MUS.out)return;musPluck(f,t,vol,1.3);musPluck(f*2,t+.004,vol*.18,.5)}
function qTime(div=2){const now=ac.currentTime+.02;if(!MUS.on)return now;const b=.3/div;let t=MUS.next;while(t-b>=now)t-=b;while(t<now)t+=b;return t}
function coinNote(){if(!ac||!MUS.out)return coinSound();const t=qTime(),d=CMEL[MUS.coinN++%CMEL.length]+7;santur(musFreq(d),t,.075);santur(musFreq(d+7),t+.15,.022)}
function runNotes(ds,gap=.06,vol=.06){if(!ac||!MUS.out)return chord(ds,gap,vol);const t=qTime(4);ds.forEach((d,i)=>santur(musFreq(d+7),t+i*gap,vol*(1-i/ds.length*.4)))}
function birdChirp(t,vol=.028){if(!MUS.out)return;for(const k of [0,.11]){const o=ac.createOscillator(),g=ac.createGain();o.type='sine';o.frequency.setValueAtTime(2300+Math.random()*500,t+k);o.frequency.exponentialRampToValueAtTime(3600,t+k+.07);
  g.gain.setValueAtTime(0,t+k);g.gain.linearRampToValueAtTime(vol,t+k+.01);g.gain.exponentialRampToValueAtTime(.0001,t+k+.09);o.connect(g).connect(MUS.out);o.start(t+k);o.stop(t+k+.1)}}
function musicStart(li){
  li=Math.max(0,li);if(!ac)return;if(MUS.on&&MUS.li===li)return;MUS.li=li;MUS.deg=MODES[li%MODES.length];SHUR=[0,1,2,3,4,5,6,7].map(d=>musFreq(d+7));
  if(!MUS.out){MUS.out=ac.createGain();MUS.out.connect(ac.destination)}
  MUS.out.gain.setValueAtTime(muted?0:.9,ac.currentTime);
  if(MUS.drone)for(const o of MUS.drone)try{o.stop()}catch(e){}
  MUS.drone=[];const dg=ac.createGain();dg.gain.value=.022;dg.connect(MUS.out);
  for(const f of [musFreq(0)/2,musFreq(4)/2]){const o=ac.createOscillator();o.type='sine';o.frequency.value=f;o.connect(dg);o.start();MUS.drone.push(o)}
  MUS.step=0;MUS.mel=0;MUS.melLeft=0;MUS.ney=0;MUS.next=ac.currentTime+.2;MUS.on=true;
  if(!MUS.timer)MUS.timer=setInterval(musicTick,90);
}
function musicTick(){
  if(!MUS.on||!ac)return;const beat=.3,menu=G.mode==='menu'||G.mode==='card',layers=menu?0:G.shardsGot;
  if(MUS.next<ac.currentTime-.05)MUS.next=ac.currentTime+.05; // the tab slept, or audio was just allowed
  const pulse=!menu&&layers<2&&G.levelGold>=3,danger=!menu&&G.danger&&G.mode==='play',birds=!menu&&G.crowdT&&G.crowdT[2]!==undefined;
  while(MUS.next<ac.currentTime+.35){const t=MUS.next,s=MUS.step;
    // the santur hums from the very first second (title screen included); it steps back once the tar arrives
    if(layers===0){if(s%2===0)santur(musFreq(OST[(s/2|0)%8]),t,menu?.028:.034)}else if(s%4===0)santur(musFreq(OST[(s/4|0)%8]),t,.018);
    if(menu&&s%32===8){neyTone(musFreq(NEY[MUS.ney%NEY.length]+7)/2,t,beat*12);MUS.ney++}
    if(pulse){if(s%8===0)dum(t,.15);else if(s%8===4)tek(t,false,.045)}            // a little gold wakes the tombak
    if(danger){tek(t,true,.028);if(s%2===0)dum(t,.08)}                            // near a guard: the heartbeat quickens
    if(t<MUS.shimmer){const k=Math.min(1,(MUS.shimmer-t)/8);santur(musFreq(SHIM[s%8]+7),t,.008+.026*k)} // a gift vase rings bells
    if(birds&&(s%24===12||s%24===15))birdChirp(t);
    if(layers>=1){if(MUS.melLeft<=0){const [d,l]=MEL[MUS.mel%MEL.length];MUS.mel++;MUS.melLeft=l;MUS.cur=d;
        if(l>=2){for(let k=0;k<l*2;k++)musPluck(musFreq(d),t+k*beat/2,.045,.3)}else musPluck(musFreq(d),t,.08,.9)}
      MUS.melLeft--}
    if(layers>=2){const p=['D','','T','T','D','','T','j'][s%8];if(p==='D')dum(t);else if(p==='T')tek(t,false);else if(p==='j')tek(t,true)}
    if(layers>=3&&s%16===0){neyTone(musFreq(NEY[MUS.ney%NEY.length]+7)/2,t,beat*10);MUS.ney++}
    MUS.next+=beat;MUS.step++}
}

