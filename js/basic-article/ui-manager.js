/**
 * @file ui-manager.js
 * @description 應用程式的「雙手」，負責所有看得到、摸得著的介面操作。
 */

import { getBlockEditorTemplate, BLOCK_DISPLAY_NAMES } from './layouts.js';

// --- 拖曳相關變數 ---
let dragged = null;

export const UIManager = {
    elements: {
        layoutSelector: document.getElementById('layoutSelector'),
        markdownInput: document.getElementById('markdownInput'),
        parseMarkdownButton: document.getElementById('parseMarkdownButton'),
        dynamicContentContainer: document.getElementById('dynamicContentContainer'),
        liveHtmlPreview: document.getElementById('liveHtmlPreview'),
        generateButton: document.getElementById('generateButton'),
        outputCode: document.getElementById('outputCode'),
        copyButton: document.getElementById('copyButton'),
        copyMessage: document.getElementById('copyMessage'),
    },
    _handlers: {},
    _blockCounter: 0,

    init(handlers) {
        this._handlers = handlers;
        this.elements.layoutSelector.addEventListener('change', this._handlers.onLayoutChange);
        this.elements.parseMarkdownButton.addEventListener('click', this._handlers.onParseMarkdown);
        this.elements.generateButton.addEventListener('click', this._handlers.onGenerate);
        this.elements.copyButton.addEventListener('click', this._handlers.onCopy);

        this.elements.markdownInput.addEventListener('input', () => {
            this.elements.parseMarkdownButton.disabled = this.elements.markdownInput.value.trim() === '';
        });

        this.elements.dynamicContentContainer.addEventListener('click', this._handleContainerClick.bind(this));
        this.elements.dynamicContentContainer.addEventListener('input', this._handleContainerInput.bind(this));

        // Drag and Drop events
        this.elements.dynamicContentContainer.addEventListener('dragstart', this._handleDragStart.bind(this));
        this.elements.dynamicContentContainer.addEventListener('dragover', this._handleDragOver.bind(this));
        this.elements.dynamicContentContainer.addEventListener('drop', this._handleDrop.bind(this));
        this.elements.dynamicContentContainer.addEventListener('dragend', this._handleDragEnd.bind(this));
        this.elements.dynamicContentContainer.addEventListener('dragleave', this._handleDragLeave.bind(this));
    },

    // --- Event Handlers ---
    _handleContainerClick(e) {
        if (e.target.closest('.remove-field-btn')) {
            const btn = e.target.closest('.remove-field-btn');
            const fieldGroup = btn.closest('.removable-field');

            // 如果按鈕在 .removable-field 內，只隱藏該欄位
            if (fieldGroup) {
                const input = fieldGroup.querySelector('[data-field]');
                if (input) {
                    input.value = ''; // 清空內容
                    input.dataset.fieldRemoved = 'true'; // 加上刪除標記
                }
                fieldGroup.style.display = 'none'; // 隱藏欄位
                this._handlers.onContentChange(); // 觸發更新
            } else {
                // 否則刪除整個區塊
                const blockId = e.target.closest('.dynamic-block').id;
                this.removeBlock(blockId);
                this._handlers.onContentChange();
            }
        } else if (e.target.matches('.insert-trigger') || e.target.closest('.insert-trigger')) {
            // 支援點擊 SVG
            const trigger = e.target.closest('.insert-trigger');
            this._toggleInsertMenu(trigger);
        } else if (e.target.closest('.insert-menu button')) {
            const button = e.target.closest('.insert-menu button');
            const blockType = button.dataset.type;
            const trigger = button.closest('.add-zone').querySelector('.insert-trigger');
            const targetBlockId = trigger.dataset.targetId; // 從觸發器獲取目標ID
            this._handlers.onInsertBlock(blockType, targetBlockId);
            this._closeAllInsertMenus();
        }
    },

    _handleContainerInput(e) {
        if (e.target.matches('[data-field]')) {
            this._handlers.onContentChange();
        }
    },

    // --- Drag and Drop ---
    _handleDragStart(e) {
        if (e.target.matches('.dynamic-block')) {
            dragged = e.target;
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', dragged.id);
            setTimeout(() => dragged.classList.add('dragging-source'), 0);
        }
    },

    _handleDragOver(e) {
        e.preventDefault();
        const target = e.target.closest('.dynamic-block');
        if (target && target !== dragged) {
            document.querySelectorAll('.drag-over-top, .drag-over-bottom').forEach(el => el.classList.remove('drag-over-top', 'drag-over-bottom'));
            const rect = target.getBoundingClientRect();
            const isAfter = (e.clientY - rect.top) > (rect.height / 2);
            target.classList.add(isAfter ? 'drag-over-bottom' : 'drag-over-top');
        }
    },

    _handleDrop(e) {
        e.preventDefault();
        const target = e.target.closest('.dynamic-block');
        if (!target || target === dragged) return;

        const isAfter = target.classList.contains('drag-over-bottom');
        target.classList.remove('drag-over-top', 'drag-over-bottom');

        if (isAfter) {
            target.after(dragged);
        } else {
            target.parentNode.insertBefore(dragged, target);
        }
        this._handlers.onContentChange();
    },

    _handleDragEnd(e) {
        if (dragged) {
            dragged.classList.remove('dragging-source');
        }
        document.querySelectorAll('.drag-over-top, .drag-over-bottom').forEach(el => el.classList.remove('drag-over-top', 'drag-over-bottom'));
        dragged = null;
    },

    _handleDragLeave(e) {
        const target = e.target.closest('.dynamic-block');
        if (target) {
            target.classList.remove('drag-over-top', 'drag-over-bottom');
        }
    },

    // --- Block Management ---
    createBlock(blockInfo, insertAfterId = null, container = null) {
        this._blockCounter++;
        const blockId = `dynamic-block-${this._blockCounter}`;

        const newBlock = document.createElement('div');
        newBlock.className = 'content-block dynamic-block';
        newBlock.id = blockId;
        newBlock.dataset.type = blockInfo.type;
        newBlock.setAttribute('draggable', 'true');

        // 1. 建立 Header (依照使用者設計)
        const displayName = BLOCK_DISPLAY_NAMES[blockInfo.type] || '內容區塊';
        const headerHtml = `
            <div class="block-header">
                <div class="block-info">
                    <div class="drag-handle" title="拖曳排序">
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="9" cy="12" r="1"></circle><circle cx="9" cy="5" r="1"></circle><circle cx="9" cy="19" r="1"></circle>
                            <circle cx="15" cy="12" r="1"></circle><circle cx="15" cy="5" r="1"></circle><circle cx="15" cy="19" r="1"></circle>
                        </svg>
                    </div>
                    ${displayName} #${this._blockCounter}
                </div>
                ${blockInfo.isRemovable !== false ? `
                <button class="action-btn remove-field-btn" title="刪除此區塊">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>` : ''}
            </div>
        `;

        // 2. 建立 Body
        const bodyHtml = `
            <div class="block-body">
                ${blockInfo.editorHtml || getBlockEditorTemplate(blockInfo.type)}
            </div>
        `;

        newBlock.innerHTML = headerHtml + bodyHtml;

        this._fillInitialData(newBlock, blockInfo.initialData);
        this._insertElement(newBlock, insertAfterId, container);
        this.addInsertBar(newBlock, blockInfo.insertableBlocks);

        return newBlock;
    },

    _fillInitialData(block, initialData) {
        if (!initialData) return;
        for (const [field, value] of Object.entries(initialData)) {
            const input = block.querySelector(`[data-field="${field}"]`);
            if (input) input.value = value;
        }
    },

    _insertElement(element, insertAfterId, container = null) {
        const parent = container || this.elements.dynamicContentContainer;
        if (insertAfterId) {
            const targetBlock = document.getElementById(insertAfterId);
            if (targetBlock) {
                targetBlock.after(element);
                return;
            }
        }
        parent.appendChild(element);
    },

    removeBlock(blockId) {
        const block = document.getElementById(blockId);
        if (block) block.remove();
    },

    clearAllBlocks() {
        this.elements.dynamicContentContainer.innerHTML = '';
        this._blockCounter = 0;
    },

    addInsertBar(blockElement, insertableBlocks, isForContainer = false) {
        blockElement.querySelector('.add-zone')?.remove(); // 移除舊的
        if (!insertableBlocks || insertableBlocks.length === 0) return;

        const iconMap = { 'IMAGE': '🖼️', 'HR': '分隔線' };

        const buttonsHtml = insertableBlocks.map(type => {
            const displayName = BLOCK_DISPLAY_NAMES[type] || type;
            const icon = iconMap[type] || displayName;
            return `<button type="button" data-type="${type}"><span class="menu-icon">${icon}</span> 增加</button>`;
        }).join('');

        // 使用使用者的 .add-zone 和 .btn-add 結構
        // 注意：為了讓選單功能正常，我將 .insert-menu 放在 .add-zone 裡面
        const insertBarHtml = `
            <div class="add-zone">
                <button type="button" class="btn-add insert-trigger" data-target-id="${blockElement.id}">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <line x1="5" y1="12" x2="19" y2="12"></line>
                    </svg>
                    新增內容區塊
                </button>
                <div class="insert-menu" style="display: none;">${buttonsHtml}</div>
            </div>
        `;
        blockElement.insertAdjacentHTML('beforeend', insertBarHtml);
    },

    _toggleInsertMenu(trigger) {
        const menu = trigger.nextElementSibling;
        const isActive = menu.style.display === 'grid';
        this._closeAllInsertMenus();
        if (!isActive) {
            menu.style.display = 'grid';
            trigger.classList.add('active');
        }
    },

    _closeAllInsertMenus() {
        document.querySelectorAll('.insert-menu').forEach(m => m.style.display = 'none');
        document.querySelectorAll('.insert-trigger.active').forEach(t => t.classList.remove('active'));
    },

    // --- Data and State ---
    getOrderedBlockData() {
        const data = [];
        this.elements.dynamicContentContainer.childNodes.forEach(node => {
            if (node.nodeType !== Node.ELEMENT_NODE) return;

            if (node.matches('.dynamic-block')) {
                data.push(this._getBlockDataFromElement(node));
            }
        });
        return data;
    },

    _getBlockDataFromElement(element) {
        const type = element.dataset.type;
        const content = {};
        const removedFields = {};
        element.querySelectorAll('[data-field]').forEach(input => {
            content[input.dataset.field] = input.value.trim();
            if (input.dataset.fieldRemoved === 'true') {
                removedFields[input.dataset.field] = true;
            }
        });

        return { id: element.id, type, content, removedFields }; // **關鍵：將標記傳出去**
    },

    getSelectedLayoutId() {
        return this.elements.layoutSelector.value;
    },

    getMarkdownInput() {
        return this.elements.markdownInput.value;
    },

    // --- UI Updates ---
    updateLivePreview(html) {
        this.elements.liveHtmlPreview.innerHTML = html;
    },

    setOutputCode(code) {
        this.elements.outputCode.textContent = code;
    },

    setGenerateButtonState(enabled) {
        this.elements.generateButton.disabled = !enabled;
    },

    showCopyMessage(message, isSuccess) {
        this.elements.copyMessage.textContent = message;
        this.elements.copyMessage.className = isSuccess ? 'copy-message copy-success' : 'copy-message copy-error';
        this.elements.copyMessage.style.display = 'block';
        setTimeout(() => { this.elements.copyMessage.style.display = 'none'; }, 3000);
    },

    populateMarkdownBlocks(blocks) {
        // This is a complex function. A simplified version:
        // It would find the corresponding input fields and fill them.
        console.log("Populating UI with parsed markdown:", blocks);
        // ... implementation to find and fill fields ...
    },

    scrollTo(elementId) {
        document.getElementById(elementId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};