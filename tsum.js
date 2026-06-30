// ===== Meltie Tsum — trace-to-connect score attack =====
// 同じ仲間のメルティを指でなぞって3つ以上つなげると消える。消えた分は上から補充。60秒スコアアタック。
// グリッド式（隣接8方向の同種をチェーン）。ぷよ(落下連鎖)・キャッチ(反射)と操作感を差別化。
const T_COLS = 6, T_ROWS = 7, T_LIMIT = 60;
const T_TYPES = [
  { key: "melty",   tint: "#ff77b7" },
  { key: "popcorn", tint: "#ffc861" },
  { key: "screen",  tint: "#6fe8d6" },
  { key: "sleep",   tint: "#a27cff" },
];

const tcv = document.getElementById("tsumCanvas");
if (tcv) initTsum(tcv);

function initTsum(cv) {
  const ctx = cv.getContext("2d");
  const imgs = T_TYPES.map(t => { const im = new Image(); im.src = `images/characters/${t.key}.png`; return im; });
  const scoreEl = document.getElementById("tScore"), bestEl = document.getElementById("tBest"),
        comboEl = document.getElementById("tCombo"), timeEl = document.getElementById("tTime");
  const startBtn = document.getElementById("tsumStart");

  let cell = 50, grid = null, chain = [], dragging = false;
  let playing = false, paused = false, running = false;
  let score = 0, timeLeft = T_LIMIT, last = 0;
  let best = +(localStorage.getItem("melties_tsum_best") || 0);
  if (bestEl) bestEl.textContent = best;
  if (timeEl) timeEl.textContent = T_LIMIT;

  const randType = () => (Math.random() * T_TYPES.length) | 0;

  function fit() {
    const maxW = Math.min(cv.parentElement.clientWidth - 8, 360);
    cell = Math.max(40, Math.floor(maxW / T_COLS));
    cv.width = cell * T_COLS; cv.height = cell * T_ROWS;
    cv.style.width = cv.width + "px"; cv.style.height = cv.height + "px";
    draw();
  }
  function fillGrid() {
    grid = Array.from({ length: T_ROWS }, () => Array.from({ length: T_COLS }, randType));
  }
  function reset() { fillGrid(); chain = []; score = 0; timeLeft = T_LIMIT; playing = true;
    if (scoreEl) scoreEl.textContent = 0; if (comboEl) comboEl.textContent = ""; if (timeEl) timeEl.textContent = T_LIMIT; }
  function endGame() { playing = false; if (comboEl) comboEl.textContent = "Time's up!";
    if (score > best) { best = score; localStorage.setItem("melties_tsum_best", best); if (bestEl) bestEl.textContent = best; }
    if (startBtn) startBtn.textContent = startBtn.dataset.restart || "Play again"; }

  function cellAt(ev) {
    const r = cv.getBoundingClientRect();
    const x = (ev.clientX ?? ev.touches?.[0]?.clientX) - r.left;
    const y = (ev.clientY ?? ev.touches?.[0]?.clientY) - r.top;
    const c = Math.floor(x / (r.width / T_COLS)), rr = Math.floor(y / (r.height / T_ROWS));
    return (c >= 0 && c < T_COLS && rr >= 0 && rr < T_ROWS) ? { r: rr, c } : null;
  }
  function addCell(p) {
    const t0 = grid[chain[0].r][chain[0].c], last = chain[chain.length - 1];
    if (chain.length >= 2) { const prev = chain[chain.length - 2]; if (prev.r === p.r && prev.c === p.c) { chain.pop(); return; } }
    if (chain.some(q => q.r === p.r && q.c === p.c)) return;
    if (Math.abs(p.r - last.r) <= 1 && Math.abs(p.c - last.c) <= 1 && grid[p.r][p.c] === t0) chain.push(p);
  }
  function resolve() {
    if (chain.length >= 3) {
      const len = chain.length;
      chain.forEach(p => grid[p.r][p.c] = null);
      score += len * 10 * (len >= 5 ? 2 : 1);
      if (scoreEl) scoreEl.textContent = score;
      if (comboEl) comboEl.textContent = len + " tsum!";
      if (score > best) { best = score; localStorage.setItem("melties_tsum_best", best); if (bestEl) bestEl.textContent = best; }
      gravity();
    }
    chain = [];
  }
  function gravity() {
    for (let c = 0; c < T_COLS; c++) {
      const existing = [];
      for (let r = 0; r < T_ROWS; r++) if (grid[r][c] != null) existing.push(grid[r][c]);
      const need = T_ROWS - existing.length, col = [];
      for (let i = 0; i < need; i++) col.push(randType());
      col.push(...existing);
      for (let r = 0; r < T_ROWS; r++) grid[r][c] = col[r];
    }
  }

  cv.addEventListener("pointerdown", e => { if (!playing || paused) return; const p = cellAt(e); if (p) { dragging = true; chain = [p]; e.preventDefault(); } });
  cv.addEventListener("pointermove", e => { if (!dragging) return; const p = cellAt(e); if (p) addCell(p); e.preventDefault(); });
  addEventListener("pointerup", () => { if (dragging) { dragging = false; resolve(); } });
  startBtn && startBtn.addEventListener("click", () => { reset(); startBtn.textContent = "Restart"; });

  function drawTsum(t, px, py, sz, hi) {
    const im = imgs[t];
    if (hi) { ctx.save(); ctx.shadowColor = "rgba(255,255,255,.95)"; ctx.shadowBlur = sz * 0.4; }
    const pad = hi ? 0.0 : 0.06, s = sz * (1 - pad * 2);
    if (im.complete && im.naturalWidth) ctx.drawImage(im, px + sz * pad, py + sz * pad, s, s);
    else { ctx.fillStyle = T_TYPES[t].tint; ctx.beginPath(); ctx.arc(px + sz / 2, py + sz / 2, sz * 0.42, 0, 7); ctx.fill(); }
    if (hi) ctx.restore();
  }
  function draw() {
    if (!grid) { ctx.clearRect(0, 0, cv.width, cv.height); return; }
    ctx.clearRect(0, 0, cv.width, cv.height);
    const inChain = (r, c) => chain.some(p => p.r === r && p.c === c);
    for (let r = 0; r < T_ROWS; r++) for (let c = 0; c < T_COLS; c++)
      if (grid[r][c] != null) drawTsum(grid[r][c], c * cell, r * cell, cell, inChain(r, c));
    // trace line
    if (chain.length >= 2) {
      ctx.save();
      ctx.strokeStyle = "rgba(255,255,255,.85)"; ctx.lineWidth = cell * 0.16; ctx.lineCap = "round"; ctx.lineJoin = "round";
      ctx.shadowColor = T_TYPES[grid[chain[0].r][chain[0].c]].tint; ctx.shadowBlur = 12;
      ctx.beginPath();
      chain.forEach((p, i) => { const x = p.c * cell + cell / 2, y = p.r * cell + cell / 2; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); });
      ctx.stroke(); ctx.restore();
    }
    if (!playing) {
      ctx.fillStyle = "rgba(36,26,64,.5)"; ctx.fillRect(0, 0, cv.width, cv.height);
    }
  }
  function loop(now) {
    if (paused) { running = false; return; }
    const dt = Math.min((now - last) / 1000, 0.05); last = now;
    if (playing) { timeLeft -= dt; if (timeEl) timeEl.textContent = Math.max(0, Math.ceil(timeLeft)); if (timeLeft <= 0) endGame(); }
    draw();
    requestAnimationFrame(loop);
  }

  addEventListener("resize", fit);
  fillGrid(); fit();
  window.MeltieTsum = {
    activate() { paused = false; fit(); if (!running) { running = true; last = performance.now(); requestAnimationFrame(loop); } },
    deactivate() { paused = true; },
  };
}
