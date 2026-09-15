// === 🌐 GỌI API ĐÚNG ĐỊNH DẠNG BÁCH HÓA XANH ===
async function taiTuAPI() {
    let tuKhoa = document.getElementById('timKiem').value.trim();
    
    if (!tuKhoa) {
        document.getElementById('trangThai').textContent = '⚠️ Vui lòng gõ từ khóa vào ô tìm kiếm!';
        return;
    }

    // ✅ Tự chuyển "xà bông cục" → "xa-bong-cuc"
    tuKhoa = tuKhoa.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // bỏ dấu
        .replace(/\s+/g, '-'); // khoảng trắng → gạch ngang

    document.getElementById('trangThai').textContent = '⌛ Đang gọi API: ' + tuKhoa;

    try {
        // ✅ ĐÚNG THỨ TỰ tham số theo mẫu BHXX:
        // storeId → categoryUrl → isMobile → isV2 → pageSize
        const API_URL = 'https://api.bachhoaxanh.com/gw/Category/V2/GetCate' +
            '?provinceId=1027' +
            '&wardId=0' +
            '&districtId=0' +
            '&storeId=2546' +
            '&categoryUrl=' + encodeURIComponent(tuKhoa) +  // ← ĐÚNG VỊ TRÍ NGAY SAU storeId
            '&isMobile=true' +
            '&isV2=true' +
            '&pageSize=30';

        console.log('🔗 Gọi URL:', API_URL); // Log ra xem URL đúng chưa

        const response = await fetch(API_URL, {
            method: 'GET',
            credentials: 'omit',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Referer': 'https://www.bachhoaxanh.com/',
                'Origin': 'https://www.bachhoaxanh.com',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });

        if (!response.ok) throw new Error(`Lỗi HTTP: ${response.status}`);
        
        const duLieu = await response.json();
        console.log('📩 API trả về:', duLieu);

        if (!duLieu || !duLieu.data || !duLieu.data.products || duLieu.data.products.length === 0) {
            throw new Error('Không tìm thấy sản phẩm cho: ' + tuKhoa);
        }

        const sanPhamAPI = duLieu.data.products;
        const duLuuDaBan = layDuLuuDaBan();
        let soLuongThem = 0;

        sanPhamAPI.forEach(sp => {
            const id = String(sp.id);
            const ten = sp.fullName || sp.name;
            const nhom = (sp.category && sp.category.name) ? sp.category.name : tuKhoa.replace(/-/g, ' ');
            const gia = (sp.productPrices && sp.productPrices[0]) ? sp.productPrices[0].price : 0;
            const slTon = (sp.productPrices && sp.productPrices[0]) ? sp.productPrices[0].quantity : 0;
            const anh = sp.avatar || '';
            const slDaBan = duLuuDaBan.hasOwnProperty(id) ? duLuuDaBan[id] : 0;

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
        document.getElementById('trangThai').textContent = `✅ Tìm "${tuKhoa}": ${sanPhamAPI.length} sản phẩm → Thêm: ${soLuongThem}`;

    } catch (loi) {
        console.error('❌ Chi tiết lỗi API:', loi);
        document.getElementById('trangThai').textContent = '❌ Lỗi: ' + loi.message;
    }
}
