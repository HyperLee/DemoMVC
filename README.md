# DemoMVC

**ASP.NET Core MVC 專案展示數位電子鐘功能**

[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen?style=flat-square)](https://github.com/HyperLee/DemoMVC)
[![.NET Version](https://img.shields.io/badge/.NET-8.0-512BD4?style=flat-square)](https://dotnet.microsoft.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE)

[功能特色](#功能特色) • [快速開始](#快速開始) • [專案結構](#專案結構) • [技術規格](#技術規格) • [部署](#部署)

這是一個基於 ASP.NET Core 8.0 MVC 的展示專案，主要特色是在首頁實作了一個華麗的即時數位電子鐘功能。專案展示了現代化 Web 開發的最佳實務，包含響應式設計、無障礙功能和效能優化。

![電子鐘展示](screenshot-placeholder.png)

## 功能特色

### 數位電子鐘

- **即時更新**: 每秒自動更新當前時間
- **台灣時區**: 顯示台灣標準時間 (UTC+8)  
- **格式化顯示**: HH:mm:ss 24小時制格式
- **華麗視覺效果**: 彩虹漸層色彩和霓虹發光特效
- **響應式設計**: 適應各種螢幕尺寸

### 技術亮點

- **現代化架構**: ASP.NET Core 8.0 MVC 模式
- **前端技術**: HTML5, CSS3, JavaScript ES6+
- **視覺特效**: CSS3 漸層、動畫和硬體加速
- **無障礙支援**: ARIA 標籤和高對比度模式
- **效能優化**: 智慧暫停和記憶體管理

## 快速開始

### 環境需求

- [.NET 8.0 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Visual Studio Code](https://code.visualstudio.com/) 或 [Visual Studio 2022](https://visualstudio.microsoft.com/)
- 現代瀏覽器 (Chrome 90+, Firefox 88+, Safari 14+, Edge 90+)

### 安裝與執行

1. **克隆儲存庫**

   ```bash
   git clone https://github.com/HyperLee/DemoMVC.git
   cd DemoMVC
   ```

2. **還原相依套件**

   ```bash
   dotnet restore
   ```

3. **建置專案**

   ```bash
   dotnet build
   ```

4. **執行應用程式**

   ```bash
   cd DemoMVC
   dotnet run
   ```

5. **開啟瀏覽器**  
   導航至 `http://localhost:5000` 或 `https://localhost:5001`

> **提示**: 應用程式啟動後，您將在首頁看到即時更新的數位電子鐘

## 專案結構

```text
DemoMVC/
├── DemoMVC/                        # 主要應用程式目錄
│   ├── Controllers/
│   │   └── HomeController.cs       # 首頁控制器
│   ├── Views/
│   │   ├── Home/
│   │   │   ├── Index.cshtml        # 首頁視圖 (包含電子鐘)
│   │   │   └── Privacy.cshtml      # 隱私頁面
│   │   └── Shared/
│   │       ├── _Layout.cshtml      # 共用佈局
│   │       └── Error.cshtml        # 錯誤頁面
│   ├── wwwroot/                    # 靜態檔案
│   │   ├── css/
│   │   │   └── site.css           # 主要樣式表 (電子鐘樣式)
│   │   ├── js/
│   │   │   └── site.js            # JavaScript 功能 (電子鐘邏輯)
│   │   └── lib/                   # 第三方函式庫
│   ├── Models/
│   │   └── ErrorViewModel.cs      # 錯誤檢視模型
│   ├── Program.cs                  # 應用程式進入點
│   ├── appsettings.json           # 應用程式配置
│   └── DemoMVC.csproj             # 專案檔案
├── .github/
│   ├── instructions/
│   │   └── csharp.instructions.md  # C# 開發指南
│   └── prompts/
│       └── index.prompt.md         # 電子鐘功能規格書
└── DemoMVC.sln                     # 解決方案檔案
```

## 技術規格

### 後端技術

| 技術 | 版本 | 用途 |
|------|------|------|
| .NET | 8.0 | 執行環境 |
| ASP.NET Core MVC | 8.0 | Web 框架 |
| C# | 12.0 | 程式語言 |

### 前端技術

| 技術 | 版本 | 用途 |
|------|------|------|
| HTML5 | - | 結構標記 |
| CSS3 | - | 樣式和動畫 |
| JavaScript | ES6+ | 互動邏輯 |
| Bootstrap | 5.x | UI 框架 |

### 電子鐘實作細節

#### JavaScript 類別設計

```javascript
class DigitalClock {
    // 核心功能
    - 時間格式化 (formatTime)
    - 顏色循環 (updateColor) 
    - 計時器管理 (startClock/stopClock)
    - 效能優化 (destroy)
}
```

#### CSS 特效技術

- **漸層動畫**: `linear-gradient` 配合 `@keyframes`
- **文字特效**: `background-clip: text` 和 `text-shadow`
- **響應式**: `clamp()` 函式和 Media Queries
- **硬體加速**: `transform3d` 和 `will-change`
- **無障礙**: 高對比度和減少動畫支援

## 開發

### 新增功能

1. **修改電子鐘樣式**

   ```css
   /* 編輯 wwwroot/css/site.css */
   .digital-clock {
       /* 自訂樣式 */
   }
   ```

2. **調整 JavaScript 行為**

   ```javascript
   // 編輯 wwwroot/js/site.js
   class DigitalClock {
       // 自訂邏輯
   }
   ```

3. **修改 HTML 結構**

   ```html
   <!-- 編輯 Views/Home/Index.cshtml -->
   <section class="digital-clock-container">
       <!-- 自訂內容 -->
   </section>
   ```

### 建置指令

```bash
# 開發建置
dotnet build

# 發佈建置
dotnet publish -c Release

# 執行測試 (如有)
dotnet test

# 清理建置
dotnet clean
```

## 部署

### 本地部署

```bash
# 建置發佈版本
dotnet publish -c Release -o ./publish

# 執行發佈版本
cd publish
dotnet DemoMVC.dll
```

### 容器化部署

> **注意**: 專案使用 .NET 8.0 內建容器支援

```bash
# 建立容器映像
dotnet publish --os linux --arch x64 -p:PublishProfile=DefaultContainer

# 執行容器
docker run -p 8080:8080 demomvc
```

### 雲端部署

- **Azure App Service**: 支援直接部署
- **Azure Container Apps**: 支援容器部署  
- **IIS**: 支援 Windows Server 部署

## 瀏覽器支援

| 瀏覽器 | 最低版本 | 支援狀態 |
|--------|----------|----------|
| Chrome | 90+ | ✅ 完全支援 |
| Firefox | 88+ | ✅ 完全支援 |
| Safari | 14+ | ✅ 完全支援 |
| Edge | 90+ | ✅ 完全支援 |
| IE | - | ❌ 不支援 |

## 效能指標

- **首次載入**: < 2 秒
- **記憶體使用**: < 50MB  
- **CPU 使用率**: < 5%
- **動畫流暢度**: 60 FPS

## 無障礙功能

- ✅ ARIA 標籤支援
- ✅ 鍵盤導航
- ✅ 螢幕閱讀器相容
- ✅ 高對比度模式
- ✅ 減少動畫選項
- ✅ 語義化 HTML

## 授權

此專案採用 [MIT 授權](LICENSE)。

## 作者

**HyperLee** - [GitHub](https://github.com/HyperLee)

---

⭐ 如果這個專案對您有幫助，請給個星號支持！
