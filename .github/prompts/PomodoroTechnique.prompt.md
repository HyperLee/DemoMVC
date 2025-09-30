# Pomodoro Technique - 番茄鐘工作法
> 版本: 2.0  
> 建立日期: 2025-09-30  
> 最後更新: 2025-10-01  
> 專案: DemoMVC

---

## 📋 目錄
1. [專案概述](#專案概述)
2. [實作更新記錄](#實作更新記錄) ⭐ 新增
3. [檔案位置規劃](#檔案位置規劃)
4. [功能需求](#功能需求)
5. [資料模型設計](#資料模型設計)
6. [API 端點設計](#api-端點設計)
7. [前端 UI/UX 設計](#前端-uiux-設計)
8. [技術規格](#技術規格)
9. [開發流程](#開發流程)
10. [測試計畫](#測試計畫)

---

## 📝 實作更新記錄

### 版本 2.0 更新 (2025-10-01)

#### 與原規格的差異

本專案在實作過程中，根據實際開發經驗和使用者體驗考量，對原規格進行了以下調整和增強：

#### 1. 音效系統實作方式

**原規格**:
```
wwwroot/sounds/
├── work-complete.mp3
└── break-complete.mp3
```

**實際實作**:
- 使用 **Web Audio API** 動態生成音效
- 不需要外部音效檔案
- 優點：
  - ✅ 無版權問題
  - ✅ 減少檔案大小
  - ✅ 即時生成，無載入延遲
  - ✅ 可自訂音頻參數

**實作程式碼** (`pomodoro.js`):
```javascript
playSound() {
    if (!this.settings.soundEnabled || !this.audioContext) return;
    
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    
    gainNode.gain.setValueAtTime(this.settings.volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.5);
}
```

#### 2. 任務管理增強功能（超出原規格）

##### A. 智慧按鈕切換
- **功能**: 任務開始後，「開始」按鈕自動變成「暫停」按鈕
- **實作日期**: 2025-10-01
- **使用者價值**: 
  - 一鍵操作，無需切換到計時器區域
  - 即時視覺回饋，清楚顯示任務狀態

##### B. 樂觀更新機制
- **功能**: 點擊開始後立即更新 UI，不等待 API 回應
- **實作日期**: 2025-10-01
- **使用者價值**: 
  - 零感知延遲
  - 即時回饋

##### C. 視覺效果增強
- **功能**: 正在執行的任務有特殊視覺效果
- **實作日期**: 2025-10-01
- **視覺元素**:
  - 脈搏動畫（陰影跳動）
  - 旋轉圖示 🔄
  - 特殊背景色和邊框

#### 3. Bug 修正記錄

##### Bug #1: 任務開始不會自動倒數
- **發現日期**: 2025-10-01
- **問題**: 點擊任務的「開始」按鈕後，需要再次點擊計時器的「開始」才會倒數
- **原因**: `startTaskSession()` 沒有呼叫 `startTimer()`
- **修正**: 在 `startTaskSession()` 中新增 `this.startTimer()`

##### Bug #2: 任務狀態不更新
- **發現日期**: 2025-10-01
- **問題**: 任務開始後，不會顯示在「進行中」列表
- **原因**: 
  1. 後端只更新 Pending 狀態的任務
  2. 前端沒有重新載入任務列表
- **修正**:
  1. 後端：改為更新所有非已完成的任務
  2. 前端：新增樂觀更新和 API 回應後重新載入

#### 4. 技術文件參考

與本規格書相關的技術文件：

1. **[番茄鐘技術總結](../Summarize/PomodoroTechnique-Summary.md)**  
   - 完整的系統架構說明

2. **[UI/UX 增強技術總結](../Summarize/Pomodoro-UI-Enhancement-Summary.md)**  
   - 本次修正的完整記錄

3. **[修正說明 v2](../../修正說明_v2.md)**  
   - 使用者導向的修正說明

#### 版本歷史

| 版本 | 日期 | 主要變更 |
|------|------|---------|
| 1.0 | 2025-09-30 | 初始規格書 |
| 2.0 | 2025-10-01 | 新增實作更新記錄章節 |

---

## 📖 專案概述

### 什麼是番茄工作法？
番茄工作法（英語：Pomodoro Technique）是一種時間管理方法，該方法使用一個定時器來分割出一個一般為 25 分鐘的工作時間和 5 分鐘的休息時間，而那些時間段被稱為 pomodoros。

### 五個核心步驟
1. **決定任務**：選擇需要先完成的任務
2. **設定計時器**：設定番茄工作法定時器至 n 分鐘（通常為 25 分鐘）
3. **專注工作**：持續工作直至定時器提示，記下一個番茄
4. **短暫休息**：休息 3-5 分鐘
5. **長時間休息**：每四個番茄，休息 15-30 分鐘

### 核心原理
番茄工作法的關鍵是**規劃、追蹤、記錄、處理、以及可視化**。

- **規劃階段**：任務根據優先級排入 "To Do Today" 清單
- **追蹤記錄**：每個番茄時結束後，成果被記錄下來
- **成就感提升**：為未來的自我觀察和改進提供原始數據
- **減少干擾**：減少內生和外在的干擾對意識流的影響

---

## 📁 檔案位置規劃

### 後端檔案結構
```
DemoMVC/
├── Controllers/
│   └── PomodoroController.cs          # 番茄鐘控制器
├── Models/
│   ├── PomodoroTask.cs                # 任務模型
│   ├── PomodoroSession.cs             # 工作階段模型
│   └── PomodoroSettings.cs            # 設定模型
├── Services/
│   └── IPomodoroService.cs            # 番茄鐘服務介面 (可選)
└── Data/
    └── pomodoro-data.json              # JSON 資料儲存檔案
```

### 前端檔案結構
```
DemoMVC/
├── Views/
│   └── Pomodoro/
│       ├── Index.cshtml                # 主畫面
│       ├── _TimerCard.cshtml           # 計時器卡片部分檢視
│       └── _TaskList.cshtml            # 任務清單部分檢視
├── wwwroot/
│   ├── css/
│   │   └── pomodoro.css                # 番茄鐘樣式
│   ├── js/
│   │   └── pomodoro.js                 # 番茄鐘 JavaScript
│   └── sounds/
│       ├── work-complete.mp3           # 工作完成音效
│       └── break-complete.mp3          # 休息完成音效
```

### 導覽列更新
- 檔案：`Views/Shared/_Layout.cshtml`
- 新增導覽連結到番茄鐘頁面

---

## 🎯 功能需求

### FR-001: 計時器核心功能
- **描述**：實作番茄鐘計時器核心邏輯
- **需求**：
  - 支援工作時間倒數計時（預設 25 分鐘，可自訂）
  - 支援短休息時間（預設 5 分鐘，可自訂）
  - 支援長休息時間（預設 15 分鐘，可自訂）
  - 計時器精確度至秒級
  - 自動切換工作/休息狀態
- **驗收標準**：
  - 計時器倒數正確無誤差
  - 時間歸零時自動觸發狀態切換

### FR-002: 控制按鈕
- **描述**：提供使用者控制計時器的操作介面
- **需求**：
  - **開始按鈕**：啟動計時器
  - **暫停按鈕**：暫停計時器（可續繼）
  - **重設按鈕**：重置計時器至初始狀態
  - 按鈕狀態管理（disabled/enabled）
- **驗收標準**：
  - 按鈕互動流暢無延遲
  - 狀態切換邏輯正確

### FR-003: 任務管理
- **描述**：允許使用者建立、追蹤和管理任務
- **需求**：
  - 輸入框：輸入任務名稱（必填，最多 100 字元）
  - 新增任務：將任務加入待辦清單
  - 開始任務：選擇任務並啟動番茄鐘
  - 完成任務：標記任務為已完成
  - 刪除任務：從清單中移除任務
  - 任務計數：顯示已完成的番茄數量
- **驗收標準**：
  - 任務資料持久化儲存
  - 任務狀態更新即時反應

### FR-004: 資料持久化
- **描述**：使用 JSON 格式儲存任務和設定資料
- **需求**：
  - 儲存格式：JSON
  - 儲存位置：伺服器端檔案系統
  - 儲存內容：任務清單、設定選項、統計數據
  - 自動儲存：任務狀態變更時自動儲存
- **驗收標準**：
  - 資料正確儲存和讀取
  - JSON 格式驗證通過

### FR-005: 音效提示系統
- **描述**：在關鍵時刻提供聲音提示
- **需求**：
  - 工作時間結束音效
  - 休息時間結束音效
  - 音效開關控制（預設開啟）
  - 音量控制（可選）
- **音效規格**：
  - 格式：MP3
  - 時長：2-5 秒
  - 音量：適中不刺耳
  - 版權：無版權問題（使用 Web Audio API 生成或免費素材）
- **驗收標準**：
  - 音效播放正常
  - 開關控制有效

### FR-006: 狀態顯示
- **描述**：清楚顯示當前工作狀態
- **需求**：
  - 顯示當前模式：工作中 / 短休息 / 長休息
  - 顯示當前任務名稱
  - 顯示本日完成的番茄數量
  - 顯示當前循環進度（第幾個番茄）
- **驗收標準**：
  - 狀態資訊即時更新
  - 顯示清晰易讀

### FR-007: 設定功能
- **描述**：允許使用者自訂計時器參數
- **需求**：
  - 工作時間長度（分鐘）
  - 短休息時間長度（分鐘）
  - 長休息時間長度（分鐘）
  - 長休息觸發條件（幾個番茄後）
  - 音效開關
  - 設定持久化儲存
- **驗收標準**：
  - 設定值生效
  - 設定值保存

### FR-008: 統計資訊（延伸功能）
- **描述**：提供使用者生產力統計數據
- **需求**：
  - 今日完成番茄數
  - 本週完成番茄數
  - 歷史任務記錄
  - 圖表視覺化（可選）
- **驗收標準**：
  - 統計數據準確
  - 資料視覺化清晰

---

## 📊 資料模型設計

### PomodoroTask（任務模型）
```csharp
/// <summary>
/// 番茄鐘任務模型
/// </summary>
public class PomodoroTask
{
    /// <summary>
    /// 任務唯一識別碼
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// 任務名稱（必填，最多 100 字元）
    /// </summary>
    [Required]
    [MaxLength(100)]
    public string TaskName { get; set; } = string.Empty;

    /// <summary>
    /// 任務建立時間
    /// </summary>
    public DateTime CreatedAt { get; set; }

    /// <summary>
    /// 任務狀態：Pending, InProgress, Completed
    /// </summary>
    public TaskStatus Status { get; set; }

    /// <summary>
    /// 已完成的番茄數量
    /// </summary>
    public int CompletedPomodoros { get; set; }

    /// <summary>
    /// 預計需要的番茄數量
    /// </summary>
    public int EstimatedPomodoros { get; set; }

    /// <summary>
    /// 任務完成時間（若已完成）
    /// </summary>
    public DateTime? CompletedAt { get; set; }

    /// <summary>
    /// 任務備註
    /// </summary>
    public string? Notes { get; set; }
}

/// <summary>
/// 任務狀態列舉
/// </summary>
public enum TaskStatus
{
    Pending,      // 待處理
    InProgress,   // 進行中
    Completed     // 已完成
}
```

### PomodoroSession（工作階段模型）
```csharp
/// <summary>
/// 番茄鐘工作階段模型
/// </summary>
public class PomodoroSession
{
    /// <summary>
    /// 階段唯一識別碼
    /// </summary>
    public Guid Id { get; set; }

    /// <summary>
    /// 關聯的任務 ID
    /// </summary>
    public Guid TaskId { get; set; }

    /// <summary>
    /// 階段類型：Work, ShortBreak, LongBreak
    /// </summary>
    public SessionType Type { get; set; }

    /// <summary>
    /// 開始時間
    /// </summary>
    public DateTime StartTime { get; set; }

    /// <summary>
    /// 結束時間
    /// </summary>
    public DateTime? EndTime { get; set; }

    /// <summary>
    /// 計畫時長（分鐘）
    /// </summary>
    public int PlannedDuration { get; set; }

    /// <summary>
    /// 實際時長（分鐘）
    /// </summary>
    public int? ActualDuration { get; set; }

    /// <summary>
    /// 是否完成
    /// </summary>
    public bool IsCompleted { get; set; }

    /// <summary>
    /// 是否被中斷
    /// </summary>
    public bool WasInterrupted { get; set; }
}

/// <summary>
/// 階段類型列舉
/// </summary>
public enum SessionType
{
    Work,         // 工作時間
    ShortBreak,   // 短休息
    LongBreak     // 長休息
}
```

### PomodoroSettings（設定模型）
```csharp
/// <summary>
/// 番茄鐘設定模型
/// </summary>
public class PomodoroSettings
{
    /// <summary>
    /// 工作時間長度（分鐘），預設 25
    /// </summary>
    [Range(1, 120)]
    public int WorkDuration { get; set; } = 25;

    /// <summary>
    /// 短休息時間長度（分鐘），預設 5
    /// </summary>
    [Range(1, 30)]
    public int ShortBreakDuration { get; set; } = 5;

    /// <summary>
    /// 長休息時間長度（分鐘），預設 15
    /// </summary>
    [Range(1, 60)]
    public int LongBreakDuration { get; set; } = 15;

    /// <summary>
    /// 長休息觸發條件（完成幾個番茄後），預設 4
    /// </summary>
    [Range(2, 10)]
    public int PomodorosUntilLongBreak { get; set; } = 4;

    /// <summary>
    /// 音效開關，預設開啟
    /// </summary>
    public bool SoundEnabled { get; set; } = true;

    /// <summary>
    /// 音量大小（0.0 - 1.0），預設 0.5
    /// </summary>
    [Range(0.0, 1.0)]
    public double Volume { get; set; } = 0.5;

    /// <summary>
    /// 自動開始下一階段，預設 false
    /// </summary>
    public bool AutoStartNext { get; set; } = false;
}
```

### JSON 儲存格式範例
```json
{
  "settings": {
    "workDuration": 25,
    "shortBreakDuration": 5,
    "longBreakDuration": 15,
    "pomodorosUntilLongBreak": 4,
    "soundEnabled": true,
    "volume": 0.5,
    "autoStartNext": false
  },
  "tasks": [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "taskName": "完成專案文件",
      "createdAt": "2025-09-30T10:00:00",
      "status": "InProgress",
      "completedPomodoros": 2,
      "estimatedPomodoros": 4,
      "completedAt": null,
      "notes": "需要完成架構設計章節"
    }
  ],
  "sessions": [
    {
      "id": "4fa85f64-5717-4562-b3fc-2c963f66afa7",
      "taskId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "type": "Work",
      "startTime": "2025-09-30T10:00:00",
      "endTime": "2025-09-30T10:25:00",
      "plannedDuration": 25,
      "actualDuration": 25,
      "isCompleted": true,
      "wasInterrupted": false
    }
  ]
}
```

---

## 🔌 API 端點設計

### 基礎路由
```
基礎路徑: /Pomodoro
```

### 端點清單

#### 1. 主頁面
```
GET /Pomodoro/Index
描述: 顯示番茄鐘主頁面
回傳: ViewResult
```

#### 2. 取得設定
```
GET /Pomodoro/GetSettings
描述: 取得使用者設定
回傳: JsonResult<PomodoroSettings>
```

#### 3. 更新設定
```
POST /Pomodoro/UpdateSettings
描述: 更新使用者設定
參數: PomodoroSettings settings
回傳: JsonResult<{ success: bool, message: string }>
```

#### 4. 取得所有任務
```
GET /Pomodoro/GetTasks
描述: 取得所有任務清單
參數: ?status=all|pending|inProgress|completed (可選)
回傳: JsonResult<List<PomodoroTask>>
```

#### 5. 建立任務
```
POST /Pomodoro/CreateTask
描述: 建立新任務
參數: { taskName: string, estimatedPomodoros: int }
回傳: JsonResult<{ success: bool, task: PomodoroTask }>
```

#### 6. 更新任務
```
POST /Pomodoro/UpdateTask
描述: 更新任務資訊
參數: PomodoroTask task
回傳: JsonResult<{ success: bool, message: string }>
```

#### 7. 刪除任務
```
POST /Pomodoro/DeleteTask
描述: 刪除指定任務
參數: { taskId: Guid }
回傳: JsonResult<{ success: bool, message: string }>
```

#### 8. 完成任務
```
POST /Pomodoro/CompleteTask
描述: 標記任務為完成
參數: { taskId: Guid }
回傳: JsonResult<{ success: bool, message: string }>
```

#### 9. 開始工作階段
```
POST /Pomodoro/StartSession
描述: 開始新的工作階段
參數: { taskId: Guid, sessionType: SessionType }
回傳: JsonResult<{ success: bool, session: PomodoroSession }>
```

#### 10. 結束工作階段
```
POST /Pomodoro/EndSession
描述: 結束當前工作階段
參數: { sessionId: Guid, wasInterrupted: bool }
回傳: JsonResult<{ success: bool, message: string }>
```

#### 11. 取得統計資料
```
GET /Pomodoro/GetStatistics
描述: 取得統計資訊
參數: ?period=today|week|month (可選)
回傳: JsonResult<PomodoroStatistics>
```

---

## 🎨 前端 UI/UX 設計

### 設計理念
- **華麗科技感**：使用漸層、玻璃擬態效果、動畫過渡
- **高辨識度**：時間顯示使用大字體、高對比色彩
- **流暢體驗**：按鈕互動有回饋動畫
- **響應式設計**：支援桌面、平板、手機

### 色彩配置

#### 主要色系（漸層）
```css
/* 工作模式 - 活力橙紅漸層 */
--gradient-work: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--color-work-primary: #667eea;
--color-work-secondary: #764ba2;

/* 短休息模式 - 清新綠藍漸層 */
--gradient-short-break: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
--color-break-primary: #43e97b;
--color-break-secondary: #38f9d7;

/* 長休息模式 - 舒適藍紫漸層 */
--gradient-long-break: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
--color-long-break-primary: #4facfe;
--color-long-break-secondary: #00f2fe;
```

#### 中性色系
```css
--color-background: #0f0f23;       /* 深色背景 */
--color-surface: #1a1a2e;          /* 卡片背景 */
--color-text-primary: #ffffff;     /* 主要文字 */
--color-text-secondary: #a0a0c0;   /* 次要文字 */
--color-border: rgba(255, 255, 255, 0.1);
```

### 版面配置

#### 主要區塊
1. **計時器區域**（中央）
   - 圓形計時器
   - 剩餘時間顯示（大字體）
   - 當前狀態標籤
   - 進度環形圖

2. **控制面板**（計時器下方）
   - 開始/暫停按鈕
   - 重設按鈕
   - 設定按鈕

3. **任務輸入區**（上方）
   - 任務名稱輸入框
   - 新增按鈕

4. **任務清單**（右側或下方）
   - 待辦任務
   - 進行中任務
   - 已完成任務

5. **統計面板**（左側或下方）
   - 今日番茄數
   - 本週番茄數
   - 完成率

6. **設定面板**（彈出式）
   - 時間設定
   - 音效設定

### UI 元件規格

#### 計時器顯示
```
元件: 圓形計時器
尺寸: 直徑 320px (桌面)、240px (手機)
字體: Monospace, 72px (時間), 24px (狀態)
動畫: 環形進度條（SVG），順時針減少
特效: 漸層邊框、陰影、發光效果
```

#### 按鈕樣式
```
形狀: 圓角矩形 (border-radius: 12px)
尺寸: 
  - 主要按鈕: 160px × 52px
  - 次要按鈕: 120px × 44px
  - 圖示按鈕: 44px × 44px
狀態:
  - Normal: 漸層背景
  - Hover: 放大 1.05、陰影增強
  - Active: 縮小 0.95
  - Disabled: 半透明、去飽和
```

#### 任務卡片
```
背景: 玻璃擬態效果 (backdrop-filter: blur)
邊框: 1px solid rgba(255, 255, 255, 0.1)
圓角: 16px
內距: 20px
陰影: 0 8px 32px rgba(0, 0, 0, 0.2)
```

### 互動動畫

#### 計時器狀態切換
```
動畫: 
  - 色彩漸層過渡 (0.6s ease-in-out)
  - 環形進度重置 (0.3s ease-out)
  - 數字翻轉效果
```

#### 按鈕點擊回饋
```
動畫:
  - 漣漪效果 (ripple)
  - 縮放回彈 (scale bounce)
  - 觸覺回饋（若支援）
```

#### 任務新增/刪除
```
動畫:
  - 滑入/滑出 (slide-in/slide-out)
  - 淡入/淡出 (fade-in/fade-out)
  - 列表重新排列 (reorder)
```

### 響應式斷點
```css
/* 手機 */
@media (max-width: 640px) { ... }

/* 平板 */
@media (min-width: 641px) and (max-width: 1024px) { ... }

/* 桌面 */
@media (min-width: 1025px) { ... }
```

---

## ⚙️ 技術規格

### 後端技術棧
- **框架**: ASP.NET Core 8.0 MVC
- **程式語言**: C# 13
- **資料儲存**: JSON 檔案系統
- **相依性注入**: Microsoft.Extensions.DependencyInjection
- **JSON 序列化**: System.Text.Json

### 前端技術棧
- **樣式**: CSS3（自訂樣式）
- **腳本**: Vanilla JavaScript (ES6+)
- **圖示**: Font Awesome 或 Bootstrap Icons
- **音效**: Web Audio API
- **動畫**: CSS Transitions、CSS Animations

### 瀏覽器支援
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### 效能要求
- 頁面載入時間 < 2 秒
- JavaScript 執行無阻塞
- 計時器精確度誤差 < 100ms
- 音效延遲 < 50ms

### 安全性考量
- 輸入驗證：防止 XSS 攻擊
- CSRF Token：表單提交保護
- 檔案存取：限制 JSON 檔案路徑
- 錯誤處理：不暴露敏感資訊

---

## 🚀 開發流程

### Phase 1: 環境準備與資料模型（1 天）
- [ ] 建立 Models 類別
  - [ ] PomodoroTask.cs
  - [ ] PomodoroSession.cs
  - [ ] PomodoroSettings.cs
- [ ] 建立 JSON 資料存取層
  - [ ] 讀取 JSON
  - [ ] 寫入 JSON
  - [ ] 錯誤處理

### Phase 2: 後端 API 開發（2 天）
- [ ] 建立 PomodoroController
- [ ] 實作設定管理 API
  - [ ] GetSettings
  - [ ] UpdateSettings
- [ ] 實作任務管理 API
  - [ ] GetTasks
  - [ ] CreateTask
  - [ ] UpdateTask
  - [ ] DeleteTask
  - [ ] CompleteTask
- [ ] 實作階段管理 API
  - [ ] StartSession
  - [ ] EndSession
- [ ] 實作統計 API
  - [ ] GetStatistics
- [ ] 單元測試

### Phase 3: 前端 UI 開發（3 天）
- [ ] 建立 Index.cshtml 主頁面
- [ ] 建立 CSS 樣式 (pomodoro.css)
  - [ ] 計時器樣式
  - [ ] 按鈕樣式
  - [ ] 任務卡片樣式
  - [ ] 響應式設計
- [ ] 建立部分檢視
  - [ ] _TimerCard.cshtml
  - [ ] _TaskList.cshtml
- [ ] 實作動畫效果

### Phase 4: JavaScript 互動開發（2 天）
- [ ] 建立 pomodoro.js
- [ ] 實作計時器邏輯
  - [ ] 倒數計時功能
  - [ ] 狀態管理
  - [ ] 自動切換
- [ ] 實作控制功能
  - [ ] 開始/暫停/重設
  - [ ] 按鈕狀態管理
- [ ] 實作任務管理
  - [ ] 新增任務
  - [ ] 完成任務
  - [ ] 刪除任務
  - [ ] 任務列表渲染
- [ ] 實作 API 呼叫
  - [ ] Fetch API 整合
  - [ ] 錯誤處理

### Phase 5: 音效系統開發（1 天）
- [ ] 產生或取得音效檔案
  - [ ] work-complete.mp3
  - [ ] break-complete.mp3
- [ ] 實作音效播放功能
- [ ] 實作音效開關控制
- [ ] 實作音量控制

### Phase 6: 整合與測試（1 天）
- [ ] 前後端整合測試
- [ ] 瀏覽器相容性測試
- [ ] 響應式測試
- [ ] 效能測試
- [ ] 使用者體驗測試

### Phase 7: 優化與文件（1 天）
- [ ] 程式碼優化
- [ ] 加入註解
- [ ] 撰寫使用說明
- [ ] 更新 README.md

### 總計開發時間：約 11 天

---

## 🧪 測試計畫

### 單元測試
- **後端 Controller 測試**
  - 測試所有 API 端點
  - 測試輸入驗證
  - 測試錯誤處理
  
- **資料存取測試**
  - 測試 JSON 讀寫
  - 測試資料驗證
  - 測試並行存取

### 整合測試
- **前後端整合**
  - 測試 API 呼叫
  - 測試資料流
  - 測試錯誤處理

### 功能測試
- **計時器功能**
  - 測試倒數計時正確性
  - 測試狀態切換
  - 測試暫停/繼續
  
- **任務管理**
  - 測試新增/刪除
  - 測試狀態更新
  - 測試資料持久化

### UI/UX 測試
- **響應式測試**
  - 桌面瀏覽器
  - 平板裝置
  - 手機裝置
  
- **互動測試**
  - 按鈕點擊
  - 動畫流暢度
  - 音效播放

### 效能測試
- 頁面載入時間
- JavaScript 執行效率
- 記憶體使用量
- 電池消耗（行動裝置）

### 相容性測試
- Chrome
- Firefox
- Safari
- Edge

---

## 📝 附註

### 未來擴充功能建議
1. **使用者帳戶系統**
   - 登入/註冊功能
   - 資料雲端同步
   
2. **進階統計**
   - 生產力趨勢圖表
   - 任務分類分析
   - 專注時段分析
   
3. **社交功能**
   - 任務分享
   - 團隊協作
   - 排行榜
   
4. **整合功能**
   - 日曆整合
   - 待辦事項應用整合
   - 通知推送

5. **自訂主題**
   - 多種色彩主題
   - 深色/淺色模式
   - 自訂背景

### 已知限制
1. JSON 檔案儲存不適合多使用者並行存取
2. 無使用者認證機制
3. 資料不加密
4. 無資料備份機制

### 參考資源
- [番茄工作法維基百科](https://zh.wikipedia.org/wiki/%E7%95%AA%E8%8C%84%E5%B7%A5%E4%BD%9C%E6%B3%95)
- [ASP.NET Core MVC 官方文件](https://learn.microsoft.com/aspnet/core/mvc)
- [Web Audio API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

---

**文件版本歷史**
- v1.0 (2025-09-30): 初始版本建立
