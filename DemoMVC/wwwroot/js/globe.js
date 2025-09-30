/**
 * 3D 互動式地球儀主程式
 * 使用 Three.js 渲染 3D 地球儀
 */

(function() {
    'use strict';

    // Three.js 核心物件
    let scene, camera, renderer, globe, controls;
    let markers = [];
    let animationId = null;
    
    // 地球儀設定
    let config = {
        autoRotate: false,
        rotationSpeed: 0.5,
        zoom: 2.5,
        minZoom: 1.0,
        maxZoom: 10.0
    };

    // 資料
    let locationsData = [];
    let selectedLocation = null;

    // 互動狀態
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    let rotationVelocity = { x: 0, y: 0 };

    /**
     * 初始化應用程式
     */
    async function init() {
        console.log('初始化 3D 地球儀...');
        
        try {
            // 顯示載入指示器
            GlobeControls.showLoading();

            // 初始化控制模組
            initControls();

            // 預先載入資料
            const data = await GlobeDataHandler.preloadData();
            locationsData = data.locations;
            
            if (data.settings) {
                config = {
                    ...config,
                    ...data.settings
                };
            }

            // 初始化 3D 場景
            console.log('🌍 開始建立 3D 場景...');
            initScene();
            console.log('✅ 場景已建立');
            
            initCamera();
            console.log('✅ 相機已建立');
            
            initRenderer();
            console.log('✅ 渲染器已建立');
            
            createGlobe();
            console.log('✅ 地球已建立');
            
            createLights();
            console.log('✅ 光源已建立');
            
            createMarkers();
            console.log('✅ 標記已建立');

            // 綁定事件
            bindCanvasEvents();
            console.log('✅ 事件已綁定');
            
            // 開始動畫循環
            animate();
            console.log('✅ 動畫已啟動');

            // 隱藏載入指示器
            GlobeControls.hideLoading();

            console.log('🎉 地球儀初始化完成!');
            GlobeDataHandler.showToast('地球儀載入完成', 'success');

        } catch (error) {
            console.error('❌ 初始化失敗', error);
            GlobeControls.hideLoading();
            GlobeDataHandler.showToast('初始化失敗,請重新整理頁面', 'error');
        }
    }

    /**
     * 初始化控制模組
     */
    function initControls() {
        GlobeControls.init({
            onResetView: resetView,
            onZoomIn: () => adjustZoom(0.5),
            onZoomOut: () => adjustZoom(-0.5),
            onAutoRotateToggle: toggleAutoRotate,
            onRotationSpeedChange: setRotationSpeed,
            onLayerToggle: toggleLayer,
            onLocationSelect: navigateToLocation,
            onQuickNavigate: navigateToLocationByName
        });
    }

    /**
     * 初始化 Three.js 場景
     */
    function initScene() {
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x0a0e1a);
    }

    /**
     * 初始化相機
     */
    function initCamera() {
        const container = document.getElementById('globe-canvas');
        const width = container.clientWidth;
        const height = container.clientHeight;

        camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(0, 0, 300 / config.zoom);
        camera.lookAt(0, 0, 0);
        
        console.log('相機已初始化', { position: camera.position, zoom: config.zoom });
    }

    /**
     * 初始化渲染器
     */
    function initRenderer() {
        const container = document.getElementById('globe-canvas');
        
        renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true 
        });
        
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(window.devicePixelRatio);
        container.appendChild(renderer.domElement);

        // 響應式調整
        window.addEventListener('resize', onWindowResize);
    }

    /**
     * 建立地球
     */
    function createGlobe() {
        // 建立球體幾何
        const geometry = new THREE.SphereGeometry(100, 64, 64);
        
        // 建立材質 (先使用純色作為基底)
        const material = new THREE.MeshPhongMaterial({
            color: 0x2a5599, // 海洋藍色
            emissive: 0x112244,
            emissiveIntensity: 0.1,
            shininess: 15,
            specular: 0x333333
        });

        globe = new THREE.Mesh(geometry, material);
        scene.add(globe);
        
        console.log('地球物件已建立 (使用純色材質)', globe);
        
        // 嘗試載入地球貼圖
        const textureLoader = new THREE.TextureLoader();
        textureLoader.crossOrigin = 'anonymous'; // 允許跨域載入
        
        // 使用公開的地球貼圖
        textureLoader.load(
            'https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/textures/planets/earth_atmos_2048.jpg',
            // 載入成功回調
            function(texture) {
                console.log('✅ 地球貼圖載入成功');
                globe.material.map = texture;
                globe.material.color.setHex(0xffffff); // 改為白色讓貼圖顯示原色
                globe.material.needsUpdate = true;
                GlobeDataHandler.showToast('地球貼圖載入完成', 'success');
            },
            // 載入進度回調
            function(xhr) {
                const percentComplete = (xhr.loaded / xhr.total * 100).toFixed(0);
                console.log(`載入貼圖中: ${percentComplete}%`);
            },
            // 載入失敗回調
            function(error) {
                console.warn('⚠️ 地球貼圖載入失敗,使用純色材質', error);
                GlobeDataHandler.showToast('使用簡化視覺效果', 'info');
                // 保持使用純色材質,已經在上面設定好了
            }
        );

        // 加入經緯線網格 (增加視覺效果)
        const wireframeGeometry = new THREE.SphereGeometry(100.5, 32, 32);
        const wireframeMaterial = new THREE.MeshBasicMaterial({
            color: 0x44aaff,
            wireframe: true,
            transparent: true,
            opacity: 0.15
        });
        const wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
        globe.add(wireframe);

        // 建立大氣層效果
        const atmosphereGeometry = new THREE.SphereGeometry(102, 64, 64);
        const atmosphereMaterial = new THREE.MeshBasicMaterial({
            color: 0x4a90e2,
            transparent: true,
            opacity: 0.15,
            side: THREE.BackSide
        });
        const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        globe.add(atmosphere);
        
        console.log('✅ 地球場景建立完成');
    }

    /**
     * 建立光源
     */
    function createLights() {
        // 環境光 (增強亮度)
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);

        // 方向光 (模擬太陽光)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
        directionalLight.position.set(200, 100, 200);
        scene.add(directionalLight);

        // 點光源 (增加立體感)
        const pointLight = new THREE.PointLight(0xffffff, 0.6);
        pointLight.position.set(-100, -100, 100);
        scene.add(pointLight);
        
        console.log('光源已建立');
    }

    /**
     * 建立地點標記
     */
    function createMarkers() {
        // 清除舊標記
        markers.forEach(marker => globe.remove(marker));
        markers = [];

        locationsData.forEach(location => {
            const marker = createMarker(location);
            globe.add(marker);
            markers.push(marker);
        });

        console.log(`建立了 ${markers.length} 個標記`);
    }

    /**
     * 建立單一標記
     */
    function createMarker(location) {
        // 將經緯度轉換為 3D 座標
        const phi = (90 - location.latitude) * Math.PI / 180;
        const theta = (location.longitude + 180) * Math.PI / 180;
        const radius = 101;

        const x = -radius * Math.sin(phi) * Math.cos(theta);
        const y = radius * Math.cos(phi);
        const z = radius * Math.sin(phi) * Math.sin(theta);

        // 建立標記幾何
        const geometry = new THREE.SphereGeometry(1.5, 16, 16);
        const color = GlobeDataHandler.getMarkerColor(location.type);
        const material = new THREE.MeshBasicMaterial({ color: color });
        const marker = new THREE.Mesh(geometry, material);

        marker.position.set(x, y, z);
        marker.userData = location;

        // 新增標籤 (使用 Sprite)
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 64;
        
        context.fillStyle = 'rgba(0, 0, 0, 0.7)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        context.fillStyle = '#ffffff';
        context.font = 'Bold 24px Arial';
        context.textAlign = 'center';
        context.fillText(location.name, canvas.width / 2, canvas.height / 2 + 8);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(15, 4, 1);
        sprite.position.copy(marker.position).multiplyScalar(1.1);
        sprite.visible = false; // 預設隱藏標籤
        
        marker.add(sprite);
        marker.userData.label = sprite;

        return marker;
    }

    /**
     * 綁定畫布事件
     */
    function bindCanvasEvents() {
        const canvas = renderer.domElement;

        // 滑鼠事件
        canvas.addEventListener('mousedown', onMouseDown);
        canvas.addEventListener('mousemove', onMouseMove);
        canvas.addEventListener('mouseup', onMouseUp);
        canvas.addEventListener('wheel', onMouseWheel);
        canvas.addEventListener('click', onCanvasClick);

        // 觸控事件
        canvas.addEventListener('touchstart', onTouchStart);
        canvas.addEventListener('touchmove', onTouchMove);
        canvas.addEventListener('touchend', onTouchEnd);
    }

    /**
     * 滑鼠按下
     */
    function onMouseDown(event) {
        isDragging = true;
        previousMousePosition = { x: event.clientX, y: event.clientY };
        rotationVelocity = { x: 0, y: 0 };
    }

    /**
     * 滑鼠移動
     */
    function onMouseMove(event) {
        if (isDragging) {
            const deltaX = event.clientX - previousMousePosition.x;
            const deltaY = event.clientY - previousMousePosition.y;

            globe.rotation.y += deltaX * 0.005;
            globe.rotation.x += deltaY * 0.005;

            // 限制 X 軸旋轉範圍
            globe.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, globe.rotation.x));

            rotationVelocity = { x: deltaY * 0.005, y: deltaX * 0.005 };
            previousMousePosition = { x: event.clientX, y: event.clientY };
        } else {
            updateCoordinatesFromMouse(event);
        }
    }

    /**
     * 滑鼠放開
     */
    function onMouseUp() {
        isDragging = false;
    }

    /**
     * 滑鼠滾輪
     */
    function onMouseWheel(event) {
        event.preventDefault();
        const delta = event.deltaY > 0 ? -0.3 : 0.3;
        adjustZoom(delta);
    }

    /**
     * 畫布點擊
     */
    function onCanvasClick(event) {
        if (Math.abs(event.clientX - previousMousePosition.x) > 5 || 
            Math.abs(event.clientY - previousMousePosition.y) > 5) {
            return; // 如果滑鼠移動過多,視為拖曳而非點擊
        }

        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        const rect = renderer.domElement.getBoundingClientRect();

        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(markers);

        if (intersects.length > 0) {
            const clickedMarker = intersects[0].object;
            const location = clickedMarker.userData;
            selectLocation(location);
        }
    }

    /**
     * 觸控開始
     */
    function onTouchStart(event) {
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            previousMousePosition = { x: touch.clientX, y: touch.clientY };
            isDragging = true;
        }
    }

    /**
     * 觸控移動
     */
    function onTouchMove(event) {
        event.preventDefault();
        
        if (event.touches.length === 1 && isDragging) {
            const touch = event.touches[0];
            const deltaX = touch.clientX - previousMousePosition.x;
            const deltaY = touch.clientY - previousMousePosition.y;

            globe.rotation.y += deltaX * 0.005;
            globe.rotation.x += deltaY * 0.005;

            globe.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, globe.rotation.x));

            previousMousePosition = { x: touch.clientX, y: touch.clientY };
        }
    }

    /**
     * 觸控結束
     */
    function onTouchEnd() {
        isDragging = false;
    }

    /**
     * 更新座標顯示
     */
    function updateCoordinatesFromMouse(event) {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();
        const rect = renderer.domElement.getBoundingClientRect();

        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(globe);

        if (intersects.length > 0) {
            const point = intersects[0].point;
            const latitude = 90 - (Math.acos(point.y / 100) * 180 / Math.PI);
            const longitude = ((270 + (Math.atan2(point.x, point.z) * 180 / Math.PI)) % 360) - 180;
            
            GlobeControls.updateCoordinatesDisplay(latitude, longitude);
        }
    }

    /**
     * 視窗大小調整
     */
    function onWindowResize() {
        const container = document.getElementById('globe-canvas');
        const width = container.clientWidth;
        const height = container.clientHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
    }

    /**
     * 動畫循環
     */
    function animate() {
        animationId = requestAnimationFrame(animate);

        // 自動旋轉
        if (config.autoRotate && !isDragging) {
            globe.rotation.y += config.rotationSpeed * 0.001;
        }

        // 慣性滑動
        if (!isDragging && (Math.abs(rotationVelocity.x) > 0.0001 || Math.abs(rotationVelocity.y) > 0.0001)) {
            globe.rotation.y += rotationVelocity.y;
            globe.rotation.x += rotationVelocity.x;
            globe.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, globe.rotation.x));
            
            rotationVelocity.x *= 0.95;
            rotationVelocity.y *= 0.95;
        }

        renderer.render(scene, camera);
    }

    /**
     * 調整縮放
     */
    function adjustZoom(delta) {
        config.zoom = Math.max(config.minZoom, Math.min(config.maxZoom, config.zoom + delta));
        camera.position.z = 300 / config.zoom;
        GlobeControls.updateZoomDisplay(config.zoom);
    }

    /**
     * 重置視角
     */
    function resetView() {
        globe.rotation.set(0, 0, 0);
        config.zoom = config.defaultZoom || 2.5;
        camera.position.z = 300 / config.zoom;
        GlobeControls.updateZoomDisplay(config.zoom);
        GlobeDataHandler.showToast('視角已重置', 'success');
    }

    /**
     * 切換自動旋轉
     */
    function toggleAutoRotate(enabled) {
        config.autoRotate = enabled;
        GlobeDataHandler.showToast(enabled ? '自動旋轉已啟用' : '自動旋轉已關閉', 'info');
    }

    /**
     * 設定旋轉速度
     */
    function setRotationSpeed(speed) {
        config.rotationSpeed = speed;
    }

    /**
     * 切換圖層
     */
    function toggleLayer(layerId, visible) {
        console.log(`圖層 ${layerId} ${visible ? '顯示' : '隱藏'}`);
        // 這裡可以實作圖層顯示/隱藏邏輯
    }

    /**
     * 選擇地點
     */
    function selectLocation(location) {
        selectedLocation = location;
        GlobeControls.showLocationInfo(location);
        
        // 顯示選中標記的標籤
        markers.forEach(marker => {
            if (marker.userData.label) {
                marker.userData.label.visible = (marker.userData.id === location.id);
            }
        });

        GlobeDataHandler.showToast(`已選擇: ${location.name}`, 'success');
    }

    /**
     * 導航至地點 (根據 ID)
     */
    async function navigateToLocation(locationId) {
        const location = await GlobeDataHandler.loadLocationById(locationId);
        if (location) {
            animateToLocation(location);
            selectLocation(location);
        }
    }

    /**
     * 導航至地點 (根據名稱)
     */
    async function navigateToLocationByName(name) {
        const location = locationsData.find(loc => 
            loc.name === name || loc.nameEn === name
        );
        
        if (location) {
            animateToLocation(location);
            selectLocation(location);
        }
    }

    /**
     * 動畫移動至地點
     */
    function animateToLocation(location) {
        const phi = (90 - location.latitude) * Math.PI / 180;
        const theta = (location.longitude + 180) * Math.PI / 180;

        const targetRotationY = -theta + Math.PI;
        const targetRotationX = phi - Math.PI / 2;

        // 簡單的動畫 (可以使用 TWEEN.js 做更平滑的動畫)
        const animateRotation = () => {
            const diffY = targetRotationY - globe.rotation.y;
            const diffX = targetRotationX - globe.rotation.x;

            if (Math.abs(diffY) > 0.01 || Math.abs(diffX) > 0.01) {
                globe.rotation.y += diffY * 0.1;
                globe.rotation.x += diffX * 0.1;
                requestAnimationFrame(animateRotation);
            }
        };

        animateRotation();
    }

    /**
     * 清理資源
     */
    function cleanup() {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
        
        window.removeEventListener('resize', onWindowResize);
        
        if (renderer) {
            renderer.dispose();
        }
    }

    // 頁面載入完成後初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // 頁面卸載時清理
    window.addEventListener('beforeunload', cleanup);

})();
