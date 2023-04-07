import orderApi from '../api/orderApi';
import { convertCurrency } from '../utils/constains';
import { validation } from '../utils/validation';
import { toast } from '../utils/toast';

const port = 80;

let htmlString = ``;

let CartList;

$('h4').on('click', function () {
  
  toast({
    title: 'Thành công',
    message: 'Cảm ơn bạn đã mua hàng',
    type: 'success',
    duration: 1000000,
  });
});


async function createOrder(data) {
  try {
    await orderApi.add(data);
  } catch (error) {
    console.error(error);
  }
}

$('.btn-delete-all').on('click', deteleAllBtnHandler);

$('.btn-delete').on('click', deteleBtnHandler);

$('.btn-purchase').on('click', purchaseBtnHandler);

$('.delete').on('click', () => {
  $('#delete-all').modal('show');
});

$('.purchase-btn').on('click', () => {
  $('#Name').val('Huy');
  $('#Tel').val('0905123456');
  $('#Address').val('2, Do Quang H, Q.1, TP.K');

  $('#purchase').modal('show');
});

function renderCartList() {
  CartList = JSON.parse(localStorage.getItem('CartList'));
  if (CartList.length > 0) {
    CartList.forEach((item, idx) => {
      let htmlString = `
        <tr class="table-body_row" id=${idx + 1}>
            <td class="table-body_item">${idx + 1}</td>
            <td class="table-body_item">
          <a class="product-link" href="http://localhost:5173/product-detail.html?id=${item.ma_san_pham}">
              <div class="product-container">
                  <div class="product-img_container">
                      <img class="product-img" src="${item.hinh_anh}" alt="" width="80px"
                          height="80px">
                  </div>
                  <div class="product-name_container">
                      <span class="product-name">${item.ten_san_pham}</span>
                  </div>
              </div>
          </a>
            </td>
            <td class="table-body_item">
              <div class="product-price_container">
                <div class="product-price">${convertCurrency(
                  (item.gia_goc * (100 - item.giam_gia)) / 100
                )}</div>
                <div class="product-cost">${convertCurrency(item.gia_goc)}</div>
              </div>
            </td>
            <td class="table-body_item">
              <div class="product-amount_container">
                  <button class="product-amount_minus" id="${idx + 1}" ${
        item.so_luong == 1 ? 'disabled' : ''
      }>-</button>
                  <input class = "amount-${
                    idx + 1
                  }" type="number" name="amount" id="amount" min="1" value="${item.so_luong}">
                  <button class="product-amount_plus" id="${idx + 1}">+</button>
              </div>
              <div class="delete-product" id=${item.ma_san_pham}>Xoá</div>
            </td>
        </tr>`;

      $('.table-body').append(htmlString);
    });
    $('.product-amount_minus').on('click', minusBtnHandler);
    $('.product-amount_plus').on('click', plusBtnHandler);
    $('.delete-product').on('click', (e) => {
      $('#delete-product').modal('show');
      let ID = e.target.id;
      $('.btn-delete').attr('id', ID);
    });
  }
}

function renderTotal() {
  CartList = JSON.parse(localStorage.getItem('CartList'));
  let total = 0;

  if (CartList.length > 0) {
    CartList.forEach((item, idx) => {
      total += ((item.gia_goc * (100 - item.giam_gia)) / 100) * item.so_luong;
    });
  } else {
    $('.purchase-btn').attr('disabled', true);
  }
  $('.pre-price, .total-price').text(total.toLocaleString('vi-VN') + ' VND');
}

function minusBtnHandler() {
  let val = parseInt($(`.amount-${this.id}`).val());
  if (val > 2) {
    $(`.amount-${this.id}`).val(val - 1);
  } else {
    $(`.amount-${this.id}`).val(val - 1);
    $(`button[id=${this.id}][class="product-amount_minus"]`).attr('disabled', true);
  }

  CartList[this.id - 1].so_luong = val - 1;
  localStorage.setItem('CartList', JSON.stringify(CartList));

  renderTotal();
}

function plusBtnHandler() {
  let val = parseInt($(`.amount-${this.id}`).val());
  if (val == 1) {
    $(`button[id=${this.id}][class="product-amount_minus"]`).attr('disabled', false);
  }
  $(`.amount-${this.id}`).val(val + 1);

  CartList[this.id - 1].so_luong = val + 1;
  localStorage.setItem('CartList', JSON.stringify(CartList));

  renderTotal();
}

function deteleBtnHandler() {
  let deleteID = parseInt(this.id);
  let tmp = CartList.filter((item) => item.ma_san_pham !== deleteID);
  CartList = tmp;
  localStorage.setItem('CartList', JSON.stringify(CartList));
  $('.table-body').children().remove();
  $('#delete-product').modal('hide');
  renderCartList();

  renderTotal();
}

function deteleAllBtnHandler() {
  localStorage.setItem('CartList', JSON.stringify([]));
  $('.table-body').children().remove();
  $('#delete-all').modal('hide');

  renderTotal();
}

async function purchaseBtnHandler(e) {
  let mes = validation($('#Paid')[0]);
  if (!mes) {
    let method = $('#Paid').val();
    let List = JSON.parse(localStorage.getItem('CartList'));
    let PurchaseList = [];

    List.forEach((item) => {
      let PurchaseItem = {
        ma_san_pham: item.ma_san_pham,
        ten_san_pham: item.ten_san_pham,
        don_gia: (item.gia_goc * (100 - item.giam_gia)) / 100,
        giam_gia_san_pham: item.giam_gia,
        so_luong_da_mua: item.so_luong,
      };

      PurchaseList.push(PurchaseItem);
    });

    let Order = {
      ma_khach_hang: 'bttan',
      ma_nhan_vien: '',
      trang_thai: '',
      hinh_thuc_thanh_toan: method,
      thoi_gian_dat_mua: parseInt(new Date().getTime()),
      danh_sach_san_pham_da_mua: PurchaseList,
    };

    // console.log(JSON.stringify(Order));

    createOrder(Order);

    $('.table-body').children().remove();
    $('#purchase').modal('hide');
    localStorage.setItem('CartList', JSON.stringify([]));
    renderTotal();

    toast({
      title: 'Thành công',
      message: 'Cảm ơn bạn đã mua hàng',
      type: 'success',
      duration: 1000,
    });
  }
}
renderCartList();

renderTotal();
