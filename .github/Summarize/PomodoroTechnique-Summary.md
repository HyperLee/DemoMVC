# 番茄鐘工作法 - 技術總結文件

> **專案**: DemoMVC  
> **功能**: 番茄鐘工作法 (Pomodoro Technique)  
> **版本**: 1.0  
> **建立日期**: 2025-09-30  
> **技術棧**: ASP.NET Core 8.0 MVC + Vanilla JavaScript

---

## 📋 目錄

1. [功能概述](#功能概述)
2. [技術架構](#技術架構)
3. [後端實作](#後端實作)
4. [前端實作](#前端實作)
5. [資料模型](#資料模型)
6. [API 設計](#api-設計)
7. [核心邏輯](#核心邏輯)
8. [技術亮點](#技術亮點)
9. [效能優化](#效能優化)
10. [已知限制](#已知限制)
11. [未來改進](#未來改進)

---

## 📖 功能概述

### 什麼是番茄工作法？

番茄工作法是一種時間管理方法，透過將工作時間分割為 25 分鐘的專注工作時段（稱為一個「番茄」），並在每個番茄後休息 5 分鐘，每完成 4 個番茄後休息 15-30 分鐘。

### 核心功能

✅ **計時器功能**
- 工作時間倒數計時（預設 25 分鐘）
- 短休息時間（預設 5 分鐘）
- 長休息時間（預設 15 分鐘）
- 開始、暫停、重設控制

✅ **任務管理**
- 新增、刪除、完成任務
- 任務狀態追蹤（待處理、進行中、已完成）
- 番茄數量統計
- 任務過濾與排序

✅ **資料持久化**
- JSON 檔案儲存
- 自動儲存機制
- 並行存取控制

✅ **統計分析**
- 今日完成番茄數
- 本週完成番茄數
- 任務完成率
- 工作階段記錄

✅ **使用者設定**
- 自訂工作/休息時間
- 音效開關與音量控制
- 自動開始下一階段選項

---

## 🏗️ 技術架構

### 系統架構圖

```
┌─────────────────────────────────────────────────────────┐
│                      前端層 (Client)                      │
├─────────────────────────────────────────────────────────┤
│  Index.cshtml (View)                                     │
│  ├── Timer Display (圓形計時器 + SVG 進度環)              │
│  ├── Control Buttons (開始/暫停/重設)                     │
│  ├── Task Input Form (新增任務表單)                      │
│  ├── Task List (任務清單)                                │
│  ├── Statistics Panel (統計面板)                         │
│  └── Settings Modal (設定彈出視窗)                        │
├─────────────────────────────────────────────────────────┤
│  pomodoro.css (華麗科技感樣式)                            │
│  └── 漸層色彩 + 玻璃擬態 + 動畫效果 + 響應式設計           │
├─────────────────────────────────────────────────────────┤
│  pomodoro.js (JavaScript 邏輯)                           │
│  ├── PomodoroApp 全域物件                                │
│  ├── Timer Management (計時器管理)                       │
│  ├── Task Management (任務管理)                          │
│  ├── API Integration (API 呼叫)                          │
│  ├── Sound System (音效系統)                             │
│  └── UI Updates (介面更新)                               │
└─────────────────────────────────────────────────────────┘
                            ↕ HTTP/JSON
┌─────────────────────────────────────────────────────────┐
│                    控制器層 (Controller)                  │
├─────────────────────────────────────────────────────────┤
│  PomodoroController.cs                                   │
│  ├── GetSettings / UpdateSettings                        │
│  ├── GetTasks / CreateTask / UpdateTask / DeleteTask    │
│  ├── CompleteTask / StartSession / EndSession           │
│  └── GetStatistics                                       │
└─────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────┐
│                     服務層 (Service)                      │
├─────────────────────────────────────────────────────────┤
│  IPomodoroDataService (介面)                             │
│  PomodoroDataService (實作)                              │
│  ├── LoadDataAsync / SaveDataAsync                       │
│  ├── GetTasksAsync / AddTaskAsync / UpdateTaskAsync     │
│  ├── AddSessionAsync / UpdateSessionAsync               │
│  └── GetStatisticsAsync                                  │
└─────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────┐
│                    資料層 (Data)                          │
├─────────────────────────────────────────────────────────┤
│  pomodoro-data.json (JSON 檔案儲存)                      │
│  ├── Settings (使用者設定)                               │
│  ├── Tasks (任務清單)                                    │
│  └── Sessions (工作階段記錄)                             │
└─────────────────────────────────────────────────────────┘
```

### 技術棧

| 層級 | 技術 | 版本 | 說明 |
|------|------|------|------|
| 後端框架 | ASP.NET Core MVC | 8.0 | Web 應用程式框架 |
| 程式語言 | C# | 12.0 | 後端開發語言 |
| 前端框架 | Bootstrap | 5.x | UI 元件庫 |
| 前端語言 | JavaScript | ES6+ | 前端邏輯開發 |
| 樣式語言 | CSS3 | - | 樣式與動畫 |
| 資料儲存 | JSON | - | 檔案系統儲存 |
| 音效 | Web Audio API | - | 瀏覽器音效生成 |

---

## 🔧 後端實作

### 資料模型設計

#### 1. PomodoroTask (任務模型)

```csharp
public class PomodoroTask
{
    public Guid Id { get; set; }                    // 唯一識別碼
    public string TaskName { get; set; }            // 任務名稱 (必填, 最多100字元)
    public DateTime CreatedAt { get; set; }         // 建立時間
    public TaskStatus Status { get; set; }          // 狀態 (Pending/InProgress/Completed)
    public int CompletedPomodoros { get; set; }     // 已完成番茄數
    public int EstimatedPomodoros { get; set; }     // 預估番茄數
    public DateTime? CompletedAt { get; set; }      // 完成時間
    public string? Notes { get; set; }              // 備註
}
```

**設計考量**:
- 使用 `Guid` 確保唯一性
- `TaskStatus` 列舉避免字串比較錯誤
- 支援預估與實際完成數量的追蹤
- 可選欄位使用 nullable 類型

#### 2. PomodoroSession (工作階段模型)

```csharp
public class PomodoroSession
{
    public Guid Id { get; set; }                    // 唯一識別碼
    public Guid TaskId { get; set; }                // 關聯任務 ID
    public SessionType Type { get; set; }           // 類型 (Work/ShortBreak/LongBreak)
    public DateTime StartTime { get; set; }         // 開始時間
    public DateTime? EndTime { get; set; }          // 結束時間
    public int PlannedDuration { get; set; }        // 計畫時長 (分鐘)
    public int? ActualDuration { get; set; }        // 實際時長 (分鐘)
    public bool IsCompleted { get; set; }           // 是否完成
    public bool WasInterrupted { get; set; }        // 是否被中斷
}
```

**設計考量**:
- 記錄計畫與實際時長，支援後續分析
- `WasInterrupted` 標記可用於統計專注度
- 與任務關聯，追蹤任務進度

#### 3. PomodoroSettings (設定模型)

```csharp
public class PomodoroSettings
{
    [Range(1, 120)]
    public int WorkDuration { get; set; } = 25;              // 工作時長
    
    [Range(1, 30)]
    public int ShortBreakDuration { get; set; } = 5;         // 短休息時長
    
    [Range(1, 60)]
    public int LongBreakDuration { get; set; } = 15;         // 長休息時長
    
    [Range(2, 10)]
    public int PomodorosUntilLongBreak { get; set; } = 4;    // 長休息觸發條件
    
    public bool SoundEnabled { get; set; } = true;           // 音效開關
    
    [Range(0.0, 1.0)]
    public double Volume { get; set; } = 0.5;                // 音量大小
    
    public bool AutoStartNext { get; set; } = false;         // 自動開始下一階段
}
```

**設計考量**:
- 使用 `[Range]` 驗證屬性限制輸入範圍
- 提供合理的預設值
- 支援音效與自動化控制

### 服務層實作

#### PomodoroDataService 核心功能

```csharp
public class PomodoroDataService : IPomodoroDataService
{
    private readonly string _dataFilePath;
    private static readonly SemaphoreSlim _fileLock = new SemaphoreSlim(1, 1);
    
    // 1. 檔案鎖定機制 - 防止並行存取衝突
    public async Task<PomodoroData> LoadDataAsync()
    {
        await _fileLock.WaitAsync();
        try
        {
            // 讀取 JSON 檔案
        }
        finally
        {
            _fileLock.Release();
        }
    }
    
    // 2. 自動建立預設資料
    // 3. JSON 序列化/反序列化
    // 4. 錯誤處理與記錄
    // 5. 統計資料計算
}
```

**技術亮點**:
- **執行緒安全**: 使用 `SemaphoreSlim` 實作檔案鎖定
- **容錯處理**: 檔案不存在時自動建立預設資料
- **記憶體效率**: 使用 `System.Text.Json` 進行序列化
- **LINQ 查詢**: 高效的資料篩選與統計

### 控制器層設計

#### API 端點設計原則

```csharp
[HttpPost]
public async Task<IActionResult> CreateTask([FromBody] CreateTaskRequest request)
{
    try
    {
        // 1. 輸入驗證
        if (string.IsNullOrWhiteSpace(request.TaskName))
            return Json(new { success = false, message = "任務名稱不可為空" });
        
        // 2. 業務邏輯
        var task = new PomodoroTask { /* ... */ };
        var createdTask = await _dataService.AddTaskAsync(task);
        
        // 3. 統一回應格式
        return Json(new { success = true, data = createdTask });
    }
    catch (Exception ex)
    {
        // 4. 錯誤處理
        _logger.LogError(ex, "建立任務時發生錯誤");
        return Json(new { success = false, message = "建立任務失敗" });
    }
}
```

**設計原則**:
1. **統一回應格式**: `{ success, data?, message? }`
2. **輸入驗證**: 在控制器層進行基本驗證
3. **錯誤記錄**: 使用 `ILogger` 記錄錯誤
4. **RESTful 風格**: 使用適當的 HTTP 動詞

---

## 🎨 前端實作

### CSS 架構

#### 1. CSS 變數系統

```css
:root {
    /* 工作模式漸層 */
    --gradient-work: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    --color-work-primary: #667eea;
    
    /* 短休息漸層 */
    --gradient-short-break: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
    
    /* 長休息漸層 */
    --gradient-long-break: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
    
    /* 中性色系 */
    --color-background: #0f0f23;
    --color-surface: #1a1a2e;
    --color-text-primary: #ffffff;
    
    /* 動畫時長 */
    --transition-fast: 0.2s;
    --transition-normal: 0.3s;
}
```

**優勢**:
- 集中管理色彩與樣式
- 易於主題切換
- 提高程式碼可維護性

#### 2. 圓形計時器設計

```css
.timer-circle {
    position: relative;
    width: 320px;
    height: 320px;
}

.timer-svg {
    transform: rotate(-90deg);  /* 從 12 點鐘方向開始 */
}

.timer-progress {
    stroke: url(#gradient);
    stroke-dasharray: 565.48;  /* 2 * π * r, r = 90 */
    stroke-dashoffset: 0;
    transition: stroke-dashoffset 1s linear;
    filter: drop-shadow(0 0 8px rgba(102, 126, 234, 0.6));
}
```

**實作細節**:
- 使用 SVG 繪製進度環
- `stroke-dasharray` 與 `stroke-dashoffset` 控制進度
- `filter: drop-shadow` 產生發光效果

#### 3. 玻璃擬態效果

```css
.timer-card {
    background: var(--color-surface);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}
```

**技術**:
- `backdrop-filter: blur()` 背景模糊
- 半透明邊框與陰影
- 層疊效果營造深度感

#### 4. 響應式設計

```css
/* 桌面 */
@media (min-width: 1025px) {
    .pomodoro-main {
        grid-template-columns: 1fr 1fr;
    }
}

/* 平板 */
@media (min-width: 641px) and (max-width: 1024px) {
    .timer-circle {
        width: 280px;
        height: 280px;
    }
}

/* 手機 */
@media (max-width: 640px) {
    .pomodoro-main {
        grid-template-columns: 1fr;
    }
    .timer-circle {
        width: 240px;
        height: 240px;
    }
}
```

### JavaScript 架構

#### 1. 全域狀態管理

```javascript
const PomodoroApp = {
    timer: {
        interval: null,
        remainingSeconds: 0,
        totalSeconds: 0,
        isRunning: false,
        isPaused: false,
        currentSessionType: 'Work',
        currentSessionId: null,
        currentTaskId: null
    },
    settings: { /* ... */ },
    stats: { /* ... */ },
    tasks: [],
    currentFilter: 'all',
    audioContext: null
};
```

**優勢**:
- 集中式狀態管理
- 易於追蹤與除錯
- 避免全域變數污染

#### 2. 計時器核心邏輯

```javascript
startTimer() {
    if (this.timer.isRunning) return;
    
    // 檢查是否選擇任務
    if (!this.timer.currentTaskId) {
        this.showNotification('請先選擇一個任務', 'warning');
        return;
    }
    
    // 如果是新開始，建立工作階段
    if (!this.timer.isPaused) {
        this.startSession();
    }
    
    this.timer.isRunning = true;
    this.timer.isPaused = false;
    
    // 每秒執行一次
    this.timer.interval = setInterval(() => {
        this.tick();
    }, 1000);
    
    this.updateControlButtons();
}

tick() {
    this.timer.remainingSeconds--;
    
    if (this.timer.remainingSeconds <= 0) {
        this.timerComplete();
    }
    
    this.updateTimerDisplay();
}
```

**設計模式**:
- 狀態機模式管理計時器狀態
- 觀察者模式更新 UI
- 職責分離（計時邏輯與 UI 更新分開）

#### 3. API 呼叫封裝

```javascript
async createTask(taskName, estimatedPomodoros) {
    try {
        const response = await fetch('/Pomodoro/CreateTask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                taskName: taskName,
                estimatedPomodoros: estimatedPomodoros
            })
        });
        
        const result = await response.json();
        
        if (result.success) {
            this.tasks.push(result.data);
            this.renderTasks();
            this.showNotification('任務已新增', 'success');
        } else {
            this.showNotification(result.message || '新增任務失敗', 'error');
        }
    } catch (error) {
        console.error('新增任務失敗:', error);
        this.showNotification('新增任務失敗', 'error');
    }
}
```

**最佳實務**:
- 使用 `async/await` 處理非同步操作
- 統一的錯誤處理
- 樂觀 UI 更新
- 使用者友好的錯誤訊息

#### 4. 音效系統實作

```javascript
playSound() {
    if (!this.settings.soundEnabled || !this.audioContext) return;
    
    // 使用 Web Audio API 產生音效
    const oscillator = this.audioContext.createOscillator();
    const gainNode = this.audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(this.audioContext.destination);
    
    oscillator.frequency.value = 800;  // 頻率 (Hz)
    oscillator.type = 'sine';           // 波形類型
    
    // 音量淡出效果
    gainNode.gain.setValueAtTime(this.settings.volume, this.audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
    
    oscillator.start(this.audioContext.currentTime);
    oscillator.stop(this.audioContext.currentTime + 0.5);
}
```

**技術優勢**:
- 無需外部音效檔案
- 動態生成音效
- 支援音量控制
- 平滑淡出效果

---

## 🔑 核心邏輯

### 番茄工作法流程

```
開始 → 選擇任務 → 工作 (25分) → 短休息 (5分) → 計數器 +1
                                      ↓
                            是否完成 4 個番茄？
                                      ↓
                            ┌─────────┴─────────┐
                           否                   是
                            ↓                   ↓
                      繼續工作週期        長休息 (15分)
                                              ↓
                                        重置計數器
                                              ↓
                                        回到工作週期
```

### 狀態轉換邏輯

```javascript
timerComplete() {
    // 1. 停止計時器
    clearInterval(this.timer.interval);
    this.timer.isRunning = false;
    
    // 2. 結束當前工作階段
    await this.endSession(false);
    
    // 3. 播放音效
    this.playSound();
    
    // 4. 更新統計
    if (this.timer.currentSessionType === 'Work') {
        this.stats.completedPomodoros++;
        this.stats.currentCycle++;
        await this.loadStatistics();
    }
    
    // 5. 決定下一個階段
    let nextSessionType;
    if (this.timer.currentSessionType === 'Work') {
        // 工作完成後
        if (this.stats.currentCycle >= this.settings.pomodorosUntilLongBreak) {
            nextSessionType = 'LongBreak';
            this.stats.currentCycle = 0;
        } else {
            nextSessionType = 'ShortBreak';
        }
    } else {
        // 休息完成後
        nextSessionType = 'Work';
    }
    
    // 6. 重設計時器
    this.resetTimer(nextSessionType);
    
    // 7. 自動開始（如果啟用）
    if (this.settings.autoStartNext) {
        setTimeout(() => this.startTimer(), 2000);
    }
}
```

### 資料同步策略

```
前端 (JavaScript)               後端 (C#)                  JSON 檔案
─────────────────              ───────────                ──────────
使用者操作
    ↓
狀態更新
    ↓
API 呼叫 ──────────→ 控制器接收請求
                          ↓
                    服務層處理邏輯
                          ↓
                    資料驗證 ────────────→  讀取檔案
                          ↓                      ↓
                    更新資料                  修改資料
                          ↓                      ↓
                    儲存資料 ────────────→  寫入檔案
                          ↓
    ← ─────────── 回傳結果
    ↓
更新 UI
```

---

## ✨ 技術亮點

### 1. 執行緒安全的檔案存取

```csharp
private static readonly SemaphoreSlim _fileLock = new SemaphoreSlim(1, 1);

public async Task SaveDataAsync(PomodoroData data)
{
    await _fileLock.WaitAsync();  // 取得鎖定
    try
    {
        var json = JsonSerializer.Serialize(data, new JsonSerializerOptions
        {
            WriteIndented = true
        });
        await File.WriteAllTextAsync(_dataFilePath, json);
    }
    finally
    {
        _fileLock.Release();  // 釋放鎖定
    }
}
```

**解決問題**: 防止多個請求同時寫入檔案造成資料損壞

### 2. 智慧型任務狀態管理

```csharp
// 開始工作階段時自動更新任務狀態
if (request.SessionType == SessionType.Work)
{
    var task = await _dataService.GetTaskByIdAsync(request.TaskId);
    if (task != null && task.Status == Models.TaskStatus.Pending)
    {
        task.Status = Models.TaskStatus.InProgress;
        await _dataService.UpdateTaskAsync(task);
    }
}
```

**優勢**: 減少使用者手動操作，提升使用體驗

### 3. 響應式進度環動畫

```javascript
updateTimerDisplay() {
    const progress = (this.timer.totalSeconds - this.timer.remainingSeconds) / this.timer.totalSeconds;
    const circumference = 2 * Math.PI * 90;  // 圓周長
    const offset = circumference * (1 - progress);
    
    const progressCircle = document.getElementById('timerProgress');
    if (progressCircle) {
        progressCircle.style.strokeDashoffset = offset;
    }
}
```

**效果**: 視覺化時間進度，增強使用者回饋

### 4. 效能優化的渲染策略

```javascript
renderTasks() {
    // 1. 過濾任務
    let filteredTasks = this.tasks;
    if (this.currentFilter !== 'all') {
        filteredTasks = this.tasks.filter(t => t.status === this.currentFilter);
    }
    
    // 2. 排序任務
    filteredTasks.sort((a, b) => {
        const statusOrder = { 'InProgress': 0, 'Pending': 1, 'Completed': 2 };
        return statusOrder[a.status] - statusOrder[b.status];
    });
    
    // 3. 批次渲染
    taskList.innerHTML = filteredTasks.map(task => this.renderTaskItem(task)).join('');
}
```

**優勢**: 
- 減少 DOM 操作次數
- 使用 `map` + `join` 提升效能
- 智慧排序提升使用體驗

### 5. 優雅的錯誤處理

```csharp
try
{
    // 業務邏輯
}
catch (InvalidOperationException ex)
{
    _logger.LogWarning(ex, "業務邏輯錯誤: {Message}", ex.Message);
    return Json(new { success = false, message = ex.Message });
}
catch (Exception ex)
{
    _logger.LogError(ex, "系統錯誤");
    return Json(new { success = false, message = "系統發生錯誤，請稍後再試" });
}
```

**設計**:
- 區分業務錯誤與系統錯誤
- 提供使用者友好的錯誤訊息
- 記錄完整錯誤資訊供除錯

---

## ⚡ 效能優化

### 1. 前端優化

#### 減少重繪與重排

```css
.timer-progress {
    /* 使用 transform 觸發 GPU 加速 */
    will-change: stroke-dashoffset;
    
    /* 硬體加速 */
    transform: translateZ(0);
}
```

#### 事件委派

```javascript
// ❌ 不好的做法
tasks.forEach(task => {
    const deleteBtn = document.getElementById(`delete-${task.id}`);
    deleteBtn.addEventListener('click', () => this.deleteTask(task.id));
});

// ✅ 好的做法
document.getElementById('taskList').addEventListener('click', (e) => {
    if (e.target.classList.contains('btn-delete')) {
        const taskId = e.target.closest('.task-item').dataset.taskId;
        this.deleteTask(taskId);
    }
});
```

### 2. 後端優化

#### LINQ 查詢優化

```csharp
// 使用 LINQ 的延遲執行特性
var completedSessions = data.Sessions
    .Where(s => s.IsCompleted && s.Type == SessionType.Work)  // 先過濾
    .Select(s => s.StartTime)  // 再投影
    .ToList();  // 最後執行
```

#### 減少記憶體配置

```csharp
// 使用 StringBuilder 處理大量字串
var sb = new StringBuilder();
foreach (var task in tasks)
{
    sb.AppendLine($"{task.TaskName}: {task.CompletedPomodoros}");
}
```

### 3. 資料庫優化（未來考慮）

如果改用資料庫，建議：
- 在 `TaskId` 和 `Status` 欄位建立索引
- 使用分頁查詢減少資料傳輸
- 實作快取機制

---

## 🚧 已知限制

### 1. 檔案儲存限制

**問題**: JSON 檔案不適合高並行存取
- 單一檔案鎖定可能成為瓶頸
- 無法水平擴展

**影響**: 單使用者或小團隊使用

**解決方案**: 改用 SQLite、SQL Server 或 NoSQL 資料庫

### 2. 無使用者認證

**問題**: 所有使用者共用同一份資料
- 無法區分不同使用者的任務
- 缺乏安全性

**解決方案**: 整合 ASP.NET Core Identity

### 3. 無離線支援

**問題**: 需要持續連線才能使用
- 無法在離線狀態下記錄番茄

**解決方案**: 使用 Service Workers 和 IndexedDB 實作 PWA

### 4. 音效限制

**問題**: 僅支援簡單的嗶嗶聲
- 無法自訂音效檔案
- 音效種類有限

**解決方案**: 支援上傳 MP3 音效檔案

### 5. 無資料備份

**問題**: JSON 檔案損壞會導致資料遺失
- 無自動備份機制
- 無資料恢復功能

**解決方案**: 實作定期備份與雲端同步

---

## 🔮 未來改進

### 短期改進 (1-2 週)

1. **通知功能**
   - 使用 Notification API 實作桌面通知
   - 計時器完成時彈出通知

2. **音效改進**
   - 支援自訂音效上傳
   - 提供多種內建音效選擇

3. **深色/淺色主題**
   - 新增主題切換功能
   - 自動偵測系統主題

4. **鍵盤快捷鍵**
   - 空白鍵: 開始/暫停
   - R 鍵: 重設
   - N 鍵: 新增任務

### 中期改進 (1-2 月)

1. **資料庫整合**
   - 改用 Entity Framework Core + SQL Server
   - 實作資料遷移

2. **使用者系統**
   - 註冊/登入功能
   - 個人資料管理
   - 多使用者支援

3. **進階統計**
   - 生產力趨勢圖表
   - 任務分類分析
   - 專注時段分析
   - 導出 CSV/PDF 報表

4. **任務分類**
   - 標籤系統
   - 專案分組
   - 優先級設定

### 長期改進 (3-6 月)

1. **團隊協作**
   - 共享任務清單
   - 團隊統計儀表板
   - 即時協作 (SignalR)

2. **整合功能**
   - Google Calendar 整合
   - Trello/Jira 整合
   - Slack/Teams 通知

3. **行動應用**
   - 開發 React Native 或 Flutter App
   - 推播通知
   - 離線支援

4. **AI 輔助**
   - 智慧任務時間預估
   - 生產力建議
   - 專注力分析

5. **遊戲化**
   - 成就系統
   - 排行榜
   - 每日挑戰
   - 經驗值與等級

---

## 📚 參考資源

### 官方文件
- [ASP.NET Core MVC 文件](https://learn.microsoft.com/aspnet/core/mvc)
- [Web Audio API MDN](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [CSS Grid Layout](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Grid_Layout)

### 設計靈感
- [Dribbble - Pomodoro Designs](https://dribbble.com/tags/pomodoro)
- [Behance - Timer UI](https://www.behance.net/search/projects?search=timer%20ui)

### 番茄工作法
- [番茄工作法官方網站](https://francescocirillo.com/pages/pomodoro-technique)
- [Wikipedia - 番茄工作法](https://zh.wikipedia.org/wiki/%E7%95%AA%E8%8C%84%E5%B7%A5%E4%BD%9C%E6%B3%95)

---

## 🤝 貢獻

歡迎提交 Issue 和 Pull Request！

**開發流程**:
1. Fork 專案
2. 建立功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交變更 (`git commit -m 'Add some AmazingFeature'`)
4. 推送分支 (`git push origin feature/AmazingFeature`)
5. 開啟 Pull Request

---

## 📝 版本歷史

- **v1.0** (2025-09-30) - 初始版本發布
  - 完整的番茄鐘計時器功能
  - 任務管理系統
  - 統計資訊
  - JSON 資料持久化
  - 華麗的科技感 UI

---

## 👨‍💻 開發者資訊

**專案**: DemoMVC  
**作者**: HyperLee  
**授權**: MIT License  
**建立日期**: 2025-09-30  

---

**文件版本**: 1.0  
**最後更新**: 2025-09-30
