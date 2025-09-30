using DemoMVC.Models;
using DemoMVC.Services;
using Microsoft.AspNetCore.Mvc;

namespace DemoMVC.Controllers
{
    /// <summary>
    /// 地球儀控制器
    /// </summary>
    public class GlobeController : Controller
    {
        private readonly IGlobeDataService _globeDataService;
        private readonly ILogger<GlobeController> _logger;

        public GlobeController(IGlobeDataService globeDataService, ILogger<GlobeController> logger)
        {
            _globeDataService = globeDataService;
            _logger = logger;
        }

        /// <summary>
        /// 地球儀主頁面
        /// </summary>
        public IActionResult Index()
        {
            return View();
        }

        #region API 端點

        /// <summary>
        /// API: 取得所有地點
        /// GET /api/globe/locations
        /// </summary>
        [HttpGet]
        [Route("api/globe/locations")]
        public async Task<IActionResult> GetAllLocations()
        {
            try
            {
                var locations = await _globeDataService.GetAllLocationsAsync();
                return Json(locations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "取得所有地點時發生錯誤");
                return StatusCode(500, new { error = "無法取得地點資料" });
            }
        }

        /// <summary>
        /// API: 取得特定地點詳細資訊
        /// GET /api/globe/locations/{id}
        /// </summary>
        [HttpGet]
        [Route("api/globe/locations/{id}")]
        public async Task<IActionResult> GetLocationById(int id)
        {
            try
            {
                var location = await _globeDataService.GetLocationByIdAsync(id);
                
                if (location == null)
                {
                    return NotFound(new { error = "找不到指定的地點" });
                }
                
                return Json(location);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "取得地點 {LocationId} 時發生錯誤", id);
                return StatusCode(500, new { error = "無法取得地點資料" });
            }
        }

        /// <summary>
        /// API: 搜尋地點
        /// GET /api/globe/locations/search?keyword={keyword}
        /// </summary>
        [HttpGet]
        [Route("api/globe/locations/search")]
        public async Task<IActionResult> SearchLocations([FromQuery] string keyword)
        {
            try
            {
                var locations = await _globeDataService.SearchLocationsAsync(keyword);
                return Json(locations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "搜尋地點時發生錯誤: {Keyword}", keyword);
                return StatusCode(500, new { error = "搜尋時發生錯誤" });
            }
        }

        /// <summary>
        /// API: 根據類型取得地點
        /// GET /api/globe/locations/type/{type}
        /// </summary>
        [HttpGet]
        [Route("api/globe/locations/type/{type}")]
        public async Task<IActionResult> GetLocationsByType(LocationType type)
        {
            try
            {
                var locations = await _globeDataService.GetLocationsByTypeAsync(type);
                return Json(locations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "根據類型 {Type} 取得地點時發生錯誤", type);
                return StatusCode(500, new { error = "無法取得地點資料" });
            }
        }

        /// <summary>
        /// API: 取得可用圖層列表
        /// GET /api/globe/layers
        /// </summary>
        [HttpGet]
        [Route("api/globe/layers")]
        public async Task<IActionResult> GetAllLayers()
        {
            try
            {
                var layers = await _globeDataService.GetAllLayersAsync();
                return Json(layers);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "取得圖層列表時發生錯誤");
                return StatusCode(500, new { error = "無法取得圖層資料" });
            }
        }

        /// <summary>
        /// API: 取得特定圖層資料
        /// GET /api/globe/layers/{id}
        /// </summary>
        [HttpGet]
        [Route("api/globe/layers/{id}")]
        public async Task<IActionResult> GetLayerById(int id)
        {
            try
            {
                var layer = await _globeDataService.GetLayerByIdAsync(id);
                
                if (layer == null)
                {
                    return NotFound(new { error = "找不到指定的圖層" });
                }
                
                return Json(layer);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "取得圖層 {LayerId} 時發生錯誤", id);
                return StatusCode(500, new { error = "無法取得圖層資料" });
            }
        }

        /// <summary>
        /// API: 取得地球儀設定
        /// GET /api/globe/settings
        /// </summary>
        [HttpGet]
        [Route("api/globe/settings")]
        public async Task<IActionResult> GetSettings()
        {
            try
            {
                var settings = await _globeDataService.GetSettingsAsync();
                return Json(settings);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "取得設定時發生錯誤");
                return StatusCode(500, new { error = "無法取得設定" });
            }
        }

        /// <summary>
        /// API: 更新地球儀設定
        /// PUT /api/globe/settings
        /// </summary>
        [HttpPut]
        [Route("api/globe/settings")]
        public async Task<IActionResult> UpdateSettings([FromBody] GlobeSettings settings)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var success = await _globeDataService.UpdateSettingsAsync(settings);
                
                if (success)
                {
                    return Json(new { success = true, message = "設定已更新" });
                }
                else
                {
                    return StatusCode(500, new { success = false, error = "更新設定失敗" });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "更新設定時發生錯誤");
                return StatusCode(500, new { success = false, error = "更新設定時發生錯誤" });
            }
        }

        #endregion
    }
}
