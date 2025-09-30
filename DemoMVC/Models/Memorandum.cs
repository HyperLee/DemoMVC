using System.ComponentModel.DataAnnotations;

namespace DemoMVC.Models
{
    /// <summary>
    /// 備忘錄資料模型
    /// </summary>
    public class Memorandum
    {
        /// <summary>
        /// 備忘錄唯一識別碼
        /// </summary>
        [Required(ErrorMessage = "識別碼不可為空")]
        public string Id { get; set; } = Guid.NewGuid().ToString();

        /// <summary>
        /// 備忘錄標題
        /// </summary>
        [Required(ErrorMessage = "標題不可為空")]
        [StringLength(200, ErrorMessage = "標題長度不可超過 200 字元")]
        public string Title { get; set; } = string.Empty;

        /// <summary>
        /// 備忘錄內容（支援 Markdown）
        /// </summary>
        [Required(ErrorMessage = "內容不可為空")]
        [StringLength(10000, ErrorMessage = "內容長度不可超過 10000 字元")]
        public string Content { get; set; } = string.Empty;

        /// <summary>
        /// 標籤列表
        /// </summary>
        public List<string> Tags { get; set; } = new List<string>();

        /// <summary>
        /// 建立時間
        /// </summary>
        public DateTime CreatedAt { get; set; } = DateTime.Now;

        /// <summary>
        /// 最後修改時間
        /// </summary>
        public DateTime UpdatedAt { get; set; } = DateTime.Now;

        /// <summary>
        /// 是否已刪除（軟刪除）
        /// </summary>
        public bool IsDeleted { get; set; } = false;

        /// <summary>
        /// 是否釘選
        /// </summary>
        public bool IsPinned { get; set; } = false;

        /// <summary>
        /// 顏色標記（用於 UI 顯示）
        /// </summary>
        [StringLength(7)]
        public string? Color { get; set; }
    }
}
