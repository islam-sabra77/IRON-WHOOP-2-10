"use strict";
/* ---------- start-up: runs after every other script has loaded ---------- */
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

