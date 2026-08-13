# Golden Games

A Family Feud-style game show built for an assisted living activity room.
Questions are written for residents aged 65-85 — the music, TV, snacks and
everyday life they grew up with.

Two screens, one live game:

- **Playscreen** — the big board on the TV that everyone watches.
- **Announcer** — a phone panel for the staff member running the game. It shows
  the hidden answers, reveals them, gives strikes, and awards the points.

---

## Running a game

1. Open Terminal, go to this folder, and run:

   ```
   node server.js
   ```

2. It prints two addresses. Put the first one on the **TV**:

   ```
   http://192.168.1.42:3000/play
   ```

3. Open the second one on your **phone** (same WiFi as the laptop):

   ```
   http://192.168.1.42:3000/announcer
   ```

4. Password on both: **Schoening**

5. Type the two team names, tick the categories you want, and hit
   **Start the Game**.

That's it. No internet needed — just the laptop and phone on the same WiFi.
Leave the Terminal window open while you play.

---

## How the game runs

Six rounds. Each round:

1. The question appears on the board with the answers hidden.
2. Residents hit the buzzers. Whoever buzzed first, tap that team on the phone
   under **Who has control?**
3. They call out an answer. If it's on the board, tap it to reveal it — it flips
   over with a check mark and a ding, and the points go into the pot.
4. If they're wrong, hit the big red **STRIKE** button. A giant X spins onto the
   TV and lands in the strike tray up top.
5. Three strikes and the other team gets **one guess to steal** the whole pot.
   Tap **Stole it!** or **Missed** and the points go to the right team.
6. If a team clears the whole board, hit the gold button to award the pot.

After six rounds the winner screen comes up. **Play Again** starts a fresh game
with new questions.

### Hints

Nobody getting it? Every answer on the phone has a 💡 button. Each tap puts two
more letters up on the TV:

```
_ _ _ _ _ _ _ _   →   SN _ _ _ _ _ _   →   SNIC _ _ _ _
```

No point penalty — it's just there so a table that's stuck doesn't stay stuck.

### The ⋯ menu

- **Undo** (also the ↩ button in the header) — takes back the last thing you did.
- **Skip this question** — pulls a fresh one if the current one is a dud.
- **Adjust scores** — nudge either team by ±5 or ±25.
- **Sound on/off** and replay the intro or round-win music.
- **Reset the whole game** — hold it for two seconds.

---

## Adding your own questions

Everything lives in `public/questions.js`. Copy the shape of the existing ones:

```js
{
  id: "sweet-16",
  category: "Sweet Tooth & Snacks",
  text: "Name a soda you drank growing up.",
  answers: [
    { text: "Coca-Cola", points: 38 },
    { text: "Pepsi", points: 26 },
    ...
  ]
}
```

Rules of thumb:

- Points should add up to about 100, highest answer first.
- 4 to 8 answers per question.
- Keep answer text **short** — one to three words. It renders in huge type on
  the TV and gets masked letter-by-letter for hints, so long answers break the
  layout.
- To add a whole new category, add its name to the `CATEGORIES` list at the
  bottom of the file and it shows up as a checkbox on the setup screen.

Restart `node server.js` after editing.

---

## Files

| File | What it is |
| --- | --- |
| `server.js` | Serves the site and holds the one live game session |
| `public/index.html` | Password screen and Playscreen / Announcer picker |
| `public/play.html` | The big board |
| `public/announcer.html` | The phone control panel |
| `public/questions.js` | The question bank |
| `public/shared.js` | Password gate, live feed, sound |
| `public/styles.css` | Shared navy-and-gold theme |
| `public/sfx/` | Sound effects |

## Troubleshooting

**The phone can't reach the address.** It's on a different network — check it's
on the same WiFi as the laptop, not cellular data and not a guest network.

**No sound on the TV.** Sound only plays on the Playscreen, and browsers block
audio until you've tapped something on that page. Type the password directly on
the TV's browser rather than skipping past it, and turn the TV volume up.

**The screens are out of sync.** Refresh the page — it pulls the current game
state the moment it reconnects, mid-round and all.
