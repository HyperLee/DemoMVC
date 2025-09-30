// ===== 番茄鐘 JavaScript 核心功能 =====

// 全域狀態管理
const PomodoroApp = {
    // 計時器狀態
    timer: {
        interval: null,
        remainingSeconds: 0,
        totalSeconds: 0,
        isRunning: false,
        isPaused: false,
        currentSessionType: 'Work',
        currentSessionId: null,
        currentTaskId: null
    },
    
    // 設定
    settings: {
        workDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        pomodorosUntilLongBreak: 4,
        soundEnabled: true,
        volume: 0.5,
        autoStartNext: false
    },
    
    // 統計
    stats: {
        completedPomodoros: 0,
        currentCycle: 0
    },
    
    // 任務資料
    tasks: [],
    currentFilter: 'all',
    
    // 音效上下文
    audioContext: null,
    
    // 初始化
    async init() {
        console.log('番茄鐘應用程式初始化中...');
        
        // 初始化音效
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        
        // 載入設定和資料
        await this.loadSettings();
        await this.loadTasks();
        await this.loadStatistics();
        
        // 綁定事件
        this.bindEvents();
        
        // 更新 UI
        this.updateTimerDisplay();
        this.renderTasks();
        
        console.log('番茄鐘應用程式初始化完成');
    },
    
    // ===== 設定管理 =====
    async loadSettings() {
        try {
            const response = await fetch('/Pomodoro/GetSettings');
            const result = await response.json();
            
            if (result.success) {
                this.settings = result.data;
                this.updateSettingsUI();
            }
        } catch (error) {
            console.error('載入設定失敗:', error);
            this.showNotification('載入設定失敗', 'error');
        }
    },
    
    async saveSettings() {
        try {
            const response = await fetch('/Pomodoro/UpdateSettings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(this.settings)
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.showNotification('設定已儲存', 'success');
                // 關閉 modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('settingsModal'));
                if (modal) modal.hide();
            } else {
                this.showNotification('儲存設定失敗', 'error');
            }
        } catch (error) {
            console.error('儲存設定失敗:', error);
            this.showNotification('儲存設定失敗', 'error');
        }
    },
    
    updateSettingsUI() {
        document.getElementById('workDurationInput').value = this.settings.workDuration;
        document.getElementById('shortBreakInput').value = this.settings.shortBreakDuration;
        document.getElementById('longBreakInput').value = this.settings.longBreakDuration;
        document.getElementById('longBreakIntervalInput').value = this.settings.pomodorosUntilLongBreak;
        document.getElementById('soundEnabledInput').checked = this.settings.soundEnabled;
        document.getElementById('volumeInput').value = this.settings.volume * 100;
        document.getElementById('autoStartInput').checked = this.settings.autoStartNext;
    },
    
    // ===== 任務管理 =====
    async loadTasks() {
        try {
            const response = await fetch('/Pomodoro/GetTasks');
            const result = await response.json();
            
            if (result.success) {
                this.tasks = result.data;
                this.renderTasks();
            }
        } catch (error) {
            console.error('載入任務失敗:', error);
            this.showNotification('載入任務失敗', 'error');
        }
    },
    
    async createTask(taskName, estimatedPomodoros) {
        try {
            const response = await fetch('/Pomodoro/CreateTask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    taskName: taskName,
                    estimatedPomodoros: estimatedPomodoros
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.tasks.push(result.data);
                this.renderTasks();
                this.showNotification('任務已新增', 'success');
                
                // 清空輸入框
                document.getElementById('taskNameInput').value = '';
                document.getElementById('estimatedPomodorosInput').value = '1';
            } else {
                this.showNotification(result.message || '新增任務失敗', 'error');
            }
        } catch (error) {
            console.error('新增任務失敗:', error);
            this.showNotification('新增任務失敗', 'error');
        }
    },
    
    async deleteTask(taskId) {
        if (!confirm('確定要刪除此任務嗎？')) return;
        
        try {
            const response = await fetch('/Pomodoro/DeleteTask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ taskId: taskId })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.tasks = this.tasks.filter(t => t.id !== taskId);
                this.renderTasks();
                this.showNotification('任務已刪除', 'success');
            } else {
                this.showNotification(result.message || '刪除任務失敗', 'error');
            }
        } catch (error) {
            console.error('刪除任務失敗:', error);
            this.showNotification('刪除任務失敗', 'error');
        }
    },
    
    async completeTask(taskId) {
        try {
            const response = await fetch('/Pomodoro/CompleteTask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ taskId: taskId })
            });
            
            const result = await response.json();
            
            if (result.success) {
                const task = this.tasks.find(t => t.id === taskId);
                if (task) {
                    task.status = 'Completed';
                    task.completedAt = new Date().toISOString();
                }
                this.renderTasks();
                this.loadStatistics();
                this.showNotification('任務已完成！🎉', 'success');
            } else {
                this.showNotification(result.message || '完成任務失敗', 'error');
            }
        } catch (error) {
            console.error('完成任務失敗:', error);
            this.showNotification('完成任務失敗', 'error');
        }
    },
    
    startTaskSession(taskId) {
        const task = this.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        this.timer.currentTaskId = taskId;
        document.getElementById('currentTaskName').textContent = task.taskName;
        
        // 重設計時器為工作時間
        this.resetTimer('Work');
    },
    
    renderTasks() {
        const taskList = document.getElementById('taskList');
        
        // 過濾任務
        let filteredTasks = this.tasks;
        if (this.currentFilter !== 'all') {
            filteredTasks = this.tasks.filter(t => t.status === this.currentFilter);
        }
        
        // 排序：進行中 > 待處理 > 已完成
        filteredTasks.sort((a, b) => {
            const statusOrder = { 'InProgress': 0, 'Pending': 1, 'Completed': 2 };
            return statusOrder[a.status] - statusOrder[b.status];
        });
        
        if (filteredTasks.length === 0) {
            taskList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-clipboard-list"></i>
                    <p>目前沒有任務</p>
                </div>
            `;
            return;
        }
        
        taskList.innerHTML = filteredTasks.map(task => this.renderTaskItem(task)).join('');
    },
    
    renderTaskItem(task) {
        const statusMap = {
            'Pending': { label: '待處理', class: 'badge-pending' },
            'InProgress': { label: '進行中', class: 'badge-in-progress' },
            'Completed': { label: '已完成', class: 'badge-completed' }
        };
        
        const status = statusMap[task.status] || statusMap['Pending'];
        
        return `
            <div class="task-item status-${task.status.toLowerCase()}" data-task-id="${task.id}">
                <div class="task-info">
                    <div class="task-title">${this.escapeHtml(task.taskName)}</div>
                    <div class="task-meta">
                        <span class="task-badge ${status.class}">${status.label}</span>
                        <span>🍅 ${task.completedPomodoros} / ${task.estimatedPomodoros}</span>
                    </div>
                </div>
                <div class="task-actions">
                    ${task.status !== 'Completed' ? `
                        <button class="task-btn btn-start" onclick="PomodoroApp.startTaskSession('${task.id}')">
                            <i class="fas fa-play"></i> 開始
                        </button>
                        <button class="task-btn btn-complete" onclick="PomodoroApp.completeTask('${task.id}')">
                            <i class="fas fa-check"></i> 完成
                        </button>
                    ` : ''}
                    <button class="task-btn btn-delete" onclick="PomodoroApp.deleteTask('${task.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    },
    
    // ===== 計時器功能 =====
    startTimer() {
        if (this.timer.isRunning) return;
        
        // 如果沒有選擇任務，提示使用者
        if (!this.timer.currentTaskId) {
            this.showNotification('請先選擇一個任務', 'warning');
            return;
        }
        
        // 如果是新開始（不是暫停後繼續）
        if (!this.timer.isPaused) {
            this.startSession();
        }
        
        this.timer.isRunning = true;
        this.timer.isPaused = false;
        
        this.timer.interval = setInterval(() => {
            this.tick();
        }, 1000);
        
        this.updateControlButtons();
        document.getElementById('timerStatus').textContent = '專注中...';
    },
    
    pauseTimer() {
        if (!this.timer.isRunning) return;
        
        clearInterval(this.timer.interval);
        this.timer.isRunning = false;
        this.timer.isPaused = true;
        
        this.updateControlButtons();
        document.getElementById('timerStatus').textContent = '已暫停';
    },
    
    resetTimer(sessionType = null) {
        clearInterval(this.timer.interval);
        this.timer.isRunning = false;
        this.timer.isPaused = false;
        
        if (sessionType) {
            this.timer.currentSessionType = sessionType;
        }
        
        // 設定時間
        const duration = this.getSessionDuration(this.timer.currentSessionType);
        this.timer.totalSeconds = duration * 60;
        this.timer.remainingSeconds = this.timer.totalSeconds;
        
        this.updateTimerDisplay();
        this.updateSessionLabel();
        this.updateControlButtons();
        document.getElementById('timerStatus').textContent = '準備開始';
    },
    
    tick() {
        this.timer.remainingSeconds--;
        
        if (this.timer.remainingSeconds <= 0) {
            this.timerComplete();
        }
        
        this.updateTimerDisplay();
    },
    
    async timerComplete() {
        clearInterval(this.timer.interval);
        this.timer.isRunning = false;
        
        // 結束工作階段
        await this.endSession(false);
        
        // 播放音效
        this.playSound();
        
        // 顯示通知
        this.showNotification(
            this.timer.currentSessionType === 'Work' ? 
            '工作時間結束！休息一下吧 ☕' : 
            '休息時間結束！準備開始工作 💪', 
            'success'
        );
        
        // 更新統計
        if (this.timer.currentSessionType === 'Work') {
            this.stats.completedPomodoros++;
            this.stats.currentCycle++;
            await this.loadStatistics();
        }
        
        // 決定下一個階段
        let nextSessionType;
        if (this.timer.currentSessionType === 'Work') {
            if (this.stats.currentCycle >= this.settings.pomodorosUntilLongBreak) {
                nextSessionType = 'LongBreak';
                this.stats.currentCycle = 0;
            } else {
                nextSessionType = 'ShortBreak';
            }
        } else {
            nextSessionType = 'Work';
        }
        
        this.updateCycleDisplay();
        
        // 重設計時器
        this.resetTimer(nextSessionType);
        
        // 自動開始下一階段
        if (this.settings.autoStartNext) {
            setTimeout(() => this.startTimer(), 2000);
        }
    },
    
    async startSession() {
        try {
            const response = await fetch('/Pomodoro/StartSession', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    taskId: this.timer.currentTaskId,
                    sessionType: this.timer.currentSessionType
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                this.timer.currentSessionId = result.data.id;
                console.log('工作階段已開始:', result.data);
            }
        } catch (error) {
            console.error('開始工作階段失敗:', error);
        }
    },
    
    async endSession(wasInterrupted) {
        if (!this.timer.currentSessionId) return;
        
        try {
            const response = await fetch('/Pomodoro/EndSession', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sessionId: this.timer.currentSessionId,
                    wasInterrupted: wasInterrupted
                })
            });
            
            const result = await response.json();
            
            if (result.success) {
                console.log('工作階段已結束');
                this.timer.currentSessionId = null;
                
                // 重新載入任務以更新番茄數
                await this.loadTasks();
            }
        } catch (error) {
            console.error('結束工作階段失敗:', error);
        }
    },
    
    getSessionDuration(sessionType) {
        switch (sessionType) {
            case 'Work':
                return this.settings.workDuration;
            case 'ShortBreak':
                return this.settings.shortBreakDuration;
            case 'LongBreak':
                return this.settings.longBreakDuration;
            default:
                return this.settings.workDuration;
        }
    },
    
    updateTimerDisplay() {
        const minutes = Math.floor(this.timer.remainingSeconds / 60);
        const seconds = this.timer.remainingSeconds % 60;
        const display = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        document.getElementById('timerDisplay').textContent = display;
        document.title = `${display} - 番茄鐘`;
        
        // 更新進度環
        const progress = (this.timer.totalSeconds - this.timer.remainingSeconds) / this.timer.totalSeconds;
        const circumference = 2 * Math.PI * 90; // radius = 90
        const offset = circumference * (1 - progress);
        
        const progressCircle = document.getElementById('timerProgress');
        if (progressCircle) {
            progressCircle.style.strokeDashoffset = offset;
        }
    },
    
    updateSessionLabel() {
        const label = document.getElementById('sessionTypeLabel');
        const labelMap = {
            'Work': { text: '工作中', class: 'work' },
            'ShortBreak': { text: '短休息', class: 'short-break' },
            'LongBreak': { text: '長休息', class: 'long-break' }
        };
        
        const session = labelMap[this.timer.currentSessionType] || labelMap['Work'];
        label.textContent = session.text;
        label.className = 'session-type-label ' + session.class;
    },
    
    updateControlButtons() {
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        
        if (this.timer.isRunning) {
            startBtn.disabled = true;
            pauseBtn.disabled = false;
        } else {
            startBtn.disabled = false;
            pauseBtn.disabled = true;
        }
    },
    
    updateCycleDisplay() {
        document.getElementById('currentCycle').textContent = 
            `${this.stats.currentCycle} / ${this.settings.pomodorosUntilLongBreak}`;
    },
    
    // ===== 統計資訊 =====
    async loadStatistics() {
        try {
            const response = await fetch('/Pomodoro/GetStatistics?period=today');
            const result = await response.json();
            
            if (result.success) {
                document.getElementById('todayPomodoros').textContent = result.data.todayPomodoros;
                document.getElementById('todayTasks').textContent = result.data.todayCompletedTasks;
                document.getElementById('weekPomodoros').textContent = result.data.weekPomodoros;
            }
        } catch (error) {
            console.error('載入統計資料失敗:', error);
        }
    },
    
    // ===== 音效功能 =====
    playSound() {
        if (!this.settings.soundEnabled || !this.audioContext) return;
        
        // 使用 Web Audio API 產生簡單的提示音
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(this.settings.volume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 0.5);
    },
    
    // ===== 事件綁定 =====
    bindEvents() {
        // 計時器控制
        document.getElementById('startBtn').addEventListener('click', () => this.startTimer());
        document.getElementById('pauseBtn').addEventListener('click', () => this.pauseTimer());
        document.getElementById('resetBtn').addEventListener('click', () => this.resetTimer());
        
        // 任務管理
        document.getElementById('addTaskBtn').addEventListener('click', () => {
            const taskName = document.getElementById('taskNameInput').value.trim();
            const estimatedPomodoros = parseInt(document.getElementById('estimatedPomodorosInput').value) || 1;
            
            if (taskName) {
                this.createTask(taskName, estimatedPomodoros);
            } else {
                this.showNotification('請輸入任務名稱', 'warning');
            }
        });
        
        // Enter 鍵新增任務
        document.getElementById('taskNameInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                document.getElementById('addTaskBtn').click();
            }
        });
        
        // 任務過濾
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentFilter = e.target.dataset.filter;
                this.renderTasks();
            });
        });
        
        // 設定按鈕
        document.getElementById('settingsBtn').addEventListener('click', () => {
            const modal = new bootstrap.Modal(document.getElementById('settingsModal'));
            modal.show();
        });
        
        // 儲存設定
        document.getElementById('saveSettingsBtn').addEventListener('click', () => {
            this.settings.workDuration = parseInt(document.getElementById('workDurationInput').value);
            this.settings.shortBreakDuration = parseInt(document.getElementById('shortBreakInput').value);
            this.settings.longBreakDuration = parseInt(document.getElementById('longBreakInput').value);
            this.settings.pomodorosUntilLongBreak = parseInt(document.getElementById('longBreakIntervalInput').value);
            this.settings.soundEnabled = document.getElementById('soundEnabledInput').checked;
            this.settings.volume = parseFloat(document.getElementById('volumeInput').value) / 100;
            this.settings.autoStartNext = document.getElementById('autoStartInput').checked;
            
            this.saveSettings();
        });
    },
    
    // ===== 工具函式 =====
    showNotification(message, type = 'info') {
        // 簡單的通知實作（可以使用 toast 套件改進）
        alert(message);
    },
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// 當 DOM 載入完成後初始化
document.addEventListener('DOMContentLoaded', () => {
    PomodoroApp.init();
});
