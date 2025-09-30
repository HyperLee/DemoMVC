# 3D 互動式地球儀功能開發規格書

## 專案概述
建立一個互動式 3D 地球儀功能,讓使用者能夠透過直觀的操作方式瀏覽全球地理資訊,包含國家邊界、城市位置、地形等地理資料。

## 專案目標
- 提供沉浸式的 3D 地球儀瀏覽體驗
- 實現流暢的使用者互動操作
- 展示豐富的地理資訊內容
- 確保跨平台與跨瀏覽器的相容性
- 優化效能以支援各種裝置

---

## 檔案位置規劃

### 後端檔案結構
- **Controller**: `DemoMVC/Controllers/GlobeController.cs`
- **Models**: 
  - `DemoMVC/Models/GlobeModels.cs` - 地理資料模型
  - `DemoMVC/Models/LocationData.cs` - 地點資料模型
  - `DemoMVC/Models/GlobeSettings.cs` - 地球儀設定模型
- **Services**: 
  - `DemoMVC/Services/IGlobeDataService.cs` - 地理資料服務介面
  - `DemoMVC/Services/GlobeDataService.cs` - 地理資料服務實作
- **Data**: 
  - `DemoMVC/Data/countries.json` - 國家資料
  - `DemoMVC/Data/cities.json` - 城市資料
  - `DemoMVC/Data/landmarks.json` - 地標資料

### 前端檔案結構
- **Views**: `DemoMVC/Views/Globe/Index.cshtml`
- **CSS**: `DemoMVC/wwwroot/css/globe.css`
- **JavaScript**: 
  - `DemoMVC/wwwroot/js/globe.js` - 主要邏輯
  - `DemoMVC/wwwroot/js/globe-controls.js` - 控制元件
  - `DemoMVC/wwwroot/js/globe-data-handler.js` - 資料處理
- **Assets**: 
  - `DemoMVC/wwwroot/images/globe/` - 地球儀材質圖片
  - `DemoMVC/wwwroot/models/` - 3D 模型檔案

---

## 核心功能需求

### 1. 基礎互動功能

#### 1.1 旋轉控制
- **滑鼠拖曳旋轉**
  - 左鍵拖曳: 360° 自由旋轉地球儀
  - 支援慣性滑動效果
  - 旋轉速度可調整
  - 邊界限制: 防止過度旋轉造成視覺混亂

- **觸控裝置支援**
  - 單指滑動旋轉
  - 雙指捏合縮放
  - 支援多點觸控手勢

#### 1.2 縮放功能
- **滑鼠滾輪縮放**
  - 縮放範圍: 1x ~ 10x
  - 平滑縮放動畫
  - 以滑鼠游標位置為中心縮放

- **縮放等級**
  - Level 1 (1x-2x): 全球視角
  - Level 2 (2x-5x): 大陸/區域視角
  - Level 3 (5x-10x): 國家/城市視角

#### 1.3 自動旋轉模式
- **自動播放功能**
  - 開啟/關閉切換按鈕
  - 可調整旋轉速度 (慢速/中速/快速)
  - 旋轉方向可選 (順時針/逆時針)
  - 滑鼠互動時自動暫停

### 2. 地理資訊展示

#### 2.1 地點標記系統
- **標記類型**
  - 首都城市 (紅色標記)
  - 主要城市 (藍色標記)
  - 自然景觀 (綠色標記)
  - 世界遺產 (金色標記)
  - 自訂標記 (使用者可新增)

- **標記互動**
  - 滑鼠懸停顯示地點名稱
  - 點擊顯示詳細資訊面板
  - 標記可開關顯示

#### 2.2 資訊面板
- **地點詳細資訊**
  - 地點名稱 (多語言支援)
  - 經緯度座標
  - 時區資訊
  - 人口資料 (城市)
  - 簡介說明
  - 相關圖片 (選用)
  - 外部連結 (維基百科等)

#### 2.3 圖層系統
- **可切換的圖層**
  - 國家邊界圖層
  - 城市標記圖層
  - 地形圖層 (高度資訊)
  - 氣候區圖層
  - 時區圖層
  - 人口密度熱圖

- **圖層控制**
  - 圖層開關面板
  - 透明度調整
  - 多圖層同時顯示

### 3. 搜尋與導航功能

#### 3.1 地點搜尋
- **搜尋輸入框**
  - 自動完成建議
  - 模糊搜尋支援
  - 支援中英文搜尋
  - 歷史記錄功能

- **搜尋結果**
  - 即時結果顯示
  - 點擊結果自動導航至該地點
  - 平滑動畫過渡

#### 3.2 快速導航
- **預設地點**
  - 常用城市快速選單
  - 各大洲快速導航
  - 使用者收藏地點
  - 最近瀏覽記錄

### 4. 使用者介面設計

#### 4.1 控制面板
- **主要控制項**
  - 旋轉速度滑桿
  - 縮放等級指示器
  - 圖層切換選單
  - 自動旋轉開關
  - 重置視角按鈕
  - 全螢幕切換按鈕

#### 4.2 資訊顯示
- **即時資訊**
  - 目前視角中心的地理資訊
  - 滑鼠指向位置的經緯度
  - 縮放等級顯示
  - 載入進度指示器

#### 4.3 使用者互動回饋
- **視覺回饋**
  - 按鈕懸停效果
  - 點擊動畫效果
  - 載入動畫
  - 錯誤提示訊息
  - 成功操作通知

---

## 技術規格

### 1. 技術選型

#### 1.1 3D 圖形函式庫
- **主要選項**
  - **Three.js** (推薦)
    - 成熟的 WebGL 封裝函式庫
    - 豐富的文件與範例
    - 良好的社群支援
  - **Cesium.js** (進階選項)
    - 專業的地理資訊視覺化函式庫
    - 支援真實地形資料
    - 適合複雜的地理應用

#### 1.2 資料格式
- **GeoJSON** - 地理邊界資料
- **JSON** - 地點資訊資料
- **PNG/JPEG** - 地球材質貼圖
- **TopoJSON** - 優化的地形資料 (選用)

#### 1.3 後端技術
- **ASP.NET Core MVC**
- **C# 語言**
- **RESTful API** - 資料傳輸
- **Entity Framework** (如需資料庫)

### 2. 資料來源與授權

#### 2.1 合法且免費的資料來源
- **Natural Earth** (推薦)
  - 公共領域 (Public Domain)
  - 提供國家邊界、城市等資料
  - 多種解析度選擇
  - 網址: https://www.naturalearthdata.com/

- **OpenStreetMap**
  - ODbL 授權
  - 需要標註來源
  - 豐富的地理資料
  - 網址: https://www.openstreetmap.org/

- **NASA Visible Earth**
  - 公共領域的地球衛星圖
  - 高品質地球貼圖
  - 網址: https://visibleearth.nasa.gov/

- **GeoNames**
  - Creative Commons 授權
  - 城市與地名資料庫
  - 網址: https://www.geonames.org/

#### 2.2 授權遵循
- 所有使用的資料必須標註來源
- 遵守相關授權條款
- 在應用程式中加入資料來源說明頁面
- 定期更新資料來源資訊

### 3. 效能優化策略

#### 3.1 3D 渲染優化
- **幾何體優化**
  - 使用 LOD (Level of Detail) 技術
  - 根據縮放等級動態調整模型精細度
  - 低多邊形模型 (Low-poly) 設計
  - 幾何體合併減少 Draw Calls

- **材質優化**
  - 材質貼圖壓縮
  - 使用適當的貼圖解析度
  - Mipmap 生成
  - 材質複用

- **渲染優化**
  - Frustum Culling (視錐剔除)
  - 僅渲染可見物件
  - 使用 requestAnimationFrame
  - 適當的幀率控制 (30-60 FPS)

#### 3.2 資料載入優化
- **延遲載入 (Lazy Loading)**
  - 初始只載入必要資料
  - 根據縮放等級載入詳細資料
  - 地點資訊按需載入

- **資料快取**
  - 瀏覽器 LocalStorage 快取
  - 已載入資料保留在記憶體
  - 快取過期機制

- **資料壓縮**
  - GZIP 壓縮傳輸
  - JSON 資料最小化
  - 圖片格式優化

#### 3.3 記憶體管理
- **資源釋放**
  - 不使用的幾何體與材質釋放
  - 定期記憶體清理
  - 避免記憶體洩漏

- **物件池 (Object Pooling)**
  - 標記物件複用
  - 減少物件建立與銷毀

### 4. 響應式設計

#### 4.1 裝置適配
- **桌面裝置** (≥1200px)
  - 完整功能展示
  - 側邊控制面板
  - 多圖層同時顯示

- **平板裝置** (768px-1199px)
  - 可摺疊控制面板
  - 簡化部分功能
  - 觸控優化

- **行動裝置** (< 768px)
  - 底部工具列
  - 核心功能優先
  - 手勢操作為主

#### 4.2 螢幕方向
- 支援橫向與直向顯示
- 自動調整版面配置
- 方向改變時重新計算渲染區域

#### 4.3 觸控優化
- 觸控目標大小至少 44x44 px
- 手勢操作教學提示
- 避免誤觸設計

### 5. 可存取性 (Accessibility)

#### 5.1 鍵盤導航
- **鍵盤控制**
  - 方向鍵: 旋轉地球儀
  - +/- 鍵: 縮放控制
  - Space: 暫停/繼續自動旋轉
  - Enter: 確認選擇
  - Esc: 關閉面板

- **Tab 導航**
  - 所有互動元素可透過 Tab 鍵存取
  - 清晰的 Focus 指示
  - 合理的 Tab 順序

#### 5.2 螢幕閱讀器支援
- **ARIA 標籤**
  - 適當的 role 屬性
  - aria-label 描述
  - aria-live 區域用於動態內容

- **語意化 HTML**
  - 使用正確的 HTML 標籤
  - 標題階層正確
  - 替代文字 (alt text)

#### 5.3 視覺輔助
- **色彩對比**
  - 符合 WCAG 2.1 AA 標準
  - 對比度至少 4.5:1 (一般文字)
  - 對比度至少 3:1 (大型文字與圖形)

- **色盲友善**
  - 不僅依賴顏色傳達資訊
  - 使用形狀、圖示輔助
  - 提供色盲模式選項

#### 5.4 動畫控制
- 尊重使用者的 prefers-reduced-motion 設定
- 提供關閉動畫選項
- 避免閃爍內容 (防止癲癇發作)

### 6. 跨瀏覽器相容性

#### 6.1 支援的瀏覽器
- **桌面瀏覽器**
  - Chrome (最新版 & 前兩版)
  - Firefox (最新版 & 前兩版)
  - Safari (最新版 & 前兩版)
  - Edge (最新版 & 前兩版)

- **行動瀏覽器**
  - iOS Safari (iOS 14+)
  - Chrome for Android (最新版)
  - Samsung Internet

#### 6.2 功能降級策略
- **WebGL 不支援時**
  - 顯示靜態地圖作為替代
  - 提示使用者升級瀏覽器
  - 提供基本的地理資訊查詢功能

- **低效能裝置**
  - 自動降低渲染品質
  - 減少同時顯示的標記數量
  - 簡化視覺效果

#### 6.3 測試策略
- 跨瀏覽器測試
- 不同裝置測試
- 效能基準測試
- 使用者測試

---

## 資料模型設計

### 1. 後端 Model 結構

#### 1.1 GlobeSettings.cs
```csharp
/// <summary>
/// 地球儀設定模型
/// </summary>
public class GlobeSettings
{
    public int Id { get; set; }
    public double DefaultZoom { get; set; }
    public double MinZoom { get; set; }
    public double MaxZoom { get; set; }
    public double RotationSpeed { get; set; }
    public bool AutoRotateEnabled { get; set; }
    public List<string> EnabledLayers { get; set; }
}
```

#### 1.2 LocationData.cs
```csharp
/// <summary>
/// 地點資料模型
/// </summary>
public class LocationData
{
    public int Id { get; set; }
    public string Name { get; set; }
    public string NameEn { get; set; }
    public double Latitude { get; set; }
    public double Longitude { get; set; }
    public LocationType Type { get; set; }
    public string Description { get; set; }
    public string Country { get; set; }
    public int? Population { get; set; }
    public string TimeZone { get; set; }
    public List<string> ImageUrls { get; set; }
    public Dictionary<string, string> ExternalLinks { get; set; }
}

/// <summary>
/// 地點類型列舉
/// </summary>
public enum LocationType
{
    Capital,        // 首都
    City,           // 城市
    Landmark,       // 地標
    NaturalWonder,  // 自然景觀
    Heritage,       // 世界遺產
    Custom          // 自訂
}
```

#### 1.3 GlobeLayer.cs
```csharp
/// <summary>
/// 地球儀圖層模型
/// </summary>
public class GlobeLayer
{
    public int Id { get; set; }
    public string Name { get; set; }
    public LayerType Type { get; set; }
    public bool IsVisible { get; set; }
    public double Opacity { get; set; }
    public string DataSource { get; set; }
    public int ZIndex { get; set; }
}

/// <summary>
/// 圖層類型列舉
/// </summary>
public enum LayerType
{
    Borders,        // 邊界
    Cities,         // 城市
    Terrain,        // 地形
    Climate,        // 氣候
    TimeZones,      // 時區
    Population      // 人口
}
```

### 2. API 端點設計

#### 2.1 地理資料 API
```
GET  /api/globe/locations          - 取得所有地點
GET  /api/globe/locations/{id}     - 取得特定地點詳細資訊
GET  /api/globe/locations/search   - 搜尋地點
POST /api/globe/locations          - 新增自訂地點 (需驗證)
```

#### 2.2 圖層資料 API
```
GET  /api/globe/layers             - 取得可用圖層列表
GET  /api/globe/layers/{id}/data   - 取得特定圖層的資料
```

#### 2.3 設定 API
```
GET  /api/globe/settings           - 取得地球儀設定
PUT  /api/globe/settings           - 更新地球儀設定 (需驗證)
```

#### 2.4 資料格式範例
```json
{
  "id": 1,
  "name": "台北",
  "nameEn": "Taipei",
  "latitude": 25.0330,
  "longitude": 121.5654,
  "type": "Capital",
  "description": "台灣的首都,充滿活力的現代化都市",
  "country": "台灣",
  "population": 2646204,
  "timeZone": "Asia/Taipei",
  "imageUrls": [
    "/images/locations/taipei-101.jpg"
  ],
  "externalLinks": {
    "wikipedia": "https://zh.wikipedia.org/wiki/臺北市"
  }
}
```

---

## UI/UX 設計規範

### 1. 視覺設計

#### 1.1 色彩配置
- **主色調**
  - 深藍色 #1a2332 (背景)
  - 海洋藍 #2c5aa0 (地球海洋)
  - 大地綠 #3a7c3e (陸地)

- **輔助色**
  - 金色 #ffd700 (重點標記)
  - 白色 #ffffff (文字與介面)
  - 半透明黑 rgba(0,0,0,0.7) (面板背景)

- **標記顏色**
  - 紅色 #e74c3c (首都)
  - 藍色 #3498db (城市)
  - 綠色 #27ae60 (自然景觀)
  - 金色 #f39c12 (世界遺產)

#### 1.2 字體規範
- **中文字體**: Noto Sans TC, Microsoft JhengHei, sans-serif
- **英文字體**: Roboto, Arial, sans-serif
- **字體大小**
  - 標題: 24px-32px
  - 內文: 14px-16px
  - 說明文字: 12px-14px

#### 1.3 圖示設計
- 使用一致的圖示風格
- 圖示大小: 24x24px (標準), 32x32px (大型)
- 建議使用 Font Awesome 或 Material Icons

### 2. 互動設計

#### 2.1 操作反饋
- **懸停效果**
  - 按鈕: 顏色變亮 + 微陰影
  - 標記: 放大 1.2 倍 + 顯示標籤
  - 過渡時間: 0.2s

- **點擊效果**
  - 按鈕按下: 輕微縮小 (0.95 倍)
  - 漣漪效果 (Ripple effect)
  - 過渡時間: 0.1s

- **載入狀態**
  - 旋轉載入動畫
  - 進度條顯示
  - 載入文字提示

#### 2.2 動畫設計
- **過渡動畫**
  - 面板開合: 0.3s ease-in-out
  - 視角移動: 1-2s ease-out
  - 縮放: 0.5s ease-in-out

- **微互動**
  - 按鈕懸停: scale + shadow
  - 標記出現: fade + scale
  - 訊息通知: slide-in

#### 2.3 使用者引導
- **首次使用教學**
  - 歡迎彈窗說明
  - 操作提示標記
  - 互動式教學步驟

- **工具提示 (Tooltip)**
  - 懸停 1 秒後顯示
  - 簡短清楚的說明
  - 不遮擋重要內容

### 3. 版面配置

#### 3.1 桌面版配置
```
┌─────────────────────────────────────────┐
│ 頂部導航列                                │
├───────┬─────────────────────────┬───────┤
│       │                         │       │
│ 左側  │                         │ 右側  │
│ 控制  │     3D 地球儀區域         │ 資訊  │
│ 面板  │                         │ 面板  │
│       │                         │       │
├───────┴─────────────────────────┴───────┤
│ 底部工具列 (選用)                          │
└─────────────────────────────────────────┘
```

#### 3.2 行動版配置
```
┌───────────────────┐
│   頂部標題列       │
├───────────────────┤
│                   │
│                   │
│   3D 地球儀區域    │
│   (全螢幕)         │
│                   │
│                   │
├───────────────────┤
│   底部工具列       │
│   [圖示] [圖示] [圖示] │
└───────────────────┘
```

#### 3.3 控制面板設計
- **摺疊式設計**
  - 預設可收合
  - 點擊圖示展開/收合
  - 半透明背景

- **控制項分組**
  - 視角控制組
  - 圖層控制組
  - 資訊顯示組
  - 設定選項組

---

## 開發階段規劃

### 第一階段: 基礎建置 (建議 2-3 週)
- [ ] 專案環境設定
- [ ] Three.js 整合
- [ ] 基本 3D 地球儀渲染
- [ ] 滑鼠拖曳旋轉功能
- [ ] 滾輪縮放功能
- [ ] 基本材質貼圖

### 第二階段: 核心功能 (建議 3-4 週)
- [ ] 地點標記系統
- [ ] 資訊面板實作
- [ ] 後端 API 開發
- [ ] 資料載入與顯示
- [ ] 圖層切換功能
- [ ] 自動旋轉功能

### 第三階段: 進階功能 (建議 2-3 週)
- [ ] 搜尋功能實作
- [ ] 快速導航功能
- [ ] 多圖層支援
- [ ] 使用者設定儲存
- [ ] 響應式設計調整

### 第四階段: 優化與測試 (建議 2-3 週)
- [ ] 效能優化
- [ ] 跨瀏覽器測試
- [ ] 可存取性改善
- [ ] 使用者測試
- [ ] Bug 修復
- [ ] 文件撰寫

### 第五階段: 加分功能 (選用)
- [ ] 時區即時顯示
- [ ] 天氣資訊整合
- [ ] 飛行路徑動畫
- [ ] 地點收藏功能
- [ ] 社群分享功能
- [ ] 多語言支援

---

## 測試策略

### 1. 功能測試
- 所有互動功能正常運作
- API 端點回應正確
- 資料載入與顯示正確
- 圖層切換功能正常
- 搜尋功能準確

### 2. 效能測試
- 渲染幀率 (目標: 30-60 FPS)
- 記憶體使用量監控
- 資料載入速度
- 不同裝置效能表現

### 3. 相容性測試
- 各瀏覽器測試
- 不同裝置測試
- 不同螢幕尺寸測試
- WebGL 不支援情境測試

### 4. 可存取性測試
- 鍵盤導航測試
- 螢幕閱讀器測試
- 色彩對比檢查
- WCAG 2.1 AA 標準驗證

### 5. 使用者測試
- 可用性測試
- 使用者體驗回饋
- 操作流程評估
- 介面直觀性評估

---

## 效能指標

### 1. 載入效能
- **初始載入時間**: < 3 秒
- **完整載入時間**: < 5 秒
- **API 回應時間**: < 500ms
- **資源大小**: < 5MB (總計)

### 2. 運行效能
- **幀率 (FPS)**: 30-60 FPS (桌面), 25-30 FPS (行動)
- **記憶體使用**: < 200MB (桌面), < 100MB (行動)
- **CPU 使用率**: < 30% (閒置), < 60% (互動中)

### 3. 互動回應
- **點擊回應**: < 100ms
- **搜尋結果**: < 300ms
- **視角切換**: < 1.5s (動畫完成)

---

## 安全性考量

### 1. 資料安全
- API 端點需要適當的速率限制
- 輸入驗證與清理
- XSS 防護
- CSRF 保護

### 2. 使用者資料
- 不收集敏感個人資訊
- 遵守 GDPR 規範 (如適用)
- Cookie 使用透明化
- 提供隱私權政策

### 3. 資源保護
- 防止 API 濫用
- 圖片與資源的防盜連
- 適當的快取策略

---

## 維護與更新

### 1. 資料更新
- 定期更新地理資料 (建議每季)
- 新增新的地標與城市
- 更新人口資料
- 檢查外部連結有效性

### 2. 技術更新
- 函式庫版本更新
- 安全性修補
- 效能優化
- 新功能開發

### 3. 監控機制
- 錯誤追蹤系統 (如 Sentry)
- 效能監控工具
- 使用者行為分析 (選用)
- 伺服器狀態監控

---

## 文件需求

### 1. 使用者文件
- 功能使用指南
- 常見問題 FAQ
- 操作教學影片 (選用)
- 鍵盤快捷鍵說明

### 2. 開發者文件
- API 文件
- 程式碼註解
- 架構設計文件
- 部署指南
- 疑難排解指南

### 3. 資料來源文件
- 資料來源清單
- 授權資訊
- 資料更新記錄
- 資料格式說明

---

## 成功指標

### 1. 技術指標
- ✓ 所有核心功能正常運作
- ✓ 效能達標 (FPS > 30)
- ✓ 通過跨瀏覽器測試
- ✓ 通過可存取性測試
- ✓ 程式碼覆蓋率 > 70% (如有測試)

### 2. 使用者體驗指標
- ✓ 操作直覺易懂
- ✓ 載入速度快
- ✓ 視覺呈現美觀
- ✓ 互動回應流暢
- ✓ 使用者滿意度 > 4/5

### 3. 商業指標 (選用)
- 使用者停留時間
- 功能使用率
- 使用者回訪率
- 分享與推薦率

---

## 風險評估與應對

### 1. 技術風險
- **風險**: WebGL 相容性問題
  - **應對**: 提供降級替代方案

- **風險**: 效能不佳
  - **應對**: 多階段優化計畫,降低模型精細度

- **風險**: 資料載入失敗
  - **應對**: 錯誤處理與重試機制,本地快取備份

### 2. 資源風險
- **風險**: 開發時間不足
  - **應對**: 優先開發核心功能,加分功能延後

- **風險**: 資料來源變更或失效
  - **應對**: 多元資料來源,本地備份資料

### 3. 法律風險
- **風險**: 資料授權問題
  - **應對**: 僅使用公共領域或明確授權的資料

- **風險**: 隱私權問題
  - **應對**: 不收集個人資料,遵守相關法規

---

## 附錄

### A. 參考資源
- Three.js 官方文件: https://threejs.org/docs/
- WebGL 規範: https://www.khronos.org/webgl/
- Natural Earth 資料: https://www.naturalearthdata.com/
- WCAG 2.1 指南: https://www.w3.org/WAI/WCAG21/quickref/

### B. 相關範例
- Three.js Earth Example
- WebGL Globe by Google
- Cesium Viewer

### C. 名詞解釋
- **LOD (Level of Detail)**: 細節層次,根據物件與相機距離調整模型精細度
- **Draw Call**: 渲染呼叫次數,越少效能越好
- **Frustum Culling**: 視錐剔除,不渲染視野外的物件
- **GeoJSON**: 地理資料的 JSON 格式標準
- **ARIA**: 無障礙網路應用程式,提升可存取性

### D. 聯絡資訊
- 專案負責人: [待填入]
- 技術支援: [待填入]
- 問題回報: [待填入]

---

## 版本記錄

| 版本 | 日期 | 修改內容 | 修改人 |
|------|------|----------|--------|
| 1.0 | 2025-10-01 | 初始版本建立 | - |

---

**備註**: 此為開發規格書,實際開發時可能需要根據實際情況調整內容。所有功能實作必須在合法且符合授權的前提下進行。
