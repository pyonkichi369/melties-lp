// ===== i18n (EN main, JP toggle) =====
const I18N = {
  en: { watch:"Watch on TikTok", friends:"Meet the Melties", swipe:"Swipe → tap a Meltie",
        story:"Story", latest:"Latest Melties", seeall:"See all on TikTok",
        world:"World", more:"…and more, coming soon.", goods:"Goods", soon:"Coming Soon",
        game:"Meltie Catch", gamehint:"Tap the falling Melties!",
        follow:"Follow us", love:"Made with Love.", loves:"Loves", personality:"Personality",
        modalcta:"Watch on TikTok", toggle:"日本語" },
  jp: { watch:"TikTokで見る", friends:"なかまたち", swipe:"よこにスクロール → タップでプロフィール",
        story:"ストーリー", latest:"最新の Melties", seeall:"TikTokで全部見る",
        world:"ワールド", more:"…ほかにも、近日公開。", goods:"グッズ", soon:"近日公開",
        game:"メルティキャッチ", gamehint:"落ちてくるメルティをタップ！",
        follow:"フォローする", love:"Made with Love.", loves:"好きなもの", personality:"せいかく",
        modalcta:"動画で見る", toggle:"English" },
};

const CHARS = [
  {key:"melty",   en:"Melty",     c:"pink", like:{en:"Everyone",jp:"みんな"},          p:{en:"A curious leader who brings everyone together.",jp:"好奇心旺盛・みんなを集めるリーダー"}},
  {key:"game",    en:"Game",      c:"lav",  like:{en:"Games",jp:"ゲーム"},             p:{en:"Zones out completely when focused.",jp:"集中すると周りが見えなくなる"}},
  {key:"book",    en:"Book",      c:"lav",  like:{en:"Reading",jp:"読書"},            p:{en:"Calm and endlessly curious.",jp:"おだやかで好奇心いっぱい"}},
  {key:"screen",  en:"Screen",    c:"mint", like:{en:"Videos & streams",jp:"動画・配信"},p:{en:"Bright — soaks up way too much info.",jp:"明るい・情報を吸収しすぎ"}},
  {key:"popcorn", en:"Popcorn",   c:"pop",  like:{en:"Movies",jp:"映画"},             p:{en:"Cheerful and always excited.",jp:"明るくてワクワク大好き"}},
  {key:"icecream",en:"Ice Cream", c:"pink", like:{en:"Ice cream",jp:"アイス"},        p:{en:"Sweet — makes everyone smile.",jp:"やさしくて、みんなをえがおに"}},
  {key:"sleep",   en:"Sleep",     c:"lav",  like:{en:"Naps",jp:"お昼寝"},             p:{en:"Mellow and sleepy.",jp:"おだやか・のんびり星"}},
];
const STORY = {
  en:["One day, Melty woke up<br>in a world with no one else.","So began a journey<br>to find friends.","Little by little,<br>the friends grow."],
  jp:["ある日、Meltyは<br>まだ誰もいない世界で<br>目を覚ました。","仲間を探す旅へ。","毎日少しずつ、<br>仲間が増えていく。"],
};
const WORLD = [{en:"Meltie World",jp:"めるてぃーわーるど",img:"meltworld"},{en:"Candy Land",jp:"キャンディランド",img:"candy"},{en:"Cinema",jp:"映画館",img:"cinema"},{en:"Arcade",jp:"ゲームセンター",img:"arcade"},{en:"Library",jp:"図書館",img:"library"},{en:"Dreamland",jp:"夢の国",img:"dreamland"}];
const GOODS = [{en:"Plush",jp:"ぬいぐるみ"},{en:"Stickers",jp:"ステッカー"},{en:"LINE Stickers",jp:"LINEスタンプ"},{en:"Apparel",jp:"アパレル"},{en:"Figures",jp:"フィギュア"}];

// ===== latest TikTok videos =====
// Add real posts here as they go live: {url:"https://www.tiktok.com/@melties.world/video/123", thumb:"images/tiktok/1.jpg"}
// thumb is optional (falls back to a gradient play-card). Empty array = teaser cards linking to the profile.
const TIKTOK_PROFILE = "https://www.tiktok.com/@melties.world";
const VIDEOS = [];

let LANG = localStorage.getItem("melties_lang") || "en";

// characters that have a 3D model in models/<key>.glb (others fall back to the PNG)
const GLB_CHARS = new Set(["melty"]);
const charView = (c) => GLB_CHARS.has(c.key)
  ? `<model-viewer class="ch-3d" src="models/${c.key}.glb" alt="${c.en} 3D figure" camera-controls auto-rotate
       touch-action="pan-y" disable-zoom shadow-intensity="1.1" exposure="1.15"
       camera-orbit="0deg 78deg 3.4m" min-camera-orbit="auto 60deg auto" max-camera-orbit="auto 95deg auto"></model-viewer>`
  : charImg(c.key, c.en);

const charImg = (k, en) =>
  `<div class="ch-art ph"><img src="images/characters/${k}.png" alt="${en}, a Melties character"
     onerror="this.closest('.ch-art').classList.add('ph')" onload="this.closest('.ch-art').classList.remove('ph')">
   <span class="ph-label">${en}</span></div>`;

function ttCards(){
  if(VIDEOS.length){
    return VIDEOS.map((v,i)=>`
      <a class="tt-card reveal" style="--d:${i*60}ms" href="${v.url}" target="_blank" rel="noopener" data-track="latest-video">
        ${v.thumb?`<img class="tt-thumb" src="${v.thumb}" alt="Latest Melties video" loading="lazy">`:""}
        <span class="tt-play">▶</span></a>`).join("");
  }
  return Array.from({length:4},(_,i)=>
    `<a class="tt-card reveal" style="--d:${i*60}ms" href="${TIKTOK_PROFILE}" target="_blank" rel="noopener" data-track="latest-teaser"><span class="tt-play">▶</span></a>`).join("");
}

function render() {
  const t = I18N[LANG];
  document.documentElement.lang = LANG === "jp" ? "ja" : "en";
  document.querySelectorAll("[data-i18n]").forEach(el => el.textContent = t[el.dataset.i18n] || "");
  document.getElementById("langToggle").textContent = t.toggle;

  document.getElementById("rail").innerHTML = CHARS.map((c,i)=>`
    <button class="ch c-${c.c} reveal" style="--d:${i*60}ms" data-i="${i}">
      ${charImg(c.key,c.en)}<span class="ch-name">${c.en}</span></button>`).join("");
  document.getElementById("story").innerHTML = STORY[LANG].map(s=>`<p class="reveal">${s}</p>`).join("");
  document.getElementById("tiktokRail").innerHTML = ttCards();
  document.getElementById("world").innerHTML = WORLD.map((w,i)=>`<div class="tile reveal" style="--d:${i*50}ms"><div class="tile-img"><img src="images/world/${w.img}.jpg" alt="${w.en} — a Melties world" loading="lazy"></div><span>${w[LANG]}</span></div>`).join("");
  document.getElementById("goods").innerHTML = GOODS.map((g,i)=>`<div class="tile reveal" style="--d:${i*50}ms"><div class="tile-ph"></div><span>${g[LANG]}</span></div>`).join("");

  setupReveal();
  injectLD();
}

// ===== character modal (a11y: Esc, focus return, aria) =====
const modal = document.getElementById("modal"), modalCard = document.getElementById("modalCard");
const modalX = document.getElementById("modalX");
let lastFocus = null;
function openChar(i){
  const c = CHARS[i], t = I18N[LANG];
  lastFocus = document.activeElement;
  modalCard.className = "modal-card c-"+c.c;
  modalCard.innerHTML = `${charView(c)}<h3>${c.en}</h3>
    <dl><dt>${t.loves}</dt><dd>${c.like[LANG]}</dd><dt>${t.personality}</dt><dd>${c.p[LANG]}</dd></dl>
    <a class="cta tiktok small" href="${TIKTOK_PROFILE}" target="_blank" rel="noopener" data-track="modal-tiktok">${t.modalcta}</a>`;
  modal.hidden = false;
  modalX.focus();
}
document.getElementById("rail").addEventListener("click", e=>{ const b=e.target.closest(".ch"); if(b) openChar(+b.dataset.i); });
function closeModal(){ modal.hidden = true; if(lastFocus) lastFocus.focus(); }
modalX.addEventListener("click", closeModal);
modal.addEventListener("click", e=>{ if(e.target===modal) closeModal(); });
document.addEventListener("keydown", e=>{ if(e.key==="Escape" && !modal.hidden) closeModal(); });

// ===== scroll reveal =====
let io;
function setupReveal(){
  if(io) io.disconnect();
  io = new IntersectionObserver(es=>es.forEach(en=>{ if(en.isIntersecting){ en.target.classList.add("in"); io.unobserve(en.target);} }), {threshold:0.12});
  document.querySelectorAll(".reveal").forEach(el=>io.observe(el));
}

// ===== outbound click tracking (vendor-agnostic; no-op if no analytics present) =====
function trackOutbound(name){
  if(window.plausible) window.plausible(name);
  else if(window.gtag) window.gtag("event","click",{event_label:name});
  else if(window.umami) window.umami.track(name);
}
document.addEventListener("click", e=>{ const a=e.target.closest("[data-track]"); if(a) trackOutbound(a.dataset.track); });

// ===== GEO / AI-search structured data (JSON-LD) =====
function injectLD(){
  const desc = LANG==="en"
    ? "Melties are the world's cutest melting friends — a short-form character world posted daily on TikTok."
    : "Meltiesは世界一かわいい、とろける仲間たち。毎日TikTokに投稿されるショートアニメの世界。";
  const data = {
    "@context":"https://schema.org","@graph":[
      {"@type":"Organization","@id":"https://melties.world/#org","name":"Melties","url":"https://melties.world/",
       "logo":"https://melties.world/images/logo.png","description":desc,
       "sameAs":["https://www.tiktok.com/@melties.world","https://www.instagram.com/melties.world"]},
      {"@type":"WebSite","@id":"https://melties.world/#site","url":"https://melties.world/","name":"Melties",
       "inLanguage":LANG==="en"?"en":"ja","publisher":{"@id":"https://melties.world/#org"}},
      {"@type":"ItemList","name":"Melties characters","itemListElement":
        CHARS.map((c,i)=>({"@type":"ListItem","position":i+1,"item":{"@type":"Character","name":c.en,
          "description":c.p["en"],"image":`https://melties.world/images/characters/${c.key}.png`}}))}
    ]};
  document.getElementById("ldjson").textContent = JSON.stringify(data);
}

// ===== lang toggle =====
document.getElementById("langToggle").addEventListener("click", ()=>{
  LANG = LANG==="en"?"jp":"en"; localStorage.setItem("melties_lang", LANG); render();
});

render();
