<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Miniature World Gallery</title>
    <link rel="stylesheet" href="https://unpkg.com/maplibre-gl@3.x/dist/maplibre-gl.css" />
    <script src="https://unpkg.com/maplibre-gl@3.x/dist/maplibre-gl.js"></script>
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header class="header">
        <h1>Miniature World Gallery</h1>
    </header>
    
    <div id="map-container"></div>
    
    <main>
        <div id="flag-container" class="flag-grid"></div>
    </main>

    <div id="popup-overlay" class="popup-overlay" style="display: none;">
        <div class="popup-content">
            <span id="popup-close" class="popup-close">×</span>
            <h2 id="popup-dish-name">作品名</h2>
            <div class="slider-container">
                <button id="slider-prev" class="slider-btn">◀</button>
                <img id="popup-main-image" src="" alt="作品画像">
                <button id="slider-next" class="slider-btn">▶</button>
            </div>
        </div>
    </div>

    <script src="script.js"></script>
</body>
</html>