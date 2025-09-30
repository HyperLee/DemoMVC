using System.ComponentModel.DataAnnotations;

namespace DemoMVC.Models
{
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
        [Required(ErrorMessage = "任務名稱為必填")]
        [MaxLength(100, ErrorMessage = "任務名稱最多 100 字元")]
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
        /// <summary>
        /// 待處理
        /// </summary>
        Pending,
        
        /// <summary>
        /// 進行中
        /// </summary>
        InProgress,
        
        /// <summary>
        /// 已完成
        /// </summary>
        Completed
    }
}
