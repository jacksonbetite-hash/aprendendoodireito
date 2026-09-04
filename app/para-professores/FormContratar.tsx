'use client';

import { useActionState, useState } from 'react';
import { Icone } from '../ui.tsx';
import type { EstadoContratar } from './acoes.ts';

type Acao = (estado: EstadoContratar, dados: FormData) => Promise<EstadoContratar>;

/**
 * O formulário de contratação do portal — o autosserviço do §5.10.2.
 *
 * Uma tela só, de propósito: quem chegou até aqui já leu a proposta e o
 * preço logo acima. Quebrar em passos ("crie a conta, depois o portal,
 * depois pague") é onde funil de assinatura morre.
 */
export default function FormContratar({ acao, dominio }: { acao: Acao; dominio: string }) {
  const [estado, enviar, pendente] = useActionState(acao, {});
  const [mascara, setMascara] = useState('');

  const limpa = mascara.trim().toLowerCase().replace(/[^a-z0-9-]/g, '');

  return (
    <form action={enviar} className="formulario" id="contratar">
      {estado.erro && (
        <p className="alerta alerta-erro" role="alert">
          <Icone nome="error" tamanho={20} /> {estado.erro}
        </p>
      )}

      <label>
        Seu nome
        <input name="nome" type="text" autoComplete="name" required maxLength={120} />
      </label>
      <label>
        E-mail
        <input name="email" type="email" autoComplete="email" required />
        <span className="dica">Vira o seu login e recebe as faturas do portal.</span>
      </label>
      <label>
        Senha
        <input name="senha" type="password" autoComplete="new-password" required minLength={8} />
      </label>
      <label>
        CNPJ
        <input name="cnpj" type="text" inputMode="text" required
               placeholder="00.000.000/0001-00" maxLength={18} />
        <span className="dica">
          O portal exige pessoa jurídica: a conta que recebe as suas vendas só existe
          com CNPJ — regra do Banco Central, não escolha nossa.
        </span>
      </label>
      <fieldset style={{ border: 0, padding: 0, margin: 0, display: 'grid', gap: 14 }}>
        <legend className="caption suave">Dados do responsável</legend>
        <p className="dica" style={{ margin: 0 }}>
          A conta que recebe as suas vendas é aberta no meio de pagamento em nome da sua
          empresa. Ele exige estes dados para abrir a conta — nós só repassamos.
        </p>
        <label>
          Celular
          <input name="telefone" type="tel" autoComplete="tel" required maxLength={20}
                 placeholder="(11) 99999-9999" />
        </label>
        <label>
          Renda mensal (R$)
          <input name="renda" type="number" min={1} step="0.01" required placeholder="5000" />
        </label>
        <label>
          CEP
          <input name="cep" type="text" inputMode="numeric" autoComplete="postal-code" required
                 maxLength={9} placeholder="00000-000" />
        </label>
        <label>
          Logradouro
          <input name="logradouro" type="text" autoComplete="address-line1" required maxLength={120}
                 placeholder="Rua, avenida…" />
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 12 }}>
          <label>
            Número
            <input name="numero" type="text" required maxLength={12} />
          </label>
          <label>
            Complemento
            <input name="complemento" type="text" maxLength={60} placeholder="opcional" />
          </label>
        </div>
        <label>
          Bairro
          <input name="bairro" type="text" autoComplete="address-level3" required maxLength={80} />
        </label>
      </fieldset>
      <label>
        Nome do seu portal
        <input name="nomeExibicao" type="text" required maxLength={80}
               placeholder="Ex.: Direito com a Profª Ana" />
      </label>
      <label>
        Endereço do portal
        <input name="mascara" type="text" required minLength={3} maxLength={32}
               placeholder="ex.: profana" value={mascara}
               onChange={(e) => setMascara(e.target.value)}
               style={{ textTransform: 'lowercase' }} />
        <span className="dica">
          Seu site fica em <strong>{limpa || 'seunome'}.{dominio}</strong> — minúsculas,
          números e hífen no meio. Domínio próprio chega como upgrade.
        </span>
      </label>

      <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
        <legend className="caption suave" style={{ marginBottom: 8 }}>Primeira mensalidade por</legend>
        <div style={{ display: 'flex', gap: 18 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="radio" name="meio" value="PIX" defaultChecked /> Pix
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="radio" name="meio" value="CARTAO" /> Cartão (renova sozinho)
          </label>
        </div>
      </fieldset>

      <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
        <input type="checkbox" name="aceite" required style={{ marginTop: 4 }} />
        <span style={{ fontWeight: 400, fontSize: 14 }}>
          Li e aceito o contrato do Portal do Professor: mensalidade e percentual do plano
          acima, retenção dos recebimentos pelo prazo de arrependimento do aluno,
          e a declaração de que <strong>o conteúdo publicado é meu ou tenho licença para
          usá-lo</strong> — a responsabilidade pelo que o portal publica é minha.
        </span>
      </label>

      <button className="btn btn-primario btn-lg" type="submit" disabled={pendente}>
        {pendente ? 'Criando seu portal…' : 'Contratar e pagar a 1ª mensalidade'}
      </button>
      <p className="dica">
        O portal só vai ao ar depois do pagamento confirmado. Arrependeu? 7 dias para
        devolução integral (CDC, art. 49).
      </p>
    </form>
  );
}
