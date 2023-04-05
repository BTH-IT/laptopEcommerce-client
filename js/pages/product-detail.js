import productApi from '../api/productApi';

const params = new URLSearchParams(window.location.search);

const port = 80;

const productID = parseInt(params.get('id'));

const similarProduct = 15;

let amount;

async function getDatabyID(id) {
  try {
    return await productApi.getById(id);
  } catch (error) {
    console.error(error);
  }
}

async function getAllData() {
  try {
    return await productApi.getAll();
  } catch (error) {
    console.error(error);
  }
}

async function renderProductDetail() {
  let req = getDatabyID(productID);
  req.then(function (data) {
    amount = data.so_luong;
    let productSection = `
      <div class="product__info-row row" id="${data.ma_san_pham}">
        <div class="product__info-img_container col-lg-3">
          <div class="product__info-img_main-img"><img src="${data.hinh_anh[0]}" alt=""></div>
          <div class="product__info-img_sub-img">
            <img src="${data.hinh_anh[0]}" alt="" width="50px" height="50px">
            <img src="${data.hinh_anh[1]}" alt="" width="50px" height="50px">
          </div>
        </div>
        <div class="product__info-container col-lg">
          ${
            data.so_luong > 0
              ? `<div class="product__info-status">CÒN HÀNG</div>`
              : `<div class="product__info-status empty">HẾT HÀNG</div>`
          }
          <div class="product__info-name">${data.ten_san_pham}</div>
          <div class="product__info-brand">Thương hiệu ${
            data.thuong_hieu
          } | Mã sản phẩm: ${productID}</div>
          <div class="product__info-price_container">
            <div class="product__info-price">${(
              (data.gia_goc * (100 - data.giam_gia)) /
              100
            ).toLocaleString('vi-VN')} VND</div>
            <div class="product__info-cost_container">
              <span class="product__info-cost">${data.gia_goc.toLocaleString('vi-VN')} VND</span>
              <span class="product__info-discount">-${data.giam_gia}%</span>
            </div>
          </div>
          <div class="container p-0">
            <div class="product__info-btn_container row">
              <button type="button" class="buy-btn col-md-4">MUA NGAY</button>
              <button type="button" class="addToCart-btn col-md">THÊM VÀO GIỎ HÀNG</button>
            </div>
          </div>
        </div>
      </div>`;

    let detailString = data.mo_ta_san_pham;

    let detailSection = `
      <tr>
        <td>Thương hiệu</td>
        <td>${data.thuong_hieu}</td>
      </tr>
      <tr>
        <td>Bảo hành</td>
        <td>${data.bao_hanh}</td>
      </tr>
      <tr>
        <td>Series laptop</td>
        <td>${data.series_laptop}</td>
      </tr>
      <tr>
        <td>Màu sắc</td>
        <td>${data.mau_sac}</td>
      </tr>
      <tr>
        <td>Thế hệ CPU</td>
        <td>${data.the_he_cpu}</td>
      </tr>
      <tr>
        <td>CPU</td>
        <td>${data.cpu}</td>
      </tr>
      <tr>
        <td>Chip đồ họa</td>
        <td>${data.chip_do_hoa_roi}</td>
      </tr>
      <tr>
        <td>RAM</td>
        <td>${data.ten_ram}</td>
      </tr>
      <tr>
        <td>Màn hình</td>
        <td>${data.man_hinh}</td>
      </tr>
      <tr>
        <td>Lưu trữ</td>
        <td>${data.luu_tru}</td>
      </tr>
      <tr>
        <td>Số cổng lưu trữ tối đa</td>
        <td>${data.so_cong_luu_tru_toi_da}</td>
      </tr>
      <tr>
        <td>Kiểu khe M.2 hỗ trợ</td>
        <td>${data.kieu_khe_m2_ho_tro}</td>
      </tr>
      <tr>
        <td>Cổng xuất hình</td>
        <td>${data.cong_xuat_hinh}</td>
      </tr>
      <tr>
        <td>Cổng kết nối</td>
        <td>${data.cong_ket_noi}</td>
      </tr>
      <tr>
        <td>Kết nối không dây</td>
        <td>${data.ket_noi_khong_day}</td>
      </tr>
      <tr>
        <td>Bàn phím</td>
        <td>${data.ban_phim}</td>
      </tr>
      <tr>
        <td>Hệ điều hành</td>
        <td>${data.he_dieu_hanh}</td>
      </tr>
      <tr>
        <td>Kích thước</td>
        <td>${data.kich_thuoc}</td>
      </tr>
      <tr>
        <td>Pin</td>
        <td>${data.pin}</td>
      </tr>
      <tr>
        <td>Khối lượng</td>
        <td>${data.khoi_luong}</td>
      </tr>
      <tr>
        <td>Đèn LED trên máy</td>
        <td>${data.den_led === null ? 'Không' : data.den_led}</td>
      </tr>
      <tr>
        <td>Màn hình cảm ứng</td>
        <td>${data.man_hinh_cam_ung ? data.man_hinh_cam_ung : 'Không'}</td>
      </tr>`;

    $('.product__info').html(productSection);
    $('.product__detail-description').text(detailString);
    $('.product__detail-table').html(detailSection);
    if (data.so_luong <= 0) {
      $('.buy-btn').attr("disabled", true);
      $('.addToCart-btn').attr("disabled", true);
    } 
    else {
      $('.buy-btn').on('click', BuyBtnHandler);
      $('.addToCart-btn').on('click', AddToCartBtnHandler);
    }
  });
}

async function renderSimilarProduct() {
  let req = getAllData();
  req.then(function (data) {
    let jsonLength = Object.keys(data['data']).length - 1;
    let productIdx = data['data'].findIndex((item) => item.ma_san_pham === productID);
    let nextProductID = productID;
    let similarProductCard = ``;
    let nextProductIdx = productIdx;

    for (let i = 1; i <= similarProduct; i++) {
      nextProductIdx++;
      if (nextProductIdx > jsonLength) {
        nextProductIdx = 0;
      }

      let saveMoney =
        (data['data'][productIdx].gia_goc * (100 - data['data'][productIdx].giam_gia)) / 100 -
        (data['data'][nextProductIdx].gia_goc * (100 - data['data'][nextProductIdx].giam_gia)) /
          100;
      similarProductCard += `
        <a href="http://localhost:5173/product-detail.html?id=${
          data['data'][nextProductIdx].ma_san_pham
        }">
          <div class="product-card-container">
            <div class="product-card-img">
              <img src="Laptop.webp" alt="">
            </div>
            <div class="product-card-name">${data['data'][nextProductIdx].ten_san_pham}</div>
            <div class="product-card-price">${(
              (data['data'][nextProductIdx].gia_goc *
                (100 - data['data'][nextProductIdx].giam_gia)) /
              100
            ).toLocaleString('vi-VN')} VND</div>
            <div class="product-card-cost">${data['data'][nextProductIdx].gia_goc.toLocaleString(
              'vi-VN'
            )}</div>
            <div class="product-card-save">
              <span>Save</span>
              <span class="product-card-save_money">${(saveMoney > 0
                ? saveMoney
                : 0
              ).toLocaleString('vi-VN', { maximumSignificantDigits: 3 })} VND</span>
            </div>
          </div>
        </a>`;
    }

    $('.product-slider').slick('slickAdd', similarProductCard);
  });
}

function BuyBtnHandler() {
  let CartList = JSON.parse(localStorage.getItem('CartList'));
  if (!CartList) {
    let CartItem = [{ productID: productID, amount: 1 }];
    localStorage.setItem('CartList', JSON.stringify(CartItem));
  } else {
    localStorage.removeItem('CartList');
    let found = false;

    CartList.forEach((item) => {
      if (item.productID === productID) {
        item.amount++;
        found = true;
      }
    });

    if (!found) {
      let CartItem = { productID: productID, amount: 1 };
      CartList.push(CartItem);
    }

    localStorage.setItem('CartList', JSON.stringify(CartList));
  }

  let CartURL = window.location.protocol + "//" + window.location.hostname + ":5173/cart.html";
  window.location.href  = CartURL;
}

function AddToCartBtnHandler() {
  let CartList = JSON.parse(localStorage.getItem('CartList'));
  if (!CartList) {
    let CartItem = [{ productID: productID, amount: 1 }];
    localStorage.setItem('CartList', JSON.stringify(CartItem));
  } else {
    localStorage.removeItem('CartList');
    let found = false;

    CartList.forEach((item) => {
      if (item.productID === productID) {
        item.amount++;
        found = true;
      }
    });

    if (!found) {
      let CartItem = { productID: productID, amount: 1 };
      CartList.push(CartItem);
    }

    localStorage.setItem('CartList', JSON.stringify(CartList));
  }
}

await renderProductDetail();

await renderSimilarProduct();
