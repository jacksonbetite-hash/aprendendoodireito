import { brl } from '../../lib/precos.ts';
import type { ItemApuracao } from '../../lib/apuracao.ts';

const TIPO: Record<ItemApuracao['tipo'], string> = {
  VENDA: 'venda', REEMBOLSO: 'reembolso', SALDO_ANTERIOR: 'saldo anterior',
};

/**
 * O extrato venda a venda de uma apuração (§5.6.1: "extrato detalhado
 * venda a venda liberado ao professor"). O mesmo componente serve ao
 * professor e ao admin — os dois precisam olhar o mesmo papel.
 */
export default function ItensApuracao({ itens }: { itens: ItemApuracao[] }) {
  if (itens.length === 0) return <span className="caption suave">sem itens</span>;
  return (
    <details>
      <summary className="caption" style={{ cursor: 'pointer' }}>
        extrato venda a venda ({itens.length})
      </summary>
      <table className="tabela" style={{ marginTop: 8 }}>
        <thead><tr><th>Tipo</th><th>Pedido</th><th>Descrição</th><th>Base</th><th>%</th><th>Comissão</th></tr></thead>
        <tbody>
          {itens.map((i) => (
            <tr key={i.id}>
              <td>{TIPO[i.tipo]}</td>
              <td className="mono">{i.referencia ?? '—'}</td>
              <td>{i.descricao}</td>
              <td className="apertado">{brl(i.centavosBase)}</td>
              <td className="apertado">{i.comissaoPp ? `${Number(i.comissaoPp)}%` : '—'}</td>
              <td className="apertado"><strong>{brl(i.centavosComissao)}</strong></td>
            </tr>
          ))}
        </tbody>
      </table>
    </details>
  );
}
