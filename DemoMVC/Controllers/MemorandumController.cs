using Microsoft.AspNetCore.Mvc;
using DemoMVC.Models;
using DemoMVC.Services;

namespace DemoMVC.Controllers
{
    /// <summary>
    /// 備忘錄控制器
    /// </summary>
    public class MemorandumController : Controller
    {
        private readonly IMemorandumDataService _dataService;
        private readonly ILogger<MemorandumController> _logger;

        public MemorandumController(
            IMemorandumDataService dataService,
            ILogger<MemorandumController> logger)
        {
            _dataService = dataService;
            _logger = logger;
        }

        /// <summary>
        /// 列表頁
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> Index()
        {
            try
            {
                var memorandums = await _dataService.GetAllAsync();
                var tags = await _dataService.GetAllTagsAsync();
                
                ViewBag.Tags = tags;
                return View(memorandums);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "載入備忘錄列表時發生錯誤");
                TempData["Error"] = "載入備忘錄列表時發生錯誤";
                return View(new List<Memorandum>());
            }
        }

        /// <summary>
        /// 新增頁面
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> Create()
        {
            try
            {
                var tags = await _dataService.GetAllTagsAsync();
                ViewBag.AvailableTags = tags;
                return View(new Memorandum());
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "載入新增頁面時發生錯誤");
                return RedirectToAction(nameof(Index));
            }
        }

        /// <summary>
        /// 新增備忘錄提交
        /// </summary>
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create(Memorandum memorandum)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();
                    
                    TempData["Error"] = string.Join(", ", errors);
                    var tags = await _dataService.GetAllTagsAsync();
                    ViewBag.AvailableTags = tags;
                    return View(memorandum);
                }

                await _dataService.CreateAsync(memorandum);
                TempData["Success"] = "備忘錄已成功建立";
                return RedirectToAction(nameof(Index));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "建立備忘錄時發生錯誤");
                TempData["Error"] = "建立備忘錄時發生錯誤";
                return View(memorandum);
            }
        }

        /// <summary>
        /// 編輯頁面
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> Edit(string id)
        {
            try
            {
                if (string.IsNullOrEmpty(id))
                {
                    TempData["Error"] = "無效的備忘錄 ID";
                    return RedirectToAction(nameof(Index));
                }

                var memorandum = await _dataService.GetByIdAsync(id);
                if (memorandum == null)
                {
                    TempData["Error"] = "找不到指定的備忘錄";
                    return RedirectToAction(nameof(Index));
                }

                var tags = await _dataService.GetAllTagsAsync();
                ViewBag.AvailableTags = tags;
                return View(memorandum);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "載入編輯頁面時發生錯誤: {Id}", id);
                return RedirectToAction(nameof(Index));
            }
        }

        /// <summary>
        /// 編輯備忘錄提交
        /// </summary>
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(Memorandum memorandum)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage)
                        .ToList();
                    
                    TempData["Error"] = string.Join(", ", errors);
                    var tags = await _dataService.GetAllTagsAsync();
                    ViewBag.AvailableTags = tags;
                    return View(memorandum);
                }

                await _dataService.UpdateAsync(memorandum);
                TempData["Success"] = "備忘錄已成功更新";
                return RedirectToAction(nameof(Index));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "更新備忘錄時發生錯誤: {Id}", memorandum.Id);
                TempData["Error"] = "更新備忘錄時發生錯誤";
                return View(memorandum);
            }
        }

        /// <summary>
        /// 刪除備忘錄
        /// </summary>
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Delete(string id)
        {
            try
            {
                if (string.IsNullOrEmpty(id))
                {
                    return Json(new { success = false, message = "無效的備忘錄 ID" });
                }

                var result = await _dataService.DeleteAsync(id);
                if (result)
                {
                    return Json(new { success = true, message = "備忘錄已成功刪除" });
                }
                else
                {
                    return Json(new { success = false, message = "找不到指定的備忘錄" });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "刪除備忘錄時發生錯誤: {Id}", id);
                return Json(new { success = false, message = "刪除備忘錄時發生錯誤", error = ex.Message });
            }
        }

        /// <summary>
        /// AJAX - 取得所有備忘錄
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var memorandums = await _dataService.GetAllAsync();
                return Json(new { success = true, data = memorandums });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "取得備忘錄列表時發生錯誤");
                return Json(new { success = false, message = "取得備忘錄列表時發生錯誤", error = ex.Message });
            }
        }

        /// <summary>
        /// AJAX - 搜尋備忘錄
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> Search(string keyword)
        {
            try
            {
                var memorandums = await _dataService.SearchAsync(keyword);
                return Json(new { success = true, data = memorandums });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "搜尋備忘錄時發生錯誤: {Keyword}", keyword);
                return Json(new { success = false, message = "搜尋備忘錄時發生錯誤", error = ex.Message });
            }
        }

        /// <summary>
        /// AJAX - 根據標籤篩選備忘錄
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetByTag(string tag)
        {
            try
            {
                if (string.IsNullOrEmpty(tag))
                {
                    return await GetAll();
                }

                var memorandums = await _dataService.GetByTagAsync(tag);
                return Json(new { success = true, data = memorandums });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "根據標籤篩選備忘錄時發生錯誤: {Tag}", tag);
                return Json(new { success = false, message = "篩選備忘錄時發生錯誤", error = ex.Message });
            }
        }

        /// <summary>
        /// AJAX - 切換釘選狀態
        /// </summary>
        [HttpPost]
        public async Task<IActionResult> TogglePin(string id)
        {
            try
            {
                if (string.IsNullOrEmpty(id))
                {
                    return Json(new { success = false, message = "無效的備忘錄 ID" });
                }

                var memorandum = await _dataService.GetByIdAsync(id);
                if (memorandum == null)
                {
                    return Json(new { success = false, message = "找不到指定的備忘錄" });
                }

                // 檢查釘選數量限制
                if (!memorandum.IsPinned)
                {
                    var pinnedCount = (await _dataService.GetPinnedAsync()).Count;
                    if (pinnedCount >= 5)
                    {
                        return Json(new { success = false, message = "最多只能釘選 5 個備忘錄" });
                    }
                }

                memorandum.IsPinned = !memorandum.IsPinned;
                await _dataService.UpdateAsync(memorandum);

                return Json(new { 
                    success = true, 
                    message = memorandum.IsPinned ? "已釘選" : "已取消釘選",
                    isPinned = memorandum.IsPinned
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "切換釘選狀態時發生錯誤: {Id}", id);
                return Json(new { success = false, message = "切換釘選狀態時發生錯誤", error = ex.Message });
            }
        }

        /// <summary>
        /// AJAX - 取得分頁資料
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetPaged(int page = 1, int pageSize = 12)
        {
            try
            {
                var (items, totalCount) = await _dataService.GetPagedAsync(page, pageSize);
                var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

                return Json(new
                {
                    success = true,
                    data = items,
                    totalCount = totalCount,
                    totalPages = totalPages,
                    currentPage = page,
                    pageSize = pageSize
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "取得分頁資料時發生錯誤: Page={Page}, PageSize={PageSize}", page, pageSize);
                return Json(new { success = false, message = "取得分頁資料時發生錯誤", error = ex.Message });
            }
        }

        /// <summary>
        /// AJAX - 取得所有標籤
        /// </summary>
        [HttpGet]
        public async Task<IActionResult> GetTags()
        {
            try
            {
                var tags = await _dataService.GetAllTagsAsync();
                return Json(new { success = true, data = tags });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "取得標籤列表時發生錯誤");
                return Json(new { success = false, message = "取得標籤列表時發生錯誤", error = ex.Message });
            }
        }
    }
}
