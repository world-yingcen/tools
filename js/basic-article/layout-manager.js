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
     * @returns {{html: string, style: string}} - 生成的 HTML 和版型 ID。
     */
    generateContentHTML(layoutId, orderedData) {
        const layoutDef = getLayoutDefinition(layoutId);
        if (!layoutDef) {
            return { html: '<!-- 錯誤：找不到版型定義 -->', style: 'error' };
        }

        // 建立一個版型與生成函式的映射
        const layoutGenerators = {
            "article-12": this._generateThreeColumnCardHTML,
            "article-10": this._generateTwoColumnIconCardHTML,
            "article-14": this._generateThreeColumnNumberCardHTML,
            "article-09": this._generateOneColumnListHTML,
            "article-07": this._generateAlternatingImageTextHTML,
            "article-08": this._generateStickyTextListHTML,
            "article-06": this._generateQAListHTML,
            "article-13": this._generateThreeColumnIconTitleDescHrHTML,
            "article-11": this._generateTwoColumnImageIconListHTML,
            "article-05": this._generateTwoColumnImageTitleDescHTML,
            "article-04": this._generateTwoColumnTextCardHTML,
            "article-15": this._generateCompanyInfoHTML,
            "article-16": this._generateTableLayoutHTML,
        };

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

        while (i < orderedData.length) {
            const block = orderedData[i];
            const blockType = block.type;

            if (blockType === 'MAIN_TEXT' || blockType === 'MAIN_IMAGE') {
                let mainTextBlock = blockType === 'MAIN_TEXT' ? block : null;
                let mainImageBlock = blockType === 'MAIN_IMAGE' ? block : null;
                let mainTextIndex = blockType === 'MAIN_TEXT' ? i : -1;
                let mainImageIndex = blockType === 'MAIN_IMAGE' ? i : -1;

                let interveningBlocks = [];
                let nextI = i + 1;

                // 尋找配對
                while (nextI < orderedData.length) {
                    const nextBlock = orderedData[nextI];
                    if (nextBlock.type === 'MAIN_IMAGE' && !mainImageBlock) {
                        mainImageBlock = nextBlock;
                        mainImageIndex = nextI;
                        break;
                    } else if (nextBlock.type === 'MAIN_TEXT' && !mainTextBlock) {
                        mainTextBlock = nextBlock;
                        mainTextIndex = nextI;
                        break;
                    } else {
                        interveningBlocks.push(nextBlock);
                        nextI++;
                    }
                }

                if (mainTextBlock && mainImageBlock) {
                    const mainTitle = mainTextBlock.content.H2;
                    const subTitle = mainTextBlock.content.H3;
                    const description = mainTextBlock.content.P; // Let _generateComplexDescriptionHTML handle default
                    const { URL: mainImageUrl, ALT: mainImageAlt } = mainImageBlock.content;

                    let blockClass = "article-block-01 ";
                    let determinedIsTextFirst = true;

                    if (layoutId === "article-01") {
                        blockClass = "article-block-01 ";
                        determinedIsTextFirst = true;
                    } else if (layoutId === "article-02") {
                        blockClass = "article-block-02";
                        determinedIsTextFirst = true;
                    } else if (layoutId === "article-03") {
                        blockClass = "article-block-03 ";
                        determinedIsTextFirst = false;
                    }

                    const finalImageAlt = mainImageAlt || mainTitle || "範例圖片描述";

                    let imageHtml = "";
                    const isImageRemoved = mainImageBlock.removedFields?.URL;

                    if (!isImageRemoved) {
                        // 如果沒有圖片 URL，就使用預設的範例圖片
                        const imageUrl = mainImageUrl || "https://system16.webtech.com.tw/web/202500107/archive/image/article1/images/about-pic-1.jpg";
                        imageHtml = `<img src="${imageUrl}" alt="${finalImageAlt}">`;
                    }

                    const adjacentHtml = interveningBlocks.map(b => this._generateIndependentBlockHtml(b)).join('\n');

                    let textBlockHTMLParts = ['      <div class="text-box">'];
                    // 無論使用者是否輸入，都顯示標題和敘述區塊
                    const isMainTitleRemoved = mainTextBlock.removedFields?.H2;
                    const isDescriptionRemoved = mainTextBlock.removedFields?.P;
                    const isSubTitleRemoved = mainTextBlock.removedFields?.H3;

                    if (!isMainTitleRemoved || !isSubTitleRemoved) {
                        textBlockHTMLParts.push(`        <div class="section-title section-title-bottom ">`);
                        if (!isMainTitleRemoved) {
                            const h2Tag = mainTextBlock.content.H2_TAG || 'h2';
                            textBlockHTMLParts.push(`            <${h2Tag} class="main-title ">${this._escapeHtml(mainTitle || '區塊主標題')}</${h2Tag}>`);
                        }
                        if (!isSubTitleRemoved) {
                            const h3Tag = mainTextBlock.content.H3_TAG || 'h3';
                            textBlockHTMLParts.push(`            <${h3Tag} class="sub-title ">${this._escapeHtml(subTitle || '區塊副標題')}</${h3Tag}>`);
                        }
                        textBlockHTMLParts.push(`        </div>`);
                    }
                    if (!isDescriptionRemoved) {
                        const descriptionHTML = this._generateComplexDescriptionHTML(description);
                        textBlockHTMLParts.push(`        <div class="description mt-2">${descriptionHTML}</div>`);
                    }

                    if (adjacentHtml) {
                        textBlockHTMLParts.push(adjacentHtml);
                    }
                    textBlockHTMLParts.push("      </div>");
                    const textBlockHTML = textBlockHTMLParts.join("\n");

                    const imageBlockHTML = `      <div class="image-box">\n        ${imageHtml}\n      </div>`;

                    content.push('<div class="innerpage">');
                    content.push(`  <div class="article-block ${blockClass}">`);
                    const gridClass = layoutId === "article-01" ? "column-one row-gap-2" : "column-half column-gap-5 row-gap-2";
                    content.push(`    <div class="d-grid ${gridClass}">`);
                    if (determinedIsTextFirst) {
                        content.push(textBlockHTML, imageBlockHTML);
                    } else {
                        content.push(imageBlockHTML, textBlockHTML);
                    }
                    content.push("    </div>", "  </div>", "</div>");

                    i = Math.max(mainTextIndex, mainImageIndex) + 1;
                    continue;
                }
            }

            // 處理未配對的獨立區塊
            content.push(this._generateIndependentBlockHtml(block));
            i++;
        }

        return { html: content.join("\n"), style: layoutId };
    },

    _generateIndependentBlockHtml(block) {
        const { type, content: blockContent } = block;
        const text = blockContent.TEXT ? blockContent.TEXT.replace(/\n/g, "<br>") : "";

        switch (type) {
            case 'H2': return text ? `    <h2>${text}</h2>` : '';
            case 'H3': return text ? `    <h3>${text}</h3>` : '';
            case 'P': return text ? `    <p>${text}</p>` : '';
            case 'UL': return this._generateListHtml(blockContent.LIST_ITEMS || "", "", "ul");
            case 'OL': return this._generateListHtml(blockContent.LIST_ITEMS || "", "", "ol");
            case 'HR': return '    <hr class="default-hr">';
            case 'A':
                const { HREF, TEXT } = blockContent;
                return HREF && TEXT ? `    <a href="${HREF}" class="article-link">${TEXT}</a>` : '';
            case 'TABLE': return this._generateTableHtml(blockContent.MARKDOWN || blockContent);
            case 'IMAGE':
                const { URL, ALT } = blockContent;
                return URL ? `    <img src="${URL}" alt="${ALT || "圖片描述"}" class="dynamic-image">` : '';
            default: return `<!-- 未知獨立區塊類型: ${type} -->`;
        }
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
            const cleanItem = item.trim().replace(/^([\*\-]|\d+\.)\s*/, '');
            return `            <li>${this._escapeHtml(cleanItem)}</li>`;
        }).join("\n");
        const listClass = listType === 'ol' ? 'default-list-ol' : 'default-list-ul';
        return `          <${listType} class="default-list ${listClass} ${className}">\n${liElements}\n          </${listType}>`;
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

    _generateTableHtml(markdown) {
        if (!markdown || typeof markdown !== 'string' || !markdown.trim()) return '<!-- 表格內容為空 -->';
        const lines = markdown.split('\n').filter(line => line.trim() && line.trim().startsWith('|'));
        if (lines.length < 2 || !lines[1].match(/^\|.*[-:].*\|$/)) return '<!-- 表格格式不完整 -->';

        const trs = lines.filter((_, idx) => idx !== 1).map(rowLine => {
            const cells = rowLine.split('|').slice(1, -1).map(cell => `<td>${this._escapeHtml(cell.trim().replace(/\*\*/g, ''))}</td>`).join('');
            return `                        <tr>\n                            ${cells}\n                        </tr>`;
        }).join('\n');

        return `    <div class="rwd-table">
        <div class="rwd-table-compare">
            <div class="table">
                <table>
                    <tbody>
${trs}
                    </tbody>
                </table>
            </div>
        </div>
    </div>`;
    },

    _generateTitleHtml(mainTitleBlock, subTitleBlock) {
        // 使用 trim() 去除空格，並將空字串轉為 null
        // 這樣當 Markdown 中沒有 H1/H2 時，就不會生成不完整的 section-title 區塊
        const mainTitle = mainTitleBlock?.content.H2?.trim() || null;
        const subTitle = subTitleBlock?.content.H3?.trim() || null;

        // 當兩個標題都為空時，完全不生成 section-title 區塊
        if (!mainTitle && !subTitle) return "";

        const h2Tag = mainTitleBlock ? (mainTitleBlock.content.H2_TAG || 'h2') : 'h2';
        const h3Tag = subTitleBlock ? (subTitleBlock.content.H3_TAG || 'h3') : 'h3';

        return `        <div class="section-title section-title-bottom text-center">
${mainTitle ? `            <${h2Tag} class="main-title ">${this._escapeHtml(mainTitle)}</${h2Tag}>` : ""}
${subTitle ? `            <${h3Tag} class="sub-title ">${this._escapeHtml(subTitle)}</${h3Tag}>` : ""}
        </div>`;
    },

    /**
     * 通用的主/副標題產生函式。
     * 從 orderedData 中找到標題區塊，檢查是否被刪除，並回傳 HTML。
     */
    _extractAndGenerateMainTitleHTML(orderedData) {
        const titleContainerBlock = orderedData.find((block) => block.type === 'MAIN_TEXT');
        if (!titleContainerBlock) return "";

        const mainTitleBlock = titleContainerBlock.removedFields?.H2 ? null : titleContainerBlock;
        const subTitleBlock = titleContainerBlock.removedFields?.H3 ? null : titleContainerBlock;

        // 為了與 _generateTitleHtml 的參數格式保持一致，我們傳遞整個區塊物件
        // _generateTitleHtml 內部會處理 content.H2 和 content.H3
        return this._generateTitleHtml(mainTitleBlock, subTitleBlock);
    },

    _generateAlternatingImageTextHTML(orderedData, layoutId) {
        const rowBlocks = orderedData.filter((block) => block.type === 'ALT_ROW');
        const titleHtml = this._extractAndGenerateMainTitleHTML(orderedData);

        const rowsHTML = rowBlocks.map((rowBlock) => {
            const { POSITION, MAIN_URL, MAIN_ALT, SUBTITLE, SUBTITLE_TAG, DESC } = rowBlock.content;
            const mainImageUrl = MAIN_URL || "https://system16.webtech.com.tw/web/202500107/archive/image/article1/images/about-pic-1.jpg";
            const mainImageAlt = MAIN_ALT || "image description";
            const subtitle = SUBTITLE || "副標題";
            const subtitleTag = SUBTITLE_TAG || 'h3'; // 預設使用 h3
            const descriptionHTML = this._generateComplexDescriptionHTML(DESC);

            let mainImageHTML = "";
            if (!rowBlock.removedFields?.MAIN_URL) {
                mainImageHTML = `<div class="image-box"><img class="cover" src="${mainImageUrl}" alt="${mainImageAlt}"></div>`;
            }

            let subtitleHTML = "";
            if (!rowBlock.removedFields?.SUBTITLE) {
                subtitleHTML = `<${subtitleTag} class="item-title">${this._escapeHtml(subtitle)}</${subtitleTag}>`;
            }

            const textBlockHTML = `<div class="text-box">${subtitleHTML}<div class="description">${descriptionHTML}</div></div>`;

            const finalRowHTML = (POSITION === "image-right") ? textBlockHTML + mainImageHTML : mainImageHTML + textBlockHTML;

            return `<div class="list-row d-grid column-half ">${finalRowHTML}</div>`;
        }).join("\n");

        const finalHtml = [
            '<div class="innerpage">',
            '    <div class="article-block article-block-07">',
            titleHtml,
            '        <div class="info-list-area ">',
            rowsHTML || "<!-- 請至少新增一個圖文列 -->",
            "        </div>",
            "    </div>",
            "</div>",
        ].join("\n");

        return { html: finalHtml, style: layoutId };
    },

    _generateStickyTextListHTML(orderedData, layoutId) {
        const rowBlocks = orderedData.filter((block) => block.type === 'STICKY_TEXT_ROW');
        const titleHtml = this._extractAndGenerateMainTitleHTML(orderedData);

        const rowsHTML = rowBlocks.map((rowBlock, index) => {
            const { TITLE, TITLE_TAG, SUBTITLE, DESC } = rowBlock.content;
            const number = String(index + 1).padStart(2, "0");
            const title = TITLE || "項目標題";
            const titleTag = TITLE_TAG || 'h3'; // 預設使用 h3
            const subtitle = SUBTITLE || "";
            const descriptionHTML = this._generateComplexDescriptionHTML(DESC);

            let titleHTML = "";
            if (!rowBlock.removedFields?.TITLE) {
                titleHTML = `<${titleTag} class="list-title  ">${this._escapeHtml(title)}</${titleTag}>`;
            }

            let subtitleHTML = "";
            if (!rowBlock.removedFields?.SUBTITLE && subtitle) {
                subtitleHTML = `<${rowBlock.content.SUBTITLE_TAG || 'h4'} class="list-sub-title">${this._escapeHtml(subtitle)}</${rowBlock.content.SUBTITLE_TAG || 'h4'}>`;
            }

            return `
            <div class="list-row">
                <div class="list-title-box ">
                    <span class="list-number">${number}</span>
                    ${titleHTML}
                    ${subtitleHTML}
                </div>
                <div class="description">${descriptionHTML}</div>
            </div>`;
        }).join("\n");

        const finalHtml = [
            '<div class="innerpage">',
            '    <div class="article-block article-block-08">',
            titleHtml,
            '        <div class="info-list-area">',
            rowsHTML || "<!-- 請至少新增一個純文字列 -->",
            "        </div>",
            "    </div>",
            "</div>",
        ].join("\n");

        return { html: finalHtml, style: layoutId };
    },

    _generateQAListHTML(orderedData, layoutId) {
        const rowBlocks = orderedData.filter((block) => block.type === 'QA_ROW');
        const titleHtml = this._extractAndGenerateMainTitleHTML(orderedData);

        const rowsHTML = rowBlocks.map((rowBlock) => {
            const { TITLE, TITLE_TAG, DESC } = rowBlock.content;
            const title = TITLE || "請輸入題目";
            const titleTag = TITLE_TAG || 'h3'; // 預設使用 h3
            const descriptionHTML = this._generateComplexDescriptionHTML(DESC).replace(/<p>|<\/p>/g, '');

            let titleHTML = "";
            if (!rowBlock.removedFields?.TITLE) {
                titleHTML = `<${titleTag} class="faq-title">${title}</${titleTag}>`;
            }

            return `
            <div class="faq-row">
                <div class="faq-q-icon">Q</div>
                ${titleHTML}
                <div class="faq-description">${descriptionHTML}</div> 
            </div>`;
        }).join("\n");

        const finalHtml = [
            '<div class="innerpage">',
            '    <div class="article-block article-block-06">',
            titleHtml,
            '        <div class="faq-list-area">',
            rowsHTML || "<!-- 請至少新增一個QA項目 -->",
            "        </div>",
            "    </div>",
            "</div>",
        ].join("\n");

        return { html: finalHtml, style: layoutId };
    },

    _generateTwoColumnImageIconListHTML(orderedData, layoutId) {
        const mainImageBlock = orderedData.find((block) => block.type === 'MAIN_IMAGE');
        const iconItemBlocks = orderedData.filter((block) => block.type === 'TWO_COL_IMAGE_ICON_ITEM');
        const titleHtml = this._extractAndGenerateMainTitleHTML(orderedData);

        const mainImageUrl = mainImageBlock?.content.URL || "https://system16.webtech.com.tw/web/202500107/archive/image/article1/images/about-pic-1.jpg";
        const mainImageAlt = mainImageBlock?.content.ALT || "Reliable | Innovative | Sustainable.";

        const iconItemsHTML = iconItemBlocks.map((itemBlock, index) => {
            const { ICON_URL, ICON_ALT, DESC } = itemBlock.content;
            const iconUrl = ICON_URL || "https://webtech.com.tw/asset/brand-visual/images/brand-visual-05.svg";
            const iconAlt = ICON_ALT || "圖片alt";
            const description = DESC ? this._escapeHtml(DESC).replace(/\n/g, "<br>") : `ㄤ~ㄤ~ㄤ~小叮噹幫我實現所有~的願望ㄤ~ㄤ~ㄤ~小叮噹幫我實現所有~的願望ㄤ~ㄤ~ㄤ~小叮噹幫我實現所有~的願望...`;

            let iconHTML = "";
            if (!itemBlock.removedFields?.ICON_URL) {
                iconHTML = `<div class="icon"><img src="${iconUrl}" alt="${iconAlt}"></div>`;
            }

            return `
                    <div class="icon-item icon-item-${index + 1}"> 
                        ${iconHTML}
                        <div class="text"><p class="description">${description}</p></div>
                    </div>`;
        }).join("\n");

        const finalHtml = [
            '<div class="innerpage">',
            '    <div class="article-block article-block-11">',
            titleHtml,
            '        <div class="info-list-area d-grid column-half gap-2">',
            '            <div class="image-box">',
            `                <img class="cover" src="${mainImageUrl}" alt="${mainImageAlt}">`,
            "            </div>",
            '            <div class="icon-box">',
            iconItemsHTML || "<!-- 請至少新增一個右側項目 -->",
            "            </div>",
            "        </div>",
            "    </div>",
            "</div>",
        ].join("\n");

        return { html: finalHtml, style: layoutId };
    },

    _generateThreeColumnIconTitleDescHrHTML(orderedData, layoutId) {
        const cardBlocks = orderedData.filter((block) => block.type === 'ICON_TITLE_CARD');
        const titleHtml = this._extractAndGenerateMainTitleHTML(orderedData);

        if (cardBlocks.length === 0) {
            return { html: "<!-- 警告：請至少新增一個卡片區塊 -->", style: layoutId };
        }

        const cardsHTML = cardBlocks.map((cardBlock) => {
            const { URL, ALT, TITLE, TITLE_TAG, DESC } = cardBlock.content;
            const imageUrl = URL || "https://webtech.com.tw/asset/seohealth/images/seo-icon03.webp?0928";
            const imageAlt = ALT || TITLE || "圖片描述";
            const title = TITLE || "項目標題";
            const titleTag = TITLE_TAG || 'h3'; // 預設使用 h3
            const descriptionHTML = this._generateComplexDescriptionHTML(DESC);

            let imageHTML = "";
            if (!cardBlock.removedFields?.URL) {
                imageHTML = `<div class="image-box"><img alt="${imageAlt}" src="${imageUrl}"></div>`;
            }

            let titleHTML = "";
            if (!cardBlock.removedFields?.TITLE) {
                titleHTML = `<${titleTag} class="item-title ">${this._escapeHtml(title)}</${titleTag}>`;
            }

            return `
                <div class="list-row">
                    ${imageHTML}
                    <div class="text-box">
                        ${titleHTML}
                        <div class="description">${descriptionHTML}</div>
                    </div>
                </div>`;
        }).join("\n");

        const finalHtml = [
            '<div class="innerpage">',
            '    <div class="article-block article-block-13 ">',
            titleHtml,
            '        <div class="block-cards ">',
            `            <div class="card-area d-grid gap-5 column-three">${cardsHTML}</div>`,
            "        </div>",
            "    </div>",
            "</div>",
        ].join("\n");

        return { html: finalHtml, style: layoutId };
    },

    _generateTwoColumnImageTitleDescHTML(orderedData, layoutId) {
        const cardBlocks = orderedData.filter((block) => block.type === 'IMAGE_TITLE_DESC_CARD');
        const titleHtml = this._extractAndGenerateMainTitleHTML(orderedData);

        const cardsHTML = cardBlocks.map((cardBlock) => {
            const { URL, ALT, TITLE, TITLE_TAG, DESC } = cardBlock.content;
            const imageUrl = URL || "https://system16.webtech.com.tw/web/202500107/archive/image/article1/images/about-pic-1.jpg";
            const imageAlt = ALT || TITLE || "項目圖片";
            const title = TITLE || "項目標題";
            const titleTag = TITLE_TAG || 'h3'; // 預設使用 h3
            const descriptionHTML = this._generateComplexDescriptionHTML(DESC);

            let imageHTML = "";
            if (!cardBlock.removedFields?.URL) {
                imageHTML = `<div class="image-box"><img class="cover" src="${imageUrl}" alt="${imageAlt}"></div>`;
            }

            let titleHTML = "";
            if (!cardBlock.removedFields?.TITLE) {
                titleHTML = `<${titleTag} class="list-title">${this._escapeHtml(title)}</${titleTag}>`;
            }

            return `
            <div class="list-row">
                ${imageHTML}
                <div class="text-box">
                    ${titleHTML}
                    <div class="description">${descriptionHTML}</div>
                </div>
            </div>`;
        }).join("\n");

        const finalHtml = [
            '<div class="innerpage">',
            '    <div class="article-block article-block-05">',
            titleHtml,
            '        <div class="info-list-area d-grid column-half gap-2">',
            cardsHTML || "<!-- 請至少新增一個項目 -->",
            "        </div>",
            "    </div>",
            "</div>",
        ].join("\n");

        return { html: finalHtml, style: layoutId };
    },

    _generateOneColumnListHTML(orderedData, layoutId) {
        const itemBlocks = orderedData.filter((block) => block.type === 'ONE_COLUMN_ITEM');
        const titleHtml = this._extractAndGenerateMainTitleHTML(orderedData);

        const itemsHTML = itemBlocks.map((itemBlock) => {
            const { URL, ALT, TITLE, TITLE_TAG, SUBTITLE, DESC } = itemBlock.content;
            const imageUrl = URL || "https://system16.webtech.com.tw/web/202500107/archive/image/article1/images/about-pic-1.jpg";
            const imageAlt = ALT || TITLE || "項目圖片";
            const title = TITLE || "項目標題";
            const titleTag = TITLE_TAG || 'h3'; // 預設使用 h3
            const descriptionHTML = this._generateComplexDescriptionHTML(DESC);

            return `
            <div class=" list-row d-grid column-gap-3 row-gap-2">
                <div class="image-box"><img class="cover" src="${imageUrl}" alt="${imageAlt}"></div>
                <div class="text-box">
                    <${titleTag} class="list-title title-deco">${this._escapeHtml(title)}</${titleTag}>
                    ${SUBTITLE ? `<${itemBlock.content.SUBTITLE_TAG || 'h4'} class="list-sub-title">${this._escapeHtml(SUBTITLE)}</${itemBlock.content.SUBTITLE_TAG || 'h4'}>` : ''}
                    <div class="description">${descriptionHTML}</div>
                </div>
            </div>`;
        }).join("\n");

        const finalHtml = [
            '<div class="innerpage">',
            '    <div class="article-block article-block-09">',
            titleHtml,
            '        <div class="info-list-area">',
            itemsHTML || "<!-- 請至少新增一個列表項目 -->",
            "        </div>",
            "    </div>",
            "</div>",
        ].join("\n");

        return { html: finalHtml, style: layoutId };
    },

    _generateThreeColumnNumberCardHTML(orderedData, layoutId) {
        const cardBlocks = orderedData.filter((block) => block.type === 'NUMBER_CARD');
        const titleHtml = this._extractAndGenerateMainTitleHTML(orderedData);

        const cardsHTML = cardBlocks.map((cardBlock, index) => {
            const { ICON_URL, ALT, TITLE, TITLE_TAG, DESC } = cardBlock.content;
            const number = String(index + 1).padStart(2, "0");
            const iconUrl = ICON_URL || "https://webtech.com.tw/asset/brand-visual/images/brand-visual-05.svg";
            const iconAlt = ALT || TITLE || "卡片圖示";
            const title = TITLE || "卡片標題";
            const titleTag = TITLE_TAG || 'h3'; // 預設使用 h3
            const descriptionHTML = this._generateComplexDescriptionHTML(DESC);

            return `
            <div class="card-item card-item-${index + 1}">
                <div class="image icon"><img src="${iconUrl}" alt="${iconAlt}"></div>
                <div class="text">
                    <${titleTag} class="card-title"><span class="number">${number}</span> ${this._escapeHtml(title)}</${titleTag}>
                    <div class="description">${descriptionHTML}</div>
                </div>
            </div>`;
        }).join("\n");

        const finalHtml = [
            '<div class="innerpage">',
            '    <div class="article-block article-block-14">',
            titleHtml,
            '        <div class="card-box d-grid gap-2 column-three">',
            cardsHTML || "<!-- 請至少新增一個數字卡片 -->",
            "        </div>",
            "    </div>",
            "</div>",
        ].join("\n");

        return { html: finalHtml, style: layoutId };
    },

    _generateThreeColumnCardHTML(orderedData, layoutId) {
        const cardBlocks = orderedData.filter((block) => block.type === 'CARD');
        const titleHtml = this._extractAndGenerateMainTitleHTML(orderedData);

        const cardsHTML = cardBlocks.map((cardBlock) => {
            const { URL, ALT, TITLE, TITLE_TAG, DESC } = cardBlock.content;
            const imageUrl = URL || "https://system16.webtech.com.tw/web/202500107/archive/image/article1/images/about-pic-1.jpg";
            const imageAlt = ALT || TITLE || "卡片圖片";
            const title = TITLE || "項目標題";
            const titleTag = TITLE_TAG || 'h3'; // 預設使用 h3
            const descriptionHTML = this._generateComplexDescriptionHTML(DESC);

            let imageHTML = "";
            if (!cardBlock.removedFields?.URL) {
                imageHTML = `<div class="image-box"><img class="cover" alt="${imageAlt}" src="${imageUrl}"></div>`;
            }

            let titleHTML = "";
            if (!cardBlock.removedFields?.TITLE) {
                titleHTML = `<${titleTag} class="item-title ">${this._escapeHtml(title)}</${titleTag}>`;
            }

            return `
                <div class="list-row">
                    ${imageHTML}
                    <div class="text-box">
                        ${titleHTML}
                        <div class="description">${descriptionHTML}</div>
                    </div>
                </div>`;
        }).join("\n");

        const finalHtml = [
            '<div class="innerpage">',
            '    <div class="article-block article-block-12 ">',
            titleHtml,
            '        <div class="block-cards ">',
            `            <div class="card-area d-grid gap-2 column-three">${cardsHTML || "<!-- 請至少新增一個卡片 -->"}</div>`,
            "        </div>",
            "    </div>",
            "</div>",
        ].join("\n");

        return { html: finalHtml, style: layoutId };
    },

    _generateTwoColumnIconCardHTML(orderedData, layoutId) {
        const cardBlocks = orderedData.filter((block) => block.type === 'ICON_CARD');
        const titleHtml = this._extractAndGenerateMainTitleHTML(orderedData);

        const cardsHTML = cardBlocks.map((cardBlock) => {
            const { URL, ALT, ICON_URL, TITLE, TITLE_TAG, DESC } = cardBlock.content;
            const imageUrl = URL || "https://system16.webtech.com.tw/web/202500107/archive/image/article1/images/about-pic-1.jpg";
            const imageAlt = ALT || TITLE || "項目圖片";
            const iconUrl = ICON_URL || "https://webtech.com.tw/asset/seohealth/images/seo-icon03.webp?0928";
            const iconAlt = ALT || TITLE || "項目圖示";
            const title = TITLE || "項目標題";
            const titleTag = TITLE_TAG || 'h3'; // 預設使用 h3
            const descriptionHTML = this._generateComplexDescriptionHTML(DESC);

            let imageHTML = "";
            if (!cardBlock.removedFields?.URL) {
                imageHTML = `<div class="image-box"><img class="cover" src="${imageUrl}" alt="${imageAlt}"></div>`;
            }

            let iconHTML = "";
            if (!cardBlock.removedFields?.ICON_URL) {
                iconHTML = `<div class="icon"><img src="${iconUrl}" alt="${iconAlt}"></div>`;
            }

            let titleHTML = "";
            if (!cardBlock.removedFields?.TITLE) {
                titleHTML = `<${titleTag} class="list-title">${this._escapeHtml(title)}</${titleTag}>`;
            }

            return `
            <div class="list-row">
                ${imageHTML}
                <div class="text-box">
                    ${iconHTML}
                    ${titleHTML}
                    <div class="description">${descriptionHTML}</div>
                </div>
            </div>`;
        }).join("\n");

        const finalHtml = [
            '<div class="innerpage">',
            '    <div class="article-block article-block-10">',
            titleHtml,
            '        <div class="info-list-area d-grid column-half gap-2">',
            cardsHTML || "<!-- 請至少新增一個項目 -->",
            "        </div>",
            "    </div>",
            "</div>",
        ].join("\n");

        return { html: finalHtml, style: layoutId };
    },

    _generateTwoColumnTextCardHTML(orderedData, layoutId) {
        const cardBlocks = orderedData.filter((block) => block.type === 'TEXT_CARD');
        const titleHtml = this._extractAndGenerateMainTitleHTML(orderedData);

        const cardsHTML = cardBlocks.map((cardBlock) => {
            const { TITLE, TITLE_TAG, SUBTITLE, DESC } = cardBlock.content;
            const title = TITLE || "預設標題";
            const titleTag = TITLE_TAG || 'h3'; // 預設使用 h3
            const subtitle = SUBTITLE || "";
            const descriptionHTML = this._generateComplexDescriptionHTML(DESC);

            return `
            <div class="text-box">
                <${titleTag}>${this._escapeHtml(title)}</${titleTag}>
                ${subtitle ? `<${cardBlock.content.SUBTITLE_TAG || 'h4'}>${this._escapeHtml(subtitle)}</${cardBlock.content.SUBTITLE_TAG || 'h4'}>` : ''}
                <div class="description">${descriptionHTML}</div>
            </div>`;
        }).join("\n");

        const finalHtml = [
            '<div class="innerpage">',
            '    <div class="article-block article-block-04">',
            `        ${titleHtml}`,
            '        <div class="d-grid column-half column-gap-5 row-gap-2">',
            `            ${cardsHTML || "<!-- 請至少新增一個純文字卡片 -->"}`,
            "        </div>",
            "    </div>",
            "</div>",
        ].join("\n");

        return { html: finalHtml, style: layoutId };
    },

    _generateCompanyInfoHTML(orderedData, layoutId) {
        // --- 新增：優先處理由 script.js 傳來的預生成資料 ---
        // 這個區塊專門處理 article-15 的特殊流程，確保順序正確
        const preGeneratedBlock = orderedData.find(b => b.type === 'PRE_GENERATED');
        if (preGeneratedBlock) {
            const { companyName, companyInfoList } = preGeneratedBlock.content;
            const finalHtml = `
<div class="innerpage">
    <div class="article-block article-block-15">
        <div class="from-text">
            <h3 class="company-name">${this._escapeHtml(companyName)}</h3>
            <div class="company-info-list">${companyInfoList.trim() ? `\n${companyInfoList}\n            ` : '\n                <!-- 請在左側輸入電話、地址或信箱 -->\n            '}</div>
        </div>
    </div>
</div>`;
            return { html: finalHtml, style: layoutId };
        }
        // --- 預生成資料處理結束 ---
        const nameBlock = orderedData.find(b => b.type === 'COMPANY_NAME');
        const itemBlocks = orderedData.filter(b => b.type === 'COMPANY_TEXT_ITEM' || b.type === 'COMPANY_LINK_ITEM');

        const companyName = nameBlock?.content.COMPANY_NAME || "公司名稱";
        const companyInfoList = itemBlocks.map(block => {
            const { LABEL, TEXT, HREF } = block.content;
            const label = LABEL || "標題";
            const text = TEXT || "內容";
            if (block.type === 'COMPANY_LINK_ITEM') {
                const href = HREF || "#";
                return `<p>${this._escapeHtml(label)}：<a href="${href}">${this._escapeHtml(text)}</a></p>`;
            } else {
                return `<p>${this._escapeHtml(label)}：${this._escapeHtml(text)}</p>`;
            }
        }).join('\n            ');

        const finalHtml = `
<div class="innerpage">
    <div class="article-block article-block-15">
        <div class="from-text">
            <h3 class="company-name">${this._escapeHtml(companyName)}</h3>
            <div class="company-info-list">
            ${companyInfoList || '    <!-- 請在左側輸入電話、地址或信箱 -->'}
            </div>
        </div>
    </div>
</div>`;

        return { html: finalHtml, style: layoutId };
    },

    _generateTableLayoutHTML(orderedData, layoutId) {
        const tableBlock = orderedData.find(b => b.type === 'TABLE');
        const markdown = tableBlock?.content.MARKDOWN || "";

        let tableHtml = "";
        if (markdown) {
            const lines = markdown.split('\n').filter(line => line.trim() && line.trim().startsWith('|'));
            if (lines.length >= 2 && lines[1].match(/^\|.*[-:].*\|$/)) {
                const trs = lines.filter((_, idx) => idx !== 1).map(rowLine => {
                    const cells = rowLine.split('|').slice(1, -1).map(cell => `<td>${this._escapeHtml(cell.trim().replace(/\*\*/g, ''))}</td>`).join('');
                    return `                            <tr>\n                                ${cells}\n                            </tr>`;
                }).join('\n');

                tableHtml = `
        <div class="rwd-table">
            <div class="rwd-table-compare">
                <div class="table">
                    <table>
                        <tbody>
${trs}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>`;
            } else {
                tableHtml = "<!-- 表格格式錯誤或內容為空 -->";
            }
        } else {
            tableHtml = "<!-- 請輸入表格內容 -->";
        }

        const finalHtml = `
<div class="innerpage">
    <div class="article-block article-block-16 ">
${tableHtml}
    </div>
</div>`;

        return { html: finalHtml, style: layoutId };
    },
};