/* Depoimentos — cenas GSAP + faixa. Sem CDN e sem init global: recebe gsap/ScrollTrigger já carregados.
   Uso (Next.js, client component): useEffect(()=>{ const off=initDepoimentos(ref.current,gsap,ScrollTrigger); return off },[])
   Anima SÓ transform, opacity e clip-path. Estado inicial oculto é aplicado aqui (fromTo/set), nunca por CSS.
   Ordem: criar DEPOIS das cenas de "Camila em ação" e ANTES das de "Quem é" (ver MOTION.md). */
function initDepoimentos(sec,gsap,ScrollTrigger){
if(!sec)return function(){};
var d=document,rm=matchMedia('(prefers-reduced-motion: reduce)').matches;
var $=function(s,c){return(c||d).querySelector(s)},$$=function(s,c){return[].slice.call((c||d).querySelectorAll(s))};
var mqM=matchMedia('(max-width:899px)'),fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
var off=[];

/* ---- Faixa (mobile): rolagem nativa + setas + teclado + arrastar com mouse. Sem rotação automática. Funciona sem GSAP. ---- */
var tr=$('.lp-tcs__track',sec),bp=$('[data-dir="-1"]',sec),bn=$('[data-dir="1"]',sec);
if(tr&&bp&&bn){
 var beh=function(){return rm?'auto':'smooth'};
 var stepW=function(){var c=$('.lp-tc',tr);return c.getBoundingClientRect().width+(parseFloat(getComputedStyle(tr).columnGap)||14)};
 var upd=function(){var m=tr.scrollWidth-tr.clientWidth-2;bp.setAttribute('aria-disabled',String(tr.scrollLeft<=2));bn.setAttribute('aria-disabled',String(tr.scrollLeft>=m))};
 var go=function(k){if(mqM.matches)tr.scrollBy({left:k*stepW(),behavior:beh()})};
 var onP=function(){go(-1)},onN=function(){go(1)};
 var onK=function(e){if(!mqM.matches)return;if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();go(e.key==='ArrowRight'?1:-1)}};
 var dn=null;
 var onD=function(e){if(e.pointerType!=='mouse'||!mqM.matches)return;dn={x:e.clientX,l:tr.scrollLeft};tr.classList.add('is-drag');tr.setPointerCapture(e.pointerId)};
 var onM=function(e){if(dn)tr.scrollLeft=dn.l-(e.clientX-dn.x)};
 var onU=function(){if(!dn)return;dn=null;tr.classList.remove('is-drag')};
 bp.addEventListener('click',onP);bn.addEventListener('click',onN);tr.addEventListener('scroll',upd,{passive:true});addEventListener('resize',upd);
 tr.addEventListener('keydown',onK);tr.addEventListener('pointerdown',onD);tr.addEventListener('pointermove',onM);tr.addEventListener('pointerup',onU);tr.addEventListener('pointercancel',onU);upd();
 off.push(function(){bp.removeEventListener('click',onP);bn.removeEventListener('click',onN);tr.removeEventListener('scroll',upd);removeEventListener('resize',upd);tr.removeEventListener('keydown',onK);tr.removeEventListener('pointerdown',onD);tr.removeEventListener('pointermove',onM);tr.removeEventListener('pointerup',onU);tr.removeEventListener('pointercancel',onU)})}

/* ---- Cenas ---- */
if(!gsap||!ScrollTrigger||rm)return function(){off.forEach(function(f){f()})};
gsap.registerPlugin(ScrollTrigger);
var ctx=gsap.context(function(){
 var mm=gsap.matchMedia(),fe=$('.lp-fe',sec);
 function once(trg,start,tw){ScrollTrigger.create({trigger:trg,start:start,onEnter:function(){tw.play()},onRefresh:function(s){if(s.progress>0)tw.play()}})}

 /* Cena A1 — destaque: citação, nome e selo entram em cascata. start 'top 78%', 1x, .8s power3.out, stagger .1. opacity+y */
 once(fe,'top 78%',gsap.fromTo($$('.lp-fe__body > *',fe),{opacity:0,y:28},{opacity:1,y:0,duration:.8,ease:'power3.out',stagger:.1,paused:true}));

 /* Cena A2 — foto do destaque abre por clip-path. scrub, 'top 85%' → 'top 35%', linear. clip-path */
 gsap.fromTo($('.lp-fe__ph',fe),{clipPath:'inset(14% 14% 14% 14%)'},{clipPath:'inset(0% 0% 0% 0%)',ease:'none',scrollTrigger:{trigger:fe,start:'top 85%',end:'top 35%',scrub:true}});

 /* Cena A3 — parallax da foto (ou do bloco placeholder) e do monograma. scrub, 'top bottom' → 'bottom top'. transform */
 gsap.fromTo($('.lp-fe__img',fe)||$('.lp-fe__ph img',fe),{yPercent:-5},{yPercent:5,ease:'none',scrollTrigger:{trigger:fe,start:'top bottom',end:'bottom top',scrub:true}});
 var mono=$('.lp-fe__mono',fe);
 if(mono)gsap.fromTo(mono,{y:30},{y:-30,ease:'none',scrollTrigger:{trigger:fe,start:'top bottom',end:'bottom top',scrub:true}});

 /* Cena B1 — cartões em cascata (desktop ≥900px). start 'top 85%' da grade, 1x, .7s power3.out, stagger .09. opacity+y; clearProps libera o hover 3D */
 mm.add('(min-width:900px)',function(){
  once(tr,'top 85%',gsap.fromTo($$('.lp-tc',sec),{opacity:0,y:36},{opacity:1,y:0,duration:.7,ease:'power3.out',stagger:.09,paused:true,clearProps:'opacity,transform'}))});
 /* Cena B2 — faixa inteira entra (mobile <900px). start 'top 90%', 1x, .7s power3.out. opacity+y */
 mm.add('(max-width:899px)',function(){
  once(tr,'top 90%',gsap.fromTo(tr,{opacity:0,y:24},{opacity:1,y:0,duration:.7,ease:'power3.out',paused:true,clearProps:'opacity,transform'}))});

 /* Cena C — inclinação 3D sutil no hover (só hover:hover + pointer:fine; desligada <900px). quickTo .45s power3.out; ±6° cartões, ±2.5° destaque. transform */
 if(fine)$$('.lp-tc__in,.lp-fe',sec).forEach(function(el){var a=el.classList.contains('lp-fe')?2.5:6;
  gsap.set(el,{transformPerspective:900,transformOrigin:'50% 50%'});
  var rx=gsap.quickTo(el,'rotationX',{duration:.45,ease:'power3.out'}),ry=gsap.quickTo(el,'rotationY',{duration:.45,ease:'power3.out'});
  el.addEventListener('pointermove',function(e){if(mqM.matches)return;var r=el.getBoundingClientRect();ry(((e.clientX-r.left)/r.width-.5)*a*2);rx(-((e.clientY-r.top)/r.height-.5)*a*2)});
  el.addEventListener('pointerleave',function(){rx(0);ry(0)})});
},sec);
/* Sem pin nesta seção. Loops: 0. O cabeçalho usa o reveal global (.mp-reveal → .is-in) da landing. */
return function(){ctx.revert();off.forEach(function(f){f()})};
}
if(typeof module!=='undefined')module.exports={initDepoimentos:initDepoimentos};
