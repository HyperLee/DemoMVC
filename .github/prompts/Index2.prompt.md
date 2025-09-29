# 世界時鐘開發規格書

## 專案概述
此專案為 DemoMVC 應用程式新增**獨立的世界時鐘功能頁面**。此功能與現有的首頁 (`Views/Home/Index.cshtml`) 完全分離，是一個全新的功能模組，提供多時區時間查看功能，適用於需要跨國協作或旅行規劃的使用場景。

## ⚠️ 重要說明
- **此為全新功能**：世界時鐘是完全獨立的新頁面
- **不影響現有功能**：不會修改 `Views/Home/Index.cshtml` 或其相關功能
- **獨立路由**：使用 `/WorldClock` 路由，與首頁 `/` 分離
- **獨立資源**：使用專屬的 CSS、JavaScript 和檢視檔案

## 檔案位置及架構

### 核心檔案結構 (全新檔案)
```
Controllers/
├── HomeController.cs               # 現有 - 保持不變
└── WorldClockController.cs         # 🆕 新增 - 世界時鐘控制器

Views/
├── Home/                           # 現有資料夾 - 保持不變
│   ├── Index.cshtml               # 現有 - 電子鐘功能，保持不變
│   └── Privacy.cshtml             # 現有 - 保持不變
└── WorldClock/                     # 🆕 新增 - 專用檢視資料夾
    ├── Index.cshtml                # 🆕 新增 - 世界時鐘主頁面
    └── _TimeZoneCard.cshtml        # 🆕 新增 - 時區卡片部分檢視

Models/
├── ErrorViewModel.cs               # 現有 - 保持不變
└── WorldClockModels.cs             # 🆕 新增 - 時區資料模型

wwwroot/
├── css/
│   ├── site.css                   # 現有 - 保持不變
│   └── worldclock.css             # 🆕 新增 - 專用樣式表
├── js/
│   ├── site.js                    # 現有 - 保持不變
│   └── worldclock.js              # 🆕 新增 - 專用 JavaScript
└── images/
    └── flags/                      # 🆕 新增 - 國旗圖示 (選用)
```

### 路由配置
```
現有路由 (保持不變):
├── /                              # 首頁 - 電子鐘功能
├── /Home/Privacy                   # 隱私權頁面
└── /Home/Error                     # 錯誤頁面

新增路由 (世界時鐘功能):
├── /WorldClock                     # 🆕 世界時鐘主頁
├── /WorldClock/Index              # 🆕 同上 (明確路由)
├── /WorldClock/GetTimeZones       # 🆕 時區資料 API (未來)
└── /WorldClock/Settings           # 🆕 設定頁面 (未來擴充)
```

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

## 後端架構設計

### WorldClockController 結構
```csharp
using Microsoft.AspNetCore.Mvc;
using DemoMVC.Models;

namespace DemoMVC.Controllers
{
    /// <summary>
    /// 世界時鐘控制器 - 負責處理時區相關功能
    /// </summary>
    public class WorldClockController : Controller
    {
        private readonly ILogger<WorldClockController> _logger;

        public WorldClockController(ILogger<WorldClockController> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// 世界時鐘主頁面
        /// </summary>
        public IActionResult Index()
        {
            var model = new WorldClockViewModel
            {
                Cities = GetDefaultCities(),
                DefaultCity = "台北"
            };
            
            ViewData["Title"] = "世界時鐘";
            return View(model);
        }

        /// <summary>
        /// 取得時區資料 API
        /// </summary>
        [HttpGet]
        public JsonResult GetTimeZones()
        {
            var cities = GetDefaultCities();
            return Json(cities);
        }

        /// <summary>
        /// 取得預設城市列表
        /// </summary>
        private List<CityTimeZone> GetDefaultCities()
        {
            return new List<CityTimeZone>
            {
                new() { Name = "台北", TimeZone = "Asia/Taipei", UtcOffset = "+08:00" },
                new() { Name = "東京", TimeZone = "Asia/Tokyo", UtcOffset = "+09:00" },
                new() { Name = "倫敦", TimeZone = "Europe/London", UtcOffset = "+00:00" },
                new() { Name = "紐約", TimeZone = "America/New_York", UtcOffset = "-05:00" },
                new() { Name = "洛杉磯", TimeZone = "America/Los_Angeles", UtcOffset = "-08:00" },
                new() { Name = "巴黎", TimeZone = "Europe/Paris", UtcOffset = "+01:00" },
                new() { Name = "柏林", TimeZone = "Europe/Berlin", UtcOffset = "+01:00" },
                new() { Name = "莫斯科", TimeZone = "Europe/Moscow", UtcOffset = "+03:00" },
                new() { Name = "新加坡", TimeZone = "Asia/Singapore", UtcOffset = "+08:00" },
                new() { Name = "悉尼", TimeZone = "Australia/Sydney", UtcOffset = "+10:00" }
            };
        }
    }
}
```

### 資料模型設計
```csharp
namespace DemoMVC.Models
{
    /// <summary>
    /// 世界時鐘檢視模型
    /// </summary>
    public class WorldClockViewModel
    {
        public List<CityTimeZone> Cities { get; set; } = new();
        public string DefaultCity { get; set; } = "台北";
    }

    /// <summary>
    /// 城市時區資料模型
    /// </summary>
    public class CityTimeZone
    {
        public string Name { get; set; } = string.Empty;
        public string TimeZone { get; set; } = string.Empty;
        public string UtcOffset { get; set; } = string.Empty;
        public string? CountryCode { get; set; }
        public bool IsDaylightSaving { get; set; }
    }
}
```

## 實作細節

### 前端 JavaScript 架構

#### 核心功能模組 (worldclock.js)
```javascript
class WorldClockManager {
    constructor() {
        this.cities = [];
        this.currentMainCity = '台北';
        this.updateTimer = null;
        this.init();
    }

    /**
     * 初始化世界時鐘
     */
    async init() {
        await this.loadCityData();
        this.renderClocks();
        this.bindEvents();
        this.startTimer();
    }

    /**
     * 從後端載入城市資料
     */
    async loadCityData() {
        try {
            const response = await fetch('/WorldClock/GetTimeZones');
            this.cities = await response.json();
        } catch (error) {
            console.error('載入城市資料失敗:', error);
        }
    }

    /**
     * 依時區取得當前時間
     */
    getCurrentTimeByTimezone(timezone) {
        return new Intl.DateTimeFormat('zh-TW', {
            timeZone: timezone,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }).format(new Date());
    }

    /**
     * 格式化日期
     */
    getCurrentDate(timezone) {
        return new Intl.DateTimeFormat('zh-TW', {
            timeZone: timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).format(new Date());
    }

    /**
     * 更新所有時鐘顯示
     */
    updateAllClocks() {
        this.cities.forEach(city => {
            const timeElement = document.querySelector(`[data-city="${city.name}"] .time`);
            if (timeElement) {
                timeElement.textContent = this.getCurrentTimeByTimezone(city.timeZone);
            }
        });

        // 更新日期顯示
        const dateElement = document.querySelector('#current-date');
        if (dateElement) {
            const mainCity = this.cities.find(c => c.name === this.currentMainCity);
            dateElement.textContent = this.getCurrentDate(mainCity?.timeZone || 'Asia/Taipei');
        }
    }

    /**
     * 切換主要時鐘顯示
     */
    switchMainClock(cityName) {
        this.currentMainCity = cityName;
        this.renderClocks();
        
        // 更新 URL 但不重新載入頁面
        history.replaceState(null, null, `/WorldClock?main=${encodeURIComponent(cityName)}`);
    }

    /**
     * 渲染時鐘界面
     */
    renderClocks() {
        // 實作界面渲染邏輯
    }

    /**
     * 綁定事件處理
     */
    bindEvents() {
        // 城市卡片點選事件
        document.addEventListener('click', (e) => {
            const cityCard = e.target.closest('[data-city]');
            if (cityCard) {
                const cityName = cityCard.getAttribute('data-city');
                this.switchMainClock(cityName);
            }
        });
    }

    /**
     * 啟動定時更新
     */
    startTimer() {
        this.updateTimer = setInterval(() => {
            this.updateAllClocks();
        }, 1000);
    }

    /**
     * 停止定時更新 (頁面離開時)
     */
    stopTimer() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
        }
    }
}

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', () => {
    const worldClock = new WorldClockManager();
    
    // 頁面離開時清理資源
    window.addEventListener('beforeunload', () => {
        worldClock.stopTimer();
    });
});
```

### CSS 動畫效果
- 時間切換淡入淡出效果 (0.3s)
- 卡片hover縮放效果 (transform: scale(1.05))
- 點選ripple效果

### 效能考量
- 使用 `requestAnimationFrame` 優化渲染
- 避免頻繁的 DOM 操作
- 記憶體洩漏防護 (清理定時器)

## Razor 檢視結構

### Index.cshtml 主頁面
```html
@model WorldClockViewModel
@{
    ViewData["Title"] = "世界時鐘";
}

<div class="world-clock-container">
    <header class="text-center mb-4">
        <h1 class="display-4">🌍 世界時鐘</h1>
        <p class="lead text-muted">即時查看世界各地時間</p>
    </header>

    <!-- 主要時間顯示區 -->
    <div class="main-clock-section">
        <div class="main-clock-card" data-city="@Model.DefaultCity">
            <h2 class="city-name">@Model.DefaultCity</h2>
            <div class="main-time">00:00:00</div>
            <small class="timezone-info">GMT+08:00</small>
        </div>
    </div>

    <!-- 其他城市時間網格 -->
    <div class="city-clocks-grid">
        @foreach (var city in Model.Cities.Where(c => c.Name != Model.DefaultCity))
        {
            <partial name="_TimeZoneCard" model="city" />
        }
    </div>

    <!-- 日期顯示 -->
    <div class="date-display">
        <span id="current-date">2024-01-01</span>
    </div>
</div>

@section Scripts {
    <script src="~/js/worldclock.js"></script>
}

@section Styles {
    <link rel="stylesheet" href="~/css/worldclock.css" />
}
```

### _TimeZoneCard.cshtml 部分檢視
```html
@model CityTimeZone

<div class="city-card" data-city="@Model.Name" data-timezone="@Model.TimeZone">
    <div class="city-header">
        <h5 class="city-name">@Model.Name</h5>
        <small class="timezone">@Model.UtcOffset</small>
    </div>
    <div class="time-display">
        <span class="time">--:--:--</span>
    </div>
    @if (Model.IsDaylightSaving)
    {
        <div class="dst-indicator">
            <small>🌞 夏令時間</small>
        </div>
    }
</div>
```

## 測試需求

### 單元測試
- [ ] WorldClockController 動作方法測試
- [ ] CityTimeZone 模型驗證測試
- [ ] 時區轉換邏輯測試
- [ ] API 端點回應測試

### 整合測試
- [ ] 控制器與檢視整合測試
- [ ] 資料庫連接測試 (如有使用)
- [ ] 外部 API 整合測試

### 前端測試
- [ ] JavaScript 功能單元測試
- [ ] UI 互動測試
- [ ] 跨瀏覽器相容性測試
- [ ] 響應式設計測試

### 效能測試
- [ ] 頁面載入速度 (<2秒)
- [ ] JavaScript 執行效能
- [ ] 記憶體洩漏檢測
- [ ] 網路請求優化

### 使用者體驗測試
- [ ] 無障礙功能支援 (ARIA 標籤)
- [ ] 鍵盤導覽支援
- [ ] 行動裝置觸控優化
- [ ] 視覺回饋效果測試

## 部署與配置

### 開發環境設定
```json
// appsettings.Development.json
{
  "Logging": {
    "LogLevel": {
      "Default": "Information",
      "Microsoft.AspNetCore": "Warning",
      "DemoMVC.Controllers.WorldClockController": "Debug"
    }
  },
  "WorldClock": {
    "UpdateInterval": 1000,
    "DefaultTimeZone": "Asia/Taipei"
  }
}
```

### 生產環境注意事項
- [ ] 確保伺服器時區設定正確
- [ ] 啟用 gzip 壓縮靜態資源
- [ ] 配置 CDN 加速 JavaScript/CSS 載入
- [ ] 設定適當的快取策略
- [ ] 監控記憶體使用情況

### SEO 優化
```html
<!-- 在 Layout 中加入 -->
<meta name="description" content="世界時鐘 - 即時查看全球各大城市時間，支援多時區顯示">
<meta name="keywords" content="世界時鐘,時區,GMT,UTC,國際時間">
<meta property="og:title" content="世界時鐘 - 全球時間查詢">
<meta property="og:description" content="方便的世界時鐘工具，一次查看多個城市的當前時間">
```

## 專案整合指南

### 導覽選單整合
在 `Views/Shared/_Layout.cshtml` 中加入新的選單項目 (不影響現有選單)：
```html
<!-- 現有選單項目保持不變 -->
<li class="nav-item">
    <a class="nav-link text-dark" asp-area="" asp-controller="Home" asp-action="Index">Home</a>
</li>
<li class="nav-item">
    <a class="nav-link text-dark" asp-area="" asp-controller="Home" asp-action="Privacy">Privacy</a>
</li>

<!-- 🆕 新增世界時鐘選單項目 -->
<li class="nav-item">
    <a class="nav-link text-dark" asp-controller="WorldClock" asp-action="Index">
        🌍 世界時鐘
    </a>
</li>
```

### 依賴注入配置 (如需要)
```csharp
// Program.cs 或 Startup.cs
services.AddScoped<ITimeZoneService, TimeZoneService>();
services.Configure<WorldClockOptions>(Configuration.GetSection("WorldClock"));
```

## 未來擴充功能規劃

### 第一階段擴充
- [ ] 使用者偏好設定儲存 (LocalStorage)
- [ ] 12/24小時制切換
- [ ] 深色/淺色主題切換
- [ ] 城市搜尋功能

### 第二階段擴充
- [ ] 使用者帳戶整合
- [ ] 自訂城市列表管理
- [ ] 時區提醒/鬧鐘功能
- [ ] 匯出功能 (PDF/圖片)

### 第三階段擴充
- [ ] 行動應用 API 支援
- [ ] 即時推播通知
- [ ] 多語言支援 (i18n)
- [ ] 進階統計分析

### 技術債務管理
- [ ] 效能監控與優化
- [ ] 單元測試覆蓋率提升
- [ ] 程式碼重構與最佳化
- [ ] 安全性審查與加強

## 開發檢查清單

### 開發前準備
- [ ] 確認 .NET 8 SDK 安裝
- [ ] 檢查專案相依套件
- [ ] 設定開發環境變數
- [ ] 準備測試資料

### 開發階段
- [ ] 建立 WorldClockController (新檔案)
- [ ] 實作 WorldClockModels 資料模型 (新檔案)
- [ ] 建立 Views/WorldClock/ 資料夾 (新資料夾)
- [ ] 開發 Views/WorldClock/Index.cshtml (新檔案)
- [ ] 開發 Views/WorldClock/_TimeZoneCard.cshtml (新檔案)
- [ ] 撰寫 wwwroot/js/worldclock.js (新檔案)
- [ ] 設計 wwwroot/css/worldclock.css (新檔案)
- [ ] 更新導覽選單 (修改現有 _Layout.cshtml)

**🔒 保護現有功能**
- ❌ 不修改 Views/Home/Index.cshtml
- ❌ 不修改 Controllers/HomeController.cs 現有方法
- ❌ 不修改現有的 site.css 和 site.js

### 測試階段
- [ ] 單元測試撰寫
- [ ] 整合測試執行
- [ ] 跨瀏覽器測試
- [ ] 效能測試驗證

### 部署階段
- [ ] 建構最佳化設定
- [ ] 生產環境配置
- [ ] 監控設定
- [ ] 文件更新
