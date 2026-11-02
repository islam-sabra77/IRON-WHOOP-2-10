"use strict";
/* ---------- COACH LINK: a read-only, encrypted summary you can send to a coach ---------- */
function coachSnapshot(){
  HISTCACHE=null;const t=todayS(),from=addD(t,-41),H=hist(),sessions=[];
  Object.keys(S.logs).filter(d=>d>=from&&d<=t).sort().reverse().forEach(d=>{const l=S.logs[d],k=tplOf(d),ex=[];
    Object.keys(l).forEach(s=>{if(s[0]==='_'||!l[s]||!l[s].ex||!E[l[s].ex])return;const sets=(l[s].sets||[]).filter(q=>q.d).map(q=>[q.w===''?null:+q.w,q.r===''?null:+q.r,q.e||null]);if(sets.length)ex.push({n:E[l[s].ex].n,sets,t:!!E[l[s].ex].t})});
    if(ex.length)sessions.push({d,title:k&&T[k]?T[k].n:'Workout',rdy:readyOf(d)||'',ex})});
  const lifts=Object.keys(H).filter(x=>E[x]&&!E[x].bw&&!E[x].t).sort((a,b)=>H[b].length-H[a].length).slice(0,8).map(x=>({n:E[x].n,pts:H[x].slice(-16).map(q=>[q.d,Math.round(Math.max(...q.sets.map(s=>e1rm(+s.w,+s.r))))])}));
  const rec=[],wt=[];for(let i=27;i>=0;i--){const d=addD(t,-i),w=W(d);if(w&&w.rec!=null)rec.push([d,Math.round(w.rec),w.hrv!=null?Math.round(w.hrv):null,w.sleep!=null?+(+w.sleep).toFixed(1):null])}
  for(let i=89;i>=0;i--){const d=addD(t,-i),v=mval('weight',d);if(v!=null)wt.push([d,+(+v).toFixed(1)])}
  const A=analyze(),inj=[...injOn(t)].map(j=>({j:INJ[j],note:(injList().find(x=>x.j===j&&!x.to)||{}).note||''}));
  return{v:1,name:(S.prof&&S.prof.ans&&S.prof.ans.name)||'',made:Date.now(),plan:{start:S.start,end:S.end,week:inPlan(t)?weekNo(t):null,weeks:totalWeeks(),phase:inPlan(t)?phaseOf(t).name||'':''},adh:A.adh,sessions,lifts,rec,wt,inj,units:imperial()?'lb':'kg'}}
async function coachCreate(days){
  const key=crypto.getRandomValues(new Uint8Array(32)),ck=await crypto.subtle.importKey('raw',key,'AES-GCM',false,['encrypt']);
  const enc=await sealState(coachSnapshot(),ck);const r=await fetch('/api/share',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({enc,days})});
  if(!r.ok)throw new Error('share '+r.status);const j=await r.json();
  const url=location.origin+location.pathname.replace(/[^/]*$/,'')+'share.html#'+j.id+'.'+u82hex(key);
  S.coach={id:j.id,del:j.del,exp:j.exp,url};save();return url}
function coachSheet(){const c=S.coach&&S.coach.exp>Date.now()?S.coach:null;
  openSheet(`<h4 class="disp">Share with a coach</h4><p class="muted" style="font-size:14px;margin:0 0 8px">A private, read-only page with your last 6 weeks: every session and set, lift trends, WHOOP recovery, body weight and active injuries. It is encrypted on this phone; only people with the link can open it.</p>
  ${c?`<div class="card" style="margin:0 0 8px"><b>Your link</b><div class="muted" style="font-size:13px">Expires ${nice(new Date(c.exp).toISOString().slice(0,10))}. It shows data up to when it was made.</div><input readonly id="coachurl" value="${esc(c.url)}" aria-label="Coach link" style="width:100%;margin:8px 0"><div class="grid2"><button class="cta" style="margin:0;--c:var(--upper)" data-a="coachsend">Send link</button><button class="cta ghost" style="margin:0" data-a="coachoff">Turn off link</button></div></div><button class="cta ghost" data-a="coachmake" data-v="30">Make a fresh link</button>`
  :`<div class="obrow">${[[7,'1 week'],[30,'30 days'],[90,'90 days']].map(([d,l])=>`<button class="obopt" data-a="coachmake" data-v="${d}"><b>${l}</b><span>Link works for</span></button>`).join('')}</div>`}
  <button class="cta ghost" data-a="close">Close</button>`)}
document.addEventListener('click',ev=>{const el=ev.target.closest('[data-a]');if(!el)return;const a=el.dataset.a;
  if(a==='coach')coachSheet();
  if(a==='coachmake'){el.disabled=true;(async()=>{try{if(S.coach){fetch('/api/share?id='+S.coach.id,{method:'DELETE',headers:{'x-share-del':S.coach.del}}).catch(()=>{})}await coachCreate(+el.dataset.v||30);coachSheet();toast('Coach link ready')}catch(e){el.disabled=false;toast('Couldn’t make a link. Check your connection')}})()}
  if(a==='coachsend'&&S.coach){const u=S.coach.url;if(navigator.share)navigator.share({title:'My IRON training',url:u}).catch(()=>{});else{navigator.clipboard&&navigator.clipboard.writeText(u).then(()=>toast('Link copied')).catch(()=>{})}}
  if(a==='coachoff'&&S.coach){const c=S.coach;fetch('/api/share?id='+c.id,{method:'DELETE',headers:{'x-share-del':c.del}}).then(r=>{if(!r.ok)throw 0;delete S.coach;save();coachSheet();toast('Link turned off')}).catch(()=>toast('Couldn’t turn it off. Try again'))}
});
