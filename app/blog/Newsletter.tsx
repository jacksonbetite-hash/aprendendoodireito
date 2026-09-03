'use client';

import { useActionState } from 'react';
import { Icone } from '../ui.tsx';
import type { EstadoNewsletter } from './acoes.ts';

/**
 * Assinatura da newsletter — componente de cliente só por causa do
 * estado de resposta: o formulário precisa dizer, na própria tela, que
 * o e-mail entrou. Sem JavaScript ele ainda envia e a página recarrega
 * com a mesma mensagem, porque a ação é de servidor.
 */
export default function Newsletter(
  { acao }: { acao: (estado: EstadoNewsletter, dados: FormData) => Promise<EstadoNewsletter> },
) {
  const [estado, enviar, pendente] = useActionState(acao, {});

  return (
    <section className="newsletter">
      <span className="ico"><Icone nome="notifications" tamanho={28} /></span>
      <h2>Não perca nenhuma atualização</h2>
      <p>
        Uma edição por semana, com os artigos publicados, um resumo de jurisprudência e
        os convites de aula aberta. Para sair, basta um clique no rodapé do e-mail.
      </p>

      <form action={enviar} className="newsletter-form">
        <label className="oculto-visual" htmlFor="email-newsletter">Seu e-mail</label>
        <input
          id="email-newsletter"
          name="email"
          type="email"
          required
          placeholder="Seu melhor e-mail"
          autoComplete="email"
        />
        <button className="btn btn-primario" type="submit" disabled={pendente}>
          {pendente ? 'Enviando…' : 'Assinar'}
        </button>
      </form>

      {estado.erro && (
        <p className="alerta alerta-erro" role="alert">
          <Icone nome="error" tamanho={20} /> {estado.erro}
        </p>
      )}
      {estado.ok && (
        <p className="alerta alerta-ok" role="status">
          <Icone nome="check_circle" tamanho={20} /> {estado.ok}
        </p>
      )}

      <p className="newsletter-nota">
        Guardamos só o e-mail, e só para enviar a newsletter (§12.1 da política de
        privacidade). Nada de repasse a terceiros.
      </p>
    </section>
  );
}
