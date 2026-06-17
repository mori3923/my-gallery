let map;
let currentImageIndex = 0;
let currentWorkImages = [];
let currentWorkPath = '';

document.addEventListener('DOMContentLoaded', () => {
    initMap();

    const viewMoreBtn = document.getElementById('view-more-btn');
    if (viewMoreBtn) {
        viewMoreBtn.addEventListener('click', () => {
            alert('VIEW MOREがクリックされました！');
        });
    }

    const closeBtn = document.getElementById('popup-close');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            document.getElementById('popup-overlay').style.display = 'none';
        });
    }

    const nextBtn = document.getElementById('slider-next');
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (currentWorkImages.length > 1) {
                currentImageIndex = (currentImageIndex + 1) % currentWorkImages.length;
                document.getElementById('popup-main-image').src = currentWorkPath + currentWorkImages[currentImageIndex];
            }
        });
    }

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

// 外部サーバーのURLエラーに巻き込まれない、直接指定の水色地図データ
const osmStyle = {
    "version": 8,
    "sources": {
        "osm": {
            "type": "raster",
            "tiles": ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            "tileSize": 256,
            "attribution": "&copy; OpenStreetMap Contributors"
        }
    },
    "layers": [{
        "id": "osm-tiles",
        "type": "raster",
        "source": "osm",
        "minzoom": 0,
        "maxzoom": 19
    }]
};

function initMap() {
    map = new maplibregl.Map({
        container: 'map-container',
        style: osmStyle, // URLではなく上記の安全なデータを直接読み込ませます
        center: [138.0, 36.0],
        zoom: 4.0,
        dragRotate: false
    });

    fetch('data.json')
        .then(response => {
            if (!response.ok) throw new Error('data.jsonが見つかりません');
            return response.json();
        })
        .then(data => {
            const works = data.works || [];

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

            renderFlags(works);
        })
        .catch(error => console.error('地図データの読み込みエラー:', error));
}

function showPopup(work) {
    const overlay = document.getElementById('popup-overlay');
    const mainImg = document.getElementById('popup-main-image');
    const prevBtn = document.getElementById('slider-prev');
    const nextBtn = document.getElementById('slider-next');
    const dishName = document.getElementById('popup-dish-name');

    if (!overlay) return;

    if (dishName) dishName.innerText = work.title;

    currentWorkImages = (work.images && work.images.length > 0) ? work.images : ['1.jpg'];
    currentWorkPath = `assets/${work.country}/${work.folder}/`;
    currentImageIndex = 0;

    if (mainImg) mainImg.src = currentWorkPath + currentWorkImages[0];

    if (currentWorkImages.length <= 1) {
        if (prevBtn) prevBtn.style.display = 'none';
        if (nextBtn) nextBtn.style.display = 'none';
    } else {
        if (prevBtn) prevBtn.style.display = 'block';
        if (nextBtn) nextBtn.style.display = 'block';
    }
    
    overlay.style.display = 'flex';
}

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
        flagWrap.style.width = '45px';
        flagWrap.style.height = '45px';
        flagWrap.style.borderRadius = '50%';
        flagWrap.style.backgroundColor = '#fff';
        flagWrap.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        flagWrap.style.overflow = 'hidden';

        const img = document.createElement('img');
        img.src = `assets/flags/${country}.png`; 
        img.alt = country;
        img.style.width = '100%'; 
        img.style.height = '100%';
        img.style.objectFit = 'cover'; 
        
        img.onerror = () => {
            img.style.display = 'none';
            flagWrap.innerText = country.toUpperCase();
            flagWrap.style.fontSize = '12px';
            flagWrap.style.fontWeight = 'bold';
            flagWrap.style.color = '#555';
        };

        flagWrap.appendChild(img);

        flagWrap.addEventListener('click', () => {
            const targetWork = works.find(w => w.country === country);
            if (targetWork && map) {
                map.flyTo({ center: [targetWork.lng, targetWork.lat], zoom: 5 });
            }
        });

        flagContainer.appendChild(flagWrap);
    });
}