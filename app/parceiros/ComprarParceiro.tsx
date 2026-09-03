'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { Icone } from '../ui.tsx';
import { brl, porMes, type Tabela } from '../../lib/precos.ts';
import type { EstadoComercial } from '../acoes-comerciais.ts';

type Acao = (e: EstadoComercial, d: FormData) => Promise<EstadoComercial>;

/**
 * Compra de um curso de professor parceiro na NOSSA vitrine (§5.10.2,
 * etapa 5). O curso não está na lista de /planos — ele mora no portal
 * do professor —, então a compra acontece aqui, na página do curso, com
 * o nosso preço e o nosso checkout: a venda é nossa, o aluno é nosso, e
 * o professor recebe comissão.
 */
export default function ComprarParceiro({
  acao, materiaId, tabela, logado, vende,
}: { acao: Acao; materiaId: number; tabela: Tabela; logado: boolean; vende: boolean }) {
  const [estado, enviar, pendente] = useActionState(acao, {});

  if (!vende) {
    return (
      <p className="caption suave">
        Este curso não está à venda no momento. Quem já tem licença continua com acesso.
      </p>
    );
  }
  if (!logado) {
    return (
      <div className="pilha-sm" style={{ marginTop: 20 }}>
        <Link className="btn btn-primario btn-bloco" href="/cadastrar">Criar conta para assinar</Link>
        <Link className="btn btn-contorno btn-bloco" href="/entrar">Já tenho conta</Link>
      </div>
    );
  }

  return (
    <form action={enviar} className="pilha-sm" style={{ marginTop: 20 }}>
      {estado.erro && (
        <p className="alerta alerta-erro" role="alert"><Icone nome="error" tamanho={20} /> {estado.erro}</p>
      )}
      <input type="hidden" name="produto" value="MATERIA" />
      <input type="hidden" name="materiaId" value={materiaId} />
      <label className="caption suave" htmlFor="parceiro-periodo">Período</label>
      <select id="parceiro-periodo" name="periodo" defaultValue="mensal"
              style={{ padding: '10px 12px', borderRadius: 'var(--r)', border: '2px solid var(--borda-controle)', background: 'var(--surface-container-lowest)', color: 'var(--on-surface)', fontFamily: 'inherit' }}>
        <option value="mensal">Mensal — {brl(tabela.MATERIA.mensal)}</option>
        <option value="anual">Anual — {brl(tabela.MATERIA.anual)} ({brl(porMes(tabela.MATERIA.anual, 'anual'))}/mês)</option>
      </select>
      <div style={{ display: 'flex', gap: 16 }}>
        <label style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <input type="radio" name="meio" value="PIX" defaultChecked /> Pix
        </label>
        <label style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <input type="radio" name="meio" value="CARTAO" /> Cartão
        </label>
      </div>
      <button className="btn btn-primario btn-bloco" type="submit" disabled={pendente}>
        {pendente ? 'Abrindo pedido…' : 'Assinar este curso'}
      </button>
    </form>
  );
}
