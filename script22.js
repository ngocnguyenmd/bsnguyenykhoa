let tatCaMatHang = [];
const KEY_LUU_DU_LIEU = 'quanly_daban_json';

// === Lấy dữ liệu đã bán ===
function layDuLuuDaBan() {
    const duLuu = localStorage.getItem(KEY_LUU_DU_LIEU);
    return duLuu ? JSON.parse(duLuu) : {};
}

// === Lưu số đã bán ===
function luuDaBan(id, soLuongDaBan) {
    const tatCaDaBan = layDuLuuDaBan();
    tatCaDaBan[id] = soLuongDaBan;
    localStorage.setItem(KEY_LUU_DU_LIEU, JSON.stringify(tatCaDaBan));
}

// === Xóa dữ liệu đã lưu ===
function xoaDuLuuDaBan() {
    localStorage.removeItem(KEY_LUU_DU_LIEU);
}

// === Tự động load ab.txt ===
window.onload = function() {
    console.log('✅ Trang đã tải xong');
};

// === Gọi API BHXX ===
async function taiTuAPI() {
    let tuKhoa = document.getElementById('timKiem').value.trim();
    
    if (!tuKhoa) {
        document.getElementById('trangThai').textContent = '⚠️ Vui lòng gõ từ khóa!';
        return;
    }

    tuKhoa = tuKhoa.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/\s+/g, '-');

    document.getElementById('trangThai').textContent = '⌛ Đang tải: ' + tuKhoa;

    try {
        const API_URL = 'https://api.bachhoaxanh.com/gw/Category/V2/GetCate' +
            '?provinceId=1027' +
            '&wardId=0' +
            '&districtId=0' +
            '&storeId=2546' +
            '&categoryUrl=' + encodeURIComponent(tuKhoa) +
            '&isMobile=true' +
            '&isV2=true' +
            '&pageSize=30';

        const response = await fetch(API_URL, {
            method: 'GET',
            credentials: 'omit',
            headers: {
                'Accept': 'application/json, text/plain, */*',
                'Referer': 'https://www.bachhoaxanh.com/',
                'Origin': 'https://www.bachhoaxanh.com',
                'User-Agent': 'Mozilla/5.0'
            }
        });

        if (!response.ok) throw new Error(`Lỗi HTTP: ${response.status}`);
        
        const duLieu = await response.json();
        console.log('📩 API trả về:', duLieu);

        if (!duLieu || !duLieu.data || !duLieu.data.products || duLieu.data.products.length === 0) {
            throw new Error('Không tìm thấy sản phẩm!');
        }

        const sanPhamAPI = duLieu.data.products;
        const duLuuDaBan = layDuLuuDaBan();
        tatCaMatHang = []; // Xóa cũ trước khi thêm mới

        sanPhamAPI.forEach(sp => {
            const id = String(sp.id);
            const ten = sp.fullName || sp.name;
            const nhom = (sp.category && sp.category.name) ? sp.category.name : tuKhoa.replace(/-/g, ' ');
            
            const gia = (sp.productPrices && sp.productPrices[0]) ? sp.productPrices[0].price : 0;
            const slTon = (sp.productPrices && sp.productPrices[0]) ? sp.productPrices[0].quantity : 0;
            const anh = sp.avatar || sp.avatarTmp || '';
            
            const slDaBan = duLuuDaBan.hasOwnProperty(id) ? duLuuDaBan[id] : 0;

            tatCaMatHang.push({
                nhom: nhom,
                ten: ten,
                id: id,
                slTon: slTon,
                gia: gia,
                slDaBan: slDaBan,
                anhAPI: anh
            });
        });

        console.log('📦 Mảng sản phẩm:', tatCaMatHang);
        
        taoSolecChonNhom();
        hienThiTheoNhom(); // === GỌI HÀM HIỂN THỊ ===
        document.getElementById('trangThai').textContent = `✅ ${sanPhamAPI.length} sản phẩm → Thêm: ${tatCaMatHang.length}`;

    } catch (loi) {
        console.error('❌ Lỗi:', loi);
        document.getElementById('trangThai').textContent = '❌ ' + loi.message;
    }
}

// === Tạo sổ lọc nhóm ===
function taoSolecChonNhom() {
    const nhomDaCo = new Set();
    tatCaMatHang.forEach(h => nhomDaCo.add(h.nhom));

    const chon = document.getElementById('chonNhom');
    chon.innerHTML = '<option value="*">📋 TẤT CẢ NHÓM</option>';

    nhomDaCo.forEach(tenNhom => {
        const opt = document.createElement('option');
        opt.value = tenNhom;
        opt.textContent = '📁 ' + tenNhom;
        chon.appendChild(opt);
    });
}

// === HIỂN THỊ DANH SÁCH ===
function hienThiTheoNhom() {
    console.log('🖼️ Bắt đầu hiển thị, số lượng:', tatCaMatHang.length);
    
    const ds = document.getElementById('danhSach');
    if (!ds) {
        console.error('❌ KHÔNG TÌNH THẤY thẻ #danhSach trong HTML!');
        return;
    }
    
    ds.innerHTML = ''; // Xóa cũ

    tatCaMatHang.forEach(hang => {
        const card = document.createElement('div');
        card.className = 'card';

        const urlAnh = hang.anhAPI;
        const giaDinh = hang.gia.toLocaleString('vi-VN') + ' đ';

        card.innerHTML = `
            <img src="${urlAnh}" alt="${hang.ten}" loading="lazy" 
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
            <span class="no-img" style="display:none;">Không có ảnh</span>
            <div class="name">${hang.ten}</div>
            <div class="info">Mã: ${hang.id}</div>
            <div class="info">Tồn: ${hang.slTon}</div>
            <div class="gia">${giaDinh}</div>
            <div class="info ban">Đã bán: <span class="sl-ban">${hang.slDaBan}</span></div>
            <button class="mua-btn">✅ Bán hàng</button>
        `;

        ds.appendChild(card);
        console.log('➕ Đã thêm thẻ:', hang.ten.substring(0, 30) + '...');
    });

    console.log('✅ Đã hiển thị xong! Tổng thẻ con:', ds.children.length);
}

// === Lưu dữ liệu ra file ===
function luuDuLieu() {
    const tatCaDaBan = layDuLuuDaBan();
    const jsonText = JSON.stringify(tatCaDaBan, null, 2);
    const blob = new Blob([jsonText], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dulieu_daban.json';
    a.click();
    URL.revokeObjectURL(url);
    document.getElementById('trangThai').textContent = '✅ Đã lưu file';
}

// === Xuất file TXT ===
function xuatFileMoi() {
    let noiDung = '';
    tatCaMatHang.forEach(h => {
        noiDung += `${h.nhom}|${h.ten}|${h.id}|${h.slTon}|${h.gia}|${h.slDaBan}\n`;
    });
    const blob = new Blob([noiDung], {type:'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dulieu_capnhat.txt';
    a.click();
    URL.revokeObjectURL(url);
    document.getElementById('trangThai').textContent = '✅ Đã xuất file';
}

// === Các hàm khác ===
function docFileTxt() { alert('Chức năng đọc file TXT'); }
function docLaiTuFile() { alert('Chức năng đọc lại từ file'); }
function xoaTatCa() {
    document.getElementById('danhSach').innerHTML = '';
    tatCaMatHang = [];
    document.getElementById('trangThai').textContent = '✅ Đã xóa hết';
}
function locTheoNhom() {
    // Tạm thời hiển thị tất cả
    hienThiTheoNhom();
}

// === Sự kiện lọc ===
document.getElementById('timKiem').addEventListener('input', locTheoNhom);
document.getElementById('chonNhom').addEventListener('change', locTheoNhom);
