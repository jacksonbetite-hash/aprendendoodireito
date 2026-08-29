# Discovery — Aprendendo o Direito

> **ATENÇÃO:** o arquivo `discovery.md` original está na máquina local
> (`C:\Users\Usuario\Documents\Aprendendoodireito\discovery.md`) e não pôde ser
> acessado a partir do ambiente remoto. Este documento registra as **premissas
> assumidas** para construir o primeiro protótipo. Substitua este arquivo pelo
> discovery original (ou cole o conteúdo dele) para que o protótipo seja
> alinhado ao que foi realmente especificado.

## Visão do produto (premissa)

**Aprendendo o Direito** é uma plataforma web de educação jurídica voltada a
estudantes de Direito, concurseiros e candidatos ao Exame da OAB, com linguagem
acessível e trilhas de estudo estruturadas.

## Público-alvo (premissa)

- Estudantes de graduação em Direito
- Bacharéis se preparando para o Exame da OAB
- Concurseiros de carreiras jurídicas
- Público leigo que quer entender seus direitos

## Funcionalidades do protótipo

1. **Landing page** — apresentação da plataforma, áreas do Direito, planos e CTA
2. **Painel do aluno (protótipo navegável)** — trilha de estudos, progresso,
   banco de questões comentadas e resumos de jurisprudência

## Identidade visual (premissa)

- Tom sóbrio e confiável: azul-marinho profundo + dourado (referência ao
  universo jurídico), tipografia serifada para títulos
- Layout limpo, com bastante respiro, mobile-first

## Stack do protótipo

- HTML/CSS/JS estáticos (sem framework, fácil de evoluir)
- Servido por Nginx em container Docker (`Dockerfile` + `docker-compose.yml`)
