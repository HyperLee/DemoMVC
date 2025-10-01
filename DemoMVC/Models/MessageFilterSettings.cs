namespace DemoMVC.Models
{
    /// <summary>
    /// 不當字詞過濾設定
    /// </summary>
    public class MessageFilterSettings
    {
        /// <summary>
        /// 過濾字詞列表
        /// </summary>
        public List<string> FilteredWords { get; set; } = new List<string>();

        /// <summary>
        /// 替換字元 (預設為 ***)
        /// </summary>
        public string ReplacementChar { get; set; } = "***";
    }
}
