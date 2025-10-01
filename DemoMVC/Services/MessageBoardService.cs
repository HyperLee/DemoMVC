using DemoMVC.Models;
using System.Text.Json;
using System.Text.RegularExpressions;

namespace DemoMVC.Services
{
    /// <summary>
    /// 留言板服務實作
    /// </summary>
    public class MessageBoardService : IMessageBoardService
    {
        private readonly string _dataFilePath;
        private readonly string _filterWordsFilePath;
        private readonly SemaphoreSlim _fileLock = new SemaphoreSlim(1, 1);
        private MessageFilterSettings? _filterSettings;
        private readonly ILogger<MessageBoardService> _logger;

        public MessageBoardService(IWebHostEnvironment env, ILogger<MessageBoardService> logger)
        {
            _logger = logger;
            var dataPath = Path.Combine(env.ContentRootPath, "Data");
            
            // 確保 Data 資料夾存在
            if (!Directory.Exists(dataPath))
            {
                Directory.CreateDirectory(dataPath);
            }

            _dataFilePath = Path.Combine(dataPath, "messages.json");
            _filterWordsFilePath = Path.Combine(dataPath, "filter-words.json");

            // 初始化資料檔案
            InitializeDataFiles();
            
            // 載入過濾字詞
            LoadFilterWords();
        }

        private void InitializeDataFiles()
        {
            // 初始化 messages.json
            if (!File.Exists(_dataFilePath))
            {
                var initialData = new MessageData
                {
                    Messages = new List<Message>(),
                    LastCleanup = DateTime.Now
                };
                var json = JsonSerializer.Serialize(initialData, new JsonSerializerOptions { WriteIndented = true });
                File.WriteAllText(_dataFilePath, json);
            }
        }

        private void LoadFilterWords()
        {
            try
            {
                if (File.Exists(_filterWordsFilePath))
                {
                    var json = File.ReadAllText(_filterWordsFilePath);
                    _filterSettings = JsonSerializer.Deserialize<MessageFilterSettings>(json);
                }
                else
                {
                    _filterSettings = new MessageFilterSettings();
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "載入過濾字詞失敗");
                _filterSettings = new MessageFilterSettings();
            }
        }

        private async Task<MessageData> LoadMessagesAsync()
        {
            await _fileLock.WaitAsync();
            try
            {
                if (!File.Exists(_dataFilePath))
                {
                    return new MessageData();
                }

                var json = await File.ReadAllTextAsync(_dataFilePath);
                return JsonSerializer.Deserialize<MessageData>(json) ?? new MessageData();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "載入留言資料失敗");
                return new MessageData();
            }
            finally
            {
                _fileLock.Release();
            }
        }

        private async Task SaveMessagesAsync(MessageData data)
        {
            await _fileLock.WaitAsync();
            try
            {
                var json = JsonSerializer.Serialize(data, new JsonSerializerOptions { WriteIndented = true });
                await File.WriteAllTextAsync(_dataFilePath, json);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "儲存留言資料失敗");
                throw;
            }
            finally
            {
                _fileLock.Release();
            }
        }

        public async Task<List<Message>> GetAllMessagesAsync()
        {
            var data = await LoadMessagesAsync();
            
            // 過濾已刪除和過期的留言
            return data.Messages
                .Where(m => !m.IsDeleted && !m.IsExpired())
                .OrderByDescending(m => m.CreatedAt)
                .ToList();
        }

        public async Task<Message?> GetMessageByIdAsync(string id)
        {
            var data = await LoadMessagesAsync();
            return data.Messages.FirstOrDefault(m => m.MessageId == id && !m.IsDeleted && !m.IsExpired());
        }

        public async Task<Message> CreateMessageAsync(Message message)
        {
            // 過濾內容
            message.Content = FilterContent(message.Content);
            message.CreatedAt = DateTime.Now;
            message.MessageId = Guid.NewGuid().ToString();

            var data = await LoadMessagesAsync();
            data.Messages.Add(message);
            await SaveMessagesAsync(data);

            return message;
        }

        public async Task<Message?> UpdateMessageAsync(Message message)
        {
            var data = await LoadMessagesAsync();
            var existingMessage = data.Messages.FirstOrDefault(m => m.MessageId == message.MessageId);

            if (existingMessage == null || existingMessage.IsDeleted)
            {
                return null;
            }

            // 檢查是否可編輯 (10 分鐘內)
            if (!existingMessage.CanEdit())
            {
                return null;
            }

            // 更新內容
            existingMessage.Content = FilterContent(message.Content);
            existingMessage.EditedAt = DateTime.Now;

            await SaveMessagesAsync(data);
            return existingMessage;
        }

        public async Task<bool> DeleteMessageAsync(string id, string userIdentifier)
        {
            var data = await LoadMessagesAsync();
            var message = data.Messages.FirstOrDefault(m => m.MessageId == id);

            if (message == null || message.IsDeleted)
            {
                return false;
            }

            // 檢查權限
            if (message.UserIdentifier != userIdentifier)
            {
                return false;
            }

            // 軟刪除
            message.IsDeleted = true;
            await SaveMessagesAsync(data);

            return true;
        }

        public async Task<bool> LikeMessageAsync(string id)
        {
            var data = await LoadMessagesAsync();
            var message = data.Messages.FirstOrDefault(m => m.MessageId == id);

            if (message == null || message.IsDeleted)
            {
                return false;
            }

            message.LikeCount++;
            await SaveMessagesAsync(data);

            return true;
        }

        public async Task<bool> UnlikeMessageAsync(string id)
        {
            var data = await LoadMessagesAsync();
            var message = data.Messages.FirstOrDefault(m => m.MessageId == id);

            if (message == null || message.IsDeleted || message.LikeCount <= 0)
            {
                return false;
            }

            message.LikeCount--;
            await SaveMessagesAsync(data);

            return true;
        }

        public async Task<List<Message>> SearchMessagesAsync(string keyword)
        {
            if (string.IsNullOrWhiteSpace(keyword))
            {
                return await GetAllMessagesAsync();
            }

            var data = await LoadMessagesAsync();
            
            return data.Messages
                .Where(m => !m.IsDeleted && 
                           !m.IsExpired() && 
                           m.Content.Contains(keyword, StringComparison.OrdinalIgnoreCase))
                .OrderByDescending(m => m.CreatedAt)
                .ToList();
        }

        public async Task CleanupExpiredMessagesAsync()
        {
            var data = await LoadMessagesAsync();
            
            // 找出所有過期的留言
            var expiredMessages = data.Messages.Where(m => m.IsExpired()).ToList();
            
            if (expiredMessages.Any())
            {
                // 永久刪除過期留言及其回覆
                var expiredIds = expiredMessages.Select(m => m.MessageId).ToHashSet();
                data.Messages.RemoveAll(m => m.IsExpired() || (m.ParentMessageId != null && expiredIds.Contains(m.ParentMessageId)));
                
                data.LastCleanup = DateTime.Now;
                await SaveMessagesAsync(data);
                
                _logger.LogInformation($"已清理 {expiredMessages.Count} 則過期留言");
            }
        }

        public string FilterContent(string content)
        {
            if (_filterSettings == null || !_filterSettings.FilteredWords.Any())
            {
                return content;
            }

            var filteredContent = content;
            
            foreach (var word in _filterSettings.FilteredWords)
            {
                if (string.IsNullOrWhiteSpace(word))
                {
                    continue;
                }

                // 不區分大小寫替換
                var pattern = Regex.Escape(word);
                filteredContent = Regex.Replace(
                    filteredContent, 
                    pattern, 
                    _filterSettings.ReplacementChar, 
                    RegexOptions.IgnoreCase
                );
            }

            return filteredContent;
        }

        public async Task<List<Message>> GetRepliesAsync(string parentMessageId)
        {
            var data = await LoadMessagesAsync();
            
            return data.Messages
                .Where(m => m.ParentMessageId == parentMessageId && !m.IsDeleted && !m.IsExpired())
                .OrderBy(m => m.CreatedAt)
                .ToList();
        }
    }
}
