// Please see documentation at https://learn.microsoft.com/aspnet/core/client-side/bundling-and-minification
// for details on configuring this project to bundle and minify static web assets.

/**
 * 數位電子鐘功能模組
 * 提供即時時間顯示和視覺效果
 */
class DigitalClock {
    constructor(elementId) {
        this.clockElement = document.getElementById(elementId);
        this.intervalId = null;
        this.colorIndex = 0;
        this.colors = [
            'linear-gradient(45deg, #ff0080, #ff8c00, #40e0d0)',
            'linear-gradient(45deg, #8a2be2, #00ff7f, #ffd700)',
            'linear-gradient(45deg, #ff1493, #00bfff, #ffff00)',
            'linear-gradient(45deg, #ff4500, #9370db, #00fa9a)',
            'linear-gradient(45deg, #dc143c, #00ced1, #ffa500)'
        ];
        
        if (!this.clockElement) {
            console.error('找不到電子鐘元素:', elementId);
            return;
        }
        
        this.init();
    }
    
    /**
     * 初始化電子鐘
     */
    init() {
        try {
            this.updateTime();
            this.startClock();
            console.log('電子鐘已啟動');
        } catch (error) {
            console.error('電子鐘初始化失敗:', error);
        }
    }
    
    /**
     * 格式化時間為 HH:mm:ss 格式
     * @returns {string} 格式化後的時間字串
     */
    formatTime() {
        const now = new Date();
        
        // 確保使用台灣時區 (UTC+8)
        const taiwanTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Taipei"}));
        
        const hours = taiwanTime.getHours().toString().padStart(2, '0');
        const minutes = taiwanTime.getMinutes().toString().padStart(2, '0');
        const seconds = taiwanTime.getSeconds().toString().padStart(2, '0');
        
        return `${hours}:${minutes}:${seconds}`;
    }
    
    /**
     * 更新時間顯示
     */
    updateTime() {
        if (!this.clockElement) return;
        
        try {
            const timeString = this.formatTime();
            this.clockElement.textContent = timeString;
            
            // 更新 datetime 屬性用於無障礙功能
            const now = new Date();
            this.clockElement.setAttribute('datetime', now.toISOString());
            
            // 每5秒變更一次顏色
            if (Date.now() % 5000 < 1000) {
                this.updateColor();
            }
            
        } catch (error) {
            console.error('更新時間失敗:', error);
            this.clockElement.textContent = 'ERROR';
        }
    }
    
    /**
     * 更新漸層顏色
     */
    updateColor() {
        if (!this.clockElement) return;
        
        this.colorIndex = (this.colorIndex + 1) % this.colors.length;
        const newColor = this.colors[this.colorIndex];
        this.clockElement.style.background = newColor;
        this.clockElement.style.webkitBackgroundClip = 'text';
        this.clockElement.style.backgroundClip = 'text';
    }
    
    /**
     * 啟動電子鐘計時器
     */
    startClock() {
        // 清除任何現有的計時器
        this.stopClock();
        
        // 每秒更新一次
        this.intervalId = setInterval(() => {
            this.updateTime();
        }, 1000);
    }
    
    /**
     * 停止電子鐘計時器
     */
    stopClock() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
    
    /**
     * 銷毀電子鐘實例
     */
    destroy() {
        this.stopClock();
        this.clockElement = null;
    }
}

/**
 * 全域電子鐘實例
 */
let globalDigitalClock = null;

/**
 * 當 DOM 載入完成時初始化電子鐘
 */
document.addEventListener('DOMContentLoaded', function() {
    try {
        // 初始化電子鐘
        globalDigitalClock = new DigitalClock('digitalClock');
        
        // 視窗失焦時暫停，重新獲得焦點時恢復 (節能考量)
        document.addEventListener('visibilitychange', function() {
            if (globalDigitalClock) {
                if (document.hidden) {
                    globalDigitalClock.stopClock();
                } else {
                    globalDigitalClock.startClock();
                }
            }
        });
        
    } catch (error) {
        console.error('電子鐘模組載入失敗:', error);
    }
});

/**
 * 頁面卸載時清理資源
 */
window.addEventListener('beforeunload', function() {
    if (globalDigitalClock) {
        globalDigitalClock.destroy();
    }
});
