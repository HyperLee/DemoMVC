namespace DemoMVC.Models;

/// <summary>
/// 世界時鐘檢視模型 - 用於傳遞時區資料至檢視
/// </summary>
public class WorldClockViewModel
{
    /// <summary>
    /// 城市時區列表
    /// </summary>
    public List<CityTimeZone> Cities { get; set; } = [];

    /// <summary>
    /// 預設主要顯示的城市名稱
    /// </summary>
    public string DefaultCity { get; set; } = "台北";

    /// <summary>
    /// 預設城市的當前時間 (伺服器端計算)
    /// </summary>
    public string CurrentTime { get; set; } = string.Empty;

    /// <summary>
    /// 預設城市的當前日期 (伺服器端計算)
    /// </summary>
    public string CurrentDate { get; set; } = string.Empty;

    /// <summary>
    /// 預設城市的時區資訊
    /// </summary>
    public string TimeZoneInfo { get; set; } = "GMT+08:00";

    /// <summary>
    /// 預設城市的 IANA 時區識別碼
    /// </summary>
    public string TimeZoneId { get; set; } = "Asia/Taipei";
}

/// <summary>
/// 城市時區資料模型 - 代表單一城市的時區資訊
/// </summary>
public class CityTimeZone
{
    /// <summary>
    /// 城市名稱 (中文顯示名稱)
    /// </summary>
    public string Name { get; set; } = string.Empty;

    /// <summary>
    /// IANA 時區識別碼 (如: Asia/Taipei, America/New_York)
    /// 用於 JavaScript Intl.DateTimeFormat 的 timeZone 參數
    /// </summary>
    public string TimeZone { get; set; } = string.Empty;

    /// <summary>
    /// UTC 偏移量字串 (如: +08:00, -05:00)
    /// 主要用於顯示給使用者參考
    /// </summary>
    public string UtcOffset { get; set; } = string.Empty;

    /// <summary>
    /// 國家代碼 (ISO 3166-1 alpha-2)
    /// 選用欄位，可用於未來顯示國旗圖示
    /// </summary>
    public string? CountryCode { get; set; }

    /// <summary>
    /// 是否正在實施夏令時間
    /// 此欄位會動態計算，因夏令時間會隨季節變化
    /// </summary>
    public bool IsDaylightSaving { get; set; }

    /// <summary>
    /// 顯示名稱（用於 UI 排序和搜尋）
    /// 預設使用 Name 屬性值
    /// </summary>
    public string DisplayName => Name;

    /// <summary>
    /// 時區簡稱 (如: GMT+8, EST, PST)
    /// 從 UtcOffset 或動態計算得出
    /// </summary>
    public string TimeZoneAbbreviation => GetTimeZoneAbbreviation();

    /// <summary>
    /// 取得時區簡稱的私有方法
    /// 根據 UtcOffset 生成對應的 GMT 表示法
    /// </summary>
    /// <returns>時區簡稱字串</returns>
    private string GetTimeZoneAbbreviation()
    {
        if (string.IsNullOrEmpty(UtcOffset))
        {
            return "GMT";
        }

        // 將 +08:00 轉換為 GMT+8
        var offset = UtcOffset.Replace(":00", "").Replace("+0", "+").Replace("-0", "-");
        return $"GMT{offset}";
    }
}