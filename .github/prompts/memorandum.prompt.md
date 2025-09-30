# memorandum
- 備忘錄功能頁面    

## 檔案位置
- 列表頁前端: `Views/Memorandum/Index.cshtml`
- 列表頁後端: `Controllers/MemorandumController.cs`
- 新增頁前端: `Views/Memorandum/Create.cshtml`
- 新增頁後端: `Controllers/MemorandumController.cs`
- 編輯頁前端: `Views/Memorandum/Edit.cshtml`
- 編輯頁後端: `Controllers/MemorandumController.cs`
- 刪除功能後端: `Controllers/MemorandumController.cs`
- 資料模型: `Models/Memorandum.cs`
- 資料儲存使用 `JSON` 檔案: `Data/memorandums.json`

## 功能描述
- 使用者可以新增、編輯、刪除備忘錄
- 備忘錄包含標題、內容、建立時間等欄位
- 資料儲存在 `JSON` 檔案中，方便輕量級存取
- 列表頁要顯示所有備忘錄，並提供編輯和刪除按鈕, 每一則紀錄都要有新增/編輯時間, 以及標題和內容的預覽
- UI 要簡潔易用，符合現代網頁設計風格, 每筆要交叉顯示淺色和深色背景, 以提升可讀性
- 使用 `Bootstrap` 框架來實現響應式設計，確保在各種裝置上都有良好顯示效果
- 表單要有基本的驗證，確保標題和內容不為空
- 編輯和刪除操作要有確認提示，防止誤操作
- 加入 `markdown` 支援，讓使用者可以用 `markdown` 語法來撰寫備忘錄內容
- 使用 `AJAX` 技術來實現無刷新操作，提升使用者體驗
- 加入搜尋功能，讓使用者可以快速找到特定的備忘錄
- 加入分頁功能，當備忘錄數量過多時，可以分頁顯示，提升效能
- 加入標籤功能，讓使用者可以為備忘錄添加標籤，方便分類和搜尋
