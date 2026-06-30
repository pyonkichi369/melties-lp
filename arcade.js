// ===== Game Center controller — tab switch between Puyo & Catch =====
// 表示中のゲームだけ動かす（非表示ゲームは deactivate でRAF停止＝CPU節約）。
(function () {
  const tabs = document.getElementById("arcadeTabs");
  if (!tabs) return;
  const panels = { puyo: document.getElementById("panel-puyo"), tsum: document.getElementById("panel-tsum"), catch: document.getElementById("panel-catch") };
  const api = { puyo: () => window.MeltiePuyo, tsum: () => window.MeltieTsum, catch: () => window.MeltieCatch };
  let cur = "puyo";

  function select(g) {
    if (g === cur || !panels[g]) return;
    const prev = api[cur](); if (prev && prev.deactivate) prev.deactivate();
    panels[cur].hidden = true;
    tabs.querySelector(`[data-game="${cur}"]`)?.classList.remove("active");
    cur = g;
    panels[cur].hidden = false;
    tabs.querySelector(`[data-game="${cur}"]`)?.classList.add("active");
    const now = api[cur](); if (now && now.activate) now.activate();
  }
  tabs.addEventListener("click", e => { const b = e.target.closest("[data-game]"); if (b) select(b.dataset.game); });

  // activate default (puyo) once its module is ready
  function bootDefault() { const a = api.puyo(); if (a && a.activate) a.activate(); else setTimeout(bootDefault, 50); }
  bootDefault();
})();
