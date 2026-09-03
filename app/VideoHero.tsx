'use client';

import { useEffect, useRef, useState } from 'react';
import { Icone } from './ui.tsx';

/**
 * A figura do hero — o vídeo de divulgação da plataforma, em laço.
 *
 * O arquivo é gerado por `node scripts/gerar-video-hero.mjs` a partir de
 * scripts/video-hero/cena.html: é a própria interface animada com a
 * identidade do projeto, não filmagem nem banco de imagens. Mostrando só
 * telas do produto, não há pessoa retratada, nem licença a renovar — por
 * isso ele não leva o selo de conteúdo ilustrativo que os depoimentos e
 * os retratos da página inicial levam. A locução é voz sintética; a
 * procedência está em scripts/video-hero/narracao/LEIA-ME.md.
 *
 * Quatro coisas que este componente existe para resolver, e que o
 * <video autoplay> cru não resolve:
 *
 *  1. Quem pediu menos movimento no sistema não recebe vídeo rodando
 *     sozinho. O autoplay é decidido aqui, olhando prefers-reduced-motion,
 *     e não pelo atributo — atributo não sabe da preferência.
 *  2. Dá para parar. Laço de 18 s que roda sozinho sem botão de pausa
 *     reprova na WCAG 2.2.2, e incomoda quem só quer ler o hero.
 *  3. O vídeo tem narração, mas começa MUDO e não há como ser diferente:
 *     navegador nenhum toca som sem gesto do usuário. Quem quiser ouvir
 *     liga no botão de som; o vídeo volta ao início para a fala não
 *     entrar pela metade.
 *  4. Quando o navegador recusa o autoplay (política de mídia, aba em
 *     segundo plano, economia de bateria), a figura fica no pôster com o
 *     botão de play — nunca num retângulo preto.
 */
export default function VideoHero() {
  const video = useRef<HTMLVideoElement>(null);
  const [tocando, setTocando] = useState(false);
  const [comSom, setComSom] = useState(false);

  useEffect(() => {
    const v = video.current;
    if (!v) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    /* play() devolve promessa rejeitada quando o navegador barra o
       autoplay. Não é erro: é o pôster continuar aparecendo. */
    v.play().catch(() => {});
  }, []);

  const alternarPausa = () => {
    const v = video.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  const alternarSom = () => {
    const v = video.current;
    if (!v) return;
    const ligando = v.muted;
    v.muted = !v.muted;
    setComSom(!v.muted);
    if (ligando) {
      /* Ligar o som no meio do laço pegaria a narração pela metade. */
      v.currentTime = 0;
      v.play().catch(() => {});
    }
  };

  return (
    <div className="hero-figura">
      <video
        ref={video}
        className="hero-video"
        poster="/video/apresentacao.jpg"
        /* muted é o que torna o autoplay possível; loop e playsInline
           evitam a tela cheia automática do iPhone. */
        muted loop playsInline preload="auto"
        width={1280} height={960}
        onPlay={() => setTocando(true)}
        onPause={() => setTocando(false)}
        onVolumeChange={(e) => setComSom(!e.currentTarget.muted)}
        aria-label={
          'Apresentação da plataforma: aula curta em vídeo, exercício comentado logo em ' +
          'seguida, o texto original da lei na biblioteca e o progresso por área.'
        }
      >
        <source src="/video/apresentacao.mp4" type="video/mp4" />
        {/* Navegador que não conhece <video> cai aqui e mostra o pôster. */}
        <img src="/video/apresentacao.jpg" alt="Tela de uma aula da plataforma, com o player e a duração de 12 minutos." />
      </video>

      <span className="marca-agua">aula em vídeo · 8 a 15 min</span>

      <div className="hero-video-controles">
        <button
          type="button" onClick={alternarPausa}
          aria-label={tocando ? 'Pausar a apresentação' : 'Reproduzir a apresentação'}
        >
          <Icone nome={tocando ? 'pause' : 'play_arrow'} tamanho={18} />
        </button>
        <button
          type="button" onClick={alternarSom}
          aria-label={comSom ? 'Desligar o som da apresentação' : 'Ouvir a apresentação com som'}
        >
          <Icone nome={comSom ? 'volume_up' : 'volume_off'} tamanho={18} />
        </button>
      </div>
    </div>
  );
}
