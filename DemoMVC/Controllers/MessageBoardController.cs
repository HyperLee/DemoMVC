using DemoMVC.Models;
using DemoMVC.Services;
using Microsoft.AspNetCore.Mvc;

namespace DemoMVC.Controllers
{
    public class MessageBoardController : Controller
    {
        private readonly IMessageBoardService _messageService;
        private readonly ILogger<MessageBoardController> _logger;
        private const string UserIdCookieName = "MessageBoardUserId";

        public MessageBoardController(IMessageBoardService messageService, ILogger<MessageBoardController> logger)
        {
            _messageService = messageService;
            _logger = logger;
        }

        /// <summary>
        /// 取得或建立使用者識別碼
        /// </summary>
        private string GetOrCreateUserId()
        {
            var userId = Request.Cookies[UserIdCookieName];
            
            if (string.IsNullOrEmpty(userId))
            {
                userId = Guid.NewGuid().ToString();
                Response.Cookies.Append(UserIdCookieName, userId, new CookieOptions
                {
                    Expires = DateTimeOffset.Now.AddDays(7),
                    HttpOnly = false,
                    Secure = true,
                    SameSite = SameSiteMode.Strict
                });
            }

            return userId;
        }

        /// <summary>
        /// 留言板首頁
        /// </summary>
        public async Task<IActionResult> Index()
        {
            // 清理過期留言
            await _messageService.CleanupExpiredMessagesAsync();
            
            // 確保使用者有識別碼
            GetOrCreateUserId();

            return View();
        }

        /// <summary>
        /// 取得留言列表
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetMessages(string? sort = "newest", int page = 1, int pageSize = 10)
        {
            try
            {
                var messages = await _messageService.GetAllMessagesAsync();

                // 排序
                messages = sort?.ToLower() switch
                {
                    "popular" => messages.OrderByDescending(m => m.LikeCount).ThenByDescending(m => m.CreatedAt).ToList(),
                    "oldest" => messages.OrderBy(m => m.CreatedAt).ToList(),
                    _ => messages.OrderByDescending(m => m.CreatedAt).ToList()
                };

                // 分頁
                var totalCount = messages.Count;
                var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);
                var pagedMessages = messages.Skip((page - 1) * pageSize).Take(pageSize).ToList();

                // 取得每則留言的回覆
                var messagesWithReplies = new List<object>();
                foreach (var message in pagedMessages)
                {
                    var replies = await _messageService.GetRepliesAsync(message.MessageId);
                    messagesWithReplies.Add(new
                    {
                        message,
                        replies
                    });
                }

                return Json(new
                {
                    success = true,
                    data = new
                    {
                        messages = messagesWithReplies,
                        totalCount,
                        currentPage = page,
                        totalPages,
                        pageSize
                    }
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "取得留言列表失敗");
                return Json(new
                {
                    success = false,
                    message = "取得留言列表失敗",
                    errors = new[] { ex.Message }
                });
            }
        }

        /// <summary>
        /// 建立新留言
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateMessageRequest request)
        {
            try
            {
                // 驗證
                if (string.IsNullOrWhiteSpace(request.Content))
                {
                    return Json(new
                    {
                        success = false,
                        message = "留言內容不可為空白"
                    });
                }

                if (request.Content.Length > 200)
                {
                    return Json(new
                    {
                        success = false,
                        message = "留言內容不可超過 200 字"
                    });
                }

                var userId = GetOrCreateUserId();

                var message = new Message
                {
                    Content = request.Content,
                    ParentMessageId = request.ParentMessageId,
                    UserIdentifier = userId
                };

                var createdMessage = await _messageService.CreateMessageAsync(message);

                return Json(new
                {
                    success = true,
                    message = "留言已發送",
                    data = createdMessage
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "建立留言失敗");
                return Json(new
                {
                    success = false,
                    message = "建立留言失敗",
                    errors = new[] { ex.Message }
                });
            }
        }

        /// <summary>
        /// 編輯留言
        /// </summary>
        [HttpPut]
        public async Task<IActionResult> Edit([FromBody] EditMessageRequest request)
        {
            try
            {
                var userId = GetOrCreateUserId();
                var message = await _messageService.GetMessageByIdAsync(request.MessageId);

                if (message == null)
                {
                    return Json(new
                    {
                        success = false,
                        message = "留言不存在"
                    });
                }

                if (message.UserIdentifier != userId)
                {
                    return Json(new
                    {
                        success = false,
                        message = "您沒有權限編輯此留言"
                    });
                }

                if (!message.CanEdit())
                {
                    return Json(new
                    {
                        success = false,
                        message = "超過編輯時限 (10 分鐘)"
                    });
                }

                if (string.IsNullOrWhiteSpace(request.Content))
                {
                    return Json(new
                    {
                        success = false,
                        message = "留言內容不可為空白"
                    });
                }

                if (request.Content.Length > 200)
                {
                    return Json(new
                    {
                        success = false,
                        message = "留言內容不可超過 200 字"
                    });
                }

                message.Content = request.Content;
                var updatedMessage = await _messageService.UpdateMessageAsync(message);

                return Json(new
                {
                    success = true,
                    message = "留言已更新",
                    data = updatedMessage
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "編輯留言失敗");
                return Json(new
                {
                    success = false,
                    message = "編輯留言失敗",
                    errors = new[] { ex.Message }
                });
            }
        }

        /// <summary>
        /// 刪除留言
        /// </summary>
        [HttpDelete]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                var userId = GetOrCreateUserId();
                var result = await _messageService.DeleteMessageAsync(id, userId);

                if (!result)
                {
                    return Json(new
                    {
                        success = false,
                        message = "刪除失敗，您沒有權限或留言不存在"
                    });
                }

                return Json(new
                {
                    success = true,
                    message = "留言已刪除"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "刪除留言失敗");
                return Json(new
                {
                    success = false,
                    message = "刪除留言失敗",
                    errors = new[] { ex.Message }
                });
            }
        }

        /// <summary>
        /// 按讚
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Like(string id)
        {
            try
            {
                var result = await _messageService.LikeMessageAsync(id);

                if (!result)
                {
                    return Json(new
                    {
                        success = false,
                        message = "按讚失敗"
                    });
                }

                return Json(new
                {
                    success = true,
                    message = "已按讚"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "按讚失敗");
                return Json(new
                {
                    success = false,
                    message = "按讚失敗",
                    errors = new[] { ex.Message }
                });
            }
        }

        /// <summary>
        /// 取消按讚
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> Unlike(string id)
        {
            try
            {
                var result = await _messageService.UnlikeMessageAsync(id);

                if (!result)
                {
                    return Json(new
                    {
                        success = false,
                        message = "取消按讚失敗"
                    });
                }

                return Json(new
                {
                    success = true,
                    message = "已取消按讚"
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "取消按讚失敗");
                return Json(new
                {
                    success = false,
                    message = "取消按讚失敗",
                    errors = new[] { ex.Message }
                });
            }
        }

        /// <summary>
        /// 搜尋留言
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> Search(string keyword)
        {
            try
            {
                var messages = await _messageService.SearchMessagesAsync(keyword);

                return Json(new
                {
                    success = true,
                    data = messages
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "搜尋留言失敗");
                return Json(new
                {
                    success = false,
                    message = "搜尋留言失敗",
                    errors = new[] { ex.Message }
                });
            }
        }
    }

    // 請求模型
    public class CreateMessageRequest
    {
        public string Content { get; set; } = string.Empty;
        public string? ParentMessageId { get; set; }
    }

    public class EditMessageRequest
    {
        public string MessageId { get; set; } = string.Empty;
        public string Content { get; set; } = string.Empty;
    }
}
