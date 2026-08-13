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

let ALL_QUESTIONS = [];
try {
  ALL_QUESTIONS = loadQuestions();
} catch (err) {
  console.error('Could not load public/questions.js:', err.message);
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
      if (fn) {
        try {
          fn(msg);
        } catch (err) {
          console.error('action error', msg.action, err);
        }
        broadcast();
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end('{"ok":true}');
    });
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
  console.log('  Questions loaded: ' + ALL_QUESTIONS.length);
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
