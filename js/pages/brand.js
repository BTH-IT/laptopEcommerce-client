import brandApi from '../api/brandApi';
import uploadApi from '../api/uploadApi';
import { handleSearching, handleSorting } from './manager';
import { isAccessAction, renderLoadingManager, urlServer } from '../utils/constains';
import { toast } from '../utils/toast';
import { validation } from '../utils/validation';

async function renderBrand(params = '') {
  try {
    const { data: brandList } = await brandApi.getAll(params);

    if (brandList.length <= 0) {
      $('.brand-content').html(`
        <tr>
          <td colspan="3">
            <h1 class="text-center my-5 w-100">Không có nhóm quyền nào cả!!!</h1>  
          </td>
        </tr>
      `);
      return;
    }

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
              <img src="${urlServer}/images/${brand['hinh_anh']}" alt="${brand['ten_thuong_hieu']}" />
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
          urlServer + '/images/' + data['hinh_anh']
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
    };

    await brandApi.update(data);
    if ($('#update_brandImage')[0].files.length > 0) {
      formData.append('uploadfile', file);
      data['hinh_anh'] = file.name;
      await uploadApi.add(formData);
    }

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
      <div class="search-container">
        <div class="search-box">
          <input type="text" class="header-input" placeholder="Tìm kiếm theo tên thương hiệu" />
          <button type="button" class="btn primary btn-header">
            <i class="fa-solid fa-magnifying-glass"></i>
          </button>
        </div>
      </div>
      <div class="brand-table-container">
        <table class="brand-table">
          <thead>
            <tr align="center">
              <th>
                <div class="d-flex align-items-center justify-content-center gap-3 ">
                  Thương hiệu
                  <div class="icon-sort active before" data-value="ten_thuong_hieu" data-sort="desc"></div>
                </div>
              </th>
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

  const url = new URL(window.location);
  const searchingVal = url.searchParams.get('searching') ?? '';
  const sortNameVal = url.searchParams.get('sort-name') ?? '';
  const sortActionVal = url.searchParams.get('sort-action') ?? '';

  renderBrand({
    sortAction: sortActionVal,
    sortName: sortNameVal,
    searching: searchingVal,
  });

  $('.brand-header div').click(() => {
    if (!isAccessAction('brands', 'CREATE')) return;
    $('#createBrandModal').modal('show');
  });

  $('.header-input').keypress(async (e) => {
    if (e.keyCode !== 13) return;

    handleSearching(e.target.value, renderBrand);
  });

  $('.btn-header').click(() => {
    handleSearching($('.header-input').val(), renderBrand);
  });

  $('.icon-sort').click((e) => {
    handleSorting(e, renderBrand);
  });
}
