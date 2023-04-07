import axiosClient from './axiosClient';

const orderApi = {
<<<<<<< HEAD
  getAll(params) {
=======
  getAll(params = '') {
>>>>>>> 6b51e4206ef344d8df8500db977c6a534bef1df2
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
<<<<<<< HEAD
    const url = `/orders/${data['ma_don_hang']}`;
    return axiosClient.patch(url, data);
  },
  remove(id) {
    const url = `/orders/${id}`;
=======
    const url = `/orders/${data['ma_san_pham']}`;
    return axiosClient.patch(url, data);
  },
  remove(id) {
    const url = `/products/${id}`;
>>>>>>> 6b51e4206ef344d8df8500db977c6a534bef1df2
    return axiosClient.delete(url);
  },
};

export default orderApi;
