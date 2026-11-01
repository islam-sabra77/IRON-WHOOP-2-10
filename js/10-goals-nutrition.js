"use strict";
/* =====================================================================
   GOALS AND NUTRITION
   Goals: a lift (estimated 1RM), body weight, body fat %, muscle or fat mass,
   each with progress and a projected date from the trend of the last 8 weeks.
   Nutrition: daily protein and calories against targets worked out from your
   weight, lean mass (InBody when available), training and goal.
   ===================================================================== */
const GOAL_TYPES={lift:{l:'Lift',u:'kg',dir:1},weight:{l:'Body weight',u:'kg',dir:0},fat:{l:'Body fat',u:'%',dir:-1},smm:{l:'Skeletal muscle',u:'kg',dir:1},bfm:{l:'Body fat mass',u:'kg',dir:-1}};
function goalList(){return S.goals||(S.goals=[])}
/* data points (date, value) for a goal, oldest first */
function goalSeries(g){
  if(g.type==='lift'){return(hist()[g.ex]||[]).map(x=>({d:x.d,v:Math.max(...x.sets.map(q=>e1rm(+q.w,+q.r)))}))}
  const out=[];Object.keys(S.body||{}).sort().forEach(d=>{const v=mval(g.type,d);if(v!=null)out.push({d,v:+v})});return out;
}
function linreg(pts){const n=pts.length;if(n<2)return null;const x0=pd(pts[0].d).getTime();const xs=pts.map(p=>(pd(p.d).getTime()-x0)/864e5),ys=pts.map(p=>p.v);
  const mx=xs.reduce((a,b)=>a+b,0)/n,my=ys.reduce((a,b)=>a+b,0)/n;let sxy=0,sxx=0;xs.forEach((x,i)=>{sxy+=(x-mx)*(ys[i]-my);sxx+=(x-mx)*(x-mx)});if(!sxx)return null;const slope=sxy/sxx;return{slope,at:d=>my+slope*((pd(d).getTime()-x0)/864e5-mx)}}
function goalStatus(g){
  const pts=goalSeries(g),t=todayS();if(!pts.length)return{cur:null,pct:0,msg:'No data yet. Log it and the projection appears.'};
  const cur=g.type==='lift'?Math.max(...pts.filter(p=>p.d>=addD(t,-35)).map(p=>p.v).concat([pts[pts.length-1].v])):pts[pts.length-1].v;
  const start=g.start!=null?g.start:pts[0].v,span=g.target-start,pct=span?Math.max(0,Math.min(1,(cur-start)/span)):1;
  if(span>0?cur>=g.target:cur<=g.target)return{cur,pct:1,done:true,msg:'Reached. Set a new target.'};
  const recent=pts.filter(p=>p.d>=addD(t,-56));const lr=recent.length>=3&&diffD(recent[0].d,recent[recent.length-1].d)>=14?linreg(recent):null;
  if(!lr)return{cur,pct,msg:'Needs 3 entries over at least 2 weeks to project a date.'};
  const toward=(g.target-cur)*lr.slope>0;if(!toward||Math.abs(lr.slope)<1e-4)return{cur,pct,slope:lr.slope,msg:'Not moving toward the target yet. Keep going and check the plan.'};
  const days=Math.round((g.target-cur)/lr.slope),eta=addD(t,days);
  return{cur,pct,slope:lr.slope,eta,days,msg:`At your current rate (${lr.slope>0?'+':''}${(lr.slope*7).toFixed(2)} ${GOAL_TYPES[g.type].u}/week) you reach it around ${nice(eta)}${g.by?(eta<=g.by?', before your date':`, ${Math.round(diffD(g.by,eta)/7)} weeks after your date`):''}.`};
}
const goalName=g=>g.type==='lift'?(E[g.ex]?E[g.ex].n:'Lift'):GOAL_TYPES[g.type].l;
function goalFmt(g,v){if(v==null)return'–';const u=GOAL_TYPES[g.type].u;return(u==='%'?(+v).toFixed(1):Math.round(v*10)/10)+' '+u}
function renderGoals(){
  const gs=goalList();let h=`<div class="phead"><h2 class="pagetitle disp">Goals</h2><button class="addbtn" style="--c:var(--upper)" data-a="goaladd">${IC.plus}Add</button></div><p class="sub">Each goal shows your progress and when you'll get there at your current rate.</p>`;
  if(!gs.length)h+=`<div class="card"><p style="margin:0 0 8px">No goals yet. Try a lift target like a 100 kg bench, or a body target like 15% body fat.</p><button class="cta" style="--c:var(--upper)" data-a="goaladd">Set a goal</button></div>`;
  gs.forEach(g=>{const st=goalStatus(g),pts=goalSeries(g);const c=st.done?'var(--ok)':'var(--upper)';
    h+=`<div class="card goal" style="--c:${c}"><div class="ctop"><div><span class="hlab">${GOAL_TYPES[g.type].l}</span><h4 class="disp" style="margin:2px 0 0">${esc(goalName(g))}</h4></div><button class="mini" data-a="goaldel" data-v="${g.id}" aria-label="Remove goal">✕</button></div>
    <div class="gnums num"><b class="disp">${goalFmt(g,st.cur)}</b><span>→ ${goalFmt(g,g.target)}${g.by?' by '+short(g.by):''}</span></div>
    <div class="hbar" style="height:10px"><i style="width:${Math.round(st.pct*100)}%"></i></div>
    <p style="font-size:14px;margin:8px 0 0">${st.eta?`<b>Projected: ${nice(st.eta)}</b><br>`:''}${esc(st.msg)}</p>${pts.length>1?bigChart(pts.slice(-20).map(p=>p.v),c,GOAL_TYPES[g.type].u):''}</div>`});
  document.getElementById('view').innerHTML=h;
}
function goalSheet(){
  const q=UI.gd=UI.gd||{type:'lift',ex:'',target:'',by:''};
  const lifts=Object.keys(hist()).filter(e=>E[e]&&!E[e].bw&&!E[e].t).sort((a,b)=>hist()[b].length-hist()[a].length);
  const ib=typeof ibLatest==='function'?ibLatest():null;
  const hint=q.type==='weight'&&ib&&ib.r.target_weight_kg!=null?`<button class="mini" data-a="goalfill" data-v="${ib.r.target_weight_kg}">Use InBody target ${ib.r.target_weight_kg} kg</button>`:q.type==='bfm'&&ib&&ib.r.fat_control_kg!=null&&ib.r.body_fat_mass_kg!=null?`<button class="mini" data-a="goalfill" data-v="${Math.round((ib.r.body_fat_mass_kg+ib.r.fat_control_kg)*10)/10}">Use InBody target ${Math.round((ib.r.body_fat_mass_kg+ib.r.fat_control_kg)*10)/10} kg</button>`:'';
  openSheet(`<h4 class="disp">New goal</h4><div class="obrow wrap">${Object.keys(GOAL_TYPES).map(k=>`<button class="obopt ${q.type===k?'on':''}" data-a="goaltype" data-v="${k}"><b>${GOAL_TYPES[k].l}</b></button>`).join('')}</div>
  ${q.type==='lift'?`<label class="fl2">Exercise</label><select id="gex">${(lifts.length?lifts:Object.keys(META).filter(k=>META[k].main)).map(e=>`<option value="${e}" ${q.ex===e?'selected':''}>${esc(E[e].n)}</option>`).join('')}</select><p class="muted" style="font-size:13px;margin:4px 0 0">Target is an estimated one-rep max, worked out from your sets.</p>`:''}
  <label class="fl2">Target</label><div class="fld" style="height:52px"><input id="gtarget" inputmode="decimal" value="${q.target}" placeholder="e.g. ${q.type==='lift'?100:q.type==='fat'?15:q.type==='weight'?75:q.type==='smm'?37:12}"><em>${GOAL_TYPES[q.type].u==='kg'?uW():GOAL_TYPES[q.type].u}</em></div>${hint}
  <label class="fl2">By (optional)</label><input type="date" id="gby" value="${q.by}" min="${todayS()}">
  <button class="cta" style="--c:var(--upper)" data-a="goalsave">Save goal</button><button class="cta ghost" data-a="close">Cancel</button>`);
}
function goalSave(){const q=UI.gd,ex=document.getElementById('gex');let t=parseFloat((document.getElementById('gtarget').value||'').replace(',','.'));if(isNaN(t)||t<=0){toast('Enter a target');return}
  if(GOAL_TYPES[q.type].u==='kg')t=+fromDisp(t);const g={id:'g'+Date.now(),type:q.type,ex:ex?ex.value:null,target:t,by:document.getElementById('gby').value||null,created:todayS()};
  const pts=goalSeries(g);g.start=pts.length?(g.type==='lift'?Math.max(...pts.slice(-3).map(p=>p.v)):pts[pts.length-1].v):null;
  goalList().push(g);UI.gd=null;save();closeSheet();UI.tab='goals';rerender();toast('Goal saved')}

/* ---------- nutrition ---------- */
const FOOD_PRESETS=[['Protein shake',25,120],['Chicken breast 150 g',46,250],['3 eggs',19,215],['Greek yogurt 200 g',20,146],['Tuna can',26,120],['Beef steak 200 g',52,420],['Salmon 150 g',31,310],['Cottage cheese 200 g',24,180],['Rice, 1 cup cooked',4,205],['Oats 80 g',11,300],['Banana',1,105],['Protein bar',20,220]];
function nutTargets(d){
  const a=S.prof&&S.prof.ans||{},w=(lastVal('weight',d)||{}).v||(+a.weight)||75,ib=typeof ibLatest==='function'?ibLatest():null,lean=leanAt(d)||(ib&&ib.r.weight_kg&&ib.r.body_fat_mass_kg?ib.r.weight_kg-ib.r.body_fat_mass_kg:null);
  const goal=(S.custom&&S.custom.goal)||a.goal||'muscle',training=isTraining(tplOf(d))&&T[tplOf(d)].k!=='rest';
  let bmr=ib&&ib.r.basal_metabolic_rate_kcal?ib.r.basal_metabolic_rate_kcal:lean?370+21.6*lean:(10*w+6.25*(+(ib&&ib.r.height_cm)||175)-5*(+a.age||35)+5),src=ib&&ib.r.basal_metabolic_rate_kcal?'InBody BMR':lean?'lean mass':'weight';
  const wd=(S.wdata||{})[d],burn=wd&&wd.kcal&&d<todayS()?wd.kcal:Math.round(bmr*(training?1.55:1.35));
  const adj={fat:-0.2,muscle:0.08,strength:0.05,health:0}[goal]||0;
  const kcal=Math.round(burn*(1+adj)/10)*10,prot=Math.round((goal==='fat'?2.2:goal==='health'?1.6:2)*(goal==='fat'&&lean?lean*1.25:w));
  return{kcal,prot,burn,bmr:Math.round(bmr),src,goal,training,why:`${goal==='fat'?'20% under':goal==='muscle'?'8% over':goal==='strength'?'5% over':'about'} the ${Math.round(burn)} kcal you burn on a ${training?'training':'rest'} day${wd&&wd.kcal&&d<todayS()?' (from WHOOP)':''}, with BMR from ${src}.`};
}
function nutDay(d){const l=(S.food||{})[d]||[];return{p:l.reduce((a,x)=>a+(+x.p||0),0),c:l.reduce((a,x)=>a+(+x.c||0),0),list:l}}
function renderFood(){
  const d=UI.fday||todayS(),n=nutDay(d),tg=nutTargets(d),t=todayS();
  let bars='';for(let i=6;i>=0;i--){const dd=addD(d,-i),x=nutDay(dd),tt=nutTargets(dd);const hp=Math.min(1,x.p/tt.prot);bars+=`<button class="fbar ${dd===d?'on':''}" data-a="fday" data-v="${dd}"><i style="height:${Math.max(4,hp*60)}px;background:${hp>=.9?'var(--ok)':'color-mix(in srgb,#12B76A 45%,var(--sf2))'}"></i><span>${DS[dow(dd)][0]}</span></button>`}
  let h=`<div class="phead"><h2 class="pagetitle disp">Nutrition</h2><button class="addbtn" style="--c:#12B76A" data-a="foodadd">${IC.plus}Add</button></div><p class="sub">${d===t?'Today':nice(d)} · ${tg.training?'training day':'rest day'}</p>
  <div class="card"><div class="frings">${ring(Math.min(1,n.p/tg.prot),'#12B76A',104,12,Math.round(n.p)+'g')}<div><span class="hlab">Protein</span><b class="disp" style="font-size:26px">${Math.round(n.p)} / ${tg.prot} g</b><span class="muted" style="font-size:13px">${n.p>=tg.prot?'Target hit 💪':Math.round(tg.prot-n.p)+' g to go'}</span></div></div>
  <div class="frings" style="margin-top:10px">${ring(Math.min(1,n.c/tg.kcal),'#FF6A13',104,12,Math.round(n.c))}<div><span class="hlab">Calories</span><b class="disp" style="font-size:26px">${Math.round(n.c)} / ${tg.kcal}</b><span class="muted" style="font-size:13px">${n.c>tg.kcal?Math.round(n.c-tg.kcal)+' over':Math.round(tg.kcal-n.c)+' left'}</span></div></div>
  <p class="muted" style="font-size:13px;margin:10px 0 0">Targets: ${esc(tg.why)}</p></div>
  <div class="card"><h4 class="disp" style="margin:0 0 6px">Quick add</h4><div class="chipsrow">${FOOD_PRESETS.map((f,i)=>`<button class="mini" data-a="foodq" data-v="${i}">${esc(f[0])} <small class="muted">${f[1]}g</small></button>`).join('')}</div></div>
  <div class="card"><h4 class="disp" style="margin:0 0 4px">${d===t?'Today':short(d)}</h4>${n.list.length?n.list.map((x,i)=>`<div class="hrow" style="grid-template-columns:1fr auto auto auto"><span>${esc(x.n)}</span><b class="num">${x.p} g</b><span class="num muted">${x.c} kcal</span><button class="mini" data-a="fooddel" data-v="${i}" aria-label="Remove">✕</button></div>`).join(''):'<p class="muted" style="margin:0;font-size:14px">Nothing logged yet. Tap a quick add or Add.</p>'}</div>
  <div class="card"><h4 class="disp" style="margin:0 0 6px">Protein this week</h4><div class="fbars">${bars}</div></div>`;
  document.getElementById('view').innerHTML=h;
}
function foodSheet(){openSheet(`<h4 class="disp">Add food</h4><label class="fl2">What</label><input id="fn" placeholder="e.g. Chicken wrap" maxlength="40">
  <div class="grid2"><div><label class="fl2">Protein (g)</label><input id="fp" inputmode="decimal" placeholder="30"></div><div><label class="fl2">Calories</label><input id="fc" inputmode="numeric" placeholder="450"></div></div>
  <button class="cta" style="--c:#12B76A" data-a="foodsave">Add</button><button class="cta ghost" data-a="close">Cancel</button>`)}
function foodPush(d,n,p,c){S.food=S.food||{};(S.food[d]=S.food[d]||[]).push({n,p:Math.round(p),c:Math.round(c),t:Date.now()});save()}
document.addEventListener('click',ev=>{const el=ev.target.closest('[data-a]');if(!el)return;const a=el.dataset.a,v=el.dataset.v,d=UI.fday||todayS();
  if(a==='goaladd'){UI.gd=null;goalSheet()}
  if(a==='goaltype'){UI.gd.type=v;goalSheet()}
  if(a==='goalfill'){const i=document.getElementById('gtarget');if(i)i.value=toDisp(+v)}
  if(a==='goalsave'){const ex=document.getElementById('gex');if(ex)UI.gd.ex=ex.value;goalSave()}
  if(a==='goaldel'){const gs=goalList(),i=gs.findIndex(g=>g.id===v);if(i>=0){const rem=gs.splice(i,1)[0];save();rerender();toast('Goal removed',()=>{gs.splice(i,0,rem)})}}
  if(a==='foodadd')foodSheet();
  if(a==='foodq'){const f=FOOD_PRESETS[+v];foodPush(d,f[0],f[1],f[2]);rerender();toast('Added '+f[0])}
  if(a==='foodsave'){const n=document.getElementById('fn').value.trim()||'Food',p=parseFloat(document.getElementById('fp').value)||0,c=parseFloat(document.getElementById('fc').value)||0;if(!p&&!c){toast('Enter protein or calories');return}foodPush(d,n,p,c);closeSheet();rerender()}
  if(a==='fooddel'){const l=(S.food||{})[d]||[];const rem=l.splice(+v,1)[0];save();rerender();if(rem)toast('Removed',()=>{l.splice(+v,0,rem)})}
  if(a==='fday'){UI.fday=v===todayS()?null:v;rerender()}
});
