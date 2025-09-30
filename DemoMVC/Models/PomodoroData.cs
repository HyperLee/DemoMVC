namespace DemoMVC.Models
{
    /// <summary>
    /// 番茄鐘資料容器（用於 JSON 序列化）
    /// </summary>
    public class PomodoroData
    {
        /// <summary>
        /// 使用者設定
        /// </summary>
        public PomodoroSettings Settings { get; set; } = new PomodoroSettings();

        /// <summary>
        /// 任務清單
        /// </summary>
        public List<PomodoroTask> Tasks { get; set; } = new List<PomodoroTask>();

        /// <summary>
        /// 工作階段記錄
        /// </summary>
        public List<PomodoroSession> Sessions { get; set; } = new List<PomodoroSession>();
    }
}
