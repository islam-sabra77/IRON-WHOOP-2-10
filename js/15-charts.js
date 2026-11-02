"use strict";
/* ---------- CHARTS: axes, tap any point for its value, recovery vs training ---------- */
let CHART_N=0;
/* line chart with a value axis, dates along the bottom and tappable points.
   pts: numbers or {d,v}; dates: optional list matching pts */
function axisChart(pts,c,u,dates){
  const P=pts.map((p,i)=>typeof p==='object'?p:{v:p,d:dates?dates[i]:null}).filter(p=>p.v!=null&&!isNaN(p.v));if(P.length<2)return'';
  const id='ac'+(++CHART_N),W=340,H=150,X0=36,X1=332,Y0=12,Y1=124;let mn=Math.min(...P.map(p=>p.v)),mx=Math.max(...P.map(p=>p.v));const pad=(mx-mn)*.12||Math.max(1,mx*.05);mn-=pad;mx+=pad;
  const sx=i=>X0+i/(P.length-1)*(X1-X0),sy=v=>Y1-(v-mn)/(mx-mn)*(Y1-Y0),fmt=v=>Math.abs(mx)>=1000?(v/1000).toFixed(1)+'k':Math.abs(mx-mn)<10?(+v).toFixed(1):Math.round(v);
  let g='';for(let i=0;i<=3;i++){const v=mn+(mx-mn)*i/3,y=sy(v);g+=`<line x1="${X0}" x2="${X1}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}" stroke="var(--ln)"/><text x="${X0-5}" y="${(y+3.5).toFixed(1)}" text-anchor="end" font-size="10" font-weight="700" fill="var(--mu)">${fmt(v)}</text>`}
  const xy=P.map((p,i)=>[sx(i),sy(p.v)]),line=xy.map(q=>q[0].toFixed(1)+','+q[1].toFixed(1)).join(' ');
  const xl=P[0].d?[0,P.length-1].map(i=>`<text x="${xy[i][0].toFixed(1)}" y="${H-6}" text-anchor="${i?'end':'start'}" font-size="10" font-weight="700" fill="var(--mu)">${short(P[i].d)}</text>`).join(''):'';
  const dots=P.map((p,i)=>`<circle cx="${xy[i][0].toFixed(1)}" cy="${xy[i][1].toFixed(1)}" r="3.5" fill="${c}"/><circle class="chit" cx="${xy[i][0].toFixed(1)}" cy="${xy[i][1].toFixed(1)}" r="13" fill="transparent" data-a="chartpt" data-c="${id}" data-x="${(xy[i][0]/W*100).toFixed(1)}" data-y="${xy[i][1].toFixed(1)}" data-t="${esc((p.d?short(p.d)+' · ':'')+(+p.v).toFixed(Math.abs(p.v)<100&&p.v%1?1:0)+' '+(u||''))}"/>`).join('');
  return`<div class="achart" id="${id}" data-raw><svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Chart from ${fmt(P[0].v)} to ${fmt(P[P.length-1].v)} ${u||''}">${g}<polyline points="${line}" fill="none" stroke="${c}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>${xl}${dots}</svg><span class="ctip"></span></div>`}
document.addEventListener('click',ev=>{const el=ev.target.closest('[data-a="chartpt"]');if(!el)return;const w=document.getElementById(el.dataset.c);if(!w)return;const t=w.querySelector('.ctip');
  t.textContent=el.dataset.t;const cw=w.clientWidth,half=t.offsetWidth/2;t.style.left=Math.min(cw-half,Math.max(half,+el.dataset.x/100*cw))+'px';t.style.top=Math.max(0,+el.dataset.y/150*w.clientWidth*150/340-30)+'px';t.style.opacity='1';clearTimeout(w._t);w._t=setTimeout(()=>{t.style.opacity='0'},2600)});

/* training load per day: logged volume (kg), or WHOOP strain when nothing was logged */
function dayLoad(d){const l=S.logs[d]||{};let vol=0,sets=0;Object.keys(l).forEach(k=>{if(k[0]==='_')return;(l[k].sets||[]).forEach(s=>{if(s.d){sets++;vol+=(+s.w||0)*(+s.r||0)}})});return{vol,sets}}
function recTrain(n){
  n=n||28;const t=todayS(),days=[];for(let i=n-1;i>=0;i--){const d=addD(t,-i),w=typeof W==='function'?W(d):null;days.push({d,rec:w&&w.rec!=null?+w.rec:null,strain:w&&w.strain!=null?+w.strain:null,...dayLoad(d)})}
  // recovery the morning after a hard day vs after an easy or rest day
  const vols=days.map(x=>x.sets).filter(Boolean).sort((a,b)=>a-b),hardCut=vols.length?vols[Math.floor(vols.length/2)]:Infinity;
  const after=(f)=>{const a=[];for(let i=0;i<days.length-1;i++)if(f(days[i])&&days[i+1].rec!=null)a.push(days[i+1].rec);return a.length?Math.round(a.reduce((p,q)=>p+q,0)/a.length):null};
  return{days,hard:after(x=>x.sets>=hardCut&&x.sets>0),easy:after(x=>!x.sets)}}
function recTrainCard(){
  const R=recTrain(28),D=R.days,hasRec=D.some(x=>x.rec!=null),hasLoad=D.some(x=>x.sets);if(!hasRec&&!hasLoad)return'';
  const W2=340,H=150,X0=30,X1=310,Y0=12,Y1=124,bw=(X1-X0)/D.length,mxSets=Math.max(1,...D.map(x=>x.sets));
  let g='';[0,50,100].forEach(v=>{const y=Y1-v/100*(Y1-Y0);g+=`<line x1="${X0}" x2="${X1}" y1="${y}" y2="${y}" stroke="var(--ln)"/><text x="${X0-4}" y="${y+3.5}" text-anchor="end" font-size="10" font-weight="700" fill="var(--rec,#12B76A)">${v}%</text>`});
  g+=`<text x="${X1+4}" y="${Y0+4}" font-size="10" font-weight="700" fill="var(--upper)">${mxSets}</text><text x="${X1+4}" y="${Y1}" font-size="10" font-weight="700" fill="var(--upper)">0</text>`;
  let bars='',line='',hits='';D.forEach((x,i)=>{const cx=X0+i*bw+bw/2;
    if(x.sets){const hh=x.sets/mxSets*(Y1-Y0);bars+=`<rect x="${(cx-bw/2+1).toFixed(1)}" y="${(Y1-hh).toFixed(1)}" width="${Math.max(2,bw-2).toFixed(1)}" height="${hh.toFixed(1)}" rx="2" fill="var(--upper)" opacity=".35"/>`}
    if(x.rec!=null)line+=`${cx.toFixed(1)},${(Y1-x.rec/100*(Y1-Y0)).toFixed(1)} `;
    const tip=`${short(x.d)} · ${x.rec!=null?'recovery '+Math.round(x.rec)+'%':'no recovery data'}${x.sets?' · '+x.sets+' sets, '+Math.round(x.vol).toLocaleString()+' kg':' · rest'}`;
    hits+=`<rect x="${(cx-bw/2).toFixed(1)}" y="${Y0}" width="${bw.toFixed(1)}" height="${Y1-Y0}" fill="transparent" data-a="chartpt" data-c="rtc" data-x="${(cx/W2*100).toFixed(1)}" data-y="${x.rec!=null?(Y1-x.rec/100*(Y1-Y0)).toFixed(1):60}" data-t="${esc(tip)}"/>`});
  const recDots=D.map((x,i)=>x.rec==null?'':`<circle cx="${(X0+i*bw+bw/2).toFixed(1)}" cy="${(Y1-x.rec/100*(Y1-Y0)).toFixed(1)}" r="2.6" fill="${typeof recCol==='function'?recCol(x.rec):'#12B76A'}"/>`).join('');
  const xl=`<text x="${X0}" y="${H-6}" font-size="10" font-weight="700" fill="var(--mu)">${short(D[0].d)}</text><text x="${X1}" y="${H-6}" text-anchor="end" font-size="10" font-weight="700" fill="var(--mu)">${short(D[D.length-1].d)}</text>`;
  let insight='';if(R.hard!=null&&R.easy!=null){const diff=R.easy-R.hard;insight=diff>=8?`After your harder sessions, next-day recovery averages <b>${R.hard}%</b> vs <b>${R.easy}%</b> after rest days. Keep hard days apart and protect sleep after them.`:diff<=-3?`Your recovery holds up well after hard sessions (<b>${R.hard}%</b> vs <b>${R.easy}%</b> after rest). You have room to push.`:`Next-day recovery is similar after hard sessions (<b>${R.hard}%</b>) and rest days (<b>${R.easy}%</b>). Your training load looks well matched.`}
  else if(!hasRec)insight='Connect WHOOP to see how your training affects next-day recovery.';else insight='Log a few more sessions to compare recovery after hard and easy days.';
  return`<div class="card"><h4 class="disp">Recovery vs training</h4><div class="muted" style="font-size:13px;margin-bottom:6px">Last 4 weeks. <b style="color:var(--upper)">Bars: sets logged</b>, <b style="color:#12B76A">line: WHOOP recovery</b>. Tap a day for details.</div>
  <div class="achart" id="rtc" data-raw><svg viewBox="0 0 ${W2} ${H}" width="100%" role="img" aria-label="Recovery and training over the last 4 weeks">${g}${bars}${line?`<polyline points="${line}" fill="none" stroke="#12B76A" stroke-width="2.2" stroke-linejoin="round"/>`:''}${recDots}${xl}${hits}</svg><span class="ctip"></span></div>
  <p style="font-size:14px;margin:8px 0 0">${insight}</p></div>`}
