import type { ProgressStore } from '../core/progressStore';
import { stageAt } from '../core/stageData';

const STYLES = `
  .cs-controls {
    position: fixed;
    left: 50%;
    bottom: 24px;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 16px;
    border-radius: 12px;
    background: rgba(20, 24, 28, 0.72);
    backdrop-filter: blur(6px);
    color: #f0ead8;
    font-family: system-ui, sans-serif;
    user-select: none;
    z-index: 10;
  }
  .cs-controls button {
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 50%;
    background: #f0ead8;
    color: #1a1e22;
    font-size: 14px;
    cursor: pointer;
  }
  .cs-controls input[type='range'] {
    width: min(46vw, 420px);
    accent-color: #e0a44c;
  }
  .cs-label {
    min-width: 200px;
    font-size: 13px;
    letter-spacing: 0.02em;
    white-space: nowrap;
  }
  .cs-label strong { color: #e0a44c; }
`;

export interface ControlsOptions {
  audio?: { toggleMuted(): boolean; isMuted: boolean };
}

export function createControls(
  store: ProgressStore,
  options: ControlsOptions = {},
  host: HTMLElement = document.body,
): void {
  const style = document.createElement('style');
  style.textContent = STYLES;
  document.head.appendChild(style);

  const panel = document.createElement('div');
  panel.className = 'cs-controls';

  const playButton = document.createElement('button');
  playButton.type = 'button';
  playButton.setAttribute('aria-label', 'Reproduzir/pausar evolução');

  const slider = document.createElement('input');
  slider.type = 'range';
  slider.min = '0';
  slider.max = '100';
  slider.step = '0.1';
  slider.setAttribute('aria-label', 'Progresso da cidade');

  const label = document.createElement('div');
  label.className = 'cs-label';

  panel.append(playButton, slider, label);

  if (options.audio) {
    const audio = options.audio;
    const muteButton = document.createElement('button');
    muteButton.type = 'button';
    muteButton.setAttribute('aria-label', 'Ativar/desativar som');
    muteButton.textContent = audio.isMuted ? '🔇' : '🔊';
    muteButton.addEventListener('click', () => {
      muteButton.textContent = audio.toggleMuted() ? '🔇' : '🔊';
    });
    panel.append(muteButton);
  }

  host.appendChild(panel);

  const syncPlayIcon = () => {
    playButton.textContent = store.isPlaying ? '❚❚' : '▶';
  };

  playButton.addEventListener('click', () => {
    store.toggle();
    syncPlayIcon();
  });

  slider.addEventListener('input', () => {
    store.pause();
    syncPlayIcon();
    store.set(Number(slider.value));
  });

  store.subscribe((p) => {
    slider.value = String(p);
    label.innerHTML = `<strong>${Math.round(p)}%</strong> — ${stageAt(p).name}`;
    syncPlayIcon();
  });
}
