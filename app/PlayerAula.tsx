'use client';

import { useEffect, useRef, useState } from 'react';
import { Icone } from './ui.tsx';

/**
 * O player da aula.
 *
 * `src` já vem assinado pelo servidor (lib/video.ts) — este componente não
 * sabe nada de licença, e nunca recebe o caminho real do arquivo.
 *
 * Três coisas que ele resolve além de mostrar o vídeo:
 *
 *  1. MARCA D'ÁGUA que anda. O nome e o e-mail parcial do aluno flutuam
 *     por cima da imagem, trocando de canto a cada 40 s. Fixa no canto,
 *     bastaria cortar a borda para limpar; andando, some junto com metade
 *     da aula. Isso não impede a cópia — nada impede, fora DRM — mas dá
 *     dono a ela, que é o que faz alguém pensar duas vezes antes de
 *     mandar para o grupo do WhatsApp.
 *
 *  2. RETOMADA. Volta de onde parou e vai gravando o avanço em
 *     progresso_aula, que é a fonte do "continuar de onde parou" do
 *     painel. Grava a cada 15 s e ao sair — não a cada quadro.
 *
 *  3. TOKEN VENCIDO. A URL assinada dura 6 horas. Quem deixa a aba aberta
 *     de um dia para o outro recebe 403 no meio do vídeo; em vez de um
 *     retângulo preto, aparece o convite para recarregar.
 *
 * Sobre `controlsList` e o menu de contexto: são lombadas, não muros.
 * Escondem o botão "baixar" de quem não pensou em baixar. Quem abre o
 * DevTools continua achando a URL — e é para isso que ela expira e leva
 * o nome do aluno dentro.
 */

const CANTOS = ['ca-ne', 'ca-nw', 'ca-se', 'ca-sw'] as const;
const INTERVALO_MARCA_MS = 40_000;
const INTERVALO_PROGRESSO_MS = 15_000;

export interface PlayerAulaProps {
  aulaId: number;
  src: string;
  poster?: string | null;
  titulo: string;
  duracaoSegundos: number;
  /** Nome + e-mail parcial do aluno. Vazio no visitante da amostra grátis. */
  marca: string | null;
  /** Segundo em que o aluno parou da última vez. */
  iniciarEm?: number;
  /** Visitante não cadastrado não tem onde gravar progresso. */
  gravarProgresso: boolean;
}

export default function PlayerAula({
  aulaId, src, poster, titulo, duracaoSegundos,
  marca, iniciarEm = 0, gravarProgresso,
}: PlayerAulaProps) {
  const video = useRef<HTMLVideoElement>(null);
  const [canto, setCanto] = useState(0);
  const [expirou, setExpirou] = useState(false);
  /* Guarda o último segundo enviado para não repetir POST quando o aluno
     pausa e despausa sem sair do lugar. */
  const ultimoEnviado = useRef(-1);

  // ---- Marca d'água itinerante ----
  useEffect(() => {
    if (!marca) return;
    const id = setInterval(
      () => setCanto((c) => (c + 1) % CANTOS.length),
      INTERVALO_MARCA_MS,
    );
    return () => clearInterval(id);
  }, [marca]);

  // ---- Retomada ----
  useEffect(() => {
    const v = video.current;
    // Perto demais do fim é recomeço, não retomada.
    if (!v || iniciarEm <= 0 || iniciarEm >= duracaoSegundos - 15) return;
    v.currentTime = iniciarEm;
  }, [iniciarEm, duracaoSegundos]);

  // ---- Gravação do avanço ----
  useEffect(() => {
    if (!gravarProgresso) return;
    const v = video.current;
    if (!v) return;

    const enviar = (usarBeacon = false) => {
      const segundos = Math.floor(v.currentTime);
      if (segundos === ultimoEnviado.current || segundos <= 0) return;
      ultimoEnviado.current = segundos;

      const corpo = JSON.stringify({
        aulaId, segundos,
        // "Assistiu" é chegar aos 92%: ninguém vê os créditos.
        concluida: segundos >= duracaoSegundos * 0.92,
      });

      // Ao fechar a aba o fetch normal é cancelado no meio; sendBeacon é
      // entregue pelo navegador depois que a página já morreu.
      if (usarBeacon && navigator.sendBeacon) {
        navigator.sendBeacon('/api/progresso', new Blob([corpo], { type: 'application/json' }));
        return;
      }
      fetch('/api/progresso', {
        method: 'POST', body: corpo,
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
      }).catch(() => {});
    };

    const relogio = setInterval(() => { if (!v.paused) enviar(); }, INTERVALO_PROGRESSO_MS);
    const aoPausar = () => enviar();
    const aoSair = () => enviar(true);

    v.addEventListener('pause', aoPausar);
    v.addEventListener('ended', aoPausar);
    // `pagehide` pega o que `beforeunload` não pega no iOS.
    window.addEventListener('pagehide', aoSair);

    return () => {
      clearInterval(relogio);
      v.removeEventListener('pause', aoPausar);
      v.removeEventListener('ended', aoPausar);
      window.removeEventListener('pagehide', aoSair);
      enviar(true);
    };
  }, [aulaId, duracaoSegundos, gravarProgresso]);

  if (expirou) {
    return (
      <div className="player bloqueado">
        <div className="cadeado">
          <Icone nome="timer" />
          <p>
            O endereço deste vídeo venceu — ele dura algumas horas por segurança.
            Recarregue a página para continuar de onde parou.
          </p>
          <button
            type="button" className="btn btn-primario btn-sm"
            style={{ marginTop: 12 }} onClick={() => location.reload()}
          >
            Recarregar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="player player-video">
      <video
        ref={video}
        controls
        playsInline
        preload="metadata"
        poster={poster ?? undefined}
        controlsList="nodownload noremoteplayback"
        disablePictureInPicture
        onContextMenu={(e) => e.preventDefault()}
        onError={() => {
          // O `error` do <video> não conta o status HTTP. Perguntamos ao
          // servidor por HEAD para distinguir token vencido de arquivo
          // com defeito — só o primeiro tem conserto pelo aluno.
          fetch(src, { method: 'HEAD' })
            .then((r) => { if (r.status === 401 || r.status === 403) setExpirou(true); })
            .catch(() => {});
        }}
        aria-label={`Vídeo da aula: ${titulo}`}
      >
        <source src={src} />
        <p>
          Seu navegador não toca este vídeo.{' '}
          <a href={src}>Abra o arquivo diretamente</a>.
        </p>
      </video>

      {marca && (
        <span className={`marca-agua-video ${CANTOS[canto]}`} aria-hidden="true">
          {marca}
        </span>
      )}
    </div>
  );
}
