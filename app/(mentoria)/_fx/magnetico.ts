import gsap from "gsap";
import type { Cleanup } from "./util";

const PONTEIRO_FINO = "(hover: hover) and (pointer: fine)";
const FORCA = 0.12, MARGEM_PX = 32; // desloca até 12% do raio; só reage a até 32 px da borda do botão

/**
 * CTA magnético: `[data-nm-magnet]` se desloca (transform x/y, inércia 0,6 s) em direção ao cursor. Só ponteiro fino; um único `pointermove` passivo.
 * Sem ponteiro fino, ou com reduced-motion (MentoriaFx não chama), o botão fica parado. Cleanup remove o listener e o transform.
 */
export function magnetico(): Cleanup {
  const botoes = [...document.querySelectorAll<HTMLElement>("[data-nm-magnet]")];
  if (!botoes.length || !window.matchMedia(PONTEIRO_FINO).matches) return () => {};
  const alvos = botoes.map((el) => ({
    el,
    x: gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" }),
    y: gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" }),
  }));
  const mover = (e: PointerEvent) => {
    if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
    for (const { el, x, y } of alvos) {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
      const max = FORCA * Math.max(r.width, r.height) / 2;
      const perto = Math.abs(dx) < r.width / 2 + MARGEM_PX && Math.abs(dy) < r.height / 2 + MARGEM_PX;
      x(perto ? gsap.utils.clamp(-max, max, dx * FORCA) : 0);
      y(perto ? gsap.utils.clamp(-max, max, dy * FORCA) : 0);
    }
  };
  window.addEventListener("pointermove", mover, { passive: true });
  return () => {
    window.removeEventListener("pointermove", mover);
    gsap.killTweensOf(botoes);
    gsap.set(botoes, { clearProps: "transform" });
  };
}
