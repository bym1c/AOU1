const mins=s=>{const[a,b]=s.split(":");return +a*60+ +b};
const ev=E.map(([d,a,b,t,l])=>({s:Date.parse(DATE[d]+"T00:00:00Z")/1000+mins(a)*60,e:Date.parse(DATE[d]+"T00:00:00Z")/1000+mins(b)*60,d,a,b,t,l}));
/* للتجربة: افتح الملف مع ?t=2026-10-26T10:20 لمحاكاة وقت معين */
const q=new URLSearchParams(location.search).get("t");
const off=q?Date.parse(q+":00Z")-(Date.now()+144e5):0;
const nowM=()=>(Date.now()+off+144e5)/1000; // توقيت مسقط UTC+4
const $=id=>document.getElementById(id), sc=["ev","lg","cp"].map($);
const mk=(c,l,s="")=>`<div ${s}class="${c}${l.light?" dk":""}"><img src="${l.uri}" alt=""></div>`;
$("im").style.backgroundImage=`url(${BUILDING})`;
$("co").innerHTML=LOGOS.map((l,i)=>mk("t",l,`style="animation-delay:${i*.12}s" `)).join("");
$("st").innerHTML=LOGOS.map(l=>mk("lc",l)).join("");
$("dt").innerHTML=LOGOS.map(()=>"<i></i>").join("");
$("lg").innerHTML=LOGOS.map((l,i)=>mk("big",l,`style="--i:${i}" `)).join("");
const lgd=s=>$("lg").style.setProperty("--d",s+"s");lgd(LOGO_EACH);
function setFly(){const vm=Math.min(innerWidth,innerHeight)/100,t=$("co").children;
 [...$("lg").children].forEach((b,i)=>{const r=t[i].getBoundingClientRect();
  b.style.setProperty("--dx",(r.left+r.width/2-innerWidth/2)+"px");b.style.setProperty("--dy",(r.top+r.height/2-innerHeight/2)+"px");b.style.setProperty("--sc",r.width/(62*vm))})}
const UNI=Math.max(0,LOGOS.findIndex(l=>/aou/.test(l.uri)));let cl=[0],ci=0;
function rot(){const k=cl[ci++%cl.length];[...$("st").children,...$("dt").children].forEach((e,j)=>e.classList.toggle("act",j%LOGOS.length===k))}
function setCp(multi){cl=multi?LOGOS.map((_,i)=>i):[UNI];ci=0;rot()}
setInterval(rot,3200);
let cur="";
function show(id,key,fn){ // يعيد تشغيل الحركة عند تغيّر المشهد أو الحدث
  if(cur===key)return; cur=key; sc.forEach(s=>s.classList.remove("on"));document.body.classList.toggle("lg",id==="lg"); void document.body.offsetWidth;
  if(fn)fn(); $(id).classList.add("on");}
function fill(e,next){
  const ev$=$("ev"); ev$.classList.toggle("next",next);
  const brk=!next&&/^(استراحة|الغداء)/.test(e.t);ev$.classList.toggle("brk",brk);
  $("lb").textContent=next?"الحدث القادم":brk?"وقت راحة":"يحدث الآن في المسرح";
  const h=$("tt"); h.className=e.t.length>110?"xs":e.t.length>85?"s":e.t.length>40?"m":"";
  h.innerHTML=e.t.split(" ").map((w,i)=>`<span style="animation-delay:${i*.08}s">${w}</span>`).join("");
  const d=e.t.split(" ").length*.08+.3;
  $("ls").innerHTML=e.l.map((x,i)=>`<li style="animation-delay:${d+i*.25}s">${x}</li>`).join("");
  $("tm").textContent=e.a+" – "+e.b;
  fit();
  if(window.gsap)reveal();
}
let back=0,sel=-1,hold=0;try{const v=localStorage.getItem("aou_sel");if(v!==null)sel=Math.max(-1,Math.min(ev.length-1,+v||0))}catch(e){}
function tick(){
  const n=nowM();let c,nx,pre;
  if(MANUAL){c=sel>=0?ev[sel]:null;nx=ev[sel+1];pre=!c&&!!nx}
  else{c=ev.find(e=>n>=e.s&&n<e.e);nx=ev.find(e=>e.s>n);pre=!c&&!!nx&&nx.s-n<5400}
  const ph=((n%86400)%CYCLE);
  if(!c){ if(pre){
    const q=(n%86400)%PRE_CYCLE,k=Math.floor(n/PRE_CYCLE);
    if(q<PRE_STEP) show("ev","pn"+nx.s+"_"+k,()=>fill(nx,true));
    else if(q<PRE_STEP*(LOGOS.length+1)) show("lg","pl"+k,()=>{lgd(PRE_STEP);setFly()});
    else show("cp","pc"+k,()=>setCp(true));
  } else show("cp","cp",()=>setCp(true));
  return;}
  const k=Math.floor(n/CYCLE),slot=Math.floor((n%86400)/CYCLE)%3,t=ph-SLOT_AT;
  if(t>=0&&!(MANUAL&&Date.now()<hold)){
    if(slot===0&&t<LOGO_EACH*LOGOS.length){back=k;return show("lg","lg"+k,()=>{lgd(LOGO_EACH);setFly()});}
    if(slot===1&&t<CAMPUS_LEN){back=k;return show("cp","cp"+k,()=>setCp(false));}
    if(slot===2&&t<NEXT_LEN&&nx&&(MANUAL||c.e-n>NEXT_LEN)){back=k;return show("ev","nx"+nx.s+"_"+k,()=>fill(nx,true));}
  }
  show("ev","c"+c.s+"_"+back,()=>fill(c,false));
  if(!MANUAL&&!$("ev").classList.contains("next"))$("pg").style.width=((n-c.s)/(c.e-c.s)*100)+"%";
}
addEventListener("resize",setFly);
if(new URLSearchParams(location.search).has("demo")||location.hash==="#demo"){
 $("lg").style.setProperty("--d","3s");const cap=document.createElement("div");cap.style.cssText="position:fixed;left:4vmin;bottom:3vmin;z-index:9;font-size:2.6vmin;color:#fff;background:#000a;padding:.8vmin 2vmin;border-radius:2vmin";document.body.appendChild(cap);
 const S=[[10,"1/6 الحدث الحالي",k=>show("ev",k,()=>{fill(ev[2],false);$("pg").style.width="45%"})],[15,"2/6 الشعارات الكبيرة (ينزل المبنى)",k=>show("lg",k,setFly)],[8,"3/6 شاشة الجامعة",k=>show("cp",k,()=>setCp(false))],[10,"4/6 الحدث القادم",k=>show("ev",k,()=>fill(ev[3],true))],[8,"5/6 وقت راحة",k=>show("ev",k,()=>{fill(ev[5],false);$("pg").style.width="60%"})],[15,"6/6 ما قبل البدء (تبديل الشعارات)",k=>show("cp",k,()=>setCp(true))]];
 let i=0,r=0;(function go(){const s=S[i%S.length];cap.textContent="تجربة "+s[1];s[2]("demo"+(r++));setTimeout(go,s[0]*1000);i++})();
}else{setInterval(tick,500);tick();}

/* ===== حركة GSAP لنص الحدث ===== */
function reveal(){const G=gsap;$("ev").classList.add("g");G.killTweensOf("#tt span,#ls li,.chip");
 G.fromTo(".chip",{opacity:0,y:-20,scale:.9},{opacity:1,y:0,scale:1,duration:.7,ease:"back.out(1.6)"});
 G.fromTo("#tt span",{opacity:0,y:50,filter:"blur(14px)"},{opacity:1,y:0,filter:"blur(0px)",duration:1,ease:"power3.out",stagger:.075,delay:.15});
 G.fromTo("#ls li",{opacity:0,x:60},{opacity:1,x:0,duration:.8,ease:"power2.out",stagger:.18,delay:.5});}
/* ===== زر "الحدث القادم" ===== */
const DAYN={26:"الاثنين",27:"الثلاثاء",28:"الأربعاء"};let ntm;
function closeNext(){clearTimeout(ntm);$("np").classList.remove("on");$("np").setAttribute("aria-hidden","true")}
function openNext(){closePP();closeCS();
 const n=nowM(),e=MANUAL?ev[sel+1]:ev.find(x=>x.s>n),t=$("npt");
 if(e){t.textContent=e.t;t.className=e.t.length>85?"s":e.t.length>40?"m":"";
  $("npm").innerHTML=DAYN[e.d]+" "+e.d+" أكتوبر"+(MANUAL?"":" · <bdi dir=\"ltr\">"+e.a+" – "+e.b+"</bdi>");
  $("npu").innerHTML=e.l.map(x=>"<li>"+x+"</li>").join("");
  const m=Math.round((e.s-n)/60),h=Math.floor(m/60);
  $("npc").textContent=MANUAL||m>=720?"":m<1?"يبدأ بعد لحظات":"يبدأ بعد "+(h?h+" ساعة"+(m%60?" و "+(m%60)+" دقيقة":""):m+" دقيقة");
 }else{t.textContent="انتهت فعاليات المؤتمر، شكراً لحضوركم";t.className="";$("npm").textContent="";$("npu").innerHTML="";$("npc").textContent=""}
 fitPanel();const p=$("np");p.classList.add("on");p.setAttribute("aria-hidden","false");
 if(window.gsap){gsap.fromTo(".pn",{y:50,scale:.94,opacity:0},{y:0,scale:1,opacity:1,duration:.6,ease:"power3.out"});
  gsap.fromTo("#npu li",{opacity:0,x:50},{opacity:1,x:0,duration:.6,ease:"power2.out",stagger:.12,delay:.3})}
 clearTimeout(ntm);ntm=setTimeout(closeNext,20000)}
$("nb").onclick=openNext;$("nx").onclick=closeNext;$("np").onclick=e=>{if(e.target.id==="np")closeNext()};
addEventListener("keydown",e=>{if(e.key==="Escape"){closeNext();closeQ();closePP();closeCS()}else if(e.key==="1"||e.key==="2")openQ(+e.key-1)});
let mvt;addEventListener("mousemove",()=>{document.body.classList.add("mv");clearTimeout(mvt);mvt=setTimeout(()=>document.body.classList.remove("mv"),3000)});

/* ===== تصغير الخط تلقائياً لو النص طويل ===== */
function fit(){const vm=Math.min(innerWidth,innerHeight)/100,l=[...$("ls").children],top=document.querySelector(".foot").getBoundingClientRect().top-2*vm;let z=3.4;
 l.forEach(x=>x.style.fontSize="");
 while(z>2.2&&l.length&&$("ls").getBoundingClientRect().bottom>top){z-=.2;l.forEach(x=>x.style.fontSize=z+"vmin")}}
function fitPanel(){const p=document.querySelector(".pn"),l=[...$("npu").children];let z=3.5;l.forEach(x=>x.style.fontSize="");
 while(z>2.2&&p.scrollHeight>p.clientHeight+1){z-=.2;l.forEach(x=>x.style.fontSize=z+"vmin")}}

/* ===== رموز QR ===== */
let qtm;
function closeQ(){clearTimeout(qtm);$("qm").classList.remove("on")}
function openQ(i){const q=QR[i];if(!q||!SHOW_QR)return;closePP();closeCS();$("qi").src=q.src;$("qt").textContent=q.title;$("qs").textContent=q.sub||"";$("qs").style.display=q.sub?"":"none";closeNext();$("qm").classList.add("on");
 if(window.gsap)gsap.fromTo(".qc",{scale:.85,y:20},{scale:1,y:0,duration:.25,ease:"power3.out"});clearTimeout(qtm);qtm=setTimeout(closeQ,QR_AUTOCLOSE*1000)}
if(SHOW_QR){document.body.classList.add("qr-"+QR_SIDE);QR.forEach((q,i)=>{const b=document.createElement("button");b.type="button";b.className="qb";b.innerHTML='<img alt=""><span></span>';b.firstChild.src=q.src;b.lastChild.textContent=q.title;b.onclick=()=>openQ(i);$("qd").appendChild(b)})}
$("qm").onclick=closeQ;

/* ===== ملء الشاشة: زر، نقرتين على الشاشة، أو حرف F ===== */
const isFS=()=>document.fullscreenElement||document.webkitFullscreenElement;
function toggleFS(){const d=document,e=d.documentElement;if(isFS())(d.exitFullscreen||d.webkitExitFullscreen).call(d);else(e.requestFullscreen||e.webkitRequestFullscreen).call(e)}
$("fs").onclick=toggleFS;
addEventListener("dblclick",e=>{if(!e.target.closest("button,#np,#qm"))toggleFS()});
addEventListener("keydown",e=>{if(e.code==="KeyF"&&!e.ctrlKey&&!e.metaKey)toggleFS()});
["fullscreenchange","webkitfullscreenchange"].forEach(n=>document.addEventListener(n,()=>$("fs").classList.toggle("on",!!isFS())));

/* ===== زر "الحدث السابق": قائمة بالأحداث اللي خلصت + الحدث الآن (بدون أوقات، ويتحدث مع الوقت الفعلي) ===== */
let pview="list",psel=null,pint,ptm;
function renderPP(){const n=nowM(),now=MANUAL?(sel>=0?ev[sel]:null):ev.find(e=>n>=e.s&&n<e.e),past=(MANUAL?ev.slice(0,Math.max(sel,0)):ev.filter(e=>e.e<=n)).reverse(),v=$("ppv");
 if(pview==="detail"&&psel){v.innerHTML='<button class="po back" type="button" data-b="1">‹ الرجوع للقائمة</button><h2 id="ppt">'+psel.t+'</h2><ul>'+psel.l.map(x=>"<li>"+x+"</li>").join("")+"</ul>";return}
 let h=now?'<button class="po now" type="button" data-i="'+ev.indexOf(now)+'"><i></i><span>الحدث الآن: '+now.t+"</span></button>":"";
 if(!past.length)h+='<div class="pg">ما فيه أحداث سابقة بعد</div>';
 let d=0;past.forEach(e=>{if(e.d!==d){d=e.d;h+='<div class="pg">'+DAYN[d]+" "+d+" أكتوبر</div>"}h+='<button class="po" type="button" data-i="'+ev.indexOf(e)+'"><span>'+e.t+"</span></button>"});
 v.innerHTML=h}
function closePP(){clearInterval(pint);clearTimeout(ptm);$("pp").classList.remove("on");$("pp").setAttribute("aria-hidden","true")}
function touchPP(){clearTimeout(ptm);ptm=setTimeout(closePP,120000)}
$("pb").onclick=()=>{closeNext();closeQ();pview="list";psel=null;renderPP();$("pp").classList.add("on");$("pp").setAttribute("aria-hidden","false");
 if(window.gsap)gsap.fromTo("#pp .pn",{y:40,scale:.95,opacity:0},{y:0,scale:1,opacity:1,duration:.45,ease:"power3.out"});
 clearInterval(pint);pint=setInterval(()=>{if(pview==="list")renderPP()},20000);touchPP()};
$("ppv").onclick=e=>{const b=e.target.closest(".po");if(!b)return;touchPP();
 if(b.dataset.b){pview="list";psel=null}else{pview="detail";psel=ev[+b.dataset.i]}renderPP();$("ppv").scrollTop=0};
$("px").onclick=closePP;$("pp").onclick=e=>{if(e.target.id==="pp")closePP()};

/* ===== الوضع اليدوي: اختيار اليوم ثم الحدث الحالي ===== */
if(MANUAL)document.body.classList.add("manual","ctl-"+CTRL_SIDE);
let cview="day",cday=26,ctm;
function setSel(i){sel=Math.max(-1,Math.min(ev.length-1,i));try{localStorage.setItem("aou_sel",sel)}catch(e){}hold=Date.now()+20000;cur="";tick()}
function renderCS(){const v=$("csv");
 if(cview==="day"){v.innerHTML='<div class="pg">اختر اليوم</div>'+[26,27,28].map(d=>'<button class="po" type="button" data-d="'+d+'"><span>'+DAYN[d]+" "+d+" أكتوبر</span></button>").join("")+'<button class="po" type="button" data-d="0"><span>قبل البداية (شاشة الشعارات)</span></button>';return}
 v.innerHTML='<button class="po back" type="button" data-b="1">‹ تغيير اليوم</button><div class="pg">'+DAYN[cday]+" "+cday+" أكتوبر: اختر الجلسة أو الحدث الحالي</div>"+ev.map((e,i)=>e.d===cday?'<button class="po'+(i===sel?" now":"")+'" type="button" data-i="'+i+'">'+(i===sel?"<i></i>":"")+"<span>"+e.t+"</span></button>":"").join("")}
function closeCS(){clearTimeout(ctm);$("cs").classList.remove("on");$("cs").setAttribute("aria-hidden","true")}
function touchCS(){clearTimeout(ctm);ctm=setTimeout(closeCS,120000)}
function openCS(){closeNext();closeQ();closePP();cview=sel>=0?"ev":"day";if(sel>=0)cday=ev[sel].d;renderCS();$("cs").classList.add("on");$("cs").setAttribute("aria-hidden","false");
 if(window.gsap)gsap.fromTo("#cs .pn",{y:40,scale:.95,opacity:0},{y:0,scale:1,opacity:1,duration:.4,ease:"power3.out"});touchCS()}
$("cb").onclick=openCS;$("cprev").onclick=()=>setSel(sel-1);$("cnext").onclick=()=>setSel(sel+1);$("cx").onclick=closeCS;$("cs").onclick=e=>{if(e.target.id==="cs")closeCS()};
$("csv").onclick=e=>{const b=e.target.closest(".po");if(!b)return;touchCS();
 if(b.dataset.b){cview="day";renderCS();return}
 if(b.dataset.d!==undefined){const d=+b.dataset.d;if(d===0){setSel(-1);closeCS();return}cday=d;cview="ev";renderCS();$("csv").scrollTop=0;return}
 if(b.dataset.i!==undefined){setSel(+b.dataset.i);closeCS()}};

/* ===== التحكم عن بعد: تستقبل التغيير من remote.js ===== */
if(REMOTE)document.body.classList.add("remote");
function remoteSet(i){i=Math.max(-1,Math.min(ev.length-1,+i||0));if(i===sel)return;sel=i;try{localStorage.setItem("aou_sel",sel)}catch(e){}hold=Date.now()+20000;cur="";tick()}
