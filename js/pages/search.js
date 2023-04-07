import productApi from '../api/productApi';
import {
  filterList,
  priceGap,
  renderProductSearch,
  initCartList,
  initFilter,
  max,
  initHeader,
  convertCurrency,
} from '../utils/constains';
import { initPagination, initURL, renderPagination } from '../utils/pagination';

initHeader();

const rangeInputList = $('.price-range-input input');
const textInputList = $('.price-input input');
const progress = $('.price-progress');

async function initSearchPage() {
  try {
    initPagination();
    initURL();
    const queryParams = new URLSearchParams(window.location.search);

    const { data, pagination } = await productApi.getAllWithParams(queryParams);

    renderFilterList();
    initFilter();
    renderProductSearch(data);
    renderPagination(pagination);
  } catch (error) {
    console.log(error.message);
  }
}

initSearchPage();

export async function handleFilterChange(filterName, filterValue) {
  // update url when filter
  const url = new URL(window.location);
  url.searchParams.set(filterName, filterValue);
  history.pushState({}, '', url);

  // call API
  const { data, pagination } = await productApi.getAllWithParams(url.searchParams);

  renderProductSearch(data);
  renderPagination(pagination);
}

rangeInputList.on('mouseup', () => {
  let minVal = Number(rangeInputList[0].value);
  let maxVal = Number(rangeInputList[1].value);

  const url = new URL(window.location);
  url.searchParams.set('_page', 1);
  history.pushState({}, '', url);

  handleFilterChange('min_price', minVal);
  handleFilterChange('max_price', maxVal);
});

rangeInputList.on('input', (e) => {
  let minVal = Number(rangeInputList[0].value);
  let maxVal = Number(rangeInputList[1].value);

  if (maxVal - minVal < priceGap) {
    if (e.target.className === 'range-min') {
      rangeInputList[0].value = maxVal - priceGap;
    } else {
      rangeInputList[1].value = minVal + priceGap;
    }
  } else {
    textInputList[0].value = convertCurrency(minVal);
    textInputList[1].value = convertCurrency(maxVal);

    let percentLeft = (minVal / rangeInputList[0].max) * 100;
    let percentRight = 100 - (maxVal / rangeInputList[1].max) * 100;

    progress.css({
      left: percentLeft + '%',
    });

    progress.css({
      right: percentRight + '%',
    });
  }
});

textInputList.on('change', (e) => {
  let minVal = Number(rangeInputList[0].value);
  let maxVal = Number(rangeInputList[1].value);

  if (maxVal - minVal >= priceGap && maxVal <= max && maxVal >= 0 && minVal >= 0) {
    if (e.target.className === 'input-min') {
      rangeInputList[0].value = minVal;

      let percentLeft = (minVal / rangeInputList[0].max) * 100;

      progress.css({
        left: percentLeft + '%',
      });
    } else {
      rangeInputList[1].value = maxVal;

      let percentRight = 100 - (maxVal / rangeInputList[1].max) * 100;

      progress.css({
        right: percentRight + '%',
      });
    }
  } else {
    textInputList[0].value = convertCurrency(0);

    textInputList[1].value = convertCurrency(max);
  }
});

$('.search-filter label').click(async function () {
  const value = $(this).attr('data-value');
  const url = new URL(window.location);
  url.searchParams.set('_page', 1);

  if ($(`label[for='${value}']`).hasClass('active')) {
    $('.search-filter .search-filter_item').removeClass('active');
    url.searchParams.delete('sort');
    history.pushState({}, '', url);

    const { data, pagination } = await productApi.getAllWithParams(url.searchParams);
    renderProductSearch(data);
    renderPagination(pagination);
    return;
  }

  $('.search-filter .search-filter_item').removeClass('active');
  $(`label[for='${value}']`).addClass('active');
  history.pushState({}, '', url);

  handleFilterChange('sort', value);
});

async function handleCheckboxFilter() {
  const url = new URL(window.location);
  const queryParams = url.searchParams;
  let query;

  if ($(this).is(':checked')) {
    if (queryParams.has(this.dataset.filter)) {
      query = queryParams.get(this.dataset.filter);
      query += '%' + this.value;
      queryParams.set(this.dataset.filter, query);
    } else {
      queryParams.set(this.dataset.filter, this.value);
    }
  } else {
    query = queryParams.get(this.dataset.filter);
    let queryArr;
    if (query.includes('%')) {
      queryArr = query.split('%');
    } else {
      queryArr = [query];
    }

    queryArr = queryArr.filter((query) => query !== this.value);

    if (queryArr.length > 0) {
      queryArr = queryArr.join('%');
      queryParams.set(this.dataset.filter, queryArr);
    } else {
      queryParams.delete(this.dataset.filter);
    }
  }
  history.pushState({}, '', url);

  const { data, pagination } = await productApi.getAllWithParams(url.searchParams);
  renderProductSearch(data);
  renderPagination(pagination);
}

export async function renderFilterList() {
  try {
    const { data } = await productApi.getAll();

    const filterHTML = filterList
      .map((filter) => {
        let filterData = data.map((product) => {
          return product[filter.ma];
        });

        filterData = [...new Set(filterData)];

        const filterDataHTML = filterData
          .map((item) => {
            return `
            <label for='${item}' class='search-dropdown_checkbox-item'>
              <div class='checkbox-container'>
                <input type='checkbox' class='checkbox-input' id='${item}' value="${item}" data-filter="${filter.ma}">
                <div class='checkbox-inner'><i class='fa-solid fa-check'></i></div>
              </div>
              <span>${item}</span>
            </label>`;
          })
          .join('');

        return `
          <div class='search-dropdown' data-id="${filter.ma}">
            <div class='search-dropdown_header'>
              <h5>${filter.ten.charAt(0).toUpperCase() + filter.ten.slice(1)}</h5>
              <span><i class='fa-solid fa-chevron-down'></i></span>
            </div>
            <div class='search-dropdown_checkbox'>
              ${filterDataHTML}
            </div>
          </div>
        `;
      })
      .join('');

    $('.search-dropdown_container').html(filterHTML);

    $('.checkbox-input').click(handleCheckboxFilter);

    $('.search-dropdown_header').click(function () {
      const id = $(this).parent().attr('data-id');
      const $selector = `.search-dropdown[data-id='${id}']`;
      const display = $(`${$selector} .search-dropdown_checkbox`).css('display');

      if (display === 'none') {
        $(`${$selector} .search-dropdown_checkbox`).css('display', 'block');
        $(`${$selector} .search-dropdown_header span`).css('transform', 'rotate(180deg)');
        return;
      }

      $(`${$selector} .search-dropdown_header span`).css('transform', 'rotate(0)');
      $(`${$selector} .search-dropdown_checkbox`).css('display', 'none');
    });
  } catch (error) {
    console.log(error.message);
  }
}

initCartList();
