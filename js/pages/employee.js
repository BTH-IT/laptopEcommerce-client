import moment from 'moment';
import authGroupApi from '../api/authGroupApi';
import employeeApi from '../api/employeeApi';
import { isAccessAction, renderLoadingManager } from '../utils/constains';
import { toast } from '../utils/toast';
import { validation } from '../utils/validation';

async function renderEmployee() {
  try {
    const { data } = await employeeApi.getAll();

    const dataHTML = data
      .map((employee) => {
        return `
            <tr align="center">
              <td>
                ${employee['ma_nhan_vien']}
              </td>
              <td>
                ${employee['ten_nhan_vien']}
              </td>
              <td>
                <div class="d-flex justify-content-center align-items-center gap-2">
                  <i class="fa-solid fa-pen-to-square admin-action edit" data-id="${employee['ma_nhan_vien']}"></i>
                  <i class="fa-solid fa-trash admin-action remove text-danger" data-id="${employee['ma_nhan_vien']}"></i>
                </div>
              </td>
            </tr>
        `;
      })
      .join('');

    $('.employee-content').html(dataHTML);

    $('.admin-action.remove').click((e) => {
      if (!isAccessAction('employees', 'DELETE')) return;
      const id = e.target.dataset.id;
      $('#deleteEmployeeModal').attr('data-id', id);
      $('#deleteEmployeeModal').modal('show');
    });

    $('.admin-action.edit').click(async (e) => {
      if (!isAccessAction('employees', 'UPDATE')) return;
      const id = e.target.dataset.id;
      $('#updateEmployeeModal').attr('data-id', id);
      $('#updateEmployeeModal').modal('show');

      const data = await employeeApi.getById(id);

      const date = moment(data['ngay_sinh']).format('L').split('/');

      $('#fullname-employee-update').val(data['ten_nhan_vien']);
      $('#birth-date-employee-update').val(date[2] + '-' + date[0] + '-' + date[1]);
      $('#phone-employee-update').val(data['so_dien_thoai']);
      $('#gender-employee-update').val(data['gioi_tinh'] ? '1' : '0');
      $('#salary-employee-update').val(data['muc_luong']);
    });
  } catch (error) {
    console.log(error.message);
  }
}

$('#createEmployeeModal .btn-add').click(async () => {
  if (!isAccessAction('employees', 'CREATE')) return;

  const inputList = Array.from($('#createEmployeeModal input'));
  const select = Array.from($('#createEmployeeModal select'));
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
      const id = $('#id-employee-create').val();
      const fullname = $('#fullname-employee-create').val();
      const phone = $('#phone-employee-create').val();
      const birthDate = new Date($('#birth-date-employee-create').val());
      const gender = Number($('#gender-employee-create').val());
      const salary = $('#salary-employee-create').val();

      await employeeApi.add({
        ma_nhan_vien: id,
        ten_nhan_vien: fullname,
        ngay_sinh: birthDate.getTime() / 1000,
        so_dien_thoai: phone,
        gioi_tinh: gender,
        muc_luong: salary,
      });

      toast({
        title: 'Create Employee successfully!!',
        type: 'success',
        duration: 2000,
      });

      $('#id-employee-create').val('');
      $('#fullname-employee-create').val('');
      $('#birth-date-employee-create').val('');
      $('#phone-employee-create').val('');
      $('#gender-employee-create').val('');
      $('#salary-employee-create').val('');

      renderEmployee();
    } catch (error) {
      toast({
        title: 'Create Employee failure!!',
        type: 'error',
        message: error.message,
        duration: 2000,
      });
    } finally {
      $('#createEmployeeModal').modal('hide');
    }
  }
});

export function renderEmployeePage() {
  const loadingHTML = renderLoadingManager(18, 3);

  $('.admin-content').html(`
    <div class="employee">
      <div class="employee-header">
        <h1>Nhân viên</h1>
        <div>
          <i class="fa-solid fa-circle-plus"></i> thêm nhân viên
        </div>
      </div>
      <div class="employee-table-container">
        <table class="employee-table">
          <thead>
            <tr align="center">
              <th>Mã nhân viên</th>
              <th>Tên nhân viên</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody class="employee-content">
            ${loadingHTML}
          </tbody>
        </table>
      </div>
    </div>
  `);

  renderEmployee();

  $('.employee-header div').click(() => {
    if (!isAccessAction('employees', 'CREATE')) return;
    $('#createEmployeeModal').modal('show');
  });
}

$('#updateEmployeeModal .btn-save').click(async () => {
  if (!isAccessAction('employees', 'UPDATE')) return;
  let isValid = true;

  const inputList = [...Array.from($('#updateEmployeeModal input'))];

  inputList.forEach((input) => {
    let message = validation(input);
    if (message) {
      input.parentElement.classList.add('input-error');
      isValid = false;
    } else {
      input.parentElement.classList.remove('input-error');
    }
  });

  let message = validation($('#updateEmployeeModal select')[0]);
  if (message) {
    $('#updateEmployeeModal select')[0].parentElement.classList.add('select-error');
    isValid = false;
  } else {
    $('#updateEmployeeModal select')[0].parentElement.classList.remove('select-error');
  }

  if (!isValid) return;

  try {
    const id = $('#updateEmployeeModal').attr('data-id');

    const fullname = $('#fullname-employee-update').val();
    const phone = $('#phone-employee-update').val();
    const birthDate = new Date($('#birth-date-employee-update').val());
    const gender = Number($('#gender-employee-update').val());
    const salary = $('#salary-employee-update').val();

    await employeeApi.update({
      ma_nhan_vien: id,
      ten_nhan_vien: fullname,
      so_dien_thoai: phone,
      ngay_sinh: birthDate.getTime() / 1000,
      gioi_tinh: gender,
      muc_luong: salary,
    });

    toast({
      title: 'Biểu hiện của tuổi già',
      duration: 3000,
      message: 'Đau lưng, mỏi gối, đau tay',
      type: 'success',
    });

    renderEmployee();
  } catch (error) {
    toast({
      title: 'Biểu hiện của tuổi già',
      duration: 3000,
      message: 'Đau lưng, mỏi gối, đau tay',
      type: 'error',
    });
  } finally {
    $('#updateEmployeeModal').modal('hide');
  }
});

$('#createEmployeeModal input').keyup((e) => {
  let message = validation(e.target);
  if (message) {
    e.target.parentElement.classList.add('input-error');
  } else {
    e.target.parentElement.classList.remove('input-error');
  }
});

$('#createEmployeeModal select').change((e) => {
  let message = validation(e.target);
  if (message) {
    e.target.parentElement.classList.add('select-error');
  } else {
    e.target.parentElement.classList.remove('select-error');
  }
});

$('#createEmployeeModal input').blur((e) => {
  let message = validation(e.target);
  if (message) {
    e.target.parentElement.classList.add('input-error');
  } else {
    e.target.parentElement.classList.remove('input-error');
  }
});

$('#createEmployeeModal select').blur((e) => {
  let message = validation(e.target);
  if (message) {
    e.target.parentElement.classList.add('select-error');
  } else {
    e.target.parentElement.classList.remove('select-error');
  }
});

$('#deleteEmployeeModal .btn-yes').click(async () => {
  if (!isAccessAction('employees', 'DELETE')) return;

  const id = $('#deleteEmployeeModal').attr('data-id');
  try {
    await employeeApi.remove(id);

    toast({
      title: 'Delete Employee successful',
      type: 'success',
      duration: 2000,
    });

    $('#deleteEmployeeModal').modal('hide');

    renderEmployee();
  } catch (error) {
    toast({
      title: 'Delete Employee failure',
      type: 'error',
      duration: 2000,
    });
  }
});
