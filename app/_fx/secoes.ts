import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { all, onceIn, type Cleanup } from "./util";

/** Reveal genérico. Só esconde o que está abaixo da dobra, após a hidratação (sem JS tudo fica visível). */
export function reveal(): void {
  const items = all(".mp-reveal").filter(
    (el) => !el.closest(".lp-hero") && !el.matches(".lp-band .lp-lead") && el.getBoundingClientRect().top > innerHeight,
  );
  gsap.set(items, { opacity: 0, y: 24 });
  ScrollTrigger.batch(items, {
    start: "top 94%",
    once: true,
    onEnter: (els) =>
      void gsap.to(els, { opacity: 1, y: 0, duration: 0.7, ease: "expo.out", stagger: 0.09, overwrite: true, clearProps: "opacity,transform" }),
  });
}

/** 6 · A diferença. */
export function diferenca(): void {
  all(".lp-band .lp-lead").forEach((p) => {
    SplitText.create(p, {
      type: "words",
      aria: "none",
      autoSplit: true,
      onSplit: (self) =>
        gsap.fromTo(
          self.words,
          { opacity: 0.2 },
          {
            opacity: 1,
            ease: "none",
            stagger: 0.12,
            duration: 0.3,
            scrollTrigger: { trigger: p, start: "top 82%", end: "bottom 48%", scrub: true },
          },
        ),
    });
  });
  gsap.fromTo(
    ".lp-band__photo",
    { clipPath: "inset(12% 12% 12% 12%)" },
    {
      clipPath: "inset(0% 0% 0% 0%)",
      ease: "none",
      scrollTrigger: { trigger: "#diferenca", start: "top 85%", end: "top 20%", scrub: true },
    },
  );
}

/** 7 · O que destrava (entrada). */
export function destrava(): void {
  onceIn(
    ".lp-bento",
    "top 82%",
    gsap.fromTo(".lp-b", { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.7, ease: "power3.out", stagger: 0.07, paused: true }),
  );
}

/** 7 · hover y -4 e glow que segue o mouse (pointer fine). */
export function destravaHover(): Cleanup {
  const undo: Cleanup[] = [];
  all(".lp-b").forEach((c) => {
    const g = document.createElement("i");
    g.className = "lp-glow";
    g.setAttribute("aria-hidden", "true");
    c.insertBefore(g, c.firstChild);
    const gx = gsap.quickTo(g, "x", { duration: 0.35, ease: "power3.out" });
    const gy = gsap.quickTo(g, "y", { duration: 0.35, ease: "power3.out" });
    const enter = () => {
      gsap.to(c, { y: -4, duration: 0.3, ease: "power2.out" });
      gsap.to(g, { opacity: 1, duration: 0.3 });
    };
    const move = (e: PointerEvent) => {
      const r = c.getBoundingClientRect();
      gx(e.clientX - r.left);
      gy(e.clientY - r.top);
    };
    const leave = () => {
      gsap.to(c, { y: 0, duration: 0.35, ease: "power2.out" });
      gsap.to(g, { opacity: 0, duration: 0.3 });
    };
    c.addEventListener("pointerenter", enter);
    c.addEventListener("pointermove", move);
    c.addEventListener("pointerleave", leave);
    undo.push(() => {
      c.removeEventListener("pointerenter", enter);
      c.removeEventListener("pointermove", move);
      c.removeEventListener("pointerleave", leave);
      gsap.killTweensOf([c, g]);
      gsap.set(c, { clearProps: "transform" });
      g.remove();
    });
  });
  return () => undo.forEach((f) => f());
}

/** 8 · Quem é (retrato + assinatura) e 8b · Para quem (checks no scroll, riscos ao entrar). */
export function quemEParaQuem(): void {
  const fig = document.querySelector(".lp-quem__fig img");
  if (fig) {
    onceIn("#quem", "top 70%", gsap.fromTo(fig, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1.2, ease: "power3.out", paused: true }));
  }
  const sig = all(".lp-sig path");
  if (sig.length) {
    onceIn(".lp-sig", "top 88%", gsap.fromTo(sig, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 1.8, ease: "power2.inOut", stagger: 0.9, paused: true }));
  }
  all(".lp-yes li").forEach((li) => {
    gsap.fromTo(
      li.querySelector("path"),
      { strokeDashoffset: 1 },
      {
        strokeDashoffset: 0,
        ease: "none",
        scrollTrigger: { trigger: li, start: "top 80%", end: "top 52%", scrub: true },
      },
    );
  });
  all(".lp-strike").forEach((s, i) => {
    const li = s.closest("li");
    if (li) {
      onceIn(li, "top 88%", gsap.fromTo(s, { scaleX: 0 }, { scaleX: 1, duration: 0.7, delay: i * 0.18, ease: "power2.inOut", paused: true }));
    }
  });
  void ScrollTrigger;
}
