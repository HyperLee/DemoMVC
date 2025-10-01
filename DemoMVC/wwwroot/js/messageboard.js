// ==================== 留言板主要功能模組 ====================
const MessageBoard = {
    currentPage: 1,
    currentSort: 'newest',
    pageSize: 10,
    searchKeyword: '',
    likedMessages: new Set(),

    // 初始化
    init: function () {
        console.log('留言板初始化中...');
        this.loadLikedMessages();
        this.bindEvents();
        this.loadMessages();
        this.startTimeUpdater();
    },

    // 綁定事件
    bindEvents: function () {
        // 新增留言
        $('#submitMessage').on('click', () => this.createMessage());
        $('#newMessageContent').on('keyup', () => this.updateCharCount('#newMessageContent', '#charCount'));

        // 搜尋 (防抖動)
        let searchTimeout;
        $('#searchInput').on('input', function () {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                MessageBoard.searchKeyword = $(this).val();
                MessageBoard.currentPage = 1;
                MessageBoard.loadMessages();
            }, 300);
        });

        // 排序
        $('#sortSelect').on('change', function () {
            MessageBoard.currentSort = $(this).val();
            MessageBoard.currentPage = 1;
            MessageBoard.loadMessages();
        });

        // 使用事件委派處理動態產生的按鈕
        $(document).on('click', '.btn-like', function () {
            const messageId = $(this).data('message-id');
            MessageBoard.toggleLike(messageId, $(this));
        });

        $(document).on('click', '.btn-reply', function () {
            const messageId = $(this).data('message-id');
            MessageBoard.toggleReplyInput(messageId);
        });

        $(document).on('click', '.btn-submit-reply', function () {
            const messageCard = $(this).closest('.message-card');
            const parentId = messageCard.data('message-id');
            const content = messageCard.find('.reply-textarea').val();
            MessageBoard.submitReply(parentId, content, messageCard);
        });

        $(document).on('click', '.btn-cancel-reply', function () {
            const messageCard = $(this).closest('.message-card');
            messageCard.find('.reply-input-section').slideUp();
            messageCard.find('.reply-textarea').val('');
        });

        $(document).on('click', '.btn-edit', function () {
            const messageId = $(this).data('message-id');
            MessageBoard.editMessage(messageId);
        });

        $(document).on('click', '.btn-delete', function () {
            const messageId = $(this).data('message-id');
            MessageBoard.deleteMessage(messageId);
        });

        // 回覆字數計算
        $(document).on('keyup', '.reply-textarea', function () {
            const counter = $(this).closest('.reply-input-section').find('.reply-char-count');
            MessageBoard.updateCharCount(this, counter);
        });
    },

    // 載入留言列表
    loadMessages: function () {
        $('#messagesContainer').html('<div class="loading-spinner text-center"><div class="spinner-border" role="status"><span class="visually-hidden">載入中...</span></div></div>');

        const params = {
            page: this.currentPage,
            pageSize: this.pageSize,
            sort: this.currentSort
        };

        if (this.searchKeyword) {
            // 使用搜尋 API
            $.get('/MessageBoard/Search', { keyword: this.searchKeyword })
                .done((response) => {
                    if (response.success) {
                        this.renderMessages(response.data, true);
                    } else {
                        this.showError('載入留言失敗');
                    }
                })
                .fail(() => this.showError('網路錯誤'));
        } else {
            $.get('/MessageBoard/GetMessages', params)
                .done((response) => {
                    if (response.success) {
                        this.renderMessages(response.data.messages, false);
                        this.renderPagination(response.data.totalPages, response.data.currentPage);
                    } else {
                        this.showError('載入留言失敗');
                    }
                })
                .fail(() => this.showError('網路錯誤'));
        }
    },

    // 渲染留言列表
    renderMessages: function (messages, isSearchResult) {
        const container = $('#messagesContainer');
        container.empty();

        if (!messages || messages.length === 0) {
            container.html(`
                <div class="text-center py-5">
                    <i class="bi bi-chat-text" style="font-size: 3rem; color: var(--text-secondary);"></i>
                    <p class="mt-3" style="color: var(--text-secondary);">
                        ${isSearchResult ? '找不到相關留言' : '還沒有留言，成為第一個發言的人吧！'}
                    </p>
                </div>
            `);
            return;
        }

        messages.forEach(item => {
            const message = item.message || item;
            const replies = item.replies || [];
            const card = this.createMessageCard(message, replies);
            container.append(card);
        });

        // 淡入動畫
        $('.message-card').each(function (index) {
            $(this).css({
                opacity: 0,
                transform: 'translateY(20px)'
            }).delay(index * 50).animate({
                opacity: 1
            }, 300, function () {
                $(this).css('transform', 'translateY(0)');
            });
        });
    },

    // 建立留言卡片
    createMessageCard: function (message, replies) {
        const userId = this.getUserId();
        const isOwner = message.userIdentifier === userId;
        const isLiked = this.likedMessages.has(message.messageId);
        const canEdit = this.canEdit(message.createdAt);

        let repliesHtml = '';
        if (replies && replies.length > 0) {
            repliesHtml = '<div class="replies-container">';
            replies.forEach(reply => {
                repliesHtml += `
                    <div class="reply-item" data-message-id="${reply.messageId}">
                        <div class="reply-header">
                            <i class="bi bi-person-circle"></i>
                            <span>匿名回覆</span>
                            <span class="reply-time time-ago" data-created-at="${reply.createdAt}">
                                ${this.getTimeAgo(reply.createdAt)}
                            </span>
                        </div>
                        <div class="reply-content">
                            ${this.renderMarkdown(reply.content)}
                        </div>
                    </div>
                `;
            });
            repliesHtml += '</div>';
        }

        const editButton = (isOwner && canEdit) ? `
            <button class="btn btn-action btn-edit" data-message-id="${message.messageId}">
                <i class="bi bi-pencil"></i> 編輯
            </button>
        ` : '';

        const deleteButton = isOwner ? `
            <button class="btn btn-action btn-delete" data-message-id="${message.messageId}">
                <i class="bi bi-trash"></i> 刪除
            </button>
        ` : '';

        const editedBadge = message.editedAt ? `
            <span class="edited-badge" title="編輯於 ${new Date(message.editedAt).toLocaleString('zh-TW')}">
                (已編輯)
            </span>
        ` : '';

        return $(`
            <div class="message-card" data-message-id="${message.messageId}">
                <div class="message-header">
                    <div class="message-author">
                        <i class="bi bi-person-circle"></i>
                        <span>匿名使用者</span>
                    </div>
                    <div class="message-time">
                        <i class="bi bi-clock"></i>
                        <span class="time-ago" data-created-at="${message.createdAt}">
                            ${this.getTimeAgo(message.createdAt)}
                        </span>
                        ${editedBadge}
                    </div>
                </div>
                <div class="message-content" data-raw-content="${this.escapeHtml(message.content)}">
                    ${this.renderMarkdown(message.content)}
                </div>
                <div class="message-actions">
                    <button class="btn btn-action btn-like ${isLiked ? 'liked' : ''}" data-message-id="${message.messageId}">
                        <i class="bi ${isLiked ? 'bi-heart-fill' : 'bi-heart'}"></i>
                        <span class="like-count">${message.likeCount}</span>
                    </button>
                    <button class="btn btn-action btn-reply" data-message-id="${message.messageId}">
                        <i class="bi bi-reply"></i>
                        <span class="reply-count">${replies ? replies.length : 0}</span>
                    </button>
                    ${editButton}
                    ${deleteButton}
                </div>
                <div class="reply-input-section" style="display: none;">
                    <textarea class="form-control reply-textarea" placeholder="輸入您的回覆..." rows="2" maxlength="200"></textarea>
                    <div class="reply-input-footer">
                        <div class="char-counter">
                            <span class="reply-char-count">0</span> / 200
                        </div>
                        <div class="reply-buttons">
                            <button class="btn btn-sm btn-secondary btn-cancel-reply">取消</button>
                            <button class="btn btn-sm btn-primary btn-submit-reply">送出</button>
                        </div>
                    </div>
                </div>
                ${repliesHtml}
            </div>
        `);
    },

    // 建立新留言
    createMessage: function () {
        const content = $('#newMessageContent').val().trim();

        if (!content) {
            this.showError('留言內容不可為空白', '#createMessageError');
            return;
        }

        if (content.length > 200) {
            this.showError('留言內容不可超過 200 字', '#createMessageError');
            return;
        }

        $('#submitMessage').prop('disabled', true).html('<span class="spinner-border spinner-border-sm"></span> 發送中...');

        $.ajax({
            url: '/MessageBoard/Create',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({ content: content })
        })
            .done((response) => {
                if (response.success) {
                    $('#newMessageContent').val('');
                    $('#charCount').text('0');
                    $('#createMessageError').hide();
                    this.loadMessages();
                } else {
                    this.showError(response.message, '#createMessageError');
                }
            })
            .fail(() => this.showError('網路錯誤', '#createMessageError'))
            .always(() => {
                $('#submitMessage').prop('disabled', false).html('<i class="bi bi-send"></i> 發送');
            });
    },

    // 切換按讚
    toggleLike: function (messageId, button) {
        const isLiked = this.likedMessages.has(messageId);
        const action = isLiked ? 'Unlike' : 'Like';

        $.post(`/MessageBoard/${action}`, { id: messageId })
            .done((response) => {
                if (response.success) {
                    const likeCount = parseInt(button.find('.like-count').text());
                    const newCount = isLiked ? likeCount - 1 : likeCount + 1;

                    button.find('.like-count').text(newCount);
                    button.toggleClass('liked');
                    button.find('i').toggleClass('bi-heart bi-heart-fill');

                    if (isLiked) {
                        this.likedMessages.delete(messageId);
                    } else {
                        this.likedMessages.add(messageId);
                    }
                    this.saveLikedMessages();
                }
            });
    },

    // 切換回覆輸入框
    toggleReplyInput: function (messageId) {
        const card = $(`.message-card[data-message-id="${messageId}"]`);
        const replySection = card.find('.reply-input-section');
        replySection.slideToggle();
        if (replySection.is(':visible')) {
            card.find('.reply-textarea').focus();
        }
    },

    // 送出回覆
    submitReply: function (parentId, content, messageCard) {
        if (!content.trim()) {
            alert('回覆內容不可為空白');
            return;
        }

        if (content.length > 200) {
            alert('回覆內容不可超過 200 字');
            return;
        }

        $.ajax({
            url: '/MessageBoard/Create',
            method: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                content: content,
                parentMessageId: parentId
            })
        })
            .done((response) => {
                if (response.success) {
                    messageCard.find('.reply-textarea').val('');
                    messageCard.find('.reply-input-section').slideUp();
                    this.loadMessages(); // 重新載入以顯示新回覆
                } else {
                    alert(response.message);
                }
            })
            .fail(() => alert('網路錯誤'));
    },

    // 編輯留言
    editMessage: function (messageId) {
        const card = $(`.message-card[data-message-id="${messageId}"]`);
        const currentContent = card.find('.message-content').data('raw-content');

        const newContent = prompt('編輯留言:', currentContent);
        if (newContent === null || newContent === currentContent) return;

        if (!newContent.trim()) {
            alert('留言內容不可為空白');
            return;
        }

        if (newContent.length > 200) {
            alert('留言內容不可超過 200 字');
            return;
        }

        $.ajax({
            url: '/MessageBoard/Edit',
            method: 'PUT',
            contentType: 'application/json',
            data: JSON.stringify({
                messageId: messageId,
                content: newContent
            })
        })
            .done((response) => {
                if (response.success) {
                    this.loadMessages();
                } else {
                    alert(response.message);
                }
            })
            .fail(() => alert('網路錯誤'));
    },

    // 刪除留言
    deleteMessage: function (messageId) {
        if (!confirm('確定要刪除此留言嗎？')) return;

        $.ajax({
            url: '/MessageBoard/Delete',
            method: 'DELETE',
            data: { id: messageId }
        })
            .done((response) => {
                if (response.success) {
                    this.loadMessages();
                } else {
                    alert(response.message);
                }
            })
            .fail(() => alert('網路錯誤'));
    },

    // 渲染分頁
    renderPagination: function (totalPages, currentPage) {
        if (totalPages <= 1) {
            $('#paginationNav').hide();
            return;
        }

        $('#paginationNav').show();
        const paginationList = $('#paginationList');
        paginationList.empty();

        // 上一頁
        paginationList.append(`
            <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage - 1}">◀</a>
            </li>
        `);

        // 頁碼
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
                paginationList.append(`
                    <li class="page-item ${i === currentPage ? 'active' : ''}">
                        <a class="page-link" href="#" data-page="${i}">${i}</a>
                    </li>
                `);
            } else if (i === currentPage - 2 || i === currentPage + 2) {
                paginationList.append(`<li class="page-item disabled"><span class="page-link">...</span></li>`);
            }
        }

        // 下一頁
        paginationList.append(`
            <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
                <a class="page-link" href="#" data-page="${currentPage + 1}">▶</a>
            </li>
        `);

        // 綁定分頁事件
        paginationList.find('a.page-link').on('click', function (e) {
            e.preventDefault();
            const page = parseInt($(this).data('page'));
            if (page && page !== MessageBoard.currentPage) {
                MessageBoard.currentPage = page;
                MessageBoard.loadMessages();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
        });
    },

    // 字數計算
    updateCharCount: function (textarea, counter) {
        const length = $(textarea).val().length;
        $(counter).text(length);

        if (length > 180) {
            $(counter).addClass('warning').removeClass('danger');
        }
        if (length > 195) {
            $(counter).addClass('danger').removeClass('warning');
        }
        if (length <= 180) {
            $(counter).removeClass('warning danger');
        }

        // 禁用發送按鈕
        if (textarea === '#newMessageContent') {
            $('#submitMessage').prop('disabled', length > 200 || length === 0);
        }
    },

    // 簡易 Markdown 渲染
    renderMarkdown: function (content) {
        if (!content) return '';

        let html = this.escapeHtml(content);

        // **粗體**
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

        // *斜體*
        html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

        // ~~刪除線~~
        html = html.replace(/~~(.+?)~~/g, '<del>$1</del>');

        // 換行
        html = html.replace(/\n/g, '<br>');

        return html;
    },

    // HTML 轉義
    escapeHtml: function (text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    // 計算時間差
    getTimeAgo: function (dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now - date) / 1000);

        if (seconds < 60) return '剛剛';
        if (seconds < 3600) return `${Math.floor(seconds / 60)} 分鐘前`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)} 小時前`;
        return `${Math.floor(seconds / 86400)} 天前`;
    },

    // 檢查是否可編輯
    canEdit: function (createdAt) {
        const created = new Date(createdAt);
        const now = new Date();
        const minutes = (now - created) / 1000 / 60;
        return minutes <= 10;
    },

    // 定時更新時間顯示
    startTimeUpdater: function () {
        setInterval(() => {
            $('.time-ago').each(function () {
                const createdAt = $(this).data('created-at');
                $(this).text(MessageBoard.getTimeAgo(createdAt));
            });
        }, 60000); // 每分鐘更新
    },

    // 取得使用者 ID (從 Cookie)
    getUserId: function () {
        const name = 'MessageBoardUserId=';
        const decodedCookie = decodeURIComponent(document.cookie);
        const ca = decodedCookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return '';
    },

    // 載入已按讚的留言 (從 LocalStorage)
    loadLikedMessages: function () {
        const liked = localStorage.getItem('likedMessages');
        if (liked) {
            this.likedMessages = new Set(JSON.parse(liked));
        }
    },

    // 儲存已按讚的留言
    saveLikedMessages: function () {
        localStorage.setItem('likedMessages', JSON.stringify([...this.likedMessages]));
    },

    // 顯示錯誤訊息
    showError: function (message, targetSelector = '#messagesContainer') {
        if (targetSelector === '#createMessageError') {
            $(targetSelector).text(message).show();
            setTimeout(() => $(targetSelector).fadeOut(), 5000);
        } else {
            $(targetSelector).html(`
                <div class="alert alert-danger text-center">
                    <i class="bi bi-exclamation-triangle"></i> ${message}
                </div>
            `);
        }
    }
};

// 頁面載入完成後初始化
$(document).ready(function () {
    MessageBoard.init();
});
