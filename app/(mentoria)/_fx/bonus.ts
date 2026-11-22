import gsap from "gsap";
import type { Cleanup } from "./util";

const PONTEIRO_FINO = "(hover: hover) and (pointer: fine)";
const PERSPECTIVA = 1400, GIRO_Y = 12, GIRO_X = 10, BRILHO_RAIO = 0.3; // graus máx.; o brilho (120% da face) repousa centrado a 30% da largura

/**
 * Cena 8 · Convite do bônus: a face inclina para o cursor e o brilho o segue. Só ponteiro fino (mouse/trackpad); sem ele, ou com reduced-motion
 * (MentoriaFx não chama), o convite fica estático. Só `transform` (rotação na face, translação no brilho); nada fica oculto.
 */
export function bonus(): Cleanup {
  const inv = document.querySelector<HTMLElement>("[data-nm-tilt3d]");
  const face = inv?.querySelector<HTMLElement>(".nm-invite__face");
  const brilho = inv?.querySelector<HTMLElement>(".nm-invite__sheen");
  if (!inv || !face || !brilho || !window.matchMedia(PONTEIRO_FINO).matches) return () => {};

  gsap.set(face, { transformPerspective: PERSPECTIVA });
  const ry = gsap.quickTo(face, "rotationY", { duration: 0.6, ease: "power3.out" });
  const rx = gsap.quickTo(face, "rotationX", { duration: 0.6, ease: "power3.out" });
  const bx = gsap.quickTo(brilho, "x", { duration: 0.5, ease: "power3.out" });
  const by = gsap.quickTo(brilho, "y", { duration: 0.5, ease: "power3.out" });

  const mover = (e: PointerEvent) => {
    if (e.pointerType !== "mouse" && e.pointerType !== "pen") return;
    const r = inv.getBoundingClientRect(), px = e.clientX - r.left, py = e.clientY - r.top;
    ry((px / r.width - 0.5) * GIRO_Y);
    rx(-(py / r.height - 0.5) * GIRO_X);
    bx(px - BRILHO_RAIO * r.width); // centro do brilho = cursor
    by(py - BRILHO_RAIO * r.width);
  };
  const soltar = () => { ry(0); rx(0); bx(0); by(0); };
  inv.addEventListener("pointermove", mover, { passive: true });
  inv.addEventListener("pointerleave", soltar);
  return () => {
    inv.removeEventListener("pointermove", mover);
    inv.removeEventListener("pointerleave", soltar);
    gsap.killTweensOf([face, brilho]);
    gsap.set([face, brilho], { clearProps: "transform" });
  };
}
