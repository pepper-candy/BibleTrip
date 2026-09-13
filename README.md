# 讀經旅行團｜2026 信心之旅

中華宣道會大坑東堂青少年部「聖經旅行團／三年讀經之旅」第 3 季（2026 年 8–10 月）用的網頁。主持人建立活動、用短邀請碼或連結邀請參加者；參加者在手機瀏覽器打開即可讀當日**和合本**經文，並按「完成閱讀」。主持人可看到誰完成、何時完成（香港時間）。

無需安裝 App，也無需登入帳號。

## 本季範圍

使徒行傳 20–28、羅馬書、哥林多前後書、加拉太書、以弗所書、腓立比書、歌羅西書，以及每日箴言。共 92 天（2026-08-01 至 2026-10-31）。時區以 **Asia/Hong_Kong** 計算「今天」。

行程資料：[`data/schedule-2026-q3.json`](data/schedule-2026-q3.json)  
預載經文：[`data/readings.json`](data/readings.json)

## 本地執行

需要 Node.js 20+。

```bash
npm install
npm run dev
```

預設開發埠為 `43173`：<http://127.0.0.1:43173>

未設定 Redis 時，完成紀錄會寫入本機 `.data/store.json`（已 gitignore），重新整理開發伺服器後仍在。

```bash
npm run lint
npm run build
npm start
```

重新由公開和合本資料產生 `data/readings.json`：

```bash
npm run build:readings
```

腳本會下載 [`seven1m/open-bibles`](https://github.com/seven1m/open-bibles) 的 `chi-cuv.usfx.xml` 到 `data/cache/`（不進版控），再依行程抽出 92 天經文。

## 邀請如何運作

1. **主持人**在首頁選「我是主持人」，建立本季活動。瀏覽器會寫入主持 cookie，並顯示：
   - 6 位邀請碼
   - 可分享連結 `/j/邀請碼`
   - QR
   - **主持密鑰**（換裝置時貼上即可回到主持頁）
2. **參加者**打開連結或在「我是參加者」輸入邀請碼，填顯示名稱。瀏覽器記住該活動的參加者身分。
3. 進入 `/t/邀請碼` 即見**今日**和合本（新約段落 + 箴言）。可切換其他日期閱讀；「完成閱讀」記錄的是**所選那一天**。
4. 主持頁列出當日完成者姓名與香港時間時間戳，並顯示 `已完成 / 已加入`。可切換過去日期。

沒有使用者帳號。身分只存在 cookie + 伺服器上的邀請碼紀錄。

## Vercel 部署

1. 將此專案接到 Vercel（Next.js 預設設定即可）。
2. 在 [Upstash](https://upstash.com/) 建立 Redis 資料庫，或在 Vercel 安裝 Upstash / Vercel KV 整合。
3. 設定環境變數（擇一組即可）：

| 名稱 | 說明 |
| --- | --- |
| `UPSTASH_REDIS_REST_URL` | Upstash REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | Upstash REST token |
| `KV_REST_API_URL` | Vercel KV 的同等 URL |
| `KV_REST_API_TOKEN` | Vercel KV 的同等 token |

沒有 Redis 時，正式環境只會用行程記憶體，**不同 serverless 實例之間不會共享完成紀錄**。多人同時使用請務必接上 Upstash / KV。

Cookie 在正式環境會設 `Secure`。請用 HTTPS 網域分享邀請連結。

## 和合本經文來源

參加者看到的經文是預先打包的**繁體和合本**，不是即時呼叫第三方 API。

- 譯本：和合本 Chinese Union Version（1919），繁體、神版（「神」而非「上帝」）
- 檔案：`chi-cuv.usfx.xml`
- 來源庫：[seven1m/open-bibles](https://github.com/seven1m/open-bibles)（標示 Public Domain）
- 授權：1919 年和合本在多數司法管轄區已屬公有領域。香港聖經公會曾在港、澳主張權利；本專案依該公開資料集與教會內部使用慣例收錄，僅供本團讀經，不作商業轉售。

產生腳本：[`scripts/build-readings.mjs`](scripts/build-readings.mjs)

## 技術

- Next.js App Router、TypeScript、Tailwind CSS、shadcn/ui
- 共用狀態：Upstash Redis（正式）／本機 JSON（開發）
- 適合部署到 Vercel serverless
