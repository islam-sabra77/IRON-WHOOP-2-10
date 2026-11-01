"use strict";
/* ---------- SUPPLEMENT STACK QUESTIONNAIRE ----------
   A few questions about goals, issues, diet and medicines build a stack from the guide.
   Used in the setup questionnaire and from the Supplements tab (new stack or improve the current one). */
const SQ_GOALS=[['muscle','💪 Build muscle'],['strength',''+IC.plate+' Strength and power'],['endurance','🏃 Endurance'],['fatloss','🔥 Lose fat'],['energy',''+IC.bolt+' More energy'],['focus','🧠 Focus and memory'],['sleep','🌙 Better sleep'],['stress','🧘 Less stress'],['joints','🦴 Joint health'],['heart','❤️ Heart health'],['immunity','🛡️ Immunity'],['gut','🌿 Gut health'],['skin',''+IC.spark+' Skin and hair'],['hormones','⚖️ Hormone balance'],['longevity','⏳ Healthy ageing']];
const SQ_ISSUES=[['poorsleep','Trouble sleeping'],['lowenergy','Tired or low energy'],['anxious','Stressed or anxious'],['jointpain','Joint pain or stiffness'],['soreness','Slow recovery or very sore'],['bloating','Bloating or digestion'],['colds','Catch colds often'],['lowsun','Little sun or low vitamin D'],['cramps','Muscle cramps'],['bloodsugar','High blood sugar'],['cholesterol','High cholesterol'],['bp','High blood pressure'],['migraine','Migraines'],['lowiron','Low iron or heavy periods'],['none','None of these']];
const SQ_MEDS=[['thinners','Blood thinners'],['bpmeds','Blood pressure medicine'],['diabmeds','Diabetes medicine'],['antidep','Antidepressants'],['thyroid','Thyroid condition'],['pregnant','Pregnant or breastfeeding'],['kidney','Kidney problems'],['liver','Liver problems'],['none','None of these']];
/* what each answer points to: [supplement id, points, reason] */
const SQ_MAP={
  muscle:[['creatine',3,'builds strength and muscle'],['whey',2,'helps you hit your protein target'],['citrulline',1,'better pumps and training volume']],
  strength:[['creatine',3,'more strength and power'],['caffeine',1,'stronger training sessions'],['alphagpc',1,'power output']],
  endurance:[['electrolytes',2,'hydration on long sessions'],['betaalanine',2,'delays fatigue on hard efforts'],['beetroot',2,'endurance and blood flow'],['caffeine',1,'better endurance'],['taurine',1,'endurance and recovery'],['carnitine',1,'fat use during long efforts']],
  fatloss:[['greentea',2,'small boost to fat burning'],['glucomannan',1,'helps you feel full'],['fiber',1,'fullness and digestion'],['whey',1,'protein keeps muscle while dieting'],['carnitine',1,'fat metabolism']],
  energy:[['rhodiola',2,'less fatigue'],['b12',1,'energy metabolism'],['coq10',1,'cell energy'],['caffeine',1,'alertness']],
  focus:[['theanine',2,'calm focus'],['lionsmane',2,'focus and memory'],['bacopa',1,'memory'],['creatine',1,'brain energy'],['omega3',1,'brain health'],['citicoline',1,'attention']],
  sleep:[['magnesium',2,'relaxation and sleep'],['glycine',2,'deeper sleep'],['tartcherry',1,'natural melatonin'],['theanine',1,'winding down']],
  stress:[['ashwagandha',3,'lowers stress and cortisol'],['magnesium',1,'calmer nervous system'],['rhodiola',1,'stress resilience'],['theanine',1,'calm without drowsiness']],
  joints:[['omega3',2,'joint comfort'],['collagen',2,'tendons and joints'],['curcumin',1,'joint inflammation'],['glucosamine',1,'cartilage support']],
  heart:[['omega3',3,'heart health'],['coq10',2,'heart muscle energy'],['fiber',1,'cholesterol'],['vitk2',1,'arterial health']],
  immunity:[['vitd',2,'immune function'],['vitc',2,'immune support'],['zinc',2,'immune defences'],['probiotic',1,'gut immunity']],
  gut:[['probiotic',3,'gut balance'],['fiber',2,'regularity'],['prebiotic',1,'feeds good bacteria'],['glutamine',1,'gut lining']],
  skin:[['collagen',3,'skin elasticity'],['vitc',1,'collagen production'],['biotin',1,'hair and nails'],['astaxanthin',1,'skin protection']],
  hormones:[['zinc',2,'hormone production'],['vitd',1,'hormone health'],['magnesium',1,'hormone balance'],['ashwagandha',1,'may support testosterone']],
  longevity:[['omega3',2,'long-term health'],['vitd',1,'long-term health'],['coq10',1,'mitochondria'],['urolithin',1,'mitochondrial renewal'],['taurine',1,'healthy ageing'],['creatine',1,'muscle and brain with age']],
  poorsleep:[['magnesium',3,'falling and staying asleep'],['glycine',2,'sleep quality'],['melatonin',1,'falling asleep (short term)'],['theanine',1,'quieter mind at night']],
  lowenergy:[['vitd',1,'low vitamin D causes fatigue'],['b12',2,'tiredness'],['rhodiola',1,'fatigue'],['coq10',1,'energy'],['magnesium',1,'energy and muscles']],
  anxious:[['ashwagandha',3,'stress and anxiety'],['theanine',2,'calm'],['magnesium',2,'calmer nervous system']],
  jointpain:[['curcumin',3,'joint pain'],['omega3',2,'inflammation'],['glucosamine',2,'knee and joint pain'],['boswellia',1,'stiffness'],['collagen',1,'connective tissue']],
  soreness:[['tartcherry',3,'less muscle soreness'],['omega3',1,'recovery'],['creatine',1,'recovery between sessions'],['magnesium',1,'muscle relaxation']],
  bloating:[['probiotic',2,'bloating'],['enzymes',2,'digestion of big meals'],['ginger',1,'digestion'],['peppermint',1,'IBS cramps']],
  colds:[['vitd',3,'fewer infections'],['zinc',2,'shorter colds'],['vitc',2,'immune support'],['elderberry',1,'shorter colds']],
  lowsun:[['vitd',4,'little sun exposure'],['vitk2',1,'pairs with vitamin D']],
  cramps:[['magnesium',3,'muscle cramps'],['electrolytes',2,'cramps from sweating']],
  bloodsugar:[['berberine',3,'blood sugar'],['fiber',2,'smaller sugar spikes'],['inositol',1,'insulin sensitivity'],['chromium',1,'blood sugar']],
  cholesterol:[['fiber',2,'lowers LDL'],['sterols',2,'lowers LDL'],['omega3',2,'triglycerides'],['bergamot',1,'cholesterol']],
  bp:[['beetroot',2,'blood pressure'],['magnesium',1,'blood pressure'],['garlic',1,'blood pressure'],['omega3',1,'heart health']],
  migraine:[['riboflavin',3,'fewer migraines'],['magnesium',2,'fewer migraines'],['coq10',1,'migraine prevention']],
  lowiron:[['iron',3,'low iron'],['vitc',1,'helps absorb iron']]
};
const SQ_BLOCK={
  thinners:['ginkgo','nattokinase','vite','garlic','curcumin','resveratrol','pycnogenol','grapeseed','reishi','chaga','cordyceps','vitk2','ginger','fisetin','blackseed'],
  bpmeds:['yohimbine','dgl','agmatine','oliveleaf','garlic','beetroot','hibiscus'],
  diabmeds:['berberine','chromium','gymnema','bittermelon','cinnamon','ala','fenugreek','blackseed','holybasil','inositol','bitter'],
  antidep:['htp','stjohns','same','tryptophan','rhodiola','ginseng','saffron'],
  thyroid:['ashwagandha','iodine','seamoss','lemonbalm','maca'],
  kidney:['creatine','electrolytes','magnesium','vitc','bicarb','silica','magthreonate'],
  liver:['greentea','kava','ashwagandha','vita','niacin','redyeast'],
  caff:['caffeine','guarana','yerbamate','greentea','paraxanthine','theacrine','yohimbine']
};
const SQ_PREG_OK=['folate','vitd','algaeoil','omega3','iron','choline','iodine','calcium','magnesium','probiotic','b12','multi','plantprot','whey','ginger','vitc'];
const SQ_ANIMAL=['whey','casein','collagen','glucosamine','codliver','eggprot','beefprot','uc2','colostrum','lactoferrin','greenlipped','bonebroth','omega3'];
const SQ_SIZE={essentials:4,balanced:7,full:10};
const sqLabel={thinners:'blood thinners',bpmeds:'blood pressure medicine',diabmeds:'diabetes medicine',antidep:'antidepressants',thyroid:'a thyroid condition',kidney:'kidney problems',liver:'liver problems',caff:'avoiding caffeine',pregnant:'pregnancy'};
function sqDefaults(){const p=S.suppQ||{},g=(S.prof&&S.prof.ans&&S.prof.ans.goal)||'muscle';
  return Object.assign({goals:g==='strength'?['strength','muscle']:g==='fat'?['fatloss','energy']:g==='health'?['energy','sleep','heart']:['muscle'],issues:[],diet:'omni',fish:'no',protein:'sometimes',caff:'some',meds:[],sex:'male',size:'balanced'},clone(p))}
function sqBlockedBy(id,a){const out=[];(a.meds||[]).forEach(m=>{if(m==='pregnant'){if(!SQ_PREG_OK.includes(id))out.push('pregnant')}else if(SQ_BLOCK[m]&&SQ_BLOCK[m].includes(id))out.push(m)});if(a.caff==='avoid'&&SQ_BLOCK.caff.includes(id))out.push('caff');return out}
/* swap animal products for plant versions where needed */
function sqSwap(id,a){if(a.diet==='vegan'){if(id==='whey')return'plantprot';if(id==='omega3')return'algaeoil';if(SQ_ANIMAL.includes(id))return null}if(a.diet==='veg'){if(id==='omega3')return'algaeoil';if(['collagen','glucosamine','codliver','beefprot','uc2','greenlipped','bonebroth'].includes(id))return null}return id}
function sqRecommend(a){
  const sc={},why={},add=(id,p,r)=>{id=sqSwap(id,a);if(!id||!SUPP_DB.find(e=>e.id===id))return;sc[id]=(sc[id]||0)+p;(why[id]=why[id]||[]);if(r&&!why[id].includes(r))why[id].push(r)};
  (a.goals||[]).forEach(g=>(SQ_MAP[g]||[]).forEach(x=>add(...x)));
  (a.issues||[]).forEach(g=>(SQ_MAP[g]||[]).forEach(x=>add(...x)));
  if(a.fish==='no')add('omega3',2,'you rarely eat oily fish');
  if(a.protein==='no')add('whey',3,'you often miss your protein target');else if(a.protein==='sometimes'&&((a.goals||[]).some(g=>['muscle','strength','fatloss'].includes(g))))add('whey',1,'helps you hit your protein target');
  if(a.diet==='vegan'){add('b12',4,'vegan diets lack B12');add('creatine',1,'plant diets have no creatine');add('iodine',1,'often low on plant diets');add('algaeoil',1,'plant source of omega-3')}
  if(a.diet==='veg')add('b12',3,'often low without meat');
  if(a.caff==='love'&&(a.goals||[]).some(g=>['focus','energy','strength','endurance'].includes(g)))add('theanine',1,'smooths out caffeine');
  if(a.caff!=='avoid'&&(a.goals||[]).some(g=>['strength','endurance','energy'].includes(g)))add('caffeine',1,'before training');
  if((a.meds||[]).includes('pregnant')){add('folate',5,'needed in pregnancy');add('vitd',2,'pregnancy');add('choline',2,'baby brain development');add('iodine',1,'pregnancy');add(a.diet==='omni'||a.diet==='pesc'?'omega3':'algaeoil',2,'baby brain development')}
  add('vitd',1,'most people run low');add('magnesium',1,'most people eat too little');
  if(a.sex==='male'&&(a.goals||[]).includes('hormones'))add('tongkat',1,'male hormone support');
  if(a.sex==='female'&&(a.goals||[]).includes('hormones'))add('inositol',1,'hormone balance');
  const blocked=[];
  let list=Object.keys(sc).map(id=>({id,score:sc[id],why:why[id],e:SUPP_DB.find(e=>e.id===id),block:sqBlockedBy(id,a)}));
  list.filter(x=>x.block.length&&x.score>=2).forEach(x=>blocked.push(x));
  list=list.filter(x=>!x.block.length&&x.score>=2).sort((x,y)=>y.score-x.score);
  // vitamin K2 only alongside D3
  if(!list.find(x=>x.id==='vitd'))list=list.filter(x=>x.id!=='vitk2');
  return{list:list.slice(0,SQ_SIZE[a.size]||7),more:list.slice(SQ_SIZE[a.size]||7,(SQ_SIZE[a.size]||7)+4),blocked};
}
function sqToSupp(x,i){const e=x.e;return{id:'s'+Date.now()+'_'+i,n:e.n,d:e.d.replace(/ daily$/,'').replace(/\s*\(.*?\)$/,''),slot:e.s,note:'For: '+x.why.slice(0,3).join(', ')+'.',c:HAB_COLORS[i%HAB_COLORS.length]}}
/* the question form; act = ['obpick','obtog'] in setup or ['sqpick','sqtog'] in the sheet */
function sqForm(a,act){
  const one=(f,v,l,sub)=>`<button class="obopt ${a[f]==v?'on':''}" data-a="${act[0]}" data-f="${f}" data-v="${v}"><b>${l}</b>${sub?`<span>${sub}</span>`:''}</button>`;
  const many=(f,v,l)=>`<button class="obopt ${(a[f]||[]).includes(v)?'on':''}" data-a="${act[1]}" data-f="${f}" data-v="${v}"><b>${l}</b></button>`;
  return`<label class="fl2">What do you want supplements to help with? (pick any)</label><div class="obrow wrap">${SQ_GOALS.map(([v,l])=>many('goals',v,l)).join('')}</div>
  <label class="fl2" style="margin-top:12px">Anything bothering you lately?</label><div class="obrow wrap">${SQ_ISSUES.map(([v,l])=>many('issues',v,l)).join('')}</div>
  <label class="fl2" style="margin-top:12px">Your diet</label><div class="obrow wrap">${one('diet','omni','Eat everything')}${one('diet','pesc','Little red meat')}${one('diet','veg','Vegetarian')}${one('diet','vegan','Vegan')}</div>
  <label class="fl2" style="margin-top:12px">Oily fish (salmon, sardines) twice a week?</label><div class="obrow">${one('fish','yes','Yes')}${one('fish','no','Rarely')}</div>
  <label class="fl2" style="margin-top:12px">Do you hit your protein (about 1.6 g per kg) from food?</label><div class="obrow">${one('protein','yes','Usually')}${one('protein','sometimes','Sometimes')}${one('protein','no','Rarely')}</div>
  <label class="fl2" style="margin-top:12px">Caffeine</label><div class="obrow">${one('caff','avoid','Avoid it')}${one('caff','some','Some')}${one('caff','love','Love it')}</div>
  <label class="fl2" style="margin-top:12px">Sex</label><div class="obrow">${one('sex','male','Male')}${one('sex','female','Female')}${one('sex','other','Prefer not to say')}</div>
  <label class="fl2" style="margin-top:12px">Medicines or conditions (so risky ones are left out)</label><div class="obrow wrap">${SQ_MEDS.map(([v,l])=>many('meds',v,l)).join('')}</div>
  <label class="fl2" style="margin-top:12px">How many supplements are you happy to take?</label><div class="obrow">${one('size','essentials','Essentials','Up to 4')}${one('size','balanced','Balanced','Up to 7')}${one('size','full','Full','Up to 10')}</div>`;
}
function sqToggle(a,f,v){const arr=a[f]=a[f]||[];const i=arr.indexOf(v);if(i>=0)arr.splice(i,1);else{if(v==='none')arr.length=0;else{const n=arr.indexOf('none');if(n>=0)arr.splice(n,1)}arr.push(v)}}
function sqResultsHTML(R,a,sel,mode){
  const cur=new Set(S.supps.map(s=>{const i=suppInfo(s.n);return i?i.id:null}).filter(Boolean));
  const row=(x,i)=>{const have=mode==='improve'&&cur.has(x.id);return`<button class="obopt sqitem ${have?'':sel[x.id]?'on':''}" ${have?'disabled':''} data-a="sqsel" data-v="${x.id}"><b>${have?'✓ ':sel[x.id]?'☑ ':'☐ '}${esc(x.e.n)}${have?' <span class="pill" style="--c:var(--ok)">already taking</span>':''}</b><span>${esc(x.e.d)} · ${esc(x.e.s)}</span><span class="sqwhy">For ${esc(x.why.slice(0,3).join(', '))}.</span>${x.e.c?`<span class="sqc">⚠️ ${esc(x.e.c)}</span>`:''}</button>`};
  let h=R.list.length?R.list.map(row).join(''):'<p class="muted">Nothing matched. Pick at least one goal or issue.</p>';
  if(R.more.length)h+=`<label class="fl2" style="margin-top:10px">Also worth considering</label>${R.more.map(row).join('')}`;
  if(R.blocked.length)h+=`<div class="note" style="margin-top:10px"><b>Left out for safety:</b> ${R.blocked.map(x=>`${esc(x.e.n)} (${x.block.map(b=>sqLabel[b]||b).join(', ')})`).join('; ')}.</div>`;
  if(mode==='improve'){const warn=[];S.supps.forEach(s=>{const i=suppInfo(s.n);if(!i)return;const b=sqBlockedBy(i.id,a);if(b.length)warn.push(`${esc(s.n)} (${b.map(x=>sqLabel[x]||x).join(', ')})`)});if(warn.length)h+=`<div class="note" style="--c:var(--bad);margin-top:10px"><b>Check with your doctor:</b> ${warn.join('; ')} in your current stack.</div>`}
  return h+`<p class="muted" style="font-size:12px;margin-top:10px">General guidance, not medical advice. Check with your doctor or pharmacist before starting supplements, especially if you take medicine.</p>`;
}
/* sheet from the Supplements tab */
function sqOpen(mode){UI.sq={mode:mode||(S.supps.length?'improve':'new'),a:sqDefaults(),view:'q',sel:{}};drawSq()}
function drawSq(){
  const q=UI.sq,pn=document.getElementById('panel'),keep=q.keepScroll?pn.scrollTop:0;q.keepScroll=false;
  if(q.view==='q'){openSheet(`<h4 class="disp">Build or improve my stack</h4><p class="muted" style="font-size:14px;margin:0 0 8px">Answer a few questions and IRON picks supplements from the 200-item guide, with doses and the best time to take them.</p>
    <div class="obrow"><button class="obopt ${q.mode==='new'?'on':''}" data-a="sqmode" data-v="new"><b>New stack</b><span>Replace my current list</span></button><button class="obopt ${q.mode==='improve'?'on':''}" data-a="sqmode" data-v="improve"><b>Improve my stack</b><span>Add what’s missing for my goals</span></button></div>
    ${q.mode==='improve'?'<p class="muted" style="font-size:13px;margin:6px 0 0">Tip: to target one thing, pick just that goal or issue (for example only Better sleep).</p>':''}
    ${sqForm(q.a,['sqpick','sqtog'])}<button class="cta" style="--c:var(--cardio)" data-a="sqgo">See my ${q.mode==='new'?'stack':'suggestions'}</button><button class="cta ghost" data-a="close">Cancel</button>`)}
  else{const R=sqRecommend(q.a);const n=Object.keys(q.sel).filter(k=>q.sel[k]).length;
    openSheet(`<h4 class="disp">${q.mode==='new'?'Your new stack':'Suggestions for your stack'}</h4><p class="muted" style="font-size:14px;margin:0 0 6px">Tap to tick or untick. ${q.mode==='new'?'Saving replaces your current list (you can undo).':'Ticked items are added to your current list.'}</p>
    ${sqResultsHTML(R,q.a,q.sel,q.mode)}<button class="cta" style="--c:var(--cardio)" data-a="sqsave" ${n?'':'disabled'}>${q.mode==='new'?`Save as my stack (${n})`:`Add ${n} to my stack`}</button><button class="cta ghost" data-a="sqback">Change answers</button>`)}
  if(keep)setTimeout(()=>{pn.scrollTop=keep},0);
}
function sqSave(){
  const q=UI.sq,R=sqRecommend(q.a),all=[...R.list,...R.more],pick=all.filter(x=>q.sel[x.id]);if(!pick.length)return;
  S.suppQ=clone(q.a);const prev=clone(S.supps);
  if(q.mode==='new'){S.supps=pick.map(sqToSupp)}
  else{const cur=new Set(S.supps.map(s=>{const i=suppInfo(s.n);return i?i.id:null}));pick.filter(x=>!cur.has(x.id)).forEach((x,i)=>S.supps.push(sqToSupp(x,S.supps.length+i)))}
  save();closeSheet();UI.sq=null;rerender();toast(q.mode==='new'?'New stack saved: '+pick.length+' supplements':'Added '+pick.length+' to your stack',()=>{S.supps=prev});
}
/* ---------- SUPPLEMENTS TAB ---------- */
const SLOTS=['Morning','Pre-workout','Post-workout','With meals','Evening'];
function sTaken(id,d){return!!(S.suppLog[d]&&S.suppLog[d][id])}
function sStreak(id){let t=todayS(),n=0;if(!sTaken(id,t))t=addD(t,-1);while(sTaken(id,t)&&n<1000){n++;t=addD(t,-1)}return n}
function sBest(id){let best=0,cur=0;const t=todayS();for(let i=400;i>=0;i--){if(sTaken(id,addD(t,-i))){cur++;best=Math.max(best,cur)}else cur=0}return best}
function s30(id){let n=0;const t=todayS();for(let i=0;i<30;i++)if(sTaken(id,addD(t,-i)))n++;return n}
function renderSupps(){
  UI.sm=UI.sm||{};const v=document.getElementById('view'),t=todayS();if(!UI.sday||UI.sday>t)UI.sday=t;const d=UI.sday,lg=S.suppLog[d]||{};
  const taken=S.supps.filter(s=>lg[s.id]).length,isT=d===t;
  let h=`<div class="phead"><h2 class="pagetitle disp">Supplements</h2><button class="addbtn" style="--c:var(--cardio)" data-a="addsupp">${IC.plus}Add</button></div>
  <button class="obopt" style="margin:0 0 12px" data-a="sqopen"><b>${IC.spark} Build or improve my stack</b><span>Answer a few questions about goals, issues, diet and medicines</span></button>
  <div class="sdaynav"><button class="mini" data-a="sday" data-v="-1" aria-label="Previous day">‹</button><label class="sdate"><b>${isT?'Today':nice(d)}</b><span>${isT?nice(d):'Tap to pick another day'}</span><input type="date" data-in="sday" value="${d}" max="${t}" aria-label="Pick a day"></label><button class="mini" data-a="sday" data-v="1" ${isT?'disabled':''} aria-label="Next day">›</button></div>
  ${isT?'':`<div class="demo-banner"><span>Editing a past day. Tick what you took on ${nice(d)}.</span><button class="mini" data-a="stoday">Today</button></div>`}
  <div class="card"><div class="ringwrap">${ring(S.supps.length?taken/S.supps.length:0,COLORS.cardio,88,10,taken+'/'+S.supps.length)}<div><div class="disp" style="font-size:30px">${taken===S.supps.length&&taken?(isT?'All taken today':'All taken'):(isT?'Today\u2019s stack':'Stack for '+short(d))}</div><div class="muted" style="font-size:14px">${suppStreak()?suppStreak()+'-day streak with everything taken':'Take all of them to start a streak'}</div></div></div></div>
  <p class="tapnote">Tap a supplement to see its calendar, benefits and best time to take it.</p>`;
  SLOTS.forEach(sl=>{const list=S.supps.filter(s=>s.slot===sl);if(!list.length)return;h+=`<div class="slot">${sl}</div>`;
    list.forEach(s=>{const on=!!lg[s.id],open=UI.sx===s.id,info=suppInfo(s.n);let dots='';for(let i=13;i>=0;i--){const dd=addD(t,-i);dots+=`<i class="${sTaken(s.id,dd)?'on':''} ${dd===d?'sel':''}"></i>`}
      h+=`<div class="suppw ${open?'open':''}" style="--c:${s.c}"><div class="supp"><span class="dot"></span><div class="mi" data-a="sopen" data-k="${s.id}" role="button" aria-expanded="${open}"><b>${esc(s.n)} <span class="pill" style="--c:${s.c}">${esc(s.d)}</span></b><span>${esc(s.note||(info?info.w:''))}</span><div class="dots" title="Last 14 days">${dots}</div></div><button class="editbtn" data-a="suppopen" data-k="${s.id}" aria-label="Edit or remove ${esc(s.n)}">${IC.pen}</button><button class="tick ${on?'on':''}" data-a="supp" data-k="${s.id}" aria-label="Took ${esc(s.n)} on ${short(d)}">${IC.check}</button></div>`;
      if(open){
        const mk=UI.sm[s.id]||t.slice(0,7);const[y,mo]=mk.split('-').map(Number);const dim=new Date(y,mo,0).getDate(),first=new Date(y,mo-1,1).getDay();
        let doneM=0,elig=0,cells=DS.map(x=>`<div class="dh" style="font-size:11px;text-align:center;color:var(--mu);font-weight:700">${x[0]}</div>`).join('');for(let i=0;i<first;i++)cells+='<button class="hday blank" tabindex="-1"></button>';
        for(let i=1;i<=dim;i++){const dd=ds(new Date(y,mo-1,i));if(dd<=t){elig++;if(sTaken(s.id,dd))doneM++}cells+=`<button class="hday num ${sTaken(s.id,dd)?'on':''} ${dd>t?'fut':''} ${dd===t?'today':''}" data-a="sdaytoggle" data-k="${s.id}" data-d="${dd}">${i}</button>`}
        h+=`<div class="sbody"><div class="kv" style="grid-template-columns:repeat(3,1fr);margin-top:0"><div><b class="disp num">${sStreak(s.id)}</b><span>Day streak</span></div><div><b class="disp num">${sBest(s.id)}</b><span>Best streak</span></div><div><b class="disp num">${s30(s.id)}/30</b><span>Last 30 days</span></div></div>
        <div class="mnav"><button class="mini" data-a="sm" data-k="${s.id}" data-v="-1">‹</button><b>${MN[mo-1]} ${y}, ${doneM} of ${elig} days</b><button class="mini" data-a="sm" data-k="${s.id}" data-v="1">›</button></div><div class="hcal">${cells}</div>
        <div class="pnote">Tap any past day to mark it taken or not taken.</div>
        ${info?`<h5 class="sih">About ${esc(info.n)}</h5>${suppInfoHTML(info,s.c)}`:`<div class="pnote">No guide entry for this one yet. Name it like a common supplement (e.g. "Magnesium glycinate") to see its benefits and timing.</div>`}</div>`;
      }
      h+=`</div>`})});
  if(!S.supps.length)h+=`<div class="card"><p style="margin:0">No supplements in your list. Tap <b>Add</b> or browse the guide.</p></div>`;
  h+=`<div class="grid2" style="margin-top:12px"><button class="cta" style="--c:var(--cardio);margin:0" data-a="addsupp">${IC.plus} Add</button><button class="cta ghost" style="margin:0" data-a="sguide">${IC.book} Supplement guide</button></div><button class="cta" style="--c:var(--ink);color:var(--bg)" data-a="sqopen">${IC.spark} Build or improve my stack</button>
  <p class="muted" style="font-size:13px;margin-top:14px">Doses and timings are general guidance for healthy adults, not medical advice. Check with your doctor before starting anything new, especially if you take medication.</p>`;
  v.innerHTML=h;
}
function suppStreak(){let t=todayS(),n=0;const full=d=>S.supps.length&&S.supps.every(s=>S.suppLog[d]&&S.suppLog[d][s.id]);if(!full(t))t=addD(t,-1);while(full(t)&&n<1000){n++;t=addD(t,-1)}return n}
function guideSheet(q){
  q=(q||'').toLowerCase().trim();const list=SUPP_DB.filter(e=>!q||e.n.toLowerCase().includes(q)||e.a.some(a=>a.includes(q))).sort((a,b)=>a.n.localeCompare(b.n));
  const inStack=e=>S.supps.some(s=>suppInfo(s.n)===e);
  openSheet(`<h4 class="disp">Supplement guide</h4><p class="muted" style="font-size:14px;margin:0 0 8px">${SUPP_DB.length} common supplements with benefits, dose and best time. Tap one to read more and add it to your stack.</p>
  <input type="text" id="gq" data-in="gq" placeholder="Search, e.g. magnesium" value="${esc(q)}" autocomplete="off">
  <div id="glist">${list.map(e=>`<details class="gitem"><summary><b>${esc(e.n)}</b><span>${esc(e.d)}</span>${inStack(e)?'<em>In your stack</em>':''}</summary>${suppInfoHTML(e)}${inStack(e)?'':`<button class="cta" style="--c:var(--cardio);margin-top:8px" data-a="gadd" data-v="${e.id}">${IC.plus} Add to my stack</button>`}</details>`).join('')||'<p class="muted">No match. Try another name.</p>'}</div>
  <button class="cta ghost" data-a="close">Close</button>`);
}
function suppSheet(id,pre){
  const x=id?S.supps.find(q=>q.id===id):(pre?{n:pre.n,d:pre.d,slot:pre.s,note:'',c:HAB_COLORS[S.supps.length%HAB_COLORS.length]}:{n:'',d:'',slot:'Morning',note:'',c:HAB_COLORS[S.supps.length%HAB_COLORS.length]});UI.sdraft={c:x.c,isNew:!id};
  const info=suppInfo(x.n);
  openSheet(`<h4 class="disp">${id?'Edit supplement':'Add supplement'}</h4>
  <label class="fl2" for="sn">Name</label><input type="text" id="sn" data-in="sname" list="sdb" placeholder="Start typing, e.g. Magnesium" maxlength="40" value="${esc(x.n)}" autocomplete="off"><datalist id="sdb">${SUPP_DB.map(e=>`<option value="${esc(e.n)}">`).join('')}</datalist>
  <div id="sinfo">${info?`<div class="sinfohead">ℹ️ Recognised: <b>${esc(info.n)}</b></div>${suppInfoHTML(info)}`:''}</div>
  <label class="fl2" for="sd">Your dose</label><input type="text" id="sd" placeholder="${info?esc(info.d):'e.g. 2,000 IU'}" maxlength="40" value="${esc(x.d)}">
  <label class="fl2" for="ss">When</label><select id="ss">${SLOTS.map(sl=>`<option ${sl===x.slot?'selected':''}>${sl}</option>`).join('')}</select>
  <label class="fl2" for="snote">Note (optional)</label><input type="text" id="snote" placeholder="${info?esc(info.w):'e.g. With breakfast'}" maxlength="90" value="${esc(x.note)}">
  <span class="fl2">Colour</span><div class="swatches">${HAB_COLORS.map(c=>`<button class="sw ${c===x.c?'on':''}" style="--c:${c}" data-a="scol" data-v="${c}" aria-label="Colour"></button>`).join('')}</div>
  <button class="cta" style="--c:var(--cardio)" data-a="suppsave" data-k="${id||''}">${id?'Save changes':'Add supplement'}</button>
  ${id?`<button class="dangerbtn" data-a="delsupp" data-k="${id}">Remove ${esc(x.n)}</button>`:''}`);
}
function suppNameInput(el){
  const info=suppInfo(el.value),box=document.getElementById('sinfo');if(!box)return;
  box.innerHTML=info?`<div class="sinfohead">ℹ️ Recognised: <b>${esc(info.n)}</b></div>${suppInfoHTML(info)}`:'';
  const sd=document.getElementById('sd'),ss=document.getElementById('ss'),sn=document.getElementById('snote');
  sd.placeholder=info?info.d:'e.g. 2,000 IU';sn.placeholder=info?info.w:'e.g. With breakfast';
  if(info&&UI.sdraft&&UI.sdraft.isNew&&UI.sdraft.lastInfo!==info.id){ss.value=info.s;UI.sdraft.lastInfo=info.id}
}

/* ---------- HABITS ---------- */
const LINKS={
  sleep:{l:'Sleep duration',u:'hours',op:'≥',def:7,short:'sleep'},
  sleepPerf:{l:'Sleep performance',u:'%',op:'≥',def:85,short:'sleep score'},
  rec:{l:'Recovery',u:'%',op:'≥',def:67,short:'recovery'},
  hrv:{l:'HRV',u:'ms',op:'≥',def:60,short:'HRV'},
  rhr:{l:'Resting heart rate',u:'bpm',op:'≤',def:60,short:'resting HR'},
  steps:{l:'Steps',u:'steps',op:'≥',def:8000,short:'steps'},
  strain:{l:'Strain',u:'',op:'≥',def:10,short:'strain'},
  kcal:{l:'Calories burned',u:'kcal',op:'≥',def:2500,short:'calories'}
};
function realVal(key,d){const x=(S.wdata||{})[d];if(!x||!MET[key])return null;try{const v=MET[key].g(x);return v==null||isNaN(v)?null:+v}catch(e){return null}}
function habById(id){return S.habits.find(h=>h.id===id)}
function habAuto(h,d){if(!h||!h.link||!LINKS[h.link.k])return null;const v=realVal(h.link.k,d);if(v==null)return null;return LINKS[h.link.k].op==='≤'?v<=h.link.t:v>=h.link.t}
function habDone(id,d){const h=habById(id);if(h&&h.link){const ov=S.habOv&&S.habOv[id]&&S.habOv[id][d];if(ov!=null)return ov===1;const a=habAuto(h,d);if(a!==null)return a}return!!(S.habitLog[id]&&S.habitLog[id][d])}
function habToggle(id,d){const h=habById(id);if(!h)return;const cur=habDone(id,d);
  if(h.link){const a=habAuto(h,d);if(a!==null){S.habOv[id]=S.habOv[id]||{};if(!cur===a)delete S.habOv[id][d];else S.habOv[id][d]=cur?0:1;return}}
  S.habitLog[id]=S.habitLog[id]||{};if(S.habitLog[id][d])delete S.habitLog[id][d];else S.habitLog[id][d]=1}
function habStreak(id){let t=todayS(),n=0;if(!habDone(id,t))t=addD(t,-1);while(habDone(id,t)&&n<1000){n++;t=addD(t,-1)}return n}
function habBest(id){let best=0,cur=0;const t=todayS();for(let i=400;i>=0;i--){if(habDone(id,addD(t,-i))){cur++;best=Math.max(best,cur)}else cur=0}return best}
function linkText(h){const L=LINKS[h.link.k];return`${L.l} ${L.op} ${h.link.k==='sleep'?hm(h.link.t):h.link.t.toLocaleString()+(L.u&&L.u!=='steps'?' '+L.u:'')}`}
function guessLink(name){let m=name.match(/sleep[^\d]*(\d+(?:[.,]\d+)?)\s*(?:h|hr|hrs|hour|hours)\b/i)||name.match(/(\d+(?:[.,]\d+)?)\s*\+?\s*(?:h|hr|hrs|hours?)\b[^\d]*sleep/i);
  if(m){const t=parseFloat(m[1].replace(',','.'));if(t>=3&&t<=12)return{k:'sleep',t}}
  m=name.match(/(\d[\d,.]*)\s*\+?\s*steps?\b/i)||name.match(/steps?[^\d]*(\d[\d,.]*)/i);
  if(m){const t=parseInt(m[1].replace(/[,.]/g,''),10);if(t>=1000&&t<=60000)return{k:'steps',t}}
  return null}
function autoLinkHabits(){let n=0;(S.habits||[]).forEach(h=>{if(h.link||h.noAuto)return;const g=guessLink(h.n);if(g){h.link=g;n++}});if(n)save();return n}
function renderHabits(){
  const v=document.getElementById('view'),t=todayS();
  let h=`<div class="phead"><h2 class="pagetitle disp">Habits</h2><button class="addbtn" style="--c:var(--long)" data-a="habadd">${IC.plus}Add</button></div><p class="sub">Tap a chip to check off today. Open a habit to fill in its calendar. Tap the pencil to edit or remove.</p>`;
  h+=`<div class="todayrow">${S.habits.map(x=>`<button class="tchip ${habDone(x.id,t)?'on':''}" style="--c:${x.c}" data-a="habtoday" data-k="${x.id}"><span>${x.e}</span>${esc(x.n)}</button>`).join('')}</div>`;
  if(!S.habits.length)h+=`<div class="card"><p style="margin:0">No habits yet. Tap <b>Add</b> to create your first one.</p></div>`;
  S.habits.forEach(x=>{
    const mk=UI.hm[x.id]||t.slice(0,7);const[y,mo]=mk.split('-').map(Number);const dim=new Date(y,mo,0).getDate();const first=new Date(y,mo-1,1).getDay();
    let doneM=0,elig=0;for(let i=1;i<=dim;i++){const d=ds(new Date(y,mo-1,i));if(d<=t){elig++;if(habDone(x.id,d))doneM++}}
    const p=elig?doneM/elig:0,open=UI.hx===x.id;
    let strip='';for(let i=27;i>=0;i--){const d=addD(t,-i);strip+=`<i class="${habDone(x.id,d)?'on':''}"></i>`}
    h+=`<div class="hab" style="--c:${x.c}"><div class="habh" data-a="habopen" data-k="${x.id}" style="cursor:pointer"><span class="emo">${x.e}</span><div class="mi"><b>${esc(x.n)}</b><div class="hstat"><span><b>${habStreak(x.id)}</b> day streak</span><span>Best <b>${habBest(x.id)}</b></span></div>${x.link?`<div class="linkbadge">${IC.link} WHOOP · ${esc(linkText(x))}${S.whoop.connected?'':' · connect WHOOP'}</div>`:''}</div>${ring(p,x.c,52,7,Math.round(p*100)+'%')}<button class="editbtn" data-a="habedit" data-k="${x.id}" aria-label="Edit or remove ${esc(x.n)}">${IC.pen}</button></div>
    <div class="dots" style="grid-template-columns:repeat(28,1fr);margin-top:10px" title="Last 28 days">${strip}</div>`;
    if(open){
      let cells=DS.map(dd=>`<div class="dh" style="font-size:11px;text-align:center;color:var(--mu);font-weight:700">${dd[0]}</div>`).join('');for(let i=0;i<first;i++)cells+='<button class="hday blank" tabindex="-1"></button>';
      for(let i=1;i<=dim;i++){const d=ds(new Date(y,mo-1,i));cells+=`<button class="hday num ${habDone(x.id,d)?'on':''} ${x.link&&habAuto(x,d)!==null&&!(S.habOv[x.id]&&S.habOv[x.id][d]!=null)?'auto':''} ${d>t?'fut':''} ${d===t?'today':''}" data-a="habday" data-k="${x.id}" data-d="${d}">${i}</button>`}
      h+=`<div class="mnav"><button class="mini" data-a="habm" data-k="${x.id}" data-v="-1">‹</button><b>${MN[mo-1]} ${y}, ${doneM} of ${elig} days</b><button class="mini" data-a="habm" data-k="${x.id}" data-v="1">›</button></div><div class="hcal">${cells}</div>
      ${x.link?`<div class="pnote">Days marked with a dot are filled in by WHOOP. Tap a day to override it, tap again to go back to WHOOP.</div>`:''}<div style="display:flex;gap:8px;margin-top:12px"><button class="mini" data-a="habedit" data-k="${x.id}">${x.link?'Edit or unlink':'Edit or link to WHOOP'}</button><button class="mini" data-a="habdel" data-k="${x.id}" style="color:var(--bad)">Delete habit</button></div>`;
    }
    h+=`</div>`;
  });
  h+=`<button class="cta" style="--c:var(--long)" data-a="habadd">${IC.plus} Add a habit</button>`;
  v.innerHTML=h;
}

/* ---------- YouTube demos (Shorts, max 3 min) ---------- */
const YT={incDB:'IyjIiR9-kBk',incMach:'-QRu-lMwh4k',floorPress:'urTyTno9Smg',machChest:'GuF3K9ucHwI',cFly:'I-Ue34qLxc4',pushup:'-m9buxRuWEc',flatDBng:'bI_Epalp0CE',csRow:'2ByilQ4NaAs',sealRow:'Mlr-Lx-10HQ',machRow:'p88Y69wWQz0',saCableRow:'9ijk2n9EaKI',lmPress:'eHWRq0cyS8o',saDBPress:'KLSYjgShghk',machShoulder:'EOYiFvQRM-s',ngPulldown:'jP7iqNMX2qI',assistPull:'Nqy1rtyVH2o',saPulldown:'jcRYJHr38ng',straightArm:'lnec6DdscJU',cLat:'1AmmsXlf8MU',dbLat:'JIhbYYA1Q90',machLat:'qbTP3OVRHrk',facePull:'JMT2zN8lqfk',revPec:'jdlCPm6cEeo',cRearFly:'bkejPHrPkmA',proneT:'VPNR0PYG8AM',proneY:'VPNR0PYG8AM',yRaise:'HQzrqhHXVjE',sideER:'xXuBlRT-7YY',cableER:'7DqYesMRkzU',bandER:'7DqYesMRkzU',ropePush:'7OF77JMEXhM',vbarPush:'4s8Fdhnk6aI',kickback:'6fk6cqGjksg',crossExt:'LyNR8P3iqUM',hammer:'NyW2fT2gQhM',ropeHammer:'0WUec04jglI',crossHammer:'5z4PyEHiWAQ',preacherM:'dnJ1vNlhzHY',cableCurl:'M6ivj5Bdvs8',dbCurl:'0OA-DqdTyZA',
trapDL:'v-SrIcAp3vM',gobletBox:'RC9KisnOpXM',beltSquat:'hy9h2IsXfnA',rfess:'FUvLMZJMGak',splitSq:'58wUUPMmCKA',revLunge:'ufjvjxrGyFM',seatHam:'lcW1M2VKNYc',lyingHam:'HQyWDIE_ILU',ballCurl:'YyDkAtdyu1Q',legPress:'6OApLJdHjps',hackSq:'udzewuz-BQY',standCalf:'B30JglFGx8Y',smithCalf:'ZckHjgIr3Y8',slCalf:'COQjDv1wxPs',seatCalf:'NrHJPauB01I',hipAbd:'Z6Aq5upUp4A',cableAbd:'Z6Aq5upUp4A',bandWalk:'6h3TVFPTSQo',tibRaise:'h57xceuiO40',heelWalk:'h57xceuiO40',hipThrust:'-1cAnwFNBLg',machThrust:'-1cAnwFNBLg',dbBridge:'OjJnGGYW21A',dbRDL:'vnEANU7BqqY',pullThrough:'v_L0e-SntSU',slRDL:'MeV_WFmvBCU',stepUp:'sh2imOUYhQ4',legExt:'-PiO10ilRYc',spanishSq:'YMfoUOxLWHM',tke:'8Et2kaositM',backExt45:'LJk_rYNMHHQ',adductM:'iPLvw74e7Tk',copen:'b5wAggnoT-4',cableAdd:'iPLvw74e7Tk',
deadBug:'XcYtWYMz39w',birdDog:'MCkb_SwmSh0',sidePlank:'V2cUr7zG4hw',sidePlankK:'HyAct6eyrvg',pallof:'P1H4IzD9rbQ',pallofHold:'P1H4IzD9rbQ',mcgill:'9q0FkXGEfEM',plank:'jyrUwDGPLhM',bearHold:'6ZmgkfwzH7I',suitcase:'0onP1O_pYtY',farmer:'8RXTKE06mKc',
catCamel:'3fZJd2Bgk-o',openBook:'1mMGw3rhf2M',thread:'6hxBYmC9J-0',crossBody:'ua8bGgPurQY',sleeper:'LjJvzfumcSw',wallSlide:'Dw4xroi0Dzw',bandPA:'qi2y-eI_kuI',wristEcc:'ap9jSCn-Res',flexbar:'tWK4T3dLfcs',hipFlexPPT:'FmBd017WLrc',couch:'LmLSAeJ3aQQ',kneeWall:'KAAVKi3v700',slantCalf:'7jOwuwNk8OM',mckenzie:'OBSwUk5SQz4',hip9090:'CVVg8haOYlQ',adductRock:'BdfcadBYq4c',tkeMob:'8Et2kaositM',bridgePPT:'OjJnGGYW21A',slBalance:'yBwEjCIy83c',worldGreatest:'qYBrq4A0LqI',childPose:'vBXalrQd92c',
tempoSquat:'QHjGxgi7axo',squatChair:'RC9KisnOpXM',wallSit:'mDdLC-yKudY',inclinePU:'AGUJQSUceu8',kneePU:'-m9buxRuWEc',closePU:'AGUJQSUceu8',doorRow:'2AihGMH9CNA',towelRow:'2AihGMH9CNA',proneYTW:'9tMFPCXwc0A',towelCurl:'jrZUJ7Sedyo',doorCurl:'DCtBo-odSyo',bwRevLunge:'ufjvjxrGyFM',bwSplit:'58wUUPMmCKA',chairStep:'sh2imOUYhQ4',skater:'6FscHoEllmE',bwSLRDL:'MeV_WFmvBCU',slBridge:'2sg3vqnE8qE',bedThrust:'-1cAnwFNBLg',bridgeMarch:'_VPcIP3usHQ',latLunge:'MiT4XDp168I',lungeKnee:'OmbfXLkrUGc',bearCrawl:'UYfxZdd6ztE',slCalfBW:'COQjDv1wxPs',wristStretch:'nkgUZrzd2KA',bikeWU:'w73jj7Vg-00',marchWU:'75xNWCulsZM',scapPU:'N6jNuXZJn9s',bbSquat:'6LnALQ338Ws',bbDeadlift:'8np3vKDBJfc',bbBench:'0cXAp6WhSj4',bbIncline:'0UT1ZU39lPc',dbBench:'jAD1Nsuq3lM',ohp:'4LBVP2Oe7fg',pullup:'ZPG8OsHKXLw',dbOHP:'k6tzKisR3NY',bandPress:'Nm4PNUjDnpQ',
frontSquat:'6PLvU0rjw18',smithSquat:'jPrzu4kp47o',gobletSq:'JO7D6GJ98wY',boxPistol:'KCtVYpSJH4M',sumoDL:'HBmLwb9IcaI',bbRDL:'2SHsk9AzdjA',goodMorning:'nWyx81AfTos',kbSwing:'bDCeXbMJVNs',kbDeadlift:'LDfnyt0Rmaw',rackPull:'Y99s0dNWpUw',smithIncline:'VXaBbUYMfIs',dips:'yN6Q1UI_xkE',pecDeck:'JYmszQs-mRs',dbFly:'eozdVDA78K0',lowCableFly:'KFl3Re5UbPo',arnold:'Z1c-W4svy-k',pikePU:'XckEEwa1BPI',chinup:'53kV7Ou7oZo',wideLat:'7JnP8dFbS14',bbRow:'ZtTwgJTBjOQ',dbRow:'PgpQ4-jHiq4',cableRow:'cAeBmvpt31A',invRow:'VO-pt_XgFho',tbarRow:'hYo72r8Ivso',meadowsRow:'G-jU1aPVhnY',dbShrug:'xiLT85G_GuU',bbCurl:'QZEqB6wUPxQ',ezCurl:'rL_5SVxXRm4',concCurl:'oPGBZHIxusU',inclineCurl:'rAx_tf13V5k',spiderCurl:'9Dd8iiEUs_Q',skull:'GaK2da6B2zM',cgBench:'DzA2xZhDGeo',ohDbExt:'a9oPnZReIRE',benchDip:'WVeZDBhZwLA',diamondPU:'K8bKxVcwjrk',walkLunge:'I34ysEkPK7w',fwdLunge:'B7VQJiVv3xw',cossack:'-_KSdnxa1nE',latStepDown:'AQ1kCW6DOKM',nordic:'_e9vFU9-tkc',gluteKick:'VSgMyiOu0uE',slHipThrust:'kpkg8r7dex4',clamshell:'hQupQ9mJZFw',sideLyingAbd:'bGtZQovM--Q',legPressCalf:'dhRz1Ns60Zg',hangLegRaise:'Nw0LOKe3_l8',abWheel:'trOxwfSlFFo',cableCrunch:'0KEP6A1deBE',woodchop:'PCQCwP1Xy0g',hollow:'0yPin8hSc8o',shoulderTap:'NV55raYCP0E',revCrunch:'XY8KzdDcMFg',legRaise:'SuIxXbKnwx4',mtnClimber:'re3dtmzGCOc',sledPush:'1PmO6kzBEc8',battleRopes:'CzxBf5jM3M4',burpee:'wGvBfVeCNko',jumpRope:'FJmRQ5iTXKE',boxJump:'3INzGHuk23U',frontRaise:'zkP0MsTcIVU',rearDbFly:'GyhFsjrn7dw',deadHang:'jBZCzK9zlxk',bandFacePull:'PYj77in44ms',bandRow:'LSkyinhmA8k',bandOHP:'956rqQ8PgH0',bandCurl:'RyWX9e7imhc',bandPushdown:'qjPN6ElNqpc',bandPullDown:'o5bXFrdw5iI',hipThrustBand:'4oRkPYWV0B8',rowErg:'Hw4pt9oXu_o',smithBench:'7FyJdsXeta8',cableCross:'hhruLxo9yZU',uprightRow:'4MvmUEHKtH8',pendlayRow:'V7Fyg9x1Kbo',bbShrug:'larn3Asl6oM',revCurl:'e0Mu2jC4nRk',dbPreacher:'lLmYH1bOIz4',cableOHExt:'AUsSlsBu5eg',dbSkull:'jO2Jl9eZpXk',gluteBridge:'cvKZXsz-QIA',standLegCurl:'CZVTv9T_Ml8',sissySq:'30_K-UpUerk',singleLegPress:'PXQGlgQJwUw',donkeyCalf:'wuI4jjPS6vg',kbPress:'X-uFqWtjpGI',kbRow:'ApvGZS9IIkM',tgu:'9wgMg4UULSY',medBallSlam:'CkO1mfSBvv4',jumpSquat:'ZxFJi9vRx4s',assaultBike:'0kzhFdDUUs0',skiErg:'WLzR1XaeaCI',russianTwist:'DF0sPfwys_g',bicycleCrunch:'VaL7XWK3MVE',vUp:'iP2fjvG0g3w',landmineRot:'HaJSDdWwb9s',declinePU:'SKPab2YC8BE',archerPU:'jiA3RnMxFU0',airSquat:'ZLJBfYF_oO0',ghr:'TzowfEB3NqI',revHyper:'Pqigpd54aL8',sumoDbSq:'ERZyI58nDas',curtsy:'6GCLb9JurOU',dbPullover:'Ydpy886udzo',machDip:'pMarNxAvHPc',zottman:'HkCxX3mQlVg',declineBench:'iVh4B5bJ5OI',stairClimber:'6eMPlQ95gXI',broadJump:'x9qlFXfQaZU',sledPull:'NaQt6IYoAgw',kbGoblet:'MWHIs0zxkCU'};
function parseYT(u){u=String(u||'').trim();const m=u.match(/(?:youtu\.be\/|[?&]v=|shorts\/|embed\/|live\/)([A-Za-z0-9_-]{11})/);if(m)return m[1];return /^[A-Za-z0-9_-]{11}$/.test(u)?u:null}
function ytId(ex){if(S.vids&&S.vids[ex]){const id=parseYT(S.vids[ex]);if(id)return id}if(ex==='rampUp'){const b=blocksFor(UI.date);return b.length?ytId(b[0].items[0].ex):null}return YT[ex]||null}
function thumb(ex,c){const id=ytId(ex);if(!id)return'';return`<button class="thumb" style="--c:${c}" data-a="demo" data-e="${ex}" aria-label="Play ${esc(E[ex].n)} video"><img src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt="" loading="lazy"><i>${IC.play}</i></button>`}
function playerColor(){const k=tplOf(UI.date);return k?KCOLOR(T[k].k):COLORS.upper}
function openPlayer(ex){UI.pl={ex};drawPlayer()}
function drawPlayer(){
  const ex=UI.pl.ex,e=E[ex],id=ytId(ex),c=playerColor();
  openSheet(`<h4 class="disp">${esc(e.n)}</h4>
  <div class="stage vid">${id?`<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&playsinline=1&rel=0&modestbranding=1" title="${esc(e.n)} demo" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`:`<p style="padding:24px;color:#fff">No video saved for this move yet. <a style="color:#fff;text-decoration:underline" href="${esc(vidUrl(ex))}" target="_blank" rel="noopener">Find one on YouTube</a>, then tap “Use a different video” below and paste its link.</p>`}</div>
  <div class="cue" style="margin-top:10px;font-size:15px">${esc(cueOf(e))}${sideNote(e,1)}</div>${e.p?`<span class="chipinj" style="--c:${c}">Protects: ${esc(protOf(e))}</span>`:''}
  <div class="pctl" style="--c:${c};margin-top:12px"><button data-a="vidchange" data-e="${ex}">Use a different video</button>${S.vids[ex]?`<button data-a="vidreset" data-e="${ex}">Back to default</button>`:''}</div>
  ${id?`<div class="pnote">If this video won't play here, <a href="https://www.youtube.com/shorts/${id}" target="_blank" rel="noopener">open it on YouTube</a>.</div>`:''}
  <button class="cta ghost" data-a="close">Close</button>`);
}

/* ---------- sheets ---------- */
function resetPanelDrag(){const pn=document.getElementById('panel'),sc=document.querySelector('#sheet .scrim');pn.style.transition='';pn.style.transform='';if(sc){sc.style.transition='';sc.style.opacity=''}}
function openSheet(html){resetPanelDrag();const pn=document.getElementById('panel');pn.innerHTML='<div class="grab"></div>'+html;document.getElementById('sheet').classList.remove('hide');pn.scrollTop=0}
function closeSheet(){document.getElementById('sheet').classList.add('hide');UI.pl=null;if(UI.fx){UI.fx=null;setTimeout(rerender,0)}document.getElementById('panel').innerHTML='';resetPanelDrag()}
(function sheetDrag(){
  const sheet=document.getElementById('sheet'),pn=document.getElementById('panel'),sc=sheet.querySelector('.scrim');
  let sy=0,sx=0,lock=null,dy=0,mouse=false;
  const apply=d=>{dy=Math.max(0,d);pn.style.transition='none';pn.style.transform=`translateY(${dy}px)`;sc.style.transition='none';sc.style.opacity=String(Math.max(.15,1-dy/420))};
  const finish=()=>{if(lock!=='drag'){lock=null;return}lock=null;pn.style.transition='transform .22s cubic-bezier(.2,.8,.2,1)';sc.style.transition='opacity .22s';
    if(dy>Math.min(120,pn.clientHeight*.25)){pn.style.transform='translateY(105%)';sc.style.opacity='0';setTimeout(closeSheet,210)}else{pn.style.transform='';sc.style.opacity=''}dy=0};
  pn.addEventListener('touchstart',e=>{if(e.touches.length!==1){lock='scroll';return}sy=e.touches[0].clientY;sx=e.touches[0].clientX;lock=null;dy=0},{passive:true});
  pn.addEventListener('touchmove',e=>{if(e.touches.length!==1)return;const t=e.touches[0],ddy=t.clientY-sy,ddx=t.clientX-sx;
    if(lock===null){if(Math.abs(ddy)<8&&Math.abs(ddx)<8)return;lock=(ddy>0&&Math.abs(ddy)>Math.abs(ddx)*1.2&&pn.scrollTop<=0)?'drag':'scroll'}
    if(lock!=='drag')return;if(e.cancelable)e.preventDefault();apply(ddy-8)},{passive:false});
  pn.addEventListener('touchend',finish,{passive:true});pn.addEventListener('touchcancel',finish,{passive:true});
  pn.addEventListener('pointerdown',e=>{if(e.pointerType!=='mouse'||!e.target.closest('.grab'))return;mouse=true;sy=e.clientY;lock='drag';dy=0;try{pn.setPointerCapture(e.pointerId)}catch(_){}});
  pn.addEventListener('pointermove',e=>{if(mouse&&lock==='drag')apply(e.clientY-sy)});
  const up=()=>{if(mouse){mouse=false;finish()}};pn.addEventListener('pointerup',up);pn.addEventListener('pointercancel',up);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!sheet.classList.contains('hide'))closeSheet()});
})();
function toast(msg,undo){const el=document.getElementById('toast');el.innerHTML=esc(msg)+(undo?'<button data-a="toastundo">Undo</button>':'');el.classList.remove('hide');UI.undo=undo||null;clearTimeout(UI.tt);UI.tt=setTimeout(()=>el.classList.add('hide'),undo?5000:2200)}

/* replacement options: hand-picked first, then the same movement pattern, then close patterns. Always at least 5. */
const PAT_NEAR={hpush:['fly','vpush','tri'],fly:['hpush'],vpush:['lat','hpush'],lat:['vpush','rear'],hpull:['vpull','rear'],vpull:['hpull','lat'],rear:['cuff','hpull'],cuff:['rear','lat'],tri:['hpush','vpush'],bi:['hpull','vpull'],
  squat:['lunge','quad'],lunge:['squat','glute'],quad:['squat','lunge'],hinge:['ham','glute'],ham:['hinge','glute'],glute:['hinge','ham'],calf:['tib','quad'],tib:['calf'],abd:['add','glute'],add:['abd','lunge'],
  shrug:['carry','rear'],carry:['shrug','coreLat'],coreAE:['coreFlex','coreAR'],coreFlex:['coreAE','coreAR'],coreAR:['coreLat','coreAE'],coreLat:['coreAR','carry'],cardio:['power'],power:['cardio','squat']};
const WU_DRILLS=['bikeWU','marchWU','scapPU','bandPA','bandER','catCamel','worldGreatest','openBook','hip9090','wallSlide'];
function altsFor(slot,base,cur){
  const MIN=5,MAX=8,out=[];const add=x=>{if(x&&E[x]&&x!==cur&&x!=='rampUp'&&!out.includes(x))out.push(x)};
  add(base);(E[base].a||[]).forEach(add);
  const mb=META[base];
  if(mb){
    const a=S.prof&&S.prof.ans,eqs=a?eqList(a.equip):null,inj=new Set((a&&a.inj)||[]);
    const score=id=>{const m=META[id];return(eqs&&!eqs.includes(m.eq)?4:0)+(m.av.some(j=>inj.has(j))?3:0)+Math.abs(m.lvl-mb.lvl)+(YT[id]?0:1)+(m.eq===mb.eq?-.5:0)+(!!E[id].t!==!!E[base].t?2:0)};
    const rank=pats=>Object.keys(META).filter(id=>E[id]&&pats.includes(META[id].pat)).sort((x,y)=>score(x)-score(y));
    for(const id of rank([mb.pat])){if(out.length>=MAX)break;add(id)}
    if(out.length<MIN)for(const id of rank(PAT_NEAR[mb.pat]||[])){if(out.length>=MIN)break;add(id)}
  }else{
    const groups=Object.values(MOBPOOL).filter(g=>g.includes(base)).flat();
    const all=[...new Set(Object.values(MOBPOOL).flat())];
    const pool=slot[0]==='w'?[...groups,...WU_DRILLS,...all]:[...groups,...all];
    for(const id of pool){if(out.length>=MIN)break;add(id)}
  }
  if(out.length<MIN)for(const id of Object.keys(META)){if(out.length>=MIN)break;add(id)}
  return out;
}
function swapSheet(slot,base){
  const d=UI.date,cur=exAt(d,slot,base);const alts=altsFor(slot,base,cur);
  const c=slot[0]==='m'?COLORS.mob:slot[0]==='c'?COLORS.core:KCOLOR(T[tplOf(d)].k);
  openSheet(`<h4 class="disp">Replace ${esc(E[cur].n)}</h4><p class="muted" style="font-size:14px;margin:0 0 6px">Pick one of these ${alts.length} alternatives that suits your joints and equipment. Choose whether it applies today only or every time this exercise appears. You can undo either.</p>
  ${alts.map(a=>`<div class="opt" style="--c:${c}"><b>${esc(E[a].n)}${a===base?' <span class="pill" style="--c:'+c+'">original</span>':''}</b><span>${esc(cueOf(E[a]))}</span>${E[a].p?`<div><span class="chipinj" style="--c:${c}">${esc(protOf(E[a]))}</span></div>`:''}<div class="row2"><button class="mini demo" style="flex:0 0 auto;--c:${c}" data-a="demo" data-e="${a}">${IC.play}</button><button data-a="doswap" data-k="${slot}" data-b="${base}" data-e="${a}" data-s="day">Today only</button><button class="p" data-a="doswap" data-k="${slot}" data-b="${base}" data-e="${a}" data-s="all">Every session</button></div></div>`).join('')}
  <button class="cta ghost" data-a="close">Cancel</button>`);
}
function moveSheet(){
  const d=UI.date,cur=tplOf(d),mode=(UI.mv&&UI.mv.mode)||'move',c=KCOLOR(T[cur].k);UI.mv={mode};
  const t0=todayS(),start=addD(t0,-2)<S.start?S.start:addD(t0,-2);let opts='';
  for(let i=0;i<16;i++){const x=addD(start,i);if(x===d||!inPlan(x))continue;const k=tplOf(x),nm=T[k].n;
    const sub=mode==='move'?(k==='rest'?`Rest day. ${short(d)} becomes the rest day.`:`${nm}. It moves to ${short(d)} (the two days swap).`):(k==='rest'?'Rest day. A copy is added here.':`${nm}. It is replaced by the copy (undo anytime).`);
    opts+=`<button class="opt" style="--c:${KCOLOR(T[k].k)};border-left:6px solid ${KCOLOR(T[k].k)}" data-a="dosched" data-d="${x}"><b>${nice(x)}${x===t0?' · today':''}</b><span>${sub}</span></button>`}
  const can=(S.hist||[]).length;
  openSheet(`<h4 class="disp">${mode==='move'?'Move':'Copy'} ${T[cur].n}</h4>
  <div class="pview"><button class="${mode==='move'?'on':''}" data-a="mvmode" data-v="move">Move</button><button class="${mode==='copy'?'on':''}" data-a="mvmode" data-v="copy">Copy</button></div>
  <p class="muted" style="font-size:14px;margin:8px 0 6px">${mode==='move'?`Pick the day to move <b>${T[cur].n}</b> to. ${nice(d)} is no longer used for it.`:`Pick a day to add a copy of <b>${T[cur].n}</b>. The original on ${short(d)} stays exactly as it is.`} For a different date use the picker below.</p>
  ${cur==='rest'&&mode==='copy'?'<div class="note">A rest day has nothing to copy. Switch to Move to swap it with a training day.</div>':opts}
  <label class="fl2" for="mvdate">Another date</label><input type="date" id="mvdate" data-in="mvdate" min="${S.start}" max="${S.end}" value="">
  ${can?`<button class="cta ghost" data-a="undosched">↶ Undo last change: ${esc(S.hist[can-1].label)}</button>`:''}
  <button class="cta ghost" data-a="close">Cancel</button>`);
}
/* =====================================================================
   CLOUD BACKUP AND SYNC
   Your whole log is saved to your Netlify site under a private sync code.
   Enter the same code on another phone to bring everything across;
   both devices then stay in step. Changes on two devices are merged day by day.
   ===================================================================== */
const SYNC_DICTS=['logs','done','rcheck','ready','moves','swaps','suppLog','habitLog','body','inbody','wdata','wwk','habOv','vids','clips','col'];
let SYNC_T=null,SYNC_BUSY=false;
function syncOn(){return!!(S.sync&&S.sync.on&&S.sync.key)}
function newSyncKey(){const a=new Uint8Array(32);crypto.getRandomValues(a);return Array.from(a).map(b=>b.toString(16).padStart(2,'0')).join('')}
const fmtCode=k=>k.match(/.{1,4}/g).join('-');
const cleanCode=c=>String(c||'').toLowerCase().replace(/[^a-f0-9]/g,'');
/* merge two copies: per-day maps are combined, newer copy wins on clashes and for everything else */
function mergeState(local,remote){
  const newer=(remote._u||0)>(local._u||0)?remote:local,older=newer===remote?local:remote;
  const out=Object.assign({},older,newer);
  SYNC_DICTS.forEach(k=>{if(older[k]||newer[k]){const o=older[k]||{},n=newer[k]||{};out[k]=Object.assign({},o,n);if(k==='logs'){Object.keys(o).forEach(d=>{if(n[d]&&o[d]){const m=Object.assign({},o[d],n[d]);out[k][d]=m}})}}});
  out._u=Math.max(local._u||0,remote._u||0);out.sync=local.sync;return out;
}
function syncSoon(){if(!syncOn()||!navigator.onLine)return;clearTimeout(SYNC_T);SYNC_T=setTimeout(()=>syncNow(false),4000)}
async function syncNow(manual){
  if(!syncOn()||SYNC_BUSY)return;SYNC_BUSY=true;const key=S.sync.key;
  try{
    const r=await fetch('/api/sync',{cache:'no-store',headers:{'x-iron-sync':key}});
    let remote=null;if(r.ok)remote=(await r.json());else if(r.status!==404)throw new Error('get '+r.status);
    let changed=false;
    if(remote&&remote.state&&(remote.updated||0)>(S.sync.last||0)){
      const merged=mergeState(S,remote.state);changed=JSON.stringify(merged)!==JSON.stringify(S);
      if(changed){Object.keys(S).forEach(k=>delete S[k]);Object.assign(S,defaults(),merged)}
    }
    const upd=Math.max(S._u||Date.now(),(remote&&remote.updated)||0);S._u=upd;
    const body=JSON.stringify({updated:upd,state:Object.assign({},S,{sync:{on:true,key}})});
    const p=await fetch('/api/sync',{method:'PUT',headers:{'Content-Type':'application/json','x-iron-sync':key},body});
    if(p.status===409&&!manual){SYNC_BUSY=false;return syncNow(true)}
    if(!p.ok)throw new Error('put '+p.status);
    S.sync.last=upd;S.sync.at=Date.now();S.sync.err=null;localStorage.setItem(KEY,JSON.stringify(S));
    if(changed){applyCustom&&applyCustom();rerender();if(manual)toast('Synced. Changes from your other device are in.')}else if(manual)toast('Backed up');
  }catch(e){S.sync.err=String(e&&e.message||e);try{localStorage.setItem(KEY,JSON.stringify(S))}catch(_){}if(manual)toast(location.protocol==='file:'?'Cloud backup works on your Netlify site':'Backup failed. It retries automatically.')}
  finally{SYNC_BUSY=false}
}
function syncTurnOn(){S.sync=Object.assign({on:true,key:S.sync&&S.sync.key||newSyncKey(),last:0},S.sync,{on:true});save();syncNow(true);syncSheet()}
async function syncLink(code){
  const key=cleanCode(code);if(key.length<48){toast('That code looks incomplete');return}
  try{const r=await fetch('/api/sync',{cache:'no-store',headers:{'x-iron-sync':key}});
    if(r.status===404){toast('No backup found for that code');return}if(!r.ok)throw 0;const j=await r.json();
    if(!window.confirm('Replace the data on this device with the backup from '+new Date(j.updated).toLocaleString()+'?'))return;
    const st=Object.assign(defaults(),j.state,{sync:{on:true,key,last:j.updated,at:Date.now()}});localStorage.setItem(KEY,JSON.stringify(st));location.reload();
  }catch(e){toast('Couldn’t reach the backup. Check your connection.')}
}
function syncSheet(){
  const on=syncOn(),sy=S.sync||{};
  openSheet(`<h4 class="disp">Cloud backup</h4>
  ${on?`<div class="note" style="--c:var(--ok)"><b>On.</b> Every change is saved to the cloud a few seconds after you make it${sy.at?`. Last backup: ${new Date(sy.at).toLocaleString([],{weekday:'short',day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}`:''}.${sy.err?' <b>Last attempt failed</b>; it retries when you’re online.':''}</div>
  <label class="fl2">Your private sync code</label><div class="synccode num" aria-label="Sync code">${fmtCode(sy.key)}</div>
  <p class="muted" style="font-size:13px;margin:4px 0 0">Anyone with this code can read your data. Keep it private, like a password. Enter it on another phone to bring everything across.</p>
  <div class="grid2" style="margin-top:8px"><button class="cta ghost" style="margin:0" data-a="synccopy">Copy code</button><button class="cta ghost" style="margin:0" data-a="syncnow">Back up now</button></div>
  <button class="cta ghost" style="color:var(--bad)" data-a="syncoff">Turn off cloud backup</button>`
  :`<p style="font-size:14px">Your training lives only in this browser. Turn on cloud backup so a lost phone or cleared browser never costs you your logs.</p><button class="cta" style="--c:var(--ok)" data-a="syncon">Turn on cloud backup</button>`}
  <label class="fl2" style="margin-top:14px">Bring data from another device</label><input type="text" id="synclink" placeholder="Paste the sync code from your other phone" autocomplete="off" autocapitalize="off" spellcheck="false"><button class="cta ghost" data-a="synclink">Link this device</button>
  <label class="fl2" style="margin-top:14px">Backup file</label><div class="grid2"><button class="cta ghost" style="margin:0" data-a="bkfile">Download backup</button><button class="cta ghost" style="margin:0" data-a="bkload">Restore from file</button></div>
  <button class="cta ghost" data-a="settings">Back to settings</button>`);
}
function bkDownload(){const b=new Blob([JSON.stringify(S)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='iron-backup-'+todayS()+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000);toast('Backup downloaded')}
function bkLoad(){const inp=document.createElement('input');inp.type='file';inp.accept='application/json,.json';inp.onchange=async()=>{const f=inp.files&&inp.files[0];if(!f)return;try{const o=JSON.parse(await f.text());if(!o||!o.start)throw 0;if(!window.confirm('Replace the data on this device with this backup?'))return;const st=Object.assign(defaults(),o,{sync:S.sync});localStorage.setItem(KEY,JSON.stringify(st));location.reload()}catch(e){toast('That file isn’t an IRON backup')}};inp.click()}
function settingsSheet(){
  const th=document.documentElement.getAttribute('data-theme')||'auto';
  openSheet(`<h4 class="disp">Settings</h4>
  <div class="srow"><b>Theme</b><select data-in="theme"><option value="auto" ${th==='auto'?'selected':''}>Match my device</option><option value="light" ${th==='light'?'selected':''}>Light</option><option value="dark" ${th==='dark'?'selected':''}>Dark</option></select></div>
  <div class="card" style="margin-top:12px"><h4 class="disp" style="font-size:22px">Your plan</h4><p class="muted" style="font-size:14px;margin:0 0 8px">${S.prof?`Built from your questionnaire on ${nice(S.prof.created)}.`:'Answer the questionnaire and 7 quick self-tests to get a plan built around your goal, equipment, schedule and injuries.'}</p><button class="cta" style="--c:var(--upper);margin:0" data-a="obopen">${S.prof?'Retake the questionnaire':'Build my personal plan'}</button>${S.planBackup?'<button class="cta ghost" data-a="obrestore">Restore my previous plan</button>':''}</div>
  <div class="card" style="margin-top:12px"><h4 class="disp" style="font-size:22px">WHOOP</h4>
  ${!WH_ON?`<p class="muted" style="font-size:14px;margin:0">WHOOP works once IRON is online on your Netlify site.</p>`:S.whoop.connected?`<p style="font-size:14px;margin:0 0 8px">Connected. Last sync ${S.whoop.last?new Date(S.whoop.last).toLocaleString([], {weekday:'short',hour:'2-digit',minute:'2-digit'}):'never'}.</p>
  <div class="srow"><b>Auto-adjust</b><button class="cta ${S.whoop.auto?'':'ghost'}" style="--c:var(--ok);margin:0;height:44px" data-a="wauto">${S.whoop.auto?'On: workouts follow WHOOP':'Off: I choose manually'}</button></div>
  <div class="grid2" style="margin-top:8px"><button class="cta ghost" style="margin:0" data-a="wsync">Sync now</button><button class="cta ghost" style="margin:0;color:var(--bad)" data-a="wdisconnect">Disconnect</button></div>`:`${S.whoop.pending?`<p style="font-size:14px;margin:0 0 8px"><b>Waiting for WHOOP approval.</b> If the login finished in Safari, come back here and tap Check connection.</p><button class="cta ghost" style="margin:0 0 8px" data-a="wsync">Check connection</button>`:''}<p class="muted" style="font-size:14px;margin:0 0 8px">Pull your recovery, HRV and resting heart rate every morning and adjust each workout automatically.</p><button class="cta" style="--c:var(--ink);color:var(--bg);margin:0" data-a="wconnect">Connect WHOOP</button>`}
  <p class="muted" style="font-size:13px;margin:8px 0 0">Green 67%+ full session. Yellow 34–66% lighter. Red 33% or less recovery only. HRV 10%+ below your 30-day average, or resting HR 5+ bpm above it, drops the day one level.</p></div>
  <div class="card" style="margin-top:12px"><h4 class="disp" style="font-size:22px">Display</h4>
  <label class="fl2">Units</label><div class="obrow"><button class="obopt ${!imperial()?'on':''}" data-a="prefset" data-f="unit" data-v="kg"><b>Metric (kg, cm)</b></button><button class="obopt ${imperial()?'on':''}" data-a="prefset" data-f="unit" data-v="lb"><b>Imperial (lb, in)</b></button></div>
  <label class="fl2">Language</label><div class="obrow"><button class="obopt ${!isAr()?'on':''}" data-a="prefset" data-f="lang" data-v="en"><b>English</b></button><button class="obopt ${isAr()?'on':''}" data-a="prefset" data-f="lang" data-v="ar"><b>العربية</b></button></div>
  ${isAr()?'<p class="muted" style="font-size:13px;margin:4px 0 0">تبقى أوصاف التمارين ودليل المكمّلات باللغة الإنجليزية.</p>':''}
  <label class="fl2">Text size</label><div class="obrow"><button class="obopt ${(prefs().ts||'n')==='n'?'on':''}" data-a="prefset" data-f="ts" data-v="n"><b>Normal</b></button><button class="obopt ${prefs().ts==='l'?'on':''}" data-a="prefset" data-f="ts" data-v="l"><b>Large</b></button><button class="obopt ${prefs().ts==='xl'?'on':''}" data-a="prefset" data-f="ts" data-v="xl"><b>Larger</b></button></div></div>
  <div class="card" style="margin-top:12px"><h4 class="disp" style="font-size:22px">Workouts</h4>
  ${[['rpe','Ask how hard each set felt (RPE)','Rate sets 6–10; weight suggestions use it'],['wake','Keep the screen on during a session','So the timer and sets stay visible'],['alerts','Alert me when rest is over','Sound, vibration and a notification if the app is in the background']].map(([f,l,sub])=>`<button class="obopt ${prefs()[f]?'on':''}" data-a="preftog" data-f="${f}"><b>${prefs()[f]?'✓ ':''}${l}</b><span>${sub}</span></button>`).join('')}
  <button class="cta ghost" data-a="plates" data-e="">${IC.plate} Plate calculator</button></div>
  <button class="card setlink" style="margin-top:12px" data-a="syncopen"><h4 class="disp" style="font-size:22px;margin:0">${IC.cloud} Cloud backup ›</h4><span class="muted" style="font-size:14px">${syncOn()?'On'+(S.sync.at?' · last backup '+new Date(S.sync.at).toLocaleString([],{weekday:'short',hour:'2-digit',minute:'2-digit'}):''):'Off. Turn it on so you never lose your logs.'}</span></button>
  <button class="cta ghost" data-a="errlog">${IC.alert} Error log${(typeof errList==='function'&&errList().length)?' ('+errList().length+')':''}</button>
  <button class="cta ghost" style="color:var(--bad)" data-a="reset">Reset everything</button>`);
}
function habSheet(id){
  const x=id?S.habits.find(h=>h.id===id):{n:'',e:EMOJIS[0],c:HAB_COLORS[0]};UI.hdraft={...x};const lk=x.link||null;
  openSheet(`<h4 class="disp">${id?'Edit habit':'New habit'}</h4><input type="text" id="hn" placeholder="e.g. Read 10 pages" value="${esc(x.n)}" maxlength="40">
  <div class="emopick">${EMOJIS.map(e=>`<button class="${e===x.e?'on':''}" data-a="hemo" data-v="${e}">${e}</button>`).join('')}</div>
  <div class="swatches">${HAB_COLORS.map(c=>`<button class="sw ${c===x.c?'on':''}" style="--c:${c}" data-a="hcol" data-v="${c}" aria-label="Colour"></button>`).join('')}</div>
  <div class="card" style="--c:${WC.rec};margin:10px 0 0"><h4 class="disp" style="margin:0 0 4px;font-size:22px">${IC.link} Auto-track with WHOOP</h4>
  <select id="hlk" data-in="hlk"><option value="">Off: I tick it myself</option>${Object.keys(LINKS).map(k=>`<option value="${k}" ${lk&&lk.k===k?'selected':''}>${LINKS[k].l}</option>`).join('')}</select>
  <div id="hlrow" class="${lk?'':'hide'}"><label class="fl2" id="hllab" for="hlt">${lk?`Done when ${LINKS[lk.k].l.toLowerCase()} ${LINKS[lk.k].op}`:''} ${lk&&LINKS[lk.k].u?'('+LINKS[lk.k].u+')':''}</label><input type="text" inputmode="decimal" id="hlt" value="${lk?lk.t:''}"></div>
  <div class="pnote">The habit ticks itself every day from your WHOOP data. Sleep is counted on the morning you wake up. You can still tap any day to override it.</div></div>
  <button class="cta" style="--c:var(--long)" data-a="habsave" data-k="${id||''}">${id?'Save changes':'Add habit'}</button>
  ${id?`<button class="dangerbtn" data-a="habdel" data-k="${id}">Remove ${esc(x.n)}</button>`:''}`);
}
function finishSheet(d){
  const u=units(d),l=S.logs[d]||{};let sets=0,vol=0;Object.keys(l).forEach(k=>{if(k[0]==='_')return;(l[k].sets||[]).forEach(s=>{if(s.d){sets++;vol+=(+s.w||0)*(+s.r||0)}})});
  const dur=l._t0?Math.round((Date.now()-l._t0)/60000):null;const pct=Math.round(pctOf(u)*100);
  const cs=[COLORS.upper,COLORS.lower,COLORS.mob,COLORS.core,COLORS.cardio,COLORS.long];
  openSheet(`<div class="celebrate"><div class="burst">${cs.map((c,i)=>`<i style="--c:${c};animation-delay:${i*60}ms"></i>`).join('')}</div><div class="disp">Session done</div><p class="muted">${T[tplOf(d)].n}, ${nice(d)}</p>
  <div class="grid2" style="text-align:left;margin:12px 0"><div class="stat"><b class="disp num">${pct}%</b><span>of the plan completed</span></div><div class="stat"><b class="disp num">${sets}</b><span>sets logged</span></div><div class="stat"><b class="disp num">${Math.round(vol)}</b><span>kg total volume</span></div><div class="stat"><b class="disp num">${dur&&dur<240?dur+'′':'–'}</b><span>since your first tick</span></div></div>
  <button class="cta" style="--c:var(--upper)" data-a="wshare" data-d="${d}">${IC.share} Share workout summary</button><button class="cta ghost" data-a="close">Nice</button></div>`);
}

