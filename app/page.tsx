import { CamilaEmAcao } from "./_components/CamilaEmAcao";
import { ComoFunciona } from "./_components/ComoFunciona";
import { Destrava } from "./_components/Destrava";
import { Diferenca } from "./_components/Diferenca";
import { Faq } from "./_components/Faq";
import { Hero } from "./_components/Hero";
import { LeadForm } from "./_components/LeadForm";
import { ParaQuem } from "./_components/ParaQuem";
import { Problema } from "./_components/Problema";
import { QuemE } from "./_components/QuemE";
import { SiteFooter } from "./_components/SiteFooter";
import { SiteHeader } from "./_components/SiteHeader";
import { StickyCta } from "./_components/StickyCta";

export default function Page() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <Problema />
        <Diferenca />
        <ComoFunciona />
        <Destrava />
        <CamilaEmAcao />
        <QuemE />
        <ParaQuem />
        <Faq />
        <LeadForm />
      </main>
      <SiteFooter />
      <StickyCta />
    </>
  );
}
