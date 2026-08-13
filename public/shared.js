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

  /* Resolves to { ok: true, result } or { ok: false, error }. Most callers
     fire and forget; the ones that validate input read the answer. */
  send(action, payload) {
    return fetch('/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(Object.assign({ action }, payload || {}))
    })
      .then(r => r.json())
      .catch(() => ({ ok: false, error: 'Lost the connection to the game server.' }));
  }
};

/* ------------------------------------------------------------------ icons */

/* Hand-drawn line icons instead of emoji: emoji render differently on every
   device (and some phones show them in colour, some as flat glyphs), while
   these inherit the button's colour and size exactly. */
const ICONS = {
  tv: '<rect x="2" y="7" width="20" height="13" rx="2"/><path d="M8 2.5 12 7l4-4.5"/>',
  phone: '<rect x="6" y="2" width="12" height="20" rx="2.5"/><path d="M10.5 18.6h3"/>',
  bulb: '<path d="M12 2.6a5.9 5.9 0 0 0-3.5 10.7c.6.5 1 1.2 1.1 1.9h4.8c.1-.7.5-1.4 1.1-1.9A5.9 5.9 0 0 0 12 2.6Z"/>' +
        '<path d="M9.6 18.4h4.8"/><path d="M10.6 21.4h2.8"/>',
  undo: '<path d="M4.5 10h9.5a5 5 0 0 1 0 10h-3.5"/><path d="m8.5 5.5-4 4.5 4 4.5"/>',
  more: '<circle cx="5" cy="12" r="1.9" fill="currentColor" stroke="none"/>' +
        '<circle cx="12" cy="12" r="1.9" fill="currentColor" stroke="none"/>' +
        '<circle cx="19" cy="12" r="1.9" fill="currentColor" stroke="none"/>',
  soundOn: '<path d="M3.5 9.2v5.6H7L12.5 19V5L7 9.2H3.5Z"/><path d="M16 9a4.2 4.2 0 0 1 0 6"/>' +
           '<path d="M18.8 6.4a8 8 0 0 1 0 11.2"/>',
  soundOff: '<path d="M3.5 9.2v5.6H7L12.5 19V5L7 9.2H3.5Z"/><path d="m16.5 9.5 5 5"/><path d="m21.5 9.5-5 5"/>',
  play: '<path d="M8 5.2v13.6L18.5 12 8 5.2Z" fill="currentColor"/>',
  swap: '<path d="M20 12a8 8 0 1 1-2.3-5.6"/><path d="M20 3.6V8.5h-4.9"/>',
  check: '<path d="m4.5 12.4 4.8 4.8L19.5 6.6" stroke-width="3"/>',
  plus: '<path d="M12 5v14"/><path d="M5 12h14"/>'
};

/* icon('bulb', 26) -> an svg string ready to drop into innerHTML */
function icon(name, size) {
  const px = size ? 'style="width:' + size + 'px;height:' + size + 'px"' : '';
  return '<svg class="ico" ' + px + ' viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    (ICONS[name] || '') + '</svg>';
}

/* ----------------------------------------------------------------- helpers */

/* Category, question and answer text can come from whatever the announcer
   typed on the phone, so anything heading into innerHTML gets escaped. */
function escHtml(s) {
  return String(s == null ? '' : s).replace(/[&<>"]/g, ch =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
}

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
