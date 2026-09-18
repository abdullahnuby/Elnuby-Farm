const App={
 login(){
  const u=S.users.find(x=>x.u===document.getElementById('lgu').value&&x.active!==0);
  if(!u||u.pw!==document.getElementById('lgp').value){const e=document.getElementById('lgerr');e.style.display='block';e.textContent='اسم المستخدم أو كلمة المرور غير صحيحة';return}
  session=u;audit('تسجيل دخول');S.ui.route='dashboard';commit();
 },
 logout(){session=null;audit('تسجيل خروج');render()},
 go(r){if(!can(r))return;S.ui.route=r;commit()},
 setLayer(l){S.ui.mapLayer=l;commit()},
 mapClick(id){if(can('map'))S.ui.route='map';S.ui.sel=id;commit()},
 setInv(c){S.ui.invTab=c;commit()},setTF(f){S.ui.taskFilter=f;commit()},setOF(f){S.ui.opFilter=f;commit()},setSoil(t){S.ui.soilTab=t;commit()},
 selBlk(id){if(!can('structure'))return;S.ui.route='structure';S.ui.tree={block:id,row:null};S.ui.sel=id;commit()},
 selRow(r){S.ui.tree.row=r;commit()},backToBlock(){S.ui.tree.row=null;commit()},
 openPalm(id){S.ui.palm=id;S.ui.route='palm';commit()},
 searchGo(){
  const v=document.getElementById('q').value.trim().toUpperCase(),m=v.match(/^([A-C]\d{2})-R\d{2}-P\d{3}$/);
  if(m&&S.blocks[v.slice(0,3)])App.openPalm(v);
  else toast('صيغة رقم النخلة: A01-R05-P027 — تأكد من القطاع والصف والرقم','warn');
 },
 bell(e){e.stopPropagation();document.getElementById('belldd').classList.toggle('open')},
 openIrr(bid){
  const b=S.blocks[bid];
  modal(`تسجيل ري — Block ${bid}`,`
   <div class="frm">
    <label>من الساعة<input type="time" id="ir-t" value="06:00"></label>
    <label>المدة (ساعة)<input type="number" id="ir-h" step="0.5" min="0.5" value="2.5" oninput="App.calcIrr()"></label>
    <label>المصدر<select id="ir-s"><option>بئر 1 — الطلمبة P-01</option><option>بئر 2 — الطلمبة P-02</option></select></label>
    <label>المسؤول<select id="ir-b"><option>م. سالم القحطاني</option><option>م. نورة العتيبي</option></select></label>
   </div><div class="calc" id="ir-c"></div>`,
   `<button class="btn ghost" onclick="App.closeModal()">إلغاء</button><button class="btn" onclick="App.saveIrr('${bid}')">${ic('check',13)} تسجيل الري</button>`);
  App._ir={bid,flow:b.flow,palms:b.palms};App.calcIrr();
 },
 calcIrr(){
  const h=parseFloat(document.getElementById('ir-h').value)||0,ir=App._ir;
  document.getElementById('ir-c').innerHTML=`عدد النخيل <b class="num">${fmt(ir.palms)}</b> · التدفق <b class="num">${ir.flow}</b> م³/س · الكمية المحسوبة <b class="num big">${fmt(Math.round(ir.flow*h))}</b> م³`;
 },
 saveIrr(bid){
  const t=document.getElementById('ir-t').value,h=parseFloat(document.getElementById('ir-h').value)||2,s=document.getElementById('ir-s').value,by=document.getElementById('ir-b').value;
  const m3=Math.round(S.blocks[bid].flow*h);
  S.blocks[bid].lastIrr=todayISO;
  S.irrigationLog.unshift({date:todayISO,block:bid,start:t,hours:h,m3,src:s,by});
  S.operations.unshift({date:todayISO,type:'ري',block:bid,workers:2,materials:'—',note:`ري بالتنقيط ${h} ساعة — ${fmt(m3)} م³`,cost:0});
  S.tasks.forEach(x=>{if(x.block===bid&&x.type==='irrigation'&&x.status!=='done'){x.status='done';x.doneAt=todayISO}});
  audit(`تسجيل ري ${bid} — ${fmt(m3)} م³`);App.closeModal();commit();toast(`تم تسجيل ري Block ${bid} — ${fmt(m3)} م³`);
 },
 openFert(bid){
  const b=S.blocks[bid];
  const rows=S.program.items.map(it=>{
   const inv=invBy(it.mat),need=Math.round(it.dose*b.palms);
   return`<tr><td>${inv.name}</td><td class="num">${it.dose} كجم/نخلة</td><td class="num">${fmt(need)}</td><td class="num">${fmt(inv.qty)}</td><td>${inv.qty>=need?bdg('ok','متاح'):bdg('late','عجز '+fmt(need-inv.qty))}</td></tr>`;
  }).join('');
  modal(`تسجيل تسميد — Block ${bid}`,`
   <p class="mhint">${S.program.name} — الكميات تُخصم من المخزون الزراعي عند الحفظ.</p>
   <table class="tbl mini"><thead><tr><th>المادة</th><th>الجرعة</th><th>المطلوب</th><th>المتاح</th><th>الحالة</th></tr></thead><tbody>${rows}</tbody></table>
   <div class="frm" style="margin-top:12px"><label>العمال<input type="number" id="fe-w" value="6" min="1"></label><label>الساعات<input type="number" id="fe-h" value="5" min="1"></label></div>`,
   `<button class="btn ghost" onclick="App.closeModal()">إلغاء</button><button class="btn" onclick="App.saveFert('${bid}')">${ic('check',13)} تنفيذ التسميد</button>`);
 },
 saveFert(bid){
  const b=S.blocks[bid],w=+document.getElementById('fe-w').value||6,h=+document.getElementById('fe-h').value||5;
  let matTxt=[],matCost=0;
  S.program.items.forEach(it=>{
   const inv=invBy(it.mat),need=Math.round(it.dose*b.palms);
   inv.qty=Math.max(0,inv.qty-need);matTxt.push(inv.name+' '+fmt(need));matCost+=need*inv.price;
   S.moves.unshift({date:todayISO,code:it.mat,dir:'out',qty:need,note:'تسميد '+bid});
  });
  b.lastFert=todayISO;
  S.tasks.forEach(x=>{if(x.block===bid&&x.type==='fertilization'&&x.status!=='done'){x.status='done';x.doneAt=todayISO}});
  S.visits.forEach(v=>v.recs.forEach(r=>{if(r.block===bid)r.done=true}));
  S.operations.unshift({date:todayISO,type:'تسميد',block:bid,workers:w,materials:matTxt.join(' · '),note:'تنفيذ برنامج التسميد — خصم من المخزون',cost:Math.round(matCost+w*h*22)});
  audit('تسميد '+bid);App.closeModal();commit();toast(`تم تسميد Block ${bid} وخصم المواد من المخزون`);
 },
 genPR(){
  S.purchaseReq=[];
  const tp=S.program.target.reduce((a,id)=>a+S.blocks[id].palms,0);
  S.program.items.forEach(it=>{
   const inv=invBy(it.mat),need=Math.round(it.dose*tp);
   if(inv.qty<need)S.purchaseReq.push({name:inv.name,code:it.mat,qty:Math.ceil((need-inv.qty)*1.2),unit:inv.unit,price:inv.price});
  });
  if(!S.purchaseReq.length){toast('لا عجز — المخزون يغطي المطلوب','warn');return}
  S.purch.push({id:'PU-'+(++S.seq.pur),stage:0,date:todayISO,supplier:'— بانتظار اختيار مورد —',items:S.purchaseReq.map(r=>({code:r.code,qty:r.qty,price:r.price})),note:'مولد آليًا من برنامج التسميد'});
  audit('توليد طلب شراء');commit();toast(`تم توليد طلب شراء PU-${S.seq.pur} — بانتظار استكمال المورد`);
 },
 openHarvest(bid){
  const opts=BIDS().map(id=>`<option ${id===bid?'selected':''}>${id}</option>`).join('');
  modal('تسجيل حصاد',`
   <div class="frm">
    <label>البلوك<select id="hv-b">${opts}</select></label>
    <label>عدد العذوق<input type="number" id="hv-n" value="5100" min="1"></label>
    <label>الوزن الإجمالي (كجم)<input type="number" id="hv-k" value="7900" min="1" oninput="App.calcHv()"></label>
    <label>فريق العمل<input type="number" id="hv-t" value="13" min="1"></label>
    <label>Grade A %<input type="number" id="hv-a" value="60" oninput="App.calcHv()"></label>
    <label>Grade B %<input type="number" id="hv-b" value="28" oninput="App.calcHv()"></label>
    <label>Grade C %<input type="number" id="hv-c" value="12" oninput="App.calcHv()"></label>
   </div><div class="calc" id="hv-calc"></div>`,
   `<button class="btn ghost" onclick="App.closeModal()">إلغاء</button><button class="btn" onclick="App.saveHarvest()">${ic('check',13)} تسجيل الحصاد</button>`);
  App.calcHv();
 },
 calcHv(){
  const k=+document.getElementById('hv-k').value||0,a=+document.getElementById('hv-a').value||0,b=+document.getElementById('hv-b').value||0,c=+document.getElementById('hv-c').value||0;
  document.getElementById('hv-calc').innerHTML=`Grade A <b class="num">${fmt(k*a/100)}</b> · B <b class="num">${fmt(k*b/100)}</b> · C <b class="num">${fmt(k*c/100)}</b> كجم — يُضاف لمخزون المحصول`;
 },
 saveHarvest(){
  const bid=document.getElementById('hv-b').value,n=+document.getElementById('hv-n').value||0,k=+document.getElementById('hv-k').value||0,t=+document.getElementById('hv-t').value||12;
  const a=Math.round(k*(+document.getElementById('hv-a').value||0)/100),b=Math.round(k*(+document.getElementById('hv-b').value||0)/100),c=Math.round(k*(+document.getElementById('hv-c').value||0)/100);
  if(!k){toast('أدخل الوزن الإجمالي أولًا','warn');return}
  S.harvest.unshift({date:todayISO,block:bid,bunches:n,weight:k,gA:a,gB:b,gC:c,loss:4,team:t});
  S.blocks[bid].act=(S.blocks[bid].act||0)+k;
  invBy('PR-A').qty+=a;invBy('PR-B').qty+=b;invBy('PR-C').qty+=c;
  S.tasks.forEach(x=>{if(x.block===bid&&x.type==='harvest'&&x.status!=='done'){x.status='done';x.doneAt=todayISO}});
  S.operations.unshift({date:todayISO,type:'حصاد',block:bid,workers:t,materials:'—',note:`حصاد وتقوير — ${fmt(k)} كجم`,cost:t*9*60});
  audit(`حصاد ${bid} — ${fmt(k)} كجم`);App.closeModal();commit();toast(`تم تسجيل حصاد Block ${bid} — ${fmt(k)} كجم`);
 },
 finishTask(id){
  const t=S.tasks.find(x=>x.id===id);if(!t)return;
  t.status='done';t.doneAt=todayISO;audit('إغلاق مهمة '+id);commit();toast(`تم إغلاق المهمة ${id}`);
 },
 openTaskM(){
  const types=[['irrigation','ري'],['fertilization','تسميد'],['spraying','رش ومكافحة'],['pruning','تقليم'],['harvest','حصاد'],['maintenance','صيانة'],['inspection','تفتيش ميداني'],['visit','زيارة'],['other','أخرى']];
  modal('مهمة جديدة',`
   <div class="frm">
    <label class="full">العنوان<input id="tk-title" placeholder="مثال: رش الوقاية على القطاع C"></label>
    <label>النوع<select id="tk-type">${types.map(([v,l])=>`<option value="${v}">${l}</option>`).join('')}</select></label>
    <label>البلوك<select id="tk-block"><option value="">—</option>${BIDS().map(id=>`<option>${id}</option>`).join('')}</select></label>
    <label>المسؤول<select id="tk-asg">${S.users.map(u=>`<option>${u.name}</option>`).join('')}</select></label>
    <label>التاريخ<input type="date" id="tk-date" value="${todayISO}"></label>
    <label>الأولوية<select id="tk-pri"><option value="normal">عادية</option><option value="high">عالية</option></select></label>
   </div>`,
   `<button class="btn ghost" onclick="App.closeModal()">إلغاء</button><button class="btn" onclick="App.saveTask()">${ic('check',13)} إنشاء المهمة</button>`);
 },
 saveTask(){
  const title=document.getElementById('tk-title').value.trim();
  if(!title){toast('أدخل عنوان المهمة','warn');return}
  S.tasks.unshift({id:'T-'+(++S.seq.t),type:document.getElementById('tk-type').value,title,block:document.getElementById('tk-block').value,planned:document.getElementById('tk-date').value,priority:document.getElementById('tk-pri').value,status:'pending',assign:document.getElementById('tk-asg').value});
  audit('إنشاء مهمة '+S.seq.t);App.closeModal();commit();toast(`تم إنشاء المهمة T-${S.seq.t}`);
 },
 openOp(){
  const types=['تقليم','تكريب','تلقيح','خف الثمار','تغطية العذوق','مكافحة حشائش','رش ومكافحة','تسميد','ري','خدمة تربة','إزالة فسائل','حصاد','صيانة'];
  modal('تسجيل عملية زراعية',`
   <div class="frm">
    <label>النوع<select id="op-type">${types.map(t=>`<option>${t}</option>`).join('')}</select></label>
    <label>البلوك<select id="op-block">${BIDS().map(id=>`<option>${id}</option>`).join('')}</select></label>
    <label>التاريخ<input type="date" id="op-date" value="${todayISO}"></label>
    <label>العمال<input type="number" id="op-w" value="5" min="1"></label>
    <label>التكلفة (ريال)<input type="number" id="op-c" value="0" min="0"></label>
    <label>المواد<input id="op-mat" placeholder="اختياري"></label>
    <label class="full">الوصف<input id="op-note" placeholder="وصف العمل المنفذ"></label>
   </div>`,
   `<button class="btn ghost" onclick="App.closeModal()">إلغاء</button><button class="btn" onclick="App.saveOp()">${ic('check',13)} حفظ العملية</button>`);
 },
 saveOp(){
  S.operations.unshift({date:document.getElementById('op-date').value,type:document.getElementById('op-type').value,block:document.getElementById('op-block').value,workers:+document.getElementById('op-w').value||1,materials:document.getElementById('op-mat').value||'—',note:document.getElementById('op-note').value||'عملية زراعية',cost:+document.getElementById('op-c').value||0});
  audit('تسجيل عملية');App.closeModal();commit();toast('تم تسجيل العملية في سجل البلوك');
 },
 openMove(code){
  const it=invBy(code);
  modal(`حركة مخزنية — ${it.name}`,`
   <div class="frm">
    <label>نوع الحركة<select id="mv-dir"><option value="in">استلام (إضافة)</option><option value="out">صرف (خصم)</option></select></label>
    <label>الكمية (${it.unit})<input type="number" id="mv-q" value="100" min="1"></label>
    <label class="full">ملاحظة<input id="mv-n" placeholder="المرجع أو السبب"></label>
   </div><div class="calc">الرصيد الحالي <b class="num">${fmt(it.qty)}</b> ${it.unit}</div>`,
   `<button class="btn ghost" onclick="App.closeModal()">إلغاء</button><button class="btn" onclick="App.saveMove('${code}')">${ic('check',13)} تسجيل الحركة</button>`);
 },
 saveMove(code){
  const it=invBy(code),dir=document.getElementById('mv-dir').value,q=+document.getElementById('mv-q').value||0;
  if(q<=0){toast('أدخل كمية صحيحة','warn');return}
  if(dir==='out'&&q>it.qty){toast(`الكمية أكبر من الرصيد (${fmt(it.qty)})`,'warn');return}
  it.qty+=dir==='in'?q:-q;if(it.age!==undefined)it.age=0;
  S.moves.unshift({date:todayISO,code,dir,qty:q,note:document.getElementById('mv-n').value||'—'});
  audit(`حركة ${dir==='in'?'استلام':'صرف'} ${code}`);App.closeModal();commit();toast(`تم ${dir==='in'?'استلام':'صرف'} ${fmt(q)} ${it.unit}`);
 },
 openAnalysis(){
  const bOpts=BIDS().map(id=>`<option>${id}</option>`).join('');
  modal('تسجيل تحليل',`
   <div class="frm">
    <label>النوع<select id="an-t"><option value="soil">تحليل تربة</option><option value="water">تحليل مياه</option></select></label>
    <label>البلوك / المصدر<select id="an-src">${bOpts}<option>بئر 1</option><option>بئر 2</option></select></label>
    <label>التاريخ<input type="date" id="an-d" value="${todayISO}"></label>
    <label>pH<input type="number" step="0.1" id="an-ph" value="7.5"></label>
    <label>EC dS/m<input type="number" step="0.1" id="an-ec" value="3.8"></label>
    <label class="full">المختبر<input id="an-lab" value="مختبر التربة — الأحساء"></label>
   </div>`,
   `<button class="btn ghost" onclick="App.closeModal()">إلغاء</button><button class="btn" onclick="App.saveAnalysis()">${ic('check',13)} حفظ التحليل</button>`);
 },
 saveAnalysis(){
  const t=document.getElementById('an-t').value,src=document.getElementById('an-src').value;
  const rec={date:document.getElementById('an-d').value,ph:+document.getElementById('an-ph').value||7.5,ec:+document.getElementById('an-ec').value||3.8,lab:document.getElementById('an-lab').value};
  if(t==='soil'){rec.block=src;S.soil.unshift(rec)}else{rec.src=src;S.water.unshift(rec)}
  audit('تسجيل تحليل');App.closeModal();commit();toast('تم حفظ التحليل');
 },
 delRec(k,i){S[k].splice(i,1);audit('حذف تحليل');commit();toast('تم حذف السجل')},
 openPolli(){
  modal('تسجيل تلقيح',`
   <div class="frm">
    <label>البلوك<select id="po-b">${BIDS().map(id=>`<option>${id}</option>`).join('')}</select></label>
    <label>التاريخ<input type="date" id="po-d" value="${todayISO}"></label>
    <label>النخيل الملقّحة<input type="number" id="po-p" value="700" min="1"></label>
    <label>عدد العذوق<input type="number" id="po-n" value="6300" min="1"></label>
    <label>مصدر اللقاح<select id="po-s"><option>لقاح فحول المزرعة</option><option>لقاح خارجي معتمد</option></select></label>
    <label>الكمية (كجم)<input type="number" id="po-q" value="10" min="1"></label>
    <label class="full">العامل<input id="po-w" value="فريق التلقيح — راجيش"></label>
   </div>`,
   `<button class="btn ghost" onclick="App.closeModal()">إلغاء</button><button class="btn" onclick="App.savePolli()">${ic('check',13)} حفظ</button>`);
 },
 savePolli(){
  S.pollination.unshift({date:document.getElementById('po-d').value,block:document.getElementById('po-b').value,palms:+document.getElementById('po-p').value||0,bunches:+document.getElementById('po-n').value||0,src:document.getElementById('po-s').value,qty:+document.getElementById('po-q').value||0,worker:document.getElementById('po-w').value});
  audit('تسجيل تلقيح');App.closeModal();commit();toast('تم تسجيل التلقيح في دورة المحصول');
 },
 openPur(id){
  const p=id?S.purch.find(x=>x.id===id):null;
  const invOpts=S.inventory.map(i=>`<option value="${i.code}">${i.name} (${i.unit})</option>`).join('');
  const supOpts=S.suppliers.map(s=>`<option>${s.name}</option>`).join('');
  modal(p?`المستند ${p.id}`:'مستند شراء جديد',`
   ${p?pipe(PUR_ST,p.stage)+`<table class="tbl mini" style="margin:10px 0"><thead><tr><th>الصنف</th><th>الكمية</th><th>السعر</th><th>الإجمالي</th></tr></thead><tbody>${p.items.map(i=>`<tr><td>${invBy(i.code)?invBy(i.code).name:i.code}</td><td class="num">${fmt(i.qty)}</td><td class="num">${i.price}</td><td class="num">${fmt(i.qty*i.price)}</td></tr>`).join('')}</tbody><tr class="tfoot"><td colspan="3">الإجمالي</td><td class="num">${SAR(salTot(p))}</td></tr></table>
   <p class="mhint" style="margin:0">المورد: ${p.supplier} · ${fd(p.date)}</p>`:`
   <div class="frm">
    <label class="full">المورد<select id="pu-s">${supOpts}</select></label>
    <label>الصنف<select id="pu-i">${invOpts}</select></label>
    <label>الكمية<input type="number" id="pu-q" value="500" min="1"></label>
    <label>سعر الوحدة<input type="number" id="pu-p" value="8" step="0.1"></label>
    <label class="full">ملاحظة<input id="pu-n" placeholder="غرض الشراء"></label>
   </div>`}`,
   p?`<button class="btn ghost" onclick="App.closeModal()">إغلاق</button>${p.stage<5?`<button class="btn" onclick="App.advPur('${p.id}')">الانتقال: ${PUR_ST[p.stage+1]}</button>`:''}`
   :`<button class="btn ghost" onclick="App.closeModal()">إلغاء</button><button class="btn" onclick="App.savePur()">${ic('check',13)} إنشاء الطلب</button>`);
 },
 savePur(){
  S.purch.push({id:'PU-'+(++S.seq.pur),stage:0,date:todayISO,supplier:document.getElementById('pu-s').value,items:[{code:document.getElementById('pu-i').value,qty:+document.getElementById('pu-q').value||1,price:+document.getElementById('pu-p').value||1}],note:document.getElementById('pu-n').value||'—'});
  audit('إنشاء مستند شراء');App.closeModal();commit();toast(`تم إنشاء طلب الشراء PU-${S.seq.pur}`);
 },
 advPur(id){
  const p=S.purch.find(x=>x.id===id),nx=p.stage+1;
  if(nx===3){
   p.items.forEach(i=>{const inv=invBy(i.code);if(inv){inv.qty+=i.qty;if(inv.age!==undefined)inv.age=0;S.moves.unshift({date:todayISO,code:i.code,dir:'in',qty:i.qty,note:'استلام '+id})}});
   toast(`${PUR_ST[3]} — أُضيفت الكميات للمخزون`);
  }else if(nx===5){toast(`${PUR_ST[5]} — سُجّل ${SAR(salTot(p))} في المدفوعات`)}
  else toast(`تم الترقية إلى: ${PUR_ST[nx]}`);
  p.stage=nx;audit(`ترقية ${id} إلى ${PUR_ST[nx]}`);commit();
 },
 openSal(id){
  const p=id?S.salesDocs.find(x=>x.id===id):null;
  const prOpts=['PR-A','PR-B','PR-C'].map(c=>`<option value="${c}">${invBy(c).name}</option>`).join('');
  const custOpts=S.customers.map(s=>`<option>${s.name}</option>`).join('');
  modal(p?`المستند ${p.id}`:'طلب مبيعات جديد',`
   ${p?pipe(SAL_ST,p.stage)+`<table class="tbl mini" style="margin:10px 0"><thead><tr><th>الصنف</th><th>الكمية (كجم)</th><th>السعر</th><th>الإجمالي</th></tr></thead><tbody>${p.items.map(i=>`<tr><td>${invBy(i.grade)?invBy(i.grade).name:i.grade}</td><td class="num">${fmt(i.qty)}</td><td class="num">${i.price}</td><td class="num">${fmt(i.qty*i.price)}</td></tr>`).join('')}</tbody><tr class="tfoot"><td colspan="3">الإجمالي</td><td class="num">${SAR(salTot(p))}</td></tr></table>
   <p class="mhint" style="margin:0">العميل: ${p.customer} · ${fd(p.date)}</p>`:`
   <div class="frm">
    <label class="full">العميل<select id="sa-c">${custOpts}</select></label>
    <label>الدرجة<select id="sa-g">${prOpts}</select></label>
    <label>الكمية (كجم)<input type="number" id="sa-q" value="1000" min="1"></label>
    <label>سعر الكيلو<input type="number" id="sa-p" value="27.5" step="0.5"></label>
    <label class="full">ملاحظة<input id="sa-n" placeholder="غرض الطلب"></label>
   </div>`}`,
   p?`<button class="btn ghost" onclick="App.closeModal()">إغلاق</button>${p.stage<5?`<button class="btn" onclick="App.advSal('${p.id}')">الانتقال: ${SAL_ST[p.stage+1]}</button>`:''}`
   :`<button class="btn ghost" onclick="App.closeModal()">إلغاء</button><button class="btn" onclick="App.saveSal()">${ic('check',13)} إنشاء الطلب</button>`);
 },
 saveSal(){
  S.salesDocs.push({id:'SA-'+(++S.seq.sal),stage:0,date:todayISO,customer:document.getElementById('sa-c').value,items:[{grade:document.getElementById('sa-g').value,qty:+document.getElementById('sa-q').value||1,price:+document.getElementById('sa-p').value||1}],note:document.getElementById('sa-n').value||'—'});
  audit('إنشاء مستند مبيعات');App.closeModal();commit();toast(`تم إنشاء طلب المبيعات SA-${S.seq.sal}`);
 },
 advSal(id){
  const p=S.salesDocs.find(x=>x.id===id),nx=p.stage+1;
  if(nx===1)toast(`${SAL_ST[1]} — تم حجز الكميات من مخزون المحصول`);
  if(nx===2){
   p.items.forEach(i=>{const inv=invBy(i.grade);inv.qty=Math.max(0,inv.qty-i.qty);S.moves.unshift({date:todayISO,code:i.grade,dir:'out',qty:i.qty,note:'تعبئة '+id})});
   const boxes=Math.ceil(p.items.reduce((a,i)=>a+i.qty,0)/5);
   const ctn=invBy('K-CTN');if(ctn){ctn.qty=Math.max(0,ctn.qty-boxes);S.moves.unshift({date:todayISO,code:'K-CTN',dir:'out',qty:boxes,note:'تعبئة '+id})}
   toast(`${SAL_ST[2]} — خُصمت الكميات وصُرف ${fmt(boxes)} كرتونة`);
  }
  if(nx===5)toast(`${SAL_ST[5]} — سُجّل ${SAR(salTot(p))} في الإيرادات`);
  if(nx===3||nx===4)toast(`تم الترقية إلى: ${SAL_ST[nx]}`);
  p.stage=nx;audit(`ترقية ${id} إلى ${SAL_ST[nx]}`);commit();
 },
 setAtt(emp,st){S.attendance[todayISO]=S.attendance[todayISO]||{};S.attendance[todayISO][emp]=st;commit()},
 runPayroll(){
  const total=S.employees.reduce((a,e)=>a+e.salary+e.allow+8*25,0);
  S.payroll.unshift({month:'مسيّر '+new Date().toLocaleDateString('ar-EG',{month:'long'}),total,count:S.employees.length});
  audit('اعتماد مسيّر الرواتب');commit();toast(`تم اعتماد المسيّر — ${SAR(total)} لـ ${S.employees.length} موظف`);
 },
 openWO(code){
  modal('أمر عمل جديد',`
   <div class="frm">
    <label>النوع<select id="wo-t"><option value="preventive">وقائية</option><option value="corrective">تصحيحية</option></select></label>
    <label>الأصل<select id="wo-a">${S.assets.map(a=>`<option value="${a.code}" ${a.code===code?'selected':''}>${a.code} — ${a.name}</option>`).join('')}</select></label>
    <label class="full">الوصف<input id="wo-d" placeholder="وصف العطل أو العملية الوقائية"></label>
    <label>الفني<input id="wo-tech" value="محمد إقبال"></label>
    <label>تاريخ الفتح<input type="date" id="wo-date" value="${todayISO}"></label>
   </div>`,
   `<button class="btn ghost" onclick="App.closeModal()">إلغاء</button><button class="btn" onclick="App.saveWO()">${ic('check',13)} فتح الأمر</button>`);
 },
 saveWO(){
  S.maints.unshift({id:'WO-'+(++S.seq.wo),type:document.getElementById('wo-t').value,asset:document.getElementById('wo-a').value,desc:document.getElementById('wo-d').value||'عمل صيانة',opened:document.getElementById('wo-date').value,tech:document.getElementById('wo-tech').value,hours:0,parts:[],cost:0,status:'open'});
  audit('فتح أمر عمل');App.closeModal();commit();toast(`تم فتح أمر العمل WO-${S.seq.wo}`);
 },
 closeWO(id){
  const parts=S.inventory.filter(i=>i.cat==='parts');
  modal(`إغلاق ${id} — تسجيل التكلفة`,`
   <div class="frm">
    <label>ساعات الفني<input type="number" id="wc-h" value="3" min="0" step="0.5"></label>
    <label>أجر الساعة (ريال)<input type="number" id="wc-r" value="28" min="0"></label>
    <label>قطعة من المخزن<select id="wc-p"><option value="">— بدون —</option>${parts.map(p=>`<option value="${p.code}">${p.name} (رصيد ${fmt(p.qty)})</option>`).join('')}</select></label>
    <label>كمية القطع<input type="number" id="wc-q" value="1" min="0"></label>
    <label class="full">ملاحظات الإغلاق<input id="wc-n" placeholder="نتيجة العمل"></label>
   </div><div class="calc">سيتم خصم القطع من مخزن قطع الغيار وإضافة التكلفة لتكلفة الإنتاج.</div>`,
   `<button class="btn ghost" onclick="App.closeModal()">إلغاء</button><button class="btn" onclick="App.doCloseWO('${id}')">${ic('check',13)} إغلاق الأمر</button>`);
 },
 doCloseWO(id){
  const w=S.maints.find(x=>x.id===id);
  const h=+document.getElementById('wc-h').value||0,pc=document.getElementById('wc-p').value,q=+document.getElementById('wc-q').value||0;
  let partsCost=0;
  if(pc&&q>0){const inv=invBy(pc);if(inv){if(q>inv.qty){toast(`الكمية أكبر من رصيد ${inv.name}`,'warn');return}inv.qty-=q;partsCost=q*inv.price;S.moves.unshift({date:todayISO,code:pc,dir:'out',qty:q,note:'صيانة '+id})}}
  w.hours=h;w.cost=Math.round(h*(+document.getElementById('wc-r').value||28)+partsCost);w.status='closed';
  audit(`إغلاق ${id} بتكلفة ${w.cost}`);App.closeModal();commit();toast(`تم إغلاق ${id} — التكلفة ${SAR(w.cost)}`);
 },
 openVisit(){
  modal('تسجيل زيارة',`
   <div class="frm">
    <label>التاريخ<input type="date" id="vi-d" value="${todayISO}"></label>
    <label>الصفة<input id="vi-r" value="استشاري نخيل"></label>
    <label>الشخص<input id="vi-p" value="م. فهد الدوسري"></label>
    <label>البلوكات<input id="vi-b" placeholder="مثال: B03, A03"></label>
    <label class="full">الغرض<input id="vi-g" placeholder="هدف الزيارة"></label>
   </div>`,
   `<button class="btn ghost" onclick="App.closeModal()">إلغاء</button><button class="btn" onclick="App.saveVisit()">${ic('check',13)} حفظ الزيارة</button>`);
 },
 saveVisit(){
  S.visits.unshift({date:document.getElementById('vi-d').value,person:document.getElementById('vi-p').value,role:document.getElementById('vi-r').value,blocks:(document.getElementById('vi-b').value||'').split(',').map(x=>x.trim()).filter(Boolean),purpose:document.getElementById('vi-g').value||'جولة ميدانية',recs:[]});
  audit('تسجيل زيارة');App.closeModal();commit();toast('تم تسجيل الزيارة');
 },
 addRec(vi){
  modal('توصية جديدة',`
   <div class="frm">
    <label class="full">نص التوصية<textarea id="rc-t" rows="3" placeholder="مثال: زيادة جرعة البوتاسيوم لبلوك B03"></textarea></label>
    <label>البلوك المستهدف<select id="rc-b"><option value="">—</option>${BIDS().map(id=>`<option>${id}</option>`).join('')}</select></label>
   </div>`,
   `<button class="btn ghost" onclick="App.closeModal()">إلغاء</button><button class="btn" onclick="App.saveRec(${vi})">${ic('check',13)} إضافة التوصية</button>`);
 },
 saveRec(vi){
  const t=document.getElementById('rc-t').value.trim();if(!t){toast('اكتب نص التوصية','warn');return}
  S.visits[vi].recs.push({text:t,block:document.getElementById('rc-b').value,done:false});
  audit('إضافة توصية');App.closeModal();commit();toast('أُضيفت التوصية — ستظهر في التنبيهات حتى تنفذ');
 },
 recTask(vi,ri){
  const r=S.visits[vi].recs[ri];
  S.tasks.unshift({id:'T-'+(++S.seq.t),type:'inspection',title:'تنفيذ توصية: '+r.text,block:r.block||'',planned:dOff(1),priority:'high',status:'pending',assign:'م. نورة'});
  audit('تحويل توصية لمهمة');commit();toast(`تم تحويل التوصية للمهمة T-${S.seq.t}`);
 },
 recDone(vi,ri){S.visits[vi].recs[ri].done=true;audit('تنفيذ توصية');commit();toast('تم تعليم التوصية كمنفذة')},
 usrOpen(){
  modal('مستخدم جديد',`
   <div class="frm">
    <label>الاسم<input id="nu-n" placeholder="الاسم الكامل"></label>
    <label>المعرّف<input id="nu-u" placeholder="user"></label>
    <label>كلمة المرور<input id="nu-p" type="password" value="1234"></label>
    <label>الدور<select id="nu-r">${Object.entries(ROLES).map(([r,o])=>`<option value="${r}">${o.label}</option>`).join('')}</select></label>
   </div>`,
   `<button class="btn ghost" onclick="App.closeModal()">إلغاء</button><button class="btn" onclick="App.usrSave()">${ic('check',13)} إنشاء الحساب</button>`);
 },
 usrSave(){
  const n=document.getElementById('nu-n').value.trim(),u=document.getElementById('nu-u').value.trim();
  if(!n||!u||S.users.find(x=>x.u===u)){toast('الاسم والمعرّف مطلوبان والمعرّف غير مستخدم','warn');return}
  S.users.push({u,pw:document.getElementById('nu-p').value||'1234',name:n,role:document.getElementById('nu-r').value,active:1});
  audit('إنشاء مستخدم '+u);App.closeModal();commit();toast(`تم إنشاء حساب ${n}`);
 },
 usrToggle(i){S.users[i].active=S.users[i].active===0?1:0;audit('تعديل حالة مستخدم');commit();toast('تم تحديث حالة الحساب')},
 saveFarm(){
  S.farm.name=document.getElementById('sf-name').value||S.farm.name;S.farm.owner=document.getElementById('sf-owner').value;
  S.farm.location=document.getElementById('sf-loc').value;S.farm.area=+document.getElementById('sf-area').value||S.farm.area;
  S.farm.water=document.getElementById('sf-water').value;S.farm.power=document.getElementById('sf-power').value;
  audit('تعديل بيانات المزرعة');commit();toast('تم حفظ بيانات المزرعة');
 },
 exportD(){
  const b=new Blob([JSON.stringify(S,null,1)],{type:'application/json'});
  const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='medjool-backup-'+todayISO+'.json';a.click();
  toast('تم تصدير النسخة الاحتياطية');
 },
 importD(inp){
  const f=inp.files[0];if(!f)return;
  const r=new FileReader();
  r.onload=()=>{try{const d=JSON.parse(r.result);if(!d.blocks)throw 0;S=d;S.ui=Object.assign({route:'dashboard'},S.ui||{});commit();toast('تم استيراد النسخة الاحتياطية')}catch(e){toast('ملف غير صالح','warn')}};
  r.readAsText(f);
 },
 askReset(){
  modal('إعادة تعيين البيانات',`<p class="mhint">سيتم حذف كل التعديلات والرجوع لبيانات العرض الأولية — لا يمكن التراجع.</p>`,
  `<button class="btn ghost" onclick="App.closeModal()">إلغاء</button><button class="btn warn" onclick="App.doReset()">تأكيد إعادة التعيين</button>`);
 },
 doReset(){localStorage.removeItem(KEY);location.reload()},
 closeModal(){document.getElementById('modal-root').innerHTML=''}
};

function render(){
 if(!session){renderLogin();return}
 document.getElementById('login').style.display='none';
 document.getElementById('app').classList.add('on');
 document.getElementById('tbbrand').innerHTML=`${ic('palm',26)}<div><b>المجدول FMS</b><span>إدارة مزرعة نخيل التمر</span></div>`;
 document.getElementById('uchip').innerHTML=`<div class="uava">${session.name[0]}</div><div><b>${session.name}</b><small>${ROLES[session.role].label}</small></div>`;
 document.getElementById('logoutbtn').innerHTML=ic('logout',16);
 document.getElementById('brand').innerHTML=`${ic('palm',30)}<div><b>المجدول</b><span>نظام إدارة مزرعة النخيل</span></div>`;
 const al=getAlerts();
 document.getElementById('bellbtn').innerHTML=`${ic('bell',17)}<b class="nbadge">${al.length}</b>`;
 document.getElementById('belldd').innerHTML=`<header class="ch"><div class="ch-t">${ic('bell',15)}<h2>التنبيهات (${al.length})</h2></div></header>${alertsHTML(al)}`;
 const counts={tasks:S.tasks.filter(t=>t.status!=='done').length,assets:openWOs().length,purchasing:S.purch.filter(p=>p.stage<5).length,sales:S.salesDocs.filter(p=>p.stage<5).length};
 document.getElementById('nav').innerHTML=NAV.map(n=>n[0]==='g'?`<div class="ng">${n[1]}</div>`:(can(n[0])?`<a class="${S.ui.route===n[0]?'on':''}" onclick="App.go('${n[0]}')">${ic(PAGES[n[0]].icon,17)}<span>${PAGES[n[0]].title}</span>${counts[n[0]]?`<span class="cnt">${counts[n[0]]}</span>`:''}</a>`:'')).join('');
 if(!can(S.ui.route))S.ui.route='dashboard';
 const page=PAGES[S.ui.route]||PAGES.dashboard;
 document.getElementById('pagewrap').innerHTML=page.render();
 document.getElementById('page').scrollTop=0;
 document.getElementById('statusbar').innerHTML=`
  <div class="sb"><span class="dotg"></span>قاعدة البيانات المحلية — متصلة</div>
  <div class="sb">المستخدم: <b style="color:#C9D2C4">${session.name}</b> · ${ROLES[session.role].label}</div>
  <div class="sb">آخر حفظ: <b style="color:#C9D2C4">${lastSave||'—'}</b></div>
  <div class="sb" style="margin-inline-start:auto">Medjool FMS v2.0 · Desktop</div>`;
}
document.addEventListener('click',e=>{
 const g=e.target.closest?e.target.closest('.bk'):null;
 if(g){App.mapClick(g.getAttribute('data-bk'));return}
 if(!e.target.closest('.bell-w'))document.getElementById('belldd').classList.remove('open');
});
document.addEventListener('mousemove',e=>{
 const g=e.target.closest?e.target.closest('.bk'):null;
 const tip=document.getElementById('tip');
 if(g){
  const id=g.getAttribute('data-bk');
  if(tip.dataset.cur!==id){tip.dataset.cur=id;tip.innerHTML=tipHTML(id)}
  tip.style.display='block';
  tip.style.left=(e.clientX+18>innerWidth-270?e.clientX-260:e.clientX+18)+'px';
  tip.style.top=Math.min(e.clientY+20,innerHeight-150)+'px';
 }else{tip.style.display='none';tip.dataset.cur=''}
});
document.addEventListener('keydown',e=>{if(e.key==='Escape')App.closeModal()});
setInterval(()=>{if(session)document.getElementById('clk').textContent=new Date().toLocaleTimeString('ar-EG',{hour:'2-digit',minute:'2-digit',second:'2-digit'})+' · '+new Date().toLocaleDateString('ar-EG',{weekday:'long',day:'numeric',month:'long'})},1000);
render();