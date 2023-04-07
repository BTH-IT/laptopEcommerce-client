import customerApi from '../api/customerApi';
import { isAccessAction, renderLoadingManager } from '../utils/constains';

async function renderCustomer() {
  try {
    const { data } = await customerApi.getAll();

    const dataHTML = data
      .map((customer) => {
        return `
            <tr align="center">
              <td>
                ${customer['ma_khach_hang']}
              </td>
              <td>
                ${customer['ten_khach_hang']}
              </td>
              <td>
                <div class="d-flex justify-content-center align-items-center gap-3">
                  <i class="fa-solid fa-circle-info admin-action viewmore text-primary" data-id="${customer['ma_khach_hang']}"></i>
                  <i class="fa-solid fa-trash admin-action remove text-danger" data-id="${customer['ma_khach_hang']}"></i>
                </div>
              </td>
            </tr>
        `;
      })
      .join('');

    $('.customer-content').html(dataHTML);

    $('.customer .admin-action.remove').click((e) => {
      if (!isAccessAction('customers', 'DELETE')) return;
      $('#deleteCustomerModal').modal('show');
      $('#deleteCustomerModal').attr('data-id', e.target.dataset.id);
    });

    $('.customer .admin-action.viewmore').click(async (e) => {
      $('#viewmoreCustomerModal').modal('show');

      const id = e.target.dataset.id;

      const customer = await customerApi.getById(id);

      const date = moment(customer['ngay_sinh']).format('L').split('/');

      $('#username-customer-view').val(id);
      $('#fullname-customer-view').val(customer['ten_khach_hang']);
      $('#birth-date-customer-view').val(date[2] + '-' + date[0] + '-' + date[1]);
      $('#gender-customer-view').val(data['gioi_tinh'] ? '1' : '0');
      $('#phone-customer-view').val(customer['so_dien_thoai']);
      $('#address-customer-view').val(customer['dia_chi']);
    });
  } catch (error) {
    console.log(error.message);
  }
}

export function renderCustomerPage() {
  const loadingHTML = renderLoadingManager(18, 3);

  $('.admin-content').html(`
    <div class="customer">
      <div class="customer-header">
        <h1>Khách hàng</h1>
        <div>
          <i class="fa-solid fa-circle-plus"></i> thêm khách hàng
        </div>
      </div>
      <div class="customer-table-container">
        <table class="customer-table">
          <thead>
            <tr align="center">
              <th>Mã khách hàng</th>
              <th>Tên khách hàng</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody class="customer-content">
            ${loadingHTML}
          </tbody>
        </table>
      </div>
    </div>
  `);

  renderCustomer();

  $('.customer-header div').click(() => {
    if (!isAccessAction('customers', 'CREATE')) return;
    $('#createCustomerModal').modal('show');
  });
}

$('#createCustomerModal .btn-add').click(async () => {
  if (!isAccessAction('customers', 'CREATE')) return;
  let isValid = true;

  const inputList = [...Array.from($('#createCustomerModal input'))];

  inputList.forEach((input) => {
    let message = validation(input);
    if (message) {
      input.parentElement.classList.add('input-error');
      isValid = false;
    } else {
      input.parentElement.classList.remove('input-error');
    }
  });

  let message = validation($('#createCustomerModal select')[0]);
  if (message) {
    $('#createCustomerModal select')[0].parentElement.classList.add('select-error');
    isValid = false;
  } else {
    $('#createCustomerModal select')[0].parentElement.classList.remove('select-error');
  }

  if (isValid) {
    try {
      const username = $('#username-customer-create').val();
      const password = $('#password-customer').val();
      const fullname = $('#fullname-customer-create').val();
      const birthDate = new Date($('#birth-date-customer-create').val());
      const gender = $('#gender-customer-create').val();
      const phone = $('#phone-customer-create').val();
      const address = $('#address-customer-create').val();

      await authApi.register({
        ten_dang_nhap: username,
        mat_khau: password,
        ten_khach_hang: fullname,
        ngay_sinh: birthDate.getTime() / 1000,
        gioi_tinh: gender,
        so_dien_thoai: phone,
        dia_chi: address,
      });

      toast({
        title: 'Biểu hiện của tuổi già',
        duration: 3000,
        message: 'Đau lưng, mỏi gối, đau tay',
        type: 'success',
      });
    } catch (error) {
      toast({
        title: 'Error Server',
        duration: 3000,
        message: error.response.data.message,
        type: 'error',
      });
    } finally {
      $('#createCustomerModal').show('hide');
    }
  }
});

$('#deleteCustomerModal .btn-yes').click(async () => {
  try {
    const id = $('#deleteCustomerModal').attr('data-id');

    await customerApi.remove(id);

    toast({
      title: 'Biểu hiện của tuổi già',
      duration: 3000,
      message: 'Đau lưng, mỏi gối, đau tay',
      type: 'success',
    });

    renderCustomer();
  } catch (error) {
    toast({
      title: 'Error Server',
      duration: 3000,
      message: error.response.data.message,
      type: 'error',
    });
  } finally {
    $('#deleteCustomerModal').show('hide');
  }
});
