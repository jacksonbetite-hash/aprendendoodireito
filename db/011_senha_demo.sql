-- A conta de demonstração ganha senha para o fluxo de login ser testável
-- de ponta a ponta. Hash de 'constitucional88', gerado com o mesmo scrypt
-- de lib/auth.ts. É conta de exemplo em ambiente de desenvolvimento — em
-- produção, crie contas pelo cadastro e o admin por scripts/criar-admin.mjs.
UPDATE usuario
   SET senha_hash = 'scrypt$16384$Jlwhj4UfGIsRIjvAuy0GXw==$yZdAgEzmGI7ihL5yQn3Xc65eNLsf6M2tkb0giitNtD9SPzLP+u71pM7o2Lht711PT9ymrzdDhmvsplpiGYAu6A=='
 WHERE lower(email) = 'ana@exemplo.com';
