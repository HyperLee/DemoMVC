namespace DemoMVC.Models
{
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
        /// <summary>
        /// 工作時間
        /// </summary>
        Work,
        
        /// <summary>
        /// 短休息
        /// </summary>
        ShortBreak,
        
        /// <summary>
        /// 長休息
        /// </summary>
        LongBreak
    }
}
