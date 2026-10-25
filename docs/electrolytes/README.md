# 皇帝最後的製鹽委託
國二下第三章《電解質與酸鹼鹽》，加入既有 `work/lost-forge` 平台。只在本機保存，未推送或部署。

## 開啟

- 最方便：開啟 `C:/Users/rlife/Desktop/k12/outputs/salt-adventure.html`。CSS、程式與角色圖片均已內嵌，不需網路或安裝套件。
- 模組版：在 `work/lost-forge` 執行 `node preview-electrolytes.mjs`，再開啟 `http://127.0.0.1:4183/electrolytes/index.html`。
- 原有伺服器仍可使用 `node server.mjs`，新增路由為 `/electrolytes/index.html#salt-1`。
- 本次工具無法連入本機預覽，完整瀏覽器操作尚未驗證；詳見 QA-REPORT.md。

## 已實作

- 12 張連續卡片，5 個操作模型、7 張故事／動畫／圖解／評量卡。
- 35 題含提示與各選項診斷：每卡1題、3次階段挑戰共9題、6項驗收、8題最終挑戰。
- 五個實驗共享純函式科學模型；參數變動直接改變讀數、器材畫面與質量／離子帳。
- 預測、觀察完成狀態、作答、最近20次嘗試、筆記及實驗紀錄存於瀏覽器本機。
- 匯出學習紀錄 JSON、單卡重設、全章重設、減少動態、鍵盤可用控制、模型放大。
- 最終八題答對後顯示可列印證書；本章全部掌握另需每卡預測、觀察與相關評量完成。
- 沿用既有小葵／阿公表情圖、第一章設計樣式及雜湊卡片路由；沿用第二章的時空裝置返家。
- 既有第一、二章入口新增第三章連結；三章單檔輸出之相對連結同步修正。

## 檔案

|檔案|用途|
|---|---|
|dist/electrolytes/index.html|第三章入口、側欄、封面、來源與重設入口|
|dist/electrolytes/styles.css|沿用既有設計之第三章樣式及響應式規則|
|dist/electrolytes/data.js|十二卡故事、教學內容、35題、酸鹼與鹽類資料|
|dist/electrolytes/core.js|平衡、導電、中和、沉澱與結晶模型|
|dist/electrolytes/art.js|器材、離子、皇宮、鹽井、鹽田、時空裝置 SVG|
|dist/electrolytes/labs.js|五個操作實驗、驗證輸入、參數、紀錄與動畫|
|dist/electrolytes/app.js|卡片、路由、預測、評量、進度、筆記與證書|
|tests/electrolytes/science.test.mjs|50項模型、邊界、內容、保存與建置檢查|
|build-electrolytes.mjs|產生內嵌資產的離線HTML|
|preview-electrolytes.mjs|僅綁定127.0.0.1的本機預覽伺服器|
|render-electrolytes-diagrams.mjs|可選的模型圖渲染檢查；需runtime的sharp|
|docs/electrolytes/KNOWLEDGE-COVERAGE.md|逐項知識、課綱、卡片與評量對照|
|docs/electrolytes/QA-REPORT.md|測試、模型假設、已修正與未完成驗收|

既有檔案修改：`dist/index.html`、`dist/chemistry/index.html`、`package.json`、`build.mjs`、`build-chemistry.mjs`。沒有修改第一、二章科學模型或既有角色圖片。修改前副本在 `work/backups/before-electrolytes/`。

## 建置及檢查

Node.js 24；網頁本身不使用外部套件。

```sh
node build-electrolytes.mjs
node --test tests/electrolytes/science.test.mjs
```

若需同時更新第一、二章的離線導覽連結：

```sh
node build-chemistry.mjs
node build.mjs
```

既有回歸測試使用 package.json 中原有的 `test` 腳本；本次環境無 npm 指令，已以 Node 執行該腳本相同的測試清單。新增 `build:electrolytes`、`test:electrolytes` 方便有 npm 的環境使用。

## 模型與教學界線

精確的數值只在已標示的理想條件內成立。導電是比較分數；pH 使用25°C理想稀溶液；滴定溫度用獨立絕熱模型；沉澱量是完全反應的理論上限；天然鹵水以NaCl/KCl與懸浮泥沙作教學示例。所有製鹽結果都不直接標記可食用。

