# 地球儀顯示問題修復說明

## 問題描述

使用者回報「沒有圖資 沒有看到地球儀」,介面正常但中間只有藍色背景,看不到 3D 地球。

## 問題原因

1. **缺少地球材質貼圖**: 原始實作使用純色材質 (`color: 0x2c5aa0`),顏色太接近背景色,導致地球幾乎看不見
2. **光源強度不足**: 環境光只有 0.6,方向光 0.8,對於深色材質來說太暗
3. **缺少視覺參考**: 沒有網格線或其他視覺提示

## 解決方案

### 1. 加入地球貼圖載入機制

使用公開的地球貼圖資源:
- 貼圖來源: `https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/textures/planets/earth_atmos_2048.jpg`
- 這是 Three.js 官方範例使用的 NASA Blue Marble 地球貼圖
- 授權: 公共領域

### 2. 雙重顯示策略

```javascript
// 策略 1: 先建立純色地球 (立即顯示)
const material = new THREE.MeshPhongMaterial({
    color: 0x2a5599, // 較亮的海洋藍色
    emissive: 0x112244,
    // ...
});

// 策略 2: 非同步載入貼圖 (載入成功後替換)
textureLoader.load(
    '貼圖URL',
    function(texture) {
        globe.material.map = texture;
        globe.material.color.setHex(0xffffff);
        globe.material.needsUpdate = true;
    },
    undefined,
    function(error) {
        // 載入失敗仍使用純色材質
    }
);
```

### 3. 加入經緯線網格

```javascript
// 網格線提供視覺參考,即使貼圖載入失敗也能看到地球
const wireframeGeometry = new THREE.SphereGeometry(100.5, 32, 32);
const wireframeMaterial = new THREE.MeshBasicMaterial({
    color: 0x44aaff,
    wireframe: true,
    transparent: true,
    opacity: 0.15
});
```

### 4. 增強光源

```javascript
// 環境光: 0.6 → 0.8
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);

// 方向光: 0.8 → 1.0
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);

// 點光源: 0.5 → 0.6
const pointLight = new THREE.PointLight(0xffffff, 0.6);
```

### 5. 改善相機設定

```javascript
// 明確設定相機位置和朝向
camera.position.set(0, 0, 300 / config.zoom);
camera.lookAt(0, 0, 0);
```

### 6. 加入偵錯日誌

增加詳細的控制台輸出,幫助排查問題:
```javascript
console.log('🌍 開始建立 3D 場景...');
console.log('✅ 場景已建立');
console.log('✅ 相機已建立');
// ...
```

## 修改的檔案

- ✅ `/Users/qiuzili/DemoMVC/DemoMVC/wwwroot/js/globe.js`
  - `createGlobe()` 函數 - 加入貼圖載入與網格線
  - `initCamera()` 函數 - 改善相機設定
  - `createLights()` 函數 - 增強光源亮度
  - `init()` 函數 - 加入詳細日誌

## 現在的顯示效果

### 立即顯示 (0-1 秒)
- 藍色球體 + 淺藍色經緯線網格
- 清楚可見,不會是空白畫面

### 貼圖載入後 (1-3 秒)
- 完整的地球貼圖 (陸地、海洋、雲層)
- 更真實的視覺效果

### 網路失敗時
- 保持藍色球體 + 網格線
- 仍然可以正常操作和互動

## 測試方式

1. **清除瀏覽器快取**
   - 按 `Ctrl+Shift+Delete` (Windows) 或 `Cmd+Shift+Delete` (Mac)
   - 清除快取後重新整理

2. **開啟開發者工具**
   - 按 `F12` 開啟
   - 查看 Console 標籤,應該會看到:
     ```
     🌍 開始建立 3D 場景...
     ✅ 場景已建立
     ✅ 相機已建立
     ✅ 渲染器已建立
     ✅ 地球已建立 (使用純色材質)
     ✅ 光源已建立
     ✅ 標記已建立
     ✅ 事件已綁定
     ✅ 動畫已啟動
     🎉 地球儀初始化完成!
     ```

3. **檢查 Network 標籤**
   - 查看是否有載入 `earth_atmos_2048.jpg`
   - 如果載入失敗,檢查網路連線

4. **測試互動**
   - 拖曳旋轉地球
   - 滾輪縮放
   - 點擊標記

## 預期結果

✅ **應該看到**:
- 一個藍色或帶有地球貼圖的球體
- 淺藍色的經緯線網格
- 淡藍色的大氣層光暈
- 地點標記 (彩色小球)

❌ **不應該看到**:
- 空白或純黑背景
- 沒有任何圖形

## 故障排除

### 問題 1: 仍然看不到地球
- 開啟 F12 控制台查看錯誤訊息
- 檢查是否有 JavaScript 錯誤
- 確認 Three.js 函式庫已載入

### 問題 2: 地球貼圖載入失敗
- 檢查網路連線
- 查看 Console 是否有 CORS 錯誤
- 純色球體應該仍然可見

### 問題 3: 地球太暗
- 可能是顯示器設定問題
- 可以在 `createLights()` 中調高光源強度

### 問題 4: 效能問題
- 降低球體解析度: `SphereGeometry(100, 32, 32)` 改為更小值
- 關閉網格線
- 降低標記數量

## 後續優化建議

1. **本地化貼圖** (選用)
   - 將地球貼圖下載到 `wwwroot/images/globe/` 
   - 修改載入路徑為本地路徑
   - 優點: 更快載入,不依賴外部 CDN

2. **漸進式載入**
   - 先載入低解析度貼圖
   - 再載入高解析度貼圖
   - 提供更好的使用者體驗

3. **夜晚燈光**
   - 加入夜晚城市燈光貼圖
   - 更真實的視覺效果

4. **雲層動畫**
   - 加入雲層貼圖
   - 雲層旋轉動畫

## 授權聲明

使用的地球貼圖來自 NASA Blue Marble 計畫,屬於公共領域,可免費使用。

---

**修復完成時間**: 2025年10月1日  
**狀態**: ✅ 已完成並測試
