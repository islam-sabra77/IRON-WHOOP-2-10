"use strict";
/* ---------- WHY: every change from the standard plan, with the numbers behind it ----------
   rx() records a short code for each change it makes to sets or reps in reserve (it.rx.adj).
   This file turns those codes, plus exercise swaps, into plain reasons:
   one card at the top of the session, one line on each changed exercise, and a full breakdown on tap. */
const WHY_LVL={g:'Green',y:'Yellow',r:'Red'};
const whyCap=s=>s?s.charAt(0).toUpperCase()+s.slice(1):s;
/* where the day's color came from: your own choice, the readiness check, or WHOOP */
function readyWhy(d){
  const lv=readyOf(d);if(!lv)return null;
  if(S.ready[d]){
    const rc=(S.rcheck||{})[d];
    if(rc&&rc.lvl===S.ready[d]){const w=readinessScore(d,rc.sore,rc.energy).why;return`your readiness check scored ${rc.score} (soreness ${rc.sore}/5, energy ${rc.energy}/5${w.length?': '+w.join(', '):''})`}
    return`you set this day to ${WHY_LVL[lv]}`}
  const w=whoopDay(d);if(!w)return null;
  return'WHOOP r'+w.why.join(', ').slice(1)}
/* the weekly WHOOP review text is "Last week: signals. What changes." */
function weekWhyParts(wi){const i=wi.why.indexOf('. ');return i<0?{why:wi.why,fx:''}:{why:wi.why.slice(0,i+1),fx:wi.why.slice(i+2)}}
/* one reason per code: delta (what changed), title, and the why */
function whyAdj(code,d){
  const ph=phaseOf(d),wi=weekInt(d),rw=readyWhy(d),ex=extAt(d);
  switch(code){
    case'ms':return{dl:'+1 set',t:`Week ${ph.cw} of the cycle`,s:'planned progression',why:'Main lifts get one extra set in the heavier weeks of each cycle. This is planned progression, not a reaction to your data.'};
    case'ext+':return{dl:'+1 set',t:'Plan extension: more volume',s:'strong attendance and progress',why:'When you extended the plan, your attendance and lift progress were strong, so arm work got one extra set.'};
    case'ext-':return{dl:'−1 set',t:'Plan extension: trimmed',s:'shorter sessions',why:'When you extended the plan, attendance was low, so accessories lost a set to keep sessions short and easier to show up for.'};
    case'cyc+':return{dl:'+1 set',t:'Cycle review',s:'strong last cycle',why:ph.dec?ph.dec.why:''};
    case'cyc-':return{dl:'−1 set',t:'Cycle review',s:'recovery or attendance last cycle',why:ph.dec?ph.dec.why:''};
    case'wk+':return{dl:'+1 set',t:'WHOOP week: push',s:wi&&wi.avg!=null?`recovery averaged ${Math.round(wi.avg)}% last week`:'strong last week',why:wi?weekWhyParts(wi).why:''};
    case'wk-':return{dl:'−1 set',t:'WHOOP week: ease off',s:wi&&wi.avg!=null?`recovery averaged ${Math.round(wi.avg)}% last week`:'hard last week',why:wi?weekWhyParts(wi).why:''};
    case'wkr':return{dl:'+1 rep in reserve',t:'WHOOP week: ease off',s:wi&&wi.avg!=null?`recovery averaged ${Math.round(wi.avg)}% last week`:'hard last week',why:wi?weekWhyParts(wi).why:''};
    case'dl':return{dl:'2 sets',t:'Deload week',s:'planned recovery week',why:'The last week of every cycle drops to 2 sets at about 15% lighter loads, leaving 4 reps in reserve. Fatigue clears and the next cycle starts fresh.'};
    case'y-':return{dl:'−1 set',t:'Yellow day',s:rw||'lighter day',why:(rw?whyCap(rw)+'. ':'')+'On a Yellow day accessories, arms and prehab lose one set. Main lifts keep all of theirs.'};
    case'yr':return{dl:'RIR 2',t:'Yellow day',s:rw||'lighter day',why:(rw?whyCap(rw)+'. ':'')+'On a Yellow day main lifts stop at 2 reps in reserve instead of pushing closer to the limit.'};
  }
  return null}
/* reasons for one exercise: changes to sets and RIR first, then why this move is here */
function whyItem(d,it){
  const out=[],seen={};
  ((it.rx&&it.rx.adj)||[]).forEach(c=>{const a=whyAdj(c,d);if(!a)return;const p=seen[a.t];if(p){p.dl+=', '+a.dl;return}seen[a.t]=a;out.push(a)});
  if(it.orig&&it.orig!==it.base&&it.ex===it.base)out.push({move:1,dl:'New move',t:`Cycle ${phaseOf(d).c+1} rotation`,s:`replaces ${E[it.orig].n} this cycle`,why:`${E[it.orig].n} rotates to ${E[it.base].n} this cycle for a fresh stimulus. Every other cycle, accessories and arm moves switch to a sister exercise. Main lifts stay, so strength keeps building.`});
  const iw=typeof injWhy==='function'?injWhy(d,it):'';
  if(iw)out.push({move:1,inj:1,dl:'Swapped',t:'Injury protection',s:iw,why:iw+'. Mark the injury healed in Settings and your normal move comes back from that day.'});
  else if(it.ex!==it.base)out.push({move:1,user:1,dl:'Your swap',t:'You replaced this move',s:'',why:`You replaced ${E[it.base].n} ${S.swaps[d]&&S.swaps[d][it.slot]?'for this session':'in every session'}. Tap Undo on the card to bring it back.`});
  return out}
/* the line on the exercise card. Injury and manual swaps already have their own notes there. */
function whyLine(d,it){
  const all=whyItem(d,it),a=all.filter(x=>!x.inj&&!x.user);if(!a.length)return'';
  const f=a[0];
  return`<button class="whyline" data-a="why" data-k="${it.slot}"><b>${esc(f.dl)}</b><span>${esc(f.t)}${f.s?': '+esc(f.s):''}${a.length>1?` <em>+${a.length-1} more</em>`:''}</span><u>Why ›</u></button>`}
function whyFind(d,slot){for(const b of blocksFor(d))for(const it of b.items)if(it.slot===slot)return it;return coreFor(d).find(it=>it.slot===slot)||null}
function whySheet(d,slot){
  const it=whyFind(d,slot);if(!it)return;
  const e=E[it.ex],ph=phaseOf(d),a=whyItem(d,it),isCore=it.role==='coreR'||it.role==='coreT',sug=e.bw||e.t?null:suggest(it,d);
  const rxTxt=(n,rir)=>`${n} × ${repTxt(it)}`+(isCore?'':` · RIR ${rir}`);
  const row=x=>`<div class="whyrow"><span class="pill" style="--c:${x.move?'var(--warn)':'var(--upper)'}">${esc(x.dl)}</span><div><b>${esc(x.t)}</b><p>${esc(x.why)}</p></div></div>`;
  openSheet(`<h4 class="disp">Why this today</h4><p class="muted" style="margin:-4px 0 10px">${esc(e.n)}</p>
  <div class="whybox"><span>Standard for ${esc(SCH[ph.s].name.toLowerCase())}, week ${ph.cw}</span><b class="num">${rxTxt(it.rx.base,it.rx.rir0)}</b></div>
  ${a.length?a.map(row).join(''):'<p class="muted" style="font-size:14px">Nothing was adjusted. This is the standard plan for this week.</p>'}
  <div class="whybox on"><span>Today</span><b class="num">${rxTxt(it.rx.sets,it.rx.rir)}</b></div>
  ${sug?`<div class="whyrow"><span class="pill" style="--c:var(--ok)">${sug.w} kg</span><div><b>Suggested weight</b><p>${esc(sug.why)}. Last time (${short(sug.lp.d)}): ${sug.lp.sets.map(s=>s.w+'×'+s.r).join(', ')}.</p></div></div>`:''}
  <p class="muted" style="font-size:13px;margin:10px 0">You stay in charge: change the day's color at the top of the session, or add and remove sets on the card.</p>
  <button class="cta ghost" data-a="close">Close</button>`)}
/* everything that differs from the standard plan for the whole session */
function dayWhy(d){
  const k=tplOf(d),t=k&&T[k];if(!t)return[];
  const out=[],r=readyOf(d),rw=readyWhy(d),ph=phaseOf(d),lift=!!t.blocks,hiit=!!(t.cardio&&t.cardio.z==='int');
  if(lift&&r==='r')out.push({c:'var(--bad)',t:'Red day: recovery only',fx:'Lifting is off today. Do the mobility, core and an easy 30-minute Zone 2. Come back tomorrow fresh.',why:rw});
  else if(lift&&r==='y')out.push({c:'var(--warn)',t:'Yellow day: lighter session',fx:`One set fewer on accessories and arms, main lifts stop at 2 reps in reserve${hiit?', and intervals become Zone 2':''}.`,why:rw});
  else if(!lift&&hiit&&(r==='r'||r==='y'))out.push({c:r==='r'?'var(--bad)':'var(--warn)',t:`${WHY_LVL[r]} day: easy cardio`,fx:'Intervals become Zone 2 today.',why:rw});
  if(r!=='r'){
    const wi=weekInt(d);
    if(wi&&wi.lvl!=='normal'&&!ph.deload&&(lift||(hiit&&wi.lvl==='ease'))){const p=weekWhyParts(wi);out.push({c:wi.lvl==='push'?'var(--ok)':'var(--bad)',t:`WHOOP week: ${wi.lvl==='push'?'push':'ease off'}`,fx:lift?p.fx:'Intervals become Zone 2 this week.',why:p.why})}
    if(lift&&!ph.deload){
      if(ph.dec&&ph.dec.vol)out.push({c:'var(--upper)',t:'Cycle review',fx:ph.dec.vol>0?'One extra set on accessories and arms this cycle.':'One set fewer on accessories and arms this cycle.',why:ph.dec.why});
      const ex=extAt(d);
      if(ex&&ex.vol>0)out.push({c:'var(--upper)',t:'Plan extension: more volume',fx:'One extra set on arm work and shorter rests on accessories.',why:'Your attendance and lift progress were strong when you extended the plan.'});
      if(ex&&ex.vol<0)out.push({c:'var(--upper)',t:'Plan extension: trimmed',fx:'One set fewer on accessories and arms, and the optional superset is left out.',why:'Attendance was low when you extended the plan, so sessions are shorter.'});
    }
    const items=[...blocksFor(d).flatMap(b=>b.items),...coreFor(d)],rot=[],inj={};
    items.forEach(it=>{
      const x=S.swapsAll[it.base]||it.base,manual=S.swaps[d]&&S.swaps[d][it.slot],j=!manual&&typeof injHit==='function'?injHit(x,injOn(d)):null;
      if(j&&x!==it.ex)(inj[j]=inj[j]||[]).push(`${E[x].n} → ${E[it.ex].n}`);
      else if(it.orig&&it.orig!==it.base&&it.ex===it.base)rot.push(`${E[it.orig].n} → ${E[it.base].n}`)});
    Object.keys(inj).forEach(j=>out.push({c:'var(--warn)',t:`Protecting your ${INJ_SHORT[j]}`,fx:inj[j].join(', ')+'.',why:`Your ${INJ_SHORT[j]} injury is active, so moves that load it are swapped for the closest safe ones. Mark it healed in Settings and they come back.`}));
    if(rot.length)out.push({c:'var(--upper)',t:`Cycle ${ph.c+1} rotation`,fx:rot.join(', ')+'.',why:'Every other cycle, accessories and arm moves switch to a sister exercise for a fresh stimulus. Main lifts stay, so strength keeps building.'});
  }
  return out}
function whyCard(d){
  const a=dayWhy(d);if(!a.length)return'';
  return`<div class="card whycard"><div class="whyhead"><h4 class="disp">Today's adjustments</h4><span class="muted">${a.length} change${a.length>1?'s':''} from the standard plan</span></div>${a.map(x=>`<div class="whyit" style="--c:${x.c}"><b>${esc(x.t)}</b><p>${esc(x.fx)}</p>${x.why?`<p class="whybc"><i>Because</i> ${esc(x.why.replace(/\.$/,''))}.</p>`:''}</div>`).join('')}</div>`}
if(typeof AR==='object')Object.assign(AR,{"Today's adjustments":'تعديلات اليوم','Why this today':'لماذا هذا اليوم','Because':'السبب','Today':'اليوم','Suggested weight':'الوزن المقترح','Why ›':'لماذا ›','Close':'إغلاق'});
