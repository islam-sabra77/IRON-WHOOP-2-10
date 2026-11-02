"use strict";
/* ---------- MUSCLE MAP: which muscles each move works, front and back ---------- */
const PAT_MUSC={hpush:[['chest','delts','triceps'],[]],fly:[['chest'],['delts']],vpush:[['delts','triceps'],['traps','chest']],lat:[['delts'],['traps']],hpull:[['upperback','lats'],['reardelts','biceps','forearms']],vpull:[['lats'],['biceps','upperback','forearms']],
  rear:[['reardelts'],['upperback','traps']],cuff:[['reardelts'],['upperback']],tri:[['triceps'],[]],bi:[['biceps'],['forearms']],squat:[['quads','glutes'],['adductors','lowerback','abs']],lunge:[['quads','glutes'],['hams','adductors']],quad:[['quads'],[]],
  hinge:[['hams','glutes','lowerback'],['upperback','forearms','traps']],ham:[['hams'],['glutes','calves']],glute:[['glutes'],['hams']],calf:[['calves'],[]],tib:[['shins'],[]],abd:[['glutes'],[]],add:[['adductors'],[]],shrug:[['traps'],['forearms']],
  carry:[['forearms','traps'],['abs','obliques','glutes']],coreAE:[['abs'],['obliques']],coreFlex:[['abs'],['obliques']],coreAR:[['obliques','abs'],['lowerback']],coreLat:[['obliques'],['abs','glutes']],cardio:[['quads','glutes','calves'],['hams','abs']],power:[['glutes','quads','hams'],['calves','abs','delts']]};
const MUSC_NAME={chest:'Chest',delts:'Shoulders',triceps:'Triceps',biceps:'Biceps',forearms:'Forearms',abs:'Abs',obliques:'Obliques',quads:'Quads',adductors:'Inner thighs',shins:'Shins',traps:'Traps',reardelts:'Rear shoulders',upperback:'Upper back',lats:'Lats',lowerback:'Lower back',glutes:'Glutes',hams:'Hamstrings',calves:'Calves'};
function musclesOf(ex){const m=META[ex];if(!m||!PAT_MUSC[m.pat])return null;const[p,s]=PAT_MUSC[m.pat];return{p,s}}
function muscleMap(ex,c){
  const M=musclesOf(ex);if(!M)return'';c=c||'var(--upper)';
  const f=k=>M.p.includes(k)?`fill="${c}"`:M.s.includes(k)?`fill="${c}" fill-opacity=".38"`:'fill="var(--sf2)"';
  const pair=(k,x1,x2,y,rx,ry)=>`<ellipse ${f(k)} cx="${x1}" cy="${y}" rx="${rx}" ry="${ry}"/><ellipse ${f(k)} cx="${x2}" cy="${y}" rx="${rx}" ry="${ry}"/>`;
  const base=ox=>`<g transform="translate(${ox} 0)" stroke="var(--ln)" stroke-width="1"><circle cx="50" cy="15" r="10" fill="var(--sf2)"/><rect x="45" y="24" width="10" height="8" fill="var(--sf2)"/>`;
  const front=base(0)+pair('delts',31,69,43,8,7)+`<rect ${f('chest')} x="36" y="36" width="13.5" height="20" rx="5"/><rect ${f('chest')} x="50.5" y="36" width="13.5" height="20" rx="5"/>`+pair('biceps',25,75,62,5,11)+pair('forearms',21,79,88,4.5,12)
    +`<rect ${f('abs')} x="43" y="58" width="14" height="34" rx="5"/>`+pair('obliques',37.5,62.5,76,4.5,13)+pair('quads',41,59,121,8.5,21)+pair('adductors',47.5,52.5,112,2.6,11)+pair('shins',41,59,162,5,15)+'</g>';
  const back=base(110)+`<path ${f('traps')} d="M38 34 L62 34 L68 44 L50 54 L32 44 Z"/>`+pair('reardelts',30,70,45,7,7)+`<rect ${f('upperback')} x="39" y="45" width="22" height="16" rx="5"/>`+pair('lats',36,64,67,6,13)+pair('triceps',25,75,62,5,11)+pair('forearms',21,79,88,4.5,12)
    +`<rect ${f('lowerback')} x="44" y="74" width="12" height="18" rx="4"/>`+pair('glutes',43,57,101,8,9)+pair('hams',41,59,128,7.5,17)+pair('calves',41,59,162,6,14)+'</g>';
  const lab=[...M.p.map(k=>`<b>${MUSC_NAME[k]}</b>`),...M.s.map(k=>MUSC_NAME[k])].join(', ');
  return`<div class="mmap" data-raw><svg viewBox="0 0 210 182" role="img" aria-label="Works ${M.p.map(k=>MUSC_NAME[k]).join(', ')}">${front}${back}<text x="50" y="181" text-anchor="middle" font-size="9" font-weight="700" fill="var(--mu)">FRONT</text><text x="160" y="181" text-anchor="middle" font-size="9" font-weight="700" fill="var(--mu)">BACK</text></svg><p class="muted"><span class="mkey" style="--c:${c}"></span>Main: ${M.p.map(k=>MUSC_NAME[k]).join(', ')}${M.s.length?` · <span class="mkey s" style="--c:${c}"></span>Also: ${M.s.map(k=>MUSC_NAME[k]).join(', ')}`:''}</p></div>`}

/* ---------- SUPPLEMENT EVIDENCE GRADES ----------
   A strong, consistent human evidence for the main use · B good but smaller or narrower evidence
   C mixed or limited evidence · D little reliable evidence */
const SUPP_GRADE={A:'creatine whey casein plantprot eggprot beefprot caffeine vitd b12 iron folate omega3 electrolytes fiber bicarb betaalanine beetroot melatonin calcium iodine carbs gel protbar lactase sterols',
  B:'gainer magnesium zinc ashwagandha collagen theanine probiotic curcumin coq10 nac tartcherry berberine vitk2 vitc eaa ala inositol codliver algaeoil saffron boswellia uc2 ginger peppermint boulardii dmannose cranberry garlic cocoa greentea lutein bacopa citicoline kava lavender stjohns leucine glycerol same guarana yerbamate betaglucan prebiotic zinccarnosine vita thiamine riboflavin niacin choline redyeast glucomannan',
  D:'tribulus fadogia turkesterone ribose agmatine ornithine pqq uridine oregano slipperyelm charcoal fisetin spermidine nmn chlorella greens moringa seamoss bonebroth reishi chaga silica'};
const GRADE_TXT={A:['Strong evidence','Many good human studies support the main use.'],B:['Good evidence','Supported by human studies, though smaller or for narrower uses.'],C:['Mixed evidence','Results are limited or inconsistent. Worth trying only for a clear reason.'],D:['Little evidence','Little reliable human evidence it works. Usually not worth the money.']};
(function(){const g={};Object.keys(SUPP_GRADE).forEach(k=>SUPP_GRADE[k].split(' ').forEach(id=>{g[id]=k}));SUPP_DB.forEach(e=>{e.g=g[e.id]||'C'})})();
function gradeBadge(e){if(!e||!e.g)return'';return`<span class="grade g${e.g}" title="${GRADE_TXT[e.g][0]}">${e.g}</span>`}
function gradeRow(e){if(!e||!e.g)return'';const t=GRADE_TXT[e.g];return`<div class="sirow grow"><span>Evidence</span><b>${gradeBadge(e)} ${t[0]}</b></div><p class="muted" style="font-size:12.5px;margin:0 0 6px">${t[1]}</p>`}
