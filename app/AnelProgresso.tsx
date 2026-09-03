/** Anel de progresso do painel — o design system pede indicador circular por curso. */
export function Anel({ pct, cor }: { pct: number; cor: string }) {
  const raio = 30;
  const volta = 2 * Math.PI * raio;
  return (
    <div className="anel" style={{ ['--cor-anel' as string]: cor }}>
      <svg viewBox="0 0 72 72" width="72" height="72" aria-hidden="true">
        <circle className="fundo" cx="36" cy="36" r={raio} />
        <circle
          className="frente" cx="36" cy="36" r={raio}
          strokeDasharray={volta}
          strokeDashoffset={volta * (1 - Math.min(100, Math.max(0, pct)) / 100)}
        />
      </svg>
      <span className="valor">{pct}%</span>
    </div>
  );
}
