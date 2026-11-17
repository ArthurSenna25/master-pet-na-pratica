import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { construirFita, type Fita } from "./fita";
import { cabe, clamp, lerp, NOPIN, PIN, type Cleanup } from "./util";

export const EVENTO_ESTACAO = "nm:hit"; // enviado pelo Diagnostico ("Onde o seu dia trava?"): detail = nº da estação

const TOTAL = 6;

/** Realce vindo do Diagnóstico: acende o cartão e o botão da estação escolhida. Só classe (estado, sem movimento): vale também com reduced-motion. */
export function realce(): Cleanup {
  const sec = document.querySelector<HTMLElement>(".nm-trilha");
  if (!sec) return () => {};
  const aoEscolher = (e: Event) => {
    const n = Number((e as CustomEvent<number>).detail);
    sec.querySelectorAll<HTMLElement>(".nm-st").forEach((c) => c.classList.toggle("is-hit", Number(c.dataset.st) === n));
    sec.querySelectorAll<HTMLElement>("[data-st-go]").forEach((b) => b.classList.toggle("is-hit", Number(b.dataset.stGo) === n));
  };
  window.addEventListener(EVENTO_ESTACAO, aoEscolher);
  return () => {
    window.removeEventListener(EVENTO_ESTACAO, aoEscolher);
    sec.querySelectorAll(".is-hit").forEach((e) => e.classList.remove("is-hit"));
  };
}

/**
 * Cena 3 · Trilha (handoff v4). Pin (PIN): fita dourada em perspectiva + cartões em profundidade + ambiente deslocado, 1 estação por 1/5 do scroll, com snap.
 * Sem pin (NOPIN): cartões sobem ao entrar (só se estão abaixo da dobra) e o fio vertical cresce. Reduced-motion: esta função não é chamada
 * (grade estática de cartões, sem fita, sem nav). Estado oculto só é aplicado aqui, depois da hidratação.
 */
export function trilha(): Cleanup {
  const sec = document.querySelector<HTMLElement>(".nm-trilha");
  const ribbon = sec?.querySelector<SVGSVGElement>(".nm-ribbon");
  const deckEl = sec?.querySelector<HTMLElement>(".nm-deck");
  if (!sec || !ribbon || !deckEl) return () => {};
  const deck = [...sec.querySelectorAll<HTMLElement>(".nm-st")];
  const navBtns = [...sec.querySelectorAll<HTMLElement>("[data-st-go]")];
  const amb = sec.querySelector<HTMLElement>(".nm-trilha__amb");
  if (deck.length !== TOTAL) return () => {};

  let cur = 1;
  let pinST: ScrollTrigger | null = null;
  let fita: Fita | null = null;
  sec.classList.add("is-js"); // libera a navegação 1…6 (CSS: .nm-trilha.is-js .nm-stnav)

  const setCur = (n: number) => {
    cur = clamp(n, 1, TOTAL);
    navBtns.forEach((b) => b.setAttribute("aria-current", String(Number(b.dataset.stGo) === cur)));
    deck.forEach((c) => c.classList.toggle("is-on", Number(c.dataset.st) === cur));
  };

  const aoClicar = (e: Event) => {
    const b = (e.target as HTMLElement).closest<HTMLElement>("[data-st-go]");
    if (!b || !sec.contains(b)) return;
    const k = b.dataset.stGo;
    const n = clamp(k === "prev" ? cur - 1 : k === "next" ? cur + 1 : Number(k), 1, TOTAL);
    if (pinST) window.scrollTo({ top: pinST.start + (pinST.end - pinST.start) * ((n - 1) / (TOTAL - 1)), behavior: "smooth" });
    else {
      window.scrollTo({ top: deck[n - 1].getBoundingClientRect().top + window.scrollY - 100, behavior: "smooth" });
      setCur(n);
    }
  };
  sec.addEventListener("click", aoClicar);

  // "Onde o seu dia trava?": o realce do cartão e do botão é `realce()` (vale também sem a cena); aqui só o nó da fita, e lembra a escolha se a fita for refeita.
  let hit = 0;
  const aoEscolher = (e: Event) => { hit = Number((e as CustomEvent<number>).detail); fita?.setHit(hit); };
  window.addEventListener(EVENTO_ESTACAO, aoEscolher);

  const mm = gsap.matchMedia();
  const semPin = (): Cleanup => {
    setCur(1);
    const anims: gsap.core.Animation[] = [];
    const triggers: ScrollTrigger[] = [];
    const fio = sec.querySelector<HTMLElement>(".nm-thread");
    // só o que está abaixo da dobra começa oculto (acima, nada é escondido: sem flash nem CLS)
    if (deckEl.getBoundingClientRect().top > window.innerHeight * 0.92) {
      gsap.set(deck, { opacity: 0, y: 36 });
      triggers.push(ScrollTrigger.create({
        trigger: deckEl, start: "top 85%", once: true,
        onEnter: () => anims.push(gsap.to(deck, { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.1, clearProps: "opacity,transform" })),
      }));
      if (fio) {
        gsap.set(fio, { scaleY: 0 });
        anims.push(gsap.to(fio, { scaleY: 1, ease: "none", scrollTrigger: { trigger: deckEl, start: "top 70%", end: "bottom 70%", scrub: 0.5 } }));
      }
    }
    return () => {
      anims.forEach((a) => a.kill()); triggers.forEach((t) => t.kill());
      gsap.set([...deck, ...(fio ? [fio] : [])], { clearProps: "opacity,transform" });
      deck.forEach((c) => c.classList.remove("is-on"));
    };
  };
  mm.add(PIN, () => {
    sec.classList.add("is-pinned");
    const pinEl = sec.querySelector<HTMLElement>(".nm-trilha__pin");
    if (!pinEl || !cabe(pinEl, deck, deckEl)) { sec.classList.remove("is-pinned"); return semPin(); } // não cabe: cards, nunca corte (ver PIN em util.ts)
    const f = (fita = construirFita(ribbon));
    if (hit) f.setHit(hit);
    const P = { t: 0 };
    const cartoes = (t: number) => {
      deck.forEach((c, j) => {
        const d = j - t;
        let o: number, y: number, s: number, rx: number, z: number;
        if (d > 0) { o = d <= 1 ? 1 - 0.65 * d : Math.max(0, 0.35 * (2 - d)); y = 36 * d; s = 1 - 0.06 * d; rx = -6 * d; z = -90 * d; }
        else { const m = Math.min(-d, 1); o = 1 - m; y = -80 * m; s = 1 - 0.1 * m; rx = 14 * m; z = -170 * m; }
        gsap.set(c, { opacity: clamp(o, 0, 1), y, scale: s, rotationX: rx, z, zIndex: 20 - Math.round(Math.abs(d) * 3), pointerEvents: "none" });
      });
      setCur(Math.round(t) + 1);
      if (amb) gsap.set(amb, { xPercent: lerp(-3, 3, t / (TOTAL - 1)) });
    };
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sec, start: "top top", end: "bottom bottom", scrub: 0.7, invalidateOnRefresh: true, // pin = position: sticky no CSS (sem layout shift)
        snap: { snapTo: 1 / (TOTAL - 1), directional: false, inertia: false, // desvio do protótipo: sem inércia o snap vai à estação mais próxima (com ela, a nav 1→3 caía em outra estação)
           duration: { min: 0.25, max: 0.6 }, delay: 0.05, ease: "power2.inOut" },
      },
    });
    tl.to(P, { t: TOTAL - 1, ease: "none", duration: TOTAL - 1, onUpdate: () => { f.render(P.t); cartoes(P.t); } });
    pinST = tl.scrollTrigger ?? null;
    f.render(0); cartoes(0);
    return () => {
      pinST = null; fita = null;
      sec.classList.remove("is-pinned");
      gsap.set([...deck, ...(amb ? [amb] : [])], { clearProps: "all" });
      ribbon.replaceChildren();
      deck.forEach((c) => c.classList.remove("is-on"));
    };
  });

  mm.add(NOPIN, semPin);

  return () => {
    sec.removeEventListener("click", aoClicar);
    window.removeEventListener(EVENTO_ESTACAO, aoEscolher);
    mm.revert();
    sec.classList.remove("is-js");
    navBtns.forEach((b) => b.removeAttribute("aria-current"));
  };
}
