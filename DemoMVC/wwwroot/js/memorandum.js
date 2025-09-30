// 備忘錄應用程式主要物件
const MemorandumApp = {
    currentPage: 1,
    pageSize: 12,
    currentKeyword: '',
    currentTag: '',

    // 初始化
    init() {
        console.log('MemorandumApp 初始化');
        this.bindEvents();
    },

    // 綁定事件
    bindEvents() {
        // 搜尋框 - 使用 debounce
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            let debounceTimer;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => {
                    this.currentKeyword = e.target.value;
                    this.searchMemorandums(e.target.value);
                }, 500);
            });
        }

        // 標籤篩選
        const tagFilter = document.getElementById('tagFilter');
        if (tagFilter) {
            tagFilter.addEventListener('change', (e) => {
                this.currentTag = e.target.value;
                this.filterByTag(e.target.value);
            });
        }

        // 刪除按鈕
        document.addEventListener('click', (e) => {
            if (e.target.closest('.btn-delete')) {
                const btn = e.target.closest('.btn-delete');
                const id = btn.dataset.id;
                const title = btn.dataset.title;
                this.confirmDelete(id, title);
            }

            // 釘選按鈕
            if (e.target.closest('.btn-toggle-pin')) {
                const btn = e.target.closest('.btn-toggle-pin');
                const id = btn.dataset.id;
                this.togglePin(id);
            }

            // 標籤點擊
            if (e.target.closest('.tag-badge')) {
                const badge = e.target.closest('.tag-badge');
                const tag = badge.dataset.tag;
                const tagFilter = document.getElementById('tagFilter');
                if (tagFilter) {
                    tagFilter.value = tag;
                    this.filterByTag(tag);
                }
            }
        });
    },

    // 搜尋備忘錄
    async searchMemorandums(keyword) {
        try {
            const response = await fetch(`/Memorandum/Search?keyword=${encodeURIComponent(keyword)}`);
            const result = await response.json();

            if (result.success) {
                this.renderMemorandumList(result.data);
            } else {
                this.showMessage(result.message || '搜尋失敗', 'danger');
            }
        } catch (error) {
            console.error('搜尋錯誤:', error);
            this.showMessage('搜尋時發生錯誤', 'danger');
        }
    },

    // 根據標籤篩選
    async filterByTag(tag) {
        try {
            const url = tag ? `/Memorandum/GetByTag?tag=${encodeURIComponent(tag)}` : '/Memorandum/GetAll';
            const response = await fetch(url);
            const result = await response.json();

            if (result.success) {
                this.renderMemorandumList(result.data);
            } else {
                this.showMessage(result.message || '篩選失敗', 'danger');
            }
        } catch (error) {
            console.error('篩選錯誤:', error);
            this.showMessage('篩選時發生錯誤', 'danger');
        }
    },

    // 切換釘選狀態
    async togglePin(id) {
        try {
            const response = await fetch(`/Memorandum/TogglePin?id=${id}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            const result = await response.json();

            if (result.success) {
                this.showMessage(result.message, 'success');
                // 重新載入列表
                window.location.reload();
            } else {
                this.showMessage(result.message || '操作失敗', 'warning');
            }
        } catch (error) {
            console.error('切換釘選錯誤:', error);
            this.showMessage('切換釘選時發生錯誤', 'danger');
        }
    },

    // 顯示刪除確認對話框
    confirmDelete(id, title) {
        const modal = new bootstrap.Modal(document.getElementById('deleteModal'));
        document.getElementById('deleteTitle').textContent = title;
        
        const confirmBtn = document.getElementById('confirmDelete');
        // 移除舊的事件監聽器
        const newBtn = confirmBtn.cloneNode(true);
        confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);
        
        // 新增事件監聽器
        newBtn.addEventListener('click', () => {
            this.deleteMemorandum(id);
            modal.hide();
        });

        modal.show();
    },

    // 刪除備忘錄
    async deleteMemorandum(id) {
        try {
            // 取得 CSRF Token
            const token = document.querySelector('input[name="__RequestVerificationToken"]')?.value ||
                         document.querySelector('input[type="hidden"][name="__RequestVerificationToken"]')?.value;

            const formData = new FormData();
            formData.append('id', id);
            if (token) {
                formData.append('__RequestVerificationToken', token);
            }

            const response = await fetch('/Memorandum/Delete', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();

            if (result.success) {
                this.showMessage(result.message, 'success');
                // 移除卡片並加入淡出動畫
                const card = document.querySelector(`[data-id="${id}"]`);
                if (card) {
                    card.style.transition = 'opacity 0.3s';
                    card.style.opacity = '0';
                    setTimeout(() => {
                        card.remove();
                        // 檢查是否還有備忘錄
                        const remaining = document.querySelectorAll('.memorandum-item');
                        if (remaining.length === 0) {
                            const listContainer = document.getElementById('memorandumList');
                            listContainer.innerHTML = `
                                <div class="col-12">
                                    <div class="alert alert-info text-center">
                                        <i class="bi bi-info-circle"></i> 目前沒有備忘錄，點擊「新增備忘錄」開始建立。
                                    </div>
                                </div>
                            `;
                        }
                    }, 300);
                }
            } else {
                this.showMessage(result.message || '刪除失敗', 'danger');
            }
        } catch (error) {
            console.error('刪除錯誤:', error);
            this.showMessage('刪除時發生錯誤', 'danger');
        }
    },

    // 渲染備忘錄列表
    renderMemorandumList(memorandums) {
        const listContainer = document.getElementById('memorandumList');
        
        if (!memorandums || memorandums.length === 0) {
            listContainer.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-info text-center">
                        <i class="bi bi-info-circle"></i> 找不到符合的備忘錄。
                    </div>
                </div>
            `;
            return;
        }

        listContainer.innerHTML = memorandums.map(memo => this.renderMemorandumCard(memo)).join('');
    },

    // 渲染單一備忘錄卡片
    renderMemorandumCard(memo) {
        const preview = memo.content.length > 150 ? memo.content.substring(0, 150) + '...' : memo.content;
        const tags = memo.tags && memo.tags.length > 0 
            ? memo.tags.map(tag => `<span class="badge bg-secondary me-1 tag-badge" data-tag="${tag}" style="cursor: pointer;">${tag}</span>`).join('')
            : '';
        const pinIcon = memo.isPinned ? '<i class="bi bi-pin-fill text-warning pin-icon" title="已釘選"></i>' : '';
        const borderStyle = memo.color ? `style="border-left: 4px solid ${memo.color}"` : '';
        const pinnedClass = memo.isPinned ? 'pinned' : '';
        
        const updateDate = new Date(memo.updatedAt).toLocaleString('zh-TW', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });

        return `
            <div class="col-md-6 col-lg-4 memorandum-item" data-id="${memo.id}">
                <div class="card memorandum-card ${pinnedClass}" ${borderStyle}>
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-start mb-2">
                            <h5 class="card-title mb-0">${this.escapeHtml(memo.title)}</h5>
                            ${pinIcon}
                        </div>
                        <p class="card-text text-muted memo-content">${this.escapeHtml(preview)}</p>
                        ${tags ? `<div class="mb-2">${tags}</div>` : ''}
                        <div class="text-muted small mb-3">
                            <i class="bi bi-clock"></i>
                            更新於 ${updateDate}
                        </div>
                        <div class="d-flex gap-2">
                            <a href="/Memorandum/Edit?id=${memo.id}" class="btn btn-sm btn-outline-primary flex-fill">
                                <i class="bi bi-pencil"></i> 編輯
                            </a>
                            <button type="button" class="btn btn-sm btn-outline-warning btn-toggle-pin"
                                    data-id="${memo.id}" data-pinned="${memo.isPinned}">
                                <i class="bi bi-pin${memo.isPinned ? '-fill' : ''}"></i>
                                ${memo.isPinned ? '取消釘選' : '釘選'}
                            </button>
                            <button type="button" class="btn btn-sm btn-outline-danger btn-delete"
                                    data-id="${memo.id}" data-title="${this.escapeHtml(memo.title)}">
                                <i class="bi bi-trash"></i> 刪除
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    },

    // 顯示訊息
    showMessage(message, type = 'info') {
        const alertDiv = document.createElement('div');
        alertDiv.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
        alertDiv.style.zIndex = '9999';
        alertDiv.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        
        document.body.appendChild(alertDiv);
        
        setTimeout(() => {
            alertDiv.remove();
        }, 3000);
    },

    // HTML 轉義
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
};

// Markdown 編輯器
const MemorandumEditor = {
    editor: null,
    preview: null,

    init() {
        console.log('MemorandumEditor 初始化');
        this.editor = document.getElementById('contentEditor');
        this.preview = document.getElementById('markdownPreview');

        if (this.editor && this.preview) {
            this.bindEditorEvents();
            this.bindToolbar();
            this.bindTagInput();
            this.updateCharCount();
            
            // 初始預覽
            this.updatePreview();
        }
    },

    bindEditorEvents() {
        // 標題字數統計
        const titleInput = document.querySelector('input[name="Title"]');
        if (titleInput) {
            titleInput.addEventListener('input', () => {
                document.getElementById('titleCount').textContent = titleInput.value.length;
            });
        }

        // 內容字數統計和即時預覽
        this.editor.addEventListener('input', () => {
            this.updateCharCount();
            this.updatePreview();
        });
    },

    updateCharCount() {
        const count = this.editor.value.length;
        document.getElementById('contentCount').textContent = count;
    },

    updatePreview() {
        if (typeof marked !== 'undefined') {
            const html = marked.parse(this.editor.value || '');
            this.preview.innerHTML = html || '<p class="text-muted">在左側輸入內容，這裡會顯示預覽...</p>';
        }
    },

    bindToolbar() {
        document.querySelectorAll('[data-markdown]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const action = btn.dataset.markdown;
                this.insertMarkdown(action);
            });
        });
    },

    insertMarkdown(action) {
        const start = this.editor.selectionStart;
        const end = this.editor.selectionEnd;
        const text = this.editor.value;
        const selection = text.substring(start, end);
        
        let before = '', after = '';
        let cursorOffset = 0;

        switch (action) {
            case 'bold':
                before = '**';
                after = '**';
                cursorOffset = 2;
                break;
            case 'italic':
                before = '_';
                after = '_';
                cursorOffset = 1;
                break;
            case 'heading':
                before = '## ';
                cursorOffset = 3;
                break;
            case 'list':
                before = '- ';
                cursorOffset = 2;
                break;
            case 'link':
                before = '[';
                after = '](url)';
                cursorOffset = 1;
                break;
            case 'code':
                before = '`';
                after = '`';
                cursorOffset = 1;
                break;
        }

        const newText = text.substring(0, start) + before + selection + after + text.substring(end);
        this.editor.value = newText;
        
        const newCursorPos = selection ? end + before.length + after.length : start + cursorOffset;
        this.editor.setSelectionRange(newCursorPos, newCursorPos);
        this.editor.focus();
        
        this.updatePreview();
        this.updateCharCount();
    },

    bindTagInput() {
        const tagInput = document.getElementById('tagInput');
        const addTagBtn = document.getElementById('addTagBtn');
        const tagList = document.getElementById('tagList');
        const tagsHidden = document.getElementById('tagsHidden');

        if (!tagInput || !tagList || !tagsHidden) return;

        // 初始化標籤列表（編輯頁面）
        this.updateTagsHidden();

        // Enter 鍵新增標籤
        tagInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                this.addTag(tagInput.value.trim());
                tagInput.value = '';
            }
        });

        // 按鈕新增標籤
        if (addTagBtn) {
            addTagBtn.addEventListener('click', () => {
                this.addTag(tagInput.value.trim());
                tagInput.value = '';
            });
        }

        // 移除標籤
        tagList.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-tag')) {
                const tag = e.target.dataset.tag;
                e.target.closest('.tag-item').remove();
                this.updateTagsHidden();
            }
        });
    },

    addTag(tag) {
        if (!tag) return;

        const tagList = document.getElementById('tagList');
        const existingTags = Array.from(tagList.querySelectorAll('.tag-item'))
            .map(el => el.textContent.trim());

        if (existingTags.includes(tag)) {
            alert('此標籤已存在');
            return;
        }

        const tagElement = document.createElement('span');
        tagElement.className = 'badge bg-secondary me-1 tag-item';
        tagElement.innerHTML = `
            ${tag}
            <button type="button" class="btn-close btn-close-white btn-sm ms-1 remove-tag" data-tag="${tag}"></button>
        `;

        tagList.appendChild(tagElement);
        this.updateTagsHidden();
    },

    updateTagsHidden() {
        const tagList = document.getElementById('tagList');
        const tagsHidden = document.getElementById('tagsHidden');
        
        if (!tagList || !tagsHidden) return;

        const tags = Array.from(tagList.querySelectorAll('.tag-item'))
            .map(el => {
                const text = el.textContent.trim();
                // 移除 × 符號
                return text.replace(/×$/, '').trim();
            })
            .filter(t => t);

        tagsHidden.value = tags.join(',');
    }
};

// 頁面載入完成後初始化
document.addEventListener('DOMContentLoaded', () => {
    // 列表頁初始化
    if (document.getElementById('memorandumList')) {
        MemorandumApp.init();
    }

    // 編輯器初始化
    if (document.getElementById('contentEditor')) {
        MemorandumEditor.init();
    }
});
