import supplierApi from '../api/supplierApi';
import uploadApi from '../api/uploadApi';
import { isAccessAction, renderLoadingManager } from '../utils/constains';
import { toast } from '../utils/toast';
import { validation } from '../utils/validation';

async function renderSupplier() {
  try {
    const { data: supplierList } = await supplierApi.getAll();

    const supplierHTML = supplierList.map(
      (supplier) => `
        <tr align="center">
          <td>
            ${supplier['ma_nha_cung_cap']}
          </td>
          <td>
            ${supplier['ten_nha_cung_cap']}
          </td>
          <td>
            <div class="d-flex align-items-center justify-content-center gap-2">
              <i class="fa-solid fa-pen-to-square admin-action edit" data-id="${supplier['ma_nha_cung_cap']}"></i>
              <i class="fa-solid fa-trash admin-action remove text-danger" data-id="${supplier['ma_nha_cung_cap']}"></i>
            </div>
          </td>
        </tr>
      `
    );

    $('.supplier-content').html(supplierHTML);

    $('.supplier .admin-action.remove').click((e) => {
      if (!isAccessAction('suppliers', 'DELETE')) return;

      $('#deleteSupplierModal').modal('show');
      $('#deleteSupplierModal').attr('data-id', e.target.dataset.id);
    });

    $('.supplier .admin-action.edit').click(async (e) => {
      if (!isAccessAction('suppliers', 'UPDATE')) return;

      try {
        const id = e.target.dataset.id;
        const data = await supplierApi.getById(id);

        $('#name-supplier-update').val(data['ten_nha_cung_cap']);
        $('#phone-supplier-update').val(data['so_dien_thoai']);
        $('#address-supplier-update').val(data['dia_chi']);

        $('#updateSupplierModal').modal('show');
      } catch (error) {
        console.log(error.message);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
}

$('#updateSupplierModal .btn-save').click(async () => {
  if (!isAccessAction('suppliers', 'UPDATE')) return;

  try {
    const input = Array.from($('#updateSupplierModal input'));
    let isValid = true;

    input.forEach((item) => {
      if (validation(item)) {
        isValid = false;
      }
    });

    if (!isValid) {
      return;
    }

    const id = $('#updateSupplierModal').attr('data-id');

    const name = $('#name-supplier-create').val();
    const phone = $('#phone-supplier-create').val();
    const address = $('#address-supplier-create').val();

    const data = {
      ma_nha_cung_cap: id,
      ten_nha_cung_cap: name,
      so_dien_thoai: phone,
      dia_chi: address,
    };

    await supplierApi.update(data);

    toast({
      title: 'Thay đổi nhà cung cấp thành công',
      type: 'success',
      duration: 2000,
    });

    renderSupplier();
  } catch (error) {
    toast({
      title: 'Thay đổi nhà cung cấp không thành công',
      message: error.message,
      type: 'error',
      duration: 2000,
    });
  } finally {
    $('#updateSupplierModal').modal('hide');
  }
});

$('#createSupplierModal .btn-add').click(async () => {
  if (!isAccessAction('suppliers', 'CREATE')) return;

  const input = Array.from($('#createSupplierModal input'));
  let isValid = true;

  input.forEach((item) => {
    if (validation(item)) {
      isValid = false;
    }
  });

  if (!isValid) {
    return;
  }

  const name = $('#name-supplier-create').val();
  const phone = $('#phone-supplier-create').val();
  const address = $('#address-supplier-create').val();

  try {
    await supplierApi.add({
      ten_nha_cung_cap: name,
      so_dien_thoai: phone,
      dia_chi: address,
    });

    toast({
      title: 'Thêm nhà cung cấp thành công',
      type: 'success',
      duration: 2000,
    });

    renderSupplier();

    $('#name-supplier-create').val('');
    $('#phone-supplier-create').val('');
    $('#address-supplier-create').val('');
  } catch (error) {
    toast({
      title: 'Thêm nhà cung cấp không thành công',
      message: error.message,
      type: 'error',
      duration: 2000,
    });
  } finally {
    $('#createSupplierModal').modal('hide');
  }
});

function handleValidate(e) {
  let message = validation(e.target);
  if (message) {
    e.target.parentElement.classList.add('input-error');
  } else {
    e.target.parentElement.classList.remove('input-error');
  }
}

$('#createSupplierModal input').keyup(handleValidate);
$('#createSupplierModal input').blur(handleValidate);

$('#updateSupplierModal input').keyup(handleValidate);
$('#updateSupplierModal input').blur(handleValidate);

$('#deleteSupplierModal .btn-yes').click(async () => {
  if (!isAccessAction('suppliers', 'DELETE')) return;

  try {
    const id = $('#deleteSupplierModal').attr('data-id');

    await supplierApi.remove(id);

    toast({
      title: 'Xóa nhà cung cấp không thành công',
      type: 'success',
      duration: 2000,
    });

    renderSupplier();
  } catch (error) {
    toast({
      title: 'Xóa nhà cung cấp không thành công',
      message: error.message,
      type: 'error',
      duration: 2000,
    });
  } finally {
    $('#deleteSupplierModal').modal('hide');
  }
});

export function renderSupplierPage() {
  const loadingHTML = renderLoadingManager(18, 3);

  $('.admin-content').html(`
    <div class="supplier">
      <div class="supplier-header">
        <h1>Nhà cung cấp</h1>
        <div>
          <i class="fa-solid fa-circle-plus"></i> thêm nhà cung cấp
        </div>
      </div>
      <div class="supplier-table-container">
        <table class="supplier-table">
          <thead>
            <tr align="center">
              <th>Mã nhà cung cấp</th>
              <th>Tên nhà cung cấp</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody class="supplier-content">
            ${loadingHTML}
          </tbody>
        </table>
      </div>
    </div>
  `);

  renderSupplier();

  $('.supplier-header div').click(() => {
    if (!isAccessAction('suppliers', 'CREATE')) return;
    $('#createSupplierModal').modal('show');
  });
}
