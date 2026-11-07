import { BrandChip } from "./BrandChip";
import { Wordmark } from "./Wordmark";

export function SiteFooter() {
  return (
    <footer className="lp-footer">
      <div className="lp-wrap">
        <Wordmark />
        <BrandChip />
        <span>Mentoria presencial e individual para donos de banho e tosa.</span>
      </div>
    </footer>
  );
}
