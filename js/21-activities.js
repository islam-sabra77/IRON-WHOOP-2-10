"use strict";
/* =====================================================================
   ACTIVITIES AND CARDIO CHOICES
   - Change any session's cardio: the activity, the style (easy Zone 2,
     intervals or your own pace) and the minutes, for one day or every time.
   - Add sports and activities (padel, football, yoga…) to any day, once or
     every week. They show on Train and Home, match WHOOP workouts, and
     warn when they load an injured area.
   ===================================================================== */
/* met: energy cost at a moderate effort; j: areas it loads (for injury warnings); w: words WHOOP may use for it */
const ACT_GROUPS=[['racket','Racket sports'],['team','Team sports'],['endure','Endurance'],['class','Classes and combat'],['mind','Mind and body'],['outdoor','Outdoor']];
const ACTS={
  padel:{n:'Padel',g:'racket',met:7,j:['sh','el','wr','kn','an','ac'],w:['padel']},
  tennis:{n:'Tennis',g:'racket',met:7.3,j:['sh','el','wr','kn','an','ac'],w:['tennis']},
  squash:{n:'Squash',g:'racket',met:9,j:['sh','el','wr','kn','an','ac','hm'],w:['squash']},
  badminton:{n:'Badminton',g:'racket',met:5.5,j:['sh','el','wr','an','ac'],w:['badminton']},
  pickleball:{n:'Pickleball',g:'racket',met:4.5,j:['sh','el','wr','kn'],w:['pickleball']},
  tabletennis:{n:'Table tennis',g:'racket',met:4,j:['sh','wr'],w:['table tennis','ping pong']},
  football:{n:'Football (soccer)',g:'team',met:7,j:['kn','an','hm','gr','ac','hp'],w:['soccer','football']},
  basketball:{n:'Basketball',g:'team',met:6.5,j:['kn','an','ac','ft','wr'],w:['basketball']},
  volleyball:{n:'Volleyball',g:'team',met:4,j:['sh','kn','an','wr'],w:['volleyball']},
  cricket:{n:'Cricket',g:'team',met:4.8,j:['sh','el','lb'],w:['cricket']},
  running:{n:'Running',g:'endure',met:9.8,j:['kn','an','ac','ft','hm','hp'],w:['running','run']},
  trail:{n:'Trail running',g:'endure',met:9,j:['kn','an','ac','ft','hm'],w:['trail']},
  cycling:{n:'Cycling (outdoor)',g:'endure',met:7.5,j:['kn'],w:['cycling','bike','biking']},
  spin:{n:'Spin class or indoor bike',g:'endure',met:8,j:['kn'],w:['spin','spinning','indoor cycling']},
  swimming:{n:'Swimming',g:'endure',met:6,j:['sh','nk'],w:['swim']},
  rowing:{n:'Rowing',g:'endure',met:7,j:['lb','ub'],w:['rowing','row']},
  walking:{n:'Walking',g:'endure',met:3.5,j:[],w:['walk']},
  incline:{n:'Incline treadmill walk',g:'endure',met:5,j:['ac'],w:['walk','treadmill']},
  elliptical:{n:'Elliptical',g:'endure',met:5,j:[],w:['elliptical']},
  stairs:{n:'Stair climber',g:'endure',met:8,j:['kn','ac'],w:['stair']},
  rope:{n:'Jump rope',g:'endure',met:11,j:['ac','ft','kn'],w:['jump rope','skipping']},
  hiit:{n:'HIIT class',g:'class',met:8,j:['kn','an','ac','ft','sh'],w:['hiit','functional fitness']},
  crossfit:{n:'CrossFit or functional class',g:'class',met:8,j:['sh','lb','kn','wr'],w:['crossfit','functional fitness']},
  boxing:{n:'Boxing',g:'class',met:7.8,j:['sh','wr','el','nk'],w:['boxing']},
  kickboxing:{n:'Kickboxing or Muay Thai',g:'class',met:8,j:['sh','hp','kn','an','wr'],w:['kickboxing','muay thai','martial']},
  grappling:{n:'BJJ, judo or wrestling',g:'class',met:7.5,j:['nk','sh','lb','kn','el'],w:['jiu','judo','wrestling','martial']},
  dance:{n:'Dance',g:'class',met:5.5,j:['kn','an'],w:['dance']},
  climbing:{n:'Climbing or bouldering',g:'class',met:7.5,j:['sh','el','wr','sc'],w:['climb','boulder']},
  yoga:{n:'Yoga',g:'mind',met:2.8,j:['wr'],w:['yoga']},
  pilates:{n:'Pilates',g:'mind',met:3,j:[],w:['pilates']},
  stretching:{n:'Stretching or mobility',g:'mind',met:2.3,j:[],w:['stretch','mobility']},
  hiking:{n:'Hiking',g:'outdoor',met:6,j:['kn','an','ac'],w:['hik']},
  golf:{n:'Golf (walking)',g:'outdoor',met:4.3,j:['lb','el','wr','sh'],w:['golf']},
  skiing:{n:'Skiing or snowboarding',g:'outdoor',met:6,j:['kn','an','hp'],w:['ski','snowboard']},
  surfing:{n:'Surfing or paddleboarding',g:'outdoor',met:4,j:['sh','lb'],w:['surf','paddle']},
  skating:{n:'Skating',g:'outdoor',met:6,j:['kn','an'],w:['skat']}};
const EFF={easy:['Easy',0.75],mod:['Moderate',1],hard:['Hard',1.3]};
const CARDIO_Z={z2:'Easy, Zone 2',int:'Intervals',free:'At my own pace'};
const CARDIO_ACTS=['incline','walking','cycling','spin','elliptical','rowing','running','swimming','stairs','rope','hiking','padel','tennis','squash','badminton','football','basketball','boxing','dance','hiit'];
function actName(a){return(ACTS[a]&&ACTS[a].n)||String(a||'Activity')}

/* ---------- cardio choices ---------- */
function cardioSet(){return S.cardioSet||(S.cardioSet={day:{},all:{}})}
function cardioOv(d,c){
  const cs=S.cardioSet;if(!cs)return c;const k=tplOf(d),ov=(cs.day||{})[d]||(cs.all||{})[k];if(!ov)return c;
  // cardio added to a day that has none (rest days, or a session without cardio)
  const r=Object.assign({mins:30,m:'Cardio',z:'z2',added:!c},c||{},{ov:1});
  if(ov.mins)r.mins=ov.mins;
  if(ov.z&&r.z!=='circ')r.z=ov.z;
  // low recovery still wins over hard intervals
  if(r.z==='int'&&(readyOf(d)==='y'||readyOf(d)==='r'))r.z='z2';
  if(ov.a)r.m=actName(ov.a)+(r.z==='int'?', intervals':r.z==='z2'?', Zone 2':'');
  r.a=ov.a||null;return r}
function cardioSheet(){
  const d=UI.date,k=tplOf(d);if(!k)return;const cd=cardioFor(d)||{mins:30,z:'z2'},none=!cardioBase(d),cs=cardioSet(),cur=(cs.day||{})[d]||(cs.all||{})[k]||{};
  UI.cdraft=UI.cdraft&&UI.cdraft.d===d?UI.cdraft:{d,a:cur.a||(none?'incline':''),z:cur.z||(cd.z==='circ'?'free':cd.z),mins:cur.mins||cd.mins,scope:(cs.day||{})[d]||none?'day':'all'};const q=UI.cdraft;
  openSheet(`<h4 class="disp">${none?'Add cardio':'Change cardio'}</h4><p class="muted" style="font-size:14px;margin:0 0 8px">${esc(T[k].n)} · ${nice(d)}. Pick what you'd rather do; IRON keeps the time and effort sensible.</p>
  <label class="fl2">Activity</label><div class="actgrid">${CARDIO_ACTS.map(a=>`<button class="actchip ${q.a===a?'on':''}" data-a="cdset" data-f="a" data-v="${a}" aria-pressed="${q.a===a}">${esc(ACTS[a].n)}</button>`).join('')}</div>
  <label class="fl2">Style</label><div class="obrow">${Object.keys(CARDIO_Z).map(z=>`<button class="obopt ${q.z===z?'on':''}" data-a="cdset" data-f="z" data-v="${z}"><b>${CARDIO_Z[z]}</b></button>`).join('')}</div>
  <label class="fl2">Minutes</label><div class="pcrow"><button class="mini big" data-a="cdmin" data-v="-5" aria-label="5 minutes less">−</button><b class="disp num" style="font-size:34px;min-width:90px;text-align:center">${q.mins}′</b><button class="mini big" data-a="cdmin" data-v="5" aria-label="5 minutes more">＋</button></div>
  <label class="fl2">Apply to</label><div class="obrow"><button class="obopt ${q.scope==='day'?'on':''}" data-a="cdset" data-f="scope" data-v="day"><b>This day only</b></button><button class="obopt ${q.scope==='all'?'on':''}" data-a="cdset" data-f="scope" data-v="all"><b>Every ${esc(T[k].n)}</b></button></div>
  <button class="cta" style="--c:var(--cardio)" data-a="cdsave">Save cardio</button>${cur.a||cur.z||cur.mins?(none?'<button class="cta ghost" data-a="cdreset">Remove this cardio</button>':'<button class="cta ghost" data-a="cdreset">Back to the plan’s cardio</button>'):''}<button class="cta ghost" data-a="close">Cancel</button>`)}

/* ---------- activities ---------- */
function actsFor(d){
  const one=((S.acts||{})[d]||[]).map(x=>Object.assign({},x,{rep:0}));
  const dw=dow(d),skip=(S.actSkip||{})[d]||{},dn=(S.actDone||{})[d]||{};
  const rep=(S.actRep||[]).filter(r=>r.dow===dw&&r.from<=d&&(!r.to||r.to>=d)&&!skip[r.id]).map(r=>({id:r.id,a:r.a,mins:r.mins,eff:r.eff,note:r.note||'',done:!!dn[r.id],rep:1}));
  return one.concat(rep)}
function actKcal(x){const w=lastVal('weight',todayS());const kg=w?+w.v:75;return Math.round(((ACTS[x.a]&&ACTS[x.a].met)||5)*(EFF[x.eff]||EFF.mod)[1]*kg*x.mins/60)}
function actWhoop(d,x){if(!S.whoop||!S.whoop.connected||typeof wkList!=='function')return null;const words=(ACTS[x.a]&&ACTS[x.a].w)||[x.a];return wkList(d,d).find(w=>words.some(k=>String(w.sport||'').toLowerCase().replace(/[-_]/g,' ').includes(k)))||null}
function actRisk(d,x){const set=injOn(d),j=((ACTS[x.a]&&ACTS[x.a].j)||[]).find(q=>set.has(q));return j?INJ_SHORT[j]:''}
function actCards(d){
  const L=actsFor(d);let h=`<div class="sec"><div class="sechead" style="--c:var(--travel)"><span class="sq">+</span><h3 class="disp">Activities</h3><span class="cnt num">${L.filter(x=>x.done).length}/${L.length}</span></div></div>`;
  h+=L.map(x=>{const wk=actWhoop(d,x),risk=actRisk(d,x);return`<div class="actcard ${x.done?'done':''}">
    <div class="acthead"><div><b>${esc(actName(x.a))}</b><span class="muted">${x.mins} min · ${EFF[x.eff]?EFF[x.eff][0]:'Moderate'} · about ${actKcal(x)} kcal${x.rep?' · every '+DN[dow(d)]:''}</span>${x.note?`<span class="muted">${esc(x.note)}</span>`:''}</div>
    <button class="tick ${x.done?'on':''}" data-a="actdone" data-k="${x.id}" aria-label="Mark ${esc(actName(x.a))} done">${IC.check}</button></div>
    ${wk?`<button class="note wkchip" data-a="wkopen" data-v="${wk.id}"><b>WHOOP:</b> strain ${wk.strain!=null?wk.strain.toFixed(1):'–'}, avg ${wk.ahr||'–'} bpm, ${typeof wkMins==='function'?wkMins(wk):''} min ›</button>`:''}
    ${risk?`<p class="actwarn">Loads your ${esc(risk)}. Go easy, or skip it until it's healed.</p>`:''}
    <div class="row2"><button class="mini" data-a="actedit" data-k="${x.id}">Edit</button>${x.rep?`<button class="mini" data-a="actskip" data-k="${x.id}">Skip this week</button><button class="mini" data-a="actstop" data-k="${x.id}">Stop repeating</button>`:`<button class="mini" data-a="actdel" data-k="${x.id}">Remove</button>`}</div></div>`}).join('');
  h+=`<button class="cta ghost actadd" data-a="actnew">${IC.plus} Add an activity${L.length?'':', like padel, football or yoga'}</button>`;
  return h}
function actSheet(id){
  const d=UI.date,L=actsFor(d),x=id?L.find(q=>q.id===id):null;
  UI.adraft=UI.adraft&&UI.adraft.d===d&&UI.adraft.id===(id||'')?UI.adraft:{d,id:id||'',a:x?x.a:'',mins:x?x.mins:60,eff:x?x.eff:'mod',note:x?x.note:'',rep:x?!!x.rep:false,q:''};const q=UI.adraft;
  const all=Object.keys(ACTS),hit=k=>!q.q||ACTS[k].n.toLowerCase().includes(q.q.toLowerCase());
  const groups=ACT_GROUPS.map(([g,l])=>{const ks=all.filter(k=>ACTS[k].g===g&&hit(k));return ks.length?`<h5 class="srh">${l}</h5><div class="actgrid">${ks.map(k=>`<button class="actchip ${q.a===k?'on':''}" data-a="adset" data-f="a" data-v="${k}" aria-pressed="${q.a===k}">${esc(ACTS[k].n)}</button>`).join('')}</div>`:''}).join('');
  const custom=q.q&&!all.some(k=>ACTS[k].n.toLowerCase()===q.q.toLowerCase())?`<button class="actchip ${q.a==='c:'+q.q?'on':''}" data-a="adset" data-f="a" data-v="c:${esc(q.q)}">Add “${esc(q.q)}”</button>`:'';
  openSheet(`<h4 class="disp">${id?'Edit activity':'Add an activity'}</h4><p class="muted" style="font-size:14px;margin:0 0 8px">${nice(d)}. Sports and classes sit alongside your plan and count toward your week.</p>
  <input type="search" id="actq" data-in="actq" placeholder="Search, or type your own" value="${esc(q.q)}" autocomplete="off" aria-label="Search activities"><div id="actlist">${custom}${groups||'<p class="muted">No match. Tap Add above to use your own name.</p>'}</div>
  <label class="fl2">Minutes</label><div class="pcrow"><button class="mini big" data-a="admin" data-v="-15" aria-label="15 minutes less">−</button><b class="disp num" style="font-size:34px;min-width:90px;text-align:center">${q.mins}′</b><button class="mini big" data-a="admin" data-v="15" aria-label="15 minutes more">＋</button></div>
  <label class="fl2">Effort</label><div class="obrow">${Object.keys(EFF).map(e=>`<button class="obopt ${q.eff===e?'on':''}" data-a="adset" data-f="eff" data-v="${e}"><b>${EFF[e][0]}</b></button>`).join('')}</div>
  ${id?'':`<label class="fl2">Repeat</label><div class="obrow"><button class="obopt ${!q.rep?'on':''}" data-a="adset" data-f="rep" data-v="0"><b>Just this day</b></button><button class="obopt ${q.rep?'on':''}" data-a="adset" data-f="rep" data-v="1"><b>Every ${DN[dow(d)]}</b></button></div>`}
  <label class="fl2">Note</label><input type="text" id="actnote" maxlength="120" placeholder="Optional, e.g. doubles with Omar" value="${esc(q.note)}" aria-label="Note">
  <button class="cta" style="--c:var(--travel)" data-a="adsave">${id?'Save':'Add activity'}</button><button class="cta ghost" data-a="close">Cancel</button>`)}
function actSave(){
  const q=UI.adraft;if(!q||!q.a){toast('Pick an activity first');return}
  const n=document.getElementById('actnote');q.note=n?n.value.trim():q.note;
  let a=q.a;if(a.startsWith('c:')){const name=a.slice(2).trim().slice(0,40);const key='u_'+name.toLowerCase().replace(/[^a-z0-9]+/g,'_');S.actCustom=S.actCustom||{};S.actCustom[key]={n:name};actCustomLoad();a=key}
  const d=q.d,rec={a,mins:q.mins,eff:q.eff,note:q.note};
  if(q.id){const one=((S.acts||{})[d]||[]).find(x=>x.id===q.id);if(one)Object.assign(one,rec);else{const r=(S.actRep||[]).find(x=>x.id===q.id);if(r)Object.assign(r,rec)}}
  else if(q.rep){S.actRep=S.actRep||[];S.actRep.push(Object.assign({id:'r'+Date.now().toString(36),dow:dow(d),from:d,to:''},rec))}
  else{S.acts=S.acts||{};(S.acts[d]=S.acts[d]||[]).push(Object.assign({id:'a'+Date.now().toString(36),done:d<todayS()},rec))}
  UI.adraft=null;save();closeSheet();rerender();toast(`${actName(a)} ${q.id?'updated':q.rep?'added every '+DN[dow(d)]:'added'}`)}
function actCustomLoad(){Object.keys(S.actCustom||{}).forEach(k=>{if(!ACTS[k])ACTS[k]={n:S.actCustom[k].n,g:'outdoor',met:5,j:[],w:[S.actCustom[k].n.toLowerCase()]}})}
actCustomLoad();
document.addEventListener('input',ev=>{const el=ev.target;if(el.dataset&&el.dataset.in==='actq'&&UI.adraft){UI.adraft.q=el.value;const n=document.getElementById('actnote');if(n)UI.adraft.note=n.value;const pos=el.selectionStart;actSheet(UI.adraft.id);const i=document.getElementById('actq');if(i){i.focus();try{i.setSelectionRange(pos,pos)}catch(e){}}}});
document.addEventListener('click',ev=>{const el=ev.target.closest('[data-a]');if(!el)return;const a=el.dataset.a,d=UI.date,k=el.dataset.k;
  if(a==='cdopen'){UI.cdraft=null;cardioSheet()}
  if(a==='cdset'&&UI.cdraft){UI.cdraft[el.dataset.f]=el.dataset.v;cardioSheet()}
  if(a==='cdmin'&&UI.cdraft){UI.cdraft.mins=Math.max(5,Math.min(180,UI.cdraft.mins+ +el.dataset.v));cardioSheet()}
  if(a==='cdsave'&&UI.cdraft){const q=UI.cdraft,cs=cardioSet(),rec={a:q.a||'',z:q.z,mins:q.mins};if(q.scope==='day'){cs.day[q.d]=rec}else{cs.all[tplOf(q.d)]=rec;delete cs.day[q.d]}UI.cdraft=null;save();closeSheet();rerender();toast('Cardio updated')}
  if(a==='cdreset'&&UI.cdraft){const cs=cardioSet();delete cs.day[UI.cdraft.d];if(UI.cdraft.scope==='all')delete cs.all[tplOf(UI.cdraft.d)];UI.cdraft=null;save();closeSheet();rerender();toast('Back to the plan’s cardio')}
  if(a==='actnew'){UI.adraft=null;actSheet('')}
  if(a==='actedit'){UI.adraft=null;actSheet(k)}
  if(a==='adset'&&UI.adraft){const f=el.dataset.f,n=document.getElementById('actnote');if(n)UI.adraft.note=n.value;UI.adraft[f]=f==='rep'?el.dataset.v==='1':el.dataset.v;actSheet(UI.adraft.id)}
  if(a==='admin'&&UI.adraft){const n=document.getElementById('actnote');if(n)UI.adraft.note=n.value;UI.adraft.mins=Math.max(15,Math.min(300,UI.adraft.mins+ +el.dataset.v));actSheet(UI.adraft.id)}
  if(a==='adsave')actSave();
  if(a==='actdone'){const one=((S.acts||{})[d]||[]).find(x=>x.id===k);if(one)one.done=!one.done;else{S.actDone=S.actDone||{};const m=S.actDone[d]=S.actDone[d]||{};if(m[k])delete m[k];else m[k]=1}save();rerender()}
  if(a==='actdel'){const l=(S.acts||{})[d]||[],i=l.findIndex(x=>x.id===k);if(i>=0){const rem=l.splice(i,1)[0];save();rerender();toast('Removed '+actName(rem.a),()=>{l.splice(i,0,rem)})}}
  if(a==='actskip'){S.actSkip=S.actSkip||{};(S.actSkip[d]=S.actSkip[d]||{})[k]=1;save();rerender();toast('Skipped this week',()=>{delete S.actSkip[d][k]})}
  if(a==='actstop'){const r=(S.actRep||[]).find(x=>x.id===k);if(r){r.to=addD(d,-1);if(r.to<r.from)S.actRep=S.actRep.filter(x=>x!==r);save();rerender();toast(actName(r.a)+' no longer repeats')}}
});

/* ---------- ADD MOVES: any exercise, to any day or every session of that kind ---------- */
const MV_GROUPS=[['chest','Chest',['hpush','fly']],['back','Back',['hpull','vpull','rear','shrug']],['shoulders','Shoulders',['vpush','lat','cuff']],['arms','Arms',['tri','bi']],['legs','Legs',['squat','lunge','quad','hinge','ham','glute','calf','tib','abd','add']],['core','Core and carries',['coreAE','coreFlex','coreAR','coreLat','carry']],['cardio','Cardio and power',['cardio','power']],['mob','Mobility and stretches',[]]];
function mvGroup(id){const m=META[id];if(!m)return'mob';const g=MV_GROUPS.find(x=>x[2].includes(m.pat));return g?g[0]:'mob'}
function addSet(){return S.addMoves||(S.addMoves={day:{},all:{},skip:{}})}
function addedMoves(d){const a=S.addMoves;if(!a)return[];const k=tplOf(d),sk=(a.skip||{})[d]||[];
  return[...new Set([...((a.all||{})[k]||[]),...((a.day||{})[d]||[])])].filter(id=>E[id]&&!sk.includes(id))}
function addMoveSheet(){
  const d=UI.date,k=tplOf(d);if(!k)return;UI.mvd=UI.mvd&&UI.mvd.d===d?UI.mvd:{d,q:'',g:'',pick:'',scope:'day'};const q=UI.mvd,set=injOn(d),have=new Set(blocksFor(d).flatMap(b=>b.items.map(it=>it.ex)));
  const words=q.q.toLowerCase().split(/\s+/).filter(Boolean);
  let ids=Object.keys(E).filter(id=>id!=='rampUp'&&(!q.g||mvGroup(id)===q.g)&&words.every(w=>(E[id].n+' '+mvGroup(id)).toLowerCase().includes(w)));
  ids.sort((a,b)=>(YT[b]?1:0)-(YT[a]?1:0)||E[a].n.localeCompare(E[b].n));const more=ids.length>60;ids=ids.slice(0,60);
  openSheet(`<h4 class="disp">Add a move</h4><p class="muted" style="font-size:14px;margin:0 0 8px">${esc(T[k].n)} · ${nice(d)}. Added moves get sets and reps that follow your cycle, and log like any other.</p>
  <input type="search" id="mvq" data-in="mvq" placeholder="Search ${Object.keys(E).length} exercises, e.g. curl" value="${esc(q.q)}" autocomplete="off" aria-label="Search exercises">
  <div class="actgrid">${[['','All']].concat(MV_GROUPS.map(g=>[g[0],g[1]])).map(([g,l])=>`<button class="actchip ${q.g===g?'on':''}" data-a="mvgrp" data-v="${g}">${l}</button>`).join('')}</div>
  <div class="mvlist">${ids.map(id=>{const j=injHit(id,set),m=typeof musclesOf==='function'&&musclesOf(id);return`<button class="mvrow ${q.pick===id?'on':''}" data-a="mvpick" data-v="${id}" aria-pressed="${q.pick===id}"><span><b>${esc(E[id].n)}</b><small>${m?m.p.map(x=>MUSC_NAME[x]).join(', '):esc(MV_GROUPS.find(g=>g[0]===mvGroup(id))[1])}${have.has(id)?' · already in this day':''}${j?' · loads your '+INJ_SHORT[j]:''}</small></span><i>${q.pick===id?IC.check:'+'}</i></button>`}).join('')||'<p class="muted">No match. Try a shorter word.</p>'}${more?'<p class="muted" style="font-size:13px">Showing 60. Search to narrow down.</p>':''}</div>
  <label class="fl2">Add to</label><div class="obrow"><button class="obopt ${q.scope==='day'?'on':''}" data-a="mvscope" data-v="day"><b>This day only</b></button><button class="obopt ${q.scope==='all'?'on':''}" data-a="mvscope" data-v="all"><b>Every ${esc(T[k].n)}</b></button></div>
  <button class="cta" style="--c:var(--upper)" data-a="mvadd" ${q.pick?'':'disabled'}>${q.pick?'Add '+esc(E[q.pick].n):'Pick a move'}</button><button class="cta ghost" data-a="close">Cancel</button>`)}
function moveRemove(d,id){const a=addSet(),k=tplOf(d),inDay=((a.day[d]||[]).includes(id)),inAll=((a.all[k]||[]).includes(id));
  if(inDay&&!inAll){a.day[d]=a.day[d].filter(x=>x!==id);save();rerender();toast('Removed '+E[id].n);return}
  openSheet(`<h4 class="disp">Remove ${esc(E[id].n)}?</h4><p class="muted" style="font-size:14px">You added it to every ${esc(T[k].n)}.</p><button class="cta ghost" data-a="mvdel1" data-v="${id}">Remove today only</button><button class="cta" style="--c:var(--bad)" data-a="mvdelall" data-v="${id}">Remove from every ${esc(T[k].n)}</button><button class="cta ghost" data-a="close">Keep it</button>`)}
/* the bar at the top of every day: add a move, change or add cardio, add an activity */
function dayTools(d){const has=!!cardioFor(d);return`<div class="daytools" aria-label="Customize this day"><span>Customize this day</span><div><button class="dtbtn" data-a="mvopen">${IC.plus} Add a move</button><button class="dtbtn" data-a="cdopen">${has?IC.swap+' Change cardio':IC.plus+' Add cardio'}</button><button class="dtbtn" data-a="actnew">${IC.plus} Add an activity</button></div></div>`}
document.addEventListener('input',ev=>{const el=ev.target;if(el.dataset&&el.dataset.in==='mvq'&&UI.mvd){UI.mvd.q=el.value;const pos=el.selectionStart;addMoveSheet();const i=document.getElementById('mvq');if(i){i.focus();try{i.setSelectionRange(pos,pos)}catch(e){}}}});
document.addEventListener('click',ev=>{const el=ev.target.closest('[data-a]');if(!el)return;const a=el.dataset.a,d=UI.date;
  if(a==='mvopen'){UI.mvd=null;addMoveSheet()}
  if(a==='mvgrp'&&UI.mvd){UI.mvd.g=el.dataset.v;addMoveSheet()}
  if(a==='mvpick'&&UI.mvd){UI.mvd.pick=UI.mvd.pick===el.dataset.v?'':el.dataset.v;addMoveSheet()}
  if(a==='mvscope'&&UI.mvd){UI.mvd.scope=el.dataset.v;addMoveSheet()}
  if(a==='mvadd'&&UI.mvd&&UI.mvd.pick){const q=UI.mvd,s=addSet(),k=tplOf(q.d),id=q.pick;
    if(q.scope==='all'){(s.all[k]=s.all[k]||[]).includes(id)||s.all[k].push(id)}else{(s.day[q.d]=s.day[q.d]||[]).includes(id)||s.day[q.d].push(id)}
    if(s.skip[q.d])s.skip[q.d]=s.skip[q.d].filter(x=>x!==id);
    UI.mvd=null;save();closeSheet();rerender();toast(E[id].n+' added'+(q.scope==='all'?' to every '+T[k].n:''));
    setTimeout(()=>{const c=document.querySelector('[data-k^="sa-"]');c&&c.scrollIntoView({behavior:'smooth',block:'center'})},80)}
  if(a==='mvdel')moveRemove(d,el.dataset.v);
  if(a==='mvdel1'){const s=addSet();s.day[d]=(s.day[d]||[]).filter(x=>x!==el.dataset.v);(s.skip[d]=s.skip[d]||[]).push(el.dataset.v);save();closeSheet();rerender();toast('Removed for today')}
  if(a==='mvdelall'){const s=addSet(),k=tplOf(d);s.all[k]=(s.all[k]||[]).filter(x=>x!==el.dataset.v);s.day[d]=(s.day[d]||[]).filter(x=>x!==el.dataset.v);save();closeSheet();rerender();toast('Removed from every '+T[k].n)}
});

/* ---------- UPDATES: a Home Screen app can stay open for days, so pick up new versions on return ---------- */
(function(){if(!('serviceWorker' in navigator))return;const had=!!navigator.serviceWorker.controller;let pending=false;
  const reload=()=>{if(typeof TM!=='undefined'&&TM){pending=true;return}const sh=document.getElementById('sheet');if(sh&&!sh.classList.contains('hide')){pending=true;return}location.reload()};
  navigator.serviceWorker.addEventListener('controllerchange',()=>{if(had)reload()});
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState!=='visible')return;if(pending){pending=false;reload();return}navigator.serviceWorker.getRegistration().then(r=>r&&r.update()).catch(()=>{})})})();
