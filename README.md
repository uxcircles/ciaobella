# Ciao Bella — 網站改版提案

純靜態網站（HTML / CSS / JS），不需要建置步驟，任何靜態主機都能直接部署。

> **概念設計展示**：這是由 [UX CIRCLES](https://ux-circles.com/web) 設計的改版提案，並非 Ciao Bella 官方網站。
> 每頁頂端有「Concept」標示列，所有頁面都設為 `noindex`，`robots.txt` 也禁止搜尋引擎收錄，避免和官方網站搶搜尋結果。
> 如果店家正式採用：刪掉各頁的 `.concept-bar`、`<meta name="robots" content="noindex, nofollow">`，並把 `robots.txt` 改回 `Allow: /`。

## 設計概念：「Sotto la tenda」（在遮陽棚下）

不套用義大利餐廳常見的紅白綠三色旗＋格子桌巾模板，而是從這家店自己的實體細節取材：

| 店裡的東西 | 網站上變成 |
|---|---|
| 門口寶藍色遮陽棚、金色印著 020 7242 4119 | 頁首就是那片遮陽棚：寶藍底、金字電話、底部有波浪垂邊 |
| 牆上掛滿義大利老電影明星的黑白照 | 「La parete」照片牆：深色畫框、金色銘牌、歪歪的沙龍式掛法 |
| 櫥窗的紅色霓虹燈「Pizza Pasta Piano Bar」| 「Piano Bar」霓虹字，捲到時會閃一下亮起 |
| 每晚駐店鋼琴師 | 一段可以彈的鋼琴鍵盤（點擊或用電腦鍵盤 A–; 彈） |
| 淡藍色桌巾 | 菜單區的底色與織紋 |
| 主廚特餐 | 黑板（Lavagna）手寫風格 |
| 100 多款酒 | 「酒架」：每支瓶子代表一個產區，高度＝款數，點了直接跳到酒單該產區 |
| 聖誕套餐 | 一張紅色票券 |

字體：Bodoni Moda（Bodoni 本來就是義大利字體）＋ Instrument Sans；黑板用 Caveat。

## 檔案結構

```
index.html     首頁：主廚特餐、完整菜單（含素食篩選）、鋼琴吧、酒架、店史、照片牆、聚餐/聖誕、交通與營業時間
cantina.html   完整酒單：依顏色、產區、預算篩選
it/            義大利文版（index / cantina），頁首右側的 IT / EN 切換
styles.css     全站樣式
main.js        互動：營業狀態、菜單篩選與目錄、鋼琴、照片燈箱、酒單篩選、手機底部列
assets/press/  媒體報導 logo（Zagat、Time Out、Evening Standard、Harden’s、The Observer、The Independent、Business Traveller、olive、The Irish Times）
assets/img/    照片（WebP，每張 640 寬與大圖兩種）、og.jpg 分享圖、badge.webp（原本的偉士牌女郎標誌）
favicon.svg, apple-touch-icon.png, robots.txt
_redirects     舊網址轉址（Netlify / Cloudflare Pages）
vercel.json    舊網址轉址＋快取設定（Vercel）
```

## 本機預覽

```bash
python3 -m http.server 5173
```

然後打開 http://localhost:5173 。

## 部署

- **Netlify**：把整個資料夾拖到 app.netlify.com/drop，會自動讀取 `_redirects`。
- **Cloudflare Pages**：建立專案，選「直接上傳」。同樣會讀取 `_redirects`。
- **Vercel**：在資料夾裡執行 `npx vercel`，會讀取 `vercel.json`。

舊 WordPress 網址（`/our-menu`、`/our-wines`、`/contact-us`…）都會 301 轉到新頁面對應的位置。

## 日常更新

| 要改什麼 | 改哪裡 |
|---|---|
| 菜色／價格 | `index.html` **和** `it/index.html` 的 `#menu` 區塊（`data-diet` 填 `v` 素食、`vg` 素食可做純素、`vg+` 純素，用來篩選） |
| 主廚特餐 | 中英文 `index.html` 的 `.board` 黑板區塊，記得改「chalked up」日期 |
| 酒單 | `cantina.html` **和** `it/cantina.html`，每支酒的 `data-style`（rosso / bianco / bollicine / rosato / dolce）和 `data-price` 用來篩選；首頁酒架的瓶子數字也要跟著改 |
| 營業時間 | `main.js` 的 `HOURS` 和 `CLOSED`（聖誕休假），**以及** 兩個 `index.html` 的營業時間表與 JSON-LD（義大利文版用 24 小時制） |
| 改了 CSS／JS | 把四個頁面的 `styles.css?v=…`、`main.js?v=…` 版本號 +1 |

## 上線前待確認

內容取自官網（2026-10-30 抓取），已修正明顯錯字（Garlic Bred、Sward Fish、Leak、DOSG→DOCG、Bolghieri、Iripina 等）。

還需要店家確認：
- [ ] **營業時間不一致**：首頁寫週三至週六到 10.15pm，Contact 頁寫到 10.30pm。網站目前用 10.15pm。
- [ ] 酒單年份可疑：Cannonau「20121」、Langhe Nebbiolo「20221」（目前改成 2021），Brunello Tenuta Nuova 2015 同時出現 £260 兩次（已合併）、Chianti Classico Borgo Salcetino 有 £35 和 £54.50 兩個價格（目前用 £35）。
- [ ] 11% 服務費只在聖誕菜單頁看到，平常菜單是否也收？
- [ ] 聖誕休假：最後營業 2026/12/23，2027/1/4 重新開門（來自官網公告圖）。
- [ ] 義大利文版請母語人士再順一次（菜名本來就是義大利文，主要是說明文字和菜色描述）。
- [ ] 鋼琴吧介紹裡的曲目（Dean Martin、Modugno、Paolo Conte）是示意文案，請換成鋼琴師實際常彈的。
- [ ] 照片多是 2014–2016 年拍的，解析度只有 1000px 左右；若正式採用，建議重拍菜色與店內（尤其是遮陽棚和霓虹燈）。
- [ ] 媒體報導清單取自官網 Press 頁的剪報檔名。logo 取自各刊物官網／Wikipedia，網站上統一轉成單色並做成跑馬燈（滑鼠移上去會暫停；系統開啟「減少動態效果」時改成靜態排列）。Zagat 和 Business Traveller 是依官方 logo 重繪的向量檔（Business Traveller 用相近的 Archivo 字體轉外框），若店家能取得官方原檔，可直接覆蓋 `assets/press/` 裡同名檔案。Londra Sera 找不到 logo，先拿掉。
- [ ] 刊物 logo 是各家商標，用在「曾報導」區塊屬一般用法，正式上線前請店家確認報導屬實。
