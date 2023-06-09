import axiosClient from './axiosClient';

const orderApi = {
  getAll(params) {
    const url = '/orders';
    return axiosClient.get(url, { params });
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
    return axiosClient.delete(url);
  },
};

export default orderApi;
