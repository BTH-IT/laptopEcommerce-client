import moment from 'moment';
import { toast } from '../utils/toast';
import { convertCurrency, isAccessAction, renderLoadingManager } from '../utils/constains';
import importOrderApi from '../api/importOrderApi';

function initImportOrder() {
  const now = new Date();
  const date = new Date();

  date.setMonth(date.getMonth() - 1);

  $('input[name="import-order-daterange"]').val(
    `${moment(date).format('L')} - ${moment(now).format('L')}`
  );

  const from = Math.floor(date.getTime() / 1000);
  const to = Math.floor(now.getTime() / 1000);

  renderImportOrder(from, to);
}

export async function renderImportOrder(from, to) {
  try {
    const importOrderList = await importOrderApi.getAll({
      from,
      to,
    });

    const importOrderHTML = importOrderList.map((order) => {
      return `
        <tr align="center">
          <td>
            ${order['ma_phieu_nhap']}
          </td>
          <td>
            <span class="import-order-time">
              ${moment(order['ngay_lap']).format('L')}
            </span>
          </td>
          <td>
            <div class="d-flex justify-content-center align-items-center gap-2">
              <i class="fa-solid fa-pen-to-square admin-action view" data-id="${
                order['ma_phieu_nhap']
              }"></i>
              <i class="fa-solid fa-trash admin-action remove text-danger" data-id="${
                order['ma_phieu_nhap']
              }"></i>
            </div>
          </td>
        </tr>
      `;
    });

    $('.import-order-content').html(importOrderHTML);

    $('.import-order .admin-action.view').click(async (e) => {
      if (!isAccessAction('import-orders', 'READ')) return;
      $('#viewmoreImportOrderModal').modal('show');
      $('#viewmoreImportOrderModal').attr('data-id', e.target.dataset.id);
      await handleViewOrder(e.target.dataset.id);
    });

    $('.import-order .admin-action.remove').click(async (e) => {
      if (!isAccessAction('import-orders', 'DELETE')) return;
      $('#deleteImportOrderModal').modal('show');
      $('#deleteImportOrderModal').attr('data-id', e.target.dataset.id);
    });
  } catch (error) {
    console.log(error.message);
  }
}

async function handleViewOrder(id) {
  try {
    $('#viewmoreImportOrderModal').attr('data-id', id);
    $('#viewmoreImportOrderModal').modal('show');

    const importOrder = await importOrderApi.getById(id);

    $('#employee-import-order').val(importOrder['ma_nhan_vien']);
    $('#supplier-import-order').val(importOrder['ma_nha_cung_cap']);

    const productListHMTL = importOrder['danh_sach_san_pham_nhap_hang'].map((product) => {
      const price = convertCurrency(product['don_gia']);

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
                <p class="product-new-price">${price} x ${product['so_luong_nhap_hang']}</p>
              </div>
            </div>
          </div>
        `;
    });

    $('#viewmoreImportOrderModal .product-list').html(productListHMTL);
    $('#viewmoreImportOrderModal .order-time span').html(
      moment(importOrder['ngay_lap'] * 1000).format('L')
    );

    let totalPay = convertCurrency(importOrder['tong_tien']);

    $('#viewmoreImportOrderModal .order-total-price span').html(totalPay);
  } catch (error) {
    console.log(error.message);
  }
}

export function renderImportOrderPage() {
  const loadingHTML = renderLoadingManager(18, 3);

  $('.admin-content').html(`
    <div class="import-order">
      <div class="import-order-header">
        <h1>Phiếu nhập</h1>
        <input type="text" name="import-order-daterange" value="" />
      </div>
      <div class="import-order-table-container">
        <table class="import-order-table">
          <thead>
            <tr align="center">
              <th>Mã phiếu nhập</th>
              <th>Thời gian</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody class="import-order-content">
            ${loadingHTML}
          </tbody>
        </table>
      </div>
    </div>
  `);

  initImportOrder();
  renderImportOrder();

  $('input[name="import-order-daterange"]').daterangepicker(
    {
      opens: 'left',
    },
    async function (start, end, label) {
      let s = new Date(start.format());
      let e = new Date(end.format());

      s = s.getTime() / 1000;
      e = e.getTime() / 1000;

      renderImportOrder(s, e);
    }
  );
}
