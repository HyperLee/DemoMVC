/**
 * 地球儀資料處理模組
 * 負責與後端 API 溝通,處理資料載入與快取
 */

const GlobeDataHandler = (function() {
    'use strict';

    // 私有變數
    let locationsCache = null;
    let layersCache = null;
    let settingsCache = null;

    /**
     * 顯示 Toast 通知
     */
    function showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        container.appendChild(toast);

        // 3 秒後自動移除
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    /**
     * 通用 API 請求函式
     */
    async function apiRequest(url, options = {}) {
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API 請求失敗: ${url}`, error);
            showToast(`資料載入失敗: ${error.message}`, 'error');
            throw error;
        }
    }

    /**
     * 載入所有地點資料
     */
    async function loadLocations() {
        if (locationsCache) {
            return locationsCache;
        }

        try {
            const data = await apiRequest('/api/globe/locations');
            locationsCache = data;
            console.log(`成功載入 ${data.length} 個地點`);
            return data;
        } catch (error) {
            console.error('載入地點資料失敗', error);
            return [];
        }
    }

    /**
     * 根據 ID 載入特定地點
     */
    async function loadLocationById(id) {
        try {
            return await apiRequest(`/api/globe/locations/${id}`);
        } catch (error) {
            console.error(`載入地點 ${id} 失敗`, error);
            return null;
        }
    }

    /**
     * 搜尋地點
     */
    async function searchLocations(keyword) {
        if (!keyword || keyword.trim() === '') {
            return locationsCache || [];
        }

        try {
            const encodedKeyword = encodeURIComponent(keyword);
            return await apiRequest(`/api/globe/locations/search?keyword=${encodedKeyword}`);
        } catch (error) {
            console.error('搜尋地點失敗', error);
            return [];
        }
    }

    /**
     * 根據類型篩選地點
     */
    async function loadLocationsByType(type) {
        try {
            return await apiRequest(`/api/globe/locations/type/${type}`);
        } catch (error) {
            console.error(`載入類型 ${type} 的地點失敗`, error);
            return [];
        }
    }

    /**
     * 載入圖層列表
     */
    async function loadLayers() {
        if (layersCache) {
            return layersCache;
        }

        try {
            const data = await apiRequest('/api/globe/layers');
            layersCache = data;
            console.log(`成功載入 ${data.length} 個圖層`);
            return data;
        } catch (error) {
            console.error('載入圖層資料失敗', error);
            return [];
        }
    }

    /**
     * 載入特定圖層資料
     */
    async function loadLayerById(id) {
        try {
            return await apiRequest(`/api/globe/layers/${id}`);
        } catch (error) {
            console.error(`載入圖層 ${id} 失敗`, error);
            return null;
        }
    }

    /**
     * 載入設定
     */
    async function loadSettings() {
        if (settingsCache) {
            return settingsCache;
        }

        try {
            const data = await apiRequest('/api/globe/settings');
            settingsCache = data;
            console.log('成功載入設定', data);
            return data;
        } catch (error) {
            console.error('載入設定失敗', error);
            // 回傳預設設定
            return {
                defaultZoom: 2.5,
                minZoom: 1.0,
                maxZoom: 10.0,
                rotationSpeed: 0.5,
                autoRotateEnabled: false,
                enabledLayers: ['Borders', 'Cities']
            };
        }
    }

    /**
     * 更新設定
     */
    async function updateSettings(settings) {
        try {
            const data = await apiRequest('/api/globe/settings', {
                method: 'PUT',
                body: JSON.stringify(settings)
            });

            if (data.success) {
                settingsCache = settings;
                showToast('設定已儲存', 'success');
                return true;
            } else {
                showToast('設定儲存失敗', 'error');
                return false;
            }
        } catch (error) {
            console.error('更新設定失敗', error);
            showToast('設定儲存失敗', 'error');
            return false;
        }
    }

    /**
     * 清除快取
     */
    function clearCache() {
        locationsCache = null;
        layersCache = null;
        settingsCache = null;
        console.log('快取已清除');
    }

    /**
     * 預先載入所有必要資料
     */
    async function preloadData() {
        console.log('開始預先載入資料...');
        
        try {
            const [locations, layers, settings] = await Promise.all([
                loadLocations(),
                loadLayers(),
                loadSettings()
            ]);

            console.log('資料預先載入完成', {
                locations: locations.length,
                layers: layers.length,
                settings
            });

            return { locations, layers, settings };
        } catch (error) {
            console.error('預先載入資料失敗', error);
            throw error;
        }
    }

    /**
     * 根據經緯度計算兩點距離 (公里)
     */
    function calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371; // 地球半徑 (公里)
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                  Math.sin(dLon/2) * Math.sin(dLon/2);
        
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        const distance = R * c;
        
        return distance;
    }

    /**
     * 根據經緯度找出最近的地點
     */
    async function findNearestLocation(latitude, longitude, maxDistance = 500) {
        const locations = await loadLocations();
        
        let nearest = null;
        let minDistance = maxDistance;

        locations.forEach(location => {
            const distance = calculateDistance(
                latitude, longitude,
                location.latitude, location.longitude
            );

            if (distance < minDistance) {
                minDistance = distance;
                nearest = {
                    ...location,
                    distance: distance.toFixed(2)
                };
            }
        });

        return nearest;
    }

    /**
     * 取得特定類型的標記顏色
     */
    function getMarkerColor(locationType) {
        const colorMap = {
            0: '#e74c3c', // Capital - 紅色
            1: '#3498db', // City - 藍色
            2: '#9b59b6', // Landmark - 紫色
            3: '#27ae60', // NaturalWonder - 綠色
            4: '#f39c12', // Heritage - 金色
            5: '#95a5a6'  // Custom - 灰色
        };

        return colorMap[locationType] || '#ffffff';
    }

    /**
     * 取得類型的中文名稱
     */
    function getTypeLabel(locationType) {
        const labelMap = {
            0: '首都',
            1: '城市',
            2: '地標',
            3: '自然景觀',
            4: '世界遺產',
            5: '自訂'
        };

        return labelMap[locationType] || '未知';
    }

    /**
     * 格式化經緯度顯示
     */
    function formatCoordinates(latitude, longitude) {
        const latDir = latitude >= 0 ? 'N' : 'S';
        const lonDir = longitude >= 0 ? 'E' : 'W';
        
        return {
            latitude: `${Math.abs(latitude).toFixed(4)}° ${latDir}`,
            longitude: `${Math.abs(longitude).toFixed(4)}° ${lonDir}`,
            combined: `${Math.abs(latitude).toFixed(4)}° ${latDir}, ${Math.abs(longitude).toFixed(4)}° ${lonDir}`
        };
    }

    /**
     * 格式化人口數字
     */
    function formatPopulation(population) {
        if (!population) return '資料未提供';
        
        if (population >= 1000000) {
            return `${(population / 1000000).toFixed(2)} 百萬`;
        } else if (population >= 1000) {
            return `${(population / 1000).toFixed(2)} 千`;
        } else {
            return population.toString();
        }
    }

    // 公開 API
    return {
        // 資料載入
        loadLocations,
        loadLocationById,
        searchLocations,
        loadLocationsByType,
        loadLayers,
        loadLayerById,
        loadSettings,
        updateSettings,
        preloadData,
        
        // 工具函式
        calculateDistance,
        findNearestLocation,
        getMarkerColor,
        getTypeLabel,
        formatCoordinates,
        formatPopulation,
        
        // 快取管理
        clearCache,
        
        // 通知
        showToast
    };
})();

// 將模組掛載到全域物件
window.GlobeDataHandler = GlobeDataHandler;
