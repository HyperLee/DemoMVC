using System.Text.Json;
using DemoMVC.Models;

namespace DemoMVC.Services
{
    /// <summary>
    /// 番茄鐘資料服務實作
    /// </summary>
    public class PomodoroDataService : IPomodoroDataService
    {
        private readonly string _dataFilePath;
        private readonly ILogger<PomodoroDataService> _logger;
        private static readonly SemaphoreSlim _fileLock = new SemaphoreSlim(1, 1);

        public PomodoroDataService(IWebHostEnvironment environment, ILogger<PomodoroDataService> logger)
        {
            var dataDirectory = Path.Combine(environment.ContentRootPath, "Data");
            if (!Directory.Exists(dataDirectory))
            {
                Directory.CreateDirectory(dataDirectory);
            }
            _dataFilePath = Path.Combine(dataDirectory, "pomodoro-data.json");
            _logger = logger;
        }

        /// <summary>
        /// 載入資料
        /// </summary>
        public async Task<PomodoroData> LoadDataAsync()
        {
            await _fileLock.WaitAsync();
            try
            {
                if (!File.Exists(_dataFilePath))
                {
                    _logger.LogInformation("資料檔案不存在，建立預設資料");
                    var defaultData = new PomodoroData();
                    // 直接在這裡儲存，避免呼叫 SaveDataAsync 造成死鎖
                    var json = JsonSerializer.Serialize(defaultData, new JsonSerializerOptions
                    {
                        WriteIndented = true
                    });
                    await File.WriteAllTextAsync(_dataFilePath, json);
                    _logger.LogInformation("預設資料檔案已建立: {FilePath}", _dataFilePath);
                    return defaultData;
                }

                _logger.LogInformation("正在讀取資料檔案: {FilePath}", _dataFilePath);
                var jsonContent = await File.ReadAllTextAsync(_dataFilePath);
                var data = JsonSerializer.Deserialize<PomodoroData>(jsonContent, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                _logger.LogInformation("資料檔案讀取完成");
                return data ?? new PomodoroData();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "載入番茄鐘資料時發生錯誤");
                return new PomodoroData();
            }
            finally
            {
                _fileLock.Release();
            }
        }

        /// <summary>
        /// 儲存資料
        /// </summary>
        public async Task SaveDataAsync(PomodoroData data)
        {
            await _fileLock.WaitAsync();
            try
            {
                var json = JsonSerializer.Serialize(data, new JsonSerializerOptions
                {
                    WriteIndented = true
                });
                await File.WriteAllTextAsync(_dataFilePath, json);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "儲存番茄鐘資料時發生錯誤");
                throw;
            }
            finally
            {
                _fileLock.Release();
            }
        }

        /// <summary>
        /// 取得設定
        /// </summary>
        public async Task<PomodoroSettings> GetSettingsAsync()
        {
            var data = await LoadDataAsync();
            return data.Settings;
        }

        /// <summary>
        /// 更新設定
        /// </summary>
        public async Task UpdateSettingsAsync(PomodoroSettings settings)
        {
            var data = await LoadDataAsync();
            data.Settings = settings;
            await SaveDataAsync(data);
        }

        /// <summary>
        /// 取得所有任務
        /// </summary>
        public async Task<List<PomodoroTask>> GetTasksAsync(Models.TaskStatus? status = null)
        {
            var data = await LoadDataAsync();
            if (status.HasValue)
            {
                return data.Tasks.Where(t => t.Status == status.Value).ToList();
            }
            return data.Tasks;
        }

        /// <summary>
        /// 取得單一任務
        /// </summary>
        public async Task<PomodoroTask?> GetTaskByIdAsync(Guid taskId)
        {
            var data = await LoadDataAsync();
            return data.Tasks.FirstOrDefault(t => t.Id == taskId);
        }

        /// <summary>
        /// 新增任務
        /// </summary>
        public async Task<PomodoroTask> AddTaskAsync(PomodoroTask task)
        {
            _logger.LogInformation("========================================");
            _logger.LogInformation("💾 PomodoroDataService.AddTaskAsync 被呼叫");
            _logger.LogInformation("========================================");
            
            try
            {
                _logger.LogInformation("📦 接收到的任務物件:");
                _logger.LogInformation("  - TaskName: {TaskName}", task.TaskName);
                _logger.LogInformation("  - EstimatedPomodoros: {EstimatedPomodoros}", task.EstimatedPomodoros);
                
                _logger.LogInformation("✓ 正在載入現有資料...");
                var data = await LoadDataAsync();
                _logger.LogInformation("✓ 資料載入完成，目前任務數量: {Count}", data.Tasks.Count);
                
                task.Id = Guid.NewGuid();
                task.CreatedAt = DateTime.Now;
                _logger.LogInformation("✓ 任務 ID 已產生: {TaskId}", task.Id);
                _logger.LogInformation("✓ 建立時間: {CreatedAt}", task.CreatedAt);
                
                data.Tasks.Add(task);
                _logger.LogInformation("✓ 任務已加入集合，新任務數量: {Count}", data.Tasks.Count);
                
                _logger.LogInformation("✓ 正在儲存資料到檔案: {FilePath}", _dataFilePath);
                await SaveDataAsync(data);
                _logger.LogInformation("✅ 資料儲存成功");
                
                return task;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "❌ 新增任務時發生錯誤");
                _logger.LogError("錯誤訊息: {Message}", ex.Message);
                throw;
            }
            finally
            {
                _logger.LogInformation("========================================");
            }
        }

        /// <summary>
        /// 更新任務
        /// </summary>
        public async Task UpdateTaskAsync(PomodoroTask task)
        {
            var data = await LoadDataAsync();
            var index = data.Tasks.FindIndex(t => t.Id == task.Id);
            if (index >= 0)
            {
                data.Tasks[index] = task;
                await SaveDataAsync(data);
            }
            else
            {
                throw new InvalidOperationException($"找不到 ID 為 {task.Id} 的任務");
            }
        }

        /// <summary>
        /// 刪除任務
        /// </summary>
        public async Task DeleteTaskAsync(Guid taskId)
        {
            var data = await LoadDataAsync();
            var task = data.Tasks.FirstOrDefault(t => t.Id == taskId);
            if (task != null)
            {
                data.Tasks.Remove(task);
                await SaveDataAsync(data);
            }
        }

        /// <summary>
        /// 新增工作階段
        /// </summary>
        public async Task<PomodoroSession> AddSessionAsync(PomodoroSession session)
        {
            var data = await LoadDataAsync();
            session.Id = Guid.NewGuid();
            session.StartTime = DateTime.Now;
            data.Sessions.Add(session);
            await SaveDataAsync(data);
            return session;
        }

        /// <summary>
        /// 更新工作階段
        /// </summary>
        public async Task UpdateSessionAsync(PomodoroSession session)
        {
            var data = await LoadDataAsync();
            var index = data.Sessions.FindIndex(s => s.Id == session.Id);
            if (index >= 0)
            {
                data.Sessions[index] = session;
                await SaveDataAsync(data);
            }
            else
            {
                throw new InvalidOperationException($"找不到 ID 為 {session.Id} 的工作階段");
            }
        }

        /// <summary>
        /// 取得統計資料
        /// </summary>
        public async Task<PomodoroStatistics> GetStatisticsAsync(string period = "today")
        {
            var data = await LoadDataAsync();
            var now = DateTime.Now;
            var statistics = new PomodoroStatistics();

            // 計算任務統計
            statistics.TotalTasks = data.Tasks.Count;
            statistics.InProgressTasks = data.Tasks.Count(t => t.Status == Models.TaskStatus.InProgress);
            statistics.PendingTasks = data.Tasks.Count(t => t.Status == Models.TaskStatus.Pending);
            statistics.TodayCompletedTasks = data.Tasks.Count(t => 
                t.Status == Models.TaskStatus.Completed && 
                t.CompletedAt.HasValue && 
                t.CompletedAt.Value.Date == now.Date);

            // 計算番茄數統計
            var completedSessions = data.Sessions.Where(s => s.IsCompleted && s.Type == SessionType.Work);

            statistics.TodayPomodoros = completedSessions.Count(s => s.StartTime.Date == now.Date);
            
            var weekStart = now.AddDays(-(int)now.DayOfWeek);
            statistics.WeekPomodoros = completedSessions.Count(s => s.StartTime >= weekStart);
            
            var monthStart = new DateTime(now.Year, now.Month, 1);
            statistics.MonthPomodoros = completedSessions.Count(s => s.StartTime >= monthStart);

            return statistics;
        }
    }
}
