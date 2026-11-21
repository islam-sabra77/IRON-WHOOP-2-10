"use strict";
/* ---------- WARM-UP, MOBILITY AND STRETCHING ----------
   Every drill knows the muscles it works, what it mobilises, the injuries it helps and the ones it should avoid.
   Each day the warm-up, mobility and cool-down stretches are built from the muscles that day's
   strength, core and cardio actually load, plus any active injury (including anterior pelvic tilt). */

/* id: kinds | name | dose | flags | main muscles | also | target | helps | avoid | cue
   kinds: w warm-up, m mobility, s stretch. flags: t timed (dose = seconds), u each side, r only when it helps an active injury, b needs a band, f foam roller or ball, g gym only.
   Muscles use the muscle-map keys. A blank name or cue keeps the existing exercise's text. */
const XM_RAW={
/* general warm-up */
bikeWU:'w||180|tg|quads,glutes|calves,hams|Whole body, raises heart rate|||',
marchWU:'w||90|t|hipflex,glutes|calves,delts|Whole body, raises heart rate|||',
rowWU:'w|Easy rowing machine|180|tg|upperback,lats|quads,glutes,hams|Whole body, raises heart rate||lb|Easy strokes, legs then body then arms. Build to a light sweat.',
stepJack:'w|Step jacks (no jump)|45|t|calves,delts|glutes,adductors|Whole body, raises heart rate|||Step one foot out as the arms rise, alternate sides at a brisk pace. No impact.',
/* upper body: activation and dynamic */
armCircle:'wm|Arm circles, small to big|20|t|delts|reardelts,traps|Shoulder joint|sh,sc||Arms out to the sides, 10 circles forward growing bigger, then 10 back.',
shoulderCARs:'wm|Shoulder CARs|5|u|delts,reardelts|chest,lats|Shoulder joint, full range|sh,sc||Brace the trunk and draw the biggest slow circle you can with a straight arm. No twisting.',
bandPA:'w||15|b|reardelts,upperback|traps|Rear shoulders and upper back|sh,sc,ub,nk||',
bandER:'w||12|ub|reardelts|upperback|Rotator cuff|sh||',
scapPU:'w||10||upperback,chest|delts|Shoulder blades|sc,sh|wr|',
pushupPlus:'w|Push-up plus (on knees)|10||chest|upperback,delts|Serratus and shoulder blades|sc,sh|wr|From a knee push-up top, push the floor away so the upper back rounds slightly, then let it sink.',
wallAngel:'wm|Wall angels|10||upperback,reardelts|delts,traps|Upper back and shoulders|ub,sc,nk,sh||Back, head and hips on the wall, ribs down. Slide the arms up and down without losing contact.',
bandDislocate:'wm|Band pass-through|10|b|delts,chest|reardelts,lats|Shoulders and chest opening|ub,pc|sh|Wide grip on a light band, straight arms, sweep it over your head and back. Widen the grip if it pinches.',
bandPulldown:'w|Band straight-arm pulldown|12|b|lats|triceps,upperback|Lats switch-on|sc,ub||Band anchored high, arms straight, pull it to your thighs and squeeze the lats.',
bandPress:'w|Band chest press (light)|12|b|chest,triceps|delts|Chest and triceps switch-on||pc,sh|Band behind your back, press forward smoothly, slow return.',
bandCurlW:'w|Band biceps curl (light)|15|b|biceps|forearms|Elbows and biceps warm-up|el||Light band, elbows pinned, full range, slow lower.',
bandPushdownW:'w|Band triceps pushdown (light)|15|b|triceps|forearms|Elbows and triceps warm-up|el||Light band anchored high, elbows pinned, fully straighten.',
wristCircle:'wm|Wrist circles and rocks|30|t|forearms||Wrists|wr,el||Interlace the fingers and circle both ways, then rock gently over the palms on all fours.',
wallSlide:'wm||10||upperback,delts|reardelts|Overhead reach|sh,sc,ub||',
proneYTW:'w||5||reardelts,upperback|traps|Shoulder blades|sc,ub,nk,sh||',
/* trunk and spine */
catCamel:'wm||45|t|lowerback,upperback|abs|Whole spine|lb,ub,apt,nk||',
thread:'m||6|u|upperback,obliques|reardelts|Upper back rotation|ub,nk,sc||',
openBook:'m||6|u|upperback,chest|obliques|T-spine rotation|ub,sh,nk,pc||',
tspineExt:'m|Foam roller T-spine extension|8|f|upperback|lats|Upper back extension|ub,nk,sh,sc||Roller under the upper back, hands behind the head, extend over it in two or three spots. Ribs stay down.',
windmill:'m|Side-lying windmill|6|u|upperback,chest|obliques,delts|T-spine and chest|ub,pc,nk||Lie on your side, knees bent, sweep the top arm in a big arc over your head and behind you.',
neckCARs:'m|Neck circles (slow)|5||neck|traps|Neck range|nk||Small, slow circles. Never force the end of the range.',
chinTuck:'m|Chin tucks|10||neck|upperback|Neck posture|nk,ub||Glide the chin straight back to make a double chin, hold two seconds. Eyes stay level.',
mckenzie:'m||10|r|lowerback|abs|Low back extension|lb|apt|',
pelvicTilt:'wm|Pelvic tilts (lying)|12||abs,glutes|lowerback|Pelvis control|apt,lb||On your back, knees bent. Flatten the low back into the floor, then gently arch. Own the flat position.',
pptHold:'wm|Posterior pelvic tilt hold|30|t|abs,glutes|hams|Pelvis position|apt,lb||Lying or standing, tuck the tailbone under, squeeze the glutes, exhale fully. Hold and breathe.',
deadBugPPT:'wm|Dead bug with pelvic tuck|8|u|abs|hipflex,obliques|Core and pelvis control|apt,lb||Low back glued to the floor, exhale as the opposite arm and leg reach. Stop before the back lifts.',
revCrunchW:'w|Slow reverse crunch|10||abs|obliques|Lower abs and pelvis|apt||Curl the hips off the floor by tucking the pelvis, lower over three seconds. No swinging.',
birdDogW:'w|Bird dog (slow)|6|u|lowerback,glutes|abs,delts|Trunk control|lb,apt||Reach long, not high. Hips stay level as if a cup sits on your back.',
/* hips and legs: activation and dynamic */
legSwingF:'w|Leg swings, front to back|10|u|hams,hipflex|glutes|Hips and hamstrings|hp||Hold a wall, swing a relaxed leg through a growing range. Trunk stays tall.',
legSwingS:'w|Leg swings, side to side|10|u|adductors,glutes|hipflex|Inner thighs and outer hips|hp|gr|Face a wall, swing the leg across the body and out to the side.',
walkLungeTw:'w|Walking lunge with a twist|6|u|quads,glutes|obliques,hipflex|Hips and T-spine|ub|kn|Step into a lunge, rotate toward the front leg, step through.',
spiderman:'wm|Spiderman lunge with reach|5|u|hipflex,adductors|upperback,glutes|Hips and T-spine|hp,ub|kn|Long lunge, hands inside the front foot, then reach the inside arm to the ceiling.',
worldGreatest:'wm||5|u|hipflex,hams|upperback,adductors|Hips, hamstrings and T-spine|hp,ub|kn|',
inchworm:'w|Inchworm|5||hams|delts,abs|Hamstrings and shoulders||wr,lb,hm|Fold forward, walk the hands out to a plank, walk the feet in. Soft knees are fine.',
goodMorningW:'w|Bodyweight good morning|10||hams|glutes,lowerback|Hamstrings and hip hinge|hm|lb|Hands on hips, soft knees, push the hips back with a long spine until you feel the hamstrings.',
glBridgeW:'w|Glute bridge|12||glutes|hams|Glutes switch-on|lb,apt,kn,hp||Tuck the pelvis first, drive through the heels, squeeze two seconds at the top.',
bridgePPT:'wm||12||glutes|abs,hams|Pelvis control and glutes|lb,apt,hp||',
clamshell:'w|Clamshell|15|u|glutes||Side glutes|kn,hp,lb||On your side, heels together, open the top knee without rolling the hips back.',
fireHydrant:'w|Fire hydrant|10|u|glutes|abs|Hip rotation and glutes|hp,kn||On all fours, lift the bent knee out to the side, keep the hips level.',
bandWalk:'w||30|tb|glutes|quads|Hip stability|kn,hp||',
monsterWalk:'w|Monster walk|30|tb|glutes|quads|Hip stability|kn,hp||Band around the knees or ankles, quarter squat, step forward and out diagonally.',
tkeMob:'wm||15|ub|quads||Knee extension|kn||',
spanishSquat:'w|Spanish squat hold|30|tbr|quads|glutes|Knee-friendly quad switch-on|kn||Heavy band behind the knees anchored in front, sit back into it with upright shins. Great for sore knees.',
cossack:'wm|Cossack squat (partial)|6|u|adductors,quads|glutes|Inner thighs and hips|hp|kn,gr|Wide stance, shift to one side and sit down as far as is comfortable, other leg long.',
squatPry:'wm|Deep squat pry|30|t|adductors,glutes|calves,lowerback|Hips and ankles|hp,an|kn|Sit into a deep squat holding a post, elbows push the knees out, sway gently side to side.',
hipCARs:'wm|Hip CARs|5|u|hipflex,glutes|adductors|Hip joint, full range|hp,gr,lb||On all fours or standing, draw the biggest slow circle you can with the knee. Trunk stays still.',
hip9090:'m||6|u|glutes,hipflex|adductors|Hip rotation|hp,lb||',
adductRock:'m||8|u|adductors|hipflex|Inner thighs|gr,hp||',
frogRock:'m|Frog rock-back|8||adductors|glutes|Inner thighs and hips|hp|gr,kn|Knees wide on a soft surface, rock the hips back toward the heels and forward again.',
bretzel:'m|Bretzel|6|u|quads,hipflex|upperback,obliques|Hip flexors and T-spine|apt,ub,lb|kn|Side-lying, top knee pinned forward, hold the bottom foot behind you and rotate the chest open.',
nerveFloss:'m|Sciatic nerve glide|10|ur|hams|lowerback|Nerve glide down the back of the leg|lb,hm||Seated, slump, then straighten the knee as you look up, bend it as you look down. Gentle, no pins and needles.',
kneeWall:'wm||10|u|calves|shins|Ankle bend|an,kn,ac,ft||',
ankleCircle:'wm|Ankle circles|10|u|calves,shins||Ankles|an,ac,ft||Lift the foot and draw slow, full circles both ways.',
calfRaiseW:'w|Slow calf raises|15||calves||Calves and Achilles|ac,an,ft||Up in one second, down in three. Full range, hold a wall.',
tibRaise:'w||15||shins||Shins and ankles|an,kn||',
slBalance:'w||30|tu|calves,glutes||Balance and knee control|kn,an,ac||',
plantarRoll:'m|Foot roll with a ball|45|tufr|calves||Sole of the foot|ft,ac||Roll a ball slowly from heel to toes, pause on tender spots. Moderate pressure.',
/* stretches: upper body */
pecDoor:'s|Doorway chest stretch|30|tu|chest|delts|Chest and front shoulder|sh,ub,nk|pc|Forearm on a door frame at shoulder height, step through gently until you feel the chest.',
pecCorner:'s|Corner chest stretch|30|t|chest|delts|Both sides of the chest|ub,nk|pc,sh|Forearms on both walls of a corner, lean in with a tall chest.',
latStretch:'s|Bench lat stretch|30|tu|lats|triceps|Lats|ub,sh|sh|Kneel, elbows on a bench, sink the chest down and back toward the heels.',
childSide:'s|Child\'s pose side reach|30|tu|lats|lowerback,obliques|Lats and sides of the trunk|lb,ub||In child\'s pose, walk both hands to one side and breathe into the opposite ribs.',
childPose:'sm||60|t|lowerback|lats|Low back and lats|lb,apt||',
crossBody:'s||30|tu|reardelts|upperback|Back of the shoulder|sh||',
sleeper:'s||30|tu|reardelts|delts|Shoulder rotation|sh||',
tricepsOH:'s|Overhead triceps stretch|30|tu|triceps|lats|Triceps|el|sh|Hand behind the head, gently push the elbow back with the other hand.',
bicepsWall:'s|Wall biceps stretch|30|tu|biceps|chest,delts|Biceps and front shoulder||sh,el|Palm on a wall behind you at shoulder height, thumb up, turn the body away slowly.',
frontDelt:'s|Behind-back front shoulder stretch|30|t|delts|chest,biceps|Front of the shoulders||sh|Clasp the hands behind you, straighten the arms and lift them a little. Chest proud.',
wristStretch:'s||30|tu|forearms||Wrist extensors and elbow|el,wr||',
wristFlex:'s|Wrist flexor stretch|30|tu|forearms||Wrist flexors and forearm|el,wr||Arm straight, palm up, gently pull the fingers back with the other hand.',
upperTrap:'s|Upper trap stretch|30|tu|traps,neck||Neck and upper traps|nk,sc||Sit on one hand, tilt the ear to the other shoulder, gentle pull with the free hand.',
levator:'s|Levator scapulae stretch|30|tu|neck,traps||Side and back of the neck|nk,sc||Turn the nose toward the armpit and gently pull the head down. Opposite shoulder stays low.',
selfHug:'s|Self-hug upper back stretch|30|t|upperback|reardelts|Between the shoulder blades|ub,sc||Wrap the arms around yourself, round the upper back and breathe into it.',
sphinx:'s|Sphinx stretch|45|t|abs|hipflex|Abs and front of the hips|lb|apt|Lie face down on the forearms, hips heavy, relax the low back. Skip it if it pinches.',
sideBend:'s|Standing side bend|30|tu|obliques|lats|Sides of the trunk|lb||Reach one arm overhead and lean to the side, hips stay square.',
supineTwist:'s|Lying spinal twist|40|tu|obliques,lowerback|glutes|Spine rotation|lb,ub||Knees to one side, arms wide, let the shoulders stay heavy.',
/* stretches: hips and legs */
hipFlexPPT:'sm||40|tu|hipflex|quads|Hip flexors|apt,lb,hp||',
couch:'s||40|tu|quads,hipflex||Quads and hip flexors|apt,lb|kn|',
quadStand:'s|Standing quad stretch|30|tu|quads|hipflex|Quads|apt||Hold the ankle behind you, knees together, tuck the pelvis to feel the front of the hip too.',
quadSide:'s|Side-lying quad stretch|30|tu|quads|hipflex|Quads and hip flexors|apt|kn|On your side, pull the top heel toward the glute and tuck the pelvis.',
lizard:'s|Lizard lunge|40|tu|hipflex,adductors|glutes|Hips and inner thighs|hp,apt|kn|Long lunge, hands inside the front foot, sink the hips low. Back knee down if needed.',
hamStrap:'s|Lying hamstring stretch (strap)|30|tu|hams|calves|Hamstrings|lb|hm|On your back, strap around the foot, raise the straight leg until you feel a stretch.',
hamSeated:'s|Seated hamstring stretch|30|tu|hams|lowerback,calves|Hamstrings||hm,lb|One leg long, hinge forward from the hips with a long spine.',
forwardFold:'s|Standing forward fold (soft knees)|30|t|hams|lowerback,calves|Back of the legs||lb,hm|Soft knees, let the head and arms hang, breathe slowly.',
figure4:'s|Figure-4 glute stretch|30|tu|glutes|hipflex|Glutes and deep hip|lb,hp,kn||On your back, ankle over the opposite knee, pull the bottom thigh toward you.',
pigeon:'s|Pigeon stretch|40|tu|glutes|hipflex|Glutes and hip rotators|lb,hp|kn|Front shin across the body, back leg long, fold forward with a long spine.',
butterfly:'s|Butterfly stretch|40|t|adductors||Inner thighs|hp|gr|Soles together, sit tall and let the knees fall out. Gentle press only.',
frogStretch:'s|Frog stretch|40|t|adductors|glutes|Inner thighs|hp|gr,kn|Knees wide on a soft surface, hips back until you feel the inner thighs.',
happyBaby:'s|Happy baby|40|t|adductors,glutes|lowerback|Hips and low back|lb,apt||On your back, hold the feet, knees toward the armpits, rock gently.',
kneeChest:'s|Knee to chest|30|tu|glutes,lowerback||Low back and glutes|lb,apt||Lying on your back, hug one knee toward the chest, other leg relaxed.',
outerHip:'s|Standing cross-leg outer hip stretch|30|tu|glutes|obliques|Outer hip and IT band area|kn,hp||Cross one leg behind, lean the hips out to that side and reach the arm overhead.',
calfWall:'s|Wall calf stretch (straight knee)|30|tu|calves||Calves|ac,an,ft||Hands on a wall, back leg straight, heel down, lean in.',
soleusWall:'s|Wall calf stretch (bent knee)|30|tu|calves|shins|Lower calf and Achilles|ac,an,ft||Same as the calf stretch with the back knee bent. Heel stays down.',
slantCalf:'s||40|t|calves||Calves and Achilles|ac,an,ft||',
shinStretch:'s|Kneeling shin stretch|30|t|shins|quads|Shins and top of the foot|an|kn|Kneel on a soft surface with the tops of the feet down, sit back gently.',
toeStretch:'s|Toe extension stretch|30|tur|calves||Sole of the foot and plantar fascia|ft,ac||Pull the toes back toward the shin with the hand until you feel the arch.',
squatHold:'s|Deep squat hold|40|t|adductors,glutes|calves,lowerback|Hips, ankles and low back|an,hp|kn|Sit into a deep squat, heels down (or on a plate), chest tall, breathe.'
};
const XM={};
Object.keys(XM_RAW).forEach((id) => {
  const [k, n, dose, fl, p, s, tg, helps, avoid, c] = XM_RAW[id].split('|');
  XM[id] = { k, dose: +dose, p: p ? p.split(',') : [], s: s ? s.split(',') : [], tg, helps: helps ? helps.split(',') : [], av: avoid ? avoid.split(',') : [], band: fl.includes('b'), rehab: fl.includes('r'), tool: fl.includes('f'), gym: fl.includes('g') };
  const e = E[id] || (E[id] = { bw: 1 });
  if (n) e.n = n; if (c) e.c = c; if (fl.includes('t')) { e.t = 1; e.s = +dose; } if (fl.includes('u')) e.u = 1;
  if (!e.p && XM[id].helps.length) e.p = XM[id].helps.map((j) => ({ apt: 'Pelvis' }[j] || (INJ[j] ? INJ[j].replace(/ \(.*/, '') : ''))).filter(Boolean).join(', ');
});
/* a few short Arabic labels for the new section and condition */
if (typeof AR === 'object') Object.assign(AR, { 'Stretch': 'الإطالات', 'Cool-down stretches': 'إطالات التهدئة', 'Anterior pelvic tilt': 'ميل الحوض الأمامي', 'Targets': 'يستهدف' });

const xmKinds = (id) => (XM[id] ? XM[id].k : '');
const xmMuscles = (id) => (XM[id] ? XM[id].p.concat(XM[id].s) : []);
/* "Targets: Hip flexors, Quads · Hip flexors" line for any warm-up, mobility or stretch */
function xmTarget(id) { const x = XM[id]; if (!x) return ''; const m = x.p.map((k) => MUSC_NAME[k]).filter(Boolean); return (m.length ? m.join(', ') : '') + (x.tg ? (m.length ? ' · ' : '') + x.tg : ''); }

/* the muscles today's session loads, weighted: main muscles 2, helpers 1 */
function dayMuscles(d) {
  const t = T[tplOf(d)], w = {}; if (!t) return w;
  const add = (ex, k = 1) => { const M = typeof musclesOf === 'function' ? musclesOf(ex) : null; if (!M) return; M.p.forEach((m) => { w[m] = (w[m] || 0) + 2 * k; }); M.s.forEach((m) => { w[m] = (w[m] || 0) + k; }); };
  let items = blocksFor(d).flatMap((b) => b.items.map((it) => it.ex));
  if (!items.length && t.blocks) items = t.blocks.flatMap((b) => b.i.map((x) => x[0])).filter((x) => E[x]);
  items.forEach((x) => add(x)); coreFor(d).forEach((it) => add(it.ex, .6));
  const cd = t.k === 'long' ? 3 : t.cardio || (S.cardioSet && ((S.cardioSet.day || {})[d] || (S.cardioSet.all || {})[t.k])) ? 1.2 : 0;
  if (cd) ['quads', 'glutes', 'calves', 'hams', 'hipflex'].forEach((m, i) => { w[m] = (w[m] || 0) + cd - i * .15; });
  if (!Object.keys(w).length) ['lowerback', 'hipflex', 'upperback', 'glutes', 'hams', 'chest'].forEach((m, i) => { w[m] = 2 - i * .2; });
  return w;
}
const xmHash = (s) => { let h = 7; for (const c of s) h = (h * 31 + c.charCodeAt(0)) % 9973; return h / 9973; };

/* pick n drills of one kind: one for each active injury first, then the best match for the muscles still uncovered */
let XMC = null;
function xmPick(d, kind, n, opts = {}) {
  const key = [d, kind, n, [...injOn(d)].join(), readyOf(d), tplOf(d), (opts.skip || []).length, JSON.stringify((S.prof && S.prof.ans && S.prof.ans.equip) || '')].join('|');
  if (!XMC) { XMC = {}; Promise.resolve().then(() => { XMC = null; }); }
  if (!XMC[key]) XMC[key] = xmPick0(d, kind, n, opts);
  return XMC[key];
}
function xmPick0(d, kind, n, opts) {
  const t = T[tplOf(d)], a = S.prof && S.prof.ans, inj = injOn(d), focus = new Set(((S.prof && S.prof.sc && S.prof.sc.focus) || []).filter((j) => INJ[j]));
  inj.forEach((j) => focus.add(j));
  const travel = t && t.k === 'travel', gym = a ? a.equip === 'gym' : true;
  const w = Object.assign({}, opts.w || dayMuscles(d)), wk = typeof weekNo === 'function' ? weekNo(d) : 0;
  const ok = (id) => { const x = XM[id]; return x && E[id] && x.k.includes(kind) && !x.av.some((j) => inj.has(j)) && !(x.gym && (!gym || travel)) && !(x.tool && travel) && !(x.rehab && !x.helps.some((j) => focus.has(j))) && !(opts.skip || []).includes(id); };
  const pool = Object.keys(XM).filter(ok), out = [], why = {};
  const score = (id) => { const x = XM[id]; let s = 0; x.p.forEach((m) => { s += (w[m] || 0) * 1.4; }); x.s.forEach((m) => { s += (w[m] || 0) * .5; }); return s + xmHash(id + wk) * 1.5 + (x.k[0] === kind ? .4 : 0); };
  // injuries and posture first: active ones get two drills, screening findings one
  // at most half the list goes to injuries and posture, one drill each first, a second for active injuries if there is room
  const quota = kind === 'm' ? Math.ceil(n / 2) : Math.max(1, Math.floor(n / 2)), fl = [...focus].sort((x, y) => inj.has(y) - inj.has(x));
  for (let round = 0; round < 2; round++) fl.forEach((j) => {
    if (out.length >= quota || (round && !inj.has(j))) return;
    const id = pool.filter((x) => XM[x].helps.includes(j) && !out.includes(x)).sort((x, y) => score(y) - score(x))[0];
    if (id) { out.push(id); why[id] = j; XM[id].p.forEach((m) => { if (w[m]) w[m] *= .5; }); }
  });
  while (out.length < n) {
    const c = pool.filter((id) => !out.includes(id)); if (!c.length) break;
    c.sort((x, y) => score(y) - score(x)); const id = c[0]; out.push(id);
    XM[id].p.forEach((m) => { if (w[m]) w[m] *= .35; });
  }
  return out.map((id) => ({ id, why: why[id] }));
}
/* the three lists, in the shape the Train screen already uses */
function xmList(d, kind) {
  const t = T[tplOf(d)]; if (!t) return [];
  const a = S.prof && S.prof.ans, len = a ? +a.len || 75 : 75, pre = { w: 'w', m: 'm', s: 'z' }[kind];
  let picks;
  if (kind === 'w') {
    if (!t.wu || readyOf(d) === 'r') return [];
    const gym = a ? a.equip === 'gym' : true, raise = gym && t.k !== 'travel' ? 'bikeWU' : 'marchWU';
    const n = len <= 45 ? 2 : len <= 60 ? 3 : 4;
    picks = [{ id: raise }].concat(xmPick(d, 'w', n, { skip: ['bikeWU', 'marchWU', 'rowWU', 'stepJack'] }));
    if (blocksFor(d).length) picks.push({ id: 'rampUp' });
  } else if (kind === 'm') {
    const n = t.k === 'rest' || t.k === 'long' ? 7 : len <= 45 ? 4 : len <= 60 ? 5 : 6;
    picks = xmPick(d, 'm', n);
  } else {
    if (t.k === 'rest') return [];
    const n = t.k === 'long' ? 5 : len <= 45 ? 4 : 5;
    picks = xmPick(d, 's', n);
  }
  return picks.map((p, i) => {
    const slot = pre + i, ex = exAt(d, slot, p.id), x = XM[ex] || XM[p.id];
    const dose = p.id === 'rampUp' ? 2 : (XM[ex] ? XM[ex].dose : x ? x.dose : 8);
    return { slot, base: p.id, ex, dose, kind: { w: 'wu', m: 'mob', s: 'st' }[kind], why: p.why };
  });
}
const stretchFor = (d) => xmList(d, 's');
const stretchSecs = (d) => listSecs(stretchFor(d));
/* the reason a drill is in today's list, shown under it */
function xmWhy(d, m) {
  if (m.why) return m.why === 'apt' ? 'Corrects anterior pelvic tilt' : 'For your ' + (INJ_SHORT[m.why] || INJ[m.why] || m.why).toLowerCase();
  const x = XM[m.ex]; if (!x) return ''; const w = dayMuscles(d); const hit = x.p.filter((k) => (w[k] || 0) >= 2);
  return hit.length ? 'Matches today’s ' + hit.map((k) => MUSC_NAME[k].toLowerCase()).join(' and ') + ' work' : '';
}
/* swaps: same kind of drill that targets the same muscles or the same area, safe for active injuries */
function xmAlts(slot, base, cur) {
  const kind = slot[0] === 'w' ? 'w' : slot[0] === 'z' ? 's' : 'm', b = XM[base] || XM[cur]; if (!b) return [];
  const inj = injOn(UI.date || todayS()), mus = new Set(b.p.concat(b.s));
  const c = Object.keys(XM).filter((id) => E[id] && id !== cur && XM[id].k.includes(kind) && !XM[id].av.some((j) => inj.has(j)));
  const sc = (id) => { const x = XM[id]; return x.p.filter((m) => mus.has(m)).length * 3 + x.s.filter((m) => mus.has(m)).length + x.helps.filter((j) => b.helps.includes(j)).length * 2; };
  return c.sort((x, y) => sc(y) - sc(x) || (x < y ? -1 : 1)).slice(0, 8);
}
EXDB_COUNT = Object.keys(META).length + Object.keys(XM).filter((id) => !META[id]).length + 1;
const XM_COUNT = { w: Object.values(XM).filter((x) => x.k.includes('w')).length, m: Object.values(XM).filter((x) => x.k.includes('m')).length, s: Object.values(XM).filter((x) => x.k.includes('s')).length };
