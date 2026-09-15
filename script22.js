// === 🌐 GỌI TRỰC TIẾP API BÁCH HÓA XANH ===
async function taiTuAPI() {
    document.getElementById('trangThai').textContent = '⌛ Đang kết nối API Bách Hóa Xanh...';

    try {
        // ⚠️ Dùng Proxy để vượt qua chặn CORS của trình duyệt
        const PROXY = 'https://api.allorigins.win/raw?url=';
        const API_URL = 'https://bhx-api-core-u20-85-62.bachhoaxanh.com/api/products?categoryId=2485&limit=20';
        
        const response = await fetch(PROXY + encodeURIComponent(API_URL));
        
        if (!response.ok) throw new Error('Lỗi kết nối API');
        
        const duLieu = await response.json();
        
        if (!duLieu || !duLieu.data || !duLieu.data.products || duLieu.data.products.length === 0) {
            throw new Error('API trả về không có dữ liệu');
        }

        const sanPhamAPI = duLieu.data.products;
        const duLuuDaBan = layDuLuuDaBan();
        let soLuongThem = 0;

        sanPhamAPI.forEach(sp => {
            const id = String(sp.id);
            const ten = sp.fullName || sp.name;
            const nhom = (sp.category && sp.category.name) ? sp.category.name : 'Chưa phân loại';
            const gia = (sp.productPrices && sp.productPrices[0]) ? sp.productPrices[0].price : 0;
            const slTon = (sp.productPrices && sp.productPrices[0]) ? sp.productPrices[0].quantity : 0;
            const anh = sp.avatar || '';
            const slDaBan = duLuuDaBan.hasOwnProperty(id) ? duLuuDaBan[id] : 0;

            // Kiểm tra nếu đã có → BỎ QUA, không trùng
            const daTonTai = tatCaMatHang.some(hang => hang.id === id);
            if (daTonTai) return;

            tatCaMatHang.push({
                nhom: nhom,
                ten: ten,
                id: id,
                slTon: slTon,
                gia: gia,
                slDaBan: slDaBan,
                anhAPI: anh
            });
            soLuongThem++;
        });

        taoSolecChonNhom();
        hienThiTheoNhom();
        document.getElementById('trangThai').textContent = `✅ API trả về ${sanPhamAPI.length} sản phẩm → Thêm mới: ${soLuongThem}`;

    } catch (loi) {
        console.error('Lỗi API:', loi);
        document.getElementById('trangThai').textContent = '❌ Lỗi: ' + loi.message + ' → Xem giải thích bên dưới!';
    }
}