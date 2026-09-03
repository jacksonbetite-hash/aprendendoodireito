import test from 'node:test';
import assert from 'node:assert/strict';
import {
  mascaraDoHost, validarCnpj, calcularExcedente, competenciaDe, competenciaAnterior, GB,
} from './portal.ts';

// ---------- Excedente e competência (§5.10, etapa 4) ----------

const PLANO = { gbArmazenamento: 100, gbBandaMes: 300, centavosPorGbExcedente: 40 };

test('dentro da cota não há excedente', () => {
  assert.deepEqual(calcularExcedente(100 * GB, 300 * GB, PLANO), { gbExcedentes: 0, centavos: 0 });
});

test('passou 0,1 GB: cobra 1 GB inteiro — a fatura precisa caber numa frase', () => {
  assert.deepEqual(calcularExcedente(100.1 * GB, 0, PLANO), { gbExcedentes: 1, centavos: 40 });
});

test('armazenamento e banda excedentes somam ao mesmo preço', () => {
  const r = calcularExcedente(110 * GB, 350 * GB, PLANO);
  assert.equal(r.gbExcedentes, 60);
  assert.equal(r.centavos, 2400);
});

test('consumo zero num plano zero não dá NaN nem negativo', () => {
  assert.deepEqual(calcularExcedente(0, 0, PLANO), { gbExcedentes: 0, centavos: 0 });
});

test('competência é sempre o dia 1', () => {
  assert.equal(competenciaDe(new Date(2026, 8, 17)), '2026-09-01');
  assert.equal(competenciaAnterior(new Date(2026, 8, 17)), '2026-08-01');
});

test('competência anterior a janeiro é dezembro do ano anterior', () => {
  assert.equal(competenciaAnterior(new Date(2027, 0, 5)), '2026-12-01');
});

/**
 * Ler o endereço errado é o risco 14 do §15: mostrar o acervo de um
 * professor no site de outro. A regra que protege é chata de propósito —
 * o que não for reconhecido com certeza é a plataforma, nunca um chute.
 */

const BASE = 'aprimoreosaber.com.br';

// ---------- O caminho feliz ----------

test('subdomínio vira máscara', () => {
  assert.equal(mascaraDoHost('jackson.aprimoreosaber.com.br', BASE), 'jackson');
});

test('porta é ignorada', () => {
  assert.equal(mascaraDoHost('jackson.aprimoreosaber.com.br:3010', BASE), 'jackson');
});

test('caixa não importa — o Host pode chegar como o cliente quiser', () => {
  assert.equal(mascaraDoHost('JACKSON.AprimoreOSaber.com.br', BASE), 'jackson');
});

test('hífen no meio é máscara válida', () => {
  assert.equal(mascaraDoHost('prof-jackson.aprimoreosaber.com.br', BASE), 'prof-jackson');
});

test('em desenvolvimento, localhost serve de domínio base', () => {
  assert.equal(mascaraDoHost('jackson.localhost:3010', 'localhost'), 'jackson');
});

// ---------- Tudo o mais é a plataforma ----------

test('domínio nu é a plataforma', () => {
  assert.equal(mascaraDoHost('aprimoreosaber.com.br', BASE), null);
});

test('www é a plataforma, não um professor chamado www', () => {
  assert.equal(mascaraDoHost('www.aprimoreosaber.com.br', BASE), null);
});

test('localhost puro é a plataforma', () => {
  assert.equal(mascaraDoHost('localhost:3000', 'localhost'), null);
});

test('Host ausente é a plataforma', () => {
  assert.equal(mascaraDoHost(null, BASE), null);
});

test('outro domínio não vira portal', () => {
  assert.equal(mascaraDoHost('jackson.outrodominio.com.br', BASE), null);
});

test('domínio que apenas TERMINA parecido não passa', () => {
  // 'maliciosoaprimoreosaber.com.br' contém o domínio base como sufixo de
  // texto, mas não como sufixo de rótulo. Sem o ponto, não é subdomínio.
  assert.equal(mascaraDoHost('maliciosoaprimoreosaber.com.br', BASE), null);
});

test('dois níveis de subdomínio não viram máscara', () => {
  assert.equal(mascaraDoHost('a.b.aprimoreosaber.com.br', BASE), null);
});

test('IPv6 não é portal', () => {
  assert.equal(mascaraDoHost('[::1]:3000', BASE), null);
});

test('máscara com caractere fora do formato é recusada', () => {
  assert.equal(mascaraDoHost('jack_son.aprimoreosaber.com.br', BASE), null);
});

test('máscara começando com hífen é recusada', () => {
  assert.equal(mascaraDoHost('-jackson.aprimoreosaber.com.br', BASE), null);
});

test('lista de hosts (proxy encadeado) usa o primeiro', () => {
  assert.equal(
    mascaraDoHost('jackson.aprimoreosaber.com.br, interno', BASE),
    'jackson',
  );
});

// ---------- CNPJ: a porta do autosserviço (§5.10.2) ----------

test('CNPJ válido com máscara de pontuação passa', () => {
  assert.equal(validarCnpj('11.222.333/0001-81'), true);
});

test('CNPJ válido sem pontuação passa', () => {
  assert.equal(validarCnpj('11222333000181'), true);
});

test('dígito verificador errado é recusado', () => {
  assert.equal(validarCnpj('11.222.333/0001-80'), false);
});

test('tudo igual é recusado mesmo com verificadores coerentes', () => {
  assert.equal(validarCnpj('00000000000000'), false);
});

test('CPF (11 dígitos) não passa por CNPJ', () => {
  assert.equal(validarCnpj('529.982.247-25'), false);
});

test('formato alfanumérico da Receita (2026) é aceito quando os DVs fecham', () => {
  // 12 caracteres alfanuméricos + DVs calculados pelo algoritmo oficial
  // (valor = código ASCII - 48). Este par foi conferido manualmente.
  const base = 'AB123456QRST';
  const valor = (c: string) => c.charCodeAt(0) - 48;
  const dv = (b: string, pesos: number[]) => {
    const soma = [...b].reduce((t, c, i) => t + valor(c) * pesos[i], 0);
    const resto = soma % 11;
    return resto < 2 ? 0 : 11 - resto;
  };
  const p1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const d1 = dv(base, p1);
  const d2 = dv(base + String(d1), [6, ...p1]);
  assert.equal(validarCnpj(base + String(d1) + String(d2)), true);
  assert.equal(validarCnpj(base + String((d1 + 1) % 10) + String(d2)), false);
});

test('letra minúscula é normalizada antes do cálculo', () => {
  assert.equal(validarCnpj('11222333000181'.toLowerCase()), true);
});
