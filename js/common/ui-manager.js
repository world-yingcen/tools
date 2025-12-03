/**
 * @file ui-manager.js
 * @description 應用程式的「雙手」，負責所有看得到、摸得著的介面操作。
 */

import { getBlockEditorTemplate, BLOCK_DISPLAY_NAMES } from './layouts.js';

// --- 拖曳相關變數 ---
let dragged = null;

export const UIManager = {
    elements: {
        blockEditorRoot: document.getElementById('block-editor-root'),
        liveHtmlPreview: document.getElementById('liveHtmlPreview'),
        generateButton: document.getElementById('generateButton'),
        outputCode: document.getElementById('outputCode'),
        copyButton: document.getElementById('copyButton'),
        copyMessage: document.getElementById('copyMessage'),
        toggleAllSectionsButton: document.getElementById('toggleAllSectionsButton'),
    },
    _handlers: {},
    _blockCounter: 0,

    init(handlers) {
        this._handlers = handlers;
        this.elements.generateButton.addEventListener('click', this._handlers.onGenerate);
        this.elements.copyButton.addEventListener('click', this._handlers.onCopy);
        this.elements.toggleAllSectionsButton.addEventListener('click', this._handlers.onToggleAllSections);

        // 防呆：只在編輯器頁面執行以下初始化
        if (!this.elements.blockEditorRoot) return;

        this.elements.blockEditorRoot.addEventListener('click', this._handleContainerClick.bind(this));
        this.elements.blockEditorRoot.addEventListener('input', this._handleContainerInput.bind(this));

        // Drag and Drop events
        this.elements.blockEditorRoot.addEventListener('dragstart', this._handleDragStart.bind(this));
        this.elements.blockEditorRoot.addEventListener('dragover', this._handleDragOver.bind(this));
        this.elements.blockEditorRoot.addEventListener('drop', this._handleDrop.bind(this));
        this.elements.blockEditorRoot.addEventListener('dragend', this._handleDragEnd.bind(this));
        this.elements.blockEditorRoot.addEventListener('dragleave', this._handleDragLeave.bind(this));
    },

    // --- Event Handlers ---
    _handleContainerClick(e) {
        if (e.target.closest('.remove-field-btn')) {
            const btn = e.target.closest('.remove-field-btn');
            const fieldGroup = btn.closest('.removable-field');

            // 如果按鈕在 .removable-field 內，只隱藏該欄位
            if (fieldGroup) {
                const inputs = fieldGroup.querySelectorAll('[data-field]');
                inputs.forEach(input => {
                    input.value = ''; // 清空內容
                    input.dataset.fieldRemoved = 'true'; // 加上刪除標記
                });
                fieldGroup.style.display = 'none'; // 隱藏欄位
                this._handlers.onContentChange(); // 觸發更新
            } else {
                // 否則刪除整個區塊
                const blockId = e.target.closest('.dynamic-block').id;
                this.removeBlock(blockId);
                this._handlers.onContentChange();
            }
        } else if (e.target.matches('.insert-trigger')) {
            this._toggleInsertMenu(e.target);
        } else if (e.target.matches('.insert-menu button')) {
            const blockType = e.target.dataset.type;
            const targetBlockId = e.target.closest('.dynamic-block').id;
            // If inserting into a container block, ensure it's inserted into its content wrapper
            const targetBlock = document.getElementById(targetBlockId);
            const parentSectionContent = targetBlock.closest('.block-section-content');
            if (parentSectionContent) {
                // If the target block is inside a section content, we need to pass the actual block ID for insertion logic
            }
            this._handlers.onInsertBlock(blockType, targetBlockId);
            this._closeAllInsertMenus();
        } else if (e.target.matches('#parseMarkdownButton')) {
            this._handlers.onParseMarkdown();
        } else if (e.target.matches('#parseAnchorMarkdownButton')) {
            this._handlers.onParseAnchorMarkdown();
        } else if (e.target.matches('#parseMainContentMarkdownButton')) {
            this._handlers.onParseMainContentMarkdown();
        } else if (e.target.matches('.block-section-container__header') || e.target.matches('.block-section-container__toggle-icon')) {
            // Handle collapse/expand click
            const header = e.target.closest('.block-section-container__header');
            if (!header) return;

            const container = header.closest('.block-section-container');
            const toggleIcon = header.querySelector('.block-section-container__toggle-icon');

            container.classList.toggle('collapsed');

            if (toggleIcon) {
                toggleIcon.textContent = container.classList.contains('collapsed') ? '+' : '-';
            }
        } else if (e.target.matches('.block-section-container__remove-btn')) {
            const container = e.target.closest('.block-section-container');
            if (container && confirm('確定要刪除整個區塊嗎？')) {
                this.removeSectionContainer(container);
            }
        }
    },

    _handleContainerInput(e) {
        if (e.target.matches('[data-field]')) {
            this._handlers.onContentChange();
        }
    },

    // --- Drag and Drop ---
    _handleDragStart(e) {
        if (e.target.classList.contains('dynamic-block')) {
            dragged = e.target;
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/html', dragged.id);
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
            target.parentNode.insertBefore(dragged, target.nextSibling);
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

    toggleAllSections() {
        const containers = this.elements.blockEditorRoot.querySelectorAll('.block-section-container');
        if (containers.length === 0) return;

        // 決定是要全部展開還是全部收合，以第一個區塊的狀態為準
        const shouldCollapse = !containers[0].classList.contains('collapsed');

        containers.forEach(container => {
            const toggleIcon = container.querySelector('.block-section-container__toggle-icon');
            if (shouldCollapse) {
                container.classList.add('collapsed');
                if (toggleIcon) toggleIcon.textContent = '+';
            } else {
                container.classList.remove('collapsed');
                if (toggleIcon) toggleIcon.textContent = '-';
            }
        });
    },

    // --- Block Management ---
    createBlock(blockInfo, insertAfterId = null) {
        this._blockCounter++;
        const blockId = `dynamic-block-${this._blockCounter}`;
        const newBlock = document.createElement('div');
        newBlock.className = 'dynamic-block input-group';
        newBlock.id = blockId;
        newBlock.dataset.type = blockInfo.type;

        // CTA is also a section starter block
        const isSectionStarterBlock = ['AUTHOR_BLOCK', 'ANCHOR_LIST', 'MAIN_CONTENT_BLOCK', 'CTA'].includes(blockInfo.type);
        let actualInsertionPoint; // The DOM element where newBlock will be appended/inserted

        if (isSectionStarterBlock) {
            // Create the block-section-container wrapper
            const sectionContainer = document.createElement('div');
            sectionContainer.className = 'block-section-container';
            sectionContainer.dataset.containerType = blockInfo.type;

            // Create and append the header
            const header = document.createElement('div');
            header.className = 'block-section-container__header';
            header.innerHTML = `
                <button type="button" class="block-section-container__toggle-icon">-</button>
                <h3 class="block-section-container__title">${BLOCK_DISPLAY_NAMES[blockInfo.type] || blockInfo.type}</h3>
                <button type="button" class="block-section-container__remove-btn" title="刪除整個區塊">×</button>
            `;
            sectionContainer.appendChild(header);

            // Create and append the content wrapper
            const contentWrapper = document.createElement('div');
            contentWrapper.className = 'block-section-content';
            sectionContainer.appendChild(contentWrapper);

            // The newBlock (e.g., AUTHOR_BLOCK dynamic-block) goes inside the contentWrapper
            contentWrapper.appendChild(newBlock);
            actualInsertionPoint = contentWrapper; // For subsequent insertions within this section

            // Insert the whole sectionContainer into the DOM
            if (insertAfterId) {
                const targetBlock = document.getElementById(insertAfterId);
                const targetSectionContainer = targetBlock.closest('.block-section-container');
                if (targetSectionContainer) {
                    targetSectionContainer.parentNode.insertBefore(sectionContainer, targetSectionContainer.nextSibling);
                } else {
                    // Fallback if targetBlock is not within a sectionContainer
                    targetBlock.parentNode.insertBefore(sectionContainer, targetBlock.nextSibling);
                }
            } else {
                this.elements.blockEditorRoot.appendChild(sectionContainer);
            }
        } else {
            // It's a regular dynamic-block, find its parent
            if (insertAfterId) {
                const targetBlock = document.getElementById(insertAfterId);
                // When inserting a regular block, it should go inside the content area of the target's section.
                const targetSectionContent = targetBlock.closest('.block-section-content');
                if (targetSectionContent) {
                    actualInsertionPoint = targetSectionContent;
                } else {
                    actualInsertionPoint = this.elements.blockEditorRoot;
                }
                targetBlock.parentNode.insertBefore(newBlock, targetBlock.nextSibling);
            } else {
                // If no insertAfterId, try to find the last content wrapper or root
                actualInsertionPoint = this.elements.blockEditorRoot.querySelector('.block-section-content:last-child') || this.elements.blockEditorRoot;
                actualInsertionPoint.appendChild(newBlock);
            }
        }

        const editorContent = blockInfo.editorHtml || getBlockEditorTemplate(blockInfo.type);
        const wrapper = document.createElement('div');
        wrapper.innerHTML = editorContent;
        newBlock.append(...wrapper.childNodes);

        const isDraggable = !isSectionStarterBlock && blockInfo.type !== 'HR'; // Section starters are not draggable themselves, their content is. HR is also not draggable.
        newBlock.setAttribute('draggable', isDraggable);

        // Only allow removal for non-section-starter dynamic-blocks
        if (blockInfo.isRemovable !== false && !isSectionStarterBlock) {
            newBlock.insertAdjacentHTML('beforeend', `<button type="button" class="remove-field-btn" title="移除此區塊"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2v2"></path></svg></button>`);
        }

        // Set initial data
        if (blockInfo.initialData) {
            for (const [field, value] of Object.entries(blockInfo.initialData)) {
                const input = newBlock.querySelector(`[data-field="${field}"]`);
                if (input) input.value = value;
            }
        }

        this.addInsertBar(newBlock, blockInfo.insertableBlocks);
        return newBlock;
    },

    // Modified removeBlock to handle section containers
    removeBlock(blockId) {
        const block = document.getElementById(blockId);
        if (block) {
            const parentContent = block.closest('.block-section-content');
            block.remove(); // Remove the block first
            if (parentContent && parentContent.children.length === 0) {
                // If the content wrapper is now empty, remove its parent section container
                parentContent.closest('.block-section-container').remove();
            }
        }
    },

    removeSectionContainer(containerElement) {
        if (containerElement) {
            containerElement.remove();
            // After removing a whole section, the content has changed.
            this._handlers.onContentChange();
        }
    },

    clearAllBlocks() {
        // Clear all block-section-containers and any remaining dynamic-blocks
        Array.from(this.elements.blockEditorRoot.children).forEach(child => child.remove());
        this._blockCounter = 0;
    },

    addInsertBar(blockElement, insertableBlocks) {
        blockElement.querySelector('.insert-bar-container')?.remove();

        // Determine if this dynamic-block is a "control block" for a section container.
        // These blocks typically don't get an insert bar themselves, or have special rules.
        const isContainerControlBlock = ['AUTHOR_BLOCK', 'ANCHOR_LIST', 'CTA', 'MAIN_CONTENT_BLOCK'].includes(blockElement.dataset.type);

        if (isContainerControlBlock) {
            return; // No insert bar on the container's own dynamic-block
        }

        // For all other regular dynamic-blocks (content blocks), add the insert bar
        this._addInsertBarToElement(blockElement, insertableBlocks);
    },

    _addInsertBarToElement(targetElement, insertableBlocks) {
        if (!insertableBlocks || insertableBlocks.length === 0) return;

        const iconMap = {
            'IMAGE': '🖼️',
            'HR': '分隔線',
            'VIDEO': '影片',
        };

        const buttonsHtml = insertableBlocks.map(type => {
            const icon = iconMap[type];
            const displayName = icon || BLOCK_DISPLAY_NAMES[type] || type;
            return `<button type="button" data-type="${type}"><span class="menu-icon">${displayName}</span> 增加</button>`;
        }).join('');

        const insertBarHtml = `
            <div class="insert-bar-container">
                <button type="button" class="insert-trigger">+</button>
                <div class="insert-menu" style="display: none;">${buttonsHtml}</div>
            </div>
        `;
        targetElement.insertAdjacentHTML('beforeend', insertBarHtml);
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
        this.elements.blockEditorRoot.querySelectorAll('.dynamic-block').forEach(el => {
            // Skip if it's a section starter block that's just a placeholder for the container
            // The actual content blocks are what we care about for data generation
            const isSectionStarterBlock = ['AUTHOR_BLOCK', 'ANCHOR_LIST'].includes(el.dataset.type);
            if (isSectionStarterBlock && el.dataset.type !== 'AUTHOR_BLOCK') { // AUTHOR_BLOCK itself has content (markdown input)
                // For now, we'll keep AUTHOR_BLOCK in the data as it has the markdown input.
                // ANCHOR_LIST dynamic-block itself doesn't have content, its items do.
                // This might need further refinement based on how LayoutManager uses these.
                // For now, let's include all dynamic-blocks.
            }
            const type = el.dataset.type;
            // Ensure content is extracted from the correct input fields within the block
            const content = {};
            const removedFields = {};
            el.querySelectorAll('[data-field]').forEach(input => {
                content[input.dataset.field] = input.value.trim();
                if (input.dataset.fieldRemoved === 'true') {
                    removedFields[input.dataset.field] = true;
                }
            });
            data.push({ id: el.id, type, content, removedFields });
        });
        return data;
    },

    getSelectedLayoutId() {
        return "text-over-image";
    },

    getMarkdownInput() {
        const markdownInput = document.getElementById('markdownInput');
        return markdownInput ? markdownInput.value : '';
    },

    getAnchorMarkdownInput() {
        const markdownInput = document.getElementById('anchorMarkdownInput');
        return markdownInput ? markdownInput.value : '';
    },

    getMainContentMarkdownInput() {
        const markdownInput = document.getElementById('mainContentMarkdownInput');
        return markdownInput ? markdownInput.value : '';
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

    scrollTo(elementId) {
        document.getElementById(elementId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
};
