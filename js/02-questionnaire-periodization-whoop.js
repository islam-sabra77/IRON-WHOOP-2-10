"use strict";
/* =====================================================================
   WELCOME QUESTIONNAIRE + ASSESSMENT
   ===================================================================== */
const OB_STEPS=['welcome','about','goal','exp','schedule','equip','inj','test1','test2','stack','suppq','review'];
function obDefaults(){const p=S.prof&&S.prof.ans;return p?JSON.parse(JSON.stringify(p)):{name:'',age:'',weight:'',goal:'muscle',exp:1,days:[0,1,3,4],longDay:6,len:60,weeks:12,start:addD(sunOf(todayS()),8),equip:'gym',cardio:'walk',inj:[],side:'none',pushups:'',squats:'',plank:'',toe:2,overhead:3,deepsq:3,balL:'',balR:'',supps:UI.fresh?'quiz':'keep',habits:UI.fresh?'starter':'keep'}}
function openOnboarding(){UI.ob={step:UI.fresh?0:1,a:obDefaults()};drawOb();document.getElementById('onb').classList.remove('hide');document.body.style.overflow='hidden'}
function closeOnboarding(){document.getElementById('onb').classList.add('hide');document.body.style.overflow='';UI.ob=null}
const ch=(f,v,label,sub,multi)=>{const a=UI.ob.a;const on=multi?(a[f]||[]).includes(v):a[f]==v;return`<button class="obopt ${on?'on':''}" data-a="${multi?'obtog':'obpick'}" data-f="${f}" data-v="${v}"><b>${label}</b>${sub?`<span>${sub}</span>`:''}</button>`};
const inp=(f,label,ph,type,unit)=>`<label class="fl2">${label}</label><div class="obin"><input type="${type||'text'}" ${type==='number'?'inputmode="decimal"':''} data-in="ob" data-f="${f}" value="${esc(UI.ob.a[f]??'')}" placeholder="${ph||''}">${unit?`<em>${unit}</em>`:''}</div>`;
function drawOb(){
  const st=OB_STEPS[UI.ob.step],a=UI.ob.a,n=OB_STEPS.length;let h='';
  const head=(t,s)=>`<div class="obbar"><span style="width:${Math.round(UI.ob.step/(n-1)*100)}%"></span></div><h2 class="disp obh">${t}</h2>${s?`<p class="sub">${s}</p>`:''}`;
  if(st==='welcome')h=`<div class="obwelcome"><img src="${document.querySelector('.brandlogo img')?document.querySelector('.brandlogo img').src:''}" alt="IRON" class="obwm"><h2 class="disp obh" style="font-size:44px">Your training, built around you</h2><p class="sub" style="font-size:16px">Answer a few questions and do 7 quick self-tests (about 5 minutes). IRON then builds a progressive plan from ${EXDB_COUNT} exercises, matched to your goal, equipment, schedule and any injuries.</p>
    <div class="obfeat"><span>🎯 Goal-based program</span><span>🎥 Video for every move</span><span>📈 Progresses every 6 weeks</span><span>⌚ Adjusts to WHOOP</span></div></div>`;
  if(st==='about')h=head('About you','So IRON can personalise loads and advice.')+inp('name','Your name','e.g. Omar')+`<div class="grid2">${inp('age','Age','e.g. 34','number','years')}${inp('weight','Weight','e.g. 82','number','kg')}</div>`;
  if(st==='goal')h=head('Main goal','Pick the one that matters most right now.')+ch('goal','muscle','💪 Build muscle','More size and shape, steady strength gains')+ch('goal','strength',''+IC.plate+' Get stronger','Heavier lifts, lower reps on the main moves')+ch('goal','fat','🔥 Lose fat','Keep muscle, add a bit more cardio')+ch('goal','health','❤️ Health and fitness','Feel good, move well, stay consistent');
  if(st==='exp')h=head('Training experience','How long have you trained with weights consistently?')+ch('exp',1,'Beginner','Less than 6 months, or coming back after a long break')+ch('exp',2,'Intermediate','6 months to 3 years, comfortable with the main lifts')+ch('exp',3,'Advanced','3+ years of structured training');
  if(st==='schedule')h=head('Your week','Pick the days you can lift. 3–5 days works best for most people.')+`<div class="obdays">${DS.map((x,i)=>`<button class="obday ${a.days.includes(i)?'on':''}" data-a="obday" data-v="${i}">${x}</button>`).join('')}</div>
    <div class="muted" style="font-size:13px;margin:6px 0 10px">${a.days.length} lifting days: ${({2:'2 full-body sessions',3:'3 full-body sessions',4:'upper / lower split',5:'upper / lower split + extra upper day',6:'push / pull / legs twice'})[Math.min(6,Math.max(2,a.days.length))]||'pick at least 2'}</div>
    <label class="fl2">Long cardio day (active recovery)</label><select data-in="ob" data-f="longDay"><option value="-1" ${a.longDay==-1?'selected':''}>None</option>${DN.map((x,i)=>a.days.includes(i)?'':`<option value="${i}" ${+a.longDay===i?'selected':''}>${x}</option>`).join('')}</select>
    <label class="fl2">Session length</label><div class="obrow">${ch('len',45,'45 min')}${ch('len',60,'60 min')}${ch('len',90,'75–90 min')}</div>
    <div class="grid2"><div><label class="fl2">Start date</label><input type="date" data-in="ob" data-f="start" value="${a.start}"></div><div><label class="fl2">Plan length</label><select data-in="ob" data-f="weeks">${[8,12,16].map(w=>`<option value="${w}" ${+a.weeks===w?'selected':''}>${w} weeks</option>`).join('')}</select></div></div>`;
  if(st==='equip')h=head('Equipment','Where will you usually train?')+ch('equip','gym','🏢 Full gym','Machines, cables, barbells and dumbbells')+ch('equip','home','🏠 Home: dumbbells and a bench','Plus resistance bands')+ch('equip','bw','🎒 Bodyweight and bands','No weights, train anywhere')+`<label class="fl2" style="margin-top:12px">Favourite cardio</label><div class="obrow wrap">${[['walk','🚶 Walking'],['bike','🚴 Bike'],['row','🚣 Rower'],['ell','⛷️ Elliptical'],['run','🏃 Running'],['swim','🏊 Swimming']].map(([v,l])=>ch('cardio',v,l)).join('')}</div>`;
  if(st==='inj')h=head('Injuries and limits','Pick any area that hurts, was injured, or you need to protect. IRON removes risky moves and adds targeted mobility.')+`<div class="obrow wrap">${Object.keys(INJ).map(k=>ch('inj',k,INJ[k],'',true)).join('')}</div>${!(a.inj||[]).length?'<p class="muted" style="font-size:13px">None selected: great, no restrictions.</p>':''}
    <label class="fl2" style="margin-top:12px">Weaker or previously injured side?</label><div class="obrow">${ch('side','none','No difference')}${ch('side','left','Left')}${ch('side','right','Right')}</div><p class="muted" style="font-size:13px">Single-leg and single-arm moves then start with that side.</p>`;
  if(st==='test1')h=head('Quick strength test','Do these after a short warm-up. Be honest, there\u2019s no wrong answer. Leave blank to skip.')+`<div class="obtest"><b>1. Push-ups</b><span>Max strict push-ups in one go, chest to fist height. Knees down counts as half.</span>${inp('pushups','','e.g. 18','number','reps')}</div>
    <div class="obtest"><b>2. Bodyweight squats</b><span>As many full squats as you can in 60 seconds, thighs to parallel.</span>${inp('squats','','e.g. 30','number','reps')}</div>
    <div class="obtest"><b>3. Plank</b><span>Forearm plank, straight line, hold until form breaks.</span>${inp('plank','','e.g. 45','number','seconds')}</div>`;
  if(st==='test2')h=head('Mobility and balance','Four 30-second checks. They decide your mobility and warm-up drills.')+`<div class="obtest"><b>4. Toe touch</b><span>Legs straight, reach down slowly.</span><div class="obrow">${ch('toe',1,'Can\u2019t reach')}${ch('toe',2,'Fingertips')}${ch('toe',3,'Palms')}</div></div>
    <div class="obtest"><b>5. Overhead reach</b><span>Back flat against a wall, raise straight arms overhead. Do your thumbs touch the wall?</span><div class="obrow">${ch('overhead',1,'No')}${ch('overhead',2,'Almost')}${ch('overhead',3,'Yes, easily')}</div></div>
    <div class="obtest"><b>6. Deep squat</b><span>Feet shoulder-width, squat as low as you can. Do your heels stay down?</span><div class="obrow">${ch('deepsq',1,'Heels lift')}${ch('deepsq',2,'With effort')}${ch('deepsq',3,'Yes, easily')}</div></div>
    <div class="obtest"><b>7. Single-leg balance</b><span>Eyes open, hands on hips. Seconds on each leg (stop at 60).</span><div class="grid2">${inp('balL','Left','e.g. 40','number','sec')}${inp('balR','Right','e.g. 45','number','sec')}</div></div>`;
  if(st==='stack')h=head('Supplements and habits','Start fresh, or with a simple starter set you can edit later.')+`<label class="fl2">Supplements</label>${ch('supps','quiz','Build my stack from a few questions','Goals, issues, diet and medicines decide what goes in')}${ch('supps','empty','Start empty','Add your own from the 200-supplement guide')}${ch('supps','starter','Starter stack','Protein, creatine, vitamin D3, omega-3, magnesium')}${!UI.fresh?ch('supps','keep','Keep my current stack'):''}
    <label class="fl2" style="margin-top:10px">Habits</label>${ch('habits','empty','Start empty')}${ch('habits','starter','Starter habits','Water, 8,000 steps and 7h+ sleep (the last two auto-track with WHOOP)')}${!UI.fresh?ch('habits','keep','Keep my current habits'):''}`;
  if(st==='suppq'){if(!a.sq)a.sq=sqDefaults();h=head('Your supplement stack','A few questions so IRON can build a stack that fits you. You can redo or improve it any time in the Supps tab.')+sqForm(a.sq,['obsqpick','obsqtog'])}
  if(st==='review'){const P=buildPlan(a),sc=P.sc;UI.ob.preview=P;const bar=(l,v,t)=>`<div class="obscore"><span>${l}</span><div class="bar2"><span style="width:${v/3*100}%;background:${v<1.7?'var(--bad)':v<2.5?'var(--warn)':'var(--ok)'}"></span></div><em>${t}</em></div>`;const tx=v=>v<1.7?'Needs work':v<2.5?'Average':'Good';
    h=head(`${a.name?a.name+', y':'Y'}our plan is ready`,'Here\u2019s what your answers and tests show, and the plan IRON built.')+`<div class="card"><h4 class="disp" style="font-size:22px;margin:0 0 8px">Assessment</h4>${bar('Strength',sc.st,tx(sc.st))}${bar('Core',sc.core,tx(sc.core))}${bar('Mobility',sc.mob,tx(sc.mob))}${bar('Balance',sc.bal,tx(sc.bal)+(sc.asym?', uneven sides':''))}
    <p class="muted" style="font-size:13px;margin:8px 0 0">Starting level: <b>${['','Beginner','Intermediate','Advanced'][sc.lvl]}</b>${sc.lvl<(+a.exp)?' (one step easier than your experience, to build a base first)':''}. Extra focus: ${sc.focus.length?sc.focus.map(f=>({lb:'lower back',sh:'shoulders',kn:'knees',el:'elbows',wr:'wrists',hp:'hips',an:'ankles',ham:'hamstrings',overhead:'overhead mobility',ankle:'ankles',hip:'hips',balance:'balance'})[f]||f).join(', '):'none needed'}.</p></div>
    <div class="card"><h4 class="disp" style="font-size:22px;margin:0 0 6px">Your week</h4>${DN.map((x,i)=>{const k=P.map[i];const t=k==='rest'?null:k==='long'?{n:'Long cardio',f:'Zone 2 active recovery'}:P.tpls[k];return`<div class="hrow" style="grid-template-columns:96px 1fr"><b>${x}</b><span>${t?`<b>${t.n}</b> · ${t.f}${t.blocks?`<br><span class="muted" style="font-size:13px">${t.blocks.map(b=>b.i.map(it=>E[it[0]].n).join(' + ')).slice(0,3).join(' · ')}…</span>`:''}`:'<span class="muted">Rest</span>'}</span></div>`}).join('')}
    <p class="muted" style="font-size:13px;margin:8px 0 0">${a.weeks} weeks from ${nice(a.start)}, in 6-week cycles that add reps, then weight. Every move has a video and can be replaced.</p></div>
    ${a.supps==='quiz'&&a.sq?(()=>{const R=sqRecommend(a.sq);return`<div class="card"><h4 class="disp" style="font-size:22px;margin:0 0 6px">Your supplement stack</h4>${R.list.length?R.list.map(x=>`<div class="hrow" style="grid-template-columns:1fr auto"><span><b>${esc(x.e.n)}</b><br><span class="muted" style="font-size:13px">For ${esc(x.why.slice(0,2).join(', '))}</span></span><span class="muted" style="font-size:13px;text-align:right">${esc(x.e.s)}</span></div>`).join(''):'<p class="muted">No supplements matched your answers.</p>'}${R.blocked.length?`<p class="muted" style="font-size:13px;margin:6px 0 0">Left out for safety: ${R.blocked.map(x=>esc(x.e.n)).join(', ')}.</p>`:''}<p class="muted" style="font-size:12px;margin:6px 0 0">General guidance, not medical advice. Check with your doctor if you take medicine.</p></div>`})():''}
    ${!UI.fresh?'<div class="note"><b>This replaces your current program</b> from the start date. Your logs, WHOOP and history stay, and you can restore the previous plan in Settings.</div>':''}`}
  const last=UI.ob.step===n-1,first=UI.ob.step===0;
  document.getElementById('onb').innerHTML=`<div class="obwrap">${h}<div class="obnav" style="${first&&UI.fresh?'grid-template-columns:1fr':''}">${first?(UI.fresh?'':'<button class="cta ghost" data-a="obclose">Cancel</button>'):`<button class="cta ghost" data-a="obback">Back</button>`}<button class="cta" style="--c:var(--upper)" data-a="${last?'obfinish':'obnext'}">${first?'Start':last?'Build my plan':'Next'}</button></div>${first&&UI.fresh?'<button class="linkbtn" style="display:block;margin:10px auto 0" data-a="obskip">Skip and use the sample plan</button><button class="linkbtn" style="display:block;margin:6px auto 0" data-a="pksignin">Already use IRON? Sign in with passkey</button><button class="linkbtn" style="display:block;margin:6px auto 0" data-a="oblink">Restore with your sync code</button>':''}</div>`;
  document.getElementById('onb').scrollTop=0;
}
function obFinish(){
  const a=UI.ob.a,P=buildPlan(a);
  if(!UI.fresh&&!S.planBackup)S.planBackup={map:clone(S.map),start:S.start,end:S.end,moves:clone(S.moves),ext:clone(S.ext),prof:clone(S.prof)};
  S.prof={ans:a,plan:{tpls:P.tpls,mob:P.mob,wu:P.wu,rot:P.rot,target:P.target,cardioRange:P.cardioRange},sc:P.sc,created:todayS()};
  S.map=P.map;S.start=a.start;S.end=addD(a.start,(+a.weeks||12)*7-1);S.moves={};S.custom=null;delete S.customPrev;S.ext=[];S.hist=[];S.swaps={};S.swapsAll={};
  if(a.supps==='empty')S.supps=[];
  if(a.supps==='quiz'&&a.sq){S.suppQ=clone(a.sq);S.supps=sqRecommend(a.sq).list.map(sqToSupp)}
  if(a.supps==='starter')S.supps=[['Creatine monohydrate','5 g','Morning'],['Whey protein','1 scoop','Post-workout'],['Vitamin D3','2,000 IU','With meals'],['Omega-3 (fish oil)','2 g EPA+DHA','With meals'],['Magnesium glycinate','300 mg','Evening']].map((x,i)=>({id:'s'+Date.now()+i,n:x[0],d:x[1],slot:x[2],note:'',c:HAB_COLORS[i%HAB_COLORS.length]}));
  if(a.habits==='empty')S.habits=[];
  if(a.habits==='starter')S.habits=[{id:'h1',n:'Drink 3 L of water',e:'💧',c:'#00A3FF'},{id:'h2',n:'8,000+ steps',e:'👟',c:'#FF6A13',link:{k:'steps',t:8000}},{id:'h3',n:'Sleep 7h or more',e:'🌙',c:'#7B4DFF',link:{k:'sleep',t:7}}];
  save();location.reload();
}
function restorePlan(){const b=S.planBackup;if(!b)return;S.map=b.map;S.start=b.start;S.end=b.end;S.moves=b.moves||{};S.ext=b.ext||[];S.prof=b.prof||null;delete S.planBackup;save();location.reload()}

/* ---------- mobility sets ---------- */
/* mobility: fewer moves, focused on the joints the day uses */
const MOB={
  upper:[['catCamel',45],['openBook',6],['crossBody',30],['wallSlide',10],['wristEcc',15]],
  lower:[['mckenzie',10],['hipFlexPPT',40],['hip9090',6],['adductRock',8],['kneeWall',10]],
  travel:[['catCamel',45],['openBook',6],['hipFlexPPT',40],['kneeWall',10],['wristStretch',30]],
  flow:[['catCamel',60],['worldGreatest',5],['thread',6],['couch',40],['hip9090',6],['bridgePPT',12],['childPose',60]]
};

/* ---------- session templates ---------- */
const T={
  upperA:{n:'Upper A',f:'Push focus and arms',k:'upper',mob:'upper',wu:'upper',
    blocks:[{i:[['incDB','main']]},{i:[['csRow','sec'],['lmPress','sec']]},{i:[['ngPulldown','acc'],['cLat','acc']],opt:1},{i:[['ropePush','arm'],['hammer','arm']],arms:1},{i:[['facePull','pre']]}],
    core:[['deadBug','coreR'],['sidePlank','coreT']],cardio:{m:'Incline treadmill walk',z:'z2'}},
  upperB:{n:'Upper B',f:'Pull focus and arms',k:'upper',mob:'upper',wu:'upper',
    blocks:[{i:[['ngPulldown','main']]},{i:[['saCableRow','sec'],['machChest','sec']]},{i:[['revPec','acc'],['proneY','acc']],opt:1},{i:[['preacherM','arm'],['crossExt','arm']],arms:1},{i:[['sideER','pre']]}],
    core:[['pallof','coreR'],['birdDog','coreR']],cardio:{m:'Bike intervals',z:'int'}},
  upperC:{n:'Upper C',f:'Shoulders and big arms',k:'upper',mob:'upper',wu:'upper',
    blocks:[{i:[['flatDBng','main']]},{i:[['sealRow','sec'],['saDBPress','sec']]},{i:[['dbLat','acc'],['cRearFly','acc']],opt:1},{i:[['cableCurl','arm'],['vbarPush','arm']],arms:1},{i:[['ropeHammer','arm']],arms:1}],
    core:[['plank','coreT'],['suitcase','coreT']],cardio:{m:'Stair climber or elliptical',z:'z2'}},
  lowerA:{n:'Lower A',f:'Knee and quad focus',k:'lower',mob:'lower',wu:'lower',
    blocks:[{i:[['trapDL','main']]},{i:[['rfess','sec'],['seatHam','acc']]},{i:[['legPress','acc'],['standCalf','acc']],opt:1},{i:[['hipAbd','pre'],['tibRaise','pre']]}],
    core:[['birdDog','coreR'],['sidePlank','coreT']],cardio:{m:'Bike',z:'z2'}},
  lowerB:{n:'Lower B',f:'Hip and glute focus',k:'lower',mob:'lower',wu:'lower',
    blocks:[{i:[['hipThrust','main']]},{i:[['dbRDL','sec'],['stepUp','sec']]},{i:[['legExt','acc'],['seatCalf','acc']],opt:1},{i:[['backExt45','acc'],['adductM','pre']]}],
    core:[['pallof','coreR'],['mcgill','coreR']],cardio:{m:'Incline treadmill walk',z:'z2'}},
  travelA:{n:'Travel A',f:'Squat, push and pull',k:'travel',mob:'travel',wu:'travel',
    blocks:[{i:[['tempoSquat','tw',12],['inclinePU','tw',10]]},{i:[['bwRevLunge','tw',8],['doorRow','tw',10]]},{i:[['bedThrust','tw',12],['closePU','tw',8]]},{i:[['towelCurl','tw',20],['proneYTW','tw',5]]}],
    core:[['deadBug','coreR'],['sidePlank','coreT']],cardio:{mins:12,moves:['Marching high knees','Step jacks (no jump)','Shadow boxing','Squat to overhead reach']}},
  travelB:{n:'Travel B',f:'Hinge, pull and hips',k:'travel',mob:'travel',wu:'travel',
    blocks:[{i:[['bwSLRDL','tw',8],['doorRow','tw',12]]},{i:[['bwSplit','tw',8],['pushup','tw',8]]},{i:[['slBridge','tw',10],['proneYTW','tw',5]]},{i:[['latLunge','tw',8],['doorCurl','tw',10]]}],
    core:[['birdDog','coreR'],['plank','coreT']],cardio:{mins:12,moves:['Shadow boxing','Fast feet in place','Skater steps (no jump)','Marching high knees']}},
  travelC:{n:'Travel C',f:'Single-leg strength and balance',k:'travel',mob:'travel',wu:'travel',
    blocks:[{i:[['chairStep','tw',8],['inclinePU','tw',12]]},{i:[['skater','tw',6],['towelRow','tw',10]]},{i:[['slCalfBW','tw',12],['tibRaise','tw',15]]},{i:[['copen','tw',20],['closePU','tw',8]]}],
    core:[['deadBug','coreR'],['bearHold','coreT']],cardio:{mins:12,moves:['Marching high knees','Lateral shuffle','Step jacks (no jump)','Shadow boxing']}},
  travelD:{n:'Travel D',f:'Full-body conditioning',k:'travel',mob:'travel',wu:'travel',
    blocks:[{i:[['squatChair','tw',15],['bearCrawl','tw',30]]},{i:[['lungeKnee','tw',8],['pushup','tw',10]]},{i:[['bridgeMarch','tw',10],['doorRow','tw',12]]},{i:[['wallSit','tw',40],['towelCurl','tw',20]]}],
    core:[['mcgill','coreR'],['sidePlank','coreT']],cardio:{mins:14,moves:['Squat to overhead reach','Fast feet in place','Shadow boxing','Lateral shuffle']}},
  long:{n:'Long cardio',f:'Zone 2 active recovery',k:'long',mob:'flow'},
  rest:{n:'Rest day',f:'Recover and recharge',k:'rest',mob:'flow'}
};
/* warm-up: raise temperature, switch on the muscles, ramp the first lift */
const WU={
  upper:[['bikeWU',180],['bandPA',15],['bandER',12],['scapPU',10],['rampUp',2]],
  lower:[['bikeWU',180],['bridgePPT',12],['bandWalk',30],['tkeMob',15],['slBalance',30],['rampUp',2]],
  travel:[['marchWU',90],['bridgePPT',12],['scapPU',10],['tempoSquat',8],['slBalance',30]]
};
const TPL_KEYS=['upperA','upperB','upperC','lowerA','lowerB','long','rest'];
const TRAVEL=['travelA','travelB','travelC','travelD'];
const EXTRA={upper:{i:[['machLat','acc'],['crossHammer','arm']],extra:1},lower:{i:[['revLunge','acc'],['cableAdd','pre']],extra:1}};
const KCOLOR=k=>COLORS[k]||COLORS.rest;

/* ---------- periodization ---------- */
/* ---------- periodization: 6-week cycles (5 progressive weeks + 1 deload) ---------- */
const SCH={
  F:{name:'Hypertrophy base',main:[3,10],sec:[3,10],acc:[3,12],arm:[3,12],pre:[2,15],coreR:[3,8],coreT:[3,30]},
  H:{name:'Build',main:[3,7],sec:[3,8],acc:[3,10],arm:[3,10],pre:[2,12],coreR:[3,10],coreT:[3,40]},
  S:{name:'Strength',main:[4,5],sec:[3,6],acc:[3,8],arm:[3,8],pre:[2,12],coreR:[3,12],coreT:[3,45]}
};
const WK_OFF=[0,1,2,0,1];                 // rep target added each week
const WK_MAINSET=[0,0,0,1,1];             // extra set on main lifts in weeks 4-5
const WK_RIR={F:['3','3','2','2','1'],H:['3','2','2','2','1'],S:['2','2','1','2','1']};
const WK_FOCUS=['Set your baseline','Same weight, +1 rep','Same weight, +1 rep','Add weight, reps reset','Same weight, push the reps','Deload: lighter, 2 sets'];
const PH_COLOR={F:'#00B39A',H:'#2F5BFF',S:'#FF6A13'};
const REST={tw:60,main:120,sec:90,acc:60,arm:60,pre:45,coreR:40,coreT:40};
function weekNo(d){return Math.floor(diffD(sunOf(S.start),sunOf(d))/7)+1}
function totalWeeks(){return weekNo(S.end)}
/* cycles can be 6, 7 or 8 weeks (last week is always a deload). Build weeks follow these patterns. */
const FOCUS_SEQ={5:[0,1,2,3,4],6:[0,1,2,3,1,4],7:[0,1,2,3,1,2,3]};
const OFF_SEQ={5:[0,1,2,0,1],6:[0,1,2,0,1,2],7:[0,1,2,0,1,2,0]};
function rirAt(s,pos,n){if(n===5)return WK_RIR[s][pos];const st=s==='S'?2:3;return String(Math.max(1,Math.round(st-(st-1)*pos/(n-1))))}
/* plan segments: each has its own cycle length. Without the builder there is one 6-week segment from the plan start. */
function segs(){const base={from:sunOf(S.start),CL:6,c0:0};const x=(S.custom&&S.custom.segs)||[];return[base,...x.filter(g=>g.from>base.from)]}
function segAt(d){const w=sunOf(d);let g=null;for(const x of segs())if(x.from<=w)g=x;return g||segs()[0]}
function cycleOf(d){const g=segAt(d),ws=Math.max(0,Math.floor(diffD(g.from,sunOf(d))/7));return{c:g.c0+Math.floor(ws/g.CL),pos:ws%g.CL,CL:g.CL}}
function cycleStart(c){let g=segs()[0];for(const x of segs())if(x.c0<=c)g=x;return addD(g.from,(c-g.c0)*g.CL*7)}
function cycleEnd(c){const st=cycleStart(c),nx=cycleStart(c+1);return addD(nx>st?nx:addD(st,cycleOf(st).CL*7),-1)}
function goalOf(){return(S.custom&&S.custom.goal)||(S.prof&&S.prof.ans&&S.prof.ans.goal)||'muscle'}
function nextPhase(s){const g=goalOf();if(g==='strength')return s==='S'?'H':'S';if(g==='fat'||g==='health')return s==='F'?'H':'F';return s==='F'?'H':s==='H'?'S':'H'}
function defaultPhase(c){
  if(S.custom&&S.custom.goal){let s=goalOf()==='strength'?'H':'F';for(let i=0;i<c;i++)s=nextPhase(s);return s}
  const gs=S.prof&&S.prof.ans&&S.prof.ans.goal==='strength'&&S.prof.sc&&S.prof.sc.lvl>=2;return gs?(c%2===0?'H':'S'):(c===0?'F':(c%2===1?'H':'S'))}
function phaseForCycle(c){const dec=cycleDecision(c);if(dec)return dec.s;if(c<=0)return defaultPhase(0);
  if(S.custom&&S.custom.adapt!==false&&Object.keys(S.custom.cycles||{}).some(k=>+k<c))return nextPhase(phaseForCycle(c-1));return defaultPhase(c)}
function phaseOf(d){
  const w=Math.max(1,weekNo(d)),cy=cycleOf(d),c=cy.c,pos=cy.pos,CL=cy.CL,n=CL-1,deload=pos===n;
  const s=phaseForCycle(c),dec=cycleDecision(c),fi=deload?5:FOCUS_SEQ[n][pos];
  return {w,c,b:c,pos,n,CL,s,deload,cw:pos+1,fi,off:deload?0:OFF_SEQ[n][pos],mainset:!deload&&pos>=3?1:0,vol:dec?dec.vol:0,dec,name:deload?'Deload':SCH[s].name,focus:WK_FOCUS[fi],rir:deload?'4':rirAt(s,pos,n)};
}
/* at the start of each cycle (after you set up the builder) the app reviews the last cycle and decides the next phase */
function cycleReview(c){
  const ps=cycleStart(c-1),pe=addD(cycleStart(c),-1);const t=todayS();
  const days=[];for(let d=ps;d<=pe&&d<=S.end;d=addD(d,1))if(d>=S.start&&isTraining(tplOf(d))&&T[tplOf(d)].k!=='long')days.push(d);
  const past=days.filter(d=>d<t),adh=past.length>=3?past.filter(d=>S.done[d]).length/past.length:null;
  const h=hist();let up=0,tracked=0;Object.keys(h).forEach(ex=>{const a=h[ex].filter(x=>x.d>=ps&&x.d<=pe&&!phaseOf(x.d).deload);if(a.length<2)return;tracked++;const be=x=>Math.max(...x.sets.map(q=>e1rm(+q.w,+q.r)));const f=be(a[0]),l=Math.max(...a.slice(-2).map(be));if(l>f*1.01)up++});
  const prog=tracked>=2?up/tracked:null;
  const rv=[];for(let d=ps;d<=pe;d=addD(d,1)){const x=S.wdata&&S.wdata[d];if(x&&x.rec!=null&&!x.cal)rv.push(+x.rec)}const rec=rv.length>=7?rv.reduce((a,b)=>a+b,0)/rv.length:null;
  const wks=Object.values(S.wwk||{}).filter(w=>w.d>=ps&&w.d<=pe&&w.strain!=null),pwk=Object.values(S.wwk||{}).filter(w=>w.d>=addD(ps,-(diffD(ps,pe)+1))&&w.d<ps&&w.strain!=null);
  const ws2=wks.length>=3?wks.reduce((a,w)=>a+w.strain,0)/wks.length:null,pws=pwk.length>=3?pwk.reduce((a,w)=>a+w.strain,0)/pwk.length:null;
  const prev=phaseForCycle(c-1),pc=v=>Math.round(v*100)+'%';
  const stats={adh,prog,rec,tracked,strain:ws2,prevStrain:pws};
  if(ws2!=null&&pws!=null&&ws2>pws*1.25&&rec!=null&&rec<55)return{s:prev,vol:-1,stats,why:`Workout strain rose from ${pws.toFixed(1)} to ${ws2.toFixed(1)} while recovery averaged ${Math.round(rec)}%. Same rep ranges and one set fewer on accessories so recovery can catch up.`};
  if(adh!==null&&adh<0.6)return{s:prev,vol:-1,stats,why:`You finished ${pc(adh)} of last cycle's sessions, so this cycle keeps the same rep ranges and trims one accessory set. Shorter sessions are easier to show up for.`};
  if(rec!==null&&rec<45)return{s:prev,vol:-1,stats,why:`WHOOP recovery averaged ${Math.round(rec)}% last cycle. Same rep ranges, one set fewer on accessories, so you can recover and keep progressing.`};
  if(prog!==null&&prog<0.3){const s2=prev==='F'?'H':'F';return{s:s2,vol:0,stats,why:`Only ${pc(prog)} of your lifts went up last cycle. Switching to ${SCH[s2].name.toLowerCase()} rep ranges for a fresh stimulus.`}}
  if(prog!==null&&prog>=0.6&&(adh===null||adh>=0.8)&&(rec===null||rec>=60)){const s2=nextPhase(prev);return{s:s2,vol:1,stats,why:`Strong cycle: ${pc(prog)} of lifts went up${adh!==null?', '+pc(adh)+' attendance':''}${rec!==null?', recovery '+Math.round(rec)+'%':''}. Moving to ${SCH[s2].name.toLowerCase()} with one extra accessory set.${ws2!=null?' Average workout strain was '+ws2.toFixed(1)+'.':''}`}}
  const s2=nextPhase(prev);return{s:s2,vol:0,stats,why:prog===null?`Not enough logged lifts to judge last cycle, so the plan follows the standard progression to ${SCH[s2].name.toLowerCase()}.`:`Steady progress (${pc(prog)} of lifts up). Moving on to ${SCH[s2].name.toLowerCase()}.`};
}
let DECIDING=false;
function cycleDecision(c){
  const C=S.custom;if(!C||C.adapt===false||c<1)return null;
  if(C.cycles&&C.cycles[c])return C.cycles[c];
  const st=cycleStart(c);if(st<C.since||st>todayS()||DECIDING)return null;
  if(c>1)cycleDecision(c-1);
  DECIDING=true;let r;try{r=cycleReview(c)}finally{DECIDING=false}
  r.at=todayS();C.cycles=C.cycles||{};C.cycles[c]=r;setTimeout(save,0);return r;
}
/* Weekly intensity. Compares last week with the 3 weeks before it using
   WHOOP recovery, WHOOP workout strain and hard-zone minutes, your logged lift progress and attendance. */
let WICACHE={};
function weekSignals(ws){
  const last=[addD(ws,-7),addD(ws,-1)],base=[addD(ws,-28),addD(ws,-8)];
  const vals=[];let reds=0;for(let i=1;i<=7;i++){const x=S.wdata&&S.wdata[addD(ws,-i)];if(x&&x.rec!=null&&!x.cal){vals.push(+x.rec);if(+x.rec<34)reds++}}
  const rec=vals.length>=4?vals.reduce((a,b)=>a+b,0)/vals.length:null;
  const wl=Object.values(S.wwk||{}).filter(w=>w.d>=last[0]&&w.d<=last[1]&&w.strain!=null),wb=Object.values(S.wwk||{}).filter(w=>w.d>=base[0]&&w.d<=base[1]&&w.strain!=null);
  const avg=a=>a.reduce((x,y)=>x+y,0)/a.length,hard=a=>a.reduce((x,w)=>x+((w.zones||[])[4]||0)+((w.zones||[])[5]||0),0)/6e4;
  const strain=wl.length?avg(wl.map(w=>w.strain)):null,strainBase=wb.length>=2?avg(wb.map(w=>w.strain)):null;
  const hardMin=wl.length?hard(wl):null,hardBase=wb.length>=2?hard(wb)/3:null;
  const h=hist(),be=x=>Math.max(...x.sets.map(q=>e1rm(+q.w,+q.r)));let up=0,down=0,tracked=0;
  Object.keys(h).forEach(ex=>{const r=h[ex].filter(x=>x.d>=addD(ws,-14)&&x.d<ws),o=h[ex].filter(x=>x.d>=addD(ws,-42)&&x.d<addD(ws,-14));if(!r.length||!o.length)return;tracked++;const a=Math.max(...r.map(be)),b=Math.max(...o.map(be));if(a>b*1.01)up++;else if(a<b*0.97)down++});
  const sched=[];for(let d=last[0];d<=last[1];d=addD(d,1))if(inPlan(d)&&isTraining(tplOf(d))&&T[tplOf(d)].k!=='long')sched.push(d);
  const adh=sched.length>=2?sched.filter(d=>S.done[d]).length/sched.length:null;
  return{rec,reds,strain,strainBase,hardMin,hardBase,workouts:wl.length,up,down,tracked,lift:tracked>=2?up/tracked:null,adh};
}
function weekInt(d){
  if(!S.whoop||!S.whoop.connected)return null;if(S.custom?S.custom.whoopWeekly===false:S.whoop.auto===false)return null;
  const ws=sunOf(d);if(WICACHE[ws]!==undefined)return WICACHE[ws];
  const g=weekSignals(ws);if(g.rec==null&&g.workouts<2&&g.lift==null)return WICACHE[ws]=null;
  let sc=0;const why=[];
  if(g.rec!=null){if(g.rec>=70)sc+=2;else if(g.rec>=55)sc+=1;else if(g.rec<45)sc-=2;why.push(`recovery averaged ${Math.round(g.rec)}%`)}
  if(g.reds>=3){sc-=2;why.push(`${g.reds} red days`)}
  if(g.lift!=null){if(g.lift>=0.6)sc+=1;else if(g.down>g.up&&g.down>=2)sc-=1;why.push(g.down>g.up?`${g.down} of ${g.tracked} lifts dipped`:`${g.up} of ${g.tracked} lifts went up`)}
  if(g.strain!=null&&g.strainBase!=null){const r=g.strain/g.strainBase;if(r>1.25&&(g.rec==null||g.rec<60))sc-=1;else if(r<0.85&&(g.rec==null||g.rec>=60))sc+=1;why.push(`workout strain ${g.strain.toFixed(1)} vs usual ${g.strainBase.toFixed(1)}`)}
  if(g.hardMin!=null&&g.hardBase!=null&&g.hardBase>5&&g.hardMin>g.hardBase*1.6&&(g.rec==null||g.rec<60)){sc-=1;why.push(`${Math.round(g.hardMin)} min in zones 4–5 vs usual ${Math.round(g.hardBase)}`)}
  if(g.adh!=null){if(g.adh<0.6)sc-=1;why.push(`${Math.round(g.adh*100)}% of sessions done`)}
  const lvl=sc>=3?'push':sc<=-2?'ease':'normal';
  const act=lvl==='push'?' One extra set on main and secondary lifts this week.':lvl==='ease'?' One set fewer on secondary and accessory moves, 1 more rep in reserve, and HIIT becomes Zone 2.':' Normal volume this week.';
  return WICACHE[ws]={lvl,score:sc,sig:g,avg:g.rec,reds:g.reds,why:'Last week: '+why.join(', ')+'.'+act};
}
/* every other cycle, accessories and arm moves rotate to a sister exercise; main lifts stay so strength keeps building */
const ROT={incMach:'incDB',incDB:'incMach',csRow:'sealRow',sealRow:'csRow',lmPress:'saDBPress',saDBPress:'machShoulder',cLat:'machLat',dbLat:'cLat',ropePush:'vbarPush',vbarPush:'ropePush',hammer:'crossHammer',ropeHammer:'hammer',saCableRow:'machRow',machChest:'floorPress',revPec:'cRearFly',cRearFly:'revPec',preacherM:'cableCurl',cableCurl:'dbCurl',crossExt:'kickback',rfess:'revLunge',seatHam:'lyingHam',legPress:'hackSq',standCalf:'slCalf',dbRDL:'slRDL',stepUp:'splitSq',legExt:'spanishSq',seatCalf:'standCalf',backExt45:'pullThrough'};
function rotated(base,role,d){if(role==='main'||role==='pre'||role==='tw'||role==='coreR'||role==='coreT')return base;return phaseOf(d).c%2===1&&ROT[base]?ROT[base]:base}
function extAt(d){return S.ext.find(x=>d>=x.from&&d<=x.to)||null}
function rangeOf(r){if(typeof r==='number')return[r,r];const m=String(r).match(/(\d+)(?:-(\d+))?/);return m?[+m[1],+(m[2]||m[1])]:[8,10]}
function rx(role,d,dose,isT){
  const ph=phaseOf(d),off=ph.off,wi=weekInt(d);
  if(role==='tw'){let sets=ph.s==='S'?4:3;const add={F:0,H:2,S:4}[ph.s]+off;if(ph.deload)sets=2;if(readyOf(d)==='y')sets--;if(wi&&wi.lvl==='ease'&&!ph.deload)sets--;sets=Math.max(1,sets);
    const v=isT?dose+(ph.deload?0:add*5):String(dose+(ph.deload?0:add));return{sets,reps:v,rir:ph.rir,rest:60}}
  const sc=SCH[ph.s];let[sets,base]=sc[role];let rir=ph.rir;
  let reps=role==='coreT'?base+off*5:(role==='pre'?base:base+off);
  if(role==='main'&&!ph.deload)sets+=ph.mainset;
  const ex=extAt(d);if(ex&&ex.vol>0&&role==='arm')sets+=1;if(ex&&ex.vol<0&&(role==='acc'||role==='arm'))sets-=1;
  if(ph.vol>0&&(role==='acc'||role==='arm'))sets+=1;if(ph.vol<0&&(role==='acc'||role==='arm'))sets-=1;
  if(wi&&!ph.deload){if(wi.lvl==='push'&&(role==='main'||role==='sec'))sets+=1;if(wi.lvl==='ease'&&(role==='sec'||role==='acc'||role==='arm'))sets-=1;if(wi.lvl==='ease'&&+rir<4)rir=String(+rir+1)}
  if(ph.deload){sets=2;rir='4'}
  if(readyOf(d)==='y'&&(role==='acc'||role==='arm'||role==='pre'))sets--;
  if(readyOf(d)==='y'&&role==='main'&&!ph.deload&&+rir<2)rir='2';
  sets=Math.max(1,Math.min(5,sets));
  let rest=REST[role];if(ph.s==='S'&&role==='main')rest=150;if(S.prof&&S.prof.ans&&+S.prof.ans.len<90)rest=Math.round(rest*(+S.prof.ans.len<=45?.7:.8)/5)*5;if(ex&&ex.vol>0&&(role==='acc'||role==='arm'))rest=45;if(ex&&ex.vol>0&&role==='pre')rest=30;
  return{sets,reps:role==='coreT'?reps:String(reps),rir,rest};
}

/* ---------- WHOOP ---------- */
const WH_ON=location.protocol==='https:'||location.hostname==='localhost';
function wKey(){if(!S.whoop.key){S.whoop.key=(crypto.randomUUID()+crypto.randomUUID()).replace(/-/g,'');save()}return S.whoop.key}
function wAvg(d,key){const vals=[];for(let i=1;i<=30;i++){const x=S.wdata[addD(d,-i)];if(x&&x[key]!=null&&!x.cal)vals.push(+x[key])}return vals.length>=5?vals.reduce((a,b)=>a+b,0)/vals.length:null}
function whoopDay(d){
  const x=S.wdata&&S.wdata[d];if(!x||x.rec==null)return null;
  const hb=wAvg(d,'hrv'),rb=wAvg(d,'rhr');
  const hrvD=hb&&x.hrv!=null?(x.hrv-hb)/hb:null,rhrD=rb&&x.rhr!=null?x.rhr-rb:null;
  let lvl=x.rec>=67?'g':x.rec>=34?'y':'r';const why=[`Recovery ${Math.round(x.rec)}%`];
  let drop=false;
  if(hrvD!=null&&hrvD<=-0.10){drop=true;why.push(`HRV ${Math.round(-hrvD*100)}% below your 30-day average`)}
  if(rhrD!=null&&rhrD>=5){drop=true;why.push(`resting HR ${Math.round(rhrD)} bpm above your average`)}
  if(drop&&lvl!=='r')lvl=lvl==='g'?'y':'r';
  return{...x,lvl,hb,rb,hrvD,rhrD,drop,why}
}
function readyOf(d){if(S.ready[d])return S.ready[d];if(S.whoop&&S.whoop.connected&&S.whoop.auto){const w=whoopDay(d);if(w)return w.lvl}return''}
function lowStreak(d){let n=0;for(let i=0;i<3;i++){const w=whoopDay(addD(d,-i));if(w&&w.lvl!=='g')n++;else break}return n}
function isoToLocal(iso){return ds(new Date(iso))}
async function whoopSync(force){
  if(!WH_ON||!S.whoop.key)return;if(!force&&!S.whoop.pending&&Date.now()-(S.whoop.last||0)<20*60*1000)return;
  try{const r=await fetch('/api/whoop-data?days=90',{cache:'no-store',headers:{'x-iron-key':S.whoop.key}});
    if(r.status===401){if(S.whoop.pending&&Date.now()-S.whoop.pending>15*60*1000){S.whoop.pending=0;save()}if(S.whoop.connected){S.whoop.connected=false;save();rerender();toast('WHOOP disconnected. Reconnect in Settings.')}return}
    if(!r.ok){if(force)toast('WHOOP sync failed. Try again in a minute.');return}
    const j=await r.json();const wasNew=!S.whoop.connected;S.whoop.connected=true;S.whoop.pending=0;S.whoop.last=Date.now();if(wasNew)setTimeout(()=>toast('WHOOP connected'),200);
    const slp={},cyc={};(j.sleeps||[]).forEach(x=>slp[x.id]=x);(j.cycles||[]).forEach(x=>cyc[x.id]=x);
    const hrs=v=>v!=null?Math.round(v/36e3)/100:null;
    (j.records||[]).forEach(x=>{if(x.state!=='SCORED'||!x.created_at)return;const sl=slp[x.sleep_id],cy=cyc[x.cycle_id];
      const asleep=sl&&sl.inBed!=null?sl.inBed-(sl.awake||0):null;
      S.wdata[isoToLocal(x.created_at)]={rec:x.rec,hrv:x.hrv!=null?Math.round(x.hrv*10)/10:null,rhr:x.rhr,spo2:x.spo2!=null?Math.round(x.spo2*10)/10:null,skin:x.skin!=null?Math.round(x.skin*10)/10:null,cal:!!x.calibrating,
        sleep:sl?{perf:sl.perf,eff:sl.eff!=null?Math.round(sl.eff):null,cons:sl.cons,rr:sl.rr!=null?Math.round(sl.rr*10)/10:null,dur:hrs(asleep),light:hrs(sl.light),deep:hrs(sl.deep),rem:hrs(sl.rem),awake:hrs(sl.awake),need:hrs(sl.need),dist:sl.dist,bed:sl.start,wake:sl.end}:null,
        strain:cy&&cy.strain!=null?Math.round(cy.strain*10)/10:null,kcal:cy&&cy.kj!=null?Math.round(cy.kj/4.184):null,ahr:cy?cy.ahr:null,mhr:cy?cy.mhr:null,steps:cy&&cy.steps!=null?cy.steps:null}});
    if(Array.isArray(j.workouts)){S.wwk=S.wwk||{};const cut=addD(todayS(),-120);j.workouts.forEach(x=>{const d=isoToLocal(x.start);if(d>=cut)S.wwk[x.id]=Object.assign({},x,{d,strain:x.strain!=null?Math.round(x.strain*10)/10:null,ahr:x.ahr!=null?Math.round(x.ahr):null,mhr:x.mhr!=null?Math.round(x.mhr):null})});Object.keys(S.wwk).forEach(k=>{if(S.wwk[k].d<cut)delete S.wwk[k]})}
    if(j.workoutAccess!=null)S.whoop.wkAccess=!!j.workoutAccess;
    whoopAfterSync(j);
    save();rerender();if(force)toast('WHOOP synced');
  }catch(e){if(force)toast('Couldn\u2019t reach WHOOP')}
}
function whoopCard(d){
  if(!S.whoop.connected)return'';
  const w=whoopDay(d),t=todayS();
  if(!w){return d===t?`<div class="whoop"><div class="wtop"><b>WHOOP</b><button class="mini" data-a="wsync">Sync now</button></div><div class="muted" style="font-size:14px">Waiting for today's recovery. WHOOP scores it after your sleep is processed.</div></div>`:(d<t?'':'')}
  const lvlName={g:'Green',y:'Yellow',r:'Red'}[w.lvl],c={g:'var(--ok)',y:'var(--warn)',r:'var(--bad)'}[w.lvl];
  const pct=v=>(v>0?'+':'')+Math.round(v*100)+'%',bpm=v=>(v>0?'+':'')+Math.round(v)+' bpm';
  const manual=!!S.ready[d];
  return`<div class="whoop" style="--c:${c}"><div class="wtop"><b>WHOOP</b><span class="pill" style="--c:${c}">${lvlName}${S.whoop.auto?'':' (auto off)'}</span></div>
  <div class="wstats"><div><b class="disp num">${Math.round(w.rec)}%</b><span>Recovery</span></div><div><b class="disp num">${w.hrv!=null?Math.round(w.hrv):'–'}</b><span>HRV ms${w.hrvD!=null?`, ${pct(w.hrvD)}`:''}</span></div><div><b class="disp num">${w.rhr!=null?Math.round(w.rhr):'–'}</b><span>RHR${w.rhrD!=null?`, ${bpm(w.rhrD)}`:''}</span></div></div>
  <div class="wwhy">${manual?`You overrode today to <b>${{g:'Green',y:'Yellow',r:'Red'}[S.ready[d]]}</b>. <button class="linkbtn" data-a="useWhoop">Use WHOOP instead</button>`:S.whoop.auto?`${w.drop?'<b>Adjusted:</b> ':''}${w.why.join(', ')}.${w.hb==null?' Your 30-day average builds after a week of data.':''}`:'Auto-adjust is off in Settings.'}</div>
  ${lowStreak(d)>=3&&d===t?`<div class="wwhy" style="margin-top:6px"><b>Three low days in a row.</b> Consider making the rest of this week lighter: keep the Yellow session or swap a day for rest.</div>`:''}</div>`;
}

/* ---------- plan resolution ---------- */
const inPlan=d=>d>=S.start&&d<=S.end;
const isLift=k=>!!k&&!!T[k]&&(T[k].k==='upper'||T[k].k==='lower'||T[k].k==='full');
function tripAt(d){return(S.trips||[]).find(x=>d>=x.from&&d<=x.to)||null}
function mapAt(d){const ms=(S.custom&&S.custom.maps)||[];let m=null;for(const x of ms)if(x.from<=d)m=x.map;return m||S.map}
function activeMap(){const ms=(S.custom&&S.custom.maps)||[];if(!ms.length)return S.map;const t=todayS();let m=ms[0];for(const x of ms)if(x.from<=t)m=x;return m.map}
function baseTpl(d){if(!inPlan(d))return null;const b=(mapAt(d)[dow(d)])||'rest';const tr=tripAt(d);
  if(tr&&isLift(b)){let n=0;for(let x=tr.from;x<d;x=addD(x,1)){if(isLift(S.moves[x]||mapAt(x)[dow(x)]))n++}return TRAVEL[n%4]}return b}
function tplOf(d){if(!inPlan(d))return null;return S.moves[d]||baseTpl(d)}
function setSession(d,k){if(k===baseTpl(d))delete S.moves[d];else S.moves[d]=k}
const clone=o=>o==null?null:JSON.parse(JSON.stringify(o));
function snapSched(label,dates,swapDates,mapToo){
  const e={label,t:Date.now(),m:{},s:{}};
  dates.forEach(d=>{e.m[d]=Object.prototype.hasOwnProperty.call(S.moves,d)?S.moves[d]:null});
  (swapDates||[]).forEach(d=>{e.s[d]=clone(S.swaps[d])});
  if(mapToo){e.map=clone(S.map);if(S.custom)e.cmaps=clone(S.custom.maps)}
  S.hist=S.hist||[];S.hist.push(e);if(S.hist.length>40)S.hist.shift();return e}
function undoSched(){const e=(S.hist||[]).pop();if(!e)return null;
  Object.keys(e.m).forEach(d=>{if(e.m[d]==null)delete S.moves[d];else S.moves[d]=e.m[d]});
  Object.keys(e.s).forEach(d=>{if(e.s[d]==null)delete S.swaps[d];else S.swaps[d]=e.s[d]});
  if(e.map)S.map=e.map;if(e.cmaps&&S.custom)S.custom.maps=e.cmaps;save();return e}
function doSchedule(mode,target){
  const d=UI.date;if(!target||target===d||!inPlan(target)){toast('Pick a different day inside your plan');return false}
  const a1=tplOf(d),a2=tplOf(target);
  if(mode==='copy'){
    if(a1==='rest'){toast('A rest day has nothing to copy');return false}
    snapSched(`Copied ${T[a1].n} from ${short(d)} to ${short(target)}`,[target],[target]);
    setSession(target,a1);if(S.swaps[d])S.swaps[target]=clone(S.swaps[d]);else delete S.swaps[target];
  }else{
    snapSched(`Moved ${T[a1].n} from ${short(d)} to ${short(target)}${a2!=='rest'?` (${T[a2].n} now on ${short(d)})`:''}`,[d,target],[d,target]);
    setSession(d,a2);setSession(target,a1);
    const sd=clone(S.swaps[d]),st=clone(S.swaps[target]);if(st)S.swaps[d]=st;else delete S.swaps[d];if(sd)S.swaps[target]=sd;else delete S.swaps[target];
  }
  save();return true}
function resetSchedule(){const dates=Object.keys(S.moves);if(!dates.length&&JSON.stringify(S.map)===JSON.stringify(defaults().map)){toast('Your schedule is already the original');return false}
  snapSched('Reset schedule to the original plan',dates,dates,true);dates.forEach(d=>delete S.swaps[d]);S.moves={};S.map=defaults().map;save();return true}
function exAt(d,slot,base){const p=S.swaps[d]&&S.swaps[d][slot];return p||S.swapsAll[base]||base}
function blocksFor(d){
  const k=tplOf(d);if(!k)return[];const t=T[k];if(!t.blocks)return[];
  if(readyOf(d)==='r')return[];
  const ex=extAt(d);
  let out=t.blocks.map((b,bi)=>({...b,key:'s'+bi})).filter(b=>!(ex&&(ex.trim||ex.extra)&&b.opt));
  if(ex&&ex.extra&&EXTRA[t.k])out.push({...EXTRA[t.k],key:'sx'});
  return out.map((b,idx)=>({...b,label:String.fromCharCode(65+idx),items:b.i.map((it,ii)=>{
    const slot=b.key+'-'+ii,b0=rotated(it[0],it[1],d),ex2=exAt(d,slot,b0);return{slot,base:b0,orig:it[0],ex:ex2,role:it[1],rx:rx(it[1],d,E[ex2].t===E[b0].t?it[2]:(E[ex2].t?(E[ex2].s||30):10),!!E[ex2].t)}})}));
}
function coreFor(d){const t=T[tplOf(d)];if(!t||!t.core)return[];return t.core.map((c,i)=>{const slot='c'+i;return{slot,base:c[0],ex:exAt(d,slot,c[0]),role:c[1],rx:rx(c[1],d)}})}
function listFor(d,kind){const t=T[tplOf(d)];if(!t)return[];const src=kind==='wu'?(t.wu&&readyOf(d)!=='r'?WU[t.wu]:null):(mobListAt(d,t.k)||MOB[t.mob]);if(!src)return[];const pre=kind==='wu'?'w':'m';return src.map((m,i)=>{const slot=pre+i;const ex=exAt(d,slot,m[0]);let dose=m[1];if(ex!==m[0]){const b=E[m[0]],a=E[ex];if(a.t&&!b.t)dose=a.s||30;else if(!a.t&&b.t)dose=8}return{slot,base:m[0],ex,dose,kind}})}
const mobFor=d=>listFor(d,'mob'),warmFor=d=>listFor(d,'wu');
function secsOf(it){const e=E[it.ex];if(!e.t)return 0;return typeof it.rx.reps==='number'?it.rx.reps:(e.s||30)}
function repTxt(it){const e=E[it.ex];if(e.t)return secsOf(it)+' s'+(e.u?' / side':'');return it.rx.reps+(e.u?' / side':'')}

/* ---------- time estimate & cardio ---------- */
function listSecs(l){return l.reduce((a,m)=>{const e=E[m.ex],u=e.u?2:1;return a+(e.t?m.dose*u:m.dose*3*u)+15},0)}
const mobSecs=d=>listSecs(mobFor(d)),warmSecs=d=>listSecs(warmFor(d).map(m=>m.ex==='rampUp'?{...m,dose:20}:m));
function itemWork(it){const e=E[it.ex],u=e.u?2:1;if(e.t)return secsOf(it)*u+10;return rangeOf(it.rx.reps)[1]*3.2*u+10}
function blockSecs(b){const rounds=Math.max(...b.items.map(x=>x.rx.sets));const work=b.items.reduce((a,x)=>a+itemWork(x),0)+(b.items.length>1?10:0);const rest=Math.max(...b.items.map(x=>x.rx.rest));return rounds*(work+rest)+(b.items.some(x=>x.role==='main')?45:0)+60}
function strSecs(d){return blocksFor(d).reduce((a,b)=>a+blockSecs(b),0)}
function coreSecs(d){const c=coreFor(d);if(!c.length)return 0;return blockSecs({items:c})}
function cardioFor(d){
  const k=tplOf(d);if(!k)return null;const t=T[k],ph=phaseOf(d);
  if(t.k==='long'){const base=[40,45,50,55,55,35][ph.pos]+5*Math.min(ph.c,1);return{mins:Math.min(60,base),m:'Your choice: incline walk, outdoor walk, bike, swim or elliptical',z:'z2',long:1}}
  if(t.k==='rest')return null;
  if(t.k==='travel')return{mins:readyOf(d)==='r'?20:t.cardio.mins,m:readyOf(d)==='r'?'Easy walk outside or in the hotel':'Low-impact bodyweight circuit',z:readyOf(d)==='r'?'z2':'circ',moves:t.cardio.moves};
  if(readyOf(d)==='r')return{mins:30,m:'Easy walk or bike',z:'z2'};
  const used=(mobSecs(d)+warmSecs(d)+strSecs(d)+coreSecs(d))/60;
  const PP=(S.custom&&S.custom.target)?S.custom:(S.prof&&S.prof.plan),tgt=PP?PP.target:84,rgc=PP?PP.cardioRange:[10,20];const mins=Math.max(rgc[0],Math.min(rgc[1],Math.round(tgt-used)));
  const wi=weekInt(d);if(t.cardio.z==='int'&&((wi&&wi.lvl==='ease')||readyOf(d)==='y'))return{mins,m:'Zone 2 instead of intervals (recovery is low)',z:'z2'};
  return{mins,m:t.cardio.m,z:t.cardio.z};
}
function cardioPhases(c){
  if(c.z==='int'){const rounds=Math.max(4,Math.floor((c.mins*60-300)/90));const p=[{l:'Warm-up, easy spin',s:120}];for(let i=1;i<=rounds;i++){p.push({l:'Hard '+i+'/'+rounds,s:30});p.push({l:'Easy '+i+'/'+rounds,s:60})}p.push({l:'Cool-down',s:Math.max(60,c.mins*60-120-rounds*90)});return p}
  if(c.z==='circ'){const p=[];const n=c.mins;for(let i=0;i<n;i++){p.push({l:c.moves[i%c.moves.length]+' ('+(i+1)+'/'+n+')',s:40});if(i<n-1)p.push({l:'Easy breathing',s:20})}return p}
  return[{l:'Zone 2',s:c.mins*60}];
}
function estimate(d){const m=mobSecs(d)/60,w=warmSecs(d)/60,s=strSecs(d)/60,c=coreSecs(d)/60,cd=cardioFor(d);return{m,w,s,c,cd:cd?cd.mins:0,total:m+w+s+c+(cd?cd.mins:0)}}

/* ---------- logs ---------- */
function L(d){return S.logs[d]||(S.logs[d]={})}
function slotLog(d,slot,ex,n){const l=L(d);let o=l[slot];if(!o||o.ex!==ex){o=l[slot]={ex,sets:[]}}while(o.sets.length<n)o.sets.push({w:'',r:'',d:0});return o}
function isChk(d,k){return!!(S.logs[d]&&S.logs[d]._x&&S.logs[d]._x[k])}
function setChk(d,k,v){const l=L(d);l._x=l._x||{};if(v)l._x[k]=1;else delete l._x[k]}
function units(d){
  const k=tplOf(d);const r={mob:[0,0],wu:[0,0],str:[0,0],core:[0,0],cardio:[0,0]};if(!k)return r;
  mobFor(d).forEach(m=>{r.mob[1]++;if(isChk(d,m.slot))r.mob[0]++});
  warmFor(d).forEach(m=>{r.wu[1]++;if(isChk(d,m.slot))r.wu[0]++});
  blocksFor(d).forEach(b=>b.items.forEach(it=>{const l=S.logs[d]&&S.logs[d][it.slot];const n=it.rx.sets;r.str[1]+=n;if(l&&l.ex===it.ex)r.str[0]+=l.sets.slice(0,n).filter(s=>s.d).length}));
  coreFor(d).forEach(it=>{const l=S.logs[d]&&S.logs[d][it.slot];const n=it.rx.sets;r.core[1]+=n;if(l&&l.ex===it.ex)r.core[0]+=l.sets.slice(0,n).filter(s=>s.d).length});
  if(cardioFor(d)){r.cardio[1]=1;if(isChk(d,'cardio'))r.cardio[0]=1}
  return r;
}
function pctOf(u){const ks=['mob','wu','str','core','cardio'];const a=ks.reduce((x,k)=>x+u[k][0],0),b=ks.reduce((x,k)=>x+u[k][1],0);return b?a/b:0}
const isTraining=k=>k&&T[k]&&(T[k].k==='hiit'||T[k].k==='upper'||T[k].k==='lower'||T[k].k==='full'||T[k].k==='long'||T[k].k==='travel');

/* ---------- progression engine ---------- */
let HISTCACHE=null;
function hist(){if(HISTCACHE)return HISTCACHE;const h={};Object.keys(S.logs).sort().forEach(d=>{const l=S.logs[d];Object.keys(l).forEach(k=>{if(k[0]==='_')return;const o=l[k];if(!o||!o.ex)return;const sets=o.sets.filter(s=>s.d&&s.w!==''&&s.r!=='');if(!sets.length)return;(h[o.ex]=h[o.ex]||[]).push({d,sets})})});return HISTCACHE=h}
function lastPerf(ex,d){const a=(hist()[ex]||[]).filter(x=>x.d<d);return a.length?a[a.length-1]:null}
function roundTo(x,s){return Math.round(x/s)*s}
function suggest(it,d){
  const lp=lastPerf(it.ex,d);if(!lp)return null;
  const ph=phaseOf(d),lph=phaseOf(lp.d),tgt=rangeOf(it.rx.reps)[1];
  const top=Math.max(...lp.sets.map(s=>+s.w)),reps=lp.sets.map(s=>+s.r);
  const lower=['main','sec'].includes(it.role)&&T[tplOf(d)]&&T[tplOf(d)].k==='lower';
  const inc=lower?5:(['acc','arm','pre'].includes(it.role)?1:2.5),step=inc>=2.5?2.5:1;
  let w=top,why;
  const pl=plateauOf(it.ex,d);
  if(ph.deload){w=roundTo(top*0.85,step);why='Deload: about 15% lighter, crisp reps'}
  else if(pl&&pl.heavy&&lph.c===ph.c){w=roundTo(top*0.9,step);why='Stalled for 3 sessions: reset about 10% lighter and build back up'}
  else if(lph.c!==ph.c||lph.deload){
    const recent=(hist()[it.ex]||[]).filter(x=>x.d<d&&diffD(x.d,d)<=49&&!phaseOf(x.d).deload);
    const best=Math.max(...(recent.length?recent:[lp]).flatMap(x=>x.sets.map(s=>e1rm(+s.w,+s.r))));
    w=roundTo(best/(1+(tgt+(+ph.rir||2))/30),step);why=`New cycle: set from your strength for ${tgt} reps`}
  else if(ph.fi===3&&lph.w<ph.w&&lph.fi!==3){w=top+inc;why='Week '+ph.cw+': add weight, reps reset'}
  else if(lp.sets.some(q=>+q.e>=9.5)&&reps.some(r=>r<tgt)){w=top;why='Last time was a max effort, same weight'}
  else if(lp.sets.filter(q=>q.e).length&&lp.sets.filter(q=>q.e).every(q=>+q.e<=7)&&reps.every(r=>r>=tgt)){w=top+inc;why='You rated it easy (RPE 7 or less), add weight'}
  else if(reps.every(r=>r>=tgt+2)){w=top+inc;why='That was easy, add weight'}
  else if(reps.filter(r=>r<tgt-2).length>=2){w=roundTo(top*0.95,step);why='Missed the target twice, trim a little'}
  else why=`Same weight, aim for ${tgt} reps`;
  return{lp,w:+Math.max(0,w).toFixed(1),why};
}
function e1rm(w,r){return w*(1+r/30)}

/* ---------- ui state ---------- */
const UI={tab:'home',date:null,hx:null,hm:{},suppEdit:false,exc:{},exo:{},compact:false};
(function cleanBody(){try{Object.keys(S.body||{}).forEach(d=>{const e=S.body[d];['waist','chest','arm','thigh'].forEach(k=>delete e[k]);if(!Object.keys(e).filter(q=>q!=='src').length)delete S.body[d]})}catch(e){}})();
(function initDate(){const t=todayS();UI.date=t<S.start?S.start:(t>S.end?S.end:t)})();

/* ---------- icons ---------- */
const IC={
plate:'<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h4M17 12h4"/><rect x="7" y="6" width="3" height="12" rx="1"/><rect x="14" y="6" width="3" height="12" rx="1"/><path d="M10 12h4"/></svg>',
share:'<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3M7.5 7.5L12 3l4.5 4.5"/><path d="M5 12v6.5A1.5 1.5 0 0 0 6.5 20h11a1.5 1.5 0 0 0 1.5-1.5V12"/></svg>',
cloud:'<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 18h10a4 4 0 0 0 .5-7.97A6 6 0 0 0 6.1 9.2 4.5 4.5 0 0 0 7 18z"/></svg>',
chart:'<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>',
alert:'<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l9.5 16.5h-19z"/><path d="M12 10v4M12 17.5v.01"/></svg>',
spark:'<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z"/></svg>',
book:'<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5z"/><path d="M4 20.5A2.5 2.5 0 0 0 6.5 23H20v-5"/></svg>',
upload:'<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 16V4M7 9l5-5 5 5M4 20h16"/></svg>',
link:'<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/></svg>',
trophy:'<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20h7M10 17h4"/></svg>',
pause:'<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6v12M15 6v12"/></svg>',
bolt:'<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L4 14h7l-1 8 9-12h-7z"/></svg>',
more:'<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="6" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/></svg>',
body:'<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="5" r="2.5"/><path d="M6 9.5l6 1.5 6-1.5M12 11v5M9 21l3-5 3 5"/></svg>',
back:'<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 5l-7 7 7 7"/></svg>',
gear:'<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
target:'<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/></svg>',
food:'<svg class="ic" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3v8a2 2 0 0 0 2 2v8M5 3v5M9 3v5M17 21V3c-2 1-3 4-3 8h3"/></svg>',
home:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 11l8-7 8 7v8a1.5 1.5 0 0 1-1.5 1.5H15v-6H9v6H5.5A1.5 1.5 0 0 1 4 19z"/></svg>',
check:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>',
play:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 4.5v15l13-7.5z"/></svg>',
yt:'<svg viewBox="0 0 24 24" fill="currentColor"><path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8zM10 15V9l5.2 3z"/></svg>',
swap:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M7 4L3 8l4 4M3 8h14M17 20l4-4-4-4M21 16H7"/></svg>',
gear:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/></svg>',
info:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.1"/></svg>',
train:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M6.5 6.5v11M17.5 6.5v11M3.5 9v6M20.5 9v6M6.5 12h11"/></svg>',
build:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M4 6h10M18 6h2M4 12h4M12 12h8M4 18h12M20 18h0"/><circle cx="16" cy="6" r="2"/><circle cx="10" cy="12" r="2"/><circle cx="18" cy="18" r="2"/></svg>',
plan:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="3.5" y="5" width="17" height="15" rx="3"/><path d="M3.5 10h17M8 3v4M16 3v4"/></svg>',
prog:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19V11M10 19V5M16 19v-6M22 19H2"/></svg>',
supp:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><rect x="3" y="8" width="18" height="8" rx="4" transform="rotate(-40 12 12)"/><path d="M9.2 8.7l6.1 6.6"/></svg>',
travel:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="7" width="16" height="12" rx="2.5"/><path d="M9 7V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 15 5v2M9 11v4M15 11v4"/></svg>',
plus:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
pen:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16z"/><path d="M13.5 6.5l4 4"/></svg>',
pulse:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h4l2.5-6 4 12 2.5-6H21"/></svg>',
hab:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M8 12.5l3 3 5-6"/></svg>'
};
const esc=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function vidUrl(ex){const id=ytId(ex);if(id)return'https://www.youtube.com/shorts/'+id;return'https://www.youtube.com/results?search_query='+encodeURIComponent(E[ex].n.replace(/\(.*?\)/g,'')+' exercise form #shorts')}
function fmtT(s){s=Math.max(0,Math.ceil(s));return Math.floor(s/60)+':'+pad(s%60)}
function mins(m){return Math.round(m)+' min'}

