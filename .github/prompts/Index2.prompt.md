# 世界時鐘開發規格書

## 專案概述
此頁面提供世界時鐘功能，讓使用者能夠方便查看不同時區的時間，適用於需要跨國協作或旅行規劃的使用場景。

## 檔案位置
- **前端檢視**: `/Users/qiuzili/DemoMVC/DemoMVC/Views/Home/index2.cshtml`
- **控制器**: `/Users/qiuzili/DemoMVC/DemoMVC/Controllers/HomeController.cs` (需新增 Index2 Action)
- **樣式表**: `/Users/qiuzili/DemoMVC/DemoMVC/wwwroot/css/site.css` (需新增樣式)
- **JavaScript**: 嵌入在 Razor 檢視中或獨立 JS 檔案

## 功能需求

### 核心功能
1. **時間顯示**
   - 正中間顯示主要時間 (預設為本地時間)
   - 下方網格式排列顯示其他城市時間
   - 時間格式：24 小時制 `HH:mm:ss`
   - 時區標示：城市名稱 + 時區縮寫 (如 GMT+8)

2. **城市時區列表**
   - 台北 (GMT+8)
   - 東京 (GMT+9)
   - 倫敦 (GMT+0/GMT+1)
   - 紐約 (GMT-5/GMT-4)
   - 洛杉磯 (GMT-8/GMT-7)
   - 巴黎 (GMT+1/GMT+2)
   - 柏林 (GMT+1/GMT+2)
   - 莫斯科 (GMT+3)
   - 新加坡 (GMT+8)
   - 悉尼 (GMT+10/GMT+11)

3. **互動功能**
   - 點選任一城市時間，該時間移至正中間成為主要顯示
   - 原主要時間移至下方城市列表中
   - 提供視覺回饋效果 (hover、點選動畫)

4. **即時更新**
   - 每秒更新所有時間顯示
   - 自動處理夏令時間轉換
   - 日期變更時自動更新

5. **日期顯示**
   - 右下角顯示當前日期
   - 格式：`YYYY-MM-DD`
   - 跟隨主要時間的時區

## 技術規格

### 前端技術棧
- **框架**: ASP.NET Core MVC Razor Pages
- **樣式**: Bootstrap 5 + 自訂 CSS
- **腳本**: JavaScript (ES6+) + jQuery
- **圖示**: Bootstrap Icons 或 Font Awesome
- **字體**: 等寬字體確保時間顯示對齊

### 響應式設計
- **桌面版** (≥1200px): 3x4 網格佈局
- **平板版** (768px-1199px): 2x6 網格佈局  
- **手機版** (<768px): 1x12 垂直排列

### 瀏覽器相容性
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 介面設計規格

### 版面配置
```
+------------------------------------------+
|              頁面標題                      |
+------------------------------------------+
|                                          |
|          主要時間顯示區                    |
|        (城市名稱 HH:mm:ss)                |
|                                          |
+------------------------------------------+
|  城市1   |  城市2   |  城市3   |  城市4   |
| HH:mm:ss | HH:mm:ss | HH:mm:ss | HH:mm:ss |
+----------+----------+----------+----------+
|  城市5   |  城市6   |  城市7   |  城市8   |
| HH:mm:ss | HH:mm:ss | HH:mm:ss | HH:mm:ss |
+----------+----------+----------+----------+
|                              YYYY-MM-DD |
+------------------------------------------+
```

### 色彩配置
- **主背景**: #f8f9fa (淺灰)
- **主要時間區**: #ffffff (白色) + 陰影效果
- **城市時間卡片**: #ffffff (白色) + 邊框
- **文字顏色**: 
  - 城市名稱: #495057 (深灰)
  - 時間數字: #212529 (黑色)
  - 日期: #6c757d (中灰)
- **互動效果**: 
  - Hover: #e9ecef (淺灰背景)
  - Active: #007bff (藍色邊框)

### 字體規格
- **城市名稱**: 16px, font-weight: 500
- **主要時間**: 48px, font-weight: 700, monospace
- **城市時間**: 24px, font-weight: 600, monospace
- **日期顯示**: 14px, font-weight: 400

## 實作細節

### JavaScript 功能
1. **時間計算函式**
   ```javascript
   - getCurrentTimeByTimezone(timezone)
   - formatTime(date)
   - updateAllClocks()
   - switchMainClock(cityData)
   ```

2. **事件處理**
   - 城市卡片點選事件
   - 定時器管理 (setInterval)
   - 頁面載入初始化

3. **資料結構**
   ```javascript
   const cities = [
     { name: '台北', timezone: 'Asia/Taipei', offset: '+8' },
     { name: '東京', timezone: 'Asia/Tokyo', offset: '+9' },
     // ...其他城市
   ];
   ```

### CSS 動畫效果
- 時間切換淡入淡出效果 (0.3s)
- 卡片hover縮放效果 (transform: scale(1.05))
- 點選ripple效果

### 效能考量
- 使用 `requestAnimationFrame` 優化渲染
- 避免頻繁的 DOM 操作
- 記憶體洩漏防護 (清理定時器)

## 測試需求

### 功能測試
- [ ] 時間顯示正確性驗證
- [ ] 時區轉換準確性測試
- [ ] 城市切換功能測試
- [ ] 響應式佈局測試
- [ ] 跨瀏覽器相容性測試

### 使用者體驗測試
- [ ] 載入速度測試 (<2秒)
- [ ] 互動回應時間 (<100ms)
- [ ] 視覺效果流暢度
- [ ] 無障礙功能支援

## 部署注意事項
- 確保伺服器時區設定正確
- CDN 資源載入穩定性
- 行動裝置觸控事件支援
- SEO 友善的標題和描述

## 未來擴充功能
- 自訂城市新增/移除
- 12/24小時制切換
- 時區搜尋功能
- 主題色彩切換
- 鬧鐘提醒功能
