import moment from 'moment';
import orderApi from '../api/orderApi';
import { toast } from '../utils/toast';
import {
  convertCurrency,
  getLocalStorage,
  isAccessAction,
  renderLoadingManager,
} from '../utils/constains';
import customerApi from '../api/customerApi';
import guaranteeApi from '../api/guaranteeApi';
import productApi from '../api/productApi';

function initSellOrder() {
  const now = new Date();
  const date = new Date();

  date.setMonth(date.getMonth() - 1);

  $('input[name="sell-order-daterange"]').val(
    `${moment(date).format('L')} - ${moment(now).format('L')}`
  );

  const from = Math.floor(date.getTime() / 1000);
  const to = Math.floor(now.getTime() / 1000);

  renderSellOrder(from, to);
}

export async function renderSellOrder(from, to) {
  try {
    const sellOrderList = await orderApi.getAll({
      from,
      to,
    });

    const sellOrderHTML = sellOrderList.map((order) => {
      let status;

      switch (order['trang_thai']) {
        case 'chờ xử lý':
          status = 'wait';
          break;
        case 'hoàn thành':
          status = 'completed';
          break;
        case 'đang giao hàng':
          status = 'shipping';
          break;
        case 'đã hủy':
          status = 'canceled';
          break;
      }

      return `
        <tr align="center">
          <td>
            ${order['ma_don_hang']}
          </td>
          <td>
            <span
              class="sell-order-status ${status}"
              data-id="${order['ma_don_hang']}"
              data-value="${order['trang_thai']}"
            >
              ${order['trang_thai']}
            </span>
          </td>
          <td>
            <span class="sell-order-time">
              ${moment(order['thoi_gian_dat_mua'] * 1000).format('L')}
            </span>
          </td>
          <td>
            <i class="fa-solid fa-pen-to-square admin-action edit"
              data-id="${order['ma_don_hang']}"
            >
            </i>
          </td>
        </tr>
      `;
    });

    $('.sell-order-content').html(sellOrderHTML);

    $('.sell-order-status').click((e) => {
      if (!isAccessAction('orders', 'UPDATE')) return;

      if (e.target.dataset.value === 'hoàn thành' || e.target.dataset.value === 'đã hủy') return;

      $('#statusModal').modal('show');
      $('#statusModal').attr('data-id', e.target.dataset.id);
    });

    $('.sell-order .admin-action.edit').click(async (e) => {
      $('#viewmoreSellOrderModal').modal('show');
      $('#viewmoreSellOrderModal').attr('data-id', e.target.dataset.id);
      await handleUpdateOrder(e.target.dataset.id);
    });
  } catch (error) {
    console.log(error.message);
  }
}

$('.modal-status .sell-order-status').click(async (e) => {
  if (!isAccessAction('orders', 'UPDATE')) return;

  try {
    const value = e.target.dataset.value;
    const id = $('#statusModal').attr('data-id');

    await orderApi.update({
      ma_don_hang: id,
      trang_thai: value,
    });

    renderSellOrder();

    const data = await orderApi.getById(id);

    const productList = data['danh_sach_san_pham_da_mua'];

    const userId = data['ma_khach_hang'];
    const { userId: employeeId } = getLocalStorage('user');

    if (value === 'hoàn thành') {
      const now = new Date();

      await orderApi.update({
        ma_don_hang: id,
        ma_nhan_vien: employeeId,
      });

      productList.forEach(async (product) => {
        const expire = new Date();

        expire.setMonth(expire.getMonth() + product['thoi_gian_bao_hanh']);

        await guaranteeApi.add({
          ma_chi_tiet_san_pham: product['ma_chi_tiet_san_pham'],
          ma_khach_hang: userId,
          ngay_lap: now.getTime(),
          ngay_het_han: expire.getTime(),
        });

        const data = await productApi.getById(product['ma_san_pham']);

        await productApi.update({
          ma_san_pham: product['ma_san_pham'],
          so_luong_da_ban: data['so_luong_da_ban'] + product['so_luong_da_mua'],
        });
      });
    }

    toast({
      type: 'success',
      title: 'Thay đổi trạng thái thành công',
      duration: 2000,
    });
  } catch (error) {
    toast({
      type: 'error',
      title: 'Thay đổi trạng thái không thành công',
      duration: 2000,
    });
  } finally {
    $('#statusModal').modal('hide');
  }
});

async function handleUpdateOrder(id) {
  try {
    $('#viewmoreSellOrderModal').attr('data-id', id);
    $('#viewmoreSellOrderModal').modal('show');

    const order = await orderApi.getById(id);

    const customer = await customerApi.getById(order['ma_khach_hang']);

    $('#fullname').val(customer['ten_khach_hang']);
    $('#phone').val(customer['so_dien_thoai']);
    $('#address').val(customer['dia_chi']);
    $('#pay-method').val(order['hinh_thuc_thanh_toan']);

    const productListHMTL = order['danh_sach_san_pham_da_mua'].map((product) => {
      let price, newPrice, oldPrice;

      oldPrice = convertCurrency(product['don_gia']);

      if (product['giam_gia_san_pham']) {
        newPrice = product['don_gia'] - (product['don_gia'] * product['giam_gia_san_pham']) / 100;
        newPrice = convertCurrency(newPrice);

        price = `
            <p class="product-new-price">${newPrice} x ${product['so_luong_da_mua']}</p>
            <div class="product-sale">
              <s class="product-old-price">${oldPrice}</s>
              <p class="product-percent">-${product['giam_gia_san_pham']}%</p>
            </div>
          `;
      } else {
        price = `<p class="product-new-price">${oldPrice} x ${product['so_luong_da_mua']}</p>`;
      }

      return `
          <div class="product-item">
            <div class="product-info">
              <div class="product-img">
                <img
                  src="http://localhost:80/ecommerce-api/images/${product['hinh_anh']}"
                  alt="${product['ten_san_pham']}"
                />
              </div>
              <div class="product-content">
                <a href="./product-detail.html?id=${product['ma_san_pham']}" class="product-title">${product['ten_san_pham']}</a>
                ${price}
              </div>
            </div>
          </div>
        `;
    });

    $('#viewmoreSellOrderModal .product-list').html(productListHMTL);
    $('#viewmoreSellOrderModal .order-time span').html(
      moment(order['thoi_gian_dat_mua'] * 1000).format('L')
    );

    let status;
    switch (order['trang_thai']) {
      case 'chờ xử lý':
        status = 'waiting';
        break;
      case 'đang giao hàng':
        status = 'shipping';
        break;
      case 'hoàn thành':
        status = 'completed';
        break;
      case 'đã hủy':
        status = 'canceled';
        break;
    }
    $('.order-status').html(`
      Trạng thái: <span class="${status}">${order['trang_thai']}</span>
    `);

    let totalPay = convertCurrency(order['tong_tien']);

    $('#viewmoreSellOrderModal .order-total-price span').html(totalPay);
  } catch (error) {
    console.log(error.message);
  }
}

export function renderOrderPage() {
  const loadingHTML = renderLoadingManager(18, 4);

  $('.admin-content').html(`
    <div class="sell-order">
      <div class="sell-order-header">
        <h1>Đơn hàng</h1>
        <input type="text" name="sell-order-daterange" value="" />
      </div>
      <div class="sell-order-table-container">
        <table class="sell-order-table">
          <thead>
            <tr align="center">
              <th>Mã đơn hàng</th>
              <th>Trạng thái</th>
              <th>Thời gian</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody class="sell-order-content">
            ${loadingHTML}
          </tbody>
        </table>
      </div>
    </div>
  `);

  initSellOrder();
  renderSellOrder();

  $('input[name="sell-order-daterange"]').daterangepicker(
    {
      opens: 'left',
    },
    async function (start, end, label) {
      let s = new Date(start.format());
      let e = new Date(end.format());

      s = s.getTime() / 1000;
      e = e.getTime() / 1000;

      renderSellOrder(s, e);
    }
  );
}
