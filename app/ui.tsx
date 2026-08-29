import Link from 'next/link';

/**
 * Elementos visuais puros — sem acesso a servidor, seguros para
 * componente cliente. Se ficassem junto do cabeçalho (que lê a sessão),
 * o driver do banco iria parar no bundle do navegador.
 */

/**
 * Ícones em SVG embutido.
 *
 * O design system pede traço arredondado e peso consistente. Fonte de
 * ícones foi descartada de propósito: quando ela falha em carregar, a
 * tela mostra o NOME do ícone em texto cru ("play_circle") — pior que
 * não mostrar nada. SVG embutido não depende de rede.
 */
const TRACOS: Record<string, React.ReactNode> = {
  balance: <><path d="M12 3v18M7 21h10M12 6 4 8m8-2 8 2" /><path d="M4 8 1.5 14a3.5 3.5 0 0 0 5 0L4 8Z" /><path d="M20 8l-2.5 6a3.5 3.5 0 0 0 5 0L20 8Z" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-3.6-3.6" /></>,
  play_arrow: <path d="M8 5.5v13l11-6.5-11-6.5Z" />,
  play_circle: <><circle cx="12" cy="12" r="9" /><path d="M10.5 8.8v6.4l5-3.2-5-3.2Z" /></>,
  menu_book: <><path d="M12 6.5C10.6 5.3 8.6 4.5 6 4.5c-1 0-2 .1-2.8.3v13c.9-.2 1.8-.3 2.8-.3 2.6 0 4.6.8 6 2 1.4-1.2 3.4-2 6-2 1 0 1.9.1 2.8.3v-13c-.9-.2-1.8-.3-2.8-.3-2.6 0-4.6.8-6 2Z" /><path d="M12 6.5v13" /></>,
  quiz: <><rect x="3" y="4" width="18" height="16" rx="3" /><path d="M9.2 9.6a2.8 2.8 0 1 1 3.6 2.7c-.5.2-.8.6-.8 1.1v.4" /><circle cx="12" cy="16.6" r=".9" fill="currentColor" stroke="none" /></>,
  arrow_forward: <><path d="M4 12h15" /><path d="m13 6 6 6-6 6" /></>,
  arrow_back: <><path d="M20 12H5" /><path d="m11 6-6 6 6 6" /></>,
  check: <path d="m4.5 12.5 5 5 10-11" />,
  check_circle: <><circle cx="12" cy="12" r="9" /><path d="m8 12.3 2.7 2.7L16 9.5" /></>,
  lock: <><rect x="4.5" y="10" width="15" height="10.5" rx="2.5" /><path d="M8 10V7.5a4 4 0 0 1 8 0V10" /></>,
  chevron_right: <path d="m9.5 5.5 6.5 6.5-6.5 6.5" />,
  lightbulb: <><path d="M9.2 17.5h5.6" /><path d="M10 21h4" /><path d="M12 3a6 6 0 0 0-3.6 10.8c.5.4.8 1 .8 1.6v.6h5.6v-.6c0-.6.3-1.2.8-1.6A6 6 0 0 0 12 3Z" /></>,
  edit_note: <><path d="M3.5 6.5h13M3.5 11.5h9M3.5 16.5h6" /><path d="m20.5 10-6.5 6.5-3 .8.8-3L18.3 8a1.6 1.6 0 0 1 2.2 2.2Z" /></>,
  dashboard: <><rect x="3.5" y="3.5" width="7" height="7" rx="2" /><rect x="13.5" y="3.5" width="7" height="4.5" rx="2" /><rect x="3.5" y="13.5" width="7" height="7" rx="2" /><rect x="13.5" y="11" width="7" height="9.5" rx="2" /></>,
  gavel: <><path d="m14.5 8.5-6 6" /><rect x="12.6" y="3.2" width="6.6" height="4.6" rx="1.6" transform="rotate(45 15.9 5.5)" /><rect x="4.8" y="11" width="6.6" height="4.6" rx="1.6" transform="rotate(45 8.1 13.3)" /><path d="M3.5 20.5h9" /></>,
  loyalty: <><path d="m11 3.5-7.5 7.5a2 2 0 0 0 0 2.8l6.7 6.7a2 2 0 0 0 2.8 0l7.5-7.5V5.5a2 2 0 0 0-2-2H11Z" /><circle cx="16.6" cy="7.4" r="1.5" /></>,
  settings: <><circle cx="12" cy="12" r="3.2" /><path d="M19.5 12a7.5 7.5 0 0 0-.1-1.2l2-1.5-2-3.5-2.4 1a7.5 7.5 0 0 0-2-1.2l-.4-2.6h-4l-.4 2.6c-.7.3-1.4.7-2 1.2l-2.4-1-2 3.5 2 1.5a7.5 7.5 0 0 0 0 2.4l-2 1.5 2 3.5 2.4-1c.6.5 1.3.9 2 1.2l.4 2.6h4l.4-2.6c.7-.3 1.4-.7 2-1.2l2.4 1 2-3.5-2-1.5c.1-.4.1-.8.1-1.2Z" /></>,
  logout: <><path d="M14.5 8V5.5a2 2 0 0 0-2-2h-6a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V16" /><path d="M10 12h10.5" /><path d="m17.5 8.5 3.5 3.5-3.5 3.5" /></>,
  notifications: <><path d="M18 9a6 6 0 1 0-12 0c0 5-2 6.5-2 6.5h16S18 14 18 9Z" /><path d="M13.7 19a2 2 0 0 1-3.4 0" /></>,
  school: <><path d="m3 9 9-4.5L21 9l-9 4.5L3 9Z" /><path d="M7 11.2V16c0 1.4 2.2 2.6 5 2.6s5-1.2 5-2.6v-4.8" /></>,
  bolt: <path d="M13.5 3 5.5 13.5h5L10 21l8-10.5h-5L13.5 3Z" />,
  replay: <><path d="M12 5V2L8 5.5 12 9V6a6 6 0 1 1-6 6" /></>,
  star: <path d="m12 4 2.5 5.2 5.5.8-4 3.9 1 5.6-5-2.7-5 2.7 1-5.6-4-3.9 5.5-.8L12 4Z" />,
  edit: <><path d="M4 20h4.2l10.4-10.4a2 2 0 0 0 0-2.8l-1.4-1.4a2 2 0 0 0-2.8 0L4 15.8V20Z" /><path d="m14.5 6.5 3 3" /></>,
  picture_as_pdf: <><rect x="4" y="3" width="13" height="18" rx="2.5" /><path d="M7.5 12.5h1.2a1.2 1.2 0 0 0 0-2.4H7.5v5" /><path d="M12.5 10.1v5h1a1.6 1.6 0 0 0 1.6-1.6v-1.8a1.6 1.6 0 0 0-1.6-1.6h-1Z" /></>,
  library_books: <><rect x="7" y="3.5" width="13" height="14" rx="2.5" /><path d="M4 7v11.5a2 2 0 0 0 2 2h11" /><path d="M10.5 7.5h6M10.5 11h6" /></>,
  schedule: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7v5.3l3.3 2" /></>,
  waves: <><path d="M2.5 8c2 0 2-1.6 4.8-1.6S9.3 8 12 8s2-1.6 4.7-1.6S19.5 8 21.5 8" /><path d="M2.5 13c2 0 2-1.6 4.8-1.6S9.3 13 12 13s2-1.6 4.7-1.6S19.5 13 21.5 13" /><path d="M2.5 18c2 0 2-1.6 4.8-1.6S9.3 18 12 18s2-1.6 4.7-1.6S19.5 18 21.5 18" /></>,
  auto_awesome: <><path d="m12 3 1.9 4.6L18.5 9.5l-4.6 1.9L12 16l-1.9-4.6L5.5 9.5l4.6-1.9L12 3Z" /><path d="m18.5 15.5.9 2.1 2.1.9-2.1.9-.9 2.1-.9-2.1-2.1-.9 2.1-.9.9-2.1Z" /></>,
  celebration: <><path d="M3.5 20.5 8 8l8 8-12.5 4.5Z" /><path d="M13.5 6.5c.6-1.4 2-2 3.4-1.4M16.5 3.2c.3.9 0 1.9-.8 2.4M19.5 8.5c1.4-.6 2-2 1.4-3.4M20.8 12.5c-.9-.3-1.9 0-2.4.8" /></>,
  error: <><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5v5.2" /><circle cx="12" cy="16.2" r=".9" fill="currentColor" stroke="none" /></>,
  remove: <path d="M6 12h12" />,
  admin_panel_settings: <><path d="M12 3 5 5.6v5.2c0 4.2 2.9 8.1 7 9.2 1-.3 1.9-.7 2.7-1.3" /><circle cx="17.5" cy="16.5" r="2" /><path d="M17.5 20c-1.6 0-3 .8-3 1.5h6c0-.7-1.4-1.5-3-1.5Z" /></>,
  payments: <><rect x="2.5" y="6.5" width="15" height="10" rx="2.5" /><circle cx="10" cy="11.5" r="2.2" /><path d="M6.5 20h12a3 3 0 0 0 3-3V9.5" /></>,
  verified_user: <><path d="M12 3 5 5.6v5.2c0 4.4 3 8.5 7 9.5 4-1 7-5.1 7-9.5V5.6L12 3Z" /><path d="m9 11.8 2.2 2.2L15.2 10" /></>,
  group: <><circle cx="9" cy="8.5" r="3.2" /><path d="M3 19.5c0-2.8 2.7-4.5 6-4.5s6 1.7 6 4.5" /><path d="M16 6.2a3.2 3.2 0 0 1 0 6.1M17.5 15.4c2 .6 3.5 1.9 3.5 4.1" /></>,
  account_balance: <><path d="M3.5 9.5h17L12 4 3.5 9.5Z" /><path d="M6 12v6M10 12v6M14 12v6M18 12v6" /><path d="M3.5 20.5h17" /></>,
  public: <><circle cx="12" cy="12" r="8.5" /><path d="M3.6 9.5h16.8M3.6 14.5h16.8" /><path d="M12 3.5c2 2.3 3 5.3 3 8.5s-1 6.2-3 8.5c-2-2.3-3-5.3-3-8.5s1-6.2 3-8.5Z" /></>,
  handshake: <><path d="m9 12.5 2.2 2.2a1.6 1.6 0 0 0 2.3 0l4.5-4.5" /><path d="M3 9.5 6.5 6h4L13 8.2 10.6 10 9 8.5 6.2 11" /><path d="M13.5 6h4L21 9.5v5L18 17.5l-4.5-4.5" /><path d="M3 9.5v5L6 17.5" /></>,
  work: <><rect x="3" y="7" width="18" height="13" rx="2.5" /><path d="M9 7V5.5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2V7" /></>,
  description: <><path d="M14 3.5H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.5L14 3.5Z" /><path d="M13.5 3.8V9h5" /><path d="M8.5 13h7M8.5 16.5h5" /></>,
  workspace_premium: <><circle cx="12" cy="9" r="5.5" /><path d="m8.5 13.5-1.5 7 5-2.4 5 2.4-1.5-7" /></>,
  timer: <><circle cx="12" cy="13.5" r="7" /><path d="M12 9.5v4M9.5 3.5h5" /></>,
};

export function Icone(
  { nome, tamanho = 22, className }: { nome: string; tamanho?: number; className?: string },
) {
  const traco = TRACOS[nome];
  if (!traco) return null;              // nunca mostra o nome do ícone em texto
  return (
    <svg
      className={className ? `ico ${className}` : 'ico'}
      width={tamanho} height={tamanho} viewBox="0 0 24 24"
      fill="none" stroke="currentColor" strokeWidth="1.7"
      strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" focusable="false"
    >
      {traco}
    </svg>
  );
}

export function Marca({ href = '/' }: { href?: string }) {
  return (
    <Link className="marca" href={href}>
      <span className="simbolo mono"><Icone nome="balance" tamanho={22} /></span>
      <span className="rotulo">Aprendendo o Direito</span>
    </Link>
  );
}
