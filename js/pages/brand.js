import brandApi from '../api/brandApi';
import uploadApi from '../api/uploadApi';
import { isAccessAction, renderLoadingManager } from '../utils/constains';
import { toast } from '../utils/toast';
import { validation } from '../utils/validation';

async function renderBrand() {
  try {
    const { data: brandList } = await brandApi.getAll();

    const brandHTML = brandList
      .map(
        (brand) => `
        <tr align="center">
          <td>
            <span class="me-3">${brand['icon']}</span>
            <span>${brand['ten_thuong_hieu']}</span>
          </td>
          <td>
            <div class="brand-img">
              <img src="http://localhost:80/ecommerce-api/images/${brand['hinh_anh']}" alt="${brand['ten_thuong_hieu']}" />
            </div>
          </td>
          <td>
            <div class="d-flex justify-content-center align-items-center gap-2">
              <i class="fa-solid fa-pen-to-square admin-action edit" data-id="${brand['ma_thuong_hieu']}"></i>
              <i class="fa-solid fa-trash admin-action remove text-danger" data-id="${brand['ma_thuong_hieu']}"></i>
            </div>
          </td>
        </tr>
      `
      )
      .join();

    $('.brand-content').html(brandHTML);

    $('.brand .admin-action.remove').click((e) => {
      if (!isAccessAction('brands', 'DELETE')) return;

      $('#deleteBrandModal').modal('show');
      $('#deleteBrandModal').attr('data-id', e.target.dataset.id);
    });

    $('.brand .admin-action.edit').click(async (e) => {
      if (!isAccessAction('brands', 'UPDATE')) return;

      try {
        const id = e.target.dataset.id;
        const data = await brandApi.getById(id);

        $('#update_brandName').val(data['ten_thuong_hieu']);
        $('#update_icon').val(data['icon']);
        $('label[for="update_brandImage"] img').attr(
          'src',
          'http://localhost:80/ecommerce-api/images/' + data['hinh_anh']
        );

        $('#updateBrandModal').modal('show');
        $('#updateBrandModal').attr('data-id', id);
      } catch (error) {
        console.log(error.message);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
}

function displayImagePreview(e, id) {
  const [file] = e.target.files;
  if (file) {
    $(`${id} .image-input img`).attr('src', URL.createObjectURL(file));
  }
}

function showRemoveImageIcon(id) {
  const src = $(`${id} .image-input img`).attr('src');

  if (src !== '/img.webp') {
    $(`${id} .image-input .icon-remove`).addClass('show');
  }
}

function hideRemoveImageIcon(id) {
  $(`${id} .image-input .icon-remove`).removeClass('show');
}

function handleClickRemoveImage(e, id) {
  e.preventDefault();
  $(`${id} .image-input img`).attr('src', '/img.webp');
  $(`${id} .image-input input`)[0].files = null;
}

$('#create_brandImage').change((e) => {
  displayImagePreview(e, '#createBrandModal');
});

$('#update_brandImage').change((e) => {
  displayImagePreview(e, '#updateBrandModal');
});

$('#updateBrandModal .image-input').mouseenter(() => {
  showRemoveImageIcon('#updateBrandModal');
});
$('#createBrandModal .image-input').mouseenter(() => {
  showRemoveImageIcon('#createBrandModal');
});

$('#updateBrandModal .image-input').mouseleave(() => {
  hideRemoveImageIcon('#updateBrandModal');
});
$('#createBrandModal .image-input').mouseleave(() => {
  hideRemoveImageIcon('#createBrandModal');
});

$('#updateBrandModal .icon-remove').click((e) => {
  handleClickRemoveImage(e, '#updateBrandModal');
});
$('#createBrandModal .icon-remove').click((e) => {
  handleClickRemoveImage(e, '#createBrandModal');
});

$('#updateBrandModal .btn-update').click(async () => {
  if (!isAccessAction('brands', 'UPDATE')) return;

  try {
    const input = Array.from($('#updateBrandModal input'));
    let isValid = true;

    input.forEach((item) => {
      if (validation(item)) {
        isValid = false;
      }
    });

    if (!isValid) {
      return;
    }

    const id = $('#updateBrandModal').attr('data-id');
    const brandName = $('#update_brandName').val();
    const icon = $('#update_icon').val();
    const [file] = $('#update_brandImage')[0].files;

    const formData = new FormData();
    const data = {
      ma_thuong_hieu: id,
      ten_thuong_hieu: brandName,
      icon,
      hinh_anh: file.name,
    };
    formData.append('uploadfile', file);

    await brandApi.update(data);
    await uploadApi.add(formData);

    toast({
      title: 'Thay đổi thương hiệu thành công',
      type: 'success',
      duration: 2000,
    });

    $('#updateBrandModal').modal('hide');

    renderBrand();
  } catch (error) {
    toast({
      title: 'Thay đổi thương hiệu không thành công',
      message: error.message,
      type: 'error',
      duration: 2000,
    });
  }
});

$('#createBrandModal .btn-create').click(async () => {
  if (!isAccessAction('brands', 'CREATE')) return;

  const input = Array.from($('#createBrandModal input'));
  let isValid = true;

  input.forEach((item) => {
    if (validation(item)) {
      isValid = false;
    }
  });

  if (!isValid) {
    return;
  }

  const brandName = $('#create_brandName').val();
  const icon = $('#create_icon').val();
  const [file] = $('#create_brandImage')[0].files;

  const formData = new FormData();
  formData.append('uploadfile', file);

  try {
    await brandApi.add({
      ten_thuong_hieu: brandName,
      icon,
      hinh_anh: file.name,
    });

    await uploadApi.add(formData);
    toast({
      title: 'Thêm thương hiệu thành công',
      type: 'success',
      duration: 2000,
    });

    $('#createBrandModal').modal('hide');

    renderBrand();
  } catch (error) {
    toast({
      title: 'Thêm thương hiệu không thành công',
      message: error.message,
      type: 'error',
      duration: 2000,
    });
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

$('#createBrandModal input').keyup(handleValidate);
$('#createBrandModal input').blur(handleValidate);

$('#updateBrandModal input').keyup(handleValidate);
$('#updateBrandModal input').blur(handleValidate);

$('#deleteBrandModal .btn-yes').click(async () => {
  if (!isAccessAction('brands', 'DELETE')) return;

  try {
    const id = $('#deleteBrandModal').attr('data-id');

    await brandApi.remove(id);

    toast({
      title: 'Xóa thương hiệu không thành công',
      type: 'success',
      duration: 2000,
    });

    $('#deleteBrandModal').modal('hide');
    renderBrand();
  } catch (error) {
    toast({
      title: 'Xóa thương hiệu không thành công',
      message: error.message,
      type: 'error',
      duration: 2000,
    });
  }
});

export function renderBrandPage() {
  const loadingHTML = renderLoadingManager(18, 3);

  $('.admin-content').html(`
    <div class="brand">
      <div class="brand-header">
        <h1>Thương hiệu</h1>
        <div>
          <i class="fa-solid fa-circle-plus"></i> thêm thương hiệu
        </div>
      </div>
      <div class="brand-table-container">
        <table class="brand-table">
          <thead>
            <tr align="center">
              <th>Thương hiệu</th>
              <th>Hình ảnh</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody class="brand-content">
            ${loadingHTML}
          </tbody>
        </table>
      </div>
    </div>
  `);

  renderBrand();

  $('.brand-header div').click(() => {
    if (!isAccessAction('brands', 'CREATE')) return;
    $('#createBrandModal').modal('show');
  });
}
