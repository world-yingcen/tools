console.log("script.js is running!");

/**
 * @file script.js
 * @description 應用程式的「大腦」，處理資料和邏輯流程。
 */

import { UIManager } from './ui-manager.js';
import { LayoutManager } from './layout-manager.js';
import { getLayoutDefinition, getBlockEditorTemplate } from './layouts.js';

/**
 * App Controller
 * 負責協調 UI Manager 和 Layout Manager。
 */
const App = {
    init() {
        UIManager.init({
            onLayoutChange: this.handleLayoutChange.bind(this),
            onParseMarkdown: this.handleParseMarkdown.bind(this),
            onGenerate: this.handleGenerate.bind(this),
            onCopy: this.handleCopy.bind(this),
            onContentChange: this.handleContentChange.bind(this),
            onInsertBlock: this.handleInsertBlock.bind(this),
            getLayoutDef: getLayoutDefinition, // 讓 UIManager 可以取得版型定義
        });

        UIManager.setGenerateButtonState(false);
        UIManager.elements.parseMarkdownButton.disabled = true;
        this.handleLayoutChange(); // Initial setup
    },

    handleLayoutChange() {
        const layoutId = UIManager.getSelectedLayoutId();

        // 1. 清空所有舊內容 (除了 Markdown 輸入框)
        UIManager.clearAllBlocks();
        UIManager.setOutputCode('');

        // 2. 重設按鈕狀態
        UIManager.setGenerateButtonState(false);
        UIManager.elements.parseMarkdownButton.disabled = !UIManager.getMarkdownInput().trim();

        if (!layoutId) {
            UIManager.setOutputCode("*操作遇到問題，請先幫我螢幕錄影，再左轉找LIN 謝謝😉");
            return;
        }

        const layoutDef = getLayoutDefinition(layoutId);
        if (layoutDef && layoutDef.initialBlocks) {
            let lastBlockId = null;
            layoutDef.initialBlocks.forEach(blockInfo => {
                const fullBlockInfo = this._getFullBlockInfo(blockInfo, layoutDef);
                const newBlock = UIManager.createBlock(fullBlockInfo, lastBlockId);
                lastBlockId = newBlock.id;
            });
        }
        // 修正：不要根據空白欄位更新預覽，而是直接產生一個帶有預設內容的預覽
        const initialData = layoutDef.initialBlocks.map(block => ({
            type: block.type,
            // 關鍵修正：優先使用 previewData 產生預覽，若無則使用 initialData
            content: block.previewData || block.initialData || {}
        }));
        const { html } = LayoutManager.generateContentHTML(layoutId, initialData);
        UIManager.updateLivePreview(html);
    },

    _getFullBlockInfo(blockInfo, layoutDef) {
        const blockType = blockInfo.type;
        let insertableBlocks;
        // 對於傳統版型
        insertableBlocks = layoutDef.insertableBlocks ? (layoutDef.insertableBlocks[blockType] || layoutDef.insertableBlocks.default) : [];
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

    updatePreview() {
        const layoutId = UIManager.getSelectedLayoutId();
        if (!layoutId) {
            UIManager.updateLivePreview('');
            return;
        }
        const orderedData = UIManager.getOrderedBlockData();
        const layoutDef = getLayoutDefinition(layoutId);

        // 智慧合併預覽資料
        const mergedData = orderedData.map(uiBlockData => {
            const blockDef = layoutDef.initialBlocks.find(b => b.type === uiBlockData.type);
            if (blockDef && blockDef.previewData) {
                const mergedContent = { ...blockDef.previewData };
                // 用 UI 的實際內容覆蓋預設內容
                for (const key in uiBlockData.content) {
                    if (uiBlockData.content[key]) { // 只有當 UI 有內容時才覆蓋
                        mergedContent[key] = uiBlockData.content[key];
                    }
                }
                // 關鍵修復：保留 removedFields 資訊，讓 layout-manager.js 知道哪些欄位被刪除
                return { ...uiBlockData, content: mergedContent, removedFields: uiBlockData.removedFields };
            }
            return uiBlockData;
        });


        const { html } = LayoutManager.generateContentHTML(layoutId, mergedData);
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

        const { html } = LayoutManager.generateContentHTML(layoutId, orderedData);
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

        navigator.clipboard.writeText(code).then(() => {
            UIManager.showCopyMessage("👍🏻 成功複製到剪貼簿！", true);
        }).catch(err => {
            console.error("Copy failed:", err);
            UIManager.showCopyMessage("複製失敗，請手動選取。", false);
        });
    },

    async handleParseMarkdown() {
        const markdown = UIManager.getMarkdownInput();
        const layoutId = UIManager.getSelectedLayoutId();
        if (!markdown.trim()) {
            alert("Markdown 貼上區沒有內容！");
            return;
        }
        if (!layoutId) {
            alert("請先選擇一個排版樣式！");
            return;
        }

        // --- 特殊處理 article-15 (電子表單B-公司資訊) ---
        if (layoutId === 'article-15') {
            // 1. 解析 Markdown 並在 UI 中建立對應的編輯欄位
            this._parseAndPopulateArticle15UI(markdown);

            // 2. 禁用按鈕並準備產生結果
            UIManager.elements.parseMarkdownButton.disabled = true;

            // 3. 確保在 UI 更新後再執行生成，並捲動到結果區
            Promise.resolve().then(() => {
                this.handleGenerate();
            });
            return; // 結束函式，不執行後續的通用解析流程
        }
        // --- 特殊處理結束 ---

        // 重建區塊
        this.handleLayoutChange();
        // 等待 DOM 更新
        await new Promise(resolve => setTimeout(resolve, 0));

        // 解析並填入
        const parsedBlocks = this._parseMarkdown(markdown, layoutId);
        this._populateUIWithParsedData(parsedBlocks, layoutId);

        this.updatePreview();
        UIManager.elements.parseMarkdownButton.disabled = true;
        UIManager.setGenerateButtonState(true); // 在解析完成後，啟用產生按鈕

        // 使用 Promise.resolve().then() 確保在所有同步操作和事件處理完成後再執行
        Promise.resolve().then(() => {
            this.handleGenerate();
        });
    },

    _parseMarkdown(markdown, layoutId) {
        // 升級版 Markdown 解析邏輯
        const lines = markdown.split('\n').map(l => l.trim());
        const blocks = [];

        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            // 忽略以 // 開頭的註解行
            if (line.startsWith('//')) {
                continue;
            }

            // 忽略不相關的行
            if (!line || line === '---') {
                continue;
            }

            // 偵測卡片式結構 (圖片 + H3 + P)
            if (line.match(/!\[.*\]\[image.*\]/)) {
                const imageUrl = line; // 暫存圖片標記
                const nextLineIndex = i + 1;
                const thirdLineIndex = i + 2;

                if (nextLineIndex < lines.length && lines[nextLineIndex].startsWith('### ')) {
                    const title = lines[nextLineIndex].substring(4).trim();
                    const description = (thirdLineIndex < lines.length && !lines[thirdLineIndex].startsWith('#')) ? lines[thirdLineIndex] : '';
                    blocks.push({ type: 'IMAGE_TITLE_DESC_CARD', content: { URL: imageUrl, TITLE: title, DESC: description } });
                    i = description ? thirdLineIndex : nextLineIndex; // 跳過已處理的行
                    continue;
                }
            }

            // 將以 **...** 包裹的獨立行視為 H3 (因為 H2 通常由 ## 定義)
            if (line.startsWith('**') && line.endsWith('**')) {
                blocks.push({ type: 'H3', content: line.substring(2, line.length - 2).trim().replace(/(\d+)\\\./, '$1.') });
                continue;
            }
            // 新規則：# -> H1 (大標題，會被對應到輸出的 H2)
            if (line.startsWith('# ')) {
                const cleanContent = line.substring(2).trim().replace(/\*\*/g, '');
                blocks.push({ type: 'H1', content: cleanContent });
                continue;
            }
            // 新規則：## -> H2 (副標題，會被對應到輸出的 H3)
            if (line.startsWith('## ')) {
                const cleanContent = line.substring(3).trim().replace(/\*\*/g, '');
                blocks.push({ type: 'H2', content: cleanContent });
                continue;
            }
            // 新規則：### -> H3 (項目標題)
            // 修正：支援沒有內容的 ### (被 trim() 後變成 "###")
            if (line.startsWith('###')) {
                const cleanContent = line.substring(3).trim().replace(/\*\*/g, '');
                blocks.push({ type: 'H3', content: cleanContent });
                continue;
            }
            // 新規則：#### -> H4 (更小標題)
            if (line.startsWith('#### ')) {
                const cleanContent = line.substring(5).trim().replace(/\*\*/g, '');
                blocks.push({ type: 'H4', content: cleanContent });
                continue;
            }
            // 將以 * 開頭的行視為 UL 列表
            const listItemRegex = /^[\*\-]\s+/;
            if (line.startsWith('*') || line.startsWith('-')) { // 使用更寬鬆的判斷來開始收集
                let listItems = [];
                while (i < lines.length && lines[i] && listItemRegex.test(lines[i])) {
                    // 移除行內的 ** 粗體標記
                    listItems.push(lines[i].replace(/\*\*/g, ''));
                    i++;
                }
                i--;
                blocks.push({ type: 'UL', content: listItems.join('\n') });
                continue;
            }
            // 新增：智慧判斷有序列表
            const olMatch = line.match(/^\d+\.\s/);
            if (olMatch) {
                let listItems = [];
                let tempIndex = i;
                // 預先掃描，計算連續的列表項數量
                while (tempIndex < lines.length && lines[tempIndex]?.trim().match(/^\d+\.\s/)) {
                    tempIndex++;
                }
                if ((tempIndex - i) > 1) { // 如果連續項目超過一個，才視為列表
                    while (i < lines.length && lines[i]?.trim().match(/^\d+\.\s/)) {
                        listItems.push(lines[i].trim().replace(/^\d+\.\s/, ''));
                        i++;
                    }
                    i--; // 回溯一行
                    blocks.push({ type: 'OL', content: { LIST_ITEMS: listItems.join('\n') } });
                    continue;
                }
            }

            // 新增：偵測表格區塊
            if (line.startsWith('|')) {
                let tableLines = [];
                // 收集所有連續的表格行
                while (i < lines.length && lines[i]?.trim().startsWith('|')) {
                    tableLines.push(lines[i].trim());
                    i++;
                }
                i--; // 回溯一行 
                blocks.push({ type: 'TABLE', content: tableLines.join('\n') });
                continue;
            }

            // 新增：偵測 <a> 標籤
            const anchorMatch = line.match(/<a\s+(?:[^>]*?\s+)?href="([^"]*)"[^>]*>(.*?)<\/a>/);
            if (anchorMatch) {
                const href = anchorMatch[1];
                const text = anchorMatch[2] || ''; // 處理空連結的狀況
                blocks.push({ type: 'A', content: { HREF: href, TEXT: text } });
                continue;
            }

            // 新增：偵測標準 Markdown 圖片
            const imageMatch = line.match(/^!\[(.*?)\]\((.*?)\)/);
            if (imageMatch) {
                let url = imageMatch[2];
                // 只要不是 .jpg, .png, .webp 結尾，就替換為假圖
                if (!url.match(/\.(jpg|jpeg|png|webp)$/i)) {
                    url = 'https://system16.webtech.com.tw/web/202500107/archive/image/article1/images/about-pic-1.jpg';
                }
                blocks.push({ type: 'IMAGE', content: { ALT: imageMatch[1], URL: url } });
                continue;
            }

            // 修改：偵測 Markdown 連結，並判斷是否為圖片
            const linkMatch = line.match(/^\[(.*?)\]\((.*?)\)/);
            if (linkMatch) {
                const text = linkMatch[1];
                let href = linkMatch[2];

                // 判斷是否為圖片連結 (副檔名 或 Google Drive 連結)
                const isImage = href.match(/\.(webp|jpg|jpeg|png|gif)$/i) ||
                    text.match(/\.(webp|jpg|jpeg|png|gif)$/i) ||
                    href.includes('drive.google.com');

                if (isImage) {
                    // 只要不是 .jpg, .png, .webp 結尾，就替換為假圖
                    if (!href.match(/\.(jpg|jpeg|png|webp)$/i)) {
                        href = 'https://system16.webtech.com.tw/web/202500107/archive/image/article1/images/about-pic-1.jpg';
                    }
                    blocks.push({ type: 'IMAGE', content: { ALT: text, URL: href } });
                } else {
                    blocks.push({ type: 'A', content: { HREF: href, TEXT: text } });
                }
                continue;
            }

            // 其他所有非空行都視為段落 P，並移除粗體標記
            // 移除 ** 粗體標記、數字後的轉義反斜線
            const cleanLine = line.replace(/(\d+)\\\./, '$1.');
            blocks.push({ type: 'P', content: cleanLine });
        }
        return blocks;
    },

    /**
     * 全新的通用智慧解析引擎
     * 根據版型的 parsingConfig 動態解析 Markdown 並填入 UI。
     * @param {Array} parsedBlocks - 解析後的 Markdown 區塊
     * @param {string} layoutId - 版型 ID
     * @param {object} layoutDef - 版型定義
     */
    _populateFromConfig(parsedBlocks, layoutId, layoutDef) {
        console.log(`[Parser] Populating from config for ${layoutId}`);
        // 創建一個副本進行操作，避免修改原始陣列
        let remainingBlocks = [...parsedBlocks];

        const config = layoutDef.parsingConfig;
        if (!config) return; // 如果沒有設定，就直接返回

        // --- 原子化解析模式 (Atomic Parsing) ---
        // 適用於需要精確控制每個 Markdown 區塊對應到 UI 區塊的版型
        if (config.atomicParsing) {
            console.log(`[Parser] Using Atomic Parsing mode`);

            // 1. 填入主標題 (如果有的話)
            if (config.mainTitle) {
                const mainTitleData = parsedBlocks.find(b => b.type === config.mainTitle);
                if (mainTitleData) {
                    const mainTitleBlock = UIManager.elements.dynamicContentContainer.querySelector('[data-field="H2"]');
                    if (mainTitleBlock) {
                        mainTitleBlock.value = mainTitleData.content;
                        mainTitleBlock.dispatchEvent(new Event('input', { bubbles: true }));

                        // 特殊處理：標記 MAIN_TEXT 區塊中未使用的欄位為已移除
                        const mainTextContainer = mainTitleBlock.closest('[data-type="MAIN_TEXT"]');
                        if (mainTextContainer) {
                            // 標記 H3 (副標題) 為已移除
                            const h3Field = mainTextContainer.querySelector('[data-field="H3"]');
                            if (h3Field) {
                                h3Field.value = '';
                                h3Field.dataset.fieldRemoved = 'true';
                            }

                            // 標記 H3_TAG 為已移除
                            const h3TagField = mainTextContainer.querySelector('[data-field="H3_TAG"]');
                            if (h3TagField) {
                                h3TagField.dataset.fieldRemoved = 'true';
                            }

                            // 標記 P (敘述) 為已移除
                            const pField = mainTextContainer.querySelector('[data-field="P"]');
                            if (pField) {
                                pField.value = '';
                                pField.dataset.fieldRemoved = 'true';
                            }
                        }
                    }
                }
            }

            // 2. 處理剩餘區塊
            // 排除已使用的主標題
            const usedBlocks = [];
            if (config.mainTitle) {
                const mainTitleBlock = parsedBlocks.find(b => b.type === config.mainTitle);
                if (mainTitleBlock) usedBlocks.push(mainTitleBlock);
            }

            // 特殊處理：如果是原子化解析，且沒有特別指定 MAIN_IMAGE，則將預設的 MAIN_IMAGE 區塊隱藏
            // 這樣可以讓圖片作為一般內容區塊插入到文字流中
            const mainImageUiBlock = UIManager.elements.dynamicContentContainer.querySelector('[data-type="MAIN_IMAGE"]');
            if (mainImageUiBlock) {
                const urlInput = mainImageUiBlock.querySelector('[data-field="URL"]');
                if (urlInput) {
                    urlInput.value = '';
                    urlInput.dataset.fieldRemoved = 'true'; // 標記為已移除
                }
                mainImageUiBlock.style.display = 'none'; // 在 UI 上隱藏
            }

            const contentBlocks = parsedBlocks.filter(b => !usedBlocks.includes(b));

            // 清除預設的初始區塊 (除了主標題、主圖片和必要的容器)
            // 這裡我們假設 atomicParsing 模式下，除了主標題外，其他內容都由 Markdown 動態生成
            // 但為了保險起見，我們先保留不可移除的區塊

            // 策略：
            // 1. 找到最後一個非動態生成的區塊作為插入點
            // 2. 依序創建新區塊

            let lastBlockId = null;
            // 嘗試找到主標題區塊作為起始點
            const mainTitleUiBlock = UIManager.elements.dynamicContentContainer.querySelector('[data-type="MAIN_TEXT"]'); // 修正：應該找 MAIN_TEXT 區塊
            if (mainTitleUiBlock) {
                lastBlockId = mainTitleUiBlock.id;
            } else {
                // 如果沒有主標題區塊，就找最後一個區塊
                const lastBlock = UIManager.elements.dynamicContentContainer.querySelector('.dynamic-block:last-child');
                lastBlockId = lastBlock ? lastBlock.id : null;
            }

            // 定義 Markdown 類型到 UI 類型的映射
            const typeMapping = config.blockMapping || {
                'H3': 'H3',
                'P': 'P',
                'UL': 'UL',
                'OL': 'OL',
                'IMAGE': 'IMAGE',
                'H4': 'H4'
            };

            contentBlocks.forEach(block => {
                const uiType = typeMapping[block.type];
                if (uiType) {
                    // 創建新區塊
                    const newBlock = UIManager.createBlock(this._getFullBlockInfo({ type: uiType, isRemovable: true }, layoutDef), lastBlockId);
                    lastBlockId = newBlock.id;

                    // 填入內容
                    const contentField = uiType === 'IMAGE' ? 'URL' :
                        uiType === 'UL' || uiType === 'OL' ? 'LIST_ITEMS' : 'TEXT';

                    const input = newBlock.querySelector(`[data-field="${contentField}"]`);
                    if (input) {
                        if (uiType === 'IMAGE') {
                            input.value = block.content.URL;
                            const altInput = newBlock.querySelector(`[data-field="ALT"]`);
                            if (altInput) altInput.value = block.content.ALT;
                        } else {
                            input.value = block.content;
                        }
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                }
            });

            return; // 原子化解析完成，直接返回
        }

        // --- 步驟 1: 填入主標題和副標題 ---
        if (config.mainTitle) { // 處理主標題 (H2)
            const mainTitleData = parsedBlocks.find(b => b.type === config.mainTitle);
            if (mainTitleData) {
                let mainTitleBlock;
                // 支援 article-15 的特殊主標題目標
                if (config.mainTitleTarget) {
                    const targetContainer = UIManager.elements.dynamicContentContainer.querySelector(`[data-type="${config.mainTitleTarget.blockType}"]`);
                    mainTitleBlock = targetContainer?.querySelector(`[data-field="${config.mainTitleTarget.field}"]`);
                } else {
                    mainTitleBlock = UIManager.elements.dynamicContentContainer.querySelector('[data-field="H2"]');
                }

                if (mainTitleBlock) {
                    mainTitleBlock.value = mainTitleData.content;
                    mainTitleBlock.dispatchEvent(new Event('input', { bubbles: true }));

                    // 特殊處理：如果是 MAIN_TEXT 區塊，且使用原子化解析，
                    // 則將未使用的副標題 (H3) 和敘述 (P) 標記為已移除，避免顯示預設內容
                    const mainTextContainer = mainTitleBlock.closest('[data-type="MAIN_TEXT"]');
                    if (mainTextContainer) {
                        const h3Field = mainTextContainer.querySelector('[data-field="H3"]');
                        const pField = mainTextContainer.querySelector('[data-field="P"]');

                        if (h3Field) {
                            h3Field.value = '';
                            h3Field.dataset.fieldRemoved = 'true';
                        }
                        if (pField) {
                            pField.value = '';
                            pField.dataset.fieldRemoved = 'true';
                        }
                    }
                }
                // 不再從 parsedBlocks 中移除，因為 H2 可能也是一個項目的一部分
            }
        }

        if (config.subTitle) { // 處理副標題 (H3)
            const h3Data = parsedBlocks.find(b => b.type === config.subTitle);
            if (h3Data) {
                // 修正：不再假設標題只在 TITLE_BLOCK 中，而是搜尋整個容器
                const subTitleBlock = UIManager.elements.dynamicContentContainer.querySelector('[data-field="H3"]');
                if (subTitleBlock) {
                    // 檢查欄位是否可見 (未被使用者手動移除)
                    // 如果找不到 .removable-field，表示它不是可移除的欄位（例如固定標題），則視為可見
                    const removableWrapper = subTitleBlock.closest('.removable-field');
                    if (!removableWrapper || removableWrapper.style.display !== 'none') {
                        subTitleBlock.value = h3Data.content;
                        subTitleBlock.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                }
                // 不再從 parsedBlocks 中移除
            }
        }

        // --- 步驟 2: 將剩餘的區塊分組 ---
        const itemGroups = [];
        let currentGroup = [];
        const identifiers = Array.isArray(config.itemIdentifier)
            ? config.itemIdentifier
            : [config.itemIdentifier];

        // 篩選掉已經被用作主標題和副標題的頂層 H2/H3
        const h2Block = parsedBlocks.find(b => b.type === config.mainTitle); // 沿用舊的，避免影響其他版型
        const h3Block = parsedBlocks.find(b => b.type === config.subTitle); // 沿用舊的

        remainingBlocks = parsedBlocks.filter(b => b !== h2Block && b !== h3Block);

        // 全新的、更可靠的分組邏輯
        for (const block of remainingBlocks) {
            if (identifiers.includes(block.type) && currentGroup.length > 0) {
                itemGroups.push(currentGroup);
                currentGroup = [block];
            } else {
                currentGroup.push(block);
            }
        }
        if (currentGroup.length > 0) {
            itemGroups.push(currentGroup);
        }

        console.log(`[Parser] Found ${itemGroups.length} item groups`);

        // --- 步驟 2.5: 處理簡單版型（沒有 itemMapping）---
        // 對於 article-01/02/03 這類只有 H1/H2 和段落文字的簡單版型
        if (!config.itemMapping && remainingBlocks.length > 0) {
            console.log(`[Parser] Simple layout detected, filling P field directly`);
            const pBlocks = remainingBlocks.filter(b => b.type === 'P' || b.type === 'UL');
            if (pBlocks.length > 0) {
                const combinedText = pBlocks.map(b => b.content).join('\n\n');
                const pField = UIManager.elements.dynamicContentContainer.querySelector('[data-field="P"]');
                if (pField) {
                    pField.value = combinedText;
                    // 重要：移除 fieldRemoved 標記，確保內容會被渲染
                    delete pField.dataset.fieldRemoved;
                    pField.dispatchEvent(new Event('input', { bubbles: true }));
                    console.log(`[Parser] Filled P field with ${combinedText.length} characters`);
                }
            }
            return; // 簡單版型不需要繼續處理項目列表
        }

        // --- 步驟 3: 填入項目列表 ---
        // 取得所有初始的項目區塊，並轉換成一個可操作的陣列
        // 修正：使用更精確的選擇器，排除主標題和主圖片區塊，只選取作為列表項目的區塊
        const initialUiItemBlocks = Array.from(UIManager.elements.dynamicContentContainer.children).filter(el =>
            el.matches('.dynamic-block') &&
            !el.matches('[data-type="MAIN_TEXT"]') &&
            !el.matches('[data-type="MAIN_IMAGE"]') &&
            !el.matches('[data-type="TITLE_BLOCK"]')
        );

        console.log(`[Parser] Initial UI blocks found: ${initialUiItemBlocks.length}`);
        initialUiItemBlocks.forEach((b, i) => console.log(`  Block ${i}: id=${b.id}, type=${b.dataset.type}`));

        let filledBlocksCount = 0;

        itemGroups.forEach((group, index) => {
            // **核心修正：根據內容動態決定區塊類型**
            const blockType = config.dynamicItemBlockType ? config.dynamicItemBlockType(group) : config.itemBlockType;
            if (!blockType) return; // 如果無法決定類型，則跳過

            let targetUiBlock = initialUiItemBlocks[index];

            // 如果現有的 UI 區塊類型不符，則在相同位置上替換它
            if (targetUiBlock && targetUiBlock.dataset.type !== blockType) {
                const newBlock = UIManager.createBlock(this._getFullBlockInfo({ type: blockType, isRemovable: true }, layoutDef), targetUiBlock.previousElementSibling?.id);
                UIManager.removeBlock(targetUiBlock.id);
                targetUiBlock = newBlock;
                // 更新 UI 區塊列表的參照，但此處不需要，因為我們只關心初始列表
            }

            if (!targetUiBlock) {
                // 如果預設的 UI 區塊不夠用，就動態創建新的
                const lastBlock = UIManager.elements.dynamicContentContainer.querySelector('.dynamic-block:last-child');
                const lastBlockId = lastBlock ? lastBlock.id : null;
                targetUiBlock = UIManager.createBlock(this._getFullBlockInfo({ type: blockType, isRemovable: true }, layoutDef), lastBlockId);
            }

            if (!targetUiBlock) return;
            filledBlocksCount++;

            const contentMap = group.reduce((acc, block) => {
                if ((block.type === 'P' || block.type === 'UL') && acc[block.type]) {
                    acc[block.type] += `\n\n${block.content}`;
                } else {
                    acc[block.type] = block.content;
                }
                return acc;
            }, {});

            console.log(`[Parser] Filling block ${targetUiBlock.id} with`, contentMap);

            // 內容已在 contentMap['P'] 中，直接傳遞給 _fillUiBlock 處理

            this._fillUiBlock(targetUiBlock, contentMap, config.itemMapping);
        });

        // --- 步驟 4: 移除多餘的初始 UI 區塊 ---
        if (initialUiItemBlocks.length > filledBlocksCount) {
            for (let i = filledBlocksCount; i < initialUiItemBlocks.length; i++) {
                UIManager.removeBlock(initialUiItemBlocks[i].id);
            }
        }
    },

    _populateUIWithParsedData(parsedBlocks, layoutId) {
        const layoutDef = getLayoutDefinition(layoutId);
        if (!layoutDef) return;

        // --- 智慧解析總指揮 ---
        if (layoutDef.parsingConfig) {
            this._populateFromConfig(parsedBlocks, layoutId, layoutDef);
        } else {
            // 預設的 SEO Blog 填入邏輯
            this._populateDefaultSeoBlog(parsedBlocks, layoutId);
        }
    },


    _populateDefaultSeoBlog(parsedBlocks, layoutId) {
        const mainTextInput = document.querySelector('.dynamic-block[data-type="MAIN_TEXT"]');
        const mainImageInput = document.querySelector('.dynamic-block[data-type="MAIN_IMAGE"]');
        if (!mainTextInput) return;

        const h2Input = mainTextInput.querySelector('[data-field="H2"]');
        const h3Input = mainTextInput.querySelector('[data-field="H3"]');
        const pInput = mainTextInput.querySelector('[data-field="P"]');

        const h2Block = parsedBlocks.find(b => b.type === 'H2');
        const h3Block = parsedBlocks.find(b => b.type === 'H3');

        if (h2Input && h2Block) {
            h2Input.value = h2Block.content;
            h2Input.dispatchEvent(new Event('input', { bubbles: true }));
            parsedBlocks.splice(parsedBlocks.indexOf(h2Block), 1);
        }

        if (h3Input && h3Block) {
            h3Input.value = h3Block.content;
            h3Input.dispatchEvent(new Event('input', { bubbles: true }));

            const pIndex = parsedBlocks.indexOf(h3Block) + 1;
            if (pInput && pIndex < parsedBlocks.length && parsedBlocks[pIndex].type === 'P') {
                pInput.value = parsedBlocks[pIndex].content;
                pInput.dispatchEvent(new Event('input', { bubbles: true }));
                parsedBlocks.splice(parsedBlocks.indexOf(h3Block), 2);
            } else {
                parsedBlocks.splice(parsedBlocks.indexOf(h3Block), 1);
            }
        }

        if (mainImageInput) {
            const mainImageUrlInput = mainImageInput.querySelector('[data-field="URL"]');
            const mainImageAltInput = mainImageInput.querySelector('[data-field="ALT"]');
            const firstImage = parsedBlocks.find(b => b.type === 'IMAGE');
            if (firstImage) {
                mainImageUrlInput.value = firstImage.content.URL;
                mainImageAltInput.value = firstImage.content.ALT;
                mainImageUrlInput.dispatchEvent(new Event('input', { bubbles: true }));
                mainImageAltInput.dispatchEvent(new Event('input', { bubbles: true }));
                parsedBlocks.splice(parsedBlocks.indexOf(firstImage), 1);
            }
        }

        let lastBlockId = mainImageInput?.id || mainTextInput.id;
        const remainingBlocks = parsedBlocks;

        remainingBlocks.forEach(block => {
            if (!lastBlockId) return;
            const blockInfo = this._getFullBlockInfo({ type: block.type, isRemovable: true }, getLayoutDefinition(layoutId));
            const newBlockElement = UIManager.createBlock(blockInfo, lastBlockId);
            const inputField = newBlockElement.querySelector('textarea, input');
            if (inputField && block.content) {
                if (typeof block.content === 'object') {
                    if (block.content.LIST_ITEMS) {
                        inputField.value = block.content.LIST_ITEMS;
                        inputField.dispatchEvent(new Event('input', { bubbles: true }));
                    } else if (block.type === 'IMAGE' || block.type === 'A' || block.type === 'ANCHOR_ITEM') {
                        // Handle complex blocks with multiple fields
                        this._fillBlockContent(newBlockElement, block.content);
                    } else {
                        // Fallback for other objects?
                        inputField.value = JSON.stringify(block.content);
                        inputField.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                } else {
                    inputField.value = block.content;
                    inputField.dispatchEvent(new Event('input', { bubbles: true }));
                }
            }
            lastBlockId = newBlockElement.id;
        });
    },

    /**
     * 輔助函式：將物件內容填入區塊的多個欄位
     */
    _fillBlockContent(blockElement, contentObj) {
        for (const key in contentObj) {
            const input = blockElement.querySelector(`[data-field="${key}"]`);
            if (input) {
                input.value = contentObj[key];
                input.dispatchEvent(new Event('input', { bubbles: true }));
            }
        }
    },

    /**
     * 根據 contentMap 和 mapping 規則，將資料填入指定的 UI 區塊。
     * @param {HTMLElement} uiBlock - 目標 UI 區塊元素。
     * @param {object} contentMap - 從 Markdown group 整理出的內容對照表。
     * @param {object} mapping - 版型定義中的 itemMapping 規則。
     */
    _fillUiBlock(uiBlock, contentMap, mapping) {
        const processedFields = new Set();

        for (const mdType in mapping) {
            const rule = mapping[mdType];
            const content = contentMap[mdType];
            if (content === undefined) continue;

            if (typeof rule === 'string') { // 簡單對應: 'H3' -> 'TITLE'
                const fieldName = rule.toUpperCase();

                const input = uiBlock.querySelector(`[data-field="${fieldName}"]`);
                if (input && content) {
                    console.log(`[Parser] Filling ${fieldName} with "${content.substring(0, 20)}..."`);
                    input.value = content;
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                } else {
                    console.warn(`[Parser] Field ${fieldName} not found in block ${uiBlock.id} or content empty`);
                }

            } else if (typeof rule === 'object') { // 複雜對應: 'IMAGE' -> { URL: 'URL', ALT: 'ALT' }
                for (const sourceField in rule) {
                    const targetField = rule[sourceField].toUpperCase();
                    const input = uiBlock.querySelector(`[data-field="${targetField}"]`);
                    if (input && content[sourceField]) {
                        console.log(`[Parser] Filling ${targetField} with "${content[sourceField].substring(0, 20)}..."`);
                        input.value = content[sourceField];
                        input.dispatchEvent(new Event('input', { bubbles: true }));
                    } else {
                        console.warn(`[Parser] Field ${targetField} not found in block ${uiBlock.id} or content empty`);
                    }
                }
            }
        }
    },

    /**
     * [特殊] 專為 article-15 設計的解析與 UI 填充函式。
     * 它會解析 Markdown，然後按照順序在「內容排序與編輯」區塊建立對應的欄位。
     * @param {string} markdownText - 使用者輸入的 Markdown 字串。
     */
    _parseAndPopulateArticle15UI(markdownText) {
        const lines = markdownText.split('\n').filter(line => line.trim() !== '');
        let companyName = '公司名稱'; // 預設值
        const items = [];
        let currentTitle = '';
        let currentContent = [];

        // 1. 尋找 h3 (###) 作為公司名稱
        const h3Match = markdownText.match(/^###\s*\**(.+?)\**\s*$/m);
        if (h3Match) {
            companyName = h3Match[1].trim();
        }

        // 2. 逐行解析，將 h4 (####) 及其後續內容分組
        for (const line of lines) {
            const h4Match = line.match(/^####\s*\**(.+?)\**\s*$/);
            if (h4Match) {
                // 如果有正在處理的區塊，先儲存起來
                if (currentTitle) {
                    items.push({ title: currentTitle, content: currentContent });
                }
                // 開始一個新的區塊
                currentTitle = h4Match[1].trim();
                currentContent = [];
            } else if (currentTitle && !line.startsWith('###')) {
                // 將內容行加入當前區塊
                currentContent.push(line.trim());
            }
        }

        // 儲存最後一個處理中的區塊
        if (currentTitle) {
            items.push({ title: currentTitle, content: currentContent });
        }

        // 3. 清空並根據解析結果重建 UI
        UIManager.clearAllBlocks();
        const layoutDef = getLayoutDefinition('article-15');
        let lastBlockId = null;

        // 建立公司名稱區塊
        const nameBlockInfo = this._getFullBlockInfo({ type: 'COMPANY_NAME', isRemovable: false }, layoutDef);
        const nameBlock = UIManager.createBlock(nameBlockInfo);
        const nameInput = nameBlock.querySelector('[data-field="COMPANY_NAME"]');
        if (nameInput) {
            nameInput.value = companyName;
            nameInput.dispatchEvent(new Event('input', { bubbles: true })); // 觸發更新
        }
        lastBlockId = nameBlock.id;

        // 依照順序建立項目區塊
        items.forEach(item => {
            const contentString = item.content.join('\n');
            // 智慧判斷：內容是否包含 tel: 或 mailto: 來決定區塊類型
            const isLinkItem = item.content.some(line => line.includes('tel:') || line.includes('mailto:'));
            const blockType = isLinkItem ? 'COMPANY_LINK_ITEM' : 'COMPANY_TEXT_ITEM';

            const itemBlockInfo = this._getFullBlockInfo({ type: blockType, isRemovable: true }, layoutDef);
            const newBlock = UIManager.createBlock(itemBlockInfo, lastBlockId);

            const labelInput = newBlock.querySelector('[data-field="LABEL"]');
            const textInput = newBlock.querySelector('[data-field="TEXT"]');

            if (labelInput) {
                labelInput.value = item.title;
                labelInput.dispatchEvent(new Event('input', { bubbles: true })); // 觸發更新
            }
            if (textInput) {
                textInput.value = contentString;
                textInput.dispatchEvent(new Event('input', { bubbles: true })); // 觸發更新
            }

            lastBlockId = newBlock.id;
        });
    }
}


App.init();
