using DemoMVC.Models;

namespace DemoMVC.Services
{
    /// <summary>
    /// 備忘錄資料服務介面
    /// </summary>
    public interface IMemorandumDataService
    {
        // 基本 CRUD 操作
        Task<List<Memorandum>> GetAllAsync();
        Task<Memorandum?> GetByIdAsync(string id);
        Task<Memorandum> CreateAsync(Memorandum memorandum);
        Task<Memorandum> UpdateAsync(Memorandum memorandum);
        Task<bool> DeleteAsync(string id);
        
        // 進階查詢功能
        Task<List<Memorandum>> SearchAsync(string keyword);
        Task<List<Memorandum>> GetByTagAsync(string tag);
        Task<List<Memorandum>> GetPinnedAsync();
        
        // 分頁功能
        Task<(List<Memorandum> items, int totalCount)> GetPagedAsync(int page, int pageSize);
        
        // 標籤管理
        Task<List<string>> GetAllTagsAsync();
        Task AddTagAsync(string tag);
        Task RemoveTagAsync(string tag);
    }
}
