let map;
let currentImageIndex = 0;
let currentWorkImages = [];
let currentWorkPath = '';

document.addEventListener('DOMContentLoaded', () => {
    initMap();
    
    document.getElementById('popup-close').addEventListener('click', () => {
        document.getElementById('popup-overlay').style.display = 'none';
    });

    document.getElementById('slider-next').addEventListener('click', () => {
        if (currentWorkImages.length > 1) {
            currentImageIndex = (currentImageIndex + 1) % currentWorkImages.length;
            document.getElementById('popup-main-image').src = currentWorkPath + currentWorkImages[currentImageIndex];
        }
    });

    document.getElementById('slider-prev').addEventListener('click', () => {
        if (currentWorkImages.length > 1) {
            currentImageIndex = (currentImageIndex - 1 + currentWorkImages.length) % currentWorkImages.length;
            document.getElementById('popup-main-image').src = currentWorkPath + currentWorkImages[currentImageIndex];
        }
    });
});

function initMap() {
    map = new maplibregl.Map({
        container: 'map-container',
        style: 'https://tiles.basemaps.cartocdn.com/gl/voyager-gl-style/style.json',
        center: [138.0, 36.0],
        zoom: 4.0,
        dragRotate: false
    });

    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            data.works.forEach(work => {
                const el = document.createElement('div');
                el.className = 'marker';
                el.style.backgroundColor = '#e53935';
                el.style.width = '20px';
                el.style.height = '20px';
                el.style.borderRadius = '50%';
                el.style.border = '2px solid white';
                el.style.cursor = 'pointer';

                new maplibregl.Marker(el)
                    .setLngLat([work.lng, work.lat])
                    .addTo(map)
                    .getElement().addEventListener('click', () => {
                        showPopup(work);
                    });
            });
        });
}

function showPopup(work) {
    const overlay = document.getElementById('popup-overlay');
    const mainImg = document.getElementById('popup-main-image');
    const prevBtn = document.getElementById('slider-prev');
    const nextBtn = document.getElementById('slider-next');

    document.getElementById('popup-dish-name').innerText = work.title;
    
    // PythonがJSONに書き込んでくれた画像リストを受け取る
    currentWorkImages = work.images || [];
    currentWorkPath = `assets/${work.country}/${work.folder}/`;
    currentImageIndex = 0;

    // 画像がない場合
    if (currentWorkImages.length === 0) {
        mainImg.src = '';
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
    } 
    // 画像が1枚だけの場合
    else if (currentWorkImages.length === 1) {
        mainImg.src = currentWorkPath + currentWorkImages[0];
        prevBtn.style.display = 'none';
        nextBtn.style.display = 'none';
    } 
    // 画像が複数ある場合
    else {
        mainImg.src = currentWorkPath + currentWorkImages[0];
        prevBtn.style.display = 'block';
        nextBtn.style.display = 'block';
    }
    
    overlay.style.display = 'flex';
}