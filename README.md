# 小滿麵屋

繁體中文的料理探索與餐廳經營網頁遊戲。

## 開始遊玩

下載整個儲存庫並解壓縮，用瀏覽器開啟根目錄的 `index.html`。頁面會讀取同資料夾內的 `src/` 與 `assets/`。

遊戲進度自動儲存在目前瀏覽器，切到其他分頁時暫停。

## 檔案導覽

```text
xiaoman-noodle/
├── index.html                 首頁結構與載入入口
├── README.md                  使用方式與程式導覽
├── assets/
│   └── css/
│       └── style.css          共用版面、配色與手機版樣式
└── src/
    ├── game/
    │   └── rules.js           料理模型、資金、營業時間、成就與存檔
    ├── learning/
    │   └── resources.js       廚藝書、示範動畫、免費模擬器
    └── ui/
        ├── app.js             按鈕操作、視窗、手帳、評價與成就介面
        ├── scene.js           餐廳地圖、角色移動與設施互動
        └── kitchen.js         鍋內動畫、火焰、蒸氣、下麵與補水
```

根目錄另有 `.nojekyll`，供靜態網站服務直接提供檔案。

## 要改哪裡

| 想調整的內容                 | 對應檔案                    | 閱讀位置                                               |
| ---------------------------- | --------------------------- | ------------------------------------------------------ |
| 啟動資金、營業與休息時間     | `src/game/rules.js`         | `newState`、`SHIFT`、`BREAK`                           |
| 火力、熟度、蒸發與燃料費     | `src/game/rules.js`         | `cookStep`、`addNoodles`、`serve`                      |
| 成就條件與保存               | `src/game/rules.js`         | `achievementDefinitions`、`unlock`、`recordExperiment` |
| 學習資源內容與模擬比較       | `src/learning/resources.js` | `book`、`demo`、`simulator`                            |
| 成就問號、解鎖通知與出餐結果 | `src/ui/app.js`             | `station`、`showAchievementsNotice`                    |
| 餐廳場景與移動方式           | `src/ui/scene.js`           | `initScene`                                            |
| 料理時看到的動畫             | `src/ui/kitchen.js`         | `startKitchenAnimation`                                |
| 版面尺寸、字體、顏色         | `assets/css/style.css`      | 各介面選擇器與 `@media`                                |

## 程式如何連接

`index.html` 先載入遊戲規則與繪圖、學習模組，最後載入 `src/ui/app.js` 綁定按鈕與啟動遊戲。

- `Game.s` 保存目前狀態，`Game.act()` 處理玩家操作，`Game.tick()` 推進遊戲時間。
- 爐台與免費模擬器共用 `cookStep()`、`addNoodles()`，讓試驗與實際料理遵循同一組規則。
- `startKitchenAnimation()` 讀取目前的鍋內狀態繪製動畫。
- `showLesson()` 開啟廚藝書、示範動畫或免費模擬器。
- `initScene()` 將玩家點選的設施交給介面開啟。

## 遊戲內容

| 類別     | 內容                                             |
| -------- | ------------------------------------------------ |
| 學習     | 廚藝書、可暫停示範動畫、免費料理模擬器           |
| 料理     | 冷水升溫、下麵降溫、試吃、補水、火力與燃料成本   |
| 經營     | 開業前籌備、營業接單、打烊休息、超時扣減營業時間 |
| 成長     | 廚具升級、進階細麵、七項探索成就                 |
| 成就顯示 | 未解鎖先顯示 `???`，達成後揭露名稱與條件         |

初始資金為 180 元，每輪營業 120 秒，打烊休息額度 45 秒。遊戲時間與料理模型經過簡化，供課堂探索。
