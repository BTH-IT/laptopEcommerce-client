import brandApi from '../api/brandApi';
import orderApi from '../api/orderApi';
import { convertCurrency } from '../utils/constains';
import { renderChartBrand, renderChartReport } from '../vendor/chart';

let now = new Date();
let date = new Date();

async function initOverview() {
  now = new Date();
  date = new Date();
  date.setMonth(date.getMonth() - 1);

  $('input[name="report-daterange"]').val(
    `${moment(date).format('L')} - ${moment(now).format('L')}`
  );

  $('input[name="chart-daterange"]').val(`${now.getFullYear()}`);

  $('input[name="bestseller-daterange"]').val(
    `${moment(date).format('L')} - ${moment(now).format('L')}`
  );

  $('input[name="brand-daterange"]').val(
    `${moment(date).format('L')} - ${moment(now).format('L')}`
  );

  const from = Math.floor(date.getTime() / 1000);
  const to = Math.floor(now.getTime() / 1000);

  const chart = await handleOverview(from, to);
  return chart;
}

async function handleOverview(from, to) {
  try {
    const orderList = await orderApi.getAll();

    renderGeneralReport(orderList, from, to);
    const chart1 = await renderChartReport(orderList);
    renderBestsellerReport(orderList, from, to);
    const chart2 = await renderChartBrand(orderList, from, to);

    return {
      chart1: chart1,
      chart2: chart2,
    };
  } catch (error) {
    console.log(error.message);
  }
}

export function renderBestsellerReport(data, from, to) {
  const orderList = data.filter(
    (order) => order['thoi_gian_dat_mua'] >= from && order['thoi_gian_dat_mua'] <= to
  );

  const productList = [];

  orderList.forEach((order) => {
    if (order['trang_thai'].toLowerCase() !== 'hoàn thành') return;

    const data = order['danh_sach_san_pham_da_mua'];

    data.forEach((item) => {
      const isHas = productList.findIndex(
        (product) => product['ma_san_pham'] === item['ma_san_pham']
      );

      if (isHas !== -1) {
        productList[isHas]['so_luong_da_mua'] += item['so_luong_da_mua'];
      } else {
        productList.push(item);
      }
    });
  });

  productList.sort((a, b) => b['so_luong_da_mua'] - a['so_luong_da_mua']);

  if (productList.length > 0) {
    const bestsellerHTML = productList.map((product) => {
      return `
      <li class="bestseller-product_item">
        <div class="bestseller-product_container">
          <div class="bestseller-product_image">
            <img
              src="http://localhost:80/ecommerce-api/images/${product['hinh_anh']}"
              alt=""
            />
          </div>
          <p>${product['ten_san_pham']}</p>
        </div>
        <div class="bestseller-product_amount">Số lượng: ${product['so_luong_da_mua']}</div>
      </li>
    `;
    });

    $('.bestseller-product').html(bestsellerHTML);
  } else {
    $('.bestseller-product').html('Chưa bán được cái nào hết ế lắm ràu');
  }
}

export function handleChartReport(data, year) {
  const month = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const revenue = month.map((item) => {
    const dataFilter = data.filter((order) => {
      const orderDate = new Date(order['thoi_gian_dat_mua'] * 1000);
      return orderDate.getMonth() + 1 === item && year === orderDate.getFullYear();
    });

    const total = dataFilter.reduce((prev, curr) => {
      if (curr['trang_thai'].toLowerCase() === 'hoàn thành') {
        return prev + curr['tong_tien'];
      }

      return prev;
    }, 0);

    return total;
  });

  const sold = month.map((item) => {
    const dataFilter = data.filter((order) => {
      const orderDate = new Date(order['thoi_gian_dat_mua'] * 1000);
      return orderDate.getMonth() + 1 === item && year === orderDate.getFullYear();
    });

    const total = dataFilter.reduce((prev, curr) => {
      if (curr['trang_thai'].toLowerCase() === 'hoàn thành') {
        const amount = curr['danh_sach_san_pham_da_mua'].reduce(
          (p, c) => c['so_luong_da_mua'] + p,
          0
        );
        return prev + amount;
      }

      return prev;
    }, 0);

    return total;
  });

  return [
    {
      name: 'Tổng doanh thu',
      data: revenue,
    },
    {
      name: 'Tổng sản phẩm bán được',
      data: sold,
    },
  ];
}

export async function handleChartBrand(orderList, from, to) {
  try {
    const productList = [];

    const { data: brandList } = await brandApi.getAll();

    const newOrderList = orderList.filter(
      (order) => order['thoi_gian_dat_mua'] >= from && order['thoi_gian_dat_mua'] <= to
    );

    newOrderList.forEach((order) => {
      if (order['trang_thai'].toLowerCase() !== 'hoàn thành') return;

      const data = order['danh_sach_san_pham_da_mua'];

      data.forEach((item) => {
        const isHas = productList.findIndex(
          (product) => product['ma_san_pham'] === item['ma_san_pham']
        );

        if (isHas !== -1) {
          productList[isHas]['so_luong_da_mua'] += item['so_luong_da_mua'];
        } else {
          productList.push(item);
        }
      });
    });

    const chartBrandData = brandList.map((brand) => {
      const total = productList.reduce((prev, curr) => {
        if (curr['thuong_hieu'] === brand['ten_thuong_hieu']) {
          return prev + curr['so_luong_da_mua'];
        }

        return prev;
      }, 0);

      return total;
    });

    return {
      series: chartBrandData,
      brand: brandList.map((brand) => brand['ten_thuong_hieu']),
    };
  } catch (error) {
    console.log(error.message);
  }
}

export function renderGeneralReport(data, from, to) {
  const orderList = data.filter(
    (order) => order['thoi_gian_dat_mua'] >= from && order['thoi_gian_dat_mua'] <= to
  );

  const totalRevenue = orderList.reduce((prev, curr) => {
    if (curr['trang_thai'].toLowerCase() === 'hoàn thành') return curr['tong_tien'] + prev;

    return prev;
  }, 0);

  const totalSold = orderList.reduce((prev, curr) => {
    if (curr['trang_thai'].toLowerCase() === 'hoàn thành') {
      return prev + curr['danh_sach_san_pham_da_mua'].reduce((p, c) => c['so_luong_da_mua'] + p, 0);
    }

    return prev;
  }, 0);

  const totalOrder = orderList.reduce((prev, curr) => {
    if (curr['trang_thai'].toLowerCase() === 'hoàn thành') {
      return prev + curr['danh_sach_san_pham_da_mua'].reduce((c, p) => p['so_luong_da_mua'] + c, 0);
    }

    return prev;
  }, 0);

  $('.revenue').html(convertCurrency(totalRevenue || 0));
  $('.sold').html(totalSold || 0);
  $('.order').html(totalOrder || 0);
}

export function renderOverviewPage() {
  $('.admin-content').html(`
    <div class="overview">
      <div class="general-report">
        <div class="general-report_header">
          <h1>Báo cáo chung</h1>
          <input type="text" name="report-daterange" value="01/01/2018 - 01/15/2018" />
        </div>
        <div class="row gap-3 gap-lg-0">
          <div class="col-12 col-lg-5">
            <div class="general-report_cell">
              <div>
                <i class="fa-solid fa-sack-dollar"></i>
              </div>
              <span class="general-report_total revenue"></span>
              <span class="general-report_title">Tổng doanh thu</span>
            </div>
          </div>
          <div class="col-12 col-lg-4">
            <div class="general-report_cell">
              <div>
                <i class="fa-sharp fa-solid fa-cart-shopping"></i>
              </div>
              <span class="general-report_total sold"></span>
              <span class="general-report_title">Tổng sản phẩm bán được</span>
            </div>
          </div>
          <div class="col-12 col-lg-3">
            <div class="general-report_cell">
              <div>
                <i class="fa-solid fa-file-invoice-dollar"></i>
              </div>
              <span class="general-report_total order"></span>
              <span class="general-report_title">Tổng đơn hàng</span>
            </div>
          </div>
        </div>
      </div>

      <div class="statistics">
        <div class="statistics-header">
          <h1>Biểu đồ doanh thu</h1>
          <input type="number" name="chart-daterange" value="2018" class="text-center" />
        </div>
        <div id="chart-area-1"></div>

        <div class="row gap-3 gap-lg-0">
          <div class="col-12 col-lg-6">
            <div class="statistics-header">
              <h1>Top 10 các sản phẩm bán chạy nhất</h1>
              <input
                type="text"
                name="bestseller-daterange"
                value="01/01/2018 - 01/15/2018"
              />
            </div>
            <ul class="bestseller-product"></ul>
          </div>
          <div class="col-12 col-lg-6">
            <div class="statistics-header">
              <h1>Biểu đồ doanh thu các loại sản phẩm</h1>
              <input type="text" name="brand-daterange" value="01/01/2018 - 01/15/2018" />
            </div>
            <div id="chart-area-2"></div>
          </div>
        </div>
      </div>
    </div>
  `);

  $('input[name="report-daterange"]').daterangepicker(
    {
      startDate: moment(date).format('L'),
      endDate: moment(now).format('L'),
      opens: 'left',
    },
    async function (start, end, label) {
      const startDate = new Date(start.format('YYYY-MM-DD'));
      const endDate = new Date(end.format('YYYY-MM-DD'));

      const from = startDate.getTime() / 1000;
      const to = endDate.getTime() / 1000;

      try {
        const orderList = await orderApi.getAll();

        renderGeneralReport(orderList, from, to);
      } catch (error) {
        console.log(error.message);
      }
    }
  );

  $('input[name="bestseller-daterange"]').daterangepicker(
    {
      startDate: moment(date).format('L'),
      endDate: moment(now).format('L'),
      opens: 'left',
    },
    async function (start, end, label) {
      const startDate = new Date(start.format('YYYY-MM-DD'));
      const endDate = new Date(end.format('YYYY-MM-DD'));

      const from = startDate.getTime() / 1000;
      const to = endDate.getTime() / 1000;

      try {
        const orderList = await orderApi.getAll();

        renderBestsellerReport(orderList, from, to);
      } catch (error) {
        console.log(error.message);
      }
    }
  );

  return initOverview();
}
