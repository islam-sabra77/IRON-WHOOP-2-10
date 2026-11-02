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
