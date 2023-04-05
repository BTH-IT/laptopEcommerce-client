import productApi from '../api/productApi';
import orderApi from '../api/orderApi';

const port = 80;

let CartList = JSON.parse(localStorage.getItem('CartList'));

async function getProductbyID(id) {
  try {
    return await productApi.getById(id);
  } catch (error) {
    console.error(error);
  }
}

async function renderCartList() {
  if (CartList.length > 0) {
    CartList.forEach((item, idx) => {
      let req = getProductbyID(item.productID);
      req.then(function (data) {
        let htmlString = `
        <tr class="table-body_row">
          <td class="table-body_item">${++idx}</td>
          <td class="table-body_item">
            <div class="product-container">
                <div class="product-img_container">
                    <img class="product-img" src="${data.hinh_anh[0]}" alt="" width="80px"
                        height="80px">
                </div>
                <div class="product-name_container">
                    <span class="product-name">${data.ten_san_pham}</span>
                </div>
            </div>
          </td>
          <td class="table-body_item">
            <div class="product-price_container">
                <div class="product-price">${(
                  (data.gia_goc * (100 - data.giam_gia)) /
                  100
                ).toLocaleString('vi-VN')} VND</div>
                <div class="product-cost">${data.gia_goc.toLocaleString('vi-VN')} VND</div>
            </div>
          </td>
          <td class="table-body_item">
            <div class="product-amount_container">
                <button class="product-amount_minus">-</button>
                <input type="number" name="amount" id="amount" min="1" value="${item.amount}">
                <button class="product-amount_plus">+</button>
            </div>
            <div class="delete-product">Xoá</div>
          </td>
        </tr>`;
        console.log(htmlString);
        $('.table-body').append(htmlString);
      });
    });


  }
}

renderCartList();
