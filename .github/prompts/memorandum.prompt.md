# Memorandum 備忘錄功能開發規格書

## 1. 專案概述

### 1.1 功能簡介
備忘錄功能提供使用者建立、編輯、刪除和管理個人備忘錄的完整系統。支援 Markdown 語法、標籤分類、搜尋和分頁等進階功能。

### 1.2 技術堆疊
- **後端框架**: ASP.NET Core MVC (.NET 8.0)
- **程式語言**: C# 13
- **資料儲存**: JSON 檔案系統
- **前端框架**: Bootstrap 5
- **JavaScript**: Vanilla JS + AJAX
- **Markdown 解析**: Marked.js
- **樣式**: CSS3 + Bootstrap

---

## 2. 系統架構

### 2.1 檔案結構
```
DemoMVC/
├── Controllers/
│   └── MemorandumController.cs          # 備忘錄控制器
├── Models/
│   ├── Memorandum.cs                    # 備忘錄資料模型
│   ├── MemorandumData.cs                # 備忘錄資料容器
│   └── MemorandumTag.cs                 # 標籤模型
├── Services/
│   ├── IMemorandumDataService.cs        # 資料服務介面
│   └── MemorandumDataService.cs         # 資料服務實作
├── Views/
│   └── Memorandum/
│       ├── Index.cshtml                 # 列表頁
│       ├── Create.cshtml                # 新增頁
│       └── Edit.cshtml                  # 編輯頁
├── wwwroot/
│   ├── css/
│   │   └── memorandum.css               # 備忘錄專用樣式
│   └── js/
│       └── memorandum.js                # 備忘錄前端邏輯
└── Data/
    └── memorandums.json                 # 資料儲存檔案
```

### 2.2 架構模式
- **MVC 模式**: 遵循 Model-View-Controller 分離關注點原則
- **服務層模式**: 使用 Service Layer 處理業務邏輯和資料存取
- **相依性注入**: 透過 DI Container 管理服務生命週期
- **Repository 模式**: 資料服務封裝 JSON 檔案操作

---

## 3. 資料模型設計

### 3.1 Memorandum 類別
**檔案**: `Models/Memorandum.cs`

```csharp
namespace DemoMVC.Models
{
    /// <summary>
    /// 備忘錄資料模型
    /// </summary>
    public class Memorandum
    {
        /// <summary>
        /// 備忘錄唯一識別碼
        /// </summary>
        [Required(ErrorMessage = "識別碼不可為空")]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        /// <summary>
        /// 備忘錄標題
        /// </summary>
        [Required(ErrorMessage = "標題不可為空")]
        [StringLength(200, ErrorMessage = "標題長度不可超過 200 字元")]
        public string Title { get; set; } = string.Empty;

        /// <summary>
        /// 備忘錄內容（支援 Markdown）
        /// </summary>
        [Required(ErrorMessage = "內容不可為空")]
        [StringLength(10000, ErrorMessage = "內容長度不可超過 10000 字元")]
        public string Content { get; set; } = string.Empty;

        /// <summary>
        /// 標籤列表
        /// </summary>
        public List<string> Tags { get; set; } = new List<string>();

        /// <summary>
        /// 建立時間
        /// </summary>
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        /// <summary>
        /// 最後修改時間
        /// </summary>
        public DateTime UpdatedAt { get; set; } = DateTime.Now;

        /// <summary>
        /// 是否已刪除（軟刪除）
        /// </summary>
        public bool IsDeleted { get; set; } = false;

        /// <summary>
        /// 是否釘選
        /// </summary>
        public bool IsPinned { get; set; } = false;

        /// <summary>
        /// 顏色標記（用於 UI 顯示）
        /// </summary>
        [StringLength(7)]
        public string? Color { get; set; }
    }
}
```

### 3.2 MemorandumData 類別
**檔案**: `Models/MemorandumData.cs`

```csharp
namespace DemoMVC.Models
{
    /// <summary>
    /// 備忘錄資料容器（用於 JSON 序列化）
    /// </summary>
    public class MemorandumData
    {
        /// <summary>
        /// 備忘錄清單
        /// </summary>
        public List<Memorandum> Memorandums { get; set; } = new List<Memorandum>();

        /// <summary>
        /// 所有可用標籤
        /// </summary>
        public List<string> AvailableTags { get; set; } = new List<string>();
    }
}
```

### 3.3 資料驗證規則
- **Id**: 使用 GUID，確保唯一性
- **Title**: 必填，最大 200 字元
- **Content**: 必填，最大 10000 字元
- **Tags**: 可選，每個標籤最大 50 字元
- **CreatedAt/UpdatedAt**: 自動設定，使用 UTC 時間
- **IsDeleted**: 預設 false，實作軟刪除
- **Color**: 選填，符合 HEX 色碼格式 (#RRGGBB)

---

## 4. 服務層設計

### 4.1 IMemorandumDataService 介面
**檔案**: `Services/IMemorandumDataService.cs`

```csharp
namespace DemoMVC.Services
{
    /// <summary>
    /// 備忘錄資料服務介面
    /// </summary>
    public interface IMemorandumDataService
    {
        // 基本 CRUD 操作
        Task<List<Memorandum>> GetAllAsync();
        Task<Memorandum?> GetByIdAsync(string id);
        Task<Memorandum> CreateAsync(Memorandum memorandum);
        Task<Memorandum> UpdateAsync(Memorandum memorandum);
        Task<bool> DeleteAsync(string id);
        
        // 進階查詢功能
        Task<List<Memorandum>> SearchAsync(string keyword);
        Task<List<Memorandum>> GetByTagAsync(string tag);
        Task<List<Memorandum>> GetPinnedAsync();
        
        // 分頁功能
        Task<(List<Memorandum> items, int totalCount)> GetPagedAsync(int page, int pageSize);
        
        // 標籤管理
        Task<List<string>> GetAllTagsAsync();
        Task AddTagAsync(string tag);
        Task RemoveTagAsync(string tag);
    }
}
```

### 4.2 MemorandumDataService 實作重點

**檔案**: `Services/MemorandumDataService.cs`

#### 4.2.1 建構函式與初始化
- 注入 `IWebHostEnvironment` 取得資料目錄路徑
- 注入 `ILogger<MemorandumDataService>` 記錄操作日誌
- 使用 `SemaphoreSlim` 確保檔案存取執行緒安全
- 檢查並建立 Data 目錄

#### 4.2.2 檔案操作
- **LoadDataAsync()**: 讀取 JSON 檔案，處理檔案不存在情況
- **SaveDataAsync()**: 序列化並寫入 JSON 檔案，使用 WriteIndented 提升可讀性
- **檔案鎖定**: 使用 SemaphoreSlim 防止並行寫入衝突

#### 4.2.3 錯誤處理
- Try-Catch 包覆所有 I/O 操作
- 記錄詳細錯誤訊息到 Logger
- 檔案損壞時返回預設空資料

#### 4.2.4 效能優化
- 快取機制: 避免頻繁讀取檔案
- 非同步操作: 所有 I/O 使用 async/await
- 條件式儲存: 只在資料變更時寫入檔案

---

## 5. 控制器設計

### 5.1 MemorandumController 類別
**檔案**: `Controllers/MemorandumController.cs`

#### 5.1.1 建構函式
```csharp
public class MemorandumController : Controller
{
    private readonly IMemorandumDataService _dataService;
    private readonly ILogger<MemorandumController> _logger;

    public MemorandumController(
        IMemorandumDataService dataService, 
        ILogger<MemorandumController> logger)
    {
        _dataService = dataService;
        _logger = logger;
    }
}
```

#### 5.1.2 Action Methods

| HTTP Method | Route | Action | 說明 |
|-------------|-------|--------|------|
| GET | /Memorandum | Index() | 列表頁 |
| GET | /Memorandum/Create | Create() | 新增頁 |
| POST | /Memorandum/Create | Create(Memorandum) | 新增提交 |
| GET | /Memorandum/Edit/{id} | Edit(string id) | 編輯頁 |
| POST | /Memorandum/Edit/{id} | Edit(Memorandum) | 編輯提交 |
| POST | /Memorandum/Delete/{id} | Delete(string id) | 刪除操作 |
| GET | /Memorandum/GetAll | GetAll() | AJAX 取得全部 |
| GET | /Memorandum/Search | Search(string keyword) | AJAX 搜尋 |
| GET | /Memorandum/GetByTag | GetByTag(string tag) | AJAX 標籤篩選 |
| POST | /Memorandum/TogglePin/{id} | TogglePin(string id) | 切換釘選狀態 |

#### 5.1.3 回應格式
```csharp
// 成功回應
return Json(new { success = true, data = result, message = "操作成功" });

// 失敗回應
return Json(new { success = false, message = "錯誤訊息", error = ex.Message });
```

#### 5.1.4 驗證處理
```csharp
if (!ModelState.IsValid)
{
    return Json(new { 
        success = false, 
        message = "資料驗證失敗",
        errors = ModelState.Values
            .SelectMany(v => v.Errors)
            .Select(e => e.ErrorMessage)
    });
}
```

---

## 6. 前端設計

### 6.1 列表頁 (Index.cshtml)

#### 6.1.1 頁面結構
```html
<!-- 搜尋與篩選區域 -->
<div class="search-filter-section">
    - 搜尋框
    - 標籤篩選下拉選單
    - 新增按鈕
</div>

<!-- 備忘錄卡片區域 -->
<div class="memorandum-list">
    - 釘選的備忘錄（優先顯示）
    - 一般備忘錄（交替背景色）
    - 每張卡片包含：
      * 標題
      * 內容預覽（前 150 字）
      * 標籤
      * 時間資訊
      * 操作按鈕（編輯、刪除、釘選）
</div>

<!-- 分頁導航 -->
<div class="pagination-section">
    - 上一頁 / 下一頁
    - 頁碼
    - 總筆數資訊
</div>
```

#### 6.1.2 卡片樣式設計
- **釘選卡片**: 金色邊框 + 釘選圖示
- **交替背景**: nth-child(odd/even) 不同背景色
- **懸停效果**: 滑鼠移入時陰影加深
- **響應式**: 手機版單欄，平板/桌面版雙欄或三欄

### 6.2 新增/編輯頁面 (Create.cshtml / Edit.cshtml)

#### 6.2.1 表單欄位
```html
<form id="memorandumForm">
    <!-- 標題輸入 -->
    <input type="text" name="Title" required maxlength="200" />
    
    <!-- 內容輸入（Markdown 編輯器） -->
    <textarea name="Content" required maxlength="10000"></textarea>
    
    <!-- 即時預覽區域 -->
    <div id="markdownPreview"></div>
    
    <!-- 標籤輸入（支援多標籤） -->
    <input type="text" id="tagInput" placeholder="輸入標籤後按 Enter" />
    <div id="tagList"></div>
    
    <!-- 顏色選擇器 -->
    <input type="color" name="Color" />
    
    <!-- 提交按鈕 -->
    <button type="submit">儲存</button>
    <a href="/Memorandum">取消</a>
</form>
```

#### 6.2.2 Markdown 編輯器功能
- 即時預覽
- 工具列（粗體、斜體、清單、連結等）
- 語法高亮
- 使用 Marked.js 解析 Markdown

#### 6.2.3 標籤輸入功能
- 按 Enter 新增標籤
- 點擊 × 移除標籤
- 標籤自動完成建議
- 限制單一標籤最大長度

### 6.3 JavaScript 邏輯 (memorandum.js)

#### 6.3.1 核心功能模組
```javascript
const MemorandumApp = {
    // 初始化
    init() {},
    
    // AJAX 請求
    loadMemorandums() {},
    createMemorandum(data) {},
    updateMemorandum(id, data) {},
    deleteMemorandum(id) {},
    
    // UI 更新
    renderMemorandumList(data) {},
    renderMemorandumCard(memorandum) {},
    
    // 搜尋與篩選
    searchMemorandums(keyword) {},
    filterByTag(tag) {},
    
    // Markdown 處理
    renderMarkdown(content) {},
    updatePreview() {},
    
    // 標籤管理
    addTag(tag) {},
    removeTag(tag) {},
    
    // 分頁
    loadPage(pageNumber) {},
    renderPagination(totalCount, currentPage) {},
    
    // 工具函式
    showMessage(message, type) {},
    confirmDelete(id) {},
    formatDate(dateString) {}
};
```

#### 6.3.2 事件綁定
- 搜尋框輸入: debounce 延遲搜尋
- 表單提交: 阻止預設行為，使用 AJAX
- 刪除按鈕: 顯示確認對話框
- 標籤點擊: 篩選該標籤的備忘錄
- Markdown 編輯: 即時更新預覽

---

## 7. 樣式設計

### 7.1 CSS 檔案 (memorandum.css)

#### 7.1.1 色彩配置
```css
:root {
    --primary-color: #007bff;
    --secondary-color: #6c757d;
    --success-color: #28a745;
    --danger-color: #dc3545;
    --warning-color: #ffc107;
    
    --bg-light: #f8f9fa;
    --bg-dark: #e9ecef;
    --card-shadow: 0 2px 4px rgba(0,0,0,0.1);
    --card-hover-shadow: 0 4px 8px rgba(0,0,0,0.15);
}
```

#### 7.1.2 卡片樣式
```css
.memorandum-card {
    - 圓角邊框
    - 陰影效果
    - transition 動畫
    - 交替背景色
}

.memorandum-card.pinned {
    - 金色邊框
    - 釘選圖示
}
```

#### 7.1.3 響應式設計
```css
/* 手機版 */
@media (max-width: 576px) {
    .memorandum-list { grid-template-columns: 1fr; }
}

/* 平板版 */
@media (min-width: 577px) and (max-width: 992px) {
    .memorandum-list { grid-template-columns: repeat(2, 1fr); }
}

/* 桌面版 */
@media (min-width: 993px) {
    .memorandum-list { grid-template-columns: repeat(3, 1fr); }
}
```

---

## 8. 功能詳細規格

### 8.1 新增備忘錄
**流程**:
1. 使用者點擊「新增備忘錄」按鈕
2. 導航至 Create.cshtml
3. 填寫表單（標題、內容、標籤、顏色）
4. 即時預覽 Markdown 內容
5. 提交表單（AJAX POST）
6. 驗證資料
7. 儲存至 JSON 檔案
8. 返回列表頁並顯示成功訊息

**驗證規則**:
- 標題: 必填，不超過 200 字元
- 內容: 必填，不超過 10000 字元
- 標籤: 選填，單一標籤不超過 50 字元

### 8.2 編輯備忘錄
**流程**:
1. 列表頁點擊「編輯」按鈕
2. 導航至 Edit.cshtml，帶入 Id 參數
3. 載入現有資料填入表單
4. 修改內容
5. 提交更新（AJAX POST）
6. UpdatedAt 自動更新為當前時間
7. 返回列表頁並顯示成功訊息

**特殊處理**:
- 如果 Id 不存在，返回 404 錯誤
- 保留 CreatedAt 原始時間
- 同步更新標籤清單

### 8.3 刪除備忘錄
**流程**:
1. 列表頁點擊「刪除」按鈕
2. 顯示確認對話框（SweetAlert2 或 Bootstrap Modal）
3. 確認後發送 AJAX DELETE 請求
4. 實作軟刪除（設定 IsDeleted = true）
5. 從列表中移除該卡片（淡出動畫）
6. 顯示成功訊息

**確認對話框內容**:
- 標題: "確認刪除"
- 內容: "確定要刪除「{備忘錄標題}」嗎？此操作無法復原。"
- 按鈕: "確認刪除" / "取消"

### 8.4 搜尋功能
**實作方式**:
- 搜尋框 input 事件觸發（debounce 500ms）
- 後端搜尋邏輯: Title 或 Content 包含關鍵字（忽略大小寫）
- 前端即時更新顯示結果
- 無結果時顯示「找不到符合的備忘錄」

**搜尋範圍**:
- 標題
- 內容
- 標籤

### 8.5 標籤篩選
**實作方式**:
- 下拉選單顯示所有可用標籤
- 點擊標籤後篩選出包含該標籤的備忘錄
- 支援多標籤篩選（AND 邏輯）
- 清除篩選按鈕

**標籤管理**:
- 自動收集所有備忘錄的標籤
- 去重複並排序
- 顯示每個標籤的使用次數

### 8.6 分頁功能
**實作方式**:
- 預設每頁 12 筆
- 使用 LINQ Skip() 和 Take()
- 前端顯示頁碼導航
- 顯示總筆數和當前頁資訊

**分頁元件**:
```
< 上一頁 | 1 2 [3] 4 5 | 下一頁 >
顯示 25-36 筆，共 120 筆
```

### 8.7 釘選功能
**實作方式**:
- 點擊釘選圖示切換狀態
- 釘選的備忘錄排在列表最前面
- 視覺標示: 金色邊框 + 📌 圖示
- 限制最多釘選 5 筆

---

## 9. 相依性注入設定

### 9.1 Program.cs 設定
```csharp
// 註冊備忘錄資料服務
builder.Services.AddScoped<IMemorandumDataService, MemorandumDataService>();

// 註冊 JSON 序列化選項
builder.Services.Configure<JsonOptions>(options =>
{
    options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
    options.JsonSerializerOptions.WriteIndented = true;
});
```

---

## 10. 錯誤處理與日誌

### 10.1 日誌記錄
**記錄時機**:
- 資料檔案讀取/寫入
- CRUD 操作
- 錯誤和例外情況
- 效能關鍵點

**日誌等級**:
- Information: 一般操作
- Warning: 潛在問題
- Error: 錯誤和例外
- Debug: 除錯資訊

### 10.2 例外處理
```csharp
try
{
    // 操作程式碼
}
catch (FileNotFoundException ex)
{
    _logger.LogError(ex, "找不到資料檔案: {FilePath}", _dataFilePath);
    return new MemorandumData();
}
catch (JsonException ex)
{
    _logger.LogError(ex, "JSON 解析錯誤");
    return new MemorandumData();
}
catch (Exception ex)
{
    _logger.LogError(ex, "未預期的錯誤");
    throw;
}
```

---

## 11. 效能考量

### 11.1 優化策略
- **快取機制**: 記憶體快取資料，減少檔案 I/O
- **延遲載入**: 分頁載入，避免一次載入大量資料
- **Debounce**: 搜尋框輸入延遲觸發
- **非同步處理**: 所有 I/O 操作使用 async/await
- **索引優化**: 為常用查詢建立索引（如標籤、時間）

### 11.2 效能指標
- 列表頁載入時間: < 500ms
- 搜尋回應時間: < 300ms
- 新增/編輯儲存時間: < 200ms

---

## 12. 安全性考量

### 12.1 輸入驗證
- 伺服器端驗證所有輸入
- 防止 XSS 攻擊: HTML Encode 使用者輸入
- 防止 SQL Injection: 使用參數化查詢（未來遷移資料庫時）
- 檔案路徑驗證: 防止路徑穿越攻擊

### 12.2 資料保護
- 軟刪除而非實體刪除
- 定期備份 JSON 檔案
- 敏感資料加密（未來擴充）

---

## 13. 測試計畫

### 13.1 單元測試
- MemorandumDataService 各方法測試
- Controller Action Methods 測試
- 資料驗證測試

### 13.2 整合測試
- 完整 CRUD 流程測試
- 搜尋與篩選功能測試
- 分頁功能測試

### 13.3 UI 測試
- 響應式設計測試（不同螢幕尺寸）
- 瀏覽器相容性測試
- Markdown 渲染測試

---

## 14. 未來擴充計畫

### 14.1 Phase 2 功能
- 多使用者支援（登入系統）
- 備忘錄分享功能
- 附件上傳（圖片、檔案）
- 提醒通知功能
- 匯出為 PDF/Word

### 14.2 Phase 3 功能
- 遷移至資料庫（Entity Framework Core）
- RESTful API 開發
- 行動版 App
- 協作編輯功能
- 版本控制

---

## 15. 開發時程估算

| 階段 | 工作項目 | 預估時間 |
|------|---------|---------|
| 1 | 資料模型與服務層 | 4 小時 |
| 2 | Controller 開發 | 4 小時 |
| 3 | 列表頁前端 | 6 小時 |
| 4 | 新增/編輯頁前端 | 6 小時 |
| 5 | JavaScript 邏輯 | 8 小時 |
| 6 | 樣式設計 | 4 小時 |
| 7 | 搜尋與篩選功能 | 4 小時 |
| 8 | 分頁功能 | 3 小時 |
| 9 | 標籤功能 | 3 小時 |
| 10 | Markdown 支援 | 4 小時 |
| 11 | 測試與除錯 | 6 小時 |
| 12 | 文件撰寫 | 2 小時 |
| **總計** | | **54 小時** |

---

## 16. 參考資源

### 16.1 技術文件
- [ASP.NET Core MVC 官方文件](https://docs.microsoft.com/aspnet/core/mvc)
- [Bootstrap 5 文件](https://getbootstrap.com/docs/5.0)
- [Marked.js 文件](https://marked.js.org)
- [C# 13 新功能](https://docs.microsoft.com/dotnet/csharp/whats-new/csharp-13)

### 16.2 設計參考
- Google Keep
- Notion
- Microsoft OneNote
- Evernote
