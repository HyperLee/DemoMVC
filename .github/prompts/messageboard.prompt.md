# Message Board (匿名留言板) - 規格書

## 專案概述
匿名留言板是一個輕量級的社群互動功能，讓使用者無需註冊或登入即可發表意見、交流想法。留言會在 24 小時後自動刪除，營造輕鬆、即時的交流氛圍。

### 核心特色
- 🎭 **完全匿名**：無需註冊或登入
- ⏰ **24 小時限時**：留言自動過期刪除
- 💬 **即時互動**：支援回覆、按讚功能
- 🎨 **現代化設計**：響應式設計 + 深色模式
- 🔍 **智慧搜尋**：關鍵字搜尋與排序功能

---

## 檔案結構規劃

### 1. 資料模型層 (Models)
**位置**: `DemoMVC/Models/`

#### 1.1 Message.cs
```csharp
// 主要留言資料模型
- MessageId (string, GUID)
- Content (string, 200字限制)
- CreatedAt (DateTime)
- EditedAt (DateTime?)
- LikeCount (int)
- ParentMessageId (string?, 用於回覆)
- IsDeleted (bool)
- UserIdentifier (string, Cookie/Session 識別)
```

#### 1.2 MessageData.cs
```csharp
// 留言集合包裝類別
- Messages (List<Message>)
- 包含載入/儲存 JSON 的輔助方法
```

#### 1.3 MessageFilterSettings.cs
```csharp
// 不當字詞過濾設定
- FilteredWords (List<string>)
- ReplacementChar (string, 預設 "*")
```

### 2. 服務層 (Services)
**位置**: `DemoMVC/Services/`

#### 2.1 IMessageBoardService.cs
```csharp
// 服務介面定義
- Task<List<Message>> GetAllMessagesAsync()
- Task<Message> GetMessageByIdAsync(string id)
- Task<Message> CreateMessageAsync(Message message)
- Task<Message> UpdateMessageAsync(Message message)
- Task<bool> DeleteMessageAsync(string id, string userIdentifier)
- Task<bool> LikeMessageAsync(string id)
- Task<List<Message>> SearchMessagesAsync(string keyword)
- Task CleanupExpiredMessagesAsync()
- string FilterContent(string content)
```

#### 2.2 MessageBoardService.cs
```csharp
// 服務實作類別
- 實作所有 CRUD 操作
- 自動過濾不當字詞
- 處理過期留言清理
- 管理 JSON 檔案讀寫
```

### 3. 控制器層 (Controllers)
**位置**: `DemoMVC/Controllers/`

#### 3.1 MessageBoardController.cs
```csharp
// API 端點
- GET    /MessageBoard/Index           (首頁，顯示留言列表)
- GET    /MessageBoard/GetMessages     (取得留言列表，支援分頁、排序)
- POST   /MessageBoard/Create          (建立新留言)
- PUT    /MessageBoard/Edit/{id}       (編輯留言)
- DELETE /MessageBoard/Delete/{id}     (刪除留言)
- POST   /MessageBoard/Like/{id}       (按讚)
- POST   /MessageBoard/Reply/{id}      (回覆留言)
- GET    /MessageBoard/Search          (搜尋留言)
```

### 4. 視圖層 (Views)
**位置**: `DemoMVC/Views/MessageBoard/`

#### 4.1 Index.cshtml
- 留言板主頁面
- 包含新增留言表單
- 顯示留言列表
- 分頁導覽元件
- 排序與搜尋介面

#### 4.2 _MessageCard.cshtml (Partial View)
- 單一留言卡片元件
- 包含按讚、回覆、編輯、刪除按鈕
- 顯示留言時間與編輯時間
- 回覆串展開/收合

#### 4.3 導覽列整合
**位置**: `DemoMVC/Views/Shared/_Layout.cshtml`

在導覽列新增留言板連結：
```html
<li class="nav-item">
    <a class="nav-link text-dark" asp-controller="MessageBoard" asp-action="Index">
        💬 留言板
    </a>
</li>
```

**插入位置**: 建議放在「📝 備忘錄」之後，與其他功能頁面並列

**完整導覽列順序**:
1. Home
2. Index2
3. Privacy
4. 🌍 世界時鐘
5. 🍅 番茄鐘
6. 🌐 3D地球儀
7. 📝 備忘錄
8. **💬 留言板** ← 新增項目

### 5. 前端資源
**位置**: `DemoMVC/wwwroot/`

#### 5.1 css/messageboard.css
- 留言板樣式
- 響應式設計規則
- 深色模式變數
- 動畫效果

#### 5.2 js/messageboard.js
- AJAX 請求處理
- 即時字數統計
- Markdown 渲染
- 留言操作互動邏輯

### 6. 資料儲存
**位置**: `DemoMVC/Data/`

#### 6.1 messages.json
```json
{
  "messages": [
    {
      "messageId": "guid",
      "content": "留言內容",
      "createdAt": "2025-10-01T10:00:00",
      "editedAt": null,
      "likeCount": 5,
      "parentMessageId": null,
      "isDeleted": false,
      "userIdentifier": "cookie-hash"
    }
  ]
}
```

#### 6.2 filter-words.json
```json
{
  "filteredWords": [
    "幹", "靠北", "靠腰", "三小", "87", "智障", "白痴", "北七",
    "機掰", "操", "fuck", "shit", "bitch", "damn", "ass",
    "垃圾", "廢物", "爛人", "死全家", "去死",
    "台獨", "中共", "習近平", "共匪", "支那", "426", "9.2", "綠蛆", "韓粉", "柯粉",
    "黑鬼", "尼哥", "nigger", "negro", "白皮豬", "死老外", "426仔", "黃種人", "低端人口",
    "賤人", "婊子", "妓女", "性侵", "強暴",
    "人渣", "敗類", "廢柴", "廢渣", "智商低", "腦殘", "白爛", "無腦"
  ]
}
```

**注意事項**:
- 字典會在應用程式啟動時載入
- 可依需求持續擴充或調整
- 建議定期審查並更新字詞清單
- 過濾時不區分大小寫
- 替換字元為 `***`

---

## 功能需求詳細說明

### 1. 留言管理功能

#### 1.1 建立留言
- **觸發條件**: 使用者在新增留言區塊輸入內容並送出
- **驗證規則**:
  - 內容不可為空白
  - 內容長度限制 1-200 字
  - 自動過濾不當字詞
  - 套用基本 Markdown 語法
- **處理流程**:
  1. 前端驗證輸入
  2. 傳送 POST 請求至後端
  3. 後端驗證與過濾內容
  4. 產生 GUID 與使用者識別碼 (Cookie)
  5. 儲存至 JSON 檔案
  6. 返回新留言資料
  7. 前端即時插入到列表頂端
- **錯誤處理**:
  - 超過字數限制：顯示錯誤訊息
  - 包含不當字詞：自動替換並提示
  - 儲存失敗：顯示錯誤訊息並保留輸入內容

#### 1.2 編輯留言
- **權限驗證**: 僅限原作者 (透過 Cookie 識別)
- **編輯限制**:
  - 建立後 10 分鐘內可編輯
  - 已有回覆的留言不可編輯 (選用)
- **處理流程**:
  1. 檢查使用者權限
  2. 驗證編輯時間限制
  3. 套用內容過濾與驗證
  4. 更新 `EditedAt` 時間戳記
  5. 儲存變更
  6. 前端更新顯示並標記「已編輯」
- **顯示規則**:
  - 編輯後顯示「已編輯」標籤
  - Hover 時顯示編輯時間

#### 1.3 刪除留言
- **權限驗證**: 僅限原作者
- **刪除方式**: 軟刪除 (標記 `IsDeleted = true`)
- **處理流程**:
  1. 檢查使用者權限
  2. 標記為已刪除
  3. 保留資料結構 (避免回覆串斷裂)
  4. 前端移除顯示或顯示「此留言已刪除」
- **連帶影響**:
  - 回覆串保留，但顯示父留言已刪除
  - 按讚數清零 (選用)

#### 1.4 自動刪除過期留言
- **執行時機**:
  - 使用者進入頁面時觸發
  - 背景排程每小時執行 (選用)
- **刪除條件**: `CreatedAt` 超過 24 小時
- **處理流程**:
  1. 掃描所有留言
  2. 篩選出過期留言
  3. 永久刪除 (包含所有回覆)
  4. 更新 JSON 檔案

### 2. 互動功能

#### 2.1 按讚功能
- **限制機制**:
  - 每個使用者 (Cookie) 對每則留言只能按讚一次
  - 使用 LocalStorage 或 Cookie 記錄已按讚的留言 ID
- **處理流程**:
  1. 檢查是否已按讚
  2. 未按讚：`LikeCount + 1`，記錄到 LocalStorage
  3. 已按讚：取消按讚，`LikeCount - 1`，移除記錄
  4. 更新前端顯示 (愛心圖示變色)
- **視覺回饋**:
  - 按讚：愛心填滿紅色 + 數字增加動畫
  - 取消：愛心空心灰色 + 數字減少動畫

#### 2.2 回覆功能
- **回覆層級**: 僅支援一層回覆 (扁平化結構)
- **顯示方式**:
  - 回覆顯示在原留言下方，縮排表示關聯
  - 顯示「回覆 @原留言」標記
- **處理流程**:
  1. 點擊回覆按鈕
  2. 展開回覆輸入框
  3. 輸入內容並送出
  4. 設定 `ParentMessageId` 為原留言 ID
  5. 儲存為新留言
  6. 前端插入到原留言下方
- **限制**:
  - 回覆也受 200 字限制
  - 回覆可以被回覆 (但不建議，避免巢狀過深)

### 3. 搜尋與排序功能

#### 3.1 關鍵字搜尋
- **搜尋範圍**: 留言內容 (不包含已刪除)
- **搜尋方式**:
  - 即時搜尋 (輸入時自動觸發)
  - 不區分大小寫
  - 支援部分匹配
- **處理流程**:
  1. 使用者輸入關鍵字
  2. 前端防抖動處理 (300ms)
  3. 傳送 GET 請求至後端
  4. 後端過濾留言
  5. 返回符合結果
  6. 前端更新顯示，高亮關鍵字
- **特殊處理**:
  - 空白搜尋：顯示全部留言
  - 無結果：顯示「找不到相關留言」

#### 3.2 排序功能
**排序選項**:
1. **最新優先** (預設)
   - 依據 `CreatedAt` 降冪排序
   - 編輯不影響排序位置
   
2. **最熱門優先**
   - 依據 `LikeCount` 降冪排序
   - 相同讚數則依建立時間排序

3. **最舊優先**
   - 依據 `CreatedAt` 升冪排序

**處理方式**:
- 前端排序 (效能較佳)
- 或後端排序 (支援大量資料)

#### 3.3 分頁功能
- **每頁顯示**: 10 則留言
- **分頁元件**:
  - 顯示頁碼按鈕 (1, 2, 3, ..., 最後一頁)
  - 上一頁/下一頁按鈕
  - 總頁數與當前頁數顯示
- **處理方式**:
  - 前端分頁：一次載入全部，前端切割
  - 後端分頁：每次請求指定頁數資料
- **URL 參數**: `/MessageBoard?page=2&sort=likes`

### 4. 內容過濾與驗證

#### 4.1 不當字詞過濾
- **過濾字典**: 從 `filter-words.json` 載入
- **過濾方式**:
  - 完全匹配替換
  - 將不當字詞替換為 `***`
- **過濾時機**:
  - 建立留言時
  - 編輯留言時
- **使用者提示**:
  - 若內容被過濾，顯示警告訊息
  - 例如：「您的留言包含不當字詞，已自動過濾」

#### 4.2 Markdown 支援
**支援的語法**:
- `**粗體**` → **粗體**
- `*斜體*` → *斜體*
- `[連結文字](URL)` → 超連結
- `~~刪除線~~` → ~~刪除線~~

**實作方式**:
- 使用前端 Markdown 解析函式庫 (如 `marked.js`)
- 或後端解析後輸出 HTML

**安全性考量**:
- 移除 HTML 標籤 (防止 XSS 攻擊)
- 僅保留白名單標籤 (`<strong>`, `<em>`, `<a>`, `<del>`)
- 超連結自動加上 `rel="noopener noreferrer"`

#### 4.3 字數限制
- **限制**: 200 字 (中文、英文、數字、符號皆計入)
- **即時顯示**: 輸入框下方顯示「已輸入 X / 200 字」
- **視覺提示**:
  - 0-180 字：灰色
  - 181-200 字：橘色警告
  - 超過 200 字：紅色錯誤，禁用送出按鈕

### 5. 使用者識別機制

#### 5.1 匿名識別
- **目的**: 在不要求登入的前提下，識別使用者以便管理權限
- **實作方式**:
  - 使用者首次進入時，產生隨機 GUID
  - 儲存至 Cookie (名稱: `MessageBoardUserId`)
  - 有效期限: 7 天
  - HttpOnly: False (需前端存取)
  - Secure: True (HTTPS only)
  - SameSite: Strict

#### 5.2 權限判斷
- **可執行操作**:
  - 編輯/刪除自己的留言：比對 `UserIdentifier`
  - 按讚任何留言：記錄在 LocalStorage
  - 回覆任何留言：無限制

---

## 使用者介面設計規範

### 1. 頁面佈局

#### 1.1 整體結構
```
┌─────────────────────────────────────────┐
│          導覽列 (Navbar)                │
├─────────────────────────────────────────┤
│                                         │
│  ┌───────────────────────────────────┐ │
│  │    新增留言區塊                   │ │
│  │  - 文字輸入框                     │ │
│  │  - 字數計數                       │ │
│  │  - 送出按鈕                       │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  搜尋與排序工具列                 │ │
│  │  - 搜尋框                         │ │
│  │  - 排序下拉選單                   │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  留言卡片 #1                      │ │
│  │    - 內容                         │ │
│  │    - 時間 / 按讚數                │ │
│  │    - 操作按鈕                     │ │
│  │    └── 回覆 #1.1                  │ │
│  │    └── 回覆 #1.2                  │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │  留言卡片 #2                      │ │
│  └───────────────────────────────────┘ │
│                                         │
│            ... (更多留言)               │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │         分頁導覽                  │ │
│  │      ◀ 1 [2] 3 4 5 ... 10 ▶      │ │
│  └───────────────────────────────────┘ │
│                                         │
└─────────────────────────────────────────┘
```

### 2. 元件設計規範

#### 2.1 新增留言區塊
**元件組成**:
- **標題**: 「✍️ 發表您的想法」
- **文字輸入框**:
  - Placeholder: 「匿名留言，24 小時後自動刪除...」
  - 多行輸入 (Textarea)
  - 最小高度: 100px
  - 自動高度調整 (最大 300px)
  - 圓角設計、陰影效果
- **字數計數器**:
  - 位置: 輸入框右下角
  - 格式: 「X / 200」
  - 顏色動態變化
- **送出按鈕**:
  - 文字: 「📤 發送」
  - 位置: 輸入框右下方
  - 主色調按鈕
  - 載入狀態顯示 Spinner
- **Markdown 提示**:
  - 小圖示按鈕，點擊顯示支援的語法說明

#### 2.2 留言卡片
**卡片結構**:
```
┌─────────────────────────────────────┐
│  👤 匿名使用者  📅 2 小時前         │
│  ────────────────────────────────   │
│  這是留言內容，支援 **Markdown**   │
│  語法顯示                           │
│  ────────────────────────────────   │
│  ❤️ 5  💬 2  ✏️ 編輯  🗑️ 刪除    │
│                                     │
│    └─ 👤 匿名回覆  📅 1 小時前     │
│       回覆內容...                   │
│                                     │
└─────────────────────────────────────┘
```

**樣式規範**:
- 背景: 白色 (淺色模式) / 深灰色 (深色模式)
- 邊框: 淺灰色 1px
- 圓角: 8px
- 陰影: 輕微陰影 (hover 時加深)
- 間距: 上下留言間距 16px

**互動狀態**:
- Hover: 陰影加深、邊框顏色變化
- 按讚動畫: 愛心放大 + 彈跳效果
- 刪除確認: 顯示確認對話框

#### 2.3 回覆區塊
**顯示方式**:
- 縮排: 左側縮排 32px
- 連接線: 左側顯示垂直線條連接到父留言
- 背景: 略深於父留言 (區別層級)
- 折疊功能: 回覆超過 3 則時，顯示「展開更多回覆」按鈕

**回覆輸入**:
- 點擊「回覆」按鈕後，在卡片下方展開輸入框
- 小型文字框 (高度 60px)
- 包含「取消」與「送出」按鈕
- 字數限制同主留言

#### 2.4 搜尋與排序工具列
**佈局**:
```
┌─────────────────────────────────────┐
│  🔍 [搜尋關鍵字...]  |  排序: [▼]  │
└─────────────────────────────────────┘
```

**搜尋框**:
- 寬度: 60%
- 圖示: 放大鏡
- Placeholder: 「搜尋留言內容...」
- 即時搜尋 (防抖動 300ms)

**排序選單**:
- 下拉選單
- 選項: 最新優先 / 最熱門優先 / 最舊優先
- 預設: 最新優先

#### 2.5 分頁元件
**樣式**:
- 置中對齊
- 按鈕設計: 圓形或圓角方形
- 當前頁: 主色調背景 + 白色文字
- 其他頁: 透明背景 + 主色調文字
- 禁用狀態: 灰色、不可點擊

**功能**:
- 頁碼按鈕: 顯示前後 2 頁 + 首尾頁
- 省略符號: 頁數過多時顯示「...」
- 上/下一頁: 箭頭按鈕

### 3. 響應式設計

#### 3.1 桌面版 (≥ 1024px)
- 內容寬度: 最大 900px，置中顯示
- 留言卡片: 單欄顯示
- 側邊可顯示統計資訊 (選用)

#### 3.2 平板版 (768px - 1023px)
- 內容寬度: 100%，左右 Padding 24px
- 留言卡片: 單欄顯示
- 字體略小

#### 3.3 手機版 (< 768px)
- 內容寬度: 100%，左右 Padding 16px
- 搜尋與排序工具列: 垂直排列
- 留言卡片: 全寬顯示
- 操作按鈕: 圖示化，移除文字標籤
- 回覆縮排: 減少至 16px

### 4. 深色模式

#### 4.1 色彩變數
**淺色模式**:
- 背景: `#FFFFFF`
- 卡片背景: `#F9FAFB`
- 文字: `#111827`
- 次要文字: `#6B7280`
- 邊框: `#E5E7EB`
- 主色調: `#3B82F6`

**深色模式**:
- 背景: `#111827`
- 卡片背景: `#1F2937`
- 文字: `#F9FAFB`
- 次要文字: `#9CA3AF`
- 邊框: `#374151`
- 主色調: `#60A5FA`

#### 4.2 切換方式
- 自動偵測系統偏好設定 (prefers-color-scheme)
- 手動切換按鈕 (儲存於 LocalStorage)
- 平滑過渡動畫 (transition: 0.3s)

### 5. 動畫效果

#### 5.1 頁面載入
- 留言卡片: 淡入 + 上滑動畫 (stagger 效果)
- 延遲: 每個卡片間隔 50ms

#### 5.2 互動動畫
- 按讚: 愛心放大彈跳 (scale 1.2 → 1.0)
- 送出: 按鈕短暫縮放 + 顯示 Spinner
- 刪除: 卡片淡出 + 高度折疊
- 回覆展開: 高度動畫 + 淡入

#### 5.3 載入狀態
- Spinner: 圓形旋轉動畫
- 骨架屏: 顯示卡片形狀的灰色佔位符 (Skeleton Loading)

---

## 技術實作規範

### 1. 後端實作 (ASP.NET Core MVC)

#### 1.1 依賴注入設定
**Program.cs**:
```csharp
// 註冊服務
builder.Services.AddSingleton<IMessageBoardService, MessageBoardService>();

// Session 設定 (用於使用者識別)
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromDays(7);
    options.Cookie.HttpOnly = false; // 允許前端存取
    options.Cookie.IsEssential = true;
});
```

#### 1.2 資料服務實作要點
**MessageBoardService.cs**:
- 使用 `System.Text.Json` 處理 JSON 序列化
- 實作檔案鎖定機制 (避免並發寫入衝突)
- 使用 `async/await` 非同步 I/O 操作
- 實作錯誤處理與日誌記錄

**關鍵方法實作**:
1. **載入留言**:
   ```csharp
   - 讀取 messages.json
   - 反序列化為物件
   - 套用過期留言過濾
   ```

2. **儲存留言**:
   ```csharp
   - 序列化物件
   - 寫入 messages.json
   - 實作 File Locking
   ```

3. **內容過濾**:
   ```csharp
   - 載入 filter-words.json
   - 使用 Regex 進行字詞替換
   - 保留原始長度 (替換為星號)
   ```

#### 1.3 控制器實作要點
**MessageBoardController.cs**:
- 使用 `[HttpGet]`, `[HttpPost]` 等屬性標註
- 實作 ModelState 驗證
- 使用 `IActionResult` 返回適當的 HTTP 狀態碼
- 使用 Cookie 取得 `UserIdentifier`

**API 回應格式**:
```json
{
  "success": true,
  "message": "操作成功",
  "data": { /* 資料物件 */ }
}
```

**錯誤回應格式**:
```json
{
  "success": false,
  "message": "錯誤訊息",
  "errors": ["詳細錯誤1", "詳細錯誤2"]
}
```

### 2. 前端實作 (JavaScript + jQuery)

#### 2.1 主要功能模組
**messageboard.js 結構**:
```javascript
const MessageBoard = {
  // 初始化
  init: function() { },
  
  // 載入留言列表
  loadMessages: function(page, sort) { },
  
  // 建立留言
  createMessage: function(content) { },
  
  // 編輯留言
  editMessage: function(id, content) { },
  
  // 刪除留言
  deleteMessage: function(id) { },
  
  // 按讚
  likeMessage: function(id) { },
  
  // 回覆
  replyMessage: function(parentId, content) { },
  
  // 搜尋
  searchMessages: function(keyword) { },
  
  // 渲染留言卡片
  renderMessageCard: function(message) { },
  
  // 字數計算
  updateCharCount: function() { },
  
  // 使用者識別
  getUserIdentifier: function() { },
  
  // LocalStorage 管理 (已按讚)
  getLikedMessages: function() { },
  saveLikedMessage: function(id) { }
};
```

#### 2.2 AJAX 請求處理
- 使用 `$.ajax()` 或 `fetch()` API
- 實作載入狀態顯示
- 實作錯誤處理與使用者提示
- 實作請求防抖動 (debounce)

#### 2.3 Markdown 渲染
- 使用 `marked.js` 或類似函式庫
- 設定安全選項 (sanitize: true)
- 自訂渲染規則 (限制支援的語法)

### 3. 樣式實作 (CSS)

#### 3.1 CSS 變數定義
```css
:root {
  --primary-color: #3B82F6;
  --bg-color: #FFFFFF;
  --card-bg: #F9FAFB;
  --text-color: #111827;
  --border-color: #E5E7EB;
  --shadow: 0 1px 3px rgba(0,0,0,0.1);
}

[data-theme="dark"] {
  --bg-color: #111827;
  --card-bg: #1F2937;
  --text-color: #F9FAFB;
  --border-color: #374151;
}
```

#### 3.2 關鍵樣式類別
- `.message-card`: 留言卡片基礎樣式
- `.message-card-hover`: Hover 效果
- `.message-content`: 留言內容區域 (Markdown 渲染)
- `.message-actions`: 操作按鈕區域
- `.reply-item`: 回覆項目樣式
- `.char-counter`: 字數計數器
- `.pagination`: 分頁元件

#### 3.3 響應式斷點
```css
/* 手機版 */
@media (max-width: 767px) { }

/* 平板版 */
@media (min-width: 768px) and (max-width: 1023px) { }

/* 桌面版 */
@media (min-width: 1024px) { }
```

### 4. 資料持久化

#### 4.1 JSON 檔案結構
**messages.json** 範例:
```json
{
  "messages": [
    {
      "messageId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "content": "這是一則測試留言，支援 **Markdown** 語法！",
      "createdAt": "2025-10-01T14:30:00",
      "editedAt": null,
      "likeCount": 3,
      "parentMessageId": null,
      "isDeleted": false,
      "userIdentifier": "cookie-hash-12345"
    },
    {
      "messageId": "b2c3d4e5-f6g7-8901-bcde-fg2345678901",
      "content": "這是一則回覆",
      "createdAt": "2025-10-01T14:35:00",
      "editedAt": null,
      "likeCount": 1,
      "parentMessageId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
      "isDeleted": false,
      "userIdentifier": "cookie-hash-67890"
    }
  ],
  "lastCleanup": "2025-10-01T14:00:00"
}
```

#### 4.2 檔案操作最佳實踐
- 使用 `FileStream` 進行讀寫
- 實作檔案鎖定 (FileShare.None)
- 實作重試機制 (檔案被佔用時)
- 定期備份 (選用)

---

## 效能優化建議

### 1. 前端效能
- **延遲載入**: 使用 Intersection Observer API 實作無限滾動 (選用)
- **快取策略**: 使用 LocalStorage 快取留言列表 (短時間)
- **防抖動**: 搜尋輸入實作 300ms 防抖動
- **虛擬捲動**: 大量留言時使用虛擬捲動技術 (選用)

### 2. 後端效能
- **記憶體快取**: 使用 `IMemoryCache` 快取留言列表 (5 分鐘)
- **檔案監控**: 使用 `FileSystemWatcher` 監控 JSON 檔案變更
- **非同步處理**: 所有 I/O 操作使用 async/await
- **分頁載入**: 後端實作分頁邏輯，避免一次載入全部資料

### 3. 資料庫考量
- **JSON 檔案限制**: 留言數量建議不超過 1000 則
- **升級方案**: 資料量增大時，考慮遷移至 SQLite 或 SQL Server
- **資料清理**: 定期清理過期留言，維持檔案大小

---

## 安全性考量

### 1. XSS 防護
- **輸入驗證**: 移除所有 HTML 標籤 (除 Markdown 白名單)
- **輸出編碼**: 使用 `Html.Encode()` 或前端 XSS 過濾函式庫
- **CSP 設定**: 設定 Content Security Policy 標頭

### 2. CSRF 防護
- 使用 ASP.NET Core 內建的 Anti-Forgery Token
- POST 請求驗證 Token

### 3. 速率限制
- **留言頻率**: 同一使用者每分鐘最多發送 5 則留言
- **按讚頻率**: 同一使用者每秒最多按讚 10 次
- **實作方式**: 使用 Middleware 或 ActionFilter

### 4. 資料驗證
- **後端驗證**: 絕不信任前端輸入，後端必須再次驗證
- **字數限制**: 確保不超過 200 字
- **內容檢查**: 過濾 SQL 注入、Script 標籤等

---

## 測試計畫

### 1. 單元測試
**測試範圍**:
- `MessageBoardService` 的所有方法
- 內容過濾功能
- 過期留言清理邏輯

**測試工具**: xUnit + Moq

### 2. 整合測試
**測試範圍**:
- API 端點完整流程
- JSON 檔案讀寫
- Cookie 與 Session 處理

### 3. 前端測試
**測試範圍**:
- AJAX 請求與回應處理
- UI 互動邏輯
- 字數計算功能

**測試工具**: Jest (選用)

### 4. 使用者測試情境
1. **建立留言流程**:
   - 輸入正常內容 → 成功發送
   - 輸入超過 200 字 → 顯示錯誤
   - 輸入不當字詞 → 自動過濾並提示

2. **編輯留言流程**:
   - 編輯自己的留言 → 成功
   - 編輯他人留言 → 失敗 (權限不足)
   - 超過 10 分鐘編輯 → 失敗 (時間限制)

3. **刪除留言流程**:
   - 刪除自己的留言 → 成功
   - 刪除他人留言 → 失敗

4. **按讚流程**:
   - 首次按讚 → 數字 +1，愛心變紅
   - 再次點擊 → 數字 -1，愛心變灰
   - 重新整理後 → 狀態保持

5. **回覆流程**:
   - 回覆主留言 → 顯示在下方
   - 回覆回覆 → 同樣顯示在下方

6. **搜尋流程**:
   - 輸入存在的關鍵字 → 顯示相關結果
   - 輸入不存在的關鍵字 → 顯示無結果
   - 清空搜尋 → 顯示全部

7. **排序流程**:
   - 切換排序方式 → 列表重新排列
   - 排序後分頁 → 分頁正常運作

8. **過期留言測試**:
   - 建立留言後修改系統時間 → 24 小時後自動刪除
   - 進入頁面 → 觸發清理機制

---

## 部署與維運

### 1. 部署檢查清單
- [ ] 設定正確的 `appsettings.json` (資料檔案路徑)
- [ ] 確保 `Data` 資料夾有讀寫權限
- [ ] 初始化 `messages.json` 與 `filter-words.json` (含預設不當字詞)
- [ ] 更新 `_Layout.cshtml` 導覽列，新增留言板連結
- [ ] 設定 HTTPS (Secure Cookie)
- [ ] 設定 CSP 標頭
- [ ] 測試深色模式與響應式設計
- [ ] 測試各瀏覽器相容性
- [ ] 測試不當字詞過濾功能是否正常運作

### 2. 監控指標
- JSON 檔案大小 (建議 < 5MB)
- 留言總數 (建議 < 1000)
- 平均回應時間 (建議 < 200ms)
- 錯誤率 (建議 < 1%)

### 3. 維護計畫
- **每日**: 檢查過期留言清理是否正常
- **每週**: 檢查 JSON 檔案大小，必要時手動清理
- **每月**: 更新不當字詞字典
- **每季**: 檢查並更新相依套件

---

## 未來擴充功能

### 1. 短期擴充 (1-3 個月)
- 🖼️ **圖片上傳**: 支援留言附加圖片
- 🏷️ **標籤系統**: 為留言加上分類標籤
- 📊 **統計儀表板**: 顯示留言數量、按讚趨勢等

### 2. 中期擴充 (3-6 個月)
- 🔔 **通知系統**: 有人回覆時通知原作者
- 🎨 **自訂頭像**: 隨機生成匿名頭像
- 💾 **資料庫遷移**: 從 JSON 遷移至 SQLite/SQL Server
- 🌐 **多語系支援**: 支援英文、日文等

### 3. 長期擴充 (6-12 個月)
- 🤖 **AI 內容審核**: 使用 AI 自動偵測不當內容
- 📱 **行動應用**: 開發 iOS/Android App
- 🔗 **社群分享**: 支援分享到社群媒體
- 👥 **註冊會員系統**: 提供會員與匿名雙模式

---

## 附錄

### A. 不當字詞字典範例
**filter-words.json**:
```json
{
  "filteredWords": [
    "幹",
    "靠北",
    "靠腰",
    "三小",
    "87",
    "智障",
    "白痴",
    "北七",
    "機掰",
    "操",
    "fuck",
    "shit",
    "bitch",
    "damn",
    "ass",
    "垃圾",
    "廢物",
    "爛人",
    "死全家",
    "去死",
    "台獨",
    "中共",
    "習近平",
    "共匪",
    "支那",
    "426",
    "9.2",
    "綠蛆",
    "韓粉",
    "柯粉",
    "黑鬼",
    "尼哥",
    "nigger",
    "negro",
    "白皮豬",
    "死老外",
    "426仔",
    "黃種人",
    "低端人口",
    "賤人",
    "婊子",
    "妓女",
    "性侵",
    "強暴",
    "人渣",
    "敗類",
    "廢柴",
    "廢渣",
    "智商低",
    "腦殘",
    "白爛",
    "無腦"
  ]
}
```

**分類說明**:
- **髒話類**: 幹、靠北、靠腰、三小、操、fuck、shit 等
- **不雅字類**: 白痴、智障、北七、機掰、bitch、ass 等
- **敏感政治類**: 台獨、中共、習近平、共匪、支那、9.2 等
- **種族歧視類**: 黑鬼、尼哥、nigger、白皮豬、死老外、426仔、黃種人 等
- **人身攻擊類**: 垃圾、廢物、爛人、死全家、去死、賤人、人渣、敗類、腦殘 等

### B. 相依套件清單
**前端**:
- jQuery 3.7.1
- Bootstrap 5.3.x (選用)
- marked.js (Markdown 解析)
- DOMPurify (XSS 過濾)

**後端**:
- ASP.NET Core 8.0
- System.Text.Json (內建)
- (無額外套件)

### C. 瀏覽器相容性
**支援的瀏覽器**:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**不支援**:
- Internet Explorer 11 及以下

### D. API 文件範例

#### POST /MessageBoard/Create
**請求**:
```json
{
  "content": "留言內容"
}
```

**回應**:
```json
{
  "success": true,
  "message": "留言已發送",
  "data": {
    "messageId": "guid",
    "content": "留言內容",
    "createdAt": "2025-10-01T14:30:00",
    "likeCount": 0
  }
}
```

#### GET /MessageBoard/GetMessages
**查詢參數**:
- `page`: 頁碼 (預設 1)
- `pageSize`: 每頁筆數 (預設 10)
- `sort`: 排序方式 (`newest` | `popular` | `oldest`)

**回應**:
```json
{
  "success": true,
  "data": {
    "messages": [ /* 留言陣列 */ ],
    "totalCount": 100,
    "currentPage": 1,
    "totalPages": 10
  }
}
```

---

## 結語

本規格書詳細定義了匿名留言板的所有功能、技術實作、UI/UX 設計規範與安全性考量。請在開發過程中嚴格遵循本規格，確保產出高品質、安全、易用的產品。

**規格書版本**: v1.0  
**最後更新**: 2025 年 10 月 1 日  
**作者**: GitHub Copilot  
**審核**: 待審核
