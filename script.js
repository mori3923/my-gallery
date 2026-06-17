let map;

// ページ読み込み完了後に地図を初期化
document.addEventListener('DOMContentLoaded', () => {
    initMap();
});

function initMap() {
    map = new maplibregl.Map({
        container: 'map-container',
        // より安定して読み込める地図スタイルに変更しました
        style: 'https://tiles.basemaps.cartocdn.com/gl/positron-gl-style/style.json',
        center: [138.0, 36.0],
        zoom: 4.0,
        dragRotate: false // 地図を回転させない設定
    });

    // データの読み込み
    fetch('data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('data.jsonが見つかりません');
            }
            return response.json();
        })
        .then(data => {
            data.works.forEach(work => {
                const el = document.createElement('div');
                el.className = 'marker';
                el.style.backgroundColor = 'red';
                el.style.width = '20px';
                el.style.height = '20px';
                el.style.borderRadius = '50%';
                el.style.cursor = 'pointer';
                el.style.border = '2px solid white';
                el.style.boxShadow = '0 0 5px rgba(0,0,0,0.3)';

                new maplibregl.Marker(el)
                    .setLngLat([work.lng, work.lat])
                    .addTo(map)
                    .getElement().addEventListener('click', () => {
                        // ここに、クリックした時の処理を追加していきます
                        alert(work.title + ' が選ばれました！');
                    });
            });
        })
        .catch(error => {
            console.error('地図の読み込みでエラーが発生:', error);
        });
}