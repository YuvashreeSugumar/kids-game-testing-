// Pink Pals Suite — multi‑game PWA (Memory, Coloring, Dress‑Up, Math) with Parent Mode & Themes.
let soundOn = true;
let parentSettings = { hideHard:false, minutesLimit:0 };
let sessionStart = Date.now();

// Tab logic
const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.panel');
tabs.forEach(t=>t.addEventListener('click',()=>{
  tabs.forEach(tb=>tb.classList.remove('active'));
  panels.forEach(p=>p.classList.remove('active'));
  t.classList.add('active');
  document.getElementById('panel-'+t.dataset.tab).classList.add('active');
}));

// Theme
const themeBtn = document.getElementById('themeBtn');
const themeModal = document.getElementById('themeModal');
const closeTheme = document.getElementById('closeTheme');
document.querySelectorAll('.theme').forEach(el=>el.addEventListener('click',()=>{
  document.documentElement.setAttribute('data-theme', el.dataset.theme);
  localStorage.setItem('pps-theme', el.dataset.theme);
}));
themeBtn.addEventListener('click',()=> themeModal.hidden=false);
closeTheme.addEventListener('click',()=> themeModal.hidden=true);
const savedTheme = localStorage.getItem('pps-theme');
if(savedTheme) document.documentElement.setAttribute('data-theme', savedTheme);

// Parent mode
const parentBtn = document.getElementById('parentBtn');
const parentModal = document.getElementById('parentModal');
const gateQ = document.getElementById('gateQ');
const gateA = document.getElementById('gateA');
const limitSound = document.getElementById('limitSound');
const limitHard = document.getElementById('limitHard');
const limitMinutes = document.getElementById('limitMinutes');
const saveParent = document.getElementById('saveParent');
const closeParent = document.getElementById('closeParent');
let correctGate = 0;
function newGate(){
  const a = Math.floor(6+Math.random()*7), b = Math.floor(6+Math.random()*7);
  correctGate = a*b; gateQ.textContent = `${a} × ${b} = ?`; gateA.value='';
}
parentBtn.addEventListener('click',()=>{ newGate(); parentModal.hidden=false; });
closeParent.addEventListener('click',()=> parentModal.hidden=true);
saveParent.addEventListener('click',()=>{
  if(Number(gateA.value)!==correctGate){ alert('Wrong answer.'); return; }
  soundOn = !limitSound.checked;
  parentSettings.hideHard = limitHard.checked;
  parentSettings.minutesLimit = Math.max(0, Number(limitMinutes.value)||0);
  localStorage.setItem('pps-parent', JSON.stringify(parentSettings));
  parentModal.hidden = true;
  applyParentSettings();
});
function applyParentSettings(){
  // Hide hard options
  document.querySelectorAll('option[value="hard"]').forEach(o=> o.parentElement && (o.parentElement.disabled = parentSettings.hideHard));
  document.querySelectorAll('option[value="hard"]').forEach(o=> o.disabled = parentSettings.hideHard);
}
try{
  parentSettings = JSON.parse(localStorage.getItem('pps-parent')||'{}');
  parentSettings.hideHard = !!parentSettings.hideHard;
  parentSettings.minutesLimit = Number(parentSettings.minutesLimit||0);
  applyParentSettings();
}catch{}

// Session limit check
setInterval(()=>{
  if(parentSettings.minutesLimit>0){
    const mins = (Date.now()-sessionStart)/60000;
    if(mins>=parentSettings.minutesLimit){ alert('Time is up for today! Take a healthy break. 💗'); window.location.hash = '#break'; }
  }
}, 10000);

// Simple tones
function tone(freq=600, dur=80){
  if(!soundOn) return;
  try{
    const ctx = new (window.AudioContext||window.webkitAudioContext)();
    const osc = ctx.createOscillator(); const g = ctx.createGain();
    osc.type='triangle'; osc.frequency.value=freq; osc.connect(g); g.connect(ctx.destination);
    g.gain.setValueAtTime(0.05, ctx.currentTime); osc.start();
    setTimeout(()=>{ osc.stop(); ctx.close(); }, dur);
  }catch{}
}

// -------------------- Memory Game --------------------
const gridEl = document.getElementById('grid');
const movesEl = document.getElementById('moves');
const timeEl = document.getElementById('time');
const bestEl = document.getElementById('best');
const newGameBtn = document.getElementById('newGameBtn');
const difficultySel = document.getElementById('difficulty');
const soundBtn = document.getElementById('soundBtn');

let first, second, lock=false, moves=0, matched=0;
let startTime=null, timerId=null;
const allCards = ['crown','heart','star','butterfly','unicorn','lipstick','purse','mirror','shoe','rainbow','flower','dress'];

function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]];} return a; }
function pad(n){ return String(n).padStart(2,'0'); }
function startTimer(){ startTime=Date.now(); timerId=setInterval(()=>{ const s=Math.floor((Date.now()-startTime)/1000); timeEl.textContent = pad(Math.floor(s/60))+':'+pad(s%60); }, 500); }
function stopTimer(){ clearInterval(timerId); timerId=null; }
function pairsByDiff(d){ if(d==='easy') return 6; if(d==='hard') return 10; return 8; }
function buildDeck(){ const p=pairsByDiff(difficultySel.value); const chosen=shuffle([...allCards]).slice(0,p); return shuffle([...chosen,...chosen]); }
function renderGrid(){
  gridEl.innerHTML=''; const deck=buildDeck();
  deck.forEach(name=>{
    const card=document.createElement('button'); card.className='card'; card.setAttribute('aria-label','Memory card');
    card.innerHTML = `<div class="inner"><div class="back"><span>🩷</span></div><div class="face"><img alt="${name}" src="assets/cards/${name}.svg"/></div></div>`;
    card.addEventListener('click', ()=> flip(card,name)); gridEl.appendChild(card);
  });
}
function reset(){ first=null;second=null;lock=false;moves=0;matched=0;movesEl.textContent='0';timeEl.textContent='00:00'; stopTimer(); renderGrid(); }
function flip(card,name){
  if(lock||card.classList.contains('flipped')||card.classList.contains('matched')) return;
  if(!timerId) startTimer(); card.classList.add('flipped'); tone(700,70);
  if(!first){ first={card,name}; return; }
  if(!second){ second={card,name}; moves++; movesEl.textContent=moves; checkMatch(); }
}
function checkMatch(){
  if(first.name===second.name){
    tone(900,100); lock=true; setTimeout(()=>{
      first.card.classList.add('matched'); second.card.classList.add('matched');
      first=second=null; lock=false; matched+=2;
      if(matched===document.querySelectorAll('.card').length){ win(); }
    },400);
  }else{
    tone(300,100); lock=true; setTimeout(()=>{ first.card.classList.remove('flipped'); second.card.classList.remove('flipped'); first=second=null; lock=false; },700);
  }
}
function win(){
  stopTimer(); const total=timeEl.textContent; const pairs=pairsByDiff(difficultySel.value);
  alert(`You matched ${pairs} pairs in ${moves} moves and ${total}. Great job! 🎉`);
  const key='best-'+difficultySel.value; const score=JSON.stringify({moves,time:total});
  const prev=localStorage.getItem(key); if(!prev || JSON.parse(prev).moves>moves){ localStorage.setItem(key,score); }
  const best=JSON.parse(localStorage.getItem(key)||score); bestEl.textContent = best ? (best.moves+' moves, '+best.time) : '—';
}
function newGame(){ reset(); const key='best-'+difficultySel.value; const best=localStorage.getItem(key); bestEl.textContent = best ? (JSON.parse(best).moves+' moves, '+JSON.parse(best).time) : '—'; }
newGameBtn.addEventListener('click', newGame);
difficultySel.addEventListener('change', newGame);
soundBtn.addEventListener('click', ()=>{ soundOn=!soundOn; soundBtn.textContent = soundOn ? '🔈' : '🔇'; });
newGame();

// -------------------- Coloring --------------------
const pageSel = document.getElementById('pageSel');
const brushSize = document.getElementById('brushSize');
const clearColoring = document.getElementById('clearColoring');
const saveColoring = document.getElementById('saveColoring');
const colorCanvas = document.getElementById('colorCanvas');
const ctx = colorCanvas.getContext('2d', { willReadFrequently:true });
let drawing=false, last=null, outlineImg=new Image();
function loadPage(){
  outlineImg.onload = ()=>{ ctx.clearRect(0,0,colorCanvas.width,colorCanvas.height); ctx.drawImage(outlineImg,0,0,colorCanvas.width,colorCanvas.height); };
  outlineImg.src = 'assets/coloring/'+pageSel.value+'.svg';
}
colorCanvas.addEventListener('pointerdown', (e)=>{ drawing=true; last=pos(e); draw(e);});
colorCanvas.addEventListener('pointermove', (e)=>{ if(drawing) draw(e);});
window.addEventListener('pointerup', ()=> drawing=false);
function pos(e){ const r=colorCanvas.getBoundingClientRect(); return {x:(e.clientX-r.left)*colorCanvas.width/r.width, y:(e.clientY-r.top)*colorCanvas.height/r.height}; }
function draw(e){ const p=pos(e); ctx.lineCap='round'; ctx.lineJoin='round'; ctx.lineWidth = Number(brushSize.value); ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--pink').trim() || '#ff69b4';
  ctx.beginPath(); if(last){ ctx.moveTo(last.x,last.y); ctx.lineTo(p.x,p.y); ctx.stroke(); } last=p; }
clearColoring.addEventListener('click', loadPage);
saveColoring.addEventListener('click', ()=>{ const url=colorCanvas.toDataURL('image/png'); const a=document.createElement('a'); a.href=url; a.download='coloring.png'; a.click(); });
pageSel.addEventListener('change', loadPage);
loadPage();

// -------------------- Dress-up --------------------
const dressLayer = document.getElementById('dressLayer');
function addPiece(name){
  const img=new Image(); img.src='assets/dressup/'+name+'.png'; img.draggable=false; img.addEventListener('pointerdown',startDrag);
  dressLayer.appendChild(img);
}
function startDrag(e){
  const el=e.currentTarget; el.setPointerCapture(e.pointerId);
  const startX=e.clientX, startY=e.clientY; const rect=el.getBoundingClientRect();
  const offX=startX-rect.left, offY=startY-rect.top;
  function move(ev){ el.style.left=(ev.clientX - offX - dressLayer.getBoundingClientRect().left)+'px'; el.style.top=(ev.clientY - offY - dressLayer.getBoundingClientRect().top)+'px'; }
  function up(){ el.releasePointerCapture(e.pointerId); window.removeEventListener('pointermove',move); window.removeEventListener('pointerup',up); }
  window.addEventListener('pointermove',move); window.addEventListener('pointerup',up);
}
document.querySelectorAll('#panel-dressup .btn[data-piece]').forEach(b=> b.addEventListener('click',()=> addPiece(b.dataset.piece)));
document.getElementById('clearDress').addEventListener('click', ()=> dressLayer.innerHTML='');
document.getElementById('saveDress').addEventListener('click', ()=>{
  // quick export via html2canvas-like approach using SVG + pieces into a canvas
  const can=document.createElement('canvas'); can.width=300; can.height=400; const c=can.getContext('2d');
  // draw base (approx by recreating gradient-ish bg)
  const grd=c.createLinearGradient(0,0,0,400); grd.addColorStop(0,'#fff'); grd.addColorStop(1,'#ffe4ef'); c.fillStyle=grd; c.fillRect(0,0,300,400);
  // head & body
  c.fillStyle='#ffd8b1'; c.beginPath(); c.arc(150,100,40,0,Math.PI*2); c.fill();
  c.fillStyle='#ffc0a0'; c.fillRect(115,140,70,120);
  // draw pieces
  const nodes=[...dressLayer.querySelectorAll('img')]; let i=0;
  function drawNext(){
    if(i>=nodes.length){ const url=can.toDataURL('image/png'); const a=document.createElement('a'); a.href=url; a.download='dressup.png'; a.click(); return; }
    const n=nodes[i++]; const im=new Image(); im.onload=()=>{ const x=parseInt(n.style.left||'0')-60+0, y=parseInt(n.style.top||'0')-40+0; c.drawImage(im, x+60, y+40, 200,200); drawNext(); }; im.src=n.src;
  }
  drawNext();
});

// -------------------- Math --------------------
const mathDiff = document.getElementById('mathDiff');
const nextQ = document.getElementById('nextQ');
const mathScore = document.getElementById('mathScore');
const mathStreak = document.getElementById('mathStreak');
const qEl = document.getElementById('question');
const feedback = document.getElementById('mathFeedback');
const ansBtns = [...document.querySelectorAll('.ans')];
let score=0, streak=0, correct=0;
function rangeByDiff(d){ if(d==='easy') return 10; if(d==='hard') return 50; return 20; }
function newQ(){
  const max=rangeByDiff(mathDiff.value);
  const a=1+Math.floor(Math.random()*max), b=1+Math.floor(Math.random()*max);
  const ops=['+','-','×']; const op=ops[Math.floor(Math.random()*ops.length)];
  let ans=0; if(op==='+') ans=a+b; else if(op==='-') ans=a-b; else ans=a*b;
  qEl.textContent=`${a} ${op} ${b} = ?`; correct=ans;
  const opts=new Set([ans]); while(opts.size<4){ opts.add(ans + (Math.floor(Math.random()*11)-5) || ans+Math.floor(Math.random()*5)+1); }
  const shuffled=[...opts].sort(()=>Math.random()-0.5);
  ansBtns.forEach((b,i)=>{ b.textContent=shuffled[i]; b.onclick=()=>{ if(Number(b.textContent)===correct){ score++; streak++; feedback.textContent='Great! ✅'; tone(900,120); } else { streak=0; feedback.textContent='Keep trying! ✨'; tone(300,120); } mathScore.textContent=score; mathStreak.textContent=streak; newQ(); }; });
}
nextQ.addEventListener('click', newQ);
mathDiff.addEventListener('change', newQ);
newQ();

// -------------------- PWA install & SW --------------------
const installBtn = document.getElementById('installBtn');
let deferredPrompt=null;
window.addEventListener('beforeinstallprompt', (e)=>{ e.preventDefault(); deferredPrompt=e; installBtn.style.display='inline-block'; });
installBtn.addEventListener('click', async ()=>{ if(!deferredPrompt) return; deferredPrompt.prompt(); await deferredPrompt.userChoice; deferredPrompt=null; installBtn.style.display='none'; });

if('serviceWorker' in navigator){ window.addEventListener('load', ()=> navigator.serviceWorker.register('sw.js')); }
