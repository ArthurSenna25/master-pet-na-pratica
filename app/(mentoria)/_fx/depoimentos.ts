import type { Cleanup } from "./util";

const FIM_PX = 2; // tolerância de subpixel para "chegou ao fim"
const MENSAGEM_VIDEO = "Vídeo de exemplo: nenhum arquivo de vídeo nesta demonstração."; // sem arquivo, sem autoplay

/**
 * Faixa de depoimentos navegável: setas (botões), ←/→, arrastar com o mouse e contador "n / total". Sem rotação automática e sem vídeo tocando sozinho.
 * Interação, não movimento: vale também com reduced-motion (a rolagem vira instantânea). O CSS já entrega a faixa rolável com scroll-snap sem JS;
 * `.is-js` na seção só revela setas e contador (que sem JS não fariam nada). Cleanup remove tudo.
 */
export function depoimentos(): Cleanup {
  const sec = document.querySelector<HTMLElement>(".nm-dep");
  const car = sec?.querySelector<HTMLElement>(".nm-dep__car");
  const trilho = car?.querySelector<HTMLElement>(".nm-dep__track");
  const cards = trilho ? [...trilho.querySelectorAll<HTMLElement>(".nm-dep__c")] : [];
  if (!sec || !car || !trilho || cards.length < 2) return () => {};
  const contador = car.querySelector<HTMLElement>("[data-nm-dep-ct]");
  const ant = car.querySelector<HTMLButtonElement>('[data-nm-dep="-1"]');
  const prox = car.querySelector<HTMLButtonElement>('[data-nm-dep="1"]');
  const reduzido = window.matchMedia("(prefers-reduced-motion: reduce)");
  const passo = () => cards[1].offsetLeft - cards[0].offsetLeft;
  const indice = () => {
    const x = trilho.scrollLeft;
    let k = 0, melhor = Infinity;
    cards.forEach((c, i) => { const d = Math.abs(c.offsetLeft - trilho.offsetLeft - x); if (d < melhor) { melhor = d; k = i; } });
    return k;
  };
  const atualizar = () => {
    const fim = trilho.scrollLeft + trilho.clientWidth >= trilho.scrollWidth - FIM_PX;
    if (contador) contador.textContent = `${fim ? cards.length : indice() + 1} / ${cards.length}`;
    if (ant) ant.disabled = trilho.scrollLeft <= FIM_PX;
    if (prox) prox.disabled = fim;
  };
  const ir = (d: number) => trilho.scrollBy({ left: d * passo(), behavior: reduzido.matches ? "auto" : "smooth" });

  const aoClicar = (e: MouseEvent) => {
    const alvo = e.target instanceof Element ? e.target : null;
    const seta = alvo?.closest<HTMLElement>("[data-nm-dep]");
    if (seta && car.contains(seta)) ir(Number(seta.dataset.nmDep));
    const play = alvo?.closest("[data-nm-vid]");
    const nota = play?.closest(".nm-dep__vid")?.querySelector<HTMLElement>("[data-nm-vn]");
    if (nota) nota.textContent = MENSAGEM_VIDEO;
  };
  const aoTeclar = (e: KeyboardEvent) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    if (e.target instanceof HTMLElement && e.target.closest("input,textarea,select")) return;
    e.preventDefault();
    ir(e.key === "ArrowRight" ? 1 : -1);
  };

  let arraste: { x: number; s: number } | null = null;
  const descer = (e: PointerEvent) => {
    if (e.pointerType !== "mouse" || e.button !== 0 || (e.target as Element).closest("button")) return;
    arraste = { x: e.clientX, s: trilho.scrollLeft };
    trilho.classList.add("is-drag");
    trilho.setPointerCapture(e.pointerId);
  };
  const mover = (e: PointerEvent) => { if (arraste) trilho.scrollLeft = arraste.s - (e.clientX - arraste.x); };
  const soltar = () => {
    if (!arraste) return;
    arraste = null;
    trilho.classList.remove("is-drag");
    trilho.scrollTo({ left: cards[indice()].offsetLeft - trilho.offsetLeft, behavior: reduzido.matches ? "auto" : "smooth" });
  };

  sec.classList.add("is-js");
  car.addEventListener("click", aoClicar);
  car.addEventListener("keydown", aoTeclar);
  trilho.addEventListener("scroll", atualizar, { passive: true });
  trilho.addEventListener("pointerdown", descer);
  trilho.addEventListener("pointermove", mover);
  trilho.addEventListener("pointerup", soltar);
  trilho.addEventListener("pointercancel", soltar);
  window.addEventListener("resize", atualizar);
  atualizar();
  return () => {
    sec.classList.remove("is-js");
    car.removeEventListener("click", aoClicar);
    car.removeEventListener("keydown", aoTeclar);
    trilho.removeEventListener("scroll", atualizar);
    trilho.removeEventListener("pointerdown", descer);
    trilho.removeEventListener("pointermove", mover);
    trilho.removeEventListener("pointerup", soltar);
    trilho.removeEventListener("pointercancel", soltar);
    window.removeEventListener("resize", atualizar);
    trilho.classList.remove("is-drag");
  };
}
