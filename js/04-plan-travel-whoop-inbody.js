"use strict";
/* ---------- PLAN ---------- */
function renderPlan(){
  const v=document.getElementById('view'),t=todayS();
  let h=`<h2 class="pagetitle disp">${S.prof&&S.prof.ans&&S.prof.ans.name?esc(S.prof.ans.name)+'\u2019s plan':'Plan'}</h2><p class="sub">${nice(S.start)} to ${nice(S.end)}, ${totalWeeks()} weeks. Tap any day to open it.</p>`;
  // phases
  const W=totalWeeks(),curW=inPlan(t)?weekNo(t):0;let ps='';
  for(let w=1;w<=W;w++){const d=addD(sunOf(S.start),(w-1)*7+1);const ph=phaseOf(d<S.start?S.start:d);ps+=`<span class="${ph.deload?'dl':''} ${w===curW?'now':''}" style="--c:${PH_COLOR[ph.s]}" title="Week ${w}">${w}</span>`}
  h+=`<div class="card">${cardHead('pblocks','Training blocks')}${isCol('pblocks')?'':`<div class="phases">${ps}</div><div class="legend"><span style="--c:${PH_COLOR.F}"><i></i>Cycle 1: Hypertrophy base</span><span style="--c:${PH_COLOR.H}"><i></i>Cycle 2: Build</span><span style="--c:${PH_COLOR.S}"><i></i>Cycle 3: Strength</span><span style="--c:#c8cdea"><i></i>Deload</span></div>
<p class="muted" style="font-size:13.5px;margin:0 0 8px">Each cycle (6 weeks unless you change it in the Builder): weeks 1–3 add a rep at the same weight, week 4 adds weight and resets the reps, later weeks push the reps again, and the last week is a lighter deload. Every new cycle drops the rep targets and raises the loads, and accessory and arm moves rotate every other cycle. Main lifts stay so your strength keeps building.</p>
${(()=>{const CL=cycleOf(todayS()<S.start?S.start:todayS()).CL,n=CL-1,ix=[...Array(CL).keys()];return`<div style="overflow-x:auto"><table class="cyc"><tr><th></th>${ix.map(i=>`<th>W${i+1}</th>`).join('')}</tr>${['F','H','S'].map(k=>`<tr><td><b style="color:${PH_COLOR[k]}">${SCH[k].name}</b></td>${ix.map(i=>`<td>${i===n?'2×'+SCH[k].main[1]:(SCH[k].main[0]+(i>=3?1:0))+'×'+(SCH[k].main[1]+OFF_SEQ[n][i])}${FOCUS_SEQ[n][i]===3?'<br><span class="up">+kg</span>':''}</td>`).join('')}</tr>`).join('')}</table></div>`})()}`}</div>`;
  // weekly schedule
  {const hs=S.hist||[];h+=`<div class="card">${cardHead('phist','Schedule changes')}`;
   if(!isCol('phist')){h+=hs.length?`<p class="muted" style="font-size:13.5px;margin:0 0 6px">Every move, copy and weekly change is saved here. Undo them one at a time, newest first, or go back to the original plan.</p>${hs.slice(-6).reverse().map((e,i)=>`<div class="hrow" style="grid-template-columns:1fr auto"><span>${esc(e.label)}${i===0?' <span class="pill" style="--c:var(--ink)">latest</span>':''}</span><em class="muted">${short(ds(new Date(e.t)))}</em></div>`).join('')}<div class="grid2" style="margin-top:10px"><button class="cta" style="--c:var(--cardio);margin:0" data-a="undosched">↶ Undo latest</button><button class="cta ghost" style="margin:0" data-a="resetsched">Reset to original</button></div>`:`<p class="muted" style="font-size:13.5px;margin:0">Nothing changed yet. Open any day in the Train tab and tap <b>Move or copy</b>.</p>${Object.keys(S.moves).length?'<button class="cta ghost" data-a="resetsched">Reset to original</button>':''}`}
   h+=`</div>`}
  h+=`<div class="card">${cardHead('psched','Weekly schedule')}`;if(!isCol('psched')){h+=`<p class="muted" style="font-size:13.5px;margin:0 0 6px">Change which day each session falls on. It applies to every week; single-day moves are made from the Train tab.</p>`;
  const AM=activeMap();for(let i=0;i<7;i++){h+=`<div class="srow"><b>${DN[i]}</b><select data-in="map" data-k="${i}">${TPL_KEYS.map(k=>`<option value="${k}" ${AM[i]===k?'selected':''}>${T[k].n} — ${T[k].f}</option>`).join('')}</select></div>`}
  h+=`<div class="srow"><b>Start date</b><input type="date" data-in="start" value="${S.start}"></div><div class="srow"><b>End date</b><div style="display:flex;gap:8px;align-items:center"><span class="num" style="font-weight:750">${nice(S.end)}</span><button class="mini" data-a="tab" data-v="progress" style="margin-left:auto">Extend plan</button></div></div>`}h+=`</div>`;
  h+=`<div class="legend">${[['Upper','upper'],['Lower','lower'],['Travel','travel'],['Long cardio','long'],['Rest','rest']].map(x=>`<span style="--c:${COLORS[x[1]]}"><i></i>${x[0]}</span>`).join('')}<span style="--c:transparent"><i style="outline:2.5px solid var(--ok)"></i>Done</span></div>`;
  // months
  let m=pd(S.start);m.setDate(1);const endM=pd(S.end);
  while(m<=endM){
    const y=m.getFullYear(),mo=m.getMonth();const first=new Date(y,mo,1).getDay(),dim=new Date(y,mo+1,0).getDate();
    let cells=DS.map(x=>`<div class="dh">${x[0]}</div>`).join('');for(let i=0;i<first;i++)cells+='<div></div>';
    for(let day=1;day<=dim;day++){const d=ds(new Date(y,mo,day)),k=tplOf(d);
      if(!k){cells+=`<div class="cell off">${day}</div>`;continue}
      const tt=T[k];const lab={upper:'U',lower:'L',long:'Z2',rest:'',travel:'T'}[tt.k];
      cells+=`<button class="cell ${S.done[d]?'done':''} ${d===t?'today':''} ${S.moves[d]?'moved':''}" style="--c:${KCOLOR(tt.k)}" data-a="openday" data-d="${d}" aria-label="${nice(d)}, ${tt.n}"><span class="num">${day}</span>${tt.k==='rest'?'<span></span>':`<span class="k">${lab}${tt.k!=='long'?tt.n.slice(-1):''}</span>`}</button>`}
    const mk='pm-'+y+'-'+mo;h+=`<div class="month card">${cardHead(mk,MN[mo]+' '+y,'h5')}${isCol(mk)?'':`<div class="cal">${cells}</div>`}</div>`;
    m=new Date(y,mo+1,1);
  }
  v.innerHTML=h;
}

/* ---------- TRAVEL ---------- */
function withTpl(d,k,fn){const had=Object.prototype.hasOwnProperty.call(S.moves,d),prev=S.moves[d];S.moves[d]=k;try{return fn()}finally{if(had)S.moves[d]=prev;else delete S.moves[d]}}
function renderTravel(){
  const v=document.getElementById('view'),t=todayS(),pdate=inPlan(t)?t:S.start;
  let h=`<h2 class="pagetitle disp">Travel</h2><p class="sub">Four full-body sessions with zero equipment. Same flow as the gym days: mobility, strength supersets, core, then a low-impact cardio circuit.</p>`;
  h+=`<div class="card">${cardHead('ttrips','Trips')}`;
  if(!isCol('ttrips')){
    h+=`<p class="muted" style="font-size:13.5px;margin:0 0 6px">Add your travel dates. Lifting days inside a trip switch to travel sessions automatically, rotating A, B, C, D. Saturday cardio and rest days stay as they are.</p>`;
    (S.trips||[]).slice().sort((a,b)=>a.from<b.from?-1:1).forEach(x=>{let n=0;for(let d=x.from;d<=x.to;d=addD(d,1))if(T[tplOf(d)||'rest']&&T[tplOf(d)||'rest'].k==='travel')n++;const i=S.trips.indexOf(x);
      h+=`<div class="trip"><div><b>${short(x.from)} to ${short(x.to)}</b><span>${n} travel session${n===1?'':'s'}${x.to<t?', finished':(x.from<=t?', happening now':'')}</span></div><button class="mini" data-a="deltrip" data-v="${i}">Remove</button></div>`});
    h+=`<div class="grid2" style="margin-top:8px"><label class="fl">From<input type="date" id="tripFrom" value="${pdate}"></label><label class="fl">To<input type="date" id="tripTo" value="${addD(pdate,4)}"></label></div><button class="cta" style="--c:var(--travel)" data-a="addtrip">Add trip</button>`;
  }
  h+=`</div>`;
  TRAVEL.forEach(k=>{
    const tp=T[k];const info=withTpl(pdate,k,()=>({est:estimate(pdate),blocks:blocksFor(pdate),core:coreFor(pdate),mob:mobFor(pdate),wu:warmFor(pdate),cd:cardioFor(pdate)}));
    const key='tvo-'+k,open=isCol(key);
    h+=`<div class="tvcard"><div class="tvtop"><div class="focus" style="position:relative">${tp.f}</div><h3 class="disp" style="position:relative">${tp.n}</h3><div class="tags"><span class="tag">About ${mins(info.est.total)}</span><span class="tag">${info.blocks.length} supersets</span><span class="tag">Full body</span></div></div><div class="tvbody">
      <div class="grid2"><button class="cta" style="--c:var(--travel);margin:0" data-a="dotravel" data-v="${k}">Do it today</button><button class="cta ghost" style="margin:0" data-a="col" data-v="${key}">${open?'Hide exercises':'Show exercises'}</button></div>`;
    if(open){
      h+=`<div class="grp">Mobility, ${mins(info.est.m)}</div><div class="csum" style="--c:${COLORS.mob}">${info.mob.map((m,i)=>`<div class="crow"><span class="l2">M${i+1}</span><span>${esc(E[m.ex].n)}</span><b>${E[m.ex].t?m.dose+' s':m.dose}${E[m.ex].u?'/side':''}</b></div>`).join('')}</div>`;
      h+=`<div class="grp">Warm-up, ${mins(info.est.w)}</div><div class="csum" style="--c:${COLORS.warm}">${info.wu.map((m,i)=>`<div class="crow"><span class="l2">W${i+1}</span><span>${esc(E[m.ex].n)}</span><b>${E[m.ex].t?m.dose+' s':m.dose}${E[m.ex].u?'/side':''}</b></div>`).join('')}</div>`;
      h+=`<div class="grp">Strength, ${mins(info.est.s)}</div><div class="csum" style="--c:${COLORS.travel}">${info.blocks.flatMap(b=>b.items.map((it,i)=>`<div class="crow"><span class="l2">${b.label}${i+1}</span><span>${esc(E[it.ex].n)}</span><b>${it.rx.sets}×${repTxt(it).replace(' / side','/side')}</b></div>`)).join('')}</div>`;
      h+=`<div class="grp">Core, ${mins(info.est.c)}</div><div class="csum" style="--c:${COLORS.core}">${info.core.map((it,i)=>`<div class="crow"><span class="l2">C${i+1}</span><span>${esc(E[it.ex].n)}</span><b>${it.rx.sets}×${repTxt(it).replace(' / side','/side')}</b></div>`).join('')}</div>`;
      h+=`<div class="grp">Cardio, ${info.cd.mins} min</div><div class="csum" style="--c:${COLORS.cardio}"><div class="crow"><span class="l2">Z</span><span>40 s on / 20 s easy: ${esc(tp.cardio.moves.join(', ').toLowerCase())}</span><b></b></div></div>`;
    }
    h+=`</div></div>`;
  });
  h+=`<p class="muted" style="font-size:12.5px">Reps and holds grow week by week inside each 6-week cycle, just like the gym sessions, with a 4th round in Strength cycles and 2 easy rounds in deload weeks.</p>`;
  v.innerHTML=h;
}

/* ---------- WHOOP TAB ---------- */
const WC={rec:'#12B76A',hrv:'#00A3FF',rhr:'#FF2D78',sleep:'#7B4DFF',strain:'#2F5BFF',spo2:'#00B39A',skin:'#F59E0B',steps:'#E8A900',kcal:'#FF6A13',ahr:'#EF3B55',body:'#00B39A'};
const recCol=v=>v>=67?'#12B76A':v>=34?'#F5A300':'#EF3B55';
let DEMO=null,DEMOB=null;
function demoData(){if(DEMO)return DEMO;DEMO={};let seed=11;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};const t=todayS();
  for(let i=119;i>=0;i--){const d=addD(t,-i),wk=dow(d);const base=60+9*Math.sin(i/8)+(wk===5||wk===6?7:0)-(i<20?0:4);const rec=Math.max(9,Math.min(98,Math.round(base+(rnd()-.5)*38)));
    const dur=Math.max(4.8,5.9+rnd()*2.3+(rec-60)/70),deep=dur*(.17+rnd()*.06),rem=dur*(.19+rnd()*.07),awake=.25+rnd()*.5;
    DEMO[d]={rec,hrv:Math.round(44+rec*.3+(rnd()-.5)*10),rhr:Math.round(61-rec*.1+(rnd()-.5)*4),spo2:+(95.2+rnd()*2.6).toFixed(1),skin:+(33.3+rnd()*.8).toFixed(1),
      sleep:{perf:Math.round(Math.min(100,dur/7.9*100)),eff:Math.round(85+rnd()*11),cons:Math.round(58+rnd()*34),rr:+(14.4+rnd()*1.4).toFixed(1),dur:+dur.toFixed(2),light:+(dur-deep-rem).toFixed(2),deep:+deep.toFixed(2),rem:+rem.toFixed(2),awake:+awake.toFixed(2),need:7.9,dist:Math.round(4+rnd()*11)},
      strain:+(5.5+rnd()*12.5).toFixed(1),kcal:Math.round(2100+rnd()*1300),ahr:Math.round(66+rnd()*12),mhr:Math.round(138+rnd()*48),steps:Math.round(3500+rnd()*9500)}}
  return DEMO}
function demoBody(){if(DEMOB)return DEMOB;DEMOB={};const t=todayS();for(let i=112;i>=0;i-=7){const d=addD(t,-i),k=(112-i)/112;DEMOB[d]={weight:+(84.6-2.8*k+Math.sin(i)*.4).toFixed(1),fat:+(22.5-2.4*k).toFixed(1)}}return DEMOB}
function W(d){return UI.wdemo?demoData()[d]:(S.wdata||{})[d]}
function B(d){return UI.wdemo?demoBody()[d]:(S.body||{})[d]}
function wbody(){return UI.wdemo?{height:1.80,weight:81.8,maxhr:188}:S.wbody}
const MET={
  rec:{l:'Recovery',u:'%',c:WC.rec,g:x=>x.rec,dir:1,f:v=>Math.round(v)+'%',about:'How ready your body is to take on strain today. WHOOP builds it mainly from HRV, resting heart rate, respiratory rate and sleep. Green is 67% or more, yellow 34–66%, red 33% or less.'},
  hrv:{l:'HRV',u:'ms',c:WC.hrv,g:x=>x.hrv,dir:1,about:'Heart rate variability: how much the time between heartbeats varies during deep sleep. Higher than your own normal usually means you have recovered well. Compare it with your own average, not with other people.'},
  rhr:{l:'Resting heart rate',u:'bpm',c:WC.rhr,g:x=>x.rhr,dir:-1,about:'Your lowest steady heart rate while asleep. A rise of 5 bpm or more above your normal often follows hard training, late meals, alcohol, heat, stress or the start of an illness.'},
  spo2:{l:'Blood oxygen',u:'%',c:WC.spo2,g:x=>x.spo2,dir:1,dec:1,about:'Average blood oxygen saturation during sleep. Most healthy people sit around 95–100%. One low night is common; a steady drop over several nights is worth paying attention to.'},
  skin:{l:'Skin temperature',u:'°C',c:WC.skin,g:x=>x.skin,dir:0,dec:1,about:'Skin temperature during sleep. The absolute number matters less than the change from your normal; a clear jump can show up before you feel ill.'},
  sleep:{l:'Sleep',u:'h',c:WC.sleep,g:x=>x.sleep&&x.sleep.dur,dir:1,f:v=>hm(v),about:'Time actually asleep: time in bed minus time awake. WHOOP sets a sleep need each night from your baseline, sleep debt and the previous day\u2019s strain.'},
  sleepPerf:{l:'Sleep performance',u:'%',c:WC.sleep,g:x=>x.sleep&&x.sleep.perf,dir:1,f:v=>Math.round(v)+'%',about:'Sleep you got as a share of the sleep WHOOP said you needed. 85% or more is optimal, 70–85% sufficient, under 70% poor.'},
  strain:{l:'Strain',u:'',c:WC.strain,g:x=>x.strain,dir:0,dec:1,about:'Total cardiovascular load for the day on a 0–21 scale. Under 10 is light, 10–14 moderate, 14–18 strenuous and 18+ all out. Match it to your recovery.'},
  steps:{l:'Steps',u:'',c:WC.steps,g:x=>x.steps,dir:1,f:v=>Math.round(v).toLocaleString(),about:'Steps WHOOP counted across the day. Your daily goal can be changed on the Steps card.'},
  kcal:{l:'Calories',u:'kcal',c:WC.kcal,g:x=>x.kcal,dir:0,f:v=>Math.round(v).toLocaleString()+' kcal',about:'Total energy burned during the WHOOP day, converted from the kilojoules WHOOP reports. It includes your resting metabolism, not just exercise.'},
  ahr:{l:'Average heart rate',u:'bpm',c:WC.ahr,g:x=>x.ahr,dir:0,about:'Your average heart rate across the whole WHOOP day.'},
  weight:{l:'Weight',u:'kg',c:WC.body,src:'body',g:b=>b.weight,dir:0,dec:1,about:'From your own log, or from your WHOOP profile when it changes. Weigh yourself at the same time of day, ideally in the morning after the bathroom, for a fair comparison.'},
  fat:{l:'Body fat',u:'%',c:'#7B4DFF',src:'body',g:b=>b.fat,dir:-1,dec:1,about:'Body fat percentage from a scale, calipers or a scan. Use the same method each time; different methods disagree with each other.'},
  lean:{l:'Lean body mass',u:'kg',c:'#2F5BFF',src:'body',g:b=>b.lean,dir:1,dec:1,about:'Everything that is not fat: muscle, bone, organs and water. IRON calculates it as weight × (1 − body fat %), using your latest body fat reading, unless you log it yourself. Steady or rising lean mass while body fat falls is the goal of this plan.'},
  smm:{l:'Skeletal muscle',u:'kg',c:'#2F5BFF',src:'body',g:b=>b.smm,dir:1,dec:1,about:'Skeletal muscle mass from your InBody scans: the muscle you train. Going up while body fat goes down is the goal.'},
  bfm:{l:'Body fat mass',u:'kg',c:'#7B4DFF',src:'body',g:b=>b.bfm,dir:-1,dec:1,about:'Kilograms of fat from your InBody scans.'},
  visceral:{l:'Visceral fat',u:'',c:'#EF3B55',src:'body',g:b=>b.visceral,dir:-1,dec:0,about:'InBody visceral fat level, the fat around the organs. Under 10 is the healthy range.'},
  ibscore:{l:'InBody score',u:'',c:'#00B39A',src:'body',g:b=>b.ibscore,dir:1,dec:0,about:'InBody\u2019s overall body composition score out of 100. Muscular people can score above 100.'},
};
const BODY_KEYS=['weight','fat','lean'];
function hm(h){if(h==null||isNaN(h))return'–';const m=Math.round(h*60);return Math.floor(m/60)+'h '+pad(m%60)+'m'}
function fmtM(key,v){const M=MET[key];if(v==null||isNaN(v))return'–';if(M.f)return M.f(v);return(+v).toFixed(M.dec||0)+(M.u?' '+M.u:'')}
function leanAt(d){const b=B(d);if(!b)return null;if(b.lean!=null)return +b.lean;let w=b.weight,f=b.fat;if(w==null){for(let i=1;i<=45;i++){const q=B(addD(d,-i));if(q&&q.weight!=null){w=q.weight;break}}}if(f==null){for(let i=1;i<=45;i++){const q=B(addD(d,-i));if(q&&q.fat!=null){f=q.fat;break}}}if(w==null||f==null)return null;return +(w*(1-f/100)).toFixed(1)}
function mval(key,d){const M=MET[key];if(!M)return null;if(key==='lean')return leanAt(d);const x=M.src==='body'?B(d):W(d);if(!x)return null;const v=M.g(x);return v==null||isNaN(v)?null:+v}
function mavg(key,d,n,skip){let a=[];for(let i=skip?1:0;i<(skip?n+1:n);i++){const v=mval(key,addD(d,-i));if(v!=null)a.push(v)}return a.length?a.reduce((p,q)=>p+q,0)/a.length:null}
function lastVal(key,d,max){for(let i=0;i<(max||400);i++){const dd=addD(d,-i),v=mval(key,dd);if(v!=null)return{d:dd,v}}return null}
function latestDay(){const t=todayS();for(let i=0;i<14;i++){const d=addD(t,-i);if(W(d)&&W(d).rec!=null)return d}return t}
/* ---------- WHOOP workouts ----------
   WHOOP sends strain, heart rate and time in each heart-rate zone for every activity.
   It does not send sets or weights, so lifting details come from your IRON log for the same day. */
const ZONE_C=['#C8CDEA','#9DB8FF','#12B76A','#E8A900','#FF6A13','#EF3B55'],ZONE_L=['Zone 0 (under 50%)','Zone 1 (50–60%)','Zone 2 (60–70%)','Zone 3 (70–80%)','Zone 4 (80–90%)','Zone 5 (90–100%)'];
let DEMOWK=null;
function demoWorkouts(){if(DEMOWK)return DEMOWK;DEMOWK={};let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};const t=todayS();
  for(let i=27;i>=0;i--){const d=addD(t,-i);if(dow(d)===5)continue;const run=dow(d)===6,hi=dow(d)===2;const mins=run?50:hi?35:62;const st=new Date(pd(d).getTime()+(run?8:18)*36e5);
    const z=run?[2,8,30,9,1,0]:hi?[3,6,8,8,7,3]:[8,22,20,9,3,0];const sc=mins/z.reduce((a,b)=>a+b,0);
    DEMOWK['demo'+i]={id:'demo'+i,d,start:st.toISOString(),end:new Date(st.getTime()+mins*6e4).toISOString(),sport:run?'running':hi?'hiit':'weightlifting',strain:+((run?11:hi?13:9.5)+rnd()*3).toFixed(1),ahr:Math.round((run?142:hi?150:118)+rnd()*10),mhr:Math.round((run?168:hi?182:158)+rnd()*10),kj:Math.round((run?2400:hi?1900:1500)+rnd()*500),pct:100,dist:run?8200+Math.round(rnd()*1500):null,zones:z.map(m=>Math.round(m*sc*6e4))}}
  return DEMOWK}
function wkAll(){return UI.wdemo?demoWorkouts():(S.wwk||{})}
function wkList(from,to){return Object.values(wkAll()).filter(w=>w.d>=from&&w.d<=to).sort((a,b)=>a.start<b.start?1:-1)}
const sportName=s=>{const x=String(s||'Activity').replace(/[-_]/g,' ');return x.charAt(0).toUpperCase()+x.slice(1)};
const LIFTY=/weight|lift|strength|functional|crossfit|hiit|training|power|body ?build/i;
function wkForDay(d){const l=wkList(d,d);if(!l.length)return null;return l.find(w=>LIFTY.test(w.sport))||l.sort((a,b)=>new Date(b.end)-new Date(b.start)-(new Date(a.end)-new Date(a.start)))[0]}
function wkMins(w){return Math.round((new Date(w.end)-new Date(w.start))/6e4)}
function zoneBar(z,h){const tot=z.reduce((a,b)=>a+b,0)||1;return`<div class="zbar" style="height:${h||8}px">${z.map((v,i)=>`<i style="width:${v/tot*100}%;background:${ZONE_C[i]}"></i>`).join('')}</div>`}
function sessionSummary(d){
  const k=tplOf(d),t=k&&T[k];const l=S.logs[d]||{};const ex=[];let sets=0,vol=0;
  Object.keys(l).forEach(s=>{if(s[0]==='_')return;const o=l[s];if(!o||!o.ex||!E[o.ex])return;const ds2=(o.sets||[]).filter(q=>q.d);if(!ds2.length)return;ds2.forEach(q=>{sets++;vol+=(+q.w||0)*(+q.r||0)});ex.push({ex:o.ex,sets:ds2})});
  return{k,t,ex,sets,vol,done:!!S.done[d],cardio:isChk(d,'cardio')};
}
function wkCard(){
  const t=todayS(),list=wkList(addD(t,-27),t);let h=`<div class="card" style="--c:${WC.strain}"><h4 class="disp" style="margin:0 0 4px">Workouts</h4>`;
  if(!UI.wdemo&&S.whoop.wkAccess===false)h+=`<div class="note">WHOOP needs permission to share workouts. Reconnect once to load them.${WH_ON?' <button class="mini" data-a="wconnect">Reconnect WHOOP</button>':''}</div>`;
  if(!list.length){h+=`<p class="muted" style="font-size:13.5px;margin:0">No workouts from WHOOP in the last 4 weeks yet. Workouts appear here after WHOOP scores them.</p></div>`;return h}
  h+=`<p class="muted" style="font-size:13px;margin:0 0 4px">Last 4 weeks. Tap one for heart-rate zones and what you lifted.</p>`;
  const show=UI.wkAll?list:list.slice(0,6);
  show.forEach(w=>{const s=sessionSummary(w.d),st=new Date(w.start);
    h+=`<button class="wkrow" data-a="wkopen" data-v="${w.id}"><div class="wkt"><b>${esc(sportName(w.sport))}</b><span class="num">${short(w.d)} · ${st.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})} · ${wkMins(w)} min</span>${s.t&&(s.sets||s.done)?`<em>${esc(s.t.n)}${s.sets?' · '+s.sets+' sets':''}</em>`:''}</div>
    <div class="wks"><b class="num">${w.strain!=null?w.strain.toFixed(1):'–'}</b><span>strain</span></div><div class="wks"><b class="num">${w.ahr||'–'}</b><span>avg bpm</span></div>${zoneBar(w.zones,6)}</button>`});
  if(list.length>6)h+=`<button class="cta ghost" data-a="wkall">${UI.wkAll?'Show fewer':'Show all '+list.length}</button>`;
  return h+`</div>`;
}
function wkSheet(id){
  const w=wkAll()[id];if(!w)return;const s=sessionSummary(w.d),st=new Date(w.start),en=new Date(w.end),tot=w.zones.reduce((a,b)=>a+b,0)||1;
  const same=Object.values(wkAll()).filter(x=>x.sport===w.sport&&x.id!==w.id&&x.d<w.d&&x.d>=addD(w.d,-28)&&x.strain!=null);const avgS=same.length?same.reduce((a,x)=>a+x.strain,0)/same.length:null;
  const hi=(w.zones[4]+w.zones[5])/6e4;
  let h=`<h4 class="disp">${esc(sportName(w.sport))}</h4><p class="muted" style="font-size:13.5px;margin:0 0 8px">${nice(w.d)} · ${st.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})}–${en.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})} · ${wkMins(w)} min${w.pct!=null&&w.pct<95?' · '+Math.round(w.pct)+'% recorded':''}</p>
  <div class="grid2"><div class="stat"><b class="disp num">${w.strain!=null?w.strain.toFixed(1):'–'}</b><span>Strain${avgS!=null?` (usual ${avgS.toFixed(1)})`:''}</span></div><div class="stat"><b class="disp num">${w.kj!=null?Math.round(w.kj/4.184):'–'}</b><span>Calories</span></div><div class="stat"><b class="disp num">${w.ahr||'–'}</b><span>Average heart rate</span></div><div class="stat"><b class="disp num">${w.mhr||'–'}</b><span>Max heart rate</span></div>${w.dist?`<div class="stat"><b class="disp num">${(w.dist/1000).toFixed(2)} km</b><span>Distance</span></div>`:''}<div class="stat"><b class="disp num">${Math.round(hi)} min</b><span>Zones 4–5 (hard)</span></div></div>
  <div class="card" style="margin-top:10px"><b>Heart-rate zones</b><span class="muted" style="font-size:12.5px"> · % of max heart rate</span>${zoneBar(w.zones,12)}
  ${w.zones.map((v,i)=>`<div class="zrow"><i style="background:${ZONE_C[i]}"></i><span>${ZONE_L[i]}</span><b class="num">${Math.round(v/6e4)} min</b><em class="num">${Math.round(v/tot*100)}%</em></div>`).join('')}</div>`;
  h+=`<div class="card"><b>Your IRON session that day</b>`;
  if(!s.t)h+=`<p class="muted" style="font-size:13.5px;margin:4px 0 0">No IRON session on this day.</p>`;
  else{h+=`<div class="muted" style="font-size:13px;margin:2px 0 6px">${esc(s.t.n)}${s.done?' · finished':''}${s.sets?` · ${s.sets} sets · ${Math.round(s.vol).toLocaleString()} kg volume`:''}${s.cardio?' · cardio done':''}</div>`;
    if(s.ex.length)h+=s.ex.map(x=>`<div class="wkex"><button class="wklink" data-a="lifthist" data-e="${x.ex}">${esc(E[x.ex].n)} ›</button><span class="num">${x.sets.map(q=>(q.w!==''&&q.w!=null?q.w+' kg × ':'')+(q.r||'–')).join(', ')}</span></div>`).join('');
    else h+=`<p class="muted" style="font-size:13.5px;margin:0">No sets logged in IRON for this day.</p>`;
    h+=`<button class="mini" style="margin-top:8px" data-a="histday" data-d="${w.d}">Open this day →</button>`}
  h+=`</div><p class="muted" style="font-size:12px">WHOOP shares heart rate and strain. Sets and weights come from what you log in IRON.</p><button class="cta ghost" data-a="close">Close</button>`;
  openSheet(h);
}
function whoopAfterSync(j){
  const t=todayS();
  if(j.body){S.wbody=j.body;const lw=lastVal('weight',t);if(j.body.weight&&(!lw||Math.abs(lw.v-j.body.weight)>=0.05)){S.body[t]=Object.assign({},S.body[t],{weight:Math.round(j.body.weight*10)/10,src:'whoop'})}}
  autoLinkHabits();
}
function sparkSVG(key,d,n,c){const vals=[];for(let i=n-1;i>=0;i--)vals.push(mval(key,addD(d,-i)));const v=vals.filter(x=>x!=null);if(v.length<2)return'';const mn=Math.min(...v),mx=Math.max(...v),rg=mx-mn||1;let pts='';vals.forEach((x,i)=>{if(x==null)return;pts+=`${(i/(n-1)*96+2).toFixed(1)},${(26-(x-mn)/rg*22).toFixed(1)} `});return`<svg viewBox="0 0 100 30" preserveAspectRatio="none"><polyline points="${pts}" fill="none" stroke="${c}" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/></svg>`}
function deltaTxt(key,v,a){const M=MET[key];if(v==null||a==null)return'<span class="dl neutral">Building average</span>';const diff=v-a;const cls=M.dir===0?'neutral':(diff*M.dir>=0?'good':'bad');const txt=key==='hrv'||key==='steps'?Math.abs(Math.round(diff/a*100))+'%':Math.abs(diff).toFixed(M.dec||0)+(M.u==='°C'?'°':M.u==='bpm'?'':M.u==='%'?' pts':'');return`<span class="dl ${cls}">${diff>=0?'▲':'▼'} ${txt} vs 30-day avg</span>`}
function vital(key,d){const M=MET[key],v=mval(key,d),a=mavg(key,d,30,true);const val=v==null?'–':(key==='steps'?Math.round(v).toLocaleString():(+v).toFixed(M.dec||0));
  return`<button class="vital" style="--c:${M.c}" data-a="metric" data-v="${key}" aria-label="${M.l} details"><div class="vl"><span>${M.l}</span><span class="go">›</span></div><b class="disp num">${val}<small>${M.u}</small></b>${deltaTxt(key,v,a)}${sparkSVG(key,d,14,M.c)}</button>`}
function insights(){
  const t=todayS(),out=[];const days=[];for(let i=0;i<90;i++)days.push(addD(t,-i));
  const avg=a=>a.length?a.reduce((p,q)=>p+q,0)/a.length:null;
  const h7=mavg('hrv',t,7),hp=(()=>{let a=[];for(let i=7;i<14;i++){const v=mval('hrv',addD(t,-i));if(v!=null)a.push(v)}return avg(a)})();
  if(h7&&hp){const ch=(h7-hp)/hp*100;out.push({e:Math.abs(ch)<2?'⚖️':ch>=0?'📈':'📉',c:ch>=0?WC.rec:WC.rhr,k:'hrv',t:Math.abs(ch)<2?'HRV is steady this week':`HRV is ${ch>=0?'up':'down'} ${Math.abs(Math.round(ch))}% this week`,s:`7-day average ${Math.round(h7)} ms vs ${Math.round(hp)} ms the week before.${ch<-8?' Prioritise sleep and keep intensity moderate.':ch>5?' Your body is adapting well to training.':''}`})}
  const good=[],short=[];days.forEach(d=>{const x=W(d);if(x&&x.sleep&&x.sleep.dur!=null&&x.rec!=null)(x.sleep.dur>=7.5?good:short).push(x.rec)});
  if(good.length>=3&&short.length>=3){const df=Math.round(avg(good)-avg(short));out.push({e:'🌙',c:WC.sleep,k:'sleep',t:`7.5h+ sleep = ${df>=0?'+':''}${df}% recovery`,s:`Recovery averages ${Math.round(avg(good))}% after 7.5 hours or more of sleep, vs ${Math.round(avg(short))}% after shorter nights.`})}
  const byW=[[],[],[],[],[],[],[]];days.forEach(d=>{const v=mval('rec',d);if(v!=null)byW[dow(d)].push(v)});const wa=byW.map(a=>a.length>=2?avg(a):null);
  if(wa.filter(x=>x!=null).length>=5){const ok=wa.filter(x=>x!=null);const best=wa.indexOf(Math.max(...ok)),worst=wa.indexOf(Math.min(...ok));out.push({e:'📅',c:WC.strain,k:'rec',t:`${DN[best]}s are your best recovery days`,s:`${DN[best]} averages ${Math.round(wa[best])}%, ${DN[worst]} only ${Math.round(wa[worst])}%. Plan your heaviest sessions accordingly.`})}
  const up=[],lo=[];days.forEach(d=>{const k=tplOf(d);if(!k||!S.done[d])return;const v=mval('rec',addD(d,1));if(v==null)return;if(T[k].k==='upper')up.push(v);if(T[k].k==='lower')lo.push(v)});
  if(up.length>=2&&lo.length>=2)out.push({e:'🏋️',c:COLORS.lower,k:'rec',t:`Leg days cost ${Math.max(0,Math.round(avg(up)-avg(lo)))}% more recovery`,s:`Next-day recovery: ${Math.round(avg(lo))}% after lower body vs ${Math.round(avg(up))}% after upper body.`});
  const hs=[],ls=[];days.forEach(d=>{const x=W(d),n=mval('rec',addD(d,1));if(!x||x.strain==null||n==null)return;(x.strain>=14?hs:ls).push(n)});
  if(hs.length>=3&&ls.length>=3)out.push({e:'⚡',c:WC.strain,k:'strain',t:`High-strain days drop next-day recovery ${Math.max(0,Math.round(avg(ls)-avg(hs)))}%`,s:`After strain 14+ you recover to ${Math.round(avg(hs))}% on average, vs ${Math.round(avg(ls))}% after lighter days.`});
  const st=[],sl=[];days.forEach(d=>{const x=W(d),n=mval('rec',addD(d,1));if(!x||x.steps==null||n==null)return;(x.steps>=(S.stepGoal||8000)?st:sl).push(n)});
  if(st.length>=3&&sl.length>=3){const df=Math.round(avg(st)-avg(sl));out.push({e:'👟',c:WC.steps,k:'steps',t:`Hitting your step goal: ${df>=0?'+':''}${df}% next-day recovery`,s:`Next-day recovery averages ${Math.round(avg(st))}% after ${(S.stepGoal||8000).toLocaleString()}+ steps vs ${Math.round(avg(sl))}% on quieter days.`})}
  const w1=lastVal('weight',t),w0=(()=>{for(let i=28;i<60;i++){const v=mval('weight',addD(t,-i));if(v!=null)return v}return null})();
  if(w1&&w0!=null){const df=w1.v-w0;out.push({e:'⚖️',c:WC.body,k:'weight',t:`Weight ${df>=0?'up':'down'} ${Math.abs(df).toFixed(1)} kg in about a month`,s:`Now ${w1.v.toFixed(1)} kg. Check body fat and lean mass to see whether it was fat or muscle that moved.`})}
  const l1=lastVal('lean',t),l0=(()=>{for(let i=21;i<75;i++){const v=mval('lean',addD(t,-i));if(v!=null)return v}return null})();
  if(l1&&l0!=null&&Math.abs(l1.v-l0)>=0.2){const df=l1.v-l0;out.push({e:'💪',c:'#2F5BFF',k:'lean',t:`Lean mass ${df>=0?'up':'down'} ${Math.abs(df).toFixed(1)} kg`,s:`Now ${l1.v.toFixed(1)} kg, compared with about a month ago. ${df>=0?'Training is building muscle.':'Check protein, sleep and calories.'}`})}
  return out;
}
function bodyCard(){
  const t=todayS();
  const tile=k=>{const lv=lastVal(k,t);const M=MET[k];return`<button class="btile" style="--c:${M.c}" data-a="metric" data-v="${k}"><span>${M.l}</span><b class="disp num">${lv?(+lv.v).toFixed(M.dec||0):'–'}<small>${M.u}</small></b><em>${lv?(lv.d===t?'today':short(lv.d)):'not logged'}</em></button>`};
  return`<div class="card" style="--c:${WC.body}"><div class="ctop"><h4 class="disp" style="margin:0">Body</h4><button class="mini" data-a="bodylog">＋ Log</button></div>
  <div class="bgrid">${BODY_KEYS.map(tile).join('')}</div>
  <div class="pnote">Weight updates from your WHOOP profile when it changes. Log body fat weekly, same day and time. Lean mass is calculated: weight × (1 − body fat %).</div></div>`;
}
/* =====================================================================
   INBODY: upload a result sheet (photo or PDF). A server function reads it
   with Claude and returns the numbers; you review them, then IRON stores
   them as body measurements and tracks them over time.
   ===================================================================== */
const IB_FIELDS=[['weight_kg','Weight','kg'],['skeletal_muscle_mass_kg','Skeletal muscle mass','kg'],['body_fat_mass_kg','Body fat mass','kg'],['percent_body_fat','Body fat','%'],['inbody_score','InBody score',''],['visceral_fat_level','Visceral fat level',''],['bmi','BMI',''],['waist_hip_ratio','Waist-hip ratio',''],['total_body_water_l','Total body water','L'],['protein_kg','Protein','kg'],['minerals_kg','Minerals','kg'],['basal_metabolic_rate_kcal','Basal metabolic rate','kcal'],['target_weight_kg','Target weight','kg'],['fat_control_kg','Fat control','kg'],['muscle_control_kg','Muscle control','kg']];
const IB_SEG=[['left_arm','Left arm'],['right_arm','Right arm'],['trunk','Trunk'],['left_leg','Left leg'],['right_leg','Right leg']];
function ibAll(){return S.inbody||{}}
function ibDates(){return Object.keys(ibAll()).sort()}
function ibLatest(){const d=ibDates();return d.length?{d:d[d.length-1],r:ibAll()[d[d.length-1]],prev:d.length>1?ibAll()[d[d.length-2]]:null}:null}
function ibUploadPick(){let inp=document.getElementById('ibfile');if(!inp){inp=document.createElement('input');inp.type='file';inp.id='ibfile';inp.accept='image/*,application/pdf';inp.style.display='none';document.body.appendChild(inp);inp.addEventListener('change',()=>{const f=inp.files&&inp.files[0];inp.value='';if(f)ibRead(f)})}inp.click()}
function fileB64(f){return new Promise((res,rej)=>{const r=new FileReader();r.onload=()=>res(String(r.result).split(',')[1]);r.onerror=rej;r.readAsDataURL(f)})}
/* photos are shrunk to keep uploads small; numbers stay readable at 2000 px */
function shrinkImage(f){return new Promise((res,rej)=>{const url=URL.createObjectURL(f),im=new Image();im.onload=()=>{const sc=Math.min(1,2000/Math.max(im.width,im.height)),cv=document.createElement('canvas');cv.width=Math.round(im.width*sc);cv.height=Math.round(im.height*sc);cv.getContext('2d').drawImage(im,0,0,cv.width,cv.height);URL.revokeObjectURL(url);res(cv.toDataURL('image/jpeg',.9).split(',')[1])};im.onerror=()=>{URL.revokeObjectURL(url);rej(new Error('image'))};im.src=url})}
async function ibRead(f){
  openSheet(`<h4 class="disp">Reading your InBody…</h4><p class="muted" style="font-size:14px">This usually takes 10–30 seconds.</p><div class="ibspin"></div>`);
  let report=null,msg='';
  try{const isPdf=f.type==='application/pdf';if(isPdf&&f.size>4.5e6)throw Object.assign(new Error(),{m:'That PDF is over 4.5 MB. Take a photo or screenshot of the result page instead.'});
    const data=isPdf?await fileB64(f):await shrinkImage(f);
    const r=await fetch('/api/inbody-read',{method:'POST',headers:{'Content-Type':'application/json','x-iron-key':wKey()},body:JSON.stringify({data,media_type:isPdf?'application/pdf':'image/jpeg'})});
    const j=await r.json().catch(()=>({}));
    if(r.ok&&j.ok)report=j.report;
    else msg={not_configured:'Automatic reading isn’t set up on this site yet (the ANTHROPIC_API_KEY setting is missing).',limit:'Daily upload limit reached. Try again tomorrow.',unreadable:'IRON couldn’t read that sheet. Try a sharper, straight-on photo.',busy:'The reader is busy. Try again in a minute.'}[j.error]||'IRON couldn’t read the sheet automatically.';
  }catch(e){msg=e&&e.m?e.m:(location.protocol==='file:'?'Automatic reading works on the installed site, not from a local file.':'IRON couldn’t read the sheet automatically.')}
  UI.ib={r:report||{segmental_lean_kg:{},segmental_lean_pct:{},segmental_fat_kg:{},segmental_fat_pct:{}},msg,auto:!!report};drawIbReview();
}
function drawIbReview(){
  const q=UI.ib,r=q.r,d=r.test_date&&/^\d{4}-\d\d-\d\d$/.test(r.test_date)?r.test_date:todayS();
  const fld=(k,l,u)=>`<label class="ibf"><span>${l}</span><input inputmode="decimal" data-ib="${k}" value="${r[k]!=null?r[k]:''}" placeholder="–"><em>${u}</em></label>`;
  openSheet(`<div data-raw><h4 class="disp">${q.auto?'Check your InBody numbers':'Enter your InBody numbers'}</h4>
  ${q.msg?`<div class="note">${esc(q.msg)} You can type the numbers in below.</div>`:'<p class="muted" style="font-size:13.5px;margin:0 0 8px">IRON read these from your sheet. Fix anything that looks wrong, then save.</p>'}
  <label class="fl2">Test date</label><input type="date" id="ibdate" value="${d}" max="${todayS()}">
  <div class="ibgrid">${IB_FIELDS.map(x=>fld(...x)).join('')}</div>
  <label class="fl2" style="margin-top:10px">Segmental lean (kg)</label><div class="ibgrid">${IB_SEG.map(([s,l])=>`<label class="ibf"><span>${l}</span><input inputmode="decimal" data-ib="segmental_lean_kg.${s}" value="${(r.segmental_lean_kg||{})[s]??''}" placeholder="–"><em>kg</em></label>`).join('')}</div>
  <label class="fl2" style="margin-top:10px">Segmental fat (kg)</label><div class="ibgrid">${IB_SEG.map(([s,l])=>`<label class="ibf"><span>${l}</span><input inputmode="decimal" data-ib="segmental_fat_kg.${s}" value="${(r.segmental_fat_kg||{})[s]??''}" placeholder="–"><em>kg</em></label>`).join('')}</div>
  <button class="cta" style="--c:${WC.body}" data-a="ibsave">Save InBody result</button><button class="cta ghost" data-a="close">Cancel</button></div>`);
}
function ibSave(){
  const q=UI.ib;if(!q)return;const r=clone(q.r);
  document.querySelectorAll('#panel input[data-ib]').forEach(i=>{const v=parseFloat(String(i.value).replace(',','.'));const val=isNaN(v)?null:v;const [a,b]=i.dataset.ib.split('.');if(b){r[a]=r[a]||{};r[a][b]=val}else r[a]=val});
  const d=document.getElementById('ibdate').value||todayS();
  if(r.weight_kg==null&&r.skeletal_muscle_mass_kg==null&&r.percent_body_fat==null){toast('Enter at least weight, muscle or body fat');return}
  r.test_date=d;S.inbody=S.inbody||{};S.inbody[d]=r;
  const b=Object.assign({},S.body[d]);const set=(k,v)=>{if(v!=null)b[k]=Math.round(v*100)/100};
  set('weight',r.weight_kg);set('fat',r.percent_body_fat);set('smm',r.skeletal_muscle_mass_kg);set('bfm',r.body_fat_mass_kg);set('visceral',r.visceral_fat_level);set('ibscore',r.inbody_score);set('whr',r.waist_hip_ratio);set('bmi',r.bmi);
  const ffm=r.fat_free_mass_kg!=null?r.fat_free_mass_kg:(r.weight_kg!=null&&r.body_fat_mass_kg!=null?r.weight_kg-r.body_fat_mass_kg:null);set('lean',ffm);
  b.src='inbody';S.body[d]=b;save();closeSheet();UI.ib=null;rerender();toast('InBody result saved for '+short(d));
}
function ibCard(){
  const L2=ibLatest();let h=`<div class="card" style="--c:${WC.body}"><div class="ctop"><h4 class="disp" style="margin:0">InBody</h4><button class="mini" data-a="ibupload">⬆ Upload</button></div>`;
  if(!L2)return h+`<p class="muted" style="font-size:13.5px;margin:6px 0 0">Upload a photo or PDF of your InBody result sheet. IRON reads the numbers, you check them, and they're tracked here over time.</p></div>`;
  const r=L2.r,p=L2.prev,dl=(k,good)=>{if(!p||r[k]==null||p[k]==null)return'';const v=r[k]-p[k];if(Math.abs(v)<0.05)return'<em class="ibd">±0</em>';const ok=good===0?null:(v>0)===(good>0);return`<em class="ibd" style="color:${ok==null?'var(--mu)':ok?'var(--ok)':'var(--bad)'}">${v>0?'+':''}${(+v).toFixed(k==='inbody_score'||k==='visceral_fat_level'?0:1)}</em>`};
  const tile=(k,l,u,good,mk)=>`<button class="btile" style="--c:${WC.body}" ${mk?`data-a="metric" data-v="${mk}"`:'data-a="ibopen"'}><span>${l}</span><b class="disp num">${r[k]!=null?(+r[k]).toFixed(k==='inbody_score'||k==='visceral_fat_level'?0:1):'–'}<small>${u}</small></b>${dl(k,good)}</button>`;
  h+=`<div class="muted" style="font-size:12.5px;margin:2px 0 8px">Latest scan ${nice(L2.d)}${p?' · change vs '+short(p.test_date):''}</div>
  <div class="bgrid">${tile('inbody_score','Score','',1,'ibscore')}${tile('skeletal_muscle_mass_kg','Muscle','kg',1,'smm')}${tile('body_fat_mass_kg','Fat mass','kg',-1,'bfm')}${tile('percent_body_fat','Body fat','%',-1,'fat')}${tile('visceral_fat_level','Visceral','',-1,'visceral')}${tile('weight_kg','Weight','kg',0,'weight')}</div>`;
  if(r.fat_control_kg!=null||r.muscle_control_kg!=null)h+=`<div class="note" style="margin-top:8px"><b>InBody targets:</b> ${r.target_weight_kg!=null?'reach '+r.target_weight_kg+' kg':''}${r.fat_control_kg!=null?` · fat ${r.fat_control_kg>0?'+':''}${r.fat_control_kg} kg`:''}${r.muscle_control_kg!=null?` · muscle ${r.muscle_control_kg>0?'+':''}${r.muscle_control_kg} kg`:''}</div>`;
  return h+`<button class="cta ghost" data-a="ibopen">Full report and history</button></div>`;
}
function ibSheet(){
  const L2=ibLatest();if(!L2){ibUploadPick();return}const r=L2.r,ds2=ibDates();
  const seg=(key,pk)=>{const s=r[key]||{},pc=r[pk]||{};const cell=(n)=>{const v=s[n],p=pc[n];return`<div class="ibseg ${p!=null?(p>110?'over':p<90?'under':''):''}"><span>${IB_SEG.find(x=>x[0]===n)[1]}</span><b class="num">${v!=null?v+' kg':'–'}</b>${p!=null?`<em class="num">${p}%</em>`:''}</div>`};return`<div class="ibbody">${cell('left_arm')}${cell('right_arm')}${cell('trunk')}${cell('left_leg')}${cell('right_leg')}</div>`};
  const imb=(()=>{const a=r.segmental_lean_kg||{};const out=[];[['left_arm','right_arm','arms'],['left_leg','right_leg','legs']].forEach(([l,rr,n])=>{if(a[l]&&a[rr]){const df=Math.abs(a[l]-a[rr])/Math.max(a[l],a[rr]);if(df>=0.05)out.push(`${n}: ${a[l]<a[rr]?'left':'right'} side is ${Math.round(df*100)}% lighter`)}});return out})();
  openSheet(`<h4 class="disp">InBody ${short(L2.d)}</h4><p class="muted" style="font-size:13.5px;margin:0 0 8px">${esc(r.device||'InBody')}${r.age?' · age '+r.age:''}${r.height_cm?' · '+r.height_cm+' cm':''}</p>
  <div class="card">${IB_FIELDS.filter(([k])=>r[k]!=null).map(([k,l,u])=>`<div class="hrow" style="grid-template-columns:1fr auto"><span>${l}</span><b class="num">${r[k]}${u?' '+u:''}</b></div>`).join('')}</div>
  <label class="fl2">Segmental lean (vs normal for your size)</label>${seg('segmental_lean_kg','segmental_lean_pct')}
  <label class="fl2">Segmental fat</label>${seg('segmental_fat_kg','segmental_fat_pct')}
  ${imb.length?`<div class="note"><b>Left–right difference:</b> ${imb.join('; ')}. Single-leg and single-arm work, weaker side first, helps even this out.</div>`:''}
  <label class="fl2" style="margin-top:10px">History</label>${ds2.slice().reverse().map(d=>{const x=ibAll()[d];return`<div class="hrow" style="grid-template-columns:1fr auto auto auto"><span>${short(d)}</span><b class="num">${x.weight_kg??'–'} kg</b><span class="num">${x.skeletal_muscle_mass_kg??'–'} SMM</span><span class="num">${x.percent_body_fat??'–'}%</span></div>`}).join('')}
  <button class="cta" style="--c:${WC.body}" data-a="ibupload">⬆ Upload a new scan</button><button class="cta ghost" data-a="ibshare">Share summary</button><button class="cta ghost" data-a="close">Close</button>`);
}
function ibText(){const L2=ibLatest();if(!L2)return'';const r=L2.r;return`InBody ${nice(L2.d)}\n`+IB_FIELDS.filter(([k])=>r[k]!=null).map(([k,l,u])=>`${l}: ${r[k]}${u?' '+u:''}`).join('\n')}
function stepsCard(d){
  const x=W(d)||{},goal=S.stepGoal||8000,v=x.steps;const p=v!=null?Math.min(1,v/goal):0;
  let bars='';const vals=[];for(let i=6;i>=0;i--){const dd=addD(d,-i);vals.push([dd,mval('steps',dd)])}const mx=Math.max(goal,...vals.map(q=>q[1]||0));
  vals.forEach(([dd,vv])=>{const hh=vv!=null?Math.max(4,vv/mx*56):4;bars+=`<div class="sb"><i style="height:${hh}px;background:${vv!=null&&vv>=goal?WC.steps:'color-mix(in srgb,'+WC.steps+' 40%,var(--sf2))'}"></i><span>${DS[dow(dd)][0]}</span></div>`});
  const gy=56-goal/mx*56;
  return`<div class="card" style="--c:${WC.steps}"><div class="ctop"><button class="linkhead" data-a="metric" data-v="steps"><h4 class="disp" style="margin:0">Steps ›</h4></button><button class="mini" data-a="stepgoal">Goal ${goal.toLocaleString()}</button></div>
  <div style="display:flex;gap:14px;align-items:flex-end;margin-top:6px"><div style="flex:1"><b class="disp num" style="font-size:44px;color:${WC.steps}">${v!=null?Math.round(v).toLocaleString():'–'}</b><div class="muted" style="font-size:13px">${v==null?(x.rec!=null?'Steps not reported for this day':'No data yet'):v>=goal?'Goal reached 🎉':(goal-v).toLocaleString()+' to go'}</div>
  <div class="bar2" style="margin-top:8px"><span style="width:${p*100}%;background:${WC.steps}"></span></div></div>
  <div class="sbars"><div class="gline" style="top:${gy.toFixed(0)}px"></div>${bars}</div></div></div>`;
}
function renderWhoop(){
  const v=document.getElementById('view'),t=todayS();
  if(!S.whoop.connected&&!UI.wdemo){
    v.innerHTML=`<h2 class="pagetitle disp">WHOOP</h2><p class="sub">Recovery, sleep, strain, steps and body in one place, linked to your training.</p>
    <div class="whero" style="--c:#191A4A;grid-template-columns:1fr"><div style="position:relative;z-index:1"><div class="wd">Not connected</div><h3 class="disp">Your body's daily report</h3><p>Connect WHOOP to see recovery, HRV, resting heart rate, sleep stages, strain and steps, plus insights on how your training affects recovery.</p>
    <div class="hero-actions">${WH_ON?'<button class="hbtn solid" style="--c:#191A4A" data-a="wconnect">Connect WHOOP</button>':'<button class="hbtn solid" style="--c:#191A4A" data-a="settings">Open Settings</button>'}<button class="hbtn" data-a="wdemo">Preview with sample data</button></div></div></div>${bodyCard()}`;return}
  const d=UI.wday&&W(UI.wday)?UI.wday:latestDay();UI.wday=d;const x=W(d)||{};
  let h=`<div class="phead"><h2 class="pagetitle disp">WHOOP</h2>${UI.wdemo?'':`<button class="addbtn" style="--c:var(--ink);color:var(--bg)" data-a="wsync">↻ Sync</button>`}</div>`;
  if(UI.wdemo)h+=`<div class="demo-banner"><span>Sample data preview. Nothing here is yours yet.</span><button class="mini" data-a="wdemo">Exit</button></div>`;
  const rc=x.rec!=null?recCol(x.rec):'#8E97BF',R=60,C=2*Math.PI*R,L=C*.75,val=x.rec!=null?L*x.rec/100:0;
  const lvl=x.rec==null?null:(UI.wdemo?(x.rec>=67?'g':x.rec>=34?'y':'r'):(whoopDay(d)||{}).lvl);
  const head={g:'Primed to push',y:'Steady. Train smart.',r:'Recover today'}[lvl]||'Waiting for data';
  const k=tplOf(d);const plan=k?T[k]:null;
  const impact=!plan?'':plan.blocks?({g:`${plan.n} runs in full.`,y:`${plan.n} becomes a lighter day.`,r:`${plan.n} switches to recovery only.`}[lvl]||''):`${plan.n} today.`;
  h+=`<section class="whero" style="--c:${rc}"><button class="wring" data-a="metric" data-v="rec" aria-label="Recovery details"><svg viewBox="0 0 150 150"><circle cx="75" cy="75" r="${R}" fill="none" stroke="rgba(255,255,255,.28)" stroke-width="13" stroke-linecap="round" stroke-dasharray="${L} ${C}" transform="rotate(135 75 75)"/><circle class="arc" cx="75" cy="75" r="${R}" fill="none" stroke="#fff" stroke-width="13" stroke-linecap="round" stroke-dasharray="${val} ${C}" transform="rotate(135 75 75)"/></svg><div class="v"><b class="disp num">${x.rec!=null?Math.round(x.rec):'–'}</b><span>Recovery % ›</span></div></button>
    <div style="position:relative;z-index:1"><div class="wd">${d===t?'Today':nice(d)}</div><h3 class="disp">${head}</h3><p>${impact}${x.cal?' WHOOP is still calibrating.':''}</p>${plan&&plan.blocks?`<button class="hbtn solid" style="--c:${rc}" data-a="openday" data-d="${d}">Open workout</button>`:''}</div></section>`;
  let bars='',lab='';for(let i=13;i>=0;i--){const dd=addD(t,-i),xx=W(dd),r=xx&&xx.rec!=null?xx.rec:null;bars+=`<button class="wbar ${dd===d?'on':''} ${r==null?'none':''}" style="--c:${r!=null?recCol(r):'transparent'};height:${r!=null?Math.max(8,r*.7):8}px" data-a="wday" data-d="${dd}" aria-label="${nice(dd)}${r!=null?', recovery '+Math.round(r)+'%':''}"></button>`;lab+=`<span>${i%2?'':DS[dow(dd)][0]+pd(dd).getDate()}</span>`}
  h+=`<div class="wbars">${bars}</div><div class="wdays">${lab}</div><p class="tapnote">Tap any card to see its full history and details.</p>`;
  h+=`<div class="vgrid">${vital('hrv',d)}${vital('rhr',d)}${vital('spo2',d)}${vital('skin',d)}</div>`;
  h+=stepsCard(d);
  const sl=x.sleep;
  if(sl){const tot=(sl.light||0)+(sl.deep||0)+(sl.rem||0)+(sl.awake||0)||1;const pctNeed=sl.need?Math.min(100,sl.dur/sl.need*100):null;
    h+=`<div class="card" style="--c:${WC.sleep}"><button class="linkhead wide" data-a="metric" data-v="sleep"><div><h4 class="disp" style="margin:0">Sleep ›</h4><div class="muted" style="font-size:13px">${sl.bed?new Date(sl.bed).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})+' to '+new Date(sl.wake).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):''}</div></div><div style="text-align:right"><b class="disp num" style="font-size:38px;color:${WC.sleep}">${hm(sl.dur)}</b><div class="muted" style="font-size:12.5px">${sl.need?'needed '+hm(sl.need):''}</div></div></button>
    ${pctNeed!=null?`<div class="bar2" style="margin-top:8px"><span style="width:${pctNeed}%;background:${WC.sleep}"></span></div>`:''}
    <div class="sbar">${[['awake','#C8CDEA'],['light','#9DB8FF'],['deep','#2F5BFF'],['rem','#7B4DFF']].map(([kk,cc])=>`<i style="width:${(sl[kk]||0)/tot*100}%;background:${cc}"></i>`).join('')}</div>
    <div class="slegend">${[['Awake','awake','#C8CDEA'],['Light','light','#9DB8FF'],['Deep','deep','#2F5BFF'],['REM','rem','#7B4DFF']].map(([n,kk,cc])=>`<span style="--c:${cc}">${n}<em>${hm(sl[kk])}</em></span>`).join('')}</div>
    <div class="kv"><button data-a="metric" data-v="sleepPerf"><b class="disp num">${sl.perf!=null?Math.round(sl.perf)+'%':'–'}</b><span>Performance ›</span></button><div><b class="disp num">${sl.eff!=null?sl.eff+'%':'–'}</b><span>Efficiency</span></div><div><b class="disp num">${sl.cons!=null?Math.round(sl.cons)+'%':'–'}</b><span>Consistency</span></div><div><b class="disp num">${sl.rr!=null?sl.rr:'–'}</b><span>Resp. rate</span></div></div></div>`}
  const sv=x.strain!=null?x.strain:null;const band=lvl==='g'?[14,18]:lvl==='y'?[10,14]:[0,10];
  {const R2=62,arc=(a0,a1)=>{const p=a=>[80+R2*Math.cos(Math.PI*(1-a/21)),82-R2*Math.sin(Math.PI*(1-a/21))];const[x0,y0]=p(a0),[x1,y1]=p(a1);return`M${x0.toFixed(1)} ${y0.toFixed(1)} A${R2} ${R2} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`};
    const sw=sv!=null?sv:0;const nd=(()=>{const a=Math.PI*(1-Math.min(21,sw)/21);return[80+R2*Math.cos(a),82-R2*Math.sin(a)]})();
    h+=`<div class="card" style="--c:${WC.strain}"><button class="linkhead wide" data-a="metric" data-v="strain" style="justify-content:flex-start;gap:12px"><svg viewBox="0 0 160 92" style="width:150px;flex:0 0 150px"><path d="${arc(0,21)}" fill="none" stroke="var(--sf2)" stroke-width="14" stroke-linecap="round"/>${lvl?`<path d="${arc(band[0]+.01,band[1])}" fill="none" stroke="${rc}" stroke-opacity=".35" stroke-width="14"/>`:''}${sv!=null?`<path class="arc" d="${arc(0,Math.max(.2,Math.min(21,sw)))}" fill="none" stroke="${WC.strain}" stroke-width="14" stroke-linecap="round"/><circle cx="${nd[0].toFixed(1)}" cy="${nd[1].toFixed(1)}" r="6" fill="#fff" stroke="${WC.strain}" stroke-width="3"/>`:''}<text x="80" y="78" text-anchor="middle" font-size="30" font-weight="850" fill="var(--ink)" style="font-stretch:68%">${sv!=null?sv.toFixed(1):'–'}</text></svg>
    <div><h4 class="disp" style="margin:0">Strain ›</h4><div style="font-size:13.5px">${lvl?`Target for a ${{g:'green',y:'yellow',r:'red'}[lvl]} day: <b>${band[0]}–${band[1]}</b>.`:''} ${sv!=null&&lvl?(sv>band[1]?'You went over, so prioritise sleep tonight.':sv>=band[0]?'Right in the zone.':d===t?'Room to build as the day goes on.':'Lighter than the target.'):''}</div></div></button>
    <div class="kv" style="grid-template-columns:repeat(3,1fr)"><button data-a="metric" data-v="kcal"><b class="disp num">${x.kcal!=null?x.kcal.toLocaleString():'–'}</b><span>Calories ›</span></button><button data-a="metric" data-v="ahr"><b class="disp num">${x.ahr||'–'}</b><span>Avg HR ›</span></button><div><b class="disp num">${x.mhr||'–'}</b><span>Max HR</span></div></div></div>`}
  {const wi=UI.wdemo?null:weekInt(t);if(wi)h+=`<div class="card" style="--c:${wi.lvl==='push'?'var(--ok)':wi.lvl==='ease'?'var(--bad)':'var(--upper)'}"><h4 class="disp" style="margin:0 0 4px">Training intensity this week: ${wi.lvl==='push'?'push':wi.lvl==='ease'?'ease off':'normal'}</h4><p style="font-size:13.5px;margin:0">${esc(wi.why)}</p></div>`}
  h+=wkCard();
  h+=bodyCard();
  h+=ibCard();
  const mk=UI.wmet||'rec',rg=UI.wrange||30,M=MET[mk];
  h+=`<div class="card" style="--c:${M.c}"><h4 class="disp" style="margin:0">Trends</h4><div class="chipsrow">${['rec','hrv','rhr','sleep','strain','steps','weight','fat','lean',...(Object.keys(S.inbody||{}).length?['smm','bfm','visceral','ibscore']:[])].map(kk=>`<button class="mchip ${kk===mk?'on':''}" style="--c:${MET[kk].c}" data-a="wmet" data-v="${kk}">${MET[kk].l}</button>`).join('')}</div>
  <div class="chipsrow">${[7,30,90].map(n=>`<button class="mchip ${n===rg?'on':''}" style="--c:var(--ink)" data-a="wrange" data-v="${n}">${n} days</button>`).join('')}</div>
  <div class="wchart" id="wwrap"><div class="wtip" id="wtip"></div><svg id="wchart" viewBox="0 0 340 170"></svg></div><div class="kv" id="wsum" style="grid-template-columns:repeat(4,1fr)"></div></div>`;
  const ins=insights();
  h+=`<div class="card"><h4 class="disp">Insights</h4>${ins.length?ins.map(i=>`<button class="insight" style="--c:${i.c}" data-a="metric" data-v="${i.k}"><span class="ic">${i.e}</span><div><b>${esc(i.t)}</b><span>${esc(i.s)}</span></div></button>`).join(''):'<p class="muted" style="margin:0;font-size:14px">Insights appear after about two weeks of data: sleep vs recovery, your best days, steps, and how leg days and high strain affect you.</p>'}</div>`;
  v.innerHTML=h;drawChart('w',mk,rg,true);
}
function drawChart(px,mk,n,clickable){
  const svg=document.getElementById(px+'chart');if(!svg)return;const t=todayS(),M=MET[mk];
  const X0=34,X1=332,Y0=12,Y1=142;const pts=[];for(let i=n-1;i>=0;i--){const d=addD(t,-i);pts.push({d,v:mval(mk,d)})}
  const vals=pts.filter(p=>p.v!=null).map(p=>p.v);const sum=document.getElementById(px+'sum');
  if(!vals.length){svg.innerHTML=`<text x="170" y="85" text-anchor="middle" fill="var(--mu)" font-size="13" font-weight="700">No data in this range yet</text>`;if(sum)sum.innerHTML='';return}
  let mn=Math.min(...vals),mx=Math.max(...vals);if(mk==='rec'){mn=0;mx=100}else{const pd2=(mx-mn)*.15||1;mn-=pd2;mx+=pd2;if(mk==='steps')mn=Math.max(0,mn)}
  const sx=i=>X0+(n===1?0:i/(n-1))*(X1-X0),sy=v=>Y1-(v-mn)/(mx-mn)*(Y1-Y0);pts.forEach((p,i)=>{p.x=sx(i);p.y=p.v!=null?sy(p.v):null});
  const avgv=vals.reduce((a,b)=>a+b,0)/vals.length;let g='';
  const yl=v=>mk==='sleep'?v.toFixed(1):mk==='steps'||mk==='kcal'?(v>=1000?(v/1000).toFixed(1)+'k':Math.round(v)):(M.dec?v.toFixed(1):Math.round(v));
  for(let i=0;i<=3;i++){const v=mn+(mx-mn)*i/3,y=sy(v);g+=`<line x1="${X0}" x2="${X1}" y1="${y.toFixed(1)}" y2="${y.toFixed(1)}" stroke="var(--ln)" stroke-width="1"/><text x="${X0-5}" y="${(y+4).toFixed(1)}" text-anchor="end" font-size="10" fill="var(--mu)" font-weight="700">${yl(v)}</text>`}
  let body='';const bars=mk==='rec'||mk==='steps'||mk==='strain'||mk==='kcal';
  if(bars){const bw=Math.max(2,(X1-X0)/n-2);pts.forEach(p=>{if(p.v==null)return;const col=mk==='rec'?recCol(p.v):(mk==='steps'&&p.v>=(S.stepGoal||8000)?M.c:M.c);body+=`<rect x="${(p.x-bw/2).toFixed(1)}" y="${p.y.toFixed(1)}" width="${bw.toFixed(1)}" height="${Math.max(0,Y1-p.y).toFixed(1)}" rx="${Math.min(4,bw/2)}" fill="${col}" opacity="${mk==='steps'&&p.v<(S.stepGoal||8000)?.45:.85}"/>`});
    if(mk==='steps'){const gy=sy(S.stepGoal||8000);if(gy>Y0&&gy<Y1)body+=`<line x1="${X0}" x2="${X1}" y1="${gy.toFixed(1)}" y2="${gy.toFixed(1)}" stroke="${M.c}" stroke-width="1.5"/><text x="${X0+4}" y="${(gy-4).toFixed(1)}" font-size="10" font-weight="800" fill="${M.c}">goal</text>`}}
  else{const seg=pts.filter(p=>p.v!=null);const line=seg.map(p=>`${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
    body+=`<defs><linearGradient id="${px}g" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="${M.c}" stop-opacity=".35"/><stop offset="1" stop-color="${M.c}" stop-opacity="0"/></linearGradient></defs><polygon points="${seg[0].x.toFixed(1)},${Y1} ${line} ${seg[seg.length-1].x.toFixed(1)},${Y1}" fill="url(#${px}g)"/><polyline points="${line}" fill="none" stroke="${M.c}" stroke-width="2.6" stroke-linejoin="round" stroke-linecap="round"/>`;
    if(n<=30||seg.length<=30)seg.forEach(p=>body+=`<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="2.8" fill="${M.c}"/>`)}
  const ay=sy(avgv);body+=`<line x1="${X0}" x2="${X1}" y1="${ay.toFixed(1)}" y2="${ay.toFixed(1)}" stroke="var(--ink)" stroke-dasharray="4 4" stroke-width="1.3" opacity=".55"/><text x="${X1}" y="${(ay-4).toFixed(1)}" text-anchor="end" font-size="10" font-weight="800" fill="var(--ink)" opacity=".7">avg ${fmtM(mk,avgv)}</text>`;
  const xl=[0,Math.floor((n-1)/2),n-1].map(i=>`<text x="${pts[i].x.toFixed(1)}" y="160" text-anchor="${i===0?'start':i===n-1?'end':'middle'}" font-size="10" fill="var(--mu)" font-weight="700">${short(pts[i].d)}</text>`).join('');
  svg.innerHTML=g+body+xl+`<line id="${px}guide" x1="0" x2="0" y1="${Y0}" y2="${Y1}" stroke="var(--ink)" stroke-width="1.2" opacity="0"/><circle id="${px}dot" r="5" fill="#fff" stroke="${M.c}" stroke-width="3" opacity="0"/>`;
  const prev=[];for(let i=n;i<2*n;i++){const v=mval(mk,addD(t,-i));if(v!=null)prev.push(v)}const pa=prev.length?prev.reduce((a,b)=>a+b,0)/prev.length:null;
  const ch=pa!=null?avgv-pa:null;const good=ch==null||M.dir===0?'neutral':(ch*M.dir>=0?'good':'bad');
  const chTxt=ch==null?'–':(ch>=0?'+':'')+(mk==='sleep'?Math.round(ch*60)+'m':mk==='steps'||mk==='kcal'?Math.round(ch).toLocaleString():(M.dec?ch.toFixed(1):Math.round(ch)));
  if(sum)sum.innerHTML=`<div><b class="disp num">${fmtM(mk,avgv)}</b><span>Average</span></div><div><b class="disp num">${fmtM(mk,Math.min(...vals))}</b><span>Low</span></div><div><b class="disp num">${fmtM(mk,Math.max(...vals))}</b><span>High</span></div><div><b class="disp num ${good}">${chTxt}</b><span>vs prior ${n}d</span></div>`;
  const wrap=document.getElementById(px+'wrap'),tip=document.getElementById(px+'tip'),gl=document.getElementById(px+'guide'),dot=document.getElementById(px+'dot');
  const pick=e=>{const r=svg.getBoundingClientRect();const xx=(e.clientX-r.left)/r.width*340;let best=null;pts.forEach(p=>{if(p.v==null)return;if(!best||Math.abs(p.x-xx)<Math.abs(best.x-xx))best=p});return best};
  const show=e=>{const p=pick(e);if(!p)return;gl.setAttribute('x1',p.x);gl.setAttribute('x2',p.x);gl.setAttribute('opacity','.4');dot.setAttribute('cx',p.x);dot.setAttribute('cy',p.y);dot.setAttribute('opacity','1');
    tip.textContent=`${short(p.d)} · ${fmtM(mk,p.v)}`;tip.style.left=Math.min(85,Math.max(15,p.x/340*100))+'%';tip.style.top=Math.max(0,p.y/170*wrap.clientWidth*170/340-34)+'px';tip.style.opacity='1'};
  svg.onpointermove=show;svg.onpointerdown=show;svg.onpointerleave=()=>{tip.style.opacity='0';gl.setAttribute('opacity','0');dot.setAttribute('opacity','0')};
  if(clickable)svg.onclick=e=>{const p=pick(e);if(p&&W(p.d)){UI.wday=p.d;renderWhoop();window.scrollTo({top:0,behavior:'smooth'})}};
}
