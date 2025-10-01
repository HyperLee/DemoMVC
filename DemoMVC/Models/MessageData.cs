namespace DemoMVC.Models
{
    /// <summary>
    /// 留言集合包裝類別
    /// </summary>
    public class MessageData
    {
        /// <summary>
        /// 留言列表
        /// </summary>
        public List<Message> Messages { get; set; } = new List<Message>();

        /// <summary>
        /// 最後清理時間
        /// </summary>
        public DateTime LastCleanup { get; set; } = DateTime.Now;
    }
}
