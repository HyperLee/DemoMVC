/**
 * 地球儀控制模組
 * 處理 UI 互動與事件綁定
 */

const GlobeControls = (function() {
    'use strict';

    // DOM 元素參考
    let elements = {};
    let callbacks = {};

    /**
     * 初始化控制模組
     */
    function init(eventCallbacks) {
        callbacks = eventCallbacks || {};
        cacheElements();
        bindEvents();
        initTutorial();
        console.log('控制模組初始化完成');
    }

    /**
     * 快取 DOM 元素
     */
    function cacheElements() {
        elements = {
            // 面板
            controlPanel: document.getElementById('control-panel'),
            infoPanel: document.getElementById('info-panel'),
            infoPanelContent: document.getElementById('info-panel-content'),
            
            // 按鈕
            resetViewBtn: document.getElementById('reset-view-btn'),
            fullscreenBtn: document.getElementById('fullscreen-btn'),
            zoomInBtn: document.getElementById('zoom-in-btn'),
            zoomOutBtn: document.getElementById('zoom-out-btn'),
            panelCloseBtn: document.getElementById('panel-close'),
            
            // 切換開關
            autoRotateToggle: document.getElementById('auto-rotate-toggle'),
            
            // 滑桿
            rotationSpeedSlider: document.getElementById('rotation-speed'),
            speedValue: document.getElementById('speed-value'),
            
            // 搜尋
            locationSearch: document.getElementById('location-search'),
            searchResults: document.getElementById('search-results'),
            
            // 圖層控制
            layerBorders: document.getElementById('layer-borders'),
            layerCities: document.getElementById('layer-cities'),
            layerTerrain: document.getElementById('layer-terrain'),
            layerClimate: document.getElementById('layer-climate'),
            
            // 顯示資訊
            currentViewInfo: document.getElementById('current-view-info'),
            zoomLevelDisplay: document.getElementById('zoom-level-display'),
            cursorCoords: document.getElementById('cursor-coords'),
            
            // 載入覆蓋層
            loadingOverlay: document.getElementById('loading-overlay'),
            
            // 行動版按鈕
            mobileControlsBtn: document.getElementById('mobile-controls-btn'),
            mobileSearchBtn: document.getElementById('mobile-search-btn'),
            mobileLayersBtn: document.getElementById('mobile-layers-btn'),
            mobileInfoBtn: document.getElementById('mobile-info-btn')
        };
    }

    /**
     * 綁定事件
     */
    function bindEvents() {
        // 視角控制
        if (elements.resetViewBtn) {
            elements.resetViewBtn.addEventListener('click', () => {
                if (callbacks.onResetView) callbacks.onResetView();
            });
        }

        if (elements.fullscreenBtn) {
            elements.fullscreenBtn.addEventListener('click', toggleFullscreen);
        }

        // 縮放控制
        if (elements.zoomInBtn) {
            elements.zoomInBtn.addEventListener('click', () => {
                if (callbacks.onZoomIn) callbacks.onZoomIn();
            });
        }

        if (elements.zoomOutBtn) {
            elements.zoomOutBtn.addEventListener('click', () => {
                if (callbacks.onZoomOut) callbacks.onZoomOut();
            });
        }

        // 自動旋轉
        if (elements.autoRotateToggle) {
            elements.autoRotateToggle.addEventListener('change', (e) => {
                if (callbacks.onAutoRotateToggle) {
                    callbacks.onAutoRotateToggle(e.target.checked);
                }
            });
        }

        // 旋轉速度
        if (elements.rotationSpeedSlider) {
            elements.rotationSpeedSlider.addEventListener('input', (e) => {
                const speed = parseFloat(e.target.value);
                if (elements.speedValue) {
                    elements.speedValue.textContent = speed.toFixed(1);
                }
                if (callbacks.onRotationSpeedChange) {
                    callbacks.onRotationSpeedChange(speed);
                }
            });
        }

        // 搜尋功能
        if (elements.locationSearch) {
            let searchTimeout;
            elements.locationSearch.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    performSearch(e.target.value);
                }, 300);
            });

            elements.locationSearch.addEventListener('focus', () => {
                if (elements.locationSearch.value) {
                    performSearch(elements.locationSearch.value);
                }
            });
        }

        // 關閉資訊面板
        if (elements.panelCloseBtn) {
            elements.panelCloseBtn.addEventListener('click', hideInfoPanel);
        }

        // 圖層切換
        const layerCheckboxes = [
            elements.layerBorders,
            elements.layerCities,
            elements.layerTerrain,
            elements.layerClimate
        ];

        layerCheckboxes.forEach(checkbox => {
            if (checkbox) {
                checkbox.addEventListener('change', (e) => {
                    const layerId = e.target.id.replace('layer-', '');
                    if (callbacks.onLayerToggle) {
                        callbacks.onLayerToggle(layerId, e.target.checked);
                    }
                });
            }
        });

        // 快速導航按鈕
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const locationName = btn.dataset.location;
                if (callbacks.onQuickNavigate) {
                    callbacks.onQuickNavigate(locationName);
                }
            });
        });

        // 行動版按鈕
        if (elements.mobileControlsBtn) {
            elements.mobileControlsBtn.addEventListener('click', () => {
                elements.controlPanel.classList.toggle('active');
            });
        }

        if (elements.mobileInfoBtn) {
            elements.mobileInfoBtn.addEventListener('click', () => {
                elements.infoPanel.classList.toggle('active');
            });
        }

        // 鍵盤快捷鍵
        document.addEventListener('keydown', handleKeyPress);
    }

    /**
     * 處理搜尋
     */
    async function performSearch(keyword) {
        if (!keyword || keyword.trim() === '') {
            hideSearchResults();
            return;
        }

        try {
            const results = await GlobeDataHandler.searchLocations(keyword);
            displaySearchResults(results);
        } catch (error) {
            console.error('搜尋失敗', error);
        }
    }

    /**
     * 顯示搜尋結果
     */
    function displaySearchResults(results) {
        if (!elements.searchResults) return;

        if (results.length === 0) {
            elements.searchResults.innerHTML = '<div class="search-result-item">找不到相符的地點</div>';
            elements.searchResults.classList.add('active');
            return;
        }

        let html = '';
        results.forEach(location => {
            const coords = GlobeDataHandler.formatCoordinates(location.latitude, location.longitude);
            html += `
                <div class="search-result-item" data-location-id="${location.id}">
                    <div class="result-name">${location.name} ${location.nameEn}</div>
                    <div class="result-info">${location.country} · ${coords.combined}</div>
                </div>
            `;
        });

        elements.searchResults.innerHTML = html;
        elements.searchResults.classList.add('active');

        // 綁定點擊事件
        elements.searchResults.querySelectorAll('.search-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const locationId = parseInt(item.dataset.locationId);
                if (callbacks.onLocationSelect) {
                    callbacks.onLocationSelect(locationId);
                }
                hideSearchResults();
                elements.locationSearch.value = '';
            });
        });
    }

    /**
     * 隱藏搜尋結果
     */
    function hideSearchResults() {
        if (elements.searchResults) {
            elements.searchResults.classList.remove('active');
        }
    }

    /**
     * 顯示地點資訊
     */
    function showLocationInfo(location) {
        if (!elements.infoPanelContent) return;

        const coords = GlobeDataHandler.formatCoordinates(location.latitude, location.longitude);
        const typeLabel = GlobeDataHandler.getTypeLabel(location.type);
        const population = location.population ? GlobeDataHandler.formatPopulation(location.population) : '資料未提供';

        const html = `
            <div class="location-info">
                <h2>${location.name}</h2>
                <p style="color: #b0b0b0; font-size: 16px; margin-bottom: 20px;">${location.nameEn}</p>
                
                <div class="info-item">
                    <div class="info-label">類型</div>
                    <div class="info-value">${typeLabel}</div>
                </div>
                
                <div class="info-item">
                    <div class="info-label">國家</div>
                    <div class="info-value">${location.country}</div>
                </div>
                
                <div class="info-item">
                    <div class="info-label">座標</div>
                    <div class="info-value">${coords.combined}</div>
                </div>
                
                ${location.population ? `
                <div class="info-item">
                    <div class="info-label">人口</div>
                    <div class="info-value">${population}</div>
                </div>
                ` : ''}
                
                ${location.timeZone ? `
                <div class="info-item">
                    <div class="info-label">時區</div>
                    <div class="info-value">${location.timeZone}</div>
                </div>
                ` : ''}
                
                ${location.description ? `
                <div class="info-item">
                    <div class="info-label">簡介</div>
                    <div class="info-description">${location.description}</div>
                </div>
                ` : ''}
            </div>
        `;

        elements.infoPanelContent.innerHTML = html;
        showInfoPanel();
    }

    /**
     * 顯示資訊面板
     */
    function showInfoPanel() {
        if (elements.infoPanel) {
            elements.infoPanel.classList.remove('collapsed');
            elements.infoPanel.classList.add('active');
        }
    }

    /**
     * 隱藏資訊面板
     */
    function hideInfoPanel() {
        if (elements.infoPanel) {
            elements.infoPanel.classList.add('collapsed');
            elements.infoPanel.classList.remove('active');
        }
    }

    /**
     * 更新縮放等級顯示
     */
    function updateZoomDisplay(zoom) {
        if (elements.zoomLevelDisplay) {
            elements.zoomLevelDisplay.textContent = `縮放: ${zoom.toFixed(1)}x`;
        }
    }

    /**
     * 更新座標顯示
     */
    function updateCoordinatesDisplay(latitude, longitude) {
        if (elements.cursorCoords) {
            const coords = GlobeDataHandler.formatCoordinates(latitude, longitude);
            elements.cursorCoords.textContent = `緯度: ${coords.latitude}, 經度: ${coords.longitude}`;
        }
    }

    /**
     * 顯示載入覆蓋層
     */
    function showLoading() {
        if (elements.loadingOverlay) {
            elements.loadingOverlay.style.display = 'flex';
        }
    }

    /**
     * 隱藏載入覆蓋層
     */
    function hideLoading() {
        if (elements.loadingOverlay) {
            elements.loadingOverlay.style.display = 'none';
        }
    }

    /**
     * 切換全螢幕
     */
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error('無法進入全螢幕模式', err);
            });
        } else {
            document.exitFullscreen();
        }
    }

    /**
     * 鍵盤快捷鍵處理
     */
    function handleKeyPress(event) {
        // 如果正在輸入,忽略快捷鍵
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
            return;
        }

        switch(event.key) {
            case ' ': // 空白鍵 - 切換自動旋轉
                event.preventDefault();
                if (elements.autoRotateToggle) {
                    elements.autoRotateToggle.checked = !elements.autoRotateToggle.checked;
                    elements.autoRotateToggle.dispatchEvent(new Event('change'));
                }
                break;
            case '+':
            case '=':
                event.preventDefault();
                if (callbacks.onZoomIn) callbacks.onZoomIn();
                break;
            case '-':
            case '_':
                event.preventDefault();
                if (callbacks.onZoomOut) callbacks.onZoomOut();
                break;
            case 'r':
            case 'R':
                event.preventDefault();
                if (callbacks.onResetView) callbacks.onResetView();
                break;
            case 'Escape':
                hideInfoPanel();
                hideSearchResults();
                break;
        }
    }

    /**
     * 初始化教學彈窗
     */
    function initTutorial() {
        const tutorialOverlay = document.getElementById('tutorial-overlay');
        const tutorialCloseBtn = document.getElementById('tutorial-close-btn');
        const dontShowAgain = document.getElementById('dont-show-again');

        // 檢查是否要顯示教學
        const hideТutorial = localStorage.getItem('hideTutorial');
        
        if (!hideТutorial && tutorialOverlay) {
            tutorialOverlay.style.display = 'flex';
        }

        if (tutorialCloseBtn) {
            tutorialCloseBtn.addEventListener('click', () => {
                if (dontShowAgain && dontShowAgain.checked) {
                    localStorage.setItem('hideTutorial', 'true');
                }
                if (tutorialOverlay) {
                    tutorialOverlay.style.display = 'none';
                }
            });
        }
    }

    // 公開 API
    return {
        init,
        showLocationInfo,
        hideInfoPanel,
        updateZoomDisplay,
        updateCoordinatesDisplay,
        showLoading,
        hideLoading,
        displaySearchResults,
        hideSearchResults
    };
})();

// 將模組掛載到全域物件
window.GlobeControls = GlobeControls;
