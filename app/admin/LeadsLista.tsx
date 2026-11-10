import Link from "next/link";
import { linkWhatsapp } from "../_lib/admin/whatsapp";
import type { listarLeads } from "../_lib/admin/leads-query";
import { BOTAO, FOCO, IconeOlho, SeloStatus, data } from "./ui";

type Linha = Awaited<ReturnType<typeof listarLeads>>["linhas"][number];

// Um único link por lead: o ::after cobre a linha/cartão inteiro; o aria-label substitui o texto (sem leitura duplicada).
// WhatsApp (z-10) é o 2º foco. As duas visões existem no HTML, mas só uma é exibida (display:none tira do foco e dos leitores de tela).
const LINK = `flex min-h-11 items-center break-words font-semibold no-underline text-slate-900 after:absolute after:inset-0 after:content-[''] hover:underline ${FOCO} focus-visible:after:outline-2 focus-visible:after:outline-blue-700`;
const rotulo = (l: Linha) => (l.anonimizadoEm ? "Ver lead anonimizado" : `Ver lead ${l.nome}`);
const nome = (l: Linha) => (l.anonimizadoEm ? "Anonimizado" : l.nome);
const whats = (l: Linha) => (l.anonimizadoEm ? null : linkWhatsapp(l.whatsapp));

function BotaoWhats({ href }: { href: string }) {
  return <a href={href} target="_blank" rel="noopener noreferrer" className={`${BOTAO} relative z-10`}>Chamar no WhatsApp</a>;
}

export function LeadsLista({ linhas }: { linhas: Linha[] }) {
  return (
    <>
      <div className="hidden min-[900px]:block">
        <table className="w-full border-collapse overflow-hidden rounded-lg border border-slate-300 bg-white text-left text-sm">
          <caption className="sr-only">Leads recebidos</caption>
          <thead className="bg-slate-100 text-slate-900">
            <tr>
              {["Nome", "Negócio", "Cidade", "Status", "Recebido em", "Ações"].map((c) => (
                <th key={c} scope="col" className="border-b border-slate-300 px-3 py-3 font-semibold">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {linhas.map((l) => {
              const wa = whats(l);
              return (
                <tr key={l.id} className="relative border-b border-slate-200 last:border-0 hover:bg-slate-50">
                  <td className="px-3 py-1 text-base"><Link href={`/admin/lead/${l.id}`} prefetch={false} aria-label={rotulo(l)} className={LINK}>{nome(l)}</Link></td>
                  <td className="break-words px-3 py-2">{l.anonimizadoEm ? "—" : l.negocio}</td>
                  <td className="break-words px-3 py-2">{l.anonimizadoEm ? "—" : l.cidadeUf}</td>
                  <td className="px-3 py-2"><SeloStatus status={l.status} /></td>
                  <td className="px-3 py-2 text-(--mp-ink-muted)">{data(l.criadoEm)}</td>
                  <td className="px-3 py-1">
                    <div className="flex items-center gap-3">
                      <span aria-hidden="true" className="text-(--mp-ink-muted)"><IconeOlho /></span>
                      {wa && <BotaoWhats href={wa} />}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ul className="m-0 grid list-none gap-3 p-0 min-[900px]:hidden">
        {linhas.map((l) => {
          const wa = whats(l);
          return (
            <li key={l.id} className="relative rounded-lg border border-slate-300 bg-white p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <Link href={`/admin/lead/${l.id}`} prefetch={false} aria-label={rotulo(l)} className={`${LINK} gap-2 text-lg`}>
                  <span>{nome(l)}</span><IconeOlho />
                </Link>
                <SeloStatus status={l.status} />
              </div>
              {!l.anonimizadoEm && <p className="mt-1 break-words text-sm">{l.negocio} · {l.cidadeUf} · {l.whatsapp}</p>}
              <p className="mt-1 text-sm text-(--mp-ink-muted)">Recebido em {data(l.criadoEm)}</p>
              {wa && <p className="m-0 mt-2 flex"><BotaoWhats href={wa} /></p>}
            </li>
          );
        })}
      </ul>
    </>
  );
}
