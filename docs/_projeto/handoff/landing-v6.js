(function(){
var d=document,root=d.documentElement,rm=matchMedia('(prefers-reduced-motion: reduce)').matches&&!(window.__QA_MOTION||/[?&]qa-motion=1/.test(location.search));
var $=function(s,c){return(c||d).querySelector(s)},$$=function(s,c){return[].slice.call((c||d).querySelectorAll(s))};
/* reveal */
var rv=$$('.mp-reveal');
if('IntersectionObserver' in window&&!rm){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('is-in');io.unobserve(e.target)}})},{threshold:.12,rootMargin:'0px 0px -6% 0px'});rv.forEach(function(e){io.observe(e)})}else rv.forEach(function(e){e.classList.add('is-in')});
/* hero intro */
var hero=$('.lp-hero');requestAnimationFrame(function(){requestAnimationFrame(function(){hero&&hero.classList.add('is-ready')})});
/* header */
var hd=$('.lp-header');function onScroll(){hd.classList.toggle('is-solid',scrollY>40)}addEventListener('scroll',onScroll,{passive:true});onScroll();
/* tilt + luz que segue o cursor */
if(!rm&&matchMedia('(pointer:fine)').matches){
 $$('[data-tilt]').forEach(function(z){var t=$('.mp-tilt__inner',z),l=$('[data-light]',z);
  z.addEventListener('pointermove',function(e){var r=z.getBoundingClientRect(),x=(e.clientX-r.left)/r.width*2-1,y=(e.clientY-r.top)/r.height*2-1;
   if(t){t.style.setProperty('--rx',x.toFixed(3));t.style.setProperty('--tx',x.toFixed(3));t.style.setProperty('--ty',y.toFixed(3))}
   if(l)l.style.transform='translate3d('+(x*60).toFixed(1)+'px,'+(y*40).toFixed(1)+'px,0)'});
  z.addEventListener('pointerleave',function(){if(t)['--rx','--tx','--ty'].forEach(function(p){t.style.removeProperty(p)});if(l)l.style.transform=''})})}
/* sticky CTA mobile */
var st=$('.lp-sticky'),form=$('#conversar');
if(st&&'IntersectionObserver' in window){var vis={h:true,f:false};function upd(){st.classList.toggle('is-on',!vis.h&&!vis.f)}
 new IntersectionObserver(function(es){vis.h=es[0].isIntersecting;upd()},{threshold:.15}).observe(hero);
 new IntersectionObserver(function(es){vis.f=es[0].isIntersecting;upd()},{threshold:.05}).observe(form)}
/* formulário em 3 passos (só UI; validação por passo, envio no fim) */
var f=$('#lp-form');
if(f){var ICO='<svg class="mp-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>';
 function msg(field,text){var h=$('.mp-field__hint',field);field.classList.toggle('mp-field--error',!!text);if(text&&!h){h=d.createElement('div');h.className='mp-field__hint';h.setAttribute('role','alert');field.appendChild(h)}if(h){if(text){h.innerHTML=ICO+'<span></span>';h.lastChild.textContent=text}else h.remove()}}
 function check(scope){var bad=null;
  $$('[data-req]',scope).forEach(function(fl){var i=$('input,textarea',fl),v=(i.value||'').trim(),t='';if(!v)t='Preencha este campo.';else if(i.name==='whatsapp'&&v.replace(/\D/g,'').length<10)t='Informe o WhatsApp com DDD.';msg(fl,t);if(t&&!bad)bad=i});
  $$('[data-choice]',scope).forEach(function(g){var ok=$('input:checked',g),m=$('.lp-gmsg',g);m.textContent=ok?'':'Escolha uma opção.';if(!ok&&!bad)bad=$('input',g)});
  var cb=$('#consent',scope),cm=$('.lp-cmsg',scope);if(cb){cm.textContent=cb.checked?'':'Para enviar, é preciso concordar com o contato.';if(!cb.checked&&!bad)bad=cb}return bad}
 var panes=$$('.lp-fs',f),pdots=$$('.lp-prog li',f),pfill=$('.lp-prog__line b',f),pcap=$('.lp-prog__t',f),NAMES=['Contato','Seu negócio','Seu momento'],step=0,busy=false;
 f.classList.add('is-steps');panes.slice(1).forEach(function(p){p.hidden=true});
 function paint(n){pdots.forEach(function(x,i){x.classList.toggle('is-done',i<n);x.classList.toggle('is-on',i===n);if(i===n)x.setAttribute('aria-current','step');else x.removeAttribute('aria-current')});pfill.style.transform='scaleX('+(n/2)+')';pcap.innerHTML='Passo <b>'+(n+1)+'</b> de 3 · '+NAMES[n]}
 function ff(p){var e=$('input,textarea',p);if(e)e.focus({preventScroll:true})}
 function toForm(){var r=f.getBoundingClientRect();if(r.top<82)scrollTo({top:r.top+scrollY-96,behavior:rm?'auto':'smooth'})}
 function go(n,focus){if(n===step||n<0||n>2||busy)return;var dir=n>step?1:-1,a=panes[step],b=panes[n];step=n;paint(n);toForm();
  if(rm){a.hidden=true;b.hidden=false;if(focus)ff(b);return}
  busy=true;a.style.setProperty('--dir',dir);a.classList.add('is-out');
  setTimeout(function(){a.hidden=true;a.classList.remove('is-out');b.style.setProperty('--dir',dir);b.hidden=false;b.classList.add('is-in');if(focus)ff(b);setTimeout(function(){b.classList.remove('is-in');busy=false},350)},140)}
 function next(){var bad=check(panes[step]);if(bad){bad.focus();return}go(step+1,true)}
 $$('[data-next]',f).forEach(function(b){b.addEventListener('click',next)});
 $$('[data-back]',f).forEach(function(b){b.addEventListener('click',function(){go(step-1,true)})});
 f.addEventListener('submit',function(ev){ev.preventDefault();if(step<2){next();return}
  for(var i=0;i<3;i++){var bad=check(panes[i]);if(bad){if(i!==step){go(i,false);setTimeout(function(){bad.focus()},rm?0:520)}else bad.focus();return}}
  f.classList.add('is-done');window.__lpDone&&window.__lpDone();var s=$('.lp-success',f);s.setAttribute('tabindex','-1');s.focus()});
 $$('[data-req] input,[data-req] textarea',f).forEach(function(i){i.addEventListener('input',function(){if(i.closest('.mp-field--error'))msg(i.closest('[data-req]'),'')})});
 $$('[data-choice] input',f).forEach(function(i){i.addEventListener('change',function(){$('.lp-gmsg',i.closest('[data-choice]')).textContent=''})});
 var cbx=$('#consent');if(cbx)cbx.addEventListener('change',function(){if(cbx.checked)$('.lp-cmsg',f).textContent=''})}

/* faq — acordeão (altura por grid-template-rows, 350 ms, em CSS) */
$$('.lp-q button').forEach(function(b){b.addEventListener('click',function(){var q=b.closest('.lp-q'),o=!q.classList.contains('is-open');q.classList.toggle('is-open',o);b.setAttribute('aria-expanded',o)})});
/* ============ CENAS GSAP (ver landing/MOTION.md) ============ */
var G=window.gsap,ST=window.ScrollTrigger,fine=matchMedia('(hover:hover) and (pointer:fine)').matches;
var mqM=matchMedia('(max-width:899px)'),cur=0,pinST=null,tw=null,lastScene=0;
var frame=$('[data-pins]'),pin=$('.mp-cf__pin',frame),note=$('.lp-ficha__note'),tbox=$('.lp-tabs'),tabs=$$('.lp-tab'),dots=$$('.lp-dots button',frame),scs=$$('.lp-scene',frame),lights=$$('.lp-acao__lights i'),data=JSON.parse(frame.getAttribute('data-pins')),photoBox=$('.lp-panel__photo',frame);
pin.style.left='0';pin.style.top='0';
function target(i){var im=$('img',scs[i]),W=photoBox.clientWidth,H=photoBox.clientHeight,nw=im.naturalWidth||1080,nh=im.naturalHeight||1350,s=Math.max(W/nw,H/nh),w=nw*s,h=nh*s,o=[.5,.5],f=data[i].f,x=(W-w)*o[0]+f[0]/100*w,y=(H-h)*o[1]+f[1]/100*h;return{x:Math.max(22,Math.min(W-22,x)),y:Math.max(22,Math.min(H-22,y))}}
function movePin(i,inst){var t=target(i);if(G&&!rm&&!inst)G.to(pin,{x:t.x,y:t.y,duration:.6,ease:'power3.out',overwrite:true});else if(G)G.set(pin,t);else pin.style.transform='translate('+t.x+'px,'+t.y+'px)'}
function setNote(i,inst){var s=$('strong',note);if(!G||rm||inst){s.textContent=data[i].t;return}G.timeline().to(note,{opacity:0,duration:.15,ease:'none'}).add(function(){s.textContent=data[i].t}).to(note,{opacity:1,duration:.15,ease:'none'})}
function showScene(i,inst){
 var prev=lastScene;lastScene=i;if(tw){tw.kill();tw=null}
 var paint=function(){scs.forEach(function(s,k){s.style.opacity=k===i?1:0;s.style.zIndex=k===i?2:1;s.style.clipPath='';var im=$('img',s);im.style.transform=''});lights.forEach(function(l,k){l.style.opacity=k===i?1:0})};
 if(!G||rm||inst||prev===i){paint();return}
 scs.forEach(function(s,k){if(k!==i&&k!==prev){s.style.opacity=0;s.style.zIndex=1}});
 var a=scs[prev],b=scs[i];a.style.opacity=1;a.style.zIndex=2;b.style.zIndex=3;
 tw=G.timeline({onComplete:function(){a.style.opacity=0;a.style.zIndex=1;b.style.zIndex=2;b.style.clipPath='';tw=null}});
 tw.fromTo(b,{opacity:0,clipPath:'inset(0% 100% 0% 0%)'},{opacity:1,clipPath:'inset(0% 0% 0% 0%)',duration:.6,ease:'power2.inOut'},0)
   .fromTo($('img',b),{scale:1.06},{scale:1,duration:.6,ease:'power2.out'},0)
   .to(a,{opacity:0,duration:.3,ease:'none'},.3);
 lights.forEach(function(l,k){G.to(l,{opacity:k===i?1:0,duration:.6,ease:'none',overwrite:true})})}
function setTopic(i,inst,fromScroll){cur=i;tbox.style.setProperty('--k',i);tabs.forEach(function(t,k){t.setAttribute('aria-pressed',k===i)});dots.forEach(function(t,k){k===i?t.setAttribute('aria-current','true'):t.removeAttribute('aria-current')});setNote(i,inst);movePin(i,inst);showScene(i,inst);pin.setAttribute('aria-label','Tema em destaque: '+data[i].t);
 if(!fromScroll&&pinST){pinST.scroll(pinST.start+i/tabs.length*(pinST.end-pinST.start))}}
tabs.forEach(function(t,i){t.addEventListener('click',function(){setTopic(i)})});
dots.forEach(function(t,i){t.addEventListener('click',function(){setTopic(i)})});
pin.addEventListener('click',function(){setTopic((cur+1)%tabs.length)});
addEventListener('keydown',function(e){if(e.key!=='ArrowLeft'&&e.key!=='ArrowRight')return;var t=e.target;if(t&&(/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)||t.isContentEditable))return;var r=$('#acao').getBoundingClientRect();if(!(r.top<innerHeight*.5&&r.bottom>innerHeight*.5))return;var n=cur+(e.key==='ArrowRight'?1:-1);if(n<0||n>=tabs.length)return;e.preventDefault();setTopic(n)});
scs.forEach(function(s){$('img',s).addEventListener('load',function(){movePin(cur,true)})});
setTopic(0,true,true);
addEventListener('resize',function(){movePin(cur,true)});
if(mqM.addEventListener)mqM.addEventListener('change',function(){movePin(cur,true)});

if(G&&ST&&!rm){try{G.registerPlugin(ST);scenes()}catch(err){console.warn('[motion]',err)}}
else{ if(!G)console.warn('[motion] GSAP indisponível — página estática') }

function words(el){var t=el.textContent.replace(/\s+/g,' ').trim();el.setAttribute('aria-label',t);el.textContent='';return t.split(' ').map(function(w,i,a){var s=d.createElement('span');s.setAttribute('aria-hidden','true');s.textContent=w;el.appendChild(s);if(i<a.length-1)el.appendChild(d.createTextNode(' '));return s})}
function splitLines(el){var c=el.cloneNode(true);var sh=$('.lp-shine',c);sh&&sh.remove();el.setAttribute('aria-label',c.textContent.replace(/\s+/g,' ').trim());
 var ws=[];[].slice.call(el.childNodes).forEach(function(n){var mk=function(w){var s=d.createElement('span');s.className='w';s.textContent=w;return s};
  if(n.nodeType===3){n.textContent.split(/[ \t\n\r]+/).filter(Boolean).forEach(function(w){ws.push(mk(w))})}
  else if(n.classList.contains('lp-h1__a')){n.textContent.split(/[ \t\n\r]+/).filter(Boolean).forEach(function(w){ws.push(mk(w))});ws[ws.length-1].setAttribute('data-brk','1')}
  else{var s=d.createElement('span');s.className='w';s.appendChild(n);ws.push(s)}});
 el.textContent='';ws.forEach(function(w,i){el.appendChild(w);el.appendChild(d.createTextNode(' '))});
 var groups=[],last=null;ws.forEach(function(w){var t=Math.round(w.offsetTop);if(last===null||Math.abs(t-last)>8||(groups.length&&groups[groups.length-1].brk)){groups.push({w:[],brk:false});last=t}var g=groups[groups.length-1];g.w.push(w);if(w.getAttribute('data-brk'))g.brk=true;});
 el.textContent='';return groups.map(function(g){var ln=d.createElement('span'),i=d.createElement('span');ln.className='ln';i.className='ln__i';i.setAttribute('aria-hidden','true');g.w.forEach(function(w,k){i.appendChild(w);if(k<g.w.length-1)i.appendChild(d.createTextNode(' '))});ln.appendChild(i);el.appendChild(ln);return i})}

function onceIn(trg,start,tw){ST.create({trigger:trg,start:start,onEnter:function(){tw.play()},onRefresh:function(s){if(s.progress>0)tw.play()}})}
function scenes(){
 var mm=G.matchMedia(),vh=function(k){return function(){return '+='+Math.round(innerHeight*k)}};
 /* 10 · progresso */
 G.to('.lp-progress i',{scaleX:1,ease:'none',scrollTrigger:{start:0,end:'max',scrub:true}});
 /* 1 · hero entrada */
 var h1=$('.lp-h1'),lines=splitLines(h1),shine=$('.lp-shine');
 G.set(lines,{yPercent:100});G.set('.lp-hero .mp-eyebrow,.lp-hero .lp-sub,.lp-hero__cta',{opacity:0,y:24});
 var tl=G.timeline();
 tl.fromTo('.lp-hero__bg',{scale:1.15},{scale:1,duration:1.4,ease:'power3.out'},0)
   .to('.lp-hero .mp-eyebrow',{opacity:1,y:0,duration:.7,ease:'expo.out'},.15)
   .to(lines,{yPercent:0,duration:.9,stagger:.12,ease:'expo.out'},.3)
   .to('.lp-hero .lp-sub',{opacity:1,y:0,duration:.7,ease:'expo.out'},.95)
   .to('.lp-hero__cta',{opacity:1,y:0,duration:.7,ease:'expo.out'},1.04)
   .fromTo(shine,{clipPath:'inset(0% 100% 0% -30%)'},{clipPath:'inset(0% -30% 0% 100%)',duration:1.1,ease:'power2.inOut'},1.3)
   .set('.lp-hero .ln',{overflow:'visible'});
 /* 2 · hero saída */
 G.timeline({scrollTrigger:{trigger:'.lp-hero',start:'top top',end:'bottom top',scrub:true}})
  .to('.lp-cover',{yPercent:12,scale:1.08,ease:'none'},0)
  .to('.lp-hero__copy',{y:-90,opacity:0,ease:'power1.in'},0);
 /* 3 · problema — teleprompter (pin só no desktop) */
 var PH=window.__QA_PIN_H||720;
 (function(){var st=$('.lp-prob__stage');if(!st)return;
  var sg=$$('.lp-sign',st),mk=$$('.lp-mark',st),ln=$('.lp-sline',st),cl=$('.lp-prob__close',st),wrap=$('.lp-signs-wrap',st),imgs=$$('.lp-prob__img'),bw=$('.lp-prob__img--bw');
  var f=function(i){return function(){return Math.min(1,(sg[i].offsetTop+mk[i].offsetTop+4.5)/wrap.offsetHeight)}};
  var mm3=G.matchMedia();
  mm3.add('(min-width:900px) and (min-height:'+PH+'px)',function(){
   st.classList.add('is-pin');
   G.set(sg.slice(1),{opacity:.12});G.set(mk.slice(1),{opacity:.3,scale:.6});G.set(cl,{opacity:0,y:16});G.set(ln,{scaleY:0});G.set(bw,{opacity:0});
   var tl=G.timeline({defaults:{ease:'none'},scrollTrigger:{trigger:st,start:'top top',end:vh(2.2),pin:true,scrub:.5,anticipatePin:1,invalidateOnRefresh:true}});
   tl.to(ln,{scaleY:f(0),duration:.8},0);
   [1,3,5].forEach(function(at,k){var i=k+1;
    tl.to(sg[i-1],{opacity:.28,y:-8,duration:.8},at).to(sg[i],{opacity:1,duration:.8},at).to(mk[i],{opacity:1,scale:1,duration:.5},at).to(ln,{scaleY:f(i),duration:.8},at)});
   tl.to(cl,{opacity:1,y:0,duration:.8,ease:'power2.out'},7.2).to(ln,{scaleY:1,duration:.8},7.2)
     .to(imgs,{scale:1.08,duration:10},0).to(bw,{opacity:.375,duration:10},0).to({},{duration:.01},10);
   return function(){st.classList.remove('is-pin')}});
  mm3.add('(max-width:899px), (min-width:900px) and (max-height:'+(PH-1)+'px)',function(){
   G.set(mk,{opacity:.3,scale:.6});G.set(sg,{opacity:.12});G.set(cl,{opacity:0,y:16});G.set(ln,{scaleY:0});G.set(bw,{opacity:0});
   sg.forEach(function(s,i){G.timeline({defaults:{ease:'none'},scrollTrigger:{trigger:s,start:'top 85%',end:'bottom 15%',scrub:.4}})
    .to(s,{opacity:1,duration:.3},0).to(mk[i],{opacity:1,scale:1,duration:.2},.1).to(s,{opacity:.28,y:-8,duration:.3},.5).to({},{duration:.01},1)});
   G.to(ln,{scaleY:1,ease:'none',scrollTrigger:{trigger:wrap,start:'top 70%',end:'bottom 55%',scrub:true}});
   G.to(cl,{opacity:1,y:0,duration:.7,ease:'power2.out',scrollTrigger:{trigger:cl,start:'top 90%',toggleActions:'play none none reverse'}});
   var sc={trigger:st,start:'top bottom',end:'bottom top',scrub:true};
   G.to(imgs,{scale:1.08,ease:'none',scrollTrigger:sc});G.to(bw,{opacity:.375,ease:'none',scrollTrigger:sc})})})();
 /* 6 · a diferença (criada antes das cenas abaixo do pin do problema, na ordem da página) */
 $$('.lp-band .lp-lead').forEach(function(p){var ws=words(p);
  G.fromTo(ws,{opacity:.2},{opacity:1,ease:'none',stagger:.12,duration:.3,scrollTrigger:{trigger:p,start:'top 82%',end:'bottom 48%',scrub:true}})});
 G.fromTo('.lp-band__photo',{clipPath:'inset(12% 12% 12% 12%)'},{clipPath:'inset(0% 0% 0% 0%)',ease:'none',scrollTrigger:{trigger:'#diferenca',start:'top 85%',end:'top 20%',scrub:true}});
 /* 4 · como funciona — 6 passos, cor evolui (pin só no desktop) */
 (function(){var sec=$('#como');if(!sec)return;
  var path=$('.lp-route'),nodes=$$('.lp-n'),gl=$$('.lp-n__g'),rings=$$('.lp-n__r'),steps=$$('.lp-step2'),glow=$('.lp-flow__glow'),cnt=$('.lp-count'),cn=$('.lp-count__n'),segs=$$('.lp-seg i');
  var R=[.5,1.7,2.9,4.1,5.3,6.5],L=path.getTotalLength(),fr=R.map(function(_,i){var x=(i+.5)/6*1000,lo=0,hi=L;for(var k=0;k<28;k++){var m=(lo+hi)/2;path.getPointAtLength(m).x<x?lo=m:hi=m}return lo/L});
  function ring(tl,i,at){tl.to(rings[i],{keyframes:[{opacity:.85,scale:1,duration:.05},{opacity:0,scale:1.9,duration:.65,ease:'power2.out'}]},at)}
  function flowH(cfg){
   path.setAttribute('pathLength','1');path.style.strokeDasharray='1';path.style.strokeDashoffset='1';
   G.set(gl,{opacity:0});G.set(rings,{opacity:0,scale:1});G.set(nodes,{scale:1});G.set(steps,{opacity:.35,y:24});G.set(glow,{opacity:.1});cnt.classList.add('is-live');
   var tl;cfg.invalidateOnRefresh=true;
   tl=G.timeline({defaults:{ease:'none'},scrollTrigger:cfg,onUpdate:function(){var t=tl.time(),a=0;R.forEach(function(r,i){if(t>=r-.25)a=i});cn.textContent='0'+(a+1)}});
   tl.to(glow,{opacity:.45,duration:7.2},0);
   R.forEach(function(r,i){var s=r-.25;
    tl.to(path,{strokeDashoffset:1-fr[i],duration:i?r-R[i-1]:r},i?R[i-1]:0)
      .to(gl[i],{opacity:1,duration:.3},s).to(nodes[i],{scale:1.12,duration:.3,ease:'power2.out'},s).to(steps[i],{opacity:1,y:0,duration:.5,ease:'power2.out'},s-.1);
    ring(tl,i,s+.05);if(i)tl.to(nodes[i-1],{scale:1,duration:.3,ease:'power2.out'},s)});
   tl.to(path,{strokeDashoffset:0,duration:.7},6.5).to({},{duration:.01},8);
   return function(){sec.classList.remove('is-pin');cnt.classList.remove('is-live');path.style.strokeDashoffset='';path.style.strokeDasharray='';cn.textContent='01'}}
  var mm4=G.matchMedia();
  mm4.add('(min-width:900px) and (min-height:'+PH+'px)',function(){sec.classList.add('is-pin');
   var cl=flowH({trigger:sec,start:'top top',end:vh(2.8),pin:true,scrub:.5,anticipatePin:1});return cl});
  mm4.add('(min-width:900px) and (max-height:'+(PH-1)+'px)',function(){return flowH({trigger:'.lp-flow',start:'top 78%',end:'bottom 40%',scrub:.5})});
  mm4.add('(max-width:899px)',function(){
   G.set(gl,{opacity:0});G.set(rings,{opacity:0});G.set(nodes,{scale:1});G.set(steps,{opacity:.35,y:24});G.set(glow,{opacity:.1});G.set(segs,{scaleY:0});
   G.to(glow,{opacity:.45,ease:'none',scrollTrigger:{trigger:'.lp-flow',start:'top 70%',end:'bottom 50%',scrub:true}});
   steps.forEach(function(s,i){var t=G.timeline({defaults:{ease:'none'},scrollTrigger:{trigger:s,start:'top 78%',end:'bottom 52%',scrub:.4}});
    t.to(s,{opacity:1,y:0,duration:.3,ease:'power2.out'},0).to(gl[i],{opacity:1,duration:.12},0).to(nodes[i],{scale:1.12,duration:.12},0);ring(t,i,.02);
    if(segs[i])t.to(segs[i],{scaleY:1,duration:.8},.12);if(i<5)t.to(nodes[i],{scale:1,duration:.1},.9)})})})();
 /* 5 · camila em ação — 3 cenas, pin só no desktop, snap em 0 · ⅓ · ⅔ */
 mm.add('(min-width:900px) and (min-height:'+PH+'px)',function(){var sec=$('#acao');sec.classList.add('is-pin');
  pinST=ST.create({trigger:sec,start:'top top',end:vh(2.7),pin:true,anticipatePin:1,invalidateOnRefresh:true,snap:{snapTo:[0,1/3,2/3,1],duration:{min:.2,max:.55},delay:.1,ease:'power2.inOut'},onUpdate:function(s){var i=Math.min(tabs.length-1,Math.round(s.progress*tabs.length));if(i!==cur)setTopic(i,false,true)}});
  return function(){sec.classList.remove('is-pin');pinST=null}});
 ST.addEventListener('refresh',function(){movePin(cur,true)});
 /* 7 · o que destrava */
 onceIn('.lp-bento','top 82%',G.fromTo('.lp-b',{opacity:0,y:28},{opacity:1,y:0,duration:.7,ease:'power3.out',stagger:.07,paused:true}));
 if(fine)$$('.lp-b').forEach(function(c){var g=d.createElement('i');g.className='lp-glow';g.setAttribute('aria-hidden','true');c.insertBefore(g,c.firstChild);
  var gx=G.quickTo(g,'x',{duration:.35,ease:'power3.out'}),gy=G.quickTo(g,'y',{duration:.35,ease:'power3.out'});
  c.addEventListener('pointerenter',function(){G.to(c,{y:-4,duration:.3,ease:'power2.out'});G.to(g,{opacity:1,duration:.3})});
  c.addEventListener('pointermove',function(e){var r=c.getBoundingClientRect();gx(e.clientX-r.left);gy(e.clientY-r.top)});
  c.addEventListener('pointerleave',function(){G.to(c,{y:0,duration:.35,ease:'power2.out'});G.to(g,{opacity:0,duration:.3})})});
 /* 8 · quem é — retrato + assinatura */
 var qf=$('.lp-quem__fig img'),sp=$$('.lp-sig path');
 if(qf)onceIn('#quem','top 70%',G.fromTo(qf,{opacity:0,y:40},{opacity:1,y:0,duration:1.2,ease:'power3.out',paused:true}));
 if(sp.length)onceIn('.lp-sig','top 88%',G.fromTo(sp,{strokeDashoffset:1},{strokeDashoffset:0,duration:1.8,ease:'power2.inOut',stagger:.9,paused:true}));
 /* 8b · para quem é — checks no scroll, riscos ao entrar */
 $$('.lp-yes li').forEach(function(li){var p=$('path',li);G.fromTo(p,{strokeDashoffset:1},{strokeDashoffset:0,ease:'none',scrollTrigger:{trigger:li,start:'top 80%',end:'top 52%',scrub:true}})});
 $$('.lp-strike').forEach(function(s,i){onceIn(s.closest('li'),'top 88%',G.fromTo(s,{scaleX:0},{scaleX:1,duration:.7,delay:i*.18,ease:'power2.inOut',paused:true}))});
 /* 9 · formulário */
 onceIn('#lp-form','top 80%',G.fromTo('.lp-form h2,.lp-form .lp-lead,.lp-form .lp-prog,.lp-form .lp-prog__t,.lp-form .lp-fs[data-step="1"]',{opacity:0,y:24},{opacity:1,y:0,duration:.6,ease:'power3.out',stagger:.06,paused:true}));
 window.__lpDone=function(){var p=$('.lp-success .ok path');if(!p)return;p.setAttribute('pathLength','1');p.style.strokeDasharray='1';
  G.fromTo('.lp-success .ok',{scale:.6,opacity:0},{scale:1,opacity:1,duration:.5,ease:'back.out(1.8)'});
  G.fromTo(p,{strokeDashoffset:1},{strokeDashoffset:0,duration:.7,ease:'power2.out',delay:.2});
  G.fromTo('.lp-success p,.lp-success .lp-chip',{opacity:0,y:16},{opacity:1,y:0,duration:.6,stagger:.1,delay:.35,clearProps:'transform'})};
 /* 10 · CTA magnético */
 if(fine){var mg=$$('.mp-btn--lg,.lp-header .mp-btn').filter(function(b){return !b.closest('.lp-sticky')}).map(function(b){return{b:b,x:G.quickTo(b,'x',{duration:.4,ease:'power3.out'}),y:G.quickTo(b,'y',{duration:.4,ease:'power3.out'})}});
  addEventListener('pointermove',function(e){mg.forEach(function(m){var r=m.b.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;var cx=r.left+r.width/2,cy=r.top+r.height/2,dx=e.clientX-cx,dy=e.clientY-cy,near=Math.abs(dx)<r.width/2+56&&Math.abs(dy)<r.height/2+56;
   m.x(near?Math.max(-8,Math.min(8,dx*.2)):0);m.y(near?Math.max(-8,Math.min(8,dy*.2)):0)})},{passive:true})}
 addEventListener('load',function(){ST.refresh()});
}
})();