"use strict";
/* ---------- FULLER ARABIC: text with no built-in translation is translated once by the server and cached here ---------- */
const AR_DYN_LS='iron-ar-dyn';let AR_DYN={};try{AR_DYN=JSON.parse(localStorage.getItem(AR_DYN_LS)||'{}')}catch(e){}
const AR_Q=new Set(),AR_SENT=new Set();let AR_T=null,AR_OFF=false;
/* only app-written text is ever sent: exercise names, cues and protection notes, and supplement guide content.
   Anything you typed (names, notes, habits) stays on the phone. */
let AR_OK=null;
function arAllowed(){if(AR_OK)return AR_OK;AR_OK=new Set();const add=x=>{if(typeof x==='string'&&x.trim())AR_OK.add(x.trim())};
  Object.values(E).forEach(e=>{add(e.n);add(e.c);if(e.p){add(e.p);try{add(protOf(e));add('Protects: '+protOf(e))}catch(_){}}try{add(cueOf(e))}catch(_){}});
  (typeof SUPP_DB!=='undefined'?SUPP_DB:[]).forEach(e=>{add(e.n);add(e.d);add(e.w);add(e.tip);add(e.c);(e.b||[]).forEach(add)});
  Object.values(typeof MUSC_NAME!=='undefined'?MUSC_NAME:{}).forEach(add);return AR_OK}
const arWants=k=>k.length>=2&&k.length<=600&&/[A-Za-z]{2}/.test(k)&&arAllowed().has(k);
function arDyn(k){const v=AR_DYN[k];if(v)return v;if(!AR_OFF&&!AR_SENT.has(k)&&arWants(k)){AR_Q.add(k);clearTimeout(AR_T);AR_T=setTimeout(arFlush,350)}return null}
async function arFlush(){
  if(!isAr()||AR_OFF||!AR_Q.size)return;const batch=[...AR_Q].slice(0,60);batch.forEach(s=>{AR_Q.delete(s);AR_SENT.add(s)});
  let j=null;try{const r=await fetch('/api/translate',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({lang:'ar',strings:batch})});
    if(r.status===501||r.status===404){AR_OFF=true;return}j=await r.json()}catch(e){batch.forEach(s=>AR_SENT.delete(s));return}
  const got=(j&&j.t)||{};if(Object.keys(got).length){Object.assign(AR_DYN,got);try{localStorage.setItem(AR_DYN_LS,JSON.stringify(AR_DYN))}catch(e){}arApply(got)}
  if(AR_Q.size)AR_T=setTimeout(arFlush,50)}
/* swap text in place (no re-render, so taps in progress are never lost) */
function arApply(got){const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentNode&&(n.parentNode.nodeName==='SCRIPT'||n.parentNode.nodeName==='STYLE'||n.parentNode.closest('[data-raw]'))?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});
  const L=[];while(w.nextNode())L.push(w.currentNode);L.forEach(n=>{const k=n.nodeValue.trim();if(got[k])n.nodeValue=n.nodeValue.replace(k,got[k])});
  document.querySelectorAll('[placeholder]').forEach(e=>{const p=e.getAttribute('placeholder');if(got[p])e.setAttribute('placeholder',got[p])})}
/* built-in Arabic for the newer screens */
Object.assign(AR,{
 'Injuries and limits':'الإصابات والقيود','Add an injury from today':'أضف إصابة من اليوم','Healed':'تعافيت','Still hurts':'ما زالت تؤلم','Remove':'إزالة','Started':'بدأت','Note (optional)':'ملاحظة (اختياري)',
 'No active injuries. All moves are in.':'لا توجد إصابات نشطة. كل التمارين متاحة.','from your questionnaire':'من استبيانك',
 'While an injury is active, IRON swaps moves that load it for safe ones and adds mobility for that area. Mark it healed and your normal moves come back from that day.':'أثناء الإصابة يستبدل IRON التمارين التي تُجهد المنطقة بأخرى آمنة ويضيف تمارين مرونة لها. عند التعافي تعود تمارينك المعتادة من ذلك اليوم.',
 'Lower back':'أسفل الظهر','Shoulder':'الكتف','Knee':'الركبة','Elbow':'المرفق','Wrist':'الرسغ','Hip':'الورك','Ankle':'الكاحل',
 'Reminders':'التذكيرات','Workout':'التمرين','Supplements':'المكمّلات','Bedtime':'وقت النوم','Sent as notifications, even when IRON is closed.':'تصلك كإشعارات حتى عندما يكون IRON مغلقًا.',
 'A reminder on training days with the session name':'تذكير في أيام التمرين مع اسم الجلسة','What to take today':'ما تتناوله اليوم','Wind down for 7+ hours of sleep':'استعد لنوم 7 ساعات أو أكثر',
 'Search':'بحث','Pages':'الصفحات','Settings':'الإعدادات','Exercises':'التمارين','Past sessions':'جلسات سابقة','Nothing found. Try a shorter word.':'لا نتائج. جرّب كلمة أقصر.',
 'Send feedback':'أرسل ملاحظاتك','Idea':'فكرة','Problem':'مشكلة','I like this':'أعجبني','Send':'إرسال','Cancel':'إلغاء','Ideas or problems':'أفكار أو مشاكل',
 'Privacy and your data':'الخصوصية وبياناتك','Download or delete':'تنزيل أو حذف','Download all my data':'تنزيل كل بياناتي','Delete my data':'حذف بياناتي','Read the full privacy policy':'اقرأ سياسة الخصوصية كاملة',
 'Delete everything?':'حذف كل شيء؟','Yes, delete everything':'نعم، احذف كل شيء','Keep my data':'احتفظ ببياناتي','Download my data':'تنزيل بياناتي',
 'Share with a coach':'شارك مع مدرّب','Private read-only link':'رابط خاص للقراءة فقط','Your link':'رابطك','Send link':'إرسال الرابط','Turn off link':'إيقاف الرابط','Make a fresh link':'إنشاء رابط جديد','Link works for':'مدة صلاحية الرابط','1 week':'أسبوع','30 days':'30 يومًا','90 days':'90 يومًا',
 'Recovery vs training':'التعافي مقابل التمرين','Your first week':'أسبوعك الأول','Hide':'إخفاء','Build your plan':'أنشئ خطتك','Add IRON to your Home Screen':'أضف IRON إلى الشاشة الرئيسية','Turn on rest-timer alerts':'فعّل تنبيهات مؤقت الراحة',
 'Finish your first session':'أكمل جلستك الأولى','Connect WHOOP':'اربط WHOOP','Turn on cloud backup':'فعّل النسخ الاحتياطي السحابي','Set a goal':'حدّد هدفًا',
 'Quick start · 1 minute':'بداية سريعة · دقيقة واحدة','Display':'العرض','Workouts':'التمارين','Plan':'الخطة','Injuries':'الإصابات','Data':'البيانات','Your data':'بياناتك',
 'Background alerts:':'التنبيهات في الخلفية:','Turn on alerts':'فعّل التنبيهات','Test in 10 s':'تجربة خلال 10 ث','Evidence':'الأدلة','Strong evidence':'أدلة قوية','Good evidence':'أدلة جيدة','Mixed evidence':'أدلة متباينة','Little evidence':'أدلة قليلة',
 'FRONT':'أمام','BACK':'خلف'});
/* the new Home */
Object.assign(AR,{
 'Green day':'يوم أخضر','Yellow day':'يوم أصفر','Red day':'يوم أحمر','Recovery':'التعافي','Today':'اليوم','Yesterday':'أمس','Tomorrow':'غدًا','Done':'تم','Recover':'تعافٍ','Missed':'فائت','Planned':'مخطط',
 'Full session today. Tap to see why':'جلسة كاملة اليوم. اضغط لمعرفة السبب','Lighter session today. Tap to see why':'جلسة أخف اليوم. اضغط لمعرفة السبب','Recovery only today. Tap to see why':'تعافٍ فقط اليوم. اضغط لمعرفة السبب',
 'Full session today. Tap to hide':'جلسة كاملة اليوم. اضغط للإخفاء','Lighter session today. Tap to hide':'جلسة أخف اليوم. اضغط للإخفاء','Recovery only today. Tap to hide':'تعافٍ فقط اليوم. اضغط للإخفاء',
 'Open Body ›':'افتح الجسم ›','How do you feel today?':'كيف تشعر اليوم؟','A 10-second readiness check sets today’s intensity':'فحص جاهزية في 10 ثوانٍ يحدد شدة اليوم','Connect WHOOP to do this automatically ›':'اربط WHOOP ليتم ذلك تلقائيًا ›',
 'No recovery yet':'لا يوجد تعافٍ بعد','Outside your plan':'خارج خطتك','Open the plan':'افتح الخطة','Walk, stretch and sleep well':'امشِ وتمدد ونم جيدًا',
 'See today’s session':'اعرض جلسة اليوم','See this session':'اعرض هذه الجلسة','Log it now':'سجّلها الآن','Preview this day':'اعرض هذا اليوم','Share this workout':'شارك هذا التمرين',
 'Today’s checks':'مهام اليوم','All done. Nice work.':'أنجزت كل شيء. عمل رائع.','Build your supplement stack':'أنشئ قائمة مكمّلاتك','Estimated 1-rep max':'أقصى تكرار تقديري',
 'At a glance':'لمحة سريعة','Volume this week':'الحجم هذا الأسبوع','Weekly report':'التقرير الأسبوعي','Goal':'الهدف','Goals':'الأهداف','Set one':'حدّد هدفًا','A target with a date':'هدف بموعد',
 'Body':'الجسم','Upload InBody':'ارفع InBody','Photo or PDF':'صورة أو PDF','Latest weight':'آخر وزن','Travel':'السفر','No trips':'لا رحلات','On a trip':'في رحلة','Plan a hotel workout':'خطط لتمرين في الفندق',
 'Sun':'أحد','Mon':'اثنين','Tue':'ثلاثاء','Wed':'أربعاء','Thu':'خميس','Fri':'جمعة','Sat':'سبت','This week already counts.':'هذا الأسبوع محسوب بالفعل.'});
AR_PART.push(
 [/^Good morning, (.+)$/,'صباح الخير، $1'],[/^Good afternoon, (.+)$/,'مساء الخير، $1'],[/^Good evening, (.+)$/,'مساء الخير، $1'],
 [/^Good morning$/,'صباح الخير'],[/^Good afternoon$/,'مساء الخير'],[/^Good evening$/,'مساء الخير'],
 [/^(\d+) moves · about (.+?)( · trimmed for recovery)?$/,(m,a,b,c)=>a+' تمارين · نحو '+b+(c?' · مخففة للتعافي':'')],
 [/^Start ([A-Z][^ ]* [A-Z0-9])$/,'ابدأ $1'],[/^Continue · (\d+)% done$/,'تابع · $1% منجز'],
 [/^Protein (\d+) of (\d+) g$/,'البروتين $1 من $2 غ'],[/^(.+) to go$/,'متبقٍ: $1'],
 [/^(\d+)-week streak\.$/,'سلسلة $1 أسابيع.'],[/^(\d+) more sessions? this week keeps it going\.$/,'$1 جلسات إضافية هذا الأسبوع تحافظ عليها.'],
 [/^([+-]?\d+) kg since (.+)$/,'$1 كغ منذ $2'],[/^Cycle (\d+) · week (\d+)\/(\d+)$/,'الدورة $1 · الأسبوع $2/$3'],[/^(\d+) sets$/,'$1 مجموعات']);
Object.assign(AR,{'Weekly report · new':'التقرير الأسبوعي · جديد','+20 g':'+20 غ'});
AR_PART.push([/^sessions last week · (\d+) PRs?$/,'جلسات الأسبوع الماضي · $1 أرقام قياسية'],[/^\+(\d+) more$/,'+$1 أخرى']);
