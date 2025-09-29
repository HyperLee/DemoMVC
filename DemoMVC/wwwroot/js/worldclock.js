/**
 * 世界時鐘管理器
 * 負責管理全球時區顯示、時間更新和使用者互動
 * 
 * @author DemoMVC Team
 * @version 1.0.0
 */
class WorldClockManager {
    /**
     * 建構函式
     * @param {Array} cities - 城市資料陣列
     * @param {string} defaultCity - 預設主要顯示城市
     */
    constructor(cities = [], defaultCity = '台北') {
        this.cities = cities;
        this.currentMainCity = defaultCity;
        this.updateTimer = null;
        this.isInitialized = false;
        this.taipeiTimezone = 'Asia/Taipei'; // 台北時區作為時差計算基準
        
        // 綁定方法的 this 上下文
        this.handleCityCardClick = this.handleCityCardClick.bind(this);
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.updateAllClocks = this.updateAllClocks.bind(this);
        
        // 初始化世界時鐘
        this.init();
    }

    /**
     * 初始化世界時鐘系統
     */
    async init() {
        try {
            console.log('開始初始化世界時鐘...');
            
            // 顯示載入畫面
            this.showLoadingOverlay();
            
            // 驗證城市資料
            if (!this.cities || this.cities.length === 0) {
                await this.loadCityDataFromServer();
            }
            
            // 設定主要城市的時區資訊
            this.setMainCityTimezone();
            
            // 渲染時鐘介面
            this.renderClocks();
            
            // 綁定事件處理器
            this.bindEvents();
            
            // 開始定時更新
            this.startTimer();
            
            // 標記為已初始化
            this.isInitialized = true;
            
            // 隱藏載入畫面
            this.hideLoadingOverlay();
            
            console.log('世界時鐘初始化完成');
            
        } catch (error) {
            console.error('初始化世界時鐘時發生錯誤:', error);
            this.showErrorMessage('初始化失敗，請重新整理頁面重試。');
            this.hideLoadingOverlay();
        }
    }

    /**
     * 從伺服器載入城市資料
     */
    async loadCityDataFromServer() {
        try {
            const response = await fetch('/WorldClock/GetTimeZones');
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.message || '伺服器回傳錯誤');
            }
            
            this.cities = Array.isArray(data) ? data : [];
            console.log(`成功載入 ${this.cities.length} 個城市資料`);
            
        } catch (error) {
            console.error('載入城市資料失敗:', error);
            throw new Error('無法從伺服器載入城市資料');
        }
    }

    /**
     * 設定主要城市的時區資訊
     */
    setMainCityTimezone() {
        const mainCityData = this.cities.find(city => city.name === this.currentMainCity);
        
        if (mainCityData) {
            const mainClockCard = document.querySelector('.main-clock-card');
            if (mainClockCard) {
                mainClockCard.setAttribute('data-timezone', mainCityData.timeZone);
                mainClockCard.setAttribute('data-city', mainCityData.name);
            }
        }
    }

    /**
     * 根據時區取得當前時間
     * @param {string} timezone - IANA 時區識別碼
     * @returns {string} 格式化的時間字串 (HH:mm:ss)
     */
    getCurrentTimeByTimezone(timezone) {
        try {
            return new Intl.DateTimeFormat('zh-TW', {
                timeZone: timezone,
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            }).format(new Date());
        } catch (error) {
            console.error(`取得時區 ${timezone} 的時間失敗:`, error);
            return '--:--:--';
        }
    }

    /**
     * 根據時區取得當前日期
     * @param {string} timezone - IANA 時區識別碼
     * @returns {string} 格式化的日期字串 (YYYY/MM/DD)
     */
    getCurrentDateByTimezone(timezone) {
        try {
            return new Intl.DateTimeFormat('zh-TW', {
                timeZone: timezone,
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            }).format(new Date()).replace(/\//g, '/');
        } catch (error) {
            console.error(`取得時區 ${timezone} 的日期失敗:`, error);
            return '----/--/--';
        }
    }

    /**
     * 計算與台北的時差
     * @param {string} timezone - 目標時區
     * @returns {string} 時差字串
     */
    calculateTimeDifference(timezone) {
        try {
            const now = new Date();
            const taipeiTime = new Date(now.toLocaleString('en-US', { timeZone: this.taipeiTimezone }));
            const targetTime = new Date(now.toLocaleString('en-US', { timeZone: timezone }));
            
            const diffMs = targetTime.getTime() - taipeiTime.getTime();
            const diffHours = Math.round(diffMs / (1000 * 60 * 60));
            
            if (diffHours === 0) {
                return '相同';
            } else if (diffHours > 0) {
                return `+${diffHours}小時`;
            } else {
                return `${diffHours}小時`;
            }
        } catch (error) {
            console.error('計算時差失敗:', error);
            return '--';
        }
    }

    /**
     * 更新所有時鐘顯示
     */
    updateAllClocks() {
        if (!this.isInitialized) return;

        try {
            // 更新主要時鐘
            this.updateMainClock();
            
            // 更新城市時鐘卡片
            this.updateCityCards();
            
            // 更新頁面底部日期
            this.updateFooterDate();
            
        } catch (error) {
            console.error('更新時鐘顯示時發生錯誤:', error);
        }
    }

    /**
     * 更新主要時鐘顯示
     */
    updateMainClock() {
        const mainClockCard = document.querySelector('.main-clock-card');
        if (!mainClockCard) return;

        const timezone = mainClockCard.getAttribute('data-timezone');
        if (!timezone) return;

        // 更新時間
        const timeElement = mainClockCard.querySelector('.main-time-display');
        if (timeElement) {
            timeElement.textContent = this.getCurrentTimeByTimezone(timezone);
        }

        // 更新日期
        const dateElement = mainClockCard.querySelector('.main-date-display');
        if (dateElement) {
            dateElement.textContent = this.getCurrentDateByTimezone(timezone);
        }

        // 更新時區資訊
        const timezoneElement = mainClockCard.querySelector('.main-timezone-info');
        if (timezoneElement) {
            const cityData = this.cities.find(city => city.timeZone === timezone);
            if (cityData) {
                timezoneElement.textContent = cityData.timeZoneAbbreviation || cityData.utcOffset;
            }
        }
    }

    /**
     * 更新城市卡片顯示
     */
    updateCityCards() {
        this.cities.forEach(city => {
            const cityCard = document.querySelector(`[data-city="${city.name}"]`);
            if (!cityCard || cityCard.classList.contains('main-clock-card')) return;

            // 更新時間
            const timeElement = cityCard.querySelector('.time');
            if (timeElement) {
                timeElement.textContent = this.getCurrentTimeByTimezone(city.timeZone);
            }

            // 更新日期
            const dateElement = cityCard.querySelector('.date');
            if (dateElement) {
                dateElement.textContent = this.getCurrentDateByTimezone(city.timeZone);
            }

            // 更新時差
            const diffElement = cityCard.querySelector('.diff-value');
            if (diffElement) {
                diffElement.textContent = this.calculateTimeDifference(city.timeZone);
            }
        });
    }

    /**
     * 更新頁面底部日期顯示
     */
    updateFooterDate() {
        const dateElement = document.querySelector('#current-date');
        if (dateElement) {
            const mainCityTimezone = document.querySelector('.main-clock-card')?.getAttribute('data-timezone') || this.taipeiTimezone;
            dateElement.textContent = this.getCurrentDateByTimezone(mainCityTimezone);
        }
    }

    /**
     * 切換主要時鐘顯示
     * @param {string} cityName - 要切換的城市名稱
     */
    switchMainClock(cityName) {
        if (!cityName || cityName === this.currentMainCity) return;

        console.log(`切換主要時鐘至: ${cityName}`);

        try {
            const targetCity = this.cities.find(city => city.name === cityName);
            if (!targetCity) {
                console.warn(`找不到城市: ${cityName}`);
                return;
            }

            // 更新當前主要城市
            const previousMainCity = this.currentMainCity;
            this.currentMainCity = cityName;

            // 更新主要時鐘卡片的資訊
            const mainClockCard = document.querySelector('.main-clock-card');
            if (mainClockCard) {
                // 更新屬性
                mainClockCard.setAttribute('data-city', targetCity.name);
                mainClockCard.setAttribute('data-timezone', targetCity.timeZone);

                // 更新城市名稱
                const cityNameElement = mainClockCard.querySelector('.main-city-name');
                if (cityNameElement) {
                    cityNameElement.textContent = targetCity.name;
                }

                // 添加切換動畫效果
                mainClockCard.classList.add('switching');
                setTimeout(() => {
                    mainClockCard.classList.remove('switching');
                }, 300);
            }

            // 重新渲染城市網格 (排除新的主要城市)
            this.renderCityGrid();

            // 立即更新時間顯示
            this.updateAllClocks();

            // 更新 URL (但不重新載入頁面)
            this.updateUrlWithMainCity(cityName);

            console.log(`成功切換主要時鐘至: ${cityName}`);

        } catch (error) {
            console.error('切換主要時鐘失敗:', error);
            
            // 恢復到之前的狀態
            this.currentMainCity = previousMainCity;
        }
    }

    /**
     * 重新渲染城市網格
     */
    renderCityGrid() {
        const gridContainer = document.querySelector('.city-clocks-grid');
        if (!gridContainer) return;

        // 清空現有內容
        gridContainer.innerHTML = '';

        // 渲染除了主要城市以外的所有城市
        this.cities
            .filter(city => city.name !== this.currentMainCity)
            .forEach(city => {
                const cityCard = this.createCityCard(city);
                gridContainer.appendChild(cityCard);
            });
    }

    /**
     * 建立城市卡片元素
     * @param {Object} city - 城市資料
     * @returns {HTMLElement} 城市卡片元素
     */
    createCityCard(city) {
        const cardElement = document.createElement('div');
        cardElement.className = 'city-card';
        cardElement.setAttribute('data-city', city.name);
        cardElement.setAttribute('data-timezone', city.timeZone);
        cardElement.setAttribute('data-utc-offset', city.utcOffset);
        cardElement.setAttribute('role', 'button');
        cardElement.setAttribute('tabindex', '0');
        cardElement.setAttribute('aria-label', `切換到 ${city.name} 時間`);

        cardElement.innerHTML = `
            <div class="city-header">
                <h5 class="city-name">
                    ${city.countryCode ? `<span class="country-flag" data-country="${city.countryCode.toLowerCase()}"></span>` : ''}
                    ${city.name}
                </h5>
                <small class="timezone-offset">${city.timeZoneAbbreviation || city.utcOffset}</small>
            </div>
            <div class="time-display-container">
                <div class="time-display">
                    <span class="time">--:--:--</span>
                </div>
                <div class="date-display">
                    <small class="date">----/--/--</small>
                </div>
            </div>
            ${city.isDaylightSaving ? `
                <div class="dst-indicator">
                    <small class="dst-badge">
                        <i class="bi bi-sun"></i>
                        夏令時間
                    </small>
                </div>
            ` : ''}
            <div class="time-diff">
                <small class="time-diff-text">與台北時差：<span class="diff-value">--</span></small>
            </div>
            <div class="click-overlay">
                <div class="click-ripple"></div>
            </div>
        `;

        return cardElement;
    }

    /**
     * 渲染時鐘界面
     */
    renderClocks() {
        // 主要時鐘已經在 HTML 中，只需要渲染城市網格
        this.renderCityGrid();
        
        // 立即更新一次時間顯示
        this.updateAllClocks();
    }

    /**
     * 綁定事件處理器
     */
    bindEvents() {
        // 城市卡片點選事件 (使用事件委派)
        document.addEventListener('click', this.handleCityCardClick);
        
        // 鍵盤導覽支援
        document.addEventListener('keydown', this.handleKeyDown);
        
        // 頁面可見性變化時的處理 (優化效能)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopTimer();
            } else {
                this.startTimer();
                this.updateAllClocks(); // 立即更新一次
            }
        });

        // 視窗焦點變化處理
        window.addEventListener('focus', () => {
            this.updateAllClocks(); // 重新獲得焦點時立即更新
        });
    }

    /**
     * 處理城市卡片點選事件
     * @param {Event} event - 點選事件
     */
    handleCityCardClick(event) {
        const cityCard = event.target.closest('.city-card');
        
        if (!cityCard) return;

        const cityName = cityCard.getAttribute('data-city');
        if (cityName) {
            // 添加點選效果
            this.addClickEffect(cityCard, event);
            
            // 切換主要時鐘
            this.switchMainClock(cityName);
        }
    }

    /**
     * 處理鍵盤事件 (無障礙功能)
     * @param {KeyboardEvent} event - 鍵盤事件
     */
    handleKeyDown(event) {
        const cityCard = event.target.closest('.city-card');
        
        if (!cityCard) return;

        // Enter 或 Space 鍵觸發點選
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            const cityName = cityCard.getAttribute('data-city');
            if (cityName) {
                this.switchMainClock(cityName);
            }
        }
    }

    /**
     * 添加點選效果動畫
     * @param {HTMLElement} element - 目標元素
     * @param {Event} event - 點選事件
     */
    addClickEffect(element, event) {
        const ripple = element.querySelector('.click-ripple');
        if (!ripple) return;

        // 計算點選位置
        const rect = element.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // 設定漣漪效果位置
        ripple.style.left = `${x}px`;
        ripple.style.top = `${y}px`;

        // 重置動畫
        ripple.style.transform = 'scale(0)';
        
        // 觸發動畫
        requestAnimationFrame(() => {
            ripple.style.transform = 'scale(4)';
        });
    }

    /**
     * 開始定時更新
     */
    startTimer() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
        }

        // 每秒更新一次
        this.updateTimer = setInterval(() => {
            this.updateAllClocks();
        }, 1000);

        console.log('時鐘定時更新已啟動');
    }

    /**
     * 停止定時更新
     */
    stopTimer() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
            console.log('時鐘定時更新已停止');
        }
    }

    /**
     * 更新 URL 參數
     * @param {string} cityName - 主要城市名稱
     */
    updateUrlWithMainCity(cityName) {
        try {
            const url = new URL(window.location);
            url.searchParams.set('main', encodeURIComponent(cityName));
            history.replaceState(null, null, url.toString());
        } catch (error) {
            console.error('更新 URL 失敗:', error);
        }
    }

    /**
     * 顯示載入覆蓋層
     */
    showLoadingOverlay() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.remove('hide');
        }
    }

    /**
     * 隱藏載入覆蓋層
     */
    hideLoadingOverlay() {
        const overlay = document.getElementById('loading-overlay');
        if (overlay) {
            overlay.classList.add('hide');
            
            // 動畫完成後完全隱藏
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 300);
        }
    }

    /**
     * 顯示錯誤訊息
     * @param {string} message - 錯誤訊息
     */
    showErrorMessage(message) {
        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            errorElement.querySelector('p').textContent = message;
            errorElement.classList.remove('d-none');
            
            // 5 秒後自動隱藏
            setTimeout(() => {
                this.hideErrorMessage();
            }, 5000);
        }
    }

    /**
     * 隱藏錯誤訊息
     */
    hideErrorMessage() {
        const errorElement = document.getElementById('error-message');
        if (errorElement) {
            errorElement.classList.add('d-none');
        }
    }

    /**
     * 清理資源 (頁面離開時呼叫)
     */
    cleanup() {
        console.log('清理世界時鐘資源...');
        
        // 停止定時器
        this.stopTimer();
        
        // 移除事件監聽器
        document.removeEventListener('click', this.handleCityCardClick);
        document.removeEventListener('keydown', this.handleKeyDown);
        
        // 重置狀態
        this.isInitialized = false;
        
        console.log('資源清理完成');
    }
}

// 頁面離開時清理資源
window.addEventListener('beforeunload', () => {
    if (window.worldClockManager) {
        window.worldClockManager.cleanup();
    }
});

// 匯出類別 (如果使用模組系統)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WorldClockManager;
}
