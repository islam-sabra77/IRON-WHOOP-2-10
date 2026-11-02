"use strict";
/* ---------- FEEDBACK and PRIVACY ---------- */
function feedbackSheet(){UI.fb=UI.fb||{kind:'idea'};openSheet(`<h4 class="disp">Send feedback</h4><p class="muted" style="font-size:14px;margin:0 0 8px">Ideas, problems or something you like. It goes straight to the person who builds IRON.</p>
  <div class="obrow">${[['idea','Idea'],['problem','Problem'],['love','I like this']].map(([k,l])=>`<button class="obopt ${UI.fb.kind===k?'on':''}" data-a="fbkind" data-v="${k}"><b>${l}</b></button>`).join('')}</div>
  <textarea id="fbtext" rows="5" maxlength="2000" placeholder="${UI.fb.kind==='problem'?'What happened, and what did you expect?':'Tell us more…'}" aria-label="Your feedback" style="width:100%;margin-top:8px">${esc(UI.fb.text||'')}</textarea>
  <p class="muted" style="font-size:12px;margin:4px 0 0">Sent with the screen you were on and your app version, nothing else.</p>
  <button class="cta" style="--c:var(--upper)" data-a="fbsend">Send</button><button class="cta ghost" data-a="close">Cancel</button>`)}
function privacySheet(){const so=typeof syncOn==='function'&&syncOn();openSheet(`<h4 class="disp">Privacy and your data</h4>
  <p style="font-size:14px">Your plan, logs and body data live on this phone. Nothing is sold or shared.</p>
  <ul class="pvl"><li><b>Cloud backup</b> ${so?'is on. It is encrypted on your phone first, so the server can’t read it.':'is off.'}</li>
  <li><b>WHOOP</b> ${S.whoop&&S.whoop.connected?'is connected. IRON reads recovery, sleep and workouts only.':'is not connected.'}</li>
  <li><b>InBody photos</b> are read once to fill in your numbers, then discarded.</li>
  <li><b>Reminders and alerts</b> store only the notification text and time until it is sent.</li></ul>
  <a class="cta ghost" style="text-decoration:none;display:block;text-align:center" href="privacy.html" target="_blank" rel="noopener">Read the full privacy policy</a>
  <button class="cta ghost" data-a="bkfile">Download all my data</button>
  <button class="cta" style="--c:var(--bad)" data-a="wipe1">Delete my data</button>
  <button class="cta ghost" data-a="close">Close</button>`)}
async function wipeAll(){
  toast('Deleting…');
  try{if(syncOn()){const{token}=await syncKeys(S.sync.key);await fetch('/api/sync',{method:'DELETE',headers:{'x-iron-sync':token}})}}catch(e){}
  try{const sub=PUSH_SUB||JSON.parse(localStorage.getItem(PUSH_LS)||'null');if(sub)await fetch('/api/push?step=reminders',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({device:remDevice(),sub,items:[]})})}catch(e){}
  try{if(S.whoop&&S.whoop.connected)await fetch('/api/whoop-logout',{method:'POST',headers:{'x-iron-key':S.whoop.key||''}})}catch(e){}
  try{const reg=navigator.serviceWorker&&await navigator.serviceWorker.getRegistration();if(reg){const s=await reg.pushManager.getSubscription();s&&await s.unsubscribe()}}catch(e){}
  try{localStorage.clear();sessionStorage.clear()}catch(e){}
  try{if(window.caches)for(const k of await caches.keys())await caches.delete(k)}catch(e){}
  location.replace(location.pathname)}
document.addEventListener('click',ev=>{const el=ev.target.closest('[data-a]');if(!el)return;const a=el.dataset.a;
  if(a==='feedback')feedbackSheet();
  if(a==='privacy')privacySheet();
  if(a==='fbkind'){const t=document.getElementById('fbtext');UI.fb={kind:el.dataset.v,text:t?t.value:''};feedbackSheet()}
  if(a==='fbsend'){const t=document.getElementById('fbtext'),text=(t&&t.value||'').trim();if(text.length<3){toast('Write a few words first');return}
    el.disabled=true;fetch('/api/feedback',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind:UI.fb.kind,text,tab:UI.tab,v:typeof SW_VERSION!=='undefined'?SW_VERSION:'',ua:navigator.userAgent})})
      .then(r=>{if(!r.ok)throw 0;UI.fb=null;closeSheet();toast('Thanks! Feedback sent')}).catch(()=>{el.disabled=false;toast('Couldn’t send. Check your connection and try again')})}
  if(a==='wipe1'){openSheet(`<h4 class="disp">Delete everything?</h4><p style="font-size:15px">This removes your plan, every logged workout, body data, supplements and habits from this phone${syncOn()?', deletes your cloud backup':''}${S.whoop&&S.whoop.connected?', disconnects WHOOP':''} and stops reminders. It can’t be undone.</p><p class="muted" style="font-size:14px">Tip: download your data first.</p><button class="cta ghost" data-a="bkfile">Download my data</button><button class="cta" style="--c:var(--bad)" data-a="wipe2">Yes, delete everything</button><button class="cta ghost" data-a="close">Keep my data</button>`)}
  if(a==='wipe2')wipeAll();
});
document.addEventListener('click',ev=>{const el=ev.target.closest('[data-a="setjump"]');if(!el)return;const t=document.getElementById(el.dataset.v);if(t)t.scrollIntoView({behavior:'smooth',block:'start'})});
