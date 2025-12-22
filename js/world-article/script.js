console.log("script.js is running!");

/**
 * @file script.js
 * @description 應用程式的「大腦」，處理資料和邏輯流程。
 */

import { UIManager } from '../common/ui-manager.js';
import { LayoutManager } from '../common/layout-manager.js';
import { getLayoutDefinition } from '../common/layouts.js';

/**
 * App Controller
 * 負責協調 UI Manager 和 Layout Manager。
 */
const App = {
    config: {
        articleClassPrefix: 'world-article',
        ctaConfig: {
            defaultTitle: '準備好在市場脫穎而出了嗎？',
            defaultDescription: '沃德品牌顧問憑藉精準的策略思維，找出品牌差異化的關鍵，從品牌形象規劃到影像製作、網站設計以及廣告行銷，透過整合全方位的品牌價值，助您打造獨特的競爭力。',
            buttonText: '立即諮詢',
            buttonHref: '/contact',
            bgImageUrl: 'https://www.world-group.com.tw/storage/news/3/ed_678ef9e6ed5fc.webp',
            bgImageAlt: '立即諮詢設計服務'
        }
    },

    init() {
        UIManager.init({
            onGenerate: this.handleGenerate.bind(this),
            onCopy: this.handleCopy.bind(this),
            onContentChange: this.handleContentChange.bind(this),
            onParseMarkdown: this.handleParseMarkdown.bind(this),
            onParseAnchorMarkdown: this.handleParseAnchorMarkdown.bind(this),
            onParseMainContentMarkdown: this.handleParseMainContentMarkdown.bind(this),
            onToggleAllSections: this.handleToggleAllSections.bind(this),
            onInsertBlock: this.handleInsertBlock.bind(this),
        });

        UIManager.setGenerateButtonState(false);
        this.handleLayoutChange(); // Initial setup
    },

    handleLayoutChange() {
        const layoutId = UIManager.getSelectedLayoutId();

        // 1. 清空所有舊內容 (除了 Markdown 輸入框)
        UIManager.clearAllBlocks();
        this.updatePreview(); // 這會清空預覽

        // 2. 重設按鈕狀態
        UIManager.setGenerateButtonState(false);

        if (!layoutId) {
            UIManager.setOutputCode("*操作遇到問題，請先幫我螢幕錄影，再左轉找LIN 謝謝😉");
            return;
        }

        const layoutDef = getLayoutDefinition(layoutId);
        if (layoutDef && layoutDef.initialBlocks) {
            let lastBlockId = null;
            layoutDef.initialBlocks.forEach(blockInfo => {
                const fullBlockInfo = this._getFullBlockInfo(blockInfo, layoutDef);
                // Pass the ID of the previously created block to maintain order
                const newBlock = UIManager.createBlock(fullBlockInfo, lastBlockId);
                lastBlockId = newBlock.id;
            });
        }
        this.updatePreview(); // 再次更新以顯示新版型的空白預覽
    },

    _getFullBlockInfo(blockInfo, layoutDef) {
        const blockType = blockInfo.type;
        let insertableBlocks;

        if (layoutDef.insertableBlocks) {
            insertableBlocks = layoutDef.insertableBlocks[blockType] || layoutDef.insertableBlocks.default;
        }

        return { ...blockInfo, insertableBlocks };
    },

    handleContentChange() {
        UIManager.setGenerateButtonState(true);
        this.updatePreview();
    },

    handleInsertBlock(blockType, targetBlockId) {
        const layoutId = UIManager.getSelectedLayoutId();
        const layoutDef = getLayoutDefinition(layoutId);
        if (!layoutDef) return;

        const blockInfo = this._getFullBlockInfo({ type: blockType, isRemovable: true }, layoutDef);
        UIManager.createBlock(blockInfo, targetBlockId);
        this.handleContentChange();
    },

    async handleParseMarkdown() {
        const markdown = UIManager.getMarkdownInput();
        if (!markdown.trim()) {
            alert("請在 Markdown 輸入框貼上內容！");
            return;
        }

        const parsedBlocks = this._parseMarkdown(markdown);

        // --- 新邏輯：只針對「引言」區塊 ---
        const layoutId = UIManager.getSelectedLayoutId();
        const layoutDef = getLayoutDefinition(layoutId);
        if (!layoutDef) return;

        const authorDynamicBlock = this.getAuthorContainerBlock(); // This is the dynamic-block[data-type="AUTHOR_BLOCK"]
        if (!authorDynamicBlock) {
            alert('錯誤：找不到「引言」區塊。');
            return;
        }

        // The actual content wrapper for the section
        const sectionContent = authorDynamicBlock.closest('.block-section-content');
        if (!sectionContent) {
            alert('錯誤：找不到「引言」區塊的內容容器。');
            return;
        }

        // 移除引言容器中除了容器和作者之外的所有舊區塊
        const blocksToRemove = Array.from(sectionContent.children).filter(child =>
            child.dataset.type !== 'AUTHOR_BLOCK' && child.dataset.type !== 'AUTHOR'
        );
        blocksToRemove.forEach(block => UIManager.removeBlock(block.id));

        // 從「作者」區塊後面開始依序插入新區塊
        let lastBlockId = sectionContent.querySelector('.dynamic-block[data-type="AUTHOR"]')?.id || authorDynamicBlock.id;

        parsedBlocks.forEach(blockData => {
            const blockInfo = this._getFullBlockInfo({ type: blockData.type, isRemovable: true }, layoutDef);
            const newBlock = UIManager.createBlock(blockInfo, lastBlockId);
            this._fillBlockContent(newBlock, blockData.content);
            lastBlockId = newBlock.id;
        });

        this.handleContentChange();
    },

    getAuthorContainerBlock() {
        return document.querySelector('.dynamic-block[data-type="AUTHOR_BLOCK"]');
    },

    async handleParseAnchorMarkdown() {
        const markdown = UIManager.getAnchorMarkdownInput();
        if (!markdown.trim()) {
            alert("請在錨點連結區塊的 Markdown 輸入框貼上內容！");
            return;
        }

        // 支援三種格式：
        // 1. [文字](連結)
        // 2. * 文字,連結
        // 3. 文字,連結
        const parsedBlocks = markdown.split('\n')
            .map(line => line.trim())
            .filter(line => line && !line.startsWith('//')) // 過濾掉空行和註解行
            .map(line => {
                // 格式一：[文字](連結)
                let match = line.match(/^\[(.*?)\]\((.*?)\)/);
                if (match) {
                    return { type: 'ANCHOR_ITEM', content: { TEXT: match[1], HREF: match[2] } };
                }

                // 格式二和三：* 文字,連結 或 文字,連結
                // 移除開頭的 *, -, 或數字列表標記
                const cleanedLine = line.replace(/^[\*\-]|\d+\.\s*/, '').trim();
                const parts = cleanedLine.split(',');

                if (parts.length >= 2) {
                    // 最後一個逗號之後的都當作連結
                    let href = parts.pop().trim();
                    // 確保移除可能由 Markdown 解析器錯誤添加的反斜線
                    href = href.replace(/\\(#)/g, '$1');
                    // 前面的部分全部作為文字
                    const text = parts.join(',').trim();
                    if (text && href) {
                        return { type: 'ANCHOR_ITEM', content: { TEXT: text, HREF: href } };
                    }
                }

                return null; // 如果不匹配任何格式，返回 null
            })
            .filter(Boolean); // 過濾掉所有 null 的結果

        if (parsedBlocks.length === 0) {
            alert("找不到有效的錨點連結格式。請確認格式為以下三者之一：\n1. [文字](連結)\n2. * 文字,連結\n3. 文字,連結");
            return;
        }

        const layoutId = UIManager.getSelectedLayoutId();
        const layoutDef = getLayoutDefinition(layoutId);
        if (!layoutDef) return;

        const anchorListContainer = document.querySelector('.block-section-container[data-container-type="ANCHOR_LIST"]');
        if (!anchorListContainer) {
            alert('錯誤：找不到「錨點連結」區塊容器。');
            return;
        }

        // 移除容器中所有舊的 ANCHOR_ITEM 區塊
        anchorListContainer.querySelectorAll('.dynamic-block[data-type="ANCHOR_ITEM"]').forEach(block => UIManager.removeBlock(block.id));

        let lastBlockId = anchorListContainer.querySelector('.dynamic-block[data-type="ANCHOR_LIST"]').id;
        parsedBlocks.forEach(blockData => {
            const newBlock = UIManager.createBlock({ type: 'ANCHOR_ITEM', isRemovable: true }, lastBlockId);
            this._fillBlockContent(newBlock, blockData.content);
            lastBlockId = newBlock.id;
        });

        this.handleContentChange();
    },

    async handleParseMainContentMarkdown() {
        const markdown = UIManager.getMainContentMarkdownInput();
        if (!markdown.trim()) {
            alert("請在主內容編輯區的 Markdown 輸入框貼上內容！");
            return;
        }

        const parsedBlocks = this._parseMarkdown(markdown);

        const layoutId = UIManager.getSelectedLayoutId();
        const layoutDef = getLayoutDefinition(layoutId);
        if (!layoutDef) return;

        const mainContentContainer = document.querySelector('.block-section-container[data-container-type="MAIN_CONTENT_BLOCK"]');
        if (!mainContentContainer) {
            alert('錯誤：找不到「主內容編輯區」容器。');
            return;
        }

        // 移除容器中除了 MAIN_CONTENT_BLOCK 自身之外的所有舊區塊
        const blocksToRemove = Array.from(mainContentContainer.querySelectorAll('.dynamic-block')).filter(block =>
            block.dataset.type !== 'MAIN_CONTENT_BLOCK'
        );
        blocksToRemove.forEach(block => UIManager.removeBlock(block.id));

        // 從 MAIN_CONTENT_BLOCK 區塊後面開始依序插入新區塊
        let lastBlockId = mainContentContainer.querySelector('.dynamic-block[data-type="MAIN_CONTENT_BLOCK"]').id;

        parsedBlocks.forEach(blockData => {
            const blockInfo = this._getFullBlockInfo({ type: blockData.type, isRemovable: true }, layoutDef);
            const newBlock = UIManager.createBlock(blockInfo, lastBlockId);
            // 如果有內容，則填入
            if (Object.keys(blockData.content).length > 0) {
                this._fillBlockContent(newBlock, blockData.content);
            }
            lastBlockId = newBlock.id;
        });

        this.handleContentChange();
        UIManager.scrollTo('generateButton');
    },

    _parseMarkdown(markdown) {
        const lines = markdown.split('\n');
        const blocks = [];
        let i = 0;
        while (i < lines.length) {
            const line = lines[i].trim();

            // 忽略以 // 開頭的註解行
            if (line.startsWith('//')) {
                i++;
                continue;
            }

            if (line.startsWith('## ')) {
                blocks.push({ type: 'H2', content: { TEXT: line.substring(3).trim().replace(/\*\*/g, '') } });
                i++;
            } else if (line.startsWith('### ')) {
                blocks.push({ type: 'H3', content: { TEXT: line.substring(4).trim().replace(/\*\*/g, '') } });
                i++;
            } else if (line.startsWith('#### ')) {
                blocks.push({ type: 'H4', content: { TEXT: line.substring(5).trim().replace(/\*\*/g, '') } });
                i++;
            } else if (line.match(/^[\*\-]\s/)) {
                let listItems = [];
                while (i < lines.length && lines[i].trim().match(/^[\*\-]\s/)) {
                    listItems.push(lines[i].trim().replace(/^[\*\-]\s/, '').replace(/\*\*/g, ''));
                    i++;
                }
                blocks.push({ type: 'UL', content: { LIST_ITEMS: listItems.join('\n') } });
            } else if (line.match(/^\d+\\?\. /)) { // 允許數字和點之間可選的反斜線，並確保後面有空格
                let listItems = [];
                while (i < lines.length && lines[i].trim().match(/^\d+\\?\. /)) {
                    listItems.push(lines[i].trim().replace(/^\d+\\?\. /, '').replace(/\*\*/g, ''));
                    i++;
                }
                blocks.push({ type: 'OL', content: { LIST_ITEMS: listItems.join('\n') } });
            } else if (line.match(/^!\\?\[(.*)\\?\]\((.*)\)/)) {
                const match = line.match(/^!\\?\[(.*)\\?\]\((.*)\)/);
                let url = match[2].trim();
                // 只要不是 .jpg, .png, .webp 結尾，就替換為假圖
                if (!url.match(/\.(jpg|jpeg|png|webp)$/i)) {
                    url = 'https://system16.webtech.com.tw/web/202500107/archive/image/article1/images/about-pic-1.jpg';
                }
                blocks.push({ type: 'IMAGE', content: { ALT: match[1].replace(/\*\*/g, '').replace(/\\/g, ''), URL: url } });
                i++;
            } else if (line.match(/^\\?\[(.*)\\?\]\((.*)\)/)) {
                const match = line.match(/^\\?\[(.*)\\?\]\((.*)\)/);
                const text = match[1].replace(/\*\*/g, '').replace(/\\/g, '');
                let href = match[2].trim();

                // 判斷是否為圖片連結 (副檔名 或 Google Drive 連結)
                const isImage = href.match(/\.(webp|jpg|jpeg|png|gif)$/i) ||
                    text.match(/\.(webp|jpg|jpeg|png|gif)$/i) ||
                    href.includes('drive.google.com');

                if (isImage) {
                    // 只要不是 .jpg, .png, .webp, .gif 結尾，就替換為假圖
                    if (!href.match(/\.(jpg|jpeg|png|webp|gif)$/i)) {
                        href = 'https://system16.webtech.com.tw/web/202500107/archive/image/article1/images/about-pic-1.jpg';
                    }
                    blocks.push({ type: 'IMAGE', content: { ALT: text, URL: href } });
                } else {
                    blocks.push({ type: 'A', content: { TEXT: text, HREF: href } });
                }
                i++;
            } else if (line.match(/^(---|___|\*\*\*)$/)) {
                blocks.push({ type: 'HR', content: {} });
                i++;
            } else if (line.match(/^\|.*\|$/)) {
                let tableLines = []; // 收集所有連續的表格行
                // 收集所有連續的表格行
                while (i < lines.length && lines[i].trim().match(/^\|.*\|$/)) {
                    tableLines.push(lines[i].trim());
                    i++;
                }
                // 將整個 Markdown 表格作為單一內容儲存
                blocks.push({ type: 'TABLE', content: { MARKDOWN: tableLines.join('\n') } });
            } else if (line.startsWith('# ') && lines[i + 1]?.trim().match(/^(---|___|\*\*\*)$/)) {
                // 偵測 QA Block 格式: # Title, followed by ---
                let qaLines = [];
                let lineIndex = i;
                // 收集直到下一個主要區塊或結尾
                while (lineIndex < lines.length && !lines[lineIndex].trim().match(/^#{1,4} /) && lineIndex > i) {
                    qaLines.push(lines[lineIndex]);
                    lineIndex++;
                }
                const fullQaMarkdown = lines.slice(i, lineIndex).join('\n');
                blocks.push({ type: 'QA_BLOCK', content: { MARKDOWN: fullQaMarkdown } });
                i = lineIndex;
            } else if (line) {
                // 移除粗體標記，但保留斜體等其他格式（如果未來有需求）
                // 這裡只處理 **粗體**，如果需要處理 *斜體* 或 _斜體_，需要額外添加正則表達式
                blocks.push({ type: 'P', content: { TEXT: line.replace(/\*\*/g, '').replace(/(\d+)\\\./, '$1.') } });
                i++;
            } else {
                i++; // Skip empty lines
            }
        }
        return blocks;
    },

    _fillBlockContent(blockElement, content) {
        if (!blockElement || !content) return;
        for (const [field, value] of Object.entries(content)) {
            const input = blockElement.querySelector(`[data-field="${field}"]`);
            if (input) {
                input.value = value;
            }
        }
    },

    updatePreview() {
        const layoutId = UIManager.getSelectedLayoutId();
        if (!layoutId) {
            UIManager.updateLivePreview('');
            return;
        }
        const orderedData = UIManager.getOrderedBlockData();

        const { html } = LayoutManager.generateContentHTML(layoutId, orderedData, this.config);
        UIManager.updateLivePreview(html);
    },

    handleGenerate() {
        const layoutId = UIManager.getSelectedLayoutId();
        const orderedData = UIManager.getOrderedBlockData();

        if (orderedData.length === 0) {
            UIManager.setOutputCode("<!-- 警告：請先選擇版型並填寫內容！ -->");
            UIManager.scrollTo('final-output');
            return;
        }

        const { html } = LayoutManager.generateContentHTML(layoutId, orderedData, this.config);
        UIManager.setOutputCode(html);
        UIManager.setGenerateButtonState(false);
        UIManager.scrollTo('final-output');
    },

    handleCopy() {
        const code = UIManager.elements.outputCode.textContent;
        if (!code || code.includes("警告：") || code.includes("*操作遇到問題")) {
            UIManager.showCopyMessage("請先產生有效內容再複製！", false);
            return;
        }

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(code).then(() => {
                UIManager.showCopyMessage("👍🏻 成功複製到剪貼簿！", true);
            }).catch(err => {
                console.error("Copy failed:", err);
                this._fallbackCopyTextToClipboard(code);
            });
        } else {
            this._fallbackCopyTextToClipboard(code);
        }
    },

    _fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement("textarea");
        textArea.value = text;

        // Ensure the textarea is not visible but part of the DOM
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);

        textArea.focus();
        textArea.select();
        textArea.setSelectionRange(0, 99999); // For mobile devices

        try {
            const successful = document.execCommand('copy');
            if (successful) {
                UIManager.showCopyMessage("👍🏻 成功複製到剪貼簿！", true);
            } else {
                UIManager.showCopyMessage("複製失敗，請手動選取。", false);
            }
        } catch (err) {
            console.error('Fallback copy failed', err);
            UIManager.showCopyMessage("複製失敗，請手動選取。", false);
        }

        document.body.removeChild(textArea);
    },

    handleToggleAllSections() {
        UIManager.toggleAllSections();
    },

};

App.init();
