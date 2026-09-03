import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Aprimore o Saber — aprenda de verdade, sem decorar',
    template: '%s | Aprimore o Saber',
  },
  description:
    'Transformamos assuntos complexos em uma jornada de aprendizado visual, objetiva e focada no que realmente importa para a sua compreensão.',
};

/* Lexend em toda a interface — uma família só, do rótulo de 12px ao título de
   56px, com pesos de 300 a 900. Lora entra apenas dentro de .texto-lei, onde
   citação longa de fonte primária pede serifada.
   Os ícones são SVG embutido (app/ui.tsx), sem dependência de rede. */
const FONTES =
  'https://fonts.googleapis.com/css2?family=Lexend:wght@300;400;500;600;700;800;900' +
  '&family=Lora:ital,wght@0,400;0,500;1,400' +
  '&display=swap';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href={FONTES} />
      </head>
      <body>{children}</body>
    </html>
  );
}
