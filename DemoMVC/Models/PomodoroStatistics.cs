namespace DemoMVC.Models
{
    /// <summary>
    /// 番茄鐘統計資訊模型
    /// </summary>
    public class PomodoroStatistics
    {
        /// <summary>
        /// 今日完成的番茄數
        /// </summary>
        public int TodayPomodoros { get; set; }

        /// <summary>
        /// 本週完成的番茄數
        /// </summary>
        public int WeekPomodoros { get; set; }

        /// <summary>
        /// 本月完成的番茄數
        /// </summary>
        public int MonthPomodoros { get; set; }

        /// <summary>
        /// 今日完成的任務數
        /// </summary>
        public int TodayCompletedTasks { get; set; }

        /// <summary>
        /// 總任務數
        /// </summary>
        public int TotalTasks { get; set; }

        /// <summary>
        /// 進行中的任務數
        /// </summary>
        public int InProgressTasks { get; set; }

        /// <summary>
        /// 待處理的任務數
        /// </summary>
        public int PendingTasks { get; set; }
    }
}
