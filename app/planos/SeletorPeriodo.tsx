'use client';

import { useState, useActionState } from 'react';
import Link from 'next/link';
import { Icone } from '../ui.tsx';
import { MESES, PERIODOS, brl, porMes, type Periodo, type Tabela } from '../../lib/precos.ts';
import type { EstadoComercial } from '../acoes-comerciais.ts';

type Acao = (e: EstadoComercial, d: FormData) => Promise<EstadoComercial>;

export default function SeletorPeriodo({
  tabela, economiaAnual, materias, logado, temTrial, acaoComprar, acaoTrial,
}: {
  tabela: Tabela;
  economiaAnual: number;
  materias: { id: number; nome: string }[];
  logado: boolean;
  temTrial: boolean;
  acaoComprar: Acao;
  acaoTrial: Acao;
}) {
  const [periodo, setPeriodo] = useState<Periodo>('mensal');
  const [materiaId, setMateriaId] = useState(String(materias[0]?.id ?? ''));
  const [meio, setMeio] = useState<'PIX' | 'CARTAO'>('PIX');
  const [estadoCompra, enviarCompra, comprando] = useActionState(acaoComprar, {});
  const [estadoTrial, enviarTrial, ativandoTrial] = useActionState(acaoTrial, {});

  const materia = tabela.MATERIA[periodo];
  const passe = tabela.CATALOGO[periodo];
  const legenda = (v: number) =>
    periodo === 'mensal'
      ? 'por mês, renovação automática no cartão'
      : `a cada ${MESES[periodo]} meses (${brl(porMes(v, periodo))}/mês)`;

  const semMaterias = materias.length === 0;

  return (
    <>
      <div className="centro">
        <div className="alternador">
          {PERIODOS.map((p) => (
            <button key={p} className={periodo === p ? 'ativo' : ''} onClick={() => setPeriodo(p)}>
              {p[0].toUpperCase() + p.slice(1)}
              {p === 'anual' && ` · economize ${economiaAnual}%`}
            </button>
          ))}
        </div>
      </div>

      {(estadoCompra.erro || estadoTrial.erro) && (
        <p className="alerta alerta-erro" role="alert" style={{ marginBottom: 20 }}>
          <Icone nome="error" tamanho={20} /> {estadoCompra.erro ?? estadoTrial.erro}
        </p>
      )}

      <div className="planos">
        {/* ---------- Teste gratuito ---------- */}
        <div className="cartao cartao-plano plano">
          <div className="nome">Teste grátis</div>
          <p className="resumo">Para conhecer antes de decidir.</p>
          <div className="valor">R$ 0</div>
          <p className="periodo">7 dias · sem cartão de crédito</p>
          <ul>
            <li><Icone nome="check_circle" /> 1 matéria à sua escolha</li>
            <li><Icone nome="check_circle" /> Cerca de 20% das aulas</li>
            <li><Icone nome="check_circle" /> Até 30 exercícios</li>
            <li className="ausente"><Icone nome="remove" /> Material para download</li>
            <li className="ausente"><Icone nome="remove" /> Certificado de curso livre</li>
          </ul>

          {!logado ? (
            <Link className="btn btn-contorno" href="/cadastrar">Criar conta e testar</Link>
          ) : temTrial ? (
            <p className="caption suave">
              Você já usou seu teste gratuito — ele é um por conta. Escolha uma matéria ao lado.
            </p>
          ) : semMaterias ? (
            <p className="caption suave">Nenhuma matéria publicada ainda.</p>
          ) : (
            <form action={enviarTrial} className="pilha-sm">
              <label className="caption suave" htmlFor="trial-materia">Matéria do teste</label>
              <select id="trial-materia" name="materiaId" defaultValue={materias[0]?.id}
                      style={{ padding: '10px 12px', borderRadius: 'var(--r)', border: '2px solid var(--borda-controle)', background: 'var(--surface-container-lowest)', color: 'var(--on-surface)', fontFamily: 'inherit' }}>
                {materias.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
              </select>
              <button className="btn btn-contorno" type="submit" disabled={ativandoTrial}>
                {ativandoTrial ? 'Ativando…' : 'Ativar meus 7 dias'}
              </button>
            </form>
          )}
        </div>

        {/* ---------- Matéria avulsa ---------- */}
        <div className="cartao cartao-plano plano destaque">
          <span className="fita">Mais escolhido</span>
          <div className="nome">Matéria avulsa</div>
          <p className="resumo">Uma matéria completa, do início ao fim.</p>
          <div className="valor">{brl(materia)}</div>
          <p className="periodo">{legenda(materia)}</p>
          <ul>
            <li><Icone nome="check_circle" /> Todas as aulas da matéria</li>
            <li><Icone nome="check_circle" /> Todos os exercícios e simulados dela</li>
            <li><Icone nome="check_circle" /> Material de apoio para download</li>
            <li><Icone nome="check_circle" /> Vade-mécum dentro da aula</li>
            <li><Icone nome="check_circle" /> Caderno de erros e anotações</li>
            <li><Icone nome="check_circle" /> Sem anúncios</li>
          </ul>
          <form action={enviarCompra} className="pilha-sm">
            <input type="hidden" name="produto" value="MATERIA" />
            <input type="hidden" name="periodo" value={periodo} />
            <input type="hidden" name="meio" value={meio} />
            <select name="materiaId" value={materiaId} onChange={(e) => setMateriaId(e.target.value)}
                    aria-label="Escolha a matéria"
                    style={{ padding: '10px 12px', borderRadius: 'var(--r)', border: '2px solid var(--borda-controle)', background: 'var(--surface-container-lowest)', color: 'var(--on-surface)', fontFamily: 'inherit' }}>
              {materias.map((m) => <option key={m.id} value={m.id}>{m.nome}</option>)}
            </select>
            <MeioDePagamento meio={meio} aoTrocar={setMeio} />
            <button className="btn btn-primario" type="submit" disabled={comprando || semMaterias}>
              {comprando ? 'Abrindo pedido…' : 'Assinar esta matéria'}
            </button>
          </form>
        </div>

        {/* ---------- Passe completo ---------- */}
        <div className="cartao cartao-plano plano">
          <div className="nome">Passe completo</div>
          <p className="resumo">Todas as matérias publicadas — e as lançadas na sua vigência.</p>
          <div className="valor">{brl(passe)}</div>
          <p className="periodo">{legenda(passe)}</p>
          <ul>
            <li><Icone nome="check_circle" /> Tudo das matérias avulsas</li>
            <li><Icone nome="check_circle" /> Matérias novas liberadas automaticamente</li>
            <li><Icone nome="check_circle" /> Simulados cronometrados</li>
            <li><Icone nome="check_circle" /> Estatística de acerto por assunto</li>
            <li><Icone nome="check_circle" /> Sem anúncios</li>
          </ul>
          <form action={enviarCompra} className="pilha-sm">
            <input type="hidden" name="produto" value="CATALOGO" />
            <input type="hidden" name="periodo" value={periodo} />
            <input type="hidden" name="meio" value={meio} />
            <MeioDePagamento meio={meio} aoTrocar={setMeio} />
            <button className="btn btn-contorno" type="submit" disabled={comprando}>
              {comprando ? 'Abrindo pedido…' : 'Assinar o passe'}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

function MeioDePagamento(
  { meio, aoTrocar }: { meio: 'PIX' | 'CARTAO'; aoTrocar: (m: 'PIX' | 'CARTAO') => void },
) {
  return (
    <div style={{ display: 'flex', gap: 8 }}>
      {(['PIX', 'CARTAO'] as const).map((m) => (
        <button
          key={m} type="button" onClick={() => aoTrocar(m)}
          className={`chip ${meio === m ? 'chip-secundaria' : 'chip-neutra'}`}
          style={{ flex: 1, justifyContent: 'center', cursor: 'pointer', border: 0, padding: '8px 10px' }}
        >
          {m === 'PIX' ? 'Pix' : 'Cartão'}
        </button>
      ))}
    </div>
  );
}
