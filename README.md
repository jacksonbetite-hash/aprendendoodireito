# Aprendendo o Direito ⚖

Protótipo da plataforma de educação jurídica **Aprendendo o Direito**:
trilhas de estudo, questões comentadas e jurisprudência descomplicada para
estudantes de Direito, Exame da OAB e concursos.

> O protótipo foi construído a partir das premissas registradas em
> [`discovery.md`](discovery.md). Substitua aquele arquivo pelo discovery
> original do projeto para alinhar as próximas iterações.

## Estrutura

```
├── site/               # Código do site/protótipo (HTML/CSS/JS estáticos)
│   ├── index.html      # Landing page
│   ├── app.html        # Protótipo do painel do aluno
│   ├── css/styles.css  # Design system (azul-marinho + dourado)
│   └── js/app.js       # Interações (questão do dia)
├── Dockerfile          # Imagem Nginx servindo o site
├── nginx.conf          # Configuração do servidor
└── docker-compose.yml  # Orquestração local
```

## Rodar localmente com Docker

Pré-requisito: [Docker Desktop](https://www.docker.com/products/docker-desktop/) instalado.

```bash
docker compose up -d --build
```

Acesse **http://localhost:8080** (landing page) e
**http://localhost:8080/app.html** (painel do aluno).

Para parar:

```bash
docker compose down
```

## Rodar sem Docker

Basta abrir `site/index.html` no navegador, ou servir a pasta:

```bash
cd site && python -m http.server 8080
```

## Próximos passos

- [ ] Alinhar o protótipo ao `discovery.md` original
- [ ] Autenticação e cadastro de alunos
- [ ] Backend/API para trilhas, questões e progresso
- [ ] Banco de questões real
