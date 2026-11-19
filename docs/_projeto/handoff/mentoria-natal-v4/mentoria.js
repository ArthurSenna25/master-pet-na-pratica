/* Mentoria Master Pet · Natal v4 — interação e movimento (GSAP + ScrollTrigger + SplitText). Sem WebGL (a trilha é SVG; não precisou de 3D).
   Sem init global: window.MentoriaNatal.mount(root, opts) → { destroy }. No Next: client component pequeno (useEffect).
   Regras: só transform/opacity/clip-path (+ stroke-dashoffset). Estado oculto só abaixo da dobra (única exceção: linhas do H1, com failsafe de 3 s).
   Sem JS: tudo legível. prefers-reduced-motion: nenhuma cena roda (interações continuam). */
(function (g) {
  'use strict';
  var $ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var $1 = function (s, c) { return (c || document).querySelector(s); };
  var clamp = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };

  function mount(root, opts) {
    opts = opts || {};
    var NM = { reduced: g.matchMedia('(prefers-reduced-motion: reduce)').matches, fine: g.matchMedia('(hover: hover) and (pointer: fine)').matches };
    NM.mq = opts.mq; NM.gl = opts.gl; NM.noPin = opts.noPin; NM.motion = !NM.reduced && !!(g.gsap && g.ScrollTrigger);
    root.classList.add('nm-js');
    var offs = [initProgress(root), initForm(root, opts, NM), initPicks(root), initDepo(root, NM), initFaq(root, NM), initFab(root)];
    if (opts.demo) offs.push(initDemo(root));
    if (NM.motion) offs.push(initMotion(root, NM));
    return { destroy: function () { offs.forEach(function (f) { f && f(); }); root.classList.remove('nm-js'); } };
  }

  /* ───────── barra de progresso dourada (sempre; sem suavização) ───────── */
  function initProgress(root) {
    var bar = $1('.nm-progress i', root), raf = 0;
    function upd() { raf = 0; var h = document.documentElement.scrollHeight - g.innerHeight; bar.style.transform = 'scaleX(' + (h > 0 ? clamp(g.scrollY / h, 0, 1) : 0) + ')'; }
    function on() { if (!raf) raf = requestAnimationFrame(upd); }
    g.addEventListener('scroll', on, { passive: true }); g.addEventListener('resize', on); upd();
    return function () { g.removeEventListener('scroll', on); g.removeEventListener('resize', on); };
  }

  /* ───────── CENA 4 · "Onde o seu dia trava?" ───────── */
  function initPicks(root) {
    var picks = $('.nm-pick', root); if (!picks.length) return;
    var out = $1('.nm-out__t', root), desc = $1('.nm-out__d', root), rail = $('.nm-rail li', root), form = $1('.nm-form', root);
    picks.forEach(function (p) { p.setAttribute('role', 'button'); p.setAttribute('aria-pressed', 'false'); });
    function choose(p) {
      var n = +p.dataset.station;
      picks.forEach(function (q) { var on = q === p; q.classList.toggle('is-on', on); q.setAttribute('aria-pressed', on); });
      out.textContent = 'A trilha começaria por: ' + p.dataset.pick + '.';
      var card = $1('.nm-st[data-st="' + n + '"] p', root); desc.textContent = card ? card.textContent : '';
      rail.forEach(function (li) { li.classList.toggle('is-on', +li.dataset.s === n); });
      $('.nm-st', root).forEach(function (c) { c.classList.toggle('is-hit', +c.dataset.st === n); });
      root.dispatchEvent(new CustomEvent('nm:hit', { detail: n }));
      var r = form && form.querySelector('input[name="desafio"][value="' + p.dataset.desafio + '"]');
      if (r) { r.checked = true; var w = r.closest('[data-nm-f]'); if (w) w.dataset.state = ''; var note = $1('[data-nm-prefill]', form); if (note) note.hidden = false; }
      // nada é enviado: a escolha só vive neste navegador até o envio do formulário com consentimento
    }
    var click = function (e) { var p = e.target.closest('.nm-pick'); if (p) { e.preventDefault(); choose(p); } };
    var key = function (e) { var p = e.target.closest('.nm-pick'); if (p && e.key === ' ') { e.preventDefault(); choose(p); } };
    root.addEventListener('click', click); root.addEventListener('keydown', key);
    return function () { root.removeEventListener('click', click); root.removeEventListener('keydown', key); };
  }

  /* ───────── fita em perspectiva (CENA 3) ───────── */
  var NS = 'http://www.w3.org/2000/svg';
  function el(n, a, p) { var e = document.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
  function buildRibbon(svg) {
    svg.innerHTML = '';
    var LAB = ['Raio-X', 'Gargalos', 'Equipe', 'Preço', 'Padrões', 'Rotina'];
    var ST = [[520, 170, .9], [300, 300, .72], [560, 440, .54], [260, 590, .38], [540, 740, .22], [400, 900, .06]];
    var pts = [[720, 30, 1.05]].concat(ST).concat([[390, 1050, 0]]);
    var sc = function (d) { return 1 / (1 + 2.2 * d); };
    function cr(p0, p1, p2, p3, t) { var t2 = t * t, t3 = t2 * t; return [0, 1, 2].map(function (k) { return .5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2 + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3); }); }
    var S = [], N = 22, seg;
    for (seg = 0; seg < pts.length - 1; seg++) for (var i = 0; i < N; i++) S.push(cr(pts[Math.max(0, seg - 1)], pts[seg], pts[seg + 1], pts[Math.min(pts.length - 1, seg + 2)], i / N));
    S.push(pts[pts.length - 1]);
    var L = [], R = [], H1 = [], H2 = [], C = [];
    S.forEach(function (p, i) {
      var a = S[Math.max(0, i - 1)], b = S[Math.min(S.length - 1, i + 1)], tx = b[0] - a[0], ty = b[1] - a[1], l = Math.hypot(tx, ty) || 1, nx = -ty / l, ny = tx / l;
      var w = 68 * sc(p[2]) * (.22 + .78 * Math.abs(Math.cos(i * .33))), c = Math.cos(i * .33), off = w * .2 * Math.sign(Math.sin(i * .33));
      L.push([p[0] + nx * w / 2, p[1] + ny * w / 2]); R.push([p[0] - nx * w / 2, p[1] - ny * w / 2]);
      var hw = w * .22; H1.push([p[0] + nx * (off + hw), p[1] + ny * (off + hw)]); H2.push([p[0] + nx * (off - hw), p[1] + ny * (off - hw)]); C.push([p[0], p[1]]);
    });
    var poly = function (A, B, dx, dy) { return 'M' + A.map(function (q) { return (q[0] + (dx || 0)).toFixed(1) + ' ' + (q[1] + (dy || 0)).toFixed(1); }).join('L') + 'L' + B.slice().reverse().map(function (q) { return (q[0] + (dx || 0)).toFixed(1) + ' ' + (q[1] + (dy || 0)).toFixed(1); }).join('L') + 'Z'; };
    var line = 'M' + C.map(function (q) { return q[0].toFixed(1) + ' ' + q[1].toFixed(1); }).join('L');
    var defs = el('defs', {}, svg);
    var gr = el('linearGradient', { id: 'nm-rg', gradientUnits: 'userSpaceOnUse', x1: 0, y1: 0, x2: 800, y2: 1000 }, defs);
    [['0', '#8a6a1e'], ['.35', '#cdaa55'], ['.55', '#f0dca0'], ['.8', '#b8913a'], ['1', '#9f7b2a']].forEach(function (s) { el('stop', { offset: s[0], 'stop-color': s[1] }, gr); });
    var mk = el('mask', { id: 'nm-rm', maskUnits: 'userSpaceOnUse', x: -400, y: -400, width: 1600, height: 1800 }, defs);
    var mp = el('path', { d: line, fill: 'none', stroke: '#fff', 'stroke-width': 180, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, mk);
    var cam = el('g', { class: 'nm-rib__cam' }, svg), rb = el('g', { mask: 'url(#nm-rm)' }, cam);
    el('path', { d: poly(L, R, 10, 16), fill: 'rgba(0,0,0,.4)' }, rb);
    el('path', { d: poly(L, R), fill: 'url(#nm-rg)' }, rb);
    el('path', { d: poly(H1, H2), fill: 'rgba(255,248,222,.6)' }, rb);
    var cl = el('path', { d: line, fill: 'none', stroke: 'none' }, cam), total = cl.getTotalLength();
    // fração do comprimento em cada estação (ponto da curva mais próximo)
    var U = ST.map(function (s) { var best = 0, bd = 1e9; for (var i = 0; i <= 400; i++) { var q = cl.getPointAtLength(total * i / 400), d = Math.hypot(q.x - s[0], q.y - s[1]); if (d < bd) { bd = d; best = i / 400; } } return best; });
    mp.style.strokeDasharray = total; mp.style.strokeDashoffset = total;
    var nodes = ST.map(function (s, i) {
      var k = sc(s[2]) * 1.25, gN = el('g', { transform: 'translate(' + s[0] + ' ' + s[1] + ') scale(' + k.toFixed(3) + ')' }, cam);
      var halo = el('circle', { r: 54, fill: 'rgba(220,197,138,.28)', opacity: 0 }, gN), hit = el('circle', { r: 46, fill: 'none', stroke: '#f0dca0', 'stroke-width': 3, 'stroke-dasharray': '6 7', opacity: 0 }, gN);
      el('circle', { r: 30, fill: '#0a1633', stroke: '#cdaa55', 'stroke-width': 3 }, gN);
      var t = el('text', { 'text-anchor': 'middle', y: 9, fill: '#cdaa55', 'font-size': 26 }, gN); t.textContent = i + 1;
      var l = el('text', { 'text-anchor': 'start', x: 44, y: 8, fill: '#f9f5ec', 'font-size': 24, stroke: '#0a1633', 'stroke-width': 6, 'paint-order': 'stroke', 'stroke-linejoin': 'round' }, gN); l.textContent = LAB[i];
      return { g: gN, halo: halo, hit: hit };
    });
    var gl = el('path', { d: line, fill: 'none', stroke: 'rgba(255,250,232,.9)', 'stroke-width': 3.5, 'stroke-linecap': 'round' }, rb); gl.style.strokeDasharray = '110 ' + (total * 2);
    var glow = el('circle', { r: 26, fill: 'rgba(240,220,160,.35)' }, cam), orb = el('circle', { r: 10, fill: '#f0dca0' }, cam);
    var camS = ST.map(function (s) { return 1.05 / Math.pow(sc(s[2]), .9); }), hitN = 0;
    function render(t) {
      t = clamp(t, 0, 5); var k = Math.min(4, Math.floor(t)), f = t - k;
      var s = lerp(camS[k], camS[k + 1], f), x = lerp(ST[k][0], ST[k + 1][0], f), y = lerp(ST[k][1], ST[k + 1][1], f), u = lerp(U[k], U[k + 1], f);
      cam.setAttribute('transform', 'translate(' + (400 - x * s).toFixed(1) + ' ' + (500 - y * s).toFixed(1) + ') scale(' + s.toFixed(3) + ')');
      mp.style.strokeDashoffset = total * (1 - clamp(u + .004, 0, 1)); gl.style.strokeDashoffset = 110 - total * u;
      var q = cl.getPointAtLength(total * u); orb.setAttribute('cx', q.x); orb.setAttribute('cy', q.y); glow.setAttribute('cx', q.x); glow.setAttribute('cy', q.y);
      nodes.forEach(function (n, i) { var near = clamp(1 - Math.abs(i - t), 0, 1); n.g.setAttribute('opacity', i <= t + .5 ? 1 : .3); n.halo.setAttribute('opacity', near); n.hit.setAttribute('opacity', hitN === i + 1 ? 1 : 0); });
    }
    render(0);
    return { render: render, setHit: function (n) { hitN = n; } };
  }

  /* ───────── MOVIMENTO ───────── */
  function initMotion(root, NM) {
    var gsap = g.gsap, ST = g.ScrollTrigger, SplitText = g.SplitText;
    gsap.registerPlugin(ST); if (SplitText) gsap.registerPlugin(SplitText);
    var below = function (e) { return e.getBoundingClientRect().top > g.innerHeight * 0.92; };
    var mm = gsap.matchMedia(), cleanups = [];
    var PINQ = (NM.mq && NM.mq.pin) || '(min-width: 900px) and (min-height: 720px)', LITEQ = (NM.mq && NM.mq.lite) || '(max-width: 899px), (max-height: 719px)';
    var hero = $1('.nm-hero', root);

    /* utilidade: linhas com máscara (SplitText). H1 entra na carga (única exceção acima da dobra, com failsafe); demais, na entrada. */
    function lines(e, immediate) {
      if (!SplitText || !e) return null; var played = !!immediate, tw0 = null;
      SplitText.create(e, { type: 'lines', mask: 'lines', autoSplit: true, onSplit: function (self) {
        var tw = gsap.from(self.lines, { yPercent: 115, duration: 1.15, ease: 'power4.out', stagger: .1, paused: !immediate });
        if (played && !immediate) tw.progress(1); tw0 = tw; return tw; } });
      if (!immediate) ST.create({ trigger: e, start: 'top 88%', once: true, onEnter: function () { played = true; if (tw0) tw0.play(); } });
      return function () { return tw0; };
    }
    function rise(sel) {
      var groups = new Map();
      $(sel, root).forEach(function (n) { var p = n.parentElement; (groups.get(p) || groups.set(p, []).get(p)).push(n); });
      groups.forEach(function (kids, p) { if (!below(kids[0])) return; gsap.set(kids, { opacity: 0, y: 36 });
        ST.create({ trigger: p, start: 'top 85%', once: true, onEnter: function () { gsap.to(kids, { opacity: 1, y: 0, duration: .9, ease: 'power3.out', stagger: .1, clearProps: 'opacity,transform' }); } }); });
    }

    /* CTA magnético (só ponteiro fino): raio de ativação curto, deslocamento máx. ~12% do raio, inércia ~0,6 s */
    if (NM.fine) $('[data-nm-magnet]', root).forEach(function (b) {
      var bx = gsap.quickTo(b, 'x', { duration: .6, ease: 'power3.out' }), by = gsap.quickTo(b, 'y', { duration: .6, ease: 'power3.out' });
      var m = function (e) { var r = b.getBoundingClientRect(), R = Math.max(r.width, r.height) / 2, dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2), max = .12 * R;
        if (Math.abs(dx) < r.width / 2 + 32 && Math.abs(dy) < r.height / 2 + 32) { bx(clamp(dx * .12, -max, max)); by(clamp(dy * .12, -max, max)); } else { bx(0); by(0); } };
      g.addEventListener('pointermove', m, { passive: true }); cleanups.push(function () { g.removeEventListener('pointermove', m); });
    });

    /* CENA 1 · Abertura — UM movimento: paralaxe em 3 camadas (fundo de luz, retrato, poeira) + título por máscara de linha. Único loop: poeira (canvas 2D). */
    var h1tw = lines($1('.nm-h1', root), true);
    g.setTimeout(function () { var t = h1tw && h1tw(); if (t && t.progress() < 1) t.progress(1); }, 3000);
    (function dust() {
      var cv = $1('.nm-sparkles', root); if (!cv) return; var cx = cv.getContext('2d'), w = 0, h = 0, ps = [], on = true;
      function size() { var d = Math.min(g.devicePixelRatio || 1, 1.5); w = cv.clientWidth; h = cv.clientHeight; if (!w) return; cv.width = w * d; cv.height = h * d; cx.setTransform(d, 0, 0, d, 0, 0); ps = Array.apply(null, Array(w < 700 ? 18 : 44)).map(function () { return { x: Math.random() * w, y: Math.random() * h, r: .7 + Math.random() * 1.6, v: 4 + Math.random() * 9, p: Math.random() * 6.28, s: .5 + Math.random() }; }); }
      function tk(t, dt) { if (!on || !w) return; cx.clearRect(0, 0, w, h); for (var i = 0; i < ps.length; i++) { var o = ps[i]; o.y -= o.v * dt / 1000; if (o.y < -4) { o.y = h + 4; o.x = Math.random() * w; } cx.globalAlpha = .12 + .7 * Math.pow(.5 + .5 * Math.sin(t * o.s + o.p), 2); cx.fillStyle = '#dcc58a'; cx.beginPath(); cx.arc(o.x, o.y, o.r, 0, 6.283); cx.fill(); } }
      size(); var ro = new ResizeObserver(size); ro.observe(cv); var st = ST.create({ trigger: hero, start: 'top bottom', end: 'bottom top', onToggle: function (s) { on = s.isActive; } });
      gsap.ticker.add(tk); cleanups.push(function () { gsap.ticker.remove(tk); ro.disconnect(); st.kill(); });
    })();
    gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } })
      .to($1('.nm-hero__bg', root), { yPercent: 8, ease: 'none' }, 0).to($1('.nm-hero__photo img', root), { yPercent: -5, ease: 'none' }, 0).to($1('.nm-sparkles', root), { yPercent: -14, ease: 'none' }, 0);

    /* CENA 2 · Um dia na bancada — pin ≥900×720: relógio 8h→18h, uma dor por hora, depois o diagnóstico */
    var dia = $1('.nm-dia', root);
    mm.add(PINQ, function () {
      dia.classList.add('is-pinned');
      var beats = $('.nm-beat', dia), clk = $1('[data-nm-clock]', dia), diag = $1('.nm-diag', dia), stage = $1('.nm-dia__stage', dia), H = { h: 8 }, U = .47;
      gsap.set(beats, { autoAlpha: 0, y: 24 }); gsap.set(diag, { autoAlpha: 0, y: 36 });
      var tl = gsap.timeline({ scrollTrigger: { trigger: dia, start: 'top top', end: '+=90%', pin: !NM.noPin, scrub: .6, anticipatePin: 1, invalidateOnRefresh: true } });
      tl.to(H, { h: 18, ease: 'none', duration: 4.7, onUpdate: function () { clk.textContent = String(Math.round(H.h)).padStart(2, '0'); } }, 0);
      beats.forEach(function (b, i) { var t0 = (+b.dataset.h - 8) * U, t1 = i < beats.length - 1 ? (+beats[i + 1].dataset.h - 8) * U : 4.0;
        tl.to(b, { autoAlpha: 1, y: 0, duration: .3, ease: 'power3.out' }, t0 + .05); if (i < beats.length - 1) tl.to(b, { autoAlpha: 0, y: -18, duration: .25 }, t1 - .25); });
      tl.to(stage, { autoAlpha: 0, duration: .35 }, 4.1).to(diag, { autoAlpha: 1, y: 0, duration: .5, ease: 'power3.out' }, 4.25).to({}, { duration: .3 });
      return function () { dia.classList.remove('is-pinned'); clk.textContent = '08'; gsap.set([beats, diag, stage], { clearProps: 'all' }); };
    });
    mm.add(LITEQ, function () { rise('.nm-beat'); });

    /* CENA 3 · Trilha — fita dourada em perspectiva (SVG, com brilho que percorre) + cartões em profundidade + ambiente desfocado; pin ≥900×720, snap por estação */
    var trilha = $1('.nm-trilha', root), deck = $('.nm-st', root), navBtns = $('[data-st-go]', root), cur = 1, pinST = null, amb = $1('.nm-trilha__amb', root), ribRef = null;
    function setCur(n) { cur = clamp(n, 1, 6); navBtns.forEach(function (b) { var k = b.dataset.stGo; b.setAttribute('aria-current', String(+k === cur)); }); deck.forEach(function (c) { c.classList.toggle('is-on', +c.dataset.st === cur); }); }
    var navClick = function (e) {
      var b = e.target.closest('[data-st-go]'); if (!b) return; var k = b.dataset.stGo, n = clamp(k === 'prev' ? cur - 1 : k === 'next' ? cur + 1 : +k, 1, 6);
      if (pinST) { g.scrollTo({ top: pinST.start + (pinST.end - pinST.start) * ((n - 1) / 5), behavior: NM.reduced ? 'auto' : 'smooth' }); }
      else { var c = deck[n - 1]; g.scrollTo({ top: c.getBoundingClientRect().top + g.scrollY - 100, behavior: NM.reduced ? 'auto' : 'smooth' }); setCur(n); }
    };
    root.addEventListener('click', navClick); cleanups.push(function () { root.removeEventListener('click', navClick); });
    var hit = function (e) { if (ribRef) ribRef.setHit(e.detail); }; root.addEventListener('nm:hit', hit);
    mm.add(PINQ, function () {
      trilha.classList.add('is-pinned');
      var rib = buildRibbon($1('.nm-ribbon', root)); ribRef = rib; var P = { t: 0 };
      function cards(t) { deck.forEach(function (c, j) {
        var d = j - t, o, y, s, rx, z;
        if (d > 0) { o = d <= 1 ? 1 - .65 * d : Math.max(0, .35 * (2 - d)); y = 36 * d; s = 1 - .06 * d; rx = -6 * d; z = -90 * d; }
        else { var m = Math.min(-d, 1); o = 1 - m; y = -80 * m; s = 1 - .1 * m; rx = 14 * m; z = -170 * m; }
        gsap.set(c, { opacity: clamp(o, 0, 1), y: y, scale: s, rotationX: rx, z: z, zIndex: 20 - Math.round(Math.abs(d) * 3), pointerEvents: 'none' });
      }); setCur(Math.round(t) + 1); gsap.set(amb, { xPercent: lerp(-3, 3, t / 5) }); }
      var tl = gsap.timeline({ scrollTrigger: { trigger: trilha, start: 'top top', end: '+=100%', pin: !NM.noPin, scrub: .7, anticipatePin: 1, invalidateOnRefresh: true, snap: { snapTo: 1 / 5, directional: false, duration: { min: .25, max: .6 }, delay: .05, ease: 'power2.inOut' } } });
      tl.to(P, { t: 5, ease: 'none', duration: 5, onUpdate: function () { rib.render(P.t); cards(P.t); } });
      pinST = tl.scrollTrigger; rib.render(0); cards(0);
      return function () { pinST = null; ribRef = null; trilha.classList.remove('is-pinned'); gsap.set([deck, amb], { clearProps: 'all' }); $1('.nm-ribbon', root).innerHTML = ''; };
    });
    mm.add(LITEQ, function () { setCur(1); rise('.nm-deck .nm-st'); var th = $1('.nm-thread', root); if (th && below($1('.nm-deck', root))) { gsap.set(th, { scaleY: 0 }); gsap.to(th, { scaleY: 1, ease: 'none', scrollTrigger: { trigger: $1('.nm-deck', root), start: 'top 70%', end: 'bottom 70%', scrub: .5 } }); } });

    /* CENA 4 · Do improviso ao processo — cartões soltos e inclinados se alinham na grade ao rolar (sem pin) */
    var pcs = $('.nm-pc', root), pcg = $1('.nm-pcs', root);
    if (pcs.length && below(pcg)) {
      var off = [[-30, -22, -6], [6, -30, 4], [34, -16, -5], [-26, 24, 5], [8, 30, -4], [30, 20, 6]];
      pcs.forEach(function (c, i) { gsap.set(c, { xPercent: off[i][0], yPercent: off[i][1], rotation: off[i][2], opacity: 0 }); });
      gsap.timeline({ scrollTrigger: { trigger: pcg, start: 'top 92%', end: 'top 38%', scrub: .8 } })
        .to(pcs, { opacity: 1, duration: .25, ease: 'none', stagger: .03 }, 0).to(pcs, { xPercent: 0, yPercent: 0, rotation: 0, duration: 1, ease: 'power2.out', stagger: .04 }, 0);
    }

    /* CENA 5 · A Camila — revelação por clip-path + zoom leve ancorado no rosto (transform-origin 50% 20%; a imagem não desloca, o rosto não sai do quadro) */
    $('[data-nm-ph]', root).forEach(function (f, i) {
      var im = $1('img', f);
      gsap.fromTo(im, { scale: 1.05 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: f, start: 'top bottom', end: 'bottom top', scrub: true } });
      if (below(f)) { gsap.set(f, { clipPath: 'inset(0 0 100% 0)' }); ST.create({ trigger: f, start: 'top 88%', once: true, onEnter: function () { gsap.to(f, { clipPath: 'inset(0 0 0% 0)', duration: 1.3, delay: i * .12, ease: 'power3.inOut', clearProps: 'clipPath' }); } }); }
    });
    rise('.nm-fichas li'); rise('.nm-who__c'); rise('.nm-end__copy li'); rise('.nm-answer');
    lines($1('#h-trilha', root)); lines($1('#h-lista', root));

    /* CENA 7 · Como funciona — a linha dourada liga os passos conforme a rolagem */
    var tlines = $('.nm-tl__line', root), tl3 = $1('.nm-tl', root);
    if (tlines.length && below(tl3)) { gsap.set(tlines, { scaleY: 0 }); gsap.timeline({ scrollTrigger: { trigger: tl3, start: 'top 75%', end: 'bottom 60%', scrub: .6 } }).to(tlines, { scaleY: 1, ease: 'none', stagger: 1, duration: 1 }); }
    rise('.nm-tl__s');

    /* CENA 8 · convite do bônus — inclinação 3D + brilho que segue o cursor (só ponteiro fino) */
    var inv = $1('[data-nm-tilt3d]', root);
    if (inv) {
      var face = $1('.nm-invite__face', inv), sh = $1('.nm-invite__sheen', inv);
      if (below(inv)) { gsap.set(face, { opacity: 0, y: 60, rotationX: 14, transformPerspective: 1400 }); ST.create({ trigger: inv, start: 'top 85%', once: true, onEnter: function () { gsap.to(face, { opacity: 1, y: 0, rotationX: 0, duration: 1.2, ease: 'power3.out' }); } }); }
      if (NM.fine) {
        gsap.set(face, { transformPerspective: 1400 });
        var fx = gsap.quickTo(face, 'rotationY', { duration: .6, ease: 'power3.out' }), fy = gsap.quickTo(face, 'rotationX', { duration: .6, ease: 'power3.out' }), sx = gsap.quickTo(sh, 'x', { duration: .5, ease: 'power3.out' }), sy = gsap.quickTo(sh, 'y', { duration: .5, ease: 'power3.out' });
        var im = function (e) { var r = inv.getBoundingClientRect(), nx = (e.clientX - r.left) / r.width, ny = (e.clientY - r.top) / r.height; fx((nx - .5) * 12); fy(-(ny - .5) * 10); sx((nx - .5) * r.width); sy((ny - .5) * r.height); };
        var il = function () { fx(0); fy(0); sx(0); sy(0); };
        inv.addEventListener('pointermove', im); inv.addEventListener('pointerleave', il);
      }
    }
    return function () { cleanups.forEach(function (f) { f(); }); root.removeEventListener('nm:hit', hit); mm.revert(); ST.getAll().forEach(function (s) { s.kill(); }); };
  }

  /* ───────── DEPOIMENTOS: faixa navegável (setas, arrastar, teclado ←/→, scroll-snap, sem rotação automática) ───────── */
  function initDepo(root, NM) {
    var tr = $1('.nm-dep__track', root); if (!tr) return function () {};
    var cards = $('.nm-dep__c', tr), ct = $1('[data-nm-dep-ct]', root), prev = $1('[data-nm-dep="-1"]', root), next = $1('[data-nm-dep="1"]', root), drag = null, moved = 0;
    var step = function () { var a = cards[0], b = cards[1]; return b ? b.offsetLeft - a.offsetLeft : a.offsetWidth; };
    function idx() { var x = tr.scrollLeft, k = 0, best = 1e9; cards.forEach(function (c, i) { var d = Math.abs(c.offsetLeft - tr.offsetLeft - x); if (d < best) { best = d; k = i; } }); return k; }
    function upd() { var k = idx(), end = tr.scrollLeft + tr.clientWidth >= tr.scrollWidth - 2; if (end) k = cards.length - 1; if (ct) ct.textContent = (k + 1) + ' / ' + cards.length; if (prev) prev.disabled = tr.scrollLeft <= 2; if (next) next.disabled = end; }
    function go(d) { tr.scrollBy({ left: d * step(), behavior: NM.reduced ? 'auto' : 'smooth' }); }
    var onKey = function (e) { if (e.key === 'ArrowRight') { e.preventDefault(); go(1); } else if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); } };
    var onClick = function (e) { var b = e.target.closest('[data-nm-dep]'); if (b) go(+b.dataset.nmDep); var v = e.target.closest('[data-nm-vid]'); if (v) { var n = $1('[data-nm-vn]', v.closest('.nm-dep__vid')); if (n) n.textContent = 'Vídeo de exemplo: nenhum arquivo de vídeo nesta demonstração.'; } };
    var down = function (e) { if (e.pointerType !== 'mouse' || e.button !== 0 || e.target.closest('button')) return; drag = { x: e.clientX, s: tr.scrollLeft }; moved = 0; tr.classList.add('is-drag'); tr.setPointerCapture(e.pointerId); };
    var move = function (e) { if (!drag) return; moved = e.clientX - drag.x; tr.scrollLeft = drag.s - moved; };
    var up = function () { if (!drag) return; drag = null; tr.classList.remove('is-drag'); var k = idx(); tr.scrollTo({ left: cards[k].offsetLeft - tr.offsetLeft, behavior: 'smooth' }); };
    tr.addEventListener('keydown', onKey); root.addEventListener('click', onClick); tr.addEventListener('scroll', upd, { passive: true }); g.addEventListener('resize', upd);
    tr.addEventListener('pointerdown', down); tr.addEventListener('pointermove', move); tr.addEventListener('pointerup', up); tr.addEventListener('pointercancel', up); upd();
    return function () { tr.removeEventListener('keydown', onKey); root.removeEventListener('click', onClick); tr.removeEventListener('scroll', upd); g.removeEventListener('resize', upd); };
  }

  /* ───────── CTA flutuante (celular): entra depois da abertura, sai no formulário ───────── */
  function initFab(root) {
    var fab = $1('[data-nm-fab]', root), hero = $1('.nm-hero', root), end = $1('.nm-end', root); if (!fab || !hero || !end || !('IntersectionObserver' in g)) return function () {};
    var a = true, b = false, io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.target === hero) a = e.intersectionRatio > .15; else b = e.intersectionRatio > .1; }); fab.classList.toggle('is-in', !a && !b); }, { threshold: [0, .1, .15, .3] });
    io.observe(hero); io.observe(end); return function () { io.disconnect(); };
  }

  /* ───────── FAQ: consulta guiada pela rolagem (≥900px, sem sequestrar a rolagem) · acordeão · lista aberta em reduced-motion ───────── */
  function initFaq(root, NM) {
    var sec = $1('.nm-faq', root); if (!sec) return function () {};
    var its = $('.nm-faq__it', sec), qs = its.map(function (i) { return $1('.nm-faq__q', i); }), list = $1('.nm-faq__c', sec), bar = $1('.nm-faq__line i', sec), ghost = $1('.nm-faq__ghost', sec);
    var mq = g.matchMedia('(min-width: 900px)'), mode = '', cur = 0, manualY = null, raf = 0, ays = [];
    function setAy(k) { if (ays[k] == null) return; list.style.setProperty('--ay', ays[k] + 'px'); if (ghost) ghost.textContent = '0' + (k + 1); var cn = $1('.nm-faq__cnt', sec); if (cn) cn.textContent = '0' + (k + 1) + ' / 0' + its.length; }
    function layout() {
      its.forEach(function (it) { $1('.nm-faq__a', it).style.marginTop = ''; }); if (mode !== 'panel') return;
      var lh = list.offsetHeight; its.forEach(function (it, k) { var a = $1('.nm-faq__a', it), q = $1('.nm-faq__qh', it), top = q.offsetTop; a.style.marginTop = Math.max(0, Math.min(top, lh - a.offsetHeight - 8)) + 'px'; ays[k] = top + q.offsetHeight / 2; }); setAy(cur);
    }
    function paint(open) { its.forEach(function (it, k) { var on = open.indexOf(k) > -1; it.classList.toggle('is-on', on); qs[k].setAttribute('aria-expanded', on ? 'true' : 'false'); }); if (mode === 'panel' && open.length) setAy(open[0]); }
    function line(p) { if (bar) bar.style.transform = 'scaleY(' + clamp(p, 0, 1) + ')'; }
    function setMode() {
      var m = !NM.reduced && mq.matches ? 'panel' : 'acc'; if (m !== mode) { mode = m; sec.dataset.js = m; manualY = null; if (m === 'panel') { cur = 0; paint([0]); } else paint(NM.reduced ? its.map(function (_, k) { return k; }) : [0]); }
      layout(); onScroll();
    }
    function onScroll() {
      if (mode !== 'panel') return; if (manualY !== null && Math.abs(g.scrollY - manualY) > 160) manualY = null; if (manualY !== null) return;
      var r = list.getBoundingClientRect(), p = clamp((g.innerHeight * .6 - r.top) / r.height, 0, .9999), k = Math.floor(p * its.length);
      line(p); if (k !== cur) { cur = k; paint([k]); }
    }
    function tick() { if (!raf) raf = requestAnimationFrame(function () { raf = 0; onScroll(); }); }
    var click = function (e) {
      var b = e.target.closest('.nm-faq__q'); if (!b || !sec.contains(b)) return; var k = qs.indexOf(b);
      if (mode === 'panel') { cur = k; manualY = g.scrollY; paint([k]); line((k + 1) / its.length); }
      else paint(its.map(function (it, n) { return n === k ? !it.classList.contains('is-on') : it.classList.contains('is-on'); }).reduce(function (a, on, n) { if (on) a.push(n); return a; }, []));
    };
    var key = function (e) { var b = e.target.closest('.nm-faq__q'); if (!b) return; var k = qs.indexOf(b), t = e.key === 'ArrowDown' ? k + 1 : e.key === 'ArrowUp' ? k - 1 : e.key === 'Home' ? 0 : e.key === 'End' ? qs.length - 1 : -1; if (t < 0) return; e.preventDefault(); qs[clamp(t, 0, qs.length - 1)].focus(); };
    sec.addEventListener('click', click); sec.addEventListener('keydown', key); g.addEventListener('scroll', tick, { passive: true }); g.addEventListener('resize', setMode); g.addEventListener('load', layout); setMode();
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(layout);
    return function () { sec.removeEventListener('click', click); sec.removeEventListener('keydown', key); g.removeEventListener('scroll', tick); g.removeEventListener('resize', setMode); g.removeEventListener('load', layout); };
  }

  /* ───────── FORMULÁRIO (2 passos) ───────── */
  var MSG = { nome: 'Informe seu nome (pelo menos 2 letras).', whatsapp: 'Informe DDD e número. Ex.: (14) 99999-9999.', cidade: 'Use o formato Cidade/UF. Ex.: Lins/SP.', negocio: 'Informe o nome do seu banho e tosa.', tempo: 'Escolha uma opção.', equipe: 'Escolha uma opção.', desafio: 'Escolha uma opção.', consentimento: 'Para entrar na lista, marque o consentimento.' };
  var RULES = { nome: function (v) { return v.trim().length >= 2 && v.length <= 80; }, whatsapp: function (v) { var d = v.replace(/\D/g, ''); return d.length === 10 || d.length === 11; }, cidade: function (v) { return /^.{2,60}\/\s?[A-Za-z]{2}$/.test(v.trim()); }, negocio: function (v) { return v.trim().length >= 2 && v.length <= 80; } };
  var STEP = { 1: ['nome', 'whatsapp'], 2: ['cidade', 'negocio', 'tempo', 'equipe', 'desafio', 'consentimento'] };

  function initForm(root, opts, NM) {
    var form = $1('.nm-form', root); if (!form) return function () {};
    var gsap = g.gsap, ctl = { step: 1, touched: {} }, panes = $('.nm-pane', form), title = $1('[data-nm-prog-t]', form), all = STEP[1].concat(STEP[2]);
    function wrapOf(name) { var e = form.elements[name]; var n = e && e.length && !e.tagName ? e[0] : e; return n && n.closest('[data-nm-f]'); }
    function value(name) { var e = form.elements[name]; if (!e) return ''; if (name === 'consentimento') return e.checked; if (e.length && !e.tagName) { var c = $1('input[name="' + name + '"]:checked', form); return c ? c.value : ''; } return e.value; }
    function ok(name) { var v = value(name); return RULES[name] ? RULES[name](v) : !!v; }
    function paint(name, show) {
      var w = wrapOf(name); if (!w) return true; var good = ok(name), msg = $1('.nm-msg', w);
      w.dataset.state = !show ? '' : good ? (RULES[name] ? 'valid' : '') : 'invalid';
      if (msg) $1('span', msg).textContent = good ? '' : MSG[name];
      $('input', w).forEach(function (i) { i.setAttribute('aria-invalid', show && !good ? 'true' : 'false'); }); return good;
    }
    function validateStep(n, focus) { var first = null; STEP[n].forEach(function (k) { ctl.touched[k] = true; if (!paint(k, true) && !first) first = k; }); if (first && focus) { var i = $1('input,textarea', wrapOf(first)); if (i) i.focus(); } return !first; }
    function goto(n, focus, animate) {
      var prev = ctl.step; ctl.step = n; form.dataset.step = n;
      var inc = panes[n - 1], out = panes[prev - 1];
      function swap() {
        panes.forEach(function (p) { p.hidden = Number(p.dataset.step) !== n; });
        if (title) title.innerHTML = 'Passo <b>' + n + '</b> de 2 · ' + (n === 1 ? 'Contato' : 'Seu negócio');
        $('.nm-prog li', form).forEach(function (x, i) { i + 1 === n ? x.setAttribute('aria-current', 'step') : x.removeAttribute('aria-current'); });
        if (focus) { var f = $1('input', panes[n - 1]); if (f) f.focus({ preventScroll: true }); }
      }
      if (animate && NM.motion && prev !== n) {
        gsap.to(out, { opacity: 0, y: -18, clipPath: 'inset(0 0 100% 0)', duration: .35, ease: 'power2.in', onComplete: function () { gsap.set(out, { clearProps: 'all' }); swap();
          gsap.fromTo(inc, { opacity: 0, y: 34, clipPath: 'inset(100% 0 0 0)' }, { opacity: 1, y: 0, clipPath: 'inset(0% 0 0 0)', duration: .75, ease: 'power3.out', clearProps: 'clipPath,transform,opacity' }); } });
      } else swap();
    }
    function burst() { // celebração contida: uma vez
      if (!NM.motion) return; var host = $1('.nm-ok', form);
      for (var i = 0; i < 26; i++) {
        var s = document.createElementNS(NS, 'svg'); s.setAttribute('class', 'nm-spark'); s.setAttribute('aria-hidden', 'true'); s.innerHTML = '<use href="#nm-spark"/>'; host.appendChild(s);
        var a = Math.random() * 6.283, r = 70 + Math.random() * 170;
        gsap.fromTo(s, { x: 0, y: 0, scale: .3 + Math.random() * .5, opacity: 1, rotation: 0 }, { x: Math.cos(a) * r, y: Math.sin(a) * r * .8 - 30, rotation: Math.random() * 180 - 90, scale: .2, opacity: 0, duration: 1.3 + Math.random() * .8, ease: 'power3.out', delay: Math.random() * .15, onComplete: (function (n) { return function () { n.remove(); }; })(s) });
      }
    }
    function state(s) {
      form.dataset.state = s || ''; var btn = $1('[data-nm-submit]', form), lab = $1('[data-nm-label]', btn), sending = s === 'sending';
      btn.disabled = sending; btn.setAttribute('aria-busy', sending); lab.textContent = sending ? 'Enviando…' : 'Entrar na lista da turma';
      if (s === 'ok') { var h = $1('[data-nm-ok-h]', form); h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); burst(); }
    }
    function mask(e) { var d = e.target.value.replace(/\D/g, '').slice(0, 11); e.target.value = d.length > 6 ? '(' + d.slice(0, 2) + ') ' + d.slice(2, d.length > 10 ? 7 : 6) + '-' + d.slice(d.length > 10 ? 7 : 6) : d.length > 2 ? '(' + d.slice(0, 2) + ') ' + d.slice(2) : d; }
    var onInput = function (e) { var n = e.target.name; if (n === 'whatsapp') mask(e); if (all.indexOf(n) > -1 && (ctl.touched[n] || e.type === 'change')) { ctl.touched[n] = true; paint(n, true); } if (n === 'desafio') { var nt = $1('[data-nm-prefill]', form); if (nt && e.isTrusted) nt.hidden = true; } };
    var onBlur = function (e) { var n = e.target.name; if (n && e.target.value !== '' && all.indexOf(n) > -1) { ctl.touched[n] = true; paint(n, true); } };
    var onSubmit = function (e) {
      e.preventDefault();
      if (!validateStep(1, false)) { goto(1, false); validateStep(1, true); return; }
      if (!validateStep(2, true)) return;
      if (form.elements.website && form.elements.website.value) { state('ok'); return; }
      state('sending'); var data = {}; new FormData(form).forEach(function (v, k) { data[k] = v; });
      var send = opts.submit || function () { return new Promise(function (r) { setTimeout(r, 1400); }); }; // DEMO: no app, Server Action
      Promise.resolve(send(data)).then(function () { state('ok'); }, function () { state(''); });
    };
    form.addEventListener('input', onInput); form.addEventListener('change', onInput); form.addEventListener('focusout', onBlur); form.addEventListener('submit', onSubmit);
    $1('[data-nm-next]', form).addEventListener('click', function () { if (validateStep(1, true)) goto(2, true, true); });
    $1('[data-nm-back]', form).addEventListener('click', function () { goto(1, true, true); });
    goto(1, false);
    form.__nm = { goto: function (n) { goto(n, false, false); }, state: state, validateStep: validateStep, ctl: ctl };
    return function () { form.removeEventListener('input', onInput); form.removeEventListener('change', onInput); form.removeEventListener('focusout', onBlur); form.removeEventListener('submit', onSubmit); panes.forEach(function (p) { p.hidden = false; }); };
  }

  /* ───────── DEMO: não portar ───────── */
  function initDemo(root) {
    var form = $1('.nm-form', root), api = form && form.__nm; if (!api) return;
    function reset() { form.reset(); $('[data-nm-f]', form).forEach(function (w) { w.dataset.state = ''; }); api.ctl.touched = {}; api.state(''); var nt = $1('[data-nm-prefill]', form); if (nt) nt.hidden = true; }
    function fill() { var v = { nome: 'Ana Exemplo', whatsapp: '(14) 99999-0000', cidade: 'Lins/SP', negocio: 'Pet Exemplo' }; Object.keys(v).forEach(function (k) { form.elements[k].value = v[k]; }); ['tempo', 'equipe', 'desafio'].forEach(function (n) { $1('input[name="' + n + '"]', form).checked = true; }); form.elements.consentimento.checked = true; }
    function apply(s) { reset(); if (s === 's1') api.goto(1); if (s === 's2') api.goto(2); if (s === 'err') { api.goto(2); api.validateStep(2, false); } if (s === 'err1') { api.goto(1); api.validateStep(1, false); } if (s === 'send') { fill(); api.goto(2); api.state('sending'); } if (s === 'ok') { fill(); api.state('ok'); } }
    var h = function (e) { var b = e.target.closest('[data-nm-demo]'); if (b) apply(b.dataset.nmDemo); };
    root.addEventListener('click', h); var m = /demo=(\w+)/.exec(g.location.hash); if (m) apply(m[1]);
    return function () { root.removeEventListener('click', h); };
  }

  g.MentoriaNatal = { mount: mount };
})(window);
