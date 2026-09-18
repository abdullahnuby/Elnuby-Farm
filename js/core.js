/* ============ الحسابات والخريطة والمكونات ============ */
const BIDS=()=>Object.keys(S.blocks);
const tot=f=>BIDS().reduce((a,k)=>a+f(S.blocks[k],k),0);
const expY=id=>Math.round(S.blocks[id].palms*S.blocks[id].kgp);
const TOT={palms:tot(b=>b.palms),prod:tot(b=>b.prod),act:tot(b=>b.act),exp:tot((b,id)=>expY(id))};
const irrState=id=>{const b=S.blocks[id],since=-dd(b.lastIrr),dueIn=b.irrigInterval-since;
 if(since===0)return{k:'done',label:'تم اليوم',f:'#CFE4DC',s:'#2C7A8C'};
 if(dueIn<0)return{k:'late',label:`متأخر ${-dueIn} يوم`,f:'#F3D8D2',s:'#B3402E'};
 if(dueIn===0)return{k:'due',label:'مستحق اليوم',f:'#F6E7C4',s:'#A96A12'};
 return{k:'ok',label:'طبيعي',f:'#EFEADA',s:'#A8A28D'}};
const fertState=id=>{const b=S.blocks[id],dueIn=b.fertInterval+dd(b.lastFert);
 if(dueIn<0)return{k:'late',label:`متأخر ${-dueIn} يوم`,f:'#F3D8D2',s:'#B3402E'};
 if(dueIn===0)return{k:'due',label:'مستحق اليوم',f:'#F6E7C4',s:'#A96A12'};
 return{k:'ok',label:'طبيعي',f:'#D9E8D6',s:'#2F5D3B'}};
const layerColor=(id,layer)=>{
 if(layer==='fert'){const s=fertState(id);return{f:s.f,s:s.s}}
 if(layer==='yield'){const t=Math.min(1,Math.max(0,(S.blocks[id].kgp-7.5)/3.5));return{f:mix('#EFEADA','#1E4128',t*.78),s:mix('#A8A28D','#1E4128',t)}}
 const s=irrState(id);return{f:s.f,s:s.s}};
const invBy=c=>S.inventory.find(i=>i.code===c);
const sectorName=id=>S.sectors.find(s=>s.id===id).name;
const salesRevSeed=()=>S.sales.a*S.sales.pA+S.sales.b*S.sales.pB+S.sales.c*S.sales.pC;
const soldKgSeed=()=>S.sales.a+S.sales.b+S.sales.c;
const salTot=d=>d.items.reduce((a,i)=>a+i.qty*i.price,0);
const openWOs=()=>S.maints.filter(w=>w.status==='open');
function getAlerts(){
 const A=[];
 S.inventory.forEach(it=>{
  if(it.qty<it.min)A.push({s:'red',t:`${it.name} أقل من الحد الأدنى — المتاح ${fmt(it.qty)} ${it.unit} من ${fmt(it.min)}`,go:'inventory'});
  else if(it.cover&&it.cover<=10)A.push({s:'amber',t:`${it.name} يكفي نحو ${it.cover} أيام فقط بمعدل الاستهلاك الحالي`,go:'inventory'});
  if(it.exp&&dd(it.exp)<=30)A.push({s:'red',t:`${it.name} تنتهي صلاحيته ${rel(it.exp)}`,go:'inventory'});});
 const lateI=[],dueI=[];
 BIDS().forEach(id=>{const st=irrState(id);if(st.k==='late')lateI.push(id);else if(st.k==='due')dueI.push(id)});
 lateI.forEach(id=>A.push({s:'red',t:`Block ${id} لم يُروَ منذ ${-dd(S.blocks[id].lastIrr)} أيام (فترة الري ${S.blocks[id].irrigInterval})`,go:'irrigation'}));
 if(dueI.length)A.push({s:'amber',t:`مستحق ري اليوم: ${dueI.join('، ')}`,go:'irrigation'});
 const fB=BIDS().filter(id=>['late','due'].includes(fertState(id).k));
 if(fB.length){const p=fB.reduce((a,id)=>a+S.blocks[id].palms,0);A.push({s:'amber',t:`${fmt(p)} نخلة مستحقة للتسميد (${fB.join('، ')})`,go:'fertilizer'})}
 openWOs().forEach(w=>A.push({s:'amber',t:`أمر عمل مفتوح: ${w.desc}`,go:'assets'}));
 S.visits.forEach(v=>v.recs.filter(r=>!r.done).forEach(r=>A.push({s:'amber',t:`توصية استشاري لم تُنفذ: ${r.text}`,go:'visits'})));
 S.purch.filter(p=>p.stage===4).forEach(p=>A.push({s:'info',t:`فاتورة مورد بانتظار السداد: ${p.id} — ${SAR(salTot(p))}`,go:'purchasing'}));
 const v=S.visits[0];if(v&&dd(v.date)===1)A.push({s:'info',t:`زيارة استشاري غدًا — ${v.person}`,go:'visits'});
 S.inventory.filter(i=>i.cat==='produce'&&i.age>=10).forEach(i=>A.push({s:'amber',t:`${i.name} بالمخزن منذ ${i.age} يومًا`,go:'inventory'}));
 const dn=S.tasks.filter(t=>t.status==='done'&&t.doneAt===todayISO).length;
 if(dn)A.push({s:'green',t:`أُنجزت ${dn} مهام اليوم`,go:'tasks'});
 const ord={red:0,amber:1,info:2,green:3};
 return A.sort((a,b)=>ord[a.s]-ord[b.s]);
}
function palmData(bid,row,idx){
 const id=`${bid}-R${pad(row)}-P${String(idx).padStart(3,'0')}`;
 let h=0;for(const c of id)h=(h*31+c.charCodeAt(0))%997;
 const r=h%100,b=S.blocks[bid];
 const o={id,block:bid,row,planted:b.planted,st:'ok',bunches:9+(h%4),yield:Math.round((8.5+(h%50)/10)*10)/10,weight:20+(h%6),note:'—'};
 if(r>=96){o.st='pest';o.bunches=4+(h%3);o.yield=Math.round((3+(h%20)/10)*10)/10;o.note='إصابة عناكب حمراء — ضمن خطة الرش'}
 else if(r>=91){o.st='unprod';o.bunches=0;o.yield=0;o.note='نخلة خدمة — غير مثمرة هذا الموسم'}
 else if(r>=83){o.st='watch';o.bunches=6+(h%3);o.yield=Math.round((5+(h%30)/10)*10)/10;o.note='نمو ضعيف — مرشحة لفحص تربة'}
 return o;
}
const rowsOf=id=>{const b=S.blocks[id],base=Math.floor(b.palms/b.rows),ex=b.palms%b.rows;
 return Array.from({length:b.rows},(_,i)=>i+1).map(r=>({r,count:base+(r<=ex?1:0)}))};
const MAPBOX={A01:[76,132,364,155],A02:[76,301,364,155],A03:[76,470,364,150],B01:[456,132,300,155],B02:[456,301,300,155],B03:[456,470,300,150],C01:[772,132,304,240],C02:[772,386,304,234]};
const SECT=[{label:'القطاع الأوسط',x1:76,x2:440},{label:'القطاع الشمالي',x1:456,x2:756},{label:'القطاع الجنوبي',x1:772,x2:1076}];
function mapSVG(layer){
 const blocks=BIDS().map(id=>{
  const[x,y,w,h]=MAPBOX[id],c=layerColor(id,layer);
  let rows='';for(let ry=y+42;ry<=y+h-26;ry+=22)rows+=`<line class="prow" x1="${x+30}" x2="${x+w-30}" y1="${ry}" y2="${ry}"/>`;
  return`<g class="bk" data-bk="${id}"><rect class="bgc" x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="${c.f}"/><rect class="frame" x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="none" stroke="${c.s}" stroke-width="1.6"/>${rows}<text class="bid" x="${x+16}" y="${y+25}">${id}</text><text class="bcount" x="${x+w-16}" y="${y+25}">${fmt(S.blocks[id].palms)} نخلة</text></g>`;
 }).join('');
 const sec=SECT.map(s=>`<text class="slbl" x="${(s.x1+s.x2)/2}" y="118" text-anchor="middle">${s.label}</text>`).join('');
 return`<svg viewBox="0 0 1120 714" class="mapv" preserveAspectRatio="xMidYMid meet">
  <rect x="14" y="58" width="1092" height="650" rx="12" fill="none" stroke="#C2BBA2" stroke-dasharray="7 6" stroke-width="1.4"/>
  <text class="mtitle" x="1104" y="42" text-anchor="start">${S.farm.name} — ${S.farm.area} فدان · ${fmt(TOT.palms)} نخلة</text>
  <g transform="translate(26,46)"><path d="M0 12V-8" stroke="#5A6A56" stroke-width="1.6"/><path d="M-4 0L0 -9L4 0" fill="none" stroke="#5A6A56" stroke-width="1.6"/><text class="msub" y="30" text-anchor="middle">شمال</text></g>
  <rect x="46" y="90" width="1030" height="578" rx="14" fill="none" stroke="#E6DEC6" stroke-width="16"/>
  <rect x="46" y="90" width="1030" height="578" rx="14" fill="none" stroke="#CDBA6F" stroke-width="1.6" stroke-dasharray="10 9"/>
  <path class="wline" d="M110 84 V104 H940 M448 104 V640 M764 104 V640"/>${sec}
  <g transform="translate(110,74)"><circle r="7" fill="#D9E8EC" stroke="#2C7A8C" stroke-width="1.5"/><circle r="2.4" fill="#2C7A8C"/></g>
  <text class="wlbl" x="190" y="78" text-anchor="middle">بئر 1 · 90 م³/س</text>
  <g transform="translate(560,74)"><circle r="7" fill="#D9E8EC" stroke="#2C7A8C" stroke-width="1.5"/><circle r="2.4" fill="#2C7A8C"/></g>
  <text class="wlbl" x="645" y="78" text-anchor="middle">بئر 2 · 84 م³/س</text>
  <rect x="986" y="63" width="36" height="20" rx="3" fill="#D9E8EC" stroke="#2C7A8C" stroke-width="1.4"/>
  <text class="wlbl" x="925" y="77" text-anchor="middle">خزان 500 م³</text>
  ${blocks}
  <rect x="920" y="680" width="160" height="26" rx="4" fill="#EAE4D0" stroke="#BDB69F"/>
  <text class="mlbl" x="1000" y="697" text-anchor="middle">الإدارة والمخازن</text>
  <g transform="translate(70,692)"><path d="M0 0h100" stroke="#5A6A56" stroke-width="1.4"/><path d="M0 -3v6M100 -3v6" stroke="#5A6A56" stroke-width="1.4"/><text class="mlbl" x="50" y="16" text-anchor="middle">200 م</text></g>
 </svg>`;
}
function tipHTML(id){
 const b=S.blocks[id],i=irrState(id),n=pd(b.lastIrr);n.setDate(n.getDate()+b.irrigInterval);
 return`<span class="tt">Block ${id} — ${sectorName(b.sector)}</span><b>${fmt(b.palms)}</b> نخلة (<b>${fmt(b.prod)}</b> مثمر)<br>آخر ري: <b>${fd(b.lastIrr)}</b> (${i.label}) · القادم: <b>${rel(n.toISOString().slice(0,10))}</b><br>آخر تسميد: <b>${fd(b.lastFert)}</b><br>متوقع <b>${fmt(expY(id))}</b> كجم · فعلي <b>${fmt(b.act||0)}</b>`;
}
function card(title,icon,body,actions=''){
 return`<section class="card"><header class="ch"><div class="ch-t">${icon?ic(icon,16):''}<h2>${title}</h2></div>${actions?`<div class="ch-a">${actions}</div>`:''}</header><div class="cb">${body}</div></section>`;
}
const TICON={irrigation:'drop',fertilization:'leaf',maintenance:'wrench',harvest:'wheat',pruning:'sprout',spraying:'flask',visit:'users',inspection:'search'};
function execBtn(t){
 if(t.type==='irrigation')return`<button class="btn sm" onclick="App.openIrr('${t.block}')">تنفيذ الري</button>`;
 if(t.type==='fertilization')return`<button class="btn sm" onclick="App.openFert('${t.block}')">تنفيذ التسميد</button>`;
 if(t.type==='harvest')return`<button class="btn sm" onclick="App.openHarvest('${t.block}')">تسجيل الحصاد</button>`;
 return`<button class="btn sm ghost" onclick="App.finishTask('${t.id}')">إتمام</button>`;
}
function taskRow(t){
 const late=t.status!=='done'&&dd(t.planned)<0;
 const st=t.status==='done'?bdg('done','منجزة'):late?bdg('late',`متأخرة ${-dd(t.planned)} يوم`):dd(t.planned)===0?bdg('due','اليوم'):bdg('info',rel(t.planned));
 return`<div class="trow ${late?'late':''} ${t.status==='done'?'done':''}"><div class="ti">${ic(TICON[t.type]||'tasks',17)}</div>
 <div class="tmain"><b>${t.title}</b><div class="tmeta">${t.block?`<span class="chip">${t.block}</span>`:''}<span>${t.assign}</span><span>${t.id} · ${rel(t.planned)}</span><span class="pri ${t.priority}"></span></div></div>${st}${t.status!=='done'?execBtn(t):''}</div>`;
}
function alertsHTML(list){return list.map(a=>`<div class="al s-${a.s}" onclick="App.go('${a.go}')">${a.t}<span class="al-go">انتقال ${ic('chev',11)}</span></div>`).join('')||'<div class="hint">لا تنبيهات حاليًا</div>'}
function modal(title,body,foot){
 $('#modal-root').innerHTML=`<div class="ov" onclick="if(event.target===this)App.closeModal()"><div class="md">
 <header><h3>${title}</h3><button class="ibtn" onclick="App.closeModal()">${ic('x',15)}</button></header>
 <div class="mdb">${body}</div><footer>${foot}</footer></div></div>`;
}
function toast(msg,type='ok'){
 const t=document.createElement('div');t.className='toast '+type;
 t.innerHTML=`${ic('check',15)}<span>${msg}</span>`;
 $('#toasts').appendChild(t);
 setTimeout(()=>{t.classList.add('out');setTimeout(()=>t.remove(),320)},3800);
}
const PUR_ST=['طلب شراء','عرض سعر','أمر شراء','استلام مخزني','فاتورة مورد','سداد'];
const SAL_ST=['طلب عميل','تخصيص مخزون','تعبئة وتغليف','تسليم','فاتورة','تحصيل'];
function pipe(stages,cur){
 return`<div class="pipe">${stages.map((s,i)=>`<div class="pstep ${i<cur?'done':i===cur?'cur':''}"><div class="pc">${i<cur?'✓':i+1}</div><span>${s}</span></div>`).join('')}</div>`;
}
function costTot(){
 const op=t=>S.operations.filter(o=>o.type===t).reduce((a,o)=>a+o.cost,0);
 return S.costs.fert+op('تسميد')+S.costs.pest+op('رش ومكافحة')+S.costs.labor+op('خف الثمار')+op('تقليم')+op('حصاد')+op('تلقيح')+op('تكريب')+op('تغطية العذوق')+S.costs.maint+S.maints.reduce((a,w)=>a+w.cost,0)+S.costs.fuel+S.costs.pack+S.costs.admin;
}