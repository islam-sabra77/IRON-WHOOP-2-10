"use strict";
/* ---------- FIRST-WEEK GUIDE: a short checklist on Home for new users ---------- */
function fwItems(){
  const standalone=window.matchMedia&&matchMedia('(display-mode: standalone)').matches||navigator.standalone;
  const alertsOn=typeof Notification!=='undefined'&&Notification.permission==='granted';
  return[
    {k:'plan',ok:!!S.prof,t:'Build your plan',s:'Answer the quick questions',a:'obopen'},
    {k:'home',ok:!!standalone,t:'Add IRON to your Home Screen',s:'Share → Add to Home Screen. Needed for alerts on iPhone',a:'fwhome'},
    {k:'alerts',ok:alertsOn,t:'Turn on rest-timer alerts',s:'So the timer rings with the phone locked',a:'pushon'},
    {k:'first',ok:Object.keys(S.done||{}).some(d=>S.done[d]),t:'Finish your first session',s:'Log sets as you go; IRON suggests weights next time',a:'fwtrain'},
    {k:'whoop',ok:!!(S.whoop&&S.whoop.connected),t:'Connect WHOOP',s:'Workouts then follow your recovery',a:'wconnect',hide:typeof WH_ON!=='undefined'&&!WH_ON},
    {k:'backup',ok:typeof syncOn==='function'&&syncOn(),t:'Turn on cloud backup',s:'Encrypted, so you never lose your logs',a:'syncopen'},
    {k:'goal',ok:(S.goals||[]).length>0,t:'Set a goal',s:'A lift or body target with a projected date',a:'fwgoal'}].filter(x=>!x.hide)}
function fwShow(){S.guide=S.guide||{};if(!S.guide.since){S.guide.since=todayS();save()}if(S.guide.off)return false;if(diffD(S.guide.since,todayS())>21)return false;return fwItems().some(x=>!x.ok)}
function fwCard(){if(!fwShow())return'';const L=fwItems(),n=L.filter(x=>x.ok).length;
  return`<div class="card fwg"><div class="ctop"><div><span class="hlab">Your first week</span><h4 class="disp" style="margin:2px 0 0">${n} of ${L.length} done</h4></div><button class="mini" data-a="fwoff" aria-label="Hide the first-week guide">Hide</button></div>
  <div class="hbar" style="height:8px;margin:8px 0 4px"><i style="width:${Math.round(n/L.length*100)}%"></i></div>
  ${L.map(x=>`<button class="fwi ${x.ok?'ok':''}" data-a="${x.ok?'fwnoop':x.a}" data-e=""><i>${x.ok?'✓':''}</i><div><b>${esc(x.t)}</b><span>${esc(x.s)}</span></div></button>`).join('')}</div>`}
document.addEventListener('click',ev=>{const el=ev.target.closest('[data-a]');if(!el)return;const a=el.dataset.a;
  if(a==='fwoff'){S.guide=S.guide||{};S.guide.off=1;save();rerender();toast('Guide hidden. Search for anything with the magnifier')}
  if(a==='fwhome')openSheet(`<h4 class="disp">Add IRON to your Home Screen</h4><ol style="font-size:15px;line-height:1.6;padding-left:20px"><li><b>iPhone (Safari):</b> tap the Share button, then <b>Add to Home Screen</b>.</li><li><b>Android (Chrome):</b> tap the ⋮ menu, then <b>Install app</b>.</li><li>Open IRON from the new icon. It works offline and can send alerts.</li></ol><button class="cta ghost" data-a="close">Got it</button>`);
  if(a==='fwtrain'){UI.tab='train';rerender();window.scrollTo(0,0)}
  if(a==='fwgoal'){UI.tab='goals';rerender();window.scrollTo(0,0)}
});
