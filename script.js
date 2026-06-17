let map;
let currentImageIndex = 0;
let currentWorkImages = [];
let currentWorkPath = '';

document.addEventListener('DOMContentLoaded', () => {
    // HTMLをいじらなくてもいいように、JS側でポップアップの準備を全自動で行います
    setupPopupEnvironment();
    
    initMap();

    // VIEW MORE ボタンの動作（押したことがわかるように機能させました）
    const viewMoreBtn = document.getElementById('view-more-btn');
    if (viewMoreBtn) {
        viewMoreBtn.addEventListener('click', () => {
            alert('VIEW MOREが押されました！\n（※ここに全作品一覧を展開するなどの機能を追加できます）');
        });
    }
});

function initMap() {
    map = new maplibregl.Map({
        container: 'map-container',
        // 水色ベースの標準的な地図（OpenStreetMap）
        style: 'https://tile.openstreetmap.jp/styles/osm-bright-ja/style.json',
        center: [138.0, 36.0],
        zoom: 4.0,
        dragRotate: false
    });

    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            const works = data.works || [];

            // 1. ピンを立てる
            works.forEach(work => {
                const el = document.createElement('div');
                el.className = 'marker';
                el.style.backgroundColor = '#e53935';
                el.style.width = '20px';
                el.style.height = '20px';
                el.style.borderRadius = '50%';
                el.style.border = '2px solid white';
                el.style.cursor = 'pointer';
                el.style.boxShadow = '0 0 5px rgba(0,0,0,0.3)';

                new maplibregl.Marker(el)
                    .setLngLat([work.lng, work.lat])
                    .addTo(map)
                    .getElement().addEventListener('click', () => {
                        showPopup(work); // ここで詳細ウィンドウを呼び出します
                    });
            });

            // 2. 国旗アイコンを表示（丸くします）
            renderFlags(works);
        })
        .catch(error => console.error('データの読み込みエラー:', error));
}

// ギャラリーのポップアップ表示
function showPopup(work) {
    const overlay = document.getElementById('popup-overlay');
    const mainImg = document.getElementById('popup-main-image');
    const prevBtn = document.getElementById('slider-prev');
    const nextBtn = document.getElementById('slider-next');
    const dishName = document.getElementById('popup-dish-name');

    if (dishName) dishName.innerText = work.title;

    // Pythonツールからのデータがなければ '1.jpg' を仮置き
    currentWorkImages = (work.images && work.images.length > 0) ? work.images : ['1.jpg'];
    currentWorkPath = `assets/${work.country}/${work.folder}/`;
    currentImageIndex = 0;

    if (mainImg) mainImg.src = currentWorkPath + currentWorkImages[0];

    // 画像が1枚以下の場合は矢印ボタンを隠す
    if (currentWorkImages.length <= 1) {
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
    } else {
        if (prevBtn) prevBtn.style.display = 'block';
        if (nextBtn) nextBtn.style.display = 'block';
    }
    
    if (overlay) overlay.style.display = 'flex';
}

// 国旗アイコンの生成処理（ご要望の丸い形にします）
function renderFlags(works) {
    const flagContainer = document.getElementById('flag-container');
    if (!flagContainer) return;

    const countries = [...new Set(works.map(w => w.country))];
    flagContainer.innerHTML = ''; 

    countries.forEach(country => {
        if (!country) return;
        
        const flagWrap = document.createElement('div');
        flagWrap.style.display = 'inline-flex';
        flagWrap.style.justifyContent = 'center';
        flagWrap.style.alignItems = 'center';
        flagWrap.style.margin = '5px';
        flagWrap.style.cursor = 'pointer';
        
        // アイコンをまん丸にする設定
        flagWrap.style.width = '45px';
        flagWrap.style.height = '45px';
        flagWrap.style.borderRadius = '50%';
        flagWrap.style.backgroundColor = '#fff';
        flagWrap.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        flagWrap.style.overflow = 'hidden'; // 丸枠からはみ出た部分を隠す

        const img = document.createElement('img');
        img.src = `assets/flags/${country}.png`; 
        img.alt = country;
        img.style.width = '100%'; 
        img.style.height = '100%';
        img.style.objectFit = 'cover'; // 画像を崩さずに丸枠に敷き詰める
        
        // 画像が無い場合は文字にする
        img.onerror = () => {
            img.style.display = 'none';
            flagWrap.innerText = country.toUpperCase();
            flagWrap.style.fontSize = '12px';
            flagWrap.style.fontWeight = 'bold';
            flagWrap.style.color = '#555';
        };

        flagWrap.appendChild(img);

        // クリックでその国へジャンプ
        flagWrap.addEventListener('click', () => {
            const targetWork = works.find(w => w.country === country);
            if (targetWork && map) {
                map.flyTo({ center: [targetWork.lng, targetWork.lat], zoom: 5 });
            }
        });

        flagContainer.appendChild(flagWrap);
    });
}

// --- 以下、HTMLを編集しなくて済むようにする自動セットアップ処理 ---
function setupPopupEnvironment() {
    // ポップアップの枠がHTMLに無ければ自動で作る
    if (!document.getElementById('popup-overlay')) {
        const overlay = document.createElement('div');
        overlay.id = 'popup-overlay';
        overlay.style.display = 'none';
        overlay.innerHTML = `
            <div id="popup-content">
                <span id="popup-close">×</span>
                <h2 id="popup-dish-name">作品名</h2>
                <div id="slider-container">
                    <button id="slider-prev">◀</button>
                    <img id="popup-main-image" src="" alt="作品画像">
                    <button id="slider-next">▶</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        // デザイン（CSS）も自動で読み込ませる
        const style = document.createElement('style');
        style.innerHTML = `
            #popup-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); display: flex; justify-content: center; align-items: center; z-index: 1000; }
            #popup-content { background: #fff; padding: 20px; border-radius