# Bản đồ số Hành trình Lễ rước Điện Huệ Nam

**🏛️ WebGIS tương tác mô phỏng hành trình rước Điện Huệ Nam trên sông Hương**

> Sản phẩm phục vụ đề tài "Ứng dụng công nghệ số trong bảo vệ và phát huy giá trị Lễ hội Điện Huệ Nam"

## 📖 Giới thiệu

Bản đồ số Hành trình Lễ rước Điện Huệ Nam là một ứng dụng WebGIS tương tác, cho phép người dùng khám phá tuyến rước truyền thống từ Bến Ngự đến Điện Huệ Nam dọc theo sông Hương (Thừa Thiên Huế). Ứng dụng mô phỏng hành trình theo từng chặng, cung cấp thông tin văn hóa, lịch sử và nghi lễ tại mỗi địa điểm.

### Tính năng chính

- 🗺️ **Bản đồ tương tác** trên nền OpenStreetMap với Leaflet.js
- 📍 **6 địa điểm** tiêu biểu dọc tuyến rước
- 🛤️ **5 chặng hành trình** với hiệu ứng vẽ đường động
- 🎮 **Điều khiển hành trình**: Bắt đầu, Tiếp tục, Quay lại, Toàn tuyến, Tự động
- 📋 **Bảng thông tin chi tiết** cho từng địa điểm (mô tả, vai trò, nghi lễ)
- 🌙 **Dark/Light Mode** chuyển đổi mượt mà
- 📱 **Responsive** hoạt động tốt trên mọi thiết bị
- ⌨️ **Phím tắt**: ← → A V T F
- 🔄 **Service Worker** hỗ trợ offline

## 🏗️ Kiến trúc

```
Kiến trúc Module (Frontend-only)
├── Data Layer     → JSON + GeoJSON
├── Map Layer      → Leaflet.js + OpenStreetMap
├── Logic Layer    → Route Controller + Animation Engine
├── UI Layer       → Panel Manager + Progress Manager
└── Event Layer    → Event Manager + Keyboard Navigation
```

Toàn bộ ứng dụng chạy trên trình duyệt, không cần backend server.

## 📁 Cấu trúc dự án

```
BanDoRuoc/
├── index.html              # Trang chính
├── 404.html                # Trang lỗi 404
├── css/
│   ├── theme.css           # Design tokens, Dark/Light theme
│   ├── style.css           # Core styles, layout
│   ├── animation.css       # Keyframes, animations
│   └── responsive.css      # Mobile-first responsive
├── js/
│   ├── config.js           # Constants & configuration
│   ├── utils.js            # Utility functions
│   ├── dataLoader.js       # Data fetching & parsing
│   ├── map.js              # Leaflet map initialization
│   ├── markerManager.js    # Marker creation & states
│   ├── animation.js        # Animation engine
│   ├── routeController.js  # Journey route management
│   ├── panelManager.js     # Info panel & bottom sheet
│   ├── progressManager.js  # Progress bar & timeline
│   ├── ui.js               # Theme, toast, loading
│   ├── eventManager.js     # Event handlers
│   └── app.js              # Entry point
├── data/
│   ├── config.json         # Runtime configuration
│   ├── locations.json      # 6 địa điểm lễ rước
│   └── routes.geojson      # 5 chặng tuyến (GeoJSON)
├── assets/
│   ├── images/             # Hình ảnh địa điểm
│   ├── icons/              # Icon markers
│   └── audio/              # File thuyết minh
├── manifest.json           # PWA manifest
├── service-worker.js       # Offline caching
├── robots.txt              # SEO
├── sitemap.xml             # SEO sitemap
├── .gitignore              # Git ignore rules
├── .nojekyll               # GitHub Pages config
├── LICENSE                 # MIT License
├── CHANGELOG.md            # Lịch sử thay đổi
└── README.md               # Tài liệu này
```

## 🚀 Hướng dẫn cài đặt

### Cách 1: Mở trực tiếp

1. Clone hoặc download dự án
2. Mở file `index.html` bằng trình duyệt (khuyến nghị dùng Live Server)

### Cách 2: Live Server (VS Code)

1. Cài extension **Live Server** trong VS Code
2. Mở thư mục dự án
3. Click chuột phải vào `index.html` → **Open with Live Server**

### Cách 3: Python HTTP Server

```bash
cd BanDoRuoc
python -m http.server 8080
# Mở http://localhost:8080
```

## 📊 Hướng dẫn cập nhật dữ liệu

### Cập nhật địa điểm

Chỉnh sửa file `data/locations.json`:

```json
{
  "id": "point-01",
  "order": 1,
  "name": "Tên địa điểm",
  "latitude": 16.4598,
  "longitude": 107.587,
  "type": "start",
  "typeLabel": "Điểm xuất phát",
  "address": "Địa chỉ",
  "shortDescription": "Mô tả ngắn",
  "fullDescription": "Mô tả chi tiết...",
  "festivalRole": "Vai trò trong lễ rước",
  "ritual": "Nghi lễ diễn ra",
  "image": "assets/images/point-01.jpg",
  "audio": "assets/audio/point-01.mp3",
  "source": "Nguồn tư liệu"
}
```

### Thêm địa điểm mới

1. Thêm object mới vào mảng `locations` trong `data/locations.json`
2. Đảm bảo `order` liên tục và `id` duy nhất
3. Loại (`type`): `"start"`, `"stop"`, hoặc `"end"`

### Cập nhật tuyến (GeoJSON)

Chỉnh sửa file `data/routes.geojson`:

```json
{
  "type": "Feature",
  "properties": {
    "segmentId": 1,
    "order": 1,
    "fromPoint": "point-01",
    "toPoint": "point-02",
    "transportType": "boat",
    "transportLabel": "Thuyền",
    "distance": "1.0 km",
    "estimatedTime": "15 phút",
    "description": "Mô tả chặng",
    "ritualActivity": "Hoạt động trên chặng"
  },
  "geometry": {
    "type": "LineString",
    "coordinates": [
      [107.587, 16.4598],
      [107.589, 16.4603],
      [107.596, 16.4625]
    ]
  }
}
```

### Thêm chặng mới

1. Thêm Feature mới vào mảng `features` trong `data/routes.geojson`
2. Đảm bảo `fromPoint` và `toPoint` trùng với `id` trong `locations.json`
3. Coordinates dùng format GeoJSON: `[longitude, latitude]`

### Thêm hình ảnh

1. Đặt ảnh vào thư mục `assets/images/`
2. Cập nhật trường `image` trong `locations.json`: `"image": "assets/images/ten-anh.jpg"`
3. Khuyến nghị: ảnh 800×500px, format WebP hoặc JPG

### Thêm audio thuyết minh

1. Đặt file MP3 vào thư mục `assets/audio/`
2. Cập nhật trường `audio` trong `locations.json`: `"audio": "assets/audio/ten-file.mp3"`

## 🌐 Hướng dẫn triển khai GitHub Pages

### Bước 1: Tạo repository

```bash
git init
git add .
git commit -m "Initial commit: Bản đồ Lễ rước Điện Huệ Nam"
```

### Bước 2: Push lên GitHub

```bash
git remote add origin https://github.com/username/ban-do-ruoc.git
git branch -M main
git push -u origin main
```

### Bước 3: Bật GitHub Pages

1. Vào **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: **main** / **root**
4. Click **Save**

### Bước 4: Truy cập

Sau 1-2 phút, truy cập: `https://username.github.io/ban-do-ruoc/`

## 🔧 Hướng dẫn mở rộng

### Thêm tile layer mới

Chỉnh sửa `data/config.json` > `tileLayers`:

```json
"satellite": {
  "url": "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  "attribution": "Esri",
  "maxZoom": 19
}
```

### Thay đổi cấu hình bản đồ

Chỉnh `data/config.json`:
- `map.center`: Tâm bản đồ `[lat, lng]`
- `map.zoom`: Mức zoom mặc định
- `journey.autoPlayInterval`: Thời gian tự động (ms)
- `journey.polylineDrawDuration`: Thời gian vẽ đường (ms)

### Thêm layer polygon

1. Tạo file `data/areas.geojson` với geometry type `Polygon`
2. Tạo module `js/areaManager.js` để hiển thị
3. Import trong `app.js`

## ⌨️ Phím tắt

| Phím | Chức năng |
|------|-----------|
| `→` hoặc `N` | Chặng tiếp theo |
| `←` hoặc `P` | Quay lại |
| `A` | Bật/tắt tự động |
| `V` | Xem toàn tuyến |
| `T` | Đổi Dark/Light |
| `F` | Toàn màn hình |
| `R` | Bắt đầu lại |
| `Esc` | Đóng overlay |

## 🛠️ Công nghệ

| Thành phần | Công nghệ |
|-----------|-----------|
| Frontend | HTML5, CSS3, JavaScript ES6+ |
| Bản đồ | Leaflet.js v1.9.4 |
| Map tiles | OpenStreetMap, CartoDB Dark Matter |
| Dữ liệu | JSON, GeoJSON |
| Font | Inter (Google Fonts) |
| Triển khai | GitHub Pages |

## 📝 License

MIT License - Xem file [LICENSE](LICENSE)

## 🙏 Tham gia đóng góp

- Cập nhật tọa độ chính xác từ khảo sát thực địa
- Bổ sung hình ảnh và audio thuyết minh
- Kiểm chứng thông tin văn hóa, lịch sử
- Báo lỗi qua Issues trên GitHub

---

**Dự án: Bảo vệ và phát huy giá trị Lễ hội Điện Huệ Nam bằng công nghệ số**
