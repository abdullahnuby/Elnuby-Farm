function renderLogin(){
 $('#login').style.display='flex';
 $('#app').classList.remove('on');
 const rows=[];for(let y=40;y<800;y+=46)rows.push(`<line x1="0" x2="1200" y1="${y}" y2="${y}"/>`);
 $('#login').innerHTML=`
 <svg class="rbg" viewBox="0 0 1200 800" preserveAspectRatio="xMidYMid slice">
  ${rows.map(l=>l.replace('<line','<line stroke="rgba(143,211,160,.10)" stroke-width="4" stroke-dasharray="0.1 34" stroke-linecap="round"')).join('')}
 </svg>
 <div class="lg">
  <div class="logo">${ic('palm',44)}</div>
  <h1>المجدول</h1>
  <div class="sub">نظام إدارة مزرعة نخيل التمر — نسخة سطح المكتب v2.0</div>
  <div class="lg-err" id="lgerr"></div>
  <label>المستخدم<select id="lgu">${S.users.filter(u=>u.active!==0).map(u=>`<option value="${u.u}">${u.name} — ${ROLES[u.role].label}</option>`).join('')}</select></label>
  <label>كلمة المرور<input type="password" id="lgp" placeholder="••••" onkeydown="if(event.key==='Enter')App.login()"></label>
  <button class="btn" style="width:100%;justify-content:center;padding:11px" onclick="App.login()">${ic('chev',14)} تسجيل الدخول</button>
  <div class="lg-hint">بيانات دخول العرض — اسم المستخدم كما هو ظاهر، وكلمة المرور <b>1234</b> لجميع الحسابات.</div>
 </div>`;
}
function renderDashboard(){
 const irrToday=S.irrigationLog.filter(l=>l.date===todayISO);
 const att=S.attendance[todayISO]||{};
 const tasksNow=S.tasks.filter(t=>t.status!=='done'&&dd(t.planned)<=0).sort((a,b)=>dd(a.planned)-dd(b.planned));
 const al=getAlerts();
 const crit=S.inventory.filter(i=>(i.qty<i.min)||(i.cover&&i.cover<=10)||(i.exp&&dd(i.exp)<=30)).slice(0,5);
 const v=S.visits[0];
 const recs=S.visits.flatMap(x=>x.recs).filter(r=>!r.done);
 const pulse=`
  <div class="pk"><span>المساحة</span><b>${S.farm.area}</b><small>فدان · 3 قطاعات · 8 بلوكات</small></div>
  <div class="pk"><span>إجمالي النخيل</span><b>${fmt(TOT.palms)}</b><small>مثمر ${fmt(TOT.prod)} (${Math.round(TOT.prod/TOT.palms*100)}%)</small></div>
  <div class="pk"><span>إنتاج الموسم</span><b>${fmt(TOT.act)}</b><small>كجم من متوقع ${fmt(TOT.exp)}</small></div>
  <div class="pk"><span>إنتاجية النخلة</span><b>${(TOT.act/TOT.prod).toFixed(1)}</b><small>كجم/نخلة مثمرة</small></div>
  <div class="pk"><span>مبيعات الموسم</span><b>${fmt(salesRevSeed())}</b><small>ريال · متوسط ${(salesRevSeed()/soldKgSeed()).toFixed(1)}</small></div>
  <div class="pk"><span>تكلفة الكيلو</span><b>${(costTot()/TOT.act).toFixed(2)}</b><small>ريال/كجم</small></div>`;
 return`<section class="card pulse">${pulse}</section>
 <div class="dash">
  <div class="col">
   ${card('خريطة المزرعة — حالة الري اليوم','map',`<div class="map-wrap sm">${mapSVG('irrigation')}</div>`,`<button class="btn sm ghost" onclick="App.go('map')">${ic('map',13)} الخريطة الكاملة</button>`)}
   ${card('أعمال اليوم والمتأخرة','tasks',tasksNow.slice(0,6).map(taskRow).join('')||'<div class="hint">لا مهام مستحقة اليوم</div>',`<button class="btn sm ghost" onclick="App.go('tasks')">كل المهام</button>`)}
  </div>
  <div class="col">
   ${card('التنبيهات','bell',alertsHTML(al.slice(0,10)))}
   ${card('الحضور اليوم','users',`<div class="mini2">
    <div><b class="num">${Object.values(att).filter(x=>x==='present').length}</b><span>حاضر</span></div>
    <div><b class="num">${Object.values(att).filter(x=>x==='absent').length}</b><span>غائب</span></div>
    <div><b class="num">${Object.values(att).filter(x=>x==='leave').length}</b><span>إجازة</span></div>
    <div><b class="num">${S.employees.length}</b><span>إجمالي العاملين</span></div>
   </div>`,can('employees')?`<button class="btn sm ghost" onclick="App.go('employees')">التسجيل</button>`:'')}
   ${card('المخزون الحرج','box',crit.map(i=>`<div class="mv" style="cursor:pointer" onclick="App.go('inventory')"><span class="sdot" style="background:${i.qty<i.min?'#B3402E':'#C08A1E'}"></span>${i.name}<span style="margin-inline-start:auto" class="num">${fmt(i.qty)} ${i.unit}</span></div>`).join('')||'<div class="hint">المخزون بحالة جيدة</div>')}
   ${card('الصيانة المفتوحة','wrench',openWOs().map(w=>`<div class="mv" style="cursor:pointer" onclick="App.go('assets')"><span class="dir out">${w.id}</span>${w.desc}<span style="margin-inline-start:auto" class="num">${rel(w.opened)}</span></div>`).join('')||'<div class="hint">لا أوامر عمل مفتوحة</div>')}
   ${(v||recs.length)?card('الزيارات والتوصيات','users',
    (v&&dd(v.date)>=0?`<div class="mv"><span class="dir in">قادمة</span>${rel(v.date)} — ${v.person}<br><small style="color:var(--ink3)">${v.purpose}</small></div>`:'')+
    (recs.length?`<div class="mv"><span class="dir out">توصية</span>${recs[0].text}<button class="btn sm" style="margin-inline-start:auto" onclick="App.openFert('${recs[0].block}')">تنفيذ</button></div>`:'')):''}
  </div>
 </div>`;
}
function renderMap(){
 const layer=S.ui.mapLayer,sel=S.ui.sel;
 const seg=`<div class="seg">${[['irrigation','حالة الري'],['fert','حالة التسميد'],['yield','الإنتاجية المتوقعة']].map(([k,l])=>`<button class="${layer===k?'on':''}" onclick="App.setLayer('${k}')">${l}</button>`).join('')}</div>`;
 const legend=`<div class="lgnd">${(layer==='yield'?[['#EFEADA','أقل'],['#B9CDAF','متوسطة'],['#1E4128','أعلى']]:layer==='fert'?[['#D9E8D6','منجز حديثًا'],['#F6E7C4','مستحق'],['#F3D8D2','متأخر'],['#EFEADA','طبيعي']]:[['#CFE4DC','تم اليوم'],['#F6E7C4','مستحق'],['#F3D8D2','متأخر'],['#EFEADA','مجدول']]).map(([c,l])=>`<span><i style="background:${c}"></i>${l}</span>`).join('')}</div>`;
 return`<div class="ph"><div><h1>الخريطة الحية</h1><p>مخطط تشغيلي — اضغط أي بلوك لفتح ملفه وتنفيذ الإجراءات</p></div></div>
 <div class="map-grid">
  <section class="card"><header class="ch">${seg}${legend}</header><div class="map-wrap tall">${mapSVG(layer)}</div></section>
  <div class="col">${sel?mapDetail(sel):card('تفاصيل البلوك','map',`<div class="hint" style="padding:42px 16px">لم يتم تحديد بلوك<br>اضغط على أي بلوك في الخريطة</div>${legend}`)}</div>
 </div>`;
}
function mapDetail(id){
 const b=S.blocks[id],i=irrState(id),f=fertState(id);
 const n=pd(b.lastIrr);n.setDate(n.getDate()+b.irrigInterval);
 const soil=S.soil.filter(s=>s.block===id)[0];
 return card('Block '+id,'map',`
  <div class="bhead" style="margin-bottom:10px"><div><span class="bid-big">${id}</span><div class="bsector">${sectorName(b.sector)} · غراسة ${b.planted} · ${b.area} فدان</div></div>
  <div class="bbs">${bdg(i.k==='done'?'water':i.k==='due'?'due':i.k==='late'?'late':'ok','الري: '+i.label)}${bdg(f.k==='late'?'late':f.k==='due'?'due':'ok','التسميد: '+f.label)}</div></div>
  <dl class="kv">
   <div><dt>النخيل</dt><dd>${fmt(b.palms)} <em>(${fmt(b.prod)} مثمر)</em></dd></div>
   <div><dt>الصفوف</dt><dd>${b.rows} صفوف · ${b.spacing}</dd></div>
   <div><dt>آخر ري / القادم</dt><dd>${fd(b.lastIrr)} → ${rel(n.toISOString().slice(0,10))}</dd></div>
   <div><dt>آخر تسميد</dt><dd>${fd(b.lastFert)} <em>(${f.label})</em></dd></div>
   <div><dt>آخر تحليل تربة</dt><dd>${soil?`pH ${soil.ph} · EC ${soil.ec}`:'—'}</dd></div>
   <div><dt>الإنتاج متوقع/فعلي</dt><dd>${fmt(expY(id))} / ${b.act?fmt(b.act):'—'} كجم</dd></div>
  </dl>
  <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px">
   <button class="btn sm" onclick="App.openIrr('${id}')">${ic('drop',13)} تسجيل ري</button>
   <button class="btn sm ghost" onclick="App.openFert('${id}')">${ic('leaf',13)} تسجيل تسميد</button>
   <button class="btn sm ghost" onclick="App.selBlk('${id}')">${ic('palm',13)} ملف البلوك</button>
  </div>`);
}
function renderStructure(){
 const t=S.ui.tree;
 const tree=S.sectors.map(sec=>{
  const bks=BIDS().filter(id=>S.blocks[id].sector===sec.id);
  const blocks=bks.map(id=>{
   const st=irrState(id);
   const rows=t.block===id?`<div class="trows">${rowsOf(id).map(r=>`<button class="trowbtn ${t.row===r.r?'on':''}" onclick="App.selRow(${r.r})">R${pad(r.r)} · ${r.count}</button>`).join('')}</div>`:'';
   return `<div class="tblk ${t.block===id?'on':''}" onclick="App.selBlk('${id}')"><span class="sdot" style="background:${st.s}"></span><span class="chip">${id}</span>${fmt(S.blocks[id].palms)} نخلة<span class="num">${st.label}</span></div>${rows}`;
  }).join('');
  return`<div class="tsec"><button>${ic('chev',13)}<b style="font-size:12px">${sec.name}</b><span>${bks.length} بلوك · ${fmt(bks.reduce((a,id)=>a+S.blocks[id].palms,0))} نخلة</span></button>
  ${blocks}
  </div>`;
 }).join('');
 return`<div class="ph"><div><h1>هيكل المزرعة</h1><p>${S.farm.name} — ${S.farm.area} فدان · ${fmt(TOT.palms)} نخلة · Medjool</p></div>
 <button class="btn ghost" onclick="App.go('map')">${ic('map',14)} عرض الخريطة</button></div>
 <div class="duo">
  <section class="card tree"><div class="cb flush" style="padding:4px 0">${tree}</div></section>
  <div class="col">${t.row&&t.block?rowPane(t.block,t.row):t.block?blockPane(t.block):farmPane()}</div>
 </div>`;
}
function farmPane(){
 return card('بيانات المزرعة','palm',`<dl class="kv">
  <div><dt>المالك</dt><dd>${S.farm.owner}</dd></div><div><dt>الموقع</dt><dd>${S.farm.location}</dd></div>
  <div><dt>المصدر المائي</dt><dd>${S.farm.water}</dd></div><div><dt>مصدر الكهرباء</dt><dd>${S.farm.power}</dd></div>
  <div><dt>نوع التربة</dt><dd>${S.farm.soil}</dd></div><div><dt>تأسيس الغراسة</dt><dd>${S.farm.established}</dd></div>
 </dl><p style="font-size:12px;color:var(--ink2);margin-top:12px">اختر بلوكًا لعرض تفاصيله وصفوفه — لكل نخلة معرّف مثل <span class="chip">A01-R05-P027</span></p>`);
}
const opRowM=o=>`<div class="mv"><span class="dir in">${o.type}</span>${fd(o.date)} — ${o.note}<span style="margin-inline-start:auto" class="num">${o.cost?fmt(o.cost)+' ر':'—'}</span></div>`;
function blockPane(id){
 const b=S.blocks[id],i=irrState(id),f=fertState(id);
 const n=pd(b.lastIrr);n.setDate(n.getDate()+b.irrigInterval);
 const pol=S.pollination.find(p=>p.block===id);
 return card(`Block ${id} — ${sectorName(b.sector)}`,'palm',`
  <div class="bbs" style="margin-bottom:12px">${bdg(i.k==='done'?'water':i.k==='due'?'due':i.k==='late'?'late':'ok','الري: '+i.label)}${bdg(f.k==='late'?'late':f.k==='due'?'due':'ok','التسميد: '+f.label)}${pol?bdg('info','آخر تلقيح: '+fd(pol.date)):''}</div>
  <dl class="kv">
   <div><dt>النخيل</dt><dd>${fmt(b.palms)} <em>(${fmt(b.prod)} مثمر · ${fmt(b.palms-b.prod)} خدمة)</em></dd></div>
   <div><dt>المساحة</dt><dd>${b.area} فدان · ${b.spacing}</dd></div>
   <div><dt>تاريخ الغراسة</dt><dd>موسم ${b.planted}</dd></div>
   <div><dt>الصفوف</dt><dd>${b.rows} صفوف</dd></div>
   <div><dt>آخر ري / القادم</dt><dd>${fd(b.lastIrr)} → ${rel(n.toISOString().slice(0,10))}</dd></div>
   <div><dt>آخر تسميد</dt><dd>${fd(b.lastFert)} <em>(كل ${b.fertInterval} يوم)</em></dd></div>
   <div><dt>تحليل التربة</dt><dd>pH ${b.ph} · EC ${b.ec} · OM ${b.om}%</dd></div>
   <div><dt>الإنتاج</dt><dd>${b.act?fmt(b.act)+' كجم فعلي':'—'} <em>من متوقع ${fmt(expY(id))}</em></dd></div>
  </dl>
  <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px">
   <button class="btn sm" onclick="App.openIrr('${id}')">${ic('drop',13)} تسجيل ري</button>
   <button class="btn sm ghost" onclick="App.openFert('${id}')">${ic('leaf',13)} تسجيل تسميد</button>
   <button class="btn sm ghost" onclick="App.openHarvest('${id}')">${ic('wheat',13)} تسجيل حصاد</button>
  </div>`,`<button class="btn sm ghost" onclick="App.go('map')">${ic('map',13)} الخريطة</button>`)
 +card(`سجل النخيل — ${b.rows} صفوف`,'tasks',`<div class="trows" style="padding:0">${rowsOf(id).map(r=>`<button class="trowbtn" onclick="App.selRow(${r.r})">الصف R${pad(r.r)} — ${r.count} نخلة</button>`).join('')}</div>`)
 +card('آخر العمليات على البلوك','sprout',S.operations.filter(o=>o.block===id).slice(0,4).map(opRowM).join('')||'<div class="hint">لا عمليات مسجلة</div>');
}
function rowPane(bid,row){
 const cnt=rowsOf(bid).find(r=>r.r===row).count;
 let rows='';
 for(let i=1;i<=cnt;i++){const p=palmData(bid,row,i);
  rows+=`<tr><td class="num"><a href="javascript:void 0" style="color:var(--green);font-weight:600" onclick="App.openPalm('${p.id}')">${p.id}</a></td>
  <td>${p.st==='ok'?bdg('ok','مثمرة — سليمة'):p.st==='watch'?bdg('due','تحتاج متابعة'):p.st==='unprod'?bdg('done','غير مثمرة'):bdg('late','إصابة آفة')}</td>
  <td class="num">${p.bunches}</td><td class="num">${p.yield}</td><td class="num">${p.weight} جم</td><td style="font-size:11.5px;color:var(--ink2)">${p.note}</td></tr>`;
 }
 return`<section class="card"><div class="cb">
  <div class="bhead"><div><span class="bid-big" style="font-size:20px">${bid} · R${pad(row)}</span><div class="bsector">${cnt} نخلة — الصف ${row} من ${S.blocks[bid].rows}</div></div>
  <button class="btn sm ghost" onclick="App.backToBlock()">${ic('chev',12)} عودة للبلوك</button></div>
  <div style="overflow:auto;max-height:520px"><table class="tbl mini"><thead><tr><th>رقم النخلة</th><th>الحالة</th><th>العذوق</th><th>إنتاج متوقع</th><th>وزن الثمرة</th><th>ملاحظات</th></tr></thead><tbody>${rows}</tbody></table></div>
 </div></section>`;
}
function renderPalm(){
 const id=S.ui.palm||'A01-R05-P027';
 const m=id.match(/^([A-C]\d{2})-R(\d{2})-P(\d{3})$/);
 if(!m||!S.blocks[m[1]])return'<div class="hint">رقم نخلة غير صالح</div>';
 const bid=m[1],row=+m[2],p=palmData(bid,row,+m[3]),b=S.blocks[bid];
 const engNotes=['متوسط حجم الثمار ضمن المستهدف — استمرار برنامج الري الحالي','يحتاج تقليم جريد في الدورة القادمة','نمو سعف جيد بعد برنامج البوتاسيوم الأخير','متابعة الإنتاج مع خف العذوق القادم'];
 return`<div class="ph"><div><h1>سجل النخلة</h1><p>الملف الفردي — أساس تتبع الإنتاج والمشاكل</p></div>
 <div style="display:flex;gap:8px">
  <button class="btn ghost sm" onclick="App.selBlk('${bid}')">${ic('palm',13)} في الهيكل</button>
  <button class="btn ghost sm" onclick="App.go('map')">${ic('map',13)} البلوك بالخريطة</button>
 </div></div>
 <section class="card"><div class="cb">
  <div class="bhead"><div><span class="bid-big">${p.id}</span><div class="bsector">${sectorName(b.sector)} · Block ${bid} · الصف R${pad(row)}</div></div>
  <div class="bbs">${p.st==='ok'?bdg('ok','مثمرة — سليمة'):p.st==='watch'?bdg('due','تحتاج متابعة'):p.st==='unprod'?bdg('done','غير مثمرة'):bdg('late','إصابة آفة')}${bdg('info','Medjool مجدول')}</div></div>
  <dl class="kv">
   <div><dt>تاريخ الزراعة</dt><dd>موسم ${p.planted} — عمر ${new Date().getFullYear()-p.planted} سنة</dd></div>
   <div><dt>مصدر الشتلة</dt><dd>مشتل المزرعة — فسائل معتمدة</dd></div>
   <div><dt>آخر ري (البلوك)</dt><dd>${fd(b.lastIrr)} <em>(${irrState(bid).label})</em></dd></div>
   <div><dt>آخر تسميد</dt><dd>${fd(b.lastFert)}</dd></div>
   <div><dt>عدد العذوق</dt><dd>${p.bunches} عذق</dd></div>
   <div><dt>الإنتاج المتوقع</dt><dd>${p.yield} كجم</dd></div>
   <div><dt>متوسط وزن الثمرة</dt><dd>${p.weight} جم</dd></div>
   <div><dt>مشاكل / آفات</dt><dd style="font-weight:500;font-size:12px">${p.note}</dd></div>
  </dl>
  <div style="margin-top:14px;padding:12px 14px;background:var(--soft);border-radius:10px;border:1px dashed var(--line)">
   <b style="font-size:11.5px;color:var(--ink2)">ملاحظة المهندس الزراعي</b>
   <p style="font-size:12.5px;margin-top:3px">${engNotes[(p.id.length*7)%engNotes.length]}</p>
  </div>
 </div></section>
 ${card('آخر العمليات على Block '+bid,'sprout',S.operations.filter(o=>o.block===bid).slice(0,3).map(opRowM).join('')||'<div class="hint">لا عمليات</div>')}`;
}
function renderIrrigation(){
 const rows=BIDS().map(id=>{
  const b=S.blocks[id],st=irrState(id),n=pd(b.lastIrr);n.setDate(n.getDate()+b.irrigInterval);
  const act=['due','late'].includes(st.k)?`<button class="btn sm" onclick="App.openIrr('${id}')">تنفيذ الري</button>`:st.k==='done'?bdg('water','تم اليوم'):'<span style="font-size:11.5px;color:var(--ink3)">مجدول</span>';
  return`<tr><td><span class="chip">${id}</span></td><td class="num">${fmt(b.palms)}</td><td class="num">كل ${b.irrigInterval} أيام</td><td class="num">${b.flow} م³/س</td><td>${fd(b.lastIrr)} <em style="color:var(--ink3)">(${rel(b.lastIrr)})</em></td><td>${rel(n.toISOString().slice(0,10))}</td><td>${st.k==='done'?bdg('water','تم'):st.k==='due'?bdg('due','مستحق'):st.k==='late'?bdg('late','متأخر'):bdg('done','مجدول')}</td><td>${act}</td></tr>`;
 }).join('');
 const logs=S.irrigationLog.slice(0,10).map(l=>`<tr><td class="num">${fd(l.date)}</td><td><span class="chip">${l.block}</span></td><td class="num">${l.start}</td><td class="num">${l.hours} س</td><td class="num"><b>${fmt(l.m3)}</b> م³</td><td style="font-size:11.5px">${l.src}</td><td style="font-size:11.5px">${l.by}</td></tr>`).join('');
 const infra=S.infra.map(i=>`<tr><td><b>${i.item}</b></td><td style="font-size:11.5px;color:var(--ink2)">${i.detail}</td><td>${i.pump}</td><td class="num">${typeof i.flow==='number'?i.flow+' م³/س':'—'}</td><td class="num">${typeof i.hours==='number'?fmt(i.hours)+' س':'—'}</td><td style="font-size:11.5px">${i.state}</td></tr>`).join('');
 return`<div class="ph"><div><h1>إدارة الري</h1><p>خطة وسجلات وشبكة — البلوك أساس الجدولة والتنفيذ</p></div></div>
 ${card('خطة الري وجدولة البلوكات','drop',`<div style="overflow:auto"><table class="tbl"><thead><tr><th>البلوك</th><th>النخيل</th><th>الفترة</th><th>التدفق</th><th>آخر ري</th><th>القادم</th><th>الحالة</th><th>إجراء</th></tr></thead><tbody>${rows}</tbody></table></div>`)}
 ${card('سجل الري','tasks',`<div style="overflow:auto"><table class="tbl"><thead><tr><th>التاريخ</th><th>البلوك</th><th>البداية</th><th>المدة</th><th>الكمية</th><th>المصدر</th><th>المسؤول</th></tr></thead><tbody>${logs}</tbody></table></div>`)}
 ${card('مصادر المياه والشبكة','wrench',`<div style="overflow:auto"><table class="tbl"><thead><tr><th>العنصر</th><th>الوصف</th><th>الطلمبة</th><th>التصرف</th><th>ساعات التشغيل</th><th>الحالة</th></tr></thead><tbody>${infra}</tbody></table></div>`)}`;
}
function renderFert(){
 const target=S.program.target,tp=target.reduce((a,id)=>a+S.blocks[id].palms,0);
 const rows=S.program.items.map(it=>{
  const inv=invBy(it.mat),need=Math.round(it.dose*tp),ok=inv.qty>=need;
  return`<tr><td><b>${inv.name}</b></td><td class="num">${it.dose} كجم/نخلة</td><td class="num">${fmt(tp)}</td><td class="num"><b>${fmt(need)}</b></td><td class="num">${fmt(inv.qty)}</td><td>${ok?bdg('ok','متاح'):bdg('late','عجز '+fmt(need-inv.qty))}</td></tr>`;
 }).join('');
 const deficit=S.program.items.reduce((a,it)=>a+Math.max(0,Math.round(it.dose*tp)-invBy(it.mat).qty),0);
 const bRows=BIDS().map(id=>{
  const b=S.blocks[id],st=fertState(id);
  return`<tr><td><span class="chip">${id}</span></td><td class="num">${fmt(b.palms)}</td><td>${fd(b.lastFert)} <em style="color:var(--ink3)">(${rel(b.lastFert)})</em></td><td class="num">كل ${b.fertInterval} يوم</td><td>${st.k==='late'?bdg('late','متأخر'):st.k==='due'?bdg('due','مستحق'):bdg('ok','طبيعي')}</td><td>${['late','due'].includes(st.k)?`<button class="btn sm" onclick="App.openFert('${id}')">تسجيل تسميد</button>`:'—'}</td></tr>`;
 }).join('');
 const hist=S.operations.filter(o=>o.type==='تسميد').slice(0,6).map(opRowM).join('')||'<div class="hint">لا سجلات</div>';
 const pr=S.purchaseReq.length?`<table class="tbl mini"><thead><tr><th>المادة</th><th>الكمية</th><th>قيمة تقديرية</th><th>الحالة</th></tr></thead><tbody>${S.purchaseReq.map(r=>`<tr><td>${r.name}</td><td class="num">${fmt(r.qty)} ${r.unit}</td><td class="num">${fmt(r.qty*r.price)} ريال</td><td>${bdg('info','بانتظار الاعتماد')}</td></tr>`).join('')}</tbody></table>`:'<div class="hint">لا طلبات مولدة بعد</div>';
 return`<div class="ph"><div><h1>إدارة التسميد</h1><p>برنامج الموسم · الاستحقاق بالبلوكات · الربط المباشر بالمخزون والمشتريات</p></div></div>
 ${card(S.program.name,'leaf',`<p class="mhint" style="margin:0 0 10px">البلوكات المستهدفة: ${target.map(t=>`<span class="chip">${t}</span>`).join(' ')} — إجمالي ${fmt(tp)} نخلة</p>
 <div style="overflow:auto"><table class="tbl"><thead><tr><th>المادة</th><th>الجرعة</th><th>النخيل</th><th>المطلوب</th><th>المتاح</th><th>الحالة</th></tr></thead><tbody>${rows}</tbody></table></div>`,
 deficit>0?`<button class="btn sm warn" onclick="App.genPR()">${ic('cart',13)} توليد طلب شراء للعجز (${fmt(deficit)} كجم)</button>`:'')}
 ${card('استحقاق التسميد بالبلوكات','tasks',`<div style="overflow:auto"><table class="tbl"><thead><tr><th>البلوك</th><th>النخيل</th><th>آخر تسميد</th><th>الفترة</th><th>الحالة</th><th>إجراء</th></tr></thead><tbody>${bRows}</tbody></table></div>`)}
 ${card('سجل التسميد','sprout',hist)}
 ${card('طلبات شراء مقترحة','box',pr)}`;
}
function renderSoil(){
 const t=S.ui.soilTab;
 const soilRows=S.soil.map((s,i)=>`<tr><td class="num">${fd(s.date)}</td><td><span class="chip">${s.block}</span></td><td class="num">${s.ph}</td><td class="num">${s.ec}</td><td class="num">${s.om}%</td><td class="num">${s.n}</td><td class="num">${s.p}</td><td class="num">${s.k}</td><td class="num">${s.na}</td><td class="num">${s.cl}</td><td style="font-size:11px">${s.lab}</td><td><button class="btn sm ghost" onclick="App.delRec('soil',${i})">حذف</button></td></tr>`).join('');
 const waterRows=S.water.map((w,i)=>`<tr><td class="num">${fd(w.date)}</td><td><b>${w.src}</b></td><td class="num">${w.ph}</td><td class="num">${w.ec}</td><td class="num">${fmt(w.tds)}</td><td class="num">${w.sar}</td><td class="num">${w.na}</td><td class="num">${w.cl}</td><td class="num">${w.hco3}</td><td style="font-size:11px">${w.lab}</td><td><button class="btn sm ghost" onclick="App.delRec('water',${i})">حذف</button></td></tr>`).join('');
 return`<div class="ph"><div><h1>تحليلات التربة والمياه</h1><p>نتائج المختبر لكل بلوك ومصدر — مرتبطة ببرامج التسميد والري</p></div>
 <button class="btn" onclick="App.openAnalysis()">${ic('flask',14)} تسجيل تحليل</button></div>
 <section class="card"><div class="tabs">
  <button class="${t==='soil'?'on':''}" onclick="App.setSoil('soil')">تحليلات التربة (${S.soil.length})</button>
  <button class="${t==='water'?'on':''}" onclick="App.setSoil('water')">تحليلات المياه (${S.water.length})</button>
 </div><div class="cb" style="overflow:auto">
 ${t==='soil'?`<table class="tbl mini"><thead><tr><th>التاريخ</th><th>البلوك</th><th>pH</th><th>EC</th><th>OM%</th><th>N</th><th>P</th><th>K</th><th>Na</th><th>Cl</th><th>المختبر</th><th></th></tr></thead><tbody>${soilRows}</tbody></table>`
 :`<table class="tbl mini"><thead><tr><th>التاريخ</th><th>المصدر</th><th>pH</th><th>EC</th><th>TDS</th><th>SAR</th><th>Na</th><th>Cl</th><th>HCO₃</th><th>المختبر</th><th></th></tr></thead><tbody>${waterRows}</tbody></table>`}
 </div></section>
 ${card('قراءة سريعة','flask',`<p style="font-size:12.5px;line-height:1.9">أعلى ملوحة تربة: <b>B03 — EC 4.6</b> → جودة مياه البئر 2 (EC 2.6) تتطلب غسيلًا موسميًا ومراقلة الجرعات. ترب القطاع C هي الأفضل بنسبة مادة عضوية 1.4% — الاستشاري أوصى بالتركيز على البوتاسيوم للبلوكات A03 و B03.</p>`)}`;
}
function renderPollination(){
 const rows=S.pollination.map(p=>`<tr><td class="num">${fd(p.date)}</td><td><span class="chip">${p.block}</span></td><td class="num">${fmt(p.palms)}</td><td class="num"><b>${fmt(p.bunches)}</b></td><td class="num">${(p.bunches/p.palms).toFixed(1)}</td><td style="font-size:11.5px">${p.src}</td><td class="num">${p.qty} كجم</td><td style="font-size:11.5px">${p.worker}</td></tr>`).join('');
 const totP=S.pollination.reduce((a,p)=>a+p.palms,0),totB=S.pollination.reduce((a,p)=>a+p.bunches,0);
 return`<div class="ph"><div><h1>التلقيح والإثمار</h1><p>تتبع دورة المحصول من اللقاح إلى العقد — لكل بلوك</p></div>
 <button class="btn" onclick="App.openPolli()">${ic('plus',14)} تسجيل تلقيح</button></div>
 <div class="pulse card" style="margin-bottom:14px">
  <div class="pk"><span>نخيل ملقّح</span><b>${fmt(totP)}</b><small>${Math.round(totP/TOT.palms*100)}% من المزرعة</small></div>
  <div class="pk"><span>إجمالي العذوق</span><b>${fmt(totB)}</b><small>عذق ملقّح</small></div>
  <div class="pk"><span>متوسط عذوق/نخلة</span><b>${(totB/totP).toFixed(1)}</b><small>ضمن المستهدف (8–11)</small></div>
  <div class="pk"><span>مصدر اللقاح</span><b style="font-size:15px">فحول المزرعة</b><small>83% + لقاح معتمد</small></div>
 </div>
 ${card('سجل التلقيح','sprout',`<div style="overflow:auto"><table class="tbl"><thead><tr><th>التاريخ</th><th>البلوك</th><th>النخيل</th><th>العذوق</th><th>عذق/نخلة</th><th>مصدر اللقاح</th><th>الكمية</th><th>العامل</th></tr></thead><tbody>${rows}</tbody></table></div>`)}`;
}
function renderOperations(){
 const f=S.ui.opFilter;
 const list=S.operations.filter(o=>f==='all'||o.type===f);
 const types=[...new Set(S.operations.map(o=>o.type))];
 const rows=list.map(o=>`<tr><td class="num">${fd(o.date)}</td><td>${bdg(o.type==='ري'?'water':o.type==='تسميد'?'ok':o.type==='حصاد'?'info':'done',o.type)}</td><td>${o.block?`<span class="chip">${o.block}</span>`:'—'}</td><td class="num">${o.workers}</td><td style="font-size:11.5px">${o.note}</td><td class="num">${o.cost?fmt(o.cost)+' ر':'—'}</td></tr>`).join('');
 const last30=S.operations.filter(o=>dd(o.date)>=-30);
 return`<div class="ph"><div><h1>العمليات الزراعية</h1><p>كل خدمة على البلوك مسجلة بعمالها وموادها وتكلفتها</p></div>
 <button class="btn" onclick="App.openOp()">${ic('plus',14)} تسجيل عملية</button></div>
 <div class="pulse card" style="margin-bottom:14px">
  <div class="pk"><span>عمليات آخر 30 يوم</span><b>${last30.length}</b></div>
  <div class="pk"><span>تكلفة آخر 30 يوم</span><b>${fmt(last30.reduce((a,o)=>a+o.cost,0))}</b><small>ريال</small></div>
  <div class="pk"><span>عمالة آخر 30 يوم</span><b>${fmt(last30.reduce((a,o)=>a+o.workers,0))}</b><small>عامل/عملية</small></div>
 </div>
 ${card('سجل العمليات','sprout',`<div style="overflow:auto"><table class="tbl"><thead><tr><th>التاريخ</th><th>النوع</th><th>البلوك</th><th>العمال</th><th>الوصف</th><th>التكلفة</th></tr></thead><tbody>${rows}</tbody></table></div>`,
 `<select onchange="App.setOF(this.value)" style="border:1px solid var(--line);border-radius:8px;padding:5px 9px;font:600 12px var(--sans);background:#fff"><option value="all">كل الأنواع</option>${types.map(t=>`<option ${f===t?'selected':''}>${t}</option>`).join('')}</select>`)}`;
}
function renderHarvest(){
 const gA=S.harvest.reduce((a,h)=>a+h.gA,0),gB=S.harvest.reduce((a,h)=>a+h.gB,0),gC=S.harvest.reduce((a,h)=>a+h.gC,0),T=gA+gB+gC||1;
 const loss=S.harvest.reduce((a,h)=>a+h.loss*h.weight,0)/(TOT.act||1);
 const rows=BIDS().map(id=>{
  const b=S.blocks[id],h=S.harvest.find(x=>x.block===id);
  return`<tr><td><span class="chip">${id}</span></td><td class="num">${fmt(b.prod)}</td><td class="num">${h?fmt(h.bunches):'—'}</td><td class="num"><b>${b.act?fmt(b.act):'—'}</b></td><td class="num">${h?fmt(h.gA):'—'}</td><td class="num">${h?fmt(h.gB):'—'}</td><td class="num">${h?fmt(h.gC):'—'}</td><td class="num">${b.act?(b.act/b.prod).toFixed(1):'—'}</td><td>${h?bdg('ok','محصود '+rel(h.date)):bdg('info','لم يبدأ')}</td><td>${h?'—':`<button class="btn sm" onclick="App.openHarvest('${id}')">تسجيل حصاد</button>`}</td></tr>`;
 }).join('');
 const hist=S.harvest.map(h=>`<tr><td class="num">${fd(h.date)}</td><td><span class="chip">${h.block}</span></td><td class="num">${fmt(h.bunches)}</td><td class="num"><b>${fmt(h.weight)}</b></td><td class="num">A ${fmt(h.gA)} · B ${fmt(h.gB)} · C ${fmt(h.gC)}</td><td class="num">${h.loss}%</td><td class="num">${h.team} عامل</td></tr>`).join('');
 return`<div class="ph"><div><h1>الحصاد والإنتاج</h1><p>من العذق إلى المخزون — درجات الجودة والفاقد والإنتاجية</p></div>
 <button class="btn" onclick="App.openHarvest()">${ic('plus',14)} تسجيل حصاد</button></div>
 <div class="pulse card" style="margin-bottom:14px">
  <div class="pk"><span>إنتاج الموسم</span><b>${fmt(TOT.act)}</b><small>كجم من متوقع ${fmt(TOT.exp)} (${Math.round(TOT.act/TOT.exp*100)}%)</small></div>
  <div class="pk"><span>إنتاجية النخلة</span><b>${(TOT.act/TOT.prod).toFixed(1)}</b><small>كجم للمثمر</small></div>
  <div class="pk"><span>نسبة الفاقد</span><b>${loss.toFixed(1)}%</b><small>تقوير وفاقد فرز</small></div>
  <div class="pk"><span>مبيعات الموسم</span><b>${fmt(salesRevSeed())}</b><small>ريال</small></div>
 </div>
 ${card('توزيع درجات الجودة','wheat',`<div class="stack"><i style="width:${gA/T*100}%;background:#2F5D3B"></i><i style="width:${gB/T*100}%;background:#7FA36B"></i><i style="width:${gC/T*100}%;background:#C3CDA8"></i></div>
  <div class="stack-l"><span><i style="background:#2F5D3B"></i>Grade A — ${fmt(gA)} كجم</span><span><i style="background:#7FA36B"></i>Grade B — ${fmt(gB)} كجم</span><span><i style="background:#C3CDA8"></i>Grade C — ${fmt(gC)} كجم</span></div>`)}
 ${card('حصاد البلوكات','tasks',`<div style="overflow:auto"><table class="tbl"><thead><tr><th>البلوك</th><th>نخيل مثمر</th><th>العذوق</th><th>الكمية (كجم)</th><th>Grade A</th><th>Grade B</th><th>Grade C</th><th>كجم/نخلة</th><th>الحالة</th><th>إجراء</th></tr></thead><tbody>${rows}</tbody></table></div>`)}
 ${card('سجل الحصاد','sprout',`<div style="overflow:auto"><table class="tbl"><thead><tr><th>التاريخ</th><th>البلوك</th><th>العذوق</th><th>الوزن</th><th>الدرجات</th><th>الفاقد</th><th>الفريق</th></tr></thead><tbody>${hist}</tbody></table></div>`)}`;
}
function renderInventory(){
 const tab=S.ui.invTab;
 const cats=[['agri','المخزن الزراعي'],['parts','قطع الغيار'],['pack','مواد التعبئة'],['produce','مخزون المحصول']];
 const items=S.inventory.filter(i=>i.cat===tab);
 const val=S.inventory.reduce((a,i)=>a+i.qty*i.price,0);
 const crit=S.inventory.filter(i=>i.qty<i.min).length;
 const rows=items.map(i=>{
  const st=i.qty<i.min?bdg('late','حرج'):i.cover&&i.cover<=10?bdg('due','ينفد خلال '+i.cover+' أيام'):i.exp&&dd(i.exp)<=30?bdg('due','صلاحية قريبة'):bdg('ok','طبيعي');
  return`<tr><td><b>${i.name}</b></td><td class="num">${i.code}</td><td class="num"><b>${fmt(i.qty)}</b> ${i.unit}</td><td class="num">${fmt(i.min)}</td><td class="num">${fmt(i.qty*i.price)}</td><td>${i.exp?fd(i.exp):i.age?`منذ ${i.age} يوم`:'—'}</td><td>${st}</td><td><button class="btn sm ghost" onclick="App.openMove('${i.code}')">حركة</button></td></tr>`;
 }).join('');
 const moves=S.moves.slice(0,7).map(m=>`<div class="mv"><span class="dir ${m.dir}">${m.dir==='in'?'استلام':'صرف'}</span>${fd(m.date)} — <b style="font-size:12px">${invBy(m.code)?invBy(m.code).name:m.code}</b><span class="num">${fmt(m.qty)}</span><small style="color:var(--ink3)">${m.note}</small></div>`).join('');
 return`<div class="ph"><div><h1>المخازن</h1><p>أربعة مستودعات مترابطة — التسميد والصيانة والتعبئة تخصم تلقائيًا</p></div></div>
 <div class="pulse card" style="margin-bottom:14px">
  <div class="pk"><span>قيمة المخزون</span><b>${fmt(val)}</b><small>ريال</small></div>
  <div class="pk"><span>عدد الأصناف</span><b>${S.inventory.length}</b></div>
  <div class="pk"><span>أصناف حرجة</span><b style="color:var(--red)">${crit}</b></div>
 </div>
 <section class="card"><header class="ch"><div class="seg">${cats.map(([k,l])=>`<button class="${tab===k?'on':''}" onclick="App.setInv('${k}')">${l}</button>`).join('')}</div></header>
 <div class="cb" style="padding:0;overflow:auto"><table class="tbl"><thead><tr><th>الصنف</th><th>الرمز</th><th>الكمية</th><th>الحد الأدنى</th><th>القيمة</th><th>صلاحية/عمر</th><th>الحالة</th><th>إجراء</th></tr></thead><tbody>${rows}</tbody></table></div></section>
 ${card('آخر الحركات المخزنية','refresh',moves||'<div class="hint">لا حركات</div>')}`;
}
function renderPurchasing(){
 const docs=S.purch.map(p=>{
  const items=p.items.map(i=>`${invBy(i.code)?invBy(i.code).name:i.code} — ${fmt(i.qty)} × ${i.price}`).join(' · ');
  return`<div class="doc"><span class="dnum">${p.id}</span>
  <div class="dmain"><b>${p.supplier}</b><div class="dmeta">${items} · ${fd(p.date)}${p.note?' — '+p.note:''}</div></div>
  <span class="num" style="font-weight:700">${SAR(salTot(p))}</span>
  ${bdg(p.stage===5?'ok':p.stage>=3?'info':'due',PUR_ST[p.stage])}
  ${p.stage<5?`<button class="btn sm" onclick="App.advPur('${p.id}')">${PUR_ST[p.stage+1]} ←</button>`:bdg('done','مكتمل')}
  <button class="btn sm ghost" onclick="App.openPur('${p.id}')">تفاصيل</button></div>`;
 }).join('');
 return`<div class="ph"><div><h1>المشتريات</h1><p>دورة كاملة: طلب ← عرض سعر ← أمر شراء ← استلام ← فاتورة ← سداد</p></div>
 <button class="btn" onclick="App.openPur()">${ic('plus',14)} مستند جديد</button></div>
 ${card('دورة المستندات','cart',pipe(PUR_ST,2)+`<p style="font-size:11px;color:var(--ink3);margin-top:8px">الاستلام المخزني يضيف الكميات للمخزون تلقائيًا، والسداد يسجل في المدفوعات.</p>`)}
 ${card('المستندات','doc',docs)}
 <div class="mini2">
  <div><b class="num">${fmt(S.purch.filter(p=>p.stage===4).reduce((a,p)=>a+salTot(p),0))}</b><span>ريال — فواتير بانتظار السداد</span></div>
  <div><b class="num">${fmt(S.purch.filter(p=>p.stage===5).reduce((a,p)=>a+salTot(p),0))}</b><span>ريال — مدفوعات مكتملة</span></div>
 </div>`;
}
function renderSales(){
 const docs=S.salesDocs.map(p=>{
  const items=p.items.map(i=>`${invBy(i.grade)?invBy(i.grade).name:i.grade} — ${fmt(i.qty)} كجم × ${i.price}`).join(' · ');
  return`<div class="doc"><span class="dnum">${p.id}</span>
  <div class="dmain"><b>${p.customer}</b><div class="dmeta">${items} · ${fd(p.date)}${p.note?' — '+p.note:''}</div></div>
  <span class="num" style="font-weight:700">${SAR(salTot(p))}</span>
  ${bdg(p.stage===5?'ok':p.stage>=3?'info':'due',SAL_ST[p.stage])}
  ${p.stage<5?`<button class="btn sm" onclick="App.advSal('${p.id}')">${SAL_ST[p.stage+1]} ←</button>`:bdg('done','مكتمل')}
  <button class="btn sm ghost" onclick="App.openSal('${p.id}')">تفاصيل</button></div>`;
 }).join('');
 return`<div class="ph"><div><h1>المبيعات</h1><p>دورة كاملة: طلب ← تخصيص ← تعبئة ← تسليم ← فاتورة ← تحصيل</p></div>
 <button class="btn" onclick="App.openSal()">${ic('plus',14)} مستند جديد</button></div>
 ${card('دورة المستندات','coins',pipe(SAL_ST,1)+`<p style="font-size:11px;color:var(--ink3);margin-top:8px">التعبئة تخصم من مخزون المحصول وتصرف كراتين من مخزن التعبئة تلقائيًا.</p>`)}
 ${card('المستندات','doc',docs)}
 <div class="mini2">
  <div><b class="num">${fmt(S.salesDocs.filter(p=>p.stage===5).reduce((a,p)=>a+salTot(p),0)+salesRevSeed())}</b><span>ريال — إيرادات محصّلة</span></div>
  <div><b class="num">${fmt(invBy('PR-A').qty+invBy('PR-B').qty+invBy('PR-C').qty)}</b><span>كجم متبقٍ بمخزون المحصول</span></div>
 </div>`;
}
function renderEmployees(){
 const att=S.attendance[todayISO]||{};
 const rows=S.employees.map(e=>{
  const s=att[e.id]||'present';
  return`<tr><td class="num">${e.id}</td><td><b>${e.name}</b></td><td style="font-size:11.5px">${e.job}</td><td style="font-size:11.5px">${e.dept}</td><td class="num">${fmt(e.salary+e.allow)}</td><td class="num" style="font-size:11px">${e.phone}</td><td>${e.status==='نشط'?bdg('ok','نشط'):bdg('info',e.status)}</td>
  <td><div class="att">
   <button class="${s==='present'?'on-p':''}" onclick="App.setAtt('${e.id}','present')">حاضر</button>
   <button class="${s==='absent'?'on-a':''}" onclick="App.setAtt('${e.id}','absent')">غائب</button>
   <button class="${s==='leave'?'on-l':''}" onclick="App.setAtt('${e.id}','leave')">إجازة</button>
  </div></td></tr>`;
 }).join('');
 return`<div class="ph"><div><h1>الموظفون والحضور</h1><p>ملف العاملين وتسجيل حضور اليوم — يغذي مسيّر الرواتب</p></div>
 <button class="btn" onclick="App.go('payroll')">${ic('wallet',14)} الرواتب</button></div>
 <div class="pulse card" style="margin-bottom:14px">
  <div class="pk"><span>إجمالي العاملين</span><b>${S.employees.length}</b></div>
  <div class="pk"><span>حاضر اليوم</span><b>${Object.values(att).filter(v=>v==='present').length}</b></div>
  <div class="pk"><span>غياب / إجازات</span><b>${Object.values(att).filter(v=>v!=='present').length}</b></div>
  <div class="pk"><span>تكلفة الرواتب الشهرية</span><b>${fmt(S.employees.reduce((a,e)=>a+e.salary+e.allow,0))}</b><small>ريال</small></div>
 </div>
 ${card('حضور اليوم — '+fd(todayISO),'users',`<div style="overflow:auto"><table class="tbl"><thead><tr><th>الرقم</th><th>الاسم</th><th>الوظيفة</th><th>القسم</th><th>الراتب الكلي</th><th>الهاتف</th><th>الحالة</th><th>تسجيل الحضور</th></tr></thead><tbody>${rows}</tbody></table></div>`)}
 ${card('آخر المسيّرات','wallet',S.payroll.slice(0,3).map(p=>`<div class="mv"><span class="dir in">${p.month}</span>${p.count} موظف<span style="margin-inline-start:auto" class="num">${SAR(p.total)}</span></div>`).join(''))}`;
}
function renderPayroll(){
 const rows=S.employees.map(e=>{
  const net=e.salary+e.allow+8*25;
  return`<tr><td class="num">${e.id}</td><td><b>${e.name}</b></td><td style="font-size:11.5px">${e.job}</td><td class="num">${fmt(e.salary)}</td><td class="num">${fmt(e.allow)}</td><td class="num">8 س × 25</td><td class="num">${fmt(8*25)}</td><td class="num"><b>${fmt(net)}</b></td></tr>`;
 }).join('');
 const total=S.employees.reduce((a,e)=>a+e.salary+e.allow+8*25,0);
 const monthName=new Date().toLocaleDateString('ar-EG',{month:'long',year:'numeric'});
 return`<div class="ph"><div><h1>الرواتب</h1><p>مسيّر الشهر الحالي — يعتمد الحضور وينتقل للدفعات</p></div>
 <button class="btn" onclick="App.runPayroll()">${ic('check',14)} اعتماد وترحيل المسيّر</button></div>
 ${card('مسيّر '+monthName+' — قيد الاعتماد','wallet',`
 <div style="overflow:auto"><table class="tbl"><thead><tr><th>الرقم</th><th>الاسم</th><th>الوظيفة</th><th>الأساسي</th><th>البدلات</th><th>إضافي</th><th>قيمة الإضافي</th><th>الصافي</th></tr></thead><tbody>${rows}</tbody>
 <tr class="tfoot"><td colspan="7">إجمالي المسيّر</td><td class="num">${SAR(total)}</td></tr></table></div>
 <p style="font-size:11.5px;color:var(--ink2);margin-top:9px">الصافي = الأساسي + البدلات + الإضافي (ساعات إضافية × 25 ريال) − الخصومات.</p>`)}
 ${card('المسيّرات المعتمدة','doc',S.payroll.map(p=>`<div class="mv"><span class="dir in">${p.month}</span>${p.count} موظف<span style="margin-inline-start:auto" class="num"><b>${SAR(p.total)}</b></span></div>`).join('')||'<div class="hint">لا مسيّرات معتمدة بعد</div>')}`;
}
function renderAssets(){
 const rows=S.assets.map(a=>{
  const dep=(a.cost/a.life).toFixed(0);
  return`<tr><td class="num">${a.code}</td><td><b>${a.name}</b></td><td style="font-size:11.5px">${a.cat}</td><td class="num">${fd(a.date)}</td><td class="num">${fmt(a.cost)}</td><td class="num">${a.life} سنة</td><td class="num">${fmt(dep)}</td><td style="font-size:11px">${a.loc}</td><td>${a.status==='سليم'?bdg('ok',a.status):bdg('due',a.status)}</td><td><button class="btn sm ghost" onclick="App.openWO('${a.code}')">أمر عمل</button></td></tr>`;
 }).join('');
 const wos=S.maints.map(w=>`
 <div class="doc"><span class="dnum">${w.id}</span>
  <div class="dmain"><b>${w.desc}</b><div class="dmeta">${w.asset} · ${w.type==='preventive'?'وقائية':'تصحيحية'} · فتح ${rel(w.opened)} · ${w.tech}</div></div>
  ${w.status==='open'?bdg('late','مفتوح'):`${bdg('ok','منجز')}<span class="num" style="font-weight:700">${SAR(w.cost)}</span>`}
  ${w.status==='open'?`<button class="btn sm" onclick="App.closeWO('${w.id}')">إغلاق وتسجيل التكلفة</button>`:''}
 </div>`).join('');
 return`<div class="ph"><div><h1>الأصول والصيانة</h1><p>سجل الأصول والإهلاك — وأوامر العمل بقطع الغيار والعمالة</p></div>
 <button class="btn" onclick="App.openWO()">${ic('plus',14)} أمر عمل جديد</button></div>
 <div class="pulse card" style="margin-bottom:14px">
  <div class="pk"><span>قيمة الأصول</span><b>${fmt(S.assets.reduce((a,x)=>a+x.cost,0))}</b><small>ريال</small></div>
  <div class="pk"><span>الإهلاك السنوي</span><b>${fmt(S.assets.reduce((a,x)=>a+x.cost/x.life,0))}</b><small>ريال/سنة</small></div>
  <div class="pk"><span>أوامر عمل مفتوحة</span><b style="color:var(--red)">${openWOs().length}</b></div>
 </div>
 ${card('أوامر العمل','wrench',wos)}
 ${card('سجل الأصول','gear',`<div style="overflow:auto"><table class="tbl"><thead><tr><th>الرمز</th><th>الأصل</th><th>الفئة</th><th>الشراء</th><th>التكلفة</th><th>العمر</th><th>إهلاك سنوي</th><th>الموقع</th><th>الحالة</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`)}
 ${card('مؤشرات الصيانة الوقائية','refresh',`<div class="mini2">
  <div><b class="num" style="color:var(--amber)">40</b><span>ساعة متبقية لصيانة P-03</span></div>
  <div><b class="num">7</b><span>أيام دورة تنظيف الفلاتر</span></div>
 </div><p style="font-size:11.5px;color:var(--ink2);margin-top:9px">إغلاق أمر العمل يخصم قطع الغيار من المخزن ويضيف التكلفة لتكلفة الإنتاج مباشرة.</p>`)}`;
}
function renderVisits(){
 const cards=S.visits.map((v,vi)=>{
  const recs=v.recs.map((r,ri)=>`
  <div class="mv"><span class="dir ${r.done?'in':'out'}">${r.done?'منفذة':'معلقة'}</span>${r.text}${r.block?` <span class="chip">${r.block}</span>`:''}
   ${!r.done?`<span style="margin-inline-start:auto;display:flex;gap:6px"><button class="btn sm ghost" onclick="App.recTask(${vi},${ri})">تحويل لمهمة</button><button class="btn sm" onclick="App.recDone(${vi},${ri})">تم التنفيذ</button></span>`:bdg('ok','✓')}
  </div>`).join('');
  return card(rel(v.date)+' — '+fd(v.date),'users',`
  <div class="bhead" style="margin-bottom:8px"><div><b style="font-size:14px">${v.person}</b><div class="bsector">${v.role} · ${v.blocks.map(b=>`<span class="chip">${b}</span>`).join(' ')}</div></div>
  ${dd(v.date)>=0?bdg('info',rel(v.date)):bdg('done','منتهية')}</div>
  <p style="font-size:12.5px;color:var(--ink2)">${v.purpose}</p>
  ${v.recs.length?`<div style="margin-top:10px;border-top:1px dashed var(--line2);padding-top:6px">${recs}</div>`:''}`,
  `<button class="btn sm ghost" onclick="App.addRec(${vi})">${ic('plus',12)} توصية</button>`);
 }).join('');
 return`<div class="ph"><div><h1>زيارات الاستشاري</h1><p>الزيارة لا تنتهي بتقرير — كل توصية تدخل دورة العمل نفسها</p></div>
 <button class="btn" onclick="App.openVisit()">${ic('plus',14)} تسجيل زيارة</button></div>
 ${cards}`;
}
function renderTasks(){
 const f=S.ui.taskFilter;
 const list=S.tasks.filter(t=>f==='all'?1:f==='today'?(t.status!=='done'&&dd(t.planned)<=0):f==='late'?(t.status!=='done'&&dd(t.planned)<0):t.status==='done');
 const cnt=k=>k==='all'?S.tasks.length:k==='today'?S.tasks.filter(t=>t.status!=='done'&&dd(t.planned)<=0).length:k==='late'?S.tasks.filter(t=>t.status!=='done'&&dd(t.planned)<0).length:S.tasks.filter(t=>t.status==='done').length;
 return`<div class="ph"><div><h1>المهام والتشغيل</h1><p>قلب النظام — كل عمل في المزرعة مهمة لها مسؤول وحالة وموعد</p></div>
 <button class="btn" onclick="App.openTaskM()">${ic('plus',14)} مهمة جديدة</button></div>
 <section class="card"><header class="ch"><div class="seg">${[['all','الكل'],['today','اليوم'],['late','متأخرة'],['done','منجزة']].map(([k,l])=>`<button class="${f===k?'on':''}" onclick="App.setTF('${k}')">${l} (${cnt(k)})</button>`).join('')}</div></header>
 <div class="cb flush">${list.map(taskRow).join('')||'<div class="hint">لا مهام في هذا الفلتر</div>'}</div></section>`;
}
function renderReports(){
 const ct=costTot(),kg=TOT.act,cpk=ct/kg,avg=(salesRevSeed()+S.salesDocs.filter(p=>p.stage===5).reduce((a,p)=>a+salTot(p),0))/soldKgSeed();
 const margin=(avg-cpk)/avg*100;
 const colors=['#2F5D3B','#4E7A4C','#7FA36B','#2C7A8C','#5B93A0','#B7A468','#8F9983'];
 const op=t=>S.operations.filter(o=>o.type===t).reduce((a,o)=>a+o.cost,0);
 const costRows=[
  {k:'الأسمدة والمغذيات',v:S.costs.fert+op('تسميد')},
  {k:'مبيدات ووقاية',v:S.costs.pest+op('رش ومكافحة')},
  {k:'العمالة والخدمات الزراعية',v:S.costs.labor+op('خف الثمار')+op('تقليم')+op('حصاد')+op('تلقيح')+op('تكريب')+op('تغطية العذوق')},
  {k:'الصيانة والمعدات',v:S.costs.maint+S.maints.reduce((a,w)=>a+w.cost,0)},
  {k:'الوقود والكهرباء',v:S.costs.fuel},{k:'التعبئة والتغليف',v:S.costs.pack},{k:'مصاريف عمومية',v:S.costs.admin}
 ];
 const totC=costRows.reduce((a,c)=>a+c.v,0);
 const bars=costRows.map((c,i)=>`<i style="width:${c.v/totC*100}%;background:${colors[i%7]}" title="${c.k}"></i>`).join('');
 const cTbl=costRows.map((c,i)=>`<tr><td><span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:${colors[i%7]};margin-inline-end:7px"></span>${c.k}</td><td class="num">${fmt(c.v)}</td><td class="num">${(c.v/totC*100).toFixed(1)}%</td><td class="num">${(c.v/kg).toFixed(2)}</td></tr>`).join('');
 const maxY=Math.max(...BIDS().map(expY));
 let yb='';BIDS().forEach((id,i)=>{const x=46+i*66,b=S.blocks[id],he=expY(id)/maxY*150,ha=(b.act||0)/maxY*150;
  yb+=`<rect x="${x}" y="${190-he}" width="22" height="${he}" rx="3" fill="#E7E0CA" stroke="#BDB69F"/><rect x="${x+27}" y="${190-ha}" width="22" height="${ha}" rx="3" fill="#2F5D3B"/>${b.act?`<text x="${x+38}" y="${184-ha}" text-anchor="middle" style="font:600 8.5px var(--mono);fill:#223021">${(b.act/1000).toFixed(1)}ط</text>`:''}<text x="${x+24}" y="207" text-anchor="middle" style="font:600 9px var(--mono);fill:#5A6A56">${id}</text>`;});
 const wm=S.waterMonthly,maxW=Math.max(...wm);
 const wbars=wm.map((v,i)=>`<rect x="${30+i*55}" y="${120-v/maxW*90}" width="38" height="${v/maxW*90}" rx="4" fill="#2C7A8C"/><text x="${49+i*55}" y="${114-v/maxW*90}" text-anchor="middle" style="font:600 8px var(--mono);fill:#5A6A56">${fmt(v)}</text><text x="${49+i*55}" y="134" text-anchor="middle" style="font:500 8px var(--sans);fill:#8F9983">${['ينا','فبر','مار','أبر','ماي','يون','يول','أغس','سبت','أكت','نوف','ديس'][i]}</text>`).join('');
 return`<div class="ph"><div><h1>التقارير والتكلفة</h1><p>كل رقم محسوب من العمليات الفعلية — يتحرك مع كل إدخال</p></div></div>
 ${card('تكلفة إنتاج الكيلو','coins',`
  <div class="hero-cost"><div><div class="big">${cpk.toFixed(2)}<small> ريال/كجم</small></div></div>
  <div class="sub">إجمالي التكاليف <b class="num">${fmt(totC)}</b> ريال ÷ <b class="num">${fmt(kg)}</b> كجم<br>
  متوسط سعر البيع <b class="num">${avg.toFixed(1)}</b> → هامش <b style="color:var(--green)">${margin.toFixed(1)}%</b> · تكلفة النخلة ${(totC/TOT.palms).toFixed(0)} ريال</div></div>
  <div class="stack">${bars}</div>
  <div style="overflow:auto;margin-top:12px"><table class="tbl"><thead><tr><th>بند التكلفة</th><th>المبلغ</th><th>النسبة</th><th>ريال/كجم</th></tr></thead><tbody>${cTbl}</tbody>
  <tr class="tfoot"><td>الإجمالي</td><td class="num">${fmt(totC)}</td><td class="num">100%</td><td class="num">${cpk.toFixed(2)}</td></tr></table></div>`)}
 <div class="dash" style="margin-top:0">
  <div class="col">${card('الإنتاجية المتوقعة مقابل الفعلية','chart',`<svg viewBox="0 0 560 220" style="width:100%"><path d="M38 190H540" stroke="#D9D2BC"/><rect x="446" y="20" width="14" height="10" rx="2" fill="#E7E0CA" stroke="#BDB69F"/><rect x="466" y="20" width="14" height="10" rx="2" fill="#2F5D3B"/><text x="488" y="29" style="font:600 9px var(--sans);fill:#5A6A56">متوقع / فعلي</text>${yb}</svg>`)}</div>
  <div class="col">
   ${card('المبيعات','coins',`<dl class="kv">
    <div><dt>إيرادات محصّلة</dt><dd>${fmt(salesRevSeed()+S.salesDocs.filter(p=>p.stage===5).reduce((a,p)=>a+salTot(p),0))} ريال</dd></div>
    <div><dt>كمية مباعة</dt><dd>${fmt(soldKgSeed())} كجم</dd></div>
    <div><dt>طلبات قيد التجهيز</dt><dd>${S.salesDocs.filter(p=>p.stage<5).length} مستند</dd></div>
    <div><dt>مستحقات موردين</dt><dd>${fmt(S.purch.filter(p=>p.stage===4).reduce((a,p)=>a+salTot(p),0))} ريال</dd></div>
   </dl><div class="stack" style="margin-top:10px"><i style="width:60%;background:#2F5D3B"></i><i style="width:28%;background:#7FA36B"></i><i style="width:12%;background:#C3CDA8"></i></div>
   <div class="stack-l"><span><i style="background:#2F5D3B"></i>Grade A</span><span><i style="background:#7FA36B"></i>Grade B</span><span><i style="background:#C3CDA8"></i>Grade C</span></div>`)}
   ${card('استهلاك المياه الشهري','drop',`<svg viewBox="0 0 660 140" style="width:100%">${wbars}</svg>`)}
  </div>
 </div>`;
}
function renderUsers(){
 const rolePages=Object.entries(ROLES).map(([r,ro])=>`<tr><td><b>${ro.label}</b></td><td style="font-size:11.5px;color:var(--ink2)">${ro.pages==='*'?'كل الشاشات بدون استثناء':ro.pages.join(' · ')}</td></tr>`).join('');
 const rows=S.users.map((u,i)=>`<tr><td><b>${u.name}</b></td><td class="num">${u.u}</td><td>${ROLES[u.role].label}</td><td>${u.active!==0?bdg('ok','نشط'):bdg('done','معطل')}</td><td><button class="btn sm ghost" onclick="App.usrToggle(${i})">${u.active!==0?'تعطيل':'تفعيل'}</button></td></tr>`).join('');
 return`<div class="ph"><div><h1>المستخدمون والصلاحيات</h1><p>RBAC — كل دور يفتح شاشاته المصرّحة له فقط</p></div>
 <button class="btn" onclick="App.usrOpen()">${ic('plus',14)} مستخدم جديد</button></div>
 ${card('حسابات النظام','shield',`<div style="overflow:auto"><table class="tbl"><thead><tr><th>الاسم</th><th>المعرّف</th><th>الدور</th><th>الحالة</th><th></th></tr></thead><tbody>${rows}</tbody></table></div>`)}
 ${card('مصفوفة الأدوار','shield',`<div style="overflow:auto"><table class="tbl"><thead><tr><th>الدور</th><th>الشاشات المتاحة</th></tr></thead><tbody>${rolePages}</tbody></table></div>`)}`;
}
function renderSettings(){
 const f=S.farm;
 return`<div class="ph"><div><h1>الإعدادات</h1><p>بيانات المزرعة · النسخ الاحتياطي · سجل التدقيق</p></div></div>
 ${card('بيانات المزرعة','palm',`<div class="frm" style="margin:0">
  <label>اسم المزرعة<input id="sf-name" value="${f.name}"></label>
  <label>المالك<input id="sf-owner" value="${f.owner}"></label>
  <label>الموقع<input id="sf-loc" value="${f.location}"></label>
  <label>المساحة (فدان)<input id="sf-area" type="number" value="${f.area}"></label>
  <label class="full">المصدر المائي<input id="sf-water" value="${f.water}"></label>
  <label class="full">مصدر الكهرباء<input id="sf-power" value="${f.power}"></label>
 </div><div style="display:flex;justify-content:flex-end"><button class="btn" onclick="App.saveFarm()">${ic('check',13)} حفظ</button></div>`)}
 ${card('البيانات والنسخ الاحتياطي','download',`<div style="display:flex;gap:9px;flex-wrap:wrap">
  <button class="btn" onclick="App.exportD()">${ic('download',14)} تصدير نسخة احتياطية</button>
  <button class="btn ghost" onclick="document.getElementById('impf').click()">${ic('upload',14)} استيراد نسخة</button>
  <button class="btn ghost" onclick="App.askReset()">${ic('refresh',14)} إعادة تعيين</button>
 </div>
 <input type="file" id="impf" accept=".json" hidden onchange="App.importD(this)">
 <p style="font-size:11px;color:var(--ink3);margin-top:10px">حجم قاعدة البيانات: ${(new Blob([JSON.stringify(S)]).size/1024).toFixed(1)} كيلوبايت</p>`)}
 ${card('سجل التدقيق Audit Log','doc',S.audit.slice(0,10).map(a=>`<div class="mv"><span class="dir in">${a.t}</span>${a.user} — ${a.act}</div>`).join(''))}
 ${card('عن النظام','gear',`<dl class="kv">
  <div><dt>الإصدار</dt><dd>Medjool FMS v2.0 Desktop</dd></div>
  <div><dt>المعمارية</dt><dd>Offline-First · قاعدة محلية</dd></div>
  <div><dt>التغليف</dt><dd>Electron → EXE</dd></div>
 </dl>`)}`;
}
const PAGES={
 dashboard:{title:'لوحة التحكم',icon:'dashboard',render:renderDashboard},
 map:{title:'الخريطة الحية',icon:'map',render:renderMap},
 tasks:{title:'المهام والتشغيل',icon:'tasks',render:renderTasks},
 structure:{title:'هيكل المزرعة',icon:'palm',render:renderStructure},
 irrigation:{title:'الري',icon:'drop',render:renderIrrigation},
 fertilizer:{title:'التسميد',icon:'leaf',render:renderFert},
 soil:{title:'التربة والمياه',icon:'flask',render:renderSoil},
 pollination:{title:'التلقيح',icon:'sprout',render:renderPollination},
 operations:{title:'العمليات الزراعية',icon:'sprout',render:renderOperations},
 harvest:{title:'الحصاد والإنتاج',icon:'wheat',render:renderHarvest},
 inventory:{title:'المخازن',icon:'box',render:renderInventory},
 purchasing:{title:'المشتريات',icon:'cart',render:renderPurchasing},
 sales:{title:'المبيعات',icon:'coins',render:renderSales},
 employees:{title:'الموظفون والحضور',icon:'users',render:renderEmployees},
 payroll:{title:'الرواتب',icon:'wallet',render:renderPayroll},
 assets:{title:'الأصول والصيانة',icon:'wrench',render:renderAssets},
 visits:{title:'زيارات الاستشاري',icon:'doc',render:renderVisits},
 reports:{title:'التقارير والتكلفة',icon:'chart',render:renderReports},
 users:{title:'المستخدمون',icon:'shield',render:renderUsers},
 settings:{title:'الإعدادات',icon:'gear',render:renderSettings},
 palm:{title:'سجل النخلة',icon:'palm',render:renderPalm}
};
const NAV=[
 ['g','التشغيل'],['dashboard'],['map'],['tasks'],['structure'],
 ['g','المحرك الزراعي'],['irrigation'],['fertilizer'],['soil'],['pollination'],['operations'],['harvest'],
 ['g','المخازن والمالية'],['inventory'],['purchasing'],['sales'],
 ['g','الموارد'],['employees'],['payroll'],['assets'],
 ['g','الخبرة والإدارة'],['visits'],['reports'],['users'],['settings']
];