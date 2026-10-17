// Findable pilot feedback form -> FormSubmit (same endpoint as the audit form, delivered to hello@findable.london).
const FB_ENDPOINT='https://formsubmit.co/ajax/39503e9df3f6e78db33e8f0d00a79949';
const f=document.getElementById('fbForm'),err=document.getElementById('fbErr'),thx=document.getElementById('fbThanks');
// Prefill from the emailed link: /feedback/?b=<report-slug>&n=<Business name>
(()=>{const q=new URLSearchParams(location.search);const b=(q.get('b')||'').replace(/[^a-z0-9-]/gi,'').slice(0,80),n=(q.get('n')||'').slice(0,100);
  if(b)f.ref.value=b;if(n&&!f.business.value)f.business.value=n})();
f.addEventListener('submit',async e=>{
  e.preventDefault();const fd=new FormData(f);
  if(fd.get('_honey'))return; // bot
  const missing=[];
  if(!(fd.get('name')||'').trim())missing.push('your name');
  if(!(fd.get('business')||'').trim())missing.push('business name');
  [['ease','question 1'],['admin_pain','question 3'],['ai_tools','question 4'],['case_study','question 7']].forEach(([k,l])=>{if(!fd.get(k))missing.push(l)});
  err.hidden=!missing.length;err.textContent=missing.length?'Please fill in: '+missing.join(', ')+'.':'';if(missing.length){err.scrollIntoView({block:'center'});return}
  const req={};for(const [k,v] of fd.entries()){if(k==='_honey')continue;req[k]=req[k]?req[k]+'; '+v:v}
  ['results','would_pay'].forEach(k=>{if(!req[k])req[k]='(none ticked)'});
  req._subject='Findable pilot feedback: '+req.business+(req.case_study==='yes'?' (case study OK)':'');req._template='table';req._captcha='false';
  const btn=f.querySelector('button[type=submit]');btn.disabled=true;btn.textContent='Sending…';
  try{
    const r=await fetch(FB_ENDPOINT,{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(req)});
    const d=await r.json().catch(()=>({}));
    if(!r.ok||String(d.success)!=='true')throw new Error(d.message||r.status);
    f.hidden=true;thx.hidden=false;thx.textContent=`Thanks ${req.name.trim().split(' ')[0]}, that's really helpful. We read every answer.`;
  }catch(x){btn.disabled=false;btn.textContent='Send my feedback';thx.hidden=false;thx.textContent="Sorry, that didn't send. Please try again, or email hello@findable.london."}
});
