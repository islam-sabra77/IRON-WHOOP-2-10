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
