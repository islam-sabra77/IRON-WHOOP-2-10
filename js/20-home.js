"use strict";
/* =====================================================================
   HOME: one readiness header, a day picker that drives the session card,
   today's checks you can tick right here, and lift progress.
   ===================================================================== */
const H_LVL={g:['Green day','Full session today','#12B76A'],y:['Yellow day','Lighter session today','#F59E0B'],r:['Red day','Recovery only today','#EF3B55']};
function hGauge(rec,col,anim){const L=204.2,off=rec==null?L:L*(1-Math.max(0,Math.min(100,rec))/100);
  return`<svg class="hg-gauge" width="128" height="74" viewBox="0 0 150 86" role="img" aria-label="Recovery ${rec==null?'unknown':Math.round(rec)+' percent'}"><path d="M10 78 A65 65 0 0 1 140 78" fill="none" stroke="rgba(255,255,255,.14)" stroke-width="14" stroke-linecap="round"/><path class="${anim?'hg-arc':''}" d="M10 78 A65 65 0 0 1 140 78" fill="none" stroke="${col}" stroke-width="14" stroke-linecap="round" stroke-dasharray="${L}" stroke-dashoffset="${off.toFixed(1)}" style="--off:${off.toFixed(1)}"/><text x="75" y="72" text-anchor="middle" font-size="31" font-weight="800" fill="#fff">${rec==null?'–':Math.round(rec)+'%'}</text></svg>`}
function hMoves(d){const out=[];blocksFor(d).forEach(b=>b.items.forEach(it=>{if(E[it.ex])out.push(E[it.ex].n)}));coreFor(d).forEach(it=>{if(E[it.ex])out.push(E[it.ex].n)});return out}
function hSpark(pts,col){if(pts.length<2)return'';const mn=Math.min(...pts),mx=Math.max(...pts),rg=(mx-mn)||1;
  return`<svg width="150" height="60" viewBox="0 0 150 60" aria-hidden="true"><polyline points="${pts.map((v,i)=>(4+i*(142/(pts.length-1))).toFixed(1)+','+(54-(v-mn)/rg*48).toFixed(1)).join(' ')}" fill="none" stroke="${col}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/></svg>`}

function renderHome(){
  const v=document.getElementById('view'),t=todayS(),ws=sunOf(t);
  if(!UI.hday||UI.hday<ws||UI.hday>addD(ws,6))UI.hday=t;
  const anim=!UI.hAnimDone;UI.hAnimDone=true;
  const name=(S.prof&&S.prof.ans&&S.prof.ans.name)||'',hr=new Date().getHours();
  const ld=latestDay(),x=(S.whoop.connected?W(ld):null)||{},wd=S.whoop.connected?whoopDay(ld):null,lvl=readyOf(t)||(wd&&wd.lvl)||'';
  const L=H_LVL[lvl],col=L?L[2]:'#8E97BF';
  // header
  let h=`<section class="hg-hero" aria-label="Readiness"><p class="hg-date">${nice(t)}</p><h2 class="hg-hi disp">${hr<12?'Good morning':hr<18?'Good afternoon':'Good evening'}${name?', '+esc(name):''}</h2>`;
  if(S.whoop.connected&&x.rec!=null){
    h+=`<button class="hg-ready" data-a="hwhy" aria-expanded="${!!UI.hwhy}">${hGauge(x.rec,col,anim)}<span class="hg-rtx"><b>${L?L[0]:'Recovery'}</b><span>${L?L[1]:''}. ${UI.hwhy?'Tap to hide':'Tap to see why'}</span></span></button>`;
    if(UI.hwhy){const sl=x.sleep,hrvT=wd&&wd.hrvD!=null?(wd.hrvD>=0?'+':'')+Math.round(wd.hrvD*100)+'% vs avg':'30-day avg pending',rhrT=wd&&wd.rhrD!=null?(wd.rhrD>0?'+':'')+Math.round(wd.rhrD)+' vs avg':'';
      h+=`<div class="hg-why"><div><b>${sl?hm(sl.dur):'–'}</b><span>Sleep${sl&&sl.perf!=null?', '+Math.round(sl.perf)+'% of need':''}</span></div><div><b>${x.hrv!=null?Math.round(x.hrv)+' ms':'–'}</b><span>HRV, ${hrvT}</span></div><div><b>${x.rhr!=null?Math.round(x.rhr)+' bpm':'–'}</b><span>Resting HR${rhrT?', '+rhrT:''}</span></div></div>
      ${wd&&wd.why?`<p class="hg-note">${esc(wd.why.join(' · '))}${ld!==t?' · from '+short(ld):''}</p>`:''}<button class="hg-link" data-a="hgo" data-v="whoop">Open Body ›</button>`}
  }else if(S.whoop.connected){h+=`<button class="hg-ready" data-a="rcopen">${hGauge(null,col,false)}<span class="hg-rtx"><b>${L?L[0]:'No recovery yet'}</b><span>${L?L[1]:'WHOOP hasn’t scored today. Tap for a quick readiness check'}</span></span></button>`}
  else h+=`<div class="hg-cta2"><button class="hg-ready" data-a="rcopen"><span class="hg-rtx"><b>${L?L[0]:'How do you feel today?'}</b><span>${L?L[1]:'A 10-second readiness check sets today’s intensity'}</span></span><span class="lhgo">›</span></button><button class="hg-link" data-a="hgo" data-v="whoop">Connect WHOOP to do this automatically ›</button></div>`;
  h+=`</section>`;
  if(typeof fwCard==='function')h+=fwCard();
  if(typeof protectCard==='function')h+=protectCard();
  // day picker
  let days='';for(let i=0;i<7;i++){const d=addD(ws,i),k=tplOf(d),tt=k&&T[k],on=d===UI.hday,dot=S.done[d]?'var(--ok)':tt?KCOLOR(tt.k):'var(--ln)';
    days+=`<button class="hg-day ${on?'on':''} ${d===t?'today':''}" data-a="hday" data-d="${d}" aria-pressed="${on}" aria-label="${nice(d)}${tt?', '+esc(tt.n):''}${S.done[d]?', done':''}"><small>${DS[i]}</small><b class="num">${pd(d).getDate()}</b><i style="background:${dot}"></i></button>`}
  h+=`<nav class="hg-days" aria-label="This week">${days}</nav>`;
  // session card for the picked day
  {const d=UI.hday,k=tplOf(d),tp=k&&T[k];
   if(!tp)h+=`<section class="hg-sess" style="--c:var(--rest)"><span class="hg-when">${d===t?'Today':nice(d)}</span><h3 class="disp">Outside your plan</h3><p>Your plan runs ${short(S.start)} to ${short(S.end)}.</p><button class="hg-go" data-a="hgo" data-v="plan">Open the plan</button></section>`;
   else{const done=!!S.done[d],isT=d===t,u=units(d),pct=pctOf(u),est=estimate(d),c=done?'var(--ok)':KCOLOR(tp.k),r=readyOf(d),moves=tp.k==='rest'||tp.k==='long'?[]:hMoves(d);
     const when=isT?'Today':d===addD(t,-1)?'Yesterday':d===addD(t,1)?'Tomorrow':nice(d);
     const pill=done?'Done':tp.k==='rest'?'Recover':isT&&r?H_LVL[r][0]:d<t?'Missed':'Planned';
     const meta=tp.k==='rest'?'Walk, stretch and sleep well':tp.k==='long'?esc(tp.f):`${moves.length} moves · about ${mins(est.total)}${isT&&r==='y'?' · trimmed for recovery':isT&&r==='r'?' · mobility and easy cardio only':''}`;
     h+=`<section class="hg-sess" style="--c:${c}" aria-label="${esc(tp.n)}"><div class="hg-srow"><span class="hg-when">${when}</span><span class="hg-pill">${pill}</span></div>
     <h3 class="disp">${esc(tp.n)}</h3><p>${esc(tp.f)}${tp.k!=='rest'&&tp.k!=='long'?'':''}</p><p class="hg-meta">${meta}</p>
     ${moves.length?`<div class="hg-chips">${moves.slice(0,6).map(m=>`<span>${esc(m)}</span>`).join('')}${moves.length>6?`<span>+${moves.length-6} more</span>`:''}</div>`:''}
     ${isT&&tp.k!=='rest'?`<button class="hg-go" data-a="hgo" data-v="train" data-d="${d}">${done?'See today’s session':pct>0?'Continue · '+Math.round(pct*100)+'% done':`${IC.play} Start ${esc(tp.n)}`}</button>`:`<button class="hg-go ghost" data-a="hgo" data-v="train" data-d="${d}">${done?'See this session':d<t?'Log it now':'Preview this day'}</button>`}
     ${(done||pct>0)&&tp.k!=='rest'?`<button class="hg-link light" data-a="wshare" data-d="${d}">${IC.share} Share this workout</button>`:''}</section>`}}
  // today's checks
  {const sl2=S.suppLog[t]||{},sp=S.supps||[],taken=sp.filter(s=>sl2[s.id]).length,hb=S.habits||[],hd=hb.filter(q=>habDone(q.id,t)).length,n=nutDay(t),tg=nutTargets(t),pf=Math.min(1,n.p/(tg.prot||1));
   const tot=sp.length+hb.length+1,frac=(taken+hd+pf)/tot,C=2*Math.PI*26,left=[];if(sp.length-taken)left.push(`${sp.length-taken} supplement${sp.length-taken>1?'s':''}`);if(hb.length-hd)left.push(`${hb.length-hd} habit${hb.length-hd>1?'s':''}`);if(n.p<tg.prot)left.push(`${Math.round(tg.prot-n.p)} g protein`);
   h+=`<section class="card hg-checks" aria-label="Today's checks"><div class="hg-chead"><svg width="64" height="64" viewBox="0 0 64 64" role="img" aria-label="${Math.round(frac*100)} percent of today's checks done"><circle cx="32" cy="32" r="26" fill="none" stroke="var(--sf2)" stroke-width="8"/><circle cx="32" cy="32" r="26" fill="none" stroke="var(--ok)" stroke-width="8" stroke-linecap="round" stroke-dasharray="${(C*Math.max(.001,frac)).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 32 32)" class="hg-ring"/><text x="32" y="37" text-anchor="middle" font-size="15" font-weight="800" fill="currentColor">${Math.round(frac*100)}%</text></svg>
   <div><h3>Today’s checks</h3><p>${left.length?left.join(', ')+' to go':'All done. Nice work.'}</p></div></div>`;
   if(sp.length)h+=`<div class="hg-list">${sp.map(s=>{const on=!!sl2[s.id];return`<button class="hg-item ${on?'on':''}" data-a="hsupp" data-k="${s.id}" aria-pressed="${on}"><i>${on?IC.check:''}</i><span><b>${esc(s.n)}</b> <em>${esc(s.d||'')}</em></span><small>${esc(s.slot||'')}</small></button>`}).join('')}</div>`;
   else h+=`<button class="hg-item" data-a="hgo" data-v="supps"><i></i><span><b>Build your supplement stack</b></span><small>›</small></button>`;
   if(hb.length)h+=`<div class="hg-habs">${hb.map(q=>{const on=habDone(q.id,t);return`<button class="tchip ${on?'on':''}" style="--c:${q.c}" data-a="habtoday" data-k="${q.id}" aria-pressed="${on}"><span>${q.e}</span>${esc(q.n)}</button>`}).join('')}</div>`;
   h+=`<div class="hg-prot"><span><b>Protein ${Math.round(n.p)} of ${tg.prot} g</b><span class="hg-bar"><i style="width:${Math.round(pf*100)}%"></i></span></span><button data-a="hprot" aria-label="Add 20 grams of protein">+20 g</button></div></section>`}
  // lift progress
  {const hs=hist(),top=Object.keys(hs).filter(e=>E[e]&&!E[e].bw&&!E[e].t).sort((a,b)=>hs[b].length-hs[a].length).slice(0,3);
   if(top.length){const i=Math.min(UI.hlift||0,top.length-1),ex=top[i],ser=hs[ex].map(q=>({d:q.d,v:Math.max(...q.sets.map(s=>e1rm(+s.w,+s.r)))})),now=ser[ser.length-1].v,ago=ser.find(q=>q.d>=addD(t,-30))||ser[0],dl=now-ago.v;
     const nameOf=e=>{const n=E[e].n.replace(/^(Barbell|Dumbbell|Cable|Machine) /,'');return n.charAt(0).toUpperCase()+n.slice(1)};
     h+=`<section class="card hg-lift" aria-label="Lift progress"><div class="hg-seg" role="tablist">${top.map((e,j)=>`<button role="tab" aria-selected="${j===i}" class="${j===i?'on':''}" data-a="hlift" data-v="${j}">${esc(nameOf(e))}</button>`).join('')}</div>
     <button class="hg-lrow" data-a="lifthist" data-e="${ex}"><span><small>Estimated 1-rep max</small><b class="disp num">${Math.round(now)} kg</b><em style="color:${dl>=0?'var(--ok)':'var(--bad)'}">${dl>=0?'+':''}${Math.round(dl)} kg since ${short(ago.d)}</em></span>${hSpark(ser.slice(-10).map(q=>q.v),'var(--upper)')}</button>`;
     const sch=[...Array(7)].map((_,j)=>addD(ws,j)).filter(d=>isTraining(tplOf(d))),dn=sch.filter(d=>S.done[d]).length,need=Math.max(0,4-dn),wk=weekStreak();
     h+=`<p class="hg-streak">${IC.trophy||''}<span><b>${wk}-week streak.</b> ${need?`${need} more session${need>1?'s':''} this week keeps it going.`:'This week already counts.'}</span></p></section>`}}
  // at a glance
  {const ph=phaseOf(inPlan(t)?t:S.start),tw=weekVol(ws),lw2=addD(ws,-7),wdd=weekData(lw2),g=goalList()[0],ibl=ibLatest(),bw=lastVal('weight',t),trip=(S.trips||[]).filter(q=>q.to>=t).sort((a,b)=>a.from<b.from?-1:1)[0];
   const tile=(a,lab,val,sub,c,extra)=>`<button class="hg-mini" style="--c:${c}" ${a}><span>${lab}</span><b>${val}</b><small>${sub}</small>${extra||''}</button>`;
   h+=`<h3 class="hg-sec">At a glance</h3><div class="hg-grid">`
    +tile('data-a="hgo" data-v="build"',`Cycle ${ph.c+1} · week ${ph.cw}/${ph.CL}`,ph.name,esc(ph.focus||''),PH_COLOR[ph.s])
    +tile('data-a="hgo" data-v="progress"','Volume this week',fvol(tw.vol),tw.sets+' sets','var(--lower)')
    +tile(`data-a="report" data-v="${lw2}"`,'Weekly report'+(S.seenReport!==lw2?' · new':''),wdd.done+'/'+wdd.sched,`sessions last week · ${wdd.prs.length} PR${wdd.prs.length===1?'':'s'}`,'#00A3FF')
    +(g?(()=>{const st=goalStatus(g);return tile('data-a="tab" data-v="goals"','Goal',Math.round(st.pct*100)+'%',esc(goalName(g)),'var(--upper)')})():tile('data-a="tab" data-v="goals"','Goals','Set one','A target with a date','var(--upper)'))
    +(ibl?tile('data-a="ibopen"','InBody '+short(ibl.d),(ibl.r.skeletal_muscle_mass_kg??'–')+' kg',`muscle · ${ibl.r.percent_body_fat??'–'}% fat`,WC.body):tile('data-a="ibupload"','Body',bw?bw.v+' kg':'Upload InBody',bw?'Latest weight':'Photo or PDF',WC.body))
    +tile('data-a="hgo" data-v="travel"','Travel',trip?(trip.from<=t?'On a trip':short(trip.from)):'No trips',trip?'Until '+short(trip.to):'Plan a hotel workout','var(--travel)')
    +`</div>`}
  v.innerHTML=h;
}
function homeChrome(){document.body.classList.toggle('onhome',UI.tab==='home')}
document.addEventListener('click',ev=>{const el=ev.target.closest('[data-a]');if(!el)return;const a=el.dataset.a,t=todayS();
  if(a==='hday'){UI.hday=el.dataset.d;rerender()}
  if(a==='hwhy'){UI.hwhy=!UI.hwhy;rerender()}
  if(a==='hlift'){UI.hlift=+el.dataset.v;rerender()}
  if(a==='hsupp'){const k=el.dataset.k;S.suppLog[t]=S.suppLog[t]||{};if(S.suppLog[t][k])delete S.suppLog[t][k];else S.suppLog[t][k]=1;if(!Object.keys(S.suppLog[t]).length)delete S.suppLog[t];save();rerender()}
  if(a==='hprot'){foodPush(t,'Protein (quick add)',20,90);rerender();toast('Added 20 g protein',()=>{const l=(S.food||{})[t]||[];const i=l.map(q=>q.n).lastIndexOf('Protein (quick add)');if(i>=0)l.splice(i,1)})}
});

/* ---------- INTRO: 3 seconds on the first open of a session ---------- */
function introDone(){const el=document.getElementById('intro');if(!el||el.dataset.out)return;el.dataset.out=1;el.classList.add('out');setTimeout(()=>el.remove(),450);try{sessionStorage.setItem('iron-intro','1')}catch(e){}}
function introStart(){const el=document.getElementById('intro');if(!el)return;
  const nm=(S.prof&&S.prof.ans&&S.prof.ans.name)||'',m3=el.querySelector('.in-m3');if(m3)m3.textContent=(isAr()?'جاهز':'Ready')+(nm?', '+nm:'');
  if(isAr()){const tg=el.querySelector('.in-tag');if(tg)tg.textContent='تمرّن حسب تعافيك';const m1=el.querySelector('.in-m1'),m2=el.querySelector('.in-m2');if(m1)m1.textContent='مزامنة تعافي WHOOP…';if(m2)m2.textContent='تجهيز جلسة اليوم…'}
  el.addEventListener('click',introDone);
  const reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches,wait=Math.max(0,(reduce?900:3000)-performance.now());
  setTimeout(introDone,wait)}
