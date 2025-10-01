using DemoMVC.Models;

namespace DemoMVC.Services
{
    /// <summary>
    /// 留言板服務介面
    /// </summary>
    public interface IMessageBoardService
    {
        /// <summary>
        /// 取得所有留言 (不包含已刪除和過期)
        /// </summary>
        Task<List<Message>> GetAllMessagesAsync();

        /// <summary>
        /// 根據 ID 取得留言
        /// </summary>
        Task<Message?> GetMessageByIdAsync(string id);

        /// <summary>
        /// 建立新留言
        /// </summary>
        Task<Message> CreateMessageAsync(Message message);

        /// <summary>
        /// 更新留言
        /// </summary>
        Task<Message?> UpdateMessageAsync(Message message);

        /// <summary>
        /// 刪除留言 (軟刪除)
        /// </summary>
        Task<bool> DeleteMessageAsync(string id, string userIdentifier);

        /// <summary>
        /// 按讚
        /// </summary>
        Task<bool> LikeMessageAsync(string id);

        /// <summary>
        /// 取消按讚
        /// </summary>
        Task<bool> UnlikeMessageAsync(string id);

        /// <summary>
        /// 搜尋留言
        /// </summary>
        Task<List<Message>> SearchMessagesAsync(string keyword);

        /// <summary>
        /// 清理過期留言 (超過 24 小時)
        /// </summary>
        Task CleanupExpiredMessagesAsync();

        /// <summary>
        /// 過濾不當字詞
        /// </summary>
        string FilterContent(string content);

        /// <summary>
        /// 取得留言的回覆列表
        /// </summary>
        Task<List<Message>> GetRepliesAsync(string parentMessageId);
    }
}
