"use strict";
/* ---------- INJURIES ----------
   Each injury has a start date and, once healed, an end date. On days an injury is active,
   moves that load that joint are swapped for safe ones and its mobility is added.
   Healing it brings the normal moves back from that day on; past days stay as they were logged. */
const INJ_SHORT={lb:'lower back',sh:'shoulder',kn:'knee',el:'elbow',wr:'wrist',hp:'hip',an:'ankle'};
let INJCACHE={};
function injList(){
  if(!Array.isArray(S.injuries)){const a=S.prof&&S.prof.ans;S.injuries=((a&&a.inj)||[]).map((j,i)=>({id:'i'+Date.now()+i,j,from:'',to:'',note:''}))}
  return S.injuries}
function injOn(d){const k='d'+d;if(INJCACHE[k])return INJCACHE[k];const s=new Set();injList().forEach(x=>{if((!x.from||x.from<=d)&&(!x.to||x.to>d))s.add(x.j)});return INJCACHE[k]=s}
function injHit(ex,set){const m=META[ex];if(!m||!set||!set.size)return null;return m.av.find(j=>set.has(j))||null}
/* the closest safe move: listed alternatives first, then the same movement pattern, then nearby ones */
function injSafeFor(ex,set){
  const key=ex+'|'+[...set].sort().join(',');if(key in INJCACHE)return INJCACHE[key];
  const m=META[ex];let best=null;
  if(m&&E[ex]){
    const a=S.prof&&S.prof.ans,eqs=a?eqList(a.equip):null,pats=[m.pat,...((typeof PAT_NEAR==='object'&&PAT_NEAR[m.pat])||[])],alts=E[ex].a||[];
    const score=id=>{const q=META[id];return pats.indexOf(q.pat)*10+Math.abs(q.lvl-m.lvl)+(!!E[id].t!==!!E[ex].t?4:0)+(eqs&&!eqs.includes(q.eq)?20:0)+(alts.includes(id)?-8:0)+(q.eq===m.eq?-.5:0)};
    const c=Object.keys(META).filter(id=>id!==ex&&id!=='rampUp'&&E[id]&&pats.includes(META[id].pat)&&!META[id].av.some(j=>set.has(j)));
    c.sort((x,y)=>score(x)-score(y)||(x<y?-1:1));best=c[0]||null}
  return INJCACHE[key]=best}
function injSwap(d,x){const set=injOn(d);if(!injHit(x,set))return x;return injSafeFor(x,set)||x}
/* why a move differs from the plan, for the small note under it */
function injWhy(d,it){
  if(!it||(S.swaps[d]&&S.swaps[d][it.slot]))return'';const x=S.swapsAll[it.base]||it.base,j=injHit(x,injOn(d));if(!j)return'';
  return x!==it.ex?`Swapped from ${E[x].n} to protect your ${INJ_SHORT[j]}`:`Loads your ${INJ_SHORT[j]}: go light or tap Replace`}
function injNote(d,it){const w=injWhy(d,it);return w?`<span class="chipinj injsw" style="--c:var(--warn,#E0A800)">${IC.info} ${esc(w)}</span>`:''}

/* healing an injury from the questionnaire also rebuilds the plan with the moves it had left out */
function injRebuildIfHealed(){
  const a=S.prof&&S.prof.ans;if(!a||!S.prof.plan)return false;const now=[...injOn(todayS())],was=a.inj||[];
  if(!was.some(j=>!now.includes(j)))return false;
  const t=todayS();Object.keys(S.logs).forEach(d=>{if(d>=t)return;const l=S.logs[d];Object.keys(l).forEach(k=>{if(k[0]==='_'||!l[k]||!l[k].ex)return;S.swaps[d]=S.swaps[d]||{};if(!S.swaps[d][k])S.swaps[d][k]=l[k].ex})});
  const P=buildPlan(Object.assign({},a,{inj:now}));S.prof.plan=Object.assign({},S.prof.plan,{tpls:P.tpls,mob:P.mob,wu:P.wu,rot:P.rot});a.inj=now;return true}

function injCard(){
  const L=injList(),t=todayS(),act=L.filter(x=>(!x.from||x.from<=t)&&(!x.to||x.to>t)),soon=L.filter(x=>x.from&&x.from>t),past=L.filter(x=>x.to&&x.to<=t);
  const row=x=>`<div class="injrow" data-raw><div class="injh"><b>${esc(INJ[x.j]||x.j)}</b><span class="muted">${x.from?'since '+nice(x.from):'from your questionnaire'}${x.to?' · healed '+nice(x.to):''}</span></div>
    ${x.to?'':`<label class="fld wide"><input data-in="injnote" data-k="${x.id}" value="${esc(x.note||'')}" placeholder="Note (optional)" aria-label="Note for ${esc(INJ[x.j])}"></label>
    <div class="srow"><b>Started</b><input type="date" data-in="injfrom" data-k="${x.id}" value="${x.from||''}"></div>`}
    <div class="row2">${x.to?`<button class="mini" data-a="injunheal" data-k="${x.id}">Still hurts</button>`:`<button class="mini p" data-a="injheal" data-k="${x.id}">${IC.check} Healed</button>`}<button class="mini" data-a="injdel" data-k="${x.id}">Remove</button></div></div>`;
  return`<div class="card" id="injcard"><h4 class="disp" style="font-size:22px;margin:0 0 4px">Injuries and limits</h4>
  <p class="muted" style="font-size:14px;margin:0 0 8px">While an injury is active, IRON swaps moves that load it for safe ones and adds mobility for that area. Mark it healed and your normal moves come back from that day.</p>
  ${act.length?act.map(row).join(''):'<p class="muted" style="font-size:14px">No active injuries. All moves are in.</p>'}
  ${soon.map(row).join('')}
  <label class="fl2">Add an injury from today</label><div class="obrow wrap">${Object.keys(INJ).map(k=>`<button class="obopt" data-a="injadd" data-v="${k}" ${act.some(x=>x.j===k)?'disabled':''}><b>${INJ[k]}</b></button>`).join('')}</div>
  ${past.length?`<details style="margin-top:8px"><summary class="muted">Healed (${past.length})</summary>${past.map(row).join('')}</details>`:''}</div>`}

function injChanged(msg){INJCACHE={};HISTCACHE=null;const rebuilt=injRebuildIfHealed();save();
  if(rebuilt){try{sessionStorage.setItem('iron-toast',msg+'. Your full plan is back.')}catch(e){}location.reload();return}
  const inSheet=!!document.querySelector('#panel #injcard');toast(msg);rerender();if(inSheet)settingsSheet()}
document.addEventListener('click',ev=>{const el=ev.target.closest('[data-a]');if(!el)return;const a=el.dataset.a;if(!/^inj/.test(a))return;
  const L=injList(),x=L.find(q=>q.id===el.dataset.k),t=todayS();
  if(a==='injadd'){const j=el.dataset.v;L.push({id:'i'+Date.now(),j,from:t,to:'',note:''});injChanged(`Added ${INJ_SHORT[j]}. Moves that load it are swapped from today`)}
  if(a==='injheal'&&x){x.to=t;if(x.from&&x.from>t)L.splice(L.indexOf(x),1);injChanged(`Great, your ${INJ_SHORT[x.j]} is marked healed`)}
  if(a==='injunheal'&&x){x.to='';injChanged(`Your ${INJ_SHORT[x.j]} is active again`)}
  if(a==='injdel'&&x){L.splice(L.indexOf(x),1);injChanged(`Removed ${INJ_SHORT[x.j]}`)}
});
document.addEventListener('change',ev=>{const el=ev.target;if(!el.dataset||!/^inj/.test(el.dataset.in||''))return;const x=injList().find(q=>q.id===el.dataset.k);if(!x)return;
  if(el.dataset.in==='injnote'){x.note=el.value.trim().slice(0,200);save()}
  if(el.dataset.in==='injfrom'&&el.value){x.from=el.value;injChanged('Start date updated')}
});
try{const m=sessionStorage.getItem('iron-toast');if(m){sessionStorage.removeItem('iron-toast');setTimeout(()=>toast(m),600)}}catch(e){}
