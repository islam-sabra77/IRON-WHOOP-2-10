"use strict";
/* ---------- timer ---------- */
let TM=null,AC=null;
function beep(f,len,n){try{AC=AC||new(window.AudioContext||window.webkitAudioContext)();for(let i=0;i<(n||1);i++){const o=AC.createOscillator(),g=AC.createGain();o.frequency.value=f||880;o.connect(g);g.connect(AC.destination);const t0=AC.currentTime+i*0.22;g.gain.setValueAtTime(0.0001,t0);g.gain.exponentialRampToValueAtTime(0.35,t0+0.02);g.gain.exponentialRampToValueAtTime(0.0001,t0+(len||0.18));o.start(t0);o.stop(t0+(len||0.18)+0.02)}}catch(e){}try{navigator.vibrate&&navigator.vibrate(n>1?[120,80,120]:80)}catch(e){}}
function startTimer(title,phases,done){TM={title,phases,i:0,end:Date.now()+phases[0].s*1000,paused:false,left:0,done};beep(660,.08,1);drawTimer();}
function drawTimer(){
  const el=document.getElementById('timer');if(!TM){el.classList.add('hide');return}el.classList.remove('hide');
  const p=TM.phases[TM.i],rem=TM.paused?TM.left:(TM.end-Date.now())/1000;const C=2*Math.PI*20,frac=Math.max(0,rem)/p.s;
  const nxt=TM.phases[TM.i+1];
  el.innerHTML=`<svg class="ringt" width="50" height="50" viewBox="0 0 50 50"><circle cx="25" cy="25" r="20" fill="none" stroke="rgba(127,127,160,.35)" stroke-width="5"/><circle cx="25" cy="25" r="20" fill="none" stroke="${p.c||COLORS.cardio}" stroke-width="5" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${C*(1-frac)}" transform="rotate(-90 25 25)"/></svg>
  <div class="tt"><small>${esc(TM.title)}</small><small>${esc(p.l)}${nxt&&TM.phases.length<4?', then '+esc(nxt.l).toLowerCase():''}</small><b class="disp num">${fmtT(rem)}</b></div>
  <button data-a="tadj" data-v="-15">−15</button><button data-a="tadj" data-v="15">+15</button><button data-a="tpause" aria-label="${TM.paused?'Resume':'Pause'}">${TM.paused?'▶':'❚❚'}</button><button data-a="tstop" aria-label="Stop timer">✕</button>`;
}
setInterval(()=>{if(!TM||TM.paused)return;const rem=(TM.end-Date.now())/1000;
  if(rem<=3.05&&rem>0&&Math.ceil(rem)!==TM.lastBeep){TM.lastBeep=Math.ceil(rem);beep(520,.07,1)}
  if(rem<=0){if(TM.i<TM.phases.length-1){TM.i++;TM.end=Date.now()+TM.phases[TM.i].s*1000;TM.lastBeep=null;beep(880,.25,2)}else{const f=TM.done,tl=TM.title,pl=TM.phases[TM.i].l;TM=null;beep(990,.3,3);if(document.hidden)restAlert(tl+' is over',pl);drawTimer();if(UI.fx)fxTimer();f&&f();return}}
  drawTimer()},200);

/* =====================================================================
   GYM-FLOOR HELPERS: plate calculator, screen-on rest timer with alerts,
   RPE per set, and one-thumb focus mode.
   ===================================================================== */
function prefs(){S.prefs=S.prefs||{};const p=S.prefs;if(p.bar==null)p.bar=20;if(!p.plates)p.plates=[25,20,15,10,5,2.5,1.25];if(p.rpe==null)p.rpe=true;if(p.wake==null)p.wake=true;if(p.alerts==null)p.alerts=true;return p}
const PLATE_ALL=[25,20,15,10,5,2.5,2,1.25,1,0.5];
const PLATE_C={25:'#E5484D',20:'#2F5BFF',15:'#E8A900',10:'#12B76A',5:'#F4F5FA',2.5:'#191A4A',2:'#7B4DFF',1.25:'#8E97BF',1:'#00A3FF',0.5:'#FF6A13'};
const isBarbell=ex=>META[ex]&&META[ex].eq==='bb';
function platesFor(total,bar,plates){if(imperial()){const r=platesForU(total*LB,(S.prefs.barLb??45),S.prefs.platesLb||[45,35,25,10,5,2.5]);return{side:r.side==null?null:r.side/LB,list:r.list,rest:r.rest/LB,lb:true}}return platesForU(total,bar,plates)}
function platesForU(total,bar,plates){const side=(total-bar)/2;if(side<0)return{side:null,list:[],rest:0};let r=Math.round(side*100)/100;const list=[];plates.slice().sort((a,b)=>b-a).forEach(p=>{while(r>=p-1e-9){list.push(p);r=Math.round((r-p)*100)/100}});return{side,list,rest:r}}
function plateSheet(ex,w){
  const p=prefs();UI.pl8={ex,w:w!=null&&w!==''?+w:(UI.pl8&&UI.pl8.w)||p.bar+20};drawPlates();
}
function drawPlates(){
  const p=prefs(),q=UI.pl8,res=platesFor(q.w,p.bar,p.plates),made=q.w-2*res.rest;
  const stack=res.list.map(x=>`<i class="plate" style="--c:${PLATE_C[x]||'#888'};height:${40+x*3.2}px" title="${x} kg"><span>${x}</span></i>`).join('');
  openSheet(`<h4 class="disp">Plate calculator</h4>${q.ex&&E[q.ex]?`<p class="muted" style="font-size:13.5px;margin:0 0 6px">${esc(E[q.ex].n)}</p>`:''}
  <div class="pcrow"><button class="mini big" data-a="pl8w" data-v="-2.5" aria-label="Less weight">−</button><label class="fld pcw"><input inputmode="decimal" id="pl8in" data-in="pl8" value="${q.w}" aria-label="Total weight"><em>kg total</em></label><button class="mini big" data-a="pl8w" data-v="2.5" aria-label="More weight">＋</button></div>
  ${res.side==null?`<div class="note">That's lighter than the bar (${p.bar} kg).</div>`:`<div class="pcbar" aria-label="Plates on each side">${stack||'<span class="muted">Empty bar</span>'}<b></b></div>
  <p style="font-size:15px;margin:8px 0 0" data-raw><b>${isAr()?'كل جانب:':'Each side:'}</b> ${res.list.length?res.list.join(' + ')+(res.lb?' lb':' kg'):'nothing'}${res.rest>0?`<br><span class="muted">Closest you can load: ${made} kg (${res.rest} kg per side missing).</span>`:''}</p>`}
  <label class="fl2" style="margin-top:12px">Bar</label><div class="chipsrow">${imperial()?[45,35,25,15,0].map(b=>`<button class="mini ${(p.barLb??45)===b?'on':''}" data-a="pl8barlb" data-v="${b}" data-raw>${b?b+' lb':'No bar'}</button>`).join(''):[20,15,10,7,0].map(b=>`<button class="mini ${p.bar===b?'on':''}" data-a="pl8bar" data-v="${b}">${b?b+' kg':'No bar'}</button>`).join('')}</div>
  <label class="fl2" style="margin-top:10px">Plates your gym has</label><div class="chipsrow">${imperial()?'<span class="muted" style="font-size:12.5px">45, 35, 25, 10, 5 and 2.5 lb plates</span>':PLATE_ALL.map(x=>`<button class="mini ${p.plates.includes(x)?'on':''}" data-a="pl8p" data-v="${x}">${x}</button>`).join('')}</div>
  <button class="cta ghost" data-a="close">Done</button>`);
}
/* keep the screen on during a session, and alert when rest ends even if the app is in the background */
let WAKE=null;
async function wakeOn(){if(!prefs().wake||!('wakeLock' in navigator)||document.hidden)return;try{if(!WAKE){WAKE=await navigator.wakeLock.request('screen');WAKE.addEventListener('release',()=>{WAKE=null})}}catch(e){}}
function wakeOff(){try{WAKE&&WAKE.release()}catch(e){}WAKE=null}
function askAlerts(){if(prefs().alerts&&'Notification' in window&&Notification.permission==='default'){try{Notification.requestPermission()}catch(e){}}}
function restAlert(title,body){if(!prefs().alerts)return;try{if('Notification' in window&&Notification.permission==='granted'){if(navigator.serviceWorker&&navigator.serviceWorker.controller)navigator.serviceWorker.ready.then(r=>r.showNotification(title,{body,tag:'iron-rest',renotify:true,vibrate:[200,100,200],icon:'icon-512.png'}));else new Notification(title,{body,tag:'iron-rest'})}}catch(e){}}
let BGT=null;
document.addEventListener('visibilitychange',()=>{clearTimeout(BGT);if(document.hidden&&TM&&!TM.paused){const ms=TM.end-Date.now(),ph=TM.phases[TM.i];if(ms>0)BGT=setTimeout(()=>restAlert(TM?TM.title+' is over':'Time is up',ph&&ph.l||''),ms)}if(!document.hidden&&(TM||(S.logs[todayS()]&&S.logs[todayS()]._t0&&!S.done[todayS()])))wakeOn()});
/* RPE: how hard the set felt, 6 (easy) to 10 (nothing left) */
const RPE_L={6:'Easy, 4+ left',7:'3 left',8:'2 left',9:'1 left',10:'Max'};
function rpeRow(k,s){return`<div class="rperow" role="group" aria-label="How hard was that set?"><span>How hard?</span>${[6,7,8,9,10].map(v=>`<button class="${+s.e===v?'on':''}" data-a="rpe" data-k="${k}" data-v="${v}" title="${RPE_L[v]}">${v}</button>`).join('')}<button class="rpex" data-a="rpe" data-k="${k}" data-v="0" aria-label="Skip">✕</button></div>`}
/* focus mode: the next set, big controls */
function nextSet(d){
  const groups=blocksFor(d).map(b=>b.items).concat(coreFor(d).length?[coreFor(d)]:[]);
  for(const items of groups){const max=Math.max(...items.map(i=>i.rx.sets));for(let r=0;r<max;r++)for(const it of items){if(r>=it.rx.sets)continue;const l=S.logs[d]&&S.logs[d][it.slot];const s=l&&l.ex===it.ex?l.sets[r]:null;if(!s||!s.d)return{it,r,items}}}
  return null;
}
function focusOpen(){const d=UI.date;UI.fx={d};wakeOn();askAlerts();drawFocus()}
function drawFocus(){
  const q=UI.fx;if(!q)return;const d=q.d,n=nextSet(d);
  if(!n){openSheet(`<div class="fxwrap"><div class="disp" style="font-size:34px">All sets done 💪</div><p class="muted">Finish the core and cardio from the Train tab, or share the workout.</p><button class="cta" style="--c:var(--upper)" data-a="wshare" data-d="${d}">📸 Share workout</button><button class="cta ghost" data-a="close">Close</button></div>`);return}
  const it=n.it,e=E[it.ex],k=it.slot+'|'+n.r,o=slotLog(d,it.slot,it.ex,it.rx.sets),s=o.sets[n.r],sg=e.bw||e.t?null:suggest(it,d);
  if(q.k!==k){q.k=k;q.w=s.w!==''?+s.w:(sg?sg.w:(o.sets.slice(0,n.r).reverse().find(x=>x.w!=='')||{}).w||'');q.r=s.r!==''?+s.r:(e.t?secsOf(it):rangeOf(it.rx.reps)[1])}
  const step=imperial()?(isBarbell(it.ex)?5:2.5)/LB:(isBarbell(it.ex)?2.5:(['acc','arm','pre'].includes(it.role)?1:2));
  const tot=groupsTotal(d),done=tot.done;
  openSheet(`<div class="fxwrap"><div class="fxtop"><span class="pill" style="--c:var(--upper)">${done} of ${tot.all} sets</span><button class="mini" data-a="close" aria-label="Exit focus mode">Exit</button></div>
  <div class="fxname disp">${esc(e.n)}</div><div class="muted" style="font-size:14px">Set ${n.r+1} of ${it.rx.sets} · target ${repTxt(it)}${it.rx.rir!=null&&!/^core/.test(it.role)?' · RIR '+it.rx.rir:''}</div>
  ${sg?`<div class="sugg" style="margin-top:6px">${esc(sg.why)}. Suggested <b>${sg.w} kg</b>.</div>`:''}
  ${!e.bw&&!e.t?`<div class="fxctl"><span>Weight</span><button data-a="fxadj" data-f="w" data-v="${-step}" aria-label="Less weight">−</button><b class="num" data-raw>${q.w===''?'–':toDisp(q.w)}<small>${uW()}</small></b><button data-a="fxadj" data-f="w" data-v="${step}" aria-label="More weight">＋</button></div>`:''}
  <div class="fxctl"><span>${e.t?'Seconds':'Reps'}</span><button data-a="fxadj" data-f="r" data-v="${e.t?-5:-1}" aria-label="Less">−</button><b class="num">${q.r}<small>${e.t?'s':''}</small></b><button data-a="fxadj" data-f="r" data-v="${e.t?5:1}" aria-label="More">＋</button></div>
  <button class="fxdone" data-a="fxdone">✓ Set done</button>
  <div class="fxrow"><button class="mini" data-a="demo" data-e="${it.ex}">${IC.play} Demo</button>${isBarbell(it.ex)?`<button class="mini" data-a="plates" data-e="${it.ex}" data-w="${q.w}">🏋️ Plates</button>`:''}<button class="mini" data-a="fxskip">Skip set</button></div>
  <div id="fxtimer" class="fxtimer"></div></div>`);fxTimer();
}
function groupsTotal(d){let all=0,done=0;blocksFor(d).forEach(b=>b.items.forEach(it=>{all+=it.rx.sets;done+=setsDone(d,it)}));coreFor(d).forEach(it=>{all+=it.rx.sets;done+=setsDone(d,it)});return{all,done}}
function fxTimer(){const el=document.getElementById('fxtimer');if(!el)return;if(!TM){el.innerHTML='';return}const rem=Math.max(0,Math.ceil((TM.end-Date.now())/1000));el.innerHTML=`<span>${esc(TM.phases[TM.i].l)}</span><b class="disp num">${fmtT(rem)}</b>`}
setInterval(()=>{if(UI.fx)fxTimer();if(TM&&!TM.paused){document.title=fmtT(Math.max(0,(TM.end-Date.now())/1000))+' · '+TM.title+' · IRON'}else if(document.title!=='IRON')document.title='IRON'},500);

/* =====================================================================
   DISPLAY LAYER: units, language, accessibility, text size.
   Everything is stored in kg and cm. After each screen renders, text is
   converted to pounds, inches or miles for imperial users, translated for
   Arabic, and icon-only buttons get screen-reader labels.
   ===================================================================== */
const LB=2.20462;
const imperial=()=>!!(S.prefs&&S.prefs.unit==='lb');
const isAr=()=>!!(S.prefs&&S.prefs.lang==='ar');
const uW=()=>imperial()?'lb':'kg';
function toDisp(kg){if(kg===''||kg==null||isNaN(+kg))return kg;return imperial()?Math.round(+kg*LB*2)/2:+kg}
function fromDisp(v){if(v===''||v==null||isNaN(+v))return v;return imperial()?Math.round(+v/LB*100)/100:+v}
function fvol(kg){const v=imperial()?kg*LB:kg;return v>=1000?(v/1000).toFixed(1)+(imperial()?'k lb':'t'):Math.round(v)+' '+uW()}
const fmtN=n=>(Math.round(n*10)/10).toLocaleString('en',{maximumFractionDigits:1});
function convText(t){
  if(!imperial()||!/\d|kg|cm|km/.test(t))return t;
  return t.replace(/(-?\d[\d,]*(?:\.\d+)?)\s?kg\b/g,(m,n)=>{const v=parseFloat(n.replace(/,/g,''))*LB;return fmtN(Math.round(v*2)/2)+' lb'})
    .replace(/(\d+(?:\.\d+)?)\s?km\b/g,(m,n)=>(parseFloat(n)*0.621371).toFixed(2)+' mi')
    .replace(/(\d+(?:\.\d+)?)\s?cm\b/g,(m,n)=>{const i=Math.round(parseFloat(n)/2.54);return Math.floor(i/12)+'′'+(i%12)+'″'})
    .replace(/^kg$/,'lb').replace(/^kg total$/,'lb total');
}
/* Arabic interface labels (exercise descriptions and the supplement guide stay in English) */
const AR={'Home':'الرئيسية','Train':'التمرين','Plan':'الخطة','Builder':'المُنشئ','Progress':'التقدّم','Supps':'المكمّلات','Habits':'العادات','Travel':'السفر',
 'Settings':'الإعدادات','Close':'إغلاق','Cancel':'إلغاء','Save':'حفظ','Done':'تم','Back':'رجوع','Next':'التالي','Undo':'تراجع','Add':'إضافة','Share':'مشاركة','Upload':'رفع','Sync now':'مزامنة الآن','↻ Sync':'↻ مزامنة',
 'Good morning':'صباح الخير','Good afternoon':'مساء الخير','Good evening':'مساء الخير','Today':'اليوم','This week':'هذا الأسبوع','Last workout':'آخر تمرين','Recovery':'التعافي','Sleep':'النوم','Strain':'الإجهاد','Workouts':'التمارين',
 'Volume this week':'الحجم هذا الأسبوع','Top lift':'أفضل رفعة','Strength':'القوة','Supplements':'المكمّلات','Streaks':'السلاسل','Body weight':'وزن الجسم','Weekly report':'التقرير الأسبوعي','Start session ›':'ابدأ الجلسة ›','Continue ›':'تابع ›','Rest day ›':'يوم راحة ›',
 'Mobility':'المرونة','Warm-up':'الإحماء','Core':'الجذع','Cardio':'الكارديو','Long cardio':'كارديو طويل','Rest day':'يوم راحة','Finish session':'إنهاء الجلسة','Session complete':'اكتملت الجلسة','Demo':'فيديو','Replace':'استبدال','Form':'الأداء','History':'السجل','🏋️ Plates':'🏋️ الأقراص',
 '▶ Focus mode':'▶ وضع التركيز','Compact view':'عرض مختصر','Expand all':'توسيع الكل','Move or copy':'نقل أو نسخ','📸 Share':'📸 مشاركة','✓ Set done':'✓ انتهت المجموعة','Skip set':'تخطي المجموعة','Exit':'خروج','Weight':'الوزن','Reps':'التكرارات','Seconds':'الثواني','reps':'تكرار','How hard?':'ما مدى الصعوبة؟',
 'Green':'أخضر','Yellow':'أصفر','Red':'أحمر','full session':'جلسة كاملة','lighter day':'يوم أخف','recovery only':'تعافٍ فقط','Readiness check':'فحص الجاهزية','Muscle soreness':'ألم العضلات','Energy':'الطاقة','Use this for today':'استخدم هذا لليوم','Not now':'ليس الآن',
 'Plate calculator':'حاسبة الأقراص','Bar':'العارضة','Plates your gym has':'الأقراص المتوفرة في ناديك','Each side:':'كل جانب:',
 'Strength trends':'تطوّر القوة','Sessions per week':'الجلسات في الأسبوع','Stalled lifts':'رفعات متوقفة','Personal records':'أرقام قياسية شخصية','Sessions done':'الجلسات المنجزة','Sets logged':'المجموعات المسجّلة','Avg recovery':'متوسط التعافي','Avg sleep':'متوسط النوم','Supplements taken':'المكمّلات المأخوذة','Habits done':'العادات المنجزة',
 'Plan builder':'مُنشئ الخطة','Start from a split':'ابدأ من تقسيم','Your week':'أسبوعك','Cycles and progression':'الدورات والتقدّم','WHOOP intensity':'شدة WHOOP','Mobility focus':'تركيز المرونة','Apply':'تطبيق','Apply to my plan':'طبّق على خطتي','Cycle length':'طول الدورة','Goal':'الهدف','Session length':'مدة الجلسة',
 'Your plan':'خطتك','Cloud backup':'النسخ الاحتياطي السحابي','☁️ Cloud backup ›':'☁️ النسخ الاحتياطي السحابي ›','Copy code':'نسخ الرمز','Back up now':'انسخ الآن','Link this device':'اربط هذا الجهاز','Download backup':'تنزيل نسخة احتياطية','Restore from file':'استعادة من ملف','Back to settings':'العودة إلى الإعدادات',
 'Theme':'المظهر','Units':'الوحدات','Language':'اللغة','Text size':'حجم النص','Metric (kg, cm)':'متري (كغ، سم)','Imperial (lb, in)':'إمبراطوري (رطل، إنش)','Normal':'عادي','Large':'كبير','Larger':'أكبر','Display':'العرض',
 'Body':'الجسم','InBody':'InBody','Trends':'الاتجاهات','Insights':'رؤى','Steps ›':'الخطوات ›','Sleep ›':'النوم ›','Strain ›':'الإجهاد ›','Calories ›':'السعرات ›','HRV':'تقلب نبض القلب',
 'Build or improve my stack':'أنشئ أو حسّن مكمّلاتي','📖 Supplement guide':'📖 دليل المكمّلات','Morning':'الصباح','Pre-workout':'قبل التمرين','Post-workout':'بعد التمرين','With meals':'مع الوجبات','Evening':'المساء',
 'Workout summary':'ملخص التمرين','Share image':'مشاركة الصورة','Save image':'حفظ الصورة','Copy as text':'نسخ كنص','Nice':'رائع','Session done':'انتهت الجلسة'};
const AR_PART=[[/^Cycle (\d+) · week (\d+)\/(\d+)$/,'الدورة $1 · الأسبوع $2/$3'],[/^(\d+) of (\d+) sessions$/,'$1 من $2 جلسات'],[/^Set (\d+) of (\d+)/,'المجموعة $1 من $2']];
function trText(t){if(!isAr())return t;const k=t.trim();if(!k)return t;if(AR[k])return t.replace(k,AR[k]);for(const[re,to]of AR_PART)if(re.test(k))return t.replace(k,k.replace(re,to));return t}
const ICON_LABEL={close:'Close',tstop:'Stop timer',tpause:'Pause or resume timer',tadj:'Adjust timer',set:'Mark set done',tset:'Start set timer',mob:'Mark done',excol:'Show or hide details',col:'Show or hide section',wk:'Change week',day:'Open day',demo:'Play video',settings:'Settings',swap:'Replace exercise',bdmove:'Move',bddel:'Remove',fxadj:'Adjust',pl8w:'Adjust weight',rpe:'Rate set',supp:'Mark taken',habday:'Toggle day',sdaytoggle:'Toggle day',habm:'Change month',sm:'Change month',hcol:'Colour',hemo:'Emoji'};
function localizeNode(root){
  const doU=imperial(),doA=isAr();
  if(root.nodeType===3){if(root.parentNode&&root.parentNode.closest&&root.parentNode.closest('[data-raw]'))return;let v=root.nodeValue;if(doU)v=convText(v);if(doA)v=trText(v);if(v!==root.nodeValue)root.nodeValue=v;return}
  if(root.nodeType!==1||root.closest&&root.closest('[data-raw]'))return;
  if(doU||doA){const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentNode&&(n.parentNode.nodeName==='SCRIPT'||n.parentNode.nodeName==='STYLE'||n.parentNode.closest('[data-raw]'))?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});const list=[];while(w.nextNode())list.push(w.currentNode);
    list.forEach(n=>{let v=n.nodeValue;if(doU)v=convText(v);if(doA)v=trText(v);if(v!==n.nodeValue)n.nodeValue=v});
    if(doA)root.querySelectorAll&&root.querySelectorAll('[placeholder]').forEach(e=>{const p=e.getAttribute('placeholder');if(AR[p])e.setAttribute('placeholder',AR[p])})}
  const btns=root.matches&&root.matches('button')?[root]:root.querySelectorAll?[...root.querySelectorAll('button')]:[];
  btns.forEach(b=>{if(b.hasAttribute('aria-label'))return;const tx=b.textContent.replace(/[\s✕✓−＋↑↓‹›❚▶…]/g,'');if(tx.length)return;b.setAttribute('aria-label',ICON_LABEL[b.dataset.a]||b.title||(b.dataset.a||'button').replace(/([a-z])([A-Z])/g,'$1 $2'))});
  // weight inputs show the display unit
  if(doU&&root.querySelectorAll)root.querySelectorAll('input[data-in="w"],input#pl8in').forEach(i=>{if(i.dataset.conv)return;i.dataset.conv=1;if(i.value!=='')i.value=toDisp(i.value);if(i.placeholder&&!isNaN(+i.placeholder))i.placeholder=toDisp(i.placeholder)});
}
function applyDisplay(){const p=prefs(),h=document.documentElement;h.lang=p.lang==='ar'?'ar':'en';h.dir=p.lang==='ar'?'rtl':'ltr';h.dataset.ts=p.ts||'n'}
new MutationObserver(ms=>{if(!S||!S.prefs)return;for(const m of ms)m.addedNodes.forEach(n=>localizeNode(n))}).observe(document.body,{childList:true,subtree:true});

/* ---------- actions ---------- */
function rerender(){HISTCACHE=null;WICACHE={};renderTop();renderTabs();({home:renderHome,train:renderTrain,whoop:renderWhoop,travel:renderTravel,plan:renderPlan,build:renderBuild,progress:renderProgress,supps:renderSupps,habits:renderHabits})[UI.tab]();}
function markStart(d){const l=L(d);if(!l._t0){l._t0=Date.now();askAlerts()}if(d===todayS())wakeOn()}
function checkComplete(d){const u=units(d);if(pctOf(u)>=1&&!S.done[d]){S.done[d]={t:Date.now()};save();wakeOff();UI.fx=null;rerender();finishSheet(d);return true}return false}
function findItem(d,slot){for(const b of blocksFor(d)){for(let i=0;i<b.items.length;i++)if(b.items[i].slot===slot)return{it:b.items[i],b,idx:i}}const c=coreFor(d);for(let i=0;i<c.length;i++)if(c[i].slot===slot)return{it:c[i],b:{items:c},idx:i};return null}
function toggleSet(d,k,forceOn){
  const[slot,i]=k.split('|');const f=findItem(d,slot);if(!f)return;const it=f.it,e=E[it.ex];
  const o=slotLog(d,slot,it.ex,it.rx.sets),s=o.sets[+i];const on=forceOn?true:!s.d;
  if(on){const sg=suggest(it,d);if(!e.t){if(s.r==='')s.r=String(rangeOf(it.rx.reps)[1]);if(!e.bw&&s.w===''&&sg)s.w=String(sg.w)}if(e.t&&s.r==='')s.r=String(secsOf(it))}
  s.d=on?1:0;markStart(d);save();delete UI.exo[slot];UI.rpeAsk=on&&!e.t?k:null;
  if(on&&!checkComplete(d)){
    const last=f.idx===f.b.items.length-1;
    if(last){const rest=Math.max(...f.b.items.map(x=>x.rx.rest));const more=+i<it.rx.sets-1;startTimer('Rest',[{l:more?'Set '+(+i+2)+' is next':'Next exercise is up',s:rest,c:COLORS.upper}])}
    else startTimer('Transition',[{l:'Go to '+E[f.b.items[f.idx+1].ex].n,s:15,c:COLORS.core}]);
  }
  rerender();
}
document.addEventListener('click',ev=>{
  const el=ev.target.closest('[data-a]');if(!el)return;const a=el.dataset.a,k=el.dataset.k,d=UI.date;
  switch(a){
  case'tab':UI.tab=el.dataset.v;closeSheet();rerender();window.scrollTo(0,0);if(UI.tab==='progress'&&el.closest('.card')){setTimeout(()=>{const x=document.getElementById('extend');x&&x.scrollIntoView({behavior:'smooth'})},50)}break;
  case'day':UI.date=el.dataset.d;UI.exc={};UI.exo={};rerender();break;
  case'col':S.col=S.col||{};S.col[el.dataset.v]=!S.col[el.dataset.v];if(!S.col[el.dataset.v])delete S.col[el.dataset.v];save();rerender();break;
  case'colall':{const keys=SECS;const all=keys.every(isCol);S.col=S.col||{};keys.forEach(x=>{if(all)delete S.col[x];else S.col[x]=1});UI.exc={};UI.exo={};save();rerender();break}
  case'excol':if(el.dataset.s==='1'){UI.exo[k]=true;delete UI.exc[k]}else{UI.exc[k]=true;delete UI.exo[k]}rerender();break;
  case'addtrip':{const f=document.getElementById('tripFrom').value,to=document.getElementById('tripTo').value;if(!f||!to||to<f){toast('Check the trip dates');break}S.trips=S.trips||[];S.trips.push({from:f,to});save();rerender();toast('Trip added: '+short(f)+' to '+short(to));break}
  case'deltrip':{const i=+el.dataset.v;const rem=S.trips.splice(i,1)[0];save();rerender();toast('Trip removed',()=>S.trips.splice(i,0,rem));break}
  case'dotravel':{const t=todayS();if(!inPlan(t)){toast('Today is outside your plan dates ('+short(S.start)+' to '+short(S.end)+')');break}S.moves[t]=el.dataset.v;save();UI.date=t;UI.tab='train';rerender();window.scrollTo(0,0);toast(T[el.dataset.v].n+' set for today',null);break}
  case'openday':UI.date=el.dataset.d;UI.tab='train';rerender();window.scrollTo(0,0);break;
  case'wk':UI.date=addD(d,+el.dataset.v);rerender();break;
  case'today':UI.date=todayS();rerender();break;
  case'gostart':UI.date=S.start;rerender();break;
  case'ready':S.ready[d]=S.ready[d]===el.dataset.v?'':el.dataset.v;if(!S.ready[d])delete S.ready[d];save();rerender();break;
  case'useWhoop':delete S.ready[d];save();rerender();break;
  case'wsync':whoopSync(true);break;
  case'wday':UI.wday=el.dataset.d;renderWhoop();break;
  case'metric':openMetric(el.dataset.v);break;
  case'mrange':UI.md.n=+el.dataset.v;drawMetric();break;
  case'bodylog':bodySheet();break;
  case'bodysave':{const d2=document.getElementById('bdate').value||todayS();const o={};let any=false;BODY_KEYS.forEach(k=>{const v=parseFloat((document.getElementById('b_'+k).value||'').replace(',','.'));if(!isNaN(v)&&v>0){o[k]=v;any=true}});if(!any){toast('Enter at least one measurement');break}S.body[d2]=Object.assign({},S.body[d2],o);save();closeSheet();rerender();toast('Measurements saved');break}
  case'bodydel':{const d2=el.dataset.d,k2=el.dataset.v;if(S.body[d2]){delete S.body[d2][k2];if(!Object.keys(S.body[d2]).filter(q=>q!=='src').length)delete S.body[d2]}save();drawMetric();toast('Entry removed');break}
  case'stepgoal':{const v2=parseInt(window.prompt('Daily step goal:',S.stepGoal||8000),10);if(v2>0){S.stepGoal=v2;save();renderWhoop()}break}
  case'wmet':UI.wmet=el.dataset.v;renderWhoop();break;
  case'wrange':UI.wrange=+el.dataset.v;renderWhoop();break;
  case'wdemo':UI.wdemo=!UI.wdemo;UI.wday=null;rerender();break;
  case'wconnect':S.whoop.pending=Date.now();save();location.href='/api/whoop-login?k='+wKey();break;
  case'wdisconnect':(async()=>{try{await fetch('/api/whoop-logout',{method:'POST',headers:{'x-iron-key':S.whoop.key||''}})}catch(e){}S.whoop.connected=false;save();closeSheet();rerender();toast('WHOOP disconnected')})();break;
  case'wauto':S.whoop.auto=!S.whoop.auto;save();rerender();settingsSheet();break;
  case'mob':{const on=!isChk(d,k);setChk(d,k,on);markStart(d);save();delete UI.exo[k];if(!checkComplete(d))rerender();break}
  case'mtimer':{const m=mobFor(d).concat(warmFor(d)).find(x=>x.slot===k);const e=E[m.ex];const mc=m.kind==='wu'?COLORS.warm:COLORS.mob;const ph=e.u?[{l:'Left side',s:m.dose,c:mc},{l:'Right side',s:m.dose,c:mc}]:[{l:e.n,s:m.dose,c:mc}];startTimer(e.n,ph,()=>{setChk(d,k,1);save();if(!checkComplete(d))rerender()});break}
  case'set':toggleSet(d,k);break;
  case'tset':{const[slot,i]=k.split('|');const f=findItem(d,slot);const e=E[f.it.ex],sec=secsOf(f.it);const col=slot[0]==='c'?COLORS.core:COLORS.upper;const ph=e.u?[{l:'Left side',s:sec,c:col},{l:'Right side',s:sec,c:col}]:[{l:'Hold',s:sec,c:col}];startTimer(e.n+', set '+(+i+1),ph,()=>{const o=slotLog(d,slot,f.it.ex,f.it.rx.sets);if(!o.sets[+i].d)toggleSet(d,k,true)});break}
  case'cardiochk':setChk(d,'cardio',!isChk(d,'cardio'));markStart(d);save();if(!checkComplete(d))rerender();break;
  case'cardiotimer':{const cd=cardioFor(d);startTimer(cd.long?'Long cardio':'Cardio',cardioPhases(cd).map(p=>({...p,c:/Hard/.test(p.l)?COLORS.cardio:COLORS.long})),()=>{setChk(d,'cardio',1);save();if(!checkComplete(d))rerender()});break}
  case'finish':if(S.done[d]){delete S.done[d];save();rerender();toast('Marked as not finished')}else{S.done[d]={t:Date.now(),partial:pctOf(units(d))<1};save();rerender();finishSheet(d)}break;
  case'exinfo':{const x=document.getElementById('info-'+k);x&&x.classList.toggle('hide');break}
  case'pinvid':{const cur=S.vids[el.dataset.e]||'';const u=window.prompt('Paste a YouTube link for '+E[el.dataset.e].n+' (leave empty to go back to the search):',cur);if(u===null)break;if(u.trim())S.vids[el.dataset.e]=u.trim();else delete S.vids[el.dataset.e];save();rerender();break}
  case'swap':swapSheet(k,el.dataset.b);break;
  case'lifthist':liftSheet(el.dataset.e);break;
  case'ibupload':ibUploadPick();break;
  case'ibopen':ibSheet();break;
  case'ibsave':ibSave();break;
  case'ibshare':{const tx=ibText();if(navigator.share)navigator.share({title:'InBody result',text:tx}).catch(()=>{});else(navigator.clipboard?navigator.clipboard.writeText(tx):Promise.reject()).then(()=>toast('Copied')).catch(()=>window.prompt('Copy:',tx));break}
  case'hgo':{const v2=el.dataset.v;UI.tab=v2;if(el.dataset.d){UI.date=el.dataset.d;UI.exc={};UI.exo={}}closeSheet();rerender();window.scrollTo(0,0);if(el.dataset.m&&S.whoop.connected){try{openMetric(el.dataset.m)}catch(e){}}break}
  case'wshare':shareSheet(el.dataset.d||UI.date);break;
  case'wsharego':shareGo();break;
  case'wsharetxt':{const tx=UI.share&&UI.share.text;if(!tx)break;(navigator.clipboard?navigator.clipboard.writeText(tx):Promise.reject()).then(()=>toast('Workout copied as text')).catch(()=>{window.prompt('Copy your workout:',tx)});break}
  case'wkopen':wkSheet(el.dataset.v);break;
  case'wkall':UI.wkAll=!UI.wkAll;rerender();break;
  case'bdpreset':{const p=BPRESETS.find(x=>x.id===el.dataset.v);if(p){UI.bd.week=p.w.slice();UI.bd.dirty=true;rerender();toast(p.l+' week loaded. Edit any day, then apply.')}break}
  case'bdset':{const f=el.dataset.f,v=el.dataset.v;if(f==='mobmins')UI.bd.mob.mins=+v;else UI.bd[f]=(f==='cycleLen'||f==='len')?+v:v;UI.bd.dirty=true;rerender();break}
  case'bdtog':UI.bd[el.dataset.f]=!UI.bd[el.dataset.f];UI.bd.dirty=true;rerender();break;
  case'bdmob':UI.bd.mob.auto=el.dataset.v==='auto';if(!UI.bd.mob.auto&&!UI.bd.mob.areas.length)UI.bd.mob.areas=autoAreas(todayS(),'full').slice(0,3);UI.bd.dirty=true;rerender();break;
  case'bdarea':{const a2=UI.bd.mob.areas,i=a2.indexOf(el.dataset.v);if(i<0)a2.push(el.dataset.v);else a2.splice(i,1);UI.bd.dirty=true;rerender();break}
  case'bdedit':UI.bde=+k;drawBdEdit();break;
  case'bdrep':UI.pk={mode:'rep',kind:k,j:+el.dataset.v,q:'',g:'all'};{const{tpl}=bdTpl(UI.bde);const x=k==='c'?tpl.core[+el.dataset.v]:flatOf(tpl).flat[+el.dataset.v];const m=x&&META[x[0]];if(m){const gr=PICK_GROUPS.find(q=>q[2]&&q[2].includes(m.pat));if(gr)UI.pk.g=gr[0]}}drawPicker();break;
  case'bdadd':UI.pk={mode:'add',kind:k,q:'',g:k==='c'?'core':'all'};drawPicker();break;
  case'pkg':UI.pk.g=el.dataset.v;drawPicker();break;
  case'pkback':UI.pk=null;drawBdEdit();break;
  case'bdpick':{const id=el.dataset.e,pk=UI.pk;UI.pk=null;bdMut(t=>{
      if(pk.kind==='c'){const nx=[id,E[id].t?'coreT':'coreR'];t.core=t.core||[];if(pk.mode==='rep')t.core[pk.j]=nx;else t.core.push(nx);return}
      const F=flatOf(t);if(pk.mode==='rep'){const x=F.flat[pk.j];x[0]=id;if(x[1]==='tw')x[2]=E[id].t?(E[id].s||30):12;rebuild(t,F.sizes,F.flags,F.flat)}
      else{const r=roleFor(id,t);t.blocks.push({i:[r==='tw'?[id,'tw',E[id].t?(E[id].s||30):12]:[id,r]]})}});toast((pk.mode==='rep'?'Swapped in ':'Added ')+E[id].n);break}
  case'bdmove':{const j=+el.dataset.v,dd=+el.dataset.d;bdMut(t=>{if(k==='c'){const a2=t.core;if(a2[j+dd]){const x=a2[j];a2[j]=a2[j+dd];a2[j+dd]=x}return}const F=flatOf(t);if(F.flat[j+dd]){const x=F.flat[j];F.flat[j]=F.flat[j+dd];F.flat[j+dd]=x}rebuild(t,F.sizes,F.flags,F.flat)});break}
  case'bddel':{const j=+el.dataset.v;bdMut(t=>{if(k==='c'){t.core.splice(j,1);return}const F=flatOf(t);F.flat.splice(j,1);let acc=0;for(let b=0;b<F.sizes.length;b++){if(j<acc+F.sizes[b]){F.sizes[b]--;break}acc+=F.sizes[b]}rebuild(t,F.sizes,F.flags,F.flat)});break}
  case'bdrevert':{const{key}=bdTpl(UI.bde);delete UI.bd.edits[key];drawBdEdit();break}
  case'bdapply':applyBuild();break;
  case'bdundo':undoBuild();break;
  case'bddiscard':initBd();rerender();toast('Builder reset to your current plan');break;
  case'alllifts':UI.allLifts=!UI.allLifts;rerender();break;
  case'histday':closeSheet();UI.date=el.dataset.d;UI.tab='train';UI.exc={};UI.exo={};rerender();window.scrollTo(0,0);break;
  case'demo':openPlayer(el.dataset.e);break;
  case'vidchange':{const ex=el.dataset.e;const u=window.prompt('Paste a YouTube link (Shorts or normal) for '+E[ex].n+':','');if(u===null)break;const id=parseYT(u);if(!id){toast('That doesn\u2019t look like a YouTube link');break}S.vids[ex]=id;save();drawPlayer();toast('Video updated');break}
  case'vidreset':{delete S.vids[el.dataset.e];save();drawPlayer();break}
  case'doswap':{const slot=k,base=el.dataset.b,to=el.dataset.e,scope=el.dataset.s;const prev={day:S.swaps[d]&&S.swaps[d][slot],all:S.swapsAll[base]};
    if(scope==='day'){S.swaps[d]=S.swaps[d]||{};if(to===(S.swapsAll[base]||base))delete S.swaps[d][slot];else S.swaps[d][slot]=to}else{if(S.swaps[d])delete S.swaps[d][slot];if(to===base)delete S.swapsAll[base];else S.swapsAll[base]=to}
    save();closeSheet();rerender();toast('Replaced with '+E[to].n,()=>{S.swaps[d]=S.swaps[d]||{};if(prev.day)S.swaps[d][slot]=prev.day;else delete S.swaps[d][slot];if(prev.all)S.swapsAll[base]=prev.all;else delete S.swapsAll[base]});break}
  case'undoswap':{const slot=k,base=el.dataset.b;if(S.swaps[d]&&S.swaps[d][slot])delete S.swaps[d][slot];else delete S.swapsAll[base];save();rerender();toast('Back to '+E[base].n);break}
  case'toastundo':if(UI.undo){UI.undo();UI.undo=null;save();rerender()}document.getElementById('toast').classList.add('hide');break;
  case'move':UI.mv={mode:'move'};moveSheet();break;
  case'obopen':closeSheet();openOnboarding();break;
  case'obclose':closeOnboarding();break;
  case'oblink':{const c=window.prompt('Paste the sync code from your other phone (Settings → Cloud backup):','');if(c)syncLink(c);break}
  case'obskip':closeOnboarding();UI.fresh=false;save();toast('Using the sample plan. Build your own anytime in Settings.');break;
  case'obrestore':if(window.confirm('Go back to your previous plan? Your logs stay.'))restorePlan();break;
  case'obback':UI.ob.step=Math.max(0,UI.ob.step-1);if(OB_STEPS[UI.ob.step]==='suppq'&&UI.ob.a.supps!=='quiz')UI.ob.step--;drawOb();break;
  case'obsqpick':{const f=el.dataset.f;UI.ob.a.sq[f]=el.dataset.v;const sc2=document.getElementById('onb').scrollTop;drawOb();document.getElementById('onb').scrollTop=sc2;break}
  case'obsqtog':{sqToggle(UI.ob.a.sq,el.dataset.f,el.dataset.v);const sc2=document.getElementById('onb').scrollTop;drawOb();document.getElementById('onb').scrollTop=sc2;break}
  case'sqopen':sqOpen();break;
  case'sqmode':UI.sq.mode=el.dataset.v;UI.sq.keepScroll=true;drawSq();break;
  case'sqpick':UI.sq.a[el.dataset.f]=el.dataset.v;UI.sq.keepScroll=true;drawSq();break;
  case'sqtog':sqToggle(UI.sq.a,el.dataset.f,el.dataset.v);UI.sq.keepScroll=true;drawSq();break;
  case'sqgo':{const q=UI.sq;if(!(q.a.goals||[]).length&&!(q.a.issues||[]).filter(x=>x!=='none').length){toast('Pick at least one goal or issue');break}const R=sqRecommend(q.a);const cur=new Set(S.supps.map(x=>{const i=suppInfo(x.n);return i?i.id:null}));q.sel={};R.list.forEach(x=>{if(!(q.mode==='improve'&&cur.has(x.id)))q.sel[x.id]=true});q.view='r';drawSq();break}
  case'sqsel':{const v2=el.dataset.v;UI.sq.sel[v2]=!UI.sq.sel[v2];UI.sq.keepScroll=true;drawSq();break}
  case'sqback':UI.sq.view='q';drawSq();break;
  case'sqsave':sqSave();break;
  case'obnext':{const st=OB_STEPS[UI.ob.step];if(st==='schedule'&&UI.ob.a.days.length<2){toast('Pick at least 2 lifting days');break}UI.ob.step=Math.min(OB_STEPS.length-1,UI.ob.step+1);if(OB_STEPS[UI.ob.step]==='suppq'&&UI.ob.a.supps!=='quiz')UI.ob.step++;drawOb();break}
  case'obpick':{const f=el.dataset.f,v=el.dataset.v;UI.ob.a[f]=isNaN(+v)?v:+v;drawOb();break}
  case'obtog':{const f=el.dataset.f,v=el.dataset.v;const arr=UI.ob.a[f]=UI.ob.a[f]||[];const i=arr.indexOf(v);if(i>=0)arr.splice(i,1);else arr.push(v);drawOb();break}
  case'obday':{const v=+el.dataset.v,a2=UI.ob.a;const i=a2.days.indexOf(v);if(i>=0)a2.days.splice(i,1);else{if(a2.days.length>=6){toast('Six lifting days is the maximum');break}a2.days.push(v)}if(a2.days.includes(+a2.longDay))a2.longDay=-1;drawOb();break}
  case'obfinish':obFinish();break;
  case'mvmode':UI.mv={mode:el.dataset.v};moveSheet();break;
  case'dosched':{const mode=(UI.mv&&UI.mv.mode)||'move',tg=el.dataset.d;const last=d;if(doSchedule(mode,tg)){closeSheet();UI.date=mode==='move'?tg:d;rerender();toast((mode==='move'?'Moved to ':'Copied to ')+short(tg),()=>{undoSched()})}break}
  case'undosched':{const e=undoSched();if(e){closeSheet();rerender();toast('Undone: '+e.label)}else toast('Nothing to undo');break}
  case'resetsched':{if(resetSchedule()){rerender();toast('Schedule reset',()=>{undoSched()})}break}
  case'settings':settingsSheet();break;
  case'close':closeSheet();break;
  case'tadj':if(TM){const dv=+el.dataset.v;if(TM.paused)TM.left=Math.max(1,TM.left+dv);else TM.end=Math.max(Date.now()+1000,TM.end+dv*1000);drawTimer()}break;
  case'tpause':if(TM){if(TM.paused){TM.end=Date.now()+TM.left*1000;TM.paused=false}else{TM.left=(TM.end-Date.now())/1000;TM.paused=true}drawTimer()}break;
  case'tstop':TM=null;drawTimer();break;
  case'prefset':{prefs()[el.dataset.f]=el.dataset.v;save();applyDisplay();rerender();settingsSheet();break}
  case'preftog':{const p2=prefs(),f2=el.dataset.f;p2[f2]=!p2[f2];if(f2==='alerts'&&p2.alerts)askAlerts();if(f2==='wake'&&!p2.wake)wakeOff();save();settingsSheet();break}
  case'plates':plateSheet(el.dataset.e,el.dataset.w);break;
  case'pl8w':UI.pl8.w=Math.max(0,Math.round((+UI.pl8.w+(imperial()?(+el.dataset.v>0?5:-5)/LB:+el.dataset.v))*100)/100);drawPlates();break;
  case'pl8barlb':prefs().barLb=+el.dataset.v;save();drawPlates();break;
  case'pl8bar':prefs().bar=+el.dataset.v;save();drawPlates();break;
  case'pl8p':{const p2=prefs(),v2=+el.dataset.v,i2=p2.plates.indexOf(v2);if(i2>=0)p2.plates.splice(i2,1);else p2.plates.push(v2);save();drawPlates();break}
  case'rpe':{const[slot,i]=k.split('|');const f=findItem(d,slot);if(!f)break;const o=slotLog(d,slot,f.it.ex,f.it.rx.sets);const v2=+el.dataset.v;if(v2)o.sets[+i].e=v2;else o.sets[+i].e=0;UI.rpeAsk=null;save();rerender();break}
  case'focus':focusOpen();break;
  case'report':reportSheet(el.dataset.v);break;
  case'platswap':{const from=el.dataset.e,to=el.dataset.v;S.swapsAll[from]=to;save();closeSheet();rerender();toast('Swapped to '+E[to].n+' in every session',()=>{delete S.swapsAll[from]});break}
  case'rcopen':UI.rc=null;readinessSheet(d===todayS()?d:todayS());break;
  case'rcset':UI.rc[el.dataset.f]=+el.dataset.v;readinessSheet(UI.rc.d);break;
  case'rcsave':{const q=UI.rc,r=readinessScore(q.d,q.sore,q.energy);S.rcheck=S.rcheck||{};S.rcheck[q.d]={sore:q.sore,energy:q.energy,score:r.score,lvl:r.lvl};S.ready[q.d]=r.lvl;save();closeSheet();rerender();toast('Today set to '+{g:'Green: full session',y:'Yellow: lighter day',r:'Red: recovery only'}[r.lvl]);break}
  case'fxadj':{const f2=el.dataset.f;UI.fx[f2]=Math.max(0,Math.round(((+UI.fx[f2]||0)+ +el.dataset.v)*100)/100);drawFocus();break}
  case'fxdone':{const q=UI.fx,n=nextSet(q.d);if(!n)break;const o=slotLog(q.d,n.it.slot,n.it.ex,n.it.rx.sets),s2=o.sets[n.r];if(q.w!==''&&q.w!=null)s2.w=String(q.w);s2.r=String(q.r);toggleSet(q.d,n.it.slot+'|'+n.r,true);if(UI.fx){UI.fx.k=null;if(prefs().rpe&&!E[n.it.ex].t){UI.fx.askRpe=n.it.slot+'|'+n.r}drawFocus();if(UI.fx&&UI.fx.askRpe){const box=document.querySelector('.fxwrap');if(box){const kk=UI.fx.askRpe;box.insertAdjacentHTML('afterbegin',`<div class="fxrpe">Last set: ${rpeRow(kk,{}).replace(/data-a="rpe"/g,'data-a="fxrpe"')}</div>`)}}}break}
  case'fxrpe':{const[slot,i]=k.split('|');const f=findItem(UI.fx.d,slot);if(f){const o=slotLog(UI.fx.d,slot,f.it.ex,f.it.rx.sets);o.sets[+i].e=+el.dataset.v||0;save()}UI.fx.askRpe=null;const r2=document.querySelector('.fxrpe');r2&&r2.remove();break}
  case'fxskip':{const q=UI.fx,n=nextSet(q.d);if(!n)break;toggleSet(q.d,n.it.slot+'|'+n.r,true);TM=null;drawTimer();UI.fx.k=null;drawFocus();break}
  case'extend':{const ne=document.getElementById('extEnd').value;if(!ne||ne<=S.end){toast('Pick a date after '+short(S.end));break}const r=analyze().rec;S.ext.push({from:addD(S.end,1),to:ne,vol:r.vol,extra:r.extra,trim:r.trim});S.end=ne;save();rerender();toast('Plan extended to '+short(ne));break}
  case'unextend':{const x=S.ext.pop();if(x){S.end=addD(x.from,-1);save();rerender();toast('Extension removed')}break}
  case'supp':{const dd=UI.sday||todayS();S.suppLog[dd]=S.suppLog[dd]||{};if(S.suppLog[dd][k])delete S.suppLog[dd][k];else S.suppLog[dd][k]=1;if(!Object.keys(S.suppLog[dd]).length)delete S.suppLog[dd];save();rerender();break}
  case'sopen':UI.sx=UI.sx===k?null:k;rerender();break;
  case'sday':{const nd=addD(UI.sday||todayS(),+el.dataset.v);if(nd<=todayS()){UI.sday=nd;rerender()}break}
  case'stoday':UI.sday=todayS();rerender();break;
  case'sdaytoggle':{const dd=el.dataset.d;if(dd>todayS())break;S.suppLog[dd]=S.suppLog[dd]||{};if(S.suppLog[dd][k])delete S.suppLog[dd][k];else S.suppLog[dd][k]=1;if(!Object.keys(S.suppLog[dd]).length)delete S.suppLog[dd];save();rerender();break}
  case'sm':{const cur=UI.sm[k]||todayS().slice(0,7);const[y,m]=cur.split('-').map(Number);const nd=new Date(y,m-1+(+el.dataset.v),1);UI.sm[k]=nd.getFullYear()+'-'+pad(nd.getMonth()+1);rerender();break}
  case'sguide':guideSheet('');break;
  case'gadd':{const e=SUPP_DB.find(x=>x.id===el.dataset.v);if(e)suppSheet(null,e);break}
  case'suppedit':UI.suppEdit=!UI.suppEdit;rerender();break;
  case'suppopen':suppSheet(k);break;
  case'scol':UI.sdraft.c=el.dataset.v;el.parentNode.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b===el));break;
  case'delsupp':{const i=S.supps.findIndex(s=>s.id===k);if(i<0)break;const rem=S.supps.splice(i,1)[0];save();closeSheet();rerender();toast('Removed '+rem.n,()=>S.supps.splice(i,0,rem));break}
  case'addsupp':suppSheet();break;
  case'suppsave':{const n=document.getElementById('sn').value.trim();if(!n){toast('Add a name first');break}const inf=suppInfo(n);const o={n,d:document.getElementById('sd').value.trim()||(inf?inf.d.replace(/ daily$/,''):'1 serving'),slot:document.getElementById('ss').value,note:document.getElementById('snote').value.trim()||'',c:UI.sdraft.c};if(k){Object.assign(S.supps.find(q=>q.id===k),o);toast('Saved '+n)}else{S.supps.push(Object.assign({id:'s'+Date.now()},o));toast(inf?'Added '+n+'. Tap it to see benefits and best time.':'Added '+n)}save();closeSheet();rerender();break}
  case'habtoday':case'habday':{habToggle(k,el.dataset.d||todayS());save();rerender();break}
  case'habopen':UI.hx=UI.hx===k?null:k;rerender();break;
  case'habm':{const cur=UI.hm[k]||todayS().slice(0,7);const[y,m]=cur.split('-').map(Number);const nd=new Date(y,m-1+(+el.dataset.v),1);UI.hm[k]=nd.getFullYear()+'-'+pad(nd.getMonth()+1);rerender();break}
  case'habadd':habSheet(null);break;
  case'habedit':habSheet(k);break;
  case'hemo':UI.hdraft.e=el.dataset.v;el.parentNode.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b===el));break;
  case'hcol':UI.hdraft.c=el.dataset.v;el.parentNode.querySelectorAll('button').forEach(b=>b.classList.toggle('on',b===el));break;
  case'habsave':{const n=document.getElementById('hn').value.trim();if(!n){toast('Give the habit a name');break}
    const lk=document.getElementById('hlk').value;let link=null;if(lk){let tv=parseFloat((document.getElementById('hlt').value||'').replace(',','.'));if(isNaN(tv)||tv<=0)tv=LINKS[lk].def;link={k:lk,t:tv}}
    let hb;if(k){hb=S.habits.find(h=>h.id===k);Object.assign(hb,{n,e:UI.hdraft.e,c:UI.hdraft.c})}else{hb={id:'h'+Date.now(),n,e:UI.hdraft.e,c:UI.hdraft.c};S.habits.push(hb);UI.hx=hb.id}
    if(link){hb.link=link;delete hb.noAuto}else{if(hb.link||k)hb.noAuto=true;delete hb.link}
    let msg='';if(!hb.link&&!hb.noAuto){const g=guessLink(n);if(g){hb.link=g;msg='Linked to WHOOP '+LINKS[g.k].short+' automatically'}}
    save();closeSheet();rerender();if(msg)toast(msg);break}
  case'habdel':{const i=S.habits.findIndex(h=>h.id===k);if(i<0)break;const rem=S.habits.splice(i,1)[0];if(UI.hx===k)UI.hx=null;save();closeSheet();rerender();toast('Deleted '+rem.n,()=>S.habits.splice(i,0,rem));break}
  case'syncopen':syncSheet();break;
  case'syncon':syncTurnOn();break;
  case'syncoff':if(window.confirm('Turn off cloud backup on this device? Your cloud copy stays until you reuse the code.')){S.sync.on=false;save();syncSheet()}break;
  case'syncnow':syncNow(true).then(()=>syncSheet());break;
  case'synccopy':{const c=fmtCode(S.sync.key);(navigator.clipboard?navigator.clipboard.writeText(c):Promise.reject()).then(()=>toast('Sync code copied')).catch(()=>window.prompt('Your sync code:',c));break}
  case'synclink':syncLink(document.getElementById('synclink').value);break;
  case'bkfile':bkDownload();break;
  case'bkload':bkLoad();break;
  case'bkcopy':{const tx=document.getElementById('bk');tx.value=JSON.stringify(S);tx.select();try{navigator.clipboard.writeText(tx.value).then(()=>toast('Backup copied'),()=>toast('Select the text and copy it'))}catch(e){toast('Select the text and copy it')}break}
  case'bkrestore':{try{const o=JSON.parse(document.getElementById('bk').value);if(!o||!o.start)throw 0;S=Object.assign(defaults(),o);save();closeSheet();rerender();toast('Backup restored')}catch(e){toast('That text isn\u2019t a valid backup')}break}
  case'reset':if(window.confirm('Delete all logs, habits and settings? This cannot be undone.')){S=defaults();save();closeSheet();UI.date=S.start;rerender()}break;
  }
});
document.addEventListener('input',ev=>{const el=ev.target;if(!el.dataset)return;
  if(el.dataset.in==='ob'&&UI.ob){UI.ob.a[el.dataset.f]=el.value}
  if(el.dataset.in==='sname')suppNameInput(el);
  if(el.dataset.in==='pkq'&&UI.pk){UI.pk.q=el.value;const L2=document.getElementById('pklist');if(L2)L2.innerHTML=pickList()}
  if(el.dataset.in==='gq'){const q=el.value,pos=el.selectionStart;guideSheet(q);const n=document.getElementById('gq');if(n){n.focus();try{n.setSelectionRange(pos,pos)}catch(e){}}}
});
document.addEventListener('change',ev=>{
  const el=ev.target;if(!el.dataset||!el.dataset.in)return;const t=el.dataset.in,k=el.dataset.k,d=UI.date;
  if(t==='w'||t==='r'){const[slot,i]=k.split('|');const f=findItem(d,slot);if(!f)return;const o=slotLog(d,slot,f.it.ex,f.it.rx.sets);const old=o.sets[+i][t];let nv=el.value.replace(',','.').trim();if(t==='w'&&nv!==''&&!isNaN(+nv))nv=String(fromDisp(nv));o.sets[+i][t]=nv;
    // copy the new value to the following sets of this move that are not ticked yet and were empty or still matched the old value
    if(nv!=='')for(let j=+i+1;j<o.sets.length;j++){const q=o.sets[j];if(q.d||!(q[t]===''||q[t]===old))continue;q[t]=nv;const inp=document.querySelector(`input[data-in="${t}"][data-k="${slot}|${j}"]`);if(inp)inp.value=t==='w'?toDisp(nv):nv}
    save();HISTCACHE=null}
  else if(t==='map'){const AM=activeMap();if(AM[k]!==el.value){snapSched(`${DN[k]}s changed from ${T[AM[k]].n} to ${T[el.value].n}`,[],[],true);AM[k]=el.value;save();rerender();toast(DN[k]+' is now '+T[el.value].n,()=>{undoSched()})}}
  else if(t==='mvdate'){if(el.value){const mode=(UI.mv&&UI.mv.mode)||'move';if(doSchedule(mode,el.value)){closeSheet();UI.date=mode==='move'?el.value:UI.date;rerender();toast((mode==='move'?'Moved to ':'Copied to ')+short(el.value),()=>{undoSched()})}}}
  else if(t==='pl8'){const v2=parseFloat(el.value.replace(',','.'));if(!isNaN(v2)){UI.pl8.w=fromDisp(v2);drawPlates()}}
  else if(t==='bdday'){UI.bd.week[+k]=el.value;UI.bd.dirty=true;rerender()}
  else if(t==='bdname'){const v2=el.value.trim();if(v2)bdMut(x=>{x.n=v2})}
  else if(t==='start'){if(el.value&&el.value<S.end){S.start=el.value;save();rerender();toast('Plan now starts '+short(el.value))}}
  else if(t==='hlk'){const v2=el.value;document.getElementById('hlrow').classList.toggle('hide',!v2);if(v2){const L=LINKS[v2];document.getElementById('hllab').textContent='Done when '+L.l.toLowerCase()+' '+L.op+(L.u?' ('+L.u+')':'');document.getElementById('hlt').value=L.def}}
  else if(t==='sday'){if(el.value&&el.value<=todayS()){UI.sday=el.value;rerender()}}
  else if(t==='ob'&&UI.ob){UI.ob.a[el.dataset.f]=el.value;if(el.tagName==='SELECT')drawOb()}
  else if(t==='theme'){applyTheme(el.value);try{localStorage.setItem(KEY+'-theme',el.value)}catch(e){}}
});
function applyTheme(v){if(v==='auto')document.documentElement.removeAttribute('data-theme');else document.documentElement.setAttribute('data-theme',v)}
try{applyTheme(localStorage.getItem(KEY+'-theme')||'auto')}catch(e){}
(function(){const q=new URLSearchParams(location.search);const w=q.get('whoop');if(w){history.replaceState(null,'',location.pathname);if(w==='connected'){S.whoop.last=0;save();if(!S.whoop.key)setTimeout(()=>toast('WHOOP connected. Go back to the IRON app on your home screen.'),300)}else setTimeout(()=>toast('WHOOP connection failed ('+(q.get('reason')||'unknown')+')'),300)}})();
applyProfile();applyCustom();prefs();applyDisplay();UI.fresh=FRESH;
autoLinkHabits();
rerender();
if(FRESH)setTimeout(openOnboarding,250);
if(WH_ON&&(S.whoop.connected||S.whoop.pending))whoopSync(false);
if(syncOn())setTimeout(()=>syncNow(false),800);
window.addEventListener('online',()=>{if(syncOn())syncNow(false)});
document.addEventListener('visibilitychange',()=>{if(syncOn()&&document.visibilityState==='hidden'){clearTimeout(SYNC_T);syncNow(false)}if(syncOn()&&document.visibilityState==='visible')syncNow(false);if(document.visibilityState==='visible'&&WH_ON&&(S.whoop.connected||S.whoop.pending))whoopSync(false)});
window.__S=()=>S;window.__est=estimate;window.__UI=UI;window.__iron={save,rerender,syncNow,syncOn,mergeState};

