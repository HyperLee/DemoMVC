namespace DemoMVC.Models
{
    /// <summary>
    /// 地球儀圖層模型
    /// </summary>
    public class GlobeLayer
    {
        public int Id { get; set; }
        
        /// <summary>
        /// 圖層名稱
        /// </summary>
        public string Name { get; set; } = string.Empty;
        
        /// <summary>
        /// 圖層類型
        /// </summary>
        public LayerType Type { get; set; }
        
        /// <summary>
        /// 是否可見
        /// </summary>
        public bool IsVisible { get; set; } = true;
        
        /// <summary>
        /// 透明度 (0.0 - 1.0)
        /// </summary>
        public double Opacity { get; set; } = 1.0;
        
        /// <summary>
        /// 資料來源路徑
        /// </summary>
        public string DataSource { get; set; } = string.Empty;
        
        /// <summary>
        /// 圖層堆疊順序
        /// </summary>
        public int ZIndex { get; set; }
    }

    /// <summary>
    /// 圖層類型列舉
    /// </summary>
    public enum LayerType
    {
        /// <summary>
        /// 國家邊界
        /// </summary>
        Borders = 0,
        
        /// <summary>
        /// 城市
        /// </summary>
        Cities = 1,
        
        /// <summary>
        /// 地形
        /// </summary>
        Terrain = 2,
        
        /// <summary>
        /// 氣候
        /// </summary>
        Climate = 3,
        
        /// <summary>
        /// 時區
        /// </summary>
        TimeZones = 4,
        
        /// <summary>
        /// 人口密度
        /// </summary>
        Population = 5
    }
}
