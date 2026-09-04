'use client';

import { useActionState } from 'react';
import type { EstadoAdmin } from '../../admin/acoes.ts';

type Acao = (e: EstadoAdmin, d: FormData) => Promise<EstadoAdmin>;

/**
 * Domínio próprio do portal (Fase 2). Três estados, uma tela: sem domínio
 * (cadastra), cadastrado mas não verificado (mostra o CNAME e verifica),
 * verificado (funciona, e entra na fatura).
 */
export default function FormDominio({
  acaoDefinir, acaoVerificar, dominio, verificadoEm, esperado, precoMes,
}: {
  acaoDefinir: Acao; acaoVerificar: Acao;
  dominio: string | null; verificadoEm: string | null; esperado: string; precoMes: string;
}) {
  const [e1, definir, definindo] = useActionState(acaoDefinir, {});
  const [e2, verificar, verificando] = useActionState(acaoVerificar, {});
  const estado = e2.erro || e2.ok ? e2 : e1;

  return (
    <div className="pilha-sm">
      {estado.erro && <p className="alerta alerta-erro" role="alert">{estado.erro}</p>}
      {estado.ok && <p className="alerta alerta-ok" role="status">{estado.ok}</p>}

      <form action={definir} className="formulario" id="dominio">
        <label>
          Seu domínio
          <input name="dominio" type="text" defaultValue={dominio ?? ''} maxLength={253}
                 placeholder="cursos.seudominio.com.br" style={{ textTransform: 'lowercase' }} />
          <span className="dica">
            {precoMes}/mês na sua fatura, só depois de verificado. Deixe vazio e salve para remover.
          </span>
        </label>
        <div className="acoes">
          <button className="btn btn-primario" type="submit" disabled={definindo}>
            {definindo ? 'Salvando…' : 'Salvar domínio'}
          </button>
        </div>
      </form>

      {dominio && (
        <div className="cartao" style={{ background: 'var(--surface-container-low)' }}>
          {verificadoEm ? (
            <p>
              <strong>{dominio}</strong> verificado em {verificadoEm}: o seu portal responde nele.
            </p>
          ) : (
            <>
              <p style={{ marginBottom: 8 }}>
                No painel do seu registrador de domínio, crie um registro <strong>CNAME</strong>:
              </p>
              <code style={{ display: 'block', marginBottom: 12, fontSize: 13, wordBreak: 'break-all' }}>
                {dominio} → {esperado}
              </code>
              <form action={verificar} id="verificar-dominio">
                <button className="btn btn-contorno" type="submit" disabled={verificando}>
                  {verificando ? 'Consultando o DNS…' : 'Já apontei — verificar'}
                </button>
              </form>
              <p className="dica" style={{ marginTop: 8 }}>
                DNS pode levar até algumas horas para propagar. O certificado HTTPS do seu
                domínio é emitido pela nossa equipe depois da verificação.
              </p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
