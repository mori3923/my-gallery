let map;
let currentImageIndex = 0;
let currentWorkImages = [];
let currentWorkPath = '';
let globalWorks = []; // VIEW MOREの一覧表示用にデータを取っておく変数

// ページ読み込み時の処理
document.addEventListener('DOMContentLoaded', () => {
    initMap();

    // VIEW MORE ボタンを押したら一覧を出す
    const viewMoreBtn = document.getElementById('view-more-btn');
    if (viewMoreBtn) {
        viewMoreBtn.addEventListener('click', () => {
            showAllWorksList();
        });
    }

    // 写真ポップアップを閉じる
    const closeBtn = document.getElementById('popup-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            document.getElementById('popup-overlay').style.display = 'none';
        });
    }

    // 一覧ポップアップを閉じる
    const listCloseBtn = document.getElementById('list-close');
    if (listCloseBtn) {
        listCloseBtn.addEventListener('click', () => {
            document.getElementById('list-overlay').style.display = 'none';
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

// 地図の初期化
function initMap() {
    map = new maplibregl.Map({
        container: 'map-container',
        // moriさんの最初の美しい地図（CartoDB）
        style: 'https://tiles.basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
        center: [138.0, 36.0],
        zoom: 2.0, // 世界地図が見やすいズーム率
        dragRotate: false
    });

    // データの読み込み
    fetch('data.json')
        .then(response => {
            if (!response.ok) throw new Error('data.jsonが見つかりません');
            return response.json();
        })
        .then(data => {
            globalWorks = data.works || []; 

            globalWorks.forEach(work => {
                // デフォルトの美しい赤いしずくピン
                new maplibregl.Marker({ color: '#e53935' })
                    .setLngLat([work.lng, work.lat])
                    .addTo(map)
                    .getElement().addEventListener('click', () => {
                        showPopup(work);
                    });
            });

            // 国旗の表示
            renderFlags(globalWorks);
        })
        .catch(error => console.error('地図データの読み込みエラー:', error));
}

// VIEW MOREの一覧表示機能
function showAllWorksList() {
    const listOverlay = document.getElementById('list-overlay');
    const listContainer = document.getElementById('all-works-list');
    if (!listOverlay || !listContainer) return;

    listContainer.innerHTML = ''; 

    globalWorks.forEach(work => {
        const item = document.createElement('div');
        item.style.padding = '15px';
        item.style.borderBottom = '1px solid #eee';
        item.style.cursor = 'pointer';
        item.style.fontWeight = 'bold';
        item.style.color = '#333';
        item.innerText = `${work.title} (${work.country.toUpperCase()})`; 

        // リスト内の項目をクリックしたときの動き
        item.addEventListener('click', () => {
            listOverlay.style.display = 'none'; // リストを閉じる
            if (map) map.flyTo({ center: [work.lng, work.lat], zoom: 5 }); // マップ移動
            showPopup(work); // その作品の写真を出す
        });
        
        listContainer.appendChild(item);
    });

    listOverlay.style.display = 'flex';
}

// 写真ポップアップの表示
function showPopup(work) {
    const overlay = document.getElementById('popup-overlay');
    const mainImg = document.getElementById('popup-main-image');
    const prevBtn = document.getElementById('slider-prev');
    const nextBtn = document.getElementById('slider-next');
    
    const dishName = document.getElementById('popup-dish-name');
    const countryName = document.getElementById('popup-country-name');
    const flagImg = document.getElementById('popup-flag');

    if (!overlay) return;

    // 作品名（小さい文字）を設定
    if (dishName) dishName.innerText = work.title;
    
    // 国名（大きい文字）を設定
    if (countryName) {
        const countryMap = { 
            'jp': 'Japan', 'us': 'United States', 'it': 'Italy', 
            'kr': 'South Korea', 'fr': 'France', 'uk': 'United Kingdom'
        };
        countryName.innerText = countryMap[work.country.toLowerCase()] || work.country.toUpperCase();
    }

    // 左上の国旗アイコンを設定
    if (flagImg) flagImg.src = `assets/flags/${work.country.toLowerCase()}.png`;

    // 画像リストの読み込み
    currentWorkImages = (work.images && work.images.length > 0) ? work.images : ['1.jpg'];
    currentWorkPath = `assets/${work.country}/${work.folder}/`;
    currentImageIndex = 0;

    // メイン画像を表示
    if (mainImg) mainImg.src = currentWorkPath + currentWorkImages[0];

    // 画像が1枚以下の場合は矢印を隠す
    if (currentWorkImages.length <= 1) {
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
    } else {
        if (prevBtn) prevBtn.style.display = 'block';
        if (nextBtn) nextBtn.style.display = 'block';
    }
    
    overlay.style.display = 'flex';
}

// 画面下部の国旗アイコン表示
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
        flagWrap.style.margin = '10px';
        flagWrap.style.cursor = 'pointer';
        flagWrap.style.width = '60px';  
        flagWrap.style.height = '60px'; 
        flagWrap.style.borderRadius = '50%';
        flagWrap.style.backgroundColor = '#fff';
        flagWrap.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
        flagWrap.style.overflow = 'hidden';

        const img = document.createElement('img');
        img.src = `assets/flags/${country.toLowerCase()}.png`; 
        img.alt = country;
        img.style.width = '100%'; 
        img.style.height = '100%';
        img.style.objectFit = 'cover'; 
        
        // 画像が無い場合の文字表示
        img.onerror = () => {
            img.style.display = 'none';
            flagWrap.innerText = country.toUpperCase();
            flagWrap.style.fontSize = '16px';
            flagWrap.style.fontWeight = 'bold';
            flagWrap.style.color = '#555';
        };

        flagWrap.appendChild(img);

        // 国旗クリックでマップ移動＆写真表示
        flagWrap.addEventListener('click', () => {
            const targetWork = works.find(w => w.country === country);
            if (targetWork && map) {
                map.flyTo({ center: [targetWork.lng, targetWork.lat], zoom: 5 });
                showPopup(targetWork);
            }
        });

        flagContainer.appendChild(flagWrap);
    });
}