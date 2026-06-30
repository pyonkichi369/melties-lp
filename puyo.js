// ===== Meltie Puyo — falling-pair match-4 puzzle =====
// Melties をぷよに見立てた落ちものパズル。ペアで落ちる→同じ仲間が4つ以上つながると消える→連鎖。
// 2D Canvas / 依存なし。キャラ透過PNGをぷよとして使用。Score & Best(localStorage)。
const COLS = 6, ROWS = 12;
// 4 visually-distinct Melties as puyo colors
const TYPES = [
  { key: "melty",   tint: "#ff77b7" }, // pink
  { key: "popcorn", tint: "#ffc861" }, // yellow
  { key: "screen",  tint: "#6fe8d6" }, // mint
  { key: "sleep",   tint: "#a27cff" }, // purple
];

const canvas = document.getElementById("puyoCanvas");
if (canvas) initPuyo(canvas);

function initPuyo(cv) {
  const ctx = cv.getContext("2d");
  const imgs = TYPES.map(t => { const im = new Image(); im.src = `images/characters/${t.key}.png`; return im; });
  const nextBox = document.getElementById("puyoNext");
  const scoreEl = document.getElementById("pScore"), bestEl = document.getElementById("pBest"), comboEl = document.getElementById("pCombo");
  const startBtn = document.getElementById("puyoStart");
  let paused = false;

  let cell = 48;
  function fit() {
    const maxW = Math.min(cv.parentElement.clientWidth - 120, 300);
    cell = Math.max(34, Math.floor(maxW / COLS));
    cv.width = cell * COLS; cv.height = cell * ROWS;
    cv.style.width = cv.width + "px"; cv.style.height = cv.height + "px";
    draw();
  }

  let grid, cur, next, dropMs, dropAcc, last, playing = false, over = false, soft = false;
  let score = 0, best = +(localStorage.getItem("melties_puyo_best") || 0);
  if (bestEl) bestEl.textContent = best;

  const randType = () => (Math.random() * TYPES.length) | 0;
  function newPair() { return { x: 2, y: 0, rot: 0, a: randType(), b: randType() }; }
  // satellite cell for current rotation
  function satXY(p) {
    return [[p.x, p.y - 1], [p.x + 1, p.y], [p.x, p.y + 1], [p.x - 1, p.y]][p.rot];
  }
  const inside = (x, y) => x >= 0 && x < COLS && y < ROWS;
  const free = (x, y) => inside(x, y) && (y < 0 || grid[y][x] == null);
  function fits(p) { const [sx, sy] = satXY(p); return free(p.x, p.y) && free(sx, sy); }

  function reset() {
    grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    score = 0; if (scoreEl) scoreEl.textContent = 0; if (comboEl) comboEl.textContent = "";
    next = newPair(); spawn(); over = false; playing = true; dropMs = 720; dropAcc = 0; last = performance.now();
    drawNext(); requestAnimationFrame(loop);
  }
  function spawn() {
    cur = next; cur.x = 2; cur.y = 0; cur.rot = 0; next = newPair(); drawNext();
    if (!fits(cur)) { gameOver(); }
  }
  function gameOver() {
    playing = false; over = true;
    if (score > best) { best = score; localStorage.setItem("melties_puyo_best", best); if (bestEl) bestEl.textContent = best; }
    draw();
  }

  function lock() {
    const [sx, sy] = satXY(cur);
    if (cur.y >= 0) grid[cur.y][cur.x] = cur.a;
    if (sy >= 0) grid[sy][sx] = cur.b;
    resolve(1);
    spawn();
  }
  // gravity + clear chain
  function resolve(chain) {
    applyGravity();
    const cleared = clearGroups();
    if (cleared > 0) {
      score += cleared * 10 * chain;
      if (scoreEl) scoreEl.textContent = score;
      if (comboEl) comboEl.textContent = chain > 1 ? "x" + chain + " chain!" : "";
      if (score > best) { best = score; localStorage.setItem("melties_puyo_best", best); if (bestEl) bestEl.textContent = best; }
      resolve(chain + 1);
    } else if (chain === 1 && comboEl) { /* keep last combo briefly */ }
  }
  function applyGravity() {
    for (let x = 0; x < COLS; x++) {
      let write = ROWS - 1;
      for (let y = ROWS - 1; y >= 0; y--) {
        if (grid[y][x] != null) { const v = grid[y][x]; grid[y][x] = null; grid[write--][x] = v; }
      }
    }
  }
  function clearGroups() {
    const seen = Array.from({ length: ROWS }, () => Array(COLS).fill(false));
    let total = 0;
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
      if (grid[y][x] == null || seen[y][x]) continue;
      const t = grid[y][x], stack = [[x, y]], group = [];
      seen[y][x] = true;
      while (stack.length) {
        const [cx, cy] = stack.pop(); group.push([cx, cy]);
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
          const nx = cx + dx, ny = cy + dy;
          if (nx >= 0 && nx < COLS && ny >= 0 && ny < ROWS && !seen[ny][nx] && grid[ny][nx] === t) { seen[ny][nx] = true; stack.push([nx, ny]); }
        });
      }
      if (group.length >= 4) { group.forEach(([gx, gy]) => grid[gy][gx] = null); total += group.length; }
    }
    return total;
  }

  // input
  function move(dx) { const p = { ...cur, x: cur.x + dx }; if (fits(p)) { cur = p; draw(); } }
  function rotate() {
    for (const kick of [0, 1, -1, 2, -2]) {
      const p = { ...cur, x: cur.x + kick, rot: (cur.rot + 1) % 4 };
      if (fits(p)) { cur = p; draw(); return; }
    }
  }
  function step() { // one cell down; returns false if locked
    const p = { ...cur, y: cur.y + 1 };
    if (fits(p)) { cur = p; return true; }
    lock(); return false;
  }
  function hardSoft(on) { soft = on; }

  function loop(now) {
    if (!playing || paused) return;
    const dt = now - last; last = now;
    dropAcc += dt;
    const interval = soft ? 60 : dropMs;
    while (dropAcc >= interval) { dropAcc -= interval; if (!step()) break; }
    draw();
    requestAnimationFrame(loop);
  }

  function drawPuyo(t, px, py, sz) {
    const im = imgs[t];
    ctx.save();
    if (im.complete && im.naturalWidth) ctx.drawImage(im, px + sz * 0.03, py + sz * 0.03, sz * 0.94, sz * 0.94);
    else { ctx.fillStyle = TYPES[t].tint; ctx.beginPath(); ctx.arc(px + sz / 2, py + sz / 2, sz * 0.42, 0, 7); ctx.fill(); }
    ctx.restore();
  }
  function draw() {
    if (!grid) { ctx.clearRect(0, 0, cv.width, cv.height); return; }
    ctx.clearRect(0, 0, cv.width, cv.height);
    // grid background lines
    ctx.strokeStyle = "rgba(162,124,255,.12)";
    for (let x = 0; x <= COLS; x++) { ctx.beginPath(); ctx.moveTo(x * cell, 0); ctx.lineTo(x * cell, cv.height); ctx.stroke(); }
    for (let y = 0; y <= ROWS; y++) { ctx.beginPath(); ctx.moveTo(0, y * cell); ctx.lineTo(cv.width, y * cell); ctx.stroke(); }
    for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) if (grid[y][x] != null) drawPuyo(grid[y][x], x * cell, y * cell, cell);
    if (cur && playing) {
      if (cur.y >= 0) drawPuyo(cur.a, cur.x * cell, cur.y * cell, cell);
      const [sx, sy] = satXY(cur); if (sy >= 0) drawPuyo(cur.b, sx * cell, sy * cell, cell);
    }
    if (over) {
      ctx.fillStyle = "rgba(90,61,138,.55)"; ctx.fillRect(0, 0, cv.width, cv.height);
      ctx.fillStyle = "#fff"; ctx.font = `${Math.floor(cell * 0.7)}px 'Mochiy Pop One',sans-serif`;
      ctx.textAlign = "center"; ctx.fillText("Game Over", cv.width / 2, cv.height / 2);
    }
  }
  function drawNext() {
    if (!nextBox) return;
    nextBox.innerHTML = `<span class="next-label">NEXT</span>
      <img src="images/characters/${TYPES[next.b].key}.png" alt="">
      <img src="images/characters/${TYPES[next.a].key}.png" alt="">`;
  }

  // controls: keyboard
  addEventListener("keydown", e => {
    if (!playing) return;
    if (e.key === "ArrowLeft") { move(-1); e.preventDefault(); }
    else if (e.key === "ArrowRight") { move(1); e.preventDefault(); }
    else if (e.key === "ArrowUp" || e.key === "x" || e.key === "z") { rotate(); e.preventDefault(); }
    else if (e.key === "ArrowDown") { hardSoft(true); e.preventDefault(); }
  });
  addEventListener("keyup", e => { if (e.key === "ArrowDown") hardSoft(false); });
  // controls: on-screen buttons (touch)
  document.querySelectorAll("[data-act]").forEach(b => {
    const act = b.dataset.act;
    const fire = () => { if (!playing) return; act === "left" ? move(-1) : act === "right" ? move(1) : act === "rotate" ? rotate() : hardSoft(true); };
    b.addEventListener("pointerdown", e => { e.preventDefault(); fire(); });
    if (act === "down") b.addEventListener("pointerup", () => hardSoft(false));
    if (act === "down") b.addEventListener("pointerleave", () => hardSoft(false));
  });
  startBtn && startBtn.addEventListener("click", () => { reset(); startBtn.textContent = startBtn.dataset.restart || "Restart"; });

  addEventListener("resize", fit);
  fit();

  // Game Center control: pause RAF when tab hidden, resize+resume when shown
  window.MeltiePuyo = {
    activate() { paused = false; fit(); if (playing) { last = performance.now(); requestAnimationFrame(loop); } },
    deactivate() { paused = true; },
  };
}
