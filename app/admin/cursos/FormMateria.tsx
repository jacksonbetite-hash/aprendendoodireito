'use client';

import { useActionState } from 'react';
import type { EstadoAdmin } from '../acoes.ts';
import type { AreaAdmin, MateriaAdmin } from '../../../lib/admin-cursos.ts';

const SITUACOES = [
  { valor: 'rascunho', rotulo: 'Rascunho — só aqui dentro' },
  { valor: 'em_revisao', rotulo: 'Em revisão' },
  { valor: 'aprovado', rotulo: 'Aprovado, aguardando publicação' },
  { valor: 'publicado', rotulo: 'Publicado — no catálogo' },
  { valor: 'arquivado', rotulo: 'Arquivado' },
];

/**
 * Cadastro da matéria — a unidade que se vende (§6: a licença é por
 * matéria, nunca por assunto). Por isso a ementa é obrigatória e longa:
 * ela é o texto que decide a compra e o que o buscador lê.
 */
export default function FormMateria({
  acao, areas, portalId, materia, ehPlataforma,
}: {
  acao: (e: EstadoAdmin, d: FormData) => Promise<EstadoAdmin>;
  areas: AreaAdmin[];
  portalId: number;
  materia?: MateriaAdmin;
  ehPlataforma: boolean;
}) {
  const [estado, enviar, pendente] = useActionState(acao, {});

  return (
    <form action={enviar} className="form-editor">
      <input type="hidden" name="portalId" value={portalId} />
      {materia && <input type="hidden" name="id" value={materia.id} />}
      {estado.erro && <p className="alerta alerta-erro" role="alert">{estado.erro}</p>}
      {estado.ok && <p className="alerta alerta-ok" role="status">{estado.ok}</p>}

      <div className="linha">
        <label>
          Nome do curso
          <input name="nome" defaultValue={materia?.nome} required maxLength={140}
            placeholder="Noções de Direito Constitucional" />
        </label>
        <label>
          Área
          <select name="areaId" defaultValue={materia?.areaId ?? ''} required>
            <option value="" disabled>escolha…</option>
            {areas.map((a) => <option key={a.id} value={a.id}>{a.nome}</option>)}
          </select>
        </label>
      </div>

      <label>
        Ementa
        <textarea name="ementa" defaultValue={materia?.ementa} required rows={6}
          placeholder="O que o aluno vai aprender, e para que isso serve na prática." />
        <span className="dica">
          Mínimo de 60 caracteres. É o texto que decide a compra e o que o buscador lê.
        </span>
      </label>

      <div className="linha estreita">
        <label>
          Situação
          <select name="status" defaultValue={materia?.status ?? 'rascunho'}>
            {SITUACOES.map((s) => <option key={s.valor} value={s.valor}>{s.rotulo}</option>)}
          </select>
        </label>
        <label>
          Professor
          <input name="professor" defaultValue={materia?.professor ?? ''} placeholder="quem assina" />
        </label>
        <label>
          Onda de lançamento
          <input name="onda" type="number" min={1} defaultValue={materia?.onda ?? ''}
            placeholder="sem data" />
        </label>
        <label>
          Ordem
          <input name="ordem" type="number" defaultValue={materia?.ordem ?? 10} />
        </label>
      </div>

      {!ehPlataforma && (
        <label className="marcador">
          <input type="checkbox" name="naVitrinePlataforma"
            defaultChecked={materia?.naVitrinePlataforma} />
          Também na vitrine da plataforma
          <span className="dica">
            §5.10: compartilhar é ato deliberado, matéria a matéria. Venda que nascer na nossa
            vitrine é venda nossa, com comissão pela regra do §5.6.1.
          </span>
        </label>
      )}

      <div className="acoes">
        <button className="btn btn-primario" type="submit" disabled={pendente}>
          {pendente ? 'Salvando…' : materia ? 'Salvar curso' : 'Criar curso'}
        </button>
      </div>
    </form>
  );
}
