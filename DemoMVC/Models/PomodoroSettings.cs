using System.ComponentModel.DataAnnotations;

namespace DemoMVC.Models
{
    /// <summary>
    /// 番茄鐘設定模型
    /// </summary>
    public class PomodoroSettings
    {
        /// <summary>
        /// 工作時間長度（分鐘），預設 25
        /// </summary>
        [Range(1, 120, ErrorMessage = "工作時間必須在 1-120 分鐘之間")]
        public int WorkDuration { get; set; } = 25;

        /// <summary>
        /// 短休息時間長度（分鐘），預設 5
        /// </summary>
        [Range(1, 30, ErrorMessage = "短休息時間必須在 1-30 分鐘之間")]
        public int ShortBreakDuration { get; set; } = 5;

        /// <summary>
        /// 長休息時間長度（分鐘），預設 15
        /// </summary>
        [Range(1, 60, ErrorMessage = "長休息時間必須在 1-60 分鐘之間")]
        public int LongBreakDuration { get; set; } = 15;

        /// <summary>
        /// 長休息觸發條件（完成幾個番茄後），預設 4
        /// </summary>
        [Range(2, 10, ErrorMessage = "長休息觸發條件必須在 2-10 之間")]
        public int PomodorosUntilLongBreak { get; set; } = 4;

        /// <summary>
        /// 音效開關，預設開啟
        /// </summary>
        public bool SoundEnabled { get; set; } = true;

        /// <summary>
        /// 音量大小（0.0 - 1.0），預設 0.5
        /// </summary>
        [Range(0.0, 1.0, ErrorMessage = "音量必須在 0.0-1.0 之間")]
        public double Volume { get; set; } = 0.5;

        /// <summary>
        /// 自動開始下一階段，預設 false
        /// </summary>
        public bool AutoStartNext { get; set; } = false;
    }
}
