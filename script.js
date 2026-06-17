let map;

// ページ読み込み完了後に地図を初期化
document.addEventListener('DOMContentLoaded', () => {
    initMap();
});

function initMap() {
    map = new maplibregl.Map({
        container: 'map-container',
        style: 'https://demotiles.maplibre.org/style.json',
        center: [138.0, 36.0],
        zoom: 4.0
    });

    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            data.works.forEach(work => {
                const el = document.createElement('div');
                el.className = 'marker';
                el.style.backgroundColor = 'red';
                el.style.width = '20px';
                el.style.height = '20px';
                el.style.borderRadius = '50%';
                el.style.cursor = 'pointer';

                new maplibregl.Marker(el)
                    .setLngLat([work.lng, work.lat])
                    .addTo(map)
                    .getElement().addEventListener('click', () => {
                        alert(work.title + ' が選ばれました！');
                    });
            });
        });
}