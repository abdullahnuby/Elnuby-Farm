/* ============ أدوات أساسية ============ */
const $=s=>document.querySelector(s);
const fmt=n=>(+n).toLocaleString('en-US');
const pad=n=>String(n).padStart(2,'0');
const todayISO=(()=>{const t=new Date();return t.getFullYear()+'-'+pad(t.getMonth()+1)+'-'+pad(t.getDate())})();
const dOff=n=>{const t=new Date();t.setDate(t.getDate()+n);return t.getFullYear()+'-'+pad(t.getMonth()+1)+'-'+pad(t.getDate())};
const pd=s=>new Date(s+'T00:00:00');
const dd=s=>Math.round((pd(s)-pd(todayISO))/864e5);
const rel=s=>{const x=dd(s);return x===0?'اليوم':x===-1?'أمس':x===1?'غدًا':x<0?`منذ ${-x} أيام`:`بعد ${x} أيام`};
const fd=s=>pd(s).toLocaleDateString('ar-EG',{day:'numeric',month:'short'});
const SAR=n=>fmt(Math.round(n))+' ريال';
const bdg=(k,t)=>`<span class="bdg ${k}"><i></i>${t}</span>`;
const mix=(a,b,t)=>{const A=parseInt(a.slice(1),16),B=parseInt(b.slice(1),16);return '#'+[16,8,0].map(sh=>Math.round((A>>sh&255)*(1-t)+(B>>sh&255)*t).toString(16).padStart(2,'0')).join('')};
const ic=(n,s=18)=>`<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${IC[n]||''}</svg>`;
const IC={
dashboard:'<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
palm:'<path d="M12 22c.5-4.2.6-7.6.3-10.4"/><path d="M12.3 11.6C10.5 9.8 8 9.3 5.2 10.4c1.5-2.7 4-3.8 7.1-2.9"/><path d="M12.3 11.6c1.8-1.8 4.3-2.3 7.1-1.2-1.5-2.7-4-3.8-7.1-2.9"/><path d="M12.1 9.2C10.6 7 10.7 4.6 12 2c1.3 2.6 1.4 5-.1 7.2"/><path d="M12.4 14.5c-1.7.5-3.3.2-4.6-1M12.4 14.5c1.7.5 3.3.2 4.6-1"/><path d="M8.5 22h7"/>',
drop:'<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0C6 9.5 12 3 12 3z"/><path d="M9.5 14a2.6 2.6 0 0 0 2.5 3"/>',
leaf:'<path d="M4 20c0-9 5-14 16-15-1 11-6 16-14 15"/><path d="M4 20c3-6 7-10 12-12"/>',
sprout:'<path d="M12 22v-8"/><path d="M12 14c-4.2 0-6.5-2.6-6.5-6.5 4.2 0 6.5 2.6 6.5 6.5z"/><path d="M12 14c4.2 0 6.5-2.6 6.5-6.5-4.2 0-6.5 2.6-6.5 6.5z"/>',
wheat:'<path d="M12 22V7"/><path d="M12 11.5c-2.3 0-4.2-1.4-4.2-4.2 2.3 0 4.2 1.4 4.2 4.2zM12 11.5c2.3 0 4.2-1.4 4.2-4.2-2.3 0-4.2 1.4-4.2 4.2z"/><path d="M12 16.5c-2.3 0-4.2-1.4-4.2-4.2 2.3 0 4.2 1.4 4.2 4.2zM12 16.5c2.3 0 4.2-1.4 4.2-4.2-2.3 0-4.2 1.4-4.2 4.2z"/>',
box:'<path d="M12 3l8 4.5v9L12 21l-8-4.5v-9L12 3z"/><path d="M4 7.5l8 4.5 8-4.5M12 12v9"/>',
chart:'<path d="M4 20V4"/><path d="M4 20h16"/><rect x="7" y="12" width="3.2" height="5"/><rect x="12" y="8" width="3.2" height="9"/><rect x="17" y="5" width="3.2" height="12"/>',
users:'<circle cx="9" cy="8" r="3.4"/><path d="M3 20c.5-3.5 3-5.5 6-5.5s5.5 2 6 5.5"/><circle cx="17" cy="9" r="2.5"/><path d="M16.2 14.6c2.7.4 4.5 2.2 4.9 5.4"/>',
wrench:'<path d="M14.7 6.3a4.6 4.6 0 0 0-6.1 5.7L3 17.6 6.4 21l5.6-5.6a4.6 4.6 0 0 0 5.7-6.1L14 12.4l-2.4-2.4 3.1-3.7z"/>',
bell:'<path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6z"/><path d="M10 19a2 2 0 0 0 4 0"/>',
map:'<path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z"/><path d="M9 4v14M15 6v14"/>',
tasks:'<rect x="4" y="3" width="16" height="18" rx="2.2"/><path d="M8 8.5h8M8 12.5h8M8 16.5h5"/><path d="M15.5 16l1.7 1.7 2.6-3"/>',
gear:'<circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2-1.2L14 3h-4l-.4 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 2 1.2L10 21h4l.4-2.6a7 7 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2z"/>',
check:'<path d="M4.5 12.5l5 5 10-11"/>',x:'<path d="M6 6l12 12M18 6L6 18"/>',
chev:'<path d="M14.5 5.5L8 12l6.5 6.5"/>',
flask:'<path d="M9 3h6M10 3v5l-5.4 9a2 2 0 0 0 1.7 3h11.4a2 2 0 0 0 1.7-3L14 8V3"/><path d="M7.3 15.5h9.4"/>',
download:'<path d="M12 3v11M7.5 10.5L12 15l4.5-4.5"/><path d="M4 19h16"/>',
upload:'<path d="M12 14V3M7.5 7L12 2.5 16.5 7"/><path d="M4 19h16"/>',
refresh:'<path d="M20 11a8 8 0 0 0-14.5-4M4 13a8 8 0 0 0 14.5 4"/><path d="M5.5 3v4h4M18.5 21v-4h-4"/>',
cart:'<circle cx="9" cy="20" r="1.6"/><circle cx="17" cy="20" r="1.6"/><path d="M3 4h2l2.6 12h10.8L21 8H7"/>',
coins:'<circle cx="9" cy="9" r="5.5"/><path d="M14.6 8.4A5.5 5.5 0 1 1 8 15.6"/><path d="M6.5 11h5M6.5 8.5h5"/>',
wallet:'<rect x="3" y="6" width="18" height="14" rx="2.5"/><path d="M3 10h18"/><circle cx="16.5" cy="15" r="1.3"/>',
shield:'<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z"/><path d="M9 11.5l2 2 4-4"/>',
truck:'<path d="M3 6h11v10H3z"/><path d="M14 9h4l3 3v4h-7"/><circle cx="7" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/>',
doc:'<path d="M6 2h9l5 5v15H6z"/><path d="M14 2v6h6"/><path d="M9 13h6M9 16.5h6"/>',
logout:'<path d="M9 4H4v16h5"/><path d="M20 12H9"/><path d="M15 7l5 5-5 5"/>'
};

/* ============ قاعدة البيانات ============ */
const KEY='medjool-farm-v2';
function SEED(){
 return {
 farm:{name:'مزرعة نخيل المجدول',owner:'عبدالله المطيري',location:'الأحساء — طريق الرياض القصيم',area:118,water:'بئران عميقان + خزان أرضي 500 م³',soil:'رملية طينية — EC 3.8',power:'شبكة كهرباء + مولد احتياطي',established:2016},
 users:[
  {u:'owner',pw:'1234',name:'عبدالله المطيري',role:'owner',active:1},
  {u:'manager',pw:'1234',name:'م. سالم القحطاني',role:'manager',active:1},
  {u:'agri',pw:'1234',name:'م. نورة العتيبي',role:'agri',active:1},
  {u:'store',pw:'1234',name:'أبو كريم سيد أحمد',role:'store',active:1},
  {u:'account',pw:'1234',name:'حسام الدين',role:'account',active:1},
  {u:'maint',pw:'1234',name:'محمد إقبال',role:'maint',active:1},
  {u:'consult',pw:'1234',name:'م. فهد الدوسري',role:'consult',active:1}
 ],
 sectors:[{id:'A',name:'القطاع الأوسط'},{id:'B',name:'القطاع الشمالي'},{id:'C',name:'القطاع الجنوبي'}],
 blocks:{
  A01:{sector:'A',palms:980,prod:902,rows:8,spacing:'9×9 م',planted:2016,area:17.5,flow:62,irrigInterval:3,lastIrr:dOff(0),fertInterval:15,lastFert:dOff(-8),kgp:10.0,act:9340,ph:7.4,ec:3.6,om:1.2},
  A02:{sector:'A',palms:920,prod:845,rows:8,spacing:'9×9 م',planted:2016,area:16.4,flow:62,irrigInterval:3,lastIrr:dOff(-3),fertInterval:15,lastFert:dOff(-12),kgp:9.3,act:7920,ph:7.6,ec:3.9,om:1.0},
  A03:{sector:'A',palms:760,prod:703,rows:7,spacing:'9×9 م',planted:2017,area:13.6,flow:55,irrigInterval:3,lastIrr:dOff(-5),fertInterval:15,lastFert:dOff(-16),kgp:9.0,act:5980,ph:7.8,ec:4.2,om:0.9},
  B01:{sector:'B',palms:970,prod:889,rows:8,spacing:'9×9 م',planted:2016,area:17.3,flow:62,irrigInterval:4,lastIrr:dOff(0),fertInterval:15,lastFert:dOff(-6),kgp:9.1,act:8420,ph:7.3,ec:3.5,om:1.3},
  B02:{sector:'B',palms:890,prod:812,rows:8,spacing:'9×9 م',planted:2017,area:15.9,flow:62,irrigInterval:4,lastIrr:dOff(-4),fertInterval:15,lastFert:dOff(-9),kgp:8.9,act:0,ph:7.5,ec:3.7,om:1.1},
  B03:{sector:'B',palms:640,prod:568,rows:6,spacing:'9×9 م',planted:2018,area:11.4,flow:48,irrigInterval:4,lastIrr:dOff(-6),fertInterval:15,lastFert:dOff(-17),kgp:8.4,act:0,ph:7.9,ec:4.6,om:0.8},
  C01:{sector:'C',palms:780,prod:706,rows:7,spacing:'9×9 م',planted:2018,area:13.9,flow:56,irrigInterval:3,lastIrr:dOff(-2),fertInterval:15,lastFert:dOff(-4),kgp:8.8,act:0,ph:7.2,ec:3.3,om:1.4},
  C02:{sector:'C',palms:580,prod:512,rows:5,spacing:'9×9 م',planted:2018,area:10.4,flow:42,irrigInterval:5,lastIrr:dOff(-5),fertInterval:15,lastFert:dOff(-12),kgp:8.7,act:0,ph:7.4,ec:3.8,om:1.1}
 },
 infra:[
  {item:'بئر 1',detail:'عمق 180 م — منسوب ثابت',pump:'P-01 غاطسة',flow:90,hours:4210,state:'سليم'},
  {item:'بئر 2',detail:'عمق 165 م',pump:'P-02 غاطسة',flow:84,hours:3960,state:'سليم'},
  {item:'طلمبة رئيسية P-03',detail:'ضخ الشبكة الرئيسية',pump:'P-03',flow:120,hours:12840,state:'صيانة وقائية بعد 40 ساعة'},
  {item:'خزان أرضي',detail:'سعة 500 م³ — تعبئة 2.5 ساعة',pump:'—',flow:'—',hours:'—',state:'سليم'},
  {item:'فلتر F-A (القطاع A)',detail:'شبكي 120 مش — كل 7 أيام',pump:'—',flow:'—',hours:'—',state:'آخر تنظيف منذ 6 أيام'},
  {item:'فلتر F-B (القطاع B)',detail:'شبكي 120 مش — كل 7 أيام',pump:'—',flow:'—',hours:'—',state:'نُظّف أمس'}
 ],
 soil:[
  {date:dOff(-40),block:'A01',ph:7.4,ec:3.6,om:1.2,n:42,p:18,k:220,na:210,cl:340,lab:'مختبر التربة — الأحساء'},
  {date:dOff(-38),block:'B03',ph:7.9,ec:4.6,om:0.8,n:28,p:11,k:150,na:390,cl:520,lab:'مختبر التربة — الأحساء'},
  {date:dOff(-36),block:'C01',ph:7.2,ec:3.3,om:1.4,n:48,p:22,k:260,na:170,cl:280,lab:'مختبر التربة — الأحساء'}
 ],
 water:[
  {date:dOff(-60),src:'بئر 1',ph:7.1,ec:2.2,tds:1410,sar:6.8,na:180,cl:190,hco3:210,lab:'مختبر المياه — الأحساء'},
  {date:dOff(-60),src:'بئر 2',ph:7.3,ec:2.6,tds:1660,sar:8.2,na:230,cl:240,hco3:245,lab:'مختبر المياه — الأحساء'}
 ],
 pollination:[
  {date:dOff(-215),block:'A01',palms:902,bunches:8100,src:'لقاح فحول المزرعة',qty:12,worker:'فريق التلقيح — راجيش'},
  {date:dOff(-212),block:'A02',palms:845,bunches:7300,src:'لقاح فحول المزرعة',qty:11,worker:'فريق التلقيح — راجيش'},
  {date:dOff(-208),block:'A03',palms:703,bunches:5900,src:'لقاح فحول المزرعة',qty:9,worker:'فريق التلقيح — سونو'},
  {date:dOff(-205),block:'B01',palms:889,bunches:8200,src:'لقاح خارجي معتمد',qty:13,worker:'فريق التلقيح — راجيش'},
  {date:dOff(-200),block:'B02',palms:812,bunches:7000,src:'لقاح فحول المزرعة',qty:10,worker:'فريق التلقيح — سونو'},
  {date:dOff(-195),block:'B03',palms:568,bunches:4600,src:'لقاح فحول المزرعة',qty:8,worker:'فريق التلقيح — سونو'},
  {date:dOff(-190),block:'C01',palms:706,bunches:6800,src:'لقاح خارجي معتمد',qty:11,worker:'فريق التلقيح — راجيش'},
  {date:dOff(-186),block:'C02',palms:512,bunches:4400,src:'لقاح فحول المزرعة',qty:7,worker:'فريق التلقيح — سونو'}
 ],
 inventory:[
  {code:'F-NPK',cat:'agri',name:'مركب NPK 20-20-20',unit:'كجم',qty:2200,min:1500,price:8.2,cover:8},
  {code:'F-KNO3',cat:'agri',name:'نترات بوتاسيوم 13-0-46',unit:'كجم',qty:950,min:500,price:6.8},
  {code:'F-UREA',cat:'agri',name:'يوريا 46%',unit:'كجم',qty:400,min:600,price:3.1},
  {code:'F-MAP',cat:'agri',name:'مونوفوسفات الأمونيوم',unit:'كجم',qty:620,min:400,price:9.4},
  {code:'F-MGSO4',cat:'agri',name:'سلفات مغنيسيوم',unit:'كجم',qty:1800,min:800,price:3.9},
  {code:'F-CANO',cat:'agri',name:'نترات كالسيوم',unit:'كجم',qty:350,min:250,price:5.2},
  {code:'F-CH',cat:'agri',name:'عناصر صغرى مخلبية',unit:'كجم',qty:140,min:80,price:21.0},
  {code:'P-CHL',cat:'agri',name:'مبيد كلوربيريفوس 48%',unit:'لتر',qty:60,min:40,price:74.0,exp:dOff(25)},
  {code:'P-OIL',cat:'agri',name:'زيت معدني صيفي',unit:'لتر',qty:340,min:200,price:18.5},
  {code:'S-VLV',cat:'parts',name:'محبس كروي 2 بوصة',unit:'قطعة',qty:8,min:10,price:85},
  {code:'S-EMT',cat:'parts',name:'نقّات 8 لتر/ساعة',unit:'قطعة',qty:2400,min:1500,price:3.4},
  {code:'S-FLT',cat:'parts',name:'فلتر شبكي 120 مش',unit:'قطعة',qty:6,min:4,price:260},
  {code:'K-CTN',cat:'pack',name:'كرتونة طباعة 5 كجم',unit:'كرتونة',qty:4200,min:3000,price:7.5},
  {code:'K-TRAY',cat:'pack',name:'أطباق تغليف (فوم)',unit:'طبق',qty:18500,min:10000,price:0.85},
  {code:'K-PLT',cat:'pack',name:'بالت خشبي',unit:'قطعة',qty:210,min:120,price:38},
  {code:'PR-A',cat:'produce',name:'مجدول Grade A',unit:'كجم',qty:2990,min:0,price:27.5,age:3},
  {code:'PR-B',cat:'produce',name:'مجدول Grade B',unit:'كجم',qty:1090,min:0,price:19.0,age:5},
  {code:'PR-C',cat:'produce',name:'مجدول Grade C',unit:'كجم',qty:1280,min:0,price:12.0,age:12},
  {code:'PR-RUT',cat:'produce',name:'مجروش دري',unit:'كجم',qty:480,min:0,price:8.0,age:9}
 ],
 program:{name:'برنامج التسميد — مرحلة نمو وتخضين الثمار (سبتمبر)',target:['A03','B03'],items:[
  {mat:'F-KNO3',dose:1.2},{mat:'F-UREA',dose:0.5},{mat:'F-MGSO4',dose:0.4},{mat:'F-CH',dose:0.08}
 ]},
 purchaseReq:[],
 tasks:[
  {id:'T-1049',type:'irrigation',title:'ري Block A03',block:'A03',planned:dOff(-2),priority:'high',status:'pending',assign:'م. سالم'},
  {id:'T-1050',type:'irrigation',title:'ري Block B03',block:'B03',planned:dOff(-3),priority:'high',status:'pending',assign:'م. سالم'},
  {id:'T-1052',type:'irrigation',title:'ري Block A02',block:'A02',planned:dOff(0),priority:'high',status:'pending',assign:'م. سالم'},
  {id:'T-1053',type:'irrigation',title:'ري Block B02',block:'B02',planned:dOff(0),priority:'high',status:'pending',assign:'م. سالم'},
  {id:'T-1054',type:'irrigation',title:'ري Block C02',block:'C02',planned:dOff(0),priority:'normal',status:'pending',assign:'م. سالم'},
  {id:'T-1046',type:'fertilization',title:'تسميد Block A03 — برنامج نمو الثمار',block:'A03',planned:dOff(-1),priority:'high',status:'pending',assign:'م. نورة'},
  {id:'T-1047',type:'fertilization',title:'تسميد Block B03 — توصية الاستشاري (بوتاسيوم)',block:'B03',planned:dOff(-2),priority:'high',status:'pending',assign:'م. نورة'},
  {id:'T-1044',type:'maintenance',title:'تنظيف فلاتر القطاع B',block:'B02',planned:dOff(0),priority:'normal',status:'pending',assign:'فريق الصيانة'},
  {id:'T-1045',type:'maintenance',title:'صيانة وقائية — الطلمبة P-03',block:'',planned:dOff(1),priority:'normal',status:'pending',assign:'فريق الصيانة'},
  {id:'T-1051',type:'harvest',title:'بدء حصاد Block B02',block:'B02',planned:dOff(1),priority:'high',status:'pending',assign:'م. سالم'},
  {id:'T-1039',type:'pruning',title:'تقليم وتنظيف جريد C01',block:'C01',planned:dOff(3),priority:'normal',status:'pending',assign:'م. نورة'},
  {id:'T-1042',type:'visit',title:'زيارة استشاري — م. فهد الدوسري',block:'B03',planned:dOff(1),priority:'normal',status:'pending',assign:'—'},
  {id:'T-1038',type:'irrigation',title:'ري Block B01',block:'B01',planned:dOff(0),priority:'normal',status:'done',assign:'م. سالم',doneAt:dOff(0)},
  {id:'T-1036',type:'irrigation',title:'ري Block A01',block:'A01',planned:dOff(0),priority:'normal',status:'done',assign:'م. سالم',doneAt:dOff(0)},
  {id:'T-1035',type:'fertilization',title:'تسميد Block C01',block:'C01',planned:dOff(-4),priority:'normal',status:'done',assign:'م. نورة',doneAt:dOff(-4)}
 ],
 irrigationLog:[
  {date:dOff(0),block:'B01',start:'05:30',hours:2,m3:124,src:'بئر 1 — P-01',by:'م. سالم'},
  {date:dOff(0),block:'A01',start:'06:00',hours:2.5,m3:155,src:'بئر 1 — P-01',by:'م. سالم'},
  {date:dOff(-1),block:'C01',start:'06:30',hours:3,m3:168,src:'بئر 2 — P-02',by:'م. سالم'},
  {date:dOff(-3),block:'A02',start:'06:00',hours:2.2,m3:137,src:'بئر 1 — P-01',by:'م. سالم'},
  {date:dOff(-4),block:'B02',start:'06:00',hours:2.1,m3:129,src:'بئر 1 — P-01',by:'م. سالم'},
  {date:dOff(-5),block:'A03',start:'06:30',hours:2.1,m3:118,src:'بئر 2 — P-02',by:'م. سالم'},
  {date:dOff(-5),block:'C02',start:'07:00',hours:2,m3:84,src:'بئر 2 — P-02',by:'م. سالم'},
  {date:dOff(-6),block:'B03',start:'06:00',hours:2.2,m3:104,src:'بئر 2 — P-02',by:'م. سالم'}
 ],
 operations:[
  {date:dOff(0),type:'ري',block:'B01',workers:2,materials:'—',note:'ري بالتنقيط 2 ساعة — 124 م³',cost:0},
  {date:dOff(0),type:'ري',block:'A01',workers:2,materials:'—',note:'ري بالتنقيط 2.5 ساعة — 155 م³',cost:0},
  {date:dOff(-1),type:'صيانة',block:'B02',workers:1,materials:'—',note:'تنظيف فلتر F-B',cost:350},
  {date:dOff(-2),type:'رش ومكافحة',block:'B02',workers:4,materials:'كلوربيريفوس 12 لتر',note:'رش وقائي ضد الإصابات',cost:1900},
  {date:dOff(-4),type:'تسميد',block:'C01',workers:6,materials:'نترات بوتاسيوم + يوريا',note:'تنفيذ برنامج التسميد الشهري',cost:2400},
  {date:dOff(-11),type:'حصاد',block:'A03',workers:14,materials:'—',note:'حصاد وتقوير — 5,980 كجم',cost:5600},
  {date:dOff(-19),type:'تسميد',block:'A01',workers:6,materials:'NPK + عناصر صغرى',note:'برنامج التسميد الشهري',cost:2900},
  {date:dOff(-22),type:'مكافحة حشائش',block:'C01',workers:5,materials:'—',note:'تنظيف أحواض وتجنيب الخطوط',cost:1150},
  {date:dOff(-30),type:'رش ومكافحة',block:'B03',workers:4,materials:'زيت معدني صيفي',note:'مكافحة العناكب الحمراء',cost:2100},
  {date:dOff(-45),type:'تقليم',block:'B01',workers:7,materials:'—',note:'تقليم وإزالة جريد زائد',cost:2800},
  {date:dOff(-88),type:'تغطية العذوق',block:'A01',workers:6,materials:'شبك تغطية 850 كجم',note:'تغطية عذوق المجدول',cost:5200},
  {date:dOff(-95),type:'خف الثمار',block:'A01',workers:9,materials:'—',note:'خف 30% من العذوق — تنفيذ توصية استشاري',cost:3600},
  {date:dOff(-208),type:'تكريب',block:'A02',workers:8,materials:'—',note:'تكريب الخلاف والكرب',cost:3200},
  {date:dOff(-215),type:'تلقيح',block:'A01',workers:12,materials:'لقاح من فحول المزرعة',note:'تلقيح 902 نخلة',cost:4800}
 ],
 harvest:[
  {date:dOff(-25),block:'A01',bunches:5900,weight:9340,gA:5600,gB:2800,gC:940,loss:4.2,team:14},
  {date:dOff(-18),block:'A02',bunches:5400,weight:7920,gA:4750,gB:2380,gC:790,loss:4.6,team:13},
  {date:dOff(-11),block:'A03',bunches:3900,weight:5980,gA:3590,gB:1790,gC:600,loss:5.1,team:12},
  {date:dOff(-5),block:'B01',bunches:5100,weight:8420,gA:5050,gB:2520,gC:850,loss:4.0,team:14}
 ],
 sales:{a:16000,b:8400,c:1900,pA:27.5,pB:19,pC:12},
 costs:{fert:118400,pest:47300,labor:262000,maint:36900,fuel:71500,pack:41200,admin:21100},
 waterMonthly:[1950,2200,2600,2900,3300,3600,3800,3520,3120,2620,2250,1980],
 suppliers:[
  {name:'الشركة الوطنية للأسمدة',phone:'011 456 7890',city:'الرياض',note:'أسمدة مركبة ويوريا'},
  {name:'هايديكو — وكيل محلي',phone:'013 582 4410',city:'الدمام',note:'نترات بوتاسيوم ومغذيات'},
  {name:'مصنع الورق المتحد',phone:'012 665 3300',city:'جدة',note:'كراتين وعبوات'},
  {name:'مؤسسة الري الحديث',phone:'013 887 2210',city:'الأحساء',note:'شبكات وقطع ري'},
  {name:'سابك — يوريا',phone:'011 220 0000',city:'الجبيل',note:'يوريا زراعية'}
 ],
 customers:[
  {name:'شركة التمور الذهبية',phone:'011 234 5678',city:'الرياض',note:'تصدير — Grade A'},
  {name:'سوق الجملة المركزي',phone:'011 987 6543',city:'الرياض',note:'جملة محلية'},
  {name:'أسواق الوفرة',phone:'012 555 0100',city:'جدة',note:'سلاسل تجزئة'},
  {name:'مصنع تمور الواحة',phone:'013 333 4400',city:'الدمام',note:'تصنيع — Grade B/C'}
 ],
 purch:[
  {id:'PU-1001',stage:4,date:dOff(-40),supplier:'هايديكو — وكيل محلي',items:[{code:'F-KNO3',qty:1000,price:6.8}],note:'دفعة نترات بوتاسيوم'},
  {id:'PU-1002',stage:2,date:dOff(-9),supplier:'مصنع الورق المتحد',items:[{code:'K-CTN',qty:3000,price:7.5}],note:'كراتين موسم الحصاد'},
  {id:'PU-1003',stage:0,date:dOff(0),supplier:'مؤسسة الري الحديث',items:[{code:'S-VLV',qty:20,price:85}],note:'محابس بديلة — ناتج عن تنبيه المخزون'},
  {id:'PU-1000',stage:5,date:dOff(-70),supplier:'سابك — يوريا',items:[{code:'F-UREA',qty:1500,price:3.1}],note:'مستند مكتمل للمرجعية'}
 ],
 salesDocs:[
  {id:'SA-2001',stage:2,date:dOff(-2),customer:'شركة التمور الذهبية',items:[{grade:'PR-A',qty:2000,price:27.5}],note:'شحنة تصدير'},
  {id:'SA-2002',stage:0,date:dOff(0),customer:'سوق الجملة المركزي',items:[{grade:'PR-B',qty:1200,price:19}],note:'طلب هاتفي'},
  {id:'SA-2000',stage:5,date:dOff(-15),customer:'أسواق الوفرة',items:[{grade:'PR-A',qty:3000,price:26.5}],note:'مستند محصّل'}
 ],
 assets:[
  {code:'AS-01',name:'جرار New Holland 70 حصان',cat:'معدات',date:'2019-05-10',cost:185000,supplier:'وكالته بالرياض',life:10,loc:'ساحة المزرعة',hours:5200,status:'سليم'},
  {code:'AS-02',name:'طلمبة رئيسية P-03',cat:'ري',date:'2018-02-01',cost:42000,supplier:'مؤسسة الري الحديث',life:8,loc:'غرفة الضخ الرئيسية',hours:12840,status:'صيانة بعد 40 ساعة'},
  {code:'AS-03',name:'مولد 150 ك.ف.أ',cat:'كهرباء',date:'2020-08-15',cost:96000,supplier:'السعودية للكهرباء',life:12,loc:'غرفة المولد',hours:3100,status:'سليم'},
  {code:'AS-04',name:'رشاشة محمولة 400 لتر',cat:'معدات',date:'2019-11-20',cost:28000,supplier:'مؤسسة الري الحديث',life:8,loc:'المخزن الرئيسي',hours:860,status:'سليم'},
  {code:'AS-05',name:'شبكة ري القطاع C',cat:'ري',date:'2018-03-01',cost:210000,supplier:'مؤسسة الري الحديث',life:15,loc:'القطاع C',hours:'—',status:'سليم'},
  {code:'AS-06',name:'خزان أرضي 500 م³',cat:'ري',date:'2016-06-01',cost:150000,supplier:'مقاول محلي',life:25,loc:'بجوار غرفة الضخ',hours:'—',status:'سليم'},
  {code:'AS-07',name:'سيارة نقل H1',cat:'مركبات',date:'2021-01-10',cost:87000,supplier:'وكالة هيونداي',life:10,loc:'الإدارة',hours:'—',status:'سليم'}
 ],
 maints:[
  {id:'WO-500',type:'preventive',asset:'AS-02',desc:'تغيير زيت وشحم الطلمبة P-03',opened:dOff(-30),tech:'محمد إقبال',hours:3,parts:[],cost:850,status:'closed'},
  {id:'WO-501',type:'corrective',asset:'AS-05',desc:'تسريب محبس على خط B02 — استبدال مطلوب',opened:dOff(-2),tech:'محمد إقبال',hours:0,parts:[],cost:0,status:'open'},
  {id:'WO-502',type:'preventive',asset:'AS-02',desc:'صيانة وقائية دورية 250 ساعة',opened:dOff(0),tech:'محمد إقبال',hours:0,parts:[],cost:0,status:'open'}
 ],
 employees:[
  {id:'E-001',name:'م. سالم القحطاني',job:'مدير مزرعة',dept:'الإدارة',since:'2019-03-01',salary:9500,allow:1200,phone:'0501234567',status:'نشط'},
  {id:'E-002',name:'م. نورة العتيبي',job:'مهندسة زراعية',dept:'الزراعة',since:'2020-09-01',salary:8000,allow:800,phone:'0552345678',status:'نشط'},
  {id:'E-003',name:'أبو كريم سيد أحمد',job:'أمين مخزن',dept:'المخازن',since:'2018-01-15',salary:4500,allow:400,phone:'0563456789',status:'نشط'},
  {id:'E-004',name:'محمد إقبال',job:'فني صيانة',dept:'الصيانة',since:'2020-05-01',salary:3800,allow:300,phone:'0574567890',status:'نشط'},
  {id:'E-005',name:'راجيش كومار',job:'عامل ري',dept:'الزراعة',since:'2017-04-01',salary:2200,allow:150,phone:'—',status:'نشط'},
  {id:'E-006',name:'سونو محمد',job:'عامل خدمة نخيل',dept:'الزراعة',since:'2018-06-01',salary:2400,allow:150,phone:'—',status:'نشط'},
  {id:'E-007',name:'فيصل الحربي',job:'سائق وتشغيل معدات',dept:'التشغيل',since:'2021-02-01',salary:3000,allow:250,phone:'0595678901',status:'نشط'},
  {id:'E-008',name:'إبراهيم مصطفى',job:'عامل حصاد وتعبئة',dept:'التشغيل',since:'2019-10-01',salary:2600,allow:150,phone:'—',status:'إجازة'}
 ],
 attendance:{},
 payroll:[{month:'مسيّر الشهر السابق',total:51100,count:8}],
 visits:[
  {date:dOff(1),person:'م. فهد الدوسري',role:'استشاري نخيل',blocks:['B03','A03'],purpose:'جولة ميدانية ومتابعة تنفيذ التوصيات',recs:[]},
  {date:dOff(-12),person:'م. فهد الدوسري',role:'استشاري نخيل',blocks:['B03'],purpose:'تقييم الإجهاد المائي والبرنامج الغذائي',recs:[{text:'زيادة جرعة البوتاسيوم (1.2 كجم/نخلة) لبلوك B03 فورًا',block:'B03',done:false}]},
  {date:dOff(-96),person:'م. فهد الدوسري',role:'استشاري نخيل',blocks:['A01'],purpose:'مراجعة حمل العذوق',recs:[{text:'خف 30% من عذوق A01 لتحسين الحجم',block:'A01',done:true}]}
 ],
 moves:[
  {date:dOff(-6),code:'F-NPK',dir:'in',qty:1000,note:'استلام PU-1001'},
  {date:dOff(-5),code:'K-CTN',dir:'out',qty:1600,note:'تعبئة شحنة حصاد B01'}
 ],
 audit:[],seq:{t:1054,wo:502,pur:1003,sal:2002,emp:8},
 ui:{}
 };
}
let S;
try{S=JSON.parse(localStorage.getItem(KEY))||SEED()}catch(e){S=SEED()}
S.ui=Object.assign({route:'dashboard',sel:null,mapLayer:'irrigation',invTab:'agri',taskFilter:'all',opFilter:'all',soilTab:'soil',tree:{block:null,row:null},palm:null},S.ui||{});
S.attendance=S.attendance||{};
if(!S.attendance[todayISO]){
 S.attendance[todayISO]={};S.employees.forEach((e,i)=>S.attendance[todayISO][e.id]=e.status==='إجازة'?'leave':i===5?'absent':'present');
 S.attendance[dOff(-1)]={};S.employees.forEach(e=>S.attendance[dOff(-1)][e.id]='present');
}
let session=null;
const ROLES={
 owner:{label:'المالك',pages:'*'},
 manager:{label:'مدير المزرعة',pages:['dashboard','map','tasks','structure','irrigation','fertilizer','soil','pollination','operations','harvest','inventory','purchasing','sales','employees','payroll','assets','visits','reports','settings']},
 agri:{label:'مهندس زراعي',pages:['dashboard','map','tasks','structure','irrigation','fertilizer','soil','pollination','operations','harvest','visits','reports']},
 store:{label:'أمين مخزن',pages:['dashboard','inventory','purchasing','sales','tasks']},
 account:{label:'محاسب',pages:['dashboard','purchasing','sales','payroll','reports','inventory']},
 maint:{label:'فني صيانة',pages:['dashboard','assets','tasks','map']},
 consult:{label:'استشاري',pages:['dashboard','map','soil','visits','structure','reports']}
};
const can=r=>session&&(ROLES[session.role].pages==='*'||ROLES[session.role].pages.includes(r));
let lastSave='';
function audit(act){S.audit.unshift({t:new Date().toLocaleTimeString('ar-EG',{hour:'2-digit',minute:'2-digit'}),user:session?session.name:'—',act});S.audit=S.audit.slice(0,40)}
function commit(){localStorage.setItem(KEY,JSON.stringify(S));lastSave=new Date().toLocaleTimeString('ar-EG');render()}