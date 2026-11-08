const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export function renderPreview(plan) {
  const data = JSON.stringify(plan).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  return `<!doctype html>
<html lang="${plan.language === 'ta' ? 'ta' : 'en'}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escapeHtml(plan.title)} · Education Studio</title>
<style>
:root{color-scheme:light;--ink:#152d3b;--teal:#087f78;--orange:#9c4b00;--muted:#566c75;--line:#d4e1e1}
*{box-sizing:border-box}body{margin:0;background:#eef3f1;color:var(--ink);font:17px/1.6 'Segoe UI','Nirmala UI',sans-serif}
main{max-width:1120px;margin:auto;padding:30px 24px 48px}header{display:flex;justify-content:space-between;align-items:center;gap:20px;margin-bottom:28px}
.brand{font-size:13px;font-weight:800;letter-spacing:.16em;text-transform:uppercase}.draft{font-size:12px;border:1px solid #8caaa7;border-radius:20px;padding:5px 12px}
.eyebrow{font-size:13px;color:var(--teal);font-weight:700;text-transform:uppercase;letter-spacing:.1em;margin:0}
h1{font-size:clamp(25px,4vw,39px);line-height:1.25;margin:9px 0 20px;overflow-wrap:anywhere}
.workspace{display:grid;grid-template-columns:minmax(0,1fr) 280px;gap:20px}.board,.guide{background:#fff;border:1px solid var(--line);border-radius:20px}
.board{padding:26px 20px 10px}.equation{text-align:center;font:600 clamp(19px,3vw,33px)/1.5 'Segoe UI','Nirmala UI',sans-serif;min-height:58px;margin:0;overflow-wrap:anywhere}
svg{width:100%;height:auto;display:block}svg text{font-family:'Segoe UI','Nirmala UI',sans-serif}svg .box{fill:#e4f5f2;stroke:var(--teal);stroke-width:2}svg .unit{fill:#ffc982;stroke:var(--orange);stroke-width:1.5}
.guide{padding:23px}.guide h2{font-size:20px;line-height:1.5;margin:12px 0}.guide p{font-size:16px}.guide .number{color:var(--teal);font-size:12px;letter-spacing:.1em;font-weight:800}
.legend{display:flex;flex-wrap:wrap;gap:18px;color:var(--muted);font-size:13px;justify-content:center}.legend span{display:flex;align-items:center;gap:7px}.key{width:14px;height:14px;display:inline-block;background:#e4f5f2;border:2px solid var(--teal);border-radius:3px}.key.unit{background:#ffc982;border-color:var(--orange);border-radius:50%}
.controls{display:flex;align-items:center;gap:10px;margin-top:18px;flex-wrap:wrap}button{font:600 14px 'Segoe UI',sans-serif;min-height:44px;border:1px solid #abc1bf;border-radius:10px;padding:10px 17px;background:white;color:var(--ink);cursor:pointer}button:disabled{opacity:.4;cursor:default}button:focus-visible{outline:3px solid var(--orange);outline-offset:3px}#play{background:var(--teal);color:white;border-color:var(--teal)}.time{font-size:13px;color:var(--muted);margin-left:auto}
.steps{display:grid;gap:8px;margin-top:22px;grid-template-columns:repeat(auto-fit,minmax(140px,1fr))}.steps button{text-align:left;font-size:13px}.steps button[aria-current=step]{background:#e4f5f2;border:2px solid var(--teal)}
.note{color:var(--muted);font-size:13px;margin:20px 0 0}.review{margin-top:24px;border-top:1px solid var(--line);padding-top:16px;font-size:14px}.review summary{cursor:pointer;font-weight:600}.review li{margin:12px 0}
@media(max-width:780px){main{padding:20px 14px}.workspace{grid-template-columns:1fr}.guide{padding:18px}.guide h2{margin-top:6px}.board{padding:18px 6px 4px}.time{width:100%;margin:0}.draft{max-width:160px;text-align:center}header{margin-bottom:20px}}
</style></head>
<body><main>
<header><div class="brand">Education Studio</div><span class="draft">DRAFT · REVIEW REQUIRED</span></header>
<p class="eyebrow">Algebra / A balance you can see</p><h1>${escapeHtml(plan.title)}</h1>
<section class="workspace" aria-label="Lesson preview">
<div class="board"><p id="equation" class="equation"></p><svg id="visual" viewBox="0 0 1000 500" role="img" aria-label="Equation balance illustration"></svg>
<div class="legend"><span><i class="key"></i>Unknown box / x</span><span><i class="key unit"></i>One unit</span><span>× Crossed out = removed</span></div></div>
<aside class="guide" aria-live="polite"><span id="stepNumber" class="number"></span><h2 id="stepTitle"></h2><p id="narration"></p></aside>
</section>
<div class="controls"><button id="previous" type="button">← Previous</button><button id="play" type="button">Play steps</button><button id="next" type="button">Next →</button><span id="time" class="time"></span></div>
<nav id="steps" class="steps" aria-label="Teaching steps"></nav>
<p class="note">Silent visual preview · Timing is authored, not synchronized to recorded speech. Use ← / → to step through. No API calls.</p>
<details class="review"><summary>Review lesson and narration</summary><p>Mathematical substitution passed. Teaching quality and language still need review.</p><ol id="script"></ol></details>
</main>
<script id="lesson-data" type="application/json">${data}</script>
<script>
const plan = JSON.parse(document.getElementById('lesson-data').textContent);
const $ = id => document.getElementById(id);
const svg = $('visual');
const ns = 'http://www.w3.org/2000/svg';
let index = 0, timer = null, playing = false;
const el = (tag, attrs, content) => {
  const node = document.createElementNS(ns, tag);
  for (const [key, value] of Object.entries(attrs)) node.setAttribute(key, value);
  if (content !== undefined) node.textContent = content;
  svg.append(node); return node;
};
const text = (x, y, label, size = 22, color = '#152d3b') => el('text', { x, y, 'text-anchor': 'middle', fill: color, 'font-size': size }, label);
function unit(x, y, removed = false, radius = 13) {
  el('circle', { cx: x, cy: y, r: radius, class: 'unit', opacity: removed ? .3 : 1 });
  if (removed) {
    el('line', { x1:x-10, y1:y-10, x2:x+10, y2:y+10, stroke:'#9c4b00', 'stroke-width':3 });
    el('line', { x1:x-10, y1:y+10, x2:x+10, y2:y-10, stroke:'#9c4b00', 'stroke-width':3 });
  }
}
function box(x, y, label) {
  el('rect', { x:x-32, y:y-27, width:64, height:54, rx:10, class:'box' });
  text(x,y+8,label,25,'#087f78');
}
function draw(step) {
  svg.replaceChildren();
  const v = step.visual;
  const checked = v.type === 'substitution';
  const a = checked ? v.coefficient : v.boxes;
  const b = checked ? v.constant : v.constants;
  const c = checked ? v.result : v.units;
  const removing = v.removing || 0;
  const grouped = !checked && v.groups > 1;
  el('rect',{x:35,y:35,width:430,height:407,rx:18,fill:'#f4faf8',stroke:'#b7d2ce'});
  el('rect',{x:535,y:35,width:430,height:407,rx:18,fill:'#fffaf3',stroke:'#dfc5a3'});
  text(250,74,checked ? 'Replace x with ' + v.answer : 'LEFT SIDE',20,'#087f78');
  text(750,74,checked ? 'Original total' : 'RIGHT SIDE',20,'#9c4b00');
  text(500,255,'=',40);
  if (grouped) {
    const perGroup = c / a;
    for (let g=0; g<a; g++) {
      const col=g%3, row=Math.floor(g/3);
      const lx=55+col*136, rx=555+col*136, y=100+row*157;
      for (const x of [lx,rx]) el('rect',{x,y,width:118,height:144,rx:10,fill:'none',stroke:g===0?'#087f78':'#9daead','stroke-width':g===0?3:1,'stroke-dasharray':g===0?'none':'5 4'});
      text(lx+59,y+24,'Group '+(g+1),16); text(rx+59,y+24,'Group '+(g+1),16);
      box(lx+59,y+78,'x');
      for(let i=0;i<perGroup;i++) unit(rx+24+(i%3)*34,y+49+Math.floor(i/3)*25,false,10);
    }
    text(250,470,'One box in each group',20,'#087f78');
    text(750,470,perGroup+' units in each group',20,'#9c4b00');
  } else {
    for(let i=0;i<a;i++) box(150+(i%3)*100,135+Math.floor(i/3)*85,checked ? String(v.answer) : 'x');
    for(let i=0;i<b;i++) unit(150+(i%6)*40,315+Math.floor(i/6)*40,i>=b-removing);
    for(let i=0;i<c;i++) unit(645+(i%6)*42,125+Math.floor(i/6)*48,i>=c-removing);
    text(250,470,removing ? 'Remove '+removing+' units' : a+' '+(checked?'known':'unknown')+' '+(a===1?'box':'boxes')+(b?' + '+b+' units':''),19,'#087f78');
    text(750,470,removing ? 'Remove the SAME '+removing+' units' : c+' units',19,'#9c4b00');
  }
  const title=document.createElementNS(ns,'title'); title.textContent=step.title+'. '+step.narration; svg.prepend(title);
}
function stop() { clearTimeout(timer); timer=null; playing=false; $('play').textContent='Play steps'; }
function schedule() {
  clearTimeout(timer);
  timer=setTimeout(()=>{
    if(index === plan.steps.length-1) { stop(); return; }
    index++; render(); schedule();
  },plan.steps[index].durationSeconds*1000);
}
function select(i) { stop(); index=i; render(); }
function render() {
  const s=plan.steps[index];
  $('equation').textContent=s.expression; $('stepTitle').textContent=s.title;
  $('narration').textContent=s.narration; $('stepNumber').textContent='STEP '+(index+1)+' / '+plan.steps.length;
  $('time').textContent=s.startSeconds+'–'+s.endSeconds+' sec · '+plan.timing.totalSeconds+' sec preview';
  $('previous').disabled=index===0; $('next').disabled=index===plan.steps.length-1;
  for(const [i,button] of [...$('steps').children].entries()) {
    if(i===index) button.setAttribute('aria-current','step'); else button.removeAttribute('aria-current');
  }
  draw(s);
}
for(const [i,s] of plan.steps.entries()) {
  const button=document.createElement('button'); button.type='button'; button.textContent=(i+1)+'. '+s.title; button.onclick=()=>select(i); $('steps').append(button);
  const li=document.createElement('li'); li.textContent=s.title+' — '+s.narration; $('script').append(li);
}
$('previous').onclick=()=>select(Math.max(0,index-1)); $('next').onclick=()=>select(Math.min(plan.steps.length-1,index+1));
$('play').onclick=()=>{ if(playing) {stop();return;} if(index===plan.steps.length-1) {index=0;render();} playing=true; $('play').textContent='Pause'; schedule(); };
document.addEventListener('keydown',event=>{if(event.key==='ArrowRight') {event.preventDefault();$('next').click();} if(event.key==='ArrowLeft') {event.preventDefault();$('previous').click();}});
render();
</script></body></html>`;
}
