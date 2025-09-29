using Microsoft.AspNetCore.Mvc;
using DemoMVC.Models;

namespace DemoMVC.Controllers;

/// <summary>
/// 世界時鐘控制器 - 負責處理時區相關功能
/// 提供全球多個城市的即時時間查詢功能
/// </summary>
public class WorldClockController : Controller
{
    private readonly ILogger<WorldClockController> _logger;

    /// <summary>
    /// 建構函式 - 注入日誌記錄器
    /// </summary>
    /// <param name="logger">日誌記錄器實例</param>
    public WorldClockController(ILogger<WorldClockController> logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// 世界時鐘主頁面
    /// 顯示全球主要城市的即時時間
    /// </summary>
    /// <param name="main">指定的主要顯示城市 (選用)</param>
    /// <returns>世界時鐘檢視頁面</returns>
    public IActionResult Index(string? main = null)
    {
        _logger.LogInformation("存取世界時鐘頁面，主要城市: {MainCity}", main ?? "預設");

        try
        {
            // 建立檢視模型
            var model = new WorldClockViewModel
            {
                Cities = GetDefaultCities(),
                DefaultCity = GetValidCityName(main) ?? "台北"
            };

            // 設定頁面標題和中繼資料
            ViewData["Title"] = "世界時鐘";
            ViewData["Description"] = "即時查看全球各大城市時間，支援多時區顯示";
            ViewData["Keywords"] = "世界時鐘,時區,GMT,UTC,國際時間";

            return View(model);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "載入世界時鐘頁面時發生錯誤");
            
            // 發生錯誤時返回錯誤頁面
            return RedirectToAction("Error", "Home");
        }
    }

    /// <summary>
    /// 取得時區資料 API 端點
    /// 提供 JSON 格式的城市時區資訊，供前端 JavaScript 使用
    /// </summary>
    /// <returns>城市時區資料的 JSON 回應</returns>
    [HttpGet]
    public JsonResult GetTimeZones()
    {
        _logger.LogDebug("API 請求: 取得時區資料");

        try
        {
            var cities = GetDefaultCities();
            
            // 記錄成功的 API 呼叫
            _logger.LogInformation("成功回傳 {Count} 個城市的時區資料", cities.Count);
            
            return Json(cities);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "取得時區資料時發生錯誤");
            
            // 返回錯誤回應
            return Json(new { error = "無法取得時區資料", message = ex.Message });
        }
    }

    /// <summary>
    /// 取得預設的城市時區列表
    /// 包含全球主要城市的完整時區資訊
    /// </summary>
    /// <returns>城市時區列表</returns>
    private List<CityTimeZone> GetDefaultCities()
    {
        return
        [
            new CityTimeZone
            {
                Name = "台北",
                TimeZone = "Asia/Taipei",
                UtcOffset = "+08:00",
                CountryCode = "TW",
                IsDaylightSaving = false // 台灣不實施夏令時間
            },
            new CityTimeZone
            {
                Name = "東京",
                TimeZone = "Asia/Tokyo",
                UtcOffset = "+09:00",
                CountryCode = "JP",
                IsDaylightSaving = false // 日本不實施夏令時間
            },
            new CityTimeZone
            {
                Name = "倫敦",
                TimeZone = "Europe/London",
                UtcOffset = "+00:00", // 冬令時間為 GMT+0，夏令時間為 GMT+1
                CountryCode = "GB",
                IsDaylightSaving = IsDaylightSavingTime("Europe/London")
            },
            new CityTimeZone
            {
                Name = "紐約",
                TimeZone = "America/New_York",
                UtcOffset = "-05:00", // 標準時間為 GMT-5，夏令時間為 GMT-4
                CountryCode = "US",
                IsDaylightSaving = IsDaylightSavingTime("America/New_York")
            },
            new CityTimeZone
            {
                Name = "洛杉磯",
                TimeZone = "America/Los_Angeles",
                UtcOffset = "-08:00", // 標準時間為 GMT-8，夏令時間為 GMT-7
                CountryCode = "US",
                IsDaylightSaving = IsDaylightSavingTime("America/Los_Angeles")
            },
            new CityTimeZone
            {
                Name = "巴黎",
                TimeZone = "Europe/Paris",
                UtcOffset = "+01:00", // 標準時間為 GMT+1，夏令時間為 GMT+2
                CountryCode = "FR",
                IsDaylightSaving = IsDaylightSavingTime("Europe/Paris")
            },
            new CityTimeZone
            {
                Name = "柏林",
                TimeZone = "Europe/Berlin",
                UtcOffset = "+01:00", // 標準時間為 GMT+1，夏令時間為 GMT+2
                CountryCode = "DE",
                IsDaylightSaving = IsDaylightSavingTime("Europe/Berlin")
            },
            new CityTimeZone
            {
                Name = "莫斯科",
                TimeZone = "Europe/Moscow",
                UtcOffset = "+03:00",
                CountryCode = "RU",
                IsDaylightSaving = false // 俄羅斯目前不實施夏令時間
            },
            new CityTimeZone
            {
                Name = "新加坡",
                TimeZone = "Asia/Singapore",
                UtcOffset = "+08:00",
                CountryCode = "SG",
                IsDaylightSaving = false // 新加坡不實施夏令時間
            },
            new CityTimeZone
            {
                Name = "悉尼",
                TimeZone = "Australia/Sydney",
                UtcOffset = "+10:00", // 標準時間為 GMT+10，夏令時間為 GMT+11
                CountryCode = "AU",
                IsDaylightSaving = IsDaylightSavingTime("Australia/Sydney")
            }
        ];
    }

    /// <summary>
    /// 驗證並取得有效的城市名稱
    /// 確保使用者指定的城市名稱存在於支援列表中
    /// </summary>
    /// <param name="cityName">使用者指定的城市名稱</param>
    /// <returns>有效的城市名稱，若無效則回傳 null</returns>
    private string? GetValidCityName(string? cityName)
    {
        if (string.IsNullOrWhiteSpace(cityName))
        {
            return null;
        }

        var cities = GetDefaultCities();
        var validCity = cities.FirstOrDefault(c => 
            string.Equals(c.Name, cityName, StringComparison.OrdinalIgnoreCase));

        return validCity?.Name;
    }

    /// <summary>
    /// 判斷指定時區是否正在實施夏令時間
    /// 使用 .NET 的 TimeZoneInfo 來精確判斷
    /// </summary>
    /// <param name="timeZoneId">IANA 時區識別碼</param>
    /// <returns>是否正在實施夏令時間</returns>
    private static bool IsDaylightSavingTime(string timeZoneId)
    {
        try
        {
            var timeZone = TimeZoneInfo.FindSystemTimeZoneById(ConvertToWindowsTimeZoneId(timeZoneId));
            return timeZone.IsDaylightSavingTime(DateTime.UtcNow);
        }
        catch (TimeZoneNotFoundException)
        {
            // 如果找不到時區，記錄警告並假設沒有夏令時間
            return false;
        }
        catch (Exception)
        {
            // 其他例外情況也假設沒有夏令時間
            return false;
        }
    }

    /// <summary>
    /// 將 IANA 時區識別碼轉換為 Windows 時區識別碼
    /// 確保在 Windows 環境下能正確識別時區
    /// </summary>
    /// <param name="ianaTimeZoneId">IANA 時區識別碼</param>
    /// <returns>Windows 時區識別碼</returns>
    private static string ConvertToWindowsTimeZoneId(string ianaTimeZoneId)
    {
        // 簡化的對應表，實際應用中可能需要更完整的對應
        return ianaTimeZoneId switch
        {
            "Asia/Taipei" => "Taipei Standard Time",
            "Asia/Tokyo" => "Tokyo Standard Time",
            "Europe/London" => "GMT Standard Time",
            "America/New_York" => "Eastern Standard Time",
            "America/Los_Angeles" => "Pacific Standard Time",
            "Europe/Paris" => "W. Europe Standard Time",
            "Europe/Berlin" => "W. Europe Standard Time",
            "Europe/Moscow" => "Russian Standard Time",
            "Asia/Singapore" => "Singapore Standard Time",
            "Australia/Sydney" => "AUS Eastern Standard Time",
            _ => ianaTimeZoneId // 如果沒有對應，直接使用原始識別碼
        };
    }
}