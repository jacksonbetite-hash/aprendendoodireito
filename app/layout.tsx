import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Aprendendo o Direito — entenda Direito sem decorar',
    template: '%s | Aprendendo o Direito',
  },
  description:
    'Transformamos conceitos complexos em uma jornada de aprendizado visual, empática e focada no que realmente importa para a sua compreensão.',
};

/* Montserrat nos títulos, Quicksand no texto, Lora só na lei.
   Os ícones são SVG embutido (app/ui.tsx), sem dependência de rede. */
const FONTES =
  'https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700' +
  '&family=Quicksand:wght@400;500;600;700' +
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
