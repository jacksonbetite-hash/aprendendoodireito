import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Aprendendo o Direito — entender Direito sem precisar decorar',
    template: '%s | Aprendendo o Direito',
  },
  description:
    'Aula curta, linguagem de gente, a lei ao lado e um exercício no final. Estude Direito por matéria, do jeito que cabe na sua rotina.',
};

const FONTES =
  'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Nunito+Sans:wght@400;600;700;800&display=swap';

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
