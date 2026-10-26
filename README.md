# 第三章｜電解質與酸鹼鹽

小葵與阿公的煉金冒險：皇帝最後的製鹽委託。

公開網站：https://urpig.github.io/ch3/ （免登入）

12 張故事卡片、5 個操作實驗、35 題測驗、138 個科學名詞、學習紀錄與顧問證書。側欄沿用第一章風格，徽章改為鹽山。

## 使用

直接開啟根目錄 index.html，或執行 node server.mjs 後開啟 http://127.0.0.1:4183/electrolytes/index.html 。學習紀錄保存在使用者自己的瀏覽器，無須帳號。

## 建置與測試

需要 Node.js 24，無額外套件。

```sh
node build.mjs
node --test tests/electrolytes/*.test.mjs
```

2026-10-26：56 項自動測試通過。模組原始碼在 dist/electrolytes/；共用角色與樣式在 dist/assets/、dist/chemistry/。知識點覆蓋、模型限制與歷次品質檢查見 docs/electrolytes/。

GitHub Pages 使用 main 分支根目錄的 index.html。

待續：小葵與阿公視察古代鹽田的新插畫、五張實驗卡的器材操作升級，尚未整合到本次版本。
