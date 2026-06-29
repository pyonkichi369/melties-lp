// ---- data ----
const CHARS = [
  {key:"melty",    en:"Melty",     c:"pink", like:"みんな",       p:"好奇心旺盛・みんなを集めるリーダー"},
  {key:"game",     en:"Game",      c:"lav",  like:"ゲーム",       p:"集中すると周りが見えなくなる"},
  {key:"book",     en:"Book",      c:"lav",  like:"読書",         p:"おだやかで好奇心いっぱい"},
  {key:"screen",   en:"Screen",    c:"mint", like:"動画・配信",   p:"明るい・情報を吸収しすぎ"},
  {key:"popcorn",  en:"Popcorn",   c:"pop",  like:"映画",         p:"明るくてワクワク大好き"},
  {key:"icecream", en:"Ice Cream", c:"pink", like:"アイス",       p:"やさしくて、みんなをえがおに"},
  {key:"sleep",    en:"Sleep",     c:"lav",  like:"お昼寝",       p:"おだやか・のんびり星"},
];
const WORLD = ["とろける世界","キャンディランド","映画館","ゲームセンター","図書館","夢の国"];
const GOODS = ["ぬいぐるみ","ステッカー","LINEスタンプ","アパレル","フィギュア"];

const charImg = (k, en) =>
  `<div class="ch-art ph" data-k="${k}">
     <img src="images/characters/${k}.png" alt="${en}"
       onerror="this.closest('.ch-art').classList.add('ph')"
       onload="this.closest('.ch-art').classList.remove('ph')">
     <span class="ph-label">${en}</span>
   </div>`;

// ---- character rail ----
document.getElementById("rail").innerHTML = CHARS.map((c, i) => `
  <button class="ch c-${c.c} reveal" style="--d:${i*60}ms" data-i="${i}">
    ${charImg(c.key, c.en)}
    <span class="ch-name">${c.en}</span>
  </button>`).join("");

// ---- tiktok placeholder rail ----
document.getElementById("tiktokRail").innerHTML =
  Array.from({length:4}, (_,i)=>`
   <a class="tt-card reveal" style="--d:${i*60}ms" href="https://www.tiktok.com/@melties.world" target="_blank" rel="noopener">
     <span class="tt-play">▶</span></a>`).join("");

// ---- world / goods ----
document.getElementById("world").innerHTML =
  WORLD.map((w,i)=>`<div class="tile reveal" style="--d:${i*50}ms"><div class="tile-ph"></div><span>${w}</span></div>`).join("");
document.getElementById("goods").innerHTML =
  GOODS.map((g,i)=>`<div class="tile reveal" style="--d:${i*50}ms"><div class="tile-ph"></div><span>${g}</span></div>`).join("");

// ---- character modal ----
const modal = document.getElementById("modal");
const modalCard = document.getElementById("modalCard");
function openChar(i){
  const c = CHARS[i];
  modalCard.className = "modal-card c-" + c.c;
  modalCard.innerHTML = `
    ${charImg(c.key, c.en)}
    <h3>${c.en}</h3>
    <dl><dt>好きなもの</dt><dd>${c.like}</dd><dt>せいかく</dt><dd>${c.p}</dd></dl>
    <a class="cta tiktok small" href="https://www.tiktok.com/@melties.world" target="_blank" rel="noopener">動画で見る</a>`;
  modal.hidden = false;
}
document.getElementById("rail").addEventListener("click", e=>{
  const b = e.target.closest(".ch"); if(b) openChar(+b.dataset.i);
});
const closeModal = ()=> modal.hidden = true;
document.getElementById("modalX").addEventListener("click", closeModal);
modal.addEventListener("click", e=>{ if(e.target===modal) closeModal(); });

// ---- scroll fade-in ----
const io = new IntersectionObserver((es)=>{
  es.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add("in"); io.unobserve(en.target);} });
}, {threshold:0.15});
document.querySelectorAll(".reveal").forEach(el=>io.observe(el));
