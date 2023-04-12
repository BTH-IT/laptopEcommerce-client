import axiosClient from './axiosClient';

const orderApi = {
  getAll(params) {
    const url = '/orders';
    return axiosClient.get(url, { params });
  },
  getAllWithQuery(query) {
    const url = '/orders';
    return axiosClient.get(url, { params: query });
  },
  getById(id) {
    const url = `/orders/${id}`;
    return axiosClient.get(url);
  },
  add(data) {
    const url = '/orders';
    return axiosClient.post(url, data);
  },
  update(data) {
    const url = `/orders/${data['ma_don_hang']}`;
    return axiosClient.patch(url, data);
  },
  remove(id) {
    const url = `/orders/${id}`;
    return axiosClient.patch(url, data);
  },
};

export default orderApi;
