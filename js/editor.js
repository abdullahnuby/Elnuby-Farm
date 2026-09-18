/* ============ محرر المزرعة — هيكل وخريطة من جوّه البرنامج ============ */

/* أنماط المحرر */
(function(){
 const st=document.createElement('style');
 st.textContent='.edt{flex:none;width:22px;height:22px;border-radius:6px;display:inline-flex;align-items:center;justify-content:center;background:#fff;border:1px solid var(--line);color:var(--ink2);cursor:pointer}.edt:hover{color:var(--green);border-color:var(--green)}.edt.del:hover{color:var(--red);border-color:var(--red)}.tblk .edt{flex:none}.rsz{cursor:nwse-resize}.edg{cursor:grab}.edg:active{cursor:grabbing}';
 document.head.appendChild(st);
})();

/* ============ نقل تخطيط الخريطة إلى البيانات المحفوظة ============ */
(function(){
 if(!S.map||!S.map.blocks){
  const mb={};
  BIDS().forEach(function(id){
   mb[id]=MAPBOX[id]?MAPBOX[id].slice():[90,150,280,170];
  });
  S.map={blocks:mb};
  localStorage.setItem(KEY,JSON.stringify(S));
 }
})();

/* ============ تحديث الإجماليات حيًّا مع كل تعديل ============ */
(function(){
 const old=commit;
 commit=function(){
  TOT.palms=tot(function(b){return b.palms;});
  TOT.prod=tot(function(b){return b.prod;});
  TOT.act=tot(function(b){return b.act;});
  TOT.exp=tot(function(b,id){return expY(id);});
  old();
 };
})();

/* ============ أدوات الرسم ============ */
function clamp(v,a,b){return Math.max(a,Math.min(b,v));}
function svgPoint(svg,cx,cy){
 const pt=svg.createSVGPoint();pt.x=cx;pt.y=cy;
 return pt.matrixTransform(svg.getScreenCTM().inverse());
}
function nextBlockId(secId){
 let n=1;
 BIDS().forEach(function(id){
  if(id.charAt(0)===secId){
   const num=parseInt(id.slice(1),10);
   if(num>=n)n=num+1;
  }
 });
 return secId+String(n).padStart(2,'0');
}
function mapStatic(){
 return '<rect x="14" y="58" width="1092" height="650" rx="12" fill="none" stroke="#C2BBA2" stroke-dasharray="7 6" stroke-width="1.4"/>'+
 '<g transform="translate(26,46)"><path d="M0 12V-8" stroke="#5A6A56" stroke-width="1.6"/><path d="M-4 0L0 -9L4 0" fill="none" stroke="#5A6A56" stroke-width="1.6"/><text class="msub" y="30" text-anchor="middle">شمال</text></g>'+
 '<rect x="46" y="90" width="1030" height="578" rx="14" fill="none" stroke="#E6DEC6" stroke-width="16"/>'+
 '<rect x="46" y="90" width="1030" height="578" rx="14" fill="none" stroke="#CDBA6F" stroke-width="1.6" stroke-dasharray="10 9"/>'+
 '<path class="wline" d="M110 84 V104 H940"/>'+
 '<g transform="translate(110,74)"><circle r="7" fill="#D9E8EC" stroke="#2C7A8C" stroke-width="1.5"/><circle r="2.4" fill="#2C7A8C"/></g>'+
 '<text class="wlbl" x="190" y="78" text-anchor="middle">بئر 1</text>'+
 '<g transform="translate(560,74)"><circle r="7" fill="#D9E8EC" stroke="#2C7A8C" stroke-width="1.5"/><circle r="2.4" fill="#2C7A8C"/></g>'+
 '<text class="wlbl" x="645" y="78" text-anchor="middle">بئر 2</text>'+
 '<rect x="986" y="63" width="36" height="20" rx="3" fill="#D9E8EC" stroke="#2C7A8C" stroke-width="1.4"/>'+
 '<text class="wlbl" x="925" y="77" text-anchor="middle">خزان</text>'+
 '<rect x="920" y="680" width="160" height="26" rx="4" fill="#EAE4D0" stroke="#BDB69F"/>'+
 '<text class="mlbl" x="1000" y="697" text-anchor="middle">الإدارة والمخازن</text>'+
 '<g transform="translate(70,692)"><path d="M0 0h100" stroke="#5A6A56" stroke-width="1.4"/><path d="M0 -3v6M100 -3v6" stroke="#5A6A56" stroke-width="1.4"/><text class="mlbl" x="50" y="16" text-anchor="middle">200 م</text></g>';
}

/* ============ الخريطة الحية: تقرأ التخطيط من البيانات ============ */
mapSVG=function(layer){
 const bands=[];
 S.sectors.forEach(function(sec){
  const ids=BIDS().filter(function(id){return S.blocks[id].sector===sec.id&&S.map.blocks[id];});
  if(!ids.length)return;
  let x1=9999,x2=-9999;
  ids.forEach(function(id){const b=S.map.blocks[id];x1=Math.min(x1,b[0]);x2=Math.max(x2,b[0]+b[2]);});
  bands.push({label:sec.name,x1:x1,x2:x2});
 });
 let seps='',labels='';
 for(let i=0;i<bands.length-1;i++){
  const xm=Math.round((bands[i].x2+bands[i+1].x1)/2);
  seps+='<path class="wline" d="M'+xm+' 108 V640"/>';
 }
 bands.forEach(function(b){
  labels+='<text class="slbl" x="'+Math.round((b.x1+b.x2)/2)+'" y="118" text-anchor="middle">'+b.label+'</text>';
 });
 const blocks=BIDS().map(function(id){
  const b=S.map.blocks[id];
  if(!b)return '';
  const c=layerColor(id,layer);
  let rows='';
  for(let ry=b[1]+42;ry<=b[1]+b[3]-26;ry+=22){
   rows+='<line class="prow" x1="'+(b[0]+30)+'" x2="'+(b[0]+b[2]-30)+'" y1="'+ry+'" y2="'+ry+'"/>';
  }
  return '<g class="bk" data-bk="'+id+'">'+
  '<rect class="bgc" x="'+b[0]+'" y="'+b[1]+'" width="'+b[2]+'" height="'+b[3]+'" rx="8" fill="'+c.f+'"/>'+
  '<rect class="frame" x="'+b[0]+'" y="'+b[1]+'" width="'+b[2]+'" height="'+b[3]+'" rx="8" fill="none" stroke="'+c.s+'" stroke-width="1.6"/>'+
  rows+
  '<text class="bid" x="'+(b[0]+16)+'" y="'+(b[1]+25)+'">'+id+'</text>'+
  '<text class="bcount" x="'+(b[0]+b[2]-16)+'" y="'+(b[1]+25)+'">'+fmt(S.blocks[id].palms)+' نخلة</text></g>';
 }).join('');
 return '<svg viewBox="0 0 1120 714" class="mapv" preserveAspectRatio="xMidYMid meet">'+
 '<text class="mtitle" x="1104" y="42" text-anchor="start">'+S.farm.name+' — '+S.farm.area+' فدان · '+fmt(TOT.palms)+' نخلة</text>'+
 mapStatic()+seps+labels+blocks+'</svg>';
};

/* ============ التخطيط التلقائي ============ */
function autoLayout(){
 const secs=S.sectors;
 const n=Math.max(1,secs.length);
 const left=76,right=1076,top=126,bottom=640;
 const gapX=16,gapY=14;
 const colW=Math.floor((right-left-(n-1)*gapX)/n);
 secs.forEach(function(sec,si){
  const x0=left+si*(colW+gapX);
  const ids=BIDS().filter(function(id){return S.blocks[id].sector===sec.id;});
  if(!ids.length)return;
  const totP=ids.reduce(function(a,id){return a+S.blocks[id].palms;},0)||1;
  const availH=bottom-top-(ids.length-1)*gapY;
  let y=top;
  ids.forEach(function(id){
   let h=Math.round(availH*S.blocks[id].palms/totP);
   h=clamp(h,90,Math.max(90,bottom-y));
   S.map.blocks[id]=[x0,y,colW,h];
   y+=h+gapY;
  });
 });
}
App.autoLayout=function(){
 autoLayout();audit('تخطيط تلقائي للخريطة');commit();
 toast('تم ترتيب البلوكات تلقائيًا — عمود لكل قطاع والمساحة بنسبة عدد النخيل');
};

/* ============ شاشة هيكل المزرعة (بأزرار تعديل وإضافة وحذف) ============ */
function renderStructure2(){
 const t=S.ui.tree;
 const tree=S.sectors.map(function(sec){
  const ids=BIDS().filter(function(id){return S.blocks[id].sector===sec.id;});
  const palms=ids.reduce(function(a,id){return a+S.blocks[id].palms;},0);
  let rows='';
  ids.forEach(function(id){
   const st=irrState(id);
   const cls=t.block===id?' on':'';
   rows+='<div class="tblk'+cls+'" onclick="App.selBlk(\''+id+'\')">'+
   '<span class="sdot" style="background:'+st.s+'"></span><span class="chip">'+id+'</span>'+
   fmt(S.blocks[id].palms)+' نخلة<span class="num">'+st.label+'</span>'+
   '<span class="edt" title="تعديل البلوك" onclick="event.stopPropagation();App.blockForm(\''+id+'\')">'+ic('wrench',11)+'</span>'+
   '<span class="edt del" title="حذف البلوك" onclick="event.stopPropagation();App.delBlock(\''+id+'\')">'+ic('x',11)+'</span>'+
   '</div>';
   if(t.block===id){
    rows+='<div class="trows">'+rowsOf(id).map(function(r){
     const rc=t.row===r.r?' on':'';
     return '<button class="trowbtn'+rc+'" onclick="App.selRow('+r.r+')">R'+pad(r.r)+' · '+r.count+'</button>';
    }).join('')+'</div>';
   }
  });
  const empty=ids.length?'':'<div style="padding:4px 26px 10px;font-size:11px;color:var(--ink3)">لا بلوكات — أضف بلوك جديد</div>';
  return '<div class="tsec"><button>'+ic('chev',13)+'<b style="font-size:12px">'+sec.name+'</b>'+
  '<span>'+ids.length+' بلوك · '+fmt(palms)+' نخلة</span>'+
  '<span class="edt" title="تعديل الاسم" onclick="event.stopPropagation();App.sectorRename(\''+sec.id+'\')">'+ic('wrench',11)+'</span>'+
  '</button>'+rows+empty+'</div>';
 }).join('');
 let pane;
 if(t.row&&t.block){pane=rowPane(t.block,t.row);}
 else if(t.block){pane=blockPane(t.block);}
 else{pane=farmPane();}
 return '<div class="ph"><div><h1>هيكل المزرعة</h1><p>التقسيم بالكامل من هنا — القطاعات والبلوكات والنخيل</p></div>'+
 '<div style="display:flex;gap:8px;flex-wrap:wrap">'+
 '<button class="btn" onclick="App.sectorForm()">'+ic('plus',13)+' قطاع جديد</button>'+
 '<button class="btn ghost" onclick="App.blockForm(null)">'+ic('plus',13)+' بلوك جديد</button>'+
 '<button class="btn ghost" onclick="App.go(\'mapedit\')">'+ic('map',13)+' محرر الخريطة</button>'+
 '</div></div>'+
 '<div class="duo"><section class="card tree"><div class="cb flush" style="padding:4px 0">'+tree+'</div></section>'+
 '<div class="col">'+pane+'</div></div>';
}
PAGES.structure.render=renderStructure2;

/* ============ محرر الخريطة ============ */
function renderMapEdit(){
 const groups=BIDS().map(function(id){
  const b=S.map.blocks[id];
  if(!b)return '';
  const blk=S.blocks[id];
  let rows='';
  for(let ry=b[1]+42;ry<=b[1]+b[3]-26;ry+=22){
   rows+='<line class="prow" x1="'+(b[0]+30)+'" x2="'+(b[0]+b[2]-30)+'" y1="'+ry+'" y2="'+ry+'"/>';
  }
  return '<g class="edg" data-bk="'+id+'">'+
  '<rect class="ebk" x="'+b[0]+'" y="'+b[1]+'" width="'+b[2]+'" height="'+b[3]+'" rx="8" fill="#EFEADA" stroke="#A8A28D" stroke-width="1.8"/>'+
  rows+
  '<text class="bid" x="'+(b[0]+16)+'" y="'+(b[1]+24)+'">'+id+'</text>'+
  '<text class="bcount" x="'+(b[0]+b[2]-16)+'" y="'+(b[1]+24)+'">'+fmt(blk.palms)+' نخلة</text>'+
  '<circle class="rsz" data-bk="'+id+'" cx="'+(b[0]+b[2])+'" cy="'+(b[1]+b[3])+'" r="8" fill="#2F5D3B"/>'+
  '</g>';
 }).join('');
 let grid='';
 for(let gx=28;gx<1120;gx+=28){grid+='<line x1="'+gx+'" y1="58" x2="'+gx+'" y2="708" stroke="#EAE5D3" stroke-width="1"/>';}
 for(let gy=86;gy<708;gy+=28){grid+='<line x1="14" y1="'+gy+'" x2="1106" y2="'+gy+'" stroke="#EAE5D3" stroke-width="1"/>';}
 const empty=BIDS().length?'':'<div class="hint">لا توجد بلوكات بعد — أضف بلوكاتك من زر «بلوك جديد» ثم اضبط مواضعها بالسحب</div>';
 return '<div class="ph"><div><h1>محرر الخريطة</h1><p>ارسم مزرعتك بنفسك — اسحب أي بلوك لتحريكه، واسحب الدائرة الخضراء بزاوية كل بلوك لتغيير حجمه</p></div>'+
 '<div style="display:flex;gap:8px;flex-wrap:wrap">'+
 '<button class="btn" onclick="App.blockForm(null)">'+ic('plus',13)+' بلوك جديد</button>'+
 '<button class="btn ghost" onclick="App.autoLayout()">'+ic('refresh',13)+' تخطيط تلقائي</button>'+
 '<button class="btn ghost" onclick="App.go(\'map\')">'+ic('map',13)+' عرض الخريطة</button>'+
 '</div></div>'+
 '<section class="card"><header class="ch"><div class="ch-t">'+ic('map',15)+'<h2>لوحة الرسم</h2></div>'+
 '<span style="font-size:11px;color:var(--ink3)">الحفظ تلقائي بعد كل حركة — التعديل بيتنعكس فورًا على الخريطة الحية بكل الشاشات</span></header>'+
 '<div class="map-wrap tall" style="height:600px">'+
 '<svg id="edsvg" viewBox="0 0 1120 714" class="mapv" preserveAspectRatio="xMidYMid meet">'+
 grid+mapStatic()+groups+'</svg></div></section>'+empty;
}
PAGES.mapedit={title:'محرر الخريطة',icon:'map',render:renderMapEdit};
(function(){
 for(let i=0;i<NAV.length;i++){
  if(NAV[i][0]==='map'){NAV.splice(i+1,0,['mapedit']);break;}
 }
 ['manager','agri'].forEach(function(r){
  if(ROLES[r].pages.indexOf('mapedit')<0)ROLES[r].pages.push('mapedit');
 });
})();

/* ============ سحب وتغيير حجم البلوكات ============ */
(function(){
 if(window.__edWired)return;
 window.__edWired=true;
 let drag=null;
 document.addEventListener('mousedown',function(e){
  if(!document.getElementById('edsvg'))return;
  const g=e.target.closest?e.target.closest('.edg'):null;
  if(!g||!g.getAttribute('data-bk'))return;
  const rsz=e.target.closest?e.target.closest('.rsz'):null;
  const id=g.getAttribute('data-bk');
  const box=S.map.blocks[id];
  if(!box)return;
  const svg=document.getElementById('edsvg');
  const p=svgPoint(svg,e.clientX,e.clientY);
  if(rsz){drag={mode:'resize',id:id,g:g,svg:svg,orig:box.slice()};}
  else{drag={mode:'move',id:id,g:g,svg:svg,orig:box.slice(),dx:p.x-box[0],dy:p.y-box[1]};}
  e.preventDefault();
 });
 document.addEventListener('mousemove',function(e){
  if(!drag||!document.getElementById('edsvg'))return;
  const p=svgPoint(drag.svg,e.clientX,e.clientY);
  const box=S.map.blocks[drag.id];
  if(drag.mode==='move'){
   box[0]=Math.round(clamp(p.x-drag.dx,70,1082-box[2]));
   box[1]=Math.round(clamp(p.y-drag.dy,118,648-box[3]));
   drag.g.setAttribute('transform','translate('+(box[0]-drag.orig[0])+','+(box[1]-drag.orig[1])+')');
  }else{
   box[2]=Math.round(clamp(p.x-box[0],90,1090-box[0]));
   box[3]=Math.round(clamp(p.y-box[1],80,648-box[1]));
   const r=drag.g.querySelector('.ebk');
   r.setAttribute('width',box[2]);r.setAttribute('height',box[3]);
   const z=drag.g.querySelector('.rsz');
   z.setAttribute('cx',box[0]+box[2]);z.setAttribute('cy',box[1]+box[3]);
  }
 });
 document.addEventListener('mouseup',function(){
  if(!drag)return;
  const id=drag.id;drag=null;
  commit();toast('تم حفظ موضع '+id);
 });
})();

/* ============ نموذج إضافة/تعديل بلوك ============ */
App.blockForm=function(id){
 const b=id?S.blocks[id]:null;
 const secOpts=S.sectors.map(function(s){
  const sel=b&&b.sector===s.id?' selected':'';
  return '<option value="'+s.id+'"'+sel+'>'+s.id+' — '+s.name+'</option>';
 }).join('');
 modal(id?('تعديل البلوك '+id):'بلوك جديد',
 '<div class="frm">'+
 '<label>القطاع<select id="be-sec"'+(id?' disabled':'')+'>'+secOpts+'</select></label>'+
 '<label>المسافات<input id="be-spacing" value="'+(b?b.spacing:'9×9 م')+'"></label>'+
 '<label>عدد النخيل<input type="number" id="be-palms" value="'+(b?b.palms:500)+'"></label>'+
 '<label>النخيل المثمر<input type="number" id="be-prod" value="'+(b?b.prod:450)+'"></label>'+
 '<label>عدد الصفوف<input type="number" id="be-rows" value="'+(b?b.rows:5)+'"></label>'+
 '<label>سنة الغراسة<input type="number" id="be-planted" value="'+(b?b.planted:(new Date().getFullYear()-1))+'"></label>'+
 '<label>المساحة (فدان)<input type="number" step="0.1" id="be-area" value="'+(b?b.area:9)+'"></label>'+
 '<label>تصرف الري (م³/س)<input type="number" id="be-flow" value="'+(b?b.flow:50)+'"></label>'+
 '<label>فترة الري (أيام)<input type="number" id="be-irrig" value="'+(b?b.irrigInterval:3)+'"></label>'+
 '<label>آخر ري<input type="date" id="be-lastirr" value="'+(b?b.lastIrr:dOff(-1))+'"></label>'+
 '<label>فترة التسميد (أيام)<input type="number" id="be-fert" value="'+(b?b.fertInterval:15)+'"></label>'+
 '<label>آخر تسميد<input type="date" id="be-lastfert" value="'+(b?b.lastFert:dOff(-10))+'"></label>'+
 '<label>إنتاج متوقع كجم/نخلة<input type="number" step="0.1" id="be-kgp" value="'+(b?b.kgp:9)+'"></label>'+
 '<label>الإنتاج الفعلي حتى الآن<input type="number" id="be-act" value="'+(b?b.act:0)+'"></label>'+
 '<label>pH التربة<input type="number" step="0.1" id="be-ph" value="'+(b?b.ph:7.5)+'"></label>'+
 '<label>EC التربة<input type="number" step="0.1" id="be-ec" value="'+(b?b.ec:3.8)+'"></label>'+
 '<label class="full">المادة العضوية OM%<input type="number" step="0.1" id="be-om" value="'+(b?b.om:1)+'"></label>'+
 '</div>'+
 (id?'':'<p class="mhint">سيوضع البلوك في مكانه تلقائيًا — بعدها اضبط موضعه بالسحب من «محرر الخريطة».</p>'),
 '<button class="btn ghost" onclick="App.closeModal()">إلغاء</button>'+
 '<button class="btn" onclick="App.blockSave('+(id?'\''+id+'\'':'null')+')">'+ic('check',13)+' حفظ البلوك</button>');
};
App.blockSave=function(id){
 const g=function(k){return document.getElementById('be-'+k).value;};
 const palms=+g('palms')||0;
 if(palms<1){toast('أدخل عدد نخيل صحيح','warn');return;}
 const data={
  sector:id?S.blocks[id].sector:g('sec'),
  palms:palms,
  prod:Math.min(+g('prod')||0,palms),
  rows:Math.max(1,+g('rows')||1),
  spacing:g('spacing')||'9×9 م',
  planted:+g('planted')||(new Date().getFullYear()-1),
  area:+g('area')||0,
  flow:+g('flow')||40,
  irrigInterval:Math.max(1,+g('irrig')||3),
  lastIrr:g('lastirr')||todayISO,
  fertInterval:Math.max(1,+g('fert')||15),
  lastFert:g('lastfert')||dOff(-10),
  kgp:+g('kgp')||8,
  act:+g('act')||0,
  ph:+g('ph')||7.5,
  ec:+g('ec')||3.8,
  om:+g('om')||1
 };
 if(id){
  Object.assign(S.blocks[id],data);
  audit('تعديل بلوك '+id);
  App.closeModal();commit();toast('تم حفظ بيانات '+id+' — الحالة والتنبيهات اتحسبت من جديد');
 }else{
  const nid=nextBlockId(data.sector);
  S.blocks[nid]=data;
  S.map.blocks[nid]=[90,150,280,170];
  autoLayout();
  audit('إضافة بلوك '+nid);
  App.closeModal();commit();
  toast('تم إضافة '+nid+' — عدّل موضعه بالسحب من محرر الخريطة');
 }
};
App.delBlock=function(id){
 modal('حذف البلوك '+id,
 '<p class="mhint">سيُحذف البلوك وكل سجلاته (مهام، عمليات، حصاد، تلقيح، تحليلات). لا يمكن التراجع — يفضّل تصدير نسخة احتياطية أولًا من الإعدادات.</p>',
 '<button class="btn ghost" onclick="App.closeModal()">إلغاء</button>'+
 '<button class="btn warn" onclick="App.doDelBlock(\''+id+'\')">تأكيد الحذف</button>');
};
App.doDelBlock=function(id){
 delete S.blocks[id];
 delete S.map.blocks[id];
 S.tasks=S.tasks.filter(function(t){return t.block!==id;});
 S.operations=S.operations.filter(function(o){return o.block!==id;});
 S.harvest=S.harvest.filter(function(h){return h.block!==id;});
 S.irrigationLog=S.irrigationLog.filter(function(l){return l.block!==id;});
 S.pollination=S.pollination.filter(function(p){return p.block!==id;});
 S.soil=S.soil.filter(function(s){return s.block!==id;});
 if(S.ui.tree&&S.ui.tree.block===id){S.ui.tree={block:null,row:null};}
 if(S.ui.sel===id)S.ui.sel=null;
 audit('حذف بلوك '+id);
 App.closeModal();commit();toast('تم حذف '+id+' وكل سجلاته');
};

/* ============ القطاعات ============ */
App.sectorForm=function(){
 const letters='ABCDEFGHJKLMNPQRSTUVWXYZ';
 let letter='';
 for(let i=0;i<letters.length;i++){
  const L=letters.charAt(i);
  if(!S.sectors.some(function(s){return s.id===L;})){letter=L;break;}
 }
 if(!letter){toast('وصلت للحد الأقصى من القطاعات','warn');return;}
 modal('قطاع جديد',
 '<div class="frm"><label class="full">اسم القطاع<input id="sc-name" placeholder="مثال: القطاع الشرقي"></label></div>'+
 '<p class="mhint">حرف القطاع هيكون '+letter+' — بلوكاته هتترقّم '+letter+'01، '+letter+'02 ...</p>',
 '<button class="btn ghost" onclick="App.closeModal()">إلغاء</button>'+
 '<button class="btn" onclick="App.sectorSave(\''+letter+'\')">'+ic('check',13)+' إضافة القطاع</button>');
};
App.sectorSave=function(letter){
 const name=document.getElementById('sc-name').value.trim()||('القطاع '+letter);
 S.sectors.push({id:letter,name:name});
 audit('إضافة قطاع '+letter);
 App.closeModal();commit();toast('تم إضافة القطاع — أضف بلوكاته الآن');
};
App.sectorRename=function(sid){
 const sec=S.sectors.find(function(s){return s.id===sid;});
 modal('تعديل القطاع '+sid,
 '<div class="frm"><label class="full">اسم القطاع<input id="sr-name" value="'+sec.name+'"></label></div>',
 '<button class="btn ghost" onclick="App.closeModal()">إلغاء</button>'+
 '<button class="btn" onclick="App.sectorRenameSave(\''+sid+'\')">'+ic('check',13)+' حفظ</button>');
};
App.sectorRenameSave=function(sid){
 const n=document.getElementById('sr-name').value.trim();
 if(!n){toast('اكتب اسم القطاع','warn');return;}
 S.sectors.find(function(s){return s.id===sid;}).name=n;
 audit('تعديل قطاع '+sid);
 App.closeModal();commit();toast('تم حفظ اسم القطاع');
};

/* ============ بحث وسجل نخلة بيفهموا القطاعات الجديدة ============ */
App.searchGo=function(){
 const letters=S.sectors.map(function(s){return s.id;}).join('');
 const v=document.getElementById('q').value.trim().toUpperCase();
 const m=v.match(new RegExp('^(['+letters+']\\d{2})-R\\d{2}-P\\d{3}$'));
 if(m&&S.blocks[v.slice(0,3)])App.openPalm(v);
 else toast('صيغة رقم النخلة: A01-R05-P027 — تأكد من القطاع والصف والرقم','warn');
};
PAGES.palm.render=function(){
 const letters=S.sectors.map(function(s){return s.id;}).join('');
 const rx=new RegExp('^(['+letters+']\\d{2})-R(\\d{2})-P(\\d{3})$');
 const id=S.ui.palm||'A01-R05-P027';
 const m=id.match(rx);
 if(!m||!S.blocks[m[1]]){return '<div class="hint">رقم نخلة غير صالح</div>';}
 const bid=m[1],row=parseInt(m[2],10);
 const p=palmData(bid,row,parseInt(m[3],10)),b=S.blocks[bid];
 const engNotes=['متوسط حجم الثمار ضمن المستهدف — استمرار برنامج الري الحالي','يحتاج تقليم جريد في الدورة القادمة','نمو سعف جيد بعد برنامج البوتاسيوم الأخير','متابعة الإنتاج مع خف العذوق القادم'];
 const note=engNotes[(p.id.length*7)%engNotes.length];
 const stBdg=p.st==='ok'?bdg('ok','مثمرة — سليمة'):p.st==='watch'?bdg('due','تحتاج متابعة'):p.st==='unprod'?bdg('done','غير مثمرة'):bdg('late','إصابة آفة');
 const age=new Date().getFullYear()-p.planted;
 const opsHtml=S.operations.filter(function(o){return o.block===bid;}).slice(0,3).map(opRowM).join('')||'<div class="hint">لا عمليات</div>';
 return '<div class="ph"><div><h1>سجل النخلة</h1><p>الملف الفردي — أساس تتبع الإنتاج والمشاكل</p></div>'+
 '<div style="display:flex;gap:8px">'+
 '<button class="btn ghost sm" onclick="App.selBlk(\''+bid+'\')">'+ic('palm',13)+' في الهيكل</button>'+
 '<button class="btn ghost sm" onclick="App.go(\'map\')">'+ic('map',13)+' البلوك بالخريطة</button></div></div>'+
 '<section class="card"><div class="cb">'+
 '<div class="bhead"><div><span class="bid-big">'+p.id+'</span><div class="bsector">'+sectorName(b.sector)+' · Block '+bid+' · الصف R'+pad(row)+'</div></div>'+
 '<div class="bbs">'+stBdg+bdg('info','Medjool مجدول')+'</div></div>'+
 '<dl class="kv">'+
 '<div><dt>تاريخ الزراعة</dt><dd>موسم '+p.planted+' — عمر '+age+' سنة</dd></div>'+
 '<div><dt>مصدر الشتلة</dt><dd>مشتل المزرعة — فسائل معتمدة</dd></div>'+
 '<div><dt>آخر ري (البلوك)</dt><dd>'+fd(b.lastIrr)+' <em>('+irrState(bid).label+')</em></dd></div>'+
 '<div><dt>آخر تسميد</dt><dd>'+fd(b.lastFert)+'</dd></div>'+
 '<div><dt>عدد العذوق</dt><dd>'+p.bunches+' عذق</dd></div>'+
 '<div><dt>الإنتاج المتوقع</dt><dd>'+p.yield+' كجم</dd></div>'+
 '<div><dt>متوسط وزن الثمرة</dt><dd>'+p.weight+' جم</dd></div>'+
 '<div><dt>مشاكل / آفات</dt><dd style="font-weight:500;font-size:12px">'+p.note+'</dd></div></dl>'+
 '<div style="margin-top:14px;padding:12px 14px;background:var(--soft);border-radius:10px;border:1px dashed var(--line)">'+
 '<b style="font-size:11.5px;color:var(--ink2)">ملاحظة المهندس الزراعي</b>'+
 '<p style="font-size:12.5px;margin-top:3px">'+note+'</p></div>'+
 '</div></section>'+
 card('آخر العمليات على Block '+bid,'sprout',opsHtml);
};

render();

render();