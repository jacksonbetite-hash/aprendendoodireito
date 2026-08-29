'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

/** Busca do vade-mécum com o atalho global "/" pedido no §5.4. */
export default function BuscaVade({ termoInicial }: { termoInicial: string }) {
  const [termo, setTermo] = useState(termoInicial);
  const campo = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    function atalho(e: KeyboardEvent) {
      const alvo = e.target as HTMLElement | null;
      if (e.key !== '/' || alvo?.tagName === 'INPUT' || alvo?.tagName === 'TEXTAREA') return;
      e.preventDefault();
      campo.current?.focus();
    }
    document.addEventListener('keydown', atalho);
    return () => document.removeEventListener('keydown', atalho);
  }, []);

  function submeter(e: React.FormEvent) {
    e.preventDefault();
    router.push(termo.trim() ? `/vademecum?q=${encodeURIComponent(termo.trim())}` : '/vademecum');
  }

  return (
    <form className="searchbar" onSubmit={submeter}>
      <span>🔎</span>
      <input
        ref={campo}
        value={termo}
        onChange={(e) => setTermo(e.target.value)}
        type="search"
        placeholder="art. 5º, cláusula pétrea, direito de arrependimento…"
        aria-label="Buscar no vade-mécum"
      />
      <kbd>/</kbd>
    </form>
  );
}
