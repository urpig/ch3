# 第三章｜電解質與酸鹼鹽

小葵與阿公的煉金冒險：皇帝最後的製鹽委託。

12張故事卡片、5個操作實驗、35題測驗、學習紀錄與顧問證書。

## 使用

直接開啟根目錄 index.html，或執行 node server.mjs 後開啟 http://127.0.0.1:4183/electrolytes/index.html 。

## 建置與測試

需要 Node.js 24，無額外套件。

```sh
node build.mjs
node --test tests/electrolytes/science.test.mjs
```

模組原始碼在 dist/electrolytes/；共用角色與樣式在 dist/assets/、dist/chemistry/。

知識點覆蓋與品質檢查見 docs/electrolytes/。50項自動測試通過；完整瀏覽器操作驗收尚待完成。本次只上傳原始碼，未啟用GitHub Pages。
