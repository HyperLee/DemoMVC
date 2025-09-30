using DemoMVC.Models;
using System.Text.Json;

namespace DemoMVC.Services
{
    /// <summary>
    /// 地球儀資料服務實作
    /// </summary>
    public class GlobeDataService : IGlobeDataService
    {
        private readonly IWebHostEnvironment _env;
        private readonly ILogger<GlobeDataService> _logger;
        private List<LocationData>? _cachedLocations;
        private GlobeSettings? _cachedSettings;
        private List<GlobeLayer>? _cachedLayers;

        public GlobeDataService(IWebHostEnvironment env, ILogger<GlobeDataService> logger)
        {
            _env = env;
            _logger = logger;
        }

        /// <summary>
        /// 取得所有地點資料
        /// </summary>
        public async Task<List<LocationData>> GetAllLocationsAsync()
        {
            if (_cachedLocations != null)
            {
                return _cachedLocations;
            }

            try
            {
                var locations = new List<LocationData>();
                
                // 載入各種資料檔案
                var citiesPath = Path.Combine(_env.WebRootPath, "Data", "cities.json");
                var landmarksPath = Path.Combine(_env.WebRootPath, "Data", "landmarks.json");

                if (File.Exists(citiesPath))
                {
                    var citiesJson = await File.ReadAllTextAsync(citiesPath);
                    var cities = JsonSerializer.Deserialize<List<LocationData>>(citiesJson);
                    if (cities != null) locations.AddRange(cities);
                }

                if (File.Exists(landmarksPath))
                {
                    var landmarksJson = await File.ReadAllTextAsync(landmarksPath);
                    var landmarks = JsonSerializer.Deserialize<List<LocationData>>(landmarksJson);
                    if (landmarks != null) locations.AddRange(landmarks);
                }

                // 如果沒有資料檔案,使用預設範例資料
                if (locations.Count == 0)
                {
                    locations = GetDefaultLocations();
                }

                _cachedLocations = locations;
                return locations;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "載入地點資料時發生錯誤");
                return GetDefaultLocations();
            }
        }

        /// <summary>
        /// 根據 ID 取得特定地點資料
        /// </summary>
        public async Task<LocationData?> GetLocationByIdAsync(int id)
        {
            var locations = await GetAllLocationsAsync();
            return locations.FirstOrDefault(l => l.Id == id);
        }

        /// <summary>
        /// 搜尋地點
        /// </summary>
        public async Task<List<LocationData>> SearchLocationsAsync(string keyword)
        {
            var locations = await GetAllLocationsAsync();
            
            if (string.IsNullOrWhiteSpace(keyword))
            {
                return locations;
            }

            keyword = keyword.ToLower();
            return locations.Where(l =>
                l.Name.ToLower().Contains(keyword) ||
                l.NameEn.ToLower().Contains(keyword) ||
                l.Country.ToLower().Contains(keyword)
            ).ToList();
        }

        /// <summary>
        /// 根據類型篩選地點
        /// </summary>
        public async Task<List<LocationData>> GetLocationsByTypeAsync(LocationType type)
        {
            var locations = await GetAllLocationsAsync();
            return locations.Where(l => l.Type == type).ToList();
        }

        /// <summary>
        /// 取得地球儀設定
        /// </summary>
        public async Task<GlobeSettings> GetSettingsAsync()
        {
            if (_cachedSettings != null)
            {
                return _cachedSettings;
            }

            try
            {
                var settingsPath = Path.Combine(_env.WebRootPath, "Data", "globe-settings.json");
                
                if (File.Exists(settingsPath))
                {
                    var json = await File.ReadAllTextAsync(settingsPath);
                    var settings = JsonSerializer.Deserialize<GlobeSettings>(json);
                    if (settings != null)
                    {
                        _cachedSettings = settings;
                        return settings;
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "載入設定時發生錯誤");
            }

            // 回傳預設設定
            _cachedSettings = new GlobeSettings();
            return _cachedSettings;
        }

        /// <summary>
        /// 更新地球儀設定
        /// </summary>
        public async Task<bool> UpdateSettingsAsync(GlobeSettings settings)
        {
            try
            {
                var settingsPath = Path.Combine(_env.WebRootPath, "Data", "globe-settings.json");
                var json = JsonSerializer.Serialize(settings, new JsonSerializerOptions { WriteIndented = true });
                await File.WriteAllTextAsync(settingsPath, json);
                _cachedSettings = settings;
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "更新設定時發生錯誤");
                return false;
            }
        }

        /// <summary>
        /// 取得所有可用圖層
        /// </summary>
        public async Task<List<GlobeLayer>> GetAllLayersAsync()
        {
            if (_cachedLayers != null)
            {
                return _cachedLayers;
            }

            await Task.CompletedTask; // 模擬非同步操作

            _cachedLayers = new List<GlobeLayer>
            {
                new GlobeLayer { Id = 1, Name = "國家邊界", Type = LayerType.Borders, IsVisible = true, Opacity = 0.8, ZIndex = 1 },
                new GlobeLayer { Id = 2, Name = "城市標記", Type = LayerType.Cities, IsVisible = true, Opacity = 1.0, ZIndex = 2 },
                new GlobeLayer { Id = 3, Name = "地形高度", Type = LayerType.Terrain, IsVisible = false, Opacity = 0.6, ZIndex = 0 },
                new GlobeLayer { Id = 4, Name = "氣候區域", Type = LayerType.Climate, IsVisible = false, Opacity = 0.5, ZIndex = 0 },
                new GlobeLayer { Id = 5, Name = "時區", Type = LayerType.TimeZones, IsVisible = false, Opacity = 0.7, ZIndex = 0 },
                new GlobeLayer { Id = 6, Name = "人口密度", Type = LayerType.Population, IsVisible = false, Opacity = 0.6, ZIndex = 0 }
            };

            return _cachedLayers;
        }

        /// <summary>
        /// 取得特定圖層資料
        /// </summary>
        public async Task<GlobeLayer?> GetLayerByIdAsync(int id)
        {
            var layers = await GetAllLayersAsync();
            return layers.FirstOrDefault(l => l.Id == id);
        }

        /// <summary>
        /// 取得預設地點資料
        /// </summary>
        private List<LocationData> GetDefaultLocations()
        {
            return new List<LocationData>
            {
                new LocationData
                {
                    Id = 1,
                    Name = "台北",
                    NameEn = "Taipei",
                    Latitude = 25.0330,
                    Longitude = 121.5654,
                    Type = LocationType.Capital,
                    Description = "台灣的首都,充滿活力的現代化都市",
                    Country = "台灣",
                    Population = 2646204,
                    TimeZone = "Asia/Taipei",
                    ExternalLinks = new Dictionary<string, string>
                    {
                        { "wikipedia", "https://zh.wikipedia.org/wiki/臺北市" }
                    }
                },
                new LocationData
                {
                    Id = 2,
                    Name = "東京",
                    NameEn = "Tokyo",
                    Latitude = 35.6762,
                    Longitude = 139.6503,
                    Type = LocationType.Capital,
                    Description = "日本首都,全球最大的都會區之一",
                    Country = "日本",
                    Population = 13960000,
                    TimeZone = "Asia/Tokyo",
                    ExternalLinks = new Dictionary<string, string>
                    {
                        { "wikipedia", "https://zh.wikipedia.org/wiki/東京" }
                    }
                },
                new LocationData
                {
                    Id = 3,
                    Name = "巴黎",
                    NameEn = "Paris",
                    Latitude = 48.8566,
                    Longitude = 2.3522,
                    Type = LocationType.Capital,
                    Description = "法國首都,世界著名的藝術與文化中心",
                    Country = "法國",
                    Population = 2165423,
                    TimeZone = "Europe/Paris",
                    ExternalLinks = new Dictionary<string, string>
                    {
                        { "wikipedia", "https://zh.wikipedia.org/wiki/巴黎" }
                    }
                },
                new LocationData
                {
                    Id = 4,
                    Name = "紐約",
                    NameEn = "New York",
                    Latitude = 40.7128,
                    Longitude = -74.0060,
                    Type = LocationType.City,
                    Description = "美國最大城市,全球金融與文化中心",
                    Country = "美國",
                    Population = 8336817,
                    TimeZone = "America/New_York",
                    ExternalLinks = new Dictionary<string, string>
                    {
                        { "wikipedia", "https://zh.wikipedia.org/wiki/紐約" }
                    }
                },
                new LocationData
                {
                    Id = 5,
                    Name = "倫敦",
                    NameEn = "London",
                    Latitude = 51.5074,
                    Longitude = -0.1278,
                    Type = LocationType.Capital,
                    Description = "英國首都,歷史悠久的國際大都會",
                    Country = "英國",
                    Population = 8982000,
                    TimeZone = "Europe/London",
                    ExternalLinks = new Dictionary<string, string>
                    {
                        { "wikipedia", "https://zh.wikipedia.org/wiki/倫敦" }
                    }
                },
                new LocationData
                {
                    Id = 6,
                    Name = "雪梨",
                    NameEn = "Sydney",
                    Latitude = -33.8688,
                    Longitude = 151.2093,
                    Type = LocationType.City,
                    Description = "澳洲最大城市,以雪梨歌劇院聞名",
                    Country = "澳洲",
                    Population = 5312163,
                    TimeZone = "Australia/Sydney",
                    ExternalLinks = new Dictionary<string, string>
                    {
                        { "wikipedia", "https://zh.wikipedia.org/wiki/雪梨" }
                    }
                },
                new LocationData
                {
                    Id = 7,
                    Name = "富士山",
                    NameEn = "Mount Fuji",
                    Latitude = 35.3606,
                    Longitude = 138.7278,
                    Type = LocationType.NaturalWonder,
                    Description = "日本最高峰,世界文化遺產",
                    Country = "日本",
                    TimeZone = "Asia/Tokyo",
                    ExternalLinks = new Dictionary<string, string>
                    {
                        { "wikipedia", "https://zh.wikipedia.org/wiki/富士山" }
                    }
                },
                new LocationData
                {
                    Id = 8,
                    Name = "艾菲爾鐵塔",
                    NameEn = "Eiffel Tower",
                    Latitude = 48.8584,
                    Longitude = 2.2945,
                    Type = LocationType.Landmark,
                    Description = "巴黎著名地標,法國的象徵",
                    Country = "法國",
                    TimeZone = "Europe/Paris",
                    ExternalLinks = new Dictionary<string, string>
                    {
                        { "wikipedia", "https://zh.wikipedia.org/wiki/艾菲爾鐵塔" }
                    }
                },
                new LocationData
                {
                    Id = 9,
                    Name = "大峽谷",
                    NameEn = "Grand Canyon",
                    Latitude = 36.1069,
                    Longitude = -112.1129,
                    Type = LocationType.NaturalWonder,
                    Description = "美國亞利桑那州的壯麗峽谷,世界自然遺產",
                    Country = "美國",
                    TimeZone = "America/Phoenix",
                    ExternalLinks = new Dictionary<string, string>
                    {
                        { "wikipedia", "https://zh.wikipedia.org/wiki/大峽谷" }
                    }
                },
                new LocationData
                {
                    Id = 10,
                    Name = "北京",
                    NameEn = "Beijing",
                    Latitude = 39.9042,
                    Longitude = 116.4074,
                    Type = LocationType.Capital,
                    Description = "中國首都,擁有悠久的歷史文化",
                    Country = "中國",
                    Population = 21540000,
                    TimeZone = "Asia/Shanghai",
                    ExternalLinks = new Dictionary<string, string>
                    {
                        { "wikipedia", "https://zh.wikipedia.org/wiki/北京市" }
                    }
                }
            };
        }
    }
}
