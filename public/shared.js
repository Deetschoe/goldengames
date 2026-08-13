/* Golden Games - shared client helpers: password gate, live feed, audio. */

const PASSWORD = 'Schoening';

const Gate = {
  ok() {
    return sessionStorage.getItem('gg-auth') === 'yes';
  },
  unlock(value) {
    if (value.trim().toLowerCase() !== PASSWORD.toLowerCase()) return false;
    sessionStorage.setItem('gg-auth', 'yes');
    return true;
  },
  /* Bounce back to the door if someone deep-links /play or /announcer. */
  require() {
    if (!this.ok()) {
      location.href = '/';
      return false;
    }
    return true;
  }
};

/* ------------------------------------------------------------------ audio */

const SFX = {
  correct: 'sfx/correct.mp3',
  wrong: 'sfx/wrong.mp3',
  roundwin: 'sfx/round%20win.mp3',
  intro: 'sfx/Intro%20when%20game%20starts.mp3'
};

const Audio_ = {
  clips: {},
  unlocked: false,
  muted: false,

  preload() {
    for (const key in SFX) {
      const a = new Audio(SFX[key]);
      a.preload = 'auto';
      this.clips[key] = a;
    }
  },

  /* Browsers block audio until the page has seen a real tap. The password
     screen gives us that gesture, so we prime every clip there. */
  unlock() {
    if (this.unlocked) return;
    this.unlocked = true;
    for (const key in this.clips) {
      const a = this.clips[key];
      a.volume = 0;
      a.play().then(() => {
        a.pause();
        a.currentTime = 0;
        a.volume = 1;
      }).catch(() => {
        a.volume = 1;
      });
    }
  },

  play(name) {
    if (this.muted) return;
    const base = this.clips[name];
    if (!base) return;
    // clone so rapid-fire reveals overlap instead of cutting each other off
    const clip = base.cloneNode();
    clip.volume = 1;
    clip.play().catch(() => {});
    return clip;
  },

  stopAll() {
    for (const key in this.clips) {
      try {
        this.clips[key].pause();
        this.clips[key].currentTime = 0;
      } catch (_) {}
    }
  }
};

Audio_.preload();

/* ------------------------------------------------------------- live feed */

const Live = {
  state: null,
  lastSeq: 0,
  onState: null,
  onEvent: null,

  connect() {
    const src = new EventSource('/events');
    src.onmessage = e => {
      const next = JSON.parse(e.data);
      const first = this.state === null;
      this.state = next;
      if (this.onState) this.onState(next);
      // On a fresh connect we sync to the current seq without replaying
      // whatever animation happened to be last, so a phone that reconnects
      // mid-round doesn't re-fire a strike sound.
      if (first) {
        this.lastSeq = next.seq;
      } else if (next.event && next.event.seq > this.lastSeq) {
        this.lastSeq = next.event.seq;
        if (this.onEvent) this.onEvent(next.event, next);
      }
    };
    src.onerror = () => { /* EventSource retries on its own */ };
  },

  send(action, payload) {
    return fetch('/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.assign({ action }, payload || {}))
    }).catch(() => {});
  }
};

/* ----------------------------------------------------------------- helpers */

/* "SNICKERS" with 4 letters shown -> "SNIC _ _ _ _"
   Word gaps use non-breaking spaces; plain runs of spaces collapse in HTML
   and the break between words would disappear. */
function maskAnswer(text, shown) {
  const chars = text.toUpperCase().split('');
  let out = '';
  for (let i = 0; i < chars.length; i++) {
    if (chars[i] === ' ') out += '   ';
    else out += i < shown ? chars[i] : ' _';
  }
  return out.trim();
}
