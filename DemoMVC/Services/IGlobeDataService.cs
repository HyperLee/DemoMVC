using DemoMVC.Models;

namespace DemoMVC.Services
{
    /// <summary>
    /// 地球儀資料服務介面
    /// </summary>
    public interface IGlobeDataService
    {
        /// <summary>
        /// 取得所有地點資料
        /// </summary>
        Task<List<LocationData>> GetAllLocationsAsync();
        
        /// <summary>
        /// 根據 ID 取得特定地點資料
        /// </summary>
        Task<LocationData?> GetLocationByIdAsync(int id);
        
        /// <summary>
        /// 搜尋地點
        /// </summary>
        Task<List<LocationData>> SearchLocationsAsync(string keyword);
        
        /// <summary>
        /// 根據類型篩選地點
        /// </summary>
        Task<List<LocationData>> GetLocationsByTypeAsync(LocationType type);
        
        /// <summary>
        /// 取得地球儀設定
        /// </summary>
        Task<GlobeSettings> GetSettingsAsync();
        
        /// <summary>
        /// 更新地球儀設定
        /// </summary>
        Task<bool> UpdateSettingsAsync(GlobeSettings settings);
        
        /// <summary>
        /// 取得所有可用圖層
        /// </summary>
        Task<List<GlobeLayer>> GetAllLayersAsync();
        
        /// <summary>
        /// 取得特定圖層資料
        /// </summary>
        Task<GlobeLayer?> GetLayerByIdAsync(int id);
    }
}
