let tatCaMatHang = [];
const KEY_LUU_DU_LIEU = 'quanly_daban_json';
const API_GOC = 'https://api.bachhoaxanh.com/gw/Category/V2/GetCate?provinceId=1027&wardId=0&districtId=0&storeId=2546&isMobile=true&isV2=true&pageSize=30';

// === TỰ ĐỘNG LOAD ab.txt NGAY KHI MỞ TRANG ===
window.onload = function() {
    taiFileTuMay('ab.txt', function(noiDung) {
        xuLyNoiDungTxt(noiDung, true);
        document.getElementById('trangThai').textContent = '✅ Đã tự động tải: ab.txt';
    });
};

// === Tải file TXT từ thư mục cùng cấp ===
function taiFileTuMay(tenFile, hamXuLy) {
    fetch(tenFile)
        .then(response => {
            if (!response.ok) throw new Error('Không tìm thấy file: ' + tenFile);
            return response.text();
        })
        .then(text => hamXuLy(text))
        .catch(err => {
            document.getElementById('trangThai').textContent = '⚠️ ' + err.message;
        });
}

// === 📂 ĐỌC FILE TXT BẰNG TAY ===
function docFileTxt() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.txt';
    input.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(e) {
            xuLyNoiDungTxt(e.target.result, true);
            document.getElementById('trangThai').textContent = '✅ Đã tải: ' + file.name;
        };
        reader.readAsText(file);
    };
    input.click();
}

// === 🔄 ĐỌC LẠI TỪ FILE dulieu.txt ===
function docLaiTuFile() {
    xoaDuLuuDaBan();
    taiFileTuMay('dulieu.txt', function(noiDung) {
        xuLyNoiDungTxt(noiDung, false);
        document.getElementById('trangThai').textContent = '✅ Đã tải: dulieu.txt - Đúng số trong file!';
    });
}

// === 🌐 GỌI API THEO TỪ KHÓA Ô TÌM KIẾM ===
async function taiTuAPI() {
    const tuKhoa = document.getElementById('timKiem').value.trim().toLowerCase().replace(/\s+/g, '-');
    if (!tuKhoa) {
        document.getElementById('trangThai').textContent = '⚠️ Vui lòng gõ từ khóa vào ô tìm kiếm trước!';
        return;
    }

    document.getElementById('trangThai').textContent = '⌛ Đang gọi API cho: ' + tuKhoa;

    try {
        const API_URL = API_GOC + '&categoryUrl=' + encodeURIComponent(tuKhoa);
        
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
        console.error('Chi tiết lỗi API:', loi);
        document.getElementById('trangThai').textContent = '❌ Lỗi: ' + loi.message;
    }
}

// === Lấy dữ liệu đã bán lưu trong máy ===
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

// === XÓA DỮ LIỆU ĐÃ LƯU ===
function xoaDuLuuDaBan() {
    localStorage.removeItem(KEY_LUU_DU_LIEU);
}

// === Lưu dữ liệu ra file JSON ===
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
    document.getElementById('trangThai').textContent = '✅ Đã lưu: dulieu_daban.json';
}

// === Xuất file TXT mới ===
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
    document.getElementById('trangThai').textContent = '✅ Đã xuất: dulieu_capnhat.txt';
}

// === HÀM XỬ LÝ NỘI DUNG TXT CHUNG ===
function xuLyNoiDungTxt(text, coLayDuLuuDaBan) {
    const dong = text.split('\n');
    const ds = document.getElementById('danhSach');
    ds.innerHTML = '';
    tatCaMatHang = [];
    const duLuuDaBan = coLayDuLuuDaBan ? layDuLuuDaBan() : {};

    dong.forEach(dongText => {
        dongText = dongText.trim();
        if (!dongText) return;
        const phanTach = dongText.split('|');
        if (phanTach.length < 6) return;

        const nhom = phanTach[0].trim();
        const ten = phanTach[1].trim();
        const id = phanTach[2].trim();
        const slTon = parseInt(phanTach[3]) || 0;
        const gia = parseInt(phanTach[4]) || 0;
        const slBanMacDinh = parseInt(phanTach[5]) || 0;

        const slDaBan = (coLayDuLuuDaBan && duLuuDaBan.hasOwnProperty(id)) 
            ? duLuuDaBan[id] 
            : slBanMacDinh;

        tatCaMatHang.push({ nhom, ten, id, slTon, gia, slDaBan });
    });

    taoSolecChonNhom();
    hienThiTheoNhom();
}

// === TẠO SỔ LỌC NHÓM ===
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

// === LỌC KHI CHỌN NHÓM ===
function locTheoNhom() {
    hienThiTheoNhom();
}

// === HIỂN THỊ CÓ TIÊU ĐỀ NHÓM ===
function hienThiTheoNhom() {
    const nhomChon = document.getElementById('chonNhom').value;
    const tuKhoa = document.getElementById('timKiem').value.toLowerCase().trim();
    const ds = document.getElementById('danhSach');
    ds.innerHTML = '';

    const nhomMap = {};
    tatCaMatHang.forEach(h => {
        const khopNhom = (nhomChon === '*' || h.nhom === nhomChon);
        const khopTim = !tuKhoa || h.ten.toLowerCase().includes(tuKhoa) || h.id.includes(tuKhoa);
        if (!khopNhom || !khopTim) return;

        if (!nhomMap[h.nhom]) nhomMap[h.nhom] = [];
        nhomMap[h.nhom].push(h);
    });

    for (const tenNhom in nhomMap) {
        const nhomKhoi = document.createElement('div');
        nhomKhoi.className = 'nhom-khoi';

        const tieuDe = document.createElement('div');
        tieuDe.className = 'nhom-tieu-de';
        tieuDe.textContent = tenNhom;
        nhomKhoi.appendChild(tieuDe);

        const nhomDiv = document.createElement('div');
        nhomDiv.className = 'nhom-hang';

        nhomMap[tenNhom].forEach(hang => {
            taoTheHang(hang, nhomDiv);
        });

        nhomKhoi.appendChild(nhomDiv);
        ds.appendChild(nhomKhoi);
    }
}

// === TẠO THẺ HÀNG HÓA ===
function taoTheHang(hang, nhomDiv) {
    const card = document.createElement('div');
    card.className = 'card';
    card.dataset.nhom = hang.nhom;
    card.dataset.ten = hang.ten.toLowerCase();
    card.dataset.id = hang.id;

    const urlAnh = hang.anhAPI || ('images/' + hang.id + '.jpg');
    const giaDinh = hang.gia.toLocaleString('vi-VN') + ' đ';

    card.innerHTML = `
        <img src="${urlAnh}" alt="${hang.ten}">
        <span class="no-img">Không có ảnh<br>images/${hang.id}.jpg</span>
        <div class="name">${hang.ten}</div>
        <div class="info">Mã: ${hang.id}</div>
        <div class="info">Tồn: ${hang.slTon}</div>
        <div class="gia">${giaDinh}</div>
        <div class="info ban">Đã bán: <span class="sl-ban">${hang.slDaBan}</span></div>
        <button class="mua-btn">✅ Bán hàng</button>
    `;
    nhomDiv.appendChild(card);

    const img = card.querySelector('img');
    img.onerror = function() {
        if (!hang.anhAPI) {
            this.style.display = 'none';
            card.querySelector('.no-img').style.display = 'block';
        }
    };

    card.querySelector('.mua-btn').onclick = function() {
        hang.slDaBan += 1;
        hang.slTon = Math.max(0, hang.slTon - 1);
        card.querySelector('.sl-ban').textContent = hang.slDaBan;
        card.querySelector('.info:nth-child(5)').innerHTML = `Tồn: ${hang.slTon}`;
        luuDaBan(hang.id, hang.slDaBan);
        document.getElementById('trangThai').textContent = '💾 Đã lưu: ' + hang.ten;
    };
}

// === SỰ KIỆN LỌC ===
document.getElementById('timKiem').addEventListener('input', locTheoNhom);
document.getElementById('chonNhom').addEventListener('change', locTheoNhom);

// === XÓA HIỂN THỊ ===
function xoaTatCa() {
    document.getElementById('danhSach').innerHTML = '';
    document.getElementById('timKiem').value = '';
    document.getElementById('chonNhom').innerHTML = '<option value="*">📋 TẤT CẢ NHÓM</option>';
    document.getElementById('trangThai').textContent = '';
    tatCaMatHang = [];
}
