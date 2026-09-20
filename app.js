/* Your life, in receipts: application logic.
   Loads data/data.json, then renders every section (story, strip, chapters, taste, patterns, days, cases, receipt). */
function boot(D){
(()=>{
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const NM=138, LAST=NM-1;
const MN=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const fmt=n=>Math.round(n).toLocaleString('en-US');
const inr=n=>'\u20B9'+Math.round(n).toLocaleString('en-IN');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const miOf=d=>(+d.slice(0,4)-2013)*12+(+d.slice(5,7))-7;
const yStart=y=>(y-2013)*12-6;
const miLabel=i=>MN[(i+6)%12]+' '+(2013+Math.floor((i+6)/12));
const dayLabel=d=>new Date(d+'T00:00:00Z').toLocaleDateString('en-GB',{timeZone:'UTC',weekday:'long',day:'numeric',month:'short',year:'numeric'});
const dm=d=>new Date(d+'T00:00:00Z').toLocaleDateString('en-GB',{timeZone:'UTC',day:'numeric',month:'short'});
const shortDay=d=>new Date(d+'T00:00:00Z').toLocaleDateString('en-GB',{timeZone:'UTC',day:'numeric',month:'short',year:'numeric'});
const H12=h=>{h=((h%24)+24)%24;return (h%12||12)+(h<12?' am':' pm')};
const reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const YM=D.yearMeta, yr=y=>D.yearStats[y]||[0,0];
const ledYr=y=>{const f=yStart(y);let c=0;for(let i=f;i<=f+11;i++)c+=D.mo.led[i]||0;return c};

// ---------- indexes
const LEDD={},CARDD={},LEDM=Array.from({length:NM},()=>[]),CARDM=Array.from({length:NM},()=>[]);
D.ledger.forEach(r=>{(LEDD[r[0]]=LEDD[r[0]]||[]).push(r);LEDM[miOf(r[0])].push(r)});
D.card.forEach(r=>{(CARDD[r[0]]=CARDD[r[0]]||[]).push(r);CARDM[miOf(r[0])].push(r)});
const ART_DAYS={},LEDK_DAYS={},CARDC_DAYS={};
for(const d in D.days){const f=D.days[d][2],seen=new Set();for(let j=0;j<f.length;j+=2){const a=D.tracks[f[j]][1];if(!seen.has(a)){seen.add(a);(ART_DAYS[a]=ART_DAYS[a]||[]).push(d)}}}
D.ledger.forEach(r=>{const k=r[4]||r[3];if(k)(LEDK_DAYS[k]=LEDK_DAYS[k]||new Set()).add(r[0])});
D.card.forEach(r=>{(CARDC_DAYS[r[2]]=CARDC_DAYS[r[2]]||new Set()).add(r[0])});
const catName=c=>String(c).replace(/_/g,' ');
let MAXD='',MAXP=0;for(const d in D.days)if(D.days[d][0]>MAXP){MAXP=D.days[d][0];MAXD=d}
const STREAK=D.stats.streak;

// ---------- eras
const ERAS=[
 {name:'Faint signal',from:0,to:17,range:'Jul 2013 to Dec 2014',persona:'The Sampler'},
 {name:'The ledger years',from:18,to:62,range:'Jan 2015 to Sep 2018',persona:'The Builder'},
 {name:'The loud years',from:63,to:104,range:'Oct 2018 to Mar 2022',persona:'The Loyalist'},
 {name:'The card era',from:105,to:LAST,range:'Apr 2022 to Dec 2024',persona:'The Finisher'}
];
const sum=(a,f,t)=>{let s=0;for(let i=f;i<=t;i++)s+=a[i];return s};
ERAS.forEach(e=>{
  e.plays=sum(D.mo.plays,e.from,e.to);e.hrs=sum(D.mo.mins,e.from,e.to)/60;
  e.led=sum(D.mo.led,e.from,e.to);e.ledAmt=sum(D.mo.ledAmt,e.from,e.to);
  e.card=sum(D.mo.card,e.from,e.to);e.cardAmt=sum(D.mo.cardAmt,e.from,e.to);
  const t={};D.artists.forEach(([n,,m])=>{for(let i=e.from;i<=e.to;i++)if(m[i])t[n]=(t[n]||0)+m[i]});
  e.top=Object.entries(t).sort((a,b)=>b[1]-a[1]).slice(0,3);
});
ERAS[0].evidence=[['Plays in 18 months',fmt(ERAS[0].plays)],['Different artists',fmt(D.stats.era1Artists)],['Plays per artist',(ERAS[0].plays/D.stats.era1Artists).toFixed(1)]];
ERAS[1].evidence=[['Skip share, 2017',YM[2017].fwd.toFixed(0)+'%'],['Ledger entries, 2017',fmt(ledYr(2017))],['Fixed deposits, 2017','\u20B94.5 lakh']];
ERAS[2].evidence=[['New-artist plays, 2018 to 2020',YM[2018].newA+'% to '+YM[2020].newA+'%'],['Tracks played 20+ times, 2020',fmt(YM[2020].rep20)],['Longest streak',STREAK[0]+' days']];
ERAS[3].evidence=[['Skip share, 2022 to 2024',YM[2022].fwd.toFixed(0)+'% to '+YM[2024].fwd.toFixed(0)+'%'],['Average play',YM[2022].avgMin.toFixed(1)+' to '+YM[2024].avgMin.toFixed(1)+' min'],['Card swipes',fmt(ERAS[3].card)]];
ERAS[0].story=`A web player, a few songs, then almost nothing. Whoever this is hasn't committed yet. Every artist is a one-off.`;
ERAS[1].story=`The ledger switches on and the music gets serious. They log every rupee, take a course, open fixed deposits, and lock onto The Beatles.`;
ERAS[2].story=`No receipts at all, yet the loudest stretch of the whole record. They stop exploring and replay what they love.`;
ERAS[3].story=`Card swipes appear. Listening cools off, but they skip far less and play songs through to the end.`;

// ---------- state
const S={domain:[0,LAST],q:'',match:null,month:null,shift:0,day:null,threads:[],thIdx:0,thHit:[]};
const ST={domain:[0,LAST],q:'',match:null,month:null,cap:''};

// ---------- hero receipt
(function hero(){
  const m=D.meta;
  const L=[
   ['c','<b style="font-family:var(--sans);font-size:22px;letter-spacing:-.02em">A LIFE, ITEMISED</b>'],
   ['c','<span style="color:var(--faded)">Order #0001, eat in</span>'],['hr'],
   ['r','Songs played',fmt(m.plays)],['r','Ledger entries',fmt(m.ledger)],['r','Card swipes',fmt(m.card)],['r','Artists heard',fmt(m.artists)],['hr'],
   ['r','Most played','The Beatles'],['r','Longest streak',STREAK[0]+' days'],['r','Loudest year','2020'],['r','Busiest year','2017'],['hr'],
   ['r','<b>Moments total</b>','<b>'+fmt(m.plays+m.ledger+m.card)+'</b>'],['hr'],
   ['c','Keep this receipt.'],['c','It adds up to more than it says.']
  ];
  const el=$('#heroReceipt');
  const html=l=>l[0]=='hr'?'<hr class="rule">':l[0]=='c'?`<span class="ln center">${l[1]}</span>`:`<div class="row"><span>${l[1]}</span><span>${l[2]}</span></div>`;
  if(reduce){el.innerHTML=L.map(html).join('');return}
  let i=0;(function next(){if(i>=L.length)return;el.insertAdjacentHTML('beforeend',html(L[i++]));setTimeout(next,i<3?260:110)})();
})();

// ---------- search
function computeMatch(q){
  q=(q||'').trim().toLowerCase();if(q.length<2)return null;
  const mus=new Array(NM).fill(0),led=new Array(NM).fill(0),card=new Array(NM).fill(0);
  const artistHits=[];let plays=0;
  D.artists.forEach(([n,t,m])=>{if(n.toLowerCase().includes(q)){artistHits.push([n,t]);plays+=t;for(const k in m)mus[k]+=m[k]}});
  const tm=D.tracks.map(([n,a])=>n.toLowerCase().includes(q)&&!a.toLowerCase().includes(q));let trackHits=0;
  if(tm.some(Boolean))for(const d in D.days){const f=D.days[d][2];for(let j=0;j<f.length;j+=2)if(tm[f[j]]){mus[miOf(d)]+=f[j+1];trackHits+=f[j+1]}}
  const rows=[];let lAmt=0,cAmt=0,lN=0,cN=0;
  D.ledger.forEach(r=>{if((r[3]+' '+r[4]+' '+r[5]).toLowerCase().includes(q)){led[miOf(r[0])]++;lN++;if(r[2]=='Expense')lAmt+=r[6];rows.push(['l',r])}});
  D.card.forEach(r=>{if((r[2]+' '+D.merch[r[3]]).toLowerCase().includes(q)){card[miOf(r[0])]++;cN++;cAmt+=r[4];rows.push(['c',r])}});
  rows.sort((a,b)=>a[1][0]<b[1][0]?-1:1);
  const ratio=(a,tot)=>a.map((v,i)=>tot[i]?Math.min(1,v/tot[i]):0);
  return{q,artistHits:artistHits.sort((a,b)=>b[1]-a[1]),plays:plays+trackHits,trackHits,lN,lAmt,cN,cAmt,rows,mus:ratio(mus,D.mo.plays),led:ratio(led,D.mo.led),card:ratio(card,D.mo.card)};
}
function setQuery(q,scroll){
  $('#q').value=q;S.q=q;S.match=computeMatch(q);
  $$('#sugs .chip').forEach(c=>c.setAttribute('aria-pressed',c.dataset.q==q));
  drawStrip();renderResults();if(scroll)$('#strip').scrollIntoView();
}

// ---------- strip renderer (shared by story + explore)
function stripSVG(W,cfg){
  const {domain:[a,b],match:M,month,H}=cfg,n=b-a+1,pl=8,pr=8,band=34,base=Math.round(H*.56),bot=H-30;
  const step=(W-pl-pr)/n,bw=Math.max(1,step*.74),rx=Math.min(2.5,bw/2);
  let mp=1,ml=1,mc=1;for(let i=a;i<=b;i++){mp=Math.max(mp,D.mo.plays[i]);ml=Math.max(ml,D.mo.ledAmt[i]);mc=Math.max(mc,D.mo.cardAmt[i])}
  const up=base-band-10,dn=bot-base-6;
  // colours come from CSS variables, so the strip follows the light/dark theme without a redraw
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Timeline of songs played and money spent by month">`;
  ERAS.forEach((e,k)=>{
    const x0=Math.max(e.from,a),x1=Math.min(e.to,b);if(x1<x0)return;
    const x=pl+(x0-a)*step,w=(x1-x0+1)*step;
    s+=`<rect x="${x}" y="0" width="${w}" height="${H}" style="fill:var(${k%2?'--era-b':'--era-a'})"/><rect x="${x}" y="0" width="${w}" height="${band-6}" style="fill:var(--era-label)"/>`;
    const fit=Math.floor((w-14)/7.4);
    if(fit>=4){const nm=e.name.length<=fit?e.name:e.name.slice(0,fit-1).trim()+'\u2026';s+=`<text x="${x+7}" y="17" font-family="Bricolage Grotesque,sans-serif" font-weight="600" font-size="12.5" style="pointer-events:none;fill:var(--text)">${nm}</text>`}
  });
  s+=`<line x1="${pl}" x2="${W-pr}" y1="${base}" y2="${base}" style="stroke:var(--text-2)" stroke-width="1.5"/>`;
  for(let i=a;i<=b;i++){
    const x=pl+(i-a)*step+(step-bw)/2,dim=M?.32:1,p=D.mo.plays[i];
    if(p){const h=Math.max(1.5,p/mp*up);s+=`<rect x="${x}" y="${base-h}" width="${bw}" height="${h}" rx="${rx}" style="fill:var(--song)" opacity="${dim}"/>`;
      if(M&&M.mus[i])s+=`<rect x="${x}" y="${base-h*M.mus[i]}" width="${bw}" height="${h*M.mus[i]}" rx="${rx}" style="fill:var(--hl)"/>`}
    let src=null;if(D.mo.led[i])src=['led','--ledger',D.mo.ledAmt[i]/ml];else if(D.mo.card[i])src=['card','--card',D.mo.cardAmt[i]/mc];
    if(src){const h=Math.max(2,src[2]*dn);s+=`<rect x="${x}" y="${base+2}" width="${bw}" height="${h}" rx="${rx}" style="fill:var(${src[1]})" opacity="${dim}"/>`;
      if(M&&M[src[0]][i])s+=`<rect x="${x}" y="${base+2}" width="${bw}" height="${h*M[src[0]][i]}" rx="${rx}" style="fill:var(--hl)"/>`}
    if(month===i)s+=`<rect x="${pl+(i-a)*step}" y="${band}" width="${step}" height="${H-band-26}" rx="4" fill="none" style="stroke:var(--text)" stroke-width="1.8"/>`;
  }
  for(let i=a;i<=b;i++){
    const jan=(i+6)%12==0,every=n<=30?(i%3==0):false;
    if(jan||every){const x=pl+(i-a)*step;s+=`<line x1="${x}" x2="${x}" y1="${bot+2}" y2="${bot+8}" style="stroke:var(--text-2)"/>`;
      const yy=2013+Math.floor((i+6)/12),lab=jan?String(yy):miLabel(i).slice(0,3);
      if(jan?(step*12>=34||yy%2==0):(step*3>34))s+=`<text x="${x+3}" y="${H-8}" font-family="Geist Mono,monospace" font-size="11.5" style="fill:var(--text-2)">${lab}</text>`}
  }
  return s+'</svg>';
}
function drawStrip(){
  const w=$('#stripSvg'),W=Math.max(300,w.clientWidth||$('#stripWrap').clientWidth||900);
  w.innerHTML=stripSVG(W,{domain:S.domain,match:S.match,month:S.month,H:W<560?330:390});
}
function drawStory(){
  const w=$('#storyStrip'),W=Math.max(280,w.clientWidth||400);
  w.innerHTML=stripSVG(W,{domain:ST.domain,match:ST.match,month:ST.month,H:W<560?200:400});
  $('#storyCap').textContent=ST.cap;
}
const wrapEl=$('#stripWrap'),tip=$('#tip');
function idxFromEvent(e){const r=wrapEl.getBoundingClientRect(),W=r.width,[a,b]=S.domain,n=b-a+1,step=(W-16)/n;
  return{i:Math.min(b,Math.max(a,a+Math.floor((e.clientX-r.left-8)/step))),y:e.clientY-r.top,x:e.clientX-r.left,W}}
wrapEl.addEventListener('pointermove',e=>{
  const{i,y,x,W}=idxFromEvent(e),p=D.mo.plays[i],l=D.mo.led[i],c=D.mo.card[i];
  tip.hidden=false;tip.textContent=y<34?'Zoom to this chapter':`${miLabel(i)}: ${fmt(p)} songs`+(l?`, ${inr(D.mo.ledAmt[i])} out`:'')+(c?`, ${inr(D.mo.cardAmt[i])} on cards`:'');
  tip.style.left=Math.min(W-90,Math.max(90,x))+'px';tip.style.top=Math.max(30,y-10)+'px';
});
wrapEl.addEventListener('pointerleave',()=>tip.hidden=true);
wrapEl.addEventListener('click',e=>{
  const{i,y}=idxFromEvent(e);
  if(y<34){const er=ERAS.find(x=>i>=x.from&&i<=x.to);const same=S.domain[0]==er.from&&S.domain[1]==er.to;setDomain(same?[0,LAST]:[er.from,er.to]);return}
  S.month=i;drawStrip();renderMonth();
});
// keyboard access for the strip: arrows step through months, Home/End jump to the ends of the visible range
const monthDesc=i=>`${miLabel(i)}: ${fmt(D.mo.plays[i])} songs`+(D.mo.led[i]?`, ${inr(D.mo.ledAmt[i])} out`:'')+(D.mo.card[i]?`, ${inr(D.mo.cardAmt[i])} on cards`:'');
wrapEl.tabIndex=0;wrapEl.setAttribute('role','group');
wrapEl.setAttribute('aria-label','Timeline of songs and spending. Use the left and right arrow keys to step through months, Home and End to jump to the ends.');
wrapEl.addEventListener('keydown',e=>{
  const step={ArrowRight:1,ArrowLeft:-1};if(!(e.key in step)&&e.key!=='Home'&&e.key!=='End')return;
  e.preventDefault();const[a,b]=S.domain;let i=S.month;const out=i==null||i<a||i>b;
  if(e.key==='Home'||(out&&e.key==='ArrowRight'))i=a;else if(e.key==='End'||(out&&e.key==='ArrowLeft'))i=b;else i=Math.min(b,Math.max(a,i+step[e.key]));
  S.month=i;drawStrip();renderMonth();$('#stripLive').textContent=monthDesc(i);
});
function setDomain(d){S.domain=d;$$('#zoomChips .chip').forEach(c=>c.setAttribute('aria-pressed',String(c.dataset.a==d[0]&&c.dataset.b==d[1])));drawStrip()}
$('#zoomChips').innerHTML=[['All years',0,LAST],...ERAS.map(e=>[e.name,e.from,e.to])].map(([t,a,b],k)=>`<button class="chip" type="button" data-a="${a}" data-b="${b}" aria-pressed="${k==0}">${t}</button>`).join('');
$('#zoomChips').addEventListener('click',e=>{const c=e.target.closest('.chip');if(c)setDomain([+c.dataset.a,+c.dataset.b])});
$('#sugs').innerHTML='<span class="sug-label">Follow a thread:</span>'+['the beatles','the killers','john mayer','milk','netflix','diwali','food','travel'].map(q=>`<button class="chip sug" type="button" data-q="${q}" aria-pressed="false">${q}</button>`).join('');
$('#sugs').addEventListener('click',e=>{const c=e.target.closest('.chip');if(!c)return;setQuery(c.getAttribute('aria-pressed')=='true'?'':c.dataset.q)});
let qt;$('#q').addEventListener('input',e=>{clearTimeout(qt);qt=setTimeout(()=>setQuery(e.target.value),140)});
addEventListener('resize',()=>{clearTimeout(window._rt);window._rt=setTimeout(()=>{drawStrip();drawStory();drawThreads();drawTaste()},140)});

// ---------- month + results
function groupSum(rows,catI,amtI,onlyExp){const g={};rows.forEach(r=>{if(onlyExp&&r[2]!='Expense')return;const k=r[catI]||'other';g[k]=(g[k]||0)+r[amtI]});return Object.entries(g).sort((a,b)=>b[1]-a[1])}
function renderMonth(){
  const el=$('#monthPanel'),i=S.month;
  if(i==null){el.innerHTML='<p class="hint">Tap any bar on the strip to print that month\'s receipt here.</p>';return}
  const arts=D.artists.map(([n,,m])=>[n,m[i]||0]).filter(x=>x[1]).sort((a,b)=>b[1]-a[1]).slice(0,4);
  let bestD=null,bp=0;for(const d in D.days)if(miOf(d)==i&&D.days[d][0]>bp){bp=D.days[d][0];bestD=d}
  let h=`<div class="paper"><h3>${miLabel(i)}</h3><p class="sub">Month receipt</p><hr class="rule">`;
  h+=`<div class="row"><span><span class="tag m">songs</span>${fmt(D.mo.plays[i])} plays</span><span>${fmt(D.mo.mins[i]/60)} h</span></div>`;
  arts.forEach(([n,c])=>h+=`<div class="row"><span>&nbsp;&nbsp;${esc(n)}</span><span>${fmt(c)}</span></div>`);
  if(bestD)h+=`<div class="row"><span>&nbsp;&nbsp;Busiest day</span><span><a data-day="${bestD}">${dm(bestD)} (${fmt(bp)})</a></span></div>`;
  const lg=groupSum(LEDM[i],3,6,true).slice(0,5);
  if(lg.length){h+=`<hr class="rule"><div class="row"><span><span class="tag l">ledger</span>${D.mo.led[i]} expenses</span><span>${inr(D.mo.ledAmt[i])}</span></div>`;lg.forEach(([k,v])=>h+=`<div class="row"><span>&nbsp;&nbsp;${esc(k)}</span><span>${inr(v)}</span></div>`)}
  const cg=groupSum(CARDM[i],2,4,false).slice(0,5);
  if(cg.length){h+=`<hr class="rule"><div class="row"><span><span class="tag c">card</span>${D.mo.card[i]} swipes</span><span>${inr(D.mo.cardAmt[i])}</span></div>`;cg.forEach(([k,v])=>h+=`<div class="row"><span>&nbsp;&nbsp;${esc(catName(k))}</span><span>${inr(v)}</span></div>`)}
  if(!lg.length&&!cg.length)h+=`<hr class="rule"><div class="row"><span>No spending receipts this month</span><span></span></div>`;
  el.innerHTML=h+'</div>';
}
function renderResults(){
  const el=$('#results'),M=S.match;
  if(!S.q.trim()){el.innerHTML='<p class="hint">Search for a word to see where it appears across songs, the ledger and card swipes.</p>';return}
  if(!M){el.innerHTML='<p class="hint">Type at least two letters.</p>';return}
  if(!M.artistHits.length&&!M.trackHits&&!M.lN&&!M.cN){el.innerHTML=`<div class="paper"><h3>Nothing for \u201C${esc(M.q)}\u201D</h3><p class="sub">Try an artist, a food, a festival or a category like travel.</p></div>`;return}
  let h=`<div class="paper"><h3>\u201C${esc(M.q)}\u201D</h3><p class="sub">Highlighted in yellow on the strip</p><hr class="rule">`;
  if(M.artistHits.length){h+=`<div class="row"><span><span class="tag m">songs</span>${fmt(M.plays-M.trackHits)} plays</span><span>${M.artistHits.length} artist${M.artistHits.length>1?'s':''}</span></div>`;M.artistHits.slice(0,3).forEach(([n,c])=>h+=`<div class="row"><span>&nbsp;&nbsp;${esc(n)}</span><span>${fmt(c)}</span></div>`)}
  if(M.trackHits)h+=`<div class="row"><span><span class="tag m">songs</span>Track titles</span><span>${fmt(M.trackHits)}+</span></div>`;
  if(M.lN)h+=`<div class="row"><span><span class="tag l">ledger</span>${fmt(M.lN)} entries</span><span>${inr(M.lAmt)}</span></div>`;
  if(M.cN)h+=`<div class="row"><span><span class="tag c">card</span>${fmt(M.cN)} swipes</span><span>${inr(M.cAmt)}</span></div>`;
  if(M.rows.length){h+='<hr class="rule">';M.rows.slice(0,10).forEach(([t,r])=>{const d=r[0],txt=t=='l'?(r[5]||r[4]||r[3]):(D.merch[r[3]]||catName(r[2])),amt=t=='l'?r[6]:r[4];
    h+=`<div class="row"><span><a data-day="${d}">${shortDay(d)}</a> ${esc(txt).slice(0,26)}</span><span>${inr(amt)}</span></div>`});
    if(M.rows.length>10)h+=`<div class="sub" style="margin-top:8px">and ${M.rows.length-10} more. Zoom the strip to explore.</div>`}
  el.innerHTML=h+'</div>';
}

// ---------- story mode
const cardTop=(()=>{const c={};D.card.forEach(r=>c[r[2]]=(c[r[2]]||0)+1);return Object.entries(c).sort((a,b)=>b[1]-a[1]).slice(0,4).map(x=>catName(x[0]))})();
const B=[
 {t:'One person. Eleven years. No name.',dom:[0,LAST],cap:'The whole record, July 2013 to December 2024.',
  l:[`Someone played <b>${fmt(D.meta.plays)} songs</b>, wrote <b>${fmt(D.meta.ledger)} ledger lines</b> and swiped a card <b>${fmt(D.meta.card)} times</b>.`,`We never learn who. So I'll read the receipts and tell you who they were, one stretch at a time.`]},
 {t:'2013: a first song, then almost nothing',dom:[0,17],cap:'Faint signal: Jul 2013 to Dec 2014',
  l:[`On 8 July 2013 a web player plays a song by The Mowgli's. That's the first receipt.`,`2013 has <b>${fmt(yr(2013)[0])}</b> plays. 2014 has <b>${fmt(yr(2014)[0])}</b>. Almost every artist is heard once. This person hasn't decided to listen yet.`],a:[['day',D.meta.first,'Open the first play']]},
 {t:'2015: the ledger switches on',dom:[18,41],cap:'Ledger begins Jan 2015. Music is in discovery mode.',
  l:[`Chai, trains, milk, salary. Every rupee starts getting written down.`,`The music matches the mood: <b>${fmt(YM[2015].uniq)} different artists</b> in 2015, and <b>${YM[2015].newA.toFixed(0)}%</b> of plays are artists never played before.`]},
 {t:'2016: one band takes over',dom:[18,62],q:'the beatles',cap:'Highlighted: The Beatles',
  l:[`The Beatles get <b>0 plays</b> in 2015, <b>715</b> in 2016, and <b>${fmt(D.topByYear[2017][0][1])}</b> in 2017.`,`By 2017 about one song in eight is theirs. Exploring ends. Devotion begins.`]},
 {t:'2017: everything at once',dom:[42,53],month:49,cap:'2017 on the strip. Aug 2017 is outlined.',
  l:[`<b>${fmt(yr(2017)[0])} songs</b> and <b>${fmt(ledYr(2017))} ledger entries</b>, the most of any year.`,`An edtech course at \u20B92,700 a month. A \u20B92 lakh three-year fixed deposit in June. \u20B943,000 on a trip on 8 August. Another \u20B92.5 lakh saved on 26 December.`,`And the skip button: <b>${YM[2017].fwd.toFixed(0)}%</b> of songs end that way, the most impatient year on record.`],a:[['day','2017-08-08','Open the trip day'],['day','2017-12-26','Open FD day']]},
 {t:'6 September 2017: 1,816 songs in four hours',dom:[48,52],month:50,cap:'Sep 2017 outlined.',
  l:[`<b>${D.stats.day1816.fwd}%</b> of those plays ended on the skip button. The median play lasted <b>${D.stats.day1816.medianSec} seconds</b>.`,`${D.stats.day1816.artists} artists in one evening, ${D.stats.day1816.beatles} of them Beatles plays. Someone was hunting for one specific song.`],a:[['day',MAXD,'Open that day']]},
 {t:'October 2018: the receipts stop',dom:[56,68],cap:'The ledger ends 20 Sep 2018. The music doesn\'t.',
  l:[`The last ledger entry is on 20 September 2018.`,`For the next <b>three and a half years</b> there is no spending record at all. We only know this person through their headphones.`]},
 {t:'2020: the loud year',dom:[78,89],q:'the killers',cap:'Highlighted: The Killers',
  l:[`<b>${fmt(yr(2020)[1])} hours</b> of listening, the most of any year.`,`The Killers overtake The Beatles for the only time. From 11 October to 27 December there isn't a single day without music: <b>${STREAK[0]} days</b>.`],a:[['day',STREAK[2],'Open the streak\'s last day']]},
 {t:'2021: the explorer year',dom:[90,101],cap:'Jan to Dec 2021',
  l:[`After years of replaying favourites, they go looking: <b>${fmt(YM[2021].uniq)} different artists</b>, nearly double 2020's ${fmt(YM[2020].uniq)}.`,`<b>${YM[2021].newA.toFixed(0)}%</b> of plays are artists they'd never played before. It's the biggest jump since 2015.`]},
 {t:'2022 to 2024: the card years',dom:[105,LAST],cap:'Card spending appears (bars scaled to their own peak).',
  l:[`Money shows up as <b>${fmt(D.meta.card)} card swipes</b> across ${cardTop.slice(0,3).join(', ')} and ${cardTop[3]}.`,`Skips fall from <b>${YM[2022].fwd.toFixed(0)}%</b> to <b>${YM[2024].fwd.toFixed(0)}%</b>. The average play grows from ${YM[2022].avgMin.toFixed(1)} to <b>${YM[2024].avgMin.toFixed(1)} minutes</b>. They finish songs now.`]},
 {t:'So who is this?',dom:[0,LAST],cap:'The whole record again.',
  l:[`A <b>Sampler</b> who became a <b>Builder</b>, then a <b>Loyalist</b>, and finally someone who <b>finishes</b> what they start.`,`Now open any day, follow the threads between them, or try the six cold cases.`],a:[['go','#day','Open a day'],['go','#cases','Try the cases']]}
];
$('#beats').innerHTML=B.map((b,i)=>`<div class="beat" data-i="${i}"><div class="paper"><h3>${b.t}</h3><hr class="rule">${b.l.map((x,k)=>`<p class="ln" style="--i:${k}">${x}</p>`).join('')}${b.a?`<div class="beat-actions">${b.a.map(([t,v,lab])=>t=='day'?`<button class="pbtn" type="button" data-day="${v}">${lab}</button>`:`<a class="pbtn" style="text-decoration:none;color:inherit" href="${v}">${lab}</a>`).join('')}</div>`:''}</div></div>`).join('');
let curBeat=-1;
function showBeat(i){
  if(i==curBeat)return;curBeat=i;const b=B[i];
  ST.domain=b.dom;ST.q=b.q||'';ST.match=computeMatch(ST.q);ST.month=b.month==null?null:b.month;ST.cap=b.cap||'';
  const w=$('#storyStrip');if(!reduce)w.style.opacity=.15;
  requestAnimationFrame(()=>{drawStory();w.style.opacity=1});
  $$('.beat').forEach(e=>e.classList.toggle('on',+e.dataset.i==i));
  $('#sfill').style.width=((i+1)/B.length*100)+'%';
}
if('IntersectionObserver' in window){
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');showBeat(+e.target.dataset.i)}}),{rootMargin:'-42% 0px -42% 0px',threshold:0});
  $$('.beat').forEach(b=>io.observe(b));
  const io2=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('in')}),{threshold:.2});
  $$('.beat').forEach(b=>io2.observe(b));
}else{$$('.beat').forEach(b=>b.classList.add('in'));}
showBeat(0);

// ---------- chapters
const chapHTML=ERAS.map((e,k)=>{
  let h=`<div class="paper"><p class="persona">${e.persona}</p><h3>${e.name}</h3><p class="sub">${e.range}</p><p class="story">${e.story}</p><hr class="rule">`;
  e.evidence.forEach(([a,b])=>h+=`<div class="row"><span>${a}</span><span>${b}</span></div>`);
  h+=`<hr class="rule"><div class="row"><span><span class="tag m">songs</span>Plays</span><span>${fmt(e.plays)}</span></div><div class="row"><span>&nbsp;&nbsp;Hours</span><span>${fmt(e.hrs)}</span></div>`;
  if(e.top.length)h+=`<div class="row"><span>&nbsp;&nbsp;Top artist</span><span>${esc(e.top[0][0])}</span></div>`;
  if(e.led)h+=`<div class="row"><span><span class="tag l">ledger</span>Spent</span><span>${inr(e.ledAmt)}</span></div>`;
  if(e.card)h+=`<div class="row"><span><span class="tag c">card</span>Spent</span><span>${inr(e.cardAmt)}</span></div>`;
  if(!e.led&&!e.card)h+=`<div class="row"><span>No spending receipts</span><span></span></div>`;
  return h+`<button class="pbtn" type="button" data-zoom="${k}">Zoom the strip here</button></div>`}).join('');
$('#chapterGrid').innerHTML=chapHTML;
document.addEventListener('click',e=>{
  const z=e.target.closest('[data-zoom]');if(z){const er=ERAS[+z.dataset.zoom];setDomain([er.from,er.to]);$('#strip').scrollIntoView();return}
  const q=e.target.closest('[data-q]');if(q&&q.closest('#patternGrid,#caseGrid')){setQuery(q.dataset.q,true);return}
  const a=e.target.closest('[data-day]');if(a){e.preventDefault();openDay(a.dataset.day,true)}
});

// ---------- taste charts
const OWN=(()=>{const names=new Set();for(const y in D.topByYear)if(+y>=2015)D.topByYear[y].slice(0,3).forEach(a=>names.add(a[0]));
  const out=[];D.artists.forEach(([n,t,m])=>{if(!names.has(n))return;const yc={};for(const k in m){const y=2013+Math.floor((+k+6)/12);yc[y]=(yc[y]||0)+m[k]}out.push({n,t,yc})});
  return out.sort((a,b)=>b.t-a.t).slice(0,8)})();
const PAL=['#3b4ae0','#d02a52','#0a8666','#e08a00','#8b45c9','#171833','#cf4f91','#5a8f29'];
OWN.forEach((o,i)=>{o.c=PAL[i];o.on=i<4});
function lineChart(){
  const el=$('#ownChart'),W=Math.max(280,el.clientWidth||420),H=230,pl=30,pr=8,pt=10,pb=24,ys=[];for(let y=2015;y<=2024;y++)ys.push(y);
  const sh=(o,y)=>(o.yc[y]||0)/yr(y)[0]*100;let mx=8;OWN.forEach(o=>{if(o.on)ys.forEach(y=>mx=Math.max(mx,sh(o,y)))});mx=Math.ceil(mx/4)*4;
  const X=y=>pl+(y-2015)/9*(W-pl-pr),Y=v=>pt+(1-v/mx)*(H-pt-pb);
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Share of each year's plays by artist">`;
  for(let v=0;v<=mx;v+=4)s+=`<line x1="${pl}" x2="${W-pr}" y1="${Y(v)}" y2="${Y(v)}" stroke="#dcdff0"/><text x="0" y="${Y(v)+4}" font-family="Geist Mono,monospace" font-size="10" fill="#666b8d">${v}%</text>`;
  ys.forEach(y=>{if(y%2==1||W>420)s+=`<text x="${X(y)-12}" y="${H-6}" font-family="Geist Mono,monospace" font-size="10" fill="#666b8d">${W<420?String(y).slice(2):y}</text>`});
  OWN.forEach(o=>{if(!o.on)return;s+=`<polyline fill="none" stroke="${o.c}" stroke-width="2.4" points="${ys.map(y=>X(y)+','+Y(sh(o,y))).join(' ')}"/>`;
    ys.forEach(y=>s+=`<circle cx="${X(y)}" cy="${Y(sh(o,y))}" r="3" fill="${o.c}"><title>${esc(o.n)}, ${y}: ${sh(o,y).toFixed(1)}%</title></circle>`)});
  el.innerHTML=s+'</svg>';
}
function barChart(el,vals,labels,opt){
  const W=Math.max(220,el.clientWidth||300),H=190,pl=4,pb=22,pt=18,mx=Math.max(...vals)*1.05,bw=(W-pl*2)/vals.length;
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${opt.aria}">`;
  vals.forEach((v,i)=>{const h=v/mx*(H-pt-pb),x=pl+i*bw+bw*.14,hi=opt.hi.includes(i);
    s+=`<rect x="${x}" y="${H-pb-h}" width="${bw*.72}" height="${h}" fill="${hi?'#d02a52':'#3b4ae0'}" opacity="${hi?1:.75}"/><text x="${x+bw*.36}" y="${H-pb-h-4}" text-anchor="middle" font-family="Geist Mono,monospace" font-size="${W<300?8.5:10}" fill="#171833">${Math.round(v)}</text><text x="${x+bw*.36}" y="${H-6}" text-anchor="middle" font-family="Geist Mono,monospace" font-size="9.5" fill="#666b8d">${String(labels[i]).slice(2)}</text>`});
  el.innerHTML=s+'</svg>';
}
function drawTaste(){
  lineChart();
  const ys=[];for(let y=2015;y<=2024;y++)ys.push(y);
  const fw=ys.map(y=>YM[y].fwd),nw=ys.map(y=>YM[y].newA);
  barChart($('#impChart'),fw,ys,{hi:[fw.indexOf(Math.max(...fw))],aria:'Skip button share by year'});
  barChart($('#expChart'),nw,ys,{hi:[1+nw.slice(1).indexOf(Math.max(...nw.slice(1))),0].slice(0,1)},{});
}
(function initTaste(){
  $('#ownLegend').innerHTML=OWN.map((o,i)=>`<button class="lchip" type="button" data-o="${i}" aria-pressed="${o.on}"><i style="background:${o.c}"></i>${esc(o.n)}</button>`).join('');
  $('#ownLegend').addEventListener('click',e=>{const b=e.target.closest('[data-o]');if(!b)return;const o=OWN[+b.dataset.o];o.on=!o.on;b.setAttribute('aria-pressed',o.on);lineChart()});
  $('#impNote').innerHTML=`From <b>${YM[2017].fwd.toFixed(0)}%</b> in 2017 to <b>${YM[2024].fwd.toFixed(0)}%</b> in 2024. The average play went from ${YM[2015].avgMin.toFixed(1)} to ${YM[2024].avgMin.toFixed(1)} minutes. They stopped channel-surfing.`;
  $('#expNote').innerHTML=`<b>${YM[2015].newA.toFixed(0)}%</b> new in 2015, under <b>3%</b> in 2018, then a burst to <b>${YM[2021].newA.toFixed(0)}%</b> in 2021.`;
})();

// ---------- patterns
function patterns(){
  const P=[];
  const yrs=Object.keys(D.topByYear).map(Number).filter(y=>y>=2015),won=yrs.filter(y=>D.topByYear[y][0][0]=='The Beatles');
  const mx=Math.max(...yrs.map(y=>(D.topByYear[y].find(a=>a[0]=='The Beatles')||[0,0])[1]));
  let t=`<h3>One band, a decade</h3><p class="claim">The Beatles are the most played artist in ${won.length} of the ${yrs.length} years from 2015 on. Someone else leads in ${yrs.filter(y=>!won.includes(y)).join(' and ')||'no year'}.</p>`;
  yrs.forEach(y=>{const bt=(D.topByYear[y].find(a=>a[0]=='The Beatles')||[0,0])[1];t+=`<div class="row"><span>${y}</span><span><i class="bar" style="width:${Math.round(bt/mx*130)}px"></i> ${fmt(bt)}</span></div>`});
  P.push(t+`<button class="pbtn" type="button" data-q="the beatles">Light them up on the strip</button>`);
  P.push(`<h3>The six-hour silence</h3><p class="claim">Listening runs in one long stretch, then drops to almost nothing for about six hours. The timestamps are in UTC, so drag the clock to place this person somewhere on Earth.</p><div id="clockChart"></div><input type="range" id="shift" min="-12" max="12" value="0" aria-label="Shift clock hours from UTC"><div class="row"><span id="shiftLbl">Clock: UTC</span><span id="clockNote"></span></div>`);
  P.push(`<h3>Money and music don't move together</h3><p class="claim">Average songs played per day, Jan 2017 to Sep 2018, split by whether anything was spent that day.</p><div class="bigpair"><div>${D.stats.spendDayPlays}<small>on the ${D.stats.spendDays} days with spending</small></div><div>${D.stats.quietDayPlays}<small>on the ${D.stats.quietDays} days without</small></div></div><p class="claim" style="margin-bottom:0">Basically identical. Two logs of the same life, running on separate clocks.</p>`);
  const fest={};D.ledger.filter(r=>r[3]=='Festivals').forEach(r=>{if(!fest[r[0]])fest[r[0]]=[r[4],0];fest[r[0]][1]+=r[6]});
  let f=`<h3>What plays on festival days</h3><p class="claim">Every festival purchase in the ledger, next to how many songs played that day. Diwali 2016 is oddly silent.</p>`;
  Object.entries(fest).sort((a,b)=>a[0]<b[0]?-1:1).forEach(([d,[n]])=>{const p=(D.days[d]||[0])[0];f+=`<div class="row"><span><a data-day="${d}">${shortDay(d)}</a> ${esc(n)}</span><span>${p?fmt(p)+' songs':'<b>silent</b>'}</span></div>`});
  P.push(f);
  P.push(`<h3>The ${fmt(MAXP)}-song day</h3><p class="claim">On ${shortDay(MAXD)} the app logged ${fmt(MAXP)} plays in about ${Math.round(D.days[MAXD][1]/60)} hours: a new song every ${Math.round(D.days[MAXD][1]*60/MAXP)} seconds. Nearly all ended on the skip button. The next busiest day has less than half as many.</p><button class="pbtn" type="button" data-day="${MAXD}">Open that day</button>`);
  let y6=`<h3>2017, the year everything happened</h3><p class="claim">Songs and ledger entries both peak in 2017. The 2018 ledger stops in September, so it only has nine months.</p><table><tr><th>Year</th><th>Songs</th><th>Entries</th><th>Money out</th></tr>`;
  [2015,2016,2017,2018].forEach(y=>{const f=yStart(y);let ea=0,ec=0;for(let i=f;i<=f+11;i++){ea+=D.mo.ledAmt[i];ec+=D.mo.led[i]}y6+=`<tr><td>${y}${y==2018?'*':''}</td><td>${fmt(yr(y)[0])}</td><td>${ec}</td><td>${inr(ea)}</td></tr>`});
  P.push(y6+`</table><div class="sub" style="margin-top:8px">*Ledger ends 20 Sep 2018.</div><button class="pbtn" type="button" data-zoom="1">Zoom to the ledger years</button>`);
  return P;
}
$('#patternGrid').innerHTML=patterns().map(x=>`<div class="paper">${x}</div>`).join('');
function drawClock(){
  const tot=new Array(24).fill(0);for(const y in D.hours)D.hours[y].forEach((v,h)=>tot[h]+=v);
  const sh=S.shift,v=tot.map((_,h)=>tot[(h-sh+240)%24]),mx=Math.max(...v),W=300,H=110,bw=W/24;
  let s=`<svg viewBox="0 0 ${W} ${H+18}" width="100%" role="img" aria-label="Plays by hour of day">`;
  v.forEach((x,h)=>{const bh=x/mx*H;s+=`<rect x="${h*bw+1}" y="${H-bh}" width="${bw-2}" height="${bh}" fill="#3b4ae0"/>`});
  [0,6,12,18].forEach(h=>s+=`<text x="${h*bw}" y="${H+13}" font-family="Geist Mono,monospace" font-size="9" fill="#666b8d">${H12(h)}</text>`);
  $('#clockChart').innerHTML=s+'</svg>';
  let bi=0,bv=1e12;for(let h=0;h<24;h++){let t=0;for(let k=0;k<5;k++)t+=v[(h+k)%24];if(t<bv){bv=t;bi=h}}
  $('#clockNote').textContent=`Quietest ${H12(bi)} to ${H12(bi+5)}`;$('#shiftLbl').textContent='Clock: UTC'+(sh>=0?'+':'')+sh;
}
drawClock();$('#shift').addEventListener('input',e=>{S.shift=+e.target.value;drawClock()});
$('#patternGrid').addEventListener('click',e=>{const q=e.target.closest('[data-q]');if(q)setQuery(q.dataset.q,true)});

// ---------- day receipt + threads + play
const richDays=Object.keys(D.days).filter(d=>D.days[d][0]>5&&(LEDD[d]||CARDD[d]));
function stampFor(d){
  const dy=D.days[d],lr=LEDD[d]||[];
  if(d==D.meta.first)return['FIRST'];
  if(d==MAXD)return['RECORD'];
  if(!dy&&!lr.length&&!(CARDD[d]||[]).length)return null;
  if(lr.length&&(!dy||dy[0]<=1)&&lr.some(r=>r[3]=='Festivals'))return['SILENT'];
  if(d>=STREAK[1]&&d<=STREAK[2])return['STREAK'];
  if(lr.some(r=>r[3]=='Fixed Deposit'))return['SAVED'];
  if(lr.reduce((a,r)=>a+(r[2]=='Expense'?r[6]:0),0)>=50000)return['BIG SPEND'];
  if(lr.some(r=>r[3]=='Festivals'))return['FESTIVAL'];
  return null;
}
function dayReceipt(d){
  const dy=D.days[d],lr=LEDD[d]||[],cr=CARDD[d]||[],st=stampFor(d);
  let h=`<div class="paper" id="dayPaper">${st?`<div class="stamp">${st[0]}</div>`:''}<h3>${dayLabel(d)}</h3><p class="sub">Times as recorded (music in UTC)</p><hr class="rule">`;
  if(dy){h+=`<div class="row big"><span><span class="tag m">songs</span>${fmt(dy[0])} plays</span><span>${dy[1]>=60?(dy[1]/60).toFixed(1)+' h':dy[1]+' min'}</span></div>`;
    for(let j=0;j<dy[2].length;j+=2){const[n,a,u]=D.tracks[dy[2][j]];h+=`<div class="songrow"><div class="row"><span>&nbsp;&nbsp;${esc(n).slice(0,30)}<br>&nbsp;&nbsp;<a data-th="s|${esc(a)}" style="color:var(--faded)">${esc(a)}</a></span><span>x${dy[2][j+1]}<button class="play" type="button" data-uri="${u}" aria-label="Play ${esc(n)}">Play</button></span></div><div class="embed"></div></div>`}}
  if(lr.length){h+=`<hr class="rule"><div class="row big"><span><span class="tag l">ledger</span>${lr.length} line${lr.length>1?'s':''}</span><span></span></div>`;
    lr.forEach(r=>{const inc=r[2]=='Income',tf=r[2]=='Transfer-Out',k=r[4]||r[3];h+=`<div class="row"><span>${r[1]?r[1]+' ':''}${esc(r[5]||r[4]||r[3]).slice(0,30)}<br><a data-th="l|${esc(k)}" style="color:var(--faded)">${esc(r[3])}${r[4]?', '+esc(r[4]):''}</a></span><span class="${inc?'pos':tf?'':'neg'}">${inc?'+':tf?'':'-'}${inr(r[6])}</span></div>`})}
  if(cr.length){h+=`<hr class="rule"><div class="row big"><span><span class="tag c">card</span>${cr.length} swipe${cr.length>1?'s':''}</span><span></span></div>`;
    cr.forEach(r=>h+=`<div class="row"><span>${r[1]} ${esc(D.merch[r[3]]||'Unknown merchant').slice(0,24)}<br><a data-th="c|${esc(r[2])}" style="color:var(--faded)">${esc(catName(r[2]))}</a></span><span class="neg">-${inr(r[4])}</span></div>`)}
  const out=lr.filter(r=>r[2]=='Expense').reduce((a,r)=>a+r[6],0)+cr.reduce((a,r)=>a+r[4],0);
  if(!dy&&!lr.length&&!cr.length)h+='<p style="margin:0;font-family:var(--sans)">Nothing was recorded on this day. Silence is also a receipt.</p>';
  else h+=`<hr class="rule"><div class="row big"><span>Money out</span><span>${inr(out)}</span></div>`;
  return h+'</div>';
}
function threadsFor(d){
  const T=[],dy=D.days[d];
  if(dy){const seen=new Set();for(let j=0;j<dy[2].length&&T.length<3;j+=2){const a=D.tracks[dy[2][j]][1];if(seen.has(a))continue;seen.add(a);const ds=(ART_DAYS[a]||[]).filter(x=>x!=d);if(ds.length)T.push({type:'s',key:'s|'+a,label:a,dates:ds})}}
  const lr=(LEDD[d]||[]).slice().sort((a,b)=>b[6]-a[6]),seenL=new Set();
  for(const r of lr){const k=r[4]||r[3];if(!k||seenL.has(k))continue;seenL.add(k);if(seenL.size>4)break;const ds=[...(LEDK_DAYS[k]||[])].filter(x=>x!=d);if(ds.length)T.push({type:'l',key:'l|'+k,label:k,dates:ds})}
  const seenC=new Set();for(const r of (CARDD[d]||[])){if(seenC.has(r[2]))continue;seenC.add(r[2]);if(seenC.size>2)break;const ds=[...(CARDC_DAYS[r[2]]||[])].filter(x=>x!=d);if(ds.length)T.push({type:'c',key:'c|'+r[2],label:catName(r[2]),dates:ds})}
  const md=d.slice(5),oth=[];for(let y=2013;y<=2024;y++){const k=y+'-'+md;if(k!=d&&(D.days[k]||LEDD[k]||CARDD[k]))oth.push(k)}
  if(oth.length)T.push({type:'t',key:'t|same',label:'Same date, other years',dates:oth});
  return T;
}
const TC={s:'#3b4ae0',l:'#d02a52',c:'#0a8666',t:'#7b80a6'},TCV={s:'var(--song)',l:'var(--ledger)',c:'var(--card)',t:'var(--text-2)'};
function renderThreadChips(){
  const el=$('#threadChips');
  if(!S.threads.length){el.innerHTML='<p class="hint">No other days share anything with this one.</p>';return}
  el.innerHTML=S.threads.map((t,i)=>`<button class="tchip" type="button" data-ti="${i}" aria-pressed="${i==S.thIdx}"><i style="background:${TCV[t.type]}"></i>${esc(t.label).slice(0,26)} (${fmt(t.dates.length)})</button>`).join('');
}
const pick=(a,n)=>{if(a.length<=n)return a;const o=[];for(let i=0;i<n;i++)o.push(a[Math.floor(i*a.length/n)]);return o};
function drawThreads(){
  const box=$('#threadSvg');if(!box||!S.day)return;
  const W=Math.max(280,box.clientWidth||440),H=230,base=176,t0=Date.UTC(2013,6,8),t1=Date.UTC(2024,11,15);
  const X=s=>12+(Date.parse(s+'T00:00:00Z')-t0)/(t1-t0)*(W-24),x0=X(S.day);
  let s=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Days connected to ${S.day}">`;
  s+=`<line x1="10" x2="${W-10}" y1="${base}" y2="${base}" stroke="#171833"/>`;
  for(let y=2014;y<=2024;y+=(W<420?2:1)){const x=X(y+'-01-01');s+=`<line x1="${x}" x2="${x}" y1="${base}" y2="${base+5}" stroke="#666b8d"/><text x="${x-11}" y="${base+18}" font-family="Geist Mono,monospace" font-size="10" fill="#666b8d">${y}</text>`}
  S.thHit=[];
  const arc=(x1,col,op,w)=>{const hgt=Math.min(base-24,18+Math.abs(x1-x0)*.5);return`<path d="M${x0} ${base} Q${(x0+x1)/2} ${base-hgt*2} ${x1} ${base}" fill="none" stroke="${col}" stroke-width="${w}" opacity="${op}"/>`};
  S.threads.forEach((t,i)=>{if(i==S.thIdx)return;pick(t.dates,18).forEach(d=>{s+=arc(X(d),TC[t.type],.10,1)})});
  const A=S.threads[S.thIdx];
  if(A){const ds=pick(A.dates,110);ds.forEach(d=>{s+=arc(X(d),TC[A.type],.34,1.3)});ds.forEach(d=>{const x=X(d);S.thHit.push({x,d});s+=`<circle cx="${x}" cy="${base}" r="3.2" fill="${TC[A.type]}"/>`})}
  s+=`<circle cx="${x0}" cy="${base}" r="7" fill="#ffd21f" stroke="#171833" stroke-width="2"/></svg>`;
  box.innerHTML=s;
}
$('#threadChips').addEventListener('click',e=>{const b=e.target.closest('[data-ti]');if(!b)return;S.thIdx=+b.dataset.ti;renderThreadChips();drawThreads()});
$('#threadSvg').addEventListener('click',e=>{
  const r=e.currentTarget.getBoundingClientRect(),x=(e.clientX-r.left)*(r.width?((Math.max(280,e.currentTarget.clientWidth))/r.width):1);
  let best=null,bd=14;S.thHit.forEach(h=>{const dd=Math.abs(h.x-x);if(dd<bd){bd=dd;best=h}});if(best)openDay(best.d,false,true)
});
document.addEventListener('click',e=>{
  const th=e.target.closest('[data-th]');
  if(th){const i=S.threads.findIndex(t=>t.key==th.dataset.th.replace(/&amp;/g,'&'));if(i>=0){S.thIdx=i;renderThreadChips();drawThreads();$('#threadSvg').scrollIntoView({block:'nearest'})}return}
  const p=e.target.closest('.play');
  if(p){$$('.embed').forEach(x=>x.innerHTML='');$$('.play').forEach(x=>x.textContent='Play');const slot=p.closest('.songrow').querySelector('.embed');
    slot.innerHTML=`<iframe src="https://open.spotify.com/embed/track/${p.dataset.uri}?theme=0" allow="autoplay; encrypted-media" loading="lazy" title="Spotify player"></iframe>`;p.textContent='Playing'}
});
function openDay(d,scroll,keepScroll){
  if(d<'2013-07-08')d='2013-07-08';if(d>'2024-12-15')d='2024-12-15';
  S.day=d;$('#dayPick').value=d;$('#dayReceipt').innerHTML=dayReceipt(d);
  S.threads=threadsFor(d);S.thIdx=0;renderThreadChips();drawThreads();
  if(!reduce){const p=$('#dayPaper');p.classList.remove('tear');void p.offsetWidth;p.classList.add('tear')}
  if(scroll)$('#day').scrollIntoView();
}
const shiftDay=n=>{const t=new Date(S.day+'T00:00:00Z');t.setUTCDate(t.getUTCDate()+n);openDay(t.toISOString().slice(0,10))};
const rnd=()=>openDay(richDays[Math.floor(Math.random()*richDays.length)],true);
$('#dayPick').addEventListener('change',e=>e.target.value&&openDay(e.target.value));
$('#prevDay').onclick=()=>shiftDay(-1);$('#nextDay').onclick=()=>shiftDay(1);$('#rndDay').onclick=rnd;$('#heroRandom').onclick=rnd;
(function(){
  let sd='',sa=0;for(const d in LEDD){const a=LEDD[d].filter(r=>r[2]=='Expense').reduce((x,r)=>x+r[6],0);if(a>sa){sa=a;sd=d}}
  let cd='',ca=0;for(const d in CARDD){const a=CARDD[d].reduce((x,r)=>x+r[4],0);if(a>ca){ca=a;cd=d}}
  const M=[[D.meta.first,'The first play ever','A web player and a song by The Mowgli\'s'],['2016-11-01','Diwali 2016, no music at all','Firecrackers in the ledger, silence in the app'],
   [MAXD,`The ${fmt(MAXP)}-song day`,'Skipping through the catalogue for hours'],[sd,'The most expensive day in the ledger',inr(sa)+' out in one day'],
   ['2017-12-26','Fixed deposit day','\u20B92.5 lakh moved into savings'],[STREAK[2],'Last day of the 78-day streak','Not one day off since October'],[cd,'The biggest day on the card',inr(ca)+' across swipes']];
  $('#moments').innerHTML=M.map(([d,t,s])=>`<button class="moment" type="button" data-day="${d}"><b>${esc(t)}</b><span>${shortDay(d)}. ${esc(s)}</span></button>`).join('');
})();

// ---------- cases
const DAY=D.stats.day1816;
const CASES=[
 {t:'The silent festival',q:'Every Diwali the ledger shows firecrackers, gifts and offerings. In which year did the music nearly stop that week?',o:['2016','2017','2018'],a:0,
  c:['Look at the Festivals category in the ledger.','In that week, three separate days have one song or none.'],
  r:'Diwali 2016. On 1 Nov there are zero plays, and 31 Oct and 4 Nov have one each. In 2017 the same festival has 156 plays on one day. (Diwali 2018 falls after the ledger ends.)',act:['day','2016-11-01','Open 1 Nov 2016']},
 {t:'The 1,816-song day',q:`On one day in 2017 the app logs 1,816 plays in about four hours. What was going on?`,o:['Four people sharing an account','One song on repeat','Skipping through songs, hunting for one','A glitch that duplicated plays'],a:2,
  c:[`${DAY.fwd}% of those plays ended on the skip button.`,`The median play lasted ${DAY.medianSec} seconds, across ${DAY.artists} different artists.`],
  r:`Skipping. With ${DAY.fwd}% skip-ended plays under a second each, it looks like someone scrolling through the catalogue for one song, and ${DAY.beatles} of the plays are Beatles tracks.`,act:['day',MAXD,'Open 6 Sep 2017']},
 {t:'The one-lakh day',q:'\u20B91,01,594 leaves the ledger on New Year\'s Day 2017. What is most of it?',o:['A trip booking','A money transfer','Groceries','A fixed deposit'],a:1,
  c:['Seven entries that day. Six of them are small everyday items.','The big one has no note. Only a category.'],
  r:'A \u20B91,00,000 entry in the Money transfer category. The other six entries are groceries, medicine, a pizza and a doctor visit, adding up to \u20B91,594.',act:['day','2017-01-01','Open 1 Jan 2017']},
 {t:'Who took the crown?',q:'The Beatles are the top artist in most years. In which year did The Killers overtake them?',o:['2018','2019','2020','2021'],a:2,
  c:['It\'s the year with the most hours of listening.','It\'s also the year of the longest streak.'],
  r:`2020. The Killers get 2,054 plays to The Beatles' 1,951 in the year of the ${STREAK[0]}-day streak.`,act:['q','the killers','Show The Killers on the strip']},
 {t:'The patient listener',q:'In 2017, more than half of all songs ended with the skip button. By 2024, what share was it?',o:['About 5%','About 18%','About 35%','About 50%'],a:1,
  c:['It fell almost every year after 2017.','By 2024 the average play lasts nearly three minutes.'],
  r:`${YM[2024].fwd.toFixed(0)}% in 2024, down from ${YM[2017].fwd.toFixed(0)}% in 2017. The average play grew from ${YM[2017].avgMin.toFixed(1)} to ${YM[2024].avgMin.toFixed(1)} minutes.`,act:['zoom',3,'Zoom to the card era']},
 {t:'The explorer year',q:'Which year did they hear the most different artists?',o:['2017','2020','2021','2023'],a:2,
  c:['It follows two loyal years and a long streak.','Almost one in six plays that year was an artist they had never played before.'],
  r:`2021, with ${fmt(YM[2021].uniq)} different artists. 2020 had ${fmt(YM[2020].uniq)}.`,act:['zoom',2,'Zoom to the loud years']}
];
const solved=new Set();
function renderCases(){
  $('#caseFill').style.width=(solved.size/CASES.length*100)+'%';
  $('#caseProg').textContent=`Cases solved: ${solved.size} of ${CASES.length}`+(solved.size==CASES.length?'. Case closed. Detective badge unlocked on your receipt.':'');
  $('#caseGrid').innerHTML=CASES.map((c,i)=>{
    const done=solved.has(i);
    return `<div class="paper case" data-c="${i}">${done?'<div class="stamp ok">SOLVED</div>':''}<h3>Case ${i+1}: ${c.t}</h3><p class="q">${c.q}</p><div class="opts">${c.o.map((o,k)=>`<button class="opt${done&&k==c.a?' good':''}" type="button" data-k="${k}" ${done?'disabled':''}>${esc(o)}</button>`).join('')}</div>
    <div class="clues">${c.c.map((x,k)=>`<button class="clue" type="button" data-clue="${k}">Clue ${k+1}</button>`).join('')}</div><div class="cluebox"></div>
    ${done?`<p class="solved-note">${c.r}</p><button class="pbtn" type="button" ${c.act[0]=='day'?`data-day="${c.act[1]}"`:c.act[0]=='q'?`data-q="${c.act[1]}"`:`data-zoom="${c.act[1]}"`}>${c.act[2]}</button>`:''}</div>`}).join('');
}
$('#caseGrid').addEventListener('click',e=>{
  const card=e.target.closest('.case');if(!card)return;const i=+card.dataset.c,c=CASES[i];
  const cl=e.target.closest('[data-clue]');if(cl){card.querySelector('.cluebox').innerHTML=`<div class="cluetext">Clue ${+cl.dataset.clue+1}: ${c.c[+cl.dataset.clue]}</div>`;return}
  const o=e.target.closest('.opt');if(!o||o.disabled)return;
  if(+o.dataset.k==c.a){solved.add(i);const y=window.scrollY;renderCases();updateReceipt();}
  else{o.classList.add('bad');const cb=card.querySelector('.cluebox');cb.innerHTML='<div class="cluetext">Not quite. Try a clue, or check the strip.</div>'}
});

// ---------- share receipt
let receiptBlob=null;
function receiptLines(){
  const m=D.meta;
  return[['c','YOUR LIFE, IN RECEIPTS','title'],['c','Printed '+new Date().toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'}),'sub'],['hr'],
   ['r','Songs played',fmt(m.plays)],['r','Ledger entries',fmt(m.ledger)],['r','Card swipes',fmt(m.card)],['hr'],
   ['r','Most played','The Beatles'],['r','Loudest year','2020 ('+fmt(yr(2020)[1])+' h)'],['r','Longest streak',STREAK[0]+' days'],['r','Skip share 2017 to 2024',YM[2017].fwd.toFixed(0)+'% to '+YM[2024].fwd.toFixed(0)+'%'],['hr'],
   ['r','2013 to 2014','The Sampler'],['r','2015 to 2018','The Builder'],['r','2018 to 2022','The Loyalist'],['r','2022 to 2024','The Finisher'],['hr'],
   ['r','Cases solved',solved.size+' of '+CASES.length+(solved.size==CASES.length?'  DETECTIVE':'')],['hr'],
   ['r','TOTAL MOMENTS',fmt(m.plays+m.ledger+m.card),'bold'],['c','Thank you. Keep this receipt.','sub']];
}
async function updateReceipt(){
  try{if(document.fonts&&document.fonts.ready)await document.fonts.ready}catch(e){}
  const L=receiptLines(),sc=2,W=560,pad=36,lh=32,H=pad*2+L.length*lh+40;
  const c=document.createElement('canvas');c.width=W*sc;c.height=H*sc;const x=c.getContext('2d');x.scale(sc,sc);
  x.fillStyle='#0a0c1d';x.fillRect(0,0,W,H);
  const px=24,pw=W-48,r=14;
  x.fillStyle='#f6f5fd';x.beginPath();x.moveTo(px+r,18);x.lineTo(px+pw-r,18);x.quadraticCurveTo(px+pw,18,px+pw,18+r);x.lineTo(px+pw,H-30);
  for(let i=0;i<=pw/14;i++){x.lineTo(px+pw-i*14,H-30+(i%2?0:10))}x.lineTo(px,H-30);x.lineTo(px,18+r);x.quadraticCurveTo(px,18,px+r,18);x.closePath();x.fill();
  const MONO='"Geist Mono","Courier New",monospace';let y=18+pad+8;
  L.forEach(l=>{
    if(l[0]=='hr'){x.strokeStyle='#c5c8de';x.setLineDash([6,5]);x.lineWidth=1.5;x.beginPath();x.moveTo(px+22,y-10);x.lineTo(px+pw-22,y-10);x.stroke();x.setLineDash([])}
    else if(l[0]=='c'){x.fillStyle=l[2]=='title'?'#171833':'#666b8d';x.font=l[2]=='title'?'800 25px "Bricolage Grotesque",system-ui,sans-serif':`14px ${MONO}`;x.textAlign='center';x.fillText(l[1],W/2,y+(l[2]=='title'?4:0))}
    else{x.fillStyle='#171833';x.font=`${l[3]=='bold'?'500':'400'} ${l[3]=='bold'?18:15}px ${MONO}`;x.textAlign='left';x.fillText(l[1],px+22,y);x.textAlign='right';x.fillText(l[2],px+pw-22,y)}
    y+=lh});
  if(solved.size){x.save();x.translate(W-110,64);x.rotate(-.2);x.strokeStyle='#0a8666';x.fillStyle='#0a8666';x.lineWidth=3;x.font='800 18px system-ui,sans-serif';x.textAlign='center';const t=solved.size==CASES.length?'CASE CLOSED':'DETECTIVE';const w=x.measureText(t).width+22;x.strokeRect(-w/2,-20,w,32);x.fillText(t,0,3);x.restore()}
  $('#receiptPreview').innerHTML=`<img alt="Your receipt summary" src="${c.toDataURL('image/png')}">`;
  c.toBlob(b=>{receiptBlob=b});
}
$('#dlReceipt').onclick=()=>{if(!receiptBlob)return;const a=document.createElement('a');a.href=URL.createObjectURL(receiptBlob);a.download='my-life-in-receipts.png';a.click()};
if(navigator.canShare){$('#shareReceipt').hidden=false;$('#shareReceipt').onclick=()=>{if(!receiptBlob)return;const f=new File([receiptBlob],'my-life-in-receipts.png',{type:'image/png'});if(navigator.canShare({files:[f]}))navigator.share({files:[f],title:'Your life, in receipts'}).catch(()=>{})}}
$('#cleanNote').textContent=`The card file has ${fmt(D.stats.cardRaw)} rows, but only ${fmt(D.stats.cardRaw-D.stats.cardDups)} are unique (the rest are exact copies). ${fmt(D.stats.cardRaw-D.stats.cardDups-D.stats.cardKept)} more have no date or amount, leaving ${fmt(D.stats.cardKept)}. Its fraud flag is set on about half of all rows regardless of amount, so I ignored it, along with the locations, which don't line up.`;

// ---------- polish: scrollspy, shortcuts
(function(){
  const nav=$('#links'),links=$$('a',nav),byId=new Map(links.map(a=>[a.getAttribute('href').slice(1),a]));
  function mark(id){
    const cur=byId.get(id);if(!cur)return;
    links.forEach(a=>a.removeAttribute('aria-current'));cur.setAttribute('aria-current','true');
    const l=cur.offsetLeft-(nav.clientWidth-cur.offsetWidth)/2;
    if(nav.scrollWidth>nav.clientWidth)nav.scrollTo({left:l,behavior:reduce?'auto':'smooth'});
  }
  if('IntersectionObserver' in window){
    const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)mark(e.target.id)}),{rootMargin:'-45% 0px -50% 0px',threshold:0});
    byId.forEach((_,id)=>{const s=document.getElementById(id);if(s)io.observe(s)});
  }
  addEventListener('keydown',e=>{
    if(e.key!=='/'||e.metaKey||e.ctrlKey||e.altKey)return;
    if(/^(input|textarea|select)$/i.test(document.activeElement.tagName))return;
    e.preventDefault();$('#q').focus();
  });
})();

// ---------- init
drawStrip();renderMonth();renderResults();drawTaste();renderCases();updateReceipt();openDay('2017-09-06');
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(()=>{drawStrip();drawStory();drawTaste();updateReceipt()});
})();
  const ls=document.getElementById("loadState");if(ls)ls.remove();
}

function showError(msg){const ls=document.getElementById("loadState");if(ls){ls.className="err";ls.textContent=msg}}

fetch("data/data.json")
  .then(r=>{if(!r.ok)throw new Error("HTTP "+r.status);return r.json()})
  .then(D=>{try{boot(D)}catch(e){console.error(e);showError("Something went wrong while drawing the page.")}},
        e=>{console.error(e);showError("Could not load data/data.json. If you opened this file directly, serve the folder over http (for example: python3 -m http.server) or use the GitHub Pages link.")});
