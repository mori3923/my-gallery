let map;
let currentImageIndex = 0;
let currentWorkImages = [];
let currentWorkPath = '';

document.addEventListener('DOMContentLoaded', () => {
    initMap();
    
    // 閉じるボタン
    const closeBtn = document.getElementById('popup-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            document.getElementById('popup-overlay').style.display = 'none';
        });
    }

    // スライダー次へ
    const nextBtn = document.getElementById('slider-next');
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentWorkImages.length > 1) {
                currentImageIndex = (currentImageIndex + 1) % currentWorkImages.length;
                document.getElementById('popup-main-image').src = currentWorkPath + currentWorkImages[currentImageIndex];
            }
        });
    }

    // スライダー前へ
    const prevBtn = document.getElementById('slider-prev');
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (currentWorkImages.length > 1) {
                currentImageIndex = (currentImageIndex - 1 + currentWorkImages.length) % currentWorkImages.length;
                document.getElementById('popup-main-image').src = currentWorkPath + currentWorkImages[currentImageIndex];
            }
        });
    }
});

function initMap() {
    map = new maplibregl.Map({
        container: 'map-container',
        // moriさんの元の設定を優先。なければ水色の標準地図（OpenStreetMap）を使います
        style: (typeof SETTINGS !== 'undefined' && SETTINGS.MAP_STYLE_URL) 
            ? SETTINGS.MAP_STYLE_URL 
            : 'https://tile.openstreetmap.jp/styles/osm-bright-ja/style.json',
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
                        showPopup(work);
                    });
            });

            // 2. 国旗アイコンを表示する
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

    // Pythonが整頓した画像リストを使用
    currentWorkImages = work.images || [];
    currentWorkPath = `assets/${work.country}/${work.folder}/`;
    currentImageIndex = 0;

    // 画像の枚数に合わせて矢印のオン・オフを切り替え
    if (currentWorkImages.length === 0) {
        if (mainImg) mainImg.src = '';
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
    } else if (currentWorkImages.length === 1) {
        if (mainImg) mainImg.src = currentWorkPath + currentWorkImages[0];
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
    } else {
        if (mainImg) mainImg.src = currentWorkPath + currentWorkImages[0];
        if (prevBtn) prevBtn.style.display = 'block';
        if (nextBtn) nextBtn.style.display = 'block';
    }
    
    if (overlay) overlay.style.display = 'flex';
}

// 国旗アイコンの生成処理
function renderFlags(works) {
    const flagContainer = document.getElementById('flag-container');
    if (!flagContainer) return;

    // 国コード（jpなど）の重複をなくす
    const countries = [...new Set(works.map(w => w.country))];

    flagContainer.innerHTML = ''; 
    countries.forEach(country => {
        if (!country) return;
        
        const img = document.createElement('img');
        img.src = `assets/flags/${country}.png`; 
        img.alt = country;
        img.className = 'flag-icon';
        img.style.cursor = 'pointer';
        img.style.width = '40px'; 
        img.style.margin = '5px';
        img.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        
        // 国旗をクリックしたらその国へマップが移動
        img.addEventListener('click', () => {
            const targetWork = works.find(w => w.country === country);
            if (targetWork && map) {
                map.flyTo({ center: [targetWork.lng, targetWork.lat], zoom: 5 });
            }
        });

        flagContainer.appendChild(img);
    });
}