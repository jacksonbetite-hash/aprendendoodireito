'use client';

import { useActionState, useState } from 'react';
import type { EstadoAdmin } from '../acoes.ts';
import type { VagaAdmin } from '../../../lib/admin-vagas.ts';
// Rótulos vêm do módulo puro: `lib/vagas.ts` importa `pg`, e um
// componente de cliente que o importe leva o driver do banco para o
// navegador (a mesma armadilha que separou `precos.ts` de suas consultas).
import { ROTULO_TIPO, ROTULO_REGIME, ROTULO_MODALIDADE } from '../../../lib/vagas-rotulos.ts';

/**
 * Cadastro da vaga. O único campo com comportamento é a modalidade:
 * cidade e UF deixam de ser obrigatórias quando a vaga é 100% remota — e
 * é a única situação em que o §5.7.1 aceita vaga sem local, porque "onde
 * é" é a primeira pergunta de quem procura estágio.
 */
export default function FormVaga({
  acao, vaga,
}: {
  acao: (e: EstadoAdmin, d: FormData) => Promise<EstadoAdmin>;
  vaga?: VagaAdmin;
}) {
  const [estado, enviar, pendente] = useActionState(acao, {});
  const [modalidade, setModalidade] = useState(vaga?.modalidade ?? 'presencial');
  const precisaLocal = modalidade !== 'remoto';

  return (
    <form action={enviar} className="form-editor">
      {vaga && <input type="hidden" name="id" value={vaga.id} />}
      {estado.erro && <p className="alerta alerta-erro" role="alert">{estado.erro}</p>}
      {estado.ok && <p className="alerta alerta-ok" role="status">{estado.ok}</p>}

      <div className="linha">
        <label>
          Título da vaga
          <input name="titulo" defaultValue={vaga?.titulo} required maxLength={140}
            placeholder="Estágio em Direito Trabalhista" />
        </label>
        <label>
          Área de atuação
          <input name="areaAtuacao" defaultValue={vaga?.areaAtuacao} required
            placeholder="Trabalhista, Tributário, Cível…" />
        </label>
      </div>

      <div className="linha">
        <label>
          Empresa
          <input name="empresa" defaultValue={vaga?.empresa} required maxLength={140} />
        </label>
        <label>
          CNPJ do anunciante
          <input name="empresaCnpj" defaultValue={vaga?.empresaCnpj ?? ''}
            placeholder="00.000.000/0001-00" />
          <span className="dica">§5.7.1: o anunciante precisa ser real e identificável.</span>
        </label>
        <label>
          Contato do anunciante
          <input name="contatoAnunciante" type="email" defaultValue={vaga?.contatoAnunciante ?? ''}
            placeholder="rh@escritorio.com.br" />
          <span className="dica">Só nosso: é por onde se avisa recusa ou vencimento. Não aparece no mural.</span>
        </label>
      </div>

      <div className="linha estreita">
        <label>
          Tipo
          <select name="tipo" defaultValue={vaga?.tipo ?? 'estagio'}>
            {Object.entries(ROTULO_TIPO).map(([v, r]) => <option key={v} value={v}>{r}</option>)}
          </select>
        </label>
        <label>
          Regime
          <select name="regime" defaultValue={vaga?.regime ?? 'integral'}>
            {Object.entries(ROTULO_REGIME).map(([v, r]) => <option key={v} value={v}>{r}</option>)}
          </select>
        </label>
        <label>
          Modalidade
          <select name="modalidade" value={modalidade}
            onChange={(e) => setModalidade(e.target.value as typeof modalidade)}>
            {Object.entries(ROTULO_MODALIDADE).map(([v, r]) => <option key={v} value={v}>{r}</option>)}
          </select>
        </label>
        <label>
          Cidade {precisaLocal ? '' : '(opcional)'}
          <input name="cidade" defaultValue={vaga?.cidade ?? ''} required={precisaLocal} />
        </label>
        <label>
          UF {precisaLocal ? '' : '(opcional)'}
          <input name="uf" defaultValue={vaga?.uf ?? ''} maxLength={2} required={precisaLocal}
            placeholder="SP" style={{ textTransform: 'uppercase' }} />
        </label>
      </div>

      <label>
        Descrição
        <textarea name="descricao" defaultValue={vaga?.descricao} required rows={7}
          placeholder="O que a pessoa vai fazer, em parágrafos separados por linha em branco." />
      </label>

      <label>
        Requisitos
        <textarea name="requisitos" defaultValue={vaga?.requisitos} required rows={5}
          placeholder="Um por linha, ou em parágrafos." />
      </label>

      <div className="linha">
        <label>
          Faixa salarial
          <input name="faixaSalarial" defaultValue={vaga?.faixaSalarial ?? ''}
            placeholder="R$ 1.800 + benefícios (opcional)" />
        </label>
        <label>
          Como se candidatar
          <input name="comoCandidatar" defaultValue={vaga?.comoCandidatar} required
            placeholder="link do formulário ou e-mail" />
          <span className="dica">A candidatura acontece fora da plataforma — nós não intermediamos.</span>
        </label>
      </div>

      <div className="acoes">
        <button className="btn btn-primario" type="submit" disabled={pendente}>
          {pendente ? 'Salvando…' : vaga ? 'Salvar vaga' : 'Cadastrar vaga'}
        </button>
        {!vaga && (
          <span className="dica">
            A vaga entra na fila de moderação. Publicar é o passo seguinte, e fica registrado
            com nome e data — inclusive quando quem cadastra é a casa.
          </span>
        )}
      </div>
    </form>
  );
}
