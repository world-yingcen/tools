/**
 * @file layout-manager.js
 * @description 應用程式的「版型切換器」和「HTML產生器」。
 */

import { getLayoutDefinition } from './layouts.js';

export const LayoutManager = {
    /**
     * 根據版型和資料生成最終的 HTML。
     * @param {string} layoutId - 當前選擇的版型 ID。
     * @param {Array<object>} orderedData - 從 UI 獲取的有序區塊資料。
     * @param {object} config - 設定物件，包含 articleClassPrefix 和 ctaConfig。
     * @returns {{html: string, style: string}} - 生成的 HTML 和版型 ID。
     */
    generateContentHTML(layoutId, orderedData, config = {}) {
        const layoutDef = getLayoutDefinition(layoutId);
        if (!layoutDef) {
            return { html: '<!-- 錯誤：找不到版型定義 -->', style: 'error' };
        }

        // 預設設定
        const defaultConfig = {
            articleClassPrefix: 'world-article',
            ctaConfig: {
                defaultTitle: '準備好在市場脫穎而出了嗎？',
                defaultDescription: '沃德品牌顧問憑藉精準的策略思維，找出品牌差異化的關鍵，從品牌形象規劃到影像製作、網站設計以及廣告行銷，透過整合全方位的品牌價值，助您打造獨特的競爭力。',
                buttonText: '立即諮詢',
                buttonHref: '/contact',
                bgImageUrl: 'https://www.world-group.com.tw/storage/news/3/ed_678ef9e6ed5fc.webp',
                bgImageAlt: '立即諮詢設計服務'
            }
        };

        // 合併設定
        this.currentConfig = {
            ...defaultConfig,
            ...config,
            ctaConfig: { ...defaultConfig.ctaConfig, ...(config.ctaConfig || {}) }
        };

        // 建立一個版型與生成函式的映射
        const layoutGenerators = {};

        // 如果選擇的版型有對應的專用生成器，就使用它
        if (layoutGenerators[layoutId]) {
            return layoutGenerators[layoutId].call(this, orderedData, layoutId);
        }

        // --- 以下是預設的 SEO Blog 生成邏輯 ---
        return this._generateDefaultSeoBlogHTML(orderedData, layoutId);
    },

    _generateDefaultSeoBlogHTML(orderedData, layoutId) {
        let content = [];
        let i = 0;
        let h2Counter = 0;
        const prefix = this.currentConfig.articleClassPrefix;

        while (i < orderedData.length) {
            const block = orderedData[i];
            const blockType = block.type;
            const blockId = block.id;

            if (blockType === 'AUTHOR_BLOCK') {
                let innerContent = [];
                let k = i + 1;
                // 收集所有屬於這個 AUTHOR_BLOCK 的子區塊。
                // 子區塊的定義是：在下一個頂層容器出現之前的所有區塊。
                while (k < orderedData.length && !['AUTHOR_BLOCK', 'ANCHOR_LIST', 'MAIN_CONTENT_BLOCK', 'CTA'].includes(orderedData[k].type)) {
                    if (orderedData[k].type === 'H2') {
                        h2Counter++;
                    }
                    innerContent.push(this._generateIndependentBlockHtml(orderedData[k], 0, h2Counter));
                    k++;
                }
                const innerHtml = innerContent.join('\n');
                const blockHtml = `
<div class="${prefix} ${prefix}-01">
    <div class="sub-block">
${innerHtml || '        <!-- 引言區塊內容為空 -->'}
    </div>
</div>`;
                content.push(blockHtml);
                i = k; // 將索引跳到已處理的子區塊之後
                continue;
            }
            // Handle ANCHOR_LIST as a container
            if (blockType === 'ANCHOR_LIST') {
                let listItemsHTML = [];
                let k = i + 1;
                // 收集所有後續的 ANCHOR_ITEM 區塊
                while (k < orderedData.length && orderedData[k].type === 'ANCHOR_ITEM') {
                    listItemsHTML.push(this._generateIndependentBlockHtml(orderedData[k], k - i)); // Pass index for section-ID
                    k++;
                }

                // Miracle article uses <ul>, World article uses <ol> inside <details>
                // Need to check if structure is different or just classes.
                // World: <div class="world-article world-article-02"><details open><summary>目錄</summary><ol class="anchor-list">...</ol></details></div>
                // Miracle: <div class="miracle-article miracle-article-02"><ul class="anchor-list">...</ul></div>

                let blockHtml = '';
                if (prefix === 'world-article') {
                    blockHtml = `
<div class="${prefix} ${prefix}-02">
    <details open>
        <summary>目錄</summary>
    <ol class="anchor-list">
${listItemsHTML.join('\n') || '        <!-- 請在錨點連結區塊輸入內容 -->'}
    </ol>
    </details>

</div>`;
                } else {
                    blockHtml = `
<div class="${prefix} ${prefix}-02">
    <ul class="anchor-list">
${listItemsHTML.join('\n') || '        <!-- 請在錨點連結區塊輸入內容 -->'}
    </ul>
</div>`;
                }

                content.push(blockHtml);
                i = k; // 將索引跳到已處理的子區塊之後
                continue;
            }
            // Handle MAIN_CONTENT_BLOCK as a container
            if (blockType === 'MAIN_CONTENT_BLOCK') {
                let innerContent = [];
                let k = i + 1;
                // 收集所有屬於這個 MAIN_CONTENT_BLOCK 的子區塊。
                while (k < orderedData.length && !['AUTHOR_BLOCK', 'ANCHOR_LIST', 'MAIN_CONTENT_BLOCK', 'CTA'].includes(orderedData[k].type)) {
                    if (orderedData[k].type === 'H2') {
                        h2Counter++;
                    }
                    innerContent.push(this._generateIndependentBlockHtml(orderedData[k], 0, h2Counter));
                    k++;
                }
                const innerHtml = innerContent.join('\n');
                const blockHtml = `
<div class="${prefix}">
${innerHtml || '    <!-- 主內容編輯區為空 -->'}
</div>`;
                content.push(blockHtml);
                i = k; // 將索引跳到已處理的子區塊之後
                continue;
            }
            // Handle CTA as a top-level container
            if (blockType === 'CTA') {
                content.push(this._generateCtaHtml(block.content));
                i++;
                continue;
            }
            // 處理未配對的獨立區塊
            if (block.type === 'H2') {
                h2Counter++;
            }
            content.push(this._generateIndependentBlockHtml(block, 0, h2Counter));
            i++;
        }

        return { html: content.join("\n"), style: layoutId };
    },

    _generateIndependentBlockHtml(block, index = 0, h2Index = 0) { // Add index parameter for ANCHOR_ITEM and h2Index
        const { type, content: blockContent } = block;
        const prefix = this.currentConfig.articleClassPrefix;

        const text = (blockContent.TEXT || '').replace(/\*\*/g, ''); // Remove bold markers

        switch (type) {
            case 'AUTHOR': return `        <span class="article-author">小編：${this._escapeHtml(text || '葉大雄').replace(/\n/g, "<br>")}</span>`;
            case 'ANCHOR_ITEM':
                const anchorText = blockContent.TEXT || `錨點${index}`;
                const anchorHref = blockContent.HREF || `#section-${index}`; // Do not escape href
                return `        <li><a href="${anchorHref}">${this._escapeHtml(anchorText)}</a></li>`;
            case 'H2':
                const h2Id = `section-${String(h2Index).padStart(2, '0')}`;
                return `        <h2 class="content-title" id="${h2Id}">${this._escapeHtml(text || '範例標題').replace(/\n/g, "<br>")}</h2>`;
            case 'H3': return `        <h3>${this._escapeHtml(text).replace(/\n/g, "<br>")}</h3>`;
            case 'H4': return text ? `        <h4>${this._escapeHtml(text).replace(/\n/g, "<br>")}</h4>` : '';
            case 'P': return `    <p>${this._escapeHtml(text || 'ㄤ~ㄤ~ㄤ~小叮噹幫我實現所有~的願望ㄤ~ㄤ~ㄤ~小叮噹幫我實現所有~的願望ㄤ~ㄤ~ㄤ~小叮噹幫我實現所有~的願望ㄤ~ㄤ~ㄤ~小叮噹幫我實現所有~的願望ㄤ~ㄤ~ㄤ~小叮噹幫我實現所有~的願望ㄤ~ㄤ~ㄤ~小叮噹幫我實現所有~的願望ㄤ~ㄤ~ㄤ~小叮噹幫我實現所有~的願望ㄤ~ㄤ~ㄤ~小叮噹幫我實現所有~的願望ㄤ~ㄤ~ㄤ~小叮噹幫我實現所有~的願望ㄤ~ㄤ~ㄤ~小叮噹幫我實現所有~的願望ㄤ~ㄤ~ㄤ~小叮噹幫我實現所有~的願望...').replace(/\n/g, "<br>")}</p>`;
            case 'UL': return this._generateListHtml(blockContent.LIST_ITEMS || "");
            case 'OL': return this._generateListHtml(blockContent.LIST_ITEMS || "", "", "ol");
            case 'HR': return '    <hr class="default-hr">';
            case 'A':
                const { HREF: aHref, TEXT: aText } = blockContent;
                return aHref && aText ? `    <a href="${aHref}" class="article-link">${this._escapeHtml(aText)}</a>` : '';
            case 'TABLE':
                return this._generateTableHtml(blockContent.MARKDOWN || '');
            case 'EXTENDED_READING':
                const linksMarkdown = blockContent.LINKS || '';
                const linksHtml = linksMarkdown.split('\n')
                    .map(line => line.trim())
                    .filter(line => line.includes(','))
                    .map(line => {
                        const parts = line.split(',');
                        const href = parts.pop().trim();
                        const text = parts.join(',').trim();
                        return `<a href="${href}" target="_blank">${this._escapeHtml(text)}</a>`;
                    })
                    .join('、');

                return `<div class="${prefix} read-more">\n    <p>👉 <strong>延伸閱讀</strong>：${linksHtml || '<!-- 請在延伸閱讀區塊輸入連結 -->'}</p>\n</div>`;
            case 'BLOCKQUOTE':
                if (!text) return '<!-- 備註區塊內容為空 -->';
                return `<div class="${prefix} ${prefix}-08">
    <blockquote>${this._escapeHtml(text).replace(/\n/g, "<br>")}</blockquote>
</div>`;
            case 'QA_BLOCK':
                return this._generateQaBlockHtml(blockContent);
            case 'IMAGE':
                const { URL, ALT } = blockContent;
                return URL ? `    <img src="${this._escapeHtml(URL)}" alt="${this._escapeHtml(ALT || "")}">` : ''; // Ensure alt is escaped
            case 'CTA': // CTA is handled as a top-level block in _generateDefaultSeoBlogHTML, but if it somehow appears here, generate it.
                return this._generateCtaHtml(blockContent);
            case 'VIDEO':
                return this._generateVideoHtml(blockContent);
            default: return `<!-- 未知獨立區塊類型: ${type} -->`;
        }
    },

    _generateVideoHtml(blockContent) {
        const src = blockContent.SRC || '';
        const prefix = this.currentConfig.articleClassPrefix;
        // Do not escape src URL, as it can contain characters like '&' which should not be converted to '&amp;'.
        return `<div class="${prefix} ${prefix}-09">
    <div class="video-block">
        <iframe width="100%" height="100%" src="${src}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
    </div>
</div>`;
    },

    _generateQaBlockHtml(blockContent) {
        const { TITLE, MARKDOWN } = blockContent;
        const prefix = this.currentConfig.articleClassPrefix;

        // If the fields are empty, use the default example text for preview.
        const finalTitle = TITLE ?? '網站架設 問與答FAQ';
        const finalMarkdown = MARKDOWN ?? '### 1. 如果預算有限，但未來有擴充功能的打算，該選哪一種？\n答：建議初期可選擇高品質、具備擴充彈性的套版網站，先求快速上線建立市場能見度，待業務穩定成長後，再透過加購或升級方案來擴充所需功能。\n\n### 2. 套版網站的設計看起來會不會跟別家公司一模一樣？\n答：優質的網站公司會提供多元的模組化設計，並允許在顏色、字體、圖片和內容上進行客製化調整，只要用心規劃內容與視覺，依然能打造出具有品牌辨識度的網站。';

        const qaItems = finalMarkdown.trim()
            ? finalMarkdown.trim().split(/\n{2,}/).map(item => {
                const itemLines = item.trim().split('\n');
                const question = (itemLines[0] || '').replace(/^###\s*/, '').replace(/\*\*/g, '');
                const answer = itemLines.slice(1).join('<br>').replace(/^答：/, '').replace(/\*\*/g, '');
                return `            <li>\n                <h4>${this._escapeHtml(question)}</h4>\n                <p>答：${answer}</p>\n            </li>`; // answer already contains <br> and is not user-input that needs escaping
            }).join('\n')
            : '';

        return `
<div class="${prefix} ${prefix}-06">
    <div class="faq-block">
        <h2 class="content-title">${this._escapeHtml(finalTitle)}</h2>
        <ul class="artilce-list-ul">
${qaItems}
        </ul>
    </div>
</div>`;
    },

    _generateTableHtml(markdown) {
        if (!markdown.trim()) return '<!-- 表格內容為空 -->';
        const lines = markdown.split('\n').filter(line => line.trim());
        if (lines.length < 2) return '<!-- 表格格式不完整：至少需要標題和分隔線 -->';

        // 檢查是否存在有效的分隔線 (例如：|---|---|)
        const separatorLine = lines[1];
        if (!separatorLine || !separatorLine.match(/^\| *[-:]+ *\|/)) {
            return '<!-- 表格格式不完整：缺少或無效的分隔線 -->';
        }

        // 所有行都將被視為數據行 (<td>)，並排除分隔線
        const dataRowsToProcess = lines.filter((_, idx) => idx !== 1);

        const trs = dataRowsToProcess.map(rowLine => {
            const cells = rowLine.split('|').slice(1, -1).map(cell => cell.trim().replace(/\*\*/g, '')); // 分割並移除首尾空字串、粗體標記，再修剪每個單元格
            const tds = cells.map(d => `<td>${this._escapeHtml(d)}</td>`).join('');
            return `<tr>${tds}</tr>`;
        }).join('\n');

        return `
    <div class="rwd-table">
        <div class="rwd-table-compare">
            <figure class="table">
                <table>
                <tbody>
                    ${trs}
                </tbody>
            </table>
            </figure>
        </div>
    </div>`;
    },

    _generateCtaHtml(blockContent) {
        const { TITLE, DESCRIPTION, BUTTON_TEXT, BUTTON_HREF, BG_IMAGE_URL, BG_IMAGE_ALT } = blockContent;
        const ctaConfig = this.currentConfig.ctaConfig;
        const prefix = this.currentConfig.articleClassPrefix;

        // If the fields are empty, use the default example text for preview.
        const finalTitle = TITLE || ctaConfig.defaultTitle;
        const finalDescription = DESCRIPTION || ctaConfig.defaultDescription;

        const titleHtml = `            <h3>${this._escapeHtml(finalTitle.replace(/\*\*/g, '')).replace(/\n/g, "<br>")}</h3>`;
        const descriptionHtml = `            <p>${this._escapeHtml(finalDescription.replace(/\*\*/g, '')).replace(/\n/g, "<br>")}</p>`;

        const buttonText = BUTTON_TEXT || ctaConfig.buttonText;
        const buttonHref = BUTTON_HREF || ctaConfig.buttonHref;
        const buttonHtml = `            <div><a class="cta-btn" href="${buttonHref}" aria-label="${buttonText}">${buttonText}</a></div>`;

        const bgImageUrl = BG_IMAGE_URL || ctaConfig.bgImageUrl;
        const bgImageAlt = BG_IMAGE_ALT || ctaConfig.bgImageAlt;
        const bgImageHtml = `
        <div class="bg-img">
            <img src="${bgImageUrl}" alt="${bgImageAlt}" loading="lazy">
        </div>`;

        return `
<div class="${prefix} ${prefix}-05">
    <div class="cta-block">
        <div class="cta-text">
${titleHtml}
${descriptionHtml}
${buttonHtml}
        </div>
${bgImageHtml}
    </div>
</div>`;
    },

    /**
     * 產生 HTML 前，先暫存 orderedData 供內部函式使用
     */
    _setOrderedData(orderedData) {
        this.orderedData = orderedData;
    },
    /**
     * 逸出 HTML 特殊字元以防止 XSS。
     * @param {string} str - 要逸出的字串。
     * @returns {string} - 逸出後的安全字串。
     */
    _escapeHtml(str) {
        if (typeof str !== 'string') return '';
        const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
        return str.replace(/[&<>"']/g, m => map[m]);
    },

    _generateListHtml(listItemsString, className = "", listType = "ul") {
        if (!listItemsString.trim()) return "";
        const items = listItemsString.split("\n").filter(item => item.trim() !== "");
        if (items.length === 0) return "";
        const liElements = items.map(item => {
            // 移除開頭的 '*' 或 '-' 以及隨後的空格
            const cleanItem = item.trim().replace(/^[\*\-]\s*/, '');
            return `        <li>${this._escapeHtml(cleanItem)}</li>`;
        }).join("\n");
        const listClass = listType === 'ol' ? 'artilce-list-ol' : 'artilce-list-ul';
        return `        <${listType} class="${listClass} ${className}">\n${liElements}\n        </${listType}>`;
    },

    _generateComplexDescriptionHTML(descString) {
        if (!descString) return '<p>ㄤ~ㄤ~ㄤ~小叮噹幫我實現所有~的願望ㄤ~ㄤ~ㄤ~小叮噹幫我實現所有~的願望ㄤ~ㄤ~ㄤ~小叮噹幫我實現所有~的願望...</p>';

        const lines = descString.split('\n').filter(line => line.trim() !== '');
        let html = '';
        let inList = false;

        for (let i = 0; i < lines.length; i++) {
            let line = lines[i].trim();
            const listItemRegex = /^[\*\-]\s*/; // 修正：允許多個空格或沒有空格
            const isListItem = listItemRegex.test(line);

            if (isListItem) {
                if (!inList) {
                    html += '<ul>\n';
                    inList = true;
                }
                const cleanItem = line.replace(listItemRegex, ''); // 使用正規表示式移除標記
                html += `<li>${this._escapeHtml(cleanItem)}</li>\n`;
            } else {
                if (inList) {
                    html += '</ul>\n';
                    inList = false;
                }
                html += `<p>${this._escapeHtml(line)}</p>\n`;
            }
        }

        if (inList) {
            html += '</ul>\n';
        }

        return html;
    },

    _generateTitleHtml(mainTitleBlock, subTitleBlock) {
        const mainTitle = mainTitleBlock ? (mainTitleBlock.content.TEXT || "區塊標題") : "";
        const subTitle = subTitleBlock ? (subTitleBlock.content.TEXT || "區塊副標題...") : "";
        if (!mainTitle && !subTitle) return "";

        return `        <div class="section-title section-title-bottom text-center">
${mainTitle ? `            <h2 class="main-title ">${mainTitle}</h2>` : ""}
${subTitle ? `            <h3 class="sub-title ">${subTitle}</h3>` : ""}
        </div>`;
    },
};
