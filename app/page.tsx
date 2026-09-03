import Link from 'next/link';
import { Pagina, portalSuspenso, PortalSuspenso, Icone } from './componentes.tsx';
import VideoHero from './VideoHero.tsx';
import PaginaPortal from './PaginaPortal.tsx';
import { listarAreasEmCache, listarMateriasEmCache } from '../lib/catalogo.ts';
import { portalIdAtual } from '../lib/portal-consultas.ts';
import { alunoAtual } from '../lib/sessao.ts';

export const dynamic = 'force-dynamic';

/* ==================================================================
   CONTEÚDO ILUSTRATIVO — LER ANTES DE PUBLICAR
   ------------------------------------------------------------------
   Os depoimentos, os nomes e os retratos abaixo são material de
   avaliação: os textos foram escritos para o projeto e as fotos vieram
   de um banco de imagens com licença livre para uso comercial (Unsplash),
   baixadas para public/retratos/. Nenhuma pessoa retratada usou ou endossou a
   plataforma, e nenhuma autorizou uso de imagem — antes de publicar, as
   fotos têm de ser substituídas por retratos com licença e cessão.

   Enquanto for assim, a interface diz isso em voz alta pelo selo
   .selo-ilustrativo em cada uma dessas seções. Publicar depoimento
   inventado sem essa marcação é publicidade enganosa (CDC, art. 37) —
   antes de ir ao ar, ou vira depoimento real com autorização de uso de
   imagem, ou a seção sai junto com o selo.
   ================================================================== */

/* Servidas do próprio projeto, não de terceiro: dez requisições
   simultâneas a um serviço externo faziam um retrato falhar de vez em
   quando, e a seção abria com um quadro vazio. Ver public/retratos/LEIA-ME.md
   para a procedência de cada arquivo. */
const RETRATO = (arquivo: string) => `/retratos/${arquivo}.jpg`;

/* Retratos de headshot profissional, escolhidos um a um olhando o conjunto
   inteiro em contato: são professores, e a foto precisa sustentar isso. O
   critério — enquadramento de retrato, olhar composto, luz limpa, roupa que
   não disputa atenção, e idade compatível com quem tem o que ensinar. Fora
   ficaram os retratos de editorial, os casuais de rua e tudo que lê como
   aluno em vez de quem dá a aula. */
const ESPECIALISTAS = [
  { nome: 'Otávio Lins',     area: 'Direito Aplicado',   img: 'docente-05' },
  { nome: 'Helena Braga',    area: 'Comunicação',        img: 'docente-02' },
  { nome: 'Rafael Miranda',  area: 'Gestão de Projetos', img: 'docente-03' },
  { nome: 'Juliana Prado',   area: 'Análise de Dados',   img: 'docente-04' },
  { nome: 'Caio Nogueira',   area: 'Finanças Pessoais',  img: 'docente-01' },
  { nome: 'Marina Estrela',  area: 'Design de Produto',  img: 'docente-06' },
  { nome: 'Diego Sampaio',   area: 'Tecnologia',         img: 'docente-07' },
  { nome: 'Bianca Rocha',    area: 'Marketing',          img: 'docente-08' },
  { nome: 'André Coutinho',  area: 'Vendas',             img: 'docente-09' },
  { nome: 'Tereza Vasques',  area: 'Liderança',          img: 'docente-10' },
];

const DEPOIMENTOS = [
  {
    texto:
      'Eu já tinha tentado estudar por apostila três vezes e sempre parava na segunda semana. ' +
      'Aqui a aula tem doze minutos e o exercício vem logo em seguida — no fim do mês eu tinha ' +
      'terminado uma trilha inteira sem perceber.',
    nome: 'Camila Ferraz', cargo: 'Analista administrativa', img: 'aluno-01',
  },
  {
    texto:
      'O que mudou o jogo para mim foi ver a fonte original junto com a explicação. Parei de ' +
      'decorar resumo de resumo e comecei a entender de onde a regra vem.',
    nome: 'Paulo Menezes', cargo: 'Servidor público', img: 'aluno-02',
  },
  {
    texto:
      'Uso no intervalo do almoço, no celular. Em quatro meses fechei duas trilhas e passei na ' +
      'seleção interna que eu vinha adiando desde 2023.',
    nome: 'Renata Aguiar', cargo: 'Coordenadora de equipe', img: 'aluno-03',
  },
];

const RECURSOS = [
  'aulas de 8 a 15 min', 'exercícios comentados', 'biblioteca de fontes',
  'trilhas por objetivo', 'progresso por área', 'certificado de conclusão',
  'acesso no celular', 'sem anúncio', 'cancelamento em 2 cliques',
];

export default async function Home() {
  const portalId = await portalIdAtual();
  // §5.10 — no endereço de um professor, a home é a página única do
  // portal dele, não a nossa (que fala de nós, das nossas 7 áreas e dos
  // nossos professores).
  if (portalId !== 0) return <PaginaPortal />;
  // §5.10 — portal suspenso por inadimplência: visitante não vê o catálogo;
  // quem está logado passa (a licença vigente dele continua valendo).
  if (await portalSuspenso() && !(await alunoAtual())) return <PortalSuspenso />;
  const [areas, materias] = await Promise.all([
    listarAreasEmCache(portalId), listarMateriasEmCache(portalId),
  ]);
  const publicadas = materias.filter((m) => m.status === 'publicado' && m.aulasPublicadas > 0);
  const aulas = publicadas.reduce((s, m) => s + m.aulasPublicadas, 0);
  const questoes = publicadas.reduce((s, m) => s + m.questoes, 0);

  return (
    <Pagina>
      {/* ---------- 1. Hero ---------- */}
      <section className="hero">
        <div className="container hero-grade">
          <div>
            <span className="chip chip-primaria chip-sm">
              <Icone nome="auto_awesome" tamanho={16} /> Aprendizado sem decoreba
            </span>
            <h1><em>Aprimore o seu saber</em> no ritmo de quem trabalha.</h1>
            <p>
              Aula curta, exercício na sequência e a fonte original a um clique. Você entende de
              verdade em vez de memorizar resumo — e vê o progresso a cada semana.
            </p>

            <ul className="lista-check duas">
              {[
                'Aulas de 8 a 15 minutos',
                'Exercícios comentados um a um',
                'Biblioteca de fontes integrada',
                'Progresso visível por área',
              ].map((t) => (
                <li key={t}><Icone nome="check_circle" tamanho={20} /> {t}</li>
              ))}
            </ul>

            <Link className="btn btn-primario btn-lg" href="/cadastrar">Começar teste grátis</Link>
          </div>

          <div style={{ position: 'relative' }}>
            <VideoHero />
            <div className="hero-chips" aria-hidden="true">
              <span><Icone nome="menu_book" tamanho={14} /> Biblioteca</span>
              <span><Icone nome="quiz" tamanho={14} /> Exercícios</span>
              <span><Icone nome="workspace_premium" tamanho={14} /> Certificado</span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- 2. Prova em números ---------- */}
      <section className="secao tinta" style={{ paddingBlock: 0 }}>
        <div className="container faixa-numeros">
          <div><b>{publicadas.length}</b><span>cursos no ar</span></div>
          <div><b>{aulas}</b><span>aulas publicadas</span></div>
          <div><b>{questoes}</b><span>questões comentadas</span></div>
          <div><b>7 dias</b><span>de teste grátis</span></div>
        </div>
      </section>

      {/* ---------- 3. Áreas de conhecimento ---------- */}
      <section className="secao" id="cursos">
        <div className="container">
          <div className="secao-titulo">
            <h2>Resultado em <em>todas as áreas</em></h2>
            <p>
              Trilhas estruturadas que levam você do conceito básico até a aplicação prática, sem
              pular etapa e sem enrolação.
            </p>
          </div>

          <div className="grade-4">
            {areas.map((area) => {
              const daArea = materias.filter((m) => m.areaSlug === area.slug);
              const noAr = daArea.filter((m) => m.status === 'publicado' && m.aulasPublicadas > 0);
              const pct = daArea.length ? Math.round((noAr.length / daArea.length) * 100) : 0;
              const primeira = noAr[0];

              return (
                <Link className="cartao cartao-area" href={primeira ? `/materia/${primeira.slug}` : '/catalogo'} key={area.id}>
                  <h3>{area.nome}</h3>
                  <p>
                    {daArea.length
                      ? daArea.map((m) => m.nome.replace(/^Noções de /, '')).slice(0, 3).join(', ') + '.'
                      : 'Área do mapa definitivo, ainda em produção.'}
                  </p>
                  <div className="progresso" aria-hidden="true"><i style={{ width: `${pct}%` }} /></div>
                  <span className="acao">
                    {noAr.length ? 'Começar' : 'Em breve'} <Icone nome="arrow_forward" tamanho={16} />
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------- 4. Recursos em pills ---------- */}
      <section className="secao marca">
        <div className="container">
          <div className="secao-titulo">
            <h2>Tudo o que você precisa, <em>em um lugar só</em></h2>
            <p>Sem plugin, sem planilha paralela, sem material solto em cinco pastas diferentes.</p>
          </div>
          <div className="pills">
            {RECURSOS.map((r) => <span className="chip" key={r}>{r}</span>)}
          </div>
        </div>
      </section>

      {/* ---------- 5. Como o estudo funciona (2×2) ---------- */}
      <section className="secao">
        <div className="container">
          <div className="secao-titulo">
            <h2>Estude do jeito que <em>a memória funciona</em></h2>
            <p>Entender, ver a fonte, praticar e revisar. Nesta ordem, todo dia, em pouco tempo.</p>
          </div>
          <div className="grade-2" style={{ gap: 32, maxWidth: '58rem', margin: '0 auto' }}>
            {[
              { i: 'play_circle', t: 'Assista à aula', p: 'Vídeo curto, exemplo do dia a dia e nenhum jargão sem tradução.' },
              { i: 'menu_book', t: 'Consulte a fonte', p: 'A referência original abre ao lado da aula, comentada em português claro.' },
              { i: 'quiz', t: 'Faça o exercício', p: 'Questão logo depois do conceito, com comentário item a item se você errar.' },
              { i: 'insights', t: 'Acompanhe o progresso', p: 'Você vê o que já domina e o que precisa revisar, por área e por semana.' },
            ].map((b) => (
              <div className="icone-caixa" key={b.t}>
                <span className="selo"><Icone nome={b.i} tamanho={22} /></span>
                <div>
                  <h3>{b.t}</h3>
                  <p>{b.p}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- 6. Onboarding em 3 etapas ---------- */}
      <section className="secao tinta">
        <div className="container">
          <div className="secao-titulo">
            <h2>Comece hoje, <em>em três passos</em></h2>
          </div>
          <div className="grade-3">
            {[
              { n: 1, t: 'Crie sua conta', p: 'Leva menos de um minuto e não pede cartão de crédito.',
                itens: ['Sem cartão agora', 'Acesso imediato'] },
              { n: 2, t: 'Escolha a trilha', p: 'Diga o seu objetivo e a plataforma monta a ordem das aulas.',
                itens: ['Trilha por objetivo', 'Ritmo que você define'] },
              { n: 3, t: 'Estude e acompanhe', p: 'Aula, exercício e revisão — com o progresso sempre à vista.',
                itens: ['Progresso por área', 'Revisão do que você errou'] },
            ].map((e) => (
              <div className="cartao etapa" key={e.n}>
                <span className="rotulo-etapa">Etapa {e.n}</span>
                <h3>{e.t}</h3>
                <p>{e.p}</p>
                <ul className="lista-check" style={{ marginTop: 4 }}>
                  {e.itens.map((i) => <li key={i}><Icone nome="check_circle" tamanho={20} /> {i}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- 7. Faixa de chamada ---------- */}
      <section className="secao">
        <div className="container">
          <div className="chamada">
            <h2>Sete dias grátis para ver se funciona para você</h2>
            <p>
              Abra o catálogo, assista às aulas, faça os exercícios. Se não for o que você
              procurava, é só não continuar — sem ligação de retenção e sem letra miúda.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <Link className="btn btn-primario" href="/cadastrar">Começar meu teste grátis</Link>
              <span className="nota">Não pedimos cartão de crédito agora.</span>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- 8. Especialistas (ILUSTRATIVO) ---------- */}
      <section className="secao clara" id="especialistas">
        <div className="container">
          <div className="secao-titulo">
            <h2>Quem <em>ensina aqui</em></h2>
            <p>Profissionais que trabalham na área que ensinam, com aula preparada para quem tem pouco tempo.</p>
          </div>
          <div className="especialistas-grade">
            {ESPECIALISTAS.map((e) => (
              <div className="especialista" key={e.nome}>
                <img src={RETRATO(e.img)} alt="" width={200} height={200} loading="lazy" />
                <strong>{e.nome}</strong>
                <span>{e.area}</span>
              </div>
            ))}
          </div>
          <p className="centro">
            <span className="selo-ilustrativo">
              <Icone nome="info" tamanho={16} />
              Nomes e retratos ilustrativos — quadro docente em definição
            </span>
          </p>
        </div>
      </section>

      {/* ---------- 9. Resultados ---------- */}
      <section className="secao">
        <div className="container">
          <div className="secao-titulo">
            <h2>O que muda <em>na prática</em></h2>
            <p>Média declarada por alunos que concluíram ao menos uma trilha completa.</p>
          </div>
          <div className="grade-3">
            <div className="estatistica"><b>3×</b><span>mais constância do que estudando por apostila</span></div>
            <div className="estatistica"><b>82%</b><span>concluem a primeira trilha que começam</span></div>
            <div className="estatistica"><b>14 min</b><span>é a sessão média de estudo por dia</span></div>
          </div>
          <p className="centro">
            <span className="selo-ilustrativo">
              <Icone nome="info" tamanho={16} />
              Números ilustrativos — a medição real começa com a base em produção
            </span>
          </p>
        </div>
      </section>

      {/* ---------- 10. Depoimentos (ILUSTRATIVO) ---------- */}
      <section className="secao tinta">
        <div className="container">
          <div className="secao-titulo">
            <h2>Quem já <em>estuda com a gente</em></h2>
          </div>
          <div className="grade-3">
            {DEPOIMENTOS.map((d) => (
              <div className="cartao depoimento" key={d.nome}>
                <Icone nome="format_quote" tamanho={28} className="aspas" />
                <p>{d.texto}</p>
                <footer>
                  <img src={RETRATO(d.img)} alt="" width={48} height={48} loading="lazy" />
                  <div>
                    <strong>{d.nome}</strong>
                    <small>{d.cargo}</small>
                  </div>
                </footer>
              </div>
            ))}
          </div>
          <p className="centro">
            <span className="selo-ilustrativo">
              <Icone nome="info" tamanho={16} />
              Depoimentos ilustrativos, escritos para avaliação de conteúdo
            </span>
          </p>
        </div>
      </section>

      {/* ---------- 11. Para professores (§5.10.2, etapa 3) ---------- */}
      {/* Só no site principal: dentro do portal de um professor, anunciar
          "monte o seu" seria vender concorrência na casa dele. */}
      {portalId === 0 && (
        <section className="secao tinta" id="para-professores">
          <div className="container">
            <div className="chamada chamada-lado">
              <span className="bolha bolha-a" aria-hidden="true" />
              <span className="bolha bolha-b" aria-hidden="true" />
              <div className="chamada-texto">
                <h2>Professor? Tenha o seu próprio portal</h2>
                <p>
                  Site com o seu endereço, player protegido, checkout pronto e o dinheiro
                  das vendas caindo direto na sua conta. Você ensina; a tecnologia é conosco.
                </p>
              </div>
              <Link className="btn btn-primario btn-lg" href="/para-professores">Conhecer o Portal do Professor</Link>
            </div>
          </div>
        </section>
      )}

      {/* ---------- 12. Planos ---------- */}
      <section className="secao" id="planos">
        <div className="container">
          <div className="secao-titulo">
            <h2>Planos <em>sob medida</em></h2>
            <p>Escolha o formato que combina com o seu momento. Todos começam com 7 dias grátis.</p>
          </div>
          <div className="centro">
            <Link className="btn btn-primario btn-lg" href="/planos">Ver planos e preços</Link>
          </div>
        </div>
      </section>
    </Pagina>
  );
}
