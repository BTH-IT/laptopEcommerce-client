import axios from 'axios';

const axiosClient = axios.create({
<<<<<<< HEAD
  baseURL: 'http://localhost:80/ecommerce-api/index.php',
=======
  baseURL: 'http://localhost:80/laptopEcommerce-server/index.php',
>>>>>>> 6b51e4206ef344d8df8500db977c6a534bef1df2
  headers: {
    'Content-Type': 'application/json;',
  },
});

// Add a request interceptor
axiosClient.interceptors.request.use(
  function (config) {
    // Do something before request is sent

    const accessToken = localStorage.getItem('access_token');
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken.replace(/^"(.*)"$/, '$1')}`;
    }

    return config;
  },
  function (error) {
    // Do something with request error
    return Promise.reject(error);
  }
);

// Add a response interceptor
axiosClient.interceptors.response.use(
  function (response) {
    // Any status code that lie within the range of 2xx cause this function to trigger
    // Do something with response data
    return response.data;
  },
  function (error) {
    // Any status codes that falls outside the range of 2xx cause this function to trigger
    // Do something with response error
    return Promise.reject(error);
  }
);

export default axiosClient;
