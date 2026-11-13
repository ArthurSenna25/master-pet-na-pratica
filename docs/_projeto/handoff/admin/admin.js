/* Painel — admin.js. Só interação; sem dependências. Sem JS: tudo continua legível e os formulários/links funcionam (HTML puro). */
(function(){
var d=document,$=function(s,c){return(c||d).querySelector(s)},$$=function(s,c){return[].slice.call((c||d).querySelectorAll(s))};
var root=$('#ad'),rm=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* [PROTÓTIPO — não portar] Navegação entre telas de demonstração pelo hash */
var scr=$$('.ad-screen');root.classList.add('ad-js');
function show(){var h=(location.hash||'#visao').slice(1),t=d.getElementById(h);if(!t||!t.classList.contains('ad-screen'))t=d.getElementById('visao');
 scr.forEach(function(s){s.classList.toggle('is-on',s===t)});$$('.ad-demo a').forEach(function(a){a.classList.toggle('is-on',a.getAttribute('href')==='#'+t.id)});window.scrollTo(0,0)}
addEventListener('hashchange',show);show();

/* Componente: menus (<details> Exportar / Menu) — fecham com Esc e clique fora; foco volta ao botão */
d.addEventListener('keydown',function(e){if(e.key!=='Escape')return;$$('.ad-dd[open]').forEach(function(m){m.removeAttribute('open');$('summary',m).focus()})});
d.addEventListener('click',function(e){$$('.ad-dd[open]').forEach(function(m){if(!m.contains(e.target))m.removeAttribute('open')})});

/* Componente: mostrar/ocultar senha (botão com aria-pressed e rótulo atualizado) */
d.addEventListener('click',function(e){var b=e.target.closest('[data-toggle-pw]');if(!b)return;var i=d.getElementById(b.getAttribute('data-toggle-pw')),on=i.type==='password';
 i.type=on?'text':'password';b.setAttribute('aria-pressed',on);b.querySelector('span').textContent=on?'Ocultar':'Mostrar';b.setAttribute('aria-label',(on?'Ocultar ':'Mostrar ')+b.getAttribute('aria-label').replace(/^(Mostrar|Ocultar) /,''))});

/* Componente: contador da observação (até 2000) */
d.addEventListener('input',function(e){var t=e.target;if(!t.matches('[data-count]'))return;var c=d.getElementById(t.getAttribute('data-count'));c.textContent=t.value.length+' / 2000'});

/* Componente: salvar (demo) — "Salvando…" e confirmação visível, anunciada via role=status */
d.addEventListener('submit',function(e){var f=e.target.closest('[data-demo-save]');if(!f)return;e.preventDefault();var b=$('[data-save]',f),ok=$('[data-saved]',f),old=b.textContent;
 b.textContent='Salvando…';b.setAttribute('aria-disabled','true');
 setTimeout(function(){b.textContent=old;b.removeAttribute('aria-disabled');if(ok)ok.hidden=false},900)});

/* Componente: modal do lead — role=dialog, foco preso, Esc/fundo fecham, foco volta ao item que abriu */
var tpl=$('#tpl-lead'),last=null,ov=null;
function focusables(c){return $$('a[href],button:not([aria-disabled="true"]),input:not([type=hidden]),select,textarea,summary,[tabindex]:not([tabindex="-1"])',c).filter(function(x){return x.offsetParent!==null})}
function close(){if(!ov)return;ov.remove();ov=null;d.body.style.overflow='';d.removeEventListener('keydown',trap,true);if(last)last.focus()}
function trap(e){if(!ov)return;if(e.key==='Escape'){e.preventDefault();close();return}if(e.key!=='Tab')return;var f=focusables(ov);if(!f.length)return;var a=f[0],z=f[f.length-1];
 if(e.shiftKey&&d.activeElement===a){e.preventDefault();z.focus()}else if(!e.shiftKey&&d.activeElement===z){e.preventDefault();a.focus()}}
d.addEventListener('click',function(e){var l=e.target.closest('[data-open-lead]');
 if(l&&l.closest('#leads, #leads-filtro')){e.preventDefault();last=l;ov=tpl.content.firstElementChild.cloneNode(true);root.appendChild(ov);d.body.style.overflow='hidden';
  ov.addEventListener('click',function(ev){if(ev.target===ov||ev.target.closest('[data-close]'))close()});d.addEventListener('keydown',trap,true);$('.ad-x',ov).focus();return}
});
})();
