

# **Ý TƯỞNG XÂY DỰNG BẢN ĐỒ WEBGIS** **THỂ HIỆN TUYẾN RƯỚC ĐIỆN HUỆ NAM**

**Sản phẩm mẫu phục vụ đề tài “Ứng dụng công nghệ số trong bảo vệ và phát huy giá trị Lễ hội Điện Huệ Nam”**

Định hướng công nghệ: Leaflet.js – OpenStreetMap – GeoJSON – GitHub Pages

# **MỤC LỤC NỘI DUNG**

1\. Ý tưởng tổng thể của sản phẩm

2\. Giao diện sản phẩm mẫu

3\. Cơ chế hoạt động của nút điều khiển

4\. Cách biểu diễn tuyến trên bản đồ

5\. Dữ liệu cần chuẩn bị

6\. Thuật toán điều khiển hành trình

7\. Công nghệ phù hợp

8\. Cấu trúc thư mục sản phẩm

9\. Phạm vi sản phẩm mẫu

10\. Mô hình dữ liệu GIS

11\. Kịch bản trải nghiệm người dùng

12\. Đánh giá tính khả thi

13\. Lộ trình xây dựng sản phẩm mẫu

14\. Kết luận và đề xuất

# **1\. Ý TƯỞNG TỔNG THỂ CỦA SẢN PHẨM**

Có thể xây dựng sản phẩm theo dạng WebGIS mô phỏng hành trình rước Điện Huệ Nam theo từng chặng. Đây là phương án phù hợp với đề tài vì giao diện trực quan, chức năng không quá phức tạp và có thể triển khai bằng công nghệ frontend mà chưa cần xây dựng hệ thống máy chủ.

## **1.1. Tên sản phẩm gợi ý**

**BẢN ĐỒ SỐ HÀNH TRÌNH LỄ RƯỚC ĐIỆN HUỆ NAM**

## **1.2. Nội dung chính của bản đồ**

* **Thể hiện các địa điểm xuất phát, điểm dừng và điểm kết thúc của đoàn rước.**  
* **Cung cấp thông tin văn hóa, lịch sử và vai trò của từng địa điểm trong lễ hội.**  
* **Hiển thị tuyến di chuyển giữa các địa điểm theo từng chặng.**  
* **Cho phép người dùng khám phá lần lượt hành trình bằng một nút điều khiển.**  
* **Tự động chuyển bản đồ từ chặng hiện tại sang chặng tiếp theo.**  
* **Làm nổi bật điểm xuất phát, điểm đến và tuyến đang được khám phá.**

## **1.3. Mô hình hành trình**

**Điểm 1**  
**Nơi xuất phát**  
    **↓ Nhấn nút**  
**Điểm 1 → Điểm 2**  
    **↓ Nhấn nút**  
**Điểm 2 → Điểm 3**  
    **↓ Nhấn nút**  
**Điểm 3 → Điểm 4**  
    **↓**  
**Hoàn thành hành trình**

**Mỗi lần người dùng nhấn nút, hệ thống thực hiện đồng thời các thao tác sau:**

1. **Làm nổi bật điểm xuất phát và điểm đến của chặng hiện tại.**  
2. **Hiển thị đường tuyến nối giữa hai địa điểm.**  
3. **Tự động phóng hoặc di chuyển bản đồ đến phạm vi của chặng.**  
4. **Hiển thị thông tin, hình ảnh và vai trò của điểm đến.**  
5. **Thay đổi tên nút để hướng dẫn người dùng đến chặng tiếp theo.**

# **2\. GIAO DIỆN SẢN PHẨM MẪU**

## **2.1. Bố cục đề xuất**

**┌─────────────────────────────────────────────────────────────┐**  
**│ BẢN ĐỒ HÀNH TRÌNH LỄ RƯỚC ĐIỆN HUỆ NAM                    │**  
**│ Khám phá không gian và các điểm diễn ra lễ rước             │**  
**├────────────────────────────────┬────────────────────────────┤**  
**│                                │ THÔNG TIN ĐỊA ĐIỂM         │**  
**│                                │                            │**  
**│                                │ Tên địa điểm               │**  
**│          BẢN ĐỒ GIS            │ Hình ảnh                   │**  
**│                                │ Mô tả                      │**  
**│       ● Điểm 1                 │ Vai trò trong lễ rước      │**  
**│           ╲                    │ Nghi lễ liên quan          │**  
**│            ● Điểm 2            │                            │**  
**│                ╲               │                            │**  
**│                 ● Điểm 3       │                            │**  
**├────────────────────────────────┴────────────────────────────┤**  
**│ \[Quay lại\] \[Bắt đầu hành trình / Chặng tiếp theo\]          │**  
**└─────────────────────────────────────────────────────────────┘**

Trên màn hình điện thoại, bảng thông tin địa điểm nên được chuyển xuống phía dưới bản đồ hoặc hiển thị dưới dạng bảng trượt để bảo đảm khả năng sử dụng.

## **2.2. Các thành phần giao diện**

| Thành phần | Chức năng |
| :---- | :---- |
| **Bản đồ nền** | Hiển thị sông Hương, đường giao thông, địa danh và không gian lễ hội. |
| **Marker địa điểm** | Thể hiện các điểm xuất phát, điểm dừng và điểm kết thúc. |
| **Tuyến rước** | Hiển thị đường di chuyển của đoàn rước giữa các địa điểm. |
| **Popup** | Hiển thị thông tin ngắn khi người dùng nhấn vào marker. |
| **Bảng thông tin** | Hiển thị tên, hình ảnh, mô tả, nghi lễ và vai trò của địa điểm. |
| **Nút “Chặng tiếp theo”** | Điều khiển hành trình từ điểm hiện tại đến điểm kế tiếp. |
| **Nút “Quay lại”** | Trở về chặng vừa xem trước đó. |
| **Nút “Xem toàn tuyến”** | Phóng bản đồ để hiển thị toàn bộ hành trình. |
| **Thanh tiến trình** | Cho biết người dùng đang ở chặng nào trong hành trình. |

# **3\. CƠ CHẾ HOẠT ĐỘNG CỦA NÚT ĐIỀU KHIỂN**

Giả sử hành trình có năm địa điểm theo thứ tự:

**Điểm 1 → Điểm 2 → Điểm 3 → Điểm 4 → Điểm 5**

## **3.1. Trạng thái ban đầu**

* **Hiển thị toàn bộ marker của các địa điểm.**  
* **Chưa hiển thị tuyến hoặc chỉ hiển thị toàn tuyến với độ mờ thấp.**  
* **Điểm số 1 được làm nổi bật để xác định nơi bắt đầu.**  
* **Nút điều khiển mang tên “Bắt đầu hành trình”.**

## **3.2. Lần nhấn thứ nhất**

* **Hiển thị tuyến từ điểm 1 đến điểm 2\.**  
* **Làm nổi bật marker của điểm 1 và điểm 2\.**  
* **Tự động phóng bản đồ đến phạm vi chặng 1–2.**  
* **Hiển thị thông tin của điểm 2 trong bảng thông tin.**  
* **Đổi tên nút thành “Tiếp tục đến điểm 3”.**

## **3.3. Lần nhấn thứ hai**

* **Giữ lại tuyến điểm 1–2 nhưng chuyển sang trạng thái đã đi qua.**  
* **Làm nổi bật tuyến điểm 2–3.**  
* **Tự động di chuyển bản đồ đến phạm vi chặng 2–3.**  
* **Hiển thị thông tin của điểm 3\.**  
* **Đổi tên nút thành “Tiếp tục đến điểm 4”.**

## **3.4. Khi hoàn thành hành trình**

Sau khi người dùng đến địa điểm cuối cùng, hệ thống hiển thị thông báo:

**Bạn đã hoàn thành hành trình khám phá Lễ rước Điện Huệ Nam.**

Nút điều khiển được đổi thành “Xem lại hành trình” hoặc “Bắt đầu lại”.

# **4\. CÁCH BIỂU DIỄN TUYẾN TRÊN BẢN ĐỒ**

Tuyến rước nên được chia thành từng đoạn riêng thay vì lưu toàn bộ hành trình thành một đường duy nhất. Mỗi đoạn tương ứng với một chặng di chuyển giữa hai địa điểm liên tiếp.

## **4.1. Cấu trúc dữ liệu tuyến trong JavaScript**

**const routeSegments \= \[**  
  **{**  
    **id: 1,**  
    **from: "point-01",**  
    **to: "point-02",**  
    **coordinates: \[\]**  
  **},**  
  **{**  
    **id: 2,**  
    **from: "point-02",**  
    **to: "point-03",**  
    **coordinates: \[\]**  
  **},**  
  **{**  
    **id: 3,**  
    **from: "point-03",**  
    **to: "point-04",**  
    **coordinates: \[\]**  
  **}**  
**\];**

## **4.2. Lợi ích của việc chia tuyến thành từng chặng**

* **Có thể bật hoặc tắt từng chặng theo thứ tự.**  
* **Cho phép thay đổi cách trình bày của tuyến đang được xem.**  
* **Phân biệt chặng đã đi qua, chặng hiện tại và chặng chưa xem.**  
* **Hiển thị thông tin riêng cho từng đoạn tuyến.**  
* **Dễ bổ sung ảnh, video hoặc lời thuyết minh cho từng chặng.**  
* **Dễ sửa chữa khi lộ trình thực tế thay đổi.**

## **4.3. Quy ước hiển thị**

| Trạng thái | Cách thể hiện đề xuất |
| :---- | :---- |
| **Chặng chưa khám phá** | Đường nét đứt, độ mờ thấp hoặc chưa hiển thị. |
| **Chặng hiện tại** | Đường đậm và nổi bật hơn các đoạn còn lại. |
| **Chặng đã đi qua** | Đường mảnh hơn hoặc giảm độ nổi bật. |
| **Điểm hiện tại** | Marker lớn, có vòng sáng hoặc hiệu ứng chuyển động. |
| **Điểm đến tiếp theo** | Marker được nhấn mạnh hoặc nhấp nháy nhẹ. |
| **Điểm chưa đến** | Marker thông thường, chưa được làm nổi bật. |

# **5\. DỮ LIỆU CẦN CHUẨN BỊ**

## **5.1. Dữ liệu địa điểm**

Mỗi địa điểm thuộc tuyến rước cần được xây dựng thành một bản ghi dữ liệu có tọa độ, nội dung thuyết minh và tư liệu đa phương tiện.

| Trường dữ liệu | Nội dung |
| :---- | :---- |
| **id** | Mã định danh duy nhất của địa điểm. |
| **order** | Thứ tự địa điểm trong hành trình. |
| **name** | Tên chính thức của địa điểm. |
| **latitude** | Vĩ độ của địa điểm. |
| **longitude** | Kinh độ của địa điểm. |
| **type** | Điểm xuất phát, điểm dừng hoặc điểm kết thúc. |
| **address** | Địa chỉ hoặc mô tả vị trí. |
| **shortDescription** | Nội dung giới thiệu ngắn. |
| **fullDescription** | Nội dung thuyết minh chi tiết. |
| **festivalRole** | Vai trò của địa điểm trong lễ rước. |
| **ritual** | Nghi lễ hoặc hoạt động diễn ra tại địa điểm. |
| **image** | Đường dẫn ảnh minh họa. |
| **audio** | Đường dẫn tệp thuyết minh âm thanh. |
| **video** | Đường dẫn video liên quan. |
| **source** | Nguồn cung cấp hoặc kiểm chứng thông tin. |

### ***Ví dụ dữ liệu một địa điểm***

***{***  
  ***"id": "point-01",***  
  ***"order": 1,***  
  ***"name": "Tên địa điểm",***  
  ***"latitude": 0,***  
  ***"longitude": 0,***  
  ***"type": "Điểm xuất phát",***  
  ***"address": "Địa chỉ địa điểm",***  
  ***"shortDescription": "Giới thiệu ngắn về địa điểm.",***  
  ***"fullDescription": "Nội dung thuyết minh chi tiết.",***  
  ***"festivalRole": "Vai trò trong hành trình lễ rước.",***  
  ***"ritual": "Nghi thức diễn ra tại địa điểm.",***  
  ***"image": "images/point-01.jpg",***  
  ***"audio": "audio/point-01.mp3",***  
  ***"source": "Nguồn tư liệu"***  
***}***

***LƯU Ý: Lưu ý: Tọa độ địa điểm phải được khảo sát thực địa hoặc lấy từ nguồn bản đồ đáng tin cậy. Không nên tự ước đoán tọa độ.***

## **5.2. Dữ liệu tuyến**

| Trường dữ liệu | Nội dung |
| :---- | :---- |
| **segmentId** | Mã định danh của chặng. |
| **fromPoint** | Mã địa điểm xuất phát. |
| **toPoint** | Mã địa điểm đến. |
| **order** | Thứ tự của chặng. |
| **geometry** | Chuỗi tọa độ tạo thành đường tuyến. |
| **distance** | Chiều dài ước tính hoặc đo được của tuyến. |
| **transportType** | Hình thức di chuyển: thuyền, đi bộ hoặc phương tiện khác. |
| **description** | Mô tả nội dung của chặng. |
| **ritualActivity** | Nghi lễ hoặc hoạt động diễn ra trong chặng. |
| **estimatedTime** | Thời gian di chuyển dự kiến. |

### ***Ví dụ dữ liệu GeoJSON cho một chặng***

***{***  
  ***"type": "Feature",***  
  ***"properties": {***  
    ***"segmentId": 1,***  
    ***"fromPoint": "point-01",***  
    ***"toPoint": "point-02",***  
    ***"transportType": "Thuyền",***  
    ***"description": "Chặng đầu tiên của hành trình"***  
  ***},***  
  ***"geometry": {***  
    ***"type": "LineString",***  
    ***"coordinates": \[\]***  
  ***}***  
***}***

# **6\. THUẬT TOÁN ĐIỀU KHIỂN HÀNH TRÌNH**

Cơ chế điều khiển có thể được thực hiện bằng một biến lưu số thứ tự của chặng hiện tại.

let currentSegment \= 0;

## **6.1. Hàm hiển thị chặng tiếp theo**

**function showNextSegment() {**  
  **if (currentSegment \>= routeSegments.length) {**  
    **resetJourney();**  
    **return;**  
  **}**

  **const segment \= routeSegments\[currentSegment\];**

  **showRoute(segment);**  
  **highlightPoint(segment.from);**  
  **highlightPoint(segment.to);**  
  **zoomToSegment(segment);**  
  **showLocationInformation(segment.to);**

  **currentSegment++;**  
  **updateButtonText();**  
**}**

## **6.2. Quy trình xử lý**

**Người dùng mở bản đồ**  
        **↓**  
**Hiển thị tất cả địa điểm**  
        **↓**  
**Nhấn “Bắt đầu hành trình”**  
        **↓**  
**Hiển thị tuyến Điểm 1 → Điểm 2**  
        **↓**  
**Hiển thị thông tin Điểm 2**  
        **↓**  
**Kiểm tra còn chặng tiếp theo hay không**  
        **↓**  
**Có → Hiển thị nút đi đến điểm tiếp theo**  
**Không → Thông báo hoàn thành hành trình**

# **7\. CÔNG NGHỆ PHÙ HỢP**

## **7.1. Phương án đề xuất cho sản phẩm mẫu**

| Thành phần | Công nghệ đề xuất |
| :---- | :---- |
| **Giao diện** | HTML5, CSS3 và JavaScript. |
| **Thư viện bản đồ** | Leaflet.js. |
| **Bản đồ nền** | OpenStreetMap. |
| **Dữ liệu địa điểm** | GeoJSON hoặc JSON. |
| **Dữ liệu tuyến** | GeoJSON LineString. |
| **Hình ảnh** | JPG, PNG hoặc WebP. |
| **Âm thanh** | MP3. |
| **Lưu trữ mã nguồn** | GitHub. |
| **Triển khai trực tuyến** | GitHub Pages, Netlify hoặc Vercel. |

## **7.2. Ưu điểm**

* **Phần lớn công nghệ được sử dụng miễn phí.**  
* **Không cần xây dựng backend trong giai đoạn sản phẩm mẫu.**  
* **Có thể chạy trực tiếp trên GitHub Pages.**  
* **Dễ trình diễn trong báo cáo, hội thảo hoặc nghiệm thu đề tài.**  
* **Có thể sử dụng trên máy tính và điện thoại.**  
* **Có khả năng mở rộng thành hệ thống WebGIS đầy đủ.**

## **7.3. Hạn chế**

* **Dữ liệu phải được cập nhật bằng cách chỉnh sửa tệp JSON hoặc GeoJSON.**  
* **Chưa có trang quản trị dữ liệu.**  
* **Chưa có hệ quản trị cơ sở dữ liệu tập trung.**  
* **Chưa hỗ trợ nhiều người cùng cập nhật dữ liệu.**  
* **Khả năng tìm kiếm, thống kê và phân tích chưa cao.**

Đối với sản phẩm mẫu trong phạm vi đề tài nghiên cứu, những hạn chế này có thể chấp nhận được. Sau khi sản phẩm mẫu được đánh giá, hệ thống có thể phát triển thêm backend và cơ sở dữ liệu.

# **8\. CẤU TRÚC THƯ MỤC SẢN PHẨM**

**hue-nam-procession-map/**  
**│**  
**├── index.html**  
**├── css/**  
**│   └── style.css**  
**├── js/**  
**│   ├── map.js**  
**│   ├── journey.js**  
**│   └── locations.js**  
**├── data/**  
**│   ├── locations.geojson**  
**│   └── route-segments.geojson**  
**├── images/**  
**│   ├── point-01.jpg**  
**│   ├── point-02.jpg**  
**│   └── point-03.jpg**  
**├── audio/**  
**│   ├── point-01.mp3**  
**│   └── point-02.mp3**  
**└── icons/**  
    **├── start-marker.png**  
    **├── stop-marker.png**  
    **└── destination-marker.png**

# **9\. PHẠM VI SẢN PHẨM MẪU**

Phiên bản đầu tiên nên được phát triển theo mô hình sản phẩm khả dụng tối thiểu, tập trung vào những chức năng cốt lõi và tránh đưa quá nhiều chức năng phức tạp.

## **9.1. Chức năng bắt buộc**

1. **Một bản đồ nền thể hiện không gian liên quan đến lễ hội.**  
2. **Khoảng 4–7 địa điểm tiêu biểu của tuyến rước.**  
3. **Các marker được đánh số theo đúng trình tự hành trình.**  
4. **Bảng thông tin cơ bản của từng địa điểm.**  
5. **Tuyến rước được chia thành từng chặng.**  
6. **Nút “Bắt đầu hành trình” và “Chặng tiếp theo”.**  
7. **Nút “Quay lại”.**  
8. **Nút “Xem toàn tuyến”.**  
9. **Thanh tiến trình hành trình.**  
10. **Giao diện sử dụng được trên máy tính và điện thoại.**

## **9.2. Chức năng mở rộng**

* **Thuyết minh tự động bằng âm thanh.**  
* **Ảnh 360 độ tại từng địa điểm.**  
* **Video tư liệu về lễ hội.**  
* **QR Code mở trực tiếp địa điểm trên bản đồ.**  
* **Chuyển đổi giữa các kỳ lễ hội khác nhau.**  
* **Mô phỏng chuyển động của thuyền rước.**  
* **Story Map kể chuyện theo từng chặng.**  
* **Chatbot AI giải thích địa điểm và nghi lễ.**  
* **Chế độ quản trị cập nhật dữ liệu.**  
* **Theo dõi vị trí đoàn rước theo thời gian thực.**

# **10\. MÔ HÌNH DỮ LIỆU GIS**

Hệ thống WebGIS hoàn chỉnh có thể được tổ chức thành ba lớp dữ liệu không gian cơ bản.

| Lớp dữ liệu | Kiểu hình học | Nội dung |
| :---- | :---- | :---- |
| **festival\_locations** | Point | Các địa điểm xuất phát, điểm dừng và điểm kết thúc. |
| **procession\_segments** | LineString | Các chặng thuộc tuyến rước. |
| **festival\_area** | Polygon | Không gian, khu vực hoặc vùng ảnh hưởng của lễ hội. |

**Đối với sản phẩm mẫu, chỉ cần xây dựng hai lớp festival\_locations và procession\_segments.**

## **10.1. Quan hệ giữa các lớp dữ liệu**

**FESTIVAL\_LOCATION**  
**├── location\_id**  
**├── order\_number**  
**├── location\_name**  
**├── latitude**  
**├── longitude**  
**├── location\_type**  
**├── description**  
**├── image**  
**└── audio**

**PROCESSION\_SEGMENT**  
**├── segment\_id**  
**├── segment\_order**  
**├── from\_location**  
**├── to\_location**  
**├── transport\_type**  
**├── distance**  
**└── description**

**Quan hệ:**  
**Một địa điểm có thể là điểm xuất phát hoặc điểm đến của nhiều chặng.**

# **11\. KỊCH BẢN TRẢI NGHIỆM NGƯỜI DÙNG**

## **Bước 1\. Mở bản đồ**

Người dùng nhìn thấy toàn bộ các điểm của hành trình, trong khi tuyến chưa được làm nổi bật hoặc chỉ được hiển thị với độ mờ thấp.

## **Bước 2\. Bắt đầu hành trình**

Người dùng nhấn nút “Bắt đầu hành trình”. Bản đồ tự động đưa người dùng đến điểm đầu tiên và mở phần giới thiệu.

## **Bước 3\. Di chuyển đến điểm tiếp theo**

Khi người dùng nhấn nút, tuyến từ điểm hiện tại đến điểm tiếp theo xuất hiện. Có thể sử dụng hiệu ứng vẽ đường từ từ để tạo cảm giác đoàn rước đang di chuyển.

## **Bước 4\. Khám phá địa điểm mới**

Khi đến địa điểm mới, bảng thông tin tự động hiển thị các nội dung sau:

* Tên địa điểm.  
* Hình ảnh minh họa.  
* Mô tả lịch sử và văn hóa.  
* Vai trò trong lễ rước.  
* Nghi lễ hoặc hoạt động diễn ra.  
* Nút nghe thuyết minh.  
* Nút xem tư liệu liên quan.

## **Bước 5\. Hoàn thành hành trình**

Sau khi hoàn thành toàn bộ tuyến, người dùng có thể xem lại toàn tuyến, bắt đầu lại hành trình, chia sẻ bản đồ hoặc quét QR Code để mở bản đồ trên điện thoại.

# **12\. ĐÁNH GIÁ TÍNH KHẢ THI**

| Tiêu chí | Đánh giá |
| :---- | :---- |
| **Độ khó kỹ thuật** | Thấp đến trung bình. |
| **Có thể làm frontend-only** | Có. |
| **Thời gian làm sản phẩm mẫu** | Khoảng 2–4 tuần, tùy mức độ sẵn có của dữ liệu. |
| **Chi phí phần mềm** | Gần như bằng 0 nếu sử dụng công nghệ mã nguồn mở. |
| **Yêu cầu quan trọng nhất** | Tọa độ và đường tuyến phải chính xác. |
| **Khả năng trình diễn** | Cao. |
| **Giá trị giáo dục** | Cao. |
| **Giá trị quảng bá** | Cao. |
| **Giá trị bảo tồn** | Khá cao nếu nội dung được kiểm chứng. |
| **Khả năng mở rộng** | Rất cao. |

## **12.1. Rủi ro cần lưu ý**

| Rủi ro | Biện pháp xử lý |
| :---- | :---- |
| **Sai tọa độ địa điểm** | Khảo sát thực địa, đối chiếu GPS và bản đồ chính thức. |
| **Sai thứ tự tuyến rước** | Phỏng vấn người tổ chức, cộng đồng thực hành và kiểm chứng tư liệu. |
| **Đường tuyến trên sông không chính xác** | Thu GPS thực tế hoặc số hóa từ dữ liệu khảo sát. |
| **Thông tin địa điểm thiếu nguồn** | Lưu trường source cho từng bản ghi và xây dựng quy trình thẩm định. |
| **Hình ảnh vi phạm bản quyền** | Sử dụng ảnh tự chụp, ảnh được cấp phép hoặc được chủ sở hữu đồng ý. |
| **Giao diện khó sử dụng trên điện thoại** | Thiết kế responsive và kiểm thử trên nhiều kích thước màn hình. |

# **13\. LỘ TRÌNH XÂY DỰNG SẢN PHẨM MẪU**

| Giai đoạn | Công việc chính | Sản phẩm đầu ra |
| :---- | :---- | :---- |
| **Giai đoạn 1** | Xác định mục tiêu, phạm vi, danh sách địa điểm và thứ tự hành trình. | Danh mục địa điểm và sơ đồ tuyến sơ bộ. |
| **Giai đoạn 2** | Thu thập tọa độ, mô tả, hình ảnh, nguồn tư liệu và dữ liệu tuyến. | Bảng dữ liệu chuẩn hóa và tệp tọa độ. |
| **Giai đoạn 3** | Xây dựng dữ liệu GeoJSON cho điểm và tuyến. | locations.geojson và route-segments.geojson. |
| **Giai đoạn 4** | Thiết kế giao diện bản đồ và bảng thông tin. | Giao diện WebGIS ban đầu. |
| **Giai đoạn 5** | Lập trình nút chuyển từng chặng và thanh tiến trình. | Chức năng hành trình tương tác. |
| **Giai đoạn 6** | Kiểm thử dữ liệu, giao diện và khả năng sử dụng. | Phiên bản thử nghiệm đã hiệu chỉnh. |
| **Giai đoạn 7** | Đưa sản phẩm lên GitHub Pages, Netlify hoặc Vercel. | Đường dẫn sản phẩm mẫu trực tuyến. |

# **14\. KẾT LUẬN VÀ ĐỀ XUẤT**

Phương án phù hợp nhất cho sản phẩm mẫu là sử dụng Leaflet.js, OpenStreetMap, GeoJSON, HTML, CSS, JavaScript và GitHub Pages. Cấu hình này có chi phí thấp, dễ triển khai, dễ trình diễn và đáp ứng được cơ chế người dùng nhấn nút để di chuyển lần lượt từ điểm 1 đến điểm 2, từ điểm 2 đến điểm 3 và tiếp tục cho đến khi hoàn thành toàn bộ hành trình.

Phiên bản đầu tiên nên tập trung vào hai lớp dữ liệu là các địa điểm của lễ rước và các đoạn tuyến nối giữa những địa điểm đó. Mỗi điểm phải có tọa độ, tên, thông tin mô tả, vai trò trong lễ hội, hình ảnh và nguồn tư liệu. Mỗi đoạn tuyến phải có điểm đầu, điểm cuối, thứ tự, hình thức di chuyển và dữ liệu hình học.

Yếu tố quyết định chất lượng của sản phẩm không chỉ nằm ở kỹ thuật lập trình mà còn ở độ chính xác của tư liệu văn hóa và dữ liệu không gian. Vì vậy, quá trình xây dựng cần có sự tham gia của nhà nghiên cứu, cộng đồng thực hành, đơn vị tổ chức lễ hội và người có chuyên môn GIS.

**LƯU Ý: Nội dung cần được xác minh trước khi công bố: danh sách địa điểm, thứ tự các điểm, tọa độ, tuyến di chuyển thực tế, nghi lễ tại từng điểm và sự khác nhau giữa các kỳ tổ chức lễ hội.**

## **Phương án công nghệ được khuyến nghị**

**Leaflet.js \+ OpenStreetMap \+ GeoJSON \+ HTML/CSS/JavaScript \+ GitHub Pages**

Đây là phương án phù hợp với yêu cầu xây dựng một sản phẩm mẫu trực quan, có tính tương tác, chi phí thấp và có khả năng tiếp tục mở rộng thành hệ thống WebGIS phục vụ bảo tồn, quảng bá, giáo dục cộng đồng và phát triển du lịch thông minh.

---

Tài liệu được tạo tự động bằng Google Apps Script

**Dự án: Bảo vệ và phát huy giá trị Lễ hội Điện Huệ Nam bằng công nghệ số**