import Image from "next/image";

/** Pingente "Na Prática": só no rodapé e no sucesso do formulário. */
export function BrandChip() {
  return (
    <span className="lp-chip">
      <Image className="mp-seal" src="/images/pingente-master-pet-400.webp" alt="" width={400} height={267} style={{ width: 40, height: "auto", filter: "none" }} />
      Master Pet na Prática
    </span>
  );
}
