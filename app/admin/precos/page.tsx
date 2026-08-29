import type { Metadata } from 'next';
import FormPreco from './FormPreco.tsx';
import { acaoAlterarPreco } from '../acoes.ts';
import { brl, PERIODOS, MESES, porMes, dataBR } from '../../../lib/precos.ts';
import { historicoDePrecos, tabelaVigente } from '../../../lib/precos-consultas.ts';

export const metadata: Metadata = { title: 'Preços — Administração' };

export default async function Precos() {
  const [historico, tabela] = await Promise.all([historicoDePrecos(), tabelaVigente()]);
  const vigentes = historico.filter((h) => h.vigenteAte === null);
  const passados = historico.filter((h) => h.vigenteAte !== null);

  return (
    <>
      <h1>Tabela de valores</h1>
      <p className="sub">
        O preço novo vale a partir da data que você escolher e <strong>não afeta licença já
        vigente</strong>. O anterior não é apagado: vira histórico.
      </p>

      <div className="panel">
        <h2>Vigente hoje</h2>
        <table className="tabela">
          <thead>
            <tr><th>Produto</th><th>Período</th><th>Valor</th><th>Por mês</th><th>Desde</th></tr>
          </thead>
          <tbody>
            {(['MATERIA', 'CATALOGO'] as const).map((produto) =>
              PERIODOS.map((periodo) => {
                const linha = vigentes.find((v) => v.produto === produto && v.periodo === periodo);
                const centavos = tabela[produto][periodo];
                return (
                  <tr key={produto + periodo}>
                    <td>{produto === 'MATERIA' ? 'Matéria avulsa' : 'Passe completo'}</td>
                    <td>{periodo}</td>
                    <td><strong>{centavos ? brl(centavos) : '—'}</strong></td>
                    <td className="suave">
                      {centavos && MESES[periodo] > 1 ? `${brl(porMes(centavos, periodo))}/mês` : '—'}
                    </td>
                    <td className="suave nowrap">{dataBR(linha?.vigenteDe ?? null)}</td>
                  </tr>
                );
              }),
            )}
          </tbody>
        </table>
      </div>

      <div className="panel">
        <h2>Alterar um preço</h2>
        <FormPreco acao={acaoAlterarPreco} />
      </div>

      <div className="panel" style={{ marginBottom: 0 }}>
        <h2>Histórico</h2>
        {passados.length === 0 ? (
          <div className="empty-state">Nenhum preço foi alterado ainda.</div>
        ) : (
          <table className="tabela">
            <thead>
              <tr><th>Produto</th><th>Período</th><th>Valor</th><th>Vigeu de</th><th>até</th><th>Quem</th></tr>
            </thead>
            <tbody>
              {passados.map((h) => (
                <tr key={h.id}>
                  <td>{h.produto === 'MATERIA' ? 'Matéria' : 'Passe'}</td>
                  <td>{h.periodo}</td>
                  <td>{brl(h.centavos)}</td>
                  <td className="suave nowrap">{dataBR(h.vigenteDe)}</td>
                  <td className="suave nowrap">{dataBR(h.vigenteAte)}</td>
                  <td className="suave">{h.criadoPor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
