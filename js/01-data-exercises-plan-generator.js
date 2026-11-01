"use strict";
/* ---------- storage ---------- */
const KEY='stronghold-plan-v1';
const PLAN_START='2026-09-28', PLAN_END='2026-12-31';
const COLORS={upper:'#2F5BFF',lower:'#FF6A13',mob:'#00B39A',core:'#E8A900',cardio:'#FF2D78',long:'#7B4DFF',rest:'#8E97BF',travel:'#00A3FF',warm:'#43A512',full:'#E11D74',hiit:'#F04438'};
const HAB_COLORS=['#2F5BFF','#FF6A13','#00B39A','#FF2D78','#7B4DFF','#E8A900','#12B76A','#00A3FF'];
const EMOJIS=['💧','👟','🌙','📖','🧘','🥗','☀️','🚭','🧊','📵','🙏','✍️','🦷','💤','🍎','🏃'];
function defaults(){return{
  start:PLAN_START,end:PLAN_END,
  map:{0:'upperA',1:'lowerA',2:'upperB',3:'lowerB',4:'upperC',5:'rest',6:'long'},
  moves:{},logs:{},done:{},ready:{},swaps:{},swapsAll:{},vids:{},ext:[],
  supps:[
    {id:'cr',n:'Creatine monohydrate',d:'10 g',slot:'Morning',note:'Same time every day with water. Consistency matters more than timing.',c:'#2F5BFF'},
    {id:'lc',n:'L-Carnitine L-Tartrate',d:'2,000 mg',slot:'Morning',note:'Take with a meal that has carbs.',c:'#00B39A'},
    {id:'wp',n:'Protein isolate',d:'1 scoop',slot:'Post-workout',note:'Within an hour after training. On rest days, with breakfast.',c:'#FF6A13'},
    {id:'om',n:'Omega-3',d:'1 serving',slot:'With meals',note:'With a meal that contains some fat.',c:'#E8A900'},
    {id:'bb',n:'Berberine',d:'as on label',slot:'With meals',note:'Just before a main meal. Can interact with some medications.',c:'#FF2D78'}
  ],
  suppLog:{},
  habits:[
    {id:'h1',n:'Drink 3 L of water',e:'💧',c:'#00A3FF'},
    {id:'h2',n:'8,000+ steps',e:'👟',c:'#FF6A13'},
    {id:'h3',n:'Lights out by 10:30',e:'🌙',c:'#7B4DFF'}
  ],
  habitLog:{},trips:[],col:{},clips:{},whoop:{connected:false,auto:true,last:0},wdata:{},body:{},wbody:null,stepGoal:8000,habOv:{},hist:[]
}}
let S;
try{S=JSON.parse(localStorage.getItem(KEY)||'null')}catch(e){S=null}
const FRESH=!S||typeof S!=='object';
if(!S||typeof S!=='object')S=defaults();
S=Object.assign(defaults(),S);
function save(){S._u=Date.now();try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}if(typeof syncSoon==='function')syncSoon()}

/* ---------- dates ---------- */
const pad=n=>String(n).padStart(2,'0');
const ds=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const pd=s=>{const a=s.split('-').map(Number);return new Date(a[0],a[1]-1,a[2])};
const addD=(s,n)=>{const d=pd(s);d.setDate(d.getDate()+n);return ds(d)};
const dow=s=>pd(s).getDay();
const diffD=(a,b)=>Math.round((pd(b)-pd(a))/864e5);
const todayS=()=>ds(new Date());
const sunOf=s=>addD(s,-dow(s));
const DN=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const DS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const MN=['January','February','March','April','May','June','July','August','September','October','November','December'];
const nice=s=>{const d=pd(s);return DN[d.getDay()]+', '+d.getDate()+' '+MN[d.getMonth()]};
const short=s=>{const d=pd(s);return d.getDate()+' '+MN[d.getMonth()].slice(0,3)};

/* ---------- exercise library ----------
 n name, c cue, p protects, a alternatives, t time-based, u one side at a time (left first), s default seconds, bw bodyweight */
const E={
/* upper */
incDB:{n:'Incline DB press (30°)',c:'Bench at 30°, elbows about 45°, ribs down. Stop 1–2 reps before form breaks.',p:'Right shoulder',a:['incMach','floorPress','machChest']},
incMach:{n:'Machine incline press',c:'Seat so handles line up with upper chest. Neutral handles if available.',p:'Right shoulder',a:['incDB','floorPress']},
floorPress:{n:'Neutral-grip DB floor press',c:'The floor limits depth, which keeps the shoulder in a safe range.',p:'Right shoulder',a:['incDB','machChest']},
machChest:{n:'Neutral-grip machine chest press',c:'Handles at mid-chest, wrists straight, no hard lockout.',p:'Right shoulder',a:['floorPress','cFly','pushup']},
cFly:{n:'Cable fly (mid height)',c:'Soft elbows, hug a tree, stop when hands meet.',a:['machChest','pushup']},
pushup:{n:'Push-up (hands elevated if needed)',c:'Body in one line, elbows at 45°, full control.',bw:1,a:['machChest','floorPress']},
flatDBng:{n:'Flat DB press (neutral grip)',c:'Palms face each other, lower to chest level, not below.',p:'Right shoulder',a:['machChest','floorPress','incMach']},
csRow:{n:'Chest-supported DB row',c:'Chest glued to the pad. Row to the hip pocket, no low-back yank.',p:'Lower back',a:['sealRow','machRow','saCableRow']},
sealRow:{n:'Chest-supported T-bar row',c:'Chest stays on the pad the whole set. Squeeze, pause, lower slowly.',p:'Lower back',a:['csRow','machRow']},
machRow:{n:'Machine row (neutral grip)',c:'Chest on the pad, pull elbows back, 1-second squeeze.',p:'Lower back',a:['csRow','sealRow']},
saCableRow:{n:'Single-arm cable row',c:'Left arm first. Elbow tight to the ribs, no torso twist.',p:'Lower back',u:1,a:['csRow','machRow']},
lmPress:{n:'Half-kneeling landmine press',c:'Left side first. Press up and forward, squeeze the glute of the down knee.',p:'Right shoulder, pelvic tilt',u:1,a:['saDBPress','machShoulder']},
saDBPress:{n:'Single-arm DB press (neutral, angled)',c:'Arm slightly forward of the body (scapular plane). Stop at ear height if the shoulder complains.',p:'Right shoulder',u:1,a:['lmPress','machShoulder']},
machShoulder:{n:'Machine shoulder press (neutral)',c:'Stop the bottom at ear level. Never behind the neck.',p:'Right shoulder',a:['lmPress','saDBPress']},
ngPulldown:{n:'Neutral-grip lat pulldown',c:'Pull to upper chest, elbows to pockets. Never behind the neck.',p:'Right shoulder',a:['assistPull','saPulldown','straightArm']},
assistPull:{n:'Assisted pull-up (neutral grip)',c:'Full hang, chest to the handles, slow way down.',a:['ngPulldown','saPulldown']},
saPulldown:{n:'Single-arm cable pulldown',c:'Left arm first. Drive the elbow down to the hip.',u:1,a:['ngPulldown','straightArm']},
straightArm:{n:'Straight-arm cable pulldown',c:'Arms long, sweep the bar to the thighs, ribs down.',a:['ngPulldown','saPulldown']},
cLat:{n:'Cable lateral raise',c:'Lead with the elbow, stop at shoulder height, slight lean away.',u:1,a:['dbLat','machLat']},
dbLat:{n:'DB lateral raise (light)',c:'Thumbs level, raise to shoulder height, 2-second lower.',a:['cLat','machLat']},
machLat:{n:'Machine lateral raise',c:'Pads on the outside of the elbows, smooth tempo.',a:['cLat','dbLat']},
facePull:{n:'Face pull (rope)',c:'Pull to eye level, thumbs point back, finish in external rotation.',p:'Right shoulder, upper back',a:['bandPA','revPec']},
revPec:{n:'Reverse pec deck',c:'Chest on the pad, arms soft, sweep wide. No shrugging.',p:'Right shoulder',a:['cRearFly','proneT']},
cRearFly:{n:'Cable rear-delt fly',c:'Cross the cables, pull wide at shoulder height.',a:['revPec','proneT']},
proneT:{n:'Prone T raise (incline bench)',c:'Chest on bench, thumbs up, raise arms out to a T.',a:['revPec','cRearFly']},
yRaise:{n:'Cable Y-raise (lower traps)',c:'Thumb up, raise in a Y. Feel the low trap, not the neck.',p:'Right shoulder',u:1,a:['proneY','facePull']},
proneY:{n:'Prone Y raise (incline bench)',c:'Chest on bench, raise light plates in a Y, pause at top.',p:'Right shoulder',a:['yRaise','facePull']},
sideER:{n:'Side-lying DB external rotation',c:'Towel under the elbow. Rotate up slowly, 3 seconds down.',p:'Right shoulder',u:1,a:['cableER','bandER']},
cableER:{n:'Cable external rotation',c:'Elbow glued to the side, rotate out, slow return.',p:'Right shoulder',u:1,a:['sideER','bandER']},
/* arms — neutral grips favoured for the tennis elbow */
ropePush:{n:'Rope triceps pushdown',c:'Elbows pinned, split the rope at the bottom, 2-second return.',p:'Elbow',a:['vbarPush','kickback']},
vbarPush:{n:'V-bar triceps pushdown',c:'Elbows by the ribs, full extension, soft lockout.',a:['ropePush','kickback']},
kickback:{n:'Cable triceps kickback',c:'Upper arm parallel to the floor, straighten the elbow fully.',u:1,a:['ropePush','crossExt']},
crossExt:{n:'Cross-body cable triceps extension',c:'Cable from opposite side, extend across the body at shoulder height.',u:1,a:['kickback','ropePush']},
hammer:{n:'DB hammer curl',c:'Palms facing in, the easiest grip on the elbow. No swing.',p:'Elbow',a:['ropeHammer','crossHammer']},
ropeHammer:{n:'Cable rope hammer curl',c:'Neutral grip, elbows still, squeeze at the top.',p:'Elbow',a:['hammer','crossHammer']},
crossHammer:{n:'Cross-body hammer curl',c:'Curl toward the opposite shoulder, neutral wrist.',p:'Elbow',u:1,a:['hammer','ropeHammer']},
preacherM:{n:'Machine preacher curl',c:'Stop just short of full lockout at the bottom to spare the elbow.',p:'Elbow',a:['cableCurl','hammer']},
cableCurl:{n:'Cable curl (EZ handle)',c:'Elbows at the sides, slow lower, no hip drive.',a:['preacherM','hammer']},
dbCurl:{n:'DB curl (supinating)',c:'Start neutral, turn palm up as you curl. Light enough for zero swing.',a:['cableCurl','hammer']},
/* lower */
trapDL:{n:'Trap-bar deadlift (high handles)',c:'Brace, push the floor away, spine stays neutral. End the set if the low back takes over.',p:'Lower back',a:['gobletBox','beltSquat','legPress']},
gobletBox:{n:'Goblet squat to box',c:'Sit back to the box, chest tall, knees track over toes.',p:'Lower back, left knee',a:['trapDL','beltSquat']},
beltSquat:{n:'Belt squat',c:'Loads the legs with zero spinal compression.',p:'Lower back',a:['gobletBox','legPress']},
rfess:{n:'Rear-foot elevated split squat',c:'Left leg first. Front heel heavy, knee tracks over the 2nd toe.',p:'Left knee (ACL), hips',u:1,a:['splitSq','revLunge','stepUp']},
splitSq:{n:'Split squat',c:'Left leg first. Both feet down, straight down and up.',p:'Left knee (ACL)',u:1,a:['rfess','revLunge']},
revLunge:{n:'Reverse lunge',c:'Left leg first. Step back, front heel heavy, torso tall.',p:'Left knee (ACL)',u:1,a:['splitSq','stepUp']},
seatHam:{n:'Seated hamstring curl',c:'Thigh pad snug, curl fully, 3-second return.',p:'Left knee (ACL)',a:['lyingHam','ballCurl']},
lyingHam:{n:'Lying hamstring curl',c:'Hips stay glued to the pad.',a:['seatHam','ballCurl']},
ballCurl:{n:'Stability-ball hamstring curl',c:'Hips up, roll the ball in with the heels.',bw:1,a:['seatHam','lyingHam']},
legPress:{n:'Leg press (feet high)',c:'Stop before the pelvis tucks under. Low back stays on the pad.',p:'Lower back',a:['hackSq','gobletBox']},
hackSq:{n:'Hack squat (moderate depth)',c:'Controlled depth, back flat on the pad.',a:['legPress','gobletBox']},
standCalf:{n:'Standing calf raise',c:'2-second pause in the bottom stretch. Builds ankle range.',p:'Ankle',a:['smithCalf','slCalf']},
smithCalf:{n:'Smith machine calf raise',c:'Full stretch, full squeeze, no bouncing.',p:'Ankle',a:['standCalf','slCalf']},
slCalf:{n:'Single-leg calf raise',c:'Left leg first. Hold a rail for balance.',p:'Ankle, left leg',u:1,a:['standCalf','seatCalf']},
seatCalf:{n:'Seated calf raise',c:'Pause at the bottom, squeeze at the top.',p:'Ankle',a:['standCalf','slCalf']},
hipAbd:{n:'Hip abduction machine',c:'Lean slightly forward, push knees out, 1-second squeeze.',p:'Hips, left knee, pelvic tilt',a:['cableAbd','bandWalk']},
cableAbd:{n:'Cable hip abduction',c:'Left leg first. Stand tall, sweep the leg out.',p:'Hips',u:1,a:['hipAbd','bandWalk']},
bandWalk:{n:'Banded lateral walk',t:1,s:30,bw:1,c:'Band above knees, half squat, small steps.',p:'Hips, left knee',a:['hipAbd','cableAbd']},
tibRaise:{n:'Tibialis raise (back to wall)',c:'Heels forward, lift toes to shins, slow lower.',p:'Ankle, left knee',bw:1,a:['heelWalk']},
heelWalk:{n:'Heel walk',t:1,s:30,bw:1,c:'Toes up, walk on your heels.',p:'Ankle',a:['tibRaise']},
hipThrust:{n:'Barbell hip thrust',c:'Chin tucked, ribs down, tuck the pelvis at the top. No arching.',p:'Pelvic tilt, lower back',a:['machThrust','dbBridge']},
machThrust:{n:'Hip thrust machine',c:'Posterior tilt at the top, 1-second squeeze.',p:'Pelvic tilt',a:['hipThrust','dbBridge']},
dbBridge:{n:'DB glute bridge (floor)',c:'DB on the hips, tuck and lift, pause.',p:'Pelvic tilt',a:['hipThrust','machThrust']},
dbRDL:{n:'DB Romanian deadlift',c:'Hips back, DBs skim the thighs, stop at a hamstring stretch. Spine long.',p:'Lower back',a:['pullThrough','slRDL','backExt45']},
pullThrough:{n:'Cable pull-through',c:'Hinge back, then snap hips through. Lower-back friendly.',p:'Lower back',a:['dbRDL','backExt45']},
slRDL:{n:'Single-leg RDL (hand support)',c:'Left leg first. Hold a rack, hips square.',p:'Left knee, lower back',u:1,a:['dbRDL','pullThrough']},
stepUp:{n:'DB step-up',c:'Left leg first. Knee-height box, drive through the whole foot, slow down.',p:'Left knee (ACL)',u:1,a:['rfess','revLunge']},
legExt:{n:'Leg extension (partial range)',c:'Work from 90° to about 30° of bend. Protects the ACL graft.',p:'Left knee (ACL)',a:['spanishSq','tke']},
spanishSq:{n:'Spanish squat (band)',c:'Band behind the knees, sit back, shins vertical.',p:'Left knee',bw:1,a:['legExt','tke']},
tke:{n:'Terminal knee extension (band)',c:'Left leg first. Straighten the knee against the band, squeeze the quad.',p:'Left knee (ACL)',u:1,bw:1,a:['legExt','spanishSq']},
backExt45:{n:'45° back extension (glute bias)',c:'Soft upper back, squeeze glutes, stop at neutral. Never overextend.',p:'Lower back',a:['pullThrough','dbBridge']},
adductM:{n:'Adductor machine',c:'Controlled range, pause at the squeeze.',p:'Hips, left knee',a:['copen','cableAdd']},
copen:{n:'Copenhagen plank (short lever)',t:1,s:20,u:1,bw:1,c:'Knee on bench, lift hips, body straight.',p:'Hips',a:['adductM','cableAdd']},
cableAdd:{n:'Cable hip adduction',c:'Left leg first. Sweep across the body with control.',u:1,a:['adductM','copen']},
/* core — no sit-ups or loaded flexion for L4-L5 */
deadBug:{n:'Dead bug',c:'Low back pressed down. Exhale as you reach.',p:'Lower back, pelvic tilt',u:1,bw:1,a:['birdDog','plank']},
birdDog:{n:'Bird dog (3-second hold)',c:'Long reach, spine locked, hips level.',p:'Lower back',u:1,bw:1,a:['deadBug','bearHold']},
sidePlank:{n:'Side plank',t:1,s:30,u:1,bw:1,c:'Left side first. Elbow under shoulder, hips high.',p:'Lower back',a:['sidePlankK','suitcase']},
sidePlankK:{n:'Side plank (knees)',t:1,s:30,u:1,bw:1,c:'Easier lever, same straight line.',a:['sidePlank']},
pallof:{n:'Pallof press',c:'Cable at chest height. Press out and resist the twist.',p:'Lower back',u:1,a:['pallofHold','deadBug']},
pallofHold:{n:'Pallof hold',t:1,s:30,u:1,c:'Arms out, stay square, breathe.',p:'Lower back',a:['pallof']},
mcgill:{n:'McGill curl-up',c:'One knee bent, hands under low back. Lift head and shoulders slightly, no spine curl.',p:'Lower back',bw:1,a:['deadBug','plank']},
plank:{n:'RKC plank',t:1,s:30,bw:1,c:'Squeeze glutes and quads hard, elbows pull toward toes.',p:'Pelvic tilt',a:['bearHold','deadBug']},
bearHold:{n:'Bear hold',t:1,s:30,bw:1,c:'Knees an inch off the floor, back flat.',a:['plank','birdDog']},
suitcase:{n:'Suitcase carry',t:1,s:30,u:1,c:'Left hand first. Walk tall, no leaning.',p:'Lower back',a:['farmer','sidePlank']},
farmer:{n:'Farmer carry',t:1,s:40,c:'Heavy DBs, tall posture, short steps.',a:['suitcase']},
/* mobility */
catCamel:{n:'Cat-camel',t:1,s:45,bw:1,c:'Slow wave through the spine, stop short of end range.',p:'Lower back (L4-L5)',a:['childPose']},
openBook:{n:'Open book (T-spine)',u:1,bw:1,c:'Knees stacked, chest turns, low back stays quiet.',p:'Back, right shoulder',a:['thread']},
thread:{n:'Thread the needle',u:1,bw:1,c:'On all fours, reach under then open up.',p:'Upper back',a:['openBook']},
crossBody:{n:'Cross-body shoulder stretch',t:1,s:30,u:1,bw:1,c:'Pull the arm across at chest height. Targets the back of the shoulder.',p:'Right shoulder (posterior)',a:['sleeper']},
sleeper:{n:'Modified sleeper stretch',t:1,s:30,u:1,bw:1,c:'Lie rolled slightly back, gently press the forearm down. Mild only.',p:'Right shoulder (posterior)',a:['crossBody']},
wallSlide:{n:'Wall slide with lift-off',bw:1,c:'Ribs down, forearms on wall, slide up, lift off an inch.',p:'Right shoulder',a:['bandPA']},
bandPA:{n:'Band pull-apart',bw:1,c:'Ribs down, pull to a T, 1-second pause.',p:'Right shoulder, upper back',a:['wallSlide','facePull']},
bandER:{n:'Band external rotation',u:1,bw:1,c:'Elbow at the side, rotate out slowly.',p:'Right shoulder',a:['sideER']},
wristEcc:{n:'Wrist extensor eccentrics',u:1,bw:1,c:'Light DB, palm down. Lift with the other hand, lower slowly over 4 seconds.',p:'Tennis elbow',a:['flexbar']},
flexbar:{n:'Flexbar reverse twist',u:1,bw:1,c:'Tyler twist, slow eccentric.',p:'Tennis elbow',a:['wristEcc']},
hipFlexPPT:{n:'Half-kneeling hip flexor stretch',t:1,s:40,u:1,bw:1,c:'Tuck the pelvis and squeeze the down-knee glute before leaning.',p:'Pelvic tilt, hips',a:['couch']},
couch:{n:'Couch stretch',t:1,s:40,u:1,bw:1,c:'Glute on, ribs down, mild pull only.',p:'Pelvic tilt, hips',a:['hipFlexPPT']},
kneeWall:{n:'Knee-to-wall ankle rocks',u:1,bw:1,c:'Heel stays down. Do an extra set on the left.',p:'Ankle, left leg',a:['slantCalf']},
slantCalf:{n:'Slant-board calf stretch',t:1,s:40,bw:1,c:'Knees straight, then bent.',p:'Ankle',a:['kneeWall']},
mckenzie:{n:'Prone press-up',bw:1,c:'Hips stay down. Skip it if pain travels into the leg.',p:'Lower back (L4-L5)',a:['catCamel']},
hip9090:{n:'90/90 hip switches',u:1,bw:1,c:'Tall chest, rotate from the hips.',p:'Hips',a:['worldGreatest']},
adductRock:{n:'Adductor rock-back',u:1,bw:1,c:'Hips back, keep the spine neutral.',p:'Hips',a:['hip9090']},
tkeMob:{n:'Terminal knee extension (band)',u:1,bw:1,c:'Left leg first. Squeeze the quad to fully straighten.',p:'Left knee (ACL)',a:['slBalance']},
bridgePPT:{n:'Glute bridge with pelvic tuck',bw:1,c:'Tuck first, then lift. No lumbar arch.',p:'Pelvic tilt, lower back',a:['deadBug']},
slBalance:{n:'Single-leg balance',t:1,s:30,u:1,bw:1,c:'Left leg first. Soft knee, eyes forward. Close eyes to progress.',p:'Left knee (ACL), ankle',a:['tkeMob']},
worldGreatest:{n:"World's greatest stretch",u:1,bw:1,c:'Lunge, elbow to instep, rotate open.',p:'Hips, back',a:['hip9090']},
tempoSquat:{n:'Tempo squat (3 s down)',bw:1,c:'Sit between the hips, knees track the 2nd toe, 3-second lower.',p:'Left knee (ACL), hips',a:['squatChair','wallSit']},
squatChair:{n:'Squat to chair',bw:1,c:'Tap the chair lightly and stand. Gives the knee a safe, controlled depth.',p:'Left knee (ACL), lower back',a:['tempoSquat','wallSit']},
wallSit:{n:'Wall sit',t:1,s:40,bw:1,c:'Thighs toward parallel only as far as the knee is happy. Weight in the heels.',p:'Left knee (ACL)',a:['squatChair','tempoSquat']},
inclinePU:{n:'Incline push-up (hands on desk or bed)',bw:1,c:'Body in one line, elbows about 45°. Higher hands are easier on the shoulder.',p:'Right shoulder',a:['pushup','kneePU']},
kneePU:{n:'Knee push-up',bw:1,c:'Knees down, hips in line, full control.',p:'Right shoulder',a:['inclinePU','pushup']},
closePU:{n:'Close-hand incline push-up',bw:1,c:'Hands shoulder-width, elbows brush the ribs. Triceps focus.',p:'Right shoulder',a:['inclinePU','kneePU']},
doorRow:{n:'Door-frame row',bw:1,c:'Grip both sides of a sturdy door frame, lean back and row your chest to it. Feet closer = harder.',p:'Upper back, right shoulder',a:['towelRow','proneYTW']},
towelRow:{n:'Towel door row',bw:1,c:'Towel around the handles of a closed door that opens away from you. Test it holds, lean back, row.',p:'Upper back',a:['doorRow','proneYTW']},
proneYTW:{n:'Prone Y-T-W raise',bw:1,c:'Face down, forehead on a towel. Reps = each letter. Thumbs up, slow and light.',p:'Right shoulder, upper back',a:['doorRow','wallSlide']},
towelCurl:{n:'Towel isometric curl',t:1,s:20,u:1,bw:1,c:'Stand on a towel, curl the ends up hard against it and hold. Neutral grip spares the elbow.',p:'Elbow',a:['doorCurl']},
doorCurl:{n:'Door-frame biceps curl',bw:1,u:1,c:'Hold the frame palm up, lean back, curl yourself in slowly.',a:['towelCurl']},
bwRevLunge:{n:'Reverse lunge',bw:1,u:1,c:'Left leg first. Step back, front heel heavy, torso tall.',p:'Left knee (ACL)',a:['bwSplit','chairStep']},
bwSplit:{n:'Split squat (3 s down)',bw:1,u:1,c:'Left leg first. Straight down and up, front heel heavy.',p:'Left knee (ACL)',a:['bwRevLunge','chairStep']},
chairStep:{n:'Step-up onto a sturdy chair',bw:1,u:1,c:'Left leg first. Drive through the whole foot, step down slowly. Use a lower step if the chair is tall.',p:'Left knee (ACL)',a:['bwSplit','bwRevLunge']},
skater:{n:'Skater squat to pillow',bw:1,u:1,c:'Left leg first. Back knee taps a folded pillow; fingertips on a wall for balance.',p:'Left knee (ACL), hips',a:['bwSplit','chairStep']},
bwSLRDL:{n:'Single-leg RDL (bodyweight)',bw:1,u:1,c:'Left leg first. Fingertips on a wall, hips square, spine long.',p:'Left knee, lower back',a:['slBridge','bedThrust']},
slBridge:{n:'Single-leg glute bridge',bw:1,u:1,c:'Left leg first. Tuck the pelvis, drive through the heel, pause.',p:'Pelvic tilt, lower back',a:['bridgeMarch','bedThrust']},
bedThrust:{n:'Hip thrust, shoulders on the bed',bw:1,c:'Chin tucked, ribs down, pelvis tucked at the top. 2-second pause.',p:'Pelvic tilt, lower back',a:['slBridge','bridgeMarch']},
bridgeMarch:{n:'Glute bridge march',bw:1,u:1,c:'Hips high and level while you lift one foot at a time.',p:'Pelvic tilt, lower back',a:['slBridge','bedThrust']},
latLunge:{n:'Lateral lunge',bw:1,u:1,c:'Left side first. Sit back into the hip, other leg long.',p:'Hips',a:['adductRock','bwSplit']},
lungeKnee:{n:'Reverse lunge to knee drive',bw:1,u:1,c:'Left leg first. Step back, drive the knee up and balance for a second. No jumping.',p:'Left knee (ACL), balance',a:['bwRevLunge','chairStep']},
bearCrawl:{n:'Bear crawl',t:1,s:30,bw:1,c:'Knees an inch off the floor, small steps forward and back, back flat.',p:'Shoulder stability, core',a:['bearHold']},
slCalfBW:{n:'Single-leg calf raise (on a step)',bw:1,u:1,c:'Left leg first. Full stretch at the bottom, hold a wall.',p:'Ankle, left leg',a:['tibRaise']},
wristStretch:{n:'Wrist extensor stretch',t:1,s:30,u:1,bw:1,c:'Arm straight, palm down, gently bend the wrist with the other hand.',p:'Tennis elbow',a:['wristEcc']},
bikeWU:{n:'Easy bike or incline walk',t:1,s:180,bw:1,c:'Start easy and build to a moderate pace. Aim for a light sweat, not fatigue.',a:['marchWU']},
marchWU:{n:'March in place with arm swings',t:1,s:90,bw:1,c:'Knees to hip height, swing the arms, breathe through the nose.',a:['bikeWU']},
scapPU:{n:'Scap push-up',bw:1,c:'Arms locked. Let the shoulder blades sink together, then push them apart.',p:'Right shoulder',a:['wallSlide','bandPA']},
rampUp:{n:'Ramp-up sets for your first lift',bw:1,unit:'sets',c:'Two light sets of the first strength exercise: about 50% for 8 reps, then 70% for 4 reps. Log nothing, just groove the pattern.'},
childPose:{n:"Child's pose breathing",t:1,s:60,bw:1,c:'Breathe into the low back, arms long.',p:'Lower back',a:['catCamel']}
};

/* =====================================================================
   EXERCISE DATABASE EXTENSION — classic gym, home and bodyweight moves
   ===================================================================== */
const E2={
bbSquat:{n:'Barbell back squat',c:'Bar on upper back, brace hard, sit between the hips, knees track over toes, drive up.'},
frontSquat:{n:'Front squat',c:'Bar on the front of the shoulders, elbows high, torso upright, sit straight down.'},
smithSquat:{n:'Smith machine squat',c:'Feet slightly forward of the bar, controlled depth, push through the whole foot.'},
gobletSq:{n:'Goblet squat',c:'Hold a dumbbell at the chest, elbows inside the knees at the bottom, chest tall.'},
boxPistol:{n:'Box pistol squat',u:1,bw:1,c:'One leg, sit back to a box, other leg out front, stand without pushing off.'},
bbDeadlift:{n:'Conventional deadlift',c:'Bar over mid-foot, lats tight, push the floor away, lock hips and knees together.'},
sumoDL:{n:'Sumo deadlift',c:'Wide stance, hands inside the knees, chest up, spread the floor as you stand.'},
bbRDL:{n:'Barbell Romanian deadlift',c:'Soft knees, push hips back, bar slides down the thighs, stop at a hamstring stretch.'},
goodMorning:{n:'Good morning',c:'Bar on upper back, hinge at the hips with a long spine, stand by driving hips forward.'},
kbSwing:{n:'Kettlebell swing',c:'Hike the bell back, snap the hips forward, arms just guide it to chest height.'},
kbDeadlift:{n:'Kettlebell deadlift',c:'Bell between the feet, hinge, flat back, stand tall and squeeze the glutes.'},
rackPull:{n:'Rack pull',c:'Bar set just below the knees, brace and lock out. Builds the top of the deadlift.'},
bbBench:{n:'Barbell bench press',c:'Shoulder blades pinned, feet planted, lower to mid-chest, press up and slightly back.'},
bbIncline:{n:'Incline barbell bench press',c:'Bench at 30°, lower to the upper chest, elbows about 45° from the body.'},
dbBench:{n:'Flat dumbbell bench press',c:'Lower the dumbbells to chest level, press up, let them come slightly together.'},
smithIncline:{n:'Smith machine incline press',c:'Bench at 30° under the bar, lower to the upper chest with control.'},
dips:{n:'Dips',bw:1,c:'Slight forward lean, lower until shoulders are level with elbows, press up.'},
pecDeck:{n:'Pec deck',c:'Elbows soft, squeeze the handles together in front of the chest, slow return.'},
dbFly:{n:'Dumbbell fly',c:'Slight elbow bend, open wide until you feel a chest stretch, hug back up.'},
lowCableFly:{n:'Low-to-high cable fly',c:'Cables from low, sweep up to chin height, squeeze the upper chest.'},
ohp:{n:'Standing overhead press',c:'Glutes tight, ribs down, press the bar straight up and move the head through.'},
dbOHP:{n:'Seated dumbbell shoulder press',c:'Back supported, press up from shoulder height, stop just short of lockout.'},
arnold:{n:'Arnold press',c:'Start palms facing you, rotate out as you press overhead.'},
pikePU:{n:'Pike push-up',bw:1,c:'Hips high in an upside-down V, lower the head toward the floor, press back.'},
pullup:{n:'Pull-up',bw:1,c:'Full hang, pull the chest to the bar, elbows drive down to the ribs.'},
chinup:{n:'Chin-up',bw:1,c:'Palms facing you, pull the chin over the bar, control the way down.'},
wideLat:{n:'Wide-grip lat pulldown',c:'Grip just outside shoulders, pull to the upper chest, lean back slightly.'},
bbRow:{n:'Barbell bent-over row',c:'Hinge to about 45°, flat back, pull the bar to the lower ribs.'},
dbRow:{n:'One-arm dumbbell row',u:1,c:'Hand and knee on a bench, pull the dumbbell to the hip, no twisting.'},
cableRow:{n:'Seated cable row',c:'Chest up, pull the handle to the belly, squeeze the shoulder blades.'},
invRow:{n:'Inverted row',bw:1,c:'Under a bar or rings, body straight, pull the chest up to the bar.'},
tbarRow:{n:'T-bar row (landmine)',c:'Straddle the bar, flat back, row the handle to the chest.'},
meadowsRow:{n:'Meadows row',u:1,c:'Staggered stance by a landmine, row the bar end up past the hip.'},
dbShrug:{n:'Dumbbell shrug',c:'Arms long, lift the shoulders to the ears, pause, lower slowly.'},
bbCurl:{n:'Barbell curl',c:'Elbows at the sides, curl without swinging, lower over 2 seconds.'},
ezCurl:{n:'EZ-bar curl',c:'Angled grip is easier on the wrists. Elbows still, full range.'},
concCurl:{n:'Concentration curl',u:1,c:'Elbow against the inner thigh, curl and squeeze at the top.'},
inclineCurl:{n:'Incline dumbbell curl',c:'Lie back on an incline bench, arms hang, curl without moving the elbows.'},
spiderCurl:{n:'Spider curl',c:'Chest on an incline bench, arms hang straight down, curl up.'},
skull:{n:'EZ-bar skull crusher',c:'Lower the bar toward the forehead, elbows pointing up, extend.'},
cgBench:{n:'Close-grip bench press',c:'Hands shoulder-width, elbows tucked, press to lockout.'},
ohDbExt:{n:'Overhead dumbbell triceps extension',c:'Hold one dumbbell overhead with both hands, lower behind the head, extend.'},
benchDip:{n:'Bench dip',bw:1,c:'Hands on a bench behind you, lower until elbows reach 90°, press up.'},
diamondPU:{n:'Diamond push-up',bw:1,c:'Hands together under the chest, elbows brush the ribs.'},
walkLunge:{n:'Walking lunge',u:1,c:'Long steps, back knee toward the floor, drive through the front heel.'},
fwdLunge:{n:'Forward lunge',u:1,bw:1,c:'Step forward, both knees to 90°, push back to standing.'},
cossack:{n:'Cossack squat',u:1,bw:1,c:'Wide stance, sit into one hip while the other leg stays straight, toes up.'},
latStepDown:{n:'Lateral step-down',u:1,bw:1,c:'Stand on a step, slowly lower the other heel to the floor, knee over toes.'},
nordic:{n:'Nordic hamstring curl',bw:1,c:'Feet anchored, lower the body forward as slowly as you can, push back up.'},
gluteKick:{n:'Cable glute kickback',u:1,c:'Ankle strap, hinge slightly, kick the leg back and squeeze the glute.'},
slHipThrust:{n:'Single-leg hip thrust',u:1,bw:1,c:'Shoulders on a bench, one foot down, drive the hips up level.'},
clamshell:{n:'Clamshell',u:1,bw:1,c:'Side-lying, knees bent, band above knees, open the top knee without rolling back.'},
sideLyingAbd:{n:'Side-lying hip abduction',u:1,bw:1,c:'Lie on your side, top leg straight, lift it slightly behind the body.'},
legPressCalf:{n:'Leg press calf raise',c:'Balls of the feet on the platform edge, full stretch, full squeeze.'},
hangLegRaise:{n:'Hanging leg raise',bw:1,c:'Hang from a bar, curl the hips up, no swinging.'},
abWheel:{n:'Ab wheel rollout',bw:1,c:'From the knees, roll out with a flat back, pull back using the abs.'},
cableCrunch:{n:'Cable crunch',c:'Kneel facing the stack, rope by the head, crunch the ribs toward the hips.'},
woodchop:{n:'Cable woodchop',u:1,c:'Rotate through the hips and upper back, arms long, control the return.'},
hollow:{n:'Hollow body hold',t:1,s:30,bw:1,c:'Low back pressed down, arms and legs long and off the floor.'},
shoulderTap:{n:'Plank shoulder taps',bw:1,u:1,c:'High plank, feet wide, tap the opposite shoulder without rocking.'},
revCrunch:{n:'Reverse crunch',bw:1,c:'On your back, curl the knees to the chest and lift the hips slightly.'},
legRaise:{n:'Lying leg raise',bw:1,c:'Hands under the hips, lower straight legs slowly, back stays down.'},
mtnClimber:{n:'Mountain climbers',t:1,s:30,bw:1,c:'High plank, drive the knees forward one at a time, hips low.'},
sledPush:{n:'Sled push',t:1,s:30,c:'Arms locked, body at 45°, short powerful steps.'},
battleRopes:{n:'Battle ropes',t:1,s:30,c:'Athletic stance, fast alternating waves from the shoulders.'},
burpee:{n:'Burpee',bw:1,c:'Squat, kick back to a plank, chest down, jump up. Step instead of jump to make it easier.'},
jumpRope:{n:'Jump rope',t:1,s:45,bw:1,c:'Small hops on the balls of the feet, wrists turn the rope.'},
boxJump:{n:'Box jump',bw:1,c:'Swing the arms, jump, land softly with bent knees, step down.'},
frontRaise:{n:'Dumbbell front raise',c:'Raise to shoulder height in front, thumbs up, slow lower.'},
rearDbFly:{n:'Bent-over rear-delt raise',c:'Hinge forward, arms slightly bent, raise out to the sides.'},
deadHang:{n:'Dead hang',t:1,s:30,bw:1,c:'Hang from a bar with relaxed shoulders. Builds grip and decompresses the spine.'},
bandFacePull:{n:'Band face pull',bw:1,c:'Band at eye level, pull to the face, thumbs point back.'},
bandRow:{n:'Band row',bw:1,c:'Band anchored in front, row the hands to the ribs, squeeze.'},
bandPress:{n:'Band chest press',bw:1,c:'Band behind the back, press forward to straight arms.'},
bandOHP:{n:'Band overhead press',bw:1,c:'Stand on the band, press the hands overhead.'},
bandCurl:{n:'Band curl',bw:1,c:'Stand on the band, curl up, elbows still.'},
bandPushdown:{n:'Band triceps pushdown',bw:1,c:'Band anchored high, elbows pinned, push down to straight arms.'},
bandPullDown:{n:'Band lat pulldown',bw:1,c:'Band anchored high, pull the elbows down to the ribs.'},
hipThrustBand:{n:'Banded glute bridge',bw:1,c:'Band above the knees, push the knees out as you lift the hips.'},
rowErg:{n:'Rowing machine',t:1,s:60,c:'Legs, then body, then arms; reverse on the way back.'}
};
Object.assign(E,E2);
/* ---------- more classic moves (each has a demo video) ---------- */
const E3={
smithBench:{n:'Smith machine bench press',c:'Bench under the bar so it lands on the mid-chest. Shoulder blades pinned, lower with control, press up.'},
declineBench:{n:'Decline barbell bench press',c:'Feet locked under the pads, lower the bar to the bottom of the chest, press up. Use a spotter.'},
cableCross:{n:'High-to-low cable crossover',c:'Pulleys high, step forward, sweep the hands down and together in front of the hips. Soft elbows.'},
machDip:{n:'Seated dip machine',c:'Sit tall, elbows tucked, press the handles down to straight arms, return slowly.'},
declinePU:{n:'Decline push-up',bw:1,c:'Feet on a bench, hands on the floor, body in one line, lower the chest and press up.'},
archerPU:{n:'Archer push-up',bw:1,u:1,c:'Hands wide, lower toward one hand while the other arm stays straight. Alternate sides.'},
uprightRow:{n:'Cable upright row',c:'Low pulley, wide grip, lead with the elbows up to chest height, no higher than the shoulders.'},
kbPress:{n:'Kettlebell overhead press',u:1,c:'Bell in the rack position, ribs down, glutes tight, press straight up and lower with control.'},
dbPullover:{n:'Dumbbell pullover',c:'Lie across a bench, arms slightly bent, lower the dumbbell behind the head, pull back over the chest.'},
pendlayRow:{n:'Pendlay row',c:'Torso parallel to the floor, row the bar from a dead stop on the floor to the lower chest each rep.'},
kbRow:{n:'Kettlebell bent-over row',c:'Hinge with a flat back, row the bells to the hips, squeeze the shoulder blades.'},
bbShrug:{n:'Barbell shrug',c:'Bar at arm’s length, lift the shoulders straight up to the ears, pause, lower slowly.'},
revCurl:{n:'Reverse-grip EZ-bar curl',c:'Palms down, elbows at the sides, curl up slowly. Builds the forearms and brachialis.'},
dbPreacher:{n:'Dumbbell preacher curl',u:1,c:'Upper arm flat on the pad, curl up, lower until the arm is almost straight.'},
zottman:{n:'Zottman curl',c:'Curl up palms up, turn the palms down at the top, lower slowly with palms down.'},
cableOHExt:{n:'Cable overhead triceps extension',c:'Face away from a low pulley, elbows by the head, extend the rope forward and up.'},
dbSkull:{n:'Dumbbell skull crusher',c:'Lie on a bench, palms facing in, bend only the elbows to lower beside the head, extend.'},
airSquat:{n:'Bodyweight squat',bw:1,c:'Feet just outside the hips, sit down between the heels, knees track the toes, stand tall.'},
kbGoblet:{n:'Kettlebell goblet squat',c:'Hold the bell by the horns at the chest, elbows inside the knees at the bottom, chest tall.'},
sumoDbSq:{n:'Dumbbell sumo squat',c:'Wide stance, toes out, dumbbell hanging between the legs, squat straight down, knees out.'},
sissySq:{n:'Sissy squat (assisted)',bw:1,c:'Hold a support, rise onto the toes and lean back as the knees travel forward. Small range to start.'},
singleLegPress:{n:'Single-leg leg press',u:1,c:'One foot in the middle of the platform, lower until the knee is about 90°, press without locking.'},
curtsy:{n:'Curtsy lunge',u:1,bw:1,c:'Step one foot diagonally behind the other, lower into a lunge, push back up through the front foot.'},
standLegCurl:{n:'Standing leg curl',u:1,c:'Pad just above the heel, thigh against the pad, curl the heel up and lower slowly.'},
ghr:{n:'Glute-ham raise',bw:1,c:'Knees on the pad, body straight from head to knees, lower forward slowly and pull back with the hamstrings.'},
revHyper:{n:'Reverse hyperextension',c:'Lie face down on the pad, legs hanging, lift the legs to hip height with the glutes, lower with control.'},
gluteBridge:{n:'Glute bridge',bw:1,c:'Feet close to the hips, flatten the low back, drive through the heels, squeeze the glutes at the top.'},
donkeyCalf:{n:'Donkey calf raise',c:'Hinge forward with the hips loaded, balls of the feet on a block, full stretch, full squeeze.'},
russianTwist:{n:'Russian twist',bw:1,c:'Sit leaning back with a long spine, rotate the ribs side to side, hips stay still.'},
bicycleCrunch:{n:'Bicycle crunch',bw:1,c:'Low back down, bring one elbow toward the opposite knee as the other leg extends. Slow and controlled.'},
vUp:{n:'V-up',bw:1,c:'Lie long, lift the arms and legs together to meet over the hips, lower slowly without resting.'},
landmineRot:{n:'Landmine rotation',c:'Arms straight, bar end at chest height, rotate the bar to one hip and back, pivot the back foot.'},
tgu:{n:'Turkish get-up',u:1,c:'Bell locked out overhead, eyes on it, stand up step by step and reverse the same way. Go light.'},
medBallSlam:{n:'Medicine ball slam',c:'Lift the ball overhead, rise tall, then slam it into the floor with the whole body. Use a dead ball.'},
jumpSquat:{n:'Jump squat',bw:1,c:'Squat to a comfortable depth, drive through the floor and jump, land softly with bent knees.'},
broadJump:{n:'Broad jump',bw:1,c:'Swing the arms back, jump forward as far as you can, land softly and stick the landing.'},
assaultBike:{n:'Air bike',t:1,s:60,c:'Push and pull the handles while you pedal. Seat high enough for a slight knee bend at the bottom.'},
skiErg:{n:'Ski erg',t:1,s:60,c:'Reach tall, pull the handles down by hinging and bending the knees, finish with hands by the hips.'},
stairClimber:{n:'Stair climber',t:1,s:120,c:'Stand tall, whole foot on each step, hands only lightly on the rails.'},
sledPull:{n:'Backward sled drag',t:1,s:30,c:'Hold the straps with straight arms, sit back slightly and walk backward with short steps.'}
};
Object.assign(E,E3);
/* tags: pattern | equipment | level 1-3 | joints it loads (avoid if injured) | M = can be a main lift
   equipment: gym (machines/cables), bb (barbell, trap bar, landmine), db, kb, band, bw
   joints: lb lower back, sh shoulder, kn knee, el elbow, wr wrist, hp hip, an ankle */
const META_RAW={
incDB:'hpush|db|1||M',incMach:'hpush|gym|1||M',floorPress:'hpush|db|1||M',machChest:'hpush|gym|1||M',cFly:'fly|gym|1|sh|',pushup:'hpush|bw|1|wr|M',flatDBng:'hpush|db|1||M',
csRow:'hpull|db|1||M',sealRow:'hpull|gym|1||M',machRow:'hpull|gym|1||M',saCableRow:'hpull|gym|1||',lmPress:'vpush|bb|1||M',saDBPress:'vpush|db|1|sh|',machShoulder:'vpush|gym|1|sh|M',
ngPulldown:'vpull|gym|1||M',assistPull:'vpull|gym|1||M',saPulldown:'vpull|gym|1||',straightArm:'vpull|gym|1||',cLat:'lat|gym|1||',dbLat:'lat|db|1||',machLat:'lat|gym|1||',
facePull:'rear|gym|1||',revPec:'rear|gym|1||',cRearFly:'rear|gym|1||',proneT:'rear|db|1||',yRaise:'cuff|gym|1||',proneY:'cuff|db|1||',sideER:'cuff|db|1||',cableER:'cuff|gym|1||',
ropePush:'tri|gym|1||',vbarPush:'tri|gym|1||',kickback:'tri|gym|1||',crossExt:'tri|gym|2||',hammer:'bi|db|1||',ropeHammer:'bi|gym|1||',crossHammer:'bi|db|1||',preacherM:'bi|gym|1||',cableCurl:'bi|gym|1||',dbCurl:'bi|db|1|el|',
trapDL:'hinge|bb|2|lb|M',gobletBox:'squat|db|1||M',beltSquat:'squat|gym|1||M',rfess:'lunge|db|2|kn|M',splitSq:'lunge|db|1|kn|',revLunge:'lunge|db|1||',seatHam:'ham|gym|1||',lyingHam:'ham|gym|1||',ballCurl:'ham|gym|2||',
legPress:'squat|gym|1||M',hackSq:'squat|gym|2|kn|M',standCalf:'calf|gym|1||',smithCalf:'calf|gym|1||',slCalf:'calf|db|1||',seatCalf:'calf|gym|1||',hipAbd:'abd|gym|1||',cableAbd:'abd|gym|1||',bandWalk:'abd|band|1||',
tibRaise:'tib|bw|1||',heelWalk:'tib|bw|1||',hipThrust:'glute|bb|1||M',machThrust:'glute|gym|1||M',dbBridge:'glute|db|1||',dbRDL:'hinge|db|1|lb|M',pullThrough:'hinge|gym|1||',slRDL:'hinge|db|2||',
stepUp:'lunge|db|1||',legExt:'quad|gym|1||',spanishSq:'quad|band|1||',tke:'quad|band|1||',backExt45:'hinge|gym|1|lb|',adductM:'add|gym|1||',copen:'add|bw|2||',cableAdd:'add|gym|1||',
deadBug:'coreAE|bw|1||',birdDog:'coreAR|bw|1||',sidePlank:'coreLat|bw|1|sh|',sidePlankK:'coreLat|bw|1||',pallof:'coreAR|gym|1||',pallofHold:'coreAR|band|1||',mcgill:'coreFlex|bw|1||',plank:'coreAE|bw|1||',bearHold:'coreAE|bw|1|wr|',
suitcase:'carry|db|1||',farmer:'carry|db|1||',tempoSquat:'squat|bw|1||M',squatChair:'squat|bw|1||M',wallSit:'quad|bw|1||',inclinePU:'hpush|bw|1||M',kneePU:'hpush|bw|1|wr|M',closePU:'tri|bw|1||',
doorRow:'hpull|bw|1||M',towelRow:'hpull|bw|1||',proneYTW:'rear|bw|1||',towelCurl:'bi|bw|1||',doorCurl:'bi|bw|1||',bwRevLunge:'lunge|bw|1||M',bwSplit:'lunge|bw|1|kn|M',chairStep:'lunge|bw|1||',
skater:'lunge|bw|2|kn|',bwSLRDL:'hinge|bw|1||M',slBridge:'glute|bw|1||M',bedThrust:'glute|bw|1||',bridgeMarch:'glute|bw|1||',latLunge:'lunge|bw|1|kn|',lungeKnee:'lunge|bw|1|kn|',bearCrawl:'coreAE|bw|2|wr|',slCalfBW:'calf|bw|1||',
bbSquat:'squat|bb|2|lb,kn|M',frontSquat:'squat|bb|3|lb,wr,kn|M',smithSquat:'squat|gym|1|kn|M',gobletSq:'squat|db|1||M',boxPistol:'squat|bw|3|kn|',
bbDeadlift:'hinge|bb|2|lb|M',sumoDL:'hinge|bb|2|lb,hp|M',bbRDL:'hinge|bb|2|lb|M',goodMorning:'hinge|bb|3|lb|',kbSwing:'hinge|kb|2|lb|',kbDeadlift:'hinge|kb|1||M',rackPull:'hinge|bb|2|lb|M',
bbBench:'hpush|bb|2|sh|M',bbIncline:'hpush|bb|2|sh|M',dbBench:'hpush|db|1||M',smithIncline:'hpush|gym|1||M',dips:'hpush|bw|2|sh,el|',pecDeck:'fly|gym|1||',dbFly:'fly|db|1|sh|',lowCableFly:'fly|gym|1||',
ohp:'vpush|bb|2|sh,lb|M',dbOHP:'vpush|db|1|sh|M',arnold:'vpush|db|2|sh|',pikePU:'vpush|bw|2|sh,wr|M',pullup:'vpull|bw|3|sh,el|M',chinup:'vpull|bw|2|el|M',wideLat:'vpull|gym|1|sh|M',
bbRow:'hpull|bb|2|lb|M',dbRow:'hpull|db|1||M',cableRow:'hpull|gym|1||M',invRow:'hpull|bw|2||M',tbarRow:'hpull|bb|2|lb|M',meadowsRow:'hpull|bb|3||',dbShrug:'shrug|db|1||',
bbCurl:'bi|bb|1|el,wr|',ezCurl:'bi|bb|1|el|',concCurl:'bi|db|1||',inclineCurl:'bi|db|2|sh|',spiderCurl:'bi|db|2||',skull:'tri|bb|2|el|',cgBench:'tri|bb|2|wr,sh|',ohDbExt:'tri|db|1|sh,el|',benchDip:'tri|bw|1|sh|',diamondPU:'tri|bw|2|wr,el|',
walkLunge:'lunge|db|1|kn|M',fwdLunge:'lunge|bw|1|kn|',cossack:'lunge|bw|2|kn,hp|',latStepDown:'quad|bw|1||',nordic:'ham|bw|3|kn|',gluteKick:'glute|gym|1||',slHipThrust:'glute|bw|2||',clamshell:'abd|band|1||',sideLyingAbd:'abd|bw|1||',legPressCalf:'calf|gym|1||',
hangLegRaise:'coreFlex|bw|3|lb,sh|',abWheel:'coreAE|bw|3|lb,sh|',cableCrunch:'coreFlex|gym|2|lb|',woodchop:'coreAR|gym|1||',hollow:'coreAE|bw|2|lb|',shoulderTap:'coreAR|bw|1|wr|',revCrunch:'coreFlex|bw|1|lb|',legRaise:'coreFlex|bw|2|lb|',
mtnClimber:'cardio|bw|1|wr|',sledPush:'cardio|gym|2||',battleRopes:'cardio|gym|1|sh|',burpee:'cardio|bw|2|kn,wr,lb|',jumpRope:'cardio|bw|1|kn,an|',boxJump:'power|bw|2|kn,an|',rowErg:'cardio|gym|1|lb|',
frontRaise:'lat|db|1|sh|',rearDbFly:'rear|db|1|lb|',deadHang:'shrug|bw|1|sh|',bandFacePull:'rear|band|1||',bandRow:'hpull|band|1||M',bandPress:'hpush|band|1||M',bandOHP:'vpush|band|1|sh|M',bandCurl:'bi|band|1||',bandPushdown:'tri|band|1||',bandPullDown:'vpull|band|1||M',hipThrustBand:'glute|band|1||M',
smithBench:'hpush|gym|1||M',declineBench:'hpush|bb|2|sh|M',cableCross:'fly|gym|1||',machDip:'tri|gym|1|sh|',declinePU:'hpush|bw|2|wr|M',archerPU:'hpush|bw|3|wr,sh|',
uprightRow:'lat|gym|2|sh|',kbPress:'vpush|kb|2|sh|M',dbPullover:'vpull|db|1|sh|',pendlayRow:'hpull|bb|3|lb|M',kbRow:'hpull|kb|1||M',bbShrug:'shrug|bb|1||',
revCurl:'bi|bb|1|wr|',dbPreacher:'bi|db|1||',zottman:'bi|db|2|wr|',cableOHExt:'tri|gym|1|el|',dbSkull:'tri|db|1|el|',
airSquat:'squat|bw|1||M',kbGoblet:'squat|kb|1||M',sumoDbSq:'squat|db|1||M',sissySq:'quad|bw|2|kn|',singleLegPress:'squat|gym|1||',curtsy:'lunge|bw|1|kn|',
standLegCurl:'ham|gym|1||',ghr:'ham|gym|3|kn|',revHyper:'hinge|gym|1||',gluteBridge:'glute|bw|1||M',donkeyCalf:'calf|gym|1||',
russianTwist:'coreAR|bw|1|lb|',bicycleCrunch:'coreFlex|bw|1||',vUp:'coreFlex|bw|2|lb|',landmineRot:'coreAR|bb|2|lb|',tgu:'coreAR|kb|3|sh|',
medBallSlam:'power|gym|1|lb|',jumpSquat:'power|bw|2|kn,an|',broadJump:'power|bw|2|kn,an|',assaultBike:'cardio|gym|1||',skiErg:'cardio|gym|1|lb|',stairClimber:'cardio|gym|1||',sledPull:'cardio|gym|1||'
};
const META={};Object.keys(META_RAW).forEach(id=>{const[p,eq,l,av,f]=META_RAW[id].split('|');META[id]={pat:p,eq,lvl:+l,av:av?av.split(','):[],main:f==='M'}});
// auto-alternatives for exercises without a hand-picked list
Object.keys(META).forEach(id=>{if(E[id]&&!E[id].a){E[id].a=Object.keys(META).filter(x=>x!==id&&META[x].pat===META[id].pat&&E[x]).slice(0,4)}});
const EXDB_COUNT=Object.keys(META).length+21; // strength/core/cardio moves + mobility & warm-up drills

/* =====================================================================
   PLAN GENERATOR
   ===================================================================== */
const INJ={lb:'Lower back',sh:'Shoulder',kn:'Knee',el:'Elbow',wr:'Wrist',hp:'Hip',an:'Ankle'};
const SPEC={
  gUA:{n:'Upper A',f:'Push focus and arms',k:'upper',b:[[1,'main',[['main',['hpush']]]],[2,'sec',[['sec',['hpull']],['sec',['vpush','hpush']]]],[4,'acc',[['acc',['vpull']],['acc',['lat']]]],[3,'arm',[['arm',['tri']],['arm',['bi']]]],[5,'pre',[['pre',['rear','cuff']]]]]},
  gUB:{n:'Upper B',f:'Pull focus and arms',k:'upper',b:[[1,'main',[['main',['vpull']]]],[2,'sec',[['sec',['hpull']],['sec',['hpush']]]],[4,'acc',[['acc',['rear']],['acc',['fly','lat']]]],[3,'arm',[['arm',['bi']],['arm',['tri']]]],[5,'pre',[['pre',['cuff','rear']]]]]},
  gUC:{n:'Upper C',f:'Shoulders and arms',k:'upper',b:[[1,'main',[['main',['vpush','hpush']]]],[2,'sec',[['sec',['hpull']],['sec',['hpush']]]],[4,'acc',[['acc',['lat']],['acc',['rear']]]],[3,'arm',[['arm',['bi']],['arm',['tri']]]],[5,'arm2',[['arm',['bi']]]]]},
  gLA:{n:'Lower A',f:'Squat and quad focus',k:'lower',b:[[1,'main',[['main',['squat']]]],[2,'sec',[['sec',['lunge']],['acc',['ham','hinge']]]],[3,'acc',[['acc',['quad','squat']],['acc',['calf']]]],[4,'pre',[['pre',['abd']],['pre',['tib','calf']]]]]},
  gLB:{n:'Lower B',f:'Hinge and glute focus',k:'lower',b:[[1,'main',[['main',['hinge']]]],[2,'sec',[['sec',['glute']],['sec',['lunge']]]],[3,'acc',[['acc',['ham','hinge']],['acc',['calf']]]],[4,'pre',[['acc',['hinge','glute']],['pre',['add','abd']]]]]},
  gFA:{n:'Full body A',f:'Squat, push and pull',k:'full',b:[[1,'main',[['main',['squat']]]],[2,'sec',[['sec',['hpush']],['sec',['hpull']]]],[3,'acc',[['acc',['glute','hinge']],['acc',['lat']]]],[4,'arm',[['arm',['bi']],['arm',['tri']]]],[5,'pre',[['pre',['rear','cuff']]]]]},
  gFB:{n:'Full body B',f:'Hinge, press and pull',k:'full',b:[[1,'main',[['main',['hinge']]]],[2,'sec',[['sec',['vpush','hpush']],['sec',['vpull']]]],[3,'acc',[['acc',['lunge']],['acc',['rear']]]],[4,'arm',[['arm',['tri']],['arm',['bi']]]],[5,'pre',[['pre',['calf']]]]]},
  gFC:{n:'Full body C',f:'Single leg, push and pull',k:'full',b:[[1,'main',[['main',['lunge','glute']]]],[2,'sec',[['sec',['hpush']],['sec',['hpull']]]],[3,'acc',[['acc',['ham','hinge','glute']],['acc',['lat']]]],[4,'arm',[['arm',['bi']],['arm',['tri']]]],[5,'pre',[['pre',['abd','add']]]]]},
  gPu:{n:'Push',f:'Chest, shoulders and triceps',k:'upper',b:[[1,'main',[['main',['hpush']]]],[2,'sec',[['sec',['vpush']],['acc',['lat']]]],[3,'acc',[['acc',['fly','hpush']],['arm',['tri']]]],[4,'arm',[['arm',['tri']]]],[5,'pre',[['pre',['cuff']]]]]},
  gPl:{n:'Pull',f:'Back, rear delts and biceps',k:'upper',b:[[1,'main',[['main',['vpull']]]],[2,'sec',[['sec',['hpull']],['acc',['rear']]]],[3,'acc',[['arm',['bi']],['acc',['shrug','rear']]]],[4,'arm',[['arm',['bi']]]],[5,'pre',[['pre',['cuff']]]]]},
  gPuL:{n:'Push',f:'Chest, shoulders, triceps, deadlift, hamstrings and calves',k:'full',b:[[1,'main',[['main',['hpush']]]],[1,'main',[['main',['hinge']]]],[2,'sec',[['sec',['vpush','hpush']],['acc',['ham']]]],[3,'acc',[['acc',['fly','lat']],['acc',['calf']]]],[3,'arm',[['arm',['tri']]]],[5,'pre',[['pre',['cuff']]]]]},
  gPlL:{n:'Pull',f:'Back, rear delts, biceps, squat and quads',k:'full',b:[[1,'main',[['main',['vpull']]]],[1,'main',[['main',['squat']]]],[2,'sec',[['sec',['hpull']],['acc',['quad','lunge']]]],[3,'acc',[['acc',['rear']],['acc',['quad','squat']]]],[3,'arm',[['arm',['bi']]]],[5,'pre',[['pre',['tib','abd']]]]]},
  gLg:{n:'Legs',f:'Squat, hinge and single leg',k:'lower',b:[[1,'main',[['main',['squat']]]],[2,'sec',[['sec',['hinge']],['sec',['lunge']]]],[3,'acc',[['acc',['quad']],['acc',['ham','hinge']]]],[4,'pre',[['acc',['calf']],['pre',['abd','add']]]]]}
};
const SPLITS={2:['gFA','gFB'],3:['gFA','gFB','gFC'],4:['gUA','gLA','gUB','gLB'],5:['gUA','gLA','gUB','gLB','gUC'],6:['gPu','gPl','gLg','gPu','gPl','gLg']};
const MOBPOOL={
  shoulder:['wallSlide','crossBody','openBook','thread','sleeper'],overhead:['openBook','wallSlide','thread'],arm:['wristEcc','wristStretch'],
  lowback:['catCamel','mckenzie','bridgePPT','childPose'],hip:['hip9090','hipFlexPPT','adductRock','couch','worldGreatest'],ham:['worldGreatest','adductRock'],
  knee:['tkeMob','slBalance'],ankle:['kneeWall','slantCalf'],
  upper:['catCamel','openBook','wallSlide','thread','crossBody'],lower:['hipFlexPPT','hip9090','adductRock','kneeWall','worldGreatest','catCamel']
};
const MOBDOSE={catCamel:45,openBook:6,crossBody:30,wallSlide:10,wristEcc:15,wristStretch:30,thread:6,sleeper:30,mckenzie:10,hipFlexPPT:40,hip9090:6,adductRock:8,kneeWall:10,tkeMob:15,bridgePPT:12,slBalance:30,worldGreatest:5,childPose:60,couch:40,slantCalf:40};
const CARDIO_PREF={walk:['Incline treadmill walk','Brisk walk outside'],bike:['Bike','Bike'],row:['Rowing machine','Brisk walk outside'],ell:['Elliptical','Brisk walk outside'],run:['Easy run','Easy run'],swim:['Swim','Swim']};
const ATTR3=(v,a,b)=>v==null||v===''||isNaN(v)?2:(+v<a?1:+v<b?2:3);
function assess(a){
  const st=Math.round((ATTR3(a.pushups,10,25)+ATTR3(a.squats,20,35))/2*10)/10,core=ATTR3(a.plank,30,60);
  const mob=Math.round(((+a.toe||2)+(+a.overhead||2)+(+a.deepsq||2))/3*10)/10;
  const bl=+a.balL||0,br=+a.balR||0,bmin=Math.min(bl||br,br||bl),bal=ATTR3(bmin,15,30),asym=bl&&br?Math.abs(bl-br)/Math.max(bl,br)>=.3:false;
  let lvl=+a.exp||1;if(st<1.6&&lvl>1)lvl--;
  const focus=new Set(a.inj||[]);if(+a.toe===1)focus.add('ham');if(+a.overhead&&+a.overhead<3)focus.add('overhead');if(+a.deepsq&&+a.deepsq<3){focus.add('ankle');focus.add('hip')}if(bal===1||asym)focus.add('balance');
  return{st,core,mob,bal,asym,lvl,focus:[...focus]};
}
function eqList(e){return e==='gym'?['gym','bb','db','kb','band','bw']:e==='home'?['db','band','bw']:['band','bw']}
function buildPlan(a){
  const sc=assess(a),inj=new Set(a.inj||[]),eqs=eqList(a.equip),L=sc.lvl,strength=a.goal==='strength'&&L>=2;
  const week={},rot={},tpls={},mob={},wu={};
  const eqRank=(id,role)=>{const e=META[id].eq;if(role==='main'&&L>=2&&['squat','hinge'].includes(META[id].pat))return['bb','gym','db','kb','band','bw'].indexOf(e);if(role==='main'){const o=strength?['bb','db','gym','kb','band','bw']:L>=2?['db','gym','bb','kb','band','bw']:['db','gym','kb','band','bw','bb'];return o.indexOf(e)}return['gym','db','band','bw','kb','bb'].indexOf(e)};
  const cands=(pats,role,lvlCap,needMain)=>Object.keys(META).filter(id=>{const m=META[id];if(!E[id]||!pats.includes(m.pat)||!eqs.includes(m.eq))return false;if(m.av.some(j=>inj.has(j)))return false;if(m.lvl>lvlCap)return false;if(needMain&&!m.main)return false;if(['coreAE','coreAR','coreLat','coreFlex','cardio','power'].includes(m.pat))return false;return true});
  const pick=(pats,role,used,prefer)=>{
    let list=cands(pats,role,L,role==='main');if(!list.length)list=cands(pats,role,3,role==='main');if(!list.length)list=cands(pats,role,3,false);
    list=list.filter(id=>!used.has(id));if(!list.length)return null;
    const nv=id=>YT[id]?0:1.2;list.sort((x,y)=>((week[x]||0)*10+eqRank(x,role)+pats.indexOf(META[x].pat)*.5+nv(x)+(prefer&&prefer.has(x)?3:0))-((week[y]||0)*10+eqRank(y,role)+pats.indexOf(META[y].pat)*.5+nv(y)+(prefer&&prefer.has(y)?3:0)));
    const id=list[0];week[id]=(week[id]||0)+1;used.add(id);if(role!=='main'&&list[1])rot[id]=list[1];return id};
  const corePick=(pats,used)=>{let l=Object.keys(META).filter(id=>pats.includes(META[id].pat)&&eqs.includes(META[id].eq)&&!META[id].av.some(j=>inj.has(j))&&META[id].lvl<=Math.max(L,1)&&!used.has(id)&&E[id]);
    l.sort((x,y)=>(week[x]||0)-(week[y]||0));const id=l[0];if(!id)return null;week[id]=(week[id]||0)+1;used.add(id);return[id,E[id].t?'coreT':'coreR']};
  const keep=a.len==45?2:a.len==60?3:9;
  const mods={muscle:'',strength:'',fat:'',health:''};
  const days=(a.days||[]).slice().sort((x,y)=>x-y),split=a.split||SPLITS[Math.min(6,Math.max(2,days.length))]||SPLITS[4];
  const firstPicks={};
  const mobList=kind=>{const f=sc.focus,out=[];const add=arr=>arr.forEach(x=>{if(!out.includes(x)&&E[x]&&!(x==='mckenzie'&&!inj.has('lb')))out.push(x)});
    const up=()=>{if(f.includes('sh'))add(MOBPOOL.shoulder.slice(0,2));if(f.includes('overhead'))add(MOBPOOL.overhead.slice(0,2));if(f.includes('el')||f.includes('wr'))add(MOBPOOL.arm.slice(0,1))};
    const lo=()=>{if(f.includes('lb'))add(MOBPOOL.lowback.slice(0,2));if(f.includes('hp')||f.includes('hip'))add(MOBPOOL.hip.slice(0,2));if(f.includes('ham'))add(MOBPOOL.ham.slice(0,1));if(f.includes('kn'))add(['tkeMob']);if(f.includes('an')||f.includes('ankle'))add(['kneeWall'])};
    if(kind==='upper'){up();if(f.includes('lb'))add(['catCamel']);add(MOBPOOL.upper)}else if(kind==='lower'){lo();add(MOBPOOL.lower)}else{lo();up();add(['catCamel','hip9090','openBook','hipFlexPPT','wallSlide'])}
    return out.slice(0,a.len==45?4:5).map(x=>[x,MOBDOSE[x]||(E[x].t?30:8)])};
  const wuList=kind=>{const bike=a.equip==='gym'?['bikeWU',180]:['marchWU',90];let l;
    if(kind==='upper')l=[bike,['bandPA',15],['bandER',12],['scapPU',10],['rampUp',2]];
    else if(kind==='lower')l=[bike,['bridgePPT',12],['bandWalk',30],sc.focus.includes('kn')?['tkeMob',15]:['tempoSquat',8],sc.focus.includes('balance')||sc.focus.includes('kn')?['slBalance',30]:null,['rampUp',2]].filter(Boolean);
    else l=[bike,['bridgePPT',12],['scapPU',10],['tempoSquat',8],['rampUp',2]];
    return a.len==45?[l[0],l[1],l[l.length-1]]:l};
  const cm=(CARDIO_PREF[a.cardio]||CARDIO_PREF.walk)[a.equip==='gym'?0:1];
  split.forEach((sk,i)=>{
    const spec=SPEC[sk],key=split.indexOf(sk)===i?sk:sk+'2',used=new Set(),prefer=firstPicks[sk];
    const blocks=[];spec.b.filter(b=>b[0]<=keep).forEach(([p,tag,items])=>{const its=[];items.forEach(([role,pats])=>{const id=pick(pats,role,used,prefer);if(id)its.push([id,role])});if(its.length)blocks.push(Object.assign({i:its},tag==='acc'?{opt:1}:{},tag==='arm'||tag==='arm2'?{arms:1}:{}))});
    if(!firstPicks[sk])firstPicks[sk]=new Set(blocks.flatMap(b=>b.i.map(x=>x[0])));
    const cu=new Set(),core=[];const cps=spec.k==='upper'?[['coreAE','coreFlex'],['coreLat','coreAR']]:spec.k==='lower'?[['coreAR','coreLat'],['coreAE','coreFlex']]:[['coreAE'],['coreAR','coreLat']];
    cps.forEach(ps=>{const c=corePick(ps,cu);if(c)core.push(c)});if(a.len==45)core.length=Math.min(core.length,2);
    const z=(a.goal==='fat'||a.goal==='health')&&i===1?'int':'z2';
    tpls[key]={n:spec.n+(key.endsWith('2')?' (B)':''),f:spec.f,k:spec.k,mob:'p_'+spec.k,wu:'p_'+spec.k,blocks,core,cardio:{m:z==='int'?'Intervals: '+cm.toLowerCase():cm,z}};
    mob['p_'+spec.k]=mobList(spec.k);wu['p_'+spec.k]=wuList(spec.k);
  });
  // weekly map
  const map={0:'rest',1:'rest',2:'rest',3:'rest',4:'rest',5:'rest',6:'rest'};const keys=[];split.forEach((sk,i)=>keys.push(split.indexOf(sk)===i?sk:sk+'2'));
  days.forEach((d,i)=>{map[d]=keys[i%keys.length]});if(a.longDay!=null&&+a.longDay>=0&&map[+a.longDay]==='rest')map[+a.longDay]='long';
  const target=a.len==45?45:a.len==60?60:84;
  return{tpls,mob,wu,rot,map,sc,keys,target:a.goal==='fat'?target+5:target,cardioRange:a.len==45?[5,10]:a.len==60?[8,14]:[10,20]};
}
function applyProfile(){
  if(!S.prof||!S.prof.plan)return;const P=S.prof.plan;
  Object.assign(T,P.tpls);Object.assign(MOB,P.mob);Object.assign(WU,P.wu);Object.keys(P.rot||{}).forEach(k=>{ROT[k]=P.rot[k]});
  TPL_KEYS.length=0;[...new Set(Object.keys(P.tpls))].forEach(k=>TPL_KEYS.push(k));TPL_KEYS.push('long','rest');
}
/* personalised cue text: other users don't share your left-side and injury history */
function cueOf(e){let t=e.c||'';if(!S.prof)return t;const sd=(S.prof.ans||{}).side||'none';
  if(sd==='none')t=t.replace(/\b(Left|Right) (leg|side|arm|hand) first[.,]?\s*/g,'').replace(/\s*Do an extra set on the left\./,'').replace(/;?\s*your left may differ after the ACL surgery\.?/,'.');
  else if(sd==='right')t=t.replace(/\bLeft\b/g,'Right').replace(/\bleft\b/g,'right');
  return t}
function protOf(e){if(!e.p)return'';if(!S.prof)return e.p;const m=e.p.replace(/Left knee \(ACL\)|Left knee|left knee/g,'Knees').replace(/Right shoulder \(posterior\)|Right shoulder/g,'Shoulders').replace(/ \(L4-L5\)/g,'').replace(/Tennis elbow|Elbow\b/g,'Elbows').replace(/left leg|Left leg/g,'Legs');return[...new Set(m.split(/,\s*/))].join(', ')}
function sideNote(e,always){if(!e.u)return'';const sd=S.prof?(S.prof.ans||{}).side||'none':'left';if(sd==='none')return'';return` <b>${sd==='right'?'Right':'Left'} side first${always?', always':''}.</b>`}

