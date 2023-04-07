import moment from 'moment';
import { toast } from '../utils/toast';
import { convertCurrency, isAccessAction, renderLoadingManager } from '../utils/constains';
import customerApi from '../api/customerApi';
import guaranteeApi from '../api/guaranteeApi';

function initGuarantee() {
  const now = new Date();
  const date = new Date();

  date.setMonth(date.getMonth() - 1);

  $('input[name="guarantee-daterange"]').val(
    `${moment(date).format('L')} - ${moment(now).format('L')}`
  );

  const from = Math.floor(date.getTime() / 1000);
  const to = Math.floor(now.getTime() / 1000);

  renderGuarantee(from, to);
}

export async function renderGuarantee(from, to) {
  try {
    const guaranteeList = await guaranteeApi.getAll({
      from,
      to,
    });

    const guaranteeHTML = guaranteeList.map((guarantee) => {
      return `
        <tr align="center">
          <td>
            ${guarantee['ma_bao_hanh']}
          </td>
          <td>
            ${guarantee['ma_chi_tiet_san_pham']}
          </td>
          <td>
            ${guarantee['ma_khach_hang']}
          </td>
          <td>
            <div class="d-flex justify-content-center align-items-center gap-2">
              <i class="fa-solid fa-pen-to-square admin-action edit" data-id="${guarantee['ma_bao_hanh']}"></i>
              <i class="fa-solid fa-trash admin-action remove text-danger" data-id="${guarantee['ma_bao_hanh']}"></i>
            </div>
          </td>
        </tr>
      `;
    });

    $('.guarantee-content').html(guaranteeHTML);

    $('.guarantee .admin-action.edit').click(async (e) => {
      $('#viewmoreGuaranteeModal').modal('show');
      $('#viewmoreGuaranteeModal').attr('data-id', e.target.dataset.id);
      await handleUpdateGuarantee(e.target.dataset.id);
    });

    $('.guarantee .admin-action.remove').click(async (e) => {
      if (!isAccessAction('guarantee', 'DELETE')) return;
      $('#deleteGuaranteeModal').modal('show');
      $('#deleteGuaranteeModal').attr('data-id', e.target.dataset.id);
    });
  } catch (error) {
    console.log(error.message);
  }
}

async function handleUpdateGuarantee(id) {
  try {
    $('#viewmoreGuaranteeModal').attr('data-id', id);
    $('#viewmoreGuaranteeModal').modal('show');

    const guarantee = await guaranteeApi.getById(id);

    $('#viewmoreGuaranteeModal .create-time span').html(moment(guarantee['ngay_lap']).format('L'));
    $('#viewmoreGuaranteeModal .expire-time span').html(
      moment(guarantee['ngay_het_han']).format('L')
    );

    $('#viewmoreGuaranteeModal #guarantee-id').val(guarantee['ma_bao_hanh']);
    $('#viewmoreGuaranteeModal #detail-product-id').val(guarantee['ma_chi_tiet_san_pham']);
    $('#viewmoreGuaranteeModal #customer-id').val(guarantee['ma_khach_hang']);
  } catch (error) {
    console.log(error.message);
  }
}

export function renderGuaranteePage() {
  const loadingHTML = renderLoadingManager(18, 4);

  $('.admin-content').html(`
    <div class="guarantee">
      <div class="guarantee-header">
        <h1>Bảo hành</h1>
        <input type="text" name="guarantee-daterange" value="" />
      </div>
      <div class="guarantee-table-container">
        <table class="guarantee-table">
          <thead>
            <tr align="center">
              <th>Mã bảo hành</th>
              <th>Mã chi tiết sản phẩm</th>
              <th>Mã khách hàng</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody class="guarantee-content">
            ${loadingHTML}
          </tbody>
        </table>
      </div>
    </div>
  `);

  initGuarantee();
  renderGuarantee();

  $('input[name="guarantee-daterange"]').daterangepicker(
    {
      opens: 'left',
    },
    async function (start, end, label) {
      let s = new Date(start.format());
      let e = new Date(end.format());

      s = s.getTime() / 1000;
      e = e.getTime() / 1000;

      renderGuarantee(s, e);
    }
  );
}

$('#deleteGuaranteeModal .btn-yes').click(async () => {
  if (!isAccessAction('guarantee', 'DELETE')) return;

  try {
    const id = $('#deleteGuaranteeModal').attr('data-id');

    await guaranteeApi.remove(id);

    toast({
      title: 'Xóa thành công',
      duration: 3000,
      type: 'success',
    });
  } catch (error) {
    toast({
      title: 'Xóa không thành công',
      duration: 3000,
      type: 'error',
    });
  } finally {
    $('#deleteGuaranteeModal').modal('hide');
  }
});
