namespace DemoMVC.Models
{
    /// <summary>
    /// 留言資料模型
    /// </summary>
    public class Message
    {
        /// <summary>
        /// 留言唯一識別碼
        /// </summary>
        public string MessageId { get; set; } = Guid.NewGuid().ToString();

        /// <summary>
        /// 留言內容 (最多 200 字)
        /// </summary>
        public string Content { get; set; } = string.Empty;

        /// <summary>
        /// 建立時間
        /// </summary>
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        /// <summary>
        /// 編輯時間 (可為 null)
        /// </summary>
        public DateTime? EditedAt { get; set; }

        /// <summary>
        /// 按讚數
        /// </summary>
        public int LikeCount { get; set; } = 0;

        /// <summary>
        /// 父留言 ID (用於回覆功能，null 表示主留言)
        /// </summary>
        public string? ParentMessageId { get; set; }

        /// <summary>
        /// 是否已刪除 (軟刪除)
        /// </summary>
        public bool IsDeleted { get; set; } = false;

        /// <summary>
        /// 使用者識別碼 (透過 Cookie 產生)
        /// </summary>
        public string UserIdentifier { get; set; } = string.Empty;

        /// <summary>
        /// 檢查留言是否已過期 (超過 24 小時)
        /// </summary>
        public bool IsExpired()
        {
            return DateTime.Now - CreatedAt > TimeSpan.FromHours(24);
        }

        /// <summary>
        /// 檢查是否可編輯 (建立後 10 分鐘內)
        /// </summary>
        public bool CanEdit()
        {
            return DateTime.Now - CreatedAt <= TimeSpan.FromMinutes(10);
        }
    }
}
