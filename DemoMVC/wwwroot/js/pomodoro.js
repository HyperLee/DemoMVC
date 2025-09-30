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
        console.log('========================================');
        console.log('🍅 番茄鐘應用程式初始化開始');
        console.log('時間:', new Date().toLocaleString());
        console.log('========================================');
        
        try {
            // 初始化音效
            console.log('✓ 正在初始化音效系統...');
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            console.log('✓ 音效系統初始化完成');
            
            // ⚠️ 重要：先綁定事件，確保按鈕可以使用
            console.log('✓ 優先綁定事件（確保 UI 可互動）...');
            this.bindEvents();
            
            // 更新 UI
            console.log('✓ 正在更新 UI...');
            this.updateTimerDisplay();
            
            // 非同步載入資料（不阻塞 UI）
            console.log('✓ 開始非同步載入資料...');
            
            // 使用 Promise.allSettled 確保即使某些 API 失敗也不會中斷
            const results = await Promise.allSettled([
                this.loadSettings(),
                this.loadTasks(),
                this.loadStatistics()
            ]);
            
            // 檢查結果
            results.forEach((result, index) => {
                const names = ['loadSettings', 'loadTasks', 'loadStatistics'];
                if (result.status === 'fulfilled') {
                    console.log(`✓ ${names[index]} 完成`);
                } else {
                    console.warn(`⚠️ ${names[index]} 失敗:`, result.reason);
                }
            });
            
            console.log('========================================');
            console.log('✅ 番茄鐘應用程式初始化完成');
            console.log('========================================');
        } catch (error) {
            console.error('❌ 初始化過程中發生錯誤:', error);
            console.error('錯誤堆疊:', error.stack);
            console.log('⚠️ 即使發生錯誤，事件綁定應該已完成，UI 應可使用');
        }
    },
    
    // ===== 設定管理 =====
    async loadSettings() {
        console.log('→ loadSettings() 開始');
        try {
            // 設定 5 秒 timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch('/Pomodoro/GetSettings', {
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            
            console.log('  API 回應狀態:', response.status);
            const result = await response.json();
            console.log('  API 回應結果:', result);
            
            if (result.success) {
                this.settings = result.data;
                this.updateSettingsUI();
                console.log('✓ loadSettings() 完成');
            } else {
                console.warn('⚠️ 載入設定失敗，使用預設值');
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.error('❌ loadSettings() 請求超時（5秒）');
            } else {
                console.error('❌ loadSettings() 錯誤:', error);
            }
            console.log('使用預設設定值');
            // 不要中斷初始化，使用預設值
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
        console.log('→ updateSettingsUI() 開始');
        try {
            const workDurationInput = document.getElementById('workDurationInput');
            const shortBreakInput = document.getElementById('shortBreakInput');
            const longBreakInput = document.getElementById('longBreakInput');
            const longBreakIntervalInput = document.getElementById('longBreakIntervalInput');
            const soundEnabledInput = document.getElementById('soundEnabledInput');
            const volumeInput = document.getElementById('volumeInput');
            const autoStartInput = document.getElementById('autoStartInput');
            
            if (workDurationInput) workDurationInput.value = this.settings.workDuration;
            if (shortBreakInput) shortBreakInput.value = this.settings.shortBreakDuration;
            if (longBreakInput) longBreakInput.value = this.settings.longBreakDuration;
            if (longBreakIntervalInput) longBreakIntervalInput.value = this.settings.pomodorosUntilLongBreak;
            if (soundEnabledInput) soundEnabledInput.checked = this.settings.soundEnabled;
            if (volumeInput) volumeInput.value = this.settings.volume * 100;
            if (autoStartInput) autoStartInput.checked = this.settings.autoStartNext;
            
            console.log('✓ updateSettingsUI() 完成');
        } catch (error) {
            console.error('❌ updateSettingsUI() 錯誤:', error);
        }
    },
    
    // ===== 任務管理 =====
    async loadTasks() {
        console.log('→ loadTasks() 開始');
        try {
            // 設定 5 秒 timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch('/Pomodoro/GetTasks', {
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            
            console.log('  API 回應狀態:', response.status);
            const result = await response.json();
            console.log('  API 回應結果:', result);
            
            if (result.success) {
                this.tasks = result.data;
                this.renderTasks();
                console.log('✓ loadTasks() 完成，任務數量:', this.tasks.length);
            } else {
                console.warn('⚠️ 載入任務失敗');
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.error('❌ loadTasks() 請求超時（5秒）');
            } else {
                console.error('❌ loadTasks() 錯誤:', error);
            }
            // 不要中斷初始化
            this.tasks = [];
            this.renderTasks();
        }
    },
    
    async createTask(taskName, estimatedPomodoros) {
        console.log('========================================');
        console.log('📝 createTask() 被呼叫');
        console.log('參數:');
        console.log('  - taskName:', taskName);
        console.log('  - estimatedPomodoros:', estimatedPomodoros);
        console.log('========================================');
        
        try {
            console.log('🌐 準備發送 API 請求到 /Pomodoro/CreateTask');
            const requestBody = {
                taskName: taskName,
                estimatedPomodoros: estimatedPomodoros
            };
            console.log('📦 請求內容:', JSON.stringify(requestBody, null, 2));
            
            const response = await fetch('/Pomodoro/CreateTask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });
            
            console.log('📡 收到回應:');
            console.log('  - Status:', response.status);
            console.log('  - StatusText:', response.statusText);
            console.log('  - OK:', response.ok);
            
            const result = await response.json();
            console.log('📦 回應內容:', result);
            
            if (result.success) {
                console.log('✅ 任務新增成功！');
                console.log('新增的任務:', result.data);
                
                this.tasks.push(result.data);
                this.renderTasks();
                this.showNotification('任務已新增', 'success');
                
                // 清空輸入框
                document.getElementById('taskNameInput').value = '';
                document.getElementById('estimatedPomodorosInput').value = '1';
                console.log('✓ 輸入框已清空');
            } else {
                console.error('❌ 任務新增失敗:', result.message);
                this.showNotification(result.message || '新增任務失敗', 'error');
            }
        } catch (error) {
            console.error('========================================');
            console.error('❌ createTask() 發生錯誤');
            console.error('錯誤訊息:', error.message);
            console.error('錯誤堆疊:', error.stack);
            console.error('========================================');
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
                    task.status = 2; // 2 = Completed enum 值
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
        
        // Status 轉換函式
        const statusEnumToString = {
            0: 'Pending',
            1: 'InProgress',
            2: 'Completed'
        };
        
        const getStatusString = (status) => {
            return typeof status === 'number' ? statusEnumToString[status] : status;
        };
        
        // 過濾任務
        let filteredTasks = this.tasks;
        if (this.currentFilter !== 'all') {
            filteredTasks = this.tasks.filter(t => getStatusString(t.status) === this.currentFilter);
        }
        
        // 排序：進行中 > 待處理 > 已完成
        filteredTasks.sort((a, b) => {
            const statusOrder = { 'InProgress': 0, 'Pending': 1, 'Completed': 2 };
            const statusA = getStatusString(a.status);
            const statusB = getStatusString(b.status);
            return statusOrder[statusA] - statusOrder[statusB];
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
        // 處理 status：可能是字串或數字（enum）
        // 0 = Pending, 1 = InProgress, 2 = Completed
        const statusEnumToString = {
            0: 'Pending',
            1: 'InProgress',
            2: 'Completed'
        };
        
        const statusString = typeof task.status === 'number' 
            ? statusEnumToString[task.status] 
            : task.status;
        
        const statusMap = {
            'Pending': { label: '待處理', class: 'badge-pending' },
            'InProgress': { label: '進行中', class: 'badge-in-progress' },
            'Completed': { label: '已完成', class: 'badge-completed' }
        };
        
        const status = statusMap[statusString] || statusMap['Pending'];
        
        return `
            <div class="task-item status-${statusString.toLowerCase()}" data-task-id="${task.id}">
                <div class="task-info">
                    <div class="task-title">${this.escapeHtml(task.taskName)}</div>
                    <div class="task-meta">
                        <span class="task-badge ${status.class}">${status.label}</span>
                        <span>🍅 ${task.completedPomodoros} / ${task.estimatedPomodoros}</span>
                    </div>
                </div>
                <div class="task-actions">
                    ${statusString !== 'Completed' ? `
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
        console.log('→ loadStatistics() 開始');
        try {
            // 設定 5 秒 timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            
            const response = await fetch('/Pomodoro/GetStatistics?period=today', {
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            
            console.log('  API 回應狀態:', response.status);
            const result = await response.json();
            console.log('  API 回應結果:', result);
            
            if (result.success) {
                document.getElementById('todayPomodoros').textContent = result.data.todayPomodoros;
                document.getElementById('todayTasks').textContent = result.data.todayCompletedTasks;
                document.getElementById('weekPomodoros').textContent = result.data.weekPomodoros;
                console.log('✓ loadStatistics() 完成');
            } else {
                console.warn('⚠️ 載入統計資料失敗');
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.error('❌ loadStatistics() 請求超時（5秒）');
            } else {
                console.error('❌ loadStatistics() 錯誤:', error);
            }
            // 不要中斷初始化
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
        console.log('========================================');
        console.log('🔗 開始綁定事件');
        console.log('========================================');
        
        // 計時器控制
        const startBtn = document.getElementById('startBtn');
        const pauseBtn = document.getElementById('pauseBtn');
        const resetBtn = document.getElementById('resetBtn');
        
        console.log('計時器按鈕檢查:');
        console.log('  - startBtn:', startBtn ? '✓ 找到' : '✗ 未找到');
        console.log('  - pauseBtn:', pauseBtn ? '✓ 找到' : '✗ 未找到');
        console.log('  - resetBtn:', resetBtn ? '✓ 找到' : '✗ 未找到');
        
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                console.log('🎯 開始按鈕被點擊');
                this.startTimer();
            });
        }
        
        if (pauseBtn) {
            pauseBtn.addEventListener('click', () => {
                console.log('🎯 暫停按鈕被點擊');
                this.pauseTimer();
            });
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                console.log('🎯 重設按鈕被點擊');
                this.resetTimer();
            });
        }
        
        // 任務管理
        const addTaskBtn = document.getElementById('addTaskBtn');
        const taskNameInput = document.getElementById('taskNameInput');
        const estimatedPomodorosInput = document.getElementById('estimatedPomodorosInput');
        
        console.log('任務管理元素檢查:');
        console.log('  - addTaskBtn:', addTaskBtn);
        console.log('    → 是否存在:', addTaskBtn ? '✓ 找到' : '✗ 未找到');
        if (addTaskBtn) {
            console.log('    → ID:', addTaskBtn.id);
            console.log('    → Class:', addTaskBtn.className);
            console.log('    → Type:', addTaskBtn.type);
        }
        console.log('  - taskNameInput:', taskNameInput ? '✓ 找到' : '✗ 未找到');
        console.log('  - estimatedPomodorosInput:', estimatedPomodorosInput ? '✓ 找到' : '✗ 未找到');
        
        if (addTaskBtn) {
            console.log('✓ 正在為新增任務按鈕綁定點擊事件...');
            addTaskBtn.addEventListener('click', (e) => {
                // 防止表單提交（如果按鈕在 form 內）
                e.preventDefault();
                e.stopPropagation();
                
                console.log('========================================');
                console.log('🎯 新增任務按鈕被點擊！');
                console.log('時間:', new Date().toLocaleString());
                console.log('========================================');
                
                const taskName = document.getElementById('taskNameInput').value.trim();
                const estimatedPomodoros = parseInt(document.getElementById('estimatedPomodorosInput').value) || 1;
                
                console.log('📝 任務資訊:');
                console.log('  - 任務名稱:', taskName);
                console.log('  - 預估番茄數:', estimatedPomodoros);
                
                if (taskName) {
                    console.log('✓ 任務名稱驗證通過，呼叫 createTask()...');
                    this.createTask(taskName, estimatedPomodoros);
                } else {
                    console.log('✗ 任務名稱為空，顯示警告');
                    this.showNotification('請輸入任務名稱', 'warning');
                }
            });
            console.log('✓ 新增任務按鈕事件綁定完成');
        } else {
            console.error('❌ 錯誤：找不到 addTaskBtn 元素！');
        }
        
        // Enter 鍵新增任務
        if (taskNameInput) {
            console.log('✓ 正在為任務名稱輸入框綁定 Enter 鍵事件...');
            taskNameInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    console.log('⌨️ Enter 鍵被按下，觸發新增任務按鈕');
                    document.getElementById('addTaskBtn').click();
                }
            });
            console.log('✓ Enter 鍵事件綁定完成');
        }
        
        // 任務過濾
        const filterBtns = document.querySelectorAll('.filter-btn');
        console.log('過濾按鈕檢查:', filterBtns.length, '個按鈕');
        if (filterBtns.length > 0) {
            filterBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    console.log('🎯 過濾按鈕被點擊:', e.target.dataset.filter);
                    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                    e.target.classList.add('active');
                    this.currentFilter = e.target.dataset.filter;
                    this.renderTasks();
                });
            });
        }
        
        // 設定按鈕
        const settingsBtn = document.getElementById('settingsBtn');
        console.log('設定按鈕檢查:', settingsBtn ? '✓ 找到' : '✗ 未找到');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                console.log('🎯 設定按鈕被點擊');
                const modalElement = document.getElementById('settingsModal');
                if (modalElement && typeof bootstrap !== 'undefined') {
                    const modal = new bootstrap.Modal(modalElement);
                    modal.show();
                } else {
                    console.error('❌ Bootstrap Modal 未載入或 settingsModal 元素不存在');
                }
            });
        }
        
        // 儲存設定
        const saveSettingsBtn = document.getElementById('saveSettingsBtn');
        if (saveSettingsBtn) {
            saveSettingsBtn.addEventListener('click', () => {
                console.log('儲存設定按鈕被點擊');
                this.settings.workDuration = parseInt(document.getElementById('workDurationInput').value);
                this.settings.shortBreakDuration = parseInt(document.getElementById('shortBreakInput').value);
                this.settings.longBreakDuration = parseInt(document.getElementById('longBreakInput').value);
                this.settings.pomodorosUntilLongBreak = parseInt(document.getElementById('longBreakIntervalInput').value);
                this.settings.soundEnabled = document.getElementById('soundEnabledInput').checked;
                this.settings.volume = parseFloat(document.getElementById('volumeInput').value) / 100;
                this.settings.autoStartNext = document.getElementById('autoStartInput').checked;
                
                this.saveSettings();
            });
        }
        
        console.log('========================================');
        console.log('✅ 事件綁定完成');
        console.log('========================================');
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
// 使用立即檢查或等待載入完成的方式
console.log('========================================');
console.log('📜 pomodoro.js 檔案已載入');
console.log('時間:', new Date().toLocaleString());
console.log('document.readyState:', document.readyState);
console.log('========================================');

if (document.readyState === 'loading') {
    console.log('⏳ DOM 尚未載入完成，等待 DOMContentLoaded 事件...');
    document.addEventListener('DOMContentLoaded', () => {
        console.log('✓ DOMContentLoaded 事件觸發');
        PomodoroApp.init();
    });
} else {
    // DOM 已經載入完成，直接初始化
    console.log('✓ DOM 已經載入完成，直接初始化');
    PomodoroApp.init();
}
