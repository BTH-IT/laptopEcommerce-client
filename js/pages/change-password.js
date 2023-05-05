import accountApi from '../api/accountApi';
import {
  getLocalStorage,
  initCartList,
  initHeader,
  setLocalStorage,
  urlServer,
} from '../utils/constains';
import { validation } from '../utils/validation';

initCartList();
initChangePassword();
initHeader();

async function initChangePassword() {
  const accessToken = getLocalStorage('access_token');

  if (accessToken) {
    const user = parseJwt(accessToken);
    const now = parseInt(Date.now() / 1000);

    if (now > user.exp) {
      setLocalStorage('access_token', null);
      window.location.href = '/';
      return;
    }

    try {
      const { userId } = getLocalStorage('user');

      if (!userId) {
        window.location.href = '/';
        return;
      }

      const data = await customerApi.getById(userId);

      const date = moment(data['ngay_sinh']).format('L').split('/');

      $('#fullname').val(data['ten_khach_hang']);
      $('#birth-date').val(date[2] + '-' + date[0] + '-' + date[1]);
      $('#gender').val(data['gioi_tinh'] ? '1' : '0');
      $('#phone').val(data['so_dien_thoai']);
      $('#address').val(data['dia_chi']);

      if (data['avatar'] !== 'avatar.jpg') {
        $('.avatar img').attr('src', `${urlServer}/images/${data['avatar']}`);
      } else {
        $('.avatar img').attr('src', `${urlServer}/images/avatar.jpg`);
      }
    } catch (error) {
      console.log(error.message);
    }

    return;
  }

  window.location.href = '/';
}

$('.btn-update').click(async (e) => {
  e.preventDefault();
  let isValid = true;

  const inputList = [...Array.from($('.form input'))];

  inputList.forEach((input) => {
    let message = validation(input);
    if (message) {
      input.parentElement.classList.add('input-error');
      isValid = false;
    } else {
      input.parentElement.classList.remove('input-error');
    }
  });

  if (isValid) {
    try {
      const oldPassword = $('#old-password').val();
      const newPassword = $('#password').val();
      const { userId } = getLocalStorage('user');

      await accountApi.update({
        ten_dang_nhap: userId,
        mat_khau_moi: newPassword,
        mat_khau_cu: oldPassword,
      });

      toast({
        title: 'Thay đổi mật khẩu thành công',
        duration: 3000,
        message: 'Mời bạn đăng nhập lại hệ thống!!!',
        type: 'success',
      });

      setLocalStorage('access_token', null);
      setLocalStorage('user', null);

      setTimeout(() => {
        window.location.href = '/login.html';
      }, 2000);
    } catch (error) {
      toast({
        title: 'Error Server',
        duration: 3000,
        message: error.response.data.message,
        type: 'error',
      });
    }
  }
});

$('.form input').keyup((e) => {
  let message = validation(e.target);
  if (message) {
    e.target.parentElement.classList.add('input-error');
  } else {
    e.target.parentElement.classList.remove('input-error');
  }
});

$('.form input').blur((e) => {
  let message = validation(e.target);
  if (message) {
    e.target.parentElement.classList.add('input-error');
  } else {
    e.target.parentElement.classList.remove('input-error');
  }
});
