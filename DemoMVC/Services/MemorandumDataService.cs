using System.Text.Json;
using DemoMVC.Models;

namespace DemoMVC.Services
{
    /// <summary>
    /// 備忘錄資料服務實作
    /// </summary>
    public class MemorandumDataService : IMemorandumDataService
    {
        private readonly string _dataFilePath;
        private readonly ILogger<MemorandumDataService> _logger;
        private readonly SemaphoreSlim _fileLock = new SemaphoreSlim(1, 1);
        private MemorandumData? _cachedData;
        private DateTime _lastLoadTime;

        public MemorandumDataService(
            IWebHostEnvironment environment,
            ILogger<MemorandumDataService> logger)
        {
            _logger = logger;
            var dataDirectory = Path.Combine(environment.ContentRootPath, "Data");
            
            // 確保 Data 目錄存在
            if (!Directory.Exists(dataDirectory))
            {
                Directory.CreateDirectory(dataDirectory);
                _logger.LogInformation("建立 Data 目錄: {Directory}", dataDirectory);
            }

            _dataFilePath = Path.Combine(dataDirectory, "memorandums.json");
            _lastLoadTime = DateTime.MinValue;
        }

        #region 私有方法 - 檔案操作

        /// <summary>
        /// 載入資料檔案
        /// </summary>
        private async Task<MemorandumData> LoadDataAsync()
        {
            await _fileLock.WaitAsync();
            try
            {
                // 檢查快取
                if (_cachedData != null && (DateTime.Now - _lastLoadTime).TotalSeconds < 60)
                {
                    return _cachedData;
                }

                if (!File.Exists(_dataFilePath))
                {
                    _logger.LogWarning("資料檔案不存在，建立新檔案: {FilePath}", _dataFilePath);
                    var newData = new MemorandumData();
                    await SaveDataAsync(newData);
                    return newData;
                }

                var json = await File.ReadAllTextAsync(_dataFilePath);
                var data = JsonSerializer.Deserialize<MemorandumData>(json) ?? new MemorandumData();
                
                _cachedData = data;
                _lastLoadTime = DateTime.Now;
                
                _logger.LogInformation("成功載入 {Count} 筆備忘錄", data.Memorandums.Count);
                return data;
            }
            catch (JsonException ex)
            {
                _logger.LogError(ex, "JSON 解析錯誤，返回空資料");
                return new MemorandumData();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "載入資料時發生錯誤");
                throw;
            }
            finally
            {
                _fileLock.Release();
            }
        }

        /// <summary>
        /// 儲存資料到檔案
        /// </summary>
        private async Task SaveDataAsync(MemorandumData data)
        {
            await _fileLock.WaitAsync();
            try
            {
                var options = new JsonSerializerOptions
                {
                    WriteIndented = true,
                    Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping
                };

                var json = JsonSerializer.Serialize(data, options);
                await File.WriteAllTextAsync(_dataFilePath, json);
                
                _cachedData = data;
                _lastLoadTime = DateTime.Now;
                
                _logger.LogInformation("成功儲存 {Count} 筆備忘錄", data.Memorandums.Count);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "儲存資料時發生錯誤");
                throw;
            }
            finally
            {
                _fileLock.Release();
            }
        }

        /// <summary>
        /// 更新標籤清單
        /// </summary>
        private void UpdateAvailableTags(MemorandumData data)
        {
            var allTags = data.Memorandums
                .Where(m => !m.IsDeleted)
                .SelectMany(m => m.Tags)
                .Distinct()
                .OrderBy(t => t)
                .ToList();

            data.AvailableTags = allTags;
        }

        #endregion

        #region 基本 CRUD 操作

        /// <summary>
        /// 取得所有備忘錄（不含已刪除）
        /// </summary>
        public async Task<List<Memorandum>> GetAllAsync()
        {
            var data = await LoadDataAsync();
            return data.Memorandums
                .Where(m => !m.IsDeleted)
                .OrderByDescending(m => m.IsPinned)
                .ThenByDescending(m => m.UpdatedAt)
                .ToList();
        }

        /// <summary>
        /// 根據 ID 取得備忘錄
        /// </summary>
        public async Task<Memorandum?> GetByIdAsync(string id)
        {
            var data = await LoadDataAsync();
            return data.Memorandums.FirstOrDefault(m => m.Id == id && !m.IsDeleted);
        }

        /// <summary>
        /// 建立新備忘錄
        /// </summary>
        public async Task<Memorandum> CreateAsync(Memorandum memorandum)
        {
            var data = await LoadDataAsync();
            
            memorandum.Id = Guid.NewGuid().ToString();
            memorandum.CreatedAt = DateTime.Now;
            memorandum.UpdatedAt = DateTime.Now;
            memorandum.IsDeleted = false;

            data.Memorandums.Add(memorandum);
            UpdateAvailableTags(data);
            
            await SaveDataAsync(data);
            
            _logger.LogInformation("建立備忘錄: {Id} - {Title}", memorandum.Id, memorandum.Title);
            return memorandum;
        }

        /// <summary>
        /// 更新備忘錄
        /// </summary>
        public async Task<Memorandum> UpdateAsync(Memorandum memorandum)
        {
            var data = await LoadDataAsync();
            var existing = data.Memorandums.FirstOrDefault(m => m.Id == memorandum.Id);

            if (existing == null)
            {
                throw new InvalidOperationException($"找不到 ID 為 {memorandum.Id} 的備忘錄");
            }

            // 保留建立時間
            memorandum.CreatedAt = existing.CreatedAt;
            memorandum.UpdatedAt = DateTime.Now;

            // 更新資料
            var index = data.Memorandums.IndexOf(existing);
            data.Memorandums[index] = memorandum;
            
            UpdateAvailableTags(data);
            await SaveDataAsync(data);
            
            _logger.LogInformation("更新備忘錄: {Id} - {Title}", memorandum.Id, memorandum.Title);
            return memorandum;
        }

        /// <summary>
        /// 刪除備忘錄（軟刪除）
        /// </summary>
        public async Task<bool> DeleteAsync(string id)
        {
            var data = await LoadDataAsync();
            var memorandum = data.Memorandums.FirstOrDefault(m => m.Id == id);

            if (memorandum == null)
            {
                _logger.LogWarning("嘗試刪除不存在的備忘錄: {Id}", id);
                return false;
            }

            memorandum.IsDeleted = true;
            memorandum.UpdatedAt = DateTime.Now;
            
            UpdateAvailableTags(data);
            await SaveDataAsync(data);
            
            _logger.LogInformation("刪除備忘錄: {Id} - {Title}", id, memorandum.Title);
            return true;
        }

        #endregion

        #region 進階查詢功能

        /// <summary>
        /// 搜尋備忘錄（標題、內容或標籤）
        /// </summary>
        public async Task<List<Memorandum>> SearchAsync(string keyword)
        {
            if (string.IsNullOrWhiteSpace(keyword))
            {
                return await GetAllAsync();
            }

            var data = await LoadDataAsync();
            var searchTerm = keyword.ToLower();

            return data.Memorandums
                .Where(m => !m.IsDeleted && (
                    m.Title.ToLower().Contains(searchTerm) ||
                    m.Content.ToLower().Contains(searchTerm) ||
                    m.Tags.Any(t => t.ToLower().Contains(searchTerm))
                ))
                .OrderByDescending(m => m.IsPinned)
                .ThenByDescending(m => m.UpdatedAt)
                .ToList();
        }

        /// <summary>
        /// 根據標籤取得備忘錄
        /// </summary>
        public async Task<List<Memorandum>> GetByTagAsync(string tag)
        {
            var data = await LoadDataAsync();
            return data.Memorandums
                .Where(m => !m.IsDeleted && m.Tags.Contains(tag))
                .OrderByDescending(m => m.IsPinned)
                .ThenByDescending(m => m.UpdatedAt)
                .ToList();
        }

        /// <summary>
        /// 取得已釘選的備忘錄
        /// </summary>
        public async Task<List<Memorandum>> GetPinnedAsync()
        {
            var data = await LoadDataAsync();
            return data.Memorandums
                .Where(m => !m.IsDeleted && m.IsPinned)
                .OrderByDescending(m => m.UpdatedAt)
                .ToList();
        }

        #endregion

        #region 分頁功能

        /// <summary>
        /// 取得分頁資料
        /// </summary>
        public async Task<(List<Memorandum> items, int totalCount)> GetPagedAsync(int page, int pageSize)
        {
            var allItems = await GetAllAsync();
            var totalCount = allItems.Count;
            
            var items = allItems
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToList();

            return (items, totalCount);
        }

        #endregion

        #region 標籤管理

        /// <summary>
        /// 取得所有標籤
        /// </summary>
        public async Task<List<string>> GetAllTagsAsync()
        {
            var data = await LoadDataAsync();
            return data.AvailableTags;
        }

        /// <summary>
        /// 新增標籤到可用清單
        /// </summary>
        public async Task AddTagAsync(string tag)
        {
            var data = await LoadDataAsync();
            
            if (!data.AvailableTags.Contains(tag))
            {
                data.AvailableTags.Add(tag);
                data.AvailableTags = data.AvailableTags.OrderBy(t => t).ToList();
                await SaveDataAsync(data);
                
                _logger.LogInformation("新增標籤: {Tag}", tag);
            }
        }

        /// <summary>
        /// 從可用清單移除標籤
        /// </summary>
        public async Task RemoveTagAsync(string tag)
        {
            var data = await LoadDataAsync();
            
            if (data.AvailableTags.Remove(tag))
            {
                await SaveDataAsync(data);
                _logger.LogInformation("移除標籤: {Tag}", tag);
            }
        }

        #endregion
    }
}
