// ===== Meltie Catch — Three.js mini-game =====
// 落ちてくる Melties をタップして集める。ノーペナルティのカジュアル設計（kawaii=低ストレス）。
// 既存のキャラ透過PNGをスプライトとして使用。失敗なし・スコア&ベスト記録。
// Game Center 制御: window.MeltieCatch.activate()/deactivate()（非表示中はRAF停止）。
import * as THREE from "https://unpkg.com/three@0.160.0/build/three.module.js";

let _started = false, _active = false, _running = false, _resume = null;
window.MeltieCatch = {
  activate() {
    _active = true;
    const wrap = document.getElementById("gameWrap");
    if (!_started && wrap && window.WebGLRenderingContext) { _started = true; start(wrap); }
    else if (_resume) _resume();
  },
  deactivate() { _active = false; },
};

function start(wrap) {
  const CHARS = ["melty", "game", "book", "screen", "popcorn", "icecream", "sleep"];
  let W = wrap.clientWidth || 360;
  let H = Math.round(W * 0.8);

  let renderer;
  try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true }); }
  catch (e) { return; }
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(W, H);
  wrap.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const worldH = 10;
  let worldW = worldH * (W / H);
  const cam = new THREE.OrthographicCamera(-worldW / 2, worldW / 2, worldH / 2, -worldH / 2, 0.1, 100);
  cam.position.z = 10;

  const loader = new THREE.TextureLoader();
  const tex = CHARS.map((c) => { const t = loader.load(`images/characters/${c}.png`); t.colorSpace = THREE.SRGBColorSpace; return t; });

  const TIME_LIMIT = 30;
  const melts = [];
  let score = 0, combo = 0, spawnT = 0, t0 = performance.now(), last = t0, playing = false, timeLeft = TIME_LIMIT;
  let best = +(localStorage.getItem("melties_best") || 0);
  const scoreEl = document.getElementById("cScore");
  const bestEl = document.getElementById("cBest");
  const comboEl = document.getElementById("cCombo");
  const timeEl = document.getElementById("cTime");
  const startBtn = document.getElementById("catchStart");
  if (bestEl) bestEl.textContent = best;
  if (timeEl) timeEl.textContent = TIME_LIMIT;

  function reset() {
    for (const s of melts) { scene.remove(s); s.material.dispose(); }
    melts.length = 0;
    score = 0; combo = 0; spawnT = 0; t0 = performance.now(); timeLeft = TIME_LIMIT;
    if (scoreEl) scoreEl.textContent = 0; if (comboEl) comboEl.textContent = "";
    if (timeEl) timeEl.textContent = TIME_LIMIT;
    playing = true;
  }
  function endGame() {
    playing = false;
    if (comboEl) comboEl.textContent = "Time's up!";
    if (score > best) { best = score; localStorage.setItem("melties_best", best); if (bestEl) bestEl.textContent = best; }
    if (startBtn) startBtn.textContent = startBtn.dataset.restart || "Play again";
  }
  startBtn && startBtn.addEventListener("click", () => { reset(); startBtn.textContent = "Restart"; });

  function spawn() {
    const i = (Math.random() * CHARS.length) | 0;
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex[i], transparent: true }));
    const sc = 1.5 + Math.random() * 0.6;
    s.scale.set(sc, sc, 1);
    const baseX = (Math.random() - 0.5) * (worldW - 2.2);
    s.position.set(baseX, worldH / 2 + 1.5, 0);
    s.userData = { vy: -(1.7 + Math.random() * 1.3), sway: Math.random() * 6.28, swayA: 0.25 + Math.random() * 0.45, baseX, pop: 0, s0: sc };
    scene.add(s); melts.push(s);
  }

  const ray = new THREE.Raycaster(), pt = new THREE.Vector2();
  let actx;
  function pop() {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = "sine"; o.frequency.value = 440 + Math.min(combo, 12) * 18;
      o.connect(g); g.connect(actx.destination);
      g.gain.setValueAtTime(0.16, actx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + 0.12);
      o.start(); o.stop(actx.currentTime + 0.13);
    } catch (e) {}
  }
  function onDown(ev) {
    if (!playing) return;
    const r = renderer.domElement.getBoundingClientRect();
    const x = (ev.clientX ?? ev.touches?.[0]?.clientX) - r.left;
    const y = (ev.clientY ?? ev.touches?.[0]?.clientY) - r.top;
    pt.x = (x / r.width) * 2 - 1; pt.y = -(y / r.height) * 2 + 1;
    ray.setFromCamera(pt, cam);
    const hits = ray.intersectObjects(melts);
    if (hits.length) {
      const s = hits[0].object;
      if (!s.userData.pop) {
        s.userData.pop = 0.0001; score++; combo++; pop();
        if (scoreEl) scoreEl.textContent = score;
        if (comboEl) { comboEl.textContent = combo > 1 ? "x" + combo : ""; }
        if (score > best) { best = score; localStorage.setItem("melties_best", best); if (bestEl) bestEl.textContent = best; }
      }
    }
  }
  renderer.domElement.addEventListener("pointerdown", onDown);

  _resume = () => { if (!_running) { _running = true; last = performance.now(); requestAnimationFrame(loop); } };
  function loop(now) {
    if (!_active) { _running = false; return; } // paused when tab hidden
    const dt = Math.min((now - last) / 1000, 0.05); last = now;
    if (playing) {
      timeLeft -= dt;
      if (timeEl) timeEl.textContent = Math.max(0, Math.ceil(timeLeft));
      if (timeLeft <= 0) endGame();
    }
    if (playing) {
      spawnT += dt;
      const interval = Math.max(0.45, 1.0 - (now - t0) / 70000); // gently speeds up
      if (spawnT > interval) { spawnT = 0; spawn(); }
    }
    for (let k = melts.length - 1; k >= 0; k--) {
      const s = melts[k], u = s.userData;
      if (u.pop) {
        u.pop += dt; const p = Math.min(u.pop / 0.18, 1);
        s.material.opacity = 1 - p; s.scale.setScalar(u.s0 * (1 + 0.7 * p));
        if (p >= 1) { scene.remove(s); s.material.dispose(); melts.splice(k, 1); }
        continue;
      }
      u.sway += dt * 2;
      s.position.y += u.vy * dt;
      s.position.x = u.baseX + Math.sin(u.sway) * u.swayA;
      s.material.rotation = Math.sin(u.sway) * 0.12;
      if (s.position.y < -worldH / 2 - 1.5) {
        scene.remove(s); s.material.dispose(); melts.splice(k, 1);
        combo = 0; if (comboEl) comboEl.textContent = "";
      }
    }
    renderer.render(scene, cam);
    requestAnimationFrame(loop);
  }
  _running = true; requestAnimationFrame(loop);

  addEventListener("resize", () => {
    W = wrap.clientWidth || W; H = Math.round(W * 0.8);
    renderer.setSize(W, H);
    worldW = worldH * (W / H);
    cam.left = -worldW / 2; cam.right = worldW / 2; cam.top = worldH / 2; cam.bottom = -worldH / 2;
    cam.updateProjectionMatrix();
  });
}
