// /js/miracle-article/layouts.js

/**
 * @file layouts.js
 * @description 應用程式的「版型庫」，存放所有版型的定義。
 */

/**
 * 區塊編輯器 HTML 模板
 * 這些模板定義了每種區塊類型在 UI 上的編輯介面。
 */
const BLOCK_EDITOR_TEMPLATES = {
    MAIN_TEXT: `
        <div class="input-group removable-field">
            <div class="label-container">
                <label class="field-label">大標 (Heading)</label>
                <button type="button" class="remove-field-btn" title="移除此欄位"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2v2"></path></svg></button>
            </div>
            <div class="merged-input">
                <select class="tag-select" data-field="H2_TAG"><option value="h1">H1</option><option value="h2" selected>H2</option><option value="h3">H3</option></select>
                <input type="text" class="main-input" data-field="H2" placeholder="輸入文章標題">
            </div>
        </div>
        <div class="input-group removable-field">
            <div class="label-container">
                <label class="field-label">副標 (Sub-heading)</label>
                <button type="button" class="remove-field-btn" title="移除此欄位"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2v2"></path></svg></button>
            </div>
            <div class="merged-input">
                <select class="tag-select" data-field="H3_TAG"><option value="h1">H1</option><option value="h2">H2</option><option value="h3" selected>H3</option></select>
                <input type="text" class="main-input" data-field="H3" placeholder="輸入文章副標題">
            </div>
        </div>
        <div class="input-group removable-field">
            <div class="label-container">
                <label class="field-label">敘述</label>
                <button type="button" class="remove-field-btn" title="移除此欄位"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2v2"></path></svg></button>
            </div>
            <textarea class="textarea-input" data-field="P" placeholder="輸入文章內容，如需列點請在前面加上*"></textarea>
        </div>`,
    TITLE_BLOCK: `
        <div class="input-group removable-field">
            <div class="label-container">
                <label class="field-label">大標 (Heading)</label>
                <button type="button" class="remove-field-btn" title="移除此欄位"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2v2"></path></svg></button>
            </div>
            <div class="merged-input">
                <select class="tag-select" data-field="H2_TAG"><option value="h1">H1</option><option value="h2" selected>H2</option><option value="h3">H3</option></select>
                <input type="text" class="main-input" data-field="H2" placeholder="輸入文章標題">
            </div>
        </div>
        <div class="input-group removable-field">
            <div class="label-container">
                <label class="field-label">副標 (Sub-heading)</label>
                <button type="button" class="remove-field-btn" title="移除此欄位"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2v2"></path></svg></button>
            </div>
            <div class="merged-input">
                <select class="tag-select" data-field="H3_TAG"><option value="h1">H1</option><option value="h2">H2</option><option value="h3" selected>H3</option></select>
                <input type="text" class="main-input" data-field="H3" placeholder="輸入文章副標題">
            </div>
        </div>`,
    MAIN_IMAGE: `
        <div class="input-group removable-field">
            <div class="label-container">
                <label class="field-label">圖片連結</label>
                <button type="button" class="remove-field-btn" title="移除此欄位"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2v2"></path></svg></button>
            </div>
            <div class="merged-input">
                <input type="text" class="main-input" data-field="URL" placeholder="輸入 圖片 URL">
            </div>
        </div>
        <div class="input-group removable-field">
            <div class="label-container">
                <label class="field-label">圖片 Alt</label>
                <button type="button" class="remove-field-btn" title="移除此欄位"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2v2"></path></svg></button>
            </div>
            <div class="merged-input">
                <input type="text" class="main-input" data-field="ALT" placeholder="輸入 圖片描述">
            </div>
        </div>`,
    H2: `<div class="input-group"><label class="field-label">大標 (H2)</label><div class="merged-input"><input type="text" class="main-input" data-field="TEXT" placeholder="輸入 H2 大標"></div></div>`,
    H3: `<div class="input-group"><label class="field-label">小標 (H3)</label><div class="merged-input"><input type="text" class="main-input" data-field="TEXT" placeholder="輸入 H3 小標"></div></div>`,
    P: `<div class="input-group"><label class="field-label">敘述 (P)</label><textarea class="textarea-input" data-field="TEXT" placeholder="輸入額外敘述 P"></textarea></div>`,
    AUTHOR: `<div class="input-group"><label class="field-label">作者</label><div class="merged-input"><input type="text" class="main-input" data-field="TEXT" placeholder="輸入作者名稱"></div></div>`,
    OL: `<div class="input-group"><label class="field-label">有序列表 (OL)</label><textarea class="textarea-input" data-field="LIST_ITEMS" placeholder="輸入列表項目，一行一個"></textarea></div>`,
    ANCHOR_ITEM: `<div class="input-group"><label class="field-label">錨點文字</label><div class="merged-input"><input type="text" class="main-input" data-field="TEXT" placeholder="輸入錨點顯示的文字"></div></div>
                  <div class="input-group"><label class="field-label">錨點連結</label><div class="merged-input"><input type="text" class="main-input" data-field="HREF" placeholder="輸入區塊錨點，例如 #section-1"></div></div>`,
    UL: `<div class="input-group"><label class="field-label">列表 (UL)</label><textarea class="textarea-input" data-field="LIST_ITEMS" placeholder="輸入列表項目，一行一個"></textarea></div>`,
    A: `<div class="input-group"><label class="field-label">連結文字</label><div class="merged-input"><input type="text" class="main-input" data-field="TEXT" placeholder="輸入連結文字"></div></div>
        <div class="input-group"><label class="field-label">連結 URL</label><div class="merged-input"><input type="text" class="main-input" data-field="HREF" placeholder="輸入連結網址 (href)"></div></div>`,
    IMAGE: `<div class="input-group removable-field"><div class="label-container"><label class="field-label">圖片網址</label><button type="button" class="remove-field-btn" title="移除此欄位"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2v2"></path></svg></button></div><div class="merged-input"><input type="text" class="main-input" data-field="URL" placeholder="輸入圖片網址 (URL)"></div></div>
            <div class="input-group removable-field"><div class="label-container"><label class="field-label">圖片 Alt</label><button type="button" class="remove-field-btn" title="移除此欄位"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2v2"></path></svg></button></div><div class="merged-input"><input type="text" class="main-input" data-field="ALT" placeholder="輸入圖片描述 (alt)"></div></div>`,
    HR: `<hr style="border-top: 1px solid #ddd; margin: 10px 0;">`,
    TABLE: `<div class="input-group"><label class="field-label">表格 Markdown</label><textarea class="textarea-input" data-field="MARKDOWN" rows="8" placeholder="貼上 Markdown 表格..."></textarea></div>`,
    CARD: `
           <div class="input-group removable-field"><div class="label-container"><label class="field-label">圖片 URL</label><button type="button" class="remove-field-btn" title="移除此欄位"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2v2"></path></svg></button></div><div class="merged-input"><input type="text" class="main-input" data-field="URL" placeholder="圖片連結"></div></div>
           <div class="input-group removable-field"><div class="label-container"><label class="field-label">圖片 Alt</label><button type="button" class="remove-field-btn" title="移除此欄位"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2v2"></path></svg></button></div><div class="merged-input"><input type="text" class="main-input" data-field="ALT" placeholder="圖片描述 (SEO)"></div></div>
           <div class="input-group">
               <label class="field-label">標題</label>
               <div class="merged-input">
                   <select class="tag-select" data-field="TITLE_TAG"><option value="h1">H1</option><option value="h2">H2</option><option value="h3" selected>H3</option></select>
                   <input type="text" class="main-input" data-field="TITLE" placeholder="卡片標題">
               </div>
           </div>
           <div class="input-group"><label class="field-label">敘述</label><textarea class="textarea-input" data-field="DESC" placeholder="輸入卡片內容..."></textarea></div>`,
    ICON_CARD: `
                <div class="input-group removable-field"><div class="label-container"><label class="field-label">圖片 URL</label><button type="button" class="remove-field-btn" title="移除此欄位"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2v2"></path></svg></button></div><div class="merged-input"><input type="text" class="main-input" data-field="URL" placeholder="項目主圖連結"></div></div>
                <div class="input-group removable-field"><div class="label-container"><label class="field-label">圖片 Alt</label><button type="button" class="remove-field-btn" title="移除此欄位"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2v2"></path></svg></button></div><div class="merged-input"><input type="text" class="main-input" data-field="ALT" placeholder="圖片描述 (SEO)"></div></div>
                <div class="input-group removable-field"><div class="label-container"><label class="field-label">Icon URL</label><button type="button" class="remove-field-btn" title="移除此欄位"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2v2"></path></svg></button></div><div class="merged-input"><input type="text" class="main-input" data-field="ICON_URL" placeholder="小圖示連結"></div></div>
                <div class="input-group">
                    <label class="field-label">標題</label>
                    <div class="merged-input">
                        <select class="tag-select" data-field="TITLE_TAG"><option value="h1">H1</option><option value="h2">H2</option><option value="h3" selected>H3</option></select>
                        <input type="text" class="main-input" data-field="TITLE" placeholder="項目標題">
                    </div>
                </div>
                <div class="input-group"><label class="field-label">敘述</label><textarea class="textarea-input" data-field="DESC" placeholder="輸入項目內容..."></textarea></div>`,
    NUMBER_CARD: `
                  <div class="input-group removable-field"><div class="label-container"><label class="field-label">Icon URL</label><button type="button" class="remove-field-btn" title="移除此欄位"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2v2"></path></svg></button></div><div class="merged-input"><input type="text" class="main-input" data-field="ICON_URL" placeholder="Icon 連結"></div></div>
                  <div class="input-group removable-field"><div class="label-container"><label class="field-label">Icon Alt</label><button type="button" class="remove-field-btn" title="移除此欄位"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2v2"></path></svg></button></div><div class="merged-input"><input type="text" class="main-input" data-field="ALT" placeholder="Icon 描述 (SEO)"></div></div>
                  <div class="input-group">
                      <label class="field-label">標題</label>
                      <div class="merged-input">
                          <select class="tag-select" data-field="TITLE_TAG"><option value="h1">H1</option><option value="h2">H2</option><option value="h3" selected>H3</option></select>
                          <input type="text" class="main-input" data-field="TITLE" placeholder="卡片標題">
                      </div>
                  </div>
                  <div class="input-group"><label class="field-label">敘述</label><textarea class="textarea-input" data-field="DESC" placeholder="輸入卡片內容..."></textarea></div>`,
    ONE_COLUMN_ITEM: `
                      <div class="input-group removable-field"><div class="label-container"><label class="field-label">圖片 URL</label><button type="button" class="remove-field-btn" title="移除此欄位"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2v2"></path></svg></button></div><div class="merged-input"><input type="text" class="main-input" data-field="URL" placeholder="圖片連結"></div></div>
                      <div class="input-group removable-field"><div class="label-container"><label class="field-label">圖片 Alt</label><button type="button" class="remove-field-btn" title="移除此欄位"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2v2"></path></svg></button></div><div class="merged-input"><input type="text" class="main-input" data-field="ALT" placeholder="圖片描述 (SEO)"></div></div>
                      <div class="input-group">
                          <label class="field-label">標題</label>
                          <div class="merged-input">
                              <select class="tag-select" data-field="TITLE_TAG"><option value="h1">H1</option><option value="h2">H2</option><option value="h3" selected>H3</option></select>
                              <input type="text" class="main-input" data-field="TITLE" placeholder="項目主標題">
                          </div>
                      </div>
                      <div class="input-group">
                          <label class="field-label">小標</label>
                          <div class="merged-input">
                              <select class="tag-select" data-field="SUBTITLE_TAG"><option value="h1">H1</option><option value="h2">H2</option><option value="h3" selected>H3</option></select>
                              <input type="text" class="main-input" data-field="SUBTITLE" placeholder="項目副標題">
                          </div>
                      </div>
                      <div class="input-group"><label class="field-label">敘述</label><textarea class="textarea-input" data-field="DESC" placeholder="輸入項目內容..."></textarea></div>`,
    ALT_ROW: `
              <div class="input-group"><label class="field-label">排列方式</label><div class="merged-input"><select class="main-input" data-field="POSITION"><option value="image-left">左圖右文</option><option value="image-right">右圖左文</option></select></div></div>
              <div class="input-group removable-field"><div class="label-container"><label class="field-label">主圖 URL</label><button type="button" class="remove-field-btn" title="移除此欄位"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2v2"></path></svg></button></div><div class="merged-input"><input type="text" class="main-input" data-field="MAIN_URL" placeholder="大圖連結"></div></div>
              <div class="input-group removable-field"><div class="label-container"><label class="field-label">主圖 Alt</label><button type="button" class="remove-field-btn" title="移除此欄位"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2v2"></path></svg></button></div><div class="merged-input"><input type="text" class="main-input" data-field="MAIN_ALT" placeholder="大圖描述 (SEO)"></div></div>
              <div class="input-group">
                  <label class="field-label">副標題</label>
                  <div class="merged-input">
                      <select class="tag-select" data-field="SUBTITLE_TAG"><option value="h1">H1</option><option value="h2">H2</option><option value="h3" selected>H3</option></select>
                      <input type="text" class="main-input" data-field="SUBTITLE" placeholder="文字區塊的副標題">
                  </div>
              </div>
              <div class="input-group"><label class="field-label">敘述</label><textarea class="textarea-input" data-field="DESC" placeholder="輸入文字區塊的內容..."></textarea></div>`,
    STICKY_TEXT_ROW: `
                      <div class="input-group removable-field">
                          <div class="label-container">
                              <label class="field-label">標題</label>
                              <button type="button" class="remove-field-btn" title="移除此欄位"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2v2"></path></svg></button>
                          </div>
                          <div class="merged-input">
                              <select class="tag-select" data-field="TITLE_TAG"><option value="h1">H1</option><option value="h2">H2</option><option value="h3" selected>H3</option></select>
                              <input type="text" class="main-input" data-field="TITLE" placeholder="輸入標題">
                          </div>
                      </div>
                      <div class="input-group removable-field">
                          <div class="label-container">
                              <label class="field-label">副標題</label>
                              <button type="button" class="remove-field-btn" title="移除此欄位"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2v2"></path></svg></button>
                          </div>
                          <div class="merged-input">
                              <select class="tag-select" data-field="SUBTITLE_TAG"><option value="h1">H1</option><option value="h2">H2</option><option value="h3" selected>H3</option></select>
                              <input type="text" class="main-input" data-field="SUBTITLE" placeholder="輸入副標題">
                          </div>
                      </div>
                      <div class="input-group"><label class="field-label">敘述</label><textarea class="textarea-input" data-field="DESC" placeholder="輸入內容..."></textarea></div>`,
    QA_ROW: `
             <div class="input-group removable-field">
                 <div class="label-container">
                     <label class="field-label">問題</label>
                     <button type="button" class="remove-field-btn" title="移除此欄位"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2v2"></path></svg></button>
                 </div>
                 <div class="merged-input">
                     <select class="tag-select" data-field="TITLE_TAG"><option value="h1">H1</option><option value="h2">H2</option><option value="h3" selected>H3</option></select>
                     <input type="text" class="main-input" data-field="TITLE" placeholder="輸入問題">
                 </div>
             </div>
             <div class="input-group"><label class="field-label">回答</label><textarea class="textarea-input" data-field="DESC" placeholder="輸入回答..."></textarea></div>`,
    TWO_COL_IMAGE_ICON_ITEM: `
                              <div class="input-group removable-field"><div class="label-container"><label class="field-label">Icon URL</label><button type="button" class="remove-field-btn" title="移除此欄位"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2v2"></path></svg></button></div><div class="merged-input"><input type="text" class="main-input" data-field="ICON_URL" placeholder="輸入 Icon 圖片網址"></div></div>
                              <div class="input-group removable-field"><div class="label-container"><label class="field-label">Icon Alt</label><button type="button" class="remove-field-btn" title="移除此欄位"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2v2"></path></svg></button></div><div class="merged-input"><input type="text" class="main-input" data-field="ICON_ALT" placeholder="輸入 Icon 描述 (alt)"></div></div>
                              <div class="input-group"><label class="field-label">敘述</label><textarea class="textarea-input" data-field="DESC" placeholder="輸入項目敘述..."></textarea></div>`,
    ICON_TITLE_CARD: `
                      <div class="input-group removable-field"><div class="label-container"><label class="field-label">Icon URL</label><button type="button" class="remove-field-btn" title="移除此欄位"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2v2"></path></svg></button></div><div class="merged-input"><input type="text" class="main-input" data-field="URL" placeholder="Icon 連結"></div></div>
                      <div class="input-group removable-field"><div class="label-container"><label class="field-label">Icon Alt</label><button type="button" class="remove-field-btn" title="移除此欄位"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2v2"></path></svg></button></div><div class="merged-input"><input type="text" class="main-input" data-field="ALT" placeholder="Icon 描述 (SEO)"></div></div>
                      <div class="input-group">
                          <label class="field-label">標題</label>
                          <div class="merged-input">
                              <select class="tag-select" data-field="TITLE_TAG"><option value="h1">H1</option><option value="h2">H2</option><option value="h3" selected>H3</option></select>
                              <input type="text" class="main-input" data-field="TITLE" placeholder="卡片標題">
                          </div>
                      </div>
                      <div class="input-group"><label class="field-label">敘述</label><textarea class="textarea-input" data-field="DESC" placeholder="輸入卡片內容..."></textarea></div>`,
    IMAGE_TITLE_DESC_CARD: `
                            <div class="input-group removable-field"><div class="label-container"><label class="field-label">圖片 URL</label><button type="button" class="remove-field-btn" title="移除此欄位"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2v2"></path></svg></button></div><div class="merged-input"><input type="text" class="main-input" data-field="URL" placeholder="項目主圖連結"></div></div>
                            <div class="input-group removable-field"><div class="label-container"><label class="field-label">圖片 Alt</label><button type="button" class="remove-field-btn" title="移除此欄位"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2v2"></path></svg></button></div><div class="merged-input"><input type="text" class="main-input" data-field="ALT" placeholder="圖片描述 (SEO)"></div></div>
                            <div class="input-group">
                                <label class="field-label">標題</label>
                                <div class="merged-input">
                                    <select class="tag-select" data-field="TITLE_TAG"><option value="h1">H1</option><option value="h2">H2</option><option value="h3" selected>H3</option></select>
                                    <input type="text" class="main-input" data-field="TITLE" placeholder="項目標題">
                                </div>
                            </div>
                            <div class="input-group"><label class="field-label">敘述</label><textarea class="textarea-input" data-field="DESC" placeholder="輸入項目內容..."></textarea></div>`,
    TEXT_CARD: `
                <div class="input-group removable-field">
                    <div class="label-container">
                        <label class="field-label">標題</label>
                        <button type="button" class="remove-field-btn" title="移除此欄位"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2v2"></path></svg></button>
                    </div>
                    <div class="merged-input">
                        <select class="tag-select" data-field="TITLE_TAG"><option value="h1">H1</option><option value="h2">H2</option><option value="h3" selected>H3</option></select>
                        <input type="text" class="main-input" data-field="TITLE" placeholder="卡片標題">
                    </div>
                </div>
                <div class="input-group removable-field">
                    <div class="label-container">
                        <label class="field-label">副標題</label>
                        <button type="button" class="remove-field-btn" title="移除此欄位"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2v2"></path></svg></button>
                    </div>
                    <div class="merged-input">
                        <select class="tag-select" data-field="SUBTITLE_TAG"><option value="h1">H1</option><option value="h2">H2</option><option value="h3" selected>H3</option></select>
                        <input type="text" class="main-input" data-field="SUBTITLE" placeholder="卡片副標題 (可選)">
                    </div>
                </div>
                <div class="input-group"><label class="field-label">敘述</label><textarea class="textarea-input" data-field="DESC" placeholder="輸入卡片內容..."></textarea></div>`,
    COMPANY_NAME: `
        <div class="input-group">
            <label class="field-label">公司名稱</label><div class="merged-input"><input type="text" class="main-input" data-field="COMPANY_NAME" placeholder="公司名稱"></div>
        </div>`,
    COMPANY_TEXT_ITEM: `
        <div class="input-group"><label class="field-label">項目標題</label><div class="merged-input"><input type="text" class="main-input" data-field="LABEL" placeholder="例如：地址"></div></div>
        <div class="input-group"><label class="field-label">項目內容 (一行一個)</label><textarea class="textarea-input" data-field="TEXT" placeholder="請輸入顯示的文字"></textarea></div>`,
    COMPANY_LINK_ITEM: `
        <div class="input-group"><label class="field-label">項目標題</label><div class="merged-input"><input type="text" class="main-input" data-field="LABEL" placeholder="例如：電話"></div></div>
        <div class="input-group"><label class="field-label">連結內容</label><textarea class="textarea-input" data-field="TEXT" placeholder="04-23445555,tel:0423445555"></textarea></div>`,
};

/**
 * 區塊顯示名稱
 * 用於在 UI 上（如下拉式選單）顯示更友善的名稱。
 */
export const BLOCK_DISPLAY_NAMES = {
    'MAIN_TEXT': '主要文字區塊',
    'TITLE_BLOCK': '區塊主/副標題',
    'MAIN_IMAGE': '主要圖片區塊',
    'QA_ROW': '題目',
    'ALT_ROW': '圖文列',
    'STICKY_TEXT_ROW': '項目',
    'ONE_COLUMN_ITEM': '項目',
    'ICON_CARD': '卡片',
    'TWO_COL_IMAGE_ICON_ITEM': 'icon',
    'CARD': '卡片',
    'ICON_TITLE_CARD': '卡片',
    'NUMBER_CARD': '卡片',
    'OL': 'OL',
    'TABLE': '表格',
    'IMAGE_TITLE_DESC_CARD': '項目',
    'TEXT_CARD': '文字卡片',
    'COMPANY_TEXT_ITEM': '文字項目',
    'COMPANY_LINK_ITEM': '連結項目',
};

/**
 * 獲取指定區塊類型的編輯器 HTML。
 * @param {string} type - 區塊類型。
 * @returns {string} - HTML 字符串。
 */
export function getBlockEditorTemplate(type) {
    return BLOCK_EDITOR_TEMPLATES[type] || '';
}

/**
 * 所有版型的定義。
 * - id: 版型唯一標識。
 * - name: 顯示名稱。
 * - initialBlocks: 選擇此版型時初始化的區塊。
 * - insertableBlocks: 在此版型下，可以透過 "+" 按鈕新增的區塊。
 */
export const layouts = {
    "article-01": {
        id: "article-01",
        name: "上文下圖",
        initialBlocks: [{ type: 'MAIN_TEXT', isRemovable: false }, { type: 'MAIN_IMAGE', isRemovable: false }],
        insertableBlocks: {
            default: ['H2', 'H3', 'P', 'UL', 'OL', 'A', 'IMAGE', 'HR', 'TABLE']
        }
    },
    "article-02": {
        id: "article-02",
        name: "右圖左文",
        initialBlocks: [{ type: 'MAIN_TEXT', isRemovable: false }, { type: 'MAIN_IMAGE', isRemovable: false }],
        insertableBlocks: {
            default: ['H2', 'H3', 'P', 'UL', 'OL', 'A', 'IMAGE', 'HR', 'TABLE']
        }
    },
    "article-03": {
        id: "article-03",
        name: "左圖右文",
        initialBlocks: [{ type: 'MAIN_IMAGE', isRemovable: false }, { type: 'MAIN_TEXT', isRemovable: false }],
        insertableBlocks: {
            default: ['H2', 'H3', 'P', 'UL', 'OL', 'A', 'IMAGE', 'HR', 'TABLE']
        }
    },
    "article-04": {
        id: "article-04",
        name: "兩欄_純文字+分隔線",
        initialBlocks: [
            { type: 'MAIN_TEXT', isRemovable: false, editorHtml: BLOCK_EDITOR_TEMPLATES.TITLE_BLOCK },
            { type: 'TEXT_CARD', isRemovable: true, initialData: { TITLE_TAG: 'h3' } },
            { type: 'TEXT_CARD', isRemovable: true, initialData: { TITLE_TAG: 'h3' } }
        ],
        insertableBlocks: {
            TEXT_CARD: ['TEXT_CARD']
        }
    },
    "article-05": {
        id: "article-05",
        name: "兩欄_圖片+標題+敘述",
        initialBlocks: [
            { type: 'MAIN_TEXT', isRemovable: false, editorHtml: BLOCK_EDITOR_TEMPLATES.TITLE_BLOCK },
            { type: 'IMAGE_TITLE_DESC_CARD', isRemovable: true, initialData: { TITLE_TAG: 'h3' } },
            { type: 'IMAGE_TITLE_DESC_CARD', isRemovable: true, initialData: { TITLE_TAG: 'h3' } }
        ],
        insertableBlocks: {
            IMAGE_TITLE_DESC_CARD: ['IMAGE_TITLE_DESC_CARD']
        }
    },
    "article-06": {
        id: "article-06",
        name: "QA列表",
        initialBlocks: [
            { type: 'MAIN_TEXT', isRemovable: false, editorHtml: BLOCK_EDITOR_TEMPLATES.TITLE_BLOCK },
            { type: 'QA_ROW', isRemovable: true, initialData: { TITLE_TAG: 'h3' } },
            { type: 'QA_ROW', isRemovable: true, initialData: { TITLE_TAG: 'h3' } },
            { type: 'QA_ROW', isRemovable: true, initialData: { TITLE_TAG: 'h3' } }
        ],
        insertableBlocks: {
            QA_ROW: ['QA_ROW']
        }
    },
    "article-07": {
        id: "article-07",
        name: "右文左圖+左文右圖",
        initialBlocks: [
            { type: 'MAIN_TEXT', isRemovable: false, editorHtml: BLOCK_EDITOR_TEMPLATES.TITLE_BLOCK },
            { type: 'ALT_ROW', isRemovable: true, initialData: { SUBTITLE_TAG: 'h3' } },
            { type: 'ALT_ROW', isRemovable: true, initialData: { POSITION: 'image-right', SUBTITLE_TAG: 'h3' } }
        ],
        insertableBlocks: {
            ALT_ROW: ['ALT_ROW']
        }
    },
    "article-08": {
        id: "article-08",
        name: "一欄_純文字_數字+標題+敘述+sticky",
        initialBlocks: [
            { type: 'MAIN_TEXT', isRemovable: false, editorHtml: BLOCK_EDITOR_TEMPLATES.TITLE_BLOCK },
            { type: 'STICKY_TEXT_ROW', isRemovable: true, initialData: { TITLE_TAG: 'h3' } }
        ],
        insertableBlocks: {
            STICKY_TEXT_ROW: ['STICKY_TEXT_ROW']
        }
    },
    "article-13": {
        id: "article-13",
        name: "三欄_icon+標題+敘述+分隔線",
        initialBlocks: [
            { type: 'MAIN_TEXT', isRemovable: false, editorHtml: BLOCK_EDITOR_TEMPLATES.TITLE_BLOCK },
            { type: 'ICON_TITLE_CARD', isRemovable: true, initialData: { TITLE_TAG: 'h3' } },
            { type: 'ICON_TITLE_CARD', isRemovable: true, initialData: { TITLE_TAG: 'h3' } },
            { type: 'ICON_TITLE_CARD', isRemovable: true, initialData: { TITLE_TAG: 'h3' } }
        ],
        insertableBlocks: {
            ICON_TITLE_CARD: ['ICON_TITLE_CARD']
        }
    },
    "article-14": {
        id: "article-14",
        name: "三欄_數字+icon+標題+敘述",
        initialBlocks: [
            { type: 'MAIN_TEXT', isRemovable: false, editorHtml: BLOCK_EDITOR_TEMPLATES.TITLE_BLOCK },
            { type: 'NUMBER_CARD', isRemovable: true, initialData: { TITLE_TAG: 'h3' } },
            { type: 'NUMBER_CARD', isRemovable: true, initialData: { TITLE_TAG: 'h3' } },
            { type: 'NUMBER_CARD', isRemovable: true, initialData: { TITLE_TAG: 'h3' } }
        ],
        insertableBlocks: {
            NUMBER_CARD: ['NUMBER_CARD']
        }
    },
    "article-09": {
        id: "article-09",
        name: "一欄_圖片+標題+小標+敘述",
        initialBlocks: [
            { type: 'MAIN_TEXT', isRemovable: false, editorHtml: BLOCK_EDITOR_TEMPLATES.TITLE_BLOCK },
            { type: 'ONE_COLUMN_ITEM', isRemovable: true, initialData: { TITLE_TAG: 'h3' } }
        ],
        insertableBlocks: {
            ONE_COLUMN_ITEM: ['ONE_COLUMN_ITEM']
        }
    },
    "article-10": {
        id: "article-10",
        name: "兩欄_圖片+icon+標題+敘述",
        initialBlocks: [
            { type: 'MAIN_TEXT', isRemovable: false, editorHtml: BLOCK_EDITOR_TEMPLATES.TITLE_BLOCK },
            { type: 'ICON_CARD', isRemovable: true, initialData: { TITLE_TAG: 'h3' } },
            { type: 'ICON_CARD', isRemovable: true, initialData: { TITLE_TAG: 'h3' } }
        ],
        insertableBlocks: {
            ICON_CARD: ['ICON_CARD']
        }
    },
    "article-11": {
        id: "article-11",
        name: "兩欄_左圖+右icon+標題+敘述",
        initialBlocks: [
            { type: 'MAIN_TEXT', isRemovable: false, editorHtml: BLOCK_EDITOR_TEMPLATES.TITLE_BLOCK },
            { type: 'MAIN_IMAGE', isRemovable: true },
            { type: 'TWO_COL_IMAGE_ICON_ITEM', isRemovable: true },
        ],
        insertableBlocks: {
            TWO_COL_IMAGE_ICON_ITEM: ['TWO_COL_IMAGE_ICON_ITEM']
        }
    },
    "article-12": {
        id: "article-12",
        name: "三欄_圖片+標題+敘述",
        initialBlocks: [
            { type: 'MAIN_TEXT', isRemovable: false, editorHtml: BLOCK_EDITOR_TEMPLATES.TITLE_BLOCK },
            { type: 'CARD', isRemovable: true, initialData: { TITLE_TAG: 'h3' } },
            { type: 'CARD', isRemovable: true, initialData: { TITLE_TAG: 'h3' } },
            { type: 'CARD', isRemovable: true, initialData: { TITLE_TAG: 'h3' } }
        ],
        insertableBlocks: {
            CARD: ['CARD']
        }
    },
    "article-15": {
        id: "article-15",
        name: "電子表單B-公司資訊",
        initialBlocks: [
            {
                type: 'COMPANY_NAME',
                isRemovable: false,
                previewData: {
                    COMPANY_NAME: '公司名稱',
                }
            },
            { type: 'COMPANY_LINK_ITEM', isRemovable: true, previewData: { LABEL: '電話', TEXT: '04-12345678', HREF: 'tel:04-12345678' } },
            { type: 'COMPANY_TEXT_ITEM', isRemovable: true, previewData: { LABEL: '傳真', TEXT: '04-2222222' } },
            { type: 'COMPANY_TEXT_ITEM', isRemovable: true, previewData: { LABEL: '地址', TEXT: '403臺中市西區大隆路20號4F - 2' } },
            { type: 'COMPANY_LINK_ITEM', isRemovable: true, previewData: { LABEL: '信箱', TEXT: '123@gmail.com', HREF: 'mailto:123@gmail.com' } },
        ],
        insertableBlocks: { default: ['COMPANY_TEXT_ITEM', 'COMPANY_LINK_ITEM'] }
    },
    "article-16": {
        id: "article-16",
        name: "表格",
        initialBlocks: [
            { type: 'TABLE', isRemovable: false }
        ],
        insertableBlocks: {
            default: ['TABLE']
        }
    },
};

layouts["article-15"].parsingConfig = {
    // 將第一個 H3 (###) 視為主標題，填入 COMPANY_NAME 區塊
    mainTitle: 'H3', // ### **公司名稱**
    mainTitleTarget: {
        blockType: 'COMPANY_NAME',
        field: 'COMPANY_NAME'
    },
    // 將 H4 (####) 視為項目的開始
    itemIdentifier: 'H4', // #### **電話**
    // 根據內容動態決定要建立哪種區塊
    dynamicItemBlockType: (group) => {
        const pBlock = group.find(b => b.type === 'P');
        // 如果內容包含 tel: 或 mailto: 或 http，就判斷為連結項目
        return pBlock && (pBlock.content.includes('tel:') || pBlock.content.includes('mailto:') || pBlock.content.includes('http'))
            ? 'COMPANY_LINK_ITEM' : 'COMPANY_TEXT_ITEM';
    },
    // 定義 Markdown 元素如何對應到編輯器欄位
    itemMapping: {
        'H4': 'LABEL', // #### **標題** -> 項目標題
        'P': 'TEXT'    // 下方的文字 -> 項目內容 (TEXT 欄位)
    }
};
// --- 在 layouts 物件定義完成後，再為其增加 parsingConfig ---

layouts["article-05"].parsingConfig = {
    mainTitle: 'H1',
    subTitle: 'H2',
    itemBlockType: 'IMAGE_TITLE_DESC_CARD',
    itemIdentifier: ['H3'],
    itemMapping: { 'IMAGE': { 'URL': 'URL', 'ALT': 'ALT' }, 'H3': 'TITLE', 'P': 'DESC', 'UL': 'DESC' }
};

layouts["article-04"].parsingConfig = {
    mainTitle: 'H1',
    subTitle: 'H2',
    itemBlockType: 'TEXT_CARD',
    itemIdentifier: 'H3',
    itemMapping: {
        'H3': 'TITLE',
        'H4': 'SUBTITLE',
        'P': 'DESC', 'UL': 'DESC'
    }
};

layouts["article-06"].parsingConfig = {
    mainTitle: 'H1',
    subTitle: 'H2',
    itemBlockType: 'QA_ROW',
    itemIdentifier: 'H3',
    itemMapping: { 'H3': 'TITLE', 'P': 'DESC', 'UL': 'DESC' }
};

layouts["article-07"].parsingConfig = {
    mainTitle: 'H1',
    subTitle: 'H2',
    itemBlockType: 'ALT_ROW',
    itemIdentifier: ['H3'],
    itemMapping: { 'IMAGE': { 'URL': 'MAIN_URL', 'ALT': 'MAIN_ALT' }, 'H3': 'SUBTITLE', 'P': 'DESC', 'UL': 'DESC' }
};

layouts["article-08"].parsingConfig = {
    mainTitle: 'H1',
    subTitle: 'H2',
    itemBlockType: 'STICKY_TEXT_ROW',
    itemIdentifier: 'H3', // 這裡的 H3 是指 ###
    itemMapping: { 'H3': 'TITLE', 'P': 'DESC', 'UL': 'DESC' }
};

layouts["article-09"].parsingConfig = {
    mainTitle: 'H1',
    subTitle: 'H2',
    itemBlockType: 'ONE_COLUMN_ITEM',
    itemIdentifier: ['H3'], // 項目由 H3 開始
    itemMapping: {
        'IMAGE': { 'URL': 'URL', 'ALT': 'ALT' },
        'H3': 'TITLE',
        'H4': 'SUBTITLE', // 假設有 H4 對應小標
        'P': 'DESC', 'UL': 'DESC'
    }
};

layouts["article-10"].parsingConfig = {
    mainTitle: 'H1',
    subTitle: 'H2',
    itemBlockType: 'ICON_CARD',
    itemIdentifier: ['H3'], // ICON_CARD 也有圖片
    itemMapping: {
        'IMAGE': { 'URL': 'URL', 'ALT': 'ALT' },
        'H3': 'TITLE',
        'P': 'DESC', 'UL': 'DESC'
    }
};

layouts["article-12"].parsingConfig = {
    mainTitle: 'H1',
    subTitle: 'H2',
    itemBlockType: 'CARD',
    itemIdentifier: ['H3'],
    itemMapping: {
        'IMAGE': { 'URL': 'URL', 'ALT': 'ALT' },
        'H3': 'TITLE', 'P': 'DESC', 'UL': 'DESC'
    }
};

layouts["article-13"].parsingConfig = {
    mainTitle: 'H1',
    subTitle: 'H2',
    itemBlockType: 'ICON_TITLE_CARD',
    itemIdentifier: ['H3'],
    itemMapping: {
        'IMAGE': { 'URL': 'URL', 'ALT': 'ALT' }, // 這裡的圖片是 ICON
        'H3': 'TITLE',
        'P': 'DESC', 'UL': 'DESC'
    }
};

layouts["article-14"].parsingConfig = {
    mainTitle: 'H1',
    subTitle: 'H2',
    itemBlockType: 'NUMBER_CARD',
    itemIdentifier: ['H3'], // NUMBER_CARD 也有 ICON
    itemMapping: {
        'IMAGE': { 'URL': 'ICON_URL', 'ALT': 'ALT' }, // 這裡的圖片是 ICON
        'H3': 'TITLE',
        'P': 'DESC', 'UL': 'DESC'
    }
};
layouts["article-11"].parsingConfig = {
    mainTitle: 'H1',
    subTitle: 'H2',
    itemBlockType: 'TWO_COL_IMAGE_ICON_ITEM',
    itemIdentifier: ['H3'],
    itemMapping: {
        'IMAGE': { 'URL': 'ICON_URL', 'ALT': 'ICON_ALT' },
        'H3': 'TITLE', // 即使是空的 H3 也會被視為標題，雖然 UI 上可能不會顯示
        'P': 'DESC', 'UL': 'DESC'
    }
};

layouts["article-16"].parsingConfig = {
    mainTitle: 'H1',
    subTitle: 'H2',
    itemBlockType: 'TABLE',
    itemIdentifier: 'TABLE',
    itemMapping: {
        'TABLE': 'MARKDOWN'
    }
};

// 為預設 SEO Blog 版型新增 parsingConfig
layouts["article-01"].parsingConfig = {
    mainTitle: 'H1',
    subTitle: 'H2', // Markdown H2 -> UI H3 (文章副標)
    atomicParsing: true,
    blockMapping: {
        'H1': 'H2', // Markdown H1 -> UI H2 (文章大標)
        // 'H2': 'H3', // Markdown H2 -> UI H3 (文章副標) - 已由 subTitle 處理，這裡不再需要映射，否則會重複
        'H3': 'H3', // Markdown H3 -> UI H3 (項目標題)
        'P': 'P',
        'UL': 'UL',
        'OL': 'OL',
        'IMAGE': 'IMAGE',
        'H4': 'H4',
        'TABLE': 'TABLE'
    }
};

layouts["article-02"].parsingConfig = {
    mainTitle: 'H1',
    subTitle: 'H2',
    atomicParsing: true,
    blockMapping: {
        'H1': 'H2',
        'H3': 'H3',
        'P': 'P',
        'UL': 'UL',
        'OL': 'OL',
        'IMAGE': 'IMAGE',
        'H4': 'H4',
        'TABLE': 'TABLE'
    }
};

layouts["article-03"].parsingConfig = {
    mainTitle: 'H1',
    subTitle: 'H2',
    atomicParsing: true,
    blockMapping: {
        'H1': 'H2',
        'H3': 'H3',
        'P': 'P',
        'UL': 'UL',
        'OL': 'OL',
        'IMAGE': 'IMAGE',
        'H4': 'H4',
        'TABLE': 'TABLE'
    }
};

export function getLayoutDefinition(layoutId) {
    return layouts[layoutId];
}