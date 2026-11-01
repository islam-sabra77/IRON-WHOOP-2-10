"use strict";
/* =====================================================================
   ERROR REPORTING, OFFLINE STATUS AND APP START-UP EXTRAS
   Errors are kept on this phone (Settings → Error log) and, when online,
   sent to /api/log-error so problems can be found and fixed.
   ===================================================================== */
const ERR_KEY='iron-errors';
function errList(){try{return JSON.parse(localStorage.getItem(ERR_KEY)||'[]')}catch(e){return[]}}
function logError(msg,src,stack){
  try{const list=errList();const e={t:Date.now(),msg:String(msg).slice(0,300),src:String(src||'').slice(0,200),stack:String(stack||'').slice(0,1500),tab:(typeof UI!=='undefined'&&UI.tab)||'',v:typeof SW_VERSION!=='undefined'?SW_VERSION:''};
    if(list.length&&list[list.length-1].msg===e.msg&&e.t-list[list.length-1].t<5000)return;
    list.push(e);while(list.length>50)list.shift();localStorage.setItem(ERR_KEY,JSON.stringify(list));
    if(navigator.onLine&&location.protocol!=='file:')fetch('/api/log-error',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.assign({ua:navigator.userAgent.slice(0,160)},e)),keepalive:true}).catch(()=>{});
  }catch(_){}
}
window.addEventListener('error',ev=>logError(ev.message,(ev.filename||'')+':'+(ev.lineno||''),ev.error&&ev.error.stack));
window.addEventListener('unhandledrejection',ev=>{const r=ev.reason;logError(r&&r.message||String(r),'promise',r&&r.stack)});
function errSheet(){const list=errList().slice().reverse();
  openSheet(`<h4 class="disp">Error log</h4><p class="muted" style="font-size:13.5px;margin:0 0 8px">Problems IRON ran into on this phone. They are also sent to your site so they can be fixed.</p>
  ${list.length?list.map(e=>`<div class="hrow" style="grid-template-columns:1fr"><span><b>${esc(e.msg)}</b><br><span class="muted" style="font-size:12px">${new Date(e.t).toLocaleString()} · ${esc(e.tab)} · ${esc(e.src)}</span></span></div>`).join(''):'<p class="muted">No errors recorded. 🎉</p>'}
  ${list.length?'<button class="cta ghost" data-a="errclear">Clear the log</button>':''}<button class="cta ghost" data-a="settings">Back to settings</button>`)}
document.addEventListener('click',ev=>{const el=ev.target.closest('[data-a]');if(!el)return;if(el.dataset.a==='errlog')errSheet();if(el.dataset.a==='errclear'){localStorage.removeItem(ERR_KEY);errSheet()}});
/* offline: a small badge in the top bar, and a note when the connection comes back */
function netBadge(){let b=document.getElementById('netbadge');if(navigator.onLine){b&&b.remove();return}if(!b){b=document.createElement('div');b.id='netbadge';b.className='netbadge';b.setAttribute('role','status');b.textContent='Offline · saving on this phone';document.body.appendChild(b)}}
window.addEventListener('offline',netBadge);window.addEventListener('online',()=>{netBadge();toast(syncOn()?'Back online. Backing up your changes.':'Back online')});netBadge();
/* service worker for offline use */
const SW_VERSION='2026-11-01-1';
if('serviceWorker' in navigator&&(location.protocol==='https:'||location.hostname==='localhost'))window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(e=>logError('Service worker: '+e.message,'sw')));
