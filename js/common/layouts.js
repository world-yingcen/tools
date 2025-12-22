// /js/common/layouts.js

/**
 * @file layouts.js
 * @description 應用程式的「版型庫」，存放所有版型的定義。
 */

/**
 * 區塊編輯器 HTML 模板
 * 這些模板定義了每種區塊類型在 UI 上的編輯介面。
 */
const BLOCK_EDITOR_TEMPLATES = {
    AUTHOR_BLOCK: `
        <textarea id="markdownInput" rows="5" placeholder="貼上 Markdown 內容，點擊按鈕快速轉換..." class="mt-1" style="width: 100%; box-sizing: border-box;"></textarea>
        <button id="parseMarkdownButton" class="tool-button generate-btn button--full-width mt-05" >交給你了</button>
    `,
    ANCHOR_LIST: `
        <textarea id="anchorMarkdownInput" rows="5" placeholder="貼上 Markdown 內容，請依照範例格式：
* 第一個,\\#section-01  
* 第二個,\\#section-02  " class="mt-1" style="width: 100%; box-sizing: border-box;"></textarea>
        <button id="parseAnchorMarkdownButton" class="tool-button generate-btn button--full-width mt-05" >交給你了</button>
    `,
    MAIN_CONTENT_BLOCK: `
        <textarea id="mainContentMarkdownInput" rows="3" placeholder="貼上Markdown，點擊按鈕快速轉換...
提醒：若有無序列表前面請加『*』，有序列表直接寫1.2.3.4." class="mt-1" style="width: 100%; box-sizing: border-box;"></textarea>
        <button id="parseMainContentMarkdownButton" class="tool-button generate-btn button--full-width mt-05" >交給你了</button>
    `,
    AUTHOR: `<label>作者</label><input type="text" data-field="TEXT" placeholder="輸入作者名稱">`,
    MAIN_IMAGE: `
        <div class="block-title">【主要圖片區塊】</div>
        <div class="input-group">
            <label>圖片連結</label>
            <input type="text" data-field="URL" placeholder="輸入 圖片 URL">
        </div>
        <div class="input-group">
            <label>圖片alt*</label>
            <input type="text" data-field="ALT" placeholder="輸入 圖片描述">
        </div>`,
    H2: `<label>新增 大標 (<code>H2</code>)</label><textarea data-field="TEXT" placeholder="輸入 H2 大標"></textarea>`,
    H3: `<label>新增 小標 (<code>H3</code>)</label><textarea data-field="TEXT" placeholder="輸入 H3 小標"></textarea>`,
    H4: `<label>新增 小標 (<code>H4</code>)</label><textarea data-field="TEXT" placeholder="輸入 H4 小標"></textarea>`,
    P: `<label>新增 敘述 (<code>P</code>)</label><textarea data-field="TEXT" placeholder="輸入額外敘述 P"></textarea>`,
    UL: `<label>新增 列表 (<code>UL</code>)</label><textarea data-field="LIST_ITEMS" placeholder="輸入列表項目，一行一個"></textarea>`,
    OL: `<label>新增 有序列表 (<code>OL</code>)</label><textarea data-field="LIST_ITEMS" placeholder="輸入列表項目，一行一個"></textarea>`,
    ANCHOR_ITEM: `<label>錨點項目</label>
                  <div class="input-group mt-05"><label>錨點文字</label><input type="text" data-field="TEXT" placeholder="輸入錨點顯示的文字"></div>
                  <div class="input-group mt-05"><label>錨點連結</label><input type="text" data-field="HREF" placeholder="輸入區塊錨點，例如 #section-1"></div>`,
    A: `<label>新增 連結 (<code>A</code>)</label>
        <div class="input-group mt-05"><label>連結文字</label><input type="text" data-field="TEXT" placeholder="輸入連結文字"></div>
        <div class="input-group mt-05"><label>連結 URL</label><input type="text" data-field="HREF" placeholder="輸入連結網址 (href)"></div>`,
    IMAGE: `<label>新增 圖片 (<code>IMG</code>)</label>
            <div class="input-group mt-05"><label>圖片網址</label><input type="text" data-field="URL" placeholder="輸入圖片網址 (URL)"></div>
            <div class="input-group mt-05"><label>圖片alt</label><input type="text" data-field="ALT" placeholder="輸入圖片描述 (alt)"></div>`,
    HR: `<hr style="border-top: 1px solid #ddd; margin: 10px 0;">`,
    CTA: `<label>新增 CTA 區塊 (<code>CTA</code>)</label>
        <div class="input-group mt-05"><label>標題</label><input type="text" data-field="TITLE" placeholder="立即預約品牌顧問諮詢"></div>
        <div class="input-group mt-05"><label>描述</label><textarea data-field="DESCRIPTION" rows="3" placeholder="專業的內容佈局到設計策略，一起打造真正有感的品牌體驗網站"></textarea></div>`,
    QA_BLOCK: `<label>新增 QA 區塊 (<code>QA_BLOCK</code>)</label>
        <div class="input-group mt-05"><label>區塊標題</label><input type="text" data-field="TITLE" placeholder="標題"></div><div class="input-group mt-05"><label>QA 內容</label><textarea data-field="MARKDOWN" rows="10" placeholder="格式範例：\n### 1. 問題一？\n答：這是答案一。\n\n### 2. 問題二？\n答：這是答案二。"></textarea></div>`,
    EXTENDED_READING: `<label>新增 延伸閱讀 (<code>EXTENDED_READING</code>)</label><textarea data-field="LINKS" rows="4" placeholder="一行一個連結，格式：\n連結文字,連結網址\n網站設計指南,https://example.com/guide"></textarea>`,
    BLOCKQUOTE: `<label>新增 備註 (<code>BLOCKQUOTE</code>)</label><textarea data-field="TEXT" placeholder="輸入備註文字"></textarea>`,
    TABLE: `<label>新增 表格 (<code>TABLE</code>)</label><textarea data-field="MARKDOWN" rows="6" placeholder="貼上 Markdown 表格...\n格式範例：\n| 標題1 | 標題2 | 標題3 |\n|---|---|---|\n| 內容A1 | 內容A2 | 內容A3 |\n| 內容B1 | 內容B2 | 內容B3 |"></textarea>`,
    VIDEO: `<label>新增 影片 (<code>VIDEO</code>)</label><div class="input-group mt-05"><label>影片嵌入網址 (src)</label><input type="text" data-field="SRC" placeholder="輸入 “嵌入影片” 裡的網址"></div>`,
};

/**
 * 區塊顯示名稱
 * 用於在 UI 上（如下拉式選單）顯示更友善的名稱。
 */
export const BLOCK_DISPLAY_NAMES = {};
BLOCK_DISPLAY_NAMES.AUTHOR_BLOCK = "引言區塊";
BLOCK_DISPLAY_NAMES.ANCHOR_LIST = "錨點連結區塊";
BLOCK_DISPLAY_NAMES.MAIN_CONTENT_BLOCK = "主內容編輯區";
BLOCK_DISPLAY_NAMES.CTA = "CTA 區塊";
BLOCK_DISPLAY_NAMES.ANCHOR_ITEM = "錨點";
BLOCK_DISPLAY_NAMES.QA_BLOCK = "QA 區塊";
BLOCK_DISPLAY_NAMES.EXTENDED_READING = "延伸閱讀";
BLOCK_DISPLAY_NAMES.BLOCKQUOTE = "備註";
BLOCK_DISPLAY_NAMES.TABLE = "表格";
BLOCK_DISPLAY_NAMES.VIDEO = "影片";

/**
 * 獲取指定區塊類型的編輯器 HTML。
 * @param {string} type - 區塊類型。
 * @returns {string} - HTML 字符串。
 */
export function getBlockEditorTemplate(type) {
    return BLOCK_EDITOR_TEMPLATES[type] || "";
}

const defaultInsertableBlocks = [
    "H2",
    "H3",
    "H4",
    "P",
    "UL",
    "OL",
    "A",
    "IMAGE",
    "HR",
    "QA_BLOCK",
    "EXTENDED_READING",
    "BLOCKQUOTE",
    "TABLE",
    "VIDEO",
]; // ANCHOR_LIST will be added explicitly to default layout's insertableBlocks

/**
 * 所有版型的定義。
 * - id: 版型唯一標識。
 * - name: 顯示名稱。
 * - initialBlocks: 選擇此版型時初始化的區塊。
 * - insertableBlocks: 在此版型下，可以透過 "+" 按鈕新增的區塊。
 */
export const layouts = {
    "text-over-image": {
        id: "text-over-image",
        name: "上文下圖",
        initialBlocks: [
            { type: "AUTHOR_BLOCK", isRemovable: false },
            { type: "AUTHOR", isRemovable: true },
            { type: "H2", isRemovable: true },
            { type: "P", isRemovable: true },
            { type: "P", isRemovable: true },
            { type: "ANCHOR_LIST", isRemovable: false }, // Anchor list container
            { type: "ANCHOR_ITEM", isRemovable: true },
            { type: "ANCHOR_ITEM", isRemovable: true },
            { type: "MAIN_CONTENT_BLOCK", isRemovable: false },
            { type: "H2", isRemovable: true },
            {
                type: "CTA", isRemovable: false
            },
        ],
        insertableBlocks: {
            // 統一所有可插入的區塊
            default: defaultInsertableBlocks, // Default does not include ANCHOR_LIST
            AUTHOR_BLOCK: defaultInsertableBlocks,
            AUTHOR: defaultInsertableBlocks,
            H2: defaultInsertableBlocks,
            H3: defaultInsertableBlocks,
            H4: defaultInsertableBlocks,
            P: defaultInsertableBlocks,
            ANCHOR_LIST: ["ANCHOR_ITEM"], // Only allow ANCHOR_ITEM inside ANCHOR_LIST container
            ANCHOR_ITEM: ["ANCHOR_ITEM"], // Allow adding more ANCHOR_ITEMs after an existing one
            EXTENDED_READING: defaultInsertableBlocks,
            MAIN_CONTENT_BLOCK: defaultInsertableBlocks, // Explicitly use defaultInsertableBlocks which does NOT contain ANCHOR_LIST
            // ... 其他區塊若需插入功能，也應使用 defaultInsertableBlocks
        },
    },
};

// --- 在 layouts 物件定義完成後，再為其增加 parsingConfig ---

export function getLayoutDefinition(layoutId) {
    return layouts[layoutId];
}
