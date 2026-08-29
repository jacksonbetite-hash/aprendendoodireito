import test from 'node:test';
import assert from 'node:assert/strict';
import {
  podeAcessar, licencaVigente,
  type Licenca, type AulaAlvo, type Espectador,
  type StatusLicenca, type EscopoLicenca, type OrigemLicenca,
} from './licenca.ts';

/**
 * Matriz escopo × status × vigência — mitigação do risco §15.8:
 * "Complexidade do licenciamento gera bug de acesso →
 *  testes automatizados cobrindo toda a matriz antes do lançamento."
 */

const AGORA = new Date('2026-09-01T12:00:00Z');
const MATERIA_CONST = 1;
const MATERIA_INTRO = 2;

const aulaPaga: AulaAlvo = { id: 10, materiaId: MATERIA_CONST, amostraGratuita: false, noTrial: false };
const aulaDoTrial: AulaAlvo = { id: 11, materiaId: MATERIA_CONST, amostraGratuita: false, noTrial: true };
const aulaAberta: AulaAlvo = { id: 12, materiaId: MATERIA_CONST, amostraGratuita: true, noTrial: true };

function lic(over: Partial<Licenca> = {}): Licenca {
  return {
    id: 1,
    escopo: 'MATERIA',
    materiaId: MATERIA_CONST,
    origem: 'COMPRA',
    status: 'ATIVA',
    inicioEm: new Date('2026-08-01T00:00:00Z'),
    fimEm: new Date('2026-10-01T00:00:00Z'),
    ...over,
  };
}

const visitante: Espectador = { licencas: [] };
const aluno = (licencas: Licenca[], statusConta: Espectador['statusConta'] = 'ATIVA'): Espectador =>
  ({ usuarioId: 99, statusConta, licencas });

// ---------- Camada aberta ----------

test('amostra gratuita libera até para visitante sem cadastro', () => {
  const d = podeAcessar(visitante, aulaAberta, AGORA);
  assert.equal(d.libera, true);
  assert.equal(d.motivo, 'AMOSTRA_GRATUITA');
});

test('visitante sem cadastro é bloqueado em aula não-amostra', () => {
  const d = podeAcessar(visitante, aulaPaga, AGORA);
  assert.equal(d.libera, false);
  assert.equal(d.motivo, 'SEM_LICENCA');
});

// ---------- Matriz de status ----------

const STATUS: StatusLicenca[] = ['PENDENTE','ATIVA','EM_ATRASO','SUSPENSA','CANCELADA','EXPIRADA'];

for (const status of STATUS) {
  test(`licença de matéria com status ${status} ${status === 'ATIVA' ? 'libera' : 'bloqueia'}`, () => {
    const d = podeAcessar(aluno([lic({ status })]), aulaPaga, AGORA);
    assert.equal(d.libera, status === 'ATIVA');
  });
}

// ---------- Matriz de vigência ----------

test('licença que ainda não começou não libera', () => {
  const futura = lic({
    inicioEm: new Date('2026-10-01T00:00:00Z'),
    fimEm: new Date('2026-12-01T00:00:00Z'),
  });
  assert.equal(licencaVigente(futura, AGORA), false);
  assert.equal(podeAcessar(aluno([futura]), aulaPaga, AGORA).libera, false);
});

test('licença expirada não libera', () => {
  const vencida = lic({
    inicioEm: new Date('2026-06-01T00:00:00Z'),
    fimEm: new Date('2026-08-01T00:00:00Z'),
  });
  assert.equal(podeAcessar(aluno([vencida]), aulaPaga, AGORA).libera, false);
});

test('o instante do fim já está fora da vigência (fim exclusivo)', () => {
  const terminaAgora = lic({ fimEm: AGORA });
  assert.equal(licencaVigente(terminaAgora, AGORA), false);
});

test('o instante do início já está dentro da vigência (início inclusivo)', () => {
  const comecaAgora = lic({ inicioEm: AGORA });
  assert.equal(licencaVigente(comecaAgora, AGORA), true);
});

// ---------- Matriz de escopo ----------

test('licença de catálogo libera qualquer matéria', () => {
  const passe = lic({ id: 7, escopo: 'CATALOGO', materiaId: null });
  const outraMateria: AulaAlvo = { id: 20, materiaId: MATERIA_INTRO, amostraGratuita: false, noTrial: false };
  const d = podeAcessar(aluno([passe]), outraMateria, AGORA);
  assert.equal(d.libera, true);
  assert.equal(d.motivo, 'LICENCA_CATALOGO');
});

test('licença de uma matéria não libera outra matéria', () => {
  const outraMateria: AulaAlvo = { id: 20, materiaId: MATERIA_INTRO, amostraGratuita: false, noTrial: false };
  const d = podeAcessar(aluno([lic()]), outraMateria, AGORA);
  assert.equal(d.libera, false);
  assert.equal(d.motivo, 'SEM_LICENCA');
});

// ---------- Origens: promocional e cortesia equivalem à paga (§6.1.1) ----------

const ORIGENS_PLENAS: OrigemLicenca[] = ['COMPRA', 'PROMOCIONAL', 'CORTESIA', 'MIGRACAO'];

for (const origem of ORIGENS_PLENAS) {
  test(`licença de origem ${origem} dá acesso total à matéria`, () => {
    const campanha = origem === 'PROMOCIONAL' ? { campanhaId: 3 } : {};
    const d = podeAcessar(aluno([lic({ origem, ...campanha })]), aulaPaga, AGORA);
    assert.equal(d.libera, true, `${origem} deveria liberar`);
    assert.equal(d.motivo, 'LICENCA_MATERIA');
  });
}

// ---------- Trial: limitado por conteúdo, não só por prazo (§6.1) ----------

test('trial libera aula dentro da cota', () => {
  const trial = lic({ origem: 'TRIAL', cota: { aulas: 4, exercicios: 30 } });
  const d = podeAcessar(aluno([trial]), aulaDoTrial, AGORA);
  assert.equal(d.libera, true);
  assert.equal(d.motivo, 'TRIAL');
});

test('trial bloqueia aula fora da cota, com motivo próprio', () => {
  const trial = lic({ origem: 'TRIAL', cota: { aulas: 4, exercicios: 30 } });
  const d = podeAcessar(aluno([trial]), aulaPaga, AGORA);
  assert.equal(d.libera, false);
  assert.equal(d.motivo, 'FORA_DA_COTA_DO_TRIAL');
});

test('trial expirado bloqueia como qualquer licença vencida', () => {
  const trial = lic({
    origem: 'TRIAL',
    inicioEm: new Date('2026-08-01T00:00:00Z'),
    fimEm: new Date('2026-08-08T00:00:00Z'),
  });
  assert.equal(podeAcessar(aluno([trial]), aulaDoTrial, AGORA).libera, false);
});

// ---------- Licenças somam, nunca se anulam (§6.3) ----------

test('trial vigente + compra da mesma matéria: a plena prevalece', () => {
  const trial = lic({ id: 1, origem: 'TRIAL' });
  const compra = lic({ id: 2, origem: 'COMPRA' });
  const d = podeAcessar(aluno([trial, compra]), aulaPaga, AGORA);
  assert.equal(d.libera, true);
  assert.equal(d.motivo, 'LICENCA_MATERIA');
  assert.equal(d.licencaId, 2);
});

test('passe + licença de matéria: o passe (mais abrangente) resolve', () => {
  const materia = lic({ id: 1 });
  const passe = lic({ id: 2, escopo: 'CATALOGO', materiaId: null });
  const d = podeAcessar(aluno([materia, passe]), aulaPaga, AGORA);
  assert.equal(d.motivo, 'LICENCA_CATALOGO');
  assert.equal(d.licencaId, 2);
});

test('passe expirado não apaga a licença de matéria ainda vigente', () => {
  const materia = lic({ id: 1 });
  const passeVencido = lic({
    id: 2, escopo: 'CATALOGO', materiaId: null,
    inicioEm: new Date('2026-01-01T00:00:00Z'),
    fimEm: new Date('2026-02-01T00:00:00Z'),
  });
  const d = podeAcessar(aluno([passeVencido, materia]), aulaPaga, AGORA);
  assert.equal(d.libera, true);
  assert.equal(d.motivo, 'LICENCA_MATERIA');
});

test('licença cancelada não derruba outra vigente da mesma matéria', () => {
  const cancelada = lic({ id: 1, status: 'CANCELADA' });
  const ativa = lic({ id: 2, status: 'ATIVA' });
  const d = podeAcessar(aluno([cancelada, ativa]), aulaPaga, AGORA);
  assert.equal(d.libera, true);
  assert.equal(d.licencaId, 2);
});

// ---------- Estado da conta (§6.5) ----------

test('conta bloqueada por inatividade não acessa nem com licença ativa', () => {
  const d = podeAcessar(aluno([lic()], 'BLOQUEADA_INATIVIDADE'), aulaPaga, AGORA);
  assert.equal(d.libera, false);
  assert.equal(d.motivo, 'CONTA_BLOQUEADA');
});

test('conta bloqueada ainda enxerga a amostra gratuita (conteúdo aberto)', () => {
  const d = podeAcessar(aluno([lic()], 'BLOQUEADA_INATIVIDADE'), aulaAberta, AGORA);
  assert.equal(d.libera, true);
});

test('conta em aviso de inatividade continua acessando normalmente', () => {
  const d = podeAcessar(aluno([lic()], 'INATIVA_AVISO'), aulaPaga, AGORA);
  assert.equal(d.libera, true);
});

// ---------- Varredura completa da matriz ----------

test('matriz escopo × status × vigência: só ATIVA + vigente libera', () => {
  const escopos: EscopoLicenca[] = ['CATALOGO', 'MATERIA'];
  const vigencias = [
    { nome: 'vigente',  inicioEm: new Date('2026-08-01Z'), fimEm: new Date('2026-10-01Z'), dentro: true },
    { nome: 'futura',   inicioEm: new Date('2026-10-01Z'), fimEm: new Date('2026-11-01Z'), dentro: false },
    { nome: 'vencida',  inicioEm: new Date('2026-06-01Z'), fimEm: new Date('2026-07-01Z'), dentro: false },
  ];
  let combinacoes = 0;
  for (const escopo of escopos) {
    for (const status of STATUS) {
      for (const v of vigencias) {
        const l = lic({
          escopo,
          materiaId: escopo === 'CATALOGO' ? null : MATERIA_CONST,
          status, inicioEm: v.inicioEm, fimEm: v.fimEm,
        });
        const esperado = status === 'ATIVA' && v.dentro;
        const d = podeAcessar(aluno([l]), aulaPaga, AGORA);
        assert.equal(d.libera, esperado,
          `escopo=${escopo} status=${status} vigência=${v.nome} deveria ${esperado ? 'liberar' : 'bloquear'}`);
        combinacoes++;
      }
    }
  }
  assert.equal(combinacoes, 36);
});
