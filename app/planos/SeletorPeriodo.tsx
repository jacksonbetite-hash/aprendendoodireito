'use client';

import { useState } from 'react';
import Link from 'next/link';
import { PRECOS, MESES, brl, porMes, type Periodo } from '../../lib/precos.ts';

const PERIODOS: Periodo[] = ['mensal', 'trimestral', 'semestral', 'anual'];

export default function SeletorPeriodo({ economia }: { economia: number }) {
  const [periodo, setPeriodo] = useState<Periodo>('mensal');
  const p = PRECOS[periodo];

  const legenda = (valor: number) =>
    periodo === 'mensal'
      ? 'por mês, renovação automática'
      : `a cada ${MESES[periodo]} meses (${brl(porMes(valor, periodo))}/mês)`;

  return (
    <>
      <div style={{ textAlign: 'center' }}>
        <div className="toggle-period">
          {PERIODOS.map((per) => (
            <button
              key={per}
              className={periodo === per ? 'active' : ''}
              onClick={() => setPeriodo(per)}
            >
              {per[0].toUpperCase() + per.slice(1)}
              {per === 'anual' && ` · economize ${economia}%`}
            </button>
          ))}
        </div>
      </div>

      <div className="plan-grid">
        <div className="plan">
          <div className="name">Teste grátis</div>
          <p className="desc">Para conhecer antes de decidir.</p>
          <div className="price">R$ 0</div>
          <p className="per">7 dias · sem cartão de crédito</p>
          <ul>
            <li>1 matéria à sua escolha</li>
            <li>Cerca de 20% das aulas</li>
            <li>Até 30 exercícios</li>
            <li className="no">Material para download</li>
            <li className="no">Certificado de curso livre</li>
          </ul>
          <Link className="btn btn-outline" href="/painel">Começar teste</Link>
        </div>

        <div className="plan featured">
          <span className="badge">Mais escolhido</span>
          <div className="name">Matéria avulsa</div>
          <p className="desc">Uma matéria completa, do início ao fim.</p>
          <div className="price">{brl(p.materia)}</div>
          <p className="per">{legenda(p.materia)}</p>
          <ul>
            <li>Todas as aulas da matéria</li>
            <li>Todos os exercícios e simulados dela</li>
            <li>Material de apoio para download</li>
            <li>Vade-mécum dentro da aula</li>
            <li>Caderno de erros e anotações</li>
            <li>Sem anúncios</li>
          </ul>
          <Link className="btn btn-primary" href="/catalogo">Escolher matéria</Link>
        </div>

        <div className="plan">
          <div className="name">Passe completo</div>
          <p className="desc">Todas as matérias publicadas — e as que forem lançadas na sua vigência.</p>
          <div className="price">{brl(p.passe)}</div>
          <p className="per">{legenda(p.passe)}</p>
          <ul>
            <li>Tudo das matérias avulsas</li>
            <li>Matérias novas liberadas automaticamente</li>
            <li>Simulados cronometrados</li>
            <li>Estatística de acerto por assunto</li>
            <li>Sem anúncios</li>
          </ul>
          <Link className="btn btn-outline" href="/painel">Assinar passe</Link>
        </div>
      </div>
    </>
  );
}
