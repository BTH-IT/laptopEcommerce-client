const params = new URLSearchParams(window.location.search);

const port = 80;

const productID = parseInt(params.get('id'));

const similarProduct = 15;

function renderProductDetail() {
  $.get({
    url: `http://localhost:${port}/laptopEcommerce-server/index.php/products/${productID}`,
    dataType: 'json',
    success: function (data) {
      if (parseInt(data.hien_thi) == 0) {
      }
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

      $(function () {
        $('.product__info').html(productSection);
        $('.product__detail-description').text(detailString);
        $('.product__detail-table').html(detailSection);
      });
    },
    error: function (xhr, status, error) {
      console.log('Error:', error);
    },
  });
  console.log("renderdone");
}

function renderSimilarProduct() {
  $.get({
    url: `http://localhost:${port}/laptopEcommerce-server/index.php/products`,
    dataType: 'json',
    success: function (data) {
      let jsonLength = Object.keys(data['data']).length;
      let nextProductID = productID;
      similarProductCard = ``;
      for (let i = 1; i <= similarProduct; i++) {
        if (nextProductID++ >= jsonLength) {
          nextProductID = 1;
        }

        let saveMoney =
          (data['data'][productID - 1].gia_goc * (100 - data['data'][productID - 1].giam_gia)) /
            100 -
          (data['data'][nextProductID - 1].gia_goc *
            (100 - data['data'][nextProductID - 1].giam_gia)) /
            100;
        similarProductCard += `
      <a href="http://localhost:5173/product-detail.html?id=${data['data'][nextProductID - 1].ma_san_pham}">
        <div class="product-card-container">
          <div class="product-card-img">
            <img src="Laptop.webp" alt="">
          </div>
          <div class="product-card-name">${data['data'][nextProductID - 1].ten_san_pham}</div>
          <div class="product-card-price">${(
            (data['data'][nextProductID - 1].gia_goc *
              (100 - data['data'][nextProductID - 1].giam_gia)) /
            100
          ).toLocaleString('vi-VN')} VND</div>
          <div class="product-card-cost">${data['data'][nextProductID - 1].gia_goc.toLocaleString(
            'vi-VN'
          )}</div>
          <div class="product-card-save">
            <span>Save</span>
            <span class="product-card-save_money">${(saveMoney > 0 ? saveMoney : 0).toLocaleString(
              'vi-VN',
              { maximumSignificantDigits: 3 }
            )} VND</span>
          </div>
        </div>
      </a>`;
      }

      $(function () {
        $('.product-slider').slick('slickAdd', similarProductCard);
      });
    },
    error: function (xhr, status, error) {
      console.log('Error:', error);
    },
  });
}

renderProductDetail();

console.log("afterrenderdone");


renderSimilarProduct();

$('.similar-product-title').on('click', function () {
  // console.log($(this).attr("id"));
  alert(1);
});

$('.similar-product-title').click(function (e) { 
  e.preventDefault();
  alert(1);
});
console.log($('.buy-btn')[0]);