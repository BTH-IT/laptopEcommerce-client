import sign from 'jwt-encode';
import authApi from '../api/authApi';
import authGroupApi from '../api/authGroupApi';
import detailPermissionApi from '../api/detailPermissionApi';
import {
  getLocalStorage,
  isAccessAction,
  parseJwt,
  renderLoadingManager,
  setLocalStorage,
} from './utils/constains';
import { toast } from './utils/toast';

async function renderDecentralization() {
  try {
    const { data } = await authGroupApi.getAll();

    const dataFilter = data.filter(
      (group) => group['trang_thai'] === true && group['mac_dinh'] === false
    );

    const dataHTML = dataFilter
      .map(
        (group) => `
          <tr align="center">
            <td>
              ${group['ma_nhom_quyen']}
            </td>
            <td>
              ${group['ten_nhom_quyen']}
            </td>
            <td>
              <div class="col-4 d-flex justify-content-center align-items-center">
                <i class="fa-solid fa-pen-to-square admin-action edit text-secondary" data-id="${group['ma_nhom_quyen']}"></i>
              </div>
            </td>
          </tr>
        `
      )
      .join('');

    $('.decentralization-content').html(dataHTML);

    $('.decentralization .admin-action.edit').click(async (e) => {
      if (!isAccessAction('decentralization', 'UPDATE')) return;
      const id = e.target.dataset.id;

      try {
        const data = await authGroupApi.getById(id);

        const permission = data['quyen_hang'];

        permission.forEach((per) => {
          switch (per['ten_quyen_hang']) {
            case 'products':
              $(`#toggle-${per['ten_chuc_nang'].toLowerCase()}-product`).attr(
                'data-per-id',
                per['ma_quyen_hang']
              );

              $(`#toggle-${per['ten_chuc_nang'].toLowerCase()}-product`).attr(
                'data-action-id',
                per['ma_chuc_nang']
              );

              $(`#toggle-${per['ten_chuc_nang'].toLowerCase()}-product`).attr(
                'checked',
                per['trang_thai_quyen_hang']
              );
              break;
            case 'auth-groups':
              $(`#toggle-${per['ten_chuc_nang'].toLowerCase()}-auth-group`).attr(
                'data-per-id',
                per['ma_quyen_hang']
              );

              $(`#toggle-${per['ten_chuc_nang'].toLowerCase()}-auth-group`).attr(
                'data-action-id',
                per['ma_chuc_nang']
              );

              $(`#toggle-${per['ten_chuc_nang'].toLowerCase()}-auth-group`).attr(
                'checked',
                per['trang_thai_quyen_hang']
              );
              break;
            case 'orders':
              $(`#toggle-${per['ten_chuc_nang'].toLowerCase()}-order`).attr(
                'data-per-id',
                per['ma_quyen_hang']
              );

              $(`#toggle-${per['ten_chuc_nang'].toLowerCase()}-order`).attr(
                'data-action-id',
                per['ma_chuc_nang']
              );

              $(`#toggle-${per['ten_chuc_nang'].toLowerCase()}-order`).attr(
                'checked',
                per['trang_thai_quyen_hang']
              );
              break;
            case 'decentralization':
              $(`#toggle-${per['ten_chuc_nang'].toLowerCase()}-decentralization`).attr(
                'data-per-id',
                per['ma_quyen_hang']
              );

              $(`#toggle-${per['ten_chuc_nang'].toLowerCase()}-decentralization`).attr(
                'data-action-id',
                per['ma_chuc_nang']
              );

              $(`#toggle-${per['ten_chuc_nang'].toLowerCase()}-decentralization`).attr(
                'checked',
                per['trang_thai_quyen_hang']
              );
              break;
            case 'users':
              $(`#toggle-${per['ten_chuc_nang'].toLowerCase()}-user`).attr(
                'data-per-id',
                per['ma_quyen_hang']
              );

              $(`#toggle-${per['ten_chuc_nang'].toLowerCase()}-user`).attr(
                'data-action-id',
                per['ma_chuc_nang']
              );

              $(`#toggle-${per['ten_chuc_nang'].toLowerCase()}-user`).attr(
                'checked',
                per['trang_thai_quyen_hang']
              );
              break;
            case 'statistics':
              $('#toggle-view-statistics').attr('data-per-id', per['ma_quyen_hang']);
              $('#toggle-view-statistics').attr('data-action-id', per['ma_chuc_nang']);
              $('#toggle-view-statistics').attr('checked', per['trang_thai_quyen_hang']);
              break;
            case 'brands':
              $(`#toggle-${per['ten_chuc_nang'].toLowerCase()}-brand`).attr(
                'data-per-id',
                per['ma_quyen_hang']
              );

              $(`#toggle-${per['ten_chuc_nang'].toLowerCase()}-brand`).attr(
                'data-action-id',
                per['ma_chuc_nang']
              );

              $(`#toggle-${per['ten_chuc_nang'].toLowerCase()}-brand`).attr(
                'checked',
                per['trang_thai_quyen_hang']
              );
              break;
            case 'customers':
              $(`#toggle-${per['ten_chuc_nang'].toLowerCase()}-customer`).attr(
                'data-per-id',
                per['ma_quyen_hang']
              );

              $(`#toggle-${per['ten_chuc_nang'].toLowerCase()}-customer`).attr(
                'data-action-id',
                per['ma_chuc_nang']
              );

              $(`#toggle-${per['ten_chuc_nang'].toLowerCase()}-customer`).attr(
                'checked',
                per['trang_thai_quyen_hang']
              );
              break;
            case 'employees':
              $(`#toggle-${per['ten_chuc_nang'].toLowerCase()}-employee`).attr(
                'data-per-id',
                per['ma_quyen_hang']
              );

              $(`#toggle-${per['ten_chuc_nang'].toLowerCase()}-employee`).attr(
                'data-action-id',
                per['ma_chuc_nang']
              );

              $(`#toggle-${per['ten_chuc_nang'].toLowerCase()}-employee`).attr(
                'checked',
                per['trang_thai_quyen_hang']
              );
              break;
            case 'import-orders':
              $(`#toggle-${per['ten_chuc_nang'].toLowerCase()}-import-order`).attr(
                'data-per-id',
                per['ma_quyen_hang']
              );

              $(`#toggle-${per['ten_chuc_nang'].toLowerCase()}-import-order`).attr(
                'data-action-id',
                per['ma_chuc_nang']
              );

              $(`#toggle-${per['ten_chuc_nang'].toLowerCase()}-import-order`).attr(
                'checked',
                per['trang_thai_quyen_hang']
              );
              break;
            case 'guarantee':
              $(`#toggle-${per['ten_chuc_nang'].toLowerCase()}-guarantee`).attr(
                'data-per-id',
                per['ma_quyen_hang']
              );

              $(`#toggle-${per['ten_chuc_nang'].toLowerCase()}-guarantee`).attr(
                'data-action-id',
                per['ma_chuc_nang']
              );

              $(`#toggle-${per['ten_chuc_nang'].toLowerCase()}-guarantee`).attr(
                'checked',
                per['trang_thai_quyen_hang']
              );
              break;
          }
        });

        $('#viewAndUpdateDecentralizationModal').attr('data-id', e.target.dataset.id);
        $('#viewAndUpdateDecentralizationModal').modal('show');
      } catch (error) {
        console.log(error.message);
      }
    });
  } catch (error) {
    console.log(error.message);
  }
}

export function renderDecentralizationPage() {
  const loadingHTML = renderLoadingManager(18, 3);

  $('.admin-content').html(`
    <div class="decentralization">
      <div class="decentralization-header">
        <h1>Phân quyền</h1>
      </div>
      <div class="decentralization-table-container">
        <table class="decentralization-table">
          <thead>
            <tr align="center">
              <th>Mã nhóm quyền</th>
              <th>Tên nhóm quyền</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody class="decentralization-content">
            ${loadingHTML}
          </tbody>
        </table>
      </div>
    </div>
  `);

  renderDecentralization();
}

$('#viewAndUpdateDecentralizationModal input[type="checkbox"]').change(async (e) => {
  try {
    const ma_nhom_quyen = $('#viewAndUpdateDecentralizationModal').attr('data-id');
    const ma_quyen_hang = e.target.dataset.perId;
    const ma_chuc_nang = e.target.dataset.actionId;
    const trang_thai = e.target.checked;

    await detailPermissionApi.update({
      ma_nhom_quyen,
      ma_quyen_hang,
      ma_chuc_nang,
      trang_thai,
    });

    const accessToken = getLocalStorage('access_token');
    const oldData = parseJwt(accessToken);

    const user = oldData.data;

    const permission = user.permission.map((per) => {
      if (per['ma_quyen_hang'] === ma_quyen_hang && per['ma_chuc_nang'] === ma_chuc_nang) {
        per['trang_thai_quyen_hang'] = trang_thai;
      }

      return per;
    });

    user.permission = permission;

    const secret = 'laptop ecommerce';

    const data = {
      ...oldData,
      data: user,
    };

    const jwt = sign(data, secret);

    setLocalStorage('access_token', jwt);
    setLocalStorage('user', user);
  } catch (error) {
    toast({
      title: 'Oops!! Có lỗi gì đó rồi mời bạn quay lại sau',
      type: 'error',
      duration: 2000,
    });
  }
});
