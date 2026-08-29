'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Icone } from '../ui.tsx';
import { MESES, PERIODOS, brl, porMes, type Periodo, type Tabela } from '../../lib/precos.ts';

export default function SeletorPeriodo(
  { tabela, economiaAnual }: { tabela: Tabela; economiaAnual: number },
) {
  const [periodo, setPeriodo] = useState<Periodo>('mensal');
  const materia = tabela.MATERIA[periodo];
  const passe = tabela.CATALOGO[periodo];

  const legenda = (valor: number) =>
    periodo === 'mensal'
      ? 'por mês, renovação automática'
      : `a cada ${MESES[periodo]} meses (${brl(porMes(valor, periodo))}/mês)`;

  return (
    <>
      <div style={{ textAlign: 'center' }}>
        <div className="alternador">
          {PERIODOS.map((per) => (
            <button
              key={per}
              className={periodo === per ? 'ativo' : ''}
              onClick={() => setPeriodo(per)}
            >
              {per[0].toUpperCase() + per.slice(1)}
              {per === 'anual' && ` · economize ${economiaAnual}%`}
            </button>
          ))}
        </div>
      </div>

      <div className="planos">
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
          <Link className="btn btn-contorno" href="/painel">Começar teste</Link>
        </div>

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
          <Link className="btn btn-primario" href="/catalogo">Escolher matéria</Link>
        </div>

        <div className="cartao cartao-plano plano">
          <div className="nome">Passe completo</div>
          <p className="resumo">Todas as matérias publicadas — e as que forem lançadas na sua vigência.</p>
          <div className="valor">{brl(passe)}</div>
          <p className="periodo">{legenda(passe)}</p>
          <ul>
            <li><Icone nome="check_circle" /> Tudo das matérias avulsas</li>
            <li><Icone nome="check_circle" /> Matérias novas liberadas automaticamente</li>
            <li><Icone nome="check_circle" /> Simulados cronometrados</li>
            <li><Icone nome="check_circle" /> Estatística de acerto por assunto</li>
            <li><Icone nome="check_circle" /> Sem anúncios</li>
          </ul>
          <Link className="btn btn-contorno" href="/painel">Assinar passe</Link>
        </div>
      </div>
    </>
  );
}
