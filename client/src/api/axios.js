import axios from 'axios';

const API = axios.create({ baseURL: 'https://facebook-clone-api-52k8.onrender.com' });

API.interceptors.request.use((req) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (user?.token) {
    req.headers.Authorization = `Bearer ${user.token}`;
  }
  return req;
});

export default API;
