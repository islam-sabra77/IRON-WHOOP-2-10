"use strict";
/* ---------- AI COACH REVIEW: a short written review of one week, inside the weekly report ----------
   Only numbers and app-written labels are sent (sessions, lifts, recovery, sleep, weight, nutrition totals,
   active injury areas). Never your name, notes, photos or anything you typed. It is sent only when you tap the button,
   and the review is kept on this phone (and in your encrypted backup). */
const AIR_V=1;
function airStore(){return S.aiRev||(S.aiRev={})}
const airR=(v,p)=>v==null||isNaN(v)?null:Math.round(v*(p||1))/(p||1);
/* the week's numbers, exactly as they are sent */
function airWeek(ws){
  const r=weekData(ws),we=r.we,t=todayS(),days=[...Array(7).keys()].map(i=>addD(ws,i)),mid=ws<S.start?S.start:ws,ph=phaseOf(mid),complete=we<t;
  const h=hist(),be=x=>Math.max(...x.sets.map(q=>e1rm(+q.w,+q.r))),lifts=[];
  Object.keys(h).forEach(ex=>{if(!E[ex]||E[ex].bw||E[ex].t)return;const inW=h[ex].filter(x=>x.d>=ws&&x.d<=we);if(!inW.length)return;
    const best=inW.reduce((a,x)=>be(x)>be(a)?x:a),prev=h[ex].filter(x=>x.d<ws&&x.d>=addD(ws,-28));
    lifts.push({lift:E[ex].n.slice(0,60),sets:best.sets.map(q=>q.w+'×'+q.r).join(', ').slice(0,80),e1rm:airR(be(best),10),prevE1rm:prev.length?airR(Math.max(...prev.map(be)),10):null,main:META[ex]&&META[ex].main?1:0})});
  lifts.sort((a,b)=>b.main-a.main||b.e1rm-a.e1rm);
  const wd=days.map(d=>(S.wdata||{})[d]).filter(x=>x&&!x.cal),avg=(a,f)=>{const x=a.map(f).filter(q=>q!=null);return x.length?x.reduce((p,q)=>p+ +q,0)/x.length:null};
  const prevRec=weekData(addD(ws,-7)).rec,wi=complete?weekInt(addD(ws,7)):null;
  const adj=[],seen={};days.forEach(d=>{if(!inPlan(d))return;dayWhy(d).forEach(x=>{if(seen[x.t])return;seen[x.t]=1;adj.push((x.t+': '+x.fx).slice(0,160))})});
  const fd=days.filter(d=>((S.food||{})[d]||[]).length),fa=f=>fd.length?fd.reduce((a,d)=>a+f(d),0)/fd.length:null;
  const fat=lastVal('fat',we);
  return{lang:isAr()?'ar':'en',units:uW(),from:ws,to:we,complete,goal:String(goalOf()).slice(0,20),level:S.prof&&S.prof.sc&&S.prof.sc.lvl!=null?+S.prof.sc.lvl:null,
    phase:{name:ph.name,cycle:ph.c+1,week:ph.cw,of:ph.CL,deload:!!ph.deload,rir:String(ph.rir)},
    sessions:{done:r.done,planned:r.sched},volume:{kg:Math.round(r.v.vol),sets:r.v.sets,prevKg:r.pv.vol?Math.round(r.pv.vol):null},
    prs:r.prs.slice(0,8).map(x=>({lift:E[x.ex].n.slice(0,60),e1rm:x.e1,up:x.up})),
    lifts:lifts.slice(0,12).map(x=>({lift:x.lift,sets:x.sets,e1rm:x.e1rm,prevE1rm:x.prevE1rm})),
    stalled:plateaus().slice(0,5).map(x=>({lift:E[x.ex].n.slice(0,60),sessions:x.sessions})),
    recovery:{avg:airR(r.rec),prevAvg:airR(prevRec),redDays:wd.length?wd.filter(x=>x.rec!=null&&+x.rec<34).length:null,sleepH:airR(r.slp,10),dayStrain:airR(r.str,10),hrv:airR(avg(wd,x=>x.hrv)),rhr:airR(avg(wd,x=>x.rhr))},
    weekLevel:wi?wi.lvl:null,adjustments:adj.slice(0,8),
    body:{weightKg:r.w1?airR(r.w1.v,10):null,changeKg:r.w1&&r.w0?airR(r.w1.v-r.w0.v,10):null,fatPct:fat?airR(fat.v,10):null},
    nutrition:{proteinG:airR(fa(d=>nutDay(d).p)),proteinTargetG:airR(fa(d=>nutTargets(d).prot)),kcal:airR(fa(d=>nutDay(d).c)),kcalTarget:airR(fa(d=>nutTargets(d).kcal)),daysLogged:fd.length},
    supplementsPct:r.sup==null?null:Math.round(r.sup*100),habitsPct:r.hab==null?null:Math.round(r.hab*100),
    injuries:typeof injOn==='function'?[...injOn(we>t?t:we)].map(j=>INJ_SHORT[j]||j).slice(0,6):[],
    goals:goalList().slice(0,4).map(g=>{const st=goalStatus(g);return{name:goalName(g).slice(0,60),pct:Math.round(st.pct*100),eta:st.eta||null}}),
    nextFocus:nextFocus(ws).slice(0,300)}}
const AIR_ERR={limit:'You’ve reached today’s limit for coach reviews. Try again tomorrow.',busy:'The coach is busy right now. Try again in a few minutes.',rate_limited:'Too many requests. Try again in a minute.',not_configured:'Coach review isn’t set up on this server yet.',refused:'The coach couldn’t review this week. Try again later.'};
async function airGo(ws){
  if(UI.air&&UI.air.busy)return;
  if(!navigator.onLine){toast('You’re offline. Connect to get your coach review.');return}
  S.aiOk=1;UI.air={ws,busy:1,err:''};airRedraw(ws);
  let err='';
  try{const r=await fetch('/api/coach',{method:'POST',headers:{'Content-Type':'application/json','x-iron-key':wKey()},body:JSON.stringify({week:airWeek(ws)})});
    const j=await r.json().catch(()=>({}));
    if(r.ok&&j.review){airStore()[ws]={at:todayS(),v:AIR_V,r:j.review};save()}
    else{if(j.error==='not_configured')UI.airOff=1;err=AIR_ERR[j.error]||'Couldn’t write the review. Try again in a minute.'}
  }catch(e){err='Couldn’t reach the coach. Check your connection and try again.'}
  UI.air={ws,busy:0,err};airRedraw(ws)}
/* redraw only the card, so the report doesn't jump while you read it */
function airRedraw(ws){const el=document.querySelector(`#panel [data-air="${ws}"]`);if(el)el.outerHTML=airCard(ws)}
function airCard(ws){
  const rv=airStore()[ws],st=UI.air&&UI.air.ws===ws?UI.air:{},we=addD(ws,6),r=weekData(ws),has=r.v.sets>0||r.done>0;
  const head=`<div class="aircard card" data-air="${ws}"><div class="airhead"><b>${IC.bolt} Coach review</b><span class="pill" style="--c:var(--upper)">AI</span></div>`;
  if(st.busy)return head+`<p class="muted airwait">Reading your week… this takes about 10 seconds.</p></div>`;
  const err=st.err?`<p class="airerr">${esc(st.err)}</p>`:'';
  if(rv){const sec=(t,a,c)=>a&&a.length?`<div class="airsec" style="--c:${c}"><span>${t}</span><ul data-raw>${a.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`:'';
    const stale=rv.at<=we;/* written before the week ended */
    return head+`<p class="airline" data-raw>${esc(rv.r.headline)}</p>${sec('What went well',rv.r.wins,'var(--ok)')}${sec('Keep an eye on',rv.r.watch,'var(--warn)')}${sec('Next week',rv.r.next,'var(--upper)')}${err}
    <p class="muted airfoot">Written by AI from this week’s numbers on ${short(rv.at)}. A guide, not medical advice.${stale&&!UI.airOff?` <button class="linkbtn" data-a="airgo" data-v="${ws}">Update</button>`:''}</p></div>`}
  if(UI.airOff)return head+`<p class="muted" style="margin:0">${AIR_ERR.not_configured}</p></div>`;
  if(!has)return head+`<p class="muted" style="margin:0">Log a session this week and your coach can review it.</p></div>`;
  return head+`<p style="margin:0 0 8px;font-size:14px">A short written review of this week: what went well, what to watch and what to do next, from your own numbers.</p>${err}
  <button class="cta" style="--c:var(--upper);margin:0 0 8px" data-a="airgo" data-v="${ws}">${S.aiOk?'Write my review':'Agree and write my review'}</button>
  <p class="muted airfoot">Sends this week’s numbers (sessions, lifts, recovery, sleep, weight, nutrition totals and active injury areas) to Anthropic’s Claude to write the review. Your name, notes and photos are never sent, and IRON\u2019s server stores nothing.</p></div>`}
document.addEventListener('click',ev=>{const el=ev.target.closest('[data-a="airgo"]');if(el)airGo(el.dataset.v)});
if(typeof AR==='object')Object.assign(AR,{'Coach review':'مراجعة المدرّب','What went well':'ما سار جيدًا','Keep an eye on':'انتبه إلى','Next week':'الأسبوع القادم','Write my review':'اكتب مراجعتي','Agree and write my review':'أوافق، اكتب مراجعتي','Update':'تحديث'});
