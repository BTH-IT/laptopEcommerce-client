import orderApi from '../api/orderApi';
import productApi from '../api/productApi';
import { convertCurrency } from '../utils/constains';
import { toast } from '../utils/toast';

let urlParams = new URLSearchParams(window.location.search);
let url = window.location.href;

async function getAllOrderWithQuery(query) {
  try {
    return await orderApi.getAllWithQuery(query);
  } catch (error) {
    console.error(error);
  }
}

async function updateOrder(data) {
  try {
    await orderApi.update(data);
  } catch (error) {
    console.error(error);
  }
}

$(function () {
  $('input[name="dates"]').daterangepicker(
    {
      opens: 'left',
      locale: {
        format: 'DD/MM/YYYY',
        language: 'vn',
      },
    },
    function (start, end, label) {
      urlParams.set('from', start._d.getTime());
      urlParams.set('to', end._d.getTime());

      let newUrl = url.split('?')[0] + '?' + urlParams.toString();
      window.history.replaceState({}, '', newUrl);

      renderHistory();
    }
  );
});

$('.btn-method').on('click', (e) => {
  $('#detail').modal('hide');
  if ($('.btn-method').data('preMethod') !== $('.btn-method').data('method')) {
    $('.btn-change-method').data('ma_don_hang', e.currentTarget.id);
    $('.btn-change-method').data('method', $('.btn-method').data('method'));
    $('#change-method').modal('show');
  }
});

$('.btn-method-cancel').on('click', () => {
  $('#detail').modal('show');
});

$('.btn-cancel').on('click', (e) => {
  $('#detail').modal('hide');
  $('.btn-cancel-order').data('ma_don_hang', e.currentTarget.id);
  $('#cancel-order').modal('show');
});

$('.btn-change-method').on('click', ChangeMethodHandler);
$('.btn-cancel-order').on('click', CancelOrderHandler);

async function ChangeMethodHandler() {
  let orderID = parseInt($(this).data('ma_don_hang'));
  let method = $(this).data('method');

  let order = {
    ma_don_hang: orderID,
    hinh_thuc_thanh_toan: method,
  };

  await updateOrder(order);

  $('#change-method').modal('hide');

  renderHistory();

  toast({
    title: 'Thành công',
    message: `Đã đổi phương thức thanh toán của đơn hàng ${orderID} thành "${
      method === 'prepaid' ? 'Trả trước' : 'Trả sau'
    }"`,
    type: 'success',
    duration: 4000,
  });
}

async function CancelOrderHandler() {
  let orderID = parseInt($(this).data('ma_don_hang'));

  let order = {
    ma_don_hang: orderID,
    trang_thai: 'Đã huỷ',
  };

  await updateOrder(order);

  $('#cancel-order').modal('hide');

  renderHistory();

  toast({
    title: 'Thành công',
    message: `Đã huỷ thành công đơn hàng ${orderID}`,
    type: 'success',
    duration: 4000,
  });
}

$('.history__menu-item').on('click', (e) => {
  let newUrl = '';
  let order_type = e.currentTarget.id;

  urlParams.set('order_type', order_type);
  newUrl = url.split('?')[0] + '?' + urlParams.toString();
  window.history.replaceState({}, '', newUrl);

  // switch (e.currentTarget.id) {
  //   case 'all':
  //     urlParams.set('order_type', 'all');
  //     newUrl = url.split('?')[0] + '?' + urlParams.toString();
  //     window.history.replaceState({}, '', newUrl);
  //     break;

  //   case 'waiting':
  //     urlParams.set('order_type', 'waiting');
  //     newUrl = url.split('?')[0] + '?' + urlParams.toString();
  //     window.history.replaceState({}, '', newUrl);
  //     break;

  //   case '3':
  //     urlParams.set('order_type', 'shipping');
  //     newUrl = url.split('?')[0] + '?' + urlParams.toString();
  //     window.history.replaceState({}, '', newUrl);
  //     break;

  //   case '4':
  //     urlParams.set('order_type', 'completed');
  //     newUrl = url.split('?')[0] + '?' + urlParams.toString();
  //     window.history.replaceState({}, '', newUrl);
  //     break;

  //   case '5':
  //     urlParams.set('order_type', 'canceled');
  //     newUrl = url.split('?')[0] + '?' + urlParams.toString();
  //     window.history.replaceState({}, '', newUrl);
  //     break;

  //   default:
  //     urlParams.set('order_type', 'all');
  //     newUrl = url.split('?')[0] + '?' + urlParams.toString();
  //     window.history.replaceState({}, '', newUrl);
  //     break;
  // }

  renderHistory();
});

function convertSatus(status) {
  if (status === 'Chờ xử lý') {
    return 'waiting';
  } else if (status === 'Đang giao') {
    return 'shipping';
  } else if (status === 'Hoàn thành') {
    return 'completed';
  } else if (status === 'Đã huỷ') {
    return 'canceled';
  }
}

async function renderHistory() {
  let htmlString = ``;
  let order_type = urlParams.get('order_type') || 'all';
  let start = parseInt(urlParams.get('from'));
  let end = parseInt(urlParams.get('to'));
  let query = {};

  if (!isNaN(start) && !isNaN(end) && start <= end) {
    query = {
      order_type: order_type,
      start: start,
      end: end,
    };
  } else {
    query = { order_type: order_type };
  }

  console.log(JSON.stringify(query))

  let data = await getAllOrderWithQuery(query);
  console.log(data);

  $('.history__menu-item.active').removeClass('active');
  $(`.history__menu-item#${order_type}`).addClass('active');

  if (data.length == 0) {
    $('.history__table-body').html(``);
  } else {
    data.forEach((item, idx) => {
      let totalMoney = 0;

      item.danh_sach_san_pham_da_mua.forEach((data) => {
        totalMoney +=
          ((data.don_gia * (100 - data.giam_gia_san_pham)) / 100) * data.so_luong_da_mua;
      });

      htmlString += `
          <tr>
          <td class="history__table-body-item">${item.ma_don_hang}</td>
          <td class="history__table-body-item">
            <span class="paid-item ${item.hinh_thuc_thanh_toan}">${
        item.hinh_thuc_thanh_toan === 'postpaid' ? 'Trả sau' : 'Trả trước'
      }</span>
          </td>
          <td class="history__table-body-item">${moment(item.thoi_gian_dat_mua)
            .utc()
            .format('DD/MM/YYYY')
            .replace(/ /g, '/')}</td>
          <td class="history__table-body-item">
            <span class="price-item">${convertCurrency(totalMoney)}</span>
          </td>
          <td class="history__table-body-item">
            <span class="status-item ${convertSatus(item.trang_thai)}">${item.trang_thai}</span>
          </td>
          <td class="history__table-body-item">
            <span class="info-item" id="${item.ma_don_hang}">
              <i class="fa-solid fa-circle-info"></i>
            </span>
          </td>
          </tr>`;

      $('.history__table-body').html(htmlString);
    });
  }

  $('.info-item').on('click', (e) => {
    let id = e.currentTarget.id;
    detailHandler(data, id);
  });
}

function detailHandler(data, id) {
  $('#detail').modal('show');

  let filteredData = data.filter((item) => {
    return item.ma_don_hang == id;
  });

  let method = filteredData[0].hinh_thuc_thanh_toan;
  let status = filteredData[0].trang_thai;
  let purchaseDate = moment(filteredData[0].thoi_gian_dat_mua).utc().format('DD/MM/YYYY');
  let purchasedProduct = filteredData[0].danh_sach_san_pham_da_mua;

  $('#Paid').val(method);

  if (status === 'Chờ xử lý') {
    $('#Paid').attr('disabled', false);
    $('.btn-cancel').attr('id', id);
    $('.btn-cancel').attr('disabled', false);

    $('#Paid').on('change', () => {
      $('.btn-method').attr('id', id);
      $('.btn-method').data('preMethod', method);
      $('.btn-method').data('method', $('#Paid').val());
      $('.btn-method').attr('disabled', false);
    });
  } else {
    $('#Paid').attr('disabled', true);
    $('.btn-method').attr('disabled', true);
    $('.btn-cancel').attr('disabled', true);
  }
  $('.detail-info_date').text(purchaseDate.replace(/ /g, '/'));
  $(`.detail-info_status`).text('');
  $(`.detail-info_status.${convertSatus(status)}`).text(status);

  renderHistoryProducts(purchasedProduct);
}

function renderHistoryProducts(data) {
  let htmlString = '';
  let totalMoney = 0;

  data.forEach((item) => {
    totalMoney += ((item.don_gia * (100 - item.giam_gia_san_pham)) / 100) * item.so_luong_da_mua;

    htmlString += `
    <li class="detail-info_paid-item">
      <div class="paid-item_container container">
        <div class="paid-item_row row">
          <div class="col-4">
            <div class="paid-item_img-container">
              <img class="paid-item_img" src="http://localhost:80/laptopEcommerce-server/images/${
                item.hinh_anh[0]
              }" alt="" width="70px" height="70px">
            </div>
          </div>
          <div class="col-8">
            <div class="paid-item_info">
              <div class="paid-item_name">${item.ten_san_pham}</div>
              <span class="paid-item_price">${convertCurrency(
                (item.don_gia * (100 - item.giam_gia_san_pham)) / 100
              )}</span>
              <span class="paid-item_amount"> x${item.so_luong_da_mua}</span><br>
              <span class="paid-item_cost">${convertCurrency(item.don_gia)}</span>
              <span class="paid-item_discount">-${item.giam_gia_san_pham}%</span>
            </div>
          </div>
        </div>
      </div>
    </li>`;
  });

  $('.detail-info_paid-list').html(htmlString);
  $('.detail-info_total-money').text(convertCurrency(totalMoney));
}

renderHistory();
