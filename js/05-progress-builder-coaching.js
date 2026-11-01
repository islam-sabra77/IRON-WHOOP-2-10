"use strict";
/* ---------- metric detail sheet ---------- */
function openMetric(key){UI.md={key,n:UI.md&&UI.md.key===key?UI.md.n:(MET[key].src==='body'?120:30)};drawMetric()}
function drawMetric(){
  const{key,n}=UI.md,M=MET[key],t=todayS(),isBody=M.src==='body';
  const cur=isBody?lastVal(key,t):(()=>{const d=UI.wday||latestDay();const v=mval(key,d);return v!=null?{d,v}:lastVal(key,t,30)})();
  const a=cur?mavg(key,cur.d,30,true):null;
  const all=[];for(let i=0;i<400;i++){const d=addD(t,-i),v=mval(key,d);if(v!=null)all.push({d,v})}
  const best=all.length?all.reduce((p,q)=>M.dir===-1?(q.v<p.v?q:p):(q.v>p.v?q:p)):null;
  const byW=[[],[],[],[],[],[],[]];all.filter(x=>diffD(x.d,t)<=90).forEach(x=>byW[dow(x.d)].push(x.v));const wa=byW.map(q=>q.length?q.reduce((p,r)=>p+r,0)/q.length:null);
  let wk='';if(!isBody&&wa.filter(x=>x!=null).length>=5){const ok=wa.filter(x=>x!=null),mn=Math.min(...ok),mx=Math.max(...ok),rg=mx-mn||1;
    wk=`<div class="card" style="--c:${M.c}"><h4 class="disp" style="margin:0 0 8px">By day of week</h4><div class="wkbars">${wa.map((q,i)=>`<div><i style="height:${q==null?4:Math.round(14+(M.dir===-1?(mx-q):(q-mn))/rg*52)}px;background:${M.c};opacity:${q==null?.2:.85}"></i><b class="num">${q==null?'–':key==='sleep'?q.toFixed(1):key==='steps'?(q/1000).toFixed(1)+'k':(M.dec?q.toFixed(1):Math.round(q))}</b><span>${DS[i]}</span></div>`).join('')}</div><div class="pnote">Last 90 days. Taller is better${M.dir===0?' (higher)':''}.</div></div>`}
  const rows=all.slice(0,isBody?60:45).map(x=>{const av=mavg(key,x.d,30,true);const df=av!=null?x.v-av:null;const cls=df==null||M.dir===0?'neutral':(df*M.dir>=0?'good':'bad');
    return`<div class="hrow"><span>${nice(x.d)}</span><b class="num">${fmtM(key,x.v)}</b><em class="${cls}">${df==null?'':(df>=0?'+':'')+(key==='sleep'?Math.round(df*60)+'m':key==='steps'||key==='kcal'?Math.round(df).toLocaleString():(M.dec?df.toFixed(1):Math.round(df)))}</em>${isBody&&!UI.wdemo&&(B(x.d)||{})[key]!=null?`<button class="mini" data-a="bodydel" data-d="${x.d}" data-v="${key}" aria-label="Delete">✕</button>`:(isBody&&!UI.wdemo?'<span></span>':'')}</div>`}).join('');
  openSheet(`<div class="mdhead" style="--c:${M.c}"><span class="dotc"></span><h4 class="disp">${M.l}</h4></div>
  <div class="mdval" style="--c:${M.c}"><b class="disp num">${cur?fmtM(key,cur.v):'–'}</b><div><span class="muted">${cur?(cur.d===t?'Today':nice(cur.d)):'No data yet'}</span><br>${cur?deltaTxt(key,cur.v,a):''}</div></div>
  ${isBody?`<button class="cta" style="--c:${M.c};margin:4px 0 6px" data-a="bodylog">＋ Log a measurement</button>`:''}
  <div class="card" style="--c:${M.c}"><div class="chipsrow" style="margin-top:0">${(isBody?[[30,'1 month'],[90,'3 months'],[180,'6 months'],[365,'1 year']]:[[7,'7 days'],[30,'30 days'],[90,'90 days']]).map(([q,l])=>`<button class="mchip ${q===n?'on':''}" style="--c:var(--ink)" data-a="mrange" data-v="${q}">${l}</button>`).join('')}</div>
  <div class="wchart" id="mwrap"><div class="wtip" id="mtip"></div><svg id="mchart" viewBox="0 0 340 170"></svg></div><div class="kv" id="msum" style="grid-template-columns:repeat(4,1fr)"></div></div>
  <div class="kv" style="grid-template-columns:repeat(3,1fr);margin:0 0 12px"><div><b class="disp num">${a!=null?fmtM(key,a):'–'}</b><span>30-day average</span></div><div><b class="disp num">${best?fmtM(key,best.v):'–'}</b><span>${M.dir===-1?'Lowest':'Best'}${best?' · '+short(best.d):''}</span></div><div><b class="disp num">${all.length}</b><span>${isBody?'Entries':'Days of data'}</span></div></div>
  ${wk}
  <div class="card"><h4 class="disp" style="margin:0 0 4px">What it means</h4><p style="margin:0;font-size:14px">${M.about}</p></div>
  <div class="card"><h4 class="disp" style="margin:0 0 6px">History</h4>${rows||'<p class="muted" style="margin:0">Nothing logged yet.</p>'}${all.length>(isBody?60:45)?'<div class="pnote">Showing the most recent entries.</div>':''}<div class="pnote">± shows the difference from the 30-day average before that day.</div></div>
  <button class="cta ghost" data-a="close">Close</button>`);
  requestAnimationFrame(()=>drawChart('m',key,n,false));
}
function bodySheet(){
  const t=todayS(),f=k=>{const lv=lastVal(k,t);return lv?(+lv.v).toFixed(1):''};
  openSheet(`<h4 class="disp">Log body composition</h4><p class="muted" style="font-size:14px;margin:0 0 8px">Fill in what you measured. Lean mass is worked out for you from weight and body fat, so leave it empty unless your scale reports it. Grey numbers are your last entries.</p>
  <label class="fl2" for="bdate">Date</label><input type="date" id="bdate" value="${t}" max="${t}">
  <div class="grid2"><div><label class="fl2" for="b_weight">Weight (kg)</label><input type="text" inputmode="decimal" id="b_weight" placeholder="${f('weight')}"></div><div><label class="fl2" for="b_fat">Body fat (%)</label><input type="text" inputmode="decimal" id="b_fat" placeholder="${f('fat')}"></div></div>
  <label class="fl2" for="b_lean">Lean body mass (kg), optional</label><input type="text" inputmode="decimal" id="b_lean" placeholder="${f('lean')||'calculated'}">
  <button class="cta" style="--c:${WC.body}" data-a="bodysave">Save</button>`);
}


/* ---------- PROGRESS ---------- */
function planDays(){const a=[];for(let d=S.start;d<=S.end;d=addD(d,1))a.push(d);return a}
function analyze(){
  const t=todayS();const days=planDays().filter(d=>isTraining(tplOf(d)));
  const past=days.filter(d=>d<t||S.done[d]);const done=past.filter(d=>S.done[d]);
  const strPast=past.filter(d=>T[tplOf(d)].k!=='long');const strDone=strPast.filter(d=>S.done[d]);
  const adh=strPast.length?strDone.length/strPast.length:null;
  const h=hist();let up=0,tracked=0;
  Object.keys(h).forEach(ex=>{const a=h[ex];if(a.length<2)return;tracked++;const f=Math.max(...a[0].sets.map(s=>e1rm(+s.w,+s.r))),l=Math.max(...a[a.length-1].sets.map(s=>e1rm(+s.w,+s.r)));if(l>f*1.01)up++});
  const prog=tracked?up/tracked:null;
  const reds=planDays().filter(d=>d<=todayS()&&readyOf(d)==='r').length;
  let rec;
  if(adh===null||strPast.length<6)rec={vol:0,extra:false,trim:false,title:'Keep the same structure',why:'There isn\u2019t enough logged training yet to adjust. The extension continues the block cycle, and the weight suggestions keep progressing from your logs.'};
  else if(adh>=0.85&&(prog===null||prog>=0.5)&&reds<4)rec={vol:1,extra:true,trim:false,title:'Level up: more volume',why:`You completed ${Math.round(adh*100)}% of sessions and ${prog===null?'your':Math.round(prog*100)+'% of'} tracked lifts are trending up. The extension rotates in a fresh accessory superset, adds an arm set, and tightens accessory rest to 45 s, so you do more work in the same 75–90 minutes.`};
  else if(adh>=0.6)rec={vol:0,extra:false,trim:false,title:'Hold volume, keep adding load',why:`Attendance is solid at ${Math.round(adh*100)}%. Volume stays the same so recovery keeps pace; loads keep climbing through the suggestions.`};
  else rec={vol:-1,extra:false,trim:true,title:'Trim to the essentials',why:`Only ${Math.round(adh*100)}% of sessions got done, so the extension removes the optional accessory superset and one accessory set. Shorter sessions are easier to show up for.`};
  return{days,past,done,adh,prog,tracked,reds,rec};
}
function renderProgress(){
  const v=document.getElementById('view'),A=analyze(),t=todayS();
  const all=A.days.length,dn=A.days.filter(d=>S.done[d]).length;
  let sets=0,vol=0;Object.keys(S.logs).forEach(d=>{const l=S.logs[d];Object.keys(l).forEach(k=>{if(k[0]==='_')return;(l[k].sets||[]).forEach(s=>{if(s.d){sets++;vol+=(+s.w||0)*(+s.r||0)}})})});
  const pct=all?dn/all:0;
  let h=`<h2 class="pagetitle disp">Progress</h2><p class="sub">Everything here updates as you log.</p>
  <div class="card"><div class="ringwrap">${ring(pct,COLORS.upper,96,11,Math.round(pct*100)+'%')}<div><div class="disp" style="font-size:32px">${dn} of ${all} sessions</div><div class="muted" style="font-size:14px">done across the whole plan</div></div></div></div>
  <div class="grid2" style="margin-bottom:12px"><div class="stat"><b class="disp num">${A.adh===null?'–':Math.round(A.adh*100)+'%'}</b><span>Lifting attendance so far</span></div><div class="stat"><b class="disp num">${weekStreak()}</b><span>Week streak (4+ sessions)</span></div><div class="stat"><b class="disp num">${sets}</b><span>Sets logged</span></div><div class="stat"><b class="disp num">${fvol(vol)}</b><span>Total volume lifted</span></div></div>`;
  // weekly bars
  const W=totalWeeks();let bars='';const bw=Math.max(8,Math.floor(300/W)-4);
  for(let w=1;w<=W;w++){const s=addD(sunOf(S.start),(w-1)*7);let sch=0,don=0;for(let i=0;i<7;i++){const d=addD(s,i);if(isTraining(tplOf(d))){sch++;if(S.done[d])don++}}
    const H=90,hh=sch?don/sch*H:0,x=(w-1)*(bw+4);bars+=`<rect x="${x}" y="0" width="${bw}" height="${H}" rx="4" fill="var(--sf2)"/><rect x="${x}" y="${H-hh}" width="${bw}" height="${hh}" rx="4" fill="${phaseOf(addD(s,1)).deload?'#9aa8ff':COLORS.upper}"/><text x="${x+bw/2}" y="${H+14}" font-size="10" text-anchor="middle" fill="var(--mu)" font-weight="700">${w}</text>`}
  h+=`<div class="card"><h4 class="disp">Sessions per week</h4><div style="overflow-x:auto"><svg viewBox="0 0 ${W*(bw+4)} 108" width="100%" style="min-width:${W*(bw+4)}px;display:block">${bars}</svg></div></div>`;
  // lifts
  const hs=hist();const liftsAll=Object.keys(hs).filter(ex=>E[ex]&&!E[ex].bw&&!E[ex].t).sort((a,b)=>hs[b].length-hs[a].length),lifts=UI.allLifts?liftsAll:liftsAll.slice(0,10);
  if(S.whoop.connected)h+=`<button class="card" style="display:block;width:100%;text-align:left" data-a="tab" data-v="whoop"><h4 class="disp" style="margin:0">WHOOP dashboard →</h4><span class="muted" style="font-size:14px">Recovery, sleep, strain and trends now live in the WHOOP tab.</span></button>`;
  h+=`<div class="card"><h4 class="disp">Strength trends</h4>`;
  if(!lifts.length)h+=`<p class="muted" style="margin:0;font-size:14px">Log weights and reps on any exercise and its estimated one-rep max shows up here, session by session.</p>`;
  lifts.forEach(ex=>{const pts=hs[ex].map(x=>Math.max(...x.sets.map(s=>e1rm(+s.w,+s.r))));const best=Math.max(...hs[ex].map(x=>Math.max(...x.sets.map(s=>+s.w))));
    h+=`<button class="lh" data-a="lifthist" data-e="${ex}" aria-label="See ${esc(E[ex].n)} history"><div class="lhr"><div style="flex:1;min-width:0"><b style="font-size:15px">${esc(E[ex].n)}</b><div class="muted num" style="font-size:13px">Best ${best} kg, ${hs[ex].length} session${hs[ex].length>1?'s':''}</div></div>${spark(pts)}<span class="lhgo">›</span></div></button>`});
  if(lifts.length)h+=`<p class="tapnote" style="margin:6px 0 0">Tap any lift to see every session and set.</p>`;
  if(liftsAll.length>10)h+=`<button class="cta ghost" data-a="alllifts">${UI.allLifts?'Show top 10':'Show all '+liftsAll.length+' lifts'}</button>`;
  h+=`</div>`;
  {const pl=plateaus();if(pl.length)h+=`<div class="card"><h4 class="disp">Stalled lifts</h4><p class="muted" style="font-size:14px;margin:0 0 6px">No new best in the last 3 sessions. Tap one for ways to break through.</p>${pl.map(x=>`<button class="lh" data-a="lifthist" data-e="${x.ex}"><div class="lhr"><div style="flex:1"><b style="font-size:15px">${esc(E[x.ex].n)}</b><div class="muted" style="font-size:13px">Best ${x.best} kg e1RM · ${esc(x.fixes[0])}</div></div><span class="lhgo">›</span></div></button>`).join('')}</div>`}
  h+=`<button class="card setlink" data-a="report"><h4 class="disp" style="margin:0">${IC.chart} Weekly report ›</h4><span class="muted" style="font-size:14px">Sessions, volume, records, recovery and next week\u2019s focus</span></button>`;
  h+=ibCard();
  // extend
  const r=A.rec;
  h+=`<div class="card" id="extend"><h4 class="disp">Extend the plan</h4><p class="muted" style="font-size:14px;margin:0 0 8px">Pick a new end date. The extension reads your attendance and lift trends, then adjusts volume and exercises. Loads keep progressing from your logs.</p>
  <div class="ext-rec" style="--c:${r.vol>0?COLORS.ok||'#12B76A':r.vol<0?'#EF3B55':COLORS.upper}"><b>${r.title}</b><div style="font-size:14px;margin-top:2px">${r.why}</div></div>
  <div class="srow"><b>New end</b><input type="date" id="extEnd" value="${addD(S.end,56)}" min="${addD(S.end,7)}"></div>
  <button class="cta" style="--c:var(--upper)" data-a="extend">Extend with these changes</button>
  ${S.ext.length?`<div style="margin-top:12px">${S.ext.map((x,i)=>`<div class="muted" style="font-size:13px">Extension ${i+1}: ${short(x.from)} to ${short(x.to)}, ${x.vol>0?'more volume':x.vol<0?'trimmed':'same volume'}</div>`).join('')}<button class="cta ghost" data-a="unextend">Remove the last extension</button></div>`:''}</div>`;
  v.innerHTML=h;
}
function whoopTrend(){
  if(!S.whoop.connected)return'';const t=todayS(),days=[];for(let i=29;i>=0;i--){const d=addD(t,-i);days.push([d,S.wdata[d]])}
  const have=days.filter(x=>x[1]&&x[1].rec!=null);if(!have.length)return`<div class="card"><h4 class="disp">WHOOP trends</h4><p class="muted" style="margin:0;font-size:14px">Your recovery, HRV and resting HR will chart here after the first sync.</p></div>`;
  const W=300,H=110,bw=W/30;let bars='',hp='',rp='';const hv=have.map(x=>x[1].hrv).filter(v=>v!=null),rv=have.map(x=>x[1].rhr).filter(v=>v!=null);
  const hmin=Math.min(...hv),hmax=Math.max(...hv),rmin=Math.min(...rv),rmax=Math.max(...rv);
  days.forEach(([d,x],i)=>{if(!x||x.rec==null)return;const hh=x.rec/100*H;const c=x.rec>=67?'#12B76A':x.rec>=34?'#F59E0B':'#EF3B55';bars+=`<rect x="${(i*bw+1).toFixed(1)}" y="${(H-hh).toFixed(1)}" width="${(bw-2).toFixed(1)}" height="${hh.toFixed(1)}" rx="2" fill="${c}" opacity=".55"/>`;
    const cx=(i*bw+bw/2).toFixed(1);if(x.hrv!=null)hp+=`${cx},${(H-8-(x.hrv-hmin)/((hmax-hmin)||1)*(H-24)).toFixed(1)} `;if(x.rhr!=null)rp+=`${cx},${(H-8-(x.rhr-rmin)/((rmax-rmin)||1)*(H-24)).toFixed(1)} `});
  const avg=a=>a.length?Math.round(a.reduce((p,q)=>p+q,0)/a.length):'–';
  return`<div class="card"><h4 class="disp">WHOOP trends</h4><div class="muted" style="font-size:13px;margin-bottom:6px">Last 30 days. Bars: recovery. Lines: <b style="color:#2F5BFF">HRV</b> and <b style="color:#FF2D78">resting HR</b>.</div>
  <svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block">${bars}<polyline points="${hp}" fill="none" stroke="#2F5BFF" stroke-width="2.5" stroke-linejoin="round"/><polyline points="${rp}" fill="none" stroke="#FF2D78" stroke-width="2.5" stroke-linejoin="round" stroke-dasharray="4 3"/></svg>
  <div class="grid2" style="grid-template-columns:repeat(3,1fr);margin-top:10px"><div class="stat"><b class="disp num">${avg(have.map(x=>x[1].rec))}%</b><span>Avg recovery</span></div><div class="stat"><b class="disp num">${avg(hv)}</b><span>Avg HRV ms</span></div><div class="stat"><b class="disp num">${avg(rv)}</b><span>Avg RHR</span></div></div></div>`;
}
function weekStreak(){const t=todayS();let w=sunOf(t),n=0;const cnt=s=>{let c=0;for(let i=0;i<7;i++)if(S.done[addD(s,i)])c++;return c};if(cnt(w)<4)w=addD(w,-7);while(w>=sunOf(S.start)&&cnt(w)>=4){n++;w=addD(w,-7)}return n}
function ring(p,c,size,sw,label){const r=(size-sw)/2,C=2*Math.PI*r;return`<svg class="ring" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="var(--sf2)" stroke-width="${sw}"/><circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${c}" stroke-width="${sw}" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C*(1-Math.min(1,p))}" transform="rotate(-90 ${size/2} ${size/2})"/>${label?`<text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" font-size="${size/4.6}" font-weight="850" fill="var(--ink)" style="font-stretch:68%">${label}</text>`:''}</svg>`}
function spark(pts){const W=110,H=34;if(pts.length<2)return`<span class="pill" style="--c:${COLORS.upper}">${Math.round(pts[0])} e1RM</span>`;const mn=Math.min(...pts),mx=Math.max(...pts),rg=mx-mn||1;const p=pts.map((v,i)=>`${(i/(pts.length-1)*(W-6)+3).toFixed(1)},${(H-3-(v-mn)/rg*(H-6)).toFixed(1)}`).join(' ');const up=pts[pts.length-1]>=pts[0];return`<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><polyline points="${p}" fill="none" stroke="${up?'#12B76A':'#EF3B55'}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/></svg>`}


/* =====================================================================
   PLAN BUILDER
   Pick a split, set each day, edit the moves in any session, choose the
   cycle length, WHOOP intensity and mobility focus. Changes apply from a
   chosen day onward; earlier weeks and logs stay as they were.
   ===================================================================== */
const BT={push:{l:'Push + legs',k:'full',spec:['gPuL']},pull:{l:'Pull + legs',k:'full',spec:['gPlL']},push0:{l:'Push (upper only)',k:'upper',spec:['gPu']},pull0:{l:'Pull (upper only)',k:'upper',spec:['gPl']},legs:{l:'Legs',k:'lower',spec:['gLg']},upper:{l:'Upper',k:'upper',spec:['gUA','gUB','gUC']},lower:{l:'Lower',k:'lower',spec:['gLA','gLB']},full:{l:'Full body',k:'full',spec:['gFA','gFB','gFC']},hiit:{l:'HIIT',k:'hiit'},long:{l:'Long cardio',k:'long'},rest:{l:'Rest',k:'rest'}};
const BPRESETS=[
  {id:'pp',l:'Push / Pull (with legs)',s:'Push days add deadlifts, hamstrings and calves; pull days add squats and quads. HIIT in the middle, long cardio at the weekend.',w:['push','pull','hiit','push','pull','rest','long']},
  {id:'ppl',l:'Push / Pull / Legs',s:'Six lifting days and one rest day',w:['push0','pull0','legs','rest','push0','pull0','legs']},
  {id:'ppl5',l:'Push / Pull / Legs + HIIT',s:'Five lifting days, a HIIT day and long cardio',w:['push0','pull0','legs','hiit','upper','lower','long']},
  {id:'ul',l:'Upper / Lower',s:'Four lifting days, HIIT and long cardio',w:['upper','lower','hiit','upper','lower','rest','long']},
  {id:'fb',l:'Full body',s:'Three full-body days, HIIT and long cardio',w:['full','rest','full','hiit','full','rest','long']}
];
const GOALS=[['muscle','Build muscle'],['strength','Get stronger'],['fat','Lose fat'],['health','General health']];
const EQ_L={gym:'Machine or cable',bb:'Barbell',db:'Dumbbell',kb:'Kettlebell',band:'Band',bw:'Bodyweight'};
const PICK_GROUPS=[['all','All'],['chest','Chest',['hpush','fly']],['back','Back',['hpull','vpull','shrug']],['shoulders','Shoulders',['vpush','lat','rear','cuff']],['arms','Arms',['bi','tri']],['legs','Legs',['squat','lunge','quad','calf','tib','abd','add']],['post','Glutes and hams',['hinge','ham','glute']],['core','Core',['coreAE','coreAR','coreLat','coreFlex','carry']],['cond','Conditioning',['cardio','power']]];
const HIIT_POOL=['kbSwing','burpee','mtnClimber','jumpSquat','battleRopes','medBallSlam','rowErg','assaultBike','skiErg','sledPush','boxJump','jumpRope','broadJump','bearCrawl','shoulderTap','skater','gobletSq','pushup','airSquat','walkLunge','dbRow','invRow'];

/* ---------- mobility focus ---------- */
const MOB_AREAS={tspine:{l:'Upper back',d:['openBook','thread','catCamel']},shoulders:{l:'Shoulders',d:['wallSlide','crossBody','sleeper','thread']},overhead:{l:'Overhead reach',d:['wallSlide','openBook','thread']},wrists:{l:'Wrists and elbows',d:['wristStretch','wristEcc']},
  hips:{l:'Hips',d:['hip9090','hipFlexPPT','couch','adductRock']},hams:{l:'Hamstrings',d:['worldGreatest','adductRock']},lowback:{l:'Low back',d:['catCamel','childPose','bridgePPT']},knees:{l:'Knees',d:['tkeMob','slBalance']},ankles:{l:'Ankles',d:['kneeWall','slantCalf']}};
const AREA_KIND={upper:['tspine','shoulders','overhead','wrists'],lower:['hips','hams','lowback','knees','ankles']};
const INJ_AREA={lb:'lowback',sh:'shoulders',kn:'knees',el:'wrists',wr:'wrists',hp:'hips',an:'ankles'};
function mobPlanAt(d){const mp=(S.custom&&S.custom.mobPlan)||[];let m=null;for(const x of mp)if(x.from<=d)m=x;return m}
/* auto focus: injuries and screening first, then what today's session loads, then the stage of the cycle */
function autoAreas(d,kind){
  const out=[],add=a=>{if(MOB_AREAS[a]&&!out.includes(a))out.push(a)};const a=S.prof&&S.prof.ans,sc=S.prof&&S.prof.sc,ph=phaseOf(d);
  ((a&&a.inj)||[]).forEach(j=>add(INJ_AREA[j]));
  const f=(sc&&sc.focus)||[];if(f.includes('overhead'))add('overhead');if(f.includes('ham'))add('hams');if(f.includes('ankle'))add('ankles');if(f.includes('hip'))add('hips');
  if(kind==='upper'){add('tspine');add('shoulders');if(ph.s==='S')add('overhead');add('wrists')}
  else if(kind==='lower'){add('hips');add('ankles');if(ph.s!=='F')add('hams');add('lowback')}
  else if(kind==='full'||kind==='hiit'){add('hips');add('tspine');add('ankles')}
  else{add('hips');add('lowback');add('tspine');add('hams')}
  return out;
}
function mobAreasFor(p,d,kind){if(!p||p.auto||!(p.areas||[]).length)return autoAreas(d,kind);const rel=AREA_KIND[kind];return rel?[...p.areas.filter(x=>rel.includes(x)),...p.areas.filter(x=>!rel.includes(x))]:p.areas.slice()}
function mobListFrom(p,d,kind){
  const areas=mobAreasFor(p,d,kind),ph=phaseOf(d),wi=weekInt(d);
  let n=Math.max(3,Math.min(8,Math.round((p.mins||8)/1.6)));if(ph.deload)n++;if(wi&&wi.lvl==='ease')n++;if(kind==='rest'||kind==='long')n=Math.max(n,5);
  const out=[];for(let pass=0;pass<4&&out.length<n;pass++)areas.forEach(a=>{if(out.length>=n)return;const x=MOB_AREAS[a].d.find(y=>E[y]&&!out.includes(y));if(x)out.push(x)});
  ['catCamel','worldGreatest','openBook','hip9090','childPose'].forEach(x=>{if(out.length<n&&!out.includes(x))out.push(x)});
  return out.map(x=>[x,MOBDOSE[x]||(E[x].t?30:8)]);
}
function mobListAt(d,kind){const p=mobPlanAt(d);return p?mobListFrom(p,d,kind):null}

/* ---------- load saved builder templates ---------- */
function applyCustom(){const C=S.custom;if(!C)return;Object.assign(T,C.tpls||{});Object.assign(MOB,C.mob||{});Object.assign(WU,C.wu||{});Object.keys(C.rot||{}).forEach(k=>{ROT[k]=C.rot[k]});
  const keys=[...new Set(Object.values(activeMap()))].filter(k=>T[k]&&!TPL_KEYS.includes(k));const i=TPL_KEYS.indexOf('long');TPL_KEYS.splice(i<0?TPL_KEYS.length:i,0,...keys)}

/* ---------- generate sessions for a draft week ---------- */
function bdAns(bd){return Object.assign(obDefaults(),{len:bd.len,goal:bd.goal})}
function genHiit(a,v){
  const eqs=eqList(a.equip),inj=new Set(a.inj||[]);
  let l=HIIT_POOL.filter(id=>E[id]&&META[id]&&eqs.includes(META[id].eq)&&!META[id].av.some(j=>inj.has(j)));if(v)l=l.slice(3).concat(l.slice(0,3));
  l=l.slice(0,a.len==45?4:6);const blocks=[];for(let i=0;i<l.length;i+=2)blocks.push({i:l.slice(i,i+2).map(id=>[id,'tw',E[id].t?(E[id].s||30):12])});
  const cp=['deadBug','plank','russianTwist','hollow','sidePlankK','bicycleCrunch','birdDog','mcgill'].filter(id=>E[id]&&META[id]&&!META[id].av.some(j=>inj.has(j)));
  const core=cp.slice(v?2:0,(v?2:0)+2).map(id=>[id,E[id].t?'coreT':'coreR']);
  const cm=a.cardio==='walk'||!a.cardio?(a.equip==='gym'?'Bike or rower':'Fast walk or jog'):(CARDIO_PREF[a.cardio]||CARDIO_PREF.walk)[a.equip==='gym'?0:1];
  return{n:'HIIT'+(v?' (B)':''),f:'Conditioning circuit and intervals',k:'hiit',mob:'p_hiit',wu:'p_hiit',blocks,core,cardio:{m:'Intervals: '+cm.toLowerCase(),z:'int'}};
}
function genDraft(bd){
  const a=bdAns(bd),cnt={},split=[],idx={};
  bd.week.forEach((ty,i)=>{const B=BT[ty];if(B&&B.spec){const n=cnt[ty]||0;cnt[ty]=n+1;split.push(B.spec[n%B.spec.length]);idx[i]=split.length-1}});
  const P=split.length?buildPlan(Object.assign({},a,{split})):{tpls:{},mob:{},wu:{},rot:{}};
  const keys=split.map((sk,i)=>split.indexOf(sk)===i?sk:sk+'2');
  const tpls={},mob=Object.assign({},P.mob),wu=Object.assign({},P.wu),map={};let hn=0;
  bd.week.forEach((ty,i)=>{
    if(BT[ty]&&BT[ty].spec){const k=keys[idx[i]];map[i]=k;tpls[k]=bd.edits[k]||clone(P.tpls[k]);if(!bd.edits[k]){const nm=BT[ty].l.replace(' (upper only)','');if(nm!==SPEC[split[idx[i]]].n)tpls[k].n=nm+(k.endsWith('2')?' (B)':'')}}
    else if(ty==='hiit'){const k=hn?'hiit2':'hiit';map[i]=k;if(!tpls[k])tpls[k]=bd.edits[k]||genHiit(a,hn);hn++}
    else if(ty==='long'||ty==='rest')map[i]=ty;
    else if(ty.slice(0,2)==='k:'){const k=ty.slice(2);map[i]=k;if(bd.edits[k])tpls[k]=bd.edits[k]}
    else map[i]='rest';
  });
  if(hn){mob.p_hiit=mob.p_full||mob.p_lower||clone(MOB.lower);wu.p_hiit=[[a.equip==='gym'?'bikeWU':'marchWU',a.equip==='gym'?180:90],['worldGreatest',6],['tempoSquat',8],['scapPU',10]]}
  return{tpls,mob,wu,rot:P.rot||{},map};
}
function bdTpl(i){const g=genDraft(UI.bd),key=g.map[i];return{key,tpl:g.tpls[key]||T[key],g}}

/* ---------- draft state ---------- */
function initBd(){
  const C=S.custom||{},am=activeMap(),a=obDefaults(),mp=(C.mobPlan||[]).slice(-1)[0];
  UI.bd={week:[0,1,2,3,4,5,6].map(i=>{const k=am[i]||'rest';return k==='rest'||k==='long'?k:'k:'+k}),goal:C.goal||a.goal||'muscle',len:+(C.len||a.len||60),
    cycleLen:cycleOf(todayS()<S.start?S.start:todayS()).CL,adapt:C.adapt!==false,whoopWeekly:C.whoopWeekly!==false,newCycle:false,from:'next',
    mob:mp?{auto:!!mp.auto,areas:(mp.areas||[]).slice(),mins:mp.mins||8}:{auto:true,areas:[],mins:8},edits:{},dirty:false};
}
const bdLabel=v=>v.slice(0,2)==='k:'?(T[v.slice(2)]?T[v.slice(2)].n:'Session'):(BT[v]?BT[v].l:v);

/* ---------- apply ---------- */
function applyBuild(){
  const bd=UI.bd,g=genDraft(bd),C=S.custom||{},prev=clone(S.custom);
  const ver=(C.ver||0)+1,pre='v'+ver+'_',tpls={},mob={},wu={};
  Object.keys(g.tpls).forEach(k=>{const t=clone(g.tpls[k]);delete t.edited;if(g.mob[t.mob]||MOB[t.mob])t.mob=g.mob[t.mob]?pre+t.mob:t.mob;if(g.wu[t.wu])t.wu=pre+t.wu;tpls[pre+k]=t});
  Object.keys(g.mob).forEach(k=>mob[pre+k]=g.mob[k]);Object.keys(g.wu).forEach(k=>wu[pre+k]=g.wu[k]);
  const map={};for(let i=0;i<7;i++){const k=g.map[i];map[i]=g.tpls[k]?pre+k:k}
  const t0=todayS(),from=bd.from==='next'?(addD(sunOf(t0),7)<S.start?S.start:addD(sunOf(t0),7)):(t0<S.start?S.start:t0);
  const N=Object.assign({},C,{ver,since:C.since||from,goal:bd.goal,adapt:bd.adapt,whoopWeekly:bd.whoopWeekly,len:bd.len,
    target:(bd.len==45?45:bd.len==60?60:84)+(bd.goal==='fat'?5:0),cardioRange:bd.len==45?[5,10]:bd.len==60?[8,14]:[10,20],
    tpls:Object.assign({},C.tpls,tpls),mob:Object.assign({},C.mob,mob),wu:Object.assign({},C.wu,wu),rot:Object.assign({},C.rot,g.rot),
    maps:[...(C.maps||[]).filter(x=>x.from<from),{from,map}],
    mobPlan:[...(C.mobPlan||[]).filter(x=>x.from<from),{from,auto:bd.mob.auto,areas:bd.mob.areas.slice(),mins:bd.mob.mins}],
    segs:(C.segs||[]).slice(),cycles:Object.assign({},C.cycles)});
  // cycle length: a new length starts with the next cycle, or right away if you ask for a fresh cycle
  const ws=sunOf(from),cy=cycleOf(ws);
  if(bd.cycleLen!==cy.CL||bd.newCycle){let sf,c0;if(cy.pos===0){sf=ws;c0=cy.c}else if(bd.newCycle){sf=ws;c0=cy.c+1}else{sf=addD(cycleStart(cy.c),cy.CL*7);c0=cy.c+1}
    N.segs=N.segs.filter(x=>x.from<sf);N.segs.push({from:sf,CL:bd.cycleLen,c0});Object.keys(N.cycles).forEach(k=>{if(+k>=c0)delete N.cycles[k]})}
  S.custom=N;S.customPrev=prev||'none';applyCustom();save();initBd();rerender();window.scrollTo(0,0);
  toast('Plan updated from '+short(from),()=>{undoBuild()});
}
function undoBuild(){if(!S.customPrev)return;S.custom=S.customPrev==='none'?null:S.customPrev;delete S.customPrev;save();location.reload()}

/* ---------- builder tab ---------- */
function bdChips(f,opts,cur){return`<div class="obrow wrap">${opts.map(([v,l])=>`<button class="obopt ${String(cur)===String(v)?'on':''}" data-a="bdset" data-f="${f}" data-v="${v}"><b>${l}</b></button>`).join('')}</div>`}
function bdToggle(f,on,l,sub){return`<button class="obopt ${on?'on':''}" data-a="bdtog" data-f="${f}"><b>${on?'✓ ':''}${l}</b>${sub?`<span>${sub}</span>`:''}</button>`}
function renderBuild(){
  if(!UI.bd)initBd();const bd=UI.bd,v=document.getElementById('view'),t0=todayS(),g=genDraft(bd);
  const curKeys=[...new Set(Object.values(activeMap()))].filter(k=>k!=='rest'&&k!=='long'&&T[k]);
  let h=`<h2 class="pagetitle disp">Plan builder</h2><p class="sub">Shape your week, edit any session, then apply. The plan keeps progressing from there, cycle by cycle.</p>`;
  // presets
  h+=`<div class="card">${cardHead('bpre','Start from a split')}${isCol('bpre')?'':BPRESETS.map(p=>`<button class="obopt" data-a="bdpreset" data-v="${p.id}"><b>${p.l}</b><span>${p.s}</span></button>`).join('')}</div>`;
  // week
  h+=`<div class="card">${cardHead('bweek','Your week')}`;
  if(!isCol('bweek')){h+=`<p class="muted" style="font-size:14px;margin:0 0 6px">Pick a session for each day. Tap <b>Edit moves</b> to replace, add, remove or reorder exercises.</p>`;
    for(let i=0;i<7;i++){const val=bd.week[i],key=g.map[i],tp=g.tpls[key]||T[key],kd=tp?tp.k:'rest';
      const opts=Object.keys(BT).map(k=>`<option value="${k}" ${val===k?'selected':''}>${BT[k].l}</option>`).join('')+(curKeys.length?`<optgroup label="Keep a current session">${[...new Set([...curKeys,...(val.slice(0,2)==='k:'?[val.slice(2)]:[])])].filter(k=>T[k]).map(k=>`<option value="k:${k}" ${val==='k:'+k?'selected':''}>${esc(T[k].n)}</option>`).join('')}</optgroup>`:'');
      const moves=tp&&tp.blocks?tp.blocks.flatMap(b=>b.i.map(x=>x[0])).filter(x=>E[x]):[];
      h+=`<div class="bdday" style="--c:${KCOLOR(kd)}"><div class="srow" style="border:0"><b>${DN[i]}</b><select data-in="bdday" data-k="${i}">${opts}</select></div>
      ${moves.length?`<div class="bdsum">${moves.slice(0,4).map(x=>esc(E[x].n)).join(' · ')}${moves.length>4?` · +${moves.length-4} more`:''}${bd.edits[key]?' <span class="pill" style="--c:var(--ok)">edited</span>':''}</div><button class="mini" data-a="bdedit" data-k="${i}">✎ Edit moves (${moves.length})</button>`:''}</div>`}}
  h+=`</div>`;
  // cycles
  h+=`<div class="card">${cardHead('bcyc','Cycles and progression')}`;
  if(!isCol('bcyc')){
    h+=`<label class="fl2">Cycle length</label>${bdChips('cycleLen',[[6,'6 weeks'],[7,'7 weeks'],[8,'8 weeks']],bd.cycleLen)}<p class="muted" style="font-size:13px;margin:4px 0 0">Build weeks add reps, then weight. The last week of every cycle is a lighter deload.</p>
    <label class="fl2" style="margin-top:10px">Goal</label>${bdChips('goal',GOALS,bd.goal)}
    <label class="fl2" style="margin-top:10px">Session length</label>${bdChips('len',[[45,'45 min'],[60,'60 min'],[90,'75–90 min']],bd.len)}
    ${bdToggle('adapt',bd.adapt,'Adapt each new cycle to my progress','At the start of each cycle the app reviews your lifts, attendance and WHOOP recovery, then moves on, holds or trims volume.')}
    ${bdToggle('newCycle',bd.newCycle,'Start a fresh cycle when I apply','Otherwise a new cycle length starts after the current cycle ends.')}`;
    // timeline
    const cn=cycleOf(t0<S.start?S.start:t0).c;let tl='';
    for(let c=Math.max(0,cn-1);c<=cn+3;c++){const st=cycleStart(c);if(st>S.end)break;const dec=cycleDecision(c),s2=phaseForCycle(c),L2=cycleOf(st).CL;
      tl+=`<div class="bdcyc" style="--c:${PH_COLOR[s2]}"><div><b>Cycle ${c+1}</b> <span class="muted num">${short(st)} · ${L2} weeks</span></div><div><span class="pill" style="--c:${PH_COLOR[s2]}">${SCH[s2].name}</span>${c===cn?' <span class="pill" style="--c:var(--ink)">now</span>':''}${dec?(dec.vol>0?' <span class="pill" style="--c:var(--ok)">+volume</span>':dec.vol<0?' <span class="pill" style="--c:var(--bad)">trimmed</span>':''):''}</div>${dec?`<div class="muted" style="font-size:13px;margin-top:4px">${esc(dec.why)}</div>`:c>cn?'<div class="muted" style="font-size:13px;margin-top:4px">Projected. Decided from your progress when the cycle starts.</div>':''}</div>`}
    h+=`<label class="fl2" style="margin-top:12px">Your cycles</label>${tl}`;
  }
  h+=`</div>`;
  // WHOOP
  const wi=weekInt(t0);
  h+=`<div class="card">${cardHead('bwhoop','WHOOP intensity')}`;
  if(!isCol('bwhoop')){h+=bdToggle('whoopWeekly',bd.whoopWeekly,'Let WHOOP and my progress set each week’s intensity','Uses last week’s recovery, WHOOP workout strain and hard-zone minutes, whether your lifts went up, and how many sessions you finished. Pushing adds a set to main and secondary lifts; easing off removes a set from accessories, adds a rep in reserve and turns HIIT into Zone 2. Daily Green/Yellow/Red still applies on top.');
    h+=!S.whoop.connected?`<div class="note">Connect WHOOP in Settings to use this.</div>`:wi?`<div class="note" style="--c:${wi.lvl==='push'?'var(--ok)':wi.lvl==='ease'?'var(--bad)':'var(--upper)'}"><b>This week: ${wi.lvl==='push'?'Push':wi.lvl==='ease'?'Ease off':'Normal'}.</b> ${esc(wi.why)}</div>`:`<div class="note">Needs a few days of WHOOP data or logged lifts from last week.</div>`}
  h+=`</div>`;
  // mobility
  h+=`<div class="card">${cardHead('bmob','Mobility focus')}`;
  if(!isCol('bmob')){const m=bd.mob;
    h+=`<div class="obrow"><button class="obopt ${m.auto?'on':''}" data-a="bdmob" data-v="auto"><b>Auto</b><span>Follows your sessions, injuries and cycle stage</span></button><button class="obopt ${!m.auto?'on':''}" data-a="bdmob" data-v="pick"><b>I choose</b><span>Pick the areas to work on now</span></button></div>`;
    if(!m.auto)h+=`<label class="fl2" style="margin-top:8px">Areas to work on</label><div class="obrow wrap">${Object.keys(MOB_AREAS).map(k=>`<button class="obopt ${m.areas.includes(k)?'on':''}" data-a="bdarea" data-v="${k}"><b>${MOB_AREAS[k].l}</b></button>`).join('')}</div>`;
    h+=`<label class="fl2" style="margin-top:8px">Minutes per session</label>${bdChips('mobmins',[[5,'5'],[8,'8'],[12,'12'],[15,'15']],m.mins)}`;
    const ref=t0<S.start?S.start:t0,prv=k=>mobListFrom(m,ref,k).map(x=>E[x[0]].n).join(', ');
    h+=`<div class="note" style="margin-top:10px"><b>Upper days:</b> ${esc(prv('upper'))}<br><b>Lower days:</b> ${esc(prv('lower'))}<br><span class="muted" style="font-size:13px">Deload weeks and low-recovery weeks add one more drill.</span></div>`}
  h+=`</div>`;
  // apply
  const nx=addD(sunOf(t0),7);
  h+=`<div class="card"><h4 class="disp">Apply</h4><div class="obrow"><button class="obopt ${bd.from==='today'?'on':''}" data-a="bdset" data-f="from" data-v="today"><b>From today</b><span>${short(t0<S.start?S.start:t0)}</span></button><button class="obopt ${bd.from==='next'?'on':''}" data-a="bdset" data-f="from" data-v="next"><b>From next week</b><span>${short(nx<S.start?S.start:nx)}</span></button></div>
  <p class="muted" style="font-size:13px;margin:6px 0 0">Earlier days, your logs and single-day moves stay as they are.</p>
  <button class="cta" style="--c:var(--upper)" data-a="bdapply">Apply to my plan</button>
  ${S.customPrev?'<button class="cta ghost" data-a="bdundo">↶ Undo last apply</button>':''}
  ${bd.dirty?'<button class="cta ghost" data-a="bddiscard">Discard changes</button>':''}</div>`;
  v.innerHTML=h;
}

/* ---------- edit a session's moves ---------- */
function flatOf(t){return{sizes:t.blocks.map(b=>b.i.length),flags:t.blocks.map(b=>({opt:b.opt,arms:b.arms})),flat:t.blocks.flatMap(b=>b.i.map(x=>x.slice()))}}
function rebuild(t,sizes,flags,flat){const out=[];let j=0;sizes.forEach((n,bi)=>{if(n<=0)return;const b={i:flat.slice(j,j+n)};j+=n;if(flags[bi]&&flags[bi].opt)b.opt=1;if(flags[bi]&&flags[bi].arms)b.arms=1;out.push(b)});if(j<flat.length)flat.slice(j).forEach(x=>out.push({i:[x]}));t.blocks=out}
function bdMut(fn){const{key,tpl}=bdTpl(UI.bde);const t=clone(tpl);fn(t);t.edited=1;UI.bd.edits[key]=t;UI.bd.dirty=true;drawBdEdit()}
function roleFor(id,t){if(t.k==='hiit')return'tw';const m=META[id];if(!m)return'acc';const has=t.blocks.some(b=>b.i.some(x=>x[1]==='main'));if(m.main&&!has)return'main';if(m.pat==='bi'||m.pat==='tri')return'arm';if(['rear','cuff','abd','add','tib'].includes(m.pat))return'pre';if(m.main)return'sec';return'acc'}
const ROLE_L={main:'Main lift',sec:'Secondary',acc:'Accessory',arm:'Arms',pre:'Prehab',tw:'Circuit',coreR:'Core',coreT:'Core hold'};
function drawBdEdit(){
  const pn=document.getElementById('panel'),keep=!document.getElementById('sheet').classList.contains('hide')&&!UI.pk?pn.scrollTop:0;setTimeout(()=>{pn.scrollTop=keep},0);
  const i=UI.bde,{key,tpl}=bdTpl(i);if(!tpl){closeSheet();return}const c=KCOLOR(tpl.k),F=flatOf(tpl);
  const row=(x,j,kind,n)=>`<div class="bdmv" style="--c:${c}"><div class="bdmvn"><b>${esc(E[x[0]]?E[x[0]].n:x[0])}</b><span>${ROLE_L[x[1]]||x[1]}${META[x[0]]?' · '+EQ_L[META[x[0]].eq]:''}</span></div>
    <div class="bdmvb"><button class="mini demo" data-a="demo" data-e="${x[0]}" aria-label="Play video">${IC.play}</button><button class="mini" data-a="bdrep" data-k="${kind}" data-v="${j}">Replace</button><button class="mini" data-a="bdmove" data-k="${kind}" data-v="${j}" data-d="-1" ${j===0?'disabled':''} aria-label="Move up">↑</button><button class="mini" data-a="bdmove" data-k="${kind}" data-v="${j}" data-d="1" ${j===n-1?'disabled':''} aria-label="Move down">↓</button><button class="mini" data-a="bddel" data-k="${kind}" data-v="${j}" aria-label="Remove">✕</button></div></div>`;
  openSheet(`<h4 class="disp">${esc(tpl.n)}, ${DN[i]}</h4><p class="muted" style="font-size:14px;margin:0 0 6px">Changes are saved in the builder. Tap <b>Apply to my plan</b> when you are done.</p>
  <label class="fl2">Session name</label><input type="text" data-in="bdname" value="${esc(tpl.n)}" maxlength="30">
  <label class="fl2" style="margin-top:10px">Strength${tpl.k==='hiit'?' circuit':''}</label>${F.flat.map((x,j)=>row(x,j,'s',F.flat.length)).join('')||'<p class="muted">No moves yet.</p>'}
  <button class="cta ghost" style="margin-top:6px" data-a="bdadd" data-k="s">＋ Add exercise</button>
  <label class="fl2" style="margin-top:12px">Core</label>${(tpl.core||[]).map((x,j)=>row(x,j,'c',tpl.core.length)).join('')||'<p class="muted">No core moves.</p>'}
  <button class="cta ghost" style="margin-top:6px" data-a="bdadd" data-k="c">＋ Add core move</button>
  ${UI.bd.edits[key]?`<button class="cta ghost" data-a="bdrevert">Undo my edits to this session</button>`:''}
  <button class="cta" style="--c:${c}" data-a="close">Done</button>`);
}
function drawPicker(){
  const pk=UI.pk;const grp=PICK_GROUPS.find(x=>x[0]===pk.g)||PICK_GROUPS[0];
  openSheet(`<h4 class="disp">${pk.mode==='rep'?'Replace with':'Add a move'}</h4>
  <input type="search" id="pkq" data-in="pkq" placeholder="Search ${Object.keys(META).length} moves" value="${esc(pk.q)}" autocomplete="off">
  <div class="chipsrow">${PICK_GROUPS.map(x=>`<button class="mini ${x[0]===pk.g?'on':''}" data-a="pkg" data-v="${x[0]}">${x[1]}</button>`).join('')}</div>
  <div id="pklist">${pickList()}</div><button class="cta ghost" data-a="pkback">Back</button>`);
}
function pickList(){
  const pk=UI.pk,grp=PICK_GROUPS.find(x=>x[0]===pk.g),q=(pk.q||'').toLowerCase().trim();
  const eqs=eqList((S.prof&&S.prof.ans&&S.prof.ans.equip)||'gym');
  let l=Object.keys(META).filter(id=>E[id]&&(!grp||!grp[2]||grp[2].includes(META[id].pat))&&(!q||E[id].n.toLowerCase().includes(q)));
  if(pk.kind==='c'&&pk.g==='all')l=l.filter(id=>/^core|carry/.test(META[id].pat));
  l.sort((a,b)=>(eqs.includes(META[a].eq)?0:1)-(eqs.includes(META[b].eq)?0:1)||E[a].n.localeCompare(E[b].n));
  return l.slice(0,80).map(id=>`<div class="bdmv"><div class="bdmvn"><b>${esc(E[id].n)}</b><span>${EQ_L[META[id].eq]}${eqs.includes(META[id].eq)?'':' · not in your usual equipment'}</span></div><div class="bdmvb"><button class="mini demo" data-a="demo" data-e="${id}" aria-label="Play video">${IC.play}</button><button class="mini" style="background:var(--upper);color:#fff;border:0" data-a="bdpick" data-e="${id}">Choose</button></div></div>`).join('')||'<p class="muted">No moves match.</p>';
}

/* ---------- per-move weight history ---------- */
function liftStats(x){const sets=x.sets.map(q=>({w:+q.w,r:+q.r}));const top=Math.max(...sets.map(q=>q.w));const vol=sets.reduce((a,q)=>a+q.w*q.r,0);const best=Math.max(...sets.map(q=>e1rm(q.w,q.r)));return{sets,top,vol,best,reps:sets.reduce((a,q)=>a+q.r,0)}}
function bigChart(pts,c,u){u=u||'kg';const W=320,H=120;if(pts.length<2)return'';const mn=Math.min(...pts),mx=Math.max(...pts),rg=mx-mn||1;const xy=pts.map((v,i)=>[(i/(pts.length-1)*(W-16)+8),(H-10-(v-mn)/rg*(H-28))]);
  return`<svg viewBox="0 0 ${W} ${H}" width="100%" style="display:block;margin:6px 0 2px"><polyline points="${xy.map(p=>p[0].toFixed(1)+','+p[1].toFixed(1)).join(' ')}" fill="none" stroke="${c}" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>${xy.map(p=>`<circle cx="${p[0].toFixed(1)}" cy="${p[1].toFixed(1)}" r="3.5" fill="${c}"/>`).join('')}<text x="8" y="12" font-size="10.5" fill="var(--mu)" font-weight="700">${Math.round(mx)} ${u}</text><text x="8" y="${H-1}" font-size="10.5" fill="var(--mu)" font-weight="700">${Math.round(mn)} ${u}</text></svg>`}
/* =====================================================================
   COACHING: plateau detection, weekly report, readiness check
   ===================================================================== */
/* a lift is stalled when its last 3 non-deload sessions set no new best estimated 1RM */
function plateauOf(ex,before){
  const h=(hist()[ex]||[]).filter(x=>(!before||x.d<before)&&!phaseOf(x.d).deload);if(h.length<4||!E[ex]||E[ex].bw||E[ex].t)return null;
  const be=x=>Math.max(...x.sets.map(q=>e1rm(+q.w,+q.r))),last3=h.slice(-3),prior=h.slice(0,-3);
  const bestPrior=Math.max(...prior.map(be)),bestRecent=Math.max(...last3.map(be));if(bestRecent>bestPrior*1.005)return null;
  if(diffD(last3[0].d,h[h.length-1].d)>56)return null;
  const topEver=Math.max(...h.map(x=>Math.max(...x.sets.map(q=>+q.w)))),lastTop=Math.max(...last3[2].sets.map(q=>+q.w));
  const alt=ROT[ex]||(E[ex].a||[]).find(a=>E[a]&&META[a]&&META[ex]&&META[a].pat===META[ex].pat);
  return{ex,sessions:3,best:Math.round(bestPrior),since:last3[0].d,heavy:lastTop>=topEver*0.97,alt,
    fixes:['Reset about 10% lighter and build back up over 2–3 sessions',`Change the rep range for a cycle (${phaseOf(todayS()).s==='S'?'higher reps, 8–12':'lower reps, 4–6'})`,'Add one back-off set at 80% for 8–10 reps',alt?`Swap to ${E[alt].n} for a cycle`:null].filter(Boolean)};
}
function plateaus(){return Object.keys(hist()).map(ex=>plateauOf(ex)).filter(Boolean)}
function plateauHTML(pl,compact){return`<div class="note plat" style="--c:var(--warn)"><b>Stalled for ${pl.sessions} sessions.</b> ${compact?esc(pl.fixes[0])+'.':''}${compact?'':`Try one of these:<ul>${pl.fixes.map(f=>`<li>${esc(f)}</li>`).join('')}</ul>`}${pl.alt?`<button class="mini" data-a="platswap" data-e="${pl.ex}" data-v="${pl.alt}">Swap to ${esc(E[pl.alt].n)}</button>`:''}</div>`}
/* ---------- weekly report: the last finished week, Sunday to Saturday ---------- */
function weekData(ws){
  const we=addD(ws,6),days=[...Array(7).keys()].map(i=>addD(ws,i));let sched=0,done=0;
  days.forEach(d=>{const k=tplOf(d);if(isTraining(k)){sched++;if(S.done[d])done++}});
  const v=weekVol(ws),pv=weekVol(addD(ws,-7));
  const h=hist(),prs=[];Object.keys(h).forEach(ex=>{if(!E[ex]||E[ex].bw||E[ex].t)return;const inW=h[ex].filter(x=>x.d>=ws&&x.d<=we),before=h[ex].filter(x=>x.d<ws);if(!inW.length||!before.length)return;const be=x=>Math.max(...x.sets.map(q=>e1rm(+q.w,+q.r)));const a=Math.max(...inW.map(be)),b=Math.max(...before.map(be));if(a>b*1.005)prs.push({ex,e1:Math.round(a),up:Math.round(a-b)})});
  const wv=days.map(d=>(S.wdata||{})[d]).filter(Boolean),avg=(a,f)=>{const x=a.map(f).filter(q=>q!=null);return x.length?x.reduce((p,q)=>p+q,0)/x.length:null};
  const rec=avg(wv,x=>x.rec),slp=avg(wv,x=>x.sleep&&x.sleep.dur),str=avg(wv,x=>x.strain);
  const wks=Object.values(S.wwk||{}).filter(w=>w.d>=ws&&w.d<=we);
  const supTot=S.supps.length*7,supDone=days.reduce((a,d)=>a+S.supps.filter(s=>S.suppLog[d]&&S.suppLog[d][s.id]).length,0);
  const hb=S.habits||[],habTot=hb.length*7,habOk=days.reduce((a,d)=>a+hb.filter(x=>habDone(x.id,d)).length,0);
  const w0=lastVal('weight',addD(ws,-1)),w1=lastVal('weight',we);
  const fd=days.map(d=>(S.food||{})[d]).filter(l=>l&&l.length),prot=fd.length?fd.reduce((a,l)=>a+l.reduce((b,x)=>b+(+x.p||0),0),0)/fd.length:null;
  return{prot,ws,we,sched,done,v,pv,prs:prs.sort((a,b)=>b.up-a.up),rec,slp,str,wks,sup:supTot?supDone/supTot:null,hab:habTot?habOk/habTot:null,w0,w1};
}
function nextFocus(ws){const nd=addD(ws,8),ph=phaseOf(nd),wi=weekInt(nd);const pl=plateaus();
  if(ph.deload)return'Deload week: lighter loads, 2 sets each, sleep well. The next cycle starts stronger.';
  if(wi&&wi.lvl==='ease')return'Recovery is behind. Keep sessions shorter, prioritise sleep, and hold your weights.';
  if(pl.length)return`Break the stall on ${E[pl[0].ex].n}: ${pl[0].fixes[0].toLowerCase()}.`;
  if(wi&&wi.lvl==='push')return'You’re recovering well. Push the main lifts: the plan adds a set this week.';
  return`${ph.focus}. Hit every planned session.`}
function reportSheet(ws){
  const t=todayS();ws=ws||addD(sunOf(t),-7);const r=weekData(ws);S.seenReport=ws;save();
  const pct=v=>v==null?'–':Math.round(v*100)+'%',dv=r.pv.vol?(r.v.vol-r.pv.vol)/r.pv.vol:null,pl=plateaus();
  openSheet(`<h4 class="disp">Week of ${short(r.ws)}</h4><p class="muted" style="font-size:14px;margin:0 0 8px">${short(r.ws)} – ${short(r.we)}</p>
  <div class="grid2"><div class="stat"><b class="disp num">${r.done}/${r.sched}</b><span>Sessions done</span></div><div class="stat"><b class="disp num">${fvol(r.v.vol)}</b><span>Volume${dv!=null?` (${dv>=0?'+':''}${Math.round(dv*100)}%)`:''}</span></div>
  <div class="stat"><b class="disp num">${r.prs.length}</b><span>Personal records</span></div><div class="stat"><b class="disp num">${r.v.sets}</b><span>Sets logged</span></div>
  ${r.rec!=null?`<div class="stat"><b class="disp num" style="color:${recCol(r.rec)}">${Math.round(r.rec)}%</b><span>Avg recovery</span></div>`:''}${r.slp!=null?`<div class="stat"><b class="disp num">${hm(r.slp)}</b><span>Avg sleep</span></div>`:''}
  ${r.str!=null?`<div class="stat"><b class="disp num">${r.str.toFixed(1)}</b><span>Avg day strain</span></div>`:''}${r.wks.length?`<div class="stat"><b class="disp num">${r.wks.length}</b><span>WHOOP workouts</span></div>`:''}
  ${r.prot!=null?`<div class="stat"><b class="disp num">${Math.round(r.prot)} g</b><span>Avg protein (days logged)</span></div>`:''}<div class="stat"><b class="disp num">${pct(r.sup)}</b><span>Supplements taken</span></div><div class="stat"><b class="disp num">${pct(r.hab)}</b><span>Habits done</span></div>
  ${r.w1&&r.w0?`<div class="stat"><b class="disp num">${(r.w1.v-r.w0.v>=0?'+':'')+(r.w1.v-r.w0.v).toFixed(1)} kg</b><span>Body weight change</span></div>`:''}</div>
  ${r.prs.length?`<div class="card" style="margin-top:10px"><b>${IC.trophy} Personal records</b>${r.prs.slice(0,6).map(x=>`<div class="hrow" style="grid-template-columns:1fr auto"><button class="wklink" data-a="lifthist" data-e="${x.ex}">${esc(E[x.ex].n)} ›</button><b class="num">${x.e1} kg e1RM <span style="color:var(--ok)">+${x.up}</span></b></div>`).join('')}</div>`:''}
  ${pl.length?`<div class="card"><b>${IC.pause} Stalled lifts</b>${pl.slice(0,4).map(x=>`<div style="padding:6px 0;border-top:1px solid var(--ln)"><button class="wklink" data-a="lifthist" data-e="${x.ex}">${esc(E[x.ex].n)} ›</button><div class="muted" style="font-size:13px">${esc(x.fixes[0])}</div></div>`).join('')}</div>`:''}
  <div class="note" style="--c:var(--upper)"><b>Focus for next week:</b> ${esc(nextFocus(ws))}</div>
  <div class="grid2"><button class="cta ghost" style="margin:0" data-a="report" data-v="${addD(ws,-7)}">‹ Previous week</button>${addD(ws,7)<=addD(sunOf(t),-7)?`<button class="cta ghost" style="margin:0" data-a="report" data-v="${addD(ws,7)}">Next week ›</button>`:`<button class="cta ghost" style="margin:0" data-a="report" data-v="${sunOf(t)}">This week so far</button>`}</div>
  <button class="cta ghost" data-a="close">Close</button>`);
}
/* ---------- readiness check: WHOOP + how you feel, before training ---------- */
function readinessScore(d,sore,energy){const w=whoopDay(d),x=(S.wdata||{})[d]||{};let sc=w&&x.rec!=null?x.rec:65;const why=[];if(w&&x.rec!=null)why.push(`WHOOP recovery ${Math.round(x.rec)}%`);
  sc+={1:5,2:0,3:-8,4:-18,5:-30}[sore]||0;if(sore>=4)why.push('very sore');else if(sore===3)why.push('a bit sore');
  sc+={1:-20,2:-10,3:0,4:5,5:10}[energy]||0;if(energy<=2)why.push('low energy');else if(energy>=4)why.push('good energy');
  if(x.sleep&&x.sleep.perf!=null&&x.sleep.perf<70){sc-=10;why.push(`sleep ${Math.round(x.sleep.perf)}%`)}
  sc=Math.max(0,Math.min(100,Math.round(sc)));return{score:sc,lvl:sc>=67?'g':sc>=34?'y':'r',why}}
function readinessSheet(d){const q=UI.rc=UI.rc&&UI.rc.d===d?UI.rc:Object.assign({d,sore:2,energy:3},(S.rcheck||{})[d]||{});const r=readinessScore(d,q.sore,q.energy),c={g:'var(--ok)',y:'var(--warn)',r:'var(--bad)'}[r.lvl];
  const row=(f,l,labels)=>`<label class="fl2">${l}</label><div class="obrow">${[1,2,3,4,5].map(v=>`<button class="obopt ${q[f]===v?'on':''}" data-a="rcset" data-f="${f}" data-v="${v}"><b>${v}</b><span>${labels[v-1]}</span></button>`).join('')}</div>`;
  openSheet(`<h4 class="disp">Readiness check</h4><p class="muted" style="font-size:14px;margin:0 0 6px">10 seconds before you train. Combined with WHOOP, it sets today’s session.</p>
  ${row('sore','Muscle soreness',['None','Slight','Some','Sore','Very'])}${row('energy','Energy',['Drained','Low','OK','Good','Great'])}
  <div class="rcscore" style="--c:${c}">${ring(r.score/100,c,96,11,r.score)}<div><b class="disp" style="font-size:24px">${{g:'Ready to push',y:'Train lighter',r:'Recovery day'}[r.lvl]}</b><p style="font-size:14px;margin:4px 0 0">${r.why.length?esc(r.why.join(', '))+'. ':''}${{g:'Full session as planned.',y:'One set fewer on accessories and arms, main lifts stop 2 reps short, cardio stays easy.',r:'Lifting is off today: mobility, core and an easy 30-minute walk or ride.'}[r.lvl]}</p></div></div>
  <button class="cta" style="--c:${c}" data-a="rcsave">Use this for today</button><button class="cta ghost" data-a="close">Not now</button>`)}
function liftSheet(ex){
  const e=E[ex];if(!e)return;const all=(hist()[ex]||[]).slice(),c=COLORS.upper;
  if(!all.length){openSheet(`<h4 class="disp">${esc(e.n)}</h4><p class="muted" style="font-size:14px">No weights logged for this move yet. Log a set with a weight and it shows up here.</p><button class="cta ghost" data-a="close">Close</button>`);return}
  const st=all.map(liftStats),bestW=Math.max(...st.map(x=>x.top)),bestE=Math.max(...st.map(x=>x.best)),totV=st.reduce((a,x)=>a+x.vol,0);
  const first=st[0].best,last=st[st.length-1].best,chg=first?(last-first)/first:0;
  let prevTop=-1,prevBest=-1;const prW=st.map(x=>{const pr=x.top>prevTop&&prevTop>=0;prevTop=Math.max(prevTop,x.top);return pr}),prE=st.map(x=>{const pr=x.best>prevBest&&prevBest>=0;prevBest=Math.max(prevBest,x.best);return pr});
  let rows='';for(let i=all.length-1;i>=0;i--){const x=all[i],s2=st[i],k=tplOf(x.d),tn=k&&T[k]?T[k].n:'';const prev=i>0?st[i-1]:null;const dTop=prev?s2.top-prev.top:null;
    rows+=`<details class="lhs" ${i===all.length-1?'open':''}><summary><div><b>${nice(x.d)}</b>${prW[i]?'<em>Weight PR</em>':prE[i]?'<em>e1RM PR</em>':''}<br><span class="num">${s2.sets.length} set${s2.sets.length>1?'s':''} · top ${s2.top} kg${dTop?` (${dTop>0?'+':''}${+dTop.toFixed(1)})`:''}</span></div><span class="chev">${CHEV}</span></summary>
    <div class="lhsets num"><span class="hd">Set</span><span class="hd">Weight</span><span class="hd">Reps</span><span class="hd">Est. 1RM</span>${s2.sets.map((q,j)=>`<span>${j+1}</span><b>${q.w} kg</b><span>${q.r}</span><span>${Math.round(e1rm(q.w,q.r))} kg</span>`).join('')}</div>
    <div class="lhmeta num"><span>Volume <b>${Math.round(s2.vol).toLocaleString()} kg</b></span><span>Total reps <b>${s2.reps}</b></span><span>Best e1RM <b>${Math.round(s2.best)} kg</b></span>${tn?`<span>Session <b>${esc(tn)}</b></span>`:''}</div>
    <button class="mini" style="margin-top:8px" data-a="histday" data-d="${x.d}">Open this day →</button></details>`}
  const plt=plateauOf(ex);
  openSheet(`<h4 class="disp">${esc(e.n)}</h4><p class="muted" style="font-size:14px;margin:0 0 8px">Every session you logged, newest first. Tap a session to see each set.</p>${plt?plateauHTML(plt):''}
  <div class="grid2" style="margin-bottom:6px"><div class="stat"><b class="disp num">${bestW} kg</b><span>Heaviest set</span></div><div class="stat"><b class="disp num">${Math.round(bestE)} kg</b><span>Best est. 1RM</span></div><div class="stat"><b class="disp num">${all.length}</b><span>Sessions logged</span></div><div class="stat"><b class="disp num">${fvol(totV)}</b><span>Total volume</span></div></div>
  ${all.length>1?`<div class="card" style="margin:8px 0"><b style="font-size:14px">Estimated 1RM by session</b> <span class="muted num" style="font-size:13px">${chg>=0?'+':''}${Math.round(chg*100)}% since ${short(all[0].d)}</span>${bigChart(st.map(x=>x.best),c)}</div>`:''}
  ${rows}<button class="cta ghost" data-a="close">Close</button>`);
}
