namespace DemoMVC.Models
{
    /// <summary>
    /// 地球儀設定模型
    /// </summary>
    public class GlobeSettings
    {
        public int Id { get; set; }
        
        /// <summary>
        /// 預設縮放等級
        /// </summary>
        public double DefaultZoom { get; set; } = 2.5;
        
        /// <summary>
        /// 最小縮放等級
        /// </summary>
        public double MinZoom { get; set; } = 1.0;
        
        /// <summary>
        /// 最大縮放等級
        /// </summary>
        public double MaxZoom { get; set; } = 10.0;
        
        /// <summary>
        /// 旋轉速度 (度/秒)
        /// </summary>
        public double RotationSpeed { get; set; } = 0.5;
        
        /// <summary>
        /// 是否啟用自動旋轉
        /// </summary>
        public bool AutoRotateEnabled { get; set; } = false;
        
        /// <summary>
        /// 啟用的圖層列表
        /// </summary>
        public List<string> EnabledLayers { get; set; } = new List<string> { "Borders", "Cities" };
    }
}
