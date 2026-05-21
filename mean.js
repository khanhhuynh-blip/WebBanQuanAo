window.filterProducts = function(category, event, pageSectionId) {
    if (event) event.preventDefault();

    // 1. Xác định đúng lưới (Grid) hiển thị dựa trên trang bạn đang ở
    // Đảm bảo trang Nữ của bạn có một thẻ <div> với id="grid-nu"
    const gridId = (pageSectionId === 'thoi-trang-nam') ? 'product-grid' : 'grid-nu';
    const grid = document.getElementById(gridId);
    
    if (!grid) {
        console.error("Không tìm thấy lưới với ID:", gridId);
        return;
    }
    
    grid.innerHTML = ""; // Xóa sạch sản phẩm cũ trước khi hiển thị mới

    // 2. Cấu hình map dữ liệu
    const config = {
        'thoi-trang-nam': {
            allKeys: ['tshirts', 'pants', 'jackets'],
            map: { 'ao-thun': 'tshirts', 'quan-jean': 'pants', 'ao-khoac-jean': 'jackets' }
        },
        'thoi-trang-nu': {
            allKeys: ['blouses', 'skirts', 'womenJeans'],
            map: { 'ao-kieu': 'blouses', 'chan-vay': 'skirts', 'quan-jean': 'womenJeans' }
        }
    };

    const conf = config[pageSectionId];
    if (!conf) return;

    // 3. Hiển thị sản phẩm
    if (category === 'all') {
        conf.allKeys.forEach(key => {
            if (window.storeData[key]) {
                window.storeData[key].forEach(item => {
                    createItem(key, item.name, item.price, item.img, grid);
                });
            }
        });
    } else {
        const dataKey = conf.map[category];
        if (window.storeData[dataKey]) {
            window.storeData[dataKey].forEach(item => {
                createItem(dataKey, item.name, item.price, item.img, grid);
            });
        }
    }
};

// 1. Khởi tạo dữ liệu toàn cục
window.cart = JSON.parse(localStorage.getItem('myCart')) || [];
window.updateCartCount = function() {
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        const totalItems = window.cart.reduce((sum, item) => sum + item.qty, 0);
        cartCountElement.innerText = totalItems;
    }
};

// 3. Hiển thị thông báo (Toast)
window.showToast = function(message) {
    const toast = document.createElement('div');
    toast.className = 'toast-msg';
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2000);
};

window.addToCart = function(event) {
    if (event) event.preventDefault();

    // KIỂM TRA NGHIÊM NGẶT: Chỉ khi nào là chuỗi 'true' mới được qua
    const status = localStorage.getItem('isLoggedIn');
    
    if (status !== 'true') {
        // Cảnh báo và ép buộc reset mọi thứ nếu cố tình thêm hàng
        alert("Bạn cần đăng nhập để thực hiện hành động này!");
        
        // Reset sạch giỏ hàng trước khi đẩy về trang đăng nhập
        window.cart = [];
        localStorage.removeItem('myCart');
        window.updateCartCount();
        
        window.showPage('dang-nhap');
        return; 
    }

    // --- CHỈ KHI status === 'true' MỚI CHẠY ĐOẠN DƯỚI ---
    const nameEl = document.getElementById('detail-name');
    if (!nameEl) return; 

    const name = nameEl.innerText;
    const price = document.getElementById('detail-price').innerText;
    const img = document.getElementById('detail-img').src;
    const qty = parseInt(document.getElementById('detail-qty').innerText);

    const existingItem = window.cart.find(item => item.name === name);
    if (existingItem) {
        existingItem.qty += qty;
    } else {
        window.cart.push({ name, price, img, qty });
    }
    
    localStorage.setItem('myCart', JSON.stringify(window.cart));
    window.updateCartCount();
    
    if (typeof window.showToast === 'function') {
        window.showToast("Đã thêm " + name + " vào giỏ hàng!");
    }
    if (typeof window.closeDetail === 'function') window.closeDetail();
};

document.addEventListener('DOMContentLoaded', () => {
    window.updateCartCount();
    document.querySelectorAll('.main-nav a').forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                window.showPage(href.substring(1));
                document.querySelectorAll('.main-nav a').forEach(nav => nav.classList.remove('active'));
                this.classList.add('active');
            }
        });
    });

    //Xử lý clicl header icon
document.querySelectorAll('.header-icons span, .header-icons div > span').forEach(span => {
    const title = span.getAttribute('title');

    if (title === 'Tìm kiếm') {
        span.onclick = function(e) {
            e.stopPropagation();
            const accountMenu = document.getElementById('account-dropdown-menu');
            if(accountMenu) accountMenu.classList.remove('show-menu');
            window.toggleSearch();
        };
    } 
    else if (title === 'Tài khoản') {
        span.onclick = function(e) {
            e.stopPropagation();
            
            // Ẩn thanh tìm kiếm nếu đang mở
            const searchBar = document.getElementById('search-bar-container');
            if (searchBar) searchBar.style.display = 'none';

            const accountMenu = document.getElementById('account-dropdown-menu');
            if (accountMenu) {
                accountMenu.classList.toggle('show-menu');
            }
        };
    } 
    // ... phía sau các đoạn kiểm tra title khác ...
    else if (title === 'Yêu thích') {
        span.onclick = function() {
            // Giả sử bạn truyền thông tin sản phẩm vào đây
            const product = { id: 1, name: "Sản phẩm mẫu" }; 
            if (!window.wishlist.find(item => item.id === product.id)) {
                window.wishlist.push(product);
                window.saveUserPreferences();
                alert("Đã thêm vào danh sách yêu thích!");
            } else {
                alert("Sản phẩm đã có trong danh sách yêu thích.");
            }
        };
    }
    else if (title === 'Giỏ hàng') {
        span.onclick = function() {
            if (window.cart.length === 0) {
                alert("Giỏ hàng của bạn đang trống!");
            } else {
                alert("Bạn đang có " + window.cart.reduce((sum, item) => sum + item.qty, 0) + " sản phẩm trong giỏ!");
            }
        };
    }
});

// 3. BỘ BẮT SỰ KIỆN CHO NÚT "ĐỌC THÊM"
document.addEventListener('click', function(e) {
    // Kiểm tra xem phần tử vừa click có phải là nút .btn-doc-them không
    if (e.target && e.target.classList.contains('btn-doc-them')) {
        const id = parseInt(e.target.getAttribute('data-id'));
        window.xemChiTiet(id);
    }
});
    // KHO DỮ LIỆU TỔNG HỢP
    window.storeData= {

        tshirts: [
            { name: "Áo Thun Black Cotton Premium", price: "290.000đ", img: "images/ao-thun-1.jpg" },
            { name: "Áo Thun Basic Slim Fit Bown", price: "250.000đ", img: "images/ao-thun-2.jpg" },
            { name: "Áo Thun Graphic Streetwear", price: "350.000đ", img: "images/ao-thun-3.jpg" },
            { name: "Áo Thun Minimalist", price: "380.000đ", img: "images/ao-thun-4.jpg" },
            { name: "Áo Thun Vintage Black", price: "320.000đ", img: "images/ao-thun-5.jpg" },
            { name: "Áo Thun Long Sleeve Casual", price: "390.000đ", img: "images/ao-thun-6.jpg" },
            { name: "Áo Thun Unisex Boxy Fit", price: "310.000đ", img: "images/ao-thun-7.jpg" },
            { name: "Áo Thun Mock Neck Signature", price: "420.000đ", img: "images/ao-thun-8.jpg" },
            { name: "Áo Thun Essential Bown", price: "250.000đ", img: "images/ao-thun-9.jpg" },
            { name: "Áo Thun Henley Retro", price: "370.000đ", img: "images/ao-thun-10.jpg" }
        ],
        pants: [
            { name: "Quần Jean Slim Fit Navy", price: "560.000đ", img: "images/quan-jean-1.jpg" },
            { name: "Quần Jean Đen Herringbone", price: "620.000đ", img: "images/quan-jean-2.jpg" },
            { name: "Quần Jean Đen Basic Công Sở", price: "490.000đ", img: "images/quan-jean-3.jpg" },
            { name: "Quần Jean Xanh Premium", price: "580.000đ", img: "images/quan-jean-4.jpg" },
            { name: "Quần Jean Wool Blend Luxury", price: "1.250.000đ", img: "images/quan-jean-5.jpg" },
            { name: "Quần Jean Plaid Checked", price: "680.000đ", img: "images/quan-jean-6.jpg" },
            { name: "Quần Jean Light Black Casual", price: "520.000đ", img: "images/quan-jean-7.jpg" },
            { name: "Quần Jean Dark Brown Vintage", price: "650.000đ", img: "images/quan-jean-8.jpg" },
            { name: "Quần Jean Xám Summer Linen", price: "720.000đ", img: "images/quan-jean-9.jpg" },
            { name: "Quần Jean Charcoal Smart Fit", price: "590.000đ", img: "images/quan-jean-10.jpg" }
        ],
        jackets: [
            { name: "Áo Khoác Jean Racing Denim Jacket", price: "720.000đ", img: "images/ao-khoac-jean-1.jpg  " },
            { name: "Áo Khoác Jean Retro Denim", price: "580.000đ", img: "images/ao-khoac-jean-2.jpg" },
            { name: "Áo Khoác Jean Basic Light Blue", price: "450.000đ", img: "images/ao-khoac-jean-3.jpg" },
            { name: "Áo Khoác Jean Wash Acid Bụi Bặm", price: "890.000đ", img: "images/ao-khoac-jean-4.jpg" },
            { name: "Áo Khoác Jean Blazer Denim Tailored", price: "1.150.000đ", img: "images/ao-khoac-jean-5.jpg" },
            { name: "Áo Khoác Jean Layered Denim", price: "650.000đ", img: "images/ao-khoac-jean-6.jpg" },
            { name: "Áo Khoác Jean Puffer Denim", price: "1.350.000đ", img: "images/ao-khoac-jean-7.jpg" },
            { name: "Áo Khoác Jean Biker Leather Mix", price: "1.450.000đ", img: "images/ao-khoac-jean-8.jpg" },
            { name: "Áo Khoác Jean Knit Denim", price: "590.000đ", img: "images/ao-khoac-jean-9.jpg" },
            { name: "Áo Khoác Jean Măng Tô Long Denim", price: "1.950.000đ", img: "images/ao-khoac-jean-10.jpg" }
        ],
        blouses: [
            { name: "Áo Kiểu Voan Tơ Bèo Nhún", price: "390.000đ", img: "images/ao-kieu-1.jpg" },
            { name: "Áo Kiểu Tay Phồng Tiểu Thư", price: "350.000đ", img: "images/ao-kieu-2.jpg" },
            { name: "Áo Sơ Mi Voan Công Sở", price: "420.000đ", img: "images/ao-kieu-3.jpg" },
            { name: "Áo Kiểu Cổ V Phối Nơ", price: "450.000đ", img: "images/ao-kieu-4.jpg" },
            { name: "Áo Kiểu Trễ Vai Mùa Hè", price: "480.000đ", img: "images/ao-kieu-5.jpg" },
            { name: "Áo Kiểu Peplum Sang Trọng", price: "310.000đ", img: "images/ao-kieu-6.jpg" },
            { name: "Áo Cổ Vuông Tay Lỡ", price: "280.000đ", img: "images/ao-kieu-7.jpg" },
            { name: "Áo Ống Trơn Cao Cấp", price: "340.000đ", img: "images/ao-kieu-8.jpg" },
            { name: "Áo Caro Cách Điệu", price: "370.000đ", img: "images/ao-kieu-9.jpg" },
            { name: "Áo Kiểu Vintage Retro", price: "460.000đ", img: "images/ao-kieu-10.jpg" }
        ],
        skirts: [
            { name: "Chân Váy Thắt Nơ Trắng", price: "480.000đ", img: "images/chan-vay-1.jpg" },
            { name: "Chân Váy Đen Xếp Ly", price: "390.000đ", img: "images/chan-vay-2.jpg" },
            { name: "Chân Váy Nơ Đen Xếp Ly", price: "550.000đ", img: "images/chan-vay-3.jpg" },
            { name: "Chân Váy Dạ Tweed Sang Chảnh", price: "320.000đ", img: "images/chan-vay-4.jpg" },
            { name: "Chân Váy Voan Tầng Xòe", price: "420.000đ", img: "images/chan-vay-5.jpg" },
            { name: "Chân Váy Lụa Trẻ Trung", price: "290.000đ", img: "images/chan-vay-6.jpg" },
            { name: "Chân Váy Y2K Đen Ngắn", price: "450.000đ", img: "images/chan-vay-7.jpg" },
            { name: "Chân Váy Jean Trắng Xếp Ly", price: "380.000đ", img: "images/chan-vay-8.jpg" },
            { name: "Chân Váy Tầng Bồng Bềnh", price: "520.000đ", img: "images/chan-vay-9.jpg" },
            { name: "Chân Váy Xoè Ngắn", price: "360.000đ", img: "images/chan-vay-10.jpg" }
        ],
        womenJeans: [
            { name: "Quần Jean Nữ Ống Suông Rộng", price: "590.000đ", img: "images/quan-jean-nu-1.jpg" },
            { name: "Quần Jean Nữ Ống Đứng Basic", price: "520.000đ", img: "images/quan-jean-nu-2.jpg" },
            { name: "Quần Jean Nữ Baggy Bụi Bặm", price: "550.000đ", img: "images/quan-jean-nu-3.jpg" },
            { name: "Quần Jean Nữ Năng Động", price: "320.000đ", img: "images/quan-jean-nu-4.jpg" },
            { name: "Quần Jean Nữ Ống Loe Retro", price: "620.000đ", img: "images/quan-jean-nu-5.jpg" },
            { name: "Quần Jean Nữ Cạp Cao Tôn Dáng", price: "580.000đ", img: "images/quan-jean-nu-6.jpg" },
            { name: "Quần Jean Nữ Trắng Basic", price: "650.000đ", img: "images/quan-jean-nu-7.jpg" },
            { name: "Quần Jean Nữ Màu Xám Khói", price: "540.000đ", img: "images/quan-jean-nu-8.jpg" },
            { name: "Quần Jean Nữ Bạc Ống Suông", price: "490.000đ", img: "images/quan-jean-nu-9.jpg" },
            { name: "Quần Jean Nữ Phối Màu Độc Đáo", price: "690.000đ", img: "images/quan-jean-nu-10.jpg" }
        ],
        newArrivals: [
            { name: "Áo Khoác Jean Biker Leather Mix", price: "2.450.000đ", img: "images/ao-khoac-jean-8.jpg" },
            { name: "Áo Khoác Jean Layered Denim", price: "650.000đ", img: "images/ao-khoac-jean-6.jpg" },
            { name: "Áo Khoác Jean Retro Denim", price: "580.000đ", img: "images/ao-khoac-jean-2.jpg" },
            { name: "Quần Jean Slim Fit Navy", price: "560.000đ", img: "images/quan-jean-1.jpg" },
            { name: "Quần Jean Đen Herringbone", price: "620.000đ", img: "images/quan-jean-2.jpg" },
            { name: "Quần Jean Light Black Casual", price: "520.000đ", img: "images/quan-jean-7.jpg" },
            { name: "Áo Thun Vintage Black", price: "320.000đ", img: "images/ao-thun-5.jpg" },
            { name: "Áo Thun Essential Bown", price: "250.000đ", img: "images/ao-thun-9.jpg" },
            { name: "Áo Thun Henley Retro", price: "370.000đ", img: "images/ao-thun-10.jpg" },
            { name: "Áo Kiểu Tay Phồng Tiểu Thư", price: "350.000đ", img: "images/ao-kieu-2.jpg" },
            { name: "Áo Cổ Vuông Tay Lỡ", price: "280.000đ", img: "images/ao-kieu-7.jpg" },
            { name: "Áo Kiểu Vintage Retro", price: "460.000đ", img: "images/ao-kieu-10.jpg" },
            { name: "Chân Váy Thắt Nơ Trắng", price: "480.000đ", img: "images/chan-vay-1.jpg" },
            { name: "Chân Váy Nơ Đen Xếp Ly", price: "550.000đ", img: "images/chan-vay-2.jpg" },
            { name: "Chân Váy Y2K Đen Ngắn", price: "450.000đ", img: "images/chan-vay-7.jpg" },
            { name: "Quần Jean Nữ Ống Loe Retro", price: "620.000đ", img: "images/quan-jean-nu-5.jpg" },
            { name: "Quần Jean Nữ Cạp Cao Tôn Dáng", price: "580.000đ", img: "images/quan-jean-nu-6.jpg" },
            { name: "Quần Jean Nữ Màu Xám Khói", price: "540.000đ", img: "images/quan-jean-nu-8.jpg" }
        ],
        sale: [
            { name: "Áo Thun Basic Slim Fit Bown", price: "125.000đ", img: "images/ao-thun-2.jpg" },
            { name: "Áo Thun Graphic Streetwear", price: "175.000đ", img: "images/ao-thun-3.jpg" },
            { name: "Áo Thun Minimalist", price: "190.000đ", img: "images/ao-thun-4.jpg" },
            { name: "Áo Thun Vintage Black", price: "160.000đ", img: "images/ao-thun-5.jpg" },
            { name: "Áo Thun Long Sleeve Casual", price: "195.000đ", img: "images/ao-thun-6.jpg" },
            { name: "Quần Jean Xám Summer Linen", price: "360.000đ", img: "images/quan-jean-9.jpg" },
            { name: "Quần Jean Charcoal Smart Fit", price: "295.000đ", img: "images/quan-jean-10.jpg" },
            { name: "Áo Khoác Jean Knit Denim", price: "295.000đ", img: "images/ao-khoac-jean-9.jpg" },
            { name: "Áo Khoác Jean Măng Tô Long Denim", price: "975.000đ", img: "images/ao-khoac-jean-10.jpg" },
            { name: "Áo Kiểu Voan Tơ Bèo Nhún", price: "195.000đ", img: "images/ao-kieu-1.jpg" },
            { name: "Áo Sơ Mi Voan Công Sở", price: "420.000đ", img: "images/ao-kieu-3.jpg" },
            { name: "Chân Váy Voan Tầng Xòe", price: "210.000đ", img: "images/chan-vay-5.jpg" },
            { name: "Chân Váy Xoè Ngắn", price: "180.000đ", img: "images/chan-vay-10.jpg" },
            { name: "Quần Jean Nữ Trắng Basic", price: "325.000đ", img: "images/quan-jean-nu-7.jpg" },
            { name: "Quần Jean Nữ Bạc Ống Suông", price: "245.000đ", img: "images/quan-jean-nu-9.jpg" }
        ],
        news: [
            { id: 1, title: "Xu Hướng Thời Trang Denim-On-Denim Trở Lại Vào Mùa Hè 2026", date: "10/05/2026", desc: "Sự kết hợp giữa áo khoác jeans wash acid bụi bặm cùng quần jeans ống suông rộng...", img: "images/ao-khoac-jean-8.jpg", 
                content: `  <p style="font-size: 15px; color: #666; margin-bottom: 20px;">Mùa hè năm 2026 chứng kiến sự lội ngược dòng mạnh mẽ của xu hướng <strong>Denim-on-Denim</strong> (diện nguyên cây đồ jeans). Không còn bó buộc trong những quy chuẩn cũ kỹ, phong cách năm nay hướng đến sự phá cách, tự do và đậm chất đường phố bụi bặm.</p>
                            <p style="font-size: 15px; color: #666; margin-bottom: 20px;">Điểm nhấn nổi bật chính là sự kết hợp đầy ngẫu hứng giữa những chiếc <em>Áo Khoác Jean Wash Acid</em> có tông màu bạc loang lổ cùng với các dáng <em>Quần Jean Nữ Ống Suông Rộng</em> hoặc quần jeans nam túi hộp. Sự tương phản về sắc độ wash giữa phần áo và quần tạo nên một tổng thể có chiều sâu và cực kỳ cá tính.</p>
                            <p style="font-size: 15px; color: #666; margin-bottom: 20px;">Để mặc bộ cánh này không bị ngột ngạt trong thời tiết nắng nóng, các stylist khuyên bạn nên kết hợp cùng một chiếc áo thun trơn màu trắng hoặc đen basic bằng chất liệu cotton mỏng nhẹ ở bên trong. Đi kèm với một đôi sneaker năng động và kính râm đen sẽ là công thức hoàn hảo để bạn tự tin sải bước xuống phố đông.</p>
                        `
            },
            { id: 2, title: "Bí Quyết Phối Đồ Tôn Dáng Cho Nữ Với Quần Jeans Cạp Cao", date: "08/05/2026", desc: "Nếu bạn muốn ăn gian chiều cao, việc sơ vin một chiếc áo kiểu...", img: "images/quan-jean-nu-6.jpg",
                 content: ` <p style="font-size: 15px; color: #666; margin-bottom: 20px;">Quần jeans cạp cao từ lâu đã là bảo bối không thể thiếu trong tủ đồ của mọi cô nàng nhờ khả năng hack dáng thần sầu. Tuy nhiên, phối làm sao để tối đa hóa tỷ lệ cơ thể và trông thanh lịch nhất thì không phải ai cũng biết.</p>
                            <p style="font-size: 15px; color: #666; margin-bottom: 20px;">Công thức bất bại được yêu thích nhất hiện nay là bắt cặp <strong>Quần Jeans Cạp Cao Tôn Dáng</strong> cùng với <strong>Áo Kiểu Tay Phồng Tiểu Thư</strong> hoặc áo sơ mi voan lụa mềm mại. Việc sơ vin gọn gàng toàn bộ vạt áo vào trong quần giúp định hình rõ ràng đường cong vòng eo, tạo hiệu ứng thị giác kéo dài đôi chân một cách triệt để.</p>
                            <p style="font-size: 15px; color: #666; margin-bottom: 20px;">Đối với những cô nàng có chiều cao khiêm tốn, hãy ưu tiên chọn dáng quần ống đứng hoặc ống loe nhẹ che nửa bàn chân, kết hợp cùng một đôi giày cao gót mũi nhọn. Set đồ này không chỉ giúp bạn trông cao ráo, thanh thoát hơn mà còn mang lại vẻ ngoài sang trọng, chỉn chu tuyệt đối khi đi làm lẫn đi chơi.</p>
                          `
            },
            { id: 3, title: "FASHION.CO Ra Mắt Đặc Quyền Member VIP - Thăng Hạng Phong Cách", date: "05/05/2026", desc: "Chào đón mùa mua sắm mới, chúng tôi chính thức ra mắt hệ thống...", img: "images/the-vip.jpg",
                 content: ` <p style="font-size: 15px; color: #666; margin-bottom: 20px;">Nhằm tri ân sự đồng hành và ủng hộ từ phía khách hàng thân yêu, thương hiệu <strong>FASHION.CO</strong> xin trân trọng giới thiệu chương trình nâng hạng thành viên và kích hoạt đặc quyền <strong>Member VIP 2026</strong> hoàn toàn mới.</p>
                            <p style="font-size: 15px; color: #666; margin-bottom: 20px;">Kể từ hôm nay, khi tổng giá trị hóa đơn mua sắm tích lũy đạt mốc quy định, tài khoản của bạn sẽ tự động được thăng hạng. Ngay lập tức, bạn sẽ nhận được mã giảm giá trực tiếp 20% áp dụng cho toàn bộ các sản phẩm nguyên giá trong những lần mua sắm tiếp theo, bao gồm cả đồ nam và đồ nữ.</p>
                            <p style="font-size: 15px; color: #666; margin-bottom: 20px;">Chưa dừng lại ở đó, các thành viên VIP sẽ sở hữu đặc quyền nhận thông tin và tham gia đặt hàng trước (Pre-order) đối với các bộ sưu tập giới hạn (Limited Edition) trước khi mở bán công khai. Đồng thời, một phần quà bí mật cùng voucher mua sắm đặc biệt sẽ được gửi thẳng đến bạn vào tuần sinh nhật như một lời chúc ý nghĩa từ chúng tôi.</p>
                          `
            }
        ]
    };
});

    // HÀM TẠO HTML SẢN PHẨM (GIỮ NGUYÊN STYLE CỦA KHANH)
    function createItem(catId, name, price, img, targetGrid) {
    if (!targetGrid) return;
    const div = document.createElement('div');
    div.className = `product-item ${catId}`;
    div.style.textAlign = 'center';
    
    // Thêm onclick vào thẻ div bao ngoài hoặc ảnh
    div.innerHTML = `
        <div style="overflow:hidden; border-radius: 8px; margin-bottom: 12px; background: #fff; border: 1px solid #eee; cursor: pointer;" 
             onclick="window.showDetail('${name}', '${price}', '${img}')">
            <img src="${img}" style="width:100%; height:320px; object-fit:contain; padding: 10px; display: block;">
        </div>
        <h4 style="font-size:13px; font-weight: 600; text-transform: uppercase; margin-bottom: 5px; min-height: 32px; color: #333;">${name}</h4>
        <p style="color: #d10000; font-weight: 700; font-size: 15px; margin-bottom: 20px;">${price}</p>
    `;
    targetGrid.appendChild(div);
}

    function createNews(news, container) {
        if (!container) return;
        const newsItem = document.createElement('div');
        newsItem.className = 'news-card';
        newsItem.style.background = '#fff';
        newsItem.style.border = '1px solid #eee';
        newsItem.style.borderRadius = '8px';
        newsItem.style.overflow = 'hidden';
        newsItem.style.display = 'flex';
        newsItem.style.flexDirection = 'column';

        newsItem.innerHTML = `
            <div style="overflow: hidden; height: 220px; background: #f4f4f4;">
                <img src="${news.img}" style="width: 100%; height: 100%; object-fit: cover; transition: 0.5s;" 
                     onmouseover="this.style.transform='scale(1.05)'" 
                     onmouseout="this.style.transform='scale(1)'">
            </div>
            <div style="padding: 20px; flex-grow: 1; display: flex; flex-direction: column; justify-content: space-between;">
                <div>
                    <small style="color: #888; font-size: 11px; text-transform: uppercase; letter-spacing: 1px; display: block; margin-bottom: 8px;">
                        📅 ĐĂNG NGÀY: ${news.date}
                    </small>
                    <h4 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 700; color: #000; line-height: 1.4; min-height: 44px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;">
                        ${news.title}
                    </h4>
                    <p style="font-size: 13px; color: #666; line-height: 1.6; margin-bottom: 20px; min-height: 62px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
                        ${news.desc}
                    </p>
                </div>
                    <a href="javascript:void(0)" class="btn-doc-them" data-id="${news.id}" 
                    style="color: #000; font-weight: 700; text-decoration: none; font-size: 12px; letter-spacing: 1px; border-bottom: 2px solid #000; align-self: flex-start; padding-bottom: 2px; transition: 0.2s;">
                    ĐỌC THÊM →
                    </a>
            </div>
        `;
        container.appendChild(newsItem);
    }

    // HÀM ĐỔ NỘI DUNG VÀO TRANG CHI TIẾT KHI BẤM NÚT ĐỌC THÊM
    window.xemChiTiet = function(id) {
        // Tìm đúng bài viết theo ID trong mảng dữ liệu
        const baiViet = window.storeData.news.find(item => item.id === id);
        if (!baiViet) return;

        const containerChiTiet = document.getElementById('noi-dung-chi-tiet');
        if (containerChiTiet) {
            // Render toàn bộ giao diện bài viết chi tiết thật ra màn hình
            containerChiTiet.innerHTML = `
                <h1 style="font-size: 32px; font-weight: 800; line-height: 1.3; color: #000; margin-bottom: 10px;">${baiViet.title}</h1>
                <p style="color: #888; font-size: 13px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 30px;">
                    📅 Đăng ngày: ${baiViet.date} | Tác giả: Ban Biên Tập FASHION.CO
                </p>
                <div style="width: 100%; height: 400px; background: #f4f4f4; margin-bottom: 30px; border-radius: 8px; display: flex; justify-content: center; align-items: center; overflow: hidden;">
                    <img src="${baiViet.img}" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                </div>
                <div class="article-body-content" style="line-height: 1.8;">
                    ${baiViet.content}
                </div>
            `;
            
            // Dùng lại hàm showPage có sẵn của bạn để ẩn trang tin tức và hiện trang chi tiết lên
            window.showPage('chi-tiet-bai-viet');
        }
    };

    window.renderAll = function() {
    const productMaps = [
        { key: 'tshirts', id: 'product-grid' },
        { key: 'pants', id: 'product-grid' },
        { key: 'jackets', id: 'product-grid' },
        { key: 'blouses', id: 'grid-nu' },
        { key: 'skirts', id: 'grid-nu' },
        { key: 'womenJeans', id: 'grid-nu' },
        { key: 'newArrivals', id: 'grid-new' },
        { key: 'sale', id: 'grid-km' }
    ];

    // 1. Xóa sạch các grid trước khi đổ dữ liệu mới vào
    const allGridIds = ['product-grid', 'grid-nu', 'grid-new', 'grid-km'];
    allGridIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = "";
    });

    // 2. Render sản phẩm
    productMaps.forEach(m => {
        const container = document.getElementById(m.id);
        if (container && window.storeData[m.key]) {
            window.storeData[m.key].forEach(item => {
                createItem(m.key, item.name, item.price, item.img, container);
            });
        }
    });

    // 3. Render Tin tức
    const gridNews = document.getElementById('grid-news');
    if (gridNews) {
        gridNews.innerHTML = "";
        window.storeData.news.forEach(n => createNews(n, gridNews));
    }
};
  
    
    // HÀM CHUYỂN TRANG
    window.showPage = function(pageId) {
        // Ẩn tất cả các trang nội dung chính
        document.querySelectorAll('.page-section').forEach(p => p.style.display = 'none');
        
        // Hiển thị đúng trang được chọn
        const target = document.getElementById(pageId);
        if (target) {
            target.style.display = 'block';
            
            // Ép trình duyệt cuộn lên vị trí đầu trang ngay lập tức
            window.scrollTo({
                top: 0,
                behavior: 'instant' // Hoặc 'smooth' nếu muốn cuộn mượt
            });
            
            // Kích hoạt filter hiển thị cho từng trang
            if (pageId === 'thoi-trang-nam') filterProducts('all', null, 'thoi-trang-nam');
            if (pageId === 'thoi-trang-nu') filterProducts('all', null, 'thoi-trang-nu');
            if (pageId === 'bo-suu-tap') filterProducts('all', null, 'bo-suu-tap');
            if (pageId === 'khuyen-mai') filterProducts('all', null, 'khuyen-mai');
            if (pageId === 'tin-tuc') filterProducts('all', null, 'tin-tuc');
        }
        const sidebar = document.getElementById('sidebar-danhmuc');
        if (sidebar) {
            sidebar.style.display = 'block'; 
        }
    };
// --- 1. HÀM ẨN / HIỆN THANH TÌM KIẾM ---
window.toggleSearch = function() {
    const searchBar = document.getElementById('search-bar-container');
    if (searchBar) {
        if (searchBar.style.display === 'none' || searchBar.style.display === '') {
            searchBar.style.display = 'block';
            // Tự động nháy con trỏ chuột vào ô nhập liệu
            setTimeout(() => {
                const input = document.getElementById('search-input');
                if(input) input.focus();
            }, 50);
        } else {
            searchBar.style.display = 'none';
        }
    }
};

// --- 2. HÀM XỬ LÝ LOGIC KHI BẤM NÚT TÌM KIẾM ---
window.executeSearch = function() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    const keyword = searchInput.value.trim().toLowerCase();
    if (!keyword) {
        alert('Vui lòng nhập từ khóa để tìm sản phẩm!');
        return;
    }

    // Ẩn cột danh mục khi tìm kiếm
    const sidebar = document.getElementById('sidebar-danhmuc');
    if (sidebar) sidebar.style.display = 'none';

    window.showPage('thoi-trang-nam');
    const grid = document.getElementById('product-grid');
    grid.innerHTML = ""; 

    // Đổi tiêu đề
    const pageTitle = document.querySelector('#thoi-trang-nam h2');
    if (pageTitle) pageTitle.innerText = 'KẾT QUẢ TÌM KIẾM';

    let hasProduct = false;

    // Duyệt qua dữ liệu một cách an toàn
    for (let categoryKey in window.storeData) {
        const products = window.storeData[categoryKey];
        if (Array.isArray(products)) {
            products.forEach(item => {
                // Kiểm tra item và item.name có tồn tại không trước khi gọi toLowerCase()
                if (item && item.name && typeof item.name === 'string') {
                    if (item.name.toLowerCase().includes(keyword)) {
                        createItem(categoryKey, item.name, item.price, item.img, grid);
                        hasProduct = true;
                    }
                }
            });
        }
    }

    if (!hasProduct) {
        alert('Không tìm thấy sản phẩm nào chứa từ khóa: "' + keyword + '"');
    }
};
// =========================================================================
// HỆ THỐNG QUẢN LÝ ĐĂNG KÝ TỰ ĐỘNG ĐĂNG NHẬP & ĐĂNG NHẬP LINH HOẠT
// =========================================================================

// --- HỆ THỐNG QUẢN LÝ TÀI KHOẢN VĨNH VIỄN ---
// Lấy dữ liệu từ localStorage, nếu chưa có thì tạo mảng mặc định
window.userDatabase = JSON.parse(localStorage.getItem('myStore')) || [
    { name: "Khanh Huỳnh", email: "khanhhuyenh05@gmail.com", password: "G.Khanh05" }
];

// Hàm lưu dữ liệu (gọi mỗi khi có thay đổi)
window.saveDatabase = function() {
    localStorage.setItem('myStore', JSON.stringify(window.userDatabase));
};

// --- HÀM ĐỔI TRẠNG THÁI GIAO DIỆN KHI ĐĂNG NHẬP THÀNH CÔNG ---
window.xuLyGiaoDienDangNhapThanhCong = function(userObj) {
    // [Các code cũ giữ nguyên: ẩn nút tài khoản, hiện tên trên header...]
    document.getElementById('account-icon-btn').style.display = 'none';
    document.getElementById('user-logged-in').style.display = 'inline-flex';
    document.getElementById('user-display-name').innerText = userObj.name;
    document.getElementById('menu-login-link').style.display = 'none';
    document.getElementById('menu-logout-btn').style.display = 'block';

    // 1. Cập nhật Hồ Sơ Cá Nhân (code bước trước đã làm)
    const hoSoNoiDung = document.getElementById('ho-so-noi-dung');
    if (hoSoNoiDung) {
        hoSoNoiDung.innerHTML = `
            <div style="text-align: left; line-height: 2; font-size: 15px; color: #333; border-top: 1px solid #e5e5e5; padding-top: 20px; margin-top: 10px;">
                <p style="margin: 8px 0;"><strong style="color: #000;">Họ và tên:</strong> ${userObj.name}</p>
                <p style="margin: 8px 0;"><strong style="color: #000;">Email đăng ký:</strong> ${userObj.email}</p>
                <p style="margin: 8px 0;"><strong style="color: #000;">Trạng thái tài khoản:</strong> <span style="color: #28a745; font-weight: bold;">● Thành viên đang hoạt động</span></p>
            </div>
        `;
    }

    // 🔥 2. ĐOẠN ĐƯỢC THÊM MỚI: Cập nhật Lịch sử đơn hàng khi ĐĂNG NHẬP THÀNH CÔNG
   // Cập nhật Lịch sử đơn hàng khi ĐĂNG NHẬP THÀNH CÔNG (Dùng đúng ID mới là 'lich-su-noi-dung')
    const lichSuNoiDung = document.getElementById('lich-su-noi-dung');
    if (lichSuNoiDung) {
        lichSuNoiDung.innerHTML = `
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 14px; text-align: left;">
                <thead>
                    <tr style="border-bottom: 2px solid #000;">
                        <th style="padding: 12px 8px;">Mã đơn</th>
                        <th style="padding: 12px 8px;">Ngày mua</th>
                        <th style="padding: 12px 8px;">Tổng tiền</th>
                        <th style="padding: 12px 8px;">Trạng thái</th>
                    </tr>
                </thead>
                <tbody>
                    <tr style="border-bottom: 1px solid #eee;">
                        <td style="padding: 12px 8px; font-weight: bold; color: #0066cc;">#UQ-98231</td>
                        <td style="padding: 12px 8px;">20/05/2026</td>
                        <td style="padding: 12px 8px;">499.000đ</td>
                        <td style="padding: 12px 8px;"><span style="background: #e6f4ea; color: #137333; padding: 4px 8px; border-radius: 4px; font-size: 12px;">Đã giao hàng</span></td>
                    </tr>
                </tbody>
            </table>
        `;
    }       

    // Clear form và chuyển trang chủ
    if(document.getElementById('login-email')) document.getElementById('login-email').value = "";
    if(document.getElementById('login-password')) document.getElementById('login-password').value = "";
    window.showPage('trang-chu');
};

// --- 1. HÀM XỬ LÝ ĐĂNG KÝ TÀI KHOẢN MỚI (CÓ KIỂM TRA ĐIỀU KIỆN MẬT KHẨU) ---
window.handleRegister = function() {
    const regName = document.getElementById('register-name').value.trim();
    const regEmail = document.getElementById('register-email').value.trim().toLowerCase();
    const regPassword = document.getElementById('register-password').value.trim();

    // 1. Kiểm tra đầu vào dữ liệu trống
    if (!regName || !regEmail || !regPassword) {
        alert("Vui lòng điền đầy đủ thông tin để đăng ký tài khoản!");
        return;
    }

    // 2. RÀO KIỂM TRA ĐỘ DÀI MẬT KHẨU (Từ 8 đến 20 ký tự)
    if (regPassword.length < 8 || regPassword.length > 20) {
        alert("Mật khẩu không hợp lệ! Độ dài mật khẩu phải từ 8 đến 20 kí tự.");
        return;
    }

    // 3. RÀO KIỂM TRA ĐỊNH DẠNG (Phải bao gồm cả chữ và số)
    // Biểu thức Regex kiểm tra: (?=.*[A-Za-z]) có ít nhất 1 chữ, (?=.*\d) có ít nhất 1 số
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).+$/;
    if (!passwordRegex.test(regPassword)) {
        alert("Mật khẩu không hợp lệ! Mật khẩu phải bao gồm cả chữ cái và chữ số.");
        return;
    }

    // 4. Kiểm tra xem email này đã có ai đăng ký trước đó chưa
    const isExist = window.userDatabase.some(user => user.email === regEmail);
    if (isExist) {
        alert("Email này đã được sử dụng! Vui lòng dùng Email khác.");
        return;
    }
    
    // Tạo đối tượng tài khoản mới khi mọi điều kiện đã THỎA MÃN
    const newUser = {
        name: regName,
        email: regEmail,
        password: regPassword
    };

   // ... sau khi bạn push tài khoản mới vào mảng (ví dụ: window.userDatabase.push(newUser);)
    window.userDatabase.push(newUser);
    window.saveDatabase(); // <--- THÊM DÒNG NÀY VÀO
    alert("Đăng ký thành công!");
};


// --- 2. HÀM XỬ LÝ ĐĂNG NHẬP THỦ CÔNG (CHO AI ĐÃ CÓ TÀI KHOẢN TỪ TRƯỚC) ---
// Hàm hỗ trợ ẩn hiện mật khẩu động cho cả 2 form đăng nhập / đăng ký
window.togglePasswordVisibility = function(inputId) {
    const passwordInput = document.getElementById(inputId);
    if (passwordInput) {
        if (passwordInput.type === "password") {
            passwordInput.type = "text";
        } else {
            passwordInput.type = "password";
        }
    }
};
window.handleLogin = function() {
    const loginEmail = document.getElementById('login-email').value.trim().toLowerCase();
    const loginPassword = document.getElementById('login-password').value.trim();

    if (!loginEmail || !loginPassword) {
        alert("Vui lòng nhập đầy đủ Email và Mật khẩu!");
        return;
    }

    // Tìm kiếm tài khoản trùng khớp trong mảng hệ thống (userDatabase)
    const foundUser = window.userDatabase.find(user => user.email === loginEmail && user.password === loginPassword);

    if (foundUser) {
        alert("Đăng nhập thành công! Chào mừng " + foundUser.name + " quay trở lại.");
        window.cart = [];
        localStorage.removeItem('myCart');
        window.updateCartCount();
        localStorage.setItem('isLoggedIn', 'true');
        // Gọi hàm đổi giao diện đăng nhập thành công
        window.xuLyGiaoDienDangNhapThanhCong(foundUser);
    } else {
        alert("Email hoặc Mật khẩu không chính xác! Vui lòng thử lại.");
    }
};

// --- HÀM XỬ LÝ ĐĂNG XUẤT ---
window.handleLogout = function() {
    if (confirm("Bạn có chắc chắn muốn đăng xuất không?")) {
        localStorage.setItem('isLoggedIn', 'false');
        // Xóa giỏ hàng và reset giao diện
        window.cart = [];
        localStorage.removeItem('myCart');
        window.updateCartCount();
        // [Các code cũ giữ nguyên...]
        document.getElementById('account-icon-btn').style.display = 'inline-flex';
        document.getElementById('user-logged-in').style.display = 'none';
        document.getElementById('menu-login-link').style.display = 'block';
        document.getElementById('menu-logout-btn').style.display = 'none';
        if(document.getElementById('account-dropdown-menu')) {
            document.getElementById('account-dropdown-menu').classList.remove('show-menu');
        }

        // 1. Reset Hồ sơ cá nhân (code bước trước đã làm)
        const hoSoNoiDung = document.getElementById('ho-so-noi-dung');
        if (hoSoNoiDung) {
            hoSoNoiDung.innerHTML = `
                <div style="padding: 30px 10px;">
                    <span style="font-size: 48px; color: #aaa; display: block; margin-bottom: 15px;">👤</span>
                    <p style="font-size: 16px; color: #333; margin-bottom: 20px;">Bạn chưa đăng nhập tài khoản hệ thống.</p>
                    <button onclick="window.showPage('dang-nhap')" style="background: #000000; color: #ffffff; border: none; padding: 12px 30px; font-size: 14px; font-weight: bold; text-transform: uppercase; cursor: pointer; letter-spacing: 1px;">Đăng nhập ngay</button>
                </div>
            `;
        }

        // 🔥 2. ĐOẠN ĐƯỢC THÊM MỚI: Reset Lịch sử đơn hàng về "Chưa đăng nhập" khi bấm ĐĂNG XUẤT
       // Reset Lịch sử đơn hàng về "Chưa đăng nhập" khi bấm ĐĂNG XUẤT
        const lichSuNoiDung = document.getElementById('lich-su-noi-dung');
        if (lichSuNoiDung) {
            lichSuNoiDung.innerHTML = `
                <div style="text-align: center; padding: 30px 10px;">
                    <span style="font-size: 60px; color: #ccc; display: block; margin-bottom: 20px;">📦</span>
                    <p style="font-size: 15px; color: #333; margin-bottom: 25px; font-weight: 500;">Bạn chưa đăng nhập tài khoản để xem lịch sử mua hàng.</p>
                    <button onclick="window.showPage('dang-nhap')" style="background: #000000; color: #ffffff; border: none; padding: 14px 35px; font-size: 13px; font-weight: bold; text-transform: uppercase; cursor: pointer; letter-spacing: 1px;">
                        Đăng nhập ngay
                    </button>
                </div>
            `;
        }
        window.showPage('trang-chu');
    }
};

// --- 4. SỰ KIỆN CLICK VÀO TÊN SAU KHI ĐĂNG NHẬP ĐỂ MỞ DROPDOWN KHỎI BỊ ẨN ---
const userLoggedInBtn = document.getElementById('user-logged-in');
if (userLoggedInBtn) {
    userLoggedInBtn.onclick = function(e) {
        e.stopPropagation();
        const accountMenu = document.getElementById('account-dropdown-menu');
        if (accountMenu) accountMenu.classList.toggle('show-menu');
    };
}

// Hàm ẩn đăng nhập, hiện đăng ký
window.chuyenSangTrangDangKy = function() {
    const trangDangNhap = document.getElementById('dang-nhap');
    const trangDangKy = document.getElementById('dang-ky');
    
    if (trangDangNhap) trangDangNhap.style.display = 'none';
    if (trangDangKy) trangDangKy.style.display = 'block';
};

// Hàm ẩn đăng ký, hiện lại đăng nhập
window.chuyenSangTrangDangNhap = function() {
    const trangDangNhap = document.getElementById('dang-nhap');
    const trangDangKy = document.getElementById('dang-ky');
    
    if (trangDangKy) trangDangKy.style.display = 'none';
    if (trangDangNhap) trangDangNhap.style.display = 'block';
};

// Khởi tạo hoặc lấy dữ liệu từ localStorage
window.wishlist = JSON.parse(localStorage.getItem('myWishlist')) || [];
window.cart = JSON.parse(localStorage.getItem('myCart')) || [];

// Hàm lưu dữ liệu vào trình duyệt
window.saveUserPreferences = function() {
    localStorage.setItem('myWishlist', JSON.stringify(window.wishlist));
    localStorage.setItem('myCart', JSON.stringify(window.cart));
};

// Hàm cập nhật số lượng lên icon giỏ hàng (hiển thị "(0)", "(1)"...)
window.updateCartDisplay = function() {
    const cartDisplay = document.querySelector('[title="Giỏ hàng"] + span'); // Tìm thẻ span nằm cạnh icon giỏ hàng
    if (cartDisplay) {
        const totalItems = window.cart.reduce((sum, item) => sum + item.quantity, 0);
        cartDisplay.innerText = `(${totalItems})`;
    }
};

// Gọi ngay khi trang vừa tải xong để cập nhật số lượng có sẵn trong localStorage
window.updateCartDisplay();

// Biến lưu sản phẩm đang xem
window.currentProduct = null;

// Hàm mở chi tiết sản phẩm
window.viewProduct = function(productId) {
    // Tìm sản phẩm trong mảng products (dựa vào id)
    window.currentProduct = products.find(p => p.id === productId);
    
    // Gán thông tin vào trang chi tiết
    document.getElementById('detail-img').src = window.currentProduct.img;
    document.getElementById('detail-name').innerText = window.currentProduct.name;
    document.getElementById('detail-price').innerText = window.currentProduct.price;
    document.getElementById('detail-old-price').innerText = window.currentProduct.oldPrice;
    document.getElementById('detail-qty').innerText = 1;

    // Ẩn tất cả các trang, chỉ hiện trang chi tiết
    document.querySelectorAll('.page-section').forEach(p => p.style.display = 'none');
    document.getElementById('chi-tiet-san-pham').style.display = 'block';
};

window.showDetail = function(name, price, img) {
    // 1. Điền dữ liệu
    document.getElementById('detail-name').innerText = name;
    document.getElementById('detail-price').innerText = price;
    document.getElementById('detail-img').src = img;
    document.getElementById('detail-qty').innerText = "1"; 

    // 2. BỎ ĐOẠN ẨN PAGE-SECTION. 
    // Thay vào đó, ta hiển thị khung nổi (Modal)
    // Dùng 'flex' để CSS căn giữa hoạt động
    document.getElementById('chi-tiet-san-pham').style.display = 'flex';
};

window.closeDetail = function() {
    // 3. Đóng khung nổi
    document.getElementById('chi-tiet-san-pham').style.display = 'none';
};

// Hàm xử lý tăng giảm số lượng - Vẫn giữ nguyên
window.changeQty = function(delta) {
    const qtySpan = document.getElementById('detail-qty');
    let qty = parseInt(qtySpan.innerText) + delta;
    if (qty < 1) qty = 1;
    qtySpan.innerText = qty;
};

document.addEventListener('DOMContentLoaded', function() {
    // 1. Đổ dữ liệu sản phẩm ra các khung (grid)
    if (typeof window.renderAll === 'function') {
        window.renderAll();
    }
    
    // 2. Lấy giỏ hàng cũ từ bộ nhớ
    const savedCart = localStorage.getItem('myCart');
    window.cart = savedCart ? JSON.parse(savedCart) : [];
    
    // 3. Hiển thị số lượng giỏ hàng lên icon
    if (typeof window.updateCartCount === 'function') {
        window.updateCartCount();
    }
});

document.addEventListener('click', function(e) {
    if (e.target && e.target.classList.contains('btn-doc-them')) {
        const id = parseInt(e.target.getAttribute('data-id'));
        window.xemChiTiet(id);
    }
});

window.handleNewsletter = function() {
    const emailInput = document.getElementById('newsletter-email');
    const email = emailInput.value.trim();

    // 1. Kiểm tra email có hợp lệ không
    if (!email || !email.includes('@')) {
        alert("Vui lòng nhập một địa chỉ email hợp lệ!");
        return;
    }

    // 2. Lưu email vào localStorage (để quản lý danh sách email đã đăng ký)
    let subscribedEmails = JSON.parse(localStorage.getItem('subscribedEmails') || '[]');
    
    if (subscribedEmails.includes(email)) {
        alert("Email này đã được đăng ký trước đó rồi!");
    } else {
        subscribedEmails.push(email);
        localStorage.setItem('subscribedEmails', JSON.stringify(subscribedEmails));
        
        // 3. Thông báo thành công
        alert("Đăng ký thành công! Cảm ơn bạn đã quan tâm đến FASHION.CO");
        emailInput.value = ""; // Xóa trắng ô nhập liệu sau khi đăng ký xong
    }
};