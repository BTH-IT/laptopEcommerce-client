import authGroupApi from '../api/authGroupApi';
import accountApi from '../api/accountApi';
import { isAccessAction, renderLoadingManager } from '../utils/constains';
import { toast } from '../utils/toast';
import { validation } from '../utils/validation';
import employeeApi from '../api/employeeApi';
import moment from 'moment';

async function renderAccount() {
  try {
    const data = await accountApi.getAll();

    const dataHTML = data
      .map((acc) => {
        return `
          <tr align="center">
            <td>
              ${acc['ten_dang_nhap']}
            </td>
            <td>
              <span class="account-role" data-id="${acc['ten_dang_nhap']}">
                ${acc['ma_nhom_quyen']}
              </span>
            </td>
            <td>
              ${moment(acc['created_at']).format('L')}
            </td>
            <td>
              <div class="d-flex justify-content-center align-items-center">
                <i class="fa-solid fa-trash admin-action remove text-danger" data-id="${
                  acc['ten_dang_nhap']
                }"></i>
              </div>
            </td>
          </tr>
        `;
      })
      .join('');

    $('.account-content').html(dataHTML);

    $('.account .account-role').click((e) => {
      if (!isAccessAction('accounts', 'UPDATE')) return;

      const id = e.target.dataset.id;
      $('#roleAccountModal').attr('data-id', id);
      $('#roleAccountModal').modal('show');
    });

    $('.admin-action.remove').click((e) => {
      if (!isAccessAction('accounts', 'DELETE')) return;
      const id = e.target.dataset.id;
      $('#deleteAccountModal').attr('data-id', id);
      $('#deleteAccountModal').modal('show');
    });
  } catch (error) {
    console.log(error.message);
  }
}

async function renderRoleSelect() {
  try {
    const { data } = await authGroupApi.getAll();

    const dataFilter = data.filter((group) => group['trang_thai'] === true);

    const dataSelect = [
      {
        ma_nhom_quyen: '',
        ten_nhom_quyen: 'Chọn vai trò',
      },
      ...dataFilter,
    ];

    const dataHTML1 = dataSelect
      .map((group) => {
        if (group['ma_nhom_quyen'] === '') {
          return `
            <option value="${group['ma_nhom_quyen']}" hidden selected>${group['ten_nhom_quyen']}</option>
          `;
        }

        return `
            <option value="${group['ma_nhom_quyen']}">${group['ten_nhom_quyen']}</option>
          `;
      })
      .join('');

    const dataHTML2 = dataFilter
      .map(
        (group) => `
          <span class="account-role" data-value="${group['ma_nhom_quyen']}">${group['ten_nhom_quyen']}</span>
        `
      )
      .join('');

    $('#createAccountModal #role-account-create').html(dataHTML1);
    $('#roleAccountModal .modal-role').html(dataHTML2);

    $('#roleAccountModal .account-role').click(async (e) => {
      if (!isAccessAction('accounts', 'UPDATE')) return;

      try {
        const id = $('#roleAccountModal').attr('data-id');
        const roleId = e.target.dataset.value;

        await accountApi.update({
          ten_dang_nhap: id,
          ma_nhom_quyen: roleId,
        });

        toast({
          title: 'account Authorization Successfully',
          type: 'success',
          duration: 2000,
        });

        renderAccount();
      } catch (error) {
        toast({
          title: 'account Authorization failure',
          type: 'error',
          duration: 2000,
        });
      } finally {
        $('#roleAccountModal').modal('hide');
      }
    });
  } catch (error) {
    console.log(error.message);
  }
}

$('#createAccountModal .btn-add').click(async () => {
  if (!isAccessAction('accounts', 'CREATE')) return;

  const inputList = Array.from($('#createAccountModal input'));
  const select = Array.from($('#createAccountModal select'));
  const validateList = [...inputList, ...select];

  let isValid = true;

  validateList.forEach((input) => {
    if (validation(input)) {
      isValid = false;
      return;
    }
  });

  if (isValid) {
    try {
      await accountApi.add({
        ten_dang_nhap: $('#employee-account-create').val(),
        mat_khau: $('#password').val(),
        ma_nhom_quyen: $('#role-account-create').val(),
        created_at: Date.now(),
      });

      toast({
        title: 'Create account successfully!!',
        type: 'success',
        duration: 2000,
      });

      $('#employee-account-create').val('');
      $('#password').val('');
      $('#cofirm-password').val('');
      $('#role-account-create').val('');

      renderAccount();
    } catch (error) {
      toast({
        title: 'Create account failure!!',
        type: 'error',
        message: error.message,
        duration: 2000,
      });
    } finally {
      $('#createAccountModal').modal('hide');
    }
  }
});

$('#createAccountModal input').keyup((e) => {
  let message = validation(e.target);
  if (message) {
    e.target.parentElement.classList.add('input-error');
  } else {
    e.target.parentElement.classList.remove('input-error');
  }
});

$('#createAccountModal select').change((e) => {
  let message = validation(e.target);
  if (message) {
    e.target.parentElement.classList.add('select-error');
  } else {
    e.target.parentElement.classList.remove('select-error');
  }
});

$('#createAccountModal input').blur((e) => {
  let message = validation(e.target);
  if (message) {
    e.target.parentElement.classList.add('input-error');
  } else {
    e.target.parentElement.classList.remove('input-error');
  }
});

$('#createAccountModal select').blur((e) => {
  let message = validation(e.target);
  if (message) {
    e.target.parentElement.classList.add('select-error');
  } else {
    e.target.parentElement.classList.remove('select-error');
  }
});

$('#deleteAccountModal .btn-yes').click(async () => {
  if (!isAccessAction('accounts', 'DELETE')) return;

  const id = $('#deleteAccountModal').attr('data-id');
  try {
    await accountApi.remove(id);

    toast({
      title: 'Delete account successful',
      type: 'success',
      duration: 2000,
    });

    renderAccount();
  } catch (error) {
    toast({
      title: 'Delete account failure',
      type: 'error',
      duration: 2000,
    });
  } finally {
    $('#deleteAccountModal').modal('hide');
  }
});

async function renderEmployeeSelect() {
  try {
    const { data } = await employeeApi.getAll({ account: 0 });

    const dataSelect = [
      {
        ma_nhan_vien: '',
        ten_nhan_vien: 'Chọn nhân viên',
      },
      ...data,
    ];

    const dataHTML = dataSelect
      .map((employee) => {
        if (!employee['ma_nhan_vien']) {
          return `
              <option value="${employee['ma_nhan_vien']}" hidden selected>${employee['ten_nhan_vien']}</option>
            `;
        }
        return `
            <option value="${employee['ma_nhan_vien']}">${employee['ten_nhan_vien']}</option>
          `;
      })
      .join('');

    $('#employee-account-create').html(dataHTML);
  } catch (error) {}
}

export function renderAccountPage() {
  const loadingHTML = renderLoadingManager(18, 4);

  $('.admin-content').html(`
    <div class="account">
      <div class="account-header">
        <h1>Tài khoản</h1>
        <div>
          <i class="fa-solid fa-circle-plus"></i> cấp tài khoản
        </div>
      </div>
      <div class="account-table-container">
        <table class="account-table">
          <thead>
            <tr align="center">
              <th>Tên đăng nhập</th>
              <th>Quyền</th>
              <th>Ngày cấp</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody class="account-content">
            ${loadingHTML}
          </tbody>
        </table>
      </div>
    </div>
  `);

  renderAccount();
  renderRoleSelect();
  renderEmployeeSelect();

  $('.account-header div').click(() => {
    if (!isAccessAction('accounts', 'CREATE')) return;
    $('#createAccountModal').modal('show');
  });
}

$('.icon-password').click(() => {
  const icon = $('.icon-password .hidden').attr('data-value');

  if (icon === 'eye') {
    $(`.icon-password i[data-value='eye-slash']`).addClass('hidden');
    $(`.icon-password i[data-value='eye']`).removeClass('hidden');
    $('#password').attr('type', 'text');
  } else {
    $(`.icon-password i[data-value='eye-slash']`).removeClass('hidden');
    $(`.icon-password i[data-value='eye']`).addClass('hidden');
    $('#password').attr('type', 'password');
  }
});

$('.icon-confirm-password').click(() => {
  const icon = $('.icon-confirm-password .hidden').attr('data-value');

  if (icon === 'eye') {
    $(`.icon-confirm-password i[data-value='eye-slash']`).addClass('hidden');
    $(`.icon-confirm-password i[data-value='eye']`).removeClass('hidden');
    $('#comfirm-password').attr('type', 'text');
  } else {
    $(`.icon-confirm-password i[data-value='eye-slash']`).removeClass('hidden');
    $(`.icon-confirm-password i[data-value='eye']`).addClass('hidden');
    $('#comfirm-password').attr('type', 'password');
  }
});
