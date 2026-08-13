/*
 * Golden Games - live session server
 *
 * Zero dependencies. Serves the static site and holds the ONE game session
 * in memory. Clients receive state over Server-Sent Events and send actions
 * over POST /action.
 *
 *   node server.js
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const PORT = process.env.PORT || 3000;
const PUBLIC_DIR = path.join(__dirname, 'public');
const DATA_DIR = path.join(__dirname, 'data');
const CUSTOM_FILE = path.join(DATA_DIR, 'custom-questions.json');
const TOTAL_ROUNDS = 6;

// ---------------------------------------------------------------- questions

// questions.js is a browser file (`const QUESTIONS = [...]`) so we eval it
// here rather than keeping a second copy in sync.
function loadQuestions() {
  const src = fs.readFileSync(path.join(PUBLIC_DIR, 'questions.js'), 'utf8');
  const sandbox = {};
  new Function('exports', src + '\nexports.QUESTIONS = QUESTIONS;')(sandbox);
  return sandbox.QUESTIONS;
}

let BUILTIN_QUESTIONS = [];
try {
  BUILTIN_QUESTIONS = loadQuestions();
} catch (err) {
  console.error('Could not load public/questions.js:', err.message);
}

const BUILTIN_NAMES = new Set(BUILTIN_QUESTIONS.map(q => q.category));

// Categories the announcer wrote on the phone, kept in data/custom-questions.json.
// NOTE: a container filesystem is wiped on redeploy. On Railway this file only
// survives if a volume is mounted at /app/data - otherwise treat it as a
// scratchpad and commit the export to the repo to keep a category for good.
let CUSTOM_CATEGORIES = [];
let ALL_QUESTIONS = [];

function loadCustom() {
  try {
    const parsed = JSON.parse(fs.readFileSync(CUSTOM_FILE, 'utf8'));
    return Array.isArray(parsed) ? parsed.filter(c => c && c.name && Array.isArray(c.questions)) : [];
  } catch (_) {
    return [];               // missing or unreadable: start empty, never crash
  }
}

function saveCustom() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(CUSTOM_FILE, JSON.stringify(CUSTOM_CATEGORIES, null, 2));
}

function rebuildQuestions() {
  ALL_QUESTIONS = BUILTIN_QUESTIONS.slice();
  CUSTOM_CATEGORIES.forEach(c => { ALL_QUESTIONS = ALL_QUESTIONS.concat(c.questions); });
}

CUSTOM_CATEGORIES = loadCustom();
rebuildQuestions();

/* Every category the setup screens can offer, with how many questions sit
   behind it. Built-ins first, then whatever the announcer has written. */
function catalog() {
  const counts = new Map();
  ALL_QUESTIONS.forEach(q => counts.set(q.category, (counts.get(q.category) || 0) + 1));
  const out = [];
  counts.forEach((count, name) => out.push({ name, count, custom: !BUILTIN_NAMES.has(name) }));
  return out;
}

/* A plausible survey curve for answers whose points were left blank: the top
   answer takes the biggest share and the rest fall away, summing to ~100. */
function spreadPoints(n) {
  const weights = [];
  for (let i = 0; i < n; i++) weights.push(Math.pow(0.66, i));
  const total = weights.reduce((a, b) => a + b, 0);
  return weights.map(w => Math.max(1, Math.round((w / total) * 100)));
}

/* Turns whatever the phone posted into questions the board can render, or
   returns an error to show the announcer. Everything here is untrusted: it
   arrives over the network and gets written to disk. */
function normalizeCategory(rawName, rawQuestions) {
  const name = String(rawName == null ? '' : rawName).trim().replace(/\s+/g, ' ').slice(0, 40);
  if (name.length < 2) return { error: 'Give the category a name.' };
  if (BUILTIN_NAMES.has(name)) return { error: '"' + name + '" is already a built-in category.' };
  if (!Array.isArray(rawQuestions) || !rawQuestions.length) return { error: 'Add at least one question.' };
  if (rawQuestions.length > 200) return { error: 'That is more than 200 questions.' };

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'custom';
  const questions = [];

  for (let i = 0; i < rawQuestions.length; i++) {
    const raw = rawQuestions[i] || {};
    const text = String(raw.text || raw.question || '').trim().replace(/\s+/g, ' ').slice(0, 200);
    if (!text) return { error: 'Question ' + (i + 1) + ' has no text.' };

    let answers = (Array.isArray(raw.answers) ? raw.answers : [])
      .map(a => (typeof a === 'string' ? { text: a } : (a || {})))
      .map(a => ({
        text: String(a.text || '').trim().replace(/\s+/g, ' ').slice(0, 24),
        points: Math.round(Number(a.points))
      }))
      .filter(a => a.text);

    if (answers.length < 2) return { error: 'Question ' + (i + 1) + ' needs at least 2 answers.' };
    if (answers.length > 8) answers = answers.slice(0, 8);

    // any answer left without points gets one off the curve
    if (answers.some(a => !(a.points > 0))) {
      const curve = spreadPoints(answers.length);
      answers.forEach((a, j) => { if (!(a.points > 0)) a.points = curve[j]; });
    }
    answers.forEach(a => { a.points = Math.min(99, Math.max(1, a.points)); });
    answers.sort((a, b) => b.points - a.points);   // the board expects descending

    questions.push({
      id: slug + '-' + String(i + 1).padStart(2, '0'),
      category: name,
      text,
      answers
    });
  }

  return { category: { name, questions } };
}

// -------------------------------------------------------------------- state

// Event sequence never restarts, even across a new game. A screen left open
// from the previous game holds the old seq, and a counter that reset to zero
// would make it ignore every event until it caught back up.
let seqCounter = 0;

function freshState() {
  return {
    phase: 'setup',          // setup | question | roundwin | gameover
    teams: [
      { name: 'Team 1', score: 0 },
      { name: 'Team 2', score: 0 }
    ],
    categories: [],
    questions: [],           // the 6 chosen for this game
    roundIndex: 0,
    totalRounds: TOTAL_ROUNDS,
    revealed: [],            // bool per answer
    hints: [],               // letters currently shown per answer
    strikes: 0,
    control: null,           // 0 | 1 | null
    pot: 0,
    stealMode: false,
    roundWinner: null,       // team index that took the last pot
    roundAmount: 0,
    muted: false,
    event: null,             // { seq, type, ... } - drives sfx + animation
    seq: seqCounter
  };
}

let state = freshState();
let usedQuestionIds = new Set();
const undoStack = [];

function snapshot() {
  undoStack.push({
    state: JSON.parse(JSON.stringify(state)),
    used: Array.from(usedQuestionIds)
  });
  if (undoStack.length > 40) undoStack.shift();
}

function currentQuestion() {
  return state.questions[state.roundIndex] || null;
}

function fire(type, extra) {
  seqCounter += 1;
  state.seq = seqCounter;
  state.event = Object.assign({ seq: seqCounter, type }, extra || {});
}

function resetBoard() {
  const q = currentQuestion();
  const n = q ? q.answers.length : 0;
  state.revealed = new Array(n).fill(false);
  state.hints = new Array(n).fill(0);
  state.strikes = 0;
  state.control = null;
  state.pot = 0;
  state.stealMode = false;
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function pickQuestions(categories, count) {
  const pool = ALL_QUESTIONS.filter(q => categories.includes(q.category));
  return shuffle(pool).slice(0, count);
}

// ------------------------------------------------------------------ actions

const actions = {
  setup(p) {
    const cats = (p.categories || []).filter(Boolean);
    if (!cats.length) return;
    state = freshState();
    usedQuestionIds = new Set();
    undoStack.length = 0;
    state.teams[0].name = (p.teamA || 'Team 1').trim().slice(0, 20) || 'Team 1';
    state.teams[1].name = (p.teamB || 'Team 2').trim().slice(0, 20) || 'Team 2';
    state.categories = cats;
    state.questions = pickQuestions(cats, TOTAL_ROUNDS);
    if (!state.questions.length) return { error: 'Those categories have no questions in them.' };
    // a thin category plays a shorter game rather than running the board dry
    state.totalRounds = Math.min(TOTAL_ROUNDS, state.questions.length);
    state.questions.forEach(q => usedQuestionIds.add(q.id));
    state.phase = 'question';
    resetBoard();
    fire('intro');
  },

  assignControl(p) {
    if (state.phase !== 'question') return;
    snapshot();
    state.control = p.team === 1 ? 1 : 0;
    fire('control', { team: state.control });
  },

  reveal(p) {
    const q = currentQuestion();
    if (!q || state.phase !== 'question') return;
    const i = p.index;
    if (i == null || i < 0 || i >= q.answers.length) return;
    if (state.revealed[i]) return;
    snapshot();
    state.revealed[i] = true;
    state.hints[i] = q.answers[i].text.length; // a revealed answer is fully shown
    state.pot += q.answers[i].points;
    fire('reveal', { index: i, points: q.answers[i].points });
  },

  strike() {
    if (state.phase !== 'question' || state.stealMode) return;
    // A strike with nobody in control would strand the round: it could reach
    // three without ever opening the steal. Make the announcer pick first.
    if (state.control === null) return;
    snapshot();
    state.strikes = Math.min(3, state.strikes + 1);
    if (state.strikes >= 3) state.stealMode = true;
    fire('strike', { count: state.strikes });
  },

  hint(p) {
    const q = currentQuestion();
    if (!q || state.phase !== 'question') return;
    const i = p.index;
    if (i == null || i < 0 || i >= q.answers.length) return;
    if (state.revealed[i]) return;
    snapshot();
    const max = q.answers[i].text.length;
    state.hints[i] = Math.min(max, state.hints[i] + 2);
    fire('hint', { index: i });
  },

  // Steal resolution. good = stealing team takes the pot.
  resolveSteal(p) {
    if (!state.stealMode || state.control === null) return;
    const stealer = state.control === 0 ? 1 : 0;
    actions.awardRound({ team: p.good ? stealer : state.control });
  },

  awardRound(p) {
    if (state.phase !== 'question') return;
    snapshot();
    const t = p.team === 1 ? 1 : 0;
    state.teams[t].score += state.pot;
    state.roundWinner = t;
    state.roundAmount = state.pot;
    state.phase = 'roundwin';
    // show the full board on the celebration screen
    const q = currentQuestion();
    if (q) {
      state.revealed = state.revealed.map(() => true);
      state.hints = q.answers.map(a => a.text.length);
    }
    fire('roundwin', { team: t, amount: state.roundAmount });
  },

  nextRound() {
    if (state.phase !== 'roundwin') return;
    snapshot();
    if (state.roundIndex + 1 >= state.totalRounds) {
      state.phase = 'gameover';
      fire('gameover');
      return;
    }
    state.roundIndex += 1;
    state.phase = 'question';
    resetBoard();
    fire('newround', { round: state.roundIndex });
  },

  skipQuestion() {
    if (state.phase !== 'question') return;
    const pool = ALL_QUESTIONS.filter(
      q => state.categories.includes(q.category) && !usedQuestionIds.has(q.id)
    );
    if (!pool.length) return;
    snapshot();
    const next = shuffle(pool)[0];
    usedQuestionIds.add(next.id);
    state.questions[state.roundIndex] = next;
    resetBoard();
    fire('skip');
  },

  adjustScore(p) {
    const t = p.team === 1 ? 1 : 0;
    const d = Number(p.delta) || 0;
    snapshot();
    state.teams[t].score = Math.max(0, state.teams[t].score + d);
    fire('score');
  },

  setMuted(p) {
    state.muted = !!p.muted;
    fire('mute');
  },

  replay(p) {
    fire('replay', { sound: p.sound });
  },

  undo() {
    const prev = undoStack.pop();
    if (!prev) return;
    state = prev.state;
    usedQuestionIds = new Set(prev.used);
    fire('undo');
  },

  reset() {
    state = freshState();
    usedQuestionIds = new Set();
    undoStack.length = 0;
    fire('reset');
  },

  /* Categories written on the announcer's phone. Saving one under a name that
     already exists replaces it, so fixing a typo is not a second category. */
  createCategory(p) {
    const r = normalizeCategory(p.name, p.questions);
    if (r.error) return { error: r.error };
    const key = r.category.name.toLowerCase();
    const at = CUSTOM_CATEGORIES.findIndex(c => c.name.toLowerCase() === key);
    if (at >= 0) CUSTOM_CATEGORIES[at] = r.category;
    else CUSTOM_CATEGORIES.push(r.category);
    try {
      saveCustom();
    } catch (err) {
      // keep it in memory so tonight's game still works, but say so
      rebuildQuestions();
      fire('catalog');
      return { error: 'Saved for this session only - could not write the file: ' + err.message };
    }
    rebuildQuestions();
    fire('catalog');
    return { name: r.category.name, count: r.category.questions.length, replaced: at >= 0 };
  },

  deleteCategory(p) {
    const key = String(p.name == null ? '' : p.name).toLowerCase();
    const before = CUSTOM_CATEGORIES.length;
    CUSTOM_CATEGORIES = CUSTOM_CATEGORIES.filter(c => c.name.toLowerCase() !== key);
    if (CUSTOM_CATEGORIES.length === before) return { error: 'There is no custom category by that name.' };
    try { saveCustom(); } catch (_) {}
    rebuildQuestions();
    fire('catalog');
    return { deleted: true };
  }
};

// ------------------------------------------------------------- SSE plumbing

const clients = new Set();

// The board needs answer text only for answers already revealed or partly
// hinted, so a curious resident with the URL can't read ahead.
function publicState() {
  const q = currentQuestion();
  const view = JSON.parse(JSON.stringify(state));
  if (q) {
    view.question = {
      id: q.id,
      category: q.category,
      text: q.text,
      answers: q.answers.map((a, i) => ({
        points: a.points,
        length: a.text.length,
        text: a.text,
        shown: state.revealed[i] ? a.text.length : state.hints[i]
      }))
    };
  } else {
    view.question = null;
  }
  view.catalog = catalog();
  delete view.questions;
  return view;
}

function broadcast() {
  const payload = 'data: ' + JSON.stringify(publicState()) + '\n\n';
  for (const res of clients) {
    try {
      res.write(payload);
    } catch (_) {
      clients.delete(res);
    }
  }
}

// -------------------------------------------------------------- static files

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.mp3': 'audio/mpeg',
  '.ico': 'image/x-icon'
};

function serveFile(res, filePath) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found');
      return;
    }
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache'
    });
    res.end(data);
  });
}

const ROUTES = {
  '/': 'index.html',
  '/play': 'play.html',
  '/announcer': 'announcer.html'
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  const pathname = decodeURIComponent(url.pathname);

  if (pathname === '/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no'
    });
    res.write('retry: 1000\n\n');
    res.write('data: ' + JSON.stringify(publicState()) + '\n\n');
    clients.add(res);
    const keepAlive = setInterval(() => {
      try { res.write(': ping\n\n'); } catch (_) {}
    }, 20000);
    req.on('close', () => {
      clearInterval(keepAlive);
      clients.delete(res);
    });
    return;
  }

  if (pathname === '/action' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 1e5) req.destroy();
    });
    req.on('end', () => {
      let msg;
      try {
        msg = JSON.parse(body);
      } catch (_) {
        res.writeHead(400).end('bad json');
        return;
      }
      const fn = actions[msg.action];
      let result = null;
      if (fn) {
        try {
          result = fn(msg);
        } catch (err) {
          console.error('action error', msg.action, err);
          result = { error: 'Something went wrong on the server.' };
        }
        broadcast();
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      // actions that validate input answer back so the phone can say why
      res.end(JSON.stringify(
        result && result.error ? { ok: false, error: result.error } : { ok: true, result: result }
      ));
    });
    return;
  }

  // the custom categories as a file, so a category written on the phone can be
  // downloaded and committed to the repo instead of living on a disk that a
  // redeploy will wipe
  if (pathname === '/custom-questions.json') {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="custom-questions.json"',
      'Cache-Control': 'no-cache'
    });
    res.end(JSON.stringify(CUSTOM_CATEGORIES, null, 2));
    return;
  }

  const rel = ROUTES[pathname] || pathname.replace(/^\/+/, '');
  const filePath = path.join(PUBLIC_DIR, rel);
  // don't let a crafted path escape public/
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403).end('nope');
    return;
  }
  serveFile(res, filePath);
});

function lanAddress() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) return net.address;
    }
  }
  return 'localhost';
}

server.listen(PORT, '0.0.0.0', () => {
  const ip = lanAddress();
  const bar = '='.repeat(52);
  console.log('\n' + bar);
  console.log('  GOLDEN GAMES is running');
  console.log(bar);
  console.log('  Questions loaded: ' + ALL_QUESTIONS.length +
    (CUSTOM_CATEGORIES.length
      ? ' (' + CUSTOM_CATEGORIES.length + ' custom ' +
        (CUSTOM_CATEGORIES.length === 1 ? 'category' : 'categories') + ')'
      : ''));
  console.log('');
  console.log('  BIG SCREEN (TV / laptop):');
  console.log('     http://' + ip + ':' + PORT + '/play');
  console.log('');
  console.log('  ANNOUNCER (your phone, same WiFi):');
  console.log('     http://' + ip + ':' + PORT + '/announcer');
  console.log('');
  console.log('  Password: Schoening');
  console.log(bar + '\n');
});
