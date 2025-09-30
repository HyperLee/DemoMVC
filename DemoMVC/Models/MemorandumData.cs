namespace DemoMVC.Models
{
    /// <summary>
    /// 備忘錄資料容器（用於 JSON 序列化）
    /// </summary>
    public class MemorandumData
    {
        /// <summary>
        /// 備忘錄清單
        /// </summary>
        public List<Memorandum> Memorandums { get; set; } = new List<Memorandum>();

        /// <summary>
        /// 所有可用標籤
        /// </summary>
        public List<string> AvailableTags { get; set; } = new List<string>();
    }
}
