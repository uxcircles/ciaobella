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

## 內部筆記

原網站檢視結果、待店家確認事項和 pitch 資料放在本機的 `.private/`（已被 `.gitignore` 排除，不會進 git）。

第一次 clone 後啟用 git hooks：

```
git config core.hooksPath .githooks
```

之後每次 commit / push 會擋下 `.private/` 的檔案和 `.private/blocklist.txt` 裡的敏感字詞，並列出 `.private/NOTES.md` 裡未完成的待辦。隨時查看：`sh .githooks/remind.sh`
