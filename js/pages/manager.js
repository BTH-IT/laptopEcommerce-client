import { renderAccountPage } from './account';
import { renderAuthGroupPage } from './auth-group';
import { renderBrandPage } from './brand';
import { renderCustomerPage } from './customer';
import { renderDecentralizationPage } from './decentralization';
import { renderEmployeePage } from './employee';
import { renderGuaranteePage } from './guarantee';
import { renderImportOrderPage } from './import-order';
import { renderImportProductPage } from './import-product';
import { renderOverviewPage } from './overview';
import { renderProductPage } from './product';
import { renderOrderPage } from './sell-order';
import { renderSupplierPage } from './supplier';
import { parseJwt, getLocalStorage, setLocalStorage } from '../utils/constains';

let chart_1, chart_2;

function initManager() {
  const accessToken = getLocalStorage('access_token');

  if (accessToken) {
    const token = parseJwt(accessToken);
    const now = parseInt(Date.now() / 1000);

    if (now > token.exp) {
      setLocalStorage('access_token', null);
      setLocalStorage('user', null);
      window.location.href = '/';
      return;
    }

    setLocalStorage('user', token.data);

    if (token.data.role['ma_nhom_quyen'] === 0) {
      window.location.href = '/';
      return;
    }
    return;
  }

  window.location.href = '/';
}

$('.overlay').click(() => {
  $('.admin-category').removeClass('active');
  $('.overlay').removeClass('active');

  $('.sidebar').css({
    transform: 'translateX(-100%)',
  });
});

$('.admin-category').click(() => {
  if ($('.admin-category').hasClass('active')) {
    $('.admin-category').removeClass('active');
    $('.overlay').removeClass('active');

    $('.sidebar').css({
      transform: 'translateX(-100%)',
    });
    return;
  }

  $('.admin-category').addClass('active');
  $('.overlay').addClass('active');

  $('.sidebar').css({
    transform: 'translateX(0)',
  });

  // $('.admin-content_container').css('margin-left', '250px');
});

async function initDashboard() {
  initManager();
  const url = new URL(window.location);
  let pageContent;

  if (!url.searchParams.has('content')) {
    url.searchParams.set('content', 'overview');
    history.pushState({}, null, url);

    if (!isAccess('statistics', 'READ')) {
      $('.admin-content').html(
        "<h1 class='text-center fw-bold fs-5'>Không được phép truy cập</h1>"
      );
      return;
    }

    const { chart1, chart2 } = await renderOverviewPage();

    chart_1 = chart1;
    chart_2 = chart2;
    $(".sidebar-item[data-value='overview']").addClass('active');
    return;
  }

  pageContent = url.searchParams.get('content');
  $('.sidebar-item.active').removeClass('active');
  $(`.sidebar-item[data-value=${pageContent}]`).addClass('active');

  await handleSideBar(pageContent);
}

function isAccess(perName, actionName) {
  const accessToken = getLocalStorage('access_token');

  const data = parseJwt(accessToken);

  if (parseInt(Date.now() / 1000) > data.exp) {
    setLocalStorage('user', null);
    setLocalStorage('access_token', null);
    window.location.href = '/';
    return false;
  }

  const { data: user } = data;

  try {
    chart_1?.destroy();
    chart_2?.destroy();
  } catch (error) {
    console.log(error.message);
  }

  if (!user) return false;

  const permissionList = user.permission;

  if (!permissionList || permissionList?.length <= 0) return false;

  const permission = permissionList.findIndex(
    (per) =>
      per['ten_quyen_hang'] === perName &&
      per['ten_chuc_nang'] === actionName &&
      per['trang_thai_quyen_hang'] === true
  );

  if (permission !== -1) {
    return true;
  }

  $('.admin-content').html("<h1 class='text-center fw-bold fs-5'>Không được phép truy cập</h1>");

  return false;
}

$('.sidebar-item').click(async (e) => {
  initManager();
  let value;
  let target;
  const url = new URL(window.location);

  if (e.target.tagName === 'DIV') {
    target = e.target;
  } else {
    target = e.target.parentElement;
  }

  if (target.classList.contains('active')) return;

  $('.sidebar-item.active').removeClass('active');

  value = target.dataset.value;
  target.classList.add('active');

  url.searchParams.set('content', value);
  history.pushState({}, null, url);

  await handleSideBar(value);
});

async function handleSideBar(value) {
  $('.admin-category').removeClass('active');
  $('.overlay').removeClass('active');

  $('.sidebar').css({
    transform: 'translateX(-100%)',
  });

  switch (value) {
    case 'overview':
      if (!isAccess('statistics', 'READ')) {
        break;
      }

      const { chart1, chart2 } = await renderOverviewPage();

      chart_1 = chart1;
      chart_2 = chart2;
      break;

    case 'brand':
      if (!isAccess('brands', 'READ')) {
        break;
      }

      renderBrandPage();
      break;

    case 'sell-order':
      if (!isAccess('orders', 'READ')) {
        break;
      }

      renderOrderPage();
      break;

    case 'import-order':
      if (!isAccess('import-orders', 'READ')) {
        break;
      }

      renderImportOrderPage();
      break;

    case 'product':
      if (!isAccess('products', 'READ')) {
        break;
      }

      renderProductPage();
      break;

    case 'customer':
      if (!isAccess('customers', 'READ')) {
        break;
      }

      renderCustomerPage();
      break;

    case 'employee':
      if (!isAccess('employees', 'READ')) {
        break;
      }

      renderEmployeePage();
      break;

    case 'auth-group':
      if (!isAccess('auth-groups', 'READ')) {
        break;
      }

      renderAuthGroupPage();
      break;

    case 'decentralization':
      if (!isAccess('decentralization', 'READ')) {
        break;
      }

      renderDecentralizationPage();
      break;
    case 'account':
      if (!isAccess('accounts', 'READ')) {
        break;
      }

      renderAccountPage();
      break;

    case 'guarantee':
      if (!isAccess('guarantee', 'READ')) {
        break;
      }

      renderGuaranteePage();
      break;

    case 'import-product':
      if (!isAccess('import-orders', 'READ')) {
        break;
      }

      renderImportProductPage();
      break;

    case 'supplier':
      if (!isAccess('suppliers', 'READ')) {
        break;
      }

      renderSupplierPage();
      break;
  }
}

initDashboard();
