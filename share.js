"use strict";
const $=document.getElementById('app'),esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const MN=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],DN=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const pd=s=>{const a=s.split('-').map(Number);return new Date(a[0],a[1]-1,a[2])},short=s=>{const d=pd(s);return d.getDate()+' '+MN[d.getMonth()]},nice=s=>{const d=pd(s);return DN[d.getDay()]+' '+d.getDate()+' '+MN[d.getMonth()]};
const fail=m=>{$.innerHTML='<div class="err"><h1>Link not available</h1><p class="muted">'+esc(m)+'</p></div>'};
const b642u8=s=>Uint8Array.from(atob(s),c=>c.charCodeAt(0)),hex2u8=h=>new Uint8Array(h.match(/../g).map(x=>parseInt(x,16)));
async function gunzip(u8){const s=new Blob([u8]).stream().pipeThrough(new DecompressionStream('gzip'));return new Uint8Array(await new Response(s).arrayBuffer())}
function line(pts,c,unit){if(pts.length<2)return'';const W=120,H=30,v=pts.map(p=>p[1]),mn=Math.min(...v),mx=Math.max(...v),rg=mx-mn||1;return`<svg viewBox="0 0 ${W} ${H}" width="120" height="30" aria-hidden="true"><polyline points="${pts.map((p,i)=>(i/(pts.length-1)*(W-4)+2).toFixed(1)+','+(H-3-(p[1]-mn)/rg*(H-6)).toFixed(1)).join(' ')}" fill="none" stroke="${c}" stroke-width="2.2" stroke-linejoin="round"/></svg>`}
function bars(rec){const W=360,H=110;if(!rec.length)return'';const bw=W/rec.length;return`<svg viewBox="0 0 ${W} ${H+18}" width="100%" role="img" aria-label="Recovery by day">${[0,50,100].map(v=>`<line x1="0" x2="${W}" y1="${H-v/100*H}" y2="${H-v/100*H}" stroke="var(--ln)"/>`).join('')}${rec.map((r,i)=>{const h=r[1]/100*H;return`<rect x="${(i*bw+1).toFixed(1)}" y="${(H-h).toFixed(1)}" width="${(bw-2).toFixed(1)}" height="${h.toFixed(1)}" rx="3" fill="${r[1]>=67?'var(--ok)':r[1]>=34?'var(--warn)':'var(--bad)'}"><title>${short(r[0])}: ${r[1]}%</title></rect>`}).join('')}<text x="0" y="${H+14}" font-size="11" fill="var(--mu)">${short(rec[0][0])}</text><text x="${W}" y="${H+14}" font-size="12" text-anchor="end" fill="var(--mu)">${short(rec[rec.length-1][0])}</text></svg>`}
function render(D){
  const lb=D.units==='lb',w=v=>v==null?'–':lb?Math.round(v*2.20462):(+v%1?(+v).toFixed(1):v),u=lb?'lb':'kg';
  const avg=a=>a.length?Math.round(a.reduce((p,q)=>p+q,0)/a.length):null,recA=avg(D.rec.map(r=>r[1])),sl=D.rec.map(r=>r[3]).filter(x=>x!=null);
  let h=`<h1>${D.name?esc(D.name)+'’s training':'Training summary'}</h1><p class="sub">Read-only summary from IRON, made ${new Date(D.made).toLocaleDateString(undefined,{day:'numeric',month:'long',year:'numeric'})}.${D.plan.week?` Week ${D.plan.week} of ${D.plan.weeks}${D.plan.phase?' · '+esc(D.plan.phase):''}.`:''}</p>`;
  h+=`<div class="card"><div class="stats"><div class="stat"><b>${D.sessions.length}</b><span>Sessions in 6 weeks</span></div><div class="stat"><b>${D.adh==null?'–':Math.round(D.adh*100)+'%'}</b><span>Attendance</span></div><div class="stat"><b>${recA==null?'–':recA+'%'}</b><span>Avg recovery (4 wk)</span></div><div class="stat"><b>${sl.length?(sl.reduce((a,b)=>a+b,0)/sl.length).toFixed(1)+' h':'–'}</b><span>Avg sleep</span></div>${D.wt.length?`<div class="stat"><b>${w(D.wt[D.wt.length-1][1])} ${u}</b><span>Body weight</span></div>`:''}</div></div>`;
  if(D.inj.length)h+=`<div class="card"><h2>Active injuries</h2>${D.inj.map(i=>`<div><b>${esc(i.j)}</b>${i.note?' · <span class="muted">'+esc(i.note)+'</span>':''}</div>`).join('')}</div>`;
  if(D.lifts.length)h+=`<div class="card"><h2>Lift trends (estimated 1RM)</h2>${D.lifts.map(l=>{const a=l.pts[0][1],b=l.pts[l.pts.length-1][1];return`<div class="lift"><span>${esc(l.n)}<br><span class="muted" style="font-size:12px">${l.pts.length} sessions since ${short(l.pts[0][0])}</span></span>${line(l.pts,'var(--up)')}<span class="num">${w(b)} ${u}<br><span style="font-size:12px;color:${b>=a?'var(--ok)':'var(--bad)'}">${b>=a?'+':''}${w(b-a)}</span></span></div>`}).join('')}</div>`;
  if(D.rec.length)h+=`<div class="card"><h2>WHOOP recovery</h2>${bars(D.rec)}</div>`;
  h+=`<div class="card"><h2>Sessions</h2>${D.sessions.length?D.sessions.map((s,i)=>`<details ${i<2?'open':''}><summary><b>${nice(s.d)} · ${esc(s.title)}</b><span class="muted">${s.ex.length} moves${s.rdy?` <span class="dot" style="background:${s.rdy==='g'?'var(--ok)':s.rdy==='y'?'var(--warn)':'var(--bad)'}"></span>`:''}</span></summary>${s.ex.map(e=>`<div class="ex"><b>${esc(e.n)}</b><div class="sets">${e.sets.map(q=>e.t?(q[1]||'–')+' s':(q[0]!=null?w(q[0])+' '+u+' × ':'')+(q[1]??'–')+(q[2]?' @'+q[2]:'')).join(' · ')}</div></div>`).join('')}</details>`).join(''):'<p class="muted">No sessions logged in the last 6 weeks.</p>'}</div>`;
  h+=`<p class="muted" style="font-size:12px;text-align:center">This page is encrypted end to end. The key is in the link, not on the server.</p>`;
  $.innerHTML=h;document.title=(D.name?D.name+'’s':'IRON')+' training';
}
(async()=>{
  const m=/^#([a-f0-9]{24})\.([a-f0-9]{64})$/.exec(location.hash);if(!m)return fail('This link is incomplete. Ask for it to be sent again.');
  let r;try{r=await fetch('/api/share?id='+m[1],{cache:'no-store'})}catch(e){return fail('Couldn’t connect. Check your internet and reload.')}
  if(!r.ok)return fail('This link has expired or was turned off.');
  try{const{enc}=await r.json();const key=await crypto.subtle.importKey('raw',hex2u8(m[2]),'AES-GCM',false,['decrypt']);
    let pt=new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM',iv:b642u8(enc.iv)},key,b642u8(enc.ct)));if(enc.z)pt=await gunzip(pt);
    render(JSON.parse(new TextDecoder().decode(pt)))}catch(e){fail('This link could not be opened. It may have been copied incompletely.')}
})();
