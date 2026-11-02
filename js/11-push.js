"use strict";
/* =====================================================================
   BACKGROUND ALERTS (Web Push)
   A web app can't keep its own timer running once the phone locks or the app
   is in the background. So when a rest timer starts, the phone tells your
   server when each alert is due and the server sends a push notification at
   that second. The same channel delivers reminders.
   On iPhone this needs IRON added to the Home Screen and notifications allowed.
   ===================================================================== */
const PUSH_LS='iron-push-sub';
const pushSupported=()=>'serviceWorker' in navigator&&'PushManager' in window&&'Notification' in window&&location.protocol!=='file:';
function b64uToU8(s){const p='='.repeat((4-s.length%4)%4),b=atob((s+p).replace(/-/g,'+').replace(/_/g,'/'));return Uint8Array.from(b,c=>c.charCodeAt(0))}
let PUSH_SUB=null;
async function pushSub(ask){
  if(!pushSupported()||!prefs().alerts)return null;
  if(PUSH_SUB)return PUSH_SUB;
  if(Notification.permission==='default'&&ask){try{await Notification.requestPermission()}catch(e){}}
  if(Notification.permission!=='granted')return null;
  try{const reg=await navigator.serviceWorker.ready;let sub=await reg.pushManager.getSubscription();
    if(!sub){const r=await fetch('/api/push?step=key',{cache:'no-store'});if(!r.ok)return null;const{publicKey}=await r.json();sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:b64uToU8(publicKey)})}
    PUSH_SUB=sub.toJSON();try{localStorage.setItem(PUSH_LS,JSON.stringify(PUSH_SUB))}catch(_){}return PUSH_SUB}catch(e){logError&&logError('push subscribe: '+(e&&e.message),'push');return null}
}
/* items for the current timer, from the phase it is on */
function timerItems(){if(!TM||TM.paused)return[];const out=[];let t=TM.end;for(let i=TM.i;i<TM.phases.length&&out.length<60;i++){if(i>TM.i)t+=TM.phases[i].s*1000;const nx=TM.phases[i+1];
  out.push({at:t,title:i===TM.phases.length-1?TM.title+' is over':TM.phases[i].l+' done',body:i===TM.phases.length-1?(TM.phases[i].l||'Time to go'):'Next: '+nx.l,tag:'iron-rest'})}return out}
let PUSH_Q=Promise.resolve();
function timerChanged(){const tm=TM;PUSH_Q=PUSH_Q.then(async()=>{
  if(tm&&tm.pushId){const id=tm.pushId;tm.pushId=null;tm.pushOk=false;fetch('/api/push?step=cancel',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id})}).catch(()=>{})}
  if(!tm||tm!==TM||tm.paused)return;const sub=await pushSub(false);if(!sub||tm!==TM)return;
  const items=timerItems();if(!items.length)return;const id='t'+Date.now()+Math.random().toString(36).slice(2,8);
  try{const r=await fetch('/api/push?step=schedule',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id,sub,items})});if(r.ok&&tm===TM){tm.pushId=id;tm.pushOk=true}}catch(e){}
}).catch(()=>{})}

function pushStatus(){if(!pushSupported())return/iPhone|iPad/.test(navigator.userAgent)&&!navigator.standalone?'Add IRON to your Home Screen (Share → Add to Home Screen), open it from there, then turn on alerts.':'This browser can’t receive alerts in the background.';
  if(Notification.permission==='denied')return'Notifications are blocked. Allow them for IRON in your phone’s settings.';if(Notification.permission!=='granted')return'Off. Tap Turn on alerts so rest timers ring even when the phone is locked.';
  return'On. Rest timers ring even when IRON is in the background or the phone is locked.'}
document.addEventListener('click',ev=>{const el=ev.target.closest('[data-a]');if(!el)return;
  if(el.dataset.a==='pushon'){prefs().alerts=true;save();pushSub(true).then(s=>{toast(s?'Background alerts are on':'Alerts couldn’t be turned on here');settingsSheet()})}
  if(el.dataset.a==='pushtest'){pushSub(true).then(async sub=>{if(!sub){toast('Turn on alerts first');return}const r=await fetch('/api/push?step=schedule',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({id:'test'+Date.now(),sub,items:[{at:Date.now()+10000,title:'IRON test alert',body:'Background alerts work. Lock your phone next time to try it.',tag:'iron-test'}]})});toast(r.ok?'Test alert coming in 10 seconds. Lock your phone or switch apps.':'Couldn’t schedule the test')})}
});
navigator.serviceWorker&&navigator.serviceWorker.addEventListener('message',ev=>{if(ev.data&&ev.data.type==='push'&&ev.data.m&&ev.data.m.tag!=='iron-rest')toast(ev.data.m.title+(ev.data.m.body?': '+ev.data.m.body:''))});

/* ---------- daily reminders: the next 8 days are sent to the server, which pushes them on time ---------- */
const REM_KINDS=[['work','Workout','17:30','A reminder on training days with the session name'],['supp','Supplements','08:00','What to take today'],['bed','Bedtime','22:30','Wind down for 7+ hours of sleep']];
function remPrefs(){const p=prefs();p.rem=p.rem||{};REM_KINDS.forEach(([k,,t])=>{p.rem[k]=p.rem[k]||{on:false,t}});return p.rem}
function remDevice(){let id='';try{id=localStorage.getItem('iron-dev')||''}catch(e){}if(!id){id='d'+Date.now().toString(36)+Math.random().toString(36).slice(2,10);try{localStorage.setItem('iron-dev',id)}catch(e){}}return id}
function remItems(){
  const R=remPrefs(),out=[],now=Date.now(),t0=todayS();
  for(let i=0;i<8;i++){const d=addD(t0,i),at=hm=>{const[h,m]=hm.split(':').map(Number);const x=pd(d);x.setHours(h,m,0,0);return x.getTime()};
    if(R.work.on){const k=tplOf(d),t=k&&T[k];if(t&&t.k!=='rest'&&!S.done[d]){const a=at(R.work.t);if(a>now)out.push({at:a,title:'Today: '+t.n,body:t.f+(readyOf(d)==='r'?' (recovery day)':''),tag:'iron-work'})}}
    if(R.supp.on&&(S.supps||[]).length){const a=at(R.supp.t);if(a>now)out.push({at:a,title:'Supplements',body:S.supps.slice(0,6).map(s=>s.n+(s.d?' '+s.d:'')).join(', ').slice(0,150),tag:'iron-supp'})}
    if(R.bed.on){const a=at(R.bed.t);if(a>now)out.push({at:a,title:'Time to wind down',body:'Screens off soon. 7+ hours of sleep helps tomorrow’s recovery.',tag:'iron-bed'})}}
  return out}
let REM_T=null;
function remSync(ask){clearTimeout(REM_T);REM_T=setTimeout(async()=>{
  const R=remPrefs(),any=REM_KINDS.some(([k])=>R[k].on);if(!any&&!prefs().remSent)return;
  const sub=await pushSub(!!ask);if(!sub)return;
  try{const r=await fetch('/api/push?step=reminders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({device:remDevice(),sub,items:remItems()})});if(r.ok){prefs().remSent=any?Date.now():0;save()}}catch(e){}
},ask?0:1500)}
function remCard(){const R=remPrefs();return`<div class="card" id="remcard" style="margin-top:12px"><h4 class="disp" style="font-size:22px">Reminders</h4>
  <p class="muted" style="font-size:14px;margin:0 0 8px">Sent as notifications, even when IRON is closed.</p>
  ${REM_KINDS.map(([k,l,,sub])=>`<div class="remrow"><button class="obopt ${R[k].on?'on':''}" data-a="remtog" data-f="${k}"><b>${R[k].on?'✓ ':''}${l}</b><span>${sub}</span></button><input type="time" data-in="remt" data-k="${k}" value="${R[k].t}" aria-label="${l} time"></div>`).join('')}</div>`}
document.addEventListener('click',ev=>{const el=ev.target.closest('[data-a="remtog"]');if(!el)return;const R=remPrefs(),k=el.dataset.f;R[k].on=!R[k].on;save();
  if(R[k].on&&!pushSupported()){toast(pushStatus())}remSync(true);const c=document.getElementById('remcard');if(c)c.outerHTML=remCard()});
document.addEventListener('change',ev=>{const el=ev.target;if(el.dataset&&el.dataset.in==='remt'&&el.value){remPrefs()[el.dataset.k].t=el.value;save();remSync(false)}});
