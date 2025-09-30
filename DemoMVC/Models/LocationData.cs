namespace DemoMVC.Models
{
    /// <summary>
    /// 地點資料模型
    /// </summary>
    public class LocationData
    {
        public int Id { get; set; }
        
        /// <summary>
        /// 地點中文名稱
        /// </summary>
        public string Name { get; set; } = string.Empty;
        
        /// <summary>
        /// 地點英文名稱
        /// </summary>
        public string NameEn { get; set; } = string.Empty;
        
        /// <summary>
        /// 緯度
        /// </summary>
        public double Latitude { get; set; }
        
        /// <summary>
        /// 經度
        /// </summary>
        public double Longitude { get; set; }
        
        /// <summary>
        /// 地點類型
        /// </summary>
        public LocationType Type { get; set; }
        
        /// <summary>
        /// 描述說明
        /// </summary>
        public string Description { get; set; } = string.Empty;
        
        /// <summary>
        /// 所屬國家
        /// </summary>
        public string Country { get; set; } = string.Empty;
        
        /// <summary>
        /// 人口數量 (城市適用)
        /// </summary>
        public int? Population { get; set; }
        
        /// <summary>
        /// 時區
        /// </summary>
        public string TimeZone { get; set; } = string.Empty;
        
        /// <summary>
        /// 圖片網址列表
        /// </summary>
        public List<string> ImageUrls { get; set; } = new List<string>();
        
        /// <summary>
        /// 外部連結
        /// </summary>
        public Dictionary<string, string> ExternalLinks { get; set; } = new Dictionary<string, string>();
    }

    /// <summary>
    /// 地點類型列舉
    /// </summary>
    public enum LocationType
    {
        /// <summary>
        /// 首都
        /// </summary>
        Capital = 0,
        
        /// <summary>
        /// 城市
        /// </summary>
        City = 1,
        
        /// <summary>
        /// 地標
        /// </summary>
        Landmark = 2,
        
        /// <summary>
        /// 自然景觀
        /// </summary>
        NaturalWonder = 3,
        
        /// <summary>
        /// 世界遺產
        /// </summary>
        Heritage = 4,
        
        /// <summary>
        /// 自訂
        /// </summary>
        Custom = 5
    }
}
