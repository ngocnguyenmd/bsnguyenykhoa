// === 🌐 GỌI TRỰC TIẾP API BÁCH HÓA XANH — KHÔNG DÙNG PROXY ===
async function taiTuAPI() {
    document.getElementById('trangThai').textContent = '⌛ Đang gọi API Bách Hóa Xanh...';

    try {
        // ✅ API CHÍNH THỨC bạn cung cấp — GỌI TRỰC TIẾP
        const API_URL = 'https://api.bachhoaxanh.com/gw/Category/V2/GetCate?provinceId=1027&wardId=0&districtId=0&storeId=2546&categoryUrl=xa-bong-cuc&isMobile=true&isV2=true&pageSize=20';
        
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Referer': 'https://www.bachhoaxanh.com/',
                'Origin': 'https://www.bachhoaxanh.com'
            }
        });

        if (!response.ok) throw new Error(`Lỗi HTTP: ${response.status}`);
        
        const duLieu = await response.json();
        
        if (!duLieu || !duLieu.data || !duLieu.data.products || duLieu.data.products.length === 0) {
            throw new Error('API không trả về sản phẩm');
        }

        const sanPhamAPI = duLieu.data.products;
        const duLuuDaBan = layDuLuuDaBan();
        let soLuongThem = 0;

        sanPhamAPI.forEach(sp => {
            const id = String(sp.id);
            const ten = sp.fullName || sp.name;
            const nhom = (sp.category && sp.category.name) ? sp.category.name : 'Xà bông cục';
            const gia = (sp.productPrices && sp.productPrices[0]) ? sp.productPrices[0].price : 0;
            const slTon = (sp.productPrices && sp.productPrices[0]) ? sp.productPrices[0].quantity : 0;
            const anh = sp.avatar || '';
            const slDaBan = duLuuDaBan.hasOwnProperty(id) ? duLuuDaBan[id] : 0;

            // Bỏ qua hàng đã có (tránh trùng với file TXT)
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
        document.getElementById('trangThai').textContent = `✅ API trả về ${sanPhamAPI.length} sản phẩm → Thêm: ${soLuongThem}`;

    } catch (loi) {
        console.error('Chi tiết lỗi API:', loi);
        document.getElementById('trangThai').textContent = '❌ Lỗi: ' + loi.message;
    }
}
