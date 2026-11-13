"use strict";
/* ---------- top bar & tabs ---------- */
function renderTop(){
  const tb=document.getElementById('topbar');
  if(UI.tab!=='train'){tb.innerHTML=`<div class="brand"><h1 class="brandlogo"><img class="wm wm-l" src="img/logo.svg" alt="IRON"><img class="wm wm-d" src="img/logo-white.svg" alt=""></h1><span class="tbr"><button class="icbtn" data-a="search" aria-label="Search">${IC_SEARCH}</button><button class="icbtn" data-a="settings" aria-label="Settings">${IC.gear}</button></span></div>`;return}
  const sun=sunOf(UI.date),t=todayS();let chips='';
  for(let i=0;i<7;i++){const d=addD(sun,i),k=tplOf(d);const c=k?KCOLOR(T[k].k):'transparent';const done=S.done[d];
    chips+=`<button class="dchip ${d===UI.date?'sel':''} ${d===t?'today':''} ${done?'done':''} ${k?'':'off'}" style="--c:${done?'var(--ok)':c}" data-a="day" data-d="${d}" aria-label="${nice(d)}"><small>${DS[i]}</small><b class="num">${pd(d).getDate()}</b><span class="bar"></span></button>`}
  const w=inPlan(UI.date)?weekNo(UI.date):null,ph=w?phaseOf(UI.date):null;
  tb.innerHTML=`<div class="brand"><h1 class="brandlogo"><img class="wm wm-l" src="img/logo.svg" alt="IRON"><img class="wm wm-d" src="img/logo-white.svg" alt=""></h1><span class="tbr"><button class="icbtn" data-a="search" aria-label="Search">${IC_SEARCH}</button><button class="icbtn" data-a="settings" aria-label="Settings">${IC.gear}</button></span></div>
  <div class="strip"><button class="arrow" data-a="wk" data-v="-7" aria-label="Previous week">‹</button><div class="days">${chips}</div><button class="arrow" data-a="wk" data-v="7" aria-label="Next week">›</button></div>
  <div class="weeklab"><span>${w?`Week ${w} of ${totalWeeks()} · Cycle ${ph.c+1}, wk ${ph.cw}/${ph.CL}`:'Outside the plan dates'}</span>${UI.date!==t?`<button class="linkbtn" data-a="today">Jump to today</button>`:'<span></span>'}</div>`;
}
/* five tabs: everything else lives under More */
const MORE_TABS=['more','plan','build','supps','habits','travel','goals','food'];
function renderTabs(){
  const cur=MORE_TABS.includes(UI.tab)?'more':UI.tab;
  const tabs=[['home','Home',IC.home],['train','Train',IC.train],['progress','Progress',IC.prog],['whoop','Body',IC.body],['more','More',IC.more]];
  document.getElementById('tabs').innerHTML=tabs.map(t=>`<button class="tab ${cur===t[0]?'on':''}" data-a="tab" data-v="${t[0]}" ${cur===t[0]?'aria-current="page"':''}>${t[2]}<span>${t[1]}</span></button>`).join('');
}
function renderMore(){
  const t=todayS(),sl=S.suppLog[t]||{},st=S.supps.filter(s=>sl[s.id]).length,hb=S.habits||[],hd=hb.filter(x=>habDone(x.id,t)).length;
  const trip=(S.trips||[]).filter(x=>x.to>=t)[0],k=activeMap(),days=Object.values(k).filter(x=>x!=='rest').length;
  const g=(typeof goalList==='function')?goalList():[],nu=(typeof nutDay==='function')?nutDay(t):null;
  const item=(v,ic,c,title,sub)=>`<button class="mitem" style="--c:${c}" data-a="tab" data-v="${v}"><span class="mic">${ic}</span><span class="mtx"><b>${title}</b><small>${sub}</small></span><span class="lhgo">›</span></button>`;
  document.getElementById('view').innerHTML=`<h2 class="pagetitle disp">More</h2>
  <div class="mgroup">${item('goals',IC.target,'var(--upper)','Goals',g.length?g.length+' active':'Set a lift or body goal')}${item('food',IC.food,'#12B76A','Nutrition',nu?`${Math.round(nu.p)} g protein today`:'Track protein and calories')}${item('supps',IC.supp,'var(--cardio)','Supplements',S.supps.length?`${st} of ${S.supps.length} taken today`:'Build your stack')}${item('habits',IC.hab,'#7B4DFF','Habits',hb.length?`${hd} of ${hb.length} done today`:'Add a habit')}</div>
  <div class="mgroup">${item('plan',IC.plan,'var(--upper)','Plan',`${days} training days a week · ends ${short(S.end)}`)}${item('build',IC.build,'var(--lower)','Plan builder','Split, sessions, cycles, mobility')}${item('travel',IC.travel,'var(--travel)','Travel',trip?'Trip from '+short(trip.from):'No-equipment sessions for trips')}</div>
  <div class="mgroup"><button class="mitem" style="--c:#00A3FF" data-a="report"><span class="mic">${IC.chart}</span><span class="mtx"><b>Weekly report</b><small>Last week at a glance</small></span><span class="lhgo">›</span></button><button class="mitem" style="--c:var(--ink)" data-a="settings"><span class="mic">${IC.gear}</span><span class="mtx"><b>Settings</b><small>Display, workouts, WHOOP, backup</small></span><span class="lhgo">›</span></button><button class="mitem" style="--c:var(--ok)" data-a="syncopen"><span class="mic">${IC.cloud}</span><span class="mtx"><b>Cloud backup</b><small>${typeof syncOn==='function'&&syncOn()?'On':'Off'}</small></span><span class="lhgo">›</span></button><button class="mitem" style="--c:var(--cardio)" data-a="coach"><span class="mic">${IC.chart}</span><span class="mtx"><b>Share with a coach</b><small>Private read-only link</small></span><span class="lhgo">›</span></button><button class="mitem" style="--c:var(--upper)" data-a="feedback"><span class="mic">${IC.info}</span><span class="mtx"><b>Send feedback</b><small>Ideas or problems</small></span><span class="lhgo">›</span></button><button class="mitem" style="--c:var(--mu)" data-a="privacy"><span class="mic">${IC.lock||IC.info}</span><span class="mtx"><b>Privacy and your data</b><small>Download or delete</small></span><span class="lhgo">›</span></button></div>`;
}

/* =====================================================================
   HOME: one-screen summary of every tab. Every tile opens the matching data.
   ===================================================================== */
function weekVol(from){let sets=0,vol=0;for(let i=0;i<7;i++){const l=S.logs[addD(from,i)]||{};Object.keys(l).forEach(k=>{if(k[0]==='_')return;(l[k].sets||[]).forEach(s=>{if(s.d){sets++;vol+=(+s.w||0)*(+s.r||0)}})})}return{sets,vol}}
/* =====================================================================
   WORKOUT SUMMARY: image and text to save, share or attach in WHOOP
   ===================================================================== */
function setTxt(e,q){const w=q.w!==''&&q.w!=null?q.w:null,r=q.r!==''&&q.r!=null?q.r:null;if(e.t)return(r||'–')+' s'+(e.u?' each side':'');if(e.bw||!w)return(r||'–')+' reps';return w+' kg × '+(r||'–')}
function workoutData(d){
  const k=tplOf(d),t=T[k],l=S.logs[d]||{},out={d,title:t?t.n:'Workout',focus:t?t.f:'',groups:[],sets:0,vol:0,reps:0};
  const take=(it,lab)=>{const o=l[it.slot];if(!o||o.ex!==it.ex)return null;let ss=o.sets.slice(0,Math.max(it.rx.sets,o.sets.length)).filter(q=>q.d);if(!ss.length)return null;const e=E[it.ex];
    ss.forEach(q=>{out.sets++;out.reps+=e.t?0:(+q.r||0);out.vol+=(+q.w||0)*(+q.r||0)});return{lab,n:e.n,sets:ss.map(q=>setTxt(e,q))}};
  blocksFor(d).forEach(b=>{const g={h:'Superset '+b.label,items:[]};b.items.forEach((it,i)=>{const x=take(it,b.label+(b.items.length>1?i+1:''));if(x)g.items.push(x)});if(g.items.length)out.groups.push(g)});
  const c={h:'Core',items:[]};coreFor(d).forEach((it,i)=>{const x=take(it,'C'+(i+1));if(x)c.items.push(x)});if(c.items.length)out.groups.push(c);
  const mob=mobFor(d),wu=warmFor(d);out.mob=[mob.filter(m=>isChk(d,m.slot)).length,mob.length];out.wu=[wu.filter(m=>isChk(d,m.slot)).length,wu.length];
  const cd=cardioFor(d);out.cardio=cd&&isChk(d,'cardio')?{mins:cd.mins,m:cd.m,z:cd.z}:null;
  out.dur=l._t0&&S.done[d]&&S.done[d].t>l._t0&&S.done[d].t-l._t0<4*36e5?Math.round((S.done[d].t-l._t0)/6e4):null;
  out.wk=S.whoop.connected?wkForDay(d):null;out.c=t?KCOLOR(t.k):COLORS.upper;return out;
}
function workoutText(w){
  let s=`IRON workout · ${nice(w.d)}\n${w.title}${w.focus?' ('+w.focus+')':''}\n`;
  s+=[w.dur?w.dur+' min':null,w.sets+' sets',w.vol?Math.round(w.vol).toLocaleString()+' kg volume':null,w.wk&&w.wk.strain!=null?'WHOOP strain '+w.wk.strain.toFixed(1):null].filter(Boolean).join(' · ')+'\n';
  w.groups.forEach(g=>{s+=`\n${g.h}\n`;g.items.forEach(x=>{s+=`• ${x.n}: ${x.sets.join(', ')}\n`})});
  if(w.cardio)s+=`\nCardio: ${w.cardio.mins} min, ${w.cardio.m}\n`;
  if(w.mob[1])s+=`Mobility: ${w.mob[0]}/${w.mob[1]} drills`+(w.wu[1]?` · Warm-up: ${w.wu[0]}/${w.wu[1]}`:'')+'\n';
  return s;
}
function workoutCanvas(w){
  const W2=1080,P=64,cv=document.createElement('canvas'),x=cv.getContext('2d'),F='-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif';
  const lines=[];// measure pass
  const wrap=(txt,font,max)=>{x.font=font;const words=txt.split(' ');const out=[];let cur='';words.forEach(wd=>{const tr=cur?cur+' '+wd:wd;if(x.measureText(tr).width>max&&cur){out.push(cur);cur=wd}else cur=tr});if(cur)out.push(cur);return out};
  w.groups.forEach(g=>{lines.push({t:'h',s:g.h});g.items.forEach(it=>{lines.push({t:'n',s:it.lab+'  '+it.n});wrap(it.sets.map((q,i)=>(i+1)+') '+q).join('    '),'400 30px '+F,W2-2*P-40).forEach(z=>lines.push({t:'s',s:z}))})});
  if(w.cardio){lines.push({t:'h',s:'Cardio'});lines.push({t:'n',s:w.cardio.mins+' min · '+w.cardio.m})}
  if(!w.groups.length&&!w.cardio)lines.push({t:'s',s:'No sets ticked yet.'});
  const lh={h:70,n:46,s:42},bodyH=lines.reduce((a,l)=>a+lh[l.t],0),head=430,H=head+30+(w.wk?90:0)+bodyH+120;
  cv.width=W2;cv.height=H;
  x.fillStyle='#F3F5FF';x.fillRect(0,0,W2,H);
  const gr=x.createLinearGradient(0,0,W2,head);gr.addColorStop(0,w.c);gr.addColorStop(1,'#191A4A');x.fillStyle=gr;x.fillRect(0,0,W2,head-40);
  x.fillStyle='#fff';x.font='900 34px '+F;x.fillText('IRON',P,80);x.font='600 30px '+F;x.globalAlpha=.85;x.fillText(nice(w.d),P,128);x.globalAlpha=1;
  x.font='900 64px '+F;x.fillText(w.title,P,205);x.font='500 28px '+F;x.globalAlpha=.85;x.fillText((w.focus||'').slice(0,60),P,248);x.globalAlpha=1;
  const stats=[[w.dur?w.dur+' min':'–','Duration'],[String(w.sets),'Sets'],[w.vol?fvol(w.vol):'–','Volume'],[w.wk&&w.wk.strain!=null?w.wk.strain.toFixed(1):(w.reps?String(w.reps):'–'),w.wk?'WHOOP strain':'Reps']];
  const bw=(W2-2*P-3*20)/4;stats.forEach((s2,i)=>{const bx=P+i*(bw+20),by=head-145;x.fillStyle='#fff';x.beginPath();x.roundRect?x.roundRect(bx,by,bw,120,24):x.rect(bx,by,bw,120);x.fill();x.fillStyle='#191A4A';x.font='900 40px '+F;x.fillText(s2[0],bx+22,by+58);x.fillStyle='#6B7399';x.font='600 22px '+F;x.fillText(s2[1],bx+22,by+96)});
  let y=head+30;
  if(w.wk){const z=w.wk.zones||[],tot=z.reduce((a,b)=>a+b,0)||1;let zx=P;x.fillStyle='#6B7399';x.font='600 24px '+F;x.fillText(`WHOOP · avg ${w.wk.ahr||'–'} bpm · max ${w.wk.mhr||'–'} bpm · heart-rate zones`,P,y);y+=20;z.forEach((v,i)=>{const ww=(W2-2*P)*v/tot;x.fillStyle=ZONE_C[i];x.fillRect(zx,y,ww,22);zx+=ww});y+=70}
  lines.forEach(l=>{if(l.t==='h'){y+=26;x.fillStyle=w.c;x.font='800 26px '+F;x.fillText(l.s.toUpperCase(),P,y);y+=44}else if(l.t==='n'){x.fillStyle='#191A4A';x.font='800 32px '+F;x.fillText(l.s,P,y);y+=46}else{x.fillStyle='#3A4166';x.font='400 30px '+F;x.fillText(l.s,P+40,y);y+=42}});
  x.fillStyle='#6B7399';x.font='500 24px '+F;x.fillText(`Mobility ${w.mob[0]}/${w.mob[1]}${w.wu[1]?' · Warm-up '+w.wu[0]+'/'+w.wu[1]:''}`,P,H-56);
  return cv;
}
function shareSheet(d){
  const w=workoutData(d),cv=workoutCanvas(w),url=cv.toDataURL('image/png');UI.share={d,text:workoutText(w)};
  openSheet(`<h4 class="disp">Workout summary</h4><p class="muted" style="font-size:14px;margin:0 0 8px">Save the image or share it, then add it to the activity in WHOOP (or paste the text into its notes).</p>
  <img src="${url}" alt="Workout summary" style="width:100%;border-radius:16px;border:1px solid var(--ln)">
  <button class="cta" style="--c:var(--upper)" data-a="wsharego">Share image</button>
  <div class="grid2"><a class="cta ghost" style="margin-top:8px;text-decoration:none" href="${url}" download="iron-workout-${d}.png">Save image</a><button class="cta ghost" style="margin-top:8px" data-a="wsharetxt">Copy as text</button></div>
  <button class="cta ghost" data-a="close">Close</button>`);
}
async function shareGo(){const s=UI.share;if(!s)return;const w=workoutData(s.d),cv=workoutCanvas(w);
  cv.toBlob(async b=>{try{const f=new File([b],`iron-workout-${s.d}.png`,{type:'image/png'});
    if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:'IRON workout',text:s.text})}
    else if(navigator.share){await navigator.share({title:'IRON workout',text:s.text})}
    else{const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=f.name;a.click();toast('Image saved')}}catch(e){if(e&&e.name!=='AbortError')toast('Sharing isn’t available here. Use Save image.')}},'image/png')}

/* ---------- TRAIN ---------- */
function renderTrain(){
  const d=UI.date,k=tplOf(d),v=document.getElementById('view');
  if(!k){v.innerHTML=`<div class="card" style="margin-top:14px"><h4 class="disp">No session on this date</h4><p class="muted">Your plan runs ${nice(S.start)} to ${nice(S.end)}.</p><button class="cta" style="--c:var(--upper)" data-a="gostart">Go to day one</button></div>`;return}
  const t=T[k],c=KCOLOR(t.k),u=units(d),pct=pctOf(u),est=estimate(d),ph=phaseOf(d),moved=!!S.moves[d];
  let h='';
  // hero
  const segs=[['Mob',est.m,u.mob],['Warm',est.w,u.wu],['Strength',est.s,u.str],['Core',est.c,u.core],['Cardio',est.cd,u.cardio]].filter(s=>s[1]>0.5&&s[2][1]>0);
  h+=`<section class="hero" style="--c:${c}">
    <div class="big-pct disp num">${Math.round(pct*100)}%<small>done</small></div>
    <div class="when">${nice(d)}</div>
    <h2 class="disp">${t.n}</h2>
    <div class="focus">${t.f}</div>
    <div class="tags"><span class="tag">About ${mins(est.total)}</span><span class="tag">Cycle ${ph.c+1}, week ${ph.cw} of ${ph.CL}</span>${t.blocks?`<span class="tag">${ph.name}${ph.deload?'':', RIR '+ph.rir}</span>`:''}${moved?'<span class="tag">Rescheduled</span>':''}${S.done[d]?'<span class="tag">Complete</span>':''}</div>
    <div class="seg">${segs.map(s=>`<div style="flex:${Math.max(s[1],10)}"><span style="width:${s[2][1]?s[2][0]/s[2][1]*100:0}%"></span></div>`).join('')}</div>
    <div class="seglab">${segs.map(s=>`<span style="flex:${Math.max(s[1],10)}">${s[1]>=20?s[0]+' ':''}${Math.round(s[1])}′</span>`).join('')}</div>
    <div class="hero-actions"><button class="hbtn solid" data-a="colall">${SECS.every(isCol)?'Expand all':'Compact view'}</button>${blocksFor(d).length?'<button class="hbtn solid" data-a="focus">▶ Focus mode</button>':''}<button class="hbtn" data-a="move">Move or copy</button>${t.k!=='rest'?'<button class="hbtn" data-a="wshare">'+IC.share+' Share</button>':''}${(S.hist||[]).length?'<button class="hbtn" data-a="undosched" title="'+esc(S.hist[S.hist.length-1].label)+'">↶ Undo</button>':''}</div>
  </section>`;
  {const wk=S.whoop.connected?wkForDay(d):null;if(wk)h+=`<button class="note wkchip" data-a="wkopen" data-v="${wk.id}"><b>WHOOP ${esc(sportName(wk.sport).toLowerCase())}:</b> strain ${wk.strain!=null?wk.strain.toFixed(1):'–'}, avg ${wk.ahr||'–'} bpm, ${wkMins(wk)} min. Tap for heart-rate zones ›</button>`}
  if(t.blocks){
    const r=readyOf(d);h+=whoopCard(d);
    {const rc=(S.rcheck||{})[d];if(d===todayS()&&!rc&&!S.done[d])h+=`<button class="note rcprompt" data-a="rcopen"><b>${IC.bolt} Quick readiness check</b> How sore and how energetic are you? 10 seconds, and today\u2019s session adjusts. ›</button>`;else if(rc)h+=`<button class="note rcprompt" data-a="rcopen" style="--c:${{g:'var(--ok)',y:'var(--warn)',r:'var(--bad)'}[rc.lvl]}"><b>Readiness ${rc.score}</b> · soreness ${rc.sore}/5 · energy ${rc.energy}/5. Tap to redo ›</button>`}
    h+=`<div class="ready"><span>${S.whoop.connected&&!S.ready[d]&&whoopDay(d)&&S.whoop.auto?'From WHOOP':'Recovery'}</span>
      <button class="rbtn ${r==='g'?'on':''}" data-a="ready" data-v="g">Green<small>full session</small></button>
      <button class="rbtn ${r==='y'?'on':''}" data-a="ready" data-v="y">Yellow<small>lighter day</small></button>
      <button class="rbtn ${r==='r'?'on':''}" data-a="ready" data-v="r">Red<small>recovery only</small></button></div>`;
    h+=whyCard(d);
    if(ph.deload)h+=`<div class="note"><b>Deload week.</b> Two sets per exercise, loads about 15% lighter, leave 4 reps in the tank. This is where the gains lock in. A new cycle starts next week.</div>`;
    else h+=`<div class="note"><b>This week: ${ph.focus}.</b> ${[(ph.c>0?'The app suggests starting weights from your strength last cycle. ':'')+'Pick loads that leave '+ph.rir+' reps in reserve. They become your starting point for the cycle.','Keep last week’s weights and add one rep to every set.','Same weights again, one more rep. You should be near the top now.','Add weight (the app suggests how much). Reps drop back down.','Same weight as last week, push for one more rep. The hardest week of the cycle.'][ph.fi]}${ph.pos===0&&ph.c>0&&ph.dec?' <b>Cycle review:</b> '+esc(ph.dec.why):''}${ph.pos===0&&ph.c>0&&!ph.dec?(ph.c%2===1?' <b>New cycle:</b> lower reps, heavier loads, and accessories and arm moves rotate to new variations.':' <b>New cycle:</b> lower reps, heavier loads, and the original accessory moves return.'):''}</div>`;
  }
  if(t.k==='rest')h+=`<div class="note"><b>Rest day.</b> The 10-minute flow below is optional but great for the pelvic tilt and low back. Supplements still count today.</div>`;
  if(!t.blocks)h+=whyCard(d);
  if(t.k==='travel')h+=`<div class="note"><b>Travel session, no equipment.</b> All you need is a sturdy chair, a door frame and a towel.${tripAt(d)&&!S.moves[d]?' Swapped in automatically because this day is inside a trip.':''}</div>`;
  if(t.k==='long')h+=`<div class="note"><b>Active recovery.</b> Keep it conversational the whole way. Nose-breathing pace is perfect.</div>`;
  // mobility
  const mob=mobFor(d);
  h+=secHead('M','Mobility',COLORS.mob,u.mob,mins(est.m),t.k==='rest'?'Optional':'','mob');
  h+=isCol('mob')?csum(mob.map((m,i)=>({l:'M'+(i+1),n:E[m.ex].n,a:isChk(d,m.slot)?1:0,b:1})),COLORS.mob,'mob'):`<div class="mlist" style="--c:${COLORS.mob}">${mob.map(m=>mobRow(d,m,COLORS.mob)).join('')}</div>`;
  // warm-up
  const wu=warmFor(d);
  if(wu.length){
    h+=secHead('W','Warm-up',COLORS.warm,u.wu,mins(est.w),'','wu');
    h+=isCol('wu')?csum(wu.map((m,i)=>({l:'W'+(i+1),n:E[m.ex].n,a:isChk(d,m.slot)?1:0,b:1})),COLORS.warm,'wu'):`<div class="mlist" style="--c:${COLORS.warm}">${wu.map(m=>mobRow(d,m,COLORS.warm)).join('')}</div>`;
  }
  // strength
  const blocks=blocksFor(d);
  if(blocks.length){
    h+=secHead('S','Strength',c,u.str,mins(est.s),'','str');
    h+=isCol('str')?csum(blocks.flatMap(b=>b.items.map((it,i)=>({l:b.label+(b.items.length>1?i+1:''),n:E[it.ex].n,a:setsDone(d,it),b:it.rx.sets}))),c,'str'):blocks.map(b=>blockHTML(d,b,c)).join('');
  }
  // core
  const core=coreFor(d);
  if(core.length){
    h+=secHead('C','Core',COLORS.core,u.core,mins(est.c),'','core');
    if(isCol('core'))h+=csum(core.map((it,i)=>({l:'C'+(i+1),n:E[it.ex].n,a:setsDone(d,it),b:it.rx.sets})),COLORS.core,'core');else h+=`<div class="block ss" style="--c:${COLORS.core}"><div class="sslab"><span>Superset, back to back</span><span>Rest ${core[0].rx.rest} s</span></div>${core.map((it,i)=>exCard(d,it,{label:'C'+(i+1),block:{items:core,key:'core'},c:COLORS.core,idx:i})).join('')}</div>`;
  }
  // cardio
  const cd=cardioFor(d);
  if(cd){
    h+=secHead(cd.long?'L':'Z',cd.long?'Long cardio':'Cardio',cd.long?COLORS.long:COLORS.cardio,u.cardio,mins(cd.mins),'','cardio');
    h+=isCol('cardio')?csum([{l:'Z',n:cd.mins+' min, '+cd.m,a:isChk(d,'cardio')?1:0,b:1}],cd.long?COLORS.long:COLORS.cardio,'cardio'):cardioHTML(d,cd);
  }
  if(t.k!=='rest')h+=`<div class="finish"><button class="cta" style="--c:${S.done[d]?'var(--ok)':c}" data-a="finish">${S.done[d]?IC.check+' Session complete':'Finish session'}</button></div>`;
  v.innerHTML=h;
}
const SECS=['mob','wu','str','core','cardio'];
const CHEV='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
const isCol=k=>!!(S.col&&S.col[k]);
function secHead(letter,name,c,u,time,extra,key){return`<div class="sec ${isCol(key)?'closed':''}"><button class="sechead" style="--c:${c}" data-a="col" data-v="${key}" aria-expanded="${!isCol(key)}"><span class="sq">${letter}</span><h3 class="disp">${name}</h3><span class="cnt num">${u[0]}/${u[1]}${extra?' · '+extra:''}<br>${time}</span><span class="chev">${CHEV}</span></button></div>`}
function csum(rows,c,key){return`<div class="csum" style="--c:${c}" data-a="col" data-v="${key}" role="button" aria-label="Expand section">${rows.map(r=>`<div class="crow ${r.a>=r.b?'full':''}"><span class="l2">${r.l}</span><span>${esc(r.n)}</span><b>${r.b>1?r.a+'/'+r.b:(r.a?'Done':'To do')}</b></div>`).join('')}</div>`}
function setsDone(d,it){const l=S.logs[d]&&S.logs[d][it.slot];return l&&l.ex===it.ex?l.sets.slice(0,it.rx.sets).filter(s=>s.d).length:0}
function cardHead(key,title,tag){return`<button class="chead ${isCol(key)?'closed':''}" data-a="col" data-v="${key}" aria-expanded="${!isCol(key)}"><${tag||'h4'} class="disp">${title}</${tag||'h4'}><span class="chev">${CHEV}</span></button>`}
function isShut(slot,complete,def){if(UI.exc[slot]===true)return true;if(UI.exo[slot]===true)return false;return !!(complete||def||UI.compact)}
function doseTxt(m){const e=E[m.ex];if(e.t)return m.dose+' s'+(e.u?' / side':'');return m.dose+' '+(e.unit||'reps')+(e.u?' / side':'')}
function mobRow(d,m,c){
  const e=E[m.ex],on=isChk(d,m.slot),sw=m.ex!==m.base,shut=isShut(m.slot,on,true);
  let h=`<div class="mv ${on?'done':''} ${shut?'shut':''}" style="--c:${c}">
    <div class="mvh"><button class="tick ${on?'on':''}" data-a="mob" data-k="${m.slot}" aria-label="Mark ${esc(e.n)} done">${IC.check}</button>
    <div class="mi" data-a="excol" data-k="${m.slot}" data-s="${shut?1:0}" role="button" aria-expanded="${!shut}"><b>${esc(e.n)}</b><span>${doseTxt(m)}${sw?', swapped':''}</span></div>
    ${e.t?`<button class="mini play" data-a="mtimer" data-k="${m.slot}" aria-label="Start ${m.dose} second timer">${IC.play}${m.dose>=60?fmtT(m.dose):m.dose+'s'}</button>`:''}
    <button class="chevbtn" data-a="excol" data-k="${m.slot}" data-s="${shut?1:0}" aria-label="${shut?'Expand':'Collapse'}">${CHEV}</button></div>`;
  if(!shut){
    h+=`<div class="mvb">${thumb(m.ex,c)}<div class="cue">${esc(cueOf(e))}${sideNote(e)}</div>${e.p?`<span class="chipinj" style="--c:${c}">${esc(protOf(e))}</span>`:''}${injNote(UI.date,m)}
    <div class="tools" style="clear:both"><button class="mini demo" data-a="demo" data-e="${m.ex}">${IC.play} Demo</button>${m.base!=='rampUp'?`<button class="mini" data-a="swap" data-k="${m.slot}" data-b="${m.base}">${IC.swap} Replace</button>`:''}${sw?`<button class="mini" data-a="undoswap" data-k="${m.slot}" data-b="${m.base}">Undo swap</button>`:''}</div></div>`;
  }
  return h+'</div>';
}
function blockHTML(d,b,c){
  if(b.items.length===1)return`<div class="block" style="--c:${c}">${exCard(d,b.items[0],{label:b.label,block:b,c,idx:0})}</div>`;
  const rest=Math.max(...b.items.map(x=>x.rx.rest));
  return`<div class="block ss" style="--c:${c}"><div class="sslab"><span>Superset ${b.label}${b.extra?', added in extension':''}</span><span>Rest ${rest} s after ${b.label}${b.items.length}</span></div>${b.items.map((it,i)=>exCard(d,it,{label:b.label+(i+1),block:b,c,idx:i})).join('')}</div>`;
}
/* warm-up ramp from the working weight: about 40%, 60% and 80% */
function warmRamp(w,bar){if(!w||w<=0)return[];const st=w>=60?2.5:1;const r=[[.4,10],[.6,5],[.8,3]].map(([p,reps])=>({w:Math.max(bar||0,Math.round(w*p/st)*st),r:reps}));return r.filter((x,i)=>x.w<w&&(i===0||x.w>r[i-1].w))}
function exCard(d,it,o){
  const e=E[it.ex],n0=it.rx.sets,log=(S.logs[d]&&S.logs[d][it.slot]&&S.logs[d][it.slot].ex===it.ex)?S.logs[d][it.slot]:{sets:[]};
  const n=n0+(log.x||0),lp=e.t?null:lastPerf(it.ex,d);
  const doneN=log.sets.slice(0,n0).filter(s=>s.d).length,complete=doneN>=n0;
  const sug=e.bw||e.t?null:suggest(it,d);
  const isCore=it.role==='coreR'||it.role==='coreT';
  let rxline=`${n} × ${repTxt(it)}`+(isCore?'':` · RIR ${it.rx.rir}`)+(o.block.items.length===1?` · rest ${it.rx.rest} s`:'');
  const shut=UI.exc[it.slot]===true||(complete&&UI.exo[it.slot]!==true)||(UI.compact&&UI.exo[it.slot]!==true);
  let hh=`<article class="ex ${complete?'complete':''} ${shut?'shut':''}" style="--c:${o.c}">
   <div class="exh" data-a="excol" data-k="${it.slot}" data-s="${shut?1:0}" role="button" aria-expanded="${!shut}"><span class="lab">${complete?IC.check.replace('<svg','<svg width="20" height="20"'):o.label}</span><div class="ext"><b>${esc(e.n)}</b><div class="rx num">${rxline}</div>${shut?`<span class="prog-chip">${doneN}/${n0} sets${complete?' done':''}</span>`:''}</div><span class="chev">${CHEV}</span></div>`;
  if(shut)return hh+'</article>';
  hh+=`<div style="overflow:hidden;margin-top:8px">${thumb(it.ex,o.c)}<div class="cue" style="font-size:14px">${esc(cueOf(e))}${sideNote(e)}</div></div>`;
  if(it.ex!==it.base){const scope=S.swaps[d]&&S.swaps[d][it.slot]?'today':'in every session';hh+=`<div class="swapped"><span>Replaces ${esc(E[it.base].n)} ${scope}</span><button data-a="undoswap" data-k="${it.slot}" data-b="${it.base}">Undo</button></div>`}
  hh+=whyLine(d,it);
  {const plt=!e.bw&&!e.t?plateauOf(it.ex,d):null;if(plt&&!phaseOf(d).deload)hh+=plateauHTML(plt,true)}
  if(sug)hh+=`<div class="sugg num tap" data-a="lifthist" data-e="${it.ex}" role="button">Last (${short(sug.lp.d)}): ${sug.lp.sets.map(s=>s.w+'×'+s.r).join(', ')}. Try <b>${sug.w} kg</b>. <span class="muted">${sug.why}.</span> <u>History ›</u></div>`;
  else if(!e.bw&&!e.t&&!isCore)hh+=`<div class="sugg">First time: pick a load you could lift ${Number(String(it.rx.rir)[0])+0||2} more reps with. The app suggests next time.</div>`;
  {const tw=+(log.sets.find(q=>q.w!=='')||{}).w||(sug?sug.w:0);if(log.wu&&tw&&!e.bw&&!e.t){const ramp=warmRamp(tw,isBarbell(it.ex)?20:0);hh+=`<div class="wramp"><span>Warm-up</span>${ramp.map((x,j)=>`<button class="${log.wu[j]?'on':''}" data-a="wuset" data-k="${it.slot}" data-v="${j}">${x.w} kg × ${x.r}</button>`).join('')}</div>`}}
  hh+=`<div class="sets">`;
  for(let i=0;i<n;i++){
    const s=log.sets[i]||{w:'',r:'',d:0},k=it.slot+'|'+i,ls=lp&&lp.sets[Math.min(i,lp.sets.length-1)],extra=i>=n0;
    if(e.t){const sec=secsOf(it);hh+=`<div class="set t ${s.d?'done':''}"><span class="sn">${i+1}</span><button class="tbtn" data-a="tset" data-k="${k}">${IC.play} ${sec} s${e.u?' each side':''}</button><button class="tick ${s.d?'on':''}" data-a="set" data-k="${k}" aria-label="Set ${i+1} done">${IC.check}</button></div>`}
    else if(e.bw){hh+=`<div class="set bw ${s.d?'done':''}"><span class="sn">${i+1}</span><label class="fld"><input inputmode="numeric" data-in="r" data-k="${k}" value="${esc(s.r)}" placeholder="${rangeOf(it.rx.reps)[1]}"><em>reps</em></label><button class="tick ${s.d?'on':''}" data-a="set" data-k="${k}" aria-label="Set ${i+1} done">${IC.check}</button></div>`}
    else{hh+=`<div class="set ${s.d?'done':''} ${UI.pop===k?'pop':''}"><span class="sn">${s.t==='d'?'D':extra?'+':i+1}${s.d&&s.e?`<small class="rpel">@${s.e}</small>`:''}</span><label class="fld"><input inputmode="decimal" data-in="w" data-k="${k}" value="${esc(s.w)}" placeholder="${s.t==='d'&&i>0&&log.sets[i-1].w?Math.round(+log.sets[i-1].w*.8/2.5)*2.5:(sug?sug.w:(ls?ls.w:'–'))}"><em>kg</em>${ls&&!s.d?`<small class="lastv">${ls.w}</small>`:''}</label><label class="fld"><input inputmode="numeric" data-in="r" data-k="${k}" value="${esc(s.r)}" placeholder="${rangeOf(it.rx.reps)[1]}"><em>reps</em>${ls&&!s.d?`<small class="lastv">${ls.r}</small>`:''}</label><button class="tick ${s.d?'on':''}" data-a="set" data-k="${k}" aria-label="Set ${i+1} done">${IC.check}</button></div>`}
    if(prefs().rpe&&s.d&&s.e==null&&!e.t&&UI.rpeAsk===k)hh+=rpeRow(k,s);
  }
  hh+=`</div><div class="tools"><button class="mini demo" data-a="demo" data-e="${it.ex}">${IC.play} Demo</button><button class="mini" data-a="swap" data-k="${it.slot}" data-b="${it.base}">${IC.swap} Replace</button><button class="mini" data-a="exinfo" data-k="${it.slot}">${IC.info} Form</button>${isBarbell(it.ex)?`<button class="mini" data-a="plates" data-e="${it.ex}" data-w="${(log.sets.find(q=>q.w!=='')||{}).w||(sug?sug.w:'')}">${IC.plate} Plates</button>`:''}${!e.bw&&!e.t&&(hist()[it.ex]||[]).length?`<button class="mini" data-a="lifthist" data-e="${it.ex}">History</button>`:''}</div>
  ${!e.t&&!isCore?`<div class="tools quick"><button class="mini" data-a="addset" data-k="${it.slot}">＋ Set</button>${!e.bw?`<button class="mini" data-a="dropset" data-k="${it.slot}">↓ Drop set</button><button class="mini ${log.wu?'on':''}" data-a="wuramp" data-k="${it.slot}">Warm-up sets</button>`:''}${log.x?`<button class="mini" data-a="rmset" data-k="${it.slot}" aria-label="Remove the last extra set">− Extra</button>`:''}${lp?'<span class="muted swipehint">Small numbers are last time · swipe a set right to finish it</span>':''}</div>`:''}
  ${injNote(UI.date,it)}<div class="info hide" id="info-${it.slot}">${muscleMap(it.ex,o.c)}${esc(cueOf(e))}${sideNote(e,1)}${e.p?`<div><span class="chipinj" style="--c:${o.c}">Protects: ${esc(protOf(e))}</span></div>`:''}</div>
  </article>`;
  return hh;
}
function cardioHTML(d,cd){
  const on=isChk(d,'cardio'),c=cd.long?COLORS.long:COLORS.cardio,ph=cardioPhases(cd);
  const zi=cd.z==='int'?[1,1,1,1,1]:cd.z==='circ'?[1,1,1,0,0]:[1,1,0,0,0];
  return`<div class="cardio" style="--c:${c}"><div class="row"><div><div class="big disp num">${cd.mins}′</div><div style="font-weight:800">${esc(cd.m)}</div></div><button class="tick ${on?'on':''}" style="--c:${c};width:52px;height:52px;flex-basis:52px" data-a="cardiochk" aria-label="Cardio done">${IC.check}</button></div>
  <div class="zbar">${zi.map(z=>`<span class="${z?'on':''}"></span>`).join('')}</div>
  <div class="muted" style="font-size:14px">${cd.z==='circ'?`${cd.mins} rounds of 40 s on and 20 s easy, rotating: ${esc(cd.moves.join(', ').toLowerCase())}. No jumping, kind to the knee and your hotel neighbors.`:cd.z==='int'?`${(ph.length-2)/2} rounds of 30 s hard and 60 s easy, with warm-up and cool-down. The timer calls every switch.`:'Zone 2: about 60–70% of max heart rate. You can speak in full sentences. On WHOOP, strain stays moderate.'}</div>
  <button class="cta" data-a="cardiotimer">${IC.play} Start ${cd.mins}-minute timer</button></div>`;
}

