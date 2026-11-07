import gsap from "gsap";
import { NOPIN, PIN, pinEnd, type Cleanup } from "./util";

/** 3 / 3m · Problema (teleprompter). Pin só em PIN; o estado inicial é aplicado aqui (pós-hidratação), nunca em CSS. */
export function problema(): Cleanup {
  const st = document.querySelector<HTMLElement>(".lp-prob__stage");
  const wrap = st?.querySelector<HTMLElement>(".lp-signs-wrap");
  if (!st || !wrap) return () => {};
  const sg = [...st.querySelectorAll<HTMLElement>(".lp-sign")];
  const mk = [...st.querySelectorAll<HTMLElement>(".lp-mark")];
  const ln = st.querySelector<HTMLElement>(".lp-sline");
  const cl = st.querySelector<HTMLElement>(".lp-prob__close");
  const imgs = gsap.utils.toArray<HTMLElement>(".lp-prob__img");
  const bw = document.querySelector<HTMLElement>(".lp-prob__img--bw");
  if (!ln || !cl || !bw) return () => {};
  // posição de cada marca como fração da linha (recalculada a cada refresh)
  const f = (i: number) => () => Math.min(1, (sg[i].offsetTop + mk[i].offsetTop + 4.5) / wrap.offsetHeight);

  const mm = gsap.matchMedia();
  mm.add(PIN, () => {
    st.classList.add("is-pin");
    gsap.set(sg.slice(1), { opacity: 0.12 });
    gsap.set(mk.slice(1), { opacity: 0.3, scale: 0.6 });
    gsap.set(cl, { opacity: 0, y: 16 });
    gsap.set(ln, { scaleY: 0 });
    gsap.set(bw, { opacity: 0 });
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: st, start: "top top", end: pinEnd(2.2), pin: true, scrub: 0.5, anticipatePin: 1, invalidateOnRefresh: true, refreshPriority: 1 },
    });
    tl.to(ln, { scaleY: f(0), duration: 0.8 }, 0);
    [1, 3, 5].forEach((at, k) => {
      const i = k + 1;
      tl.to(sg[i - 1], { opacity: 0.28, y: -8, duration: 0.8 }, at)
        .to(sg[i], { opacity: 1, duration: 0.8 }, at)
        .to(mk[i], { opacity: 1, scale: 1, duration: 0.5 }, at)
        .to(ln, { scaleY: f(i), duration: 0.8 }, at);
    });
    tl.to(cl, { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }, 7.2)
      .to(ln, { scaleY: 1, duration: 0.8 }, 7.2)
      .to(imgs, { scale: 1.08, duration: 10 }, 0)
      .to(bw, { opacity: 0.375, duration: 10 }, 0)
      .to({}, { duration: 0.01 }, 10);
    return () => st.classList.remove("is-pin");
  });

  mm.add(NOPIN, () => {
    gsap.set(mk, { opacity: 0.3, scale: 0.6 });
    gsap.set(sg, { opacity: 0.12 });
    gsap.set(cl, { opacity: 0, y: 16 });
    gsap.set(ln, { scaleY: 0 });
    gsap.set(bw, { opacity: 0 });
    sg.forEach((s, i) => {
      gsap
        .timeline({ defaults: { ease: "none" }, scrollTrigger: { trigger: s, start: "top 85%", end: "bottom 15%", scrub: 0.4 } })
        .to(s, { opacity: 1, duration: 0.3 }, 0)
        .to(mk[i], { opacity: 1, scale: 1, duration: 0.2 }, 0.1)
        .to(s, { opacity: 0.28, y: -8, duration: 0.3 }, 0.5)
        .to({}, { duration: 0.01 }, 1);
    });
    gsap.to(ln, { scaleY: 1, ease: "none", scrollTrigger: { trigger: wrap, start: "top 70%", end: "bottom 55%", scrub: true } });
    gsap.to(cl, { opacity: 1, y: 0, duration: 0.7, ease: "power2.out", scrollTrigger: { trigger: cl, start: "top 90%", toggleActions: "play none none reverse" } });
    const sc = { trigger: st, start: "top bottom", end: "bottom top", scrub: true };
    gsap.to(imgs, { scale: 1.08, ease: "none", scrollTrigger: sc });
    gsap.to(bw, { opacity: 0.375, ease: "none", scrollTrigger: sc });
  });
  return () => mm.revert();
}
