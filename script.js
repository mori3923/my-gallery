// 地図の初期化と作品読み込み
function initMap() {
    map = new maplibregl.Map({
        container: 'map-container',
        style: SETTINGS.MAP_STYLE_URL,
        center: [138.0, 36.0],
        zoom: 4.0,
        dragRotate: false
    });

    // データの読み込み
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            data.works.forEach(work => {
                addMarker(work);
            });
        });
}

// ピンの追加
function addMarker(work) {
    const el = document.createElement('div');
    el.className = 'marker';
    
    new maplibregl.Marker(el)
        .setLngLat([work.lng, work.lat])
        .addTo(map)
        .getElement().addEventListener('click', () => {
            showGallery(work);
        });
}

// フォルダ内の画像を自動読み込みしてギャラリー表示
function showGallery(work) {
    // assets/国コード/作品フォルダ名/ にある画像を探す想定
    // ここではデモ用に、写真が複数あると仮定してスライドショーへ渡します
    const images = [];
    for(let i = 1; i <= 5; i++) { // とりあえず5枚まで自動チェック
        images.push(`assets/${work.country}/${work.folder}/${i}.jpg`);
    }

    // ここでポップアップを表示する処理（今の仕組みを活かします）
    openPopup(work.title, images);
}