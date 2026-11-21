import { settings } from './config/settings.js';

const SATURN_YT_ID = 'dzNvk80XY9s';

export const audioManager = {
  enabled: Boolean(settings.audioEnabled),
  _initialized: false,
  _started: false,
  _ended: false,
  _fadingOut: false,
  _pendingPlay: false,
  _isPlaying: false,
  _ready: false,
  _mode: 'none', // 'local' | 'youtube' | 'none'
  _audioEl: null,
  _player: null,
  _container: null,
  _fadeRaf: 0,
  _volume: 100,

  init() {
    if (this._initialized || !this.enabled || typeof window === 'undefined') return;
    this._initialized = true;
    this._bindLifecycleEvents();
    this._setupSource();
  },

  _isBackgrounded() {
    if (typeof document === 'undefined') return false;
    return Boolean(document.hidden) || document.visibilityState !== 'visible';
  },

  _bindLifecycleEvents() {
    const onVisibility = () => {
      if (this._isBackgrounded()) {
        this._pauseForBackground();
      } else {
        this._resumeFromBackground();
      }
    };

    document.addEventListener('visibilitychange', onVisibility);
    document.addEventListener('freeze', () => this._pauseForBackground());
    window.addEventListener('pagehide', () => this._pauseForBackground());
    window.addEventListener('pageshow', () => {
      if (!this._isBackgrounded()) {
        this._resumeFromBackground();
      }
    });
  },

  async _setupSource() {
    try {
      const res = await fetch('/api/audio-source', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data && data.localUrl) {
          this._initLocalAudio(data.localUrl);
          return;
        }
      }
    } catch (_err) {
      // Fallback to YouTube player below
    }
    this._initYouTubeAudio();
  },

  _initLocalAudio(url) {
    const audio = new Audio(url);
    audio.loop = true;
    audio.preload = 'auto';
    audio.volume = 1;
    audio.addEventListener('playing', () => {
      if (this._isBackgrounded() || this._ended) {
        audio.pause();
        this._isPlaying = false;
        return;
      }
      this._isPlaying = true;
    });
    audio.addEventListener('pause', () => {
      this._isPlaying = false;
    });
    audio.addEventListener('ended', () => {
      if (this._started && !this._ended && !this._isBackgrounded()) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }
    });
    this._audioEl = audio;
    this._mode = 'local';
    this._ready = true;
    if (this._pendingPlay && !this._isBackgrounded() && !this._ended) {
      this._attemptPlay();
    }
  },

  _initYouTubeAudio() {
    this._mode = 'youtube';
    this._ensureHiddenContainer();

    const createPlayer = () => {
      if (this._player || !window.YT || typeof window.YT.Player !== 'function') return;
      const mountEl = document.createElement('div');
      mountEl.id = 'bg-music-player';
      this._container.appendChild(mountEl);

      this._player = new window.YT.Player(mountEl, {
        width: '200',
        height: '200',
        videoId: SATURN_YT_ID,
        playerVars: {
          autoplay: 0,
          controls: 0,
          disablekb: 1,
          fs: 0,
          iv_load_policy: 3,
          modestbranding: 1,
          rel: 0,
          playsinline: 1,
          loop: 1,
          playlist: SATURN_YT_ID,
          origin: window.location.origin
        },
        events: {
          onReady: () => {
            this._ready = true;
            const iframe = this._player && typeof this._player.getIframe === 'function'
              ? this._player.getIframe()
              : null;
            if (iframe) {
              iframe.setAttribute('aria-hidden', 'true');
              iframe.setAttribute('tabindex', '-1');
              iframe.style.pointerEvents = 'none';
            }
            if (this._pendingPlay && !this._isBackgrounded() && !this._ended) {
              this._attemptPlay();
            }
          },
          onStateChange: event => {
            const YTState = window.YT && window.YT.PlayerState ? window.YT.PlayerState : {};
            if (event.data === YTState.PLAYING) {
              if (this._isBackgrounded() || this._ended) {
                try { this._player.pauseVideo(); } catch (_e) {}
                this._isPlaying = false;
                return;
              }
              this._isPlaying = true;
              this._pendingPlay = false;
            } else if (event.data === YTState.PAUSED) {
              this._isPlaying = false;
            } else if (event.data === YTState.ENDED) {
              this._isPlaying = false;
              if (this._started && !this._ended && !this._isBackgrounded()) {
                try {
                  this._player.seekTo(0, true);
                  this._player.playVideo();
                } catch (_e) {}
              }
            }
          },
          onError: () => {
            this._isPlaying = false;
          }
        }
      });
    };

    if (window.YT && typeof window.YT.Player === 'function') {
      createPlayer();
      return;
    }

    const prevReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      if (typeof prevReady === 'function') {
        try { prevReady(); } catch (_e) {}
      }
      createPlayer();
    };

    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.async = true;
      document.head.appendChild(tag);
    }
  },

  _ensureHiddenContainer() {
    if (this._container || typeof document === 'undefined') return;
    const el = document.createElement('div');
    el.setAttribute('aria-hidden', 'true');
    el.style.cssText = [
      'position:fixed',
      'left:-9999px',
      'top:-9999px',
      'width:200px',
      'height:200px',
      'opacity:0.001',
      'pointer-events:none',
      'overflow:hidden',
      'z-index:-1'
    ].join(';');
    document.body.appendChild(el);
    this._container = el;
  },

  start() {
    if (!this.enabled || this._ended) return;
    this._started = true;
    this._pendingPlay = true;
    this._fadingOut = false;
    this._volume = 100;
    if (!this._initialized) this.init();
    if (this._isBackgrounded()) return;
    this._attemptPlay();
  },

  ensurePlaying() {
    if (!this.enabled || !this._started || this._ended || this._fadingOut) return;
    if (this._isBackgrounded() || this._isPlaying) return;
    this._pendingPlay = true;
    this._attemptPlay();
  },

  _attemptPlay() {
    if (!this._ready || this._ended || this._isBackgrounded()) return;

    if (this._mode === 'local' && this._audioEl) {
      this._audioEl.volume = Math.max(0, Math.min(1, this._volume / 100));
      this._audioEl.play().then(() => {
        this._pendingPlay = false;
        this._isPlaying = true;
      }).catch(() => {
        // Retry on next user gesture if blocked
      });
      return;
    }

    if (this._mode === 'youtube' && this._player) {
      try {
        if (typeof this._player.unMute === 'function') this._player.unMute();
        if (typeof this._player.setVolume === 'function') this._player.setVolume(this._volume);
        if (typeof this._player.playVideo === 'function') this._player.playVideo();
      } catch (_e) {}
    }
  },

  _pauseForBackground() {
    this._isPlaying = false;
    if (this._mode === 'local' && this._audioEl) {
      try { this._audioEl.pause(); } catch (_e) {}
    } else if (this._mode === 'youtube' && this._player && typeof this._player.pauseVideo === 'function') {
      try { this._player.pauseVideo(); } catch (_e) {}
    }
  },

  _resumeFromBackground() {
    if (!this._started || this._ended || this._fadingOut || this._isBackgrounded()) return;
    this._attemptPlay();
  },

  fadeOutAndStop(durationMs = 3400) {
    if (!this._started || this._ended || this._fadingOut) return;
    this._fadingOut = true;
    this._pendingPlay = false;
    if (this._fadeRaf) cancelAnimationFrame(this._fadeRaf);

    const startVol = this._volume;
    const startTime = performance.now();

    const step = now => {
      const k = Math.min(1, (now - startTime) / Math.max(100, durationMs));
      const eased = 1 - Math.pow(k, 1.5);
      this._volume = Math.max(0, Math.round(startVol * eased));

      if (this._mode === 'local' && this._audioEl) {
        this._audioEl.volume = this._volume / 100;
      } else if (this._mode === 'youtube' && this._player && typeof this._player.setVolume === 'function') {
        try { this._player.setVolume(this._volume); } catch (_e) {}
      }

      if (k < 1) {
        this._fadeRaf = requestAnimationFrame(step);
      } else {
        this._fadeRaf = 0;
        this.stop();
      }
    };

    this._fadeRaf = requestAnimationFrame(step);
  },

  playScene() {},
  playCue() {},

  stop() {
    this._ended = true;
    this._fadingOut = false;
    this._pendingPlay = false;
    this._isPlaying = false;
    if (this._fadeRaf) {
      cancelAnimationFrame(this._fadeRaf);
      this._fadeRaf = 0;
    }
    if (this._mode === 'local' && this._audioEl) {
      try {
        this._audioEl.pause();
        this._audioEl.currentTime = 0;
      } catch (_e) {}
    } else if (this._mode === 'youtube' && this._player) {
      try {
        if (typeof this._player.pauseVideo === 'function') this._player.pauseVideo();
      } catch (_e) {}
    }
  },

  destroy() {
    this.stop();
    if (this._player && typeof this._player.destroy === 'function') {
      try { this._player.destroy(); } catch (_e) {}
      this._player = null;
    }
    if (this._container && this._container.parentNode) {
      this._container.parentNode.removeChild(this._container);
      this._container = null;
    }
    this._audioEl = null;
    this._ready = false;
  }
};
