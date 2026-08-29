#!/usr/bin/env node
/**
 * Cria (ou promove) uma conta de administrador.
 *
 * Não existe admin no seed de propósito: uma senha padrão em repositório
 * público é a porta dos fundos mais explorada que existe. O admin nasce
 * de um comando explícito de quem opera o sistema.
 *
 *   node scripts/criar-admin.mjs email@exemplo.com "Nome" [senha]
 *
 * Sem a senha no argumento, ela é sorteada e impressa uma única vez.
 */
import { randomBytes, scrypt as scryptCb } from 'node:crypto';
import { promisify } from 'node:util';
import pg from 'pg';

const scrypt = promisify(scryptCb);
const [email, nome, senhaArg] = process.argv.slice(2);

if (!email || !nome) {
  console.error('uso: node scripts/criar-admin.mjs <email> <nome> [senha]');
  process.exit(1);
}

const senha = senhaArg ?? randomBytes(12).toString('base64url');

async function hash(s) {
  const sal = randomBytes(16);
  const d = await scrypt(s.normalize('NFKC'), sal, 64);
  return `scrypt$16384$${sal.toString('base64')}$${d.toString('base64')}`;
}

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL
    ?? 'postgres://aprendendo:aprendendo@localhost:5432/aprendendoodireito',
});

const { rows } = await pool.query(
  `INSERT INTO usuario (nome, email, senha_hash, papel)
   VALUES ($1, lower($2), $3, 'admin')
   ON CONFLICT (lower(email)) DO UPDATE
     SET papel = 'admin', senha_hash = EXCLUDED.senha_hash, nome = EXCLUDED.nome
   RETURNING id, email`,
  [nome, email, await hash(senha)],
);
await pool.query(
  `INSERT INTO log_auditoria (ator, acao, entidade, entidade_id, detalhe)
   VALUES ('script', 'usuario.promovido_admin', 'usuario', $1, $2)`,
  [rows[0].id, JSON.stringify({ email: rows[0].email })],
);
await pool.end();

console.log(`\n✔ admin pronto: ${rows[0].email}`);
if (!senhaArg) console.log(`  senha: ${senha}\n  (anote agora — não será mostrada de novo)\n`);
