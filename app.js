// Findable self-check: all client-side, nothing is sent anywhere.
// Outreach variant from ?utm_* (kept for this tab only, in sessionStorage – no cookies).
const UTM=(()=>{const q=new URLSearchParams(location.search),o={};['utm_source','utm_medium','utm_campaign','utm_content'].forEach(k=>{const v=q.get(k);if(v)o[k]=v.slice(0,80)});
  try{if(Object.keys(o).length){sessionStorage.setItem('findable_utm',JSON.stringify(o));return o}return JSON.parse(sessionStorage.getItem('findable_utm')||'{}')}catch(e){return o}})();
const QUESTIONS=[
 {id:'claimed',q:'Have you claimed (verified) your Google Business Profile?',w:15,tip:'Claim and verify your profile at business.google.com – nothing else works without it.'},
 {id:'category',q:'Is your main category set to “Plumber”?',w:10,tip:'Set “Plumber” as the primary category; add extras like “Emergency plumber” or “Boiler repair service” only if you do them.'},
 {id:'hours',q:'Are your opening hours correct (including bank holidays)?',w:10,tip:'Update your hours and add special hours for bank holidays – wrong hours put people off.'},
 {id:'photos',q:'Do you have 10 or more real photos (van, team, finished jobs)?',w:10,tip:'Add 10+ genuine photos: your van, you at work, before/after jobs. Profiles with photos get more calls.'},
 {id:'services',q:'Have you listed your services and areas you cover?',w:10,tip:'List each service (leaks, boilers, bathrooms…) and the postcodes you cover, e.g. N3, N12, EN5.'},
 {id:'reviews',q:'Do you have 20 or more Google reviews?',w:10,tip:'Ask every happy customer for a review with a short link or QR card. Real customers only – no incentives.'},
 {id:'replies',q:'Do you reply to your reviews (good and bad)?',w:10,tip:'Reply to every review, briefly and politely. It shows you’re active and helps AI assistants trust you.'},
 {id:'website',q:'Do you have a website showing the same name, address and phone?',w:10,tip:'Make your name, address and phone match exactly across Google, your website and directories – AI assistants cross-check these.'},
 {id:'directories',q:'Are you on trade directories (e.g. Checkatrade, Yell, TrustATrader)?',w:5,tip:'Get listed on 2–3 reputable directories with the same details. AI assistants often quote them.'},
 {id:'phone',q:'Do you usually catch calls when you’re on a job?',w:10,tip:'Missed calls go to the next plumber. A missed-call text-back keeps the job warm until you’re free.'},
];
const OPTS=[['yes','Yes',1],['notsure','Not sure',0.3],['no','No',0]];
const fs=document.getElementById('questions');
fs.insertAdjacentHTML('beforeend',QUESTIONS.map((x,i)=>`<div class="q" role="radiogroup" aria-labelledby="q-${x.id}"><p id="q-${x.id}">${i+1}. ${x.q}</p><div class="opts">${OPTS.map(([v,l])=>`<label><input type="radio" name="${x.id}" value="${v}"><span>${l}</span></label>`).join('')}</div></div>`).join(''));
const pcRe=/^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$|^[A-Z]{1,2}\d[A-Z\d]?$/i;
const esc=s=>s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

document.getElementById('checkForm').addEventListener('submit',e=>{
  e.preventDefault();const f=new FormData(e.target),err=document.getElementById('err');
  const biz=(f.get('business')||'').trim(),pc=(f.get('postcode')||'').trim().toUpperCase();
  const missing=QUESTIONS.filter(x=>!f.get(x.id));
  let msg='';if(!biz)msg='Please enter your business name.';else if(!pcRe.test(pc))msg='Please enter a UK postcode, e.g. N3 1AA.';else if(missing.length)msg=`Please answer all questions (${missing.length} left).`;
  err.hidden=!msg;err.textContent=msg;if(msg)return;
  let score=0;const rows=QUESTIONS.map(x=>{const v=f.get(x.id),m=OPTS.find(o=>o[0]===v)[2];score+=x.w*m;return{...x,v,m}});
  score=Math.round(score);
  const band=score>=80?['Nicely findable','#0f7b6c','You’re in good shape – a few tweaks will keep you ahead.']:score>=50?['Partly findable','#9a6700','Customers can find you, but you’re leaving jobs on the table.']:['Hard to find','#c0392b','Right now most customers will ring someone else first. The good news: it’s quick to fix.'];
  const fixes=rows.filter(r=>r.m<1).sort((a,b)=>b.w*(1-b.m)-a.w*(1-a.m));
  const out=document.getElementById('result');
  out.innerHTML=`<div class="score"><div class="ring" style="--p:${score};--c:${band[1]}"><b>${score}</b></div><div><h3 style="margin:0;color:${band[1]}">${band[0]}</h3><p style="margin:.3em 0">${esc(biz)} · ${esc(pc)}</p><p class="small" style="margin:0">${band[2]}</p></div></div>
  ${fixes.length?`<h3>Your top fixes</h3><ul class="list">${fixes.map(r=>`<li class="bad"><svg class="ic" aria-hidden="true"><use href="#i-alert"/></svg> ${r.q}<small>${r.tip}</small></li>`).join('')}</ul>`:''}
  ${rows.filter(r=>r.m===1).length?`<h3>Already sorted</h3><ul class="list">${rows.filter(r=>r.m===1).map(r=>`<li class="ok"><svg class="ic" aria-hidden="true"><use href="#i-check"/></svg> ${r.q}</li>`).join('')}</ul>`:''}
  <p class="small">This quick score is based on your answers only. The full audit checks your live Google listing, 3–5 local map searches and what ChatGPT, Gemini, Perplexity and Grok actually say about plumbers near ${esc(pc)}.</p>
  <a class="btn" href="#audit" id="toAudit">Get my full free audit <svg class="ic" aria-hidden="true"><use href="#i-arrow"/></svg></a><p class="small">We’ve copied your business name and postcode into the audit form.</p>`;
  out.hidden=false;track('selfcheck-'+(score>=80?'high':score>=50?'mid':'low'));
  const af=document.getElementById('auditForm');af.business.value=biz;af.postcode.value=pc;af.dataset.selfScore=score;
  localStorage.setItem('findable_selfcheck',JSON.stringify({biz,pc,score,answers:Object.fromEntries(rows.map(r=>[r.id,r.v])),at:new Date().toISOString()}));
  out.scrollIntoView({behavior:smooth(),block:'start'});
  document.getElementById('toAudit').addEventListener('click',ev=>{ev.preventDefault();goAudit()});
});
function smooth(){return matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}
function goAudit(){const af=document.getElementById('auditForm');document.getElementById('audit').scrollIntoView({behavior:smooth(),block:'start'});const n=af.querySelector('[name=name]');setTimeout(()=>n.focus({preventScroll:true}),400);history.replaceState(null,'',location.pathname+location.search+'#audit')}
// light scroll reveal (skipped entirely for reduced motion)
if('IntersectionObserver' in window&&!matchMedia('(prefers-reduced-motion: reduce)').matches){
  document.documentElement.classList.add('js');
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
}

const AUDIT_ENDPOINT='https://formsubmit.co/ajax/39503e9df3f6e78db33e8f0d00a79949';
document.getElementById('auditForm').addEventListener('submit',async e=>{
  e.preventDefault();const f=e.target;if(!f.reportValidity())return;
  const req=Object.fromEntries(new FormData(f));
  if(req._honey)return; // bot
  delete req.consent;req.consent='yes';Object.assign(req,UTM);req.selfScore=f.dataset.selfScore||'not taken';
  req.offer=req.offer||'standard';req._subject=req.offer==='pilot'?'New Findable FOUNDING PILOT request':'New Findable audit request';req._template='table';req._captcha='false';
  const btn=f.querySelector('button[type=submit]'),t=document.getElementById('auditThanks');
  btn.disabled=true;btn.textContent='Sending…';
  try{
    const r=await fetch(AUDIT_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(req)});
    const d=await r.json().catch(()=>({}));
    if(!r.ok||String(d.success)!=='true')throw new Error(d.message||r.status);
    f.hidden=true;t.hidden=false;track('audit-submit');
    t.textContent=`Thanks ${req.name.split(' ')[0]} – we've got your request. We'll reply within 2 working days.`;
  }catch(err){
    btn.disabled=false;btn.textContent=f.offer.value==='pilot'?'Apply for the founding pilot':'Request my free audit';t.hidden=false;
    t.textContent="Sorry, that didn't send. Please try again, or email hello@findable.london.";
  }
});

// ---- Measurement: cookie-free, no personal data, inert until GC_CODE is set ----
// After signing up at goatcounter.com (free), set GC_CODE to the site code, e.g. 'findable' -> findable.goatcounter.com
const GC_CODE='';
function track(name){const ev={path:name,title:[UTM.utm_campaign,UTM.utm_content].filter(Boolean).join('/')||'direct',event:true};
  if(window.goatcounter&&window.goatcounter.count)window.goatcounter.count(ev);else(window._gcq=window._gcq||[]).push(ev)}
if(GC_CODE){const s=document.createElement('script');s.async=true;s.src='https://gc.zgo.at/count.js';s.dataset.goatcounter=`https://${GC_CODE}.goatcounter.com/count`;
  s.onload=()=>{(window._gcq||[]).forEach(e=>window.goatcounter.count(e));window._gcq=[]};document.head.appendChild(s)}
document.addEventListener('click',e=>{const a=e.target.closest('a');if(!a)return;if(a.dataset.track)track(a.dataset.track);else if(a.href.startsWith('mailto:'))track('email-click')});
// Attribution: carry the outreach variant through to Stripe (client_reference_id) and the audit form email.
const REF=[UTM.utm_campaign,UTM.utm_content].filter(Boolean).join('__').replace(/[^A-Za-z0-9_-]/g,'_').slice(0,200);
if(REF)document.querySelectorAll('a[href^="https://buy.stripe.com/"]').forEach(a=>{const u=new URL(a.href);u.searchParams.set('client_reference_id',REF);a.href=u.toString()});
if(UTM.utm_source==='audit_report')document.getElementById('snapNote').hidden=false;
// Founding pilot: ?offer=pilot (or the pilot button) flags the audit request; setup is free, so no Stripe.
function setPilot(){const af=document.getElementById('auditForm');af.offer.value='pilot';document.getElementById('pilotNote').hidden=false;af.querySelector('button[type=submit]').textContent='Apply for the founding pilot'}
if(new URLSearchParams(location.search).get('offer')==='pilot')setPilot();
document.querySelector('.pilot-cta').addEventListener('click',e=>{e.preventDefault();setPilot();const q=new URLSearchParams(location.search);q.set('offer','pilot');history.replaceState(null,'','?'+q.toString()+'#audit');goAudit()});
