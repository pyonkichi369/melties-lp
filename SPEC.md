# Melties LP 仕様（TikTokメイン）

> operator提供 2026-06-29。LP=「読むページ」でなく**3秒で世界観が伝わり、フォローしたくなるページ**。

## コンセプト
世界一かわいい「とろける仲間たち」。毎日1本、Meltyたちの日常を投稿するショートアニメ。

## ターゲット
6〜25歳 / かわいいキャラ好き / ちいかわ・サンリオ・モルカー・たまごっち世代 / TikTokユーザー

## LP構成
1. **Hero**: 大きな集合画像 + タイトル「Melties」+ "Every Day Melts Better." + ボタン「▶ TikTokで見る」
2. **キャラクター紹介**: カード横スクロール（Melty/GAME/BOOK/SCREEN/POPCORN/ICECREAM/SLEEP）→ クリックでプロフィール
3. **Story**: 「ある日、Meltyはまだ誰もいない世界で目を覚ました。」→ 仲間を探す旅へ → 毎日少しずつ仲間が増えていく
4. **TikTok**: 最新動画（縦動画埋め込み・スクロール可）
5. **Character Gallery**: 一覧（イラスト/名前/好きなもの/性格）
6. **World**: とろける世界/キャンディランド/映画館/ゲームセンター/図書館/夢の国（今後追加）
7. **Goods**: Coming Soon（ぬいぐるみ/ステッカー/LINEスタンプ/アパレル/フィギュア）
8. **SNS**: TikTok/Instagram/YouTube Shorts/X
9. **Footer**: © Melties / Made with Love.

## UI
- 背景: クリーム色 / アクセント: ピンク・水色・黄色・紫
- 影: 柔らかい / 角丸30px / カードUI: ガラス風

## アニメーション
ロゴぷるぷる / 文字とろける / カードぷにっと浮く / ボタン押下ぷるん / スクロールフェード

## 技術（operator指定）
Next.js / TypeScript / TailwindCSS / Framer Motion / Cloudflare Pages / Cloudflare Images / R2 / YouTube・TikTok Embed / SEO / OGP / PWA / レスポンシブ / Lighthouse 95+

## 投稿ロードマップ（1日1キャラ/1日1話）
1. 自己紹介（7人）2. 出会い編 3. 日常編 4. ケンカ編 5. 仲直り編 6. 新キャラ登場 7. 季節イベント 8. グッズ・LINEスタンプ展開
→ TikTok→LP流入者が世界観・キャラ・ストーリーを自然に理解できる構成

## 依存（未充足）
- キャラ透過アート7体・集合画像（Heroの大画像）= まだ無い（プレースホルダー）
- TikTok動画URL（埋め込み用）= 投稿が増えてから
- ロゴ = `assets/bumpers/logo.png`（透過・® 除去済み）流用可
