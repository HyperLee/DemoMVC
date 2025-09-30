using Microsoft.AspNetCore.Mvc;
using DemoMVC.Models;
using DemoMVC.Services;

namespace DemoMVC.Controllers
{
    /// <summary>
    /// 番茄鐘控制器
    /// </summary>
    public class PomodoroController : Controller
    {
        private readonly IPomodoroDataService _dataService;
        private readonly ILogger<PomodoroController> _logger;

        public PomodoroController(IPomodoroDataService dataService, ILogger<PomodoroController> logger)
        {
            _dataService = dataService;
            _logger = logger;
        }

        /// <summary>
        /// 主頁面
        /// </summary>
        public IActionResult Index()
        {
            return View();
        }

        /// <summary>
        /// 取得設定
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetSettings()
        {
            try
            {
                var settings = await _dataService.GetSettingsAsync();
                return Json(new { success = true, data = settings });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "取得設定時發生錯誤");
                return Json(new { success = false, message = "取得設定失敗" });
            }
        }

        /// <summary>
        /// 更新設定
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> UpdateSettings([FromBody] PomodoroSettings settings)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return Json(new { success = false, message = "設定資料驗證失敗" });
                }

                await _dataService.UpdateSettingsAsync(settings);
                return Json(new { success = true, message = "設定已更新" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "更新設定時發生錯誤");
                return Json(new { success = false, message = "更新設定失敗" });
            }
        }

        /// <summary>
        /// 取得所有任務
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetTasks(string? status = null)
        {
            try
            {
                Models.TaskStatus? taskStatus = null;
                if (!string.IsNullOrEmpty(status) && Enum.TryParse<Models.TaskStatus>(status, true, out var parsedStatus))
                {
                    taskStatus = parsedStatus;
                }

                var tasks = await _dataService.GetTasksAsync(taskStatus);
                return Json(new { success = true, data = tasks });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "取得任務時發生錯誤");
                return Json(new { success = false, message = "取得任務失敗" });
            }
        }

        /// <summary>
        /// 建立任務
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CreateTask([FromBody] CreateTaskRequest request)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(request.TaskName))
                {
                    return Json(new { success = false, message = "任務名稱不可為空" });
                }

                var task = new PomodoroTask
                {
                    TaskName = request.TaskName.Trim(),
                    EstimatedPomodoros = request.EstimatedPomodoros > 0 ? request.EstimatedPomodoros : 1,
                    Status = Models.TaskStatus.Pending,
                    CompletedPomodoros = 0
                };

                var createdTask = await _dataService.AddTaskAsync(task);
                return Json(new { success = true, data = createdTask });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "建立任務時發生錯誤");
                return Json(new { success = false, message = "建立任務失敗" });
            }
        }

        /// <summary>
        /// 更新任務
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> UpdateTask([FromBody] PomodoroTask task)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return Json(new { success = false, message = "任務資料驗證失敗" });
                }

                await _dataService.UpdateTaskAsync(task);
                return Json(new { success = true, message = "任務已更新" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "更新任務時發生錯誤");
                return Json(new { success = false, message = "更新任務失敗" });
            }
        }

        /// <summary>
        /// 刪除任務
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> DeleteTask([FromBody] DeleteTaskRequest request)
        {
            try
            {
                await _dataService.DeleteTaskAsync(request.TaskId);
                return Json(new { success = true, message = "任務已刪除" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "刪除任務時發生錯誤");
                return Json(new { success = false, message = "刪除任務失敗" });
            }
        }

        /// <summary>
        /// 完成任務
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> CompleteTask([FromBody] CompleteTaskRequest request)
        {
            try
            {
                var task = await _dataService.GetTaskByIdAsync(request.TaskId);
                if (task == null)
                {
                    return Json(new { success = false, message = "找不到該任務" });
                }

                task.Status = Models.TaskStatus.Completed;
                task.CompletedAt = DateTime.Now;

                await _dataService.UpdateTaskAsync(task);
                return Json(new { success = true, message = "任務已完成" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "完成任務時發生錯誤");
                return Json(new { success = false, message = "完成任務失敗" });
            }
        }

        /// <summary>
        /// 開始工作階段
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> StartSession([FromBody] StartSessionRequest request)
        {
            try
            {
                var settings = await _dataService.GetSettingsAsync();
                
                int plannedDuration = request.SessionType switch
                {
                    SessionType.Work => settings.WorkDuration,
                    SessionType.ShortBreak => settings.ShortBreakDuration,
                    SessionType.LongBreak => settings.LongBreakDuration,
                    _ => settings.WorkDuration
                };

                var session = new PomodoroSession
                {
                    TaskId = request.TaskId,
                    Type = request.SessionType,
                    PlannedDuration = plannedDuration,
                    IsCompleted = false,
                    WasInterrupted = false
                };

                var createdSession = await _dataService.AddSessionAsync(session);

                // 如果是工作階段，更新任務狀態
                if (request.SessionType == SessionType.Work)
                {
                    var task = await _dataService.GetTaskByIdAsync(request.TaskId);
                    if (task != null && task.Status == Models.TaskStatus.Pending)
                    {
                        task.Status = Models.TaskStatus.InProgress;
                        await _dataService.UpdateTaskAsync(task);
                    }
                }

                return Json(new { success = true, data = createdSession });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "開始工作階段時發生錯誤");
                return Json(new { success = false, message = "開始工作階段失敗" });
            }
        }

        /// <summary>
        /// 結束工作階段
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> EndSession([FromBody] EndSessionRequest request)
        {
            try
            {
                var data = await _dataService.LoadDataAsync();
                var session = data.Sessions.FirstOrDefault(s => s.Id == request.SessionId);
                
                if (session == null)
                {
                    return Json(new { success = false, message = "找不到該工作階段" });
                }

                session.EndTime = DateTime.Now;
                session.IsCompleted = !request.WasInterrupted;
                session.WasInterrupted = request.WasInterrupted;
                
                if (session.EndTime.HasValue)
                {
                    session.ActualDuration = (int)(session.EndTime.Value - session.StartTime).TotalMinutes;
                }

                await _dataService.UpdateSessionAsync(session);

                // 如果是完整完成的工作階段，增加任務的番茄數
                if (session.IsCompleted && session.Type == SessionType.Work)
                {
                    var task = await _dataService.GetTaskByIdAsync(session.TaskId);
                    if (task != null)
                    {
                        task.CompletedPomodoros++;
                        await _dataService.UpdateTaskAsync(task);
                    }
                }

                return Json(new { success = true, message = "工作階段已結束" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "結束工作階段時發生錯誤");
                return Json(new { success = false, message = "結束工作階段失敗" });
            }
        }

        /// <summary>
        /// 取得統計資料
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetStatistics(string period = "today")
        {
            try
            {
                var statistics = await _dataService.GetStatisticsAsync(period);
                return Json(new { success = true, data = statistics });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "取得統計資料時發生錯誤");
                return Json(new { success = false, message = "取得統計資料失敗" });
            }
        }

        // ===== Request Models =====

        public class CreateTaskRequest
        {
            public string TaskName { get; set; } = string.Empty;
            public int EstimatedPomodoros { get; set; }
        }

        public class DeleteTaskRequest
        {
            public Guid TaskId { get; set; }
        }

        public class CompleteTaskRequest
        {
            public Guid TaskId { get; set; }
        }

        public class StartSessionRequest
        {
            public Guid TaskId { get; set; }
            public SessionType SessionType { get; set; }
        }

        public class EndSessionRequest
        {
            public Guid SessionId { get; set; }
            public bool WasInterrupted { get; set; }
        }
    }
}
