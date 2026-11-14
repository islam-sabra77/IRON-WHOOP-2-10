"use strict";
/* ---------- SEARCH: one box for pages, settings, exercises, supplements and past sessions ---------- */
const IC_SEARCH='<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>';
const SR_PAGES=[['home','Home','summary today'],['train','Train','workout session log sets'],['progress','Progress','lifts charts records weekly report'],['whoop','Body','whoop recovery sleep strain inbody weight'],['plan','Plan','calendar schedule cycle injuries'],['build','Plan Builder','split push pull hiit cardio mobility'],['supps','Supplements','stack quiz'],['habits','Habits','water steps sleep'],['goals','Goals','target projection'],['food','Food','nutrition protein calories macros'],['travel','Travel','hotel trip']];
const SR_SET=[['Units (kg or lb)','units kg lb pounds metric imperial','settings'],['Language (English or Arabic)','language arabic english عربي','settings'],['Theme (light or dark)','theme dark light mode','settings'],['Reminders','reminders notifications workout supplements bedtime','remcard'],['Background alerts','alerts notifications timer lock screen push','settings'],['Injuries and limits','injury injured knee shoulder back hurt healed pain','injcard'],['Cloud backup','cloud backup sync restore account passkey','syncopen'],['Retake the questionnaire','questionnaire plan rebuild onboarding','obopen'],['Plate calculator','plates barbell','plates'],['Add a sport or activity','padel tennis football soccer basketball squash yoga pilates running cycling swimming boxing hiking golf sport activity class','actnew'],['Change cardio','cardio zone 2 intervals bike treadmill walk run swim','cdopen'],['Share with a coach','coach trainer share link send','coach'],['Send feedback','feedback bug idea contact','feedback'],['Privacy and your data','privacy delete data export','privacy']];
const srNorm=s=>String(s||'').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g,'');
function srResults(q){
  q=srNorm(q).trim();if(!q)return null;const words=q.split(/\s+/),hit=s=>{s=srNorm(s);return words.every(w=>s.includes(w))};
  const pages=SR_PAGES.filter(p=>hit(p[1]+' '+p[2])),sets=SR_SET.filter(x=>hit(x[0]+' '+x[1]));
  const H=hist(),ex=Object.keys(E).filter(id=>id!=='rampUp'&&hit(E[id].n+' '+(E[id].m||'')+' '+((META[id]&&META[id].pat)||''))).sort((a,b)=>((H[b]||[]).length-(H[a]||[]).length)||E[a].n.localeCompare(E[b].n)).slice(0,12);
  const sp=(typeof SUPP_DB!=='undefined'?SUPP_DB:[]).filter(e=>hit(e.n+' '+e.a.join(' ')+' '+e.b.join(' '))).slice(0,8);
  const days=[];Object.keys(S.logs).sort().reverse().forEach(d=>{if(days.length>=6)return;const k=tplOf(d),t=k&&T[k];const exs=Object.keys(S.logs[d]).filter(x=>x[0]!=='_'&&S.logs[d][x]&&S.logs[d][x].ex).map(x=>E[S.logs[d][x].ex]?E[S.logs[d][x].ex].n:'');if(!exs.length)return;if(hit(nice(d)+' '+d+' '+(t?t.n+' '+t.f:'')+' '+exs.join(' ')))days.push({d,t,n:exs.length})});
  return{pages,sets,ex,sp,days}}
function srHTML(q){const r=srResults(q);
  if(!r)return`<p class="muted" style="font-size:14px">Try “bench”, “magnesium”, “reminders”, “knee” or a date.</p><div class="srchips">${['Squat','Creatine','Reminders','Injuries','Units','Cloud backup'].map(x=>`<button class="pill" data-a="srq" data-v="${x}">${x}</button>`).join('')}</div>`;
  const sec=(t,l)=>l?`<h5 class="srh">${t}</h5>${l}`:'';const H=hist();
  const out=sec('Pages',r.pages.map(p=>`<button class="sr" data-a="tab" data-v="${p[0]}"><b>${p[1]}</b><span class="lhgo">›</span></button>`).join(''))
   +sec('Settings',r.sets.map(x=>`<button class="sr" data-a="srset" data-v="${x[2]}"><b>${x[0]}</b><span class="lhgo">›</span></button>`).join(''))
   +sec('Exercises',r.ex.map(id=>`<div class="sr"><b>${esc(E[id].n)}</b><span class="srb"><button class="mini demo" data-a="demo" data-e="${id}">${IC.play} Demo</button>${(H[id]||[]).length?`<button class="mini" data-a="lifthist" data-e="${id}">History</button>`:''}</span></div>`).join(''))
   +sec('Supplements',r.sp.map(e=>`<button class="sr" data-a="srsupp" data-v="${esc(e.n)}"><b>${esc(e.n)}</b><span class="muted">${esc(e.b[0]||'')}</span></button>`).join(''))
   +sec('Past sessions',r.days.map(x=>`<button class="sr" data-a="histday" data-d="${x.d}"><b>${nice(x.d)}</b><span class="muted">${x.t?esc(x.t.n)+' · ':''}${x.n} move${x.n>1?'s':''}</span></button>`).join(''));
  return out||'<p class="muted">Nothing found. Try a shorter word.</p>'}
function searchSheet(q){UI.srq=q||'';openSheet(`<h4 class="disp">Search</h4><input type="search" id="srq" data-in="srq" placeholder="Exercises, supplements, settings…" value="${esc(UI.srq)}" autocomplete="off" aria-label="Search IRON"><div id="srlist" data-raw>${srHTML(UI.srq)}</div><button class="cta ghost" data-a="close">Close</button>`);setTimeout(()=>{const i=document.getElementById('srq');i&&i.focus()},60)}
document.addEventListener('input',ev=>{const el=ev.target;if(el.dataset&&el.dataset.in==='srq'){UI.srq=el.value;const L=document.getElementById('srlist');if(L)L.innerHTML=srHTML(el.value)}});
document.addEventListener('click',ev=>{const el=ev.target.closest('[data-a]');if(!el)return;const a=el.dataset.a;
  if(a==='search')searchSheet('');
  if(a==='srq'){const i=document.getElementById('srq');if(i){i.value=el.dataset.v;i.dispatchEvent(new Event('input',{bubbles:true}))}}
  if(a==='srsupp')guideSheet(el.dataset.v);
  if(a==='srset'){const v=el.dataset.v;
    if(v==='injcard'){closeSheet();UI.tab='plan';rerender();setTimeout(()=>{const c=document.getElementById('injcard');c&&c.scrollIntoView({behavior:'smooth'})},50);return}
    if(v==='settings'||v==='remcard'){settingsSheet();if(v==='remcard')setTimeout(()=>{const c=document.getElementById('remcard');c&&c.scrollIntoView({behavior:'smooth'})},60);return}
    const b=document.createElement('button');b.dataset.a=v;b.dataset.e='';b.hidden=true;document.body.appendChild(b);b.click();b.remove()}
});
