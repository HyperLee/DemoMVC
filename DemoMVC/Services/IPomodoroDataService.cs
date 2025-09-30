using System.Text.Json;
using DemoMVC.Models;

namespace DemoMVC.Services
{
    /// <summary>
    /// 番茄鐘資料服務介面
    /// </summary>
    public interface IPomodoroDataService
    {
        /// <summary>
        /// 載入資料
        /// </summary>
        Task<PomodoroData> LoadDataAsync();

        /// <summary>
        /// 儲存資料
        /// </summary>
        Task SaveDataAsync(PomodoroData data);

        /// <summary>
        /// 取得設定
        /// </summary>
        Task<PomodoroSettings> GetSettingsAsync();

        /// <summary>
        /// 更新設定
        /// </summary>
        Task UpdateSettingsAsync(PomodoroSettings settings);

        /// <summary>
        /// 取得所有任務
        /// </summary>
        Task<List<PomodoroTask>> GetTasksAsync(Models.TaskStatus? status = null);

        /// <summary>
        /// 取得單一任務
        /// </summary>
        Task<PomodoroTask?> GetTaskByIdAsync(Guid taskId);

        /// <summary>
        /// 新增任務
        /// </summary>
        Task<PomodoroTask> AddTaskAsync(PomodoroTask task);

        /// <summary>
        /// 更新任務
        /// </summary>
        Task UpdateTaskAsync(PomodoroTask task);

        /// <summary>
        /// 刪除任務
        /// </summary>
        Task DeleteTaskAsync(Guid taskId);

        /// <summary>
        /// 新增工作階段
        /// </summary>
        Task<PomodoroSession> AddSessionAsync(PomodoroSession session);

        /// <summary>
        /// 更新工作階段
        /// </summary>
        Task UpdateSessionAsync(PomodoroSession session);

        /// <summary>
        /// 取得統計資料
        /// </summary>
        Task<PomodoroStatistics> GetStatisticsAsync(string period = "today");
    }
}
