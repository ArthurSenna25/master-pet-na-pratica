"use client";

// Botão com aria-expanded; a animação 8c (0fr→1fr, 350 ms) é CSS puro em landing-v6.css (.lp-q.is-open).
import { useId, useState, type ReactNode } from "react";
import { vars } from "./vars";

interface FaqItemProps {
  pergunta: string;
  delay: number;
  children: ReactNode;
}

export function FaqItem({ pergunta, delay, children }: FaqItemProps) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <div className={`lp-q mp-reveal${open ? " is-open" : ""}`} style={vars({ "--i": delay })}>
      <h3>
        <button type="button" aria-expanded={open} aria-controls={id} onClick={() => setOpen((v) => !v)}>
          <span>{pergunta}</span>
          <span className="lp-plus" aria-hidden="true" />
        </button>
      </h3>
      <div className="lp-a" id={id} role="region" aria-label={pergunta}>
        <div>
          <p>{children}</p>
        </div>
      </div>
    </div>
  );
}
